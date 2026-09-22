import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { normalizeHeader } from "../contract";

// Independent, hand-written OOXML reader for the production import path.
// Deliberately does NOT use the SheetJS ("xlsx") package that the
// reference-manifest builder (scripts/build-reference-manifest.ts) uses,
// so importer and evaluator ground truth never share an extraction
// implementation (CS-0005 two-layer fidelity rule).

const ARRAY_TAGS = new Set([
  "row",
  "c",
  "si",
  "t",
  "sheet",
  "Relationship",
  "mergeCell",
  "hyperlink",
  "dataValidation",
  "col",
]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ARRAY_TAGS.has(name),
  // fast-xml-parser trims text-node whitespace by default, which silently
  // strips trailing newlines that Spectora genuinely stores inside cell
  // text (e.g. source row 384's Comment Text ends "...repair. </p>\n").
  // Preserving exact source bytes takes priority over that default.
  trimValues: false,
  // Without htmlEntities, fast-xml-parser leaves numeric character
  // references such as "&#13;" as literal text instead of resolving them
  // to the actual control character. Source row 373's Comment Text uses
  // "&#13;" specifically to force a literal CR through XML's line-ending
  // normalization (a legitimate, spec-required use of a char reference);
  // decoding it is required for byte-exact preservation, not optional.
  htmlEntities: true,
});

export interface RawRow {
  rowNumber: number;
  values: Record<string, string>; // column letter -> raw cell text
}

export interface RawSheet {
  headerRow: RawRow;
  dataRows: RawRow[];
}

export class NotAWorkbookError extends Error {}
export class WorkbookStructureError extends Error {}

function colLetters(cellRef: string): string {
  const match = /^[A-Z]+/.exec(cellRef);
  if (!match) throw new WorkbookStructureError(`Malformed cell ref: ${cellRef}`);
  return match[0];
}

function textOfSharedString(si: unknown): string {
  // <si> can be a plain <t>text</t> or contain <r> runs each with their own <t>.
  if (si == null || typeof si !== "object") return "";
  const node = si as Record<string, unknown>;
  const direct = node.t;
  if (direct != null) {
    const arr = Array.isArray(direct) ? direct : [direct];
    return arr.map((t) => textValue(t)).join("");
  }
  const runs = node.r;
  if (runs != null) {
    const arr = Array.isArray(runs) ? runs : [runs];
    return arr
      .map((r) => {
        const run = r as Record<string, unknown>;
        return textValue(run.t);
      })
      .join("");
  }
  return "";
}

function textValue(t: unknown): string {
  if (t == null) return "";
  if (typeof t === "string") return t;
  if (typeof t === "number") return String(t);
  if (typeof t === "object") {
    const node = t as Record<string, unknown>;
    if (typeof node["#text"] === "string") return node["#text"];
    if (typeof node["#text"] === "number") return String(node["#text"]);
  }
  return "";
}

function cellValue(
  cell: Record<string, unknown>,
  shared: string[]
): string {
  const type = cell["@_t"] as string | undefined;
  if (type === "s") {
    const v = cell.v;
    const idx = typeof v === "object" ? textValue(v) : v;
    const n = typeof idx === "string" ? parseInt(idx, 10) : (idx as number);
    return Number.isFinite(n) ? shared[n] ?? "" : "";
  }
  if (type === "inlineStr") {
    return textOfSharedString(cell.is);
  }
  const v = cell.v;
  return textValue(v);
}

/**
 * Reads the workbook's first visible worksheet and returns its header row
 * plus data rows, keyed by column letter. Throws NotAWorkbookError /
 * WorkbookStructureError for gate-failing inputs rather than guessing.
 */
export async function readWorkbook(bytes: ArrayBuffer | Buffer): Promise<RawSheet> {
  const magic = Buffer.from(bytes as ArrayBuffer).subarray(0, 4);
  if (!(magic[0] === 0x50 && magic[1] === 0x4b && magic[2] === 0x03 && magic[3] === 0x04)) {
    throw new NotAWorkbookError("File is not a ZIP-based package (missing PK magic bytes).");
  }

  const zip = await JSZip.loadAsync(bytes);
  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) {
    throw new NotAWorkbookError("Not an OOXML package: missing [Content_Types].xml.");
  }
  const contentTypes = await contentTypesFile.async("string");
  if (!contentTypes.includes("spreadsheetml.sheet")) {
    throw new NotAWorkbookError("Package is not identified as a spreadsheet workbook.");
  }

  const sharedStringsFile = zip.file("xl/sharedStrings.xml");
  let shared: string[] = [];
  if (sharedStringsFile) {
    const xml = await sharedStringsFile.async("string");
    const parsed = parser.parse(xml);
    const siList = parsed?.sst?.si ?? [];
    shared = siList.map(textOfSharedString);
  }

  const workbookFile = zip.file("xl/workbook.xml");
  const relsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (!workbookFile || !relsFile) {
    throw new WorkbookStructureError("Missing xl/workbook.xml or its relationships part.");
  }
  const workbookXml = parser.parse(await workbookFile.async("string"));
  const relsXml = parser.parse(await relsFile.async("string"));

  const relMap = new Map<string, string>();
  for (const rel of relsXml?.Relationships?.Relationship ?? []) {
    relMap.set(rel["@_Id"], rel["@_Target"]);
  }

  const sheets = workbookXml?.workbook?.sheets?.sheet ?? [];
  const visibleSheet = sheets.find(
    (s: Record<string, unknown>) => (s["@_state"] ?? "visible") === "visible"
  );
  if (!visibleSheet) {
    throw new WorkbookStructureError("No visible worksheet found.");
  }
  const rId = visibleSheet["@_r:id"] as string;
  const target = relMap.get(rId);
  if (!target) {
    throw new WorkbookStructureError("Could not resolve worksheet target from relationships.");
  }
  const sheetPath = "xl/" + target.replace(/^\/?/, "");
  const sheetFile = zip.file(sheetPath);
  if (!sheetFile) {
    throw new WorkbookStructureError(`Worksheet part not found at ${sheetPath}.`);
  }
  const sheetXml = parser.parse(await sheetFile.async("string"));
  const rows = sheetXml?.worksheet?.sheetData?.row ?? [];
  if (rows.length === 0) {
    throw new WorkbookStructureError("Worksheet has no rows.");
  }

  const toRawRow = (row: Record<string, unknown>): RawRow => {
    const rowNumber = parseInt(row["@_r"] as string, 10);
    const cells = (row.c ?? []) as Record<string, unknown>[];
    const values: Record<string, string> = {};
    for (const cell of cells) {
      const ref = cell["@_r"] as string;
      values[colLetters(ref)] = cellValue(cell, shared);
    }
    return { rowNumber, values };
  };

  const [headerRowXml, ...dataRowsXml] = rows;
  return {
    headerRow: toRawRow(headerRowXml as Record<string, unknown>),
    dataRows: dataRowsXml.map((r: Record<string, unknown>) => toRawRow(r)),
  };
}

/** Maps column letters to normalized header text for header-driven lookups. */
export function headerColumnMap(headerRow: RawRow): Map<string, string> {
  const map = new Map<string, string>();
  for (const [col, raw] of Object.entries(headerRow.values)) {
    map.set(col, normalizeHeader(raw));
  }
  return map;
}

/** Re-keys a raw row from column letters to normalized header names. */
export function rowByHeader(
  row: RawRow,
  columnToHeader: Map<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [col, value] of Object.entries(row.values)) {
    const header = columnToHeader.get(col);
    if (header) out[header] = value;
  }
  return out;
}

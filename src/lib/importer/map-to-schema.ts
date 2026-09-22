import { randomUUID } from "crypto";
import {
  ANSWER_TYPES,
  CATEGORIES,
  COMMENT_TYPES,
  KNOWN_HEADERS,
  REQUIRED_HEADERS,
} from "../contract";
import type {
  AnswerType,
  Category,
  CommentType,
  DefaultPhoto,
  ImportResult,
  ImportWarning,
  SourceComment,
  SourceItem,
  SourceSection,
} from "../types";
import {
  headerColumnMap,
  readWorkbook,
  rowByHeader,
  type RawRow,
} from "./read-workbook";

const PHOTO_SLOTS = 10;

function parseIntOrNull(value: string): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses a numeric field while always retaining the raw source string, and
 * emitting a warning if a genuinely non-empty value fails to parse. Without
 * this, an unparseable-but-populated value (e.g. "$500") would silently
 * become null with no visible trace, violating the "skipped/unsupported
 * content must be visible" rule for any future export where this column is
 * populated with a non-numeric value (CS-0085).
 */
function parseNumericWithWarning(
  raw: string,
  columnLabel: string,
  warnings: ImportWarning[],
  rowNumber: number
): number | null {
  if (raw === "") return null;
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  warnings.push({
    level: "warning",
    code: "UNPARSEABLE_NUMERIC_VALUE",
    message: `${columnLabel} value "${raw}" is not numeric; preserved raw, not coerced.`,
    sourceRowNumber: rowNumber,
    column: columnLabel,
  });
  return null;
}

function parseCommentType(raw: string, warnings: ImportWarning[], rowNumber: number): CommentType | null {
  if (raw === "") return null;
  if ((COMMENT_TYPES as readonly string[]).includes(raw)) return raw as CommentType;
  warnings.push({
    level: "warning",
    code: "UNKNOWN_COMMENT_TYPE",
    message: `Unrecognized Comment Type "${raw}"; preserved raw, not classified.`,
    sourceRowNumber: rowNumber,
    column: "Comment Type",
  });
  return null;
}

function parseAnswerType(raw: string, warnings: ImportWarning[], rowNumber: number): AnswerType | null {
  if (raw === "") return null;
  if ((ANSWER_TYPES as readonly string[]).includes(raw)) return raw as AnswerType;
  warnings.push({
    level: "warning",
    code: "UNKNOWN_ANSWER_TYPE",
    message: `Unrecognized Answer Type "${raw}"; preserved raw, not classified.`,
    sourceRowNumber: rowNumber,
    column: "Answer Type",
  });
  return null;
}

function parseCategory(raw: string, warnings: ImportWarning[], rowNumber: number): Category | null {
  if (raw === "") return null;
  const n = Number(raw);
  if ((CATEGORIES as readonly number[]).includes(n)) return n as Category;
  warnings.push({
    level: "warning",
    code: "UNKNOWN_CATEGORY",
    message: `Unrecognized Category "${raw}"; preserved raw, not classified.`,
    sourceRowNumber: rowNumber,
    column: "Category",
  });
  return null;
}

/** PROPOSED rule (SOURCE_CONTRACT.md): split on comma, trim. Warn on suspicious splits. */
function parseCommaList(
  raw: string,
  columnLabel: string,
  warnings: ImportWarning[],
  rowNumber: number
): string[] | null {
  if (raw === "") return null;
  const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  const looksHtml = parts.some((p) => /<[a-zA-Z][^>]*>/.test(p));
  if (looksHtml || (parts.length === 1 && raw.includes(","))) {
    warnings.push({
      level: "warning",
      code: "UNCERTAIN_OPTION_SPLIT",
      message: `${columnLabel} split on "," produced a suspicious result; verify manually.`,
      sourceRowNumber: rowNumber,
      column: columnLabel,
    });
  }
  return parts;
}

function parseDefaultPhotos(row: Record<string, string>): DefaultPhoto[] {
  const photos: DefaultPhoto[] = [];
  for (let i = 1; i <= PHOTO_SLOTS; i++) {
    const url = row[`Default Photo ${i}`];
    const caption = row[`Default Photo ${i} Caption`];
    // Keep the slot whenever EITHER value is populated. A URL-only gate
    // would silently drop a caption-only value in a future export
    // (CS-0085) — not observed in Export A (both are unpopulated there),
    // but the contract's non-exclusion rule applies regardless.
    if (url || caption) {
      photos.push({ index: i, url: url || null, caption: caption || null });
    }
  }
  return photos;
}

function buildUnmapped(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [header, value] of Object.entries(row)) {
    if (!(KNOWN_HEADERS as readonly string[]).includes(header) && value !== "") {
      out[header] = value;
    }
  }
  return out;
}

export interface MapOptions {
  sourceFileName: string;
  sourceFileSha256: string;
}

export async function importWorkbook(
  bytes: ArrayBuffer | Buffer,
  options: MapOptions
): Promise<ImportResult> {
  const { headerRow, dataRows } = await readWorkbook(bytes);
  const columnToHeader = headerColumnMap(headerRow);
  const observedHeaders = Array.from(new Set(columnToHeader.values())).filter(Boolean);

  const missingHeaders = REQUIRED_HEADERS.filter((h) => !observedHeaders.includes(h));
  if (missingHeaders.length > 0) {
    return {
      outcome: "FAILED",
      sections: [],
      warnings: [
        {
          level: "error",
          code: "MISSING_REQUIRED_HEADER",
          message: `Missing required header(s): ${missingHeaders.join(", ")}. Import stopped before any row was processed.`,
        },
      ],
      sourceRowCount: dataRows.length,
      importedRowCount: 0,
      sourceFileName: options.sourceFileName,
      sourceFileSha256: options.sourceFileSha256,
      requiredHeaders: [...REQUIRED_HEADERS],
      observedHeaders,
    };
  }

  if (dataRows.length === 0) {
    return {
      outcome: "FAILED",
      sections: [],
      warnings: [
        {
          level: "error",
          code: "NO_DATA_ROWS",
          message: "Worksheet has a header row but no data rows.",
        },
      ],
      sourceRowCount: 0,
      importedRowCount: 0,
      sourceFileName: options.sourceFileName,
      sourceFileSha256: options.sourceFileSha256,
      requiredHeaders: [...REQUIRED_HEADERS],
      observedHeaders,
    };
  }

  const warnings: ImportWarning[] = [];
  const sections: SourceSection[] = [];
  const sectionIndex = new Map<string, SourceSection>();
  const itemIndex = new Map<string, SourceItem>(); // key: sectionName\u0000itemName

  let importedRowCount = 0;

  dataRows.forEach((rawRow: RawRow, ordinal: number) => {
    const row = rowByHeader(rawRow, columnToHeader);
    const sectionName = row["Section Name"] ?? "";
    const itemName = row["Item Name"] ?? "";
    const commentName = row["Comment Name"] ?? "";

    if (!sectionName || !itemName || !commentName) {
      warnings.push({
        level: "warning",
        code: "MISSING_HIERARCHY_VALUE",
        message: "Row is missing Section Name, Item Name, or Comment Name; row skipped from hierarchy but not silently discarded.",
        sourceRowNumber: rawRow.rowNumber,
      });
      return;
    }

    let section = sectionIndex.get(sectionName);
    if (!section) {
      section = {
        id: randomUUID(),
        name: sectionName,
        ordinal: sections.length,
        items: [],
      };
      sectionIndex.set(sectionName, section);
      sections.push(section);
    }

    const itemKey = `${sectionName}\u0000${itemName}`;
    let item = itemIndex.get(itemKey);
    if (!item) {
      item = {
        id: randomUUID(),
        sectionId: section.id,
        name: itemName,
        ordinal: section.items.length,
        comments: [],
      };
      itemIndex.set(itemKey, item);
      section.items.push(item);
    }

    const comment: SourceComment = {
      id: randomUUID(),
      itemId: item.id,
      name: commentName,
      rawText: row["Comment Text"] || null,
      commentType: parseCommentType(row["Comment Type"] ?? "", warnings, rawRow.rowNumber),
      commentTypeRaw: row["Comment Type"] || null,
      category: parseCategory(row["Category"] ?? "", warnings, rawRow.rowNumber),
      categoryRaw: row["Category"] || null,
      options: parseCommaList(row["Multiple Choice Options"] ?? "", "Multiple Choice Options", warnings, rawRow.rowNumber),
      optionsRaw: row["Multiple Choice Options"] || null,
      unitOptions: parseCommaList(row["Unit Type Options"] ?? "", "Unit Type Options", warnings, rawRow.rowNumber),
      unitOptionsRaw: row["Unit Type Options"] || null,
      recommendation: row["Recommendation"] || null,
      sourceOrderHint: parseIntOrNull(row["Order"] ?? ""),
      answerType: parseAnswerType(row["Answer Type"] ?? "", warnings, rawRow.rowNumber),
      answerTypeRaw: row["Answer Type"] || null,
      defaultValue: row["Default Value"] || null,
      defaultValue2: row["Default Value 2"] || null,
      defaultUnitType: row["Default Unit Type"] || null,
      defaultLocation: row["Default Location"] || null,
      defaultEstimateMin: parseNumericWithWarning(row["Default Estimate Min"] ?? "", "Default Estimate Min", warnings, rawRow.rowNumber),
      defaultEstimateMinRaw: row["Default Estimate Min"] || null,
      defaultEstimateMax: parseNumericWithWarning(row["Default Estimate Max"] ?? "", "Default Estimate Max", warnings, rawRow.rowNumber),
      defaultEstimateMaxRaw: row["Default Estimate Max"] || null,
      locked: row["Locked"] || null,
      simpleFormat: row["Simple Format"] || null,
      disablePhotos: row["Disable Photos"] || null,
      usesCount: parseNumericWithWarning(row["Uses"] ?? "", "Uses", warnings, rawRow.rowNumber),
      usesCountRaw: row["Uses"] || null,
      defaultPhotos: parseDefaultPhotos(row),
      sourceLastModified: row["Last Modified"] || null,
      unmappedSourceFields: buildUnmapped(row),
      sourceRowNumber: rawRow.rowNumber,
      sourceRowOrdinal: ordinal,
    };

    if (Object.keys(comment.unmappedSourceFields).length > 0) {
      warnings.push({
        level: "info",
        code: "UNMAPPED_COLUMN_VALUE",
        message: `Row has a value in a column outside the source contract: ${Object.keys(comment.unmappedSourceFields).join(", ")}.`,
        sourceRowNumber: rawRow.rowNumber,
      });
    }

    item.comments.push(comment);
    importedRowCount += 1;
  });

  const hasBlockingWarnings = warnings.some((w) => w.level === "error");
  const hasAnyIssue = warnings.length > 0;
  const outcome: ImportResult["outcome"] = hasBlockingWarnings
    ? "FAILED"
    : hasAnyIssue
      ? "COMPLETED_WITH_ISSUES"
      : "SUCCESS";

  return {
    outcome,
    sections,
    warnings,
    sourceRowCount: dataRows.length,
    importedRowCount,
    sourceFileName: options.sourceFileName,
    sourceFileSha256: options.sourceFileSha256,
    requiredHeaders: [...REQUIRED_HEADERS],
    observedHeaders,
  };
}

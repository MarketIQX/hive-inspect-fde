#!/usr/bin/env -S npx tsx
/**
 * Builds the independent reference manifest (evaluator ground truth) from a
 * Spectora export, using SheetJS ("xlsx") — deliberately a different
 * library/code path than the production importer's hand-rolled OOXML
 * reader in src/lib/importer/read-workbook.ts. Per CS-0005, the evaluator's
 * expectations must not be established by the same extraction
 * implementation the thing being graded uses.
 *
 * This script does not apply SOURCE_CONTRACT.md's enum/coercion/warning
 * rules; it records the raw source text per cell, grouped into the
 * source's own physical hierarchy (section -> item -> comment, in row
 * order), so it stays a ground-truth transcript rather than a second
 * implementation of the importer's interpretation logic.
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { basename } from "path";
import * as XLSX from "xlsx";

const REQUIRED_HEADERS = [
  "Section Name",
  "Item Name",
  "Comment Name",
  "Comment Type",
  "Order",
  "Answer Type",
  "Uses",
  "Last Modified",
];

function normalizeHeader(raw: string): string {
  const idx = raw.indexOf("(");
  return (idx === -1 ? raw : raw.slice(0, idx)).trim();
}

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error("Usage: build-reference-manifest.ts <source.xls> <output.manifest.json>");
    process.exit(1);
  }

  const raw = readFileSync(inputPath);
  const sourceFileSha256 = sha256(raw);

  const workbook = XLSX.read(raw, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map(normalizeHeader);

  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    console.error(`Reference manifest build aborted: missing required headers: ${missing.join(", ")}`);
    process.exit(1);
  }

  type Row = Record<string, string>;
  const asRecords: { rowNumber: number; row: Row }[] = dataRows.map((cells, i) => {
    const rec: Row = {};
    headers.forEach((h, colIdx) => {
      if (h) rec[h] = (cells[colIdx] ?? "").toString();
    });
    return { rowNumber: i + 2, row: rec }; // +2: 1-indexed, plus header row
  });

  interface RefComment {
    sourceRowNumber: number;
    name: string;
    rawText: string;
    commentType: string;
    category: string;
    options: string;
    answerType: string;
    defaultValue: string;
    defaultEstimateMin: string;
    defaultEstimateMax: string;
  }
  interface RefItem {
    name: string;
    comments: RefComment[];
  }
  interface RefSection {
    name: string;
    items: RefItem[];
  }

  const sections: RefSection[] = [];
  const sectionByName = new Map<string, RefSection>();
  const itemByKey = new Map<string, RefItem>();

  for (const { rowNumber, row } of asRecords) {
    const sectionName = row["Section Name"];
    const itemName = row["Item Name"];
    if (!sectionName || !itemName || !row["Comment Name"]) continue;

    let section = sectionByName.get(sectionName);
    if (!section) {
      section = { name: sectionName, items: [] };
      sectionByName.set(sectionName, section);
      sections.push(section);
    }
    const key = `${sectionName}\u0000${itemName}`;
    let item = itemByKey.get(key);
    if (!item) {
      item = { name: itemName, comments: [] };
      itemByKey.set(key, item);
      section.items.push(item);
    }
    item.comments.push({
      sourceRowNumber: rowNumber,
      name: row["Comment Name"],
      rawText: row["Comment Text"] ?? "",
      commentType: row["Comment Type"] ?? "",
      category: row["Category"] ?? "",
      options: row["Multiple Choice Options"] ?? "",
      answerType: row["Answer Type"] ?? "",
      defaultValue: row["Default Value"] ?? "",
      defaultEstimateMin: row["Default Estimate Min"] ?? "",
      defaultEstimateMax: row["Default Estimate Max"] ?? "",
    });
  }

  const manifest = {
    generator: "scripts/build-reference-manifest.ts (SheetJS xlsx, independent of production importer)",
    generatedAt: new Date().toISOString(),
    sourceFileName: basename(inputPath),
    sourceFileSha256,
    headerRow: headers,
    sourceDataRowCount: dataRows.length,
    sectionCount: sections.length,
    itemCount: sections.reduce((n, s) => n + s.items.length, 0),
    commentCount: sections.reduce(
      (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
      0
    ),
    sections,
  };

  const json = JSON.stringify(manifest, null, 2);
  writeFileSync(outputPath, json);
  const manifestSha256 = sha256(Buffer.from(json));
  console.log(`Wrote ${outputPath}`);
  console.log(`source sha256:   ${sourceFileSha256}`);
  console.log(`manifest sha256: ${manifestSha256}`);
  console.log(
    `sections=${manifest.sectionCount} items=${manifest.itemCount} comments=${manifest.commentCount}`
  );
}

main();

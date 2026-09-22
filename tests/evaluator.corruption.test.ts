import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { evaluateImport, type ReferenceManifest } from "../src/lib/evaluator/evaluate";
import type { SourceSection } from "../src/lib/types";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";
const REFERENCE_PATH = "fixtures/reference/residential-template-2026-09-21.manifest.json";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

async function knownGoodSections(): Promise<SourceSection[]> {
  const bytes = readFileSync(SOURCE_PATH);
  const result = await importWorkbook(bytes, {
    sourceFileName: "Residential Template-2026-09-21.xls",
    sourceFileSha256: sha256(bytes),
  });
  return result.sections;
}

function loadReference(): ReferenceManifest {
  return JSON.parse(readFileSync(REFERENCE_PATH, "utf-8"));
}

function clone(sections: SourceSection[]): SourceSection[] {
  return globalThis.structuredClone(sections);
}

describe("evaluator detects deliberate corruptions (assignment requirement + G3)", () => {
  it("passes on the untouched known-good import (control case)", async () => {
    const sections = await knownGoodSections();
    const report = evaluateImport(sections, loadReference());
    expect(report.pass).toBe(true);
  });

  it("fails when a comment row is dropped", async () => {
    const sections = clone(await knownGoodSections());
    // Drop "Cracking - Major" from Exterior > Siding, Flashing & Trim.
    const item = sections
      .find((s) => s.name === "Exterior")!
      .items.find((i) => i.name.startsWith("Siding"))!;
    item.comments = item.comments.filter((c) => c.name !== "Cracking - Major");

    const report = evaluateImport(sections, loadReference());
    expect(report.pass).toBe(false);
    expect(report.issues.some((i) => i.code === "DROPPED_ROW")).toBe(true);
  });

  it("fails when a comment row is duplicated", async () => {
    const sections = clone(await knownGoodSections());
    const item = sections
      .find((s) => s.name === "Exterior")!
      .items.find((i) => i.name.startsWith("Siding"))!;
    const target = item.comments.find((c) => c.name === "Cracking - Major")!;
    item.comments.push({ ...target, id: "duplicate-id" });

    const report = evaluateImport(sections, loadReference());
    expect(report.pass).toBe(false);
    expect(report.issues.some((i) => i.code === "DUPLICATED_ROW")).toBe(true);
  });

  it("fails when two sibling comments are reordered", async () => {
    const sections = clone(await knownGoodSections());
    const item = sections
      .find((s) => s.name === "Exterior")!
      .items.find((i) => i.name.startsWith("Siding"))!;
    // Swap the first two comments (Siding Material, Cracking - Major).
    [item.comments[0], item.comments[1]] = [item.comments[1], item.comments[0]];

    const report = evaluateImport(sections, loadReference());
    expect(report.pass).toBe(false);
    expect(report.issues.some((i) => i.code === "SIBLING_REORDERED")).toBe(true);
  });

  it("fails when a comment is attached to the wrong parent item", async () => {
    const sections = clone(await knownGoodSections());
    const exterior = sections.find((s) => s.name === "Exterior")!;
    const siding = exterior.items.find((i) => i.name.startsWith("Siding"))!;
    const doors = exterior.items.find((i) => i.name === "Exterior Doors")!;
    const moved = siding.comments.pop()!;
    doors.comments.push(moved); // still present, but under the wrong item

    const report = evaluateImport(sections, loadReference());
    expect(report.pass).toBe(false);
    expect(report.issues.some((i) => i.code === "WRONG_PARENT")).toBe(true);
  });

  it("fails when comment text is changed post-import", async () => {
    const sections = clone(await knownGoodSections());
    const item = sections
      .find((s) => s.name === "Exterior")!
      .items.find((i) => i.name.startsWith("Siding"))!;
    const target = item.comments.find((c) => c.name === "Cracking - Major")!;
    target.rawText = target.rawText + " EDITED";

    const report = evaluateImport(sections, loadReference());
    expect(report.pass).toBe(false);
    expect(report.issues.some((i) => i.code === "CHANGED_TEXT")).toBe(true);
  });

  it("importer itself fails visibly, with no partial template, when a required header is missing", async () => {
    // Build a minimal workbook-shaped buffer is overkill here; instead
    // exercise map-to-schema's own gate by feeding it a workbook whose
    // header row is missing "Answer Type" via a hand-built XLSX buffer.
    const XLSXBuilder = await import("./helpers/build-minimal-workbook");
    const bytes = await XLSXBuilder.buildMinimalWorkbook({
      headers: ["Section Name", "Item Name", "Comment Name", "Comment Type", "Order", "Uses", "Last Modified"],
      rows: [["Roof", "Roof Covering", "Damaged Shingles", "defect", "0", "0", "1/1/2026"]],
    });
    const result = await importWorkbook(bytes, {
      sourceFileName: "malformed.xlsx",
      sourceFileSha256: "n/a",
    });
    expect(result.outcome).toBe("FAILED");
    expect(result.sections.length).toBe(0);
    expect(result.warnings.some((w) => w.code === "MISSING_REQUIRED_HEADER")).toBe(true);
  });
});

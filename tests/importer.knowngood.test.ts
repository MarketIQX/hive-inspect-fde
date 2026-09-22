import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { evaluateImport, type ReferenceManifest } from "../src/lib/evaluator/evaluate";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";
const REFERENCE_PATH = "fixtures/reference/residential-template-2026-09-21.manifest.json";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

describe("importer against the real Export A fixture", () => {
  const bytes = readFileSync(SOURCE_PATH);
  const reference: ReferenceManifest = JSON.parse(readFileSync(REFERENCE_PATH, "utf-8"));

  it("fixture checksum matches the canonical record (CS-0018/CS-0020)", () => {
    expect(sha256(bytes)).toBe(
      "93AE536E100DA2DB0F41E81467CF4889220DE8D0673DDFCC56954FB77FF39C83"
    );
  });

  it("produces the expected coarse structure counts (CS-0021/CS-0024/CS-0064)", async () => {
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    expect(result.sourceRowCount).toBe(392);
    expect(result.importedRowCount).toBe(392);
    expect(result.sections.length).toBe(13);
    const itemCount = result.sections.reduce((n, s) => n + s.items.length, 0);
    expect(itemCount).toBe(69);
  });

  it("passes the independent evaluator with zero issues on the known-good import", async () => {
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const report = evaluateImport(result.sections, reference);
    expect(report.issues).toEqual([]);
    expect(report.pass).toBe(true);
    expect(report.coverage.importedRowCount).toBe(report.coverage.referenceRowCount);
  });

  it("preserves the Cracking - Major narrative exactly (CS-0074)", async () => {
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const exterior = result.sections.find((s) => s.name === "Exterior")!;
    // Source stores this as the literal, single-escaped "&amp;" (verified
    // against three independent parsers); see SOURCE_CONTRACT.md note on
    // double-escaped ampersands. Not normalized to a clean "&" in storage.
    const siding = exterior.items.find((i) => i.name === "Siding, Flashing &amp; Trim")!;
    const cracking = siding.comments.find((c) => c.name === "Cracking - Major")!;
    expect(cracking.rawText).toBe(
      "Moderate to major cracking was observed at one or more points on the exterior. This can be the result of poor original compaction of soil at the time of construction or excess moisture in the underlying soil. Recommend consulting with a structural engineer and/or soil expert."
    );
    expect(cracking.commentType).toBe("defect");
    expect(cracking.category).toBe(0);
    expect(cracking.answerType).toBe("boolean");
  });

  it("preserves the Door Does Not Close or Latch HTML/link content exactly, including the U+00A0", async () => {
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const exterior = result.sections.find((s) => s.name === "Exterior")!;
    const doors = exterior.items.find((i) => i.name === "Exterior Doors")!;
    const door = doors.comments.find((c) => c.name === "Door Does Not Close or Latch")!;
    expect(door.rawText).toContain(
      '<a href="http://www.familyhandyman.com/doors/repair/fix-sagging-or-sticking-doors/view-all" target="_blank">Here is a DIY troubleshooting article</a>'
    );
    expect(door.rawText).toContain(" </p>");
    expect(door.sourceRowNumber).toBe(21);
  });

  it("preserves the Siding Material multiple-choice options in order (CS-0070)", async () => {
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const exterior = result.sections.find((s) => s.name === "Exterior")!;
    const siding = exterior.items.find((i) => i.name === "Siding, Flashing &amp; Trim")!;
    const material = siding.comments.find((c) => c.name === "Siding Material")!;
    expect(material.options).toEqual([
      "Stucco",
      "Brick Veneer",
      "Asphalt",
      "Fiber Cement",
      "Wood",
      "Shingles",
      "Masonry",
      "Brick",
      "Logs",
      "Vinyl",
      "Stone Veneer",
      "Plastic",
      "Metal",
      "Engineered Wood",
      "Concrete",
      "Stone",
    ]);
  });

  it("keeps the duplicate Damper Inoperable rows as two distinct comments (CS-0025)", async () => {
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const fireplace = result.sections.find((s) => s.name === "Fireplace")!;
    const damperDoors = fireplace.items.find((i) => i.name === "Damper Doors")!;
    const inoperable = damperDoors.comments.filter((c) => c.name === "Damper Inoperable");
    expect(inoperable.length).toBe(2);
    expect(inoperable[0].id).not.toBe(inoperable[1].id);
    expect(new Set(inoperable.map((c) => c.sourceRowNumber)).size).toBe(2);
  });
});

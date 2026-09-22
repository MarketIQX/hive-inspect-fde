import { describe, expect, it } from "vitest";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { buildMinimalWorkbook } from "./helpers/build-minimal-workbook";

// The assignment says Hive "may try another export in the same HTML-text
// format." Export A tests prove this one real template strongly, but not
// that the importer is driven by the format rather than this specific
// file. These synthetic, clearly-labeled cases (CS-0085) each isolate one
// same-format variation and assert: preserved-or-visibly-warned, never
// silently dropped.

const BASE_HEADERS = [
  "Section Name",
  "Item Name",
  "Comment Name",
  "Comment Text",
  "Comment Type",
  "Category",
  "Order",
  "Answer Type",
  "Uses",
  "Last Modified",
];

describe("importer generalizes beyond the exact committed template (synthetic, same format)", () => {
  it("is driven by header text, not column position (shuffled header order)", async () => {
    const shuffled = [
      "Comment Type",
      "Item Name",
      "Last Modified",
      "Section Name",
      "Uses",
      "Comment Name",
      "Order",
      "Category",
      "Answer Type",
      "Comment Text",
    ];
    const bytes = await buildMinimalWorkbook({
      headers: shuffled,
      rows: [["defect", "Gutters", "1/1/2026", "Roof", "0", "Clogged Gutters", "0", "0", "boolean", "<p>Blocked.</p>"]],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    expect(result.outcome).toBe("SUCCESS");
    const comment = result.sections[0].items[0].comments[0];
    expect(comment.name).toBe("Clogged Gutters");
    expect(comment.rawText).toBe("<p>Blocked.</p>");
    expect(comment.commentType).toBe("defect");
  });

  it("surfaces an unknown extra populated column instead of dropping it", async () => {
    const bytes = await buildMinimalWorkbook({
      headers: [...BASE_HEADERS, "Severity Score"],
      rows: [
        ["Roof", "Gutters", "Clogged Gutters", "<p>Blocked.</p>", "defect", "0", "0", "boolean", "0", "1/1/2026", "7"],
      ],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    expect(result.outcome).toBe("COMPLETED_WITH_ISSUES");
    const comment = result.sections[0].items[0].comments[0];
    expect(comment.unmappedSourceFields).toEqual({ "Severity Score": "7" });
    expect(result.warnings.some((w) => w.code === "UNMAPPED_COLUMN_VALUE")).toBe(true);
  });

  it("preserves an unrecognized Comment Type raw and warns, rather than guessing", async () => {
    const bytes = await buildMinimalWorkbook({
      headers: BASE_HEADERS,
      rows: [["Roof", "Gutters", "Odd Note", "<p>x</p>", "note", "0", "0", "boolean", "0", "1/1/2026"]],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    const comment = result.sections[0].items[0].comments[0];
    expect(comment.commentType).toBeNull();
    expect(comment.commentTypeRaw).toBe("note");
    expect(result.warnings.some((w) => w.code === "UNKNOWN_COMMENT_TYPE")).toBe(true);
    expect(result.outcome).toBe("COMPLETED_WITH_ISSUES");
  });

  it("preserves an unrecognized Answer Type raw and warns, rather than guessing", async () => {
    const bytes = await buildMinimalWorkbook({
      headers: BASE_HEADERS,
      rows: [["Roof", "Gutters", "Odd Field", "<p>x</p>", "defect", "0", "0", "multiselect", "0", "1/1/2026"]],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    const comment = result.sections[0].items[0].comments[0];
    expect(comment.answerType).toBeNull();
    expect(comment.answerTypeRaw).toBe("multiselect");
    expect(result.warnings.some((w) => w.code === "UNKNOWN_ANSWER_TYPE")).toBe(true);
  });

  it("captures a previously-empty-in-A optional column when a same-format export populates it", async () => {
    const bytes = await buildMinimalWorkbook({
      headers: [...BASE_HEADERS, "Locked"],
      rows: [
        ["Roof", "Gutters", "Clogged Gutters", "<p>x</p>", "defect", "0", "0", "boolean", "0", "1/1/2026", "true"],
      ],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    const comment = result.sections[0].items[0].comments[0];
    // Regression guard for the parseTagValue boolean-coercion bug: "true"
    // must survive as the literal string "true", not vanish or become a
    // JS boolean.
    expect(comment.locked).toBe("true");
  });

  it("keeps a caption-only default photo instead of dropping it when the URL is blank", async () => {
    const bytes = await buildMinimalWorkbook({
      headers: [...BASE_HEADERS, "Default Photo 1", "Default Photo 1 Caption"],
      rows: [
        ["Roof", "Gutters", "Clogged Gutters", "<p>x</p>", "defect", "0", "0", "boolean", "0", "1/1/2026", "", "Front elevation"],
      ],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    const comment = result.sections[0].items[0].comments[0];
    expect(comment.defaultPhotos).toEqual([{ index: 1, url: null, caption: "Front elevation" }]);
  });

  it("preserves an unparseable numeric value raw and warns, rather than silently nulling it", async () => {
    const bytes = await buildMinimalWorkbook({
      headers: [...BASE_HEADERS, "Default Estimate Min"],
      rows: [
        ["Roof", "Gutters", "Clogged Gutters", "<p>x</p>", "defect", "0", "0", "boolean", "0", "1/1/2026", "$500"],
      ],
    });
    const result = await importWorkbook(bytes, { sourceFileName: "x", sourceFileSha256: "n/a" });
    const comment = result.sections[0].items[0].comments[0];
    expect(comment.defaultEstimateMin).toBeNull();
    expect(comment.defaultEstimateMinRaw).toBe("$500");
    expect(result.warnings.some((w) => w.code === "UNPARSEABLE_NUMERIC_VALUE")).toBe(true);
  });
});

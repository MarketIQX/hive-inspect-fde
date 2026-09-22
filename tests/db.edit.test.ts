import { afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { persistImport } from "../src/lib/db/persist-import";
import { getTemplate } from "../src/lib/db/get-template";
import { updateCommentText, updateItemName, updateSectionName } from "../src/lib/db/update";
import { getPool } from "../src/lib/db/pool";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

// Assignment requirement: edit section names, item names, and comment
// text, then save; the saved value must be provable from a fresh backend
// read after edit/reopen, not a toast or cached screen.
describe("edits to section names, item names, and comment text persist", () => {
  const createdTemplateIds: string[] = [];

  afterAll(async () => {
    const pool = getPool();
    for (const id of createdTemplateIds) {
      await pool.query("delete from templates where id = $1", [id]);
    }
    await pool.end();
  });

  it("persists edited section name, item name, and comment text across a fresh read", async () => {
    const bytes = readFileSync(SOURCE_PATH);
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const { templateId } = await persistImport(result, "Test: Edit Persistence");
    createdTemplateIds.push(templateId);

    const before = await getTemplate(templateId);
    const exterior = before!.sections.find((s) => s.name === "Exterior")!;
    const siding = exterior.items.find((i) => i.name === "Siding, Flashing &amp; Trim")!;
    const cracking = siding.comments.find((c) => c.name === "Cracking - Major")!;

    await updateSectionName(exterior.id, "Exterior (edited)");
    await updateItemName(siding.id, "Siding & Trim (edited)");
    await updateCommentText(cracking.id, "Edited comment text.");

    // Fresh read, independent of the pre-edit objects above.
    const after = await getTemplate(templateId);
    const editedSection = after!.sections.find((s) => s.id === exterior.id)!;
    const editedItem = editedSection.items.find((i) => i.id === siding.id)!;
    const editedComment = editedItem.comments.find((c) => c.id === cracking.id)!;

    expect(editedSection.name).toBe("Exterior (edited)");
    expect(editedItem.name).toBe("Siding & Trim (edited)");
    expect(editedComment.rawText).toBe("Edited comment text.");

    // Everything else in the template is untouched by the edit.
    expect(after!.sections.length).toBe(13);
    const otherItem = editedSection.items.find((i) => i.name === "Exterior Doors")!;
    expect(otherItem.comments.length).toBe(8);
  });
});

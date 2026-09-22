import { afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { persistImport } from "../src/lib/db/persist-import";
import { getTemplate } from "../src/lib/db/get-template";
import { updateCommentText, updateSectionName } from "../src/lib/db/update";
import { duplicateTemplate } from "../src/lib/db/duplicate-template";
import { getPool } from "../src/lib/db/pool";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

// Assignment requirement: duplicate a template and edit the copy
// independently; changes to the copy must leave the original unchanged.
describe("template duplication is independent", () => {
  const createdTemplateIds: string[] = [];

  afterAll(async () => {
    const pool = getPool();
    for (const id of createdTemplateIds) {
      await pool.query("delete from templates where id = $1", [id]);
    }
    await pool.end();
  });

  it("gives the copy new ids and identical content, then survives editing the copy without touching the original", async () => {
    const bytes = readFileSync(SOURCE_PATH);
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const { templateId: originalId } = await persistImport(result, "Test: Copy Source");
    createdTemplateIds.push(originalId);

    const { templateId: copyId } = await duplicateTemplate(originalId, "Test: Copy Source (copy)");
    createdTemplateIds.push(copyId);
    expect(copyId).not.toBe(originalId);

    const original = await getTemplate(originalId);
    const copy = await getTemplate(copyId);

    // Same content, different identities throughout the graph.
    expect(copy!.sections.length).toBe(original!.sections.length);
    expect(copy!.id).not.toBe(original!.id);
    expect(copy!.sections[0].id).not.toBe(original!.sections[0].id);
    expect(copy!.sections[0].items[0].id).not.toBe(original!.sections[0].items[0].id);
    expect(copy!.sections[0].items[0].comments[0].id).not.toBe(
      original!.sections[0].items[0].comments[0].id
    );
    const copyItemCount = copy!.sections.reduce((n, s) => n + s.items.length, 0);
    const copyCommentCount = copy!.sections.reduce(
      (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
      0
    );
    expect(copyItemCount).toBe(69);
    expect(copyCommentCount).toBe(392);

    // Edit the copy only.
    const copyExterior = copy!.sections.find((s) => s.name === "Exterior")!;
    const copySiding = copyExterior.items.find((i) => i.name === "Siding, Flashing &amp; Trim")!;
    const copyCracking = copySiding.comments.find((c) => c.name === "Cracking - Major")!;
    await updateSectionName(copyExterior.id, "Exterior CHANGED IN COPY");
    await updateCommentText(copyCracking.id, "CHANGED IN COPY ONLY");

    const originalAfter = await getTemplate(originalId);
    const copyAfter = await getTemplate(copyId);

    const origExterior = originalAfter!.sections.find((s) => s.name === "Exterior")!;
    expect(origExterior.name).toBe("Exterior"); // unchanged
    const origSiding = origExterior.items.find((i) => i.name === "Siding, Flashing &amp; Trim")!;
    const origCracking = origSiding.comments.find((c) => c.name === "Cracking - Major")!;
    expect(origCracking.rawText).toBe(
      "Moderate to major cracking was observed at one or more points on the exterior. This can be the result of poor original compaction of soil at the time of construction or excess moisture in the underlying soil. Recommend consulting with a structural engineer and/or soil expert."
    );

    const changedSection = copyAfter!.sections.find((s) => s.id === copyExterior.id)!;
    expect(changedSection.name).toBe("Exterior CHANGED IN COPY");
    const changedComment = changedSection.items
      .find((i) => i.id === copySiding.id)!
      .comments.find((c) => c.id === copyCracking.id)!;
    expect(changedComment.rawText).toBe("CHANGED IN COPY ONLY");
  });
});

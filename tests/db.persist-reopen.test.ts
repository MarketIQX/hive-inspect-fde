import { afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { persistImport } from "../src/lib/db/persist-import";
import { getTemplate } from "../src/lib/db/get-template";
import { getPool } from "../src/lib/db/pool";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

// Requires local Supabase running (`npx supabase start`); tests/setup.ts
// loads .env.local for DATABASE_URL. This proves persistence with an
// actual database read in a fresh query, not client/cached state
// (assignment requirement: "closing and reopening the app").
describe("real backend persistence survives close/reopen", () => {
  const createdTemplateIds: string[] = [];

  afterAll(async () => {
    const pool = getPool();
    for (const id of createdTemplateIds) {
      await pool.query("delete from templates where id = $1", [id]);
    }
    await pool.end();
  });

  it("persists an import and reads back an identical structure via a fresh query", async () => {
    const bytes = readFileSync(SOURCE_PATH);
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    expect(result.outcome).toBe("SUCCESS");

    const { templateId } = await persistImport(result, "Test: Residential Template");
    createdTemplateIds.push(templateId);

    // A separate read, not the in-memory `result` — this is the actual
    // reopen proof.
    const reopened = await getTemplate(templateId);
    expect(reopened).not.toBeNull();
    expect(reopened!.sections.length).toBe(13);
    const itemCount = reopened!.sections.reduce((n, s) => n + s.items.length, 0);
    const commentCount = reopened!.sections.reduce(
      (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
      0
    );
    expect(itemCount).toBe(69);
    expect(commentCount).toBe(392);

    const exterior = reopened!.sections.find((s) => s.name === "Exterior")!;
    const siding = exterior.items.find((i) => i.name === "Siding, Flashing &amp; Trim")!;
    const cracking = siding.comments.find((c) => c.name === "Cracking - Major")!;
    expect(cracking.rawText).toBe(
      "Moderate to major cracking was observed at one or more points on the exterior. This can be the result of poor original compaction of soil at the time of construction or excess moisture in the underlying soil. Recommend consulting with a structural engineer and/or soil expert."
    );
    expect(cracking.category).toBe(0);

    const heating = reopened!.sections.find((s) => s.name === "Heating")!;
    const general = heating.items.find((i) => i.name === "General")!;
    const homeowner = general.comments.find((c) => c.name === "Homeowner's Responsibility")!;
    expect(homeowner.defaultValue).toBe("true");
  });

  it("a controlled failure rolls back the whole template graph (no partial template)", async () => {
    const bytes = readFileSync(SOURCE_PATH);
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });

    // Corrupt one comment's category to violate the DB check constraint
    // (category must be -1, 0, or 1) partway through the insert cascade,
    // to prove the transaction rolls back rather than leaving a partial
    // template.
    const before = await getPool().query("select count(*)::int as n from templates");
    const target = result.sections
      .flatMap((s) => s.items)
      .flatMap((i) => i.comments)
      .find((c) => c.name === "Cracking - Major")!;
    // @ts-expect-error deliberately violating the type to exercise the DB constraint
    target.category = 99;

    await expect(persistImport(result, "Test: Should Roll Back")).rejects.toThrow();

    const after = await getPool().query("select count(*)::int as n from templates");
    expect(after.rows[0].n).toBe(before.rows[0].n);
  });
});

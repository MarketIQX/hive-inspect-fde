import { afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { persistImport } from "../src/lib/db/persist-import";
import { getLatestImportRun } from "../src/lib/db/get-import-run";
import { getPool } from "../src/lib/db/pool";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").toUpperCase();
}

// The chosen post-baseline improvement (B8): preservation evidence stays
// available for as long as the template exists, read fresh from
// import_runs/import_warnings, not only in the upload response.
describe("preservation report persists and is readable later", () => {
  const createdTemplateIds: string[] = [];

  afterAll(async () => {
    const pool = getPool();
    for (const id of createdTemplateIds) {
      await pool.query("delete from templates where id = $1", [id]);
    }
    await pool.end();
  });

  it("reads back the import outcome, counts, and full warning list for a real import", async () => {
    const bytes = readFileSync(SOURCE_PATH);
    const result = await importWorkbook(bytes, {
      sourceFileName: "Residential Template-2026-09-21.xls",
      sourceFileSha256: sha256(bytes),
    });
    const { templateId } = await persistImport(result, "Test: Preservation Report");
    createdTemplateIds.push(templateId);

    const run = await getLatestImportRun(templateId);
    expect(run).not.toBeNull();
    expect(run!.outcome).toBe(result.outcome);
    expect(run!.sourceRowCount).toBe(392);
    expect(run!.importedRowCount).toBe(392);
    expect(run!.warnings.length).toBe(result.warnings.length);
  });

  it("returns null for a template with no import_runs (e.g. a fresh id)", async () => {
    const run = await getLatestImportRun("00000000-0000-0000-0000-000000000000");
    expect(run).toBeNull();
  });
});

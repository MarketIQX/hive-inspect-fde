import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { basename } from "path";
import { importWorkbook } from "../src/lib/importer/map-to-schema";
import { persistImport } from "../src/lib/db/persist-import";
import { getPool } from "../src/lib/db/pool";
import { getTemplate } from "../src/lib/db/get-template";

const SOURCE_PATH = "fixtures/source/Residential Template-2026-09-21.xls";

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL && existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required. Set it to the target Postgres database before seeding."
    );
  }

  const bytes = readFileSync(SOURCE_PATH);
  const sourceFileSha256 = createHash("sha256").update(bytes).digest("hex").toUpperCase();
  const pool = getPool();

  try {
    const existing = await pool.query<{ id: string }>(
      `select t.id
       from templates t
       join import_runs ir on ir.template_id = t.id
       where t.source_file_sha256 = $1
         and ir.outcome in ('SUCCESS', 'COMPLETED_WITH_ISSUES')
       order by ir.created_at desc
       limit 1`,
      [sourceFileSha256]
    );

    if (existing.rows[0]) {
      const template = await getTemplate(existing.rows[0].id);
      if (!template) {
        throw new Error("Seed lookup returned a template id that could not be reopened.");
      }

      const itemCount = template.sections.reduce((n, s) => n + s.items.length, 0);
      const commentCount = template.sections.reduce(
        (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
        0
      );

      console.log(
        `Seed already present: ${template.id} (${template.sections.length} sections / ${itemCount} items / ${commentCount} comments)`
      );
      return;
    }

    const result = await importWorkbook(bytes, {
      sourceFileName: basename(SOURCE_PATH),
      sourceFileSha256,
    });

    if (result.outcome === "FAILED") {
      throw new Error(
        `Seed import failed: ${result.warnings.map((w) => w.message).join("; ")}`
      );
    }

    const { templateId } = await persistImport(result, "Residential Template-2026-09-21");
    const template = await getTemplate(templateId);

    if (!template) {
      throw new Error("Seed persisted but could not be reopened from Postgres.");
    }

    const itemCount = template.sections.reduce((n, s) => n + s.items.length, 0);
    const commentCount = template.sections.reduce(
      (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
      0
    );

    if (template.sections.length !== 13 || itemCount !== 69 || commentCount !== 392) {
      throw new Error(
        `Seed reopen mismatch: ${template.sections.length} sections / ${itemCount} items / ${commentCount} comments`
      );
    }

    console.log(
      `Seeded reviewer template: ${templateId} (13 sections / 69 items / 392 comments)`
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

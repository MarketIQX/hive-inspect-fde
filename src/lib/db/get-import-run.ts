import { getPool } from "./pool";
import type { ImportOutcome, ImportWarning } from "../types";

export interface PersistedImportRun {
  id: string;
  outcome: ImportOutcome;
  sourceFileName: string;
  sourceFileSha256: string;
  sourceRowCount: number;
  importedRowCount: number;
  createdAt: string;
  warnings: ImportWarning[];
}

/**
 * Reads the most recent import_runs record for a template, with its
 * import_warnings, from the database. This is what backs the Preservation
 * Report: import-time evidence stays available for as long as the
 * template exists, not only in the response of the upload request.
 */
export async function getLatestImportRun(templateId: string): Promise<PersistedImportRun | null> {
  const pool = getPool();
  const runRes = await pool.query<{
    id: string;
    outcome: ImportOutcome;
    source_file_name: string;
    source_file_sha256: string;
    source_row_count: number;
    imported_row_count: number;
    created_at: string;
  }>(
    `select id, outcome, source_file_name, source_file_sha256, source_row_count, imported_row_count, created_at
     from import_runs where template_id = $1 order by created_at desc limit 1`,
    [templateId]
  );
  const run = runRes.rows[0];
  if (!run) return null;

  const warningsRes = await pool.query<{
    level: ImportWarning["level"];
    code: string;
    message: string;
    source_row_number: number | null;
    column_name: string | null;
  }>(
    `select level, code, message, source_row_number, column_name
     from import_warnings where import_run_id = $1 order by source_row_number nulls first`,
    [run.id]
  );

  return {
    id: run.id,
    outcome: run.outcome,
    sourceFileName: run.source_file_name,
    sourceFileSha256: run.source_file_sha256,
    sourceRowCount: run.source_row_count,
    importedRowCount: run.imported_row_count,
    createdAt: run.created_at,
    warnings: warningsRes.rows.map((w) => ({
      level: w.level,
      code: w.code,
      message: w.message,
      sourceRowNumber: w.source_row_number ?? undefined,
      column: w.column_name ?? undefined,
    })),
  };
}

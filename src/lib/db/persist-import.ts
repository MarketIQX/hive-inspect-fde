import type { PoolClient } from "pg";
import { getPool } from "./pool";
import type { ImportResult } from "../types";

/**
 * Persists an already-computed ImportResult as a new template with its
 * full section/item/comment tree, plus an import_runs record and every
 * import_warnings row, in one transaction. A controlled failure partway
 * through rolls back the whole graph rather than leaving a partial
 * template (assignment requirement: no misleading partial import).
 */
export async function persistImport(
  result: ImportResult,
  templateName: string
): Promise<{ templateId: string; importRunId: string }> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const templateRes = await client.query<{ id: string }>(
      `insert into templates (name, source_file_name, source_file_sha256)
       values ($1, $2, $3) returning id`,
      [templateName, result.sourceFileName, result.sourceFileSha256]
    );
    const templateId = templateRes.rows[0].id;

    for (const section of result.sections) {
      const sectionRes = await client.query<{ id: string }>(
        `insert into sections (template_id, name, ordinal)
         values ($1, $2, $3) returning id`,
        [templateId, section.name, section.ordinal]
      );
      const sectionId = sectionRes.rows[0].id;

      for (const item of section.items) {
        const itemRes = await client.query<{ id: string }>(
          `insert into items (section_id, name, ordinal)
           values ($1, $2, $3) returning id`,
          [sectionId, item.name, item.ordinal]
        );
        const itemId = itemRes.rows[0].id;

        for (const comment of item.comments) {
          await insertComment(client, itemId, comment);
        }
      }
    }

    const importRunRes = await client.query<{ id: string }>(
      `insert into import_runs
         (template_id, source_file_name, source_file_sha256, outcome,
          source_row_count, imported_row_count, required_headers, observed_headers)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id`,
      [
        templateId,
        result.sourceFileName,
        result.sourceFileSha256,
        result.outcome,
        result.sourceRowCount,
        result.importedRowCount,
        result.requiredHeaders,
        result.observedHeaders,
      ]
    );
    const importRunId = importRunRes.rows[0].id;

    for (const warning of result.warnings) {
      await client.query(
        `insert into import_warnings (import_run_id, level, code, message, source_row_number, column_name)
         values ($1, $2, $3, $4, $5, $6)`,
        [importRunId, warning.level, warning.code, warning.message, warning.sourceRowNumber ?? null, warning.column ?? null]
      );
    }

    await client.query("COMMIT");
    return { templateId, importRunId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function insertComment(
  client: PoolClient,
  itemId: string,
  comment: ImportResult["sections"][number]["items"][number]["comments"][number]
): Promise<void> {
  await client.query(
    `insert into comments (
       item_id, name, raw_text,
       comment_type, comment_type_raw,
       category, category_raw,
       options, options_raw,
       unit_options, unit_options_raw,
       recommendation, source_order_hint,
       answer_type, answer_type_raw,
       default_value, default_value_2, default_unit_type, default_location,
       default_estimate_min, default_estimate_min_raw,
       default_estimate_max, default_estimate_max_raw,
       locked, simple_format, disable_photos,
       uses_count, uses_count_raw,
       default_photos, source_last_modified, unmapped_source_fields,
       source_row_number, source_row_ordinal
     ) values (
       $1, $2, $3,
       $4, $5,
       $6, $7,
       $8, $9,
       $10, $11,
       $12, $13,
       $14, $15,
       $16, $17, $18, $19,
       $20, $21,
       $22, $23,
       $24, $25, $26,
       $27, $28,
       $29, $30, $31,
       $32, $33
     )`,
    [
      itemId,
      comment.name,
      comment.rawText,
      comment.commentType,
      comment.commentTypeRaw,
      comment.category,
      comment.categoryRaw,
      comment.options,
      comment.optionsRaw,
      comment.unitOptions,
      comment.unitOptionsRaw,
      comment.recommendation,
      comment.sourceOrderHint,
      comment.answerType,
      comment.answerTypeRaw,
      comment.defaultValue,
      comment.defaultValue2,
      comment.defaultUnitType,
      comment.defaultLocation,
      comment.defaultEstimateMin,
      comment.defaultEstimateMinRaw,
      comment.defaultEstimateMax,
      comment.defaultEstimateMaxRaw,
      comment.locked,
      comment.simpleFormat,
      comment.disablePhotos,
      comment.usesCount,
      comment.usesCountRaw,
      JSON.stringify(comment.defaultPhotos),
      comment.sourceLastModified,
      JSON.stringify(comment.unmappedSourceFields),
      comment.sourceRowNumber,
      comment.sourceRowOrdinal,
    ]
  );
}

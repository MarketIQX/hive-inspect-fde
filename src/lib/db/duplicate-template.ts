import { getPool } from "./pool";

/**
 * Deep-copies a template and its full section/item/comment graph into new
 * rows with new identities, in one transaction. The copy's
 * copied_from_template_id records lineage; nothing in the copy shares a
 * row with the original, so editing the copy can never mutate it
 * (assignment requirement: independent copy).
 */
export async function duplicateTemplate(
  sourceTemplateId: string,
  newName: string
): Promise<{ templateId: string }> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sourceRes = await client.query<{
      source_file_name: string;
      source_file_sha256: string;
    }>(`select source_file_name, source_file_sha256 from templates where id = $1`, [
      sourceTemplateId,
    ]);
    const source = sourceRes.rows[0];
    if (!source) {
      throw new Error(`Template ${sourceTemplateId} not found`);
    }

    const newTemplateRes = await client.query<{ id: string }>(
      `insert into templates (name, source_file_name, source_file_sha256, copied_from_template_id)
       values ($1, $2, $3, $4) returning id`,
      [newName, source.source_file_name, source.source_file_sha256, sourceTemplateId]
    );
    const newTemplateId = newTemplateRes.rows[0].id;

    const sectionsRes = await client.query<{ id: string; name: string; ordinal: number }>(
      `select id, name, ordinal from sections where template_id = $1 order by ordinal`,
      [sourceTemplateId]
    );

    for (const section of sectionsRes.rows) {
      const newSectionRes = await client.query<{ id: string }>(
        `insert into sections (template_id, name, ordinal) values ($1, $2, $3) returning id`,
        [newTemplateId, section.name, section.ordinal]
      );
      const newSectionId = newSectionRes.rows[0].id;

      const itemsRes = await client.query<{ id: string; name: string; ordinal: number }>(
        `select id, name, ordinal from items where section_id = $1 order by ordinal`,
        [section.id]
      );

      for (const item of itemsRes.rows) {
        const newItemRes = await client.query<{ id: string }>(
          `insert into items (section_id, name, ordinal) values ($1, $2, $3) returning id`,
          [newSectionId, item.name, item.ordinal]
        );
        const newItemId = newItemRes.rows[0].id;

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
           )
           select
             $1, name, raw_text,
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
           from comments where item_id = $2`,
          [newItemId, item.id]
        );
      }
    }

    await client.query("COMMIT");
    return { templateId: newTemplateId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

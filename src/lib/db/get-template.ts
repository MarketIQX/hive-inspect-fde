import { getPool } from "./pool";
import type { DefaultPhoto, SourceComment, SourceItem, SourceSection, Template } from "../types";

interface CommentRow {
  id: string;
  item_id: string;
  name: string;
  raw_text: string | null;
  comment_type: string | null;
  comment_type_raw: string | null;
  category: number | null;
  category_raw: string | null;
  options: string[] | null;
  options_raw: string | null;
  unit_options: string[] | null;
  unit_options_raw: string | null;
  recommendation: string | null;
  source_order_hint: number | null;
  answer_type: string | null;
  answer_type_raw: string | null;
  default_value: string | null;
  default_value_2: string | null;
  default_unit_type: string | null;
  default_location: string | null;
  default_estimate_min: string | null;
  default_estimate_min_raw: string | null;
  default_estimate_max: string | null;
  default_estimate_max_raw: string | null;
  locked: string | null;
  simple_format: string | null;
  disable_photos: string | null;
  uses_count: number | null;
  uses_count_raw: string | null;
  default_photos: DefaultPhoto[];
  source_last_modified: string | null;
  unmapped_source_fields: Record<string, string>;
  source_row_number: number;
  source_row_ordinal: number;
}

function rowToComment(row: CommentRow): SourceComment {
  return {
    id: row.id,
    itemId: row.item_id,
    name: row.name,
    rawText: row.raw_text,
    commentType: row.comment_type as SourceComment["commentType"],
    commentTypeRaw: row.comment_type_raw,
    category: row.category as SourceComment["category"],
    categoryRaw: row.category_raw,
    options: row.options,
    optionsRaw: row.options_raw,
    unitOptions: row.unit_options,
    unitOptionsRaw: row.unit_options_raw,
    recommendation: row.recommendation,
    sourceOrderHint: row.source_order_hint,
    answerType: row.answer_type as SourceComment["answerType"],
    answerTypeRaw: row.answer_type_raw,
    defaultValue: row.default_value,
    defaultValue2: row.default_value_2,
    defaultUnitType: row.default_unit_type,
    defaultLocation: row.default_location,
    defaultEstimateMin: row.default_estimate_min == null ? null : Number(row.default_estimate_min),
    defaultEstimateMinRaw: row.default_estimate_min_raw,
    defaultEstimateMax: row.default_estimate_max == null ? null : Number(row.default_estimate_max),
    defaultEstimateMaxRaw: row.default_estimate_max_raw,
    locked: row.locked,
    simpleFormat: row.simple_format,
    disablePhotos: row.disable_photos,
    usesCount: row.uses_count,
    usesCountRaw: row.uses_count_raw,
    defaultPhotos: row.default_photos ?? [],
    sourceLastModified: row.source_last_modified,
    unmappedSourceFields: row.unmapped_source_fields ?? {},
    sourceRowNumber: row.source_row_number,
    sourceRowOrdinal: row.source_row_ordinal,
  };
}

/**
 * Reads a template back from Postgres as a fully-populated section/item/
 * comment tree, in persisted order. This is the app's only read path for
 * an imported template — there is no client-side cache standing in for
 * it, so "does it survive close/reopen" is answered by an actual query.
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  const pool = getPool();

  const templateRes = await pool.query<{
    id: string;
    name: string;
    source_file_name: string;
    source_file_sha256: string;
    created_at: string;
  }>(
    `select id, name, source_file_name, source_file_sha256, created_at
     from templates where id = $1`,
    [templateId]
  );
  const templateRow = templateRes.rows[0];
  if (!templateRow) return null;

  const sectionsRes = await pool.query<{ id: string; name: string; ordinal: number }>(
    `select id, name, ordinal from sections where template_id = $1 order by ordinal`,
    [templateId]
  );

  const itemsRes = await pool.query<{ id: string; section_id: string; name: string; ordinal: number }>(
    `select i.id, i.section_id, i.name, i.ordinal
     from items i
     join sections s on s.id = i.section_id
     where s.template_id = $1
     order by i.ordinal`,
    [templateId]
  );

  const commentsRes = await pool.query<CommentRow>(
    `select c.*
     from comments c
     join items i on i.id = c.item_id
     join sections s on s.id = i.section_id
     where s.template_id = $1
     order by c.source_row_ordinal`,
    [templateId]
  );

  const itemsBySection = new Map<string, SourceItem[]>();
  for (const row of itemsRes.rows) {
    const item: SourceItem = { id: row.id, sectionId: row.section_id, name: row.name, ordinal: row.ordinal, comments: [] };
    const list = itemsBySection.get(row.section_id) ?? [];
    list.push(item);
    itemsBySection.set(row.section_id, list);
  }

  const itemById = new Map<string, SourceItem>();
  for (const items of itemsBySection.values()) {
    for (const item of items) itemById.set(item.id, item);
  }
  for (const row of commentsRes.rows) {
    const item = itemById.get(row.item_id);
    if (item) item.comments.push(rowToComment(row));
  }

  const sections: SourceSection[] = sectionsRes.rows.map((row) => ({
    id: row.id,
    name: row.name,
    ordinal: row.ordinal,
    items: itemsBySection.get(row.id) ?? [],
  }));

  return {
    id: templateRow.id,
    name: templateRow.name,
    sourceFileName: templateRow.source_file_name,
    sourceFileSha256: templateRow.source_file_sha256,
    createdAt: templateRow.created_at,
    sections,
  };
}

export async function listTemplates(): Promise<{ id: string; name: string; createdAt: string }[]> {
  const pool = getPool();
  const res = await pool.query<{ id: string; name: string; created_at: string }>(
    `select id, name, created_at from templates order by created_at desc`
  );
  return res.rows.map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
}

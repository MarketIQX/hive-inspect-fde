// Constants mirroring docs/SOURCE_CONTRACT.md. This file is the single
// source of truth for the required-header / validity gate; both the
// importer and its tests must read from here rather than restating it.

export const REQUIRED_HEADERS = [
  "Section Name",
  "Item Name",
  "Comment Name",
  "Comment Type",
  "Order",
  "Answer Type",
  "Uses",
  "Last Modified",
] as const;

// Full observed header set from Export A (docs/evidence/EXPORT_A_FIELD_CLASSIFICATION.md).
// Headers are matched by exact text; columns present in a file but not
// listed here are captured verbatim into unmappedSourceFields, never dropped.
export const KNOWN_HEADERS = [
  "Section Name",
  "Item Name",
  "Comment Name",
  "Comment Text",
  "Comment Type",
  "Category",
  "Multiple Choice Options",
  "Unit Type Options",
  "Recommendation",
  "Order",
  "Answer Type",
  "Default Value",
  "Default Value 2",
  "Default Unit Type",
  "Default Location",
  "Default Estimate Min",
  "Default Estimate Max",
  "Locked",
  "Simple Format",
  "Disable Photos",
  "Uses",
  "Last Modified",
] as const;

export const COMMENT_TYPES = ["info", "limit", "defect"] as const;
export const ANSWER_TYPES = [
  "boolean",
  "checkbox",
  "date",
  "number",
  "range",
  "text",
] as const;
export const CATEGORIES = [-1, 0, 1] as const;

/**
 * Spectora headers carry parenthetical hints, e.g. "Comment Type (info, limit, defect)".
 * We match on the header text up to the first "(" so a header-name-based
 * lookup is robust to that suffix while staying header-driven, not
 * position-driven (playbook Step 3 / SOURCE_CONTRACT.md).
 */
export function normalizeHeader(raw: string): string {
  const idx = raw.indexOf("(");
  const base = idx === -1 ? raw : raw.slice(0, idx);
  return base.trim();
}

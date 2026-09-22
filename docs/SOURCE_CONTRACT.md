# Spectora HTML-Text Export — Source Contract (G2)

Scope: this contract governs how a Spectora "Export HTML Text" spreadsheet (the format
observed in Export A, `fixtures/source/Residential Template-2026-09-21.xls`) is interpreted
by our importer. It is derived only from `docs/evidence/EXPORT_A_FIELD_CLASSIFICATION.md`
and the canonical record (`docs/CANONICAL_STATE.md`, CS-0018 through CS-0079). It does not
invent behavior beyond what has been observed or explicitly flagged as a proposed rule.

## Validity / interpretation stop conditions

A file is accepted for import only if all of the following hold. Any failure produces a
visible FAILED import outcome, not a partial or silent one.

1. The file is a ZIP-based OOXML spreadsheet package (`50 4B 03 04` magic; a
   `[Content_Types].xml` identifying a spreadsheet workbook). A non-ZIP file, or a ZIP that
   is not a spreadsheet package, fails immediately.
2. There is at least one worksheet, and its first row is a header row.
3. The header row contains, at minimum, these required headers (100%-populated in Export A),
   matched after stripping any parenthetical hint suffix (`Order (w/i item)` -> `Order`,
   `Comment Type (info, limit, defect)` -> `Comment Type`, same rule for every header):
   `Section Name`, `Item Name`, `Comment Name`, `Comment Type`, `Order`,
   `Answer Type`, `Uses`, `Last Modified`. Missing any required header fails the import
   before any row is processed.
4. At least one data row exists below the header row.

Interpretation stops at "does this row/column exist and what does it literally say." No
hierarchy, identity, or ordering rule is inferred from names alone (playbook Step 3).

## Hierarchy and ordering (source-verified, not inferred)

- **Section** identity = distinct `Section Name` values, in order of first physical
  appearance. Verified contiguous per section in Export A (CS-0024).
- **Item** (Hive "subsection") identity = distinct `(Section Name, Item Name)` pairs, in
  order of first physical appearance within their section. Verified contiguous (CS-0024).
- **Comment** ordering = raw physical source row order within its `(Section, Item)` group.
  The `Order (w/i item)` column is preserved as metadata only and is **never** used as the
  ordering oracle or as a unique identity: it repeats within groups and has gaps in 41 of 69
  groups (CS-0026).
- **No source column is a safe global identity.** Names duplicate (`Comment Name`: 334
  distinct of 392 rows; CS-0025) and the full `(Section, Item, Comment Name)` tuple itself
  duplicates at least once (Fireplace / Damper Doors / Damper Inoperable, source rows 263–264,
  CS-0025) with *different* Comment Text and Order. Destination identity is therefore always a
  generated id per imported row; duplicate tuples import as separate comment rows, never
  merged or deduped by name.
- Provenance kept per row: source workbook checksum, source row number, import run id.

## Column disposition

| Source column | Destination | Type | Rule |
| --- | --- | --- | --- |
| Section Name | `sections.name` | text | Verbatim. User-editable post-import. |
| Item Name | `items.name` | text | Verbatim. User-editable post-import. |
| Comment Name | `comments.name` | text | Verbatim. Preserved and duplicated safely; the baseline editor does not expose Comment Name editing because the assignment requires section-name, item-name, and comment-text editing only. Duplicates allowed. |
| Comment Text | `comments.raw_text` | text, nullable | Stored as the exact decoded source-cell string (not a raw-XML-byte comparison; see CS-0084), including HTML markup and characters such as U+00A0 (verified present, CS-0074/source row 21). Never mutated. Sanitized render is derived separately (see Rich content). User-editable post-import; editing replaces `raw_text` with the new plain/HTML value the editor produces — the pre-edit value is not retroactively treated as import damage (playbook rule). |
| Comment Type (info, limit, defect) | `comments.comment_type` | enum('info','limit','defect') | Verbatim; unknown value → import warning, row still imported with raw value preserved in `unmapped_source_fields`. |
| Category (-1: Low, 0: Med, 1: High) | `comments.category` | enum(-1,0,1), nullable | Verbatim including blank (90 of 392 rows blank). Not remapped to Hive's own category vocabulary — that mapping is UNRESOLVED per CS-0074 and out of scope for our own schema. |
| Multiple Choice Options | `comments.options` | text[], nullable | PROPOSED rule: split raw string on `,`, trim each part. Raw original string also retained in `options_raw`. If a resulting option contains an HTML tag or the split yields exactly one element from a string that looks list-like (heuristic only), emit an import warning for manual review rather than asserting confidence. |
| Unit Type Options | `comments.unit_options` | text[], nullable | Same rule as Multiple Choice Options. Zero populated rows in Export A; semantics UNRESOLVED beyond this rule. |
| Recommendation (from list) | `comments.recommendation` | text, nullable | Verbatim. |
| Order (w/i item) | `comments.source_order_hint` | integer, nullable | Metadata only. See Hierarchy above — not authoritative. |
| Answer Type | `comments.answer_type` | enum('boolean','checkbox','date','number','range','text') | Verbatim; unknown value → import warning. |
| Default Value | `comments.default_value` | text, nullable | Verbatim. |
| Default Value 2 (range types) | `comments.default_value_2` | text, nullable | Verbatim passthrough. Zero populated rows in A; semantics UNRESOLVED, not interpreted. |
| Default Unit Type | `comments.default_unit_type` | text, nullable | Verbatim passthrough. UNRESOLVED, not interpreted. |
| Default Location | `comments.default_location` | text, nullable | Verbatim passthrough. UNRESOLVED, not interpreted. |
| Default Estimate Min / Max | `comments.default_estimate_min` / `_max` | numeric, nullable | Verbatim. Stored faithfully even though Export A repeats the identical stock pair `10`/`1000` on all 392 rows (CS-0061). The importer does not editorialize this in the schema; any "looks like a stock default" warning is a UI/report concern, not a data-loss concern. |
| Locked / Simple Format / Disable Photos | `comments.locked` / `simple_format` / `disable_photos` | text, nullable | Stored as the raw source string, not coerced to boolean. Zero populated rows in A; UNRESOLVED whether populated values would be boolean-like — raw preservation is safer than guessing a type for semantics never observed. |
| Uses | `comments.uses_count` | integer, nullable | Verbatim. All-zero in A; no semantic claim beyond the literal value. |
| Default Photo 1–10 + captions (20 columns) | `comments.default_photos` | jsonb, nullable | Modeled as an array of `{index, url, caption}` rather than 20 rigid columns, since all are zero-populated in A and variability is unproven either way (playbook: flexible metadata only where variability warrants it). Verbatim passthrough when present. |
| Last Modified | `comments.source_last_modified` | text | Stored as the literal source string, not parsed into a timestamp type — exact format not yet verified against a second export. |
| Any column present in the file but not in this table | — | jsonb | Captured verbatim in `comments.unmapped_source_fields` per row and surfaced as an import warning. Never silently dropped. |

## Rich content and links

- `comments.raw_text` is the single source of truth and is treated as **untrusted HTML text**.
- The baseline editor does **not** render imported comment HTML as executable DOM. It exposes
  the preserved HTML source in a textarea so edits round-trip without a WYSIWYG editor
  rewriting markup. This is a deliberate fidelity-first limitation documented in NOTES.md.
- Formatting and links therefore survive as source data rather than as a rich preview. The
  independently extracted reference comparison checks the full decoded `Comment Text` string
  for every row, so observed tags such as `p`, `a[href,target]`, `strong`, and `div` and the
  actual hyperlink strings are covered by preservation evidence.
- Because the baseline UI does not execute that HTML, unsafe source links such as
  `javascript:` are not made clickable. If a future rendered preview is added, it must sanitize
  at render time rather than mutate `raw_text`; `src/lib/importer/sanitize-html.ts` is a
  utility for that future/optional path, not evidence that the current baseline renders HTML.
- Non-breaking spaces and other literal Unicode content are preserved as-is; they are not
  collapsed or stripped by the importer.

## Presentation vs. storage (CS-0084)

Storage fidelity and display readability are separate concerns. Section/item/comment names
containing Export A's double-escaped ampersand artifact (`&amp;amp;` on disk, decoding once to
the literal text `&amp;`; CS-0080) are stored and evaluated exactly as sourced. The current
baseline UI intentionally does not perform a second presentation-only entity decode, so those
labels can display the literal `&amp;` text. That is a documented presentation limitation,
not storage loss; the exact source value remains available for audit/evaluation.

## Non-exclusion rule

No populated field observed in Export A is excluded from storage. Zero-populated columns
(the ten `UNRESOLVED_VARIATION_FIELD` rows in the field classification) remain part of the
accepted schema and are stored when present in a future export, not dropped for being unused
in Export A.

## Open questions this contract does not resolve

- Safe comma-splitting for option strings whose individual options may themselves contain a
  comma (no such case observed in Export A).
- Exact semantics of `Default Value 2`, `Default Unit Type`, `Default Location`, `Locked`,
  `Simple Format`, `Disable Photos`, and the ten photo-default columns — none populated in
  Export A; stored verbatim, never guessed.
- Whether `Last Modified` is a stable, parseable timestamp format across exports.

These remain UNRESOLVED per the canonical record and must not be treated as decided.

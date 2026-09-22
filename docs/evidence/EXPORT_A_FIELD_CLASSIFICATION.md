# Export A Field Classification

Observed source: `fixtures/source/Residential Template-2026-09-21.xls`

SHA-256: `93AE536E100DA2DB0F41E81467CF4889220DE8D0673DDFCC56954FB77FF39C83`

Purpose: classify observed fields only after raw physical inventory. This is not a destination schema and does not claim support for values absent from Export A.

| Col | Source header | A populated rows | Classification | Current disposition |
| --- | --- | ---: | --- | --- |
| A | Section Name | 392 | MEANINGFUL_CONTENT | Preserve exact source value; structural interpretation remains evidence-bound |
| B | Item Name | 392 | MEANINGFUL_CONTENT | Preserve exact source value; name is not identity |
| C | Comment Name | 392 | MEANINGFUL_CONTENT | Preserve exact source value; duplicates are allowed |
| D | Comment Text | 309 | MEANINGFUL_CONTENT | Preserve original string plus later safe editable representation |
| E | Comment Type (info, limit, defect) | 392 | STRUCTURAL_METADATA | Preserve exact value |
| F | Category (-1: Low, 0: Med, 1: High) | 302 | STRUCTURAL_METADATA | Preserve exact value including blank |
| G | Multiple Choice Options (comma-separated) | 72 | MEANINGFUL_CONTENT | Preserve option string; parsing rule not yet frozen |
| H | Unit Type Options (numeric answers only, comma-separated) | 3 | MEANINGFUL_CONTENT | Preserve option string; parsing rule not yet frozen |
| I | Recommendation (from list) | 4 | STRUCTURAL_METADATA | Preserve exact value |
| J | Order (w/i item) | 392 | STRUCTURAL_METADATA | Preserve exact value; do not use as sole identity/order oracle |
| K | Answer Type (boolean, checkbox, date, number, range, text) | 392 | STRUCTURAL_METADATA | Preserve exact value |
| L | Default Value | 1 | MEANINGFUL_CONTENT | Preserve exact value |
| M | Default Value 2 (for "range" types) | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| N | Default Unit Type (for "number" and "range" types) | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| O | Default Location | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| P | Default Estimate Min | 392 | STRUCTURAL_METADATA | Preserve exact value |
| Q | Default Estimate Max | 392 | STRUCTURAL_METADATA | Preserve exact value |
| R | Locked | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| S | Simple Format | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| T | Disable Photos | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| U | Uses | 392 | STRUCTURAL_METADATA | Preserve exact value; semantics not inferred from all-zero A |
| V | Default Photo 1 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| W | Default Photo 1 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| X | Default Photo 2 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| Y | Default Photo 2 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| Z | Default Photo 3 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AA | Default Photo 3 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AB | Default Photo 4 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AC | Default Photo 4 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AD | Default Photo 5 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AE | Default Photo 5 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AF | Default Photo 6 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AG | Default Photo 6 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AH | Default Photo 7 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AI | Default Photo 7 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AJ | Default Photo 8 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AK | Default Photo 8 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AL | Default Photo 9 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AM | Default Photo 9 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AN | Default Photo 10 | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AO | Default Photo 10 Caption | 0 | UNRESOLVED_VARIATION_FIELD | Header observed; no A value to characterize |
| AP | Last Modified | 392 | STRUCTURAL_METADATA | Preserve source timestamp text as provenance metadata |

## Explicit exclusions and non-exclusions

- No populated field in Export A is classified as irrelevant.
- Empty serialized cells are empty source values, not evidence that their columns are irrelevant.
- Zero-populated columns remain part of the observed format and are unresolved for same-format variation.
- HTML-like content is source content. It is not stripped during classification.
- The `Order (w/i item)` field is retained, but duplicate/gapped values mean it is not treated as a unique identity or complete ordering oracle.
- Source row number remains provenance evidence until a later mapping decision is earned.

## Current unresolved semantics

- Whether comma-separated option fields can safely be split on every comma.
- How Spectora interprets duplicate order values across comment types/answer types.
- How destination editing should preserve HTML entities, non-breaking spaces and anchors.
- Semantics of empty-in-A fields such as range defaults, locking, simple format, photo controls and photo payloads.

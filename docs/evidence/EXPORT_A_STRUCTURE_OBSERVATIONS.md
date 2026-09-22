# Export A Structure Observations

Source: `fixtures/source/Residential Template-2026-09-21.xls`

SHA-256: `93AE536E100DA2DB0F41E81467CF4889220DE8D0673DDFCC56954FB77FF39C83`

These are exhaustive observations over the 392 data rows. They are not destination-schema decisions.

## Grouping and identity facts

- Distinct Section Name values: 13.
- Distinct Item Name values: 61.
- Distinct (Section Name, Item Name) pairs: 69.
- Every Section Name appears in one contiguous source-row run.
- Every distinct section/item pair appears in one contiguous source-row run.
- Distinct Comment Name values: 334 across 392 rows.
- 27 Comment Name values repeat, covering 85 source rows.
- Distinct (Section Name, Item Name, Comment Name) tuples: 391 across 392 rows.

The exact tuple `Fireplace / Damper Doors / Damper Inoperable` occurs twice:
- row 263: order 0; HTML paragraph comment text;
- row 264: order 1; different plain-text comment text.

Therefore section/item/comment names cannot safely serve as a unique source identity.

## Ordering facts

The source column is explicitly named `Order (w/i item)`, but observed values are not a complete unique row sequence:
- values repeat within some section/item groups;
- 41 section/item groups have gaps relative to a simple contiguous sequence;
- at least one section/item/type group still contains duplicate order values.

Source row position is therefore distinct provenance evidence and must not be discarded merely because an Order field exists.

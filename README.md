# Hive Inspect FDE Template Importer

Imports a Spectora "Export HTML Text" template spreadsheet into a structured,
editable schema, preserving text, hierarchy, and ordering — the take-home
assignment in `docs/assignment/`.

Current state: baseline import engine (deterministic parser + independent
evaluator) is built and tested locally. Persistence (Supabase), the edit/copy
UI, and deployment are not wired up yet. See `docs/CANONICAL_STATE.md` for
the full evidence trail and `NOTES.md` for cuts/limitations.

## Stack

Next.js + TypeScript + Supabase Postgres, deployed on Vercel (per the
assignment's stated defaults).

## Source of truth documents

Read in this order before changing import/mapping logic:

1. `docs/assignment/Hive_Inspect_Template_Importer_Assignment.pdf` — the brief.
2. `docs/CANONICAL_STATE.md` — append-only evidence log; later records supersede earlier ones.
3. `docs/SOURCE_CONTRACT.md` — every observed source column mapped to a destination disposition (G2).
4. `docs/evidence/EXPORT_A_FIELD_CLASSIFICATION.md` — raw physical inventory the contract is built from.

## Repo layout

```
src/lib/contract.ts           Header/enum constants mirroring SOURCE_CONTRACT.md
src/lib/types.ts              Shared domain types (Template/Section/Item/Comment)
src/lib/importer/             Production import path (hand-rolled OOXML reader; no LLM)
src/lib/evaluator/            Independent evaluator: compares an import against ground truth
scripts/build-reference-manifest.ts  Builds evaluator ground truth via SheetJS — a
                               deliberately different library from the importer's own
                               reader, so the evaluator can't share the importer's bugs
tests/                        vitest suite: known-good fixture + deliberate corruptions
fixtures/source/              Committed Spectora export(s) used as input
fixtures/reference/           Generated reference manifests (evaluator ground truth)
```

## Why an independent evaluator

The importer's raw-text extraction and the evaluator's expected values are
produced by two unrelated code paths (a hand-written OOXML reader using
`jszip`/`fast-xml-parser` for the importer; `xlsx` (SheetJS) for the
reference manifest). This is deliberate: an evaluator built from the same
extraction code as the thing it's grading can't catch that code's own bugs.
`tests/evaluator.corruption.test.ts` proves the evaluator actually rejects a
dropped row, a duplicated row, a reordered sibling, a wrong-parent
attachment, and changed comment text — not just that it passes on good data.

## Setup

```bash
npm install
npm run test              # importer + evaluator test suite
npm run reference:build   # regenerate fixtures/reference/*.manifest.json from a source file
npm run dev                # http://localhost:3000
```

No environment variables or database are required yet for the import/evaluate
path above. Supabase setup instructions will be added here once persistence
(slice B4) lands — see `docs/CANONICAL_STATE.md` CS-0079 for the build order.

## Source material

`fixtures/source/Residential Template-2026-09-21.xls` — Spectora's
"Residential Template", exported via Templates → My Templates → three-dot
menu → Export to spreadsheet → Export HTML Text. Provenance, checksum, and
byte-level container analysis: `docs/CANONICAL_STATE.md` CS-0018–CS-0029.
Contains only Spectora's own stock template content — no real customer data.

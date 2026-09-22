# Hive Inspect FDE Template Importer

Imports a Spectora "Export HTML Text" template spreadsheet into a structured,
editable schema, preserving text, hierarchy, and ordering — the take-home
assignment in `docs/assignment/`.

Current state: the full baseline is implemented and verified — deterministic
import with an independent evaluator, real Supabase Postgres persistence,
editing section/item names and comment text with a proven save/reload path,
independent template duplication, and a persistent Preservation Report (the
chosen customer improvement). The production deployment is live and seeded
with the real Spectora fixture. Remaining submission work: the walkthrough
video. See `docs/CANONICAL_STATE.md` for the full evidence trail and
`NOTES.md` for cuts/limitations.

## Stack

Next.js + TypeScript + Supabase Postgres, deployed on Vercel.

Live app: https://hive-inspect-fde.vercel.app

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
src/lib/db/                   Postgres persistence: transactional import writer, deep-copy
                               duplicator, section/item/comment updates, template + import-run reads
src/app/api/import/           Upload -> import -> persist route
src/app/api/sections|items|comments/[id]/  Edit endpoints (PATCH name / comment text)
src/app/api/templates/[id]/duplicate/      Independent deep-copy endpoint
src/app/templates/            Template list, editable detail page, and Preservation Report
supabase/migrations/          Schema (templates/sections/items/comments/import_runs/import_warnings)
tests/                        vitest suite: known-good fixture, corruptions, generalization, persistence
fixtures/source/              Committed Spectora export(s) used as input
fixtures/reference/           Generated reference manifests (evaluator ground truth)
```

## What's built

- **Import**: upload a Spectora export; deterministic parsing preserves
  hierarchy/ordering and makes every skipped/unsupported value visible as
  a warning (`/import`).
- **Persist**: every successful import is written to Postgres in one
  transaction; a controlled failure rolls back the whole graph rather
  than leaving a partial template.
- **Edit**: section names, item names, and comment text are editable in
  place, with explicit unsaved/saving/saved/failed states; saved values
  are provable from a fresh database read, not client state.
- **Independent copy**: duplicate a template into new rows with new
  identities; editing the copy is proven not to affect the original.
- **Preservation Report**: each template's page shows its import outcome,
  row counts, and every warning — available any time the template is
  viewed, not only right after upload (the chosen post-baseline
  improvement).

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

Requires Docker (for local Supabase) and Node 20+.

```bash
npm install
npx supabase start          # starts local Postgres and applies supabase/migrations/*.sql
cp .env.example .env.local  # set DATABASE_URL to the DB_URL printed by Supabase
npm run test                # importer + evaluator + persistence test suite
npm run dev                 # http://localhost:3000
```

The application talks to Postgres server-side through `DATABASE_URL`; it
does not require browser-side Supabase keys. For local development, use the
`DB_URL` shown by `npx supabase status`. To reset the local database to a
clean schema: `npx supabase db reset`.

For a hosted Supabase project, apply the migrations in
`supabase/migrations/` in order and set the project's Transaction-pooler
Postgres connection string as `DATABASE_URL` in Vercel. The hosted reviewer
deployment uses Supabase RLS with no public Data API policies; the app connects
server-side through Postgres. No credentials are committed to this repo.

To seed the reviewer environment once through the same deterministic importer
used by the UI:

```bash
npm run seed:review
```

The seed command is idempotent by source SHA-256: if that exact Spectora
fixture has already been imported, it reopens and reports the existing
template instead of inserting another copy. The live root route then opens
the most recent genuine import directly; an empty database falls back to
`/import`.

## Source material

`fixtures/source/Residential Template-2026-09-21.xls` — Spectora's
"Residential Template", exported via Templates → My Templates → three-dot
menu → Export to spreadsheet → Export HTML Text. Provenance, checksum, and
byte-level container analysis: `docs/CANONICAL_STATE.md` CS-0018–CS-0029.
Contains only Spectora's own stock template content — no real customer data.

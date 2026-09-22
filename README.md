# Hive Inspect FDE Template Importer

Imports a Spectora "Export HTML Text" template spreadsheet into a structured,
editable schema, preserving text, hierarchy, and ordering — the take-home
assignment in `docs/assignment/`.

Current state: import engine (deterministic parser + independent evaluator)
and real Supabase Postgres persistence are built and tested, including a
proven close/reopen path. Edit and copy UI, and deployment, are not wired up
yet. See `docs/CANONICAL_STATE.md` for the full evidence trail and
`NOTES.md` for cuts/limitations.

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
src/lib/db/                   Postgres persistence (pg pool, transactional import writer, reads)
src/app/api/import/           Upload -> import -> persist route
src/app/templates/            Template list + read-only detail pages (server components)
supabase/migrations/          Schema (templates/sections/items/comments/import_runs/import_warnings)
tests/                        vitest suite: known-good fixture, corruptions, generalization, persistence
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

Requires Docker (for local Supabase) and Node 20+.

```bash
npm install
npx supabase start        # starts local Postgres/Studio, applies supabase/migrations/*.sql, prints local keys/URL
cp .env.example .env.local  # then paste in the values `supabase start` printed
npm run test                # importer + evaluator + persistence test suite
npm run dev                 # http://localhost:3000
```

`npx supabase start` prints fixed, publicly-documented local-dev demo keys
(safe — they only work against `127.0.0.1`); paste `API_URL`/`ANON_KEY` into
`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`
into `SUPABASE_SERVICE_ROLE_KEY`, and `DB_URL` into `DATABASE_URL`. To reset
the local database to a clean schema: `npx supabase db reset`.

For a hosted Supabase project (used for the deployed app), create a project
at supabase.com, run the same migration against it (`npx supabase db push`
or paste `supabase/migrations/*.sql` into its SQL editor), and use that
project's own dashboard values in `.env.local` / your Vercel project's
environment variables instead. No credentials are committed to this repo.

## Source material

`fixtures/source/Residential Template-2026-09-21.xls` — Spectora's
"Residential Template", exported via Templates → My Templates → three-dot
menu → Export to spreadsheet → Export HTML Text. Provenance, checksum, and
byte-level container analysis: `docs/CANONICAL_STATE.md` CS-0018–CS-0029.
Contains only Spectora's own stock template content — no real customer data.

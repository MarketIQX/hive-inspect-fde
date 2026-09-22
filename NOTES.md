# NOTES

## Status at this snapshot

Baseline import → persist → edit → independent copy, plus one customer
improvement (the Preservation Report), are built, tested, and deployed against
hosted Supabase/Postgres on Vercel.

Production URL: https://hive-inspect-fde.vercel.app

Production acceptance verified the real Spectora import (392/392), persistence,
the Preservation Report, independent duplication, an edit surviving a fresh
public read while the original remained unchanged, and a malformed-upload
failure that created no partial template/import run. **Remaining submission
work:** record the walkthrough video in AK's own voice and grant Hive reviewer
access to the private GitHub repository. See `docs/CANONICAL_STATE.md` for
the full evidence trail; this file is the submission-facing summary.

## Supported input

Spectora "Export HTML Text" spreadsheet exports (OOXML `.xls`/`.xlsx`
container, despite the `.xls` extension — verified from bytes, not
trusted from the filename). Required headers (matched by name after
stripping any parenthetical suffix, so column order doesn't matter):
`Section Name`, `Item Name`, `Comment Name`, `Comment Type`, `Order`,
`Answer Type`, `Uses`, `Last Modified`. Full column-by-column disposition:
`docs/SOURCE_CONTRACT.md`.

## Known limitations (deliberately cut, and why)

- **Rich-text editor.** Comment text is edited as raw HTML in a plain
  `<textarea>`, not a WYSIWYG editor. The playbook flagged editor
  round-trip fidelity as a real risk before committing to one; a textarea
  can't corrupt markup, and wiring/validating a rich editor's HTML
  round-trip was judged lower value than finishing persistence, edit,
  copy, and the preservation report within the time available. The baseline
  does not execute imported HTML as a rich preview; it preserves the raw HTML
  text in the editable comment field. A sanitizer utility exists for any
  future rendered-preview path, but it is not part of the current UI.
- **Presentation decode for the double-escaped ampersand.** Export A
  stores `&` in names as literal double-escaped text (decodes once to
  `&amp;`, e.g. `Siding, Flashing &amp; Trim` — confirmed independently
  by three separate parsers, not a bug in any one of them). It's stored
  and compared exactly as sourced. A render-only decode to a clean `&`
  (matching how Hive's own UI displays it) is not implemented in the baseline.
  Storage correctness was prioritized over this cosmetic gap; both this file
  and `docs/SOURCE_CONTRACT.md` state it as a current limitation.
- **Binsr was not explored.** Hive and Spectora are both required by the
  brief; Binsr is optional. Given the time budget, deepening Hive product
  exploration (which surfaced the multi-choice-vs-checkbox mapping, the
  defect/recommendation model, and the accidental-save incident below)
  and then building a defensible, tested baseline was judged more valuable
  than a second product's comparison. This is a deliberate scope choice,
  not an oversight.
- **~10 source columns are unvalidated against real data.** `Default
  Value 2`, `Default Unit Type`, `Default Location`, `Locked`, `Simple
  Format`, `Disable Photos`, and the 10 default-photo/caption columns are
  zero-populated in the committed Export A fixture. They're stored raw
  (never coerced to a guessed type) and covered by synthetic
  generalization tests, but there's no real-world example to confirm
  against. Documented as `UNRESOLVED` in `docs/SOURCE_CONTRACT.md`, not
  silently assumed safe.
- **Authentication was deliberately not added to the reviewer demo.** The
  brief asks for a public URL reviewers can explore; adding an auth layer would
  add setup friction without improving the scored import/edit/copy workflow.
  Supabase's browser-facing Data API is deny-by-default through RLS with no
  public policies; application writes go only through the server-side Postgres
  connection. The walkthrough video remains the only unfinished product
  deliverable.

## How the work was checked

- **Independent evaluator**, not the importer grading itself: the
  reference/ground-truth manifest (`scripts/build-reference-manifest.ts`)
  is built with SheetJS; the production importer
  (`src/lib/importer/read-workbook.ts`) is a hand-rolled OOXML reader
  using `jszip`/`fast-xml-parser`. Two unrelated code paths reading the
  same file. The evaluator (`src/lib/evaluator/evaluate.ts`) compares
  their output field-by-field, including the raw forms of 7 additional
  mapped fields beyond the core structural five.
- **Deliberate corruption tests** (`tests/evaluator.corruption.test.ts`)
  prove the evaluator actually rejects a dropped row, a duplicated row,
  reordered siblings, a wrong-parent attachment, and changed text — not
  just that it passes on good data.
- **A synthetic generalization matrix**
  (`tests/importer.generalization.test.ts`), built independently of
  Export A, proves the importer is driven by header text (not column
  position or this specific template): header reordering, an unknown
  extra column, unrecognized enum values, a previously-empty column
  populated, a caption-only photo, and an unparseable numeric value are
  each preserved-or-visibly-warned, never silently dropped.
- **Real database round trips**, not in-memory assertions:
  `tests/db.persist-reopen.test.ts`, `db.edit.test.ts`, and `db.copy.test.ts`
  each re-read from Postgres through a fresh query after the action being
  tested, and a deliberately corrupted row is used to prove a failed
  import rolls back the whole transaction rather than leaving a partial
  template.
- **Live, not just automated**: every slice (import, edit-and-reload,
  duplicate-and-verify-original-unchanged, the preservation report) was
  also exercised in an actual browser against a running app (`next
  build` + `next start`, and separately `next dev`), with the resulting
  state cross-checked via independent `curl` requests — not just watched
  on screen.
- Three genuine bugs were found this way, not hypothesized: `Order`/
  `Order (w/i item)` header-normalization mismatch; `fast-xml-parser`
  silently trimming a real trailing newline; and the same library
  silently coercing the literal text `"true"` in one real source cell
  into a JS boolean, which then vanished. All three are fixed with
  regression tests. See CS-0080/CS-0086 in the canonical record.

## An honest incident, not smoothed over

During Hive product exploration, a UI/automation timing issue most likely
caused an accidental `Save Changes` click on Hive's own imported template
(not this app). No content was ever typed, so nothing was corrupted, but
a long-standing unexplained "unsaved changes" state on Hive's side was
lost as evidence in the process. Recorded in full, including what was and
wasn't provable afterward, at CS-0077/CS-0078 — kept rather than deleted,
per this project's append-only discipline.

## Time spent (approximate)

Roughly two focused sessions across 21–22 Sep 2026: product exploration
and source characterization (Hive + Spectora, field-level verification)
first, then implementation (scaffold through B8) in one continuous push.
Full session-by-session detail, with timestamps, is in
`docs/CANONICAL_STATE.md`.

## AI assistance and credits

Built with Claude Code (Claude Sonnet 5) as the primary execution engine,
directed through a canonical, append-only evidence record
(`docs/CANONICAL_STATE.md`) rather than ad hoc prompting — every material
decision, correction, and piece of verification is logged there with
reasoning, not only the final code. `docs/assignment/*`,
`docs/SOURCE_CONTRACT.md`, `docs/evidence/*`, and the verifier script
(`scripts/verify-canonical-append-only.mjs`) are the reusable process
artifacts produced along the way. No third-party starter template or
boilerplate was used beyond `create-next-app`'s default scaffold
(App Router + TypeScript + Tailwind) and standard, credited open-source
libraries in `package.json` (Next.js, `pg`, `jszip`, `fast-xml-parser`,
`sanitize-html`, `xlsx`/SheetJS as an evaluator-only dev dependency, and
the Supabase CLI for local Postgres). No import-mapping model was used —
the importer is fully deterministic, per the SOURCE_CONTRACT.

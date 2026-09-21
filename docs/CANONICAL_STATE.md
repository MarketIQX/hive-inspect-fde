# Hive Importer Canonical State

Date: 21 Sep 2026

## Purpose

This file is the project source of truth for evidence-backed claims. It separates observed facts from proposed engineering choices and unresolved questions. It must not be populated from assumptions, parser output, or inferred source structure.

## Evidence classes

- VERIFIED: directly established from the assignment, repository, machine state, actual source files, or a test that actually ran.
- PROPOSED: an engineering choice awaiting evidence or an implementation check.
- UNVERIFIED: a claim or requirement that still needs direct evidence.
- FAILED: a check that ran and did not meet its acceptance condition.

## Canonical rule

A claim advances only when its required evidence exists. The production importer must never generate the answer key used to judge itself. Unknown populated source content is never silently excluded.

## Current gate

G0 — Inputs and required product exploration

Status: INCOMPLETE

## VERIFIED

1. The assignment requires a web app that imports a Spectora HTML Text spreadsheet export and preserves text, hierarchy and ordering.
   Evidence: `docs/assignment/Hive_Inspect_Template_Importer_Assignment.pdf`, pages 1-2.

2. Unsupported or skipped content must be visible rather than silently dropped or rewritten.
   Evidence: assignment page 2.

3. Required post-import operations are section-name edit, item-name edit, comment-text edit, save, independent copy and real backend persistence.
   Evidence: assignment page 2.

4. A public deployed URL is required; Vercel is the requested default unless the chosen stack cannot reasonably run there.
   Evidence: assignment page 2.

5. The live app must open with an already imported template.
   Evidence: assignment page 2.

6. Hive hands-on exploration is required before building: sample inspection, published report and template-import workflow.
   Evidence: assignment page 1.

7. Spectora is required and the source must be exported via Export to spreadsheet -> Export HTML Text.
   Evidence: assignment page 1.

8. Repository exists at `C:\Users\marke\hive-inspect-fde`.
   Evidence: direct filesystem inspection on 21 Sep 2026.

9. Git baseline currently contains two commits and no implementation code.
   Evidence: direct git inspection on 21 Sep 2026.

10. No Spectora- or InterNACHI-named export is currently present under `C:\Users\marke`, and the Downloads listing contains no non-temporary spreadsheet export matching the required source.
    Evidence: direct filesystem search and Downloads listing on 21 Sep 2026.

11. The assignment PDF and execution playbook are present in the repository.
    Evidence: direct filesystem inspection.

12. No parser, final schema, editor, backend, deployment or AI-in-import decision has been verified.
    Evidence: repository inspection and `docs/DISCOVERY_STATUS.md`.

## PROPOSED

- Deterministic-first interpretation if the observed export contains sufficient explicit structure.
- One small application with parsing, mapping, validation, persistence and rendering/editing modules.
- Next.js + TypeScript + Supabase/Postgres + Vercel only if early evidence shows this is the fastest safe path.
- Immutable source evidence alongside an editable working representation.
- Import outcomes: SUCCESS, COMPLETED_WITH_ISSUES, FAILED.
- One post-baseline improvement: source-linked Migration Review.
- Server-side transactional semantics for import and copy.
- Provenance for successful mappings as well as exceptions.

None of these becomes VERIFIED merely because it appears in this file.

## UNVERIFIED

- Actual Spectora export container type.
- Worksheet/sheet structure, hidden sheets, dimensions and headers.
- Source hierarchy encoding.
- Stable source identifiers and ordering markers.
- Duplicate-label behavior.
- Meaningful fields beyond the assignment's required editable concepts.

- Rich HTML structures, links, formatting and any media represented in the source.
- Which source elements survive a candidate editor round trip.
- Export A checksum, provenance and size.
- Availability and behavior of a genuinely different Export B.
- Completion and observations from hands-on Hive exploration.
- Deadline timezone and any extension status.
- Deployed upload/resource limits.
- Final database schema and transaction mechanism.
- Reviewer access model.

## First canonical import fixture

Status: NOT YET PERMITTED

The first populated canonical import fixture may be created only after genuine Export A is present and directly inspected.

Its expected result must be established independently from the production importer. The fixture must identify source coordinates for every expected semantic element it claims to cover.

Minimum truth dimensions:

- coverage
- text/field fidelity
- parent-child structure
- sibling ordering
- supported rich-content semantics
- usability after editing
- exceptions / unsupported content
- provenance

The evaluator must pass the known-good fixture and reject deliberate loss, duplication, wrong-parent attachment, sibling reordering, meaningful text loss and supported-link loss.

## Gate advancement rules

G0 exits only when:
- Hive required journey is completed with evidence.
- Export A exists with recorded provenance and checksum.
- Export B is obtained or its genuine blocker is recorded.

G1 exits only when:
- actual file/container type is established from bytes;
- all meaningful sheets/fields/regions are inventoried;
- unknown populated content is explicitly classified or left unresolved;
- source hierarchy/order evidence is documented.

G2 exits only when:
- a source contract maps every observed meaningful convention to a disposition;
- exclusions are explicit;
- interpretation stop conditions are defined.

G3 exits only when:
- expected results are independently established;
- known-good data passes;
- each required deliberate corruption fails.

No later gate may retroactively convert an unverified source claim into a verified fact without new evidence.

## Immediate next evidence

Obtain genuine Spectora Export A. Until then, source-specific canonical data, final schema and production parser work remain blocked.

# Hive Importer Canonical State

Snapshot reviewed: 21 Sep 2026, 22:45 IST

## Purpose

This file is the project source of truth for evidence-backed claims. It separates observed facts from proposed engineering choices and unresolved questions. It must not be populated from assumptions, parser output, or inferred source structure.

## Evidence classes

- ASSIGNMENT_REQUIREMENT: stated by the assignment itself.
- OBSERVED_SOURCE_FACT: established directly from an inspected source file and bound to source coordinates/checksum where applicable.
- OBSERVED_ENVIRONMENT_FACT: established from repository, filesystem, deployed application, database, or authenticated tool state at a stated observation time.
- PROPOSED_DECISION: an engineering choice awaiting evidence or implementation verification.
- VERIFIED_TEST_RESULT: a defined check actually ran and met its acceptance condition.
- UNRESOLVED: evidence is missing, ambiguous, or insufficient to decide.
- FAILED: a defined check actually ran and did not meet its acceptance condition.

## Canonical rule

A claim advances only when its required evidence exists. Every dynamic environment claim is snapshot-scoped and must include or inherit an observation time; it must be rechecked before use if the environment may have changed. The production importer and any shared unverified extraction path must never generate the answer key used to judge the importer. Raw physical inventory precedes semantic classification. Unknown populated source content is never silently excluded.

## Current gate

G0 — Inputs and required product exploration

Status: INCOMPLETE

## ASSIGNMENT_REQUIREMENT

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

## OBSERVED_ENVIRONMENT_FACT

Observation time for items below: 21 Sep 2026, 22:45 IST unless stated otherwise.

8. Repository exists at `C:\Users\marke\hive-inspect-fde`.
   Evidence: direct filesystem inspection on 21 Sep 2026.

9. Before this correction pass, repository HEAD was `700ecd8` with three commits and no implementation code; no Git remote was configured.
   Evidence: direct `git log`, repository inspection and `git remote -v` at the observation time above.

10. No Spectora- or InterNACHI-named export is currently present under `C:\Users\marke`, and the Downloads listing contains no non-temporary spreadsheet export matching the required source.
    Evidence: direct filesystem search and Downloads listing on 21 Sep 2026.

11. The assignment PDF and execution playbook are present in the repository.
    Evidence: direct filesystem inspection.

12. No parser, final schema, editor, backend, deployment or AI-in-import decision has been verified.
    Evidence: repository inspection and `docs/DISCOVERY_STATUS.md`.

## PROPOSED_DECISION

- Deterministic-first interpretation if the observed export contains sufficient explicit structure.
- One small application with parsing, mapping, validation, persistence and rendering/editing modules.
- Next.js + TypeScript + Supabase/Postgres + Vercel only if early evidence shows this is the fastest safe path.
- Immutable source evidence alongside an editable working representation.
- Import outcomes: SUCCESS, COMPLETED_WITH_ISSUES, FAILED.
- One post-baseline improvement: source-linked Migration Review.
- Server-side transactional semantics for import and copy.
- Provenance for successful mappings as well as exceptions.

None of these becomes an OBSERVED_SOURCE_FACT or VERIFIED_TEST_RESULT merely because it appears in this file.

## UNRESOLVED

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

Its expected result must be established independently from the production importer and independently from any shared unverified extraction helper. Establish expectations by direct inspection of the original source plus raw physical inventory, and bind every expected semantic element to source coordinates and the source checksum.

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

Export B is an early validation control, not an assignment-mandated input and not a blocker to beginning work on A. Obtain B as early as practical; if unavailable, record the blocker and continue with A.

G1 exits only when:
- actual file/container type is established from bytes;
- raw physical inventory enumerates every sheet/stream/table or equivalent container unit, including hidden units where the format supports them;
- dimensions, populated regions, structural markers, formulas, hyperlinks, merges and other present structures are recorded before semantic exclusion;
- every populated field/region is then classified as meaningful content, structural metadata, confirmed irrelevant content, unsupported content, or UNRESOLVED;
- source hierarchy/order evidence is documented without inferring semantics from names alone.

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

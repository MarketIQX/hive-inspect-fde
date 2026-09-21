# Hive Importer Canonical State

Snapshot reviewed: 21 Sep 2026, 22:48 IST

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

Observation time for items below: 21 Sep 2026, 22:48 IST unless stated otherwise.

8. Repository exists at `C:\Users\marke\hive-inspect-fde`.
   Evidence: direct filesystem inspection on 21 Sep 2026.

9. The repository has meaningful staged documentation history, no implementation code yet, and no Git remote configured at the observation time.
   Evidence: direct `git log`, repository inspection and `git remote -v`.

10. No Spectora- or InterNACHI-named export is currently present under `C:\Users\marke`, and the Downloads listing contains no non-temporary spreadsheet export matching the required source.
    Evidence: direct filesystem search and Downloads listing on 21 Sep 2026.

11. The assignment PDF and execution playbook are present in the repository.
    Evidence: direct filesystem inspection.

12. No parser, final schema, editor, backend, deployment or AI-in-import decision has been verified.
    Evidence: repository inspection and `docs/DISCOVERY_STATUS.md`.

## VERIFIED_TEST_RESULT

1. Repository hygiene correction: a pairing code was discovered in the original local Git history during red-team review. Before any remote was configured, the current file was corrected and all local branch history was rewritten to remove the sensitive literal. Backup refs were deleted, reflogs expired, and garbage collection pruned unreachable objects.
   Evidence at 21 Sep 2026, 22:48 IST: working-tree search returned no occurrence; reachable-history search returned no occurrence; `git show-ref` exposed only `refs/heads/master`; `git fsck --full --no-reflogs --unreachable` returned no unreachable objects; `git count-objects -v` reported zero loose/garbage objects; `git remote -v` returned no remote.

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


## CANONICAL APPEND-ONLY GOVERNANCE — effective 21 Sep 2026, 23:23 IST

This section is additive. Nothing above it is deleted, rewritten, or silently corrected.

From this point forward, once text is entered into this canonical record it is immutable historical evidence. A later discovery, correction, decision change, failed test, or changed environment state must be appended as a new record. Earlier wording remains visible.

Required change discipline:
- never delete a prior canonical claim;
- never edit a prior canonical claim to make history look cleaner;
- never silently replace a decision;
- append the new evidence, reasoning, scope, and effective time;
- identify the earlier claim or decision being superseded;
- preserve why the earlier position was reasonable at the time;
- distinguish correction of fact from change of engineering judgment.

Canonical records must use two independent dimensions:

kind:
- REQUIREMENT
- SOURCE_FACT
- ENVIRONMENT_FACT
- ENGINEERING_DECISION
- TEST_RESULT

status:
- VERIFIED
- PROPOSED
- UNRESOLVED
- FAILED
- SUPERSEDED


Every new material canonical record should include, where applicable:
- record ID;
- kind;
- status;
- claim or decision;
- evidence;
- scope;
- observed_at / effective_at;
- acceptance criterion;
- supersedes / superseded_by;
- reasoning for any changed decision.

### Canonical supersession record CS-0001

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:23 IST
supersedes: the earlier use of evidence classes as a combined fact/status taxonomy.

Decision: claim type and claim status are separate dimensions. The earlier evidence-class list remains preserved above as historical project state, but new records use the orthogonal kind/status model defined here.

Reason: REQUIREMENT, SOURCE_FACT, ENVIRONMENT_FACT, ENGINEERING_DECISION and TEST_RESULT describe what a claim is. VERIFIED, PROPOSED, UNRESOLVED, FAILED and SUPERSEDED describe its state. Mixing these dimensions prevents precise lifecycle tracking.

### Canonical supersession record CS-0002

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:23 IST
supersedes: any reading of source-linked Migration Review as the already-selected post-baseline improvement.

Decision: source-linked Migration Review is a CANDIDATE improvement only. The final improvement will be selected after required Hive product exploration and the baseline expose a concrete customer problem worth solving.

Reason: the assignment requires the baseline first and then one improvement that matters to this customer. Choosing the improvement before product evidence would violate the project's evidence-before-decision rule.


### Canonical supersession record CS-0003

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:23 IST
supersedes: any gate wording that makes genuine Export B mandatory for completing Hive's required baseline.

Decision: Export B remains an early adversarial validation control, not an assignment-mandated input and not a blocker to beginning or completing work that can be honestly established from Export A. If B is obtained, exercise it before polish. If B cannot be obtained, record that limitation and do not claim broad same-format compatibility beyond demonstrated evidence.

Reason: Hive states that another same-format export may be tried; it does not require us to possess a second export. Our control must strengthen the assignment rather than create an invented requirement.

### Canonical supersession record CS-0004

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:23 IST
supersedes: the earlier singular wording under Immediate next evidence that named only Export A.

Decision: G0 has two mandatory evidence tracks that can proceed in parallel:
A. required Hive hands-on journey: sample inspection, publish report, try template-import workflow, capture dated observations;
B. genuine Spectora Export A: preserve original, record provenance, checksum, and inspect actual bytes.

Reason: both are explicit assignment requirements. Possessing Export A does not prove Hive exploration, and Hive exploration does not establish the source contract.

### Canonical supersession record CS-0005

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:23 IST

Decision: fidelity evaluation has two independent layers:
1. full-file physical coverage ledger, proving every populated physical source unit received an explicit disposition;
2. small manually established semantic reference fixture, proving expected hierarchy, order, content, rich-content semantics and corruption detection for the checked subset.

Reason: a small gold fixture can prove semantic correctness for its tested subset but cannot by itself prove that an entire source sheet, field, region or populated unit was not omitted before fixture construction.

### Canonical observation record CS-0006

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:23 IST

Claim: repository HEAD was 3e94402 on branch master; working tree was clean; no Git remote was configured. Six reachable local commits existed. Repository contents remained documentation/discovery only, with no importer implementation and no Spectora export present in the repository.

Evidence: direct git and filesystem inspection through the authenticated desktop connection.
Scope: local repository at C:\Users\marke\hive-inspect-fde only.


### Canonical engineering record CS-0007

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:28 IST

Decision: append-only canonical history will be protected by a minimal deterministic repository guard, not policy wording alone. The guard compares the working canonical file with the committed canonical file and permits only an unchanged file or content appended strictly after the prior end of file. Line-ending differences are normalized; existing words and ordering are not.

Reason: the operator explicitly requires every previously added canonical word to remain as written, while corrections and changed decisions must be appended with reasoning. A written convention without an executable check can silently fail.

Scope: docs/CANONICAL_STATE.md only. This control does not make factual claims true; it protects historical immutability.

Acceptance criterion: exact/no-change and append cases pass; edit, deletion, and middle-insertion cases fail; the real repository check passes before commit.

### Canonical observation record CS-0008

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:28 IST

Claim: no new .xlsx, .xls, .xlsm, .csv, .html, .htm or .zip file modified after 22:30 IST was found under the user's Downloads, Desktop, or Documents directories. Genuine Spectora Export A therefore remains unavailable to this repository at this observation time.

Evidence: targeted filesystem scan of those three user directories.
Scope: those directories and that time-bounded file-type scan only; it is not a claim that no source file exists anywhere on the machine.


### Canonical verification record CS-0009

kind: TEST_RESULT
status: VERIFIED
observed_at: 21 Sep 2026, 23:28 IST

Claim: the append-only verifier passed its defined self-tests. Exact content and strict append were accepted. Edit, deletion, and middle-insertion corruptions were rejected as intended. The verifier also accepted the current real canonical change as strict append-only.

Evidence: execution of `node scripts/verify-canonical-append-only.mjs --self-test` and `node scripts/verify-canonical-append-only.mjs`.
Acceptance criterion from CS-0007: MET.

### Canonical environment record CS-0010

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:28 IST

Claim: the local repository is configured with `core.hooksPath=.githooks`, and the committed pre-commit hook invokes the append-only verifier before a commit can proceed.

Reason for control: make accidental canonical rewrites fail before local commit rather than relying on memory or manual review.

Scope limitation: Git configuration is local environment state. A fresh clone does not inherit `core.hooksPath` automatically; the committed verifier and hook remain available, but enabling that hook in another clone is a separate environment action.


### Canonical control record CS-0011

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 21 Sep 2026, 23:31 IST

Decision: add a small root `CLAUDE.md` as the durable execution contract for Claude Code and later engineering sessions. It will point to the assignment, execution playbook, full append-only canonical record, current gate, and required verification command. It will not duplicate source facts or become a second source of truth.

Reason: long-running or multi-session coding work can begin with incomplete conversational context. A concise repository-level contract reduces stale-context execution while keeping canonical truth in one place.

Acceptance criterion: the file names the canonical record as authoritative, requires reading later supersession records before acting, forbids parser/schema implementation while G0 is incomplete, and requires the canonical append-only verifier before commit.

### Canonical limitation record CS-0012

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:31 IST

Claim: the local pre-commit guard protects normal local commits from accidental canonical rewrites, but it is not tamper-proof immutability. Git hooks can be bypassed or disabled, and Git history can be rewritten by an authorized operator.

Consequence: the project rule remains behavioral as well as technical: no `--no-verify`, no history rewrite, no canonical deletion/reordering. Git history plus the append-only verifier are evidence controls, not a cryptographic write-once store.

Reason for recording: describing the hook as absolute immutability would look stronger than the evidence supports.


### Canonical verification record CS-0013

kind: TEST_RESULT
status: VERIFIED
observed_at: 21 Sep 2026, 23:32 IST

Claim: the root Claude Code execution contract satisfies the acceptance criterion in CS-0011. It points to the canonical record, states append-only behavior, requires later supersession records to control interpretation, records G0 as incomplete, names genuine Spectora Export A as required evidence, requires the verifier command, and forbids bypassing the guard.

Evidence: deterministic content checks against `CLAUDE.md`; canonical append-only verifier also passed after this change.
Acceptance criterion from CS-0011: MET.

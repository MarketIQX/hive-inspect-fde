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


### Canonical observation record CS-0014

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:34 IST

Claim: a user-provided screenshot shows the Spectora public landing page open in Chrome. The visible page presents Login and Free Trial controls; no authenticated Spectora workspace, template, or exported source file is yet evidenced by that screenshot.

Evidence: user-provided screenshot in the active conversation at 23:34 IST.
Scope: screenshot-visible browser state only.

Consequence: G0-B has begun at the correct external product, but Export A remains UNRESOLVED until an actual Spectora HTML Text spreadsheet file is downloaded and inspected.


### Canonical observation record CS-0015

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:36 IST

Claim: the Spectora free-trial onboarding page reached by the operator shows a required Business Phone field rendered with a fixed +1 US-style mask, together with required Number of Inspectors, Years of Experience, and How did you hear about us fields. The operator does not have a US phone number.

Evidence: user-provided screenshot of `next.spectora.com/trial-boarding/v2/additional-details` in the active conversation.
Scope: visible onboarding UI state only. This does not prove Spectora categorically rejects international users or that support cannot enable an alternate signup path.

Consequence: G0-B is temporarily blocked at account onboarding. Do not fabricate a US phone number. Resolve the supported international signup path with Spectora or use another legitimate path provided by Spectora before continuing.


### Canonical observation record CS-0016

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 21 Sep 2026, 23:44 IST

Claim: Spectora's in-product support AI agent responded that the documented free-trial path is the standard website signup flow requiring a phone number and that its documentation does not list an alternative international signup path or special trial enablement process. The agent then asked for more detail about what happens when the operator enters a +91 number.

Evidence: user-provided support transcript in the active conversation.
Scope: this records what Spectora's AI support agent stated. It is not treated as a verified human support determination that international signup is unsupported.

Consequence: G0-B remains blocked. The next evidence-seeking action is to state the concrete UI failure (fixed +1 mask / inability to enter +91) and request either a supported international-number method or escalation to a human support agent.


### Canonical observation record CS-0017

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:43 IST

Claim: the operator has reached Spectora's authenticated trial welcome/onboarding page at `next.spectora.com/trial-boarding/v2`. The visible UI offers both `Get Started` and `Skip to dashboard`.

Evidence: user-provided screenshot in the active conversation.
Scope: screenshot-visible authenticated onboarding state only. This does not yet prove access to Templates, availability of a shareable sample template, or successful export capability.

Consequence: the previous signup blocker is no longer active for this session. The next evidence-seeking action is to enter the dashboard and locate the Templates area needed for Export A.


### Canonical source record CS-0018

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:46 IST

Claim: genuine Spectora Export A is now available as `Residential Template-2026-09-21.xls`, downloaded from the visible Spectora Residential Template export flow. The downloaded file is 55,439 bytes and has SHA-256 `93AE536E100DA2DB0F41E81467CF4889220DE8D0673DDFCC56954FB77FF39C83`.

Evidence: direct filesystem inspection and SHA-256 calculation of `C:\Users\marke\Downloads\Residential Template-2026-09-21.xls`, correlated with the user-provided Spectora download screenshot.
Scope: this exact file only.

### Canonical source record CS-0019

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:46 IST

Claim: despite the `.xls` filename suffix, Export A is not a legacy OLE/BIFF workbook. Its first bytes are ZIP magic `50 4B 03 04`, and its package content types identify an Open XML spreadsheet workbook with `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml`.

Evidence: direct byte inspection plus read-only inspection of `[Content_Types].xml` inside the downloaded package.

Consequence: production input detection must eventually be based on actual container evidence rather than trusting the filename extension alone. This is an observed source constraint, not yet a parser implementation decision.

### Canonical preservation record CS-0020

kind: TEST_RESULT
status: VERIFIED
observed_at: 22 Sep 2026, 08:47 IST

Claim: the original downloaded Export A was copied unchanged into `fixtures/source/Residential Template-2026-09-21.xls`. Source and repository copy both have SHA-256 `93AE536E100DA2DB0F41E81467CF4889220DE8D0673DDFCC56954FB77FF39C83` and length 55,439 bytes.

Reason: the assignment requires committing the shareable Spectora export used, while preservation evidence requires that the committed fixture not be silently rewritten during intake.

Acceptance criterion: source hash equals repository-copy hash. MET.


### Canonical source record CS-0021

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:55 IST

Claim: Export A contains one visible worksheet named `Sheet1` with physical dimension `A1:AP393`: 393 serialized rows, 42 columns, 7,480 serialized cells and 4,653 populated cells including the header row. The workbook contains no hidden rows, hidden columns, merged regions, formula cells, worksheet-native hyperlinks, or data validations.

Evidence: read-only OOXML package/XML inventory from the preserved repository copy. A secondary spreadsheet-reader path independently reported `Sheet1`, 393 rows and 42 columns and returned matching first and last source ranges.

Scope: Export A only. Absence in A does not establish absence from all same-format Spectora exports.

### Canonical source record CS-0022

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:55 IST

Claim: Export A has 42 named columns from `Section Name` through `Last Modified`. Every one of the 392 data rows populates Section Name, Item Name, Comment Name, Comment Type, Order, Answer Type, Default Estimate Min, Default Estimate Max, Uses, and Last Modified. Comment Text is populated on 309 rows; 198 of those values contain HTML-like markup.

Evidence: full-column physical inventory over all 392 data rows.

Important non-exclusion rule: columns with zero populated data cells in Export A remain observed format fields. Their lack of values in A does not justify deleting them from the source contract or claiming they never occur.

### Canonical source record CS-0023

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:55 IST

Claim: rich content in Export A is carried inside cell strings rather than worksheet-native hyperlink objects. HTML-like source values contain observed tags `p`, `a`, `strong`, and `div`; 43 anchor tags were observed, while worksheet-native hyperlink count is zero. No HTML `src` value was observed in A.

Consequence: a parser that reads only Excel hyperlink relationships would silently miss supported link-bearing source content. Rich-content handling must be evaluated against the cell string itself.

Scope limitation: this does not establish which HTML subset the destination editor can safely preserve; that remains an editor-round-trip evidence gate.


### Canonical source record CS-0024

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:57 IST

Claim: Export A contains 13 distinct Section Name values, 61 distinct Item Name values, and 69 distinct (Section Name, Item Name) pairs across 392 data rows. Each Section Name occupies one contiguous run of source rows, and each distinct section/item pair occupies one contiguous run.

Evidence: exhaustive grouping over all 392 source rows.

Interpretation boundary: contiguity and first-occurrence row order are observed physical facts. They do not by themselves prove destination identity rules or that names are stable identifiers.

### Canonical source record CS-0025

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:57 IST

Claim: names are not safe unique identities in Export A. Only 334 distinct Comment Name values exist across 392 rows, with 27 comment names repeated. More strongly, the exact tuple (Section Name, Item Name, Comment Name) is duplicated for `Fireplace / Damper Doors / Damper Inoperable` on source rows 263 and 264; those two rows have different Comment Text and different Order values.

Consequence: any importer that merges records solely by section/item/comment names would lose source content in this real export.

### Canonical source record CS-0026

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 08:57 IST

Claim: the source field `Order (w/i item)` cannot be treated as a globally unique row identity or as a complete linear row sequence. Within some section/item groups, order values repeat; 41 groups also contain gaps relative to a simple contiguous integer sequence. Source row order therefore carries physical ordering information not recoverable from the Order field alone.

Evidence: exhaustive order analysis across all 69 section/item groups.

Interpretation boundary: the eventual destination ordering rule remains a proposed engineering decision until product behavior and the source contract are reconciled.


### Canonical verification record CS-0027

kind: TEST_RESULT
status: VERIFIED
observed_at: 22 Sep 2026, 09:02 IST

Claim: the committed-style physical inventory is reproducible from the preserved Export A using `scripts/inventory-spectora-source.py`; a fresh run produced an identical evidence-file hash. The field-classification evidence covers exactly all 42 observed source columns, with no missing columns, no extra columns, and no header mismatches.

Evidence: deterministic rerun plus source-vs-classification coverage check.
Acceptance result: MET.

### Canonical source record CS-0028

kind: SOURCE_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 09:02 IST

Claim: a targeted scan of all Export A cell values found zero email-address-like values and zero US-style phone-number-like values.

Scope limitation: this is a narrow automated scan, not proof that no personally identifying information of any kind could exist. The source is still treated as shareable sample material only within the evidence actually observed.

### Canonical gate record CS-0029

kind: TEST_RESULT
status: VERIFIED
observed_at: 22 Sep 2026, 09:02 IST

Claim: the Export A source-characterization slice now satisfies the defined G1 evidence criteria for this file: actual container established from bytes; all package/sheet units inventoried; dimensions and populated regions recorded; formulas, hyperlinks, merges, hidden rows/columns and validations checked; all observed columns classified after inventory; hierarchy/identity/order evidence documented without treating names as identifiers.

Scope: Export A only.

Important gate boundary: the project does NOT advance past G0 yet because the assignment-mandated Hive hands-on journey remains unresolved. G1 evidence may be prepared in parallel, but production parser implementation and final destination schema remain blocked until G0 is completed.


### Canonical observation record CS-0030

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 09:15 IST

Claim: the operator has reached Hive Inspect free-trial signup step 2 of 2 at `dashboard.hiveinspect.com/signup?step=2`. The visible form includes Inspection Company Name, Phone Number with India (+91) country selection, State / Province, and an optional `Current Software` field explicitly labeled `helps us set up your import`.

Evidence: user-provided screenshot in the active conversation.
Scope: screenshot-visible onboarding state only. This does not yet prove successful account creation, dashboard access, sample inspection completion, report publication, or template-import behavior.

Consequence: selecting Spectora in the Current Software field is the evidence-aligned onboarding choice for this assignment because the required migration source is Spectora. The next step is to complete signup legitimately, then perform the assignment-mandated Hive hands-on journey before production parser/schema work.


### Canonical clarification record CS-0031

kind: ENGINEERING_DECISION
status: VERIFIED
effective_at: 22 Sep 2026, 09:22 IST
supersedes: the earlier vague instruction to "continue/finish signup".

Decision: on the currently observed Hive signup step 2 screen, after selecting `Spectora` in Current Software and accepting the Terms/Privacy checkbox if the operator agrees, the correct form-submission action is the blue `Get my 5 free reports` button at the bottom of the form.

Reason: the prior wording was insufficiently precise for the visible UI. The operator asked for exact next-click guidance. This clarification records the concrete control visible on the observed signup page rather than paraphrasing it.

Scope: the signup screen already observed in the active conversation. If the button label or page changes, that changed UI state must be observed before giving different click instructions.


### Canonical observation record CS-0032

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 09:23 IST

Claim: Hive signup submission succeeded to the point of email verification. The visible confirmation page states that a verification link has been sent and instructs the operator to open the Hive email, click the verification link, and then land in the dashboard with five free reports.

Evidence: user-provided screenshot in the active conversation.
Scope: screenshot-visible post-signup verification state only. This does not yet prove that the verification email was received, the verification link was successfully consumed, or dashboard access was granted.

Consequence: the next action is to open the Hive verification email and click its verification link. Do not use `Back to sign in` unless verification fails, and use resend only if the email is genuinely missing.


### Canonical observation record CS-0033

kind: ENVIRONMENT_FACT
status: VERIFIED
observed_at: 22 Sep 2026, 09:25 IST

Claim: the operator has successfully reached the authenticated Hive dashboard. The visible account is on the Free Trial with five reports remaining. The dashboard exposes `New Inspection`, `Inspections`, and `Templates` navigation. A business-profile card is present but offers `Maybe later`.

Evidence: user-provided screenshot in the active conversation.
Scope: screenshot-visible dashboard state only.

Decision consequence: do not enter the template-import workflow yet. The assignment explicitly orders the required hands-on journey as: run a sample inspection, publish a report, then try the template-import workflow. The next action is therefore `New Inspection`. The optional business-profile card may be deferred with `Maybe later` because it is not evidence required for G0.

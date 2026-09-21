# Discovery Status

Date: 21 Sep 2026

## Verified

- The Hive Inspect FDE assignment requires a web app that imports a Spectora HTML Text spreadsheet export, preserves text/hierarchy/order, makes unsupported/skipped content visible, supports required edits, independent copies, and real persistence.
- The assignment PDF and execution playbook are committed in this repository.
- No pre-existing Hive assignment repository was found under `C:\Users\marke` by filename search.
- No Spectora-named export was found under `C:\Users\marke`.
- Local toolchain: Node v24.15.0, npm 11.12.1, Git 2.54.0.
- This repository was initialized at `C:\Users\marke\hive-inspect-fde`.
- No production parser, schema, editor, backend, deployment, or AI-in-import decision is verified yet.

## Assumed / still unverified

- Actual Spectora export container and workbook structure.
- Hierarchy encoding and whether stable source identifiers exist.
- Meaningful source fields beyond section/item/comment text.
- Rich HTML structures and the supported editor subset.
- Actual export size and deployed upload-path constraints.
- Whether Next.js + Supabase is the fastest implementation stack for this deadline.
- A second genuine same-format export is available.
- Hands-on Hive product exploration has been completed.
- Extension status and deadline timezone.

## What was missed in the first plan

- A separate evaluator can share the importer's extraction blind spot.
- Coverage/counting is not the same as field fidelity, structural correctness, or usability.
- The editor is a second transformation pipeline and can corrupt a faithful import on save.
- Successful rows also need provenance if fidelity is to be inspectable.
- Import and copy need real atomic persistence, not a sequence of unrelated client writes.
- Failed saves/retries, complete reads, reviewer isolation, and import-time-vs-later-edit semantics need explicit behavior.
- The second genuine export should be exercised early.
- Deployment should be tested before final packaging.

## What looks right but is insufficient

- Equal source/imported counts.
- Retaining raw HTML while the editable representation loses meaning.
- A success toast before persistence is confirmed.
- A separate checker whose answer key came from the same parser/extractor.
- New child IDs without proving copy independence and latest-saved-state semantics.
- Passing local tests while the deployed journey fails.
- A second export passing and then claiming generic Spectora compatibility.
- An opaque MCP/pairing code without an identified issuer, scope, and authenticated response.

## Decisions currently defensible

- Start deterministic-first; add probabilistic mapping only after a demonstrated ambiguity and measurable benefit.
- Establish expected results from independently inspected source evidence.
- Test the evaluator with deliberate loss, duplication, reordering, wrong-parent and lost-link/text corruptions.
- Preserve immutable source evidence separately from the editable working representation.
- Apply HTML safety controls to import and edit paths.
- Make import/copy persistence atomic and test controlled failure.
- Keep the application small: parsing, mapping, validation, persistence, rendering/editing modules in one app unless evidence demands more.
- Build only one improvement after baseline: source-linked Migration Review.
- Use VERIFIED / PROPOSED / UNVERIFIED labels instead of unsupported confidence percentages.

## Immediate blocker

The genuine Spectora Export HTML Text file is not present. Source mapping and schema design are blocked until its bytes are inspected.

## MCP code boundary

The pairing code supplied in chat is not evidence of an authenticated MCP session by itself. Do not commit it. Do not use it until the issuing system/server and intended scope are identified.


## Discovery supersession addendum — 21 Sep 2026, 23:23 IST

The earlier three-label guidance is historical and is superseded by the append-only canonical kind/status model in `docs/CANONICAL_STATE.md`.

The earlier statement selecting source-linked Migration Review is also superseded: Migration Review is a candidate improvement until required Hive use plus the working baseline establish the customer problem worth improving.

G0 now has two parallel mandatory evidence tracks: required Hive hands-on exploration and genuine Spectora Export A acquisition/provenance. Neither substitutes for the other.

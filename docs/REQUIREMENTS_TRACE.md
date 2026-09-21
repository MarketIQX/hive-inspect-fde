# Hive FDE Requirements Trace

Snapshot: 21 Sep 2026

Purpose: map assignment requirements to the evidence that will prove them. This file does not add product requirements. It separates mandatory brief requirements, encouraged/optional items, and project-specific validation controls.

## Mandatory assignment requirements

| ID | Requirement | Source | Gate | Evidence target | Status |
| --- | --- | --- | --- | --- | --- |
| R1 | Use Hive hands-on before building: sample inspection, publish report, try template-import workflow | Assignment p1 | G0 | dated notes/screenshots + concise observations | UNRESOLVED |
| R2 | Use Spectora and export a shareable sample via Export to spreadsheet -> Export HTML Text | Assignment p1 | G0 | original Export A + provenance + checksum | UNRESOLVED |
| R3 | Commit the shareable Spectora export used | Assignment p1/p3 | Submission | tracked original input, no customer data | UNRESOLVED |
| R4 | Web app for desktop workflow | Assignment p2 | Architecture/Deploy | deployed desktop-usable application | UNRESOLVED |
| R5 | Import Spectora HTML-text export preserving text, hierarchy and ordering | Assignment p2 | G1-G7 | source contract + checked import outcome | UNRESOLVED |
| R6 | Skipped/unsupported content is visible; no silent drop/rewrite | Assignment p2 | G7 | explicit import outcomes/issues with provenance | UNRESOLVED |
| R7 | Edit section names, item names and comment text and save | Assignment p2 | G9 | fresh backend read after edit/reopen | UNRESOLVED |
| R8 | Duplicate a template; copy edits must not affect original | Assignment p2 | G9 | persisted copy-isolation test | UNRESOLVED |
| R9 | Real backend persistence survives closing/reopening | Assignment p2 | G6/G9 | server-backed write + fresh read | UNRESOLVED |
| R10 | Structured editable schema; not one opaque HTML blob | Assignment p2 | G2/G5 | schema rationale tied to observed source | UNRESOLVED |
| R11 | Explain formatting, links, rich content and limits; distinguish source-missing vs importer-unsupported | Assignment p2 | G1-G7 | source contract + editor round-trip + issue classification | UNRESOLVED |
| R12 | Work beyond exact committed template; Hive may test another same-format export | Assignment p2 | G7 | format-general rules + honest variation evidence | UNRESOLVED |
| R13 | Show preservation checks, saved edits, independent copies and at least one failure case | Assignment p2/p3 | G10/Video | automated/manual evidence + demo | UNRESOLVED |
| R14 | Baseline first, then one customer-relevant improvement | Assignment p2 | G10 | baseline GREEN before improvement + rationale | UNRESOLVED |
| R15 | Out of scope: reports, scheduling, payments, homeowner portal | Assignment p2 | All | absence from implementation/scope notes | CURRENT_SCOPE_GREEN |
| R16 | Public working URL; Vercel unless stack cannot reasonably run there | Assignment p2 | G6/G10 | fresh-session public access check | UNRESOLVED |
| R17 | Seed live app with an already imported template | Assignment p2 | G10 | fresh browser opens imported template | UNRESOLVED |
| R18 | Keep credentials out of repo | Assignment p3 | All | secret/history scan before remote/submission | CURRENT_SNAPSHOT_GREEN; RECHECK_REQUIRED |
| R19 | Understand/check AI-assisted work; include reusable AI artifacts actually created | Assignment p3 | Submission | NOTES/README + committed reusable artifacts if any | UNRESOLVED |
| R20 | Repo with meaningful history, README setup/DB/env instructions | Assignment p3 | Submission | repository review | PARTIAL |
| R21 | NOTES.md: cuts, supported input, limits, checks, time, credits | Assignment p3 | Submission | final NOTES review | PARTIAL |
| R22 | Walkthrough 8-10 min, max 12; screen, own voice, camera for intro | Assignment p3 | Submission | accessible video | UNRESOLVED |
| R23 | Video demonstrates import, saved edit, independent copy, repo, model, decisions, hard part/failure, Hive feedback | Assignment p3 | Submission | walkthrough checklist | UNRESOLVED |
| R24 | Use the stack you are fastest in | Assignment p2 | G5 | architecture decision justified by early working evidence, not preference alone | UNRESOLVED |
| R25 | Use shareable sample material with no real customer information | Assignment p1 | G0/Submission | source provenance review + fixture/screenshot review | UNRESOLVED |
| R26 | Record which Spectora template was used and where it came from | Assignment p1 | G0 | Export A provenance record | UNRESOLVED |
| R27 | Be ready to explain and adapt submitted code in a short live discussion | Assignment p3 | Submission | rehearse one bounded mapping change and protection checks | UNRESOLVED |

## Conditional assignment requirements

| ID | Trigger | Requirement if triggered | Evidence target | Status |
| --- | --- | --- | --- | --- |
| K1 | Login is added | Include reviewer access instructions | fresh-session login/access check | NOT_TRIGGERED |
| K2 | Repository is private | Provide reviewer repository access | reviewer access verification | NOT_TRIGGERED |
| K3 | Model is used for import mapping | Show malformed output, invented sections and dropped-content handling; validation and honest failures still apply | bounded failure evals on model path | NOT_TRIGGERED |
| K4 | Existing starter/library/open-source code is used | Credit what was used and explain contribution | README/NOTES attribution | PENDING_IMPLEMENTATION |
| K5 | Non-Vercel hosting is used | Explain why chosen stack cannot reasonably run on Vercel and provide working alternative URL | deployment note + live check | NOT_TRIGGERED |

## Encouraged or optional assignment items

| ID | Item | Classification | Current treatment |
| --- | --- | --- | --- |
| O1 | Explore Binsr and compare with Hive | Optional / highly encouraged | Do only after mandatory baseline if time permits; if skipped, explain the prioritization choice |
| O2 | Supabase | Encouraged, not mandatory | PROPOSED only if fastest safe backend |
| O3 | AI coding tools | Highly encouraged | Use with explicit verification; AI inside importer remains optional |
| O4 | Richer editor beyond required edits | Developer choice | Earn from source/editor experiment; do not overbuild |

## Project-specific validation controls

These are not Hive requirements. They are controls chosen to make the mandatory claims defensible.

| ID | Control | Why |
| --- | --- | --- |
| C1 | Obtain genuine Export B early | Challenge template-specific assumptions before polish |
| C2 | Raw physical inventory before semantic classification | Prevent shared extraction blind spots |
| C3 | Independently established canonical fixture | Prevent importer from grading itself |
| C4 | Deliberate corruption tests | Prove the evaluator detects loss/duplication/order/parent/link failures |
| C5 | Representative editor no-change + one-word round trip | Detect editor-induced migration damage |
| C6 | Controlled persistence failure | Prove no misleading partial import/copy |
| C7 | Source-linked Migration Review | One customer-facing improvement after baseline |
| C8 | Snapshot-scoped environment facts | Prevent canonical state from becoming silently stale |
| C9 | Pre-remote and pre-submission secret/history scan | Prevent committed sensitive literals or credentials |

## Advancement rule

A mandatory requirement is not complete because code exists. It becomes complete only when its listed evidence target has been observed on the actual implementation or source. Optional items cannot displace unresolved mandatory requirements.

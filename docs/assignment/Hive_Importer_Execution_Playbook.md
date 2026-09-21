**Hive Inspect template importer: execution playbook**

Prepared for AK Sharma | 21 September 2026

Objective: deliver a faithful, usable migration workflow that a reviewer can import into, edit, reopen and copy independently. Support each claim with evidence from the submitted source files, implementation and live application. Selection remains Hive's decision; this plan controls the quality of the submission.

The assignment and the revised POA have been reviewed. The actual Spectora export, project repository, hands-on product exploration and deployed implementation have not been verified in this review. No implementation test is represented here as already passing.

**Apply these published Anthropic principles.**

| Published guidance | Application to this assignment |
| --- | --- |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents): start with simple systems and increase complexity when outcomes justify it. | Use a deterministic mapping for an observed structured format. Keep one application with small modules. Add model inference only if a concrete need and measurable benefit establish its value. |
| [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): define success, use reference solutions, choose appropriate graders and check actual outcomes. | Hand-check a small expected import; validate the checker with good and deliberately incorrect results; inspect persisted and rendered output. |
| [Claude Code best practices](https://code.claude.com/docs/en/best-practices): explore, plan, implement and provide concrete verification. | Give Claude Code one bounded slice with the relevant source, expected result and runnable checks. Review the diff and application behavior before advancing. |

These are applications of the guidance. The stack, schema, transaction implementation, tests and Migration Review UI are project-specific engineering choices. The stage sequence below is not an official Anthropic framework.

**Changes to the revised POA.**

1. Obtain a second real export during discovery. Run it as soon as the first parser works, before extensive UI polish. If its failures inform fixes, describe it thereafter as a regression fixture, not an untouched holdout.
2. Pair failure verification with the feature being built. Parser rejection belongs with parsing; rollback belongs with persistence; failed-save behavior belongs with editing. The final review checks their integration.
3. Evaluate a candidate editor on representative source HTML before committing to it. Otherwise editor incompatibility can force late changes.
4. Independence means independently established expectations. It does not require a second production parser. Check the raw source scope as well: a fixture derived from an incomplete extraction can share that extraction's omission.
5. Keep source-linked Migration Review as the single improvement, but make its actions specific. Opening a warning must take the user to the affected content and a useful explanation.
6. Label migration comparisons as the state at import time. Later intentional user edits must not be misrepresented as migration damage or covered by a stale fidelity claim.
7. Retain the earlier requirements for public-demo access, complete reads, safe rendering, truthful save states and submission packaging. Their omission from a shorter revised plan does not resolve them.
8. Conclude each check at its agreed scope. Once it passes, advance. Reopen it only for changed code, new source evidence or a concrete failure.

**Step 0. Establish the delivery situation and project location.**

Owner: AK.

The stated deadline is 21 September 2026. If the submission cannot be completed by the applicable deadline and no extension is confirmed, request a specific new delivery date promptly. The brief offers an extension; acceptance of a particular new date still needs confirmation. Do not assume the deadline's timezone or an unlimited extension.

Identify the existing assignment repository and current branch if any. Record what is already built and preserve unrelated changes. If starting fresh, use one clearly named, separate project directory and repository. Do not mix this assignment with Anika, Nicole or another customer project.

Record the actual available work time. Allocate product exploration, the working baseline, verification, the one improvement, and recording within that budget. Revise estimates after inspecting the source. No hour estimate is a verified fact.

Done when: repository/build status, available time and deadline status are known. Necessary local discovery can continue while an extension response is pending.

**Step 1. Complete the required hands-on product exploration.**

Owner: AK, with assistance where an authenticated session and appropriate access are available.

Use Hive's trial with fictitious sample information. Run a sample inspection, publish its report, and try the template-import workflow. Record the actual sequence, date, a few useful screenshots and specific observations. Documentation or marketing pages alone do not establish completion.

Capture observations in this form: what I did; what I observed; the consequence for an inspector; one proposed improvement. Distinguish an observed issue from an untested hypothesis. Do not invent a complaint about Hive merely to fill the video segment.

Use Spectora as required. Binsr is optional and encouraged. If time permits, give it a short exploration budget before finalizing the design. Otherwise explain the decision to prioritize the required products and baseline. Do not introduce scheduling, payments, report writing or homeowner portals into the application being built.

Done when: the required Hive journey has been completed and there is evidence suitable for a short, specific product-feedback segment.

**Step 2. Obtain the actual inputs.**

Owner: AK.

In Spectora, load a shareable sample template, such as the suggested InterNACHI Residential template if available. Use Templates → My Templates → select template → three-dot menu → Export to spreadsheet → Export HTML Text → Download File. These steps are documented in [Spectora's export instructions](https://support.spectora.com/en/articles/2769896-how-to-export-a-template); follow the live interface if labels differ.

Obtain another genuinely different template using the same export mode. Preserve both original files unchanged. Record template name, source, export mode, date and file checksum. Commit the required shareable sample export to the repository. Keep real customer information out of fixtures, screenshots and video.

Call the files A and B in working notes. Use A for initial characterization and B for early validation. Do not assume the download is an XLSX workbook until the bytes establish the actual container format.

Done when: A is available and its provenance is recorded. Prefer obtaining B now. A blocker obtaining B should be recorded while work on A proceeds; it should not lead to a fabricated substitute described as genuine.

**Step 3. Write the source contract from observed evidence.**

Owner: Claude Code produces the inventory; AK reviews the important semantic decisions.

Inspect file type, size and encoding/container behavior. For workbook formats, enumerate all sheets, including hidden sheets, and identify which are meaningful to the template. Inspect headers, row conventions, merged/blank cells, repeated values, explicit identifiers and ordering. For delimited formats, inspect quoting, delimiters and multiline fields instead of assuming workbook features exist.

Inventory the observed HTML structures and relevant metadata. Examine representative first/last entries, duplicate labels, empty structures, long comments, links and unusual content that actually exists. Formulas and remote references, if present, require an explicit handling rule; do not evaluate them or infer missing content.

Create a compact mapping table:

| Source field or structural marker | Observed meaning | Destination | Conversion | Evidence/check |
| --- | --- | --- | --- | --- |
| Populate from the actual export | Do not infer from a name alone | Typed field, relationship or retained unsupported data | None or an explicit rule | File/sheet/row/cell and expected result |

Describe all exclusions from counting, such as confirmed headers and genuinely empty rows. Treat an unknown populated sheet or field as something requiring classification, not an automatic exclusion. Define what makes a valid same-format input and when interpretation must stop.

Do not infer export mode merely from the presence of HTML tags: a valid HTML Text export can contain plain-looking comments. Preserve source semantics without guessing missing hierarchy or categories.

Done when: every observed meaningful field and structural convention has a documented disposition, and unresolved issues are explicit. Finalize the schema only to this supported scope.

**Step 4. Establish the reference results and prove the checker.**

Owner: AK verifies expected results; Claude Code implements automated assertions.

Make a small fixture in the observed format, with a manually established expected tree. Include the relevant record shapes and relationships, repeated labels, ordering and representative rich content. Document any synthetic edge case as synthetic. Preserve the real exports for full-file integration checks.

The expected values must be checked against the original file, and selected source-product views where useful. Do not generate the answer key using the production importer, sanitizer or an unreviewed extraction that might already have skipped content. A raw inventory of sheets and populated fields helps check the scope of extraction; it is not by itself proof of semantic correctness.

The checker must pass the known-good result and reject deliberately incorrect results: remove a comment; add an unintended duplicate; swap two siblings; attach an item/comment to the wrong parent; remove meaningful text; change or remove a supported link. Also test permitted equivalent representations where applicable so the checker does not fail harmless HTML serialization differences.

Check coverage, text/field fidelity, structure, usability and exceptions separately. Counts alone cannot detect a dropped comment replaced with a duplicate. Never claim all source content survived merely because each row generated a record or warning.

Done when: known-good data passes, the specified corruptions fail, and expected values have identifiable source evidence. This earns confidence for the tested scope, not a universal guarantee for every future export.

**Step 5. Test editor compatibility and choose the minimal architecture.**

Owner: Claude Code, with AK inspecting the result.

Try the richest representative comment from A in a candidate editor. Import it, open it, save without changing it, reopen it, edit one word, save and reopen. Compare supported text, links, lists, formatting and any supported tables/media. Record any intentional conversion. A source archive does not compensate for an unusable working comment.

Select the smallest editor configuration that satisfies the supported contract. If a source element cannot be preserved operationally, give an explicit limitation and usable review path. Avoid exposing raw HTML as the primary workflow for a non-technical inspector.

Next.js/TypeScript, Supabase Postgres and Vercel remain proposed defaults if they are fastest for the developer. Keep parsing, mapping, validation, persistence and rendering as modules in one application. A layered drawing does not justify separate services.

For the data model, define identities, parents, sibling positions, editable fields, provenance, immutable source evidence and import outcomes. Use relational constraints for relationships where appropriate. Use flexible metadata only for fields whose variability warrants it. Shared immutable source evidence is compatible with independently editable copies; shared mutable children are not.

Done when: one editor round trip works on representative real content and the implementation structure has a documented reason. Broader editor checks continue during baseline verification.

**Step 6. Deploy a thin application with real persistence.**

Owner: Claude Code implements; AK supplies account configuration through the appropriate secure interface.

Create database initialization/migrations, environment-variable examples without secrets, and a small deployment that writes and reads a record from the real backend. Use Vercel as specified unless the brief's alternative-hosting exception actually applies. Verify the deployed app, not only a local build.

Choose a small reviewer access arrangement. A public URL can still require documented login. Prevent visitors from corrupting another reviewer's working data without building full organization management.

Measure actual input sizes and verify the deployed upload path against current platform limits. Define accepted file/resource bounds and useful failure messages. Verify the selected dependency versions and installation sources. Do not pick elaborate storage, queues or workers before a demonstrated need.

Done when: a real server-backed write survives reopening and a fresh read, required configuration is reproducible, and the reviewer access path works.

**Step 7. Implement the first complete import slice.**

Owner: Claude Code.

Read A, interpret the observed structure, produce the mapped objects and provenance, validate them, and commit the editable template in a real database transaction. Validate relationships and values as well as object shape. Avoid template-name checks, name-based identity merging, silent truncation and implicit ordering assumptions.

Represent successful, completed-with-issues and failed outcomes truthfully. Failure to establish required structure must not produce a complete-looking template. Unsupported optional content should remain visible with source evidence. Diagnostics must also be possible when no template was created.

Treat imported HTML as untrusted. Preserve original evidence and render only the supported safe representation. Display raw evidence as escaped text. Apply equivalent controls on later edits. Report material changes; do not claim that a transformation is harmless without checking its effect.

Verify a controlled write failure rolls back the template graph. If evidence is stored separately from the database, define what happens to orphaned source objects; do not imply a database transaction covers a separate storage service.

Run B as soon as A passes. Fix format-general causes and add regressions. If B exposes a genuine unsupported variation, document its exact scope rather than claiming general support. Run rejection checks now as well: invalid file, missing required structure and unsupported populated content.

Done when: A passes the checked reference/integration assertions, B has an honest recorded result, and failures do not leave an apparently complete partial template.

**Step 8. Complete saving and independent copying.**

Owner: Claude Code.

Implement section-name, item-name and comment-text edits. Distinguish unsaved, saving, saved and failed states. Show saved only after persistence succeeds. Retain the user's draft on failure. Choose a simple explicit rule for copying while changes remain unsaved.

Provide readable desktop navigation of the imported hierarchy, clear selected section/item labels and discoverable edit, save and copy controls. Prevent navigation from silently discarding a draft. Keep the baseline usable for a non-technical inspector; visual polish must not obscure the imported content or the state of their changes.

Run the editor round trip across the representative supported content. Reopen the app and fetch data from the backend. Verify the actual values returned; a toast, cached screen or local storage is insufficient evidence.

Copy the latest saved template and its editable descendants atomically with new identities. Verify names, order, comment content and attributes. Then edit the copy and reopen both templates. Check that the original remains unchanged. Check client-side state as well as database identities.

Handle duplicate clicks and retries deliberately. Distinguish repeating one request after an uncertain response from intentionally importing the same source file again. File hash equality alone should not silently block a legitimate second import.

Done when: all required edit types persist, the no-change/one-word editor tests pass, copies include current saved edits, and copy changes do not affect the original.

**Step 9. Add the single Migration Review improvement.**

Owner: Claude Code; AK checks clarity for an inspector.

Build this after the working baseline. Basic warning visibility is already required. The improvement is being able to inspect a meaningful exception quickly.

Each issue identifies the affected section/item/comment, the original excerpt, the imported result, what changed, its verified consequence and an available action. Review should navigate directly to the affected content. If there is no automatic repair, say what the user can inspect or edit manually.

Keep technical coordinates, checksum and raw diagnostics in details. Do not claim written guidance remains intact unless comparison supports that claim. Distinguish missing-from-export evidence, unsupported importer behavior and external content that is unavailable.

Label the comparison as an import-time snapshot. Link to the current editable content separately. Acknowledging an issue is not resolving it. A deliberate user edit after import must not retroactively change what the migration report says happened during import.

Done when: a reviewer can follow one real or clearly labeled synthetic issue from the summary to its source and understand the consequence.

**Step 10. Verify the actual deployed workflow and freeze scope.**

Owner: AK performs the user journey; Claude Code runs the relevant automated checks.

| Check | Evidence of completion |
| --- | --- |
| Source scope | Relevant sheets/fields and exclusions are enumerated against original inputs. |
| Reference import | Checked text, relationships, ordering and supported rich content match. |
| Checker reliability | Good output passes; specified deliberate corruptions fail. |
| Same-format variation | B is exercised without template-specific code; limitations are explicit. |
| Editor fidelity | No-change save and one-word edit preserve unrelated supported content. |
| Persistence | Required edits are present after reopening and a fresh server read. |
| Copies | Current saved content is duplicated; editable objects are independent. |
| Honest failures | Invalid structure and controlled database failure leave no misleading partial template. |
| Save/retry behavior | Failure does not claim success or discard the draft; repeated operation behavior is deliberate. |
| Complete reads | Stored and retrieved counts/content agree; ordering and pagination do not hide content. |
| Public review | Access instructions work and reviewers' working data has the intended scope. |
| Safe rendering | Import, editing and source-review views handle untrusted HTML according to the same documented policy. |

Run failures and resource-bound checks in the application you are building. Product exploration of Hive, Spectora and Binsr remains normal use of their supported workflows.

Record the actual command, outcome, tested source and final commit where relevant. Include a small amount of visual evidence. Do not build a separate evaluation platform or chase an arbitrary test-count target.

Stop adding features when the agreed baseline and one improvement pass. Re-run affected checks for subsequent fixes and do one final integrated journey on the submitted version.

**Step 11. Package the submission and rehearse the explanation.**

Owner: AK, assisted by Claude Code.

Keep the README short: purpose, setup, database initialization, environment-variable names, run/test commands, live URL and access instructions. Keep NOTES.md focused on supported input, known limits, what was cut and why, actual verification, approximate time spent, AI assistance and credited existing code.

Commit the shareable original export. Include reusable prompts, scripts or skills actually created during the work. Keep meaningful development commits as work occurs; do not fabricate a history afterward. Ensure the submitted code and live deployment correspond.

Seed the live application through the importer so it opens on a real imported template. Seeding must not overwrite saved reviewer edits on page load. For a private repository, confirm reviewer access.

Record roughly nine to ten minutes, never more than the assignment's twelve-minute maximum. Use your own voice and turn the camera on for the introduction. Test the microphone before recording. Publish the video using an accessible link and verify it without the uploader's session.

| Suggested time | What to show |
| --- | --- |
| 0:00-0:30 | Camera introduction and relevant experience. |
| 0:30-1:00 | Customer problem and the scope you chose. |
| 1:00-2:10 | Import the actual committed file on camera. |
| 2:10-3:20 | Required edits, confirmed save, close/reopen. |
| 3:20-4:10 | Duplicate, edit the copy, reopen the original. |
| 4:10-5:30 | Data model, mapping and independent preservation evidence. |
| 5:30-6:20 | The hardest genuine import problem and one failure case. |
| 6:20-7:10 | Second-export evidence and the limits of that evidence. |
| 7:10-8:00 | Migration Review and its customer benefit. |
| 8:00-9:00 | Repository layout, AI use, contributions and deliberate cuts. |
| 9:00-9:30 | Specific feedback from using Hive. |

Rehearse one small mapping change locally and explain which test changes and which existing checks protect the rest. Restore or properly incorporate the change before recording the final version. You must understand the submitted code well enough to adapt it in a live discussion.

Done when: repo, live URL, video and NOTES.md are accessible, consistent and complete. The live app opens on an imported template and the reviewer can repeat the demonstrated workflow.

**What was assumed, and what closes each assumption?**

| Assumption | Evidence needed |
| --- | --- |
| The export is an XLSX workbook with a particular hierarchy | Actual bytes, complete source inventory and observed mapping rules. |
| Names identify objects | Source identifiers or documented boundary rules; duplicate-label checks. |
| HTML preservation extends through editing | No-change and one-word round trips against representative source content. |
| The chosen stack is fastest | Existing familiarity plus an early successful deployment/persistence slice. |
| Second-export success proves broad compatibility | It proves behavior for that tested variation; retain honest limits. |
| Retained raw content is usable migration | Verify its availability and meaning in the working template separately. |
| An issue's consequence is harmless | A checked comparison or an explicitly stated uncertainty. |
| A connection code establishes an MCP session | Identified issuing app/server, supported connection mechanism and successful authenticated response. |
| Two focused days fit the work | Actual source complexity, current build state and remaining delivery budget. |

**What looks right but is not sufficient?**

- A separate evaluator whose answer key came from the same incomplete extraction.
- Matching counts despite a dropped record being replaced with a duplicate.
- Perfect import assertions before the editor, renderer or read API changes the result.
- A preserved archive coupled with an incomplete working template.
- A success toast without a successful database commit.
- New copy IDs with shared mutable client state or missing latest edits.
- A source-review screen that compares later user edits as if they were import damage.
- A plan containing many gates without a clear completion rule.
- Passing local tests while the submitted deployment fails the same journey.

**What you will defend in the interview.**

| Decision | Defensible explanation and evidence |
| --- | --- |
| Deterministic mapping | The observed structure supports explicit rules; checked fixtures establish their behavior. |
| Chosen schema | It preserves the observed identities, relationships, order and editable semantics. |
| Source retention | It makes exceptions traceable without confusing archived evidence with usable content. |
| Editor scope | Supported content survives both initial import and subsequent saving. |
| Atomic writes | Controlled failure leaves no partial editable template; independent copies preserve current saved state. |
| Migration Review | It helps the inspector understand a concrete migration exception and locate affected content. |
| Deliberate cuts | The required workflow, evidence and one useful improvement received the available time. |
| AI assistance | You supplied source evidence and explicit checks, reviewed the result and understand the implementation. |

**First bounded task for Claude Code.**

Use this after placing the assignment and actual export in the intended project workspace. Replace the bracketed paths with real locations; do not assume they exist.

```text
We are building the Hive Inspect FDE template-importer assignment.

Read [ASSIGNMENT_PDF_PATH] and [EXECUTION_PLAYBOOK_PATH].
Use the project at [PROJECT_DIRECTORY] and actual Spectora HTML Text
export at [EXPORT_A_PATH]. A second genuine export is at [EXPORT_B_PATH]
if available.

This task is discovery and a proposed implementation slice. Do not write
the production parser, create cloud resources or deploy during this task.

1. Inspect the project status, current branch, existing code, package
   scripts, migrations and available fixtures. Preserve unrelated changes.
   If no repository is present, report the exact location checked.
2. Verify the actual export type and inventory its complete relevant
   structure. Identify fields, boundaries, ordering, repeated labels,
   representative HTML and unknown content. Do not execute formulas or
   retrieve embedded remote references.
3. Produce an observed field-to-model mapping table with source locations,
   transformations and unresolved questions. Distinguish observations
   from proposed rules. Never infer template structure from names alone.
4. Propose a small manually checkable reference fixture and explicit
   expected results. State how those expectations will be verified
   independently of production mapping and sanitization.
5. Specify checker tests: known-good output passes; loss, duplication,
   wrong parent, changed sibling order and lost link/text fail. Allow only
   explicitly accepted equivalent representations.
6. Identify one representative source comment for the early editor
   round-trip experiment. Describe the smallest deployed persistence
   slice and the proposed transaction mechanism.
7. Return: verified observations, assumptions, blockers, proposed files
   to change next, exact checks for that next slice and evidence required
   to advance. Do not claim a check passed unless it actually ran.

If the real export or another input is missing, report that precise
limitation and finish the useful inspection that is possible. Do not
invent a source schema, claim product exploration happened, or ask for
credentials in chat. Keep connection codes and secrets out of the report.
```

After reviewing this discovery result, assign the next implementation slice with its accepted mapping and checks. Keep the routine compact: inspect evidence, implement the bounded change, verify, review and commit. Advance when the agreed evidence passes.


## Append-only execution addendum — 21 Sep 2026, 23:23 IST

This addendum does not delete or rewrite earlier playbook text.

1. Where Step 3 says every observed meaningful field must have a disposition, interpret completion through the later canonical rule: first inventory every populated physical unit, then classify it. Semantic importance is never a precondition for inventory.
2. Where Step 7's completion wording requires a recorded Export B result, that wording is superseded. Export B is an early adversarial validation control, not a Hive-mandated input. If unavailable, record the limitation and continue without making unsupported compatibility claims.
3. Where the playbook names Migration Review as the single improvement, treat it as a candidate until required Hive exploration and the working baseline establish that it addresses the strongest observed customer problem.
4. Canonical state is append-only. Changed facts or decisions are added with evidence, reasoning, time and supersession linkage; earlier wording remains intact.

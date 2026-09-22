# Claude Code execution contract

This repository is the Hive Inspect FDE template-importer assignment.

## Read before changing anything

1. Read `docs/assignment/Hive_Inspect_Template_Importer_Assignment.pdf`.
2. Read `docs/assignment/Hive_Importer_Execution_Playbook.md`.
3. Read all of `docs/CANONICAL_STATE.md`, including later supersession records.
4. Read `docs/REQUIREMENTS_TRACE.md`.

## Canonical rule

`docs/CANONICAL_STATE.md` is append-only historical evidence.
Never edit, delete, reorder, or silently correct existing canonical text.
If evidence or a decision changes, append a new dated record with reasoning and
a supersession link. Later supersession records control current interpretation.

Run before every commit:

```
node scripts/verify-canonical-append-only.mjs
```

Do not bypass the repository pre-commit guard or rewrite canonical history.

## Current execution gate

G0 is incomplete.
Do not implement the production parser, freeze the source schema, or claim
source-specific behavior until both required G0 tracks have evidence:
- required Hive hands-on journey;
- genuine Spectora Export A with provenance and checksum.

Every decision must be traceable to assignment evidence, observed source or
environment evidence, or a verified test. Mark unresolved facts as unresolved.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

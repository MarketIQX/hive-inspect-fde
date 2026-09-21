import fs from "node:fs";
import { execFileSync } from "node:child_process";

const canonicalPath = "docs/CANONICAL_STATE.md";

function normalize(text) {
  return text.replace(/\r\n/g, "\n");
}

export function isAppendOnly(base, candidate) {
  const prior = normalize(base);
  const current = normalize(candidate);
  return current === prior || current.startsWith(prior);
}

function selfTest() {
  const base = "alpha\nbeta\n";
  const cases = [
    ["exact", base, true],
    ["append", base + "gamma\n", true],
    ["edit", "alpha\nBETA\n", false],
    ["delete", "alpha\n", false],
    ["middle insertion", "alpha\ninserted\nbeta\n", false],
  ];

  let failed = false;
  for (const [name, candidate, expected] of cases) {
    const actual = isAppendOnly(base, candidate);
    const ok = actual === expected;
    console.log(`${ok ? "PASS" : "FAIL"} self-test: ${name}`);
    if (!ok) failed = true;
  }

  if (failed) process.exit(2);
}

if (process.argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

let committed;
try {
  committed = execFileSync(
    "git",
    ["show", `HEAD:${canonicalPath}`],
    { encoding: "utf8" },
  );
} catch {
  console.error("FAIL: cannot read committed canonical baseline from HEAD.");
  process.exit(2);
}

const working = fs.readFileSync(canonicalPath, "utf8");

if (!isAppendOnly(committed, working)) {
  console.error(
    "FAIL: canonical history was edited, deleted, reordered, or inserted into. " +
    "Only strict end-of-file append is permitted.",
  );
  process.exit(1);
}

console.log(
  normalize(working) === normalize(committed)
    ? "PASS: canonical file unchanged from HEAD."
    : "PASS: canonical change is strict append-only.",
);

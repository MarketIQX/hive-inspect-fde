import type { PersistedImportRun } from "@/lib/db/get-import-run";

const OUTCOME_STYLE: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800 border-green-300",
  COMPLETED_WITH_ISSUES: "bg-amber-100 text-amber-800 border-amber-300",
  FAILED: "bg-red-100 text-red-800 border-red-300",
};

// The chosen post-baseline improvement: import trust. A customer who has
// tuned a template for years needs to be able to check, at any later
// time (not just the moment of upload), exactly what survived and what
// didn't - and whether a gap is missing-from-export or not-yet-supported
// by this importer, per the assignment's explicit distinction.
export function PreservationReport({ run }: { run: PersistedImportRun }) {
  const byCode = new Map<string, number>();
  for (const w of run.warnings) byCode.set(w.code, (byCode.get(w.code) ?? 0) + 1);

  return (
    <details className="border rounded px-3 py-2">
      <summary className="cursor-pointer font-medium">
        Preservation report{" "}
        <span
          className={`ml-2 inline-block text-xs border rounded px-2 py-0.5 ${OUTCOME_STYLE[run.outcome]}`}
        >
          {run.outcome}
        </span>
      </summary>
      <div className="mt-3 space-y-3 text-sm">
        <p className="text-slate-600">
          Imported from <span className="font-mono">{run.sourceFileName}</span> (
          <span className="font-mono text-xs">{run.sourceFileSha256.slice(0, 16)}&hellip;</span>)
          on {new Date(run.createdAt).toLocaleString()}: {run.importedRowCount} of{" "}
          {run.sourceRowCount} source rows imported.
        </p>

        {run.warnings.length === 0 ? (
          <p className="text-green-700">
            No exceptions. Every populated source row and mapped field matched the source
            contract with no coercion, unmapped column, or hierarchy issue.
          </p>
        ) : (
          <>
            <p className="text-slate-600">
              {run.warnings.length} exception{run.warnings.length === 1 ? "" : "s"}, none silently
              dropped:
            </p>
            <ul className="text-xs text-slate-500 list-disc ml-4">
              {Array.from(byCode.entries()).map(([code, count]) => (
                <li key={code}>
                  {code}: {count}
                </li>
              ))}
            </ul>
            <ul className="space-y-1 border rounded divide-y">
              {run.warnings.map((w, idx) => (
                <li key={idx} className="px-3 py-2">
                  <span className="font-mono text-xs uppercase mr-2 text-slate-500">
                    {w.level}
                  </span>
                  <span className="font-mono text-xs mr-2">{w.code}</span>
                  {w.message}
                  {w.sourceRowNumber != null && (
                    <span className="text-slate-400"> (source row {w.sourceRowNumber})</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </details>
  );
}

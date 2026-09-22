"use client";

import { useState } from "react";
import Link from "next/link";
import type { ImportResult, ImportWarning } from "@/lib/types";

const OUTCOME_STYLE: Record<ImportResult["outcome"], string> = {
  SUCCESS: "bg-green-100 text-green-800 border-green-300",
  COMPLETED_WITH_ISSUES: "bg-amber-100 text-amber-800 border-amber-300",
  FAILED: "bg-red-100 text-red-800 border-red-300",
};

const WARNING_STYLE: Record<ImportWarning["level"], string> = {
  info: "text-slate-600",
  warning: "text-amber-700",
  error: "text-red-700",
};

export default function ImportPage() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      if (!res.ok) {
        setError(`Import request failed (HTTP ${res.status}).`);
        return;
      }
      const data: ImportResult = await res.json();
      setResult(data);
    } catch {
      setError("Import request failed to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  const itemCount = result?.sections.reduce((n, s) => n + s.items.length, 0) ?? 0;
  const commentCount =
    result?.sections.reduce(
      (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
      0
    ) ?? 0;

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Import a Spectora template</h1>
        <p className="text-slate-600 mt-1">
          Upload a Spectora &quot;Export HTML Text&quot; spreadsheet (.xls/.xlsx). Import is
          deterministic — no model is used to interpret structure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".xls,.xlsx"
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import"}
        </button>
      </form>

      {error && <p className="text-red-700">{error}</p>}

      {result && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div
              className={`border rounded px-4 py-3 inline-block font-medium ${OUTCOME_STYLE[result.outcome]}`}
            >
              {result.outcome}
            </div>
            {result.templateId && (
              <Link href={`/templates/${result.templateId}`} className="underline text-sm">
                View saved template &rarr;
              </Link>
            )}
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Source rows</dt>
              <dd className="text-lg font-semibold">{result.sourceRowCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Imported rows</dt>
              <dd className="text-lg font-semibold">{result.importedRowCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Sections</dt>
              <dd className="text-lg font-semibold">{result.sections.length}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Items</dt>
              <dd className="text-lg font-semibold">{itemCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Comments</dt>
              <dd className="text-lg font-semibold">{commentCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Warnings</dt>
              <dd className="text-lg font-semibold">{result.warnings.length}</dd>
            </div>
          </dl>

          {result.warnings.length > 0 && (
            <div>
              <h2 className="font-medium mb-2">
                Skipped / unsupported / unmapped content ({result.warnings.length})
              </h2>
              <ul className="space-y-1 text-sm border rounded divide-y">
                {result.warnings.map((w, idx) => (
                  <li key={idx} className={`px-3 py-2 ${WARNING_STYLE[w.level]}`}>
                    <span className="font-mono text-xs uppercase mr-2">{w.level}</span>
                    <span className="font-mono text-xs mr-2">{w.code}</span>
                    {w.message}
                    {w.sourceRowNumber != null && (
                      <span className="text-slate-400"> (source row {w.sourceRowNumber})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.sections.length > 0 && (
            <div>
              <h2 className="font-medium mb-2">Imported structure</h2>
              <div className="border rounded divide-y">
                {result.sections.map((section) => (
                  <details key={section.id} className="px-3 py-2">
                    <summary className="cursor-pointer font-medium">
                      {section.name}{" "}
                      <span className="text-slate-400 font-normal">
                        ({section.items.length} items)
                      </span>
                    </summary>
                    <ul className="mt-2 ml-4 space-y-2">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <div className="font-medium text-sm">
                            {item.name}{" "}
                            <span className="text-slate-400 font-normal">
                              ({item.comments.length} comments)
                            </span>
                          </div>
                          <ul className="ml-4 text-sm text-slate-600 list-disc">
                            {item.comments.map((c) => (
                              <li key={c.id}>{c.name}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

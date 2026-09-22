import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Hive Inspect FDE — Template Importer</h1>
      <p className="text-slate-600">
        Imports a Spectora &quot;Export HTML Text&quot; template spreadsheet into a
        structured, editable schema, preserving text, hierarchy, and ordering.
      </p>
      <div className="flex gap-3">
        <Link
          href="/import"
          className="inline-block bg-slate-900 text-white px-4 py-2 rounded"
        >
          Import a template
        </Link>
        <Link
          href="/templates"
          className="inline-block border px-4 py-2 rounded"
        >
          View templates
        </Link>
      </div>
    </main>
  );
}

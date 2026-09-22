import Link from "next/link";
import { listTemplates } from "@/lib/db/get-template";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Link href="/import" className="text-sm underline">
          Import another
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-slate-600">
          No templates yet. <Link href="/import" className="underline">Import one</Link>.
        </p>
      ) : (
        <ul className="divide-y border rounded">
          {templates.map((t) => (
            <li key={t.id} className="px-4 py-3">
              <Link href={`/templates/${t.id}`} className="font-medium hover:underline">
                {t.name}
              </Link>
              <div className="text-xs text-slate-500">
                Imported {new Date(t.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

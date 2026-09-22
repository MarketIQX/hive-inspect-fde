import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/db/get-template";

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  const itemCount = template.sections.reduce((n, s) => n + s.items.length, 0);
  const commentCount = template.sections.reduce(
    (n, s) => n + s.items.reduce((m, i) => m + i.comments.length, 0),
    0
  );

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <div>
        <Link href="/templates" className="text-sm underline">
          &larr; All templates
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{template.name}</h1>
        <p className="text-sm text-slate-500">
          From {template.sourceFileName} &middot; imported{" "}
          {new Date(template.createdAt).toLocaleString()} &middot; {template.sections.length}{" "}
          sections &middot; {itemCount} items &middot; {commentCount} comments
        </p>
      </div>

      <div className="border rounded divide-y">
        {template.sections.map((section) => (
          <details key={section.id} className="px-3 py-2">
            <summary className="cursor-pointer font-medium">
              {section.name}{" "}
              <span className="text-slate-400 font-normal">({section.items.length} items)</span>
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
    </main>
  );
}

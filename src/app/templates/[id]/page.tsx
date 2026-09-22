import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/db/get-template";
import { EditableTemplateView } from "./EditableTemplateView";
import { DuplicateButton } from "./DuplicateButton";

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
      <div className="flex items-start justify-between gap-4">
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
        <DuplicateButton templateId={template.id} />
      </div>

      <EditableTemplateView template={template} />
    </main>
  );
}

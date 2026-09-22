import { redirect } from "next/navigation";
import { getLatestImportedTemplateId } from "@/lib/db/get-template";

export const dynamic = "force-dynamic";

/**
 * The assignment asks the live URL to open on an already-imported template.
 * Prefer the most recent genuine import; fall back to the import workflow on
 * a fresh/empty database.
 */
export default async function Home() {
  const templateId = await getLatestImportedTemplateId();
  redirect(templateId ? `/templates/${templateId}` : "/import");
}

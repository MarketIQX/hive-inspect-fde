import { NextRequest, NextResponse } from "next/server";
import { duplicateTemplate } from "@/lib/db/duplicate-template";
import { getTemplate } from "@/lib/db/get-template";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await getTemplate(id);
  if (!source) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  const { templateId } = await duplicateTemplate(id, `${source.name} (copy)`);
  return NextResponse.json({ templateId });
}

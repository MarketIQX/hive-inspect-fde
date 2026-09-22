import { NextRequest, NextResponse } from "next/server";
import { updateCommentText } from "@/lib/db/update";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (typeof body.rawText !== "string") {
    return NextResponse.json({ error: "rawText must be a string" }, { status: 400 });
  }
  const found = await updateCommentText(id, body.rawText);
  if (!found) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

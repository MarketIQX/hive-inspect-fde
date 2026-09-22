import { NextRequest, NextResponse } from "next/server";
import { updateItemName } from "@/lib/db/update";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (typeof body.name !== "string" || body.name.trim() === "") {
    return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
  }
  const found = await updateItemName(id, body.name);
  if (!found) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

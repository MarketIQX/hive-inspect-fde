import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { importWorkbook } from "@/lib/importer/map-to-schema";
import { NotAWorkbookError, WorkbookStructureError } from "@/lib/importer/read-workbook";

export const runtime = "nodejs";

/**
 * Slice B3 scope: accept an upload, run the deterministic importer, and
 * return the full result (including warnings) for display. Nothing is
 * persisted yet — that lands with B4 (Supabase), which will extend this
 * same route rather than replace it.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file was uploaded under the 'file' field." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const sha256 = createHash("sha256").update(bytes).digest("hex").toUpperCase();

  try {
    const result = await importWorkbook(bytes, {
      sourceFileName: file.name,
      sourceFileSha256: sha256,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NotAWorkbookError || err instanceof WorkbookStructureError) {
      return NextResponse.json(
        {
          outcome: "FAILED",
          sections: [],
          warnings: [
            {
              level: "error",
              code: err instanceof NotAWorkbookError ? "NOT_A_WORKBOOK" : "WORKBOOK_STRUCTURE_ERROR",
              message: err.message,
            },
          ],
          sourceRowCount: 0,
          importedRowCount: 0,
          sourceFileName: file.name,
          sourceFileSha256: sha256,
          requiredHeaders: [],
          observedHeaders: [],
        },
        { status: 200 }
      );
    }
    throw err;
  }
}

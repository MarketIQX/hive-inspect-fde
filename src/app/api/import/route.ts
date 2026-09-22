import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { importWorkbook } from "@/lib/importer/map-to-schema";
import { NotAWorkbookError, WorkbookStructureError } from "@/lib/importer/read-workbook";
import { persistImport } from "@/lib/db/persist-import";

export const runtime = "nodejs";

/**
 * Accepts an upload, runs the deterministic importer, persists a
 * SUCCESS/COMPLETED_WITH_ISSUES result as a new template (real backend,
 * not browser storage), and returns the full result plus the new
 * template's id. A FAILED import has no content to persist — nothing is
 * written, matching "no misleading partial template."
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

    if (result.outcome === "FAILED") {
      return NextResponse.json(result);
    }

    const { templateId } = await persistImport(result, file.name.replace(/\.(xlsx?|XLSX?)$/, ""));
    return NextResponse.json({ ...result, templateId });
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

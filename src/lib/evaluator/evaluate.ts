import type { SourceSection } from "../types";

// Compares an importer-produced section tree against the independent
// reference manifest (scripts/build-reference-manifest.ts output). This
// file must never import from src/lib/importer/* — it only consumes the
// importer's already-produced data, so a bug shared between "what the
// importer does" and "what the evaluator expects" cannot hide a fault
// (CS-0005 two-layer fidelity rule).

export interface ReferenceComment {
  sourceRowNumber: number;
  name: string;
  rawText: string;
  commentType: string;
  category: string;
  options: string;
  answerType: string;
  defaultValue: string;
  defaultEstimateMin: string;
  defaultEstimateMax: string;
}
export interface ReferenceItem {
  name: string;
  comments: ReferenceComment[];
}
export interface ReferenceSection {
  name: string;
  items: ReferenceItem[];
}
export interface ReferenceManifest {
  sourceFileName: string;
  sourceFileSha256: string;
  sourceDataRowCount: number;
  sectionCount: number;
  itemCount: number;
  commentCount: number;
  sections: ReferenceSection[];
}

export type IssueCode =
  | "DROPPED_ROW"
  | "DUPLICATED_ROW"
  | "UNKNOWN_ROW"
  | "WRONG_PARENT"
  | "CHANGED_COMMENT_NAME"
  | "CHANGED_TEXT"
  | "SIBLING_REORDERED"
  | "SECTION_SEQUENCE_MISMATCH"
  | "ITEM_SEQUENCE_MISMATCH";

export interface EvaluationIssue {
  code: IssueCode;
  message: string;
  sourceRowNumber?: number;
}

export interface EvaluationReport {
  pass: boolean;
  issues: EvaluationIssue[];
  coverage: {
    referenceRowCount: number;
    importedRowCount: number;
  };
}

interface FlatRow {
  sourceRowNumber: number;
  sectionName: string;
  itemName: string;
  commentName: string;
  rawText: string;
}

function flattenReference(manifest: ReferenceManifest): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const section of manifest.sections) {
    for (const item of section.items) {
      for (const comment of item.comments) {
        rows.push({
          sourceRowNumber: comment.sourceRowNumber,
          sectionName: section.name,
          itemName: item.name,
          commentName: comment.name,
          rawText: comment.rawText ?? "",
        });
      }
    }
  }
  return rows;
}

function flattenImported(sections: SourceSection[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      for (const comment of item.comments) {
        rows.push({
          sourceRowNumber: comment.sourceRowNumber,
          sectionName: section.name,
          itemName: item.name,
          commentName: comment.name,
          rawText: comment.rawText ?? "",
        });
      }
    }
  }
  return rows;
}

export function evaluateImport(
  imported: SourceSection[],
  reference: ReferenceManifest
): EvaluationReport {
  const issues: EvaluationIssue[] = [];
  const refRows = flattenReference(reference);
  const impRows = flattenImported(imported);

  const refByRow = new Map<number, FlatRow>();
  for (const row of refRows) refByRow.set(row.sourceRowNumber, row);

  const impByRowCount = new Map<number, number>();
  for (const row of impRows) {
    impByRowCount.set(row.sourceRowNumber, (impByRowCount.get(row.sourceRowNumber) ?? 0) + 1);
  }

  // Dropped rows: in reference, absent from imported.
  for (const row of refRows) {
    if (!impByRowCount.has(row.sourceRowNumber)) {
      issues.push({
        code: "DROPPED_ROW",
        message: `Source row ${row.sourceRowNumber} ("${row.commentName}") is missing from the imported result.`,
        sourceRowNumber: row.sourceRowNumber,
      });
    }
  }

  // Duplicated / unknown rows.
  for (const [rowNumber, count] of impByRowCount.entries()) {
    if (count > 1) {
      issues.push({
        code: "DUPLICATED_ROW",
        message: `Source row ${rowNumber} appears ${count} times in the imported result; expected exactly once.`,
        sourceRowNumber: rowNumber,
      });
    }
    if (!refByRow.has(rowNumber)) {
      issues.push({
        code: "UNKNOWN_ROW",
        message: `Imported result contains source row ${rowNumber}, which does not exist in the reference manifest.`,
        sourceRowNumber: rowNumber,
      });
    }
  }

  // Field-level comparison for rows present in both.
  for (const impRow of impRows) {
    const refRow = refByRow.get(impRow.sourceRowNumber);
    if (!refRow) continue; // already reported as UNKNOWN_ROW
    if (refRow.sectionName !== impRow.sectionName || refRow.itemName !== impRow.itemName) {
      issues.push({
        code: "WRONG_PARENT",
        message: `Source row ${impRow.sourceRowNumber} expected parent "${refRow.sectionName} > ${refRow.itemName}" but imported result has "${impRow.sectionName} > ${impRow.itemName}".`,
        sourceRowNumber: impRow.sourceRowNumber,
      });
    }
    if (refRow.commentName !== impRow.commentName) {
      issues.push({
        code: "CHANGED_COMMENT_NAME",
        message: `Source row ${impRow.sourceRowNumber} expected comment name "${refRow.commentName}" but imported result has "${impRow.commentName}".`,
        sourceRowNumber: impRow.sourceRowNumber,
      });
    }
    if (refRow.rawText !== impRow.rawText) {
      issues.push({
        code: "CHANGED_TEXT",
        message: `Source row ${impRow.sourceRowNumber} ("${refRow.commentName}") raw text does not match the source byte-for-byte.`,
        sourceRowNumber: impRow.sourceRowNumber,
      });
    }
  }

  // Sibling ordering: within each imported item, source row numbers must be strictly increasing.
  for (const section of imported) {
    for (const item of section.items) {
      for (let i = 1; i < item.comments.length; i++) {
        if (item.comments[i].sourceRowNumber <= item.comments[i - 1].sourceRowNumber) {
          issues.push({
            code: "SIBLING_REORDERED",
            message: `Item "${section.name} > ${item.name}" has comments out of physical source order at position ${i} (row ${item.comments[i].sourceRowNumber} follows row ${item.comments[i - 1].sourceRowNumber}).`,
            sourceRowNumber: item.comments[i].sourceRowNumber,
          });
        }
      }
    }
  }

  // Coarse section/item sequence checks.
  const refSectionNames = reference.sections.map((s) => s.name);
  const impSectionNames = imported.map((s) => s.name);
  if (JSON.stringify(refSectionNames) !== JSON.stringify(impSectionNames)) {
    issues.push({
      code: "SECTION_SEQUENCE_MISMATCH",
      message: `Section name/order mismatch. Expected [${refSectionNames.join(", ")}], got [${impSectionNames.join(", ")}].`,
    });
  }
  for (const refSection of reference.sections) {
    const impSection = imported.find((s) => s.name === refSection.name);
    if (!impSection) continue; // already reported via SECTION_SEQUENCE_MISMATCH
    const refItemNames = refSection.items.map((i) => i.name);
    const impItemNames = impSection.items.map((i) => i.name);
    if (JSON.stringify(refItemNames) !== JSON.stringify(impItemNames)) {
      issues.push({
        code: "ITEM_SEQUENCE_MISMATCH",
        message: `Item name/order mismatch in section "${refSection.name}". Expected [${refItemNames.join(", ")}], got [${impItemNames.join(", ")}].`,
      });
    }
  }

  return {
    pass: issues.length === 0,
    issues,
    coverage: {
      referenceRowCount: refRows.length,
      importedRowCount: impRows.length,
    },
  };
}

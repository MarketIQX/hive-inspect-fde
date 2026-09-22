// Domain types shared by the importer, evaluator, and app layer.
// Mirrors docs/SOURCE_CONTRACT.md. Do not add fields here that the
// contract does not define; extend the contract first.

export type CommentType = "info" | "limit" | "defect";
export type Category = -1 | 0 | 1;
export type AnswerType =
  | "boolean"
  | "checkbox"
  | "date"
  | "number"
  | "range"
  | "text";

export interface DefaultPhoto {
  index: number;
  url: string | null;
  caption: string | null;
}

export interface SourceComment {
  /** Generated id; never derived from source names (CS-0025). */
  id: string;
  itemId: string;
  name: string;
  rawText: string | null;
  commentType: CommentType | null;
  commentTypeRaw: string | null;
  category: Category | null;
  categoryRaw: string | null;
  options: string[] | null;
  optionsRaw: string | null;
  unitOptions: string[] | null;
  unitOptionsRaw: string | null;
  recommendation: string | null;
  sourceOrderHint: number | null;
  answerType: AnswerType | null;
  answerTypeRaw: string | null;
  defaultValue: string | null;
  defaultValue2: string | null;
  defaultUnitType: string | null;
  defaultLocation: string | null;
  defaultEstimateMin: number | null;
  defaultEstimateMinRaw: string | null;
  defaultEstimateMax: number | null;
  defaultEstimateMaxRaw: string | null;
  locked: string | null;
  simpleFormat: string | null;
  disablePhotos: string | null;
  usesCount: number | null;
  usesCountRaw: string | null;
  defaultPhotos: DefaultPhoto[];
  sourceLastModified: string | null;
  unmappedSourceFields: Record<string, string>;
  /** Physical order within its (section, item) group; the ordering oracle. */
  sourceRowNumber: number;
  sourceRowOrdinal: number;
}

export interface SourceItem {
  id: string;
  sectionId: string;
  name: string;
  ordinal: number;
  comments: SourceComment[];
}

export interface SourceSection {
  id: string;
  name: string;
  ordinal: number;
  items: SourceItem[];
}

export interface ImportWarning {
  level: "info" | "warning" | "error";
  code: string;
  message: string;
  sourceRowNumber?: number;
  column?: string;
}

export type ImportOutcome = "SUCCESS" | "COMPLETED_WITH_ISSUES" | "FAILED";

export interface ImportResult {
  outcome: ImportOutcome;
  /** Set only when a new template was actually persisted (not on FAILED). */
  templateId?: string;
  sections: SourceSection[];
  warnings: ImportWarning[];
  sourceRowCount: number;
  importedRowCount: number;
  sourceFileName: string;
  sourceFileSha256: string;
  requiredHeaders: string[];
  observedHeaders: string[];
}

export interface Template {
  id: string;
  name: string;
  sourceFileName: string;
  sourceFileSha256: string;
  createdAt: string;
  sections: SourceSection[];
}

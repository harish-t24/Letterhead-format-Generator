export interface DatasetRow {
  id: string;
  templateId: string;
  /** column name -> cell value, keyed by placeholder name e.g. { name: "John", id: "1042" } */
  data: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  /** Set whenever this row's data is actually rendered into a document
   *  (preview, single export, or bulk export) -- lets you see which rows
   *  have been used before and when. */
  lastUsedAt: string | null;
}

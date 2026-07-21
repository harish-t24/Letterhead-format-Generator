export interface DatasetRow {
  id: string;
  templateId: string;
  data: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export interface DatasetSummary {
  templateId: string;
  datasetName: string;
  templateName: string;
  recordCount: number;
  createdAt: string;
  lastUpdatedAt: string | null;
}

export interface BulkCsvResult {
  createdCount: number;
  matchedColumns: string[];
  unmatchedCsvColumns: string[];
  missingPlaceholders: string[];
  rows: DatasetRow[];
}

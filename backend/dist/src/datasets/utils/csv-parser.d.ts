export interface CsvParseResult {
    rows: Record<string, string>[];
    matchedColumns: string[];
    unmatchedCsvColumns: string[];
    missingPlaceholders: string[];
}
export declare function parseCsvForTemplate(csvText: string, placeholders: string[]): CsvParseResult;

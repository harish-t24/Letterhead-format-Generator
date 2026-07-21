import { parse } from 'csv-parse/sync';

export interface CsvParseResult {
  rows: Record<string, string>[];
  matchedColumns: string[];
  unmatchedCsvColumns: string[];
  missingPlaceholders: string[];
}

/**
 * Parses an uploaded CSV against a template's known placeholders.
 * Column matching is case-insensitive and trims whitespace, so a CSV
 * header of " Name " matches a template placeholder "name".
 *
 * Extra CSV columns that don't match any placeholder are ignored (and
 * reported back so the UI can warn about them); placeholders with no
 * matching CSV column are left as empty strings for every row.
 */
export function parseCsvForTemplate(
  csvText: string,
  placeholders: string[],
): CsvParseResult {
  const records: Record<string, string>[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const placeholderByLower = new Map(placeholders.map((p) => [p.toLowerCase(), p]));
  const csvColumns = records.length > 0 ? Object.keys(records[0]) : [];

  const matchedColumns: string[] = [];
  const unmatchedCsvColumns: string[] = [];

  for (const col of csvColumns) {
    if (placeholderByLower.has(col.trim().toLowerCase())) {
      matchedColumns.push(col);
    } else {
      unmatchedCsvColumns.push(col);
    }
  }

  const matchedPlaceholderNames = new Set(
    matchedColumns.map((c) => placeholderByLower.get(c.trim().toLowerCase())!),
  );
  const missingPlaceholders = placeholders.filter((p) => !matchedPlaceholderNames.has(p));

  const rows: Record<string, string>[] = records.map((record) => {
    const row: Record<string, string> = {};
    for (const placeholder of placeholders) {
      const csvCol = matchedColumns.find(
        (c) => c.trim().toLowerCase() === placeholder.toLowerCase(),
      );
      row[placeholder] = csvCol ? String(record[csvCol] ?? '') : '';
    }
    return row;
  });

  return { rows, matchedColumns, unmatchedCsvColumns, missingPlaceholders };
}

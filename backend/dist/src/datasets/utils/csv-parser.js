"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsvForTemplate = parseCsvForTemplate;
const sync_1 = require("csv-parse/sync");
function parseCsvForTemplate(csvText, placeholders) {
    const records = (0, sync_1.parse)(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
    const placeholderByLower = new Map(placeholders.map((p) => [p.toLowerCase(), p]));
    const csvColumns = records.length > 0 ? Object.keys(records[0]) : [];
    const matchedColumns = [];
    const unmatchedCsvColumns = [];
    for (const col of csvColumns) {
        if (placeholderByLower.has(col.trim().toLowerCase())) {
            matchedColumns.push(col);
        }
        else {
            unmatchedCsvColumns.push(col);
        }
    }
    const matchedPlaceholderNames = new Set(matchedColumns.map((c) => placeholderByLower.get(c.trim().toLowerCase())));
    const missingPlaceholders = placeholders.filter((p) => !matchedPlaceholderNames.has(p));
    const rows = records.map((record) => {
        const row = {};
        for (const placeholder of placeholders) {
            const csvCol = matchedColumns.find((c) => c.trim().toLowerCase() === placeholder.toLowerCase());
            row[placeholder] = csvCol ? String(record[csvCol] ?? '') : '';
        }
        return row;
    });
    return { rows, matchedColumns, unmatchedCsvColumns, missingPlaceholders };
}
//# sourceMappingURL=csv-parser.js.map
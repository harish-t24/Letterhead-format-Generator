"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = require("../src/datasets/utils/csv-parser");
const csv = `Name, ID , Extra Column
Priya Raman,5001,ignored
Arjun Mehta,5002,ignored2`;
const result = (0, csv_parser_1.parseCsvForTemplate)(csv, ['name', 'id', 'amount']);
console.log(JSON.stringify(result, null, 2));
//# sourceMappingURL=test-csv-parser.js.map
import { parseCsvForTemplate } from '../src/datasets/utils/csv-parser';

const csv = `Name, ID , Extra Column
Priya Raman,5001,ignored
Arjun Mehta,5002,ignored2`;

const result = parseCsvForTemplate(csv, ['name', 'id', 'amount']);
console.log(JSON.stringify(result, null, 2));

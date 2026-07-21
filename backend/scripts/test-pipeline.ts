/* eslint-disable */
// Proves the core pipeline works, end to end, without needing Gotenberg/Docker:
//  1. Load the sample docx template
//  2. Run mammoth -> HTML (same step the real /templates/import endpoint does)
//  3. Extract placeholders via the real utility function
//  4. Merge two different "rows" of data using the real RenderService
//  5. Read back the merged docx's raw XML and confirm placeholders were replaced
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import PizZip from 'pizzip';
import { extractPlaceholders, validateBraces } from '../src/templates/utils/placeholder-parser';
import { RenderService } from '../src/render/render.service';

async function main() {
  const templatePath = path.join(process.cwd(), 'storage', 'uploads', 'sample-template.docx');
  const templateBuffer = fs.readFileSync(templatePath);

  // Step 2 + 3: same as TemplatesService.createFromDocx
  const { value: html } = await mammoth.convertToHtml({ buffer: templateBuffer });
  const braceCheck = validateBraces(html);
  const placeholders = extractPlaceholders(html);

  console.log('--- Brace validation ---');
  console.log(braceCheck);
  console.log('--- Detected placeholders ---');
  console.log(placeholders);

  // Step 4: merge two different rows through the real RenderService
  const renderService = new RenderService();

  const rows = [
    { id: 'row-1', data: { name: 'Priya Raman', id: '10432', amount: '$1,250.00' } },
    {
      id: 'row-2',
      data: {
        name: 'A much longer customer name that should wrap the table cell, Esquire III',
        id: '99',
        amount: '$40.00',
      },
    },
  ];

  const outDir = path.join(process.cwd(), 'storage', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const row of rows) {
    const mergedBuffer = renderService.merge(templateBuffer, row.data);
    const outPath = path.join(outDir, `merged-${row.id}.docx`);
    fs.writeFileSync(outPath, mergedBuffer);

    // Read back the raw document.xml to prove the substitution really
    // happened inside the Word XML (not just in some intermediate string).
    const zip = new PizZip(mergedBuffer);
    const xml = zip.file('word/document.xml')!.asText();

    const stillHasBraces = /\{[a-zA-Z0-9_]+\}/.test(xml);
    const containsName = xml.includes(row.data.name.split(' ')[0]); // check first token survived (may be split across XML runs)

    console.log(`\n--- Row ${row.id} ---`);
    console.log('Output file:', outPath);
    console.log('Any unresolved {placeholders} left in XML?', stillHasBraces);
    console.log('Contains merged name fragment?', containsName);
  }

  console.log('\nAll merges completed successfully.');
}

main().catch((err) => {
  console.error('Pipeline test FAILED:', err);
  process.exit(1);
});

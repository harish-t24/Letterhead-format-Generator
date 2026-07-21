/* eslint-disable */
import HTMLtoDOCX from 'html-to-docx';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import PizZip from 'pizzip';
import { RenderService } from '../src/render/render.service';
import { extractPlaceholders } from '../src/templates/utils/placeholder-parser';

async function main() {
  const headerHtml = `<p style="text-align:center;"><strong>SHINECRAFT INDUSTRIES</strong><br/>123 Business Ave, Suite 100</p>`;
  const footerHtml = `<p style="text-align:center;font-size:10px;">Confidential — Shinecraft Industries</p>`;

  // Body deliberately splits "{name}" across a bold tag boundary, and
  // includes a bullet list + numbered list, to stress-test both the
  // docxtemplater run-splitting tolerance AND list preservation.
  const bodyHtml = `
    <p>Dear <strong>{name}</strong>,</p>
    <p>Your account <em>{id}</em> has the following updates:</p>
    <ul>
      <li>First bullet point</li>
      <li>Second bullet point</li>
    </ul>
    <ol>
      <li>First numbered item</li>
      <li>Second numbered item</li>
    </ol>
    <p>Total due: {amount}</p>
  `;

  const buffer = await HTMLtoDOCX(bodyHtml, headerHtml, {
    header: true,
    footer: true,
    pageNumber: true,
    margins: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 720, footer: 720 },
  }, footerHtml);

  const outDir = path.join(process.cwd(), 'storage', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'html-to-docx-test.docx');
  fs.writeFileSync(outPath, buffer as Buffer);
  console.log('Generated docx at', outPath);

  // Step 1: mammoth extraction + placeholder detection (same as TemplatesService)
  const { value: html } = await mammoth.convertToHtml({ buffer: buffer as Buffer });
  const placeholders = extractPlaceholders(html);
  console.log('\n--- Detected placeholders ---');
  console.log(placeholders);
  console.log('\n--- Mammoth HTML (body only, mammoth does not extract header/footer) ---');
  console.log(html);

  // Step 2: docxtemplater merge (the real RenderService)
  const renderService = new RenderService();
  const merged = renderService.merge(buffer as Buffer, {
    name: 'Kavya Sundaram',
    id: 'SC-9911',
    amount: '$2,340.00',
  });
  fs.writeFileSync(path.join(outDir, 'html-to-docx-test-merged.docx'), merged);

  // Step 3: verify via raw XML that placeholders resolved AND list markup survived
  const zip = new PizZip(merged);
  const xml = zip.file('word/document.xml')!.asText();
  console.log('\n--- Merge verification ---');
  console.log('Unresolved braces left?', /\{[a-zA-Z0-9_]+\}/.test(xml));
  console.log('Contains merged name?', xml.includes('Kavya'));
  console.log('Contains numbering reference (numPr, i.e. lists survived)?', xml.includes('numPr'));

  // Step 4: confirm header/footer XML parts exist in the ORIGINAL (unmerged)
  // file -- proving html-to-docx really produced real Word headers/footers,
  // not just text stuck at the top of the body.
  const origZip = new PizZip(buffer as Buffer);
  const fileNames = Object.keys(origZip.files);
  const headerFiles = fileNames.filter((f) => f.startsWith('word/header'));
  const footerFiles = fileNames.filter((f) => f.startsWith('word/footer'));
  console.log('\n--- Header/footer XML parts in generated docx ---');
  console.log('Header files:', headerFiles);
  console.log('Footer files:', footerFiles);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

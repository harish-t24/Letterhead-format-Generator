/* eslint-disable */
// Generates storage/uploads/sample-template.docx containing a letter
// with {name}, {id}, {amount} placeholders -- used to prove the
// docxtemplater merge pipeline works end-to-end without needing Word.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'Invoice Confirmation', bold: true, size: 32 })],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun('Dear {name},'),
          ],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun(
              'This confirms your account (ID: {id}) has been charged an amount of {amount}. ' +
                'Thank you for your continued business with us.',
            ),
          ],
        }),
        new Paragraph({ text: '' }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Field')] }),
                new TableCell({ children: [new Paragraph('Value')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Name')] }),
                new TableCell({ children: [new Paragraph('{name}')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Customer ID')] }),
                new TableCell({ children: [new Paragraph('{id}')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Amount')] }),
                new TableCell({ children: [new Paragraph('{amount}')] }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [new TextRun('Regards,')],
        }),
        new Paragraph({
          children: [new TextRun('The Billing Team')],
        }),
      ],
    },
  ],
});

const outDir = path.join(process.cwd(), 'storage', 'uploads');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(outDir, 'sample-template.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Sample template written to', outPath);
});

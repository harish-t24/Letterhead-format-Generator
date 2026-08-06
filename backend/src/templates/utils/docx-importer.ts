import * as mammoth from 'mammoth';
import PizZip from 'pizzip';
import { extractPlaceholdersFromDocx } from './placeholder-parser';

export interface DocxImportResult {
  html: string;
  bodyHtml: string;
  headerHtml?: string;
  footerHtml?: string;
  placeholders: string[];
}

/**
 * Converts inline images in Mammoth to Base64 Data URIs
 */
const convertImageInline = mammoth.images.imgElement((element) => {
  return element.read('base64').then((imageBuffer) => {
    return {
      src: `data:${element.contentType};base64,${imageBuffer}`,
    };
  });
});

/**
 * Expanded Mammoth style mapping to preserve source document formatting
 */
const fullStyleMap = [
  "p[style-name='Header'] => h1:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "r[style-name='Strong'] => strong",
  "u => u",
  "strike => del",
  "table => table.table",
];

/**
 * Converts a header or footer XML part from a DOCX ZIP into clean HTML with base64 embedded images.
 */
async function extractPartHtml(zip: PizZip, partXmlPath: string, relsPath: string): Promise<string | undefined> {
  try {
    const xmlFile = zip.file(partXmlPath);
    if (!xmlFile) return undefined;

    const partXml = xmlFile.asText();
    if (!partXml || !partXml.trim()) return undefined;

    // Create a cloned zip that replaces document.xml with this header/footer xml
    const partZip = new PizZip(zip.generate({ type: 'nodebuffer' }));
    partZip.file('word/document.xml', partXml);

    const relsFile = zip.file(relsPath);
    if (relsFile) {
      partZip.file('word/_rels/document.xml.rels', relsFile.asText());
    }

    const partBuffer = partZip.generate({ type: 'nodebuffer' });
    const { value: html } = await (mammoth as any).convertToHtml({
      buffer: partBuffer,
      styleMap: fullStyleMap,
      convertImage: convertImageInline,
    });

    return html && html.trim() ? html.trim() : undefined;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to parse ${partXmlPath} from docx:`, err);
    return undefined;
  }
}

/**
 * Imports a Word (.docx) document, preserving:
 * - Embedded images (converted to base64 Data URIs)
 * - Header & Footer XML parts
 * - Source document formatting (tables, headings, underlines, bold, colors)
 * - All curly brace placeholders {placeholder}
 */
export async function parseDocxFull(docxBuffer: Buffer): Promise<DocxImportResult> {
  const zip = new PizZip(docxBuffer);

  // 1. Convert main document body
  const { value: bodyHtml } = await (mammoth as any).convertToHtml({
    buffer: docxBuffer,
    styleMap: fullStyleMap,
    convertImage: convertImageInline,
  });

  // 2. Extract Header (header1.xml, header2.xml, header3.xml)
  const headerPath = Object.keys(zip.files).find((f) => /^word\/header\d+\.xml$/i.test(f));
  let headerHtml: string | undefined;
  if (headerPath) {
    const headerFileName = headerPath.split('/').pop() || 'header1.xml';
    const relsPath = `word/_rels/${headerFileName}.rels`;
    headerHtml = await extractPartHtml(zip, headerPath, relsPath);
  }

  // 3. Extract Footer (footer1.xml, footer2.xml, footer3.xml)
  const footerPath = Object.keys(zip.files).find((f) => /^word\/footer\d+\.xml$/i.test(f));
  let footerHtml: string | undefined;
  if (footerPath) {
    const footerFileName = footerPath.split('/').pop() || 'footer1.xml';
    const relsPath = `word/_rels/${footerFileName}.rels`;
    footerHtml = await extractPartHtml(zip, footerPath, relsPath);
  }

  // 4. Extract all placeholders from full DOCX package
  const placeholders = extractPlaceholdersFromDocx(docxBuffer);

  return {
    html: bodyHtml,
    bodyHtml,
    headerHtml,
    footerHtml,
    placeholders,
  };
}

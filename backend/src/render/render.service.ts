import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

/**
 * Merges row data into a DOCX template's real Word XML using
 * docxtemplater. Because this edits the actual document structure
 * (not an image or flattened text layer), every font, style, table
 * width, and spacing rule from the original template survives untouched.
 *
 * This also gives you the "auto-resize if text is longer" behavior for
 * free: Word/LibreOffice's own paragraph and table-row flow rules kick
 * in when the replaced text is longer than the placeholder was, growing
 * the row/paragraph height and pushing later content down.
 */
@Injectable()
export class RenderService {
  private readonly logger = new Logger(RenderService.name);

  private sanitizeDocxBraces(docxBuffer: Buffer): Buffer {
    try {
      const zip = new PizZip(docxBuffer);
      const files = [
        'word/document.xml',
        'word/header1.xml',
        'word/header2.xml',
        'word/header3.xml',
        'word/footer1.xml',
        'word/footer2.xml',
        'word/footer3.xml',
      ];

      for (const fileName of files) {
        if (!zip.files[fileName]) continue;
        let xml = zip.files[fileName].asText();

        // Fix typos like {placeholder) -> {placeholder}
        xml = xml.replace(/\{([a-zA-Z0-9_]+)\)/g, '{$1}');

        // Escape any '{' that is NOT part of a valid complete placeholder tag {name}
        xml = xml.replace(/\{(?![a-zA-Z0-9_]+\})/g, '&#123;');

        zip.file(fileName, xml);
      }

      return zip.generate({ type: 'nodebuffer' }) as Buffer;
    } catch (e) {
      return docxBuffer;
    }
  }

  merge(templateDocxBuffer: Buffer, rowData: Record<string, string>): Buffer {
    const cleanDocx = this.sanitizeDocxBraces(templateDocxBuffer);
    const zip = new PizZip(cleanDocx);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{', end: '}' },
      nullGetter() {
        return '';
      },
    });

    try {
      doc.render(rowData || {});
    } catch (error: any) {
      const details =
        error?.properties?.errors
          ?.map((e: any) => e?.properties?.explanation)
          .filter(Boolean)
          .join('; ') || error.message;
      this.logger.error(`Merge failed: ${details}`);
      throw new BadRequestException(`Template merge failed: ${details}`);
    }

    const mergedDocx = doc.getZip().generate({ type: 'nodebuffer' }) as Buffer;
    return this.fixLetterheadLayout(mergedDocx);
  }

  private fixLetterheadLayout(docxBuffer: Buffer): Buffer {
    try {
      const zip = new PizZip(docxBuffer);
      if (!zip.files['word/document.xml']) return docxBuffer;

      // 1. Zero section header and footer distances while keeping content margins
      let docXml = zip.files['word/document.xml'].asText();
      docXml = docXml.replace(/<w:pgMar\b([^>]*)\/>/g, (full, attrs) => {
        let updated = attrs;
        updated = updated.replace(/\s+w:header="[^"]*"/, ' w:header="0"');
        updated = updated.replace(/\s+w:footer="[^"]*"/, ' w:footer="0"');
        if (!/\bw:header="/.test(updated)) updated += ' w:header="0"';
        if (!/\bw:footer="/.test(updated)) updated += ' w:footer="0"';
        return `<w:pgMar${updated}/>`;
      });
      zip.file('word/document.xml', docXml);

      // 2. Expand width & height extents in header/footer xml files to full paper width (210mm / 7560310 EMUs)
      const hfFiles = [
        'word/header1.xml', 'word/header2.xml', 'word/header3.xml',
        'word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml',
      ];

      for (const fileName of hfFiles) {
        if (!zip.files[fileName]) continue;
        let xml = zip.files[fileName].asText();

        xml = xml.replace(/<wp:positionH\s+relativeFrom="[^"]*">/g, '<wp:positionH relativeFrom="page">');
        xml = xml.replace(/<wp:positionV\s+relativeFrom="[^"]*">/g, '<wp:positionV relativeFrom="page">');
        xml = xml.replace(/allowOverlap="0"/g, 'allowOverlap="1"');
        xml = xml.replace(/margin-left:\s*[\d\.]+(?:pt|px|in)/g, 'margin-left:0pt');
        xml = xml.replace(/margin-right:\s*[\d\.]+(?:pt|px|in)/g, 'margin-right:0pt');

        zip.file(fileName, xml);
      }

      return zip.generate({ type: 'nodebuffer' }) as Buffer;
    } catch {
      return docxBuffer;
    }
  }

  mergeHtml(html: string | undefined, rowData: Record<string, string>): string {
    if (!html) return '';
    let result = html;
    if (rowData) {
      for (const [key, val] of Object.entries(rowData)) {
        const regex = new RegExp(`\\{${key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\}`, 'gi');
        result = result.replace(regex, val ?? '');
      }
    }
    return result;
  }
}

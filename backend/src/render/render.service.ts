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

  merge(templateDocxBuffer: Buffer, rowData: Record<string, string>): Buffer {
    const zip = new PizZip(templateDocxBuffer);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{', end: '}' },
    });

    try {
      doc.render(rowData);
    } catch (error: any) {
      // docxtemplater throws a structured error listing exactly which
      // placeholder(s) had no matching data - surface that clearly
      // instead of a generic 500.
      const details =
        error?.properties?.errors
          ?.map((e: any) => e?.properties?.explanation)
          .filter(Boolean)
          .join('; ') || error.message;
      this.logger.error(`Merge failed: ${details}`);
      throw new BadRequestException(`Template merge failed: ${details}`);
    }

    return doc.getZip().generate({ type: 'nodebuffer' }) as Buffer;
  }
}

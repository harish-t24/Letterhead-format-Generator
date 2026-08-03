import { Injectable } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import { PassThrough } from 'stream';
import { RenderService } from '../render/render.service';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
import { ConversionService } from '../conversion/conversion.service';

import { formatMergedFilename } from '../templates/utils/filename-formatter';

@Injectable()
export class ExportService {
  constructor(
    private readonly renderService: RenderService,
    private readonly templatesService: TemplatesService,
    private readonly datasetsService: DatasetsService,
    private readonly conversionService: ConversionService,
  ) {}

  /** Merges + converts every row for a template, streaming them into a single zip. */
  exportAllAsZip(templateId: string): PassThrough {
    const templateRecord = this.templatesService.findOne(templateId);
    const templateBuffer = this.templatesService.getDocxBuffer(templateId);
    const rows = this.datasetsService.listRows(templateId);

    const stream = new PassThrough();
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err) => stream.emit('error', err));
    archive.pipe(stream);

    // Run sequentially to avoid hammering the conversion service with
    // dozens of simultaneous requests.
    (async () => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const mergedDocx = this.renderService.merge(templateBuffer, row.data);
        const filename = formatMergedFilename(templateRecord.templateName, i, row.data);
        const pdf = await this.conversionService.docxToPdf(mergedDocx, `${filename}.docx`);
        this.datasetsService.markUsed(templateId, row.id);
        archive.append(pdf, { name: `${filename}.pdf` });
      }
      archive.finalize();
    })().catch((err) => stream.emit('error', err));

    return stream;
  }
}

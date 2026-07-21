import { Injectable } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import { PassThrough } from 'stream';
import { RenderService } from '../render/render.service';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
import { ConversionService } from '../conversion/conversion.service';

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
    const templateBuffer = this.templatesService.getDocxBuffer(templateId);
    const rows = this.datasetsService.listRows(templateId);

    const stream = new PassThrough();
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err) => stream.emit('error', err));
    archive.pipe(stream);

    // Run sequentially to avoid hammering the conversion service with
    // dozens of simultaneous requests.
    (async () => {
      for (const row of rows) {
        const mergedDocx = this.renderService.merge(templateBuffer, row.data);
        const pdf = await this.conversionService.docxToPdf(mergedDocx, `${row.id}.docx`);
        this.datasetsService.markUsed(templateId, row.id);
        const nameKey = Object.keys(row.data).find(
          (k) => k.toLowerCase() === 'name' || k.toLowerCase() === 'title',
        );
        const label = nameKey ? row.data[nameKey] : null;
        const filenameLabel = label ? label.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : row.id.slice(0, 8);
        archive.append(pdf, { name: `${filenameLabel}-${row.id.slice(0, 8)}.pdf` });
      }
      archive.finalize();
    })().catch((err) => stream.emit('error', err));

    return stream;
  }
}

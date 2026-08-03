import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RenderService } from './render.service';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
import { ConversionService } from '../conversion/conversion.service';

import { formatMergedFilename } from '../templates/utils/filename-formatter';

@Controller('render')
export class RenderController {
  constructor(
    private readonly renderService: RenderService,
    private readonly templatesService: TemplatesService,
    private readonly datasetsService: DatasetsService,
    private readonly conversionService: ConversionService,
  ) {}

  /**
   * Debug/offline endpoint: returns the merged .docx directly, with NO
   * PDF conversion step. Useful for confirming the merge itself is
   * correct even without Gotenberg/Docker running.
   */
  @Get(':templateId/:rowId/docx')
  async renderDocx(
    @Param('templateId') templateId: string,
    @Param('rowId') rowId: string,
    @Res() res: Response,
  ) {
    const templateRecord = this.templatesService.findOne(templateId);
    const templateBuffer = this.templatesService.getDocxBuffer(templateId);
    const allRows = this.datasetsService.listRows(templateId);
    const rowIndex = allRows.findIndex((r) => r.id === rowId);
    const row = this.datasetsService.getRow(templateId, rowId);
    const mergedDocx = this.renderService.merge(templateBuffer, row.data);
    const filename = formatMergedFilename(templateRecord.templateName, rowIndex >= 0 ? rowIndex : 0, row.data);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}.docx"`,
    });
    res.send(mergedDocx);
  }

  /**
   * Main endpoint used by the live preview + single-row export: merges
   * the row's data into the template and converts straight to PDF.
   * Requires Gotenberg running (docker compose up -d).
   */
  @Get(':templateId/:rowId/pdf')
  async renderPdf(
    @Param('templateId') templateId: string,
    @Param('rowId') rowId: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    const templateRecord = this.templatesService.findOne(templateId);
    const templateBuffer = this.templatesService.getDocxBuffer(templateId);
    const allRows = this.datasetsService.listRows(templateId);
    const rowIndex = allRows.findIndex((r) => r.id === rowId);
    const row = this.datasetsService.getRow(templateId, rowId);
    const mergedDocx = this.renderService.merge(templateBuffer, row.data);
    const filename = formatMergedFilename(templateRecord.templateName, rowIndex >= 0 ? rowIndex : 0, row.data);
    const pdf = await this.conversionService.docxToPdf(mergedDocx, `${filename}.docx`);
    this.datasetsService.markUsed(templateId, rowId);

    const isDownload = download === '1' || download === 'true';
    const disposition = isDownload ? `attachment; filename="${filename}.pdf"` : `inline; filename="${filename}.pdf"`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': disposition,
    });
    res.send(pdf);
  }
}

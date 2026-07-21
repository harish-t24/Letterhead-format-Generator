import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RenderService } from './render.service';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
import { ConversionService } from '../conversion/conversion.service';

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
    const templateBuffer = this.templatesService.getDocxBuffer(templateId);
    const row = this.datasetsService.getRow(templateId, rowId);
    const mergedDocx = this.renderService.merge(templateBuffer, row.data);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="merged-${rowId}.docx"`,
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
    @Res() res: Response,
  ) {
    const templateBuffer = this.templatesService.getDocxBuffer(templateId);
    const row = this.datasetsService.getRow(templateId, rowId);
    const mergedDocx = this.renderService.merge(templateBuffer, row.data);
    const pdf = await this.conversionService.docxToPdf(mergedDocx, `${rowId}.docx`);
    this.datasetsService.markUsed(templateId, rowId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${rowId}.pdf"`,
    });
    res.send(pdf);
  }
}

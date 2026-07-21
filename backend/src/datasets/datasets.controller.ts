import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DatasetsService } from './datasets.service';
import { TemplatesService } from '../templates/templates.service';
import { parseCsvForTemplate } from './utils/csv-parser';

@Controller('templates/:templateId/rows')
export class DatasetsController {
  constructor(
    private readonly datasetsService: DatasetsService,
    private readonly templatesService: TemplatesService,
  ) {}

  @Get()
  list(@Param('templateId') templateId: string) {
    return this.datasetsService.listRows(templateId);
  }

  @Post()
  add(@Param('templateId') templateId: string, @Body() data: Record<string, string>) {
    return this.datasetsService.addRow(templateId, data);
  }

  /**
   * Bulk-creates rows from an uploaded CSV ("Upload Dataset"). Column
   * headers are matched against the template's {placeholder} names
   * case-insensitively; unmatched CSV columns are ignored, and
   * placeholders with no matching column are left blank.
   */
  @Post('bulk-csv')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadCsv(
    @Param('templateId') templateId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded (field name must be "file")');
    }
    const template = this.templatesService.findOne(templateId);
    const csvText = file.buffer.toString('utf-8');
    const parsed = parseCsvForTemplate(csvText, template.placeholders);

    const createdRows = parsed.rows.map((data) => this.datasetsService.addRow(templateId, data));

    return {
      createdCount: createdRows.length,
      matchedColumns: parsed.matchedColumns,
      unmatchedCsvColumns: parsed.unmatchedCsvColumns,
      missingPlaceholders: parsed.missingPlaceholders,
      rows: createdRows,
    };
  }

  @Patch(':rowId')
  update(
    @Param('templateId') templateId: string,
    @Param('rowId') rowId: string,
    @Body() data: Record<string, string>,
  ) {
    return this.datasetsService.updateRow(templateId, rowId, data);
  }

  @Delete(':rowId')
  remove(@Param('templateId') templateId: string, @Param('rowId') rowId: string) {
    this.datasetsService.deleteRow(templateId, rowId);
    return { deleted: true };
  }

  /** Clears every row for a template -- the Datasets page's "Delete" action. */
  @Delete()
  removeAll(@Param('templateId') templateId: string) {
    this.datasetsService.clearAll(templateId);
    return { cleared: true };
  }
}

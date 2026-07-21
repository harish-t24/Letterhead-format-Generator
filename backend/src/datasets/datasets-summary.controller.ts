import { Controller, Get } from '@nestjs/common';
import { DatasetsService } from './datasets.service';
import { TemplatesService } from '../templates/templates.service';

export interface DatasetSummary {
  templateId: string;
  datasetName: string;
  templateName: string;
  recordCount: number;
  createdAt: string;
  lastUpdatedAt: string | null;
}

/**
 * Cross-template "Datasets" list -- one row per template (we keep a
 * single dataset per template rather than letting a template own
 * multiple named datasets), summarizing its row count and recency.
 */
@Controller('datasets')
export class DatasetsSummaryController {
  constructor(
    private readonly datasetsService: DatasetsService,
    private readonly templatesService: TemplatesService,
  ) {}

  @Get()
  list(): DatasetSummary[] {
    return this.templatesService.findAll().map((template) => {
      const { recordCount, lastUpdatedAt } = this.datasetsService.getSummary(template.id);
      return {
        templateId: template.id,
        datasetName: `${template.templateName} — Data`,
        templateName: template.templateName,
        recordCount,
        createdAt: template.createdAt,
        lastUpdatedAt,
      };
    });
  }
}

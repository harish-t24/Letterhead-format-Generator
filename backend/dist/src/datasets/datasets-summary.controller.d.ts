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
export declare class DatasetsSummaryController {
    private readonly datasetsService;
    private readonly templatesService;
    constructor(datasetsService: DatasetsService, templatesService: TemplatesService);
    list(): DatasetSummary[];
}

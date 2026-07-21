import { DatasetsService } from './datasets.service';
import { TemplatesService } from '../templates/templates.service';
export declare class DatasetsController {
    private readonly datasetsService;
    private readonly templatesService;
    constructor(datasetsService: DatasetsService, templatesService: TemplatesService);
    list(templateId: string): import("./dataset-row.types").DatasetRow[];
    add(templateId: string, data: Record<string, string>): import("./dataset-row.types").DatasetRow;
    bulkUploadCsv(templateId: string, file: Express.Multer.File): Promise<{
        createdCount: number;
        matchedColumns: string[];
        unmatchedCsvColumns: string[];
        missingPlaceholders: string[];
        rows: import("./dataset-row.types").DatasetRow[];
    }>;
    update(templateId: string, rowId: string, data: Record<string, string>): import("./dataset-row.types").DatasetRow;
    remove(templateId: string, rowId: string): {
        deleted: boolean;
    };
    removeAll(templateId: string): {
        cleared: boolean;
    };
}

import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
export declare class AdminService {
    private readonly templatesService;
    private readonly datasetsService;
    constructor(templatesService: TemplatesService, datasetsService: DatasetsService);
    exportSystemBackup(): {
        version: string;
        software: string;
        exportedAt: string;
        templatesCount: number;
        templates: {
            docxBase64: string;
            id: string;
            templateName: string;
            originalName: string;
            docxPath: string;
            html: string;
            bodyHtml?: string;
            headerHtml?: string;
            footerHtml?: string;
            placeholders: string[];
            source: import("../templates/template.types").TemplateSource;
            createdAt: string;
            updatedAt: string;
            marginTop?: number;
            marginBottom?: number;
            marginLeft?: number;
            marginRight?: number;
        }[];
        datasets: Record<string, any[]>;
    };
    importSystemBackup(backupData: any): {
        success: boolean;
        restoredTemplates: number;
        restoredRows: number;
        importedAt: string;
    };
}

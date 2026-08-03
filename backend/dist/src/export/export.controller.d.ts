import type { Response } from 'express';
import { ExportService } from './export.service';
import { TemplatesService } from '../templates/templates.service';
export declare class ExportController {
    private readonly exportService;
    private readonly templatesService;
    constructor(exportService: ExportService, templatesService: TemplatesService);
    exportZip(templateId: string, res: Response): void;
}

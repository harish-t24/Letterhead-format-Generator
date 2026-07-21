import type { Response } from 'express';
import { ExportService } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportZip(templateId: string, res: Response): void;
}

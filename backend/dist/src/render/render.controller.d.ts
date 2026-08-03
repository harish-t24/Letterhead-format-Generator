import type { Response } from 'express';
import { RenderService } from './render.service';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
import { ConversionService } from '../conversion/conversion.service';
export declare class RenderController {
    private readonly renderService;
    private readonly templatesService;
    private readonly datasetsService;
    private readonly conversionService;
    constructor(renderService: RenderService, templatesService: TemplatesService, datasetsService: DatasetsService, conversionService: ConversionService);
    renderDocx(templateId: string, rowId: string, res: Response): Promise<void>;
    renderPdf(templateId: string, rowId: string, download: string, res: Response): Promise<void>;
}

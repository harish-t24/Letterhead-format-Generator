import { PassThrough } from 'stream';
import { RenderService } from '../render/render.service';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';
import { ConversionService } from '../conversion/conversion.service';
export declare class ExportService {
    private readonly renderService;
    private readonly templatesService;
    private readonly datasetsService;
    private readonly conversionService;
    constructor(renderService: RenderService, templatesService: TemplatesService, datasetsService: DatasetsService, conversionService: ConversionService);
    exportAllAsZip(templateId: string): PassThrough;
}

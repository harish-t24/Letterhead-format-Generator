import type { Response } from 'express';
import { TemplatesService } from './templates.service';
import { ConversionService } from '../conversion/conversion.service';
import { CreateFromStarterDto, RenameTemplateDto, UpdateContentDto } from './dto/create-template.dto';
export declare class TemplatesController {
    private readonly templatesService;
    private readonly conversionService;
    constructor(templatesService: TemplatesService, conversionService: ConversionService);
    listStarters(): {
        source: string;
        label: string;
        description: string;
    }[];
    import(file: Express.Multer.File): Promise<import("./template.types").TemplateRecord>;
    createNew(source: string, dto: CreateFromStarterDto): Promise<import("./template.types").TemplateRecord>;
    findAll(): import("./template.types").TemplateRecord[];
    findOne(id: string): import("./template.types").TemplateRecord;
    updateContent(id: string, dto: UpdateContentDto): Promise<import("./template.types").TemplateRecord>;
    rename(id: string, dto: RenameTemplateDto): Promise<import("./template.types").TemplateRecord>;
    exportPdf(id: string, res: Response): Promise<void>;
    remove(id: string): {
        deleted: boolean;
    };
}

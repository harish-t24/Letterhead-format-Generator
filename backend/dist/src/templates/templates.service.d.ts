import { TemplateRecord } from './template.types';
export declare class TemplatesService {
    private templates;
    constructor();
    private loadTemplates;
    private saveTemplates;
    createFromDocx(originalName: string, docxBuffer: Buffer): Promise<TemplateRecord>;
    createFromStarter(source: 'blank' | 'shinecraft', templateName: string, options?: {
        includeHeader?: boolean;
        includeFooter?: boolean;
        headerHtml?: string;
        footerHtml?: string;
    }): Promise<TemplateRecord>;
    updateContent(id: string, bodyHtml?: string, headerHtml?: string, footerHtml?: string, marginTop?: number, marginBottom?: number, marginLeft?: number, marginRight?: number): Promise<TemplateRecord>;
    renameTemplate(id: string, templateName: string): Promise<TemplateRecord>;
    findAll(): TemplateRecord[];
    findOne(id: string): TemplateRecord;
    getDocxBuffer(id: string): Buffer;
    remove(id: string): void;
}

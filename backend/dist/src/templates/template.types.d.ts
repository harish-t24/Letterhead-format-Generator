export type TemplateSource = 'imported' | 'blank' | 'shinecraft';
export interface TemplateRecord {
    id: string;
    templateName: string;
    originalName: string;
    docxPath: string;
    html: string;
    bodyHtml?: string;
    headerHtml?: string;
    footerHtml?: string;
    placeholders: string[];
    source: TemplateSource;
    createdAt: string;
    updatedAt: string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
}

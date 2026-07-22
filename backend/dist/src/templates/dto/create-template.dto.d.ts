export declare class CreateTemplateDto {
    originalName: string;
}
export declare class CreateFromStarterDto {
    templateName: string;
    includeHeader?: boolean;
    includeFooter?: boolean;
    headerHtml?: string;
    footerHtml?: string;
}
export declare class UpdateContentDto {
    bodyHtml?: string;
    headerHtml?: string;
    footerHtml?: string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
}
export declare class RenameTemplateDto {
    templateName: string;
}

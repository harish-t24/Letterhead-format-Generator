export interface DocxImportResult {
    html: string;
    bodyHtml: string;
    headerHtml?: string;
    footerHtml?: string;
    placeholders: string[];
}
export declare function parseDocxFull(docxBuffer: Buffer): Promise<DocxImportResult>;

export declare class RenderService {
    private readonly logger;
    private sanitizeDocxBraces;
    merge(templateDocxBuffer: Buffer, rowData: Record<string, string>): Buffer;
    private fixLetterheadLayout;
    mergeHtml(html: string | undefined, rowData: Record<string, string>): string;
}

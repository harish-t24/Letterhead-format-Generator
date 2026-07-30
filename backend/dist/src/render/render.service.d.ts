export declare class RenderService {
    private readonly logger;
    private sanitizeDocxBraces;
    merge(templateDocxBuffer: Buffer, rowData: Record<string, string>): Buffer;
}

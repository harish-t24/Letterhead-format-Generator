export declare class ConversionService {
    private readonly logger;
    private readonly gotenbergUrl;
    docxToPdf(docxBuffer: Buffer, filename?: string): Promise<Buffer>;
    pdfToDocx(pdfBuffer: Buffer, filename?: string): Promise<Buffer>;
}

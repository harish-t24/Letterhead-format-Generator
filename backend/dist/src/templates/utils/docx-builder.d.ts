export declare function buildDocx(params: {
    bodyHtml: string;
    headerHtml?: string;
    footerHtml?: string;
    includeHeader: boolean;
    includeFooter: boolean;
    pageNumber?: boolean;
}): Promise<Buffer>;

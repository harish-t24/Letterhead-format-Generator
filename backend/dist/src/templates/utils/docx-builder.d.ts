export declare function buildDocx(params: {
    bodyHtml: string;
    headerHtml?: string;
    footerHtml?: string;
    includeHeader: boolean;
    includeFooter: boolean;
    pageNumber?: boolean;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
}): Promise<Buffer>;

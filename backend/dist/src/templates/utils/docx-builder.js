"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDocx = buildDocx;
const html_to_docx_1 = __importDefault(require("html-to-docx"));
function preprocessHtmlTables(html) {
    if (!html)
        return '';
    let processed = html;
    processed = processed.replace(/<table([^>]*)/gi, (match, contents) => {
        const clean = contents
            .replace(/\s*border=["'][^"']*["']/gi, '')
            .replace(/\s*cellspacing=["'][^"']*["']/gi, '')
            .replace(/\s*cellpadding=["'][^"']*["']/gi, '')
            .replace(/\s*style=["'][^"']*["']/gi, '');
        return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; border:1px solid #cbd5e1;"${clean}`;
    });
    processed = processed.replace(/<td([^>]*)/gi, (match, contents) => {
        const clean = contents.replace(/\s*style=["'][^"']*["']/gi, '');
        return `<td style="border:1px solid #cbd5e1; padding:8px 12px; vertical-align:top;"${clean}`;
    });
    processed = processed.replace(/<th([^>]*)/gi, (match, contents) => {
        const clean = contents.replace(/\s*style=["'][^"']*["']/gi, '');
        return `<th style="border:1px solid #cbd5e1; padding:8px 12px; vertical-align:top; background-color:#f8fafc; font-weight:bold;"${clean}`;
    });
    return processed;
}
async function buildDocx(params) {
    const { bodyHtml, headerHtml, footerHtml, includeHeader, includeFooter, marginTop, marginBottom, marginLeft, marginRight } = params;
    const processedBody = preprocessHtmlTables(bodyHtml);
    const processedHeader = preprocessHtmlTables(headerHtml);
    const processedFooter = preprocessHtmlTables(footerHtml);
    const hasImage = footerHtml && /<img/i.test(footerHtml);
    const enablePageNumber = includeFooter && !hasImage && (!footerHtml || /page/i.test(footerHtml));
    const buffer = await (0, html_to_docx_1.default)(processedBody, includeHeader ? processedHeader || '<p></p>' : undefined, {
        header: includeHeader,
        footer: includeFooter,
        pageNumber: enablePageNumber,
        pageSize: {
            width: 11906,
            height: 16838,
        },
        margins: {
            top: marginTop !== undefined ? Math.round(marginTop * 1440) : 1440,
            bottom: marginBottom !== undefined ? Math.round(marginBottom * 1440) : 1440,
            left: marginLeft !== undefined ? Math.round(marginLeft * 1440) : 1440,
            right: marginRight !== undefined ? Math.round(marginRight * 1440) : 1440,
            header: 720,
            footer: 720,
        },
        font: 'Calibri',
        fontSize: 24,
    }, includeFooter ? processedFooter || '<p></p>' : undefined);
    return buffer;
}
//# sourceMappingURL=docx-builder.js.map
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
        if (/style=/i.test(contents)) {
            return match;
        }
        return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; border:1px solid #cbd5e1;"${contents}`;
    });
    return processed;
}
function preprocessHtmlImages(html, isHeaderFooter = false) {
    if (!html)
        return '';
    let processed = html;
    processed = processed.replace(/<span\b([^>]*class="[^"]*image-node-wrap[^"]*"[^>]*)>(<img\b[^>]+>)<\/span>/gi, (_full, spanAttrs, imgTag) => {
        const alignMatch = spanAttrs.match(/data-alignment=["']([^"']+)["']/i) || spanAttrs.match(/text-align:\s*(left|center|right)/i);
        const align = alignMatch ? alignMatch[1] : 'center';
        const wrapMatch = spanAttrs.match(/data-text-wrap=["']([^"']+)["']/i);
        const wrap = wrapMatch ? wrapMatch[1] : 'inline';
        if (wrap === 'left' || wrap === 'right' || wrap === 'tight') {
            return `<p style="text-align:${wrap === 'right' ? 'right' : 'left'}; margin:6px 0; clear:both;">${imgTag}</p>`;
        }
        return `<p style="text-align:${align}; margin:6px 0; clear:both;">${imgTag}</p>`;
    });
    processed = processed.replace(/<img\b([^>]*)\/?>/gi, (full, attrs) => {
        const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
        if (!srcMatch)
            return full;
        const src = srcMatch[1];
        const isFullWidth = /width:\s*100%/i.test(attrs) || /width=["']100%["']/i.test(attrs);
        if (isHeaderFooter && isFullWidth) {
            return `<img src="${src}" width="650" style="width:100%; display:block; margin:0 auto;" />`;
        }
        let width = '';
        const styleWidth = attrs.match(/width:\s*([\d]+)px/i);
        const attrWidth = attrs.match(/width=["']([\d]+)["']/i);
        if (styleWidth)
            width = styleWidth[1];
        else if (attrWidth)
            width = attrWidth[1];
        let height = '';
        const styleHeight = attrs.match(/height:\s*([\d]+)px/i);
        const attrHeight = attrs.match(/height=["']([\d]+)["']/i);
        if (styleHeight)
            height = styleHeight[1];
        else if (attrHeight)
            height = attrHeight[1];
        const alignMatch = attrs.match(/align=["']([^"']+)["']/i);
        const imgAlign = alignMatch ? alignMatch[1] : undefined;
        const sizeAttrs = width ? `width="${width}" ${height ? `height="${height}"` : ''}` : 'width="160"';
        const alignAttr = imgAlign ? `align="${imgAlign}"` : '';
        return `<img src="${src}" ${sizeAttrs} ${alignAttr} style="display:inline-block; vertical-align:middle; background:transparent;" />`;
    });
    return processed;
}
function preprocessHtmlPageBreaks(html) {
    if (!html)
        return '';
    let processed = html;
    processed = processed.replace(/<div[^>]*class="[^"]*page-break[^"]*"[^>]*>.*?<\/div>/gi, '<div style="page-break-after: always; break-after: page;"><!-- pagebreak --></div>');
    processed = processed.replace(/<hr[^>]*class="[^"]*page-break[^"]*"[^>]*\/?>/gi, '<div style="page-break-after: always; break-after: page;"><!-- pagebreak --></div>');
    return processed;
}
function sanitizeHtmlForDocx(html, isHeaderFooter = false) {
    if (!html)
        return '';
    return preprocessHtmlPageBreaks(preprocessHtmlImages(preprocessHtmlTables(html), isHeaderFooter));
}
async function buildDocx(params) {
    const { bodyHtml, headerHtml, footerHtml, includeHeader, includeFooter, marginTop, marginBottom, marginLeft, marginRight } = params;
    const processedBody = sanitizeHtmlForDocx(bodyHtml, false);
    const processedHeader = sanitizeHtmlForDocx(headerHtml, true);
    const processedFooter = sanitizeHtmlForDocx(footerHtml, true);
    const hasImage = footerHtml && /<img/i.test(footerHtml);
    const enablePageNumber = includeFooter && !hasImage && (!footerHtml || /page/i.test(footerHtml));
    const DEFAULT_TOP = 5.4 / 2.54;
    const DEFAULT_BOTTOM = 0.63 / 2.54;
    const DEFAULT_LEFT = 2.16 / 2.54;
    const DEFAULT_RIGHT = 1.27 / 2.54;
    const leftMargin = marginLeft !== undefined ? marginLeft : DEFAULT_LEFT;
    const rightMargin = marginRight !== undefined ? marginRight : DEFAULT_RIGHT;
    const baseTopMargin = marginTop !== undefined ? marginTop : DEFAULT_TOP;
    const baseBottomMargin = marginBottom !== undefined ? marginBottom : DEFAULT_BOTTOM;
    const topMargin = includeHeader && processedHeader ? Math.max(baseTopMargin, (240 + 8) / 96) : baseTopMargin;
    const bottomMargin = includeFooter && processedFooter ? Math.max(baseBottomMargin, (215 + 8) / 96) : baseBottomMargin;
    const buffer = await (0, html_to_docx_1.default)(processedBody, includeHeader ? processedHeader || '<p></p>' : undefined, {
        header: includeHeader,
        footer: includeFooter,
        pageNumber: enablePageNumber,
        pageSize: {
            width: 11906,
            height: 16838,
        },
        margins: {
            top: Math.round(topMargin * 1440),
            bottom: Math.round(bottomMargin * 1440),
            left: Math.round(leftMargin * 1440),
            right: Math.round(rightMargin * 1440),
            header: 0,
            footer: 0,
        },
        font: 'Calibri',
        fontSize: 24,
    }, includeFooter ? processedFooter || '<p></p>' : undefined);
    return buffer;
}
//# sourceMappingURL=docx-builder.js.map
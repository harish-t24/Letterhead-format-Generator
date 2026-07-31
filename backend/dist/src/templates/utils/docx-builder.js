"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDocx = buildDocx;
const html_to_docx_1 = __importDefault(require("html-to-docx"));
const pizzip_1 = __importDefault(require("pizzip"));
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
function makeHeaderFooterXmlMarginless(docxBuffer, marginTopInches, marginBottomInches, marginLeftInches, marginRightInches) {
    try {
        const zip = new pizzip_1.default(docxBuffer);
        const marginTopDxa = Math.round(marginTopInches * 1440);
        const marginBottomDxa = Math.round(marginBottomInches * 1440);
        const marginLeftDxa = Math.round(marginLeftInches * 1440);
        const marginRightDxa = Math.round(marginRightInches * 1440);
        const fullWidthEmu = 7560310;
        if (zip.files['word/document.xml']) {
            let xml = zip.files['word/document.xml'].asText();
            xml = xml.replace(/<w:pgMar[^>]*\/>/g, '<w:pgMar w:top="0" w:bottom="0" w:left="0" w:right="0" w:header="0" w:footer="0"/>');
            const indXml = `<w:ind w:left="${marginLeftDxa}" w:right="${marginRightDxa}"/>`;
            const topSpacingXml = `<w:spacing w:before="${marginTopDxa}"/>`;
            xml = xml.replace(/<w:pPr>/g, `<w:pPr>${indXml}`);
            xml = xml.replace(/<w:p>(?!<w:pPr>)/g, `<w:p><w:pPr>${indXml}</w:pPr>`);
            let firstDone = false;
            xml = xml.replace(/<w:pPr>/g, (m) => {
                if (!firstDone) {
                    firstDone = true;
                    return `<w:pPr>${topSpacingXml}`;
                }
                return m;
            });
            zip.file('word/document.xml', xml);
        }
        const zeroIndentXml = `<w:ind w:left="0" w:right="0" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`;
        const fixHfXml = (xmlStr) => {
            let xml = xmlStr;
            if (xml.includes('<w:pPr>')) {
                xml = xml.replace(/<w:pPr>/g, `<w:pPr>${zeroIndentXml}`);
            }
            else {
                xml = xml.replace(/<w:p>/g, `<w:p><w:pPr>${zeroIndentXml}</w:pPr>`);
            }
            xml = xml.replace(/cx="\d+"/g, `cx="${fullWidthEmu}"`);
            return xml;
        };
        if (zip.files['word/header1.xml']) {
            zip.file('word/header1.xml', fixHfXml(zip.files['word/header1.xml'].asText()));
        }
        if (zip.files['word/footer1.xml']) {
            zip.file('word/footer1.xml', fixHfXml(zip.files['word/footer1.xml'].asText()));
        }
        return zip.generate({ type: 'nodebuffer' });
    }
    catch (e) {
        return docxBuffer;
    }
}
function sanitizeHtmlForDocx(html) {
    if (!html)
        return '';
    let cleaned = html;
    cleaned = cleaned.replace(/<img[^>]*src=["']data:image\/(?!png|jpeg|jpg|gif)[^"']*["'][^>]*>/gi, '');
    return cleaned;
}
async function buildDocx(params) {
    const { bodyHtml, headerHtml, footerHtml, includeHeader, includeFooter, marginTop, marginBottom, marginLeft, marginRight } = params;
    const processedBody = sanitizeHtmlForDocx(preprocessHtmlTables(bodyHtml));
    const processedHeader = sanitizeHtmlForDocx(preprocessHtmlTables(headerHtml));
    const processedFooter = sanitizeHtmlForDocx(preprocessHtmlTables(footerHtml));
    const hasImage = footerHtml && /<img/i.test(footerHtml);
    const enablePageNumber = includeFooter && !hasImage && (!footerHtml || /page/i.test(footerHtml));
    const DEFAULT_TOP = 5.4 / 2.54;
    const DEFAULT_BOTTOM = 0.63 / 2.54;
    const DEFAULT_LEFT = 2.16 / 2.54;
    const DEFAULT_RIGHT = 1.27 / 2.54;
    const leftMargin = marginLeft !== undefined ? marginLeft : DEFAULT_LEFT;
    const rightMargin = marginRight !== undefined ? marginRight : DEFAULT_RIGHT;
    const topMargin = marginTop !== undefined ? marginTop : DEFAULT_TOP;
    const bottomMargin = marginBottom !== undefined ? marginBottom : DEFAULT_BOTTOM;
    const buffer = await (0, html_to_docx_1.default)(processedBody, includeHeader ? processedHeader || '<p></p>' : undefined, {
        header: includeHeader,
        footer: includeFooter,
        pageNumber: enablePageNumber,
        pageSize: {
            width: 11906,
            height: 16838,
        },
        margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            header: 0,
            footer: 0,
        },
        font: 'Calibri',
        fontSize: 24,
    }, includeFooter ? processedFooter || '<p></p>' : undefined);
    return makeHeaderFooterXmlMarginless(buffer, topMargin, bottomMargin, leftMargin, rightMargin);
}
//# sourceMappingURL=docx-builder.js.map
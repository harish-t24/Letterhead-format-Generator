"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDocx = buildDocx;
const html_to_docx_1 = __importDefault(require("html-to-docx"));
async function buildDocx(params) {
    const { bodyHtml, headerHtml, footerHtml, includeHeader, includeFooter, pageNumber } = params;
    const buffer = await (0, html_to_docx_1.default)(bodyHtml, includeHeader ? headerHtml || '<p></p>' : undefined, {
        header: includeHeader,
        footer: includeFooter,
        pageNumber: false,
        pageSize: {
            width: 11906,
            height: 16838,
        },
        margins: {
            top: 1440,
            bottom: 1440,
            left: 1440,
            right: 1440,
            header: 720,
            footer: 720,
        },
        font: 'Calibri',
        fontSize: 24,
    }, includeFooter ? footerHtml || '<p></p>' : undefined);
    return buffer;
}
//# sourceMappingURL=docx-builder.js.map
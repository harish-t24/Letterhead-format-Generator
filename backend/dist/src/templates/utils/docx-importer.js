"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocxFull = parseDocxFull;
const mammoth = __importStar(require("mammoth"));
const pizzip_1 = __importDefault(require("pizzip"));
const placeholder_parser_1 = require("./placeholder-parser");
const convertImageInline = mammoth.images.imgElement((element) => {
    return element.read('base64').then((imageBuffer) => {
        return {
            src: `data:${element.contentType};base64,${imageBuffer}`,
        };
    });
});
const fullStyleMap = [
    "p[style-name='Header'] => h1:fresh",
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Title'] => h1:fresh",
    "p[style-name='Subtitle'] => h2:fresh",
    "r[style-name='Strong'] => strong",
    "u => u",
    "strike => del",
    "table => table.table",
];
async function extractPartHtml(zip, partXmlPath, relsPath) {
    try {
        const xmlFile = zip.file(partXmlPath);
        if (!xmlFile)
            return undefined;
        const partXml = xmlFile.asText();
        if (!partXml || !partXml.trim())
            return undefined;
        const partZip = new pizzip_1.default(zip.generate({ type: 'nodebuffer' }));
        partZip.file('word/document.xml', partXml);
        const relsFile = zip.file(relsPath);
        if (relsFile) {
            partZip.file('word/_rels/document.xml.rels', relsFile.asText());
        }
        const partBuffer = partZip.generate({ type: 'nodebuffer' });
        const { value: html } = await mammoth.convertToHtml({
            buffer: partBuffer,
            styleMap: fullStyleMap,
            convertImage: convertImageInline,
        });
        return html && html.trim() ? html.trim() : undefined;
    }
    catch (err) {
        console.warn(`Failed to parse ${partXmlPath} from docx:`, err);
        return undefined;
    }
}
async function parseDocxFull(docxBuffer) {
    const zip = new pizzip_1.default(docxBuffer);
    const { value: bodyHtml } = await mammoth.convertToHtml({
        buffer: docxBuffer,
        styleMap: fullStyleMap,
        convertImage: convertImageInline,
    });
    const headerPath = Object.keys(zip.files).find((f) => /^word\/header\d+\.xml$/i.test(f));
    let headerHtml;
    if (headerPath) {
        const headerFileName = headerPath.split('/').pop() || 'header1.xml';
        const relsPath = `word/_rels/${headerFileName}.rels`;
        headerHtml = await extractPartHtml(zip, headerPath, relsPath);
    }
    const footerPath = Object.keys(zip.files).find((f) => /^word\/footer\d+\.xml$/i.test(f));
    let footerHtml;
    if (footerPath) {
        const footerFileName = footerPath.split('/').pop() || 'footer1.xml';
        const relsPath = `word/_rels/${footerFileName}.rels`;
        footerHtml = await extractPartHtml(zip, footerPath, relsPath);
    }
    const placeholders = (0, placeholder_parser_1.extractPlaceholdersFromDocx)(docxBuffer);
    return {
        html: bodyHtml,
        bodyHtml,
        headerHtml,
        footerHtml,
        placeholders,
    };
}
//# sourceMappingURL=docx-importer.js.map
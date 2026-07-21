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
const html_to_docx_1 = __importDefault(require("html-to-docx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mammoth = __importStar(require("mammoth"));
const pizzip_1 = __importDefault(require("pizzip"));
const render_service_1 = require("../src/render/render.service");
const placeholder_parser_1 = require("../src/templates/utils/placeholder-parser");
async function main() {
    const headerHtml = `<p style="text-align:center;"><strong>SHINECRAFT INDUSTRIES</strong><br/>123 Business Ave, Suite 100</p>`;
    const footerHtml = `<p style="text-align:center;font-size:10px;">Confidential — Shinecraft Industries</p>`;
    const bodyHtml = `
    <p>Dear <strong>{name}</strong>,</p>
    <p>Your account <em>{id}</em> has the following updates:</p>
    <ul>
      <li>First bullet point</li>
      <li>Second bullet point</li>
    </ul>
    <ol>
      <li>First numbered item</li>
      <li>Second numbered item</li>
    </ol>
    <p>Total due: {amount}</p>
  `;
    const buffer = await (0, html_to_docx_1.default)(bodyHtml, headerHtml, {
        header: true,
        footer: true,
        pageNumber: true,
        margins: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 720, footer: 720 },
    }, footerHtml);
    const outDir = path.join(process.cwd(), 'storage', 'generated');
    if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'html-to-docx-test.docx');
    fs.writeFileSync(outPath, buffer);
    console.log('Generated docx at', outPath);
    const { value: html } = await mammoth.convertToHtml({ buffer: buffer });
    const placeholders = (0, placeholder_parser_1.extractPlaceholders)(html);
    console.log('\n--- Detected placeholders ---');
    console.log(placeholders);
    console.log('\n--- Mammoth HTML (body only, mammoth does not extract header/footer) ---');
    console.log(html);
    const renderService = new render_service_1.RenderService();
    const merged = renderService.merge(buffer, {
        name: 'Kavya Sundaram',
        id: 'SC-9911',
        amount: '$2,340.00',
    });
    fs.writeFileSync(path.join(outDir, 'html-to-docx-test-merged.docx'), merged);
    const zip = new pizzip_1.default(merged);
    const xml = zip.file('word/document.xml').asText();
    console.log('\n--- Merge verification ---');
    console.log('Unresolved braces left?', /\{[a-zA-Z0-9_]+\}/.test(xml));
    console.log('Contains merged name?', xml.includes('Kavya'));
    console.log('Contains numbering reference (numPr, i.e. lists survived)?', xml.includes('numPr'));
    const origZip = new pizzip_1.default(buffer);
    const fileNames = Object.keys(origZip.files);
    const headerFiles = fileNames.filter((f) => f.startsWith('word/header'));
    const footerFiles = fileNames.filter((f) => f.startsWith('word/footer'));
    console.log('\n--- Header/footer XML parts in generated docx ---');
    console.log('Header files:', headerFiles);
    console.log('Footer files:', footerFiles);
}
main().catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
});
//# sourceMappingURL=test-html-to-docx.js.map
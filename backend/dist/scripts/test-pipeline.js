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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mammoth = __importStar(require("mammoth"));
const pizzip_1 = __importDefault(require("pizzip"));
const placeholder_parser_1 = require("../src/templates/utils/placeholder-parser");
const render_service_1 = require("../src/render/render.service");
async function main() {
    const templatePath = path.join(process.cwd(), 'storage', 'uploads', 'sample-template.docx');
    const templateBuffer = fs.readFileSync(templatePath);
    const { value: html } = await mammoth.convertToHtml({ buffer: templateBuffer });
    const braceCheck = (0, placeholder_parser_1.validateBraces)(html);
    const placeholders = (0, placeholder_parser_1.extractPlaceholders)(html);
    console.log('--- Brace validation ---');
    console.log(braceCheck);
    console.log('--- Detected placeholders ---');
    console.log(placeholders);
    const renderService = new render_service_1.RenderService();
    const rows = [
        { id: 'row-1', data: { name: 'Priya Raman', id: '10432', amount: '$1,250.00' } },
        {
            id: 'row-2',
            data: {
                name: 'A much longer customer name that should wrap the table cell, Esquire III',
                id: '99',
                amount: '$40.00',
            },
        },
    ];
    const outDir = path.join(process.cwd(), 'storage', 'generated');
    if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir, { recursive: true });
    for (const row of rows) {
        const mergedBuffer = renderService.merge(templateBuffer, row.data);
        const outPath = path.join(outDir, `merged-${row.id}.docx`);
        fs.writeFileSync(outPath, mergedBuffer);
        const zip = new pizzip_1.default(mergedBuffer);
        const xml = zip.file('word/document.xml').asText();
        const stillHasBraces = /\{[a-zA-Z0-9_]+\}/.test(xml);
        const containsName = xml.includes(row.data.name.split(' ')[0]);
        console.log(`\n--- Row ${row.id} ---`);
        console.log('Output file:', outPath);
        console.log('Any unresolved {placeholders} left in XML?', stillHasBraces);
        console.log('Contains merged name fragment?', containsName);
    }
    console.log('\nAll merges completed successfully.');
}
main().catch((err) => {
    console.error('Pipeline test FAILED:', err);
    process.exit(1);
});
//# sourceMappingURL=test-pipeline.js.map
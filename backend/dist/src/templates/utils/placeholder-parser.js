"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPlaceholders = extractPlaceholders;
exports.extractPlaceholdersFromDocx = extractPlaceholdersFromDocx;
exports.validateBraces = validateBraces;
const pizzip_1 = __importDefault(require("pizzip"));
function extractPlaceholders(text) {
    const cleanText = text.replace(/<[^>]+>/g, '');
    const matches = cleanText.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
    const seen = new Set();
    const ordered = [];
    for (const m of matches) {
        const name = m.slice(1, -1);
        if (!seen.has(name)) {
            seen.add(name);
            ordered.push(name);
        }
    }
    return ordered;
}
function extractPlaceholdersFromDocx(docxBuffer) {
    try {
        const zip = new pizzip_1.default(docxBuffer);
        const placeholders = [];
        const filesToCheck = [
            'word/document.xml',
            'word/header1.xml',
            'word/header2.xml',
            'word/header3.xml',
            'word/footer1.xml',
            'word/footer2.xml',
            'word/footer3.xml',
        ];
        for (const file of filesToCheck) {
            const zipFile = zip.files[file];
            if (zipFile) {
                const text = zipFile.asText();
                placeholders.push(...extractPlaceholders(text));
            }
        }
        return Array.from(new Set(placeholders));
    }
    catch (e) {
        return [];
    }
}
function validateBraces(text) {
    return { valid: true };
}
//# sourceMappingURL=placeholder-parser.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
const docx_1 = require("docx");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const doc = new docx_1.Document({
    sections: [
        {
            children: [
                new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: 'Invoice Confirmation', bold: true, size: 32 })],
                }),
                new docx_1.Paragraph({ text: '' }),
                new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun('Dear {name},'),
                    ],
                }),
                new docx_1.Paragraph({ text: '' }),
                new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun('This confirms your account (ID: {id}) has been charged an amount of {amount}. ' +
                            'Thank you for your continued business with us.'),
                    ],
                }),
                new docx_1.Paragraph({ text: '' }),
                new docx_1.Table({
                    width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                    rows: [
                        new docx_1.TableRow({
                            children: [
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('Field')] }),
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('Value')] }),
                            ],
                        }),
                        new docx_1.TableRow({
                            children: [
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('Name')] }),
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('{name}')] }),
                            ],
                        }),
                        new docx_1.TableRow({
                            children: [
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('Customer ID')] }),
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('{id}')] }),
                            ],
                        }),
                        new docx_1.TableRow({
                            children: [
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('Amount')] }),
                                new docx_1.TableCell({ children: [new docx_1.Paragraph('{amount}')] }),
                            ],
                        }),
                    ],
                }),
                new docx_1.Paragraph({ text: '' }),
                new docx_1.Paragraph({
                    children: [new docx_1.TextRun('Regards,')],
                }),
                new docx_1.Paragraph({
                    children: [new docx_1.TextRun('The Billing Team')],
                }),
            ],
        },
    ],
});
const outDir = path.join(process.cwd(), 'storage', 'uploads');
if (!fs.existsSync(outDir))
    fs.mkdirSync(outDir, { recursive: true });
docx_1.Packer.toBuffer(doc).then((buffer) => {
    const outPath = path.join(outDir, 'sample-template.docx');
    fs.writeFileSync(outPath, buffer);
    console.log('Sample template written to', outPath);
});
//# sourceMappingURL=make-sample-template.js.map
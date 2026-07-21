"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ConversionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let ConversionService = ConversionService_1 = class ConversionService {
    logger = new common_1.Logger(ConversionService_1.name);
    gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3001';
    async docxToPdf(docxBuffer, filename = 'file.docx') {
        const form = new form_data_1.default();
        form.append('files', docxBuffer, filename);
        try {
            const res = await axios_1.default.post(`${this.gotenbergUrl}/forms/libreoffice/convert`, form, { headers: form.getHeaders(), responseType: 'arraybuffer' });
            return Buffer.from(res.data);
        }
        catch (err) {
            this.logger.error('Gotenberg docxToPdf failed', err?.message);
            throw new common_1.ServiceUnavailableException('PDF conversion service unavailable. Is Gotenberg running? ' +
                '(docker compose up -d in the project root)');
        }
    }
    async pdfToDocx(pdfBuffer, filename = 'file.pdf') {
        const form = new form_data_1.default();
        form.append('files', pdfBuffer, filename);
        form.append('convertTo', 'docx');
        try {
            const res = await axios_1.default.post(`${this.gotenbergUrl}/forms/libreoffice/convert`, form, { headers: form.getHeaders(), responseType: 'arraybuffer' });
            return Buffer.from(res.data);
        }
        catch (err) {
            this.logger.error('Gotenberg pdfToDocx failed', err?.message);
            throw new common_1.ServiceUnavailableException('PDF->DOCX conversion service unavailable. Is Gotenberg running? ' +
                '(docker compose up -d in the project root)');
        }
    }
};
exports.ConversionService = ConversionService;
exports.ConversionService = ConversionService = ConversionService_1 = __decorate([
    (0, common_1.Injectable)()
], ConversionService);
//# sourceMappingURL=conversion.service.js.map
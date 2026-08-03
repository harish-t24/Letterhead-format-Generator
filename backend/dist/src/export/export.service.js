"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const archiver_1 = require("archiver");
const stream_1 = require("stream");
const render_service_1 = require("../render/render.service");
const templates_service_1 = require("../templates/templates.service");
const datasets_service_1 = require("../datasets/datasets.service");
const conversion_service_1 = require("../conversion/conversion.service");
const filename_formatter_1 = require("../templates/utils/filename-formatter");
let ExportService = class ExportService {
    renderService;
    templatesService;
    datasetsService;
    conversionService;
    constructor(renderService, templatesService, datasetsService, conversionService) {
        this.renderService = renderService;
        this.templatesService = templatesService;
        this.datasetsService = datasetsService;
        this.conversionService = conversionService;
    }
    exportAllAsZip(templateId) {
        const templateRecord = this.templatesService.findOne(templateId);
        const templateBuffer = this.templatesService.getDocxBuffer(templateId);
        const rows = this.datasetsService.listRows(templateId);
        const stream = new stream_1.PassThrough();
        const archive = new archiver_1.ZipArchive({ zlib: { level: 9 } });
        archive.on('error', (err) => stream.emit('error', err));
        archive.pipe(stream);
        (async () => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const mergedDocx = this.renderService.merge(templateBuffer, row.data);
                const filename = (0, filename_formatter_1.formatMergedFilename)(templateRecord.templateName, i, row.data);
                const pdf = await this.conversionService.docxToPdf(mergedDocx, `${filename}.docx`);
                this.datasetsService.markUsed(templateId, row.id);
                archive.append(pdf, { name: `${filename}.pdf` });
            }
            archive.finalize();
        })().catch((err) => stream.emit('error', err));
        return stream;
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [render_service_1.RenderService,
        templates_service_1.TemplatesService,
        datasets_service_1.DatasetsService,
        conversion_service_1.ConversionService])
], ExportService);
//# sourceMappingURL=export.service.js.map
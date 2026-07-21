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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderController = void 0;
const common_1 = require("@nestjs/common");
const render_service_1 = require("./render.service");
const templates_service_1 = require("../templates/templates.service");
const datasets_service_1 = require("../datasets/datasets.service");
const conversion_service_1 = require("../conversion/conversion.service");
let RenderController = class RenderController {
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
    async renderDocx(templateId, rowId, res) {
        const templateBuffer = this.templatesService.getDocxBuffer(templateId);
        const row = this.datasetsService.getRow(templateId, rowId);
        const mergedDocx = this.renderService.merge(templateBuffer, row.data);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="merged-${rowId}.docx"`,
        });
        res.send(mergedDocx);
    }
    async renderPdf(templateId, rowId, res) {
        const templateBuffer = this.templatesService.getDocxBuffer(templateId);
        const row = this.datasetsService.getRow(templateId, rowId);
        const mergedDocx = this.renderService.merge(templateBuffer, row.data);
        const pdf = await this.conversionService.docxToPdf(mergedDocx, `${rowId}.docx`);
        this.datasetsService.markUsed(templateId, rowId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${rowId}.pdf"`,
        });
        res.send(pdf);
    }
};
exports.RenderController = RenderController;
__decorate([
    (0, common_1.Get)(':templateId/:rowId/docx'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('rowId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RenderController.prototype, "renderDocx", null);
__decorate([
    (0, common_1.Get)(':templateId/:rowId/pdf'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('rowId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RenderController.prototype, "renderPdf", null);
exports.RenderController = RenderController = __decorate([
    (0, common_1.Controller)('render'),
    __metadata("design:paramtypes", [render_service_1.RenderService,
        templates_service_1.TemplatesService,
        datasets_service_1.DatasetsService,
        conversion_service_1.ConversionService])
], RenderController);
//# sourceMappingURL=render.controller.js.map
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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const templates_service_1 = require("./templates.service");
const conversion_service_1 = require("../conversion/conversion.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const starter_templates_1 = require("./starters/starter-templates");
let TemplatesController = class TemplatesController {
    templatesService;
    conversionService;
    constructor(templatesService, conversionService) {
        this.templatesService = templatesService;
        this.conversionService = conversionService;
    }
    listStarters() {
        return [
            {
                source: 'shinecraft',
                label: starter_templates_1.SHINECRAFT_STARTER.label,
                description: starter_templates_1.SHINECRAFT_STARTER.description,
            },
            {
                source: 'blank',
                label: starter_templates_1.BLANK_STARTER.label,
                description: starter_templates_1.BLANK_STARTER.description,
            },
        ];
    }
    async import(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded (field name must be "file")');
        }
        const isDocx = file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (!isDocx) {
            throw new common_1.BadRequestException('Only .docx files are supported.');
        }
        return this.templatesService.createFromDocx(file.originalname, file.buffer);
    }
    async createNew(source, dto) {
        if (source !== 'blank' && source !== 'shinecraft') {
            throw new common_1.BadRequestException('source must be "blank" or "shinecraft"');
        }
        return this.templatesService.createFromStarter(source, dto?.templateName, {
            includeHeader: dto.includeHeader,
            includeFooter: dto.includeFooter,
            headerHtml: dto.headerHtml,
            footerHtml: dto.footerHtml,
        });
    }
    findAll() {
        return this.templatesService.findAll();
    }
    findOne(id) {
        return this.templatesService.findOne(id);
    }
    async updateContent(id, dto) {
        return this.templatesService.updateContent(id, dto.bodyHtml, dto.headerHtml, dto.footerHtml, dto.marginTop, dto.marginBottom, dto.marginLeft, dto.marginRight);
    }
    async rename(id, dto) {
        return this.templatesService.renameTemplate(id, dto.templateName ?? '');
    }
    async exportPdf(id, res) {
        const docxBuffer = this.templatesService.getDocxBuffer(id);
        const pdf = await this.conversionService.docxToPdf(docxBuffer, `${id}.docx`);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${id}.pdf"`,
        });
        res.send(pdf);
    }
    remove(id) {
        this.templatesService.remove(id);
        return { deleted: true };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)('starters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "listStarters", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "import", null);
__decorate([
    (0, common_1.Post)('new/:source'),
    __param(0, (0, common_1.Param)('source')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_template_dto_1.CreateFromStarterDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "createNew", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_template_dto_1.UpdateContentDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Patch)(':id/rename'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_template_dto_1.RenameTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "rename", null);
__decorate([
    (0, common_1.Get)(':id/export-pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "remove", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService,
        conversion_service_1.ConversionService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map
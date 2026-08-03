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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const export_service_1 = require("./export.service");
const templates_service_1 = require("../templates/templates.service");
const filename_formatter_1 = require("../templates/utils/filename-formatter");
let ExportController = class ExportController {
    exportService;
    templatesService;
    constructor(exportService, templatesService) {
        this.exportService = exportService;
        this.templatesService = templatesService;
    }
    exportZip(templateId, res) {
        const template = this.templatesService.findOne(templateId);
        const shortName = (0, filename_formatter_1.getShortTemplateInitials)(template.templateName);
        const year = new Date().getFullYear().toString().slice(-2);
        const zipFilename = `SCT ${shortName} ${year}_Merged.zip`;
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipFilename}"`,
        });
        const stream = this.exportService.exportAllAsZip(templateId);
        stream.pipe(res);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)(':templateId/zip'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExportController.prototype, "exportZip", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    __metadata("design:paramtypes", [export_service_1.ExportService,
        templates_service_1.TemplatesService])
], ExportController);
//# sourceMappingURL=export.controller.js.map
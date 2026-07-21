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
exports.DatasetsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const datasets_service_1 = require("./datasets.service");
const templates_service_1 = require("../templates/templates.service");
const csv_parser_1 = require("./utils/csv-parser");
let DatasetsController = class DatasetsController {
    datasetsService;
    templatesService;
    constructor(datasetsService, templatesService) {
        this.datasetsService = datasetsService;
        this.templatesService = templatesService;
    }
    list(templateId) {
        return this.datasetsService.listRows(templateId);
    }
    add(templateId, data) {
        return this.datasetsService.addRow(templateId, data);
    }
    async bulkUploadCsv(templateId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded (field name must be "file")');
        }
        const template = this.templatesService.findOne(templateId);
        const csvText = file.buffer.toString('utf-8');
        const parsed = (0, csv_parser_1.parseCsvForTemplate)(csvText, template.placeholders);
        const createdRows = parsed.rows.map((data) => this.datasetsService.addRow(templateId, data));
        return {
            createdCount: createdRows.length,
            matchedColumns: parsed.matchedColumns,
            unmatchedCsvColumns: parsed.unmatchedCsvColumns,
            missingPlaceholders: parsed.missingPlaceholders,
            rows: createdRows,
        };
    }
    update(templateId, rowId, data) {
        return this.datasetsService.updateRow(templateId, rowId, data);
    }
    remove(templateId, rowId) {
        this.datasetsService.deleteRow(templateId, rowId);
        return { deleted: true };
    }
    removeAll(templateId) {
        this.datasetsService.clearAll(templateId);
        return { cleared: true };
    }
};
exports.DatasetsController = DatasetsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DatasetsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DatasetsController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('bulk-csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DatasetsController.prototype, "bulkUploadCsv", null);
__decorate([
    (0, common_1.Patch)(':rowId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('rowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DatasetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':rowId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('rowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DatasetsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DatasetsController.prototype, "removeAll", null);
exports.DatasetsController = DatasetsController = __decorate([
    (0, common_1.Controller)('templates/:templateId/rows'),
    __metadata("design:paramtypes", [datasets_service_1.DatasetsService,
        templates_service_1.TemplatesService])
], DatasetsController);
//# sourceMappingURL=datasets.controller.js.map
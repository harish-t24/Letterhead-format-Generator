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
exports.DatasetsSummaryController = void 0;
const common_1 = require("@nestjs/common");
const datasets_service_1 = require("./datasets.service");
const templates_service_1 = require("../templates/templates.service");
let DatasetsSummaryController = class DatasetsSummaryController {
    datasetsService;
    templatesService;
    constructor(datasetsService, templatesService) {
        this.datasetsService = datasetsService;
        this.templatesService = templatesService;
    }
    list() {
        return this.templatesService.findAll().map((template) => {
            const { recordCount, lastUpdatedAt } = this.datasetsService.getSummary(template.id);
            return {
                templateId: template.id,
                datasetName: `${template.templateName} — Data`,
                templateName: template.templateName,
                recordCount,
                createdAt: template.createdAt,
                lastUpdatedAt,
            };
        });
    }
};
exports.DatasetsSummaryController = DatasetsSummaryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], DatasetsSummaryController.prototype, "list", null);
exports.DatasetsSummaryController = DatasetsSummaryController = __decorate([
    (0, common_1.Controller)('datasets'),
    __metadata("design:paramtypes", [datasets_service_1.DatasetsService,
        templates_service_1.TemplatesService])
], DatasetsSummaryController);
//# sourceMappingURL=datasets-summary.controller.js.map
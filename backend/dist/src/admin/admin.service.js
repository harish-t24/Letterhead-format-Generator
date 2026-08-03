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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const templates_service_1 = require("../templates/templates.service");
const datasets_service_1 = require("../datasets/datasets.service");
let AdminService = class AdminService {
    templatesService;
    datasetsService;
    constructor(templatesService, datasetsService) {
        this.templatesService = templatesService;
        this.datasetsService = datasetsService;
    }
    exportSystemBackup() {
        const templates = this.templatesService.findAll();
        const exportedTemplates = templates.map((t) => {
            let docxBase64 = '';
            if (t.docxPath && fs.existsSync(t.docxPath)) {
                docxBase64 = fs.readFileSync(t.docxPath).toString('base64');
            }
            return {
                ...t,
                docxBase64,
            };
        });
        const datasets = {};
        for (const t of templates) {
            datasets[t.id] = this.datasetsService.listRows(t.id);
        }
        return {
            version: '1.0',
            software: 'Shinecraft Template Merge Tool',
            exportedAt: new Date().toISOString(),
            templatesCount: exportedTemplates.length,
            templates: exportedTemplates,
            datasets,
        };
    }
    importSystemBackup(backupData) {
        if (!backupData || typeof backupData !== 'object') {
            throw new common_1.BadRequestException('Invalid backup payload');
        }
        if (!Array.isArray(backupData.templates)) {
            throw new common_1.BadRequestException('Backup payload is missing templates array');
        }
        const storageDir = path.join(process.cwd(), 'storage', 'uploads');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        let restoredTemplates = 0;
        let restoredRows = 0;
        for (const item of backupData.templates) {
            if (!item.id || !item.templateName)
                continue;
            const docxPath = path.join(storageDir, `${item.id}.docx`);
            if (item.docxBase64) {
                const buffer = Buffer.from(item.docxBase64, 'base64');
                fs.writeFileSync(docxPath, buffer);
            }
            const { docxBase64, ...record } = item;
            record.docxPath = docxPath;
            this.templatesService.templates.set(item.id, record);
            restoredTemplates++;
            if (backupData.datasets && Array.isArray(backupData.datasets[item.id])) {
                const rows = backupData.datasets[item.id];
                this.datasetsService.rowsByTemplate.set(item.id, rows);
                restoredRows += rows.length;
            }
        }
        this.templatesService.saveTemplates();
        this.datasetsService.saveDatasets();
        return {
            success: true,
            restoredTemplates,
            restoredRows,
            importedAt: new Date().toISOString(),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService,
        datasets_service_1.DatasetsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
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
exports.DatasetsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DATASETS_FILE = path.join(process.cwd(), 'storage', 'datasets.json');
let DatasetsService = class DatasetsService {
    rowsByTemplate = new Map();
    constructor() {
        const dir = path.dirname(DATASETS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.loadDatasets();
    }
    loadDatasets() {
        try {
            if (fs.existsSync(DATASETS_FILE)) {
                const data = fs.readFileSync(DATASETS_FILE, 'utf-8');
                const parsed = JSON.parse(data);
                this.rowsByTemplate = new Map(Object.entries(parsed));
            }
        }
        catch (err) {
            console.error('Failed to load datasets:', err?.message);
        }
    }
    saveDatasets() {
        try {
            const obj = Object.fromEntries(this.rowsByTemplate.entries());
            fs.writeFileSync(DATASETS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to save datasets:', err?.message);
        }
    }
    listRows(templateId) {
        return this.rowsByTemplate.get(templateId) || [];
    }
    addRow(templateId, data) {
        const now = new Date().toISOString();
        const row = {
            id: (0, uuid_1.v4)(),
            templateId,
            data,
            createdAt: now,
            updatedAt: now,
            lastUsedAt: null,
        };
        const existing = this.rowsByTemplate.get(templateId) || [];
        existing.push(row);
        this.rowsByTemplate.set(templateId, existing);
        this.saveDatasets();
        return row;
    }
    updateRow(templateId, rowId, data) {
        const rows = this.rowsByTemplate.get(templateId) || [];
        const row = rows.find((r) => r.id === rowId);
        if (!row)
            throw new common_1.NotFoundException(`Row ${rowId} not found`);
        row.data = { ...row.data, ...data };
        row.updatedAt = new Date().toISOString();
        this.saveDatasets();
        return row;
    }
    markUsed(templateId, rowId) {
        const rows = this.rowsByTemplate.get(templateId) || [];
        const row = rows.find((r) => r.id === rowId);
        if (row) {
            row.lastUsedAt = new Date().toISOString();
            this.saveDatasets();
        }
    }
    getRow(templateId, rowId) {
        const rows = this.rowsByTemplate.get(templateId) || [];
        const row = rows.find((r) => r.id === rowId);
        if (!row)
            throw new common_1.NotFoundException(`Row ${rowId} not found`);
        return row;
    }
    deleteRow(templateId, rowId) {
        const rows = this.rowsByTemplate.get(templateId) || [];
        this.rowsByTemplate.set(templateId, rows.filter((r) => r.id !== rowId));
        this.saveDatasets();
    }
    clearAll(templateId) {
        this.rowsByTemplate.set(templateId, []);
        this.saveDatasets();
    }
    getSummary(templateId) {
        const rows = this.rowsByTemplate.get(templateId) || [];
        const lastUpdatedAt = rows.reduce((latest, row) => {
            if (!latest || row.updatedAt > latest)
                return row.updatedAt;
            return latest;
        }, null);
        return { recordCount: rows.length, lastUpdatedAt };
    }
};
exports.DatasetsService = DatasetsService;
exports.DatasetsService = DatasetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatasetsService);
//# sourceMappingURL=datasets.service.js.map
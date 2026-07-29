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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mammoth = __importStar(require("mammoth"));
const placeholder_parser_1 = require("./utils/placeholder-parser");
const docx_builder_1 = require("./utils/docx-builder");
const starter_templates_1 = require("./starters/starter-templates");
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'uploads');
const METADATA_FILE = path.join(process.cwd(), 'storage', 'templates.json');
let TemplatesService = class TemplatesService {
    templates = new Map();
    constructor() {
        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
        }
        this.loadTemplates();
    }
    loadTemplates() {
        try {
            if (fs.existsSync(METADATA_FILE)) {
                const data = fs.readFileSync(METADATA_FILE, 'utf-8');
                const parsed = JSON.parse(data);
                for (const key of Object.keys(parsed)) {
                    const t = parsed[key];
                    if (t.marginTop !== undefined && t.marginTop > 5)
                        t.marginTop = t.marginTop / 80;
                    if (t.marginBottom !== undefined && t.marginBottom > 5)
                        t.marginBottom = t.marginBottom / 80;
                    if (t.marginLeft !== undefined && t.marginLeft > 5)
                        t.marginLeft = t.marginLeft / 80;
                    if (t.marginRight !== undefined && t.marginRight > 5)
                        t.marginRight = t.marginRight / 80;
                }
                this.templates = new Map(Object.entries(parsed));
            }
        }
        catch (err) {
            console.error('Failed to load templates metadata:', err?.message);
        }
    }
    saveTemplates() {
        try {
            const obj = Object.fromEntries(this.templates.entries());
            fs.writeFileSync(METADATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to save templates metadata:', err?.message);
        }
    }
    async createFromDocx(originalName, docxBuffer) {
        const id = (0, uuid_1.v4)();
        const docxPath = path.join(STORAGE_DIR, `${id}.docx`);
        fs.writeFileSync(docxPath, docxBuffer);
        const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
        const braceCheck = (0, placeholder_parser_1.validateBraces)(html);
        if (!braceCheck.valid) {
            throw new Error(`Template has malformed placeholders: ${braceCheck.error}`);
        }
        const placeholders = (0, placeholder_parser_1.extractPlaceholdersFromDocx)(docxBuffer);
        const now = new Date().toISOString();
        const record = {
            id,
            templateName: originalName.replace(/\.docx$/i, ''),
            originalName,
            docxPath,
            html,
            placeholders,
            source: 'imported',
            createdAt: now,
            updatedAt: now,
        };
        this.templates.set(id, record);
        this.saveTemplates();
        return record;
    }
    async createFromStarter(source, templateName, options) {
        const starter = (0, starter_templates_1.getStarter)(source);
        const id = (0, uuid_1.v4)();
        const docxPath = path.join(STORAGE_DIR, `${id}.docx`);
        const includeHeader = options?.includeHeader !== undefined ? options.includeHeader : starter.header;
        const includeFooter = options?.includeFooter !== undefined ? options.includeFooter : starter.footer;
        const headerHtml = options?.headerHtml !== undefined ? options.headerHtml : starter.headerHtml;
        const footerHtml = options?.footerHtml !== undefined ? options.footerHtml : starter.footerHtml;
        const DEFAULT_TOP = 5.4 / 2.54;
        const DEFAULT_BOTTOM = 0.63 / 2.54;
        const DEFAULT_LEFT = 2.16 / 2.54;
        const DEFAULT_RIGHT = 1.27 / 2.54;
        const docxBuffer = await (0, docx_builder_1.buildDocx)({
            bodyHtml: starter.bodyHtml,
            headerHtml: headerHtml,
            footerHtml: footerHtml,
            includeHeader: includeHeader,
            includeFooter: includeFooter,
            marginTop: DEFAULT_TOP,
            marginBottom: DEFAULT_BOTTOM,
            marginLeft: DEFAULT_LEFT,
            marginRight: DEFAULT_RIGHT,
        });
        fs.writeFileSync(docxPath, docxBuffer);
        const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
        const placeholders = (0, placeholder_parser_1.extractPlaceholdersFromDocx)(docxBuffer);
        const now = new Date().toISOString();
        const record = {
            id,
            templateName: templateName?.trim() || starter.label,
            originalName: `${starter.label}.docx`,
            docxPath,
            html,
            bodyHtml: starter.bodyHtml,
            headerHtml: includeHeader ? headerHtml : '',
            footerHtml: includeFooter ? footerHtml : '',
            placeholders,
            source: source,
            createdAt: now,
            updatedAt: now,
            marginTop: DEFAULT_TOP,
            marginBottom: DEFAULT_BOTTOM,
            marginLeft: DEFAULT_LEFT,
            marginRight: DEFAULT_RIGHT,
        };
        this.templates.set(id, record);
        this.saveTemplates();
        return record;
    }
    async updateContent(id, bodyHtml, headerHtml, footerHtml, marginTop, marginBottom, marginLeft, marginRight) {
        const record = this.findOne(id);
        if (record.source === 'imported') {
            throw new Error('Imported templates cannot be edited this way — re-import instead.');
        }
        const DEFAULT_TOP = 5.4 / 2.54;
        const DEFAULT_BOTTOM = 0.63 / 2.54;
        const DEFAULT_LEFT = 2.16 / 2.54;
        const DEFAULT_RIGHT = 1.27 / 2.54;
        const finalBodyHtml = bodyHtml !== undefined ? bodyHtml : (record.bodyHtml ?? record.html);
        const finalHeaderHtml = headerHtml !== undefined ? headerHtml : record.headerHtml;
        const finalFooterHtml = footerHtml !== undefined ? footerHtml : record.footerHtml;
        const rawMarginTop = marginTop !== undefined ? marginTop : (record.marginTop ?? DEFAULT_TOP);
        const finalMarginTop = rawMarginTop > 5 ? rawMarginTop / 80 : rawMarginTop;
        const rawMarginBottom = marginBottom !== undefined ? marginBottom : (record.marginBottom ?? DEFAULT_BOTTOM);
        const finalMarginBottom = rawMarginBottom > 5 ? rawMarginBottom / 80 : rawMarginBottom;
        const rawMarginLeft = marginLeft !== undefined ? marginLeft : (record.marginLeft ?? DEFAULT_LEFT);
        const finalMarginLeft = rawMarginLeft > 5 ? rawMarginLeft / 80 : rawMarginLeft;
        const rawMarginRight = marginRight !== undefined ? marginRight : (record.marginRight ?? DEFAULT_RIGHT);
        const finalMarginRight = rawMarginRight > 5 ? rawMarginRight / 80 : rawMarginRight;
        const braceCheck = (0, placeholder_parser_1.validateBraces)(finalBodyHtml);
        if (!braceCheck.valid) {
            throw new Error(`Malformed placeholders: ${braceCheck.error}`);
        }
        const docxBuffer = await (0, docx_builder_1.buildDocx)({
            bodyHtml: finalBodyHtml,
            headerHtml: finalHeaderHtml,
            footerHtml: finalFooterHtml,
            includeHeader: !!finalHeaderHtml,
            includeFooter: !!finalFooterHtml,
            marginTop: finalMarginTop,
            marginBottom: finalMarginBottom,
            marginLeft: finalMarginLeft,
            marginRight: finalMarginRight,
        });
        fs.writeFileSync(record.docxPath, docxBuffer);
        const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
        record.html = html;
        record.bodyHtml = finalBodyHtml;
        record.headerHtml = finalHeaderHtml;
        record.footerHtml = finalFooterHtml;
        record.marginTop = finalMarginTop;
        record.marginBottom = finalMarginBottom;
        record.marginLeft = finalMarginLeft;
        record.marginRight = finalMarginRight;
        record.placeholders = (0, placeholder_parser_1.extractPlaceholdersFromDocx)(docxBuffer);
        record.updatedAt = new Date().toISOString();
        this.saveTemplates();
        return record;
    }
    async renameTemplate(id, templateName) {
        const record = this.findOne(id);
        record.templateName = templateName.trim() || record.templateName;
        record.updatedAt = new Date().toISOString();
        this.saveTemplates();
        return record;
    }
    findAll() {
        return Array.from(this.templates.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    findOne(id) {
        const record = this.templates.get(id);
        if (!record)
            throw new common_1.NotFoundException(`Template ${id} not found`);
        return record;
    }
    getDocxBuffer(id) {
        const record = this.findOne(id);
        return fs.readFileSync(record.docxPath);
    }
    remove(id) {
        const record = this.findOne(id);
        if (fs.existsSync(record.docxPath))
            fs.unlinkSync(record.docxPath);
        this.templates.delete(id);
        this.saveTemplates();
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map
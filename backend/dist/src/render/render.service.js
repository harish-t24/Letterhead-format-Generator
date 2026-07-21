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
var RenderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderService = void 0;
const common_1 = require("@nestjs/common");
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
let RenderService = RenderService_1 = class RenderService {
    logger = new common_1.Logger(RenderService_1.name);
    merge(templateDocxBuffer, rowData) {
        const zip = new pizzip_1.default(templateDocxBuffer);
        const doc = new docxtemplater_1.default(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{', end: '}' },
        });
        try {
            doc.render(rowData);
        }
        catch (error) {
            const details = error?.properties?.errors
                ?.map((e) => e?.properties?.explanation)
                .filter(Boolean)
                .join('; ') || error.message;
            this.logger.error(`Merge failed: ${details}`);
            throw new common_1.BadRequestException(`Template merge failed: ${details}`);
        }
        return doc.getZip().generate({ type: 'nodebuffer' });
    }
};
exports.RenderService = RenderService;
exports.RenderService = RenderService = RenderService_1 = __decorate([
    (0, common_1.Injectable)()
], RenderService);
//# sourceMappingURL=render.service.js.map
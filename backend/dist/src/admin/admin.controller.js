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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    exportSystem(res) {
        const backup = this.adminService.exportSystemBackup();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `SCT_System_Backup_${timestamp}.json`;
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        res.send(JSON.stringify(backup, null, 2));
    }
    importSystem(payload) {
        return this.adminService.importSystemBackup(payload);
    }
    importSystemFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No backup file provided');
        }
        try {
            const content = file.buffer.toString('utf-8');
            const json = JSON.parse(content);
            return this.adminService.importSystemBackup(json);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Invalid JSON backup file: ${err?.message}`);
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('export-system'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "exportSystem", null);
__decorate([
    (0, common_1.Post)('import-system'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "importSystem", null);
__decorate([
    (0, common_1.Post)('import-system-file'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "importSystemFile", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
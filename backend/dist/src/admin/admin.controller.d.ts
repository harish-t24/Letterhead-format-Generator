import type { Response } from 'express';
import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    exportSystem(res: Response): void;
    importSystem(payload: any): {
        success: boolean;
        restoredTemplates: number;
        restoredRows: number;
        importedAt: string;
    };
    importSystemFile(file: Express.Multer.File): {
        success: boolean;
        restoredTemplates: number;
        restoredRows: number;
        importedAt: string;
    };
}

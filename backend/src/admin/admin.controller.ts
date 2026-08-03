import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('export-system')
  exportSystem(@Res() res: Response) {
    const backup = this.adminService.exportSystemBackup();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `SCT_System_Backup_${timestamp}.json`;

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(JSON.stringify(backup, null, 2));
  }

  @Post('import-system')
  importSystem(@Body() payload: any) {
    return this.adminService.importSystemBackup(payload);
  }

  @Post('import-system-file')
  @UseInterceptors(FileInterceptor('file'))
  importSystemFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No backup file provided');
    }
    try {
      const content = file.buffer.toString('utf-8');
      const json = JSON.parse(content);
      return this.adminService.importSystemBackup(json);
    } catch (err: any) {
      throw new BadRequestException(`Invalid JSON backup file: ${err?.message}`);
    }
  }
}

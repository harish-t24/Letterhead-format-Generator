import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':templateId/zip')
  exportZip(@Param('templateId') templateId: string, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="export-${templateId}.zip"`,
    });
    const stream = this.exportService.exportAllAsZip(templateId);
    stream.pipe(res);
  }
}

import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { TemplatesService } from '../templates/templates.service';
import { getShortTemplateInitials } from '../templates/utils/filename-formatter';

@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly templatesService: TemplatesService,
  ) {}

  @Get(':templateId/zip')
  exportZip(@Param('templateId') templateId: string, @Res() res: Response) {
    const template = this.templatesService.findOne(templateId);
    const shortName = getShortTemplateInitials(template.templateName);
    const year = new Date().getFullYear().toString().slice(-2);
    const zipFilename = `SCT ${shortName} ${year}_Merged.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFilename}"`,
    });
    const stream = this.exportService.exportAllAsZip(templateId);
    stream.pipe(res);
  }
}

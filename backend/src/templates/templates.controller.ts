import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { TemplatesService } from './templates.service';
import { ConversionService } from '../conversion/conversion.service';
import { CreateFromStarterDto, RenameTemplateDto, UpdateContentDto } from './dto/create-template.dto';
import { BLANK_STARTER, SHINECRAFT_STARTER } from './starters/starter-templates';

@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly conversionService: ConversionService,
  ) {}

  /** Lists the starting-point options shown in the "New Template" dialog. */
  @Get('starters')
  listStarters() {
    return [
      {
        source: 'shinecraft',
        label: SHINECRAFT_STARTER.label,
        description: SHINECRAFT_STARTER.description,
      },
      {
        source: 'blank',
        label: BLANK_STARTER.label,
        description: BLANK_STARTER.description,
      },
    ];
  }

  /**
   * Import a new template. DOCX only — this app works exclusively in DOCX
   * (a flowing format) so header/footer, reflow, and merges all stay
   * reliable. Conversion to PDF only ever happens at download/export time
   * (see /templates/:id/export-pdf and /render/.../pdf), never on import.
   */
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded (field name must be "file")');
    }

    const isDocx =
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isDocx) {
      throw new BadRequestException('Only .docx files are supported.');
    }

    return this.templatesService.createFromDocx(file.originalname, file.buffer);
  }

  /** Create a brand-new template from a starting point ("blank" or "shinecraft"). */
  @Post('new/:source')
  async createNew(@Param('source') source: string, @Body() dto: CreateFromStarterDto) {
    if (source !== 'blank' && source !== 'shinecraft') {
      throw new BadRequestException('source must be "blank" or "shinecraft"');
    }
    return this.templatesService.createFromStarter(source, dto?.templateName, {
      includeHeader: dto.includeHeader,
      includeFooter: dto.includeFooter,
      headerHtml: dto.headerHtml,
      footerHtml: dto.footerHtml,
    });
  }

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  /** Saves edited body content back into the DOCX (header/footer preserved untouched). */
  @Patch(':id/content')
  async updateContent(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.templatesService.updateContent(id, dto.bodyHtml, dto.headerHtml, dto.footerHtml);
  }

  @Patch(':id/rename')
  async rename(@Param('id') id: string, @Body() dto: RenameTemplateDto) {
    return this.templatesService.renameTemplate(id, dto.templateName ?? '');
  }

  /** Converts the CURRENT saved state of the template straight to PDF —
   * no row data / merge involved. This is the "Save As PDF" of the raw
   * document itself (letterhead + whatever body content exists). */
  @Get(':id/export-pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const docxBuffer = this.templatesService.getDocxBuffer(id);
    const pdf = await this.conversionService.docxToPdf(docxBuffer, `${id}.docx`);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${id}.pdf"`,
    });
    res.send(pdf);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.templatesService.remove(id);
    return { deleted: true };
  }
}

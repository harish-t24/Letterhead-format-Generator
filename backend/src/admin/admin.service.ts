import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TemplatesService } from '../templates/templates.service';
import { DatasetsService } from '../datasets/datasets.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly datasetsService: DatasetsService,
  ) {}

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

    const datasets: Record<string, any[]> = {};
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

  importSystemBackup(backupData: any) {
    if (!backupData || typeof backupData !== 'object') {
      throw new BadRequestException('Invalid backup payload');
    }
    if (!Array.isArray(backupData.templates)) {
      throw new BadRequestException('Backup payload is missing templates array');
    }

    const storageDir = path.join(process.cwd(), 'storage', 'uploads');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    let restoredTemplates = 0;
    let restoredRows = 0;

    for (const item of backupData.templates) {
      if (!item.id || !item.templateName) continue;

      const docxPath = path.join(storageDir, `${item.id}.docx`);
      if (item.docxBase64) {
        const buffer = Buffer.from(item.docxBase64, 'base64');
        fs.writeFileSync(docxPath, buffer);
      }

      const { docxBase64, ...record } = item;
      record.docxPath = docxPath;

      (this.templatesService as any).templates.set(item.id, record);
      restoredTemplates++;

      if (backupData.datasets && Array.isArray(backupData.datasets[item.id])) {
        const rows = backupData.datasets[item.id];
        (this.datasetsService as any).rowsByTemplate.set(item.id, rows);
        restoredRows += rows.length;
      }
    }

    (this.templatesService as any).saveTemplates();
    (this.datasetsService as any).saveDatasets();

    return {
      success: true,
      restoredTemplates,
      restoredRows,
      importedAt: new Date().toISOString(),
    };
  }
}

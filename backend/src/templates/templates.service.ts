import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import { TemplateRecord, TemplateSource } from './template.types';
import { extractPlaceholders, validateBraces, extractPlaceholdersFromDocx } from './utils/placeholder-parser';
import { buildDocx } from './utils/docx-builder';
import { getStarter } from './starters/starter-templates';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'uploads');
const METADATA_FILE = path.join(process.cwd(), 'storage', 'templates.json');

@Injectable()
export class TemplatesService {
  private templates = new Map<string, TemplateRecord>();

  constructor() {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    this.loadTemplates();
  }

  private loadTemplates() {
    try {
      if (fs.existsSync(METADATA_FILE)) {
        const data = fs.readFileSync(METADATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        this.templates = new Map<string, TemplateRecord>(Object.entries(parsed));
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to load templates metadata:', err?.message);
    }
  }

  private saveTemplates() {
    try {
      const obj = Object.fromEntries(this.templates.entries());
      fs.writeFileSync(METADATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to save templates metadata:', err?.message);
    }
  }

  // ---------- Import flow (existing) ----------

  async createFromDocx(originalName: string, docxBuffer: Buffer): Promise<TemplateRecord> {
    const id = uuidv4();
    const docxPath = path.join(STORAGE_DIR, `${id}.docx`);
    fs.writeFileSync(docxPath, docxBuffer);

    const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });

    const braceCheck = validateBraces(html);
    if (!braceCheck.valid) {
      throw new Error(`Template has malformed placeholders: ${braceCheck.error}`);
    }

    const placeholders = extractPlaceholdersFromDocx(docxBuffer);
    const now = new Date().toISOString();

    const record: TemplateRecord = {
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

  // ---------- "New Template" flow (blank / shinecraft) ----------

  async createFromStarter(
    source: 'blank' | 'shinecraft',
    templateName: string,
    options?: {
      includeHeader?: boolean;
      includeFooter?: boolean;
      headerHtml?: string;
      footerHtml?: string;
    }
  ): Promise<TemplateRecord> {
    const starter = getStarter(source);
    const id = uuidv4();
    const docxPath = path.join(STORAGE_DIR, `${id}.docx`);

    const includeHeader = options?.includeHeader !== undefined ? options.includeHeader : starter.header;
    const includeFooter = options?.includeFooter !== undefined ? options.includeFooter : starter.footer;
    const headerHtml = options?.headerHtml !== undefined ? options.headerHtml : starter.headerHtml;
    const footerHtml = options?.footerHtml !== undefined ? options.footerHtml : starter.footerHtml;

    const docxBuffer = await buildDocx({
      bodyHtml: starter.bodyHtml,
      headerHtml: headerHtml,
      footerHtml: footerHtml,
      includeHeader: includeHeader,
      includeFooter: includeFooter,
    });
    fs.writeFileSync(docxPath, docxBuffer);

    const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
    const placeholders = extractPlaceholdersFromDocx(docxBuffer);
    const now = new Date().toISOString();

    const record: TemplateRecord = {
      id,
      templateName: templateName?.trim() || starter.label,
      originalName: `${starter.label}.docx`,
      docxPath,
      html,
      bodyHtml: starter.bodyHtml,
      headerHtml: includeHeader ? headerHtml : '',
      footerHtml: includeFooter ? footerHtml : '',
      placeholders,
      source: source as TemplateSource,
      createdAt: now,
      updatedAt: now,
    };

    this.templates.set(id, record);
    this.saveTemplates();
    return record;
  }

  /** Re-saves a "New Template" flow document's body content (from the
   * editor), regenerating the DOCX with the original header/footer
   * untouched. Not available for imported templates (no bodyHtml/header
   * separation exists for those). */
  async updateContent(
    id: string,
    bodyHtml?: string,
    headerHtml?: string,
    footerHtml?: string
  ): Promise<TemplateRecord> {
    const record = this.findOne(id);
    if (record.source === 'imported') {
      throw new Error('Imported templates cannot be edited this way — re-import instead.');
    }

    const finalBodyHtml = bodyHtml !== undefined ? bodyHtml : (record.bodyHtml ?? record.html);
    const finalHeaderHtml = headerHtml !== undefined ? headerHtml : record.headerHtml;
    const finalFooterHtml = footerHtml !== undefined ? footerHtml : record.footerHtml;

    const braceCheck = validateBraces(finalBodyHtml);
    if (!braceCheck.valid) {
      throw new Error(`Malformed placeholders: ${braceCheck.error}`);
    }

    const docxBuffer = await buildDocx({
      bodyHtml: finalBodyHtml,
      headerHtml: finalHeaderHtml,
      footerHtml: finalFooterHtml,
      includeHeader: !!finalHeaderHtml,
      includeFooter: !!finalFooterHtml,
    });
    fs.writeFileSync(record.docxPath, docxBuffer);

    const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
    record.html = html;
    record.bodyHtml = finalBodyHtml;
    record.headerHtml = finalHeaderHtml;
    record.footerHtml = finalFooterHtml;
    record.placeholders = extractPlaceholdersFromDocx(docxBuffer);
    record.updatedAt = new Date().toISOString();
    this.saveTemplates();
    return record;
  }

  async renameTemplate(id: string, templateName: string): Promise<TemplateRecord> {
    const record = this.findOne(id);
    record.templateName = templateName.trim() || record.templateName;
    record.updatedAt = new Date().toISOString();
    this.saveTemplates();
    return record;
  }

  // ---------- Shared ----------

  findAll(): TemplateRecord[] {
    return Array.from(this.templates.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findOne(id: string): TemplateRecord {
    const record = this.templates.get(id);
    if (!record) throw new NotFoundException(`Template ${id} not found`);
    return record;
  }

  getDocxBuffer(id: string): Buffer {
    const record = this.findOne(id);
    return fs.readFileSync(record.docxPath);
  }

  remove(id: string): void {
    const record = this.findOne(id);
    if (fs.existsSync(record.docxPath)) fs.unlinkSync(record.docxPath);
    this.templates.delete(id);
    this.saveTemplates();
  }
}

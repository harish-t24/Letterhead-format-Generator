import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatasetRow } from './dataset-row.types';
import * as fs from 'fs';
import * as path from 'path';

const DATASETS_FILE = path.join(process.cwd(), 'storage', 'datasets.json');

@Injectable()
export class DatasetsService {
  private rowsByTemplate = new Map<string, DatasetRow[]>();

  constructor() {
    const dir = path.dirname(DATASETS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.loadDatasets();
  }

  private loadDatasets() {
    try {
      if (fs.existsSync(DATASETS_FILE)) {
        const data = fs.readFileSync(DATASETS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        this.rowsByTemplate = new Map<string, DatasetRow[]>(Object.entries(parsed));
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to load datasets:', err?.message);
    }
  }

  private saveDatasets() {
    try {
      const obj = Object.fromEntries(this.rowsByTemplate.entries());
      fs.writeFileSync(DATASETS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to save datasets:', err?.message);
    }
  }

  listRows(templateId: string): DatasetRow[] {
    return this.rowsByTemplate.get(templateId) || [];
  }

  addRow(templateId: string, data: Record<string, string>): DatasetRow {
    const now = new Date().toISOString();
    const row: DatasetRow = {
      id: uuidv4(),
      templateId,
      data,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
    };
    const existing = this.rowsByTemplate.get(templateId) || [];
    existing.push(row);
    this.rowsByTemplate.set(templateId, existing);
    this.saveDatasets();
    return row;
  }

  updateRow(templateId: string, rowId: string, data: Record<string, string>): DatasetRow {
    const rows = this.rowsByTemplate.get(templateId) || [];
    const row = rows.find((r) => r.id === rowId);
    if (!row) throw new NotFoundException(`Row ${rowId} not found`);
    row.data = { ...row.data, ...data };
    row.updatedAt = new Date().toISOString();
    this.saveDatasets();
    return row;
  }

  markUsed(templateId: string, rowId: string): void {
    const rows = this.rowsByTemplate.get(templateId) || [];
    const row = rows.find((r) => r.id === rowId);
    if (row) {
      row.lastUsedAt = new Date().toISOString();
      this.saveDatasets();
    }
  }

  getRow(templateId: string, rowId: string): DatasetRow {
    const rows = this.rowsByTemplate.get(templateId) || [];
    const row = rows.find((r) => r.id === rowId);
    if (!row) throw new NotFoundException(`Row ${rowId} not found`);
    return row;
  }

  deleteRow(templateId: string, rowId: string): void {
    const rows = this.rowsByTemplate.get(templateId) || [];
    this.rowsByTemplate.set(
      templateId,
      rows.filter((r) => r.id !== rowId),
    );
    this.saveDatasets();
  }

  clearAll(templateId: string): void {
    this.rowsByTemplate.set(templateId, []);
    this.saveDatasets();
  }

  /** Summary stats used by the cross-template Datasets list page. */
  getSummary(templateId: string): { recordCount: number; lastUpdatedAt: string | null } {
    const rows = this.rowsByTemplate.get(templateId) || [];
    const lastUpdatedAt = rows.reduce<string | null>((latest, row) => {
      if (!latest || row.updatedAt > latest) return row.updatedAt;
      return latest;
    }, null);
    return { recordCount: rows.length, lastUpdatedAt };
  }
}

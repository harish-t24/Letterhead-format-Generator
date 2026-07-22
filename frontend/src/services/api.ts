import axios from 'axios';
import type { TemplateRecord, StarterOption } from '../types/template';
import type { DatasetRow, DatasetSummary, BulkCsvResult } from '../types/dataset';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL: BASE_URL });

// ---- Templates ----

export async function importTemplate(file: File): Promise<TemplateRecord> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<TemplateRecord>('/templates/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function listStarters(): Promise<StarterOption[]> {
  const res = await api.get<StarterOption[]>('/templates/starters');
  return res.data;
}

export async function createFromStarter(
  source: 'blank' | 'shinecraft',
  templateName: string,
  options?: {
    includeHeader?: boolean;
    includeFooter?: boolean;
    headerHtml?: string;
    footerHtml?: string;
  }
): Promise<TemplateRecord> {
  const res = await api.post<TemplateRecord>(`/templates/new/${source}`, {
    templateName,
    ...options,
  });
  return res.data;
}

export async function updateTemplateContent(
  templateId: string,
  bodyHtml?: string,
  headerHtml?: string,
  footerHtml?: string,
  marginTop?: number,
  marginBottom?: number,
  marginLeft?: number,
  marginRight?: number,
): Promise<TemplateRecord> {
  const res = await api.patch<TemplateRecord>(`/templates/${templateId}/content`, {
    bodyHtml,
    headerHtml,
    footerHtml,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  });
  return res.data;
}

export async function renameTemplate(
  templateId: string,
  templateName: string,
): Promise<TemplateRecord> {
  const res = await api.patch<TemplateRecord>(`/templates/${templateId}/rename`, { templateName });
  return res.data;
}

export function templateExportPdfUrl(templateId: string): string {
  return `${BASE_URL}/templates/${templateId}/export-pdf`;
}

export async function listTemplates(): Promise<TemplateRecord[]> {
  const res = await api.get<TemplateRecord[]>('/templates');
  return res.data;
}

export async function getTemplate(id: string): Promise<TemplateRecord> {
  const res = await api.get<TemplateRecord>(`/templates/${id}`);
  return res.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}

// ---- Dataset rows ----

export async function listRows(templateId: string): Promise<DatasetRow[]> {
  const res = await api.get<DatasetRow[]>(`/templates/${templateId}/rows`);
  return res.data;
}

export async function addRow(
  templateId: string,
  data: Record<string, string>,
): Promise<DatasetRow> {
  const res = await api.post<DatasetRow>(`/templates/${templateId}/rows`, data);
  return res.data;
}

export async function updateRow(
  templateId: string,
  rowId: string,
  data: Record<string, string>,
): Promise<DatasetRow> {
  const res = await api.patch<DatasetRow>(`/templates/${templateId}/rows/${rowId}`, data);
  return res.data;
}

export async function deleteRow(templateId: string, rowId: string): Promise<void> {
  await api.delete(`/templates/${templateId}/rows/${rowId}`);
}

export async function clearDataset(templateId: string): Promise<void> {
  await api.delete(`/templates/${templateId}/rows`);
}

export async function uploadDatasetCsv(templateId: string, file: File): Promise<BulkCsvResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<BulkCsvResult>(`/templates/${templateId}/rows/bulk-csv`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function listDatasetSummaries(): Promise<DatasetSummary[]> {
  const res = await api.get<DatasetSummary[]>('/datasets');
  return res.data;
}

// ---- Render / preview / export ----

export function renderPdfUrl(templateId: string, rowId: string): string {
  return `${BASE_URL}/render/${templateId}/${rowId}/pdf`;
}

export function renderDocxUrl(templateId: string, rowId: string): string {
  return `${BASE_URL}/render/${templateId}/${rowId}/docx`;
}

export function exportZipUrl(templateId: string): string {
  return `${BASE_URL}/export/${templateId}/zip`;
}

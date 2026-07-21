export type TemplateSource = 'imported' | 'blank' | 'shinecraft';

export interface TemplateRecord {
  id: string;
  templateName: string;
  originalName: string;
  html: string;
  bodyHtml?: string;
  headerHtml?: string;
  footerHtml?: string;
  placeholders: string[];
  source: TemplateSource;
  createdAt: string;
  updatedAt: string;
}

export interface StarterOption {
  source: 'blank' | 'shinecraft';
  label: string;
  description: string;
}

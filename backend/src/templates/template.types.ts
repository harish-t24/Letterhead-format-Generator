export type TemplateSource = 'imported' | 'blank' | 'shinecraft';

export interface TemplateRecord {
  id: string;
  /** User-facing name -- editable, distinct from the original uploaded filename. */
  templateName: string;
  originalName: string;
  /** Absolute path on disk to the canonical DOCX for this template. */
  docxPath: string;
  /** Full-document HTML (via mammoth) used for the editor/preview pane.
   *  NOTE: mammoth does not extract header/footer content, so this is
   *  body-only even for templates that have a header/footer -- which is
   *  exactly what keeps header/footer out of the text editor and only
   *  visible in the rendered PDF preview. */
  html: string;
  /** For templates created via "New Template" (blank or shinecraft), the
   *  raw body HTML as last saved from the editor. Undefined for imported
   *  templates, where the docx itself is the source of truth. */
  bodyHtml?: string;
  /** Header/footer HTML used to regenerate the docx on every save.
   *  Never shown in the editor -- only baked into the PDF on export. */
  headerHtml?: string;
  footerHtml?: string;
  /** Unique {placeholder} names detected in the template, in order. */
  placeholders: string[];
  source: TemplateSource;
  createdAt: string;
  updatedAt: string;
}

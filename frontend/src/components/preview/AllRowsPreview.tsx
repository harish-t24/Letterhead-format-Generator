import type { DatasetRow } from '../../types/dataset';
import type { TemplateRecord } from '../../types/template';
import { A4DocumentPreview } from './A4DocumentPreview';

interface Props {
  templateId: string;
  template?: TemplateRecord | null;
  rows: DatasetRow[];
}

function mergeHtml(templateHtml?: string, rowData?: Record<string, string>): string {
  if (!templateHtml) return '';
  let merged = templateHtml;
  if (rowData) {
    for (const [key, val] of Object.entries(rowData)) {
      const regex = new RegExp(`\\{${key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\}`, 'gi');
      merged = merged.replace(regex, val ?? '');
    }
  }
  return merged;
}

export function AllRowsPreview({ template, rows }: Props) {
  if (rows.length === 0) {
    return <p style={{ color: '#9ca3af' }}>No rows to preview yet — add a row first.</p>;
  }

  return (
    <div style={{ maxHeight: '75vh', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: '16px 8px' }}>
      {rows.map((row, idx) => (
        <div key={row.id} style={{ padding: '0 8px 32px' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              background: '#f5f5ff',
              color: '#4338ca',
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 12px',
              margin: '0 -8px 16px',
              borderBottom: '1px solid #e0e0f8',
              zIndex: 30,
              borderRadius: 4,
            }}
          >
            Row {String(idx + 1).padStart(3, '0')} of {String(rows.length).padStart(3, '0')}
            {row.data && Object.keys(row.data).length > 0
              ? ` — ${Object.values(row.data)[0] || String(idx + 1).padStart(3, '0')}`
              : ` — ${String(idx + 1).padStart(3, '0')}`}
          </div>
          <A4DocumentPreview
            bodyHtml={mergeHtml(template?.bodyHtml ?? template?.html, row.data)}
            headerHtml={mergeHtml(template?.headerHtml, row.data)}
            footerHtml={mergeHtml(template?.footerHtml, row.data)}
            marginTop={template?.marginTop}
            marginBottom={template?.marginBottom}
            marginLeft={template?.marginLeft}
            marginRight={template?.marginRight}
          />
        </div>
      ))}
    </div>
  );
}

import type { DatasetRow } from '../../types/dataset';
import * as api from '../../services/api';
import { PdfDocumentView } from './PdfDocumentView';

interface Props {
  templateId: string;
  rows: DatasetRow[];
}

/**
 * Shows every row's merged document back-to-back in one scrollable panel —
 * like flipping through a stack of printed letters, one per table row.
 * Each row's PDF (which may itself be multiple pages) is rendered in full.
 */
export function AllRowsPreview({ templateId, rows }: Props) {
  if (rows.length === 0) {
    return <p style={{ color: '#9ca3af' }}>No rows to preview yet — add a row first.</p>;
  }

  return (
    <div style={{ maxHeight: '75vh', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      {rows.map((row, idx) => (
        <div key={row.id} style={{ padding: '0 8px 24px' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              background: '#f5f5ff',
              color: '#4338ca',
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 8px',
              margin: '0 -8px 8px',
              borderBottom: '1px solid #e0e0f8',
              zIndex: 1,
            }}
          >
            Row {idx + 1} of {rows.length}
            {row.data && Object.keys(row.data).length > 0
              ? ` — ${Object.values(row.data)[0] || row.id.slice(0, 8)}`
              : ` — ${row.id.slice(0, 8)}`}
          </div>
          <PdfDocumentView pdfUrl={api.renderPdfUrl(templateId, row.id)} scale={1.1} />
        </div>
      ))}
    </div>
  );
}

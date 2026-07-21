interface Props {
  templateId: string;
  fieldCount: number;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Right-side "Template Info" card. Note: this deliberately doesn't show
 * a page count -- computing real pages requires a full DOCX->PDF
 * conversion (via Gotenberg), which isn't something we want to trigger
 * on every render just to display a number. The Preview pane shows the
 * real paginated result instead.
 */
export function TemplateInfoPanel({ templateId, fieldCount, createdAt }: Props) {
  return (
    <div style={{ width: 190, flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '0.05em' }}>
        TEMPLATE INFO
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12 }}>
        <div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>Template ID</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{templateId.slice(0, 8)}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>Dynamic Fields</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            <span className="badge badge-primary" style={{ padding: '2px 8px' }}>{fieldCount} fields</span>
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>Created At</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(createdAt)}</div>
        </div>
      </div>
    </div>
  );
}

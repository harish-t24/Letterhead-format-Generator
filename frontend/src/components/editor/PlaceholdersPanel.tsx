interface Props {
  placeholders: string[];
  onInsert?: (name: string) => void;
  readOnly?: boolean;
}

/**
 * Left-side panel listing every {placeholder} detected in the template.
 * Click a chip to insert it into the document at the current cursor
 * position (click-to-insert, rather than drag-and-drop -- same end
 * result, simpler and more reliable across browsers/devices).
 */
export function PlaceholdersPanel({ placeholders, onInsert, readOnly }: Props) {
  return (
    <div style={{ width: 190, flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2, letterSpacing: '0.05em' }}>
        PLACEHOLDERS
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
        {readOnly ? 'Fields detected in this document' : 'Click to insert into document'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {placeholders.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>None detected yet</span>
        )}
        {placeholders.map((p) => (
          <button
            key={p}
            onClick={() => onInsert?.(p)}
            disabled={readOnly || !onInsert}
            style={{
              textAlign: 'left',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--primary-light)',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'monospace',
              cursor: readOnly || !onInsert ? 'default' : 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              if (!readOnly && onInsert) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-light)';
              }
            }}
            onMouseLeave={(e) => {
              if (!readOnly && onInsert) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-glow)';
              }
            }}
          >
            {`{${p}}`}
          </button>
        ))}
      </div>
    </div>
  );
}

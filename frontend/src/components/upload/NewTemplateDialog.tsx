import { useEffect, useRef, useState } from 'react';
import type { StarterOption } from '../../types/template';
import * as api from '../../services/api';

type Choice = 'blank' | 'shinecraft' | 'import';

interface Props {
  onClose: () => void;
  onCreate: (
    source: 'blank' | 'shinecraft',
    templateName: string,
    options?: {
      includeHeader?: boolean;
      includeFooter?: boolean;
      headerHtml?: string;
      footerHtml?: string;
    }
  ) => void;
  onImport: (file: File) => void;
  creating?: boolean;
  importing?: boolean;
}

export function NewTemplateDialog({ onClose, onCreate, onImport, creating, importing }: Props) {
  const [starters, setStarters] = useState<StarterOption[]>([]);
  const [selected, setSelected] = useState<Choice | null>('shinecraft');
  const [name, setName] = useState('My Letterhead Template');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listStarters().then(setStarters);
  }, []);

  const busy = !!creating || !!importing;

  return (
    <div onClick={onClose} className="modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="modal-content" style={{ width: 520 }}>
        <h2 style={{ marginBottom: 12 }}>Create Template</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Select a starting point for your document template.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {starters.map((s) => (
            <div
              key={s.source}
              onClick={() => setSelected(s.source)}
              className={`starter-card${selected === s.source ? ' selected' : ''}`}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: selected === s.source ? 'var(--primary)' : 'var(--text-primary)' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.description}</div>
            </div>
          ))}

          <div
            onClick={() => setSelected('import')}
            className={`starter-card${selected === 'import' ? ' selected' : ''}`}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: selected === 'import' ? 'var(--primary)' : 'var(--text-primary)' }}>
              Import Existing (.docx)
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Upload your own Microsoft Word (.docx) document as a template.
            </div>
          </div>
        </div>

        {selected === 'import' ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button onClick={onClose} style={cancelBtn}>
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}
              >
                {importing ? 'Uploading…' : 'Choose .docx file'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>
                Template Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selected && name.trim() && !busy) {
                    e.preventDefault();
                    if (selected === 'blank' || selected === 'shinecraft') {
                      onCreate(selected, name.trim());
                    }
                  }
                }}
                placeholder="e.g., Client Offer Letter"
                disabled={!selected}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: !selected ? 'var(--bg-secondary)' : 'var(--bg-surface)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button onClick={onClose} style={cancelBtn}>
                Cancel
              </button>
              <button
                disabled={!selected || !name.trim() || busy}
                onClick={() => {
                  if (selected === 'blank' || selected === 'shinecraft') {
                    onCreate(selected, name.trim());
                  }
                }}
                style={{
                  ...primaryBtn,
                  opacity: !selected || !name.trim() || busy ? 0.5 : 1,
                  background: !selected || !name.trim() || busy ? 'var(--text-muted)' : 'var(--primary)',
                }}
              >
                {creating ? 'Creating…' : 'Create Template'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const cancelBtn: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontWeight: 600,
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--primary)',
  color: 'var(--text-on-primary)',
  cursor: 'pointer',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
};

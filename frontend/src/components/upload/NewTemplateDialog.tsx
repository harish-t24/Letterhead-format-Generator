import { useEffect, useRef, useState } from 'react';
import type { StarterOption } from '../../types/template';
import * as api from '../../services/api';
import { HEADER_PRESETS, FOOTER_PRESETS, createHeaderHtml, createFooterHtml } from '../../assets/header-footer-presets';

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

  // Header & Footer Presets
  const [headerChoice, setHeaderChoice] = useState<string>('header-1'); // 'header-1', 'header-2', 'header-3', 'custom', 'none'
  const [footerChoice, setFooterChoice] = useState<string>('footer-1'); // 'footer-1', 'footer-2', 'footer-3', 'custom', 'none'
  const [customHeaderUri, setCustomHeaderUri] = useState<string>('');
  const [customFooterUri, setCustomFooterUri] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customHeaderRef = useRef<HTMLInputElement>(null);
  const customFooterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listStarters().then(setStarters);
  }, []);

  const handleCustomHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = evt.target?.result as string;
        if (res) {
          setCustomHeaderUri(res);
          setHeaderChoice('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFooterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = evt.target?.result as string;
        if (res) {
          setCustomFooterUri(res);
          setFooterChoice('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getFinalHeaderHtml = (): string => {
    if (headerChoice === 'none') return '';
    if (headerChoice === 'custom' && customHeaderUri) return createHeaderHtml(customHeaderUri);
    const preset = HEADER_PRESETS.find((h) => h.id === headerChoice);
    return preset ? preset.html : HEADER_PRESETS[0].html;
  };

  const getFinalFooterHtml = (): string => {
    if (footerChoice === 'none') return '';
    if (footerChoice === 'custom' && customFooterUri) return createFooterHtml(customFooterUri);
    const preset = FOOTER_PRESETS.find((f) => f.id === footerChoice);
    return preset ? preset.html : FOOTER_PRESETS[0].html;
  };

  const handleCreateSubmit = () => {
    if (!selected || selected === 'import' || !name.trim()) return;
    const includeHeader = headerChoice !== 'none';
    const includeFooter = footerChoice !== 'none';
    const headerHtml = getFinalHeaderHtml();
    const footerHtml = getFinalFooterHtml();

    onCreate(selected, name.trim(), {
      includeHeader,
      includeFooter,
      headerHtml,
      footerHtml,
    });
  };

  const busy = !!creating || !!importing;

  return (
    <div onClick={onClose} className="modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="modal-content" style={{ width: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: 8 }}>Create Letterhead Template</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Select your layout starting point and pick your preferred Header and Footer image.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
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
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>
                Template Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selected && name.trim() && !busy) {
                    e.preventDefault();
                    handleCreateSubmit();
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

            {/* HEADER SELECTION FEATURE */}
            <div style={{ marginBottom: 20, padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🖼️ Choose Header Image</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3 Presets or Custom Upload</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {HEADER_PRESETS.map((hp) => (
                  <div
                    key={hp.id}
                    onClick={() => setHeaderChoice(hp.id)}
                    style={{
                      border: headerChoice === hp.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 8,
                      cursor: 'pointer',
                      background: headerChoice === hp.id ? 'var(--bg-surface)' : 'transparent',
                      textAlign: 'center',
                    }}
                  >
                    <img src={hp.dataUri} alt={hp.name} style={{ width: '100%', maxHeight: 44, objectFit: 'contain', borderRadius: 4, marginBottom: 4 }} />
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{hp.name.split(':')[0]}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => customHeaderRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: headerChoice === 'custom' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: headerChoice === 'custom' ? 'var(--primary-bg)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  📁 Upload Custom Header
                </button>
                <input ref={customHeaderRef} type="file" accept="image/*" hidden onChange={handleCustomHeaderUpload} />
                <button
                  type="button"
                  onClick={() => setHeaderChoice('none')}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: headerChoice === 'none' ? '1px solid var(--warning)' : '1px solid var(--border-color)',
                    background: headerChoice === 'none' ? 'var(--warning-bg)' : 'var(--bg-surface)',
                    color: headerChoice === 'none' ? 'var(--warning)' : 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  🚫 No Header
                </button>
              </div>
            </div>

            {/* FOOTER SELECTION FEATURE */}
            <div style={{ marginBottom: 24, padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🖼️ Choose Footer Image</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3 Presets or Custom Upload</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {FOOTER_PRESETS.map((fp) => (
                  <div
                    key={fp.id}
                    onClick={() => setFooterChoice(fp.id)}
                    style={{
                      border: footerChoice === fp.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 8,
                      cursor: 'pointer',
                      background: footerChoice === fp.id ? 'var(--bg-surface)' : 'transparent',
                      textAlign: 'center',
                    }}
                  >
                    <img src={fp.dataUri} alt={fp.name} style={{ width: '100%', height: 24, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{fp.name.split(':')[0]}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => customFooterRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: footerChoice === 'custom' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: footerChoice === 'custom' ? 'var(--primary-bg)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  📁 Upload Custom Footer
                </button>
                <input ref={customFooterRef} type="file" accept="image/*" hidden onChange={handleCustomFooterUpload} />
                <button
                  type="button"
                  onClick={() => setFooterChoice('none')}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: footerChoice === 'none' ? '1px solid var(--warning)' : '1px solid var(--border-color)',
                    background: footerChoice === 'none' ? 'var(--warning-bg)' : 'var(--bg-surface)',
                    color: footerChoice === 'none' ? 'var(--warning)' : 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  🚫 No Footer
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button onClick={onClose} style={cancelBtn}>
                Cancel
              </button>
              <button
                disabled={!selected || !name.trim() || busy}
                onClick={handleCreateSubmit}
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

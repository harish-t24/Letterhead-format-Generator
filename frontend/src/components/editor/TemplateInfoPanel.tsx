import { useState, useEffect } from 'react';

interface Props {
  templateId: string;
  templateName?: string;
  fieldCount: number;
  placeholders?: string[];
  createdAt: string;
  source?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/**
 * Interactive Template Info Icon Button & Modal View.
 * Displays an icon button that opens the template information modal when clicked or touched.
 */
export function TemplateInfoPanel({
  templateId,
  templateName,
  fieldCount,
  placeholders = [],
  createdAt,
  source,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(templateId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        onTouchEnd={handleToggle}
        title="Template Info"
        aria-label="Template Info"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          background: isOpen ? 'var(--primary-light)' : 'var(--bg-surface)',
          color: isOpen ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'var(--transition)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ fontSize: 15 }}>ℹ️</span>
        <span>Template Info</span>
      </button>

      {isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsOpen(false)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 440, maxWidth: '92vw' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>ℹ️</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: "'Outfit', sans-serif" }}>
                  Template Information
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: 'none',
                  background: 'var(--bg-secondary)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: 'var(--text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
              {templateName && (
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Template Name
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                    {templateName}
                  </div>
                </div>
              )}

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Template ID
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 12,
                      wordBreak: 'break-all',
                    }}
                  >
                    {templateId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      borderRadius: 4,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: copied ? 'var(--success)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dynamic Fields
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-primary" style={{ padding: '4px 10px', fontSize: 12 }}>
                    {fieldCount} fields configured
                  </span>
                </div>
                {placeholders.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 8,
                      maxHeight: 120,
                      overflowY: 'auto',
                      padding: 8,
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {placeholders.map((p) => (
                      <span
                        key={p}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: 'var(--primary)',
                          fontWeight: 600,
                        }}
                      >
                        {'{' + p + '}'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Created At
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatDate(createdAt)}
                </div>
              </div>

              {source && (
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Source Type
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {source === 'imported' ? '📄 Imported DOCX Document' : '✨ Built-in Editor Template'}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button
                onClick={() => setIsOpen(false)}
                className="btn"
                style={{ background: 'var(--primary)', color: 'var(--text-on-primary)', width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


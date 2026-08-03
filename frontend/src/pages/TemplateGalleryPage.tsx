import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../hooks/useTemplates';
import { NewTemplateDialog } from '../components/upload/NewTemplateDialog';
import * as api from '../services/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

type ViewMode = 'cards' | 'table';

export function TemplateGalleryPage() {
  const { templates, importFile, setActiveTemplate, refresh } = useTemplates();
  const [importing, setImporting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('cards');
  const navigate = useNavigate();

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportError(null);
    try {
      const record = await importFile(file);
      setShowNewDialog(false);
      navigate(`/editor/${record.id}`);
    } catch (err: any) {
      setImportError(err?.response?.data?.message || 'Import failed. Check the backend logs.');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateNew = async (
    source: 'blank' | 'shinecraft',
    templateName: string,
    options?: {
      includeHeader?: boolean;
      includeFooter?: boolean;
      headerHtml?: string;
      footerHtml?: string;
    }
  ) => {
    setCreating(true);
    try {
      const record = await api.createFromStarter(source, templateName, options);
      await refresh();
      setShowNewDialog(false);
      navigate(`/create/${record.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not create template.');
    } finally {
      setCreating(false);
    }
  };

  const openTemplate = (t: (typeof templates)[number]) => {
    setActiveTemplate(t);
    navigate(`/editor/${t.id}`);
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete template "${name}"? This will delete all its data rows and cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteTemplate(id);
      await refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not delete template.');
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.templateName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()),
  );

  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash + 120) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 90%) 0%, hsl(${hue2}, 70%, 80%) 100%)`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Letterhead Templates</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage and generate documents using your letterhead layouts.</p>
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--primary)',
            color: 'var(--text-on-primary)',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
          }}
        >
          ＋ Create Template
        </button>
      </div>

      {importError && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>⚠️ {importError}</p>}
      {importing && <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Opening file…</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 360 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by name or template ID..."
            style={{
              width: '100%',
              padding: '10px 36px 10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              transition: 'var(--transition)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 14,
                padding: 4,
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={() => setView('cards')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              background: view === 'cards' ? 'var(--primary)' : 'var(--bg-surface)',
              color: view === 'cards' ? 'var(--text-on-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              borderRadius: 0,
            }}
          >
            Cards
          </button>
          <button
            onClick={() => setView('table')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              background: view === 'table' ? 'var(--primary)' : 'var(--bg-surface)',
              color: view === 'table' ? 'var(--text-on-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              borderRadius: 0,
            }}
          >
            Table
          </button>
        </div>
      </div>

      {showNewDialog && (
        <NewTemplateDialog
          onClose={() => setShowNewDialog(false)}
          onCreate={handleCreateNew}
          onImport={handleImport}
          creating={creating}
          importing={importing}
        />
      )}

      {filtered.length === 0 ? (
        <div className="app-card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {templates.length === 0
              ? 'No templates yet. Create or import a Word document above to begin!'
              : 'No templates match your search.'}
          </p>
        </div>
      ) : view === 'cards' ? (
        <div className="template-grid">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => openTemplate(t)}
              className="template-card"
            >
              <div
                className="template-thumbnail"
                style={{ background: getGradient(t.templateName) }}
              >
                <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'rgba(15, 23, 42, 0.75)', fontFamily: "'Outfit', sans-serif" }}>
                  {t.templateName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="template-card-info">
                <div className="template-name" title={t.templateName}>{t.templateName}</div>
                <div className="template-meta">
                  ID: {t.id.slice(0, 8)}
                </div>
                <div className="template-fields-count">
                  <span className="badge badge-primary">{t.placeholders.length} fields</span>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {t.source === 'imported' ? 'DOCX' : 'Starter'}
                  </span>
                </div>
                <div className="template-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTemplate(t);
                    }}
                    style={smallBtnFilled}
                  >
                    Merge Data
                  </button>
                  {t.source !== 'imported' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/create/${t.id}`);
                      }}
                      style={smallBtnOutline}
                    >
                      Edit Layout
                    </button>
                  )}
                  <a
                    onClick={(e) => e.stopPropagation()}
                    href={api.templateExportPdfUrl(t.id)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ...smallBtnOutline, textDecoration: 'none', textAlign: 'center' }}
                  >
                    Download
                  </a>
                  <button
                    onClick={(e) => handleDeleteTemplate(e, t.id, t.templateName)}
                    style={smallBtnDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="app-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Template Name</th>
                <th>ID</th>
                <th>Fields</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => openTemplate(t)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.templateName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                    {t.id.slice(0, 8)}
                  </td>
                  <td>
                    <span className="badge badge-primary">{t.placeholders.length} fields</span>
                  </td>
                  <td>{formatDate(t.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTemplate(t);
                        }}
                        style={smallBtnFilled}
                      >
                        Merge Data
                      </button>
                      {t.source !== 'imported' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/create/${t.id}`);
                          }}
                          style={smallBtnOutline}
                        >
                          Edit Layout
                        </button>
                      )}
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={api.templateExportPdfUrl(t.id)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ ...smallBtnOutline, textDecoration: 'none' }}
                      >
                        Download
                      </a>
                      <button
                        onClick={(e) => handleDeleteTemplate(e, t.id, t.templateName)}
                        style={smallBtnDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const smallBtnOutline: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
};
const smallBtnFilled: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--primary)',
  color: 'var(--text-on-primary)',
  cursor: 'pointer',
  display: 'inline-block',
  fontWeight: 600,
  transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
};
const smallBtnDelete: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--danger-border)',
  background: 'var(--danger-bg)',
  color: 'var(--danger)',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
};

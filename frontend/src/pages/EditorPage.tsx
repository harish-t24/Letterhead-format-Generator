import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTemplateStore } from '../store/templateStore';
import { useDataset } from '../hooks/useDataset';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { TemplateEditor } from '../components/editor/TemplateEditor';
import { PlaceholdersPanel } from '../components/editor/PlaceholdersPanel';
import { DataTable } from '../components/table/DataTable';
import { AddRowButton } from '../components/table/AddRowButton';
import { PdfPreview } from '../components/preview/PdfPreview';
import { AllRowsPreview } from '../components/preview/AllRowsPreview';
import { PrintButton } from '../components/preview/PrintButton';
import { TemplateInfoPanel } from '../components/editor/TemplateInfoPanel';
import * as api from '../services/api';

type PreviewMode = 'single' | 'all';

export function EditorPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { activeTemplate, setActiveTemplate } = useTemplateStore();
  const { rows, activeRowId, setActiveRowId, addEmptyRow, updateCell, deleteRow } =
    useDataset(templateId ?? null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('single');

  useEffect(() => {
    if (templateId && activeTemplate?.id !== templateId) {
      api.getTemplate(templateId).then(setActiveTemplate);
    }
  }, [templateId, activeTemplate, setActiveTemplate]);

  // Debounce the row-id so the preview doesn't re-request on every keystroke
  // (cell edits already commit on blur, but this protects rapid row switching too).
  const debouncedRowId = useDebouncedValue(activeRowId, 300);

  if (!activeTemplate) return <p style={{ padding: '2rem' }}>Loading template…</p>;

  const activeRow = rows.find((r) => r.id === activeRowId);
  const updatedAt = activeRow?.updatedAt ? new Date(activeRow.updatedAt).getTime() : '';

  const pdfUrl =
    templateId && debouncedRowId
      ? `${api.renderPdfUrl(templateId, debouncedRowId)}?t=${updatedAt}`
      : null;

  return (
    <div style={{ maxWidth: 1550, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/templates" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          &larr; Back to Templates
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", margin: 0 }}>
              {activeTemplate.templateName}
            </h2>
            <TemplateInfoPanel
              templateId={activeTemplate.id}
              templateName={activeTemplate.templateName}
              fieldCount={activeTemplate.placeholders.length}
              placeholders={activeTemplate.placeholders}
              createdAt={activeTemplate.createdAt}
              source={activeTemplate.source}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>
              ID: {activeTemplate.id.slice(0, 18)}...
            </span>
            <span>·</span>
            <span>Created: {new Date(activeTemplate.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>
        {activeTemplate.source !== 'imported' && (
          <Link to={`/create/${activeTemplate.id}`} className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            ✏️ Edit Content Layout
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {activeTemplate.source === 'imported' && (
          <div className="app-card" style={{ padding: 20, width: 230, flexShrink: 0, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <PlaceholdersPanel placeholders={activeTemplate.placeholders} readOnly />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 320 }}>
          {activeTemplate.source === 'imported' && (
            <div style={{
              fontSize: 13,
              color: 'var(--warning)',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <span>ℹ️</span>
              <span>This is an imported DOCX template. Formatting is locked to preserve layout. Modify rows below to merge data.</span>
            </div>
          )}
          
          <div className="app-card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Document Body Template</h3>
            <TemplateEditor html={activeTemplate.html} />
          </div>

          <div className="app-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Mail-Merge Data Table</h3>
              <AddRowButton onClick={() => addEmptyRow(activeTemplate.placeholders)} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <DataTable
                columns={activeTemplate.placeholders}
                rows={rows}
                activeRowId={activeRowId}
                onSelectRow={setActiveRowId}
                onCellEdit={updateCell}
                onDeleteRow={deleteRow}
              />
            </div>
          </div>

          {/* Merge & Preview Area */}
          <div className="app-card" style={{ padding: 24, marginTop: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h3 style={{ margin: 0 }}>Live Document Preview</h3>
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setPreviewMode('single')}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      border: 'none',
                      cursor: 'pointer',
                      background: previewMode === 'single' ? 'var(--primary)' : 'var(--bg-surface)',
                      color: previewMode === 'single' ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      borderRadius: 0,
                    }}
                  >
                    Selected Row
                  </button>
                  <button
                    onClick={() => setPreviewMode('all')}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      border: 'none',
                      cursor: 'pointer',
                      background: previewMode === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
                      color: previewMode === 'all' ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      borderRadius: 0,
                    }}
                  >
                    All Rows ({rows.length})
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {previewMode === 'single' && <PrintButton pdfUrl={pdfUrl} />}
                {templateId && (
                  <a
                    href={api.exportZipUrl(templateId)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    📦 Export All (ZIP)
                  </a>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 0', minHeight: 200, display: 'flex', flexDirection: 'column', gap: 16, width: '100%', alignItems: 'center' }}>
              {previewMode === 'single' ? (
                <PdfPreview pdfUrl={pdfUrl} />
              ) : (
                templateId && <AllRowsPreview templateId={templateId} rows={rows} />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

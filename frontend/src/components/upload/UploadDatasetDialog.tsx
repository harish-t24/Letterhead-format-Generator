import { useEffect, useRef, useState } from 'react';
import type { TemplateRecord } from '../../types/template';
import type { BulkCsvResult } from '../../types/dataset';
import * as api from '../../services/api';

interface Props {
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadDatasetDialog({ onClose, onUploaded }: Props) {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkCsvResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listTemplates().then((list) => {
      setTemplates(list);
      if (list.length) setTemplateId(list[0].id);
    });
  }, []);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const handleUpload = async () => {
    if (!templateId || !file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadDatasetCsv(templateId, file);
      setResult(res);
      onUploaded();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div onClick={onClose} className="modal-overlay">
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
        style={{ width: 500 }}
      >
        <h2 style={{ marginBottom: 12 }}>Upload Dataset</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Upload a CSV to bulk-add rows to a template's dataset. Column headers are matched to the
          template's fields by name (not case-sensitive).
        </p>

        {!result ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>
                Target Template
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                }}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.templateName}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: -6, marginBottom: 20 }}>
                <strong>Expected columns:</strong> {selectedTemplate.placeholders.map((p) => p).join(', ') || '(none detected)'}
              </p>
            )}

            <div
              onClick={() => inputRef.current?.click()}
              style={{
                border: '2px dashed var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: 20,
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                transition: 'var(--transition)',
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div>
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>📊</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{file.name}</strong>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>📥</span>
                  <strong>Click to select a .csv file</strong>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    CSV should contain columns matching template fields
                  </span>
                </div>
              )}
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onClose} style={cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!templateId || !file || uploading}
                style={{
                  ...primaryBtn,
                  opacity: !templateId || !file || uploading ? 0.5 : 1,
                  background: !templateId || !file || uploading ? 'var(--text-muted)' : 'var(--primary)',
                }}
              >
                {uploading ? 'Uploading…' : 'Upload Data'}
              </button>
            </div>
          </>
        ) : (
          <div>
            <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
                ✅ Added <strong>{result.createdCount}</strong> row{result.createdCount === 1 ? '' : 's'} to{' '}
                <strong>{selectedTemplate?.templateName}</strong>.
              </p>
            </div>
            
            {result.unmatchedCsvColumns.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Ignored columns (no matching field):</span>
                <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 2 }}>{result.unmatchedCsvColumns.join(', ')}</p>
              </div>
            )}
            
            {result.missingPlaceholders.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Left blank (no matching CSV column):</span>
                <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 2 }}>{result.missingPlaceholders.join(', ')}</p>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={primaryBtn}>
                Done
              </button>
            </div>
          </div>
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

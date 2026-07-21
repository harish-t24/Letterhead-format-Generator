import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import type { DatasetSummary } from '../types/dataset';
import { UploadDatasetDialog } from '../components/upload/UploadDatasetDialog';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();

  const refresh = () => api.listDatasetSummaries().then(setDatasets);

  useEffect(() => {
    refresh();
  }, []);

  const filtered = datasets.filter(
    (d) =>
      d.datasetName.toLowerCase().includes(search.toLowerCase()) ||
      d.templateName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (d: DatasetSummary) => {
    if (!confirm(`Delete all ${d.recordCount} row(s) in "${d.datasetName}"? This can't be undone.`)) {
      return;
    }
    await api.clearDataset(d.templateId);
    refresh();
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Mail-Merge Datasets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage row data associated with each letterhead template.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
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
          ⇧ Upload Dataset
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search datasets..."
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '10px 14px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          marginBottom: 24,
        }}
      />

      <div className="app-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Dataset Name</th>
              <th>Template Name</th>
              <th>Records</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.templateId}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.datasetName}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.templateName}</td>
                <td>
                  <span className="badge badge-primary">{d.recordCount} rows</span>
                </td>
                <td>{formatDate(d.createdAt)}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      onClick={() => navigate(`/editor/${d.templateId}`)}
                      style={smallBtnOutline}
                    >
                      ✏️ Edit Rows
                    </button>
                    <button
                      onClick={() => handleDelete(d)}
                      style={smallBtnDelete}
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  {datasets.length === 0
                    ? 'No datasets found. Create a template and add some data rows to get started!'
                    : 'No datasets match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showUpload && (
        <UploadDatasetDialog
          onClose={() => setShowUpload(false)}
          onUploaded={refresh}
        />
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
};

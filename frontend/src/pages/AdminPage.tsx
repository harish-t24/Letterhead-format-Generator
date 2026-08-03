import { useEffect, useState } from 'react';
import * as api from '../services/api';

export function AdminPage() {
  const [stats, setStats] = useState<{ templates: number; rows: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchStats = async () => {
    try {
      const templates = await api.listTemplates();
      const datasets = await api.listDatasetSummaries();
      const totalRows = datasets.reduce((acc, d) => acc + d.recordCount, 0);
      setStats({ templates: templates.length, rows: totalRows });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing this backup will update and restore templates and dataset rows. Continue?')) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const result = await api.importSystemFile(file);
      setMessage({
        text: `✓ System backup restored successfully! Restored ${result.restoredTemplates} template(s) and ${result.restoredRows} dataset row(s).`,
        type: 'success',
      });
      fetchStats();
    } catch (err: any) {
      setMessage({
        text: `Error importing system backup: ${err?.response?.data?.message || err?.message || 'Invalid file format.'}`,
        type: 'error',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚙️</span> System Backup & Data Admin
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Export or restore complete system data including all letterhead templates, DOCX document layouts, and mail-merge dataset rows.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 24,
            fontWeight: 600,
            fontSize: 13,
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#047857' : '#b91c1c',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="app-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
            Total Templates
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
            {stats ? stats.templates : '—'}
          </div>
        </div>

        <div className="app-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
            Total Dataset Rows
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
            {stats ? stats.rows : '—'}
          </div>
        </div>

        <div className="app-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
            System Backup Status
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            🟢 Fully Operational
          </div>
        </div>
      </div>

      {/* Export & Import Main Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Export System */}
        <div className="app-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>📦</span>
              <h3 style={{ margin: 0, fontSize: 18 }}>Export Entire System</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Generates a single complete backup file containing all template configurations, uploaded Word documents, header/footer elements, and all mail-merge datasets.
            </p>
          </div>

          <a
            href={api.exportSystemBackupUrl()}
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'var(--primary)',
              color: 'var(--text-on-primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              transition: 'var(--transition)',
            }}
          >
            📦 Download System Backup (.json)
          </a>
        </div>

        {/* Import System */}
        <div className="app-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>📥</span>
              <h3 style={{ margin: 0, fontSize: 18 }}>Import System Backup</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Upload a previously exported system backup file (`SCT_System_Backup_*.json`) to restore all templates, documents, and datasets into the software.
            </p>
          </div>

          <div>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 20px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                cursor: uploading ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              {uploading ? '⏳ Importing Backup...' : '📁 Select Backup File to Restore'}
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

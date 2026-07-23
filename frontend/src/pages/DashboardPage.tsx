import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import type { TemplateRecord } from '../types/template';
import type { DatasetSummary } from '../types/dataset';
import { NewTemplateDialog } from '../components/upload/NewTemplateDialog';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatCard({ label, value, icon, onClick }: { label: string; value: number; icon: string; onClick?: () => void }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ flex: 1, cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-details">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.listTemplates().then(setTemplates);
    api.listDatasetSummaries().then(setDatasets);
  }, []);

  const totalRecords = datasets.reduce((sum, d) => sum + d.recordCount, 0);
  const recent = templates.slice(0, 5);

  const handleCreateNew = async (source: 'blank' | 'shinecraft', templateName: string) => {
    setCreating(true);
    try {
      const record = await api.createFromStarter(source, templateName);
      setShowNewDialog(false);
      navigate(`/create/${record.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not create template.');
    } finally {
      setCreating(false);
    }
  };

  const handleImport = async (file: File) => {
    setCreating(true);
    try {
      const record = await api.importTemplate(file);
      setShowNewDialog(false);
      navigate(`/editor/${record.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Import failed.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Overview of your letterhead templates and mail-merge datasets.
        </p>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Templates" value={templates.length} icon="📄" onClick={() => navigate('/templates')} />
        <StatCard label="Total Datasets" value={datasets.length} icon="🗂️" onClick={() => navigate('/datasets')} />
        <StatCard label="Total Records" value={totalRecords} icon="🧾" onClick={() => navigate('/datasets')} />
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Recent Templates Card */}
        <div className="app-card" style={{ flex: 2, minWidth: 320 }}>
          <div className="app-card-header">
            <h3 style={{ margin: 0 }}>Recent Templates</h3>
            <span
              onClick={() => navigate('/templates')}
              style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              View All
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {recent.length === 0 ? (
              <p style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
                No templates yet. Create one to get started!
              </p>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'right' }}>Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(t.source === 'imported' ? `/editor/${t.id}` : `/create/${t.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.templateName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-primary">{t.placeholders.length} fields</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="app-card" style={{ flex: 1, minWidth: 280, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setShowNewDialog(true)} className="quick-action-btn">
              <span>＋ Create Template</span>
            </button>
            <button onClick={() => navigate('/datasets')} className="quick-action-btn">
              <span>⇧ Upload Dataset</span>
            </button>
            <button onClick={() => navigate('/templates')} className="quick-action-btn">
              <span>⇩ Generate Documents</span>
            </button>
          </div>
        </div>
      </div>

      {showNewDialog && (
        <NewTemplateDialog
          onClose={() => setShowNewDialog(false)}
          onCreate={handleCreateNew}
          onImport={handleImport}
          creating={creating}
        />
      )}
    </div>
  );
}

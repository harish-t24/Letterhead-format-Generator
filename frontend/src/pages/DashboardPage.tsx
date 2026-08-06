import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import type { TemplateRecord } from '../types/template';
import type { DatasetSummary } from '../types/dataset';
import { NewTemplateDialog } from '../components/upload/NewTemplateDialog';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatCard({
  label,
  value,
  sublabel,
  icon,
  gradient,
  isLive,
  onClick,
}: {
  label: string;
  value: number | string;
  sublabel: string;
  icon: string;
  gradient: string;
  isLive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className="dashboard-card-glass"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 210,
        borderRadius: 'var(--radius-md)',
        padding: '22px 24px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: gradient,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {isLive && (
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-block',
              animation: 'pulseLive 2s infinite',
            }}
            title="Gotenberg Engine Active"
          />
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
        {sublabel}
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
    <div className="animate-fade-in-up" style={{ maxWidth: 1180, margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Animated Hero Welcome Banner */}
      <div
        className="dashboard-hero-bg"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '36px 40px',
          color: '#ffffff',
          marginBottom: 32,
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating Ambient Mesh Glow Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0) 70%)',
            animation: 'ambientGlow 8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40%',
            left: '20%',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
            animation: 'floatOrb 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 620, position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: '#c7d2fe',
              marginBottom: 14,
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span>✨</span> Next-Gen Document & Letterhead Suite
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Welcome to Shinecraft Merge
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            Design letterheads, map dataset variables, and generate beautifully formatted PDFs with custom automatic file naming.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => setShowNewDialog(true)}
            style={{
              padding: '14px 28px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.45)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(99, 102, 241, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.45)';
            }}
          >
            ＋ Create New Template
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard
          label="Total Templates"
          value={templates.length}
          sublabel="Active letterhead layouts"
          icon="📄"
          gradient="linear-gradient(90deg, #6366f1, #8b5cf6)"
          onClick={() => navigate('/templates')}
        />
        <StatCard
          label="Total Datasets"
          value={datasets.length}
          sublabel="Associated dataset files"
          icon="🗂️"
          gradient="linear-gradient(90deg, #10b981, #059669)"
          onClick={() => navigate('/datasets')}
        />
        <StatCard
          label="Total Records"
          value={totalRecords}
          sublabel="Recipient row entries"
          icon="🧾"
          gradient="linear-gradient(90deg, #f59e0b, #d97706)"
          onClick={() => navigate('/datasets')}
        />
        <StatCard
          label="Engine Status"
          value="Gotenberg"
          sublabel="PDF Renderer v8 Ready"
          icon="⚡"
          isLive
          gradient="linear-gradient(90deg, #3b82f6, #1d4ed8)"
        />
      </div>

      {/* Animated Workflow Bar */}
      <div
        className="dashboard-card-glass"
        style={{
          borderRadius: 'var(--radius-md)',
          padding: '22px 28px',
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)' }}>
            1
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Select or Create Layout</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload DOCX or choose a starter template</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#d1fae5', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}>
            2
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Populate Recipient Data</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter table rows or import bulk CSV data</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef3c7', color: '#d97706', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)' }}>
            3
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Batch Export & Merge</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Export custom named PDFs or bulk ZIP file</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Recent Templates List */}
        <div className="dashboard-card-glass" style={{ flex: 2, minWidth: 340, padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Recent Templates</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Quick access to your recently updated letterhead designs</p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              style={{
                border: 'none',
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                fontSize: 12,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              View All Templates →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {recent.length === 0 ? (
              <div style={{ padding: 44, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>No templates created yet</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Click below to create your first letterhead template.</p>
                <button
                  onClick={() => setShowNewDialog(true)}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  }}
                >
                  ＋ Create Template
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>Template Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>Source</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>Fields</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>Created</th>
                    <th style={{ textAlign: 'right', padding: '14px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/editor/${t.id}`)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                        {t.templateName}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11 }}>
                          {t.source === 'imported' ? 'DOCX' : 'Starter'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className="badge badge-primary" style={{ fontSize: 11 }}>{t.placeholders.length} fields</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(t.createdAt)}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/editor/${t.id}`);
                            }}
                            style={{
                              padding: '6px 14px',
                              fontSize: 12,
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              background: 'var(--primary)',
                              color: '#ffffff',
                              cursor: 'pointer',
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.2)',
                            }}
                          >
                            ⚡ Merge Data
                          </button>
                          <a
                            onClick={(e) => e.stopPropagation()}
                            href={api.templateExportPdfUrl(t.id)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 12px',
                              fontSize: 12,
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-surface)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            📥 Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Action Navigation Card */}
        <div className="dashboard-card-glass" style={{ flex: 1, minWidth: 300, padding: 24, borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ marginBottom: 18, fontSize: '1.1rem', fontWeight: 700 }}>Quick Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              onClick={() => setShowNewDialog(true)}
              style={actionButtonStyle}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚀</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>New Template</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Create or import DOCX layout</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/datasets')}
              style={actionButtonStyle}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🗂️</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Manage Datasets</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload CSV/Excel recipient lists</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/templates')}
              style={actionButtonStyle}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Template Gallery</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Browse all saved letterhead templates</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin')}
              style={actionButtonStyle}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚙️</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>System Backup</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Import or export complete app data</div>
              </div>
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

const actionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  width: '100%',
};

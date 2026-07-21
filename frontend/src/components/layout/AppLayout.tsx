import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/templates', label: 'Templates', icon: '📄' },
  { to: '/datasets', label: 'Datasets', icon: '🗂️' },
];

/**
 * Shared shell for every page: collapsible sidebar + top bar, matching
 * the wireframe layout. Deliberately excludes "Generated Files" and
 * "Settings" nav items -- there's no backend for either in this app.
 *
 * The "Admin ▾" dropdown in the top bar is decorative only -- this app
 * has no authentication/user accounts, so it doesn't open a real menu.
 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      <aside
        style={{
          width: collapsed ? 68 : 240,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        <div className="sidebar-logo">
          <span>✨</span>
          {!collapsed && <span style={{ fontWeight: 800 }}>ShineCraft</span>}
        </div>

        <nav style={{ flex: 1, padding: 12 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        {!collapsed && (
          <div style={{ padding: 16, borderTop: '1px solid #1e293b', color: '#64748b', fontSize: 11, textAlign: 'center' }}>
            Template Merge v1.0.0
          </div>
        )}
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            height: 60,
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              title="Toggle sidebar"
              style={{
                border: 'none',
                background: 'var(--bg-secondary)',
                fontSize: 16,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              ☰
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              Letterhead Merge Tool
            </span>
          </div>

          <div className="top-bar-user">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Admin</span>
            <div className="user-avatar" title="Administrator Account">
              AD
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

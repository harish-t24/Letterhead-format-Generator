import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logo from '../../assets/logo.png';

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
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      <aside
        style={{
          width: collapsed ? 68 : 240,
          transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          background: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '16px 12px' : '16px 18px' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              height: 200,
              maxHeight: 100,
              maxWidth: collapsed ? 36 : 140,
              objectFit: 'contain',
              borderRadius: 4,
            }}
          />
          
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
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                transition: 'var(--transition)',
              }}
            >
              ☰
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              Letterhead Merge Tool
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAdminMenu((prev) => !prev)}
              className="top-bar-user"
              style={{
                border: 'none',
                background: showAdminMenu ? 'var(--primary-glow)' : 'transparent',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              title="Admin Menu"
            >
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Admin ▾
              </span>
              <div className="user-avatar" title="Administrator Account">
                AD
              </div>
            </button>

            {showAdminMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  width: 280,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 16,
                  zIndex: 100,
                  animation: 'modalPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                  <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>AD</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>System Administrator</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin@shinecraft.internal</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>System Status:</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>🟢 Operational</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Merge Engine:</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Gotenberg PDF v8</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    onClick={() => {
                      setShowAdminMenu(false);
                      window.location.reload();
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    🔄 Reload Workspace
                  </button>
                  <button
                    onClick={() => setShowAdminMenu(false)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ── Navigation items ─────────────────────────────────────────────────────────
const NAV = [
  { section: 'Principal' },
  { to: '/admin', icon: 'grid_view', label: 'Tableau de bord', roles: ['super_admin','admin_produits','admin_stock'], exact: true },

  { section: 'Catalogue' },
  { to: '/admin/produits',   icon: 'inventory_2',  label: 'Produits',    roles: ['super_admin','admin_produits'] },
  { to: '/admin/categories', icon: 'category',     label: 'Catégories',  roles: ['super_admin','admin_produits'] },
  { to: '/admin/promotions', icon: 'local_offer',  label: 'Promotions',  roles: ['super_admin','admin_produits'] },

  { section: 'Opérations' },
  { to: '/admin/stock',      icon: 'warehouse',        label: 'Stock',      roles: ['super_admin','admin_stock'] },
  { to: '/admin/commandes',  icon: 'receipt_long',     label: 'Commandes',  roles: ['super_admin','admin_stock'] },
  { to: '/admin/clients',    icon: 'group',            label: 'Clients',    roles: ['super_admin','admin_produits','admin_stock'] },

  { section: 'Système' },
  { to: '/superadmin', icon: 'admin_panel_settings', label: 'Super Admin', roles: ['super_admin'] },
];

const ROLE_CONFIG = {
  super_admin:    { label:'Super Administrateur', color:'#bf5af2', bg:'rgba(191,90,242,0.1)', icon:'shield_person' },
  admin_produits: { label:'Admin Produits',       color:'#0a84ff', bg:'rgba(10,132,255,0.1)',  icon:'inventory_2' },
  admin_stock:    { label:'Admin Stock & Cmds',   color:'#30d158', bg:'rgba(48,209,88,0.1)',   icon:'warehouse' },
};

const STORAGE_KEY = 'adminSidebarCollapsed';

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Persist collapsed state across navigation / refresh
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  const toggle = (val) => {
    setCollapsed(val);
    try { localStorage.setItem(STORAGE_KEY, String(val)); } catch {}
  };

  const handleLogout = async () => {
    await logout();
    success('Déconnexion réussie');
    navigate('/connexion');
  };

  const role     = user?.role || 'admin_produits';
  const roleInfo = ROLE_CONFIG[role] || ROLE_CONFIG.admin_produits;
  const initials = `${user?.prenom?.[0]||''}${user?.nom?.[0]||''}`.toUpperCase();
  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const F = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' };

  return (
    <>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 68 : 256, position: 'fixed', left: 0, top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 40,
        background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.07)',
        transition: 'width 280ms cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        ...F,
      }}>

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div style={{ padding: collapsed ? '20px 0' : '20px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(0,0,0,0.05)', flexShrink: 0, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 68 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#0a84ff,#0040c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(10,132,255,0.3)', cursor: 'pointer' }}
            onClick={() => toggle(!collapsed)}>
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#fff', fontVariationSettings: "'FILL' 1" }}>local_grocery_store</span>
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>L'Épicerie Moderne</div>
                <div style={{ fontSize: 9, color: '#8e8e93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</div>
              </div>
              <button onClick={() => toggle(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#aeaeb2', display: 'flex', flexShrink: 0, transition: 'color 150ms' }}
                title="Réduire" onMouseEnter={e => e.currentTarget.style.color='#3c3c43'} onMouseLeave={e => e.currentTarget.style.color='#aeaeb2'}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
              </button>
            </>
          )}
        </div>

        {/* ── Role badge ─────────────────────────────────────────────────── */}
        {!collapsed && (
          <div style={{ margin: '10px 14px', padding: '8px 12px', borderRadius: 10, background: roleInfo.bg, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: roleInfo.color, fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>{roleInfo.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: roleInfo.color, whiteSpace: 'nowrap' }}>{roleInfo.label}</span>
          </div>
        )}

        {/* ── Nav ────────────────────────────────────────────────────────── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', overflowX: 'hidden' }}>
          {NAV.map((item, i) => {
            // Section header — hide if collapsed or if no visible items follow
            if (item.section) {
              if (collapsed) return null;
              const hasVisible = NAV.slice(i + 1).some(
                n => !n.section && n.roles && n.roles.includes(role)
              );
              // Only hide if the *immediate* block has no visible items
              const blockVisible = NAV.slice(i + 1)
                .takeWhile ? undefined : (() => {
                  for (let j = i + 1; j < NAV.length; j++) {
                    if (NAV[j].section) break;
                    if (NAV[j].roles && NAV[j].roles.includes(role)) return true;
                  }
                  return false;
                })();
              const sectionVisible = (() => {
                for (let j = i + 1; j < NAV.length; j++) {
                  if (NAV[j].section) break;
                  if (NAV[j].roles && NAV[j].roles.includes(role)) return true;
                }
                return false;
              })();
              if (!sectionVisible) return null;
              return (
                <div key={i} style={{ fontSize: 9, fontWeight: 800, color: '#c7c7cc', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '14px 10px 5px' }}>
                  {item.section}
                </div>
              );
            }
            // Role guard
            if (!item.roles.includes(role)) return null;
            const active = isActive(item);
            return (
              <Link key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'block' }} title={collapsed ? item.label : undefined}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '11px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10, marginBottom: 2, cursor: 'pointer', transition: 'all 180ms',
                  background: active ? `${roleInfo.color}12` : 'transparent',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 19, color: active ? roleInfo.color : '#8e8e93', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0", flexShrink: 0, transition: 'all 180ms' }}>{item.icon}</span>
                  {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? roleInfo.color : '#3c3c43', whiteSpace: 'nowrap', transition: 'all 180ms' }}>{item.label}</span>}
                  {!collapsed && active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: roleInfo.color, flexShrink: 0 }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── User footer ────────────────────────────────────────────────── */}
        <div style={{ padding: '10px 8px', borderTop: '0.5px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '8px 0' : '10px 10px', borderRadius: 10, background: '#f9f9fb', justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 200ms' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${roleInfo.color},${roleInfo.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
              {initials}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.prenom} {user?.nom}</div>
                  <div style={{ fontSize: 9, color: '#8e8e93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{roleInfo.label}</div>
                </div>
                <button onClick={handleLogout} title="Déconnexion" style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f2f2f7'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8e8e93' }}>logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Spacer to push content right ──────────────────────────────────── */}
      <div style={{ width: collapsed ? 68 : 256, flexShrink: 0, transition: 'width 280ms' }} />
    </>
  );
}

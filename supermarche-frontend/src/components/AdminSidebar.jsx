import { useState } from 'react';
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

  { section: 'Opérations' },
  { to: '/admin/stock',      icon: 'warehouse',        label: 'Stock',       roles: ['super_admin','admin_stock'] },
  { to: '/admin/commandes',  icon: 'receipt_long',     label: 'Commandes',   roles: ['super_admin','admin_stock'] },
  { to: '/admin/promotions', icon: 'local_offer',      label: 'Promotions',  roles: ['super_admin','admin_stock'] },
  { to: '/admin/clients',    icon: 'group',            label: 'Clients',     roles: ['super_admin','admin_produits','admin_stock'] },

  { section: 'Système' },
  { to: '/superadmin', icon: 'admin_panel_settings', label: 'Super Admin', roles: ['super_admin'] },

  { section: 'Paramètres' },
  { to: '/admin/profil', icon: 'person', label: 'Mon Profil', roles: ['super_admin','admin_produits','admin_stock'] },
];

const ROLE_CONFIG = {
  super_admin:    { label:'Super Administrateur', color:'#1D1D1F', bg:'#F5F5F7', icon:'shield_person' },
  admin_produits: { label:'Admin Produits',       color:'#1D1D1F', bg:'#F5F5F7', icon:'inventory_2' },
  admin_stock:    { label:'Admin Stock & Cmds',   color:'#1D1D1F', bg:'#F5F5F7', icon:'warehouse' },
};

const STORAGE_KEY = 'adminSidebarCollapsed';

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  const toggle = (val) => {
    setCollapsed(val);
    try { localStorage.setItem(STORAGE_KEY, String(val)); } catch (_e) { /* ignore */ }
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

  // Fluid transition constants
  const TRANSITION = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
  const SIDEBAR_WIDTH = collapsed ? 80 : 260;

  return (
    <>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: SIDEBAR_WIDTH, position: 'fixed', left: 0, top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        background: '#fff', borderRight: '1px solid #E5E5EA',
        transition: TRANSITION,
        ...F,
      }}>

        {/* ── Toggle Arrow Button ───────────────────────────────────────── */}
        <button 
          onClick={() => toggle(!collapsed)}
          style={{
            position: 'absolute',
            right: -14,
            top: 32,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #E5E5EA',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 110,
            color: '#1D1D1F',
            transition: TRANSITION,
            transform: `rotate(${collapsed ? 180 : 0}deg)`
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          title={collapsed ? "Agrandir" : "Réduire"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
        </button>

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #F5F5F7', flexShrink: 0, minHeight: 86, position: 'relative' }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 10, background: '#1D1D1F', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, 
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)', position: 'absolute', left: 22,
            transition: TRANSITION
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff', fontVariationSettings: "'FILL' 1" }}>shopping_basket</span>
          </div>
          
          <div style={{ 
            marginLeft: 48, whiteSpace: 'nowrap',
            opacity: collapsed ? 0 : 1, 
            transform: collapsed ? 'translateX(-10px)' : 'translateX(0)',
            pointerEvents: collapsed ? 'none' : 'auto',
            transition: TRANSITION
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.02em' }}>L'Épicerie Moderne</div>
            <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Admin Panel</div>
          </div>
        </div>

        {/* ── Role badge ─────────────────────────────────────────────────── */}
        <div style={{ 
          overflow: 'hidden', 
          maxHeight: collapsed ? 0 : 60, 
          opacity: collapsed ? 0 : 1, 
          transition: TRANSITION,
          padding: collapsed ? '0 16px' : '16px 16px 0 16px',
        }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: roleInfo.bg, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: roleInfo.color, fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>{roleInfo.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: roleInfo.color, whiteSpace: 'nowrap' }}>{roleInfo.label}</span>
          </div>
        </div>

        {/* ── Nav ────────────────────────────────────────────────────────── */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 12px' }}>
          {NAV.map((item, i) => {
            if (item.section) {
              const sectionVisible = (() => {
                for (let j = i + 1; j < NAV.length; j++) {
                  if (NAV[j].section) break;
                  if (NAV[j].roles && NAV[j].roles.includes(role)) return true;
                }
                return false;
              })();
              if (!sectionVisible) return null;
              return (
                <div key={i} style={{ 
                  fontSize: 10, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', 
                  padding: collapsed ? '0' : '16px 12px 8px', 
                  opacity: collapsed ? 0 : 1, 
                  maxHeight: collapsed ? 0 : 40, 
                  overflow: 'hidden', 
                  transition: TRANSITION 
                }}>
                  {item.section}
                </div>
              );
            }
            if (!item.roles.includes(role)) return null;
            const active = isActive(item);
            
            // Hover effect logic
            const baseBg = active ? '#1D1D1F' : 'transparent';
            const hoverBg = active ? '#000' : '#F5F5F7';
            
            return (
              <Link key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'block' }} title={collapsed ? item.label : undefined}>
                <div 
                  onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = baseBg}
                  style={{
                    display: 'flex', alignItems: 'center',
                    height: 44,
                    borderRadius: 12, marginBottom: 4, cursor: 'pointer',
                    background: baseBg,
                    position: 'relative',
                    transition: TRANSITION
                  }}
                >
                  {/* Icon */}
                  <div style={{
                     width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                     marginLeft: collapsed ? 6 : 4,
                     transition: TRANSITION
                  }}>
                    <span className="material-symbols-outlined" style={{ 
                      fontSize: 20, 
                      color: active ? '#fff' : '#8E8E93', 
                      fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0", 
                      transition: TRANSITION 
                    }}>{item.icon}</span>
                  </div>

                  {/* Label */}
                  <span style={{ 
                    fontSize: 13, fontWeight: active ? 700 : 500, 
                    color: active ? '#fff' : '#1D1D1F', 
                    whiteSpace: 'nowrap',
                    opacity: collapsed ? 0 : 1,
                    transform: collapsed ? 'translateX(-10px)' : 'translateX(0)',
                    pointerEvents: collapsed ? 'none' : 'auto',
                    transition: TRANSITION,
                    position: 'absolute',
                    left: 48
                  }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── User footer ────────────────────────────────────────────────── */}
        <div style={{ padding: collapsed ? '16px 12px' : '16px', borderTop: '1px solid #F5F5F7', flexShrink: 0, transition: TRANSITION }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', 
            height: 52,
            padding: collapsed ? '0' : '0 12px', 
            borderRadius: 14, background: collapsed ? 'transparent' : '#F5F5F7', 
            position: 'relative',
            transition: TRANSITION 
          }}>
            
            <div style={{ 
              width: 36, height: 36, borderRadius: '50%', background: '#1D1D1F', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
              position: 'absolute', left: collapsed ? 10 : 8,
              transition: TRANSITION
            }}>
              {initials}
            </div>
            
            <div style={{ 
              marginLeft: 52, whiteSpace: 'nowrap',
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'translateX(-10px)' : 'translateX(0)',
              pointerEvents: collapsed ? 'none' : 'auto',
              transition: TRANSITION
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', maxWidth: 120, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.prenom} {user?.nom}</div>
              <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600, marginTop: 2, maxWidth: 120, textOverflow: 'ellipsis', overflow: 'hidden' }}>{roleInfo.label}</div>
            </div>
            
            <button onClick={handleLogout} title="Déconnexion" style={{ 
              position: 'absolute', right: 10,
              width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #E5E5EA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              opacity: collapsed ? 0 : 1,
              pointerEvents: collapsed ? 'none' : 'auto',
              transition: 'all 150ms'
            }}
              onMouseEnter={e => { e.currentTarget.style.color='#FF3B30'; e.currentTarget.style.borderColor='#FF3B30'; }} 
              onMouseLeave={e => { e.currentTarget.style.color='#1D1D1F'; e.currentTarget.style.borderColor='#E5E5EA'; }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            </button>
            
          </div>
        </div>
      </aside>

      {/* ── Spacer to push content right ──────────────────────────────────── */}
      <div style={{ width: SIDEBAR_WIDTH, flexShrink: 0, transition: TRANSITION }} />
    </>
  );
}

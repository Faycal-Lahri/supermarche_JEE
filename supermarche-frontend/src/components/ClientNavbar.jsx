import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ClientNavbar({ transparentOnTop = false }) {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const isTransparent = transparentOnTop && !scrolled;
  const bg = isTransparent ? 'transparent' : 'rgba(22, 22, 23, 0.8)';
  const border = 'none';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: bg,
        backdropFilter: isTransparent ? 'none' : 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: isTransparent ? 'none' : 'blur(20px) saturate(180%)',
        borderBottom: border,
        transition: 'background-color 300ms cubic-bezier(0.2,0,0,1)',
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'rgba(255,255,255,0.8)', transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>shopping_basket</span>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', marginLeft: 4 }}>L'Épicerie</span>
          </Link>

          {/* Nav desktop */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[
              { to: '/catalogue', label: 'Catalogue' },
              { to: '/promotions', label: 'Promotions' },
              { to: '/faq', label: 'FAQ' },
              { to: '/a-propos', label: 'À propos' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} 
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                  transition: 'color 300ms'
                })}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {!user && (
              <>
                <Link to="/connexion" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 12, transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                  Connexion
                </Link>
                <Link to="/inscription" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 12, transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                  S'inscrire
                </Link>
              </>
            )}
            {user && user.role === 'client' && (
              <Link to="/commandes" title="Mes commandes" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>history</span>
              </Link>
            )}
            {user && (isAdmin || user.role === 'superadmin') && (
              <Link to="/admin" title="Dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
              </Link>
            )}
            {user && (
              <Link to="/profil" title="Mon Profil" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>account_circle</span>
              </Link>
            )}
            
            {/* PANIER */}
            {(!user || user.role === 'client') && (
              <Link to="/panier" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'flex', alignItems: 'center', position: 'relative', transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shopping_bag</span>
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -8, background: '#fff', color: '#1d1d1f', fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: '0 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>
                    {count}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <button onClick={handleLogout} title="Déconnexion" style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, transition: 'color 300ms' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="hide-desktop" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {(!user || user.role === 'client') && (
              <Link to="/panier" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_bag</span>
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -8, background: '#fff', color: '#1d1d1f', fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: '0 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>
                    {count}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
            </button>
          </div>

        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: '#161617',
        display: mobileOpen ? 'flex' : 'none',
        flexDirection: 'column',
        animation: mobileOpen ? 'reveal 0.3s ease-out' : 'none'
      }}>
        {/* Mobile Header */}
        <div style={{ height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>Menu</span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {/* Mobile Links */}
        <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {[
            { to: '/catalogue', label: 'Catalogue' },
            { to: '/promotions', label: 'Promotions' },
            { to: '/faq', label: 'FAQ' },
            { to: '/a-propos', label: 'À propos' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', fontSize: 24, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              {label}
            </Link>
          ))}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!user && (
              <>
                <Link to="/connexion" onClick={() => setMobileOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>Connexion</Link>
                <Link to="/inscription" onClick={() => setMobileOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>S'inscrire</Link>
              </>
            )}
            {user && user.role === 'client' && (
              <Link to="/commandes" onClick={() => setMobileOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>Mes commandes</Link>
            )}
            {user && (isAdmin || user.role === 'superadmin') && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>Dashboard Admin</Link>
            )}
            {user && (
              <Link to="/profil" onClick={() => setMobileOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>Mon profil</Link>
            )}
            {user && (
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#FF453A', textAlign: 'left', padding: 0, fontSize: 17, fontWeight: 500, cursor: 'pointer', marginTop: 16 }}>
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes reveal { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

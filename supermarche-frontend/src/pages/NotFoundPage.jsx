import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ fontFamily: 'var(--font-sf)', color: 'var(--apple-text)', background: '#F5F5F7', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      
      <span className="material-symbols-outlined" style={{ fontSize: 120, color: '#EDEDF2', fontVariationSettings: "'wght' 100", marginBottom: 24, userSelect: 'none' }}>shopping_cart</span>
      
      <h1 style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: 900, color: '#EDEDF2', letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>404</h1>
      
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1D1D1F', marginTop: 16, marginBottom: 12, letterSpacing: '-0.02em' }}>Page introuvable</h2>
      
      <p style={{ fontSize: 17, color: '#6E6E73', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.5 }}>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'center' }}>
        <Link to="/" style={{ height: 44, padding: '0 24px', borderRadius: 9999, background: '#0071E3', color: '#fff', fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'background 200ms' }} onMouseEnter={e => e.currentTarget.style.background = '#006EDB'} onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          Retour à l'accueil
        </Link>
        <Link to="/catalogue" style={{ height: 44, padding: '0 24px', borderRadius: 9999, background: 'transparent', border: '1px solid #D5D5D7', color: '#1D1D1F', fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'background 200ms' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          Explorer le catalogue
        </Link>
      </div>

    </div>
  );
}

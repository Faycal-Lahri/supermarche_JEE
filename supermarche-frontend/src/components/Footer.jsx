import { Link } from 'react-router-dom';

const COL_LINKS = [
  {
    title: 'Navigation',
    links: [
      { to: '/catalogue', label: 'Catalogue' },
      { to: '/promotions', label: 'Promotions' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact' },
      { to: '/a-propos', label: 'À propos' },
    ],
  },
  {
    title: 'Mon compte',
    links: [
      { to: '/connexion', label: 'Connexion' },
      { to: '/inscription', label: 'Inscription' },
      { to: '/commandes', label: 'Mes commandes' },
      { to: '/profil', label: 'Mon profil' },
      { to: '/panier', label: 'Mon panier' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#F5F5F7', color: '#6E6E73', fontFamily: 'var(--font-sf)', borderTop: '1px solid #EDEDF2' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 22px 20px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Top Note / Intro */}
        <div style={{ borderBottom: '1px solid #D2D2D7', paddingBottom: 20 }}>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: '#6E6E73', margin: 0 }}>
            Frais, Local, Rapide. Votre supermarché en ligne à Casablanca.
            <br/>
            Plus d'informations sur nos services et conditions de livraison sur notre page À propos.
          </p>
        </div>

        {/* Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {/* Logo Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1D1D1F' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>shopping_basket</span>
              <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 1 }}>L'Épicerie</span>
            </div>
          </div>

          {/* Nav Columns */}
          {COL_LINKS.map(col => (
            <div key={col.title}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1F', marginBottom: 10 }}>{col.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} style={{ fontSize: 12, color: '#424245', textDecoration: 'none', transition: 'color 200ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#1D1D1F'}
                      onMouseLeave={e => e.currentTarget.style.color = '#424245'}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: '#1D1D1F', marginBottom: 10 }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#424245' }}>Casablanca, Maroc</span>
              <a href="mailto:support@lepicerie.ma" style={{ fontSize: 12, color: '#424245', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#1D1D1F'} onMouseLeave={e => e.currentTarget.style.color = '#424245'}>support@lepicerie.ma</a>
              <a href="tel:+212600000000" style={{ fontSize: 12, color: '#424245', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#1D1D1F'} onMouseLeave={e => e.currentTarget.style.color = '#424245'}>+212 6 00 00 00 00</a>
              <span style={{ fontSize: 12, color: '#424245' }}>Lun–Sam : 8h–20h</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #D2D2D7', paddingTop: 16, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <p style={{ fontSize: 12, color: '#86868B', margin: 0 }}>
            Copyright © {year} L'Épicerie Inc. Tous droits réservés.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {['Politique de confidentialité', 'Conditions d\'utilisation', 'Ventes et remboursements', 'Mentions légales'].map((t, i) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#424245', cursor: 'pointer', transition: 'color 200ms' }} onMouseEnter={e=>e.currentTarget.style.color='#1D1D1F'} onMouseLeave={e=>e.currentTarget.style.color='#424245'}>
                  {t}
                </span>
                {i < 3 && <span style={{ color: '#D2D2D7', fontSize: 12 }}>|</span>}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

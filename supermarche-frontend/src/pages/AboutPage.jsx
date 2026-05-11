import { Link } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';

export default function AboutPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar transparentOnTop={true} />
      
      {/* HERO FULL SCREEN */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <img 
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=2000" 
          alt="À propos de nous" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: 800 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, color: '#32ADE6' }}>NOTRE MISSION</p>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: 24, lineHeight: 1.05 }}>
            L'Épicerie Moderne.<br/>
            <span style={{ color: '#32ADE6' }}>Réinventons vos courses.</span>
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', margin: '0 auto', lineHeight: 1.5 }}>
            Nous croyons que manger frais et local ne devrait pas être un luxe, ni une perte de temps. C'est pourquoi nous connectons directement les meilleurs producteurs à votre table, en 2 heures chrono.
          </p>
        </div>
      </section>

      <section className="apple-container" style={{ padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div style={{ aspectRatio: '1/1', borderRadius: 32, overflow: 'hidden', background: '#F5F5F7' }}>
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800" alt="Nos produits" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '0 20px' }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 24 }}>La qualité avant tout.</h2>
            <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.6, marginBottom: 16 }}>
              Chaque produit que nous proposons est rigoureusement sélectionné par nos experts. Nous travaillons en circuit court avec plus de 500 producteurs passionnés.
            </p>
            <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.6 }}>
              Notre technologie nous permet d'optimiser les flux logistiques pour vous garantir une fraîcheur absolue, de la ferme à votre porte.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background: '#1D1D1F', color: '#fff', padding: '120px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 64 }}>Nos valeurs.</h2>
        <div className="apple-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40 }}>
          {[
            { icon: 'eco', title: 'Durabilité', desc: 'Des emballages 100% recyclables et un approvisionnement responsable.' },
            { icon: 'handshake', title: 'Équité', desc: 'Une rémunération juste garantie pour l\'ensemble de nos producteurs partenaires.' },
            { icon: 'bolt', title: 'Rapidité', desc: 'Une flotte de livraison optimisée pour vous servir en un temps record.' }
          ].map(v => (
            <div key={v.title}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#0071E3', marginBottom: 24 }}>{v.icon}</span>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{v.title}</h3>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section style={{ padding: '80px 24px', textAlign: 'center', background: '#F5F5F7' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 24 }}>Prêt à commander ?</h2>
        <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', height: 56, padding: '0 32px', background: '#0071E3', color: '#fff', borderRadius: 9999, fontSize: 17, fontWeight: 600, textDecoration: 'none', transition: 'transform 200ms' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Découvrir nos produits
        </Link>
      </section>
    </div>
  );
}

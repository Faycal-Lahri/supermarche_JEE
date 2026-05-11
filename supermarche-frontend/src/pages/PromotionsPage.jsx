import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promotionsPublicApi } from '../api/api';
import ClientNavbar from '../components/ClientNavbar';

export default function PromotionsPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promotionsPublicApi.getProduits()
      .then(res => setPromos(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar transparentOnTop={true} />
      
      {/* Header Full Screen */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center', 
        color: '#fff',
        overflow: 'hidden'
      }}>
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000" 
          alt="Promotions" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 800 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, color: '#FF9F0A' }}>Bons plans</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1.1 }}>
            Des offres <br/>qui donnent envie.
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
            Découvrez nos promotions exclusives et faites le plein d'économies sur vos produits frais préférés.
          </p>
        </div>
      </section>

      <div className="apple-container" style={{ padding: '80px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 380, borderRadius: 24, background: '#E5E5EA', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : promos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#D5D5D7', marginBottom: 24 }}>sell</span>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', marginBottom: 12 }}>Aucune promotion en cours</h2>
            <p style={{ color: '#6E6E73' }}>Revenez bientôt pour découvrir nos prochaines offres.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {promos.map(p => {
              const id = p.id_produit || p.idProduit;
              const discount = Math.round(parseFloat(p.pourcentage));
              return (
                <Link key={id} to={`/produit/${id}`} style={{ display: 'block', background: '#fff', borderRadius: 24, overflow: 'hidden', textDecoration: 'none', color: 'inherit', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', transition: 'transform 300ms, box-shadow 300ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: '#F5F5F7' }}>
                    <img src={p.image_produit || p.imageProduit || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 16, right: 16, background: '#FF453A', color: '#fff', fontSize: 13, fontWeight: 800, padding: '6px 12px', borderRadius: 9999 }}>-{discount}%</span>
                  </div>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F', marginBottom: 12, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 46 }}>{p.nom_produit || p.nomProduit}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 15, color: '#8E8E93', textDecoration: 'line-through' }}>{Number(p.prix_original).toFixed(2)} €</span>
                      <span style={{ fontSize: 24, fontWeight: 800, color: '#FF453A', letterSpacing: '-0.02em' }}>{Number(p.prix_promo).toFixed(2)} €</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

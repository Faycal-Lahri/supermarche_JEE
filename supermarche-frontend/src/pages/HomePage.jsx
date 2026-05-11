import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { produitsApi, categoriesApi, promotionsPublicApi } from '../api/api';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import ClientNavbar from '../components/ClientNavbar';

const CAT_IMAGES = {
  'fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800',
  'légumes': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
  'boulangerie': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
  'épicerie': 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&q=80&w=800',
  'laitier': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=800',
  'boissons': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800',
  'viandes': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=800',
  'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
};

const getCatImage = (name = '') => {
  const n = name.toLowerCase();
  return Object.keys(CAT_IMAGES).find(k => n.includes(k))
    ? CAT_IMAGES[Object.keys(CAT_IMAGES).find(k => n.includes(k))]
    : CAT_IMAGES.default;
};

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [populaires, setPopulaires] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    Promise.all([
      categoriesApi.getAll().catch(()=>[]),
      produitsApi.getAll().catch(()=>[]),
      promotionsPublicApi.getProduits().catch(()=>[])
    ]).then(([cats, prods, promos]) => {
      setCategories(cats.data || cats || []);
      
      const promosData = promos.data || promos || [];
      setPromotions(promosData.slice(0, 4));
      
      const promoMap = new Map(promosData.map(p => [p.id_produit || p.idProduit, p]));
      
      const prodsData = prods.data || prods || [];
      const fused = prodsData.slice(0, 8).map(p => {
        const pid = p.id_produit || p.idProduit;
        const promo = promoMap.get(pid);
        if (promo) {
          return {
            ...p,
            prixOriginal: parseFloat(promo.prix_original || p.prix),
            prix: parseFloat(promo.prix_promo),
            discount: Math.round(parseFloat(promo.pourcentage)),
          };
        }
        return p;
      });
      setPopulaires(fused);
      setLoadingCats(false);
    });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if(search.trim()) navigate(`/catalogue?q=${encodeURIComponent(search.trim())}`);
  };

  const handleAdd = async (id) => {
    try {
      await addToCart(id, 1);
      success('Produit ajouté au panier');
    } catch {
      error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    success('🎉 Bienvenue ! Vérifiez vos emails.');
    setEmail('');
  };

  return (
    <div style={{ fontFamily: 'var(--font-sf)', color: 'var(--apple-text)', background: 'var(--apple-surface)' }}>
      <ClientNavbar transparentOnTop={true} />
      
      {/* SECTION 1: HERO */}
      <section style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${scrollY * 0.4}px)` }}>
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=90&w=2000" alt="Supermarché Frais" loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)' }} />
        </div>
        
        <div className="apple-container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#fff', width: '100%', paddingTop: 80 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9999, padding: '8px 20px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            🟢 Livraison express 2h — Casablanca
          </div>
          
          <h1 style={{ fontSize: 'clamp(44px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: 24 }}>
            Frais. Local.<br/>
            <span style={{ color: '#30D158' }}>Livré en 2h.</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.5 }}>
            Des producteurs locaux directement chez vous.<br className="hide-mobile" />
            Arrivages quotidiens, fraîcheur garantie.
          </p>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0071E3', color: '#fff', height: 44, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#006EDB'}
              onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
            >
              Explorer le catalogue
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <Link to="/promotions" style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.6)', color: '#fff', height: 44, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Voir les promotions
            </Link>
          </div>
        </div>
        
        {/* Floating stats bar */}
        <div className="hide-mobile" style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 24, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 32, border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
          {[
            { icon: 'local_shipping', text: 'Livraison 2h' },
            { icon: 'eco', text: '500+ Producteurs' },
            { icon: 'verified', text: '98% Satisfaction' }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#30D158', fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{stat.text}</span>
            </div>
          ))}
        </div>
        
        <span className="material-symbols-outlined hide-mobile" style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: 32, animation: 'bounce 2s infinite' }}>expand_more</span>
      </section>

      {/* SECTION 2: SEARCH BAR */}
      <section style={{ position: 'relative', zIndex: 30, marginTop: -28, padding: '0 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6E6E73', fontSize: 20 }}>search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="apple-input" style={{ width: '100%', paddingLeft: 44, background: '#F5F5F7', border: 'none' }} />
            </div>
            <button type="submit" style={{ background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, height: 44, padding: '0 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#006EDB'} onMouseLeave={e=>e.currentTarget.style.background='#0071E3'}>Chercher</button>
          </form>
        </div>
      </section>

      {/* SECTION 3: NOS ENGAGEMENTS */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>POURQUOI NOUS CHOISIR</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 12 }}>La qualité, à chaque commande.</h2>
          <p style={{ fontSize: 17, color: '#6E6E73', marginBottom: 48, maxWidth: 600 }}>Nous sélectionnons rigoureusement chaque produit pour vous garantir le meilleur.</p>
          
          <div className="grid-4">
            {[
              { icon: 'local_shipping', title: 'Livraison express 2h', desc: 'Commandez avant 18h, recevez le soir même dans Casablanca et ses alentours.' },
              { icon: 'eco', title: 'Produits 100% frais', desc: 'Arrivages quotidiens de producteurs locaux. DLC contrôlée, fraîcheur garantie.' },
              { icon: 'verified', title: 'Qualité certifiée', desc: 'Chaque produit passe un contrôle qualité rigoureux avant d\'arriver chez vous.' },
              { icon: 'savings', title: 'Meilleurs prix', desc: 'Des promotions hebdomadaires et des codes promo exclusifs pour nos membres.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 20, transition: 'transform 200ms, box-shadow 200ms', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,113,227,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#0071E3', fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: '#6E6E73', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CATÉGORIES */}
      <section className="apple-section" style={{ background: '#fff' }}>
        <div className="apple-container" style={{ paddingRight: 0 }}>
          <div style={{ paddingRight: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>NOS RAYONS</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 40 }}>Explorez notre catalogue.</h2>
          </div>
          
          <div className="horizontal-scroll" style={{ paddingRight: 24 }}>
            {loadingCats ? (
              [...Array(6)].map((_, i) => <div key={i} style={{ width: 200, height: 240, borderRadius: 20, background: '#F5F5F7', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />)
            ) : categories.filter(c => !c.id_categorie_parent && !c.idCategorieParent).map(cat => (
              <Link key={cat.id_categorie || cat.idCategorie} to={`/catalogue?categorie=${cat.id_categorie || cat.idCategorie}`} style={{ position: 'relative', width: 200, height: 240, borderRadius: 20, overflow: 'hidden', flexShrink: 0, display: 'block', textDecoration: 'none' }}>
                <div style={{ width: '100%', height: '100%', transition: 'transform 300ms' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <img src={getCatImage(cat.nom_categorie || cat.nomCategorie)} alt={cat.nom_categorie || cat.nomCategorie} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                  <span style={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#fff', fontSize: 15, fontWeight: 700 }}>{cat.nom_categorie || cat.nomCategorie}</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div style={{ marginTop: 24, paddingRight: 24 }}>
            <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F5F5F7', color: '#0071E3', height: 44, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.color = '#0071E3'; }}
            >Voir tout le catalogue</Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRODUITS POPULAIRES */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>À LA UNE</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 40 }}>Nos incontournables.</h2>
          
          <div className="horizontal-scroll-mobile grid-4">
            {populaires.map(p => {
              const stock = p.stock?.quantite_disponible ?? p.quantiteDisponible ?? 99;
              const inStock = stock > 0;
              const hasPromo = p.discount > 0;
              const isNew = new Date() - new Date(p.date_creation || p.dateCreation || new Date()) < 30 * 24 * 60 * 60 * 1000;
              const id = p.id_produit || p.idProduit;
              
              return (
                <Link key={id} to={`/produit/${id}`} style={{ display: 'block', background: '#fff', borderRadius: 20, textDecoration: 'none', color: 'inherit', transition: 'transform 300ms, box-shadow 300ms', flexShrink: 0, width: '100%', minWidth: 240 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 56px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '20px 20px 0 0', overflow: 'hidden', background: '#F5F5F7' }}>
                    <img src={p.image_produit || p.imageProduit || CAT_IMAGES.default} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {!inStock && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ background: '#1D1D1F', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999 }}>Épuisé</span>
                      </div>
                    )}
                    {hasPromo && (
                      <span style={{ position: 'absolute', top: 12, right: 12, background: '#FF453A', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, zIndex: 2 }}>-{p.discount}%</span>
                    )}
                    {!hasPromo && isNew && inStock && (
                      <span style={{ position: 'absolute', top: 12, left: 12, background: '#30D158', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, zIndex: 2 }}>Nouveau</span>
                    )}
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0071E3', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{p.nom_categorie || p.nomCategorie || 'Produit'}</p>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 44 }}>{p.nom_produit || p.nomProduit}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        {hasPromo ? (
                          <>
                            <span style={{ fontSize: 13, color: '#6E6E73', textDecoration: 'line-through', marginRight: 6 }}>{Number(p.prixOriginal).toFixed(2)} €</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: '#0071E3', letterSpacing: '-0.02em' }}>{Number(p.prix).toFixed(2)} €</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>{Number(p.prix).toFixed(2)} €</span>
                        )}
                      </div>
                      <button onClick={(e) => { e.preventDefault(); handleAdd(id); }} disabled={!inStock} style={{ width: 36, height: 36, borderRadius: 18, background: '#F5F5F7', color: '#0071E3', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inStock ? 'pointer' : 'not-allowed', opacity: inStock ? 1 : 0.5, transition: 'background 200ms, color 200ms' }}
                        onMouseEnter={e => { if(inStock){ e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = '#fff'; } }}
                        onMouseLeave={e => { if(inStock){ e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.color = '#0071E3'; } }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#0071E3', color: '#fff', height: 44, padding: '0 32px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#006EDB'} onMouseLeave={e=>e.currentTarget.style.background='#0071E3'}>Voir tout le catalogue</Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: PROMOTIONS DU MOMENT */}
      {promotions.length > 0 && (
        <section className="apple-section" style={{ background: '#1D1D1F' }}>
          <div className="apple-container">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0071E3', marginBottom: 8, textAlign: 'center' }}>OFFRES LIMITÉES</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12, textAlign: 'center' }}>Faites des économies dès maintenant.</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>Des réductions exclusives sur une sélection premium, renouvelées chaque semaine.</p>
            
            {/* Timer */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
              {[ { l: 'JOURS', v: '03' }, { l: 'HEURES', v: '14' }, { l: 'MIN', v: '45' }, { l: 'SEC', v: '12' } ].map(t => (
                <div key={t.l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{t.v}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: 8 }}>{t.l}</div>
                </div>
              ))}
            </div>
            
            <div className="horizontal-scroll-mobile grid-4">
              {promotions.map(p => {
                const id = p.id_produit || p.idProduit;
                const discount = Math.round(parseFloat(p.pourcentage));
                return (
                  <Link key={id} to={`/produit/${id}`} style={{ display: 'block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, textDecoration: 'none', color: 'inherit', flexShrink: 0, width: '100%', minWidth: 240, overflow: 'hidden' }}>
                    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                      <img src={p.image_produit || p.imageProduit || CAT_IMAGES.default} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: 12, right: 12, background: '#FF453A', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 9999 }}>-{discount}%</span>
                    </div>
                    <div style={{ padding: '16px 20px 20px' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 44 }}>{p.nom_produit || p.nomProduit}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginRight: 6 }}>{Number(p.prix_original).toFixed(2)} €</span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#0071E3', letterSpacing: '-0.02em' }}>{Number(p.prix_promo).toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div style={{ marginTop: 48, textAlign: 'center' }}>
              <Link to="/promotions" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', height: 44, padding: '0 32px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Voir toutes les promotions</Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: ÉDITORIAL */}
      <section className="apple-section" style={{ background: '#fff' }}>
        <div className="apple-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>NOTRE ENGAGEMENT</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 24 }}>Du producteur à votre table, en 2 heures.</h2>
              <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.8, marginBottom: 16 }}>
                Nous avons bâti un réseau de plus de 500 producteurs locaux répartis autour de Casablanca. Chaque matin, nos équipes sélectionnent les meilleures récoltes pour vous les livrer dans la journée, à leur pic de fraîcheur.
              </p>
              <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.8, marginBottom: 32 }}>
                Notre engagement : si vous n'êtes pas satisfait de la qualité d'un produit, nous le remboursons sans question.
              </p>
              
              <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>500+ Producteurs</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>2h Livraison</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>10 000+ Clients</div>
              </div>
              
              <Link to="/a-propos" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,113,227,0.1)', color: '#0071E3', height: 44, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,113,227,0.15)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(0,113,227,0.1)'}>Notre histoire</Link>
            </div>
            <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200" alt="Marché de producteurs" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 5s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: TÉMOIGNAGES */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>ILS NOUS FONT CONFIANCE</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 48 }}>Ce que disent nos clients.</h2>
          
          <div className="horizontal-scroll-mobile grid-3">
            {[
              { txt: "La qualité des produits est exceptionnelle. Les fruits arrivent toujours parfaitement frais, comme si on les achetait directement au marché.", author: "Fatima R.", role: "Cliente depuis 2 ans", bg: "linear-gradient(135deg, #667eea, #764ba2)" },
              { txt: "Livraison en 1h30 ! Incroyable. Je ne fais plus mes courses autrement. Le service client est aussi très réactif.", author: "Mohammed A.", role: "Casablanca", bg: "linear-gradient(135deg, #f093fb, #f5576c)" },
              { txt: "Les promotions du vendredi sont vraiment intéressantes. J'économise en moyenne 20% sur ma commande hebdomadaire.", author: "Khadija B.", role: "Mohammedia", bg: "linear-gradient(135deg, #4facfe, #00f2fe)" },
              { txt: "Interface très intuitive, commande passée en 3 clics. Les produits bio sont excellents et bien moins chers qu'en supermarché.", author: "Youssef M.", role: "Aïn Sebaa", bg: "linear-gradient(135deg, #43e97b, #38f9d7)" },
              { txt: "Je commande toutes les semaines. La régularité et la fraîcheur sont au rendez-vous. Le Pain au Levain est incroyable !", author: "Sarah L.", role: "Maarif", bg: "linear-gradient(135deg, #fa709a, #fee140)" },
            ].map((t, i) => (
              <div key={i} className={i >= 3 ? 'hide-desktop' : ''} style={{ background: '#fff', borderRadius: 20, padding: 28, flexShrink: 0, width: '100%', minWidth: 300, display: 'flex', flexDirection: 'column', transition: 'transform 200ms, box-shadow 200ms', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ color: '#FF9F0A', fontSize: 14, letterSpacing: 2, marginBottom: 16 }}>★★★★★</div>
                <p style={{ fontSize: 17, color: '#1D1D1F', lineHeight: 1.7, fontStyle: 'italic', flex: 1, marginBottom: 24 }}>"{t.txt}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                    {t.author[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{t.author}</div>
                    <div style={{ fontSize: 13, color: '#6E6E73' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: NEWSLETTER */}
      <section className="apple-section" style={{ background: 'radial-gradient(ellipse at top, rgba(0,113,227,0.06) 0%, transparent 70%)', borderTop: '1px solid rgba(0,113,227,0.08)', borderBottom: '1px solid rgba(0,113,227,0.08)' }}>
        <div className="apple-container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#0071E3', fontVariationSettings: "'FILL' 1", marginBottom: 16 }}>mail</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 12 }}>Recevez nos offres en avant-première.</h2>
          <p style={{ fontSize: 17, color: '#6E6E73', marginBottom: 32 }}>Inscrivez-vous à notre newsletter et bénéficiez de codes promo exclusifs chaque semaine.</p>
          
          <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Votre adresse email" className="apple-input" style={{ flex: 1, minWidth: 200 }} />
            <button type="submit" style={{ background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, height: 44, padding: '0 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#006EDB'} onMouseLeave={e=>e.currentTarget.style.background='#0071E3'}>S'abonner</button>
          </form>
          <p style={{ fontSize: 12, color: '#6E6E73', marginTop: 16 }}>🔒 Pas de spam. Désinscription en un clic.</p>
        </div>
      </section>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
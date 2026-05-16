import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { produitsApi, categoriesApi, promotionsPublicApi, getImageUrl } from '../api/api';
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
  
  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    // Attendre un peu que le DOM soit généré
    const timeout = setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    }, 500);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [categories, populaires, promotions]);
  
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
      <section style={{ position: 'relative', height: '100svh', minHeight: 650, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${scrollY * 0.4}px)` }}>
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" alt="L'Épicerie Moderne" loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.65)' }} />
        </div>
        
        <div className="apple-container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#fff', width: '100%', paddingTop: 60, animation: 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24, textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            L'épicerie des saveurs vraies.<br/>
            <span style={{ color: '#30D158' }}>Livré chez vous.</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: 'rgba(255,255,255,0.9)', maxWidth: 650, margin: '0 auto 48px', lineHeight: 1.5, fontWeight: 400 }}>
            Découvrez une sélection rigoureuse de produits locaux et de saison. 
            <br className="hide-mobile" />Le meilleur de nos agriculteurs, directement dans votre cuisine.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1D1D1F', height: 52, padding: '0 32px', borderRadius: 9999, fontSize: 16, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >
              Faire mes courses
            </Link>
            <Link to="/a-propos" style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', height: 52, padding: '0 32px', borderRadius: 9999, fontSize: 16, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
            >
              Notre concept
            </Link>
          </div>
        </div>
        

      </section>

      {/* SECTION 2: SEARCH BAR */}
      <section style={{ position: 'relative', zIndex: 30, marginTop: -32, padding: '0 16px', background: 'linear-gradient(to bottom, transparent 50%, #fff 50%)' }}>
        <div className="reveal-on-scroll" style={{ maxWidth: 640, margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#ffffff', borderRadius: 9999, padding: '8px 8px 8px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <span className="material-symbols-outlined" style={{ color: '#86868B', fontSize: 24 }}>search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit frais..." className="no-focus-ring" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: 17, outline: 'none', color: '#1D1D1F', padding: '10px 0', WebkitAppearance: 'none', boxShadow: 'none' }} />
            <button type="submit" style={{ background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, height: 44, padding: '0 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#006EDB'} onMouseLeave={e=>e.currentTarget.style.background='#0071E3'}>Chercher</button>
          </form>
        </div>
      </section>

      {/* SECTION 7: ÉDITORIAL (NOTRE HISTOIRE) */}
      <section style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="reveal-on-scroll">
          <div style={{ background: '#F5F5F7', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
            {/* macOS Window Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: '#E5E5EA', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#86868B', letterSpacing: '0.02em' }}>NotreHistoire.app</div>
            </div>
            
            <div style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center', background: '#fff' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 24 }}>L'art de bien manger, réinventé. 🍏</h2>
                <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.8, marginBottom: 16 }}>
                  Derrière chaque produit de L'Épicerie Moderne se cache une histoire, un artisan, une terre. Nous refusons l'industrialisation à outrance pour privilégier le savoir-faire local et les circuits courts. 🌱
                </p>
                <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.8, marginBottom: 32 }}>
                  Nos équipes se lèvent à l'aube pour sélectionner les arrivages sur les marchés de gros et directement chez nos agriculteurs partenaires. Ce que vous recevez chez vous a été soigneusement choisi, touché et validé par nos experts. 👨‍🌾
                </p>
                
                <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>🚜 150+ Agriculteurs</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>✨ 100% Qualité</div>
                </div>
                
                <Link to="/a-propos" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,113,227,0.1)', color: '#0071E3', height: 44, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,113,227,0.15)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(0,113,227,0.1)'}>Découvrir notre approche</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ borderRadius: 24, overflow: 'hidden', height: 320, transform: 'translateY(30px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <img src="/images/agriculteur.png" alt="Agriculteur" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ borderRadius: 24, overflow: 'hidden', height: 320, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600" alt="Produits frais" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: LA VISION */}
      <section className="apple-section" style={{ background: '#1D1D1F', color: '#fff' }}>
        <div className="apple-container reveal-on-scroll">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/5' }}>
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" alt="Supermarché Moderne" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ order: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#30D158', marginBottom: 24 }}>eco</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 24 }}>Plus qu'un supermarché,<br/>un mode de vie.</h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 24 }}>
                Nous croyons que manger sainement ne devrait pas être un luxe ou une corvée. En reconnectant les citadins avec les producteurs locaux, nous créons un cercle vertueux pour votre santé et pour l'économie de la région.
              </p>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 40 }}>
                Chaque commande passée chez L'Épicerie Moderne soutient directement l'agriculture marocaine durable. Nos emballages sont 100% recyclables et notre logistique est optimisée pour réduire notre empreinte carbone.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#30D158' }}>100%</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Circuit court</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#30D158' }}>Zéro</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Gaspillage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: NOS ENGAGEMENTS */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container reveal-on-scroll">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>POURQUOI NOUS CHOISIR</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 12 }}>La qualité, à chaque commande.</h2>
          <p style={{ fontSize: 17, color: '#6E6E73', marginBottom: 48, maxWidth: 600 }}>Nous sélectionnons rigoureusement chaque produit pour vous garantir le meilleur, sans compromis sur la fraîcheur.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { icon: 'local_shipping', title: 'Livraison express 2h', desc: 'Commandez avant 18h, recevez le soir même dans Casablanca et ses alentours.' },
              { icon: 'eco', title: 'Produits 100% frais', desc: 'Arrivages quotidiens de producteurs locaux. DLC contrôlée, fraîcheur garantie.' },
              { icon: 'verified', title: 'Qualité certifiée', desc: 'Chaque produit passe un contrôle qualité rigoureux avant d\'arriver chez vous.' },
              { icon: 'savings', title: 'Meilleurs prix', desc: 'Des promotions hebdomadaires et des prix justes pour nos agriculteurs.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 300ms, box-shadow 300ms', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fff', fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 16, color: '#6E6E73', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: LA GARANTIE FRAÎCHEUR */}
      <section className="apple-section" style={{ background: '#fff' }}>
        <div className="apple-container reveal-on-scroll">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div style={{ order: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>NOTRE PROCESSUS</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 32 }}>De la ferme à votre porte.<br/>En un clin d'œil. 🚚</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ fontSize: 32 }}>🧺</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>1. Sélection rigoureuse</h3>
                    <p style={{ fontSize: 16, color: '#6E6E73', lineHeight: 1.6 }}>Vos commandes sont préparées à la main avec les meilleurs produits fraîchement arrivés du jour.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ fontSize: 32 }}>📦</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>2. Emballage éco-responsable</h3>
                    <p style={{ fontSize: 16, color: '#6E6E73', lineHeight: 1.6 }}>Nous privilégions les emballages kraft recyclables et biodégradables. Fini le plastique inutile.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ fontSize: 32 }}>🛵</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>3. Livraison express</h3>
                    <p style={{ fontSize: 16, color: '#6E6E73', lineHeight: 1.6 }}>Livré directement chez vous en un temps record par notre propre flotte de coursiers.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ order: 2 }}>
              <div style={{ borderRadius: 32, overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
                <img src="/images/livraison.png" alt="Livraison" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CATÉGORIES */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container reveal-on-scroll" style={{ paddingRight: 0 }}>
          <div style={{ paddingRight: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>NOS RAYONS</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 40 }}>Explorez notre catalogue.</h2>
          </div>
          
          <div className="horizontal-scroll" style={{ paddingRight: 24 }}>
            {loadingCats ? (
              [...Array(6)].map((_, i) => <div key={i} style={{ width: 200, height: 240, borderRadius: 20, background: '#E5E5EA', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />)
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
            <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0071E3', height: 44, padding: '0 24px', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms', border: '1px solid rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0071E3'; }}
            >Voir tout le catalogue</Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRODUITS POPULAIRES */}
      <section className="apple-section" style={{ background: '#fff' }}>
        <div className="apple-container reveal-on-scroll">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>À LA UNE</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 40 }}>Nos incontournables.</h2>
          
          <div className="horizontal-scroll-mobile grid-4">
            {populaires.map(p => {
              const stock = p.stock?.quantite_disponible ?? p.quantiteDisponible ?? 99;
              const inStock = stock > 0;
              const hasPromo = p.discount > 0;
              const isNew = new Date() - new Date(p.date_creation || p.dateCreation || new Date()) < 30 * 24 * 60 * 60 * 1000;
              const id = p.id_produit || p.idProduit;
              
              return (
                <Link key={id} to={`/produit/${id}`} style={{ display: 'block', background: '#F5F5F7', borderRadius: 20, textDecoration: 'none', color: 'inherit', transition: 'transform 300ms, box-shadow 300ms', flexShrink: 0, width: '100%', minWidth: 240 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 56px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '20px 20px 0 0', overflow: 'hidden', background: '#fff' }}>
                    <img src={p.image_produit || p.imageProduit ? getImageUrl(p.image_produit || p.imageProduit) : CAT_IMAGES.default} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      <button onClick={(e) => { e.preventDefault(); handleAdd(id); }} disabled={!inStock} style={{ width: 36, height: 36, borderRadius: 18, background: '#fff', color: '#0071E3', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inStock ? 'pointer' : 'not-allowed', opacity: inStock ? 1 : 0.5, transition: 'background 200ms, color 200ms' }}
                        onMouseEnter={e => { if(inStock){ e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = '#fff'; } }}
                        onMouseLeave={e => { if(inStock){ e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0071E3'; } }}
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

      {/* SECTION 9: LES FONDATEURS */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container reveal-on-scroll">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6E6E73', marginBottom: 8 }}>L'ÉQUIPE FONDATRICE</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F' }}>Ceux qui font L'Épicerie Moderne.</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { name: 'Salma Motya', role: 'Directrice Qualité', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', quote: '"Notre mission est de redonner sa place au vrai goût, celui de la terre et du travail bien fait."' },
              { name: 'Faycal Lahri', role: 'Directeur des Opérations', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', quote: '"La logistique express est la clé : du champ à l\'assiette en moins de 2 heures, c\'est notre promesse."' },
              { name: 'Adam Bendaoud', role: 'Relations Agriculteurs', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', quote: '"Je passe l\'essentiel de mon temps sur le terrain avec nos producteurs. La confiance, ça se gagne."' }
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 32, padding: 40, boxShadow: '0 20px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 300ms, box-shadow 300ms', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', marginBottom: 24, border: '4px solid #F5F5F7' }}>
                  <img src={f.img} alt={f.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#0071E3', marginBottom: 16 }}>format_quote</span>
                <p style={{ fontSize: 16, color: '#1D1D1F', fontStyle: 'italic', lineHeight: 1.6, flex: 1, marginBottom: 32 }}>{f.quote}</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>{f.name}</h3>
                <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: PROMOTIONS DU MOMENT */}
      {promotions.length > 0 && (
        <section className="apple-section" style={{ background: '#1D1D1F' }}>
          <div className="apple-container reveal-on-scroll">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0071E3', marginBottom: 8, textAlign: 'center' }}>OFFRES LIMITÉES</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12, textAlign: 'center' }}>Faites des économies dès maintenant.</h2>
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
                      <img src={p.image_produit || p.imageProduit ? getImageUrl(p.image_produit || p.imageProduit) : CAT_IMAGES.default} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* SECTION 11: NEWSLETTER */}
      <section className="apple-section" style={{ background: 'radial-gradient(ellipse at top, rgba(0,113,227,0.06) 0%, transparent 70%)', borderTop: '1px solid rgba(0,113,227,0.08)', borderBottom: '1px solid rgba(0,113,227,0.08)' }}>
        <div className="apple-container reveal-on-scroll" style={{ maxWidth: 600, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#0071E3', fontVariationSettings: "'FILL' 1", marginBottom: 16 }}>mail</span>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', marginBottom: 12 }}>Recevez nos offres en avant-première.</h2>
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
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
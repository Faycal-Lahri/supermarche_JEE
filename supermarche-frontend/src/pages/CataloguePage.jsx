import { useState, useEffect, useMemo, memo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { produitsApi, categoriesApi, promotionsPublicApi } from '../api/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
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

const ProductCard = memo(({ p, onAdd, view }) => {
  const stock = p.stock?.quantite_disponible ?? p.quantiteDisponible ?? 99;
  const inStock = stock > 0;
  const hasPromo = p.discount > 0;
  const isNew = new Date() - new Date(p.date_creation || p.dateCreation || new Date()) < 30 * 24 * 60 * 60 * 1000;
  const id = p.id_produit || p.idProduit;

  if (view === 'list') {
    return (
      <Link to={`/produit/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 16, padding: 16, textDecoration: 'none', borderBottom: '1px solid #EDEDF2', transition: 'background 200ms' }} onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
        <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F5F5F7' }}>
          <img src={p.image_produit || p.imageProduit || CAT_IMAGES.default} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {!inStock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }} />}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.nom_categorie || p.nomCategorie}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F' }}>{p.nom_produit || p.nomProduit}</span>
          {hasPromo && <span style={{ display: 'inline-block', background: '#FF453A', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, width: 'fit-content' }}>-{p.discount}%</span>}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div>
            {hasPromo && <span style={{ fontSize: 13, color: '#6E6E73', textDecoration: 'line-through', marginRight: 6 }}>{Number(p.prixOriginal).toFixed(2)} €</span>}
            <span style={{ fontSize: 18, fontWeight: 700, color: hasPromo ? '#0071E3' : '#1D1D1F' }}>{Number(p.prix).toFixed(2)} €</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); onAdd(id); }} disabled={!inStock} style={{ height: 32, padding: '0 16px', borderRadius: 16, background: '#F5F5F7', color: '#0071E3', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, cursor: inStock ? 'pointer' : 'not-allowed', opacity: inStock ? 1 : 0.5, transition: 'background 200ms' }} onMouseEnter={e => { if(inStock){ e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = '#fff'; } }} onMouseLeave={e => { if(inStock){ e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.color = '#0071E3'; } }}>
            {inStock ? 'Ajouter' : 'Épuisé'}
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/produit/${id}`} style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, textDecoration: 'none', color: 'inherit', transition: 'transform 300ms, box-shadow 300ms' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 56px rgba(0,0,0,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '20px 20px 0 0', overflow: 'hidden', background: '#F5F5F7' }}>
        <img src={p.image_produit || p.imageProduit || CAT_IMAGES.default} alt={p.nom_produit || p.nomProduit} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {!inStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#1D1D1F', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999 }}>Épuisé</span>
          </div>
        )}
        {hasPromo && <span style={{ position: 'absolute', top: 12, right: 12, background: '#FF453A', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, zIndex: 2 }}>-{p.discount}%</span>}
        {!hasPromo && isNew && inStock && <span style={{ position: 'absolute', top: 12, left: 12, background: '#30D158', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, zIndex: 2 }}>Nouveau</span>}
      </div>
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#0071E3', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{p.nom_categorie || p.nomCategorie || 'Produit'}</p>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{p.nom_produit || p.nomProduit}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
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
          <button onClick={(e) => { e.preventDefault(); onAdd(id); }} disabled={!inStock} style={{ width: 36, height: 36, borderRadius: 18, background: '#F5F5F7', color: '#0071E3', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inStock ? 'pointer' : 'not-allowed', opacity: inStock ? 1 : 0.5, transition: 'background 200ms, color 200ms' }} onMouseEnter={e => { if(inStock){ e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = '#fff'; } }} onMouseLeave={e => { if(inStock){ e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.color = '#0071E3'; } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          </button>
        </div>
      </div>
    </Link>
  );
});

const SORT_OPTIONS = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'prixAsc', label: 'Prix : croissant' },
  { value: 'prixDesc', label: 'Prix : décroissant' },
  { value: 'nouveau', label: 'Nouveautés' },
  { value: 'promo', label: 'Meilleures promos' }
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          height: 40, 
          padding: '0 16px', 
          background: '#fff', 
          border: '1px solid #D5D5D7', 
          borderRadius: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          fontSize: 14, 
          fontWeight: 600, 
          color: '#1D1D1F',
          cursor: 'pointer',
          transition: 'border-color 200ms'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#8E8E93'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#D5D5D7'}
      >
        {selected.label}
        <span className="material-symbols-outlined" style={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>expand_more</span>
      </button>
      
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ 
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            right: 0, 
            background: 'rgba(255,255,255,0.85)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 16, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            zIndex: 50,
            overflow: 'hidden',
            minWidth: 200,
            animation: 'reveal 200ms ease-out'
          }}>
            {SORT_OPTIONS.map(opt => (
              <button 
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  background: 'transparent', 
                  border: 'none', 
                  borderBottom: opt.value !== SORT_OPTIONS[SORT_OPTIONS.length-1].value ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: opt.value === value ? 700 : 500,
                  color: opt.value === value ? '#0071E3' : '#1D1D1F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 150ms'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {opt.label}
                {opt.value === value && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [catFilter, setCatFilter] = useState(searchParams.get('categorie') ? [Number(searchParams.get('categorie'))] : []);
  const [priceMax, setPriceMax] = useState(200);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [promoOnly, setPromoOnly] = useState(false);
  
  // View state
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('pertinence');
  const [visibleCount, setVisibleCount] = useState(12);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      produitsApi.getAll().catch(()=>({data:[]})),
      categoriesApi.getAll().catch(()=>({data:[]})),
      promotionsPublicApi.getProduits().catch(()=>({data:[]}))
    ]).then(([pRes, cRes, promoRes]) => {
      if (!alive) return;
      const rawProds = pRes.data || pRes || [];
      const cats = cRes.data || cRes || [];
      const promos = promoRes.data || promoRes || [];
      
      const promoMap = new Map(promos.map(p => [p.id_produit || p.idProduit, p]));
      
      const prods = rawProds.map(p => {
        const id = p.id_produit || p.idProduit;
        const promo = promoMap.get(id);
        if (promo) {
          return {
            ...p,
            prixOriginal: parseFloat(promo.prix_original || p.prix),
            prix: parseFloat(promo.prix_promo),
            discount: Math.round(parseFloat(promo.pourcentage)),
          };
        }
        return { ...p, prix: parseFloat(p.prix), discount: 0 };
      });
      
      setProduits(prods);
      setCategories(cats);
      
      let maxP = 0;
      prods.forEach(p => { if(p.prix > maxP) maxP = p.prix; });
      setPriceMax(Math.ceil(maxP) || 200);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const handleAdd = async (id) => {
    try {
      await addToCart(id, 1);
      success('Produit ajouté au panier');
    } catch (e) {
      error(e.message || 'Erreur lors de l\'ajout au panier');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCatFilter([]);
    setInStockOnly(false);
    setPromoOnly(false);
    let maxP = 0;
    produits.forEach(p => { if(p.prix > maxP) maxP = p.prix; });
    setPriceMax(Math.ceil(maxP) || 200);
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let filtered = produits.filter(p => {
      if (searchQuery && !(p.nom_produit || p.nomProduit || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      if (catFilter.length > 0) {
        const prodCat = categories.find(c => (c.id_categorie || c.idCategorie) === (p.id_categorie || p.idCategorie));
        const parentId = prodCat ? (prodCat.id_categorie_parent || prodCat.idCategorieParent) : null;
        if (!catFilter.includes(p.id_categorie || p.idCategorie) && !catFilter.includes(parentId)) {
          return false;
        }
      }
      
      if (inStockOnly && (p.stock?.quantite_disponible ?? p.quantiteDisponible ?? 0) <= 0) return false;
      if (promoOnly && !p.discount) return false;
      return true;
    });

    switch (sort) {
      case 'prixAsc': filtered.sort((a,b) => a.prix - b.prix); break;
      case 'prixDesc': filtered.sort((a,b) => b.prix - a.prix); break;
      case 'nouveau': filtered.sort((a,b) => new Date(b.date_creation || b.dateCreation || 0) - new Date(a.date_creation || a.dateCreation || 0)); break;
      case 'promo': filtered.sort((a,b) => (b.discount || 0) - (a.discount || 0)); break;
      default: break;
    }
    return filtered;
  }, [produits, searchQuery, catFilter, priceMax, inStockOnly, promoOnly, sort]);

  const toggleCat = (id) => {
    if (catFilter.includes(id)) setCatFilter(catFilter.filter(c => c !== id));
    else setCatFilter([...catFilter, id]);
  };

  const renderSidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24, background: '#F5F5F7', borderRadius: 24 }}>
      {/* Search */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Recherche</h3>
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8E8E93' }}>search</span>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Nom du produit..." style={{ width: '100%', paddingLeft: 42, paddingRight: 16, height: 44, boxSizing: 'border-box', background: '#fff', border: '1.5px solid transparent', borderRadius: 12, fontSize: 15, color: '#1D1D1F', outline: 'none', transition: 'border-color 200ms' }} onFocus={e => e.currentTarget.style.borderColor = '#0071E3'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
        </div>
      </div>
      
      {/* Categories */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Catégories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.filter(c => !c.id_categorie_parent && !c.idCategorieParent).map(parentCat => {
            const parentId = parentCat.id_categorie || parentCat.idCategorie;
            const isParentChecked = catFilter.includes(parentId);
            
            const subCats = categories.filter(c => (c.id_categorie_parent || c.idCategorieParent) === parentId);
            
            return (
              <div key={parentId} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 0' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: isParentChecked ? 'none' : '1.5px solid #C7C7CC', background: isParentChecked ? '#0071E3' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms', flexShrink: 0 }}>
                    {isParentChecked && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff', fontWeight: 800 }}>check</span>}
                  </div>
                  <span style={{ fontSize: 15, color: isParentChecked ? '#1D1D1F' : '#6E6E73', fontWeight: isParentChecked ? 600 : 400, transition: 'color 200ms' }}>{parentCat.nom_categorie || parentCat.nomCategorie}</span>
                  <input type="checkbox" checked={isParentChecked} onChange={() => toggleCat(parentId)} style={{ display: 'none' }} />
                </label>
                
                {/* Subcategories */}
                {subCats.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 34 }}>
                    {subCats.map(sub => {
                      const subId = sub.id_categorie || sub.idCategorie;
                      const isSubChecked = catFilter.includes(subId);
                      return (
                        <label key={subId} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: isSubChecked ? 'none' : '1px solid #C7C7CC', background: isSubChecked ? '#30D158' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms', flexShrink: 0 }}>
                            {isSubChecked && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>check</span>}
                          </div>
                          <span style={{ fontSize: 14, color: isSubChecked ? '#1D1D1F' : '#8E8E93', fontWeight: isSubChecked ? 500 : 400, transition: 'color 200ms' }}>{sub.nom_categorie || sub.nomCategorie}</span>
                          <input type="checkbox" checked={isSubChecked} onChange={() => toggleCat(subId)} style={{ display: 'none' }} />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#fff', padding: '16px 20px', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: 15, color: '#1D1D1F', fontWeight: 500 }}>En stock uniquement</span>
          <div style={{ width: 44, height: 24, borderRadius: 12, background: inStockOnly ? '#30D158' : '#E5E5EA', position: 'relative', transition: 'background 300ms' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: inStockOnly ? 22 : 2, transition: 'left 300ms, box-shadow 300ms', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
          </div>
          <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} style={{ display: 'none' }} />
        </label>
        <div style={{ height: 1, background: '#F5F5F7' }} />
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: 15, color: '#1D1D1F', fontWeight: 500 }}>Promotions uniquement</span>
          <div style={{ width: 44, height: 24, borderRadius: 12, background: promoOnly ? '#30D158' : '#E5E5EA', position: 'relative', transition: 'background 300ms' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: promoOnly ? 22 : 2, transition: 'left 300ms, box-shadow 300ms', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
          </div>
          <input type="checkbox" checked={promoOnly} onChange={e => setPromoOnly(e.target.checked)} style={{ display: 'none' }} />
        </label>
      </div>

      <button onClick={resetFilters} style={{ background: '#FFF0F0', color: '#FF3B30', border: 'none', borderRadius: 12, height: 44, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#FFE5E5'} onMouseLeave={e=>e.currentTarget.style.background='#FFF0F0'}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>restart_alt</span>
        Réinitialiser
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-sf)', color: 'var(--apple-text)', background: 'var(--apple-surface)', minHeight: '100vh' }}>
      <ClientNavbar transparentOnTop={true} />
      
      {/* HEADER FULL SCREEN */}
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
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
          alt="Catalogue" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: 800 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, color: '#30D158' }}>NOTRE SÉLECTION</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1.1 }}>
            Catalogue complet.
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', margin: '0 auto 32px', lineHeight: 1.5 }}>
            Découvrez nos produits frais, locaux et de saison.
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#fff', padding: '8px 20px', borderRadius: 9999, fontSize: 15, fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
            {filteredProducts.length} produits trouvés
          </div>
        </div>
      </section>

      <div className="apple-container" style={{ paddingTop: 60, paddingBottom: 80 }}>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '280px 1fr', gap: 40, alignItems: 'start' }}>
          
          {/* SIDEBAR DESKTOP */}
          <div className="hide-mobile" style={{ position: 'sticky', top: 100 }}>
              {renderSidebar()}
          </div>

          {/* MAIN CONTENT */}
          <div>
            {/* TOOLBAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <button className="hide-desktop" onClick={() => setShowMobileFilter(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #D5D5D7', borderRadius: 9999, height: 40, padding: '0 16px', fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>tune</span> Filtres
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
                <SortDropdown value={sort} onChange={setSort} />
                
                <div style={{ display: 'flex', background: '#fff', borderRadius: 8, padding: 4, gap: 4 }}>
                  <button onClick={() => setView('grid')} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: view === 'grid' ? '#F5F5F7' : 'transparent', color: view === 'grid' ? '#0071E3' : '#8E8E93' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: view === 'grid' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
                  </button>
                  <button onClick={() => setView('list')} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: view === 'list' ? '#F5F5F7' : 'transparent', color: view === 'list' ? '#0071E3' : '#8E8E93' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: view === 'list' ? "'FILL' 1" : "'FILL' 0" }}>view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* GRID/LIST */}
            {loading ? (
              <div className={view === 'grid' ? "grid-3" : ""} style={{ display: view === 'grid' ? 'grid' : 'flex', flexDirection: 'column', gap: 24 }}>
                {[...Array(6)].map((_, i) => <div key={i} style={{ height: view === 'grid' ? 300 : 100, background: '#fff', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D5D5D7', marginBottom: 16 }}>production_quantity_limits</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginBottom: 8 }}>Aucun produit trouvé</h3>
                <p style={{ fontSize: 15, color: '#6E6E73' }}>Modifiez vos filtres ou effectuez une autre recherche.</p>
                <button onClick={resetFilters} style={{ marginTop: 24, background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, height: 44, padding: '0 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Réinitialiser les filtres</button>
              </div>
            ) : (
              <>
                <div className={view === 'grid' ? "grid-3" : ""} style={{ display: view === 'grid' ? 'grid' : 'flex', flexDirection: 'column', gap: view === 'grid' ? 24 : 16 }}>
                  {filteredProducts.slice(0, visibleCount).map(p => (
                    <ProductCard key={p.id_produit || p.idProduit} p={p} onAdd={handleAdd} view={view} />
                  ))}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div style={{ marginTop: 48, textAlign: 'center' }}>
                    <button onClick={() => setVisibleCount(v => v + 12)} style={{ background: '#fff', color: '#1D1D1F', border: '1px solid #D5D5D7', borderRadius: 9999, height: 44, padding: '0 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#F5F5F7'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                      Charger plus de produits
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* MOBILE FILTER MODAL */}
      {showMobileFilter && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowMobileFilter(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '24px 24px 0 0', height: '85vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 300ms cubic-bezier(0.2,0,0,1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDEDF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#1D1D1F' }}>Filtres</h2>
              <button onClick={() => setShowMobileFilter(false)} style={{ background: '#F5F5F7', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1D1D1F' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {renderSidebar()}
            </div>
            <div style={{ padding: 24, borderTop: '1px solid #EDEDF2', background: '#F5F5F7' }}>
              <button onClick={() => setShowMobileFilter(false)} style={{ width: '100%', background: '#0071E3', color: '#fff', height: 48, borderRadius: 9999, border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                Afficher {filteredProducts.length} produits
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

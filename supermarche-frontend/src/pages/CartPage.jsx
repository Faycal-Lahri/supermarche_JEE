import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ClientNavbar from '../components/ClientNavbar';

export default function CartPage() {
  const { items, total, count, promoMap, getEffectivePrix, updateQty, removeFromCart, loading } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [removingIds, setRemovingIds] = useState(new Set());
  const debounceTimers = useRef({});

  // promoMap et getEffectivePrix viennent du CartContext (source unique)

  const handleRemove = useCallback((id) => {
    setRemovingIds(s => new Set([...s, id]));
    setTimeout(() => {
      removeFromCart(id).catch(() => error('Erreur lors de la suppression'));
      setRemovingIds(s => { const n = new Set(s); n.delete(id); return n; });
    }, 400);
  }, [removeFromCart, error]);

  const handleQty = useCallback((id, qty) => {
    if (qty <= 0) { handleRemove(id); return; }
    clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(() => {
      updateQty(id, qty).catch(() => error('Erreur mise à jour quantité'));
    }, 500);
  }, [updateQty, handleRemove, error]);

  // ── Calculs ──
  const isFreeShipping = total >= 35;
  const shipping = isFreeShipping ? 0 : 5.99;

  const finalTotal = total + shipping;

  const economies = items.reduce((sum, it) => {
    const pid = it.id_produit || it.idProduit;
    const promo = promoMap.get(pid);
    if (!promo) return sum;
    const prixOriginal = parseFloat(promo.prix_original || 0);
    const prixPromo = parseFloat(it.prix_unitaire_snapshot || it.prixUnitaireSnapshot || 0);
    return sum + (prixOriginal - prixPromo) * it.quantite;
  }, 0);

  if (!loading && items.length === 0) return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', textAlign: 'center', padding: 24 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 80, color: '#D5D5D7', marginBottom: 24 }}>shopping_bag</span>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 12 }}>Votre panier est vide</h1>
        <p style={{ color: '#6E6E73', fontSize: 17, marginBottom: 32 }}>Découvrez notre sélection de produits frais.</p>
        <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 24px', background: '#0071E3', color: '#fff', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms' }}
          onMouseEnter={e => e.currentTarget.style.background = '#006EDB'}
          onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
        >
          Parcourir le catalogue
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar />
      <div className="apple-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1D1D1F' }}>Votre panier.</h1>
          <p style={{ fontSize: 17, color: '#6E6E73', marginTop: 8 }}>{count} article{count > 1 ? 's' : ''} • Sous-total : {Number(total).toFixed(2)} €</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'minmax(0,1fr) 380px', gap: window.innerWidth < 768 ? 24 : 40, alignItems: 'flex-start', animation: 'fadeSlideUp 600ms ease forwards' }}>
          
          {/* ── LISTE DES ARTICLES ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(it => {
              const pid = it.id_produit || it.idProduit;
              const isRemoving = removingIds.has(pid);
              const promo = promoMap.get(pid);
              // Prix effectif = prix promo si dispo, sinon snapshot
              const prixUnit = getEffectivePrix(it);
              const prixOriginal = parseFloat(it.prix_unitaire_snapshot || it.prixUnitaireSnapshot || 0);
              const hasPromoLine = promo && prixUnit < prixOriginal;
              const lineTotal = it.quantite * prixUnit;
              
              return (
                <div key={pid} style={{ display: 'flex', gap: 20, background: '#fff', borderRadius: 24, padding: 20, transition: 'all 300ms', opacity: isRemoving ? 0 : 1, transform: isRemoving ? 'translateX(-20px)' : 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  {/* Image avec badge promo */}
                  <div style={{ width: 120, height: 120, borderRadius: 16, background: '#F5F5F7', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <img src={it.image_produit || it.imageProduit || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'} alt={it.nom_produit || it.nomProduit} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {promo && (
                      <div style={{ position: 'absolute', top: 6, right: 6, background: '#FF453A', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 9999 }}>
                        -{Math.round(promo.pourcentage || 0)}%
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Link to={`/produit/${pid}`} style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', textDecoration: 'none', display: 'block', marginBottom: 4 }}>
                          {it.nom_produit || it.nomProduit}
                        </Link>
                        <div style={{ fontSize: 14, color: '#6E6E73' }}>{it.nom_categorie || it.nomCategorie || 'Produit'}</div>
                        {/* Prix unitaire avec barré si promo */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                          {promo && (
                            <span style={{ fontSize: 13, color: '#8E8E93', textDecoration: 'line-through' }}>
                              {parseFloat(promo.prix_original).toFixed(2)} €/u
                            </span>
                          )}
                          <span style={{ fontSize: 14, color: promo ? '#0071E3' : '#6E6E73', fontWeight: promo ? 600 : 400 }}>
                            {prixUnit.toFixed(2)} €/u
                          </span>
                        </div>
                      </div>
                      {/* Total ligne */}
                      <div style={{ fontSize: 20, fontWeight: 800, color: promo ? '#0071E3' : '#1D1D1F' }}>
                        {lineTotal.toFixed(2)} €
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#F5F5F7', borderRadius: 9999, padding: '4px 12px', gap: 16 }}>
                        <button onClick={() => handleQty(pid, it.quantite - 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: '#1D1D1F' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>remove</span>
                        </button>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1F', width: 24, textAlign: 'center' }}>{it.quantite}</span>
                        <button onClick={() => handleQty(pid, it.quantite + 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: '#1D1D1F' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                        </button>
                      </div>
                      <button onClick={() => handleRemove(pid)} style={{ border: 'none', background: 'transparent', color: '#FF453A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── RÉCAPITULATIF ── */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', position: 'sticky', top: 100 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1D1D1F', marginBottom: 24, letterSpacing: '-0.02em' }}>Récapitulatif</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#6E6E73' }}>
                <span>Sous-total ({count} articles)</span>
                <span>{Number(total).toFixed(2)} €</span>
              </div>

              {/* Économies promotions */}
              {economies > 0.01 && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 14, color: '#1C9E4B', fontWeight: 700,
                  background: 'rgba(48,209,88,0.08)',
                  padding: '8px 12px', borderRadius: 10
                }}>
                  <span>🎁 Économies promotions</span>
                  <span>-{economies.toFixed(2)} €</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#6E6E73' }}>
                <span>Frais de livraison</span>
                <span style={{ color: isFreeShipping ? '#30D158' : '#1D1D1F', fontWeight: isFreeShipping ? 600 : 400 }}>
                  {isFreeShipping ? 'Offerts' : '5.99 €'}
                </span>
              </div>
              {!isFreeShipping && (
                <div style={{ fontSize: 13, color: '#0071E3', background: 'rgba(0,113,227,0.08)', padding: 12, borderRadius: 12 }}>
                  Plus que {(35 - total).toFixed(2)} € pour la livraison gratuite !
                </div>
              )}
            </div>



            <div style={{ height: 1, background: '#EDEDF2', margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F' }}>Total TTC</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em' }}>{finalTotal.toFixed(2)} €</span>
            </div>
            
            <button
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
              style={{ width: '100%', height: 56, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 17, fontWeight: 600, cursor: 'pointer', transition: 'background 200ms, transform 200ms', opacity: items.length === 0 ? 0.5 : 1 }}
              onMouseEnter={e => { if (items.length > 0) e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#006EDB'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#0071E3'; }}
            >
              Commander
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/catalogue" style={{ fontSize: 14, color: '#0071E3', textDecoration: 'none', fontWeight: 600 }}>Continuer mes achats</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

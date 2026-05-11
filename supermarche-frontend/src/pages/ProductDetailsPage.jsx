import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { produitsApi, promotionsPublicApi } from '../api/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ClientNavbar from '../components/ClientNavbar';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggested, setSuggested] = useState([]);
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setSuggested([]);
    setQty(1);
    Promise.all([
      produitsApi.getById(id),
      promotionsPublicApi.getProduits().catch(() => ({ data: [] })),
      produitsApi.getAll().catch(() => [])
    ]).then(([prodRes, promosRes, allRes]) => {
      const prod = prodRes.data || prodRes;
      const promos = promosRes.data || promosRes || [];
      const found = Array.isArray(promos)
        ? promos.find(p => (p.id_produit || p.idProduit) === parseInt(id))
        : null;
      if (found) {
        prod._prixOriginal = parseFloat(found.prix_original || prod.prix);
        prod._prixPromo    = parseFloat(found.prix_promo);
        prod._discount     = Math.round(parseFloat(found.pourcentage || 0));
        setPromo(found);
      }
      setProduct(prod);

      // Suggestions : produits d'autres catégories, mélangés aléatoirement
      const all = Array.isArray(allRes.data || allRes) ? (allRes.data || allRes) : [];
      const currentCat = prod.id_categorie || prod.idCategorie;
      const others = all.filter(p =>
        (p.id_produit || p.idProduit) !== parseInt(id) &&
        (p.id_categorie || p.idCategorie) !== currentCat &&
        p.actif !== false
      );
      // Mélange Fisher-Yates puis on prend 8
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      setSuggested(others.slice(0, 8));
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(id, qty);
      success('Ajouté au panier');
      setQty(1);
    } catch (e) {
      error(e.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh' }}>
      <ClientNavbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <div className="spinner" style={{ borderColor: '#0071E3', borderTopColor: 'transparent' }} />
      </div>
    </div>
  );
  
  if (!product) return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', textAlign: 'center', paddingTop: 120 }}>
      <ClientNavbar />
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Produit introuvable</h1>
      <Link to="/catalogue" style={{ color: '#0071E3', marginTop: 16, display: 'inline-block' }}>Retour au catalogue</Link>
    </div>
  );

  const stock = product.stock?.quantite_disponible ?? product.quantite_disponible ?? product.quantiteDisponible ?? 0;
  const inStock = stock > 0;
  const hasPromo = product._discount > 0;

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar />
      <div className="apple-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, fontSize: 14, color: '#8E8E93', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/catalogue" style={{ color: '#0071E3', textDecoration: 'none', fontWeight: 600 }}>Catalogue</Link>
          <span>›</span>
          <span>{product.nom_categorie || product.nomCategorie || 'Produit'}</span>
          <span>›</span>
          <span style={{ color: '#1D1D1F' }}>{product.nom_produit || product.nomProduit}</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 32, overflow: 'hidden', display: 'flex', flexWrap: 'wrap', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          
          {/* IMAGE COLUMN */}
          <div style={{ flex: '1 1 500px', minWidth: 300, background: '#F5F5F7', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img
              src={product.image_produit || product.imageProduit || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
              alt={product.nom_produit || product.nomProduit}
              style={{ width: '100%', maxWidth: 500, aspectRatio: '1/1', objectFit: 'cover', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
            {/* Badge promo sur l'image */}
            {hasPromo && (
              <div style={{
                position: 'absolute', top: 20, right: 20,
                background: '#FF453A', color: '#fff',
                fontSize: 15, fontWeight: 900, padding: '8px 14px',
                borderRadius: 9999, boxShadow: '0 4px 12px rgba(255,69,58,0.4)',
                animation: 'pulse 2s infinite'
              }}>
                -{product._discount}%
              </div>
            )}
          </div>

          {/* INFO COLUMN */}
          <div style={{ flex: '1 1 400px', padding: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0071E3', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              {product.nom_categorie || product.nomCategorie}
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
              {product.nom_produit || product.nomProduit}
            </h1>
            <p style={{ fontSize: 17, color: '#6E6E73', lineHeight: 1.6, marginBottom: 32 }}>
              {product.description || 'Description non disponible.'}
            </p>

            {/* ── BLOC PRIX ── */}
            {hasPromo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {/* Badge texte promo */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#FF453A', color: '#fff',
                  fontSize: 13, fontWeight: 800,
                  padding: '4px 12px', borderRadius: 9999,
                  width: 'fit-content'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
                    local_offer
                  </span>
                  -{product._discount}% • Offre limitée
                </span>

                {/* Prix promo + barré */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span style={{
                    fontSize: 40, fontWeight: 900, color: '#0071E3',
                    letterSpacing: '-0.03em'
                  }}>
                    {product._prixPromo.toFixed(2)} €
                  </span>
                  <span style={{
                    fontSize: 22, color: '#8E8E93',
                    textDecoration: 'line-through', fontWeight: 500
                  }}>
                    {product._prixOriginal.toFixed(2)} €
                  </span>
                </div>

                {/* Économie */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(48,209,88,0.1)', color: '#1C9E4B',
                  fontSize: 13, fontWeight: 700,
                  padding: '6px 12px', borderRadius: 9999, width: 'fit-content'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                    savings
                  </span>
                  Vous économisez {(product._prixOriginal - product._prixPromo).toFixed(2)} €
                </div>

                {/* Date fin promo si dispo */}
                {promo?.date_fin && (
                  <div style={{ fontSize: 12, color: '#FF9F0A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    Offre valable jusqu'au {new Date(promo.date_fin).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                fontSize: 40, fontWeight: 900, color: '#1D1D1F',
                letterSpacing: '-0.03em', marginBottom: 32
              }}>
                {Number(product.prix).toFixed(2)} €
              </div>
            )}

            {/* ── AJOUTER AU PANIER ── */}
            {inStock ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F5F5F7', borderRadius: 9999, padding: '4px 12px', height: 56 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 24, color: '#1D1D1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                  <span style={{ fontSize: 18, fontWeight: 700, width: 32, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(stock, qty + 1))} style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 24, color: '#1D1D1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  style={{ flex: 1, height: 56, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 17, fontWeight: 600, cursor: adding ? 'wait' : 'pointer', transition: 'background 200ms, transform 200ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#006EDB'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#0071E3'; }}
                >
                  {adding ? 'Ajout...' : '🛒 Ajouter au panier'}
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', background: 'rgba(255,69,58,0.1)', color: '#FF453A', borderRadius: 16, fontSize: 15, fontWeight: 600, marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="material-symbols-outlined">sentiment_dissatisfied</span> Rupture de stock
              </div>
            )}

            {/* ── BADGES QUALITÉ ── */}
            <div style={{ display: 'flex', gap: 24, borderTop: '1px solid #EDEDF2', paddingTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6E6E73', fontWeight: 500 }}>
                <span className="material-symbols-outlined" style={{ color: '#30D158' }}>verified</span> Qualité garantie
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6E6E73', fontWeight: 500 }}>
                <span className="material-symbols-outlined" style={{ color: '#0071E3' }}>local_shipping</span> Livraison 2h
              </div>
              {hasPromo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#FF9F0A', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span> Promotion active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── VOUS AIMEREZ AUSSI ── */}
      {suggested.length > 0 && (
        <div className="apple-container" style={{ paddingBottom: 80 }}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>
                Vous aimerez aussi
              </h2>
              <p style={{ fontSize: 15, color: '#6E6E73' }}>Découvrez d'autres produits de notre catalogue</p>
            </div>
            <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#0071E3', textDecoration: 'none' }}>
              Voir tout le catalogue
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
          </div>

          {/* Grille scrollable horizontalement */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 20,
            overflowX: 'auto',
            paddingBottom: 8
          }}>
            {suggested.map(p => {
              const pid = p.id_produit || p.idProduit;
              const nom = p.nom_produit || p.nomProduit || 'Produit';
              const cat = p.nom_categorie || p.nomCategorie || '';
              const img = p.image_produit || p.imageProduit || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
              const prix = Number(p.prix || 0);
              const stock = p.quantite_disponible || p.quantiteDisponible || 0;

              return (
                <div
                  key={pid}
                  onClick={() => navigate(`/produit/${pid}`)}
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 250ms, box-shadow 250ms',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: 160, background: '#F5F5F7', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={nom}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {stock === 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 9999 }}>Rupture de stock</span>
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      {cat}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', marginBottom: 10, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {nom}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#1D1D1F' }}>{prix.toFixed(2)} €</span>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (stock === 0) return;
                          setAddingId(pid);
                          try {
                            await addToCart(pid, 1);
                            success(`${nom} ajouté au panier`);
                          } catch (err) {
                            error(err.message || 'Erreur');
                          } finally {
                            setAddingId(null);
                          }
                        }}
                        disabled={stock === 0 || addingId === pid}
                        style={{
                          width: 36, height: 36, borderRadius: 9999,
                          background: stock === 0 ? '#EDEDF2' : '#0071E3',
                          color: '#fff', border: 'none', cursor: stock === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'transform 150ms, background 200ms',
                          opacity: addingId === pid ? 0.6 : 1
                        }}
                        onMouseEnter={e => { if (stock > 0) e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title={stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                      >
                        {addingId === pid
                          ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: '#fff', borderTopColor: 'transparent' }} />
                          : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_shopping_cart</span>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

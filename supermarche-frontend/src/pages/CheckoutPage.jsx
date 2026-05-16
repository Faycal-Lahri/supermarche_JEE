import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { publicCommandesApi, promoApi, profilApi, getImageUrl } from '../api/api';
import ClientNavbar from '../components/ClientNavbar';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, count, clearCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adresse: user?.adresse || '',
    ville: user?.ville || 'Casablanca',
    code_postal: user?.code_postal || '',
    telephone: user?.telephone || '',
    notes: '',
    methode_paiement: 'CASH'
  });

  // Charger le profil complet pour pré-remplir téléphone et code postal
  useEffect(() => {
    if (user) {
      profilApi.get().then(res => {
        const p = res.data || res;
        setForm(prev => ({
          ...prev,
          adresse: p.adresse || prev.adresse || '',
          ville: p.ville || prev.ville || 'Casablanca',
          code_postal: p.code_postal || p.codePostal || prev.code_postal || '',
          telephone: p.telephone || prev.telephone || '',
        }));
      }).catch(() => {});
    }
  }, [user]);

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const isFreeShipping = total >= 35;
  const shipping = isFreeShipping ? 0 : 5.99;
  const finalTotal = Math.max(0, total - (appliedPromo ? appliedPromo.remise : 0)) + shipping;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const res = await promoApi.valider({ code: promoInput, montant: total });
      if (res.data && res.data.valid) {
        setAppliedPromo(res.data);
        success(`Code appliqué ! Vous économisez ${Number(res.data.remise).toFixed(2)} €`);
      } else {
        error(res.data?.message || 'Code invalide ou expiré');
        setAppliedPromo(null);
      }
    } catch (err) {
      console.error(err);
      error(err.message || 'Code invalide ou expiré');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return error('Votre panier est vide');
    if (!form.adresse || !form.telephone) return error('Veuillez remplir les champs obligatoires');
    
    setLoading(true);
    try {
      const payload = {
        adresse_livraison: `${form.adresse}, ${form.code_postal} ${form.ville}`,
        methode_paiement: form.methode_paiement,
        notes: form.notes
      };
      
      if (appliedPromo) {
        payload.id_code_promo = appliedPromo.id_code_promo;
        payload.montant_remise = appliedPromo.remise;
      }
      
      const res = await publicCommandesApi.create(payload);
      const commandeId = res.data?.id_commande || res.data?.idCommande || res.id_commande;
      
      await clearCart();
      success('Commande confirmée avec succès !');
      navigate(`/order-confirmation/${commandeId}`);
    } catch (err) {
      error(err.message || 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar />
      
      <div className="apple-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1D1D1F' }}>Paiement sécurisé.</h1>
          <p style={{ fontSize: 17, color: '#6E6E73', marginTop: 8 }}>Finalisez votre commande en toute simplicité.</p>
        </header>

        <div className="checkout-grid">
          
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 24, padding: 40, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', marginBottom: 24 }}>1. Coordonnées de livraison</h2>
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Adresse complète *</label>
                <input required value={form.adresse} onChange={e=>setForm({...form, adresse:e.target.value})} className="apple-input" placeholder="N° de rue, nom de rue..." />
              </div>
              <div className="checkout-ville-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Ville *</label>
                  <input required value={form.ville} onChange={e=>setForm({...form, ville:e.target.value})} className="apple-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Code postal</label>
                  <input value={form.code_postal} onChange={e=>setForm({...form, code_postal:e.target.value})} className="apple-input" placeholder="Ex: 20000" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Téléphone *</label>
                <input required type="tel" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})} className="apple-input" placeholder="06..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Instructions au livreur (Optionnel)</label>
                <textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} className="apple-input" style={{ height: 80, paddingTop: 12, resize: 'none' }} placeholder="Code d'entrée, étage..." />
              </div>
            </div>

            <div style={{ height: 1, background: '#EDEDF2', margin: '40px 0' }} />

            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', marginBottom: 24 }}>2. Méthode de paiement</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { id: 'CASH', title: 'Paiement à la livraison', icon: 'payments', desc: 'Espèces ou TPE à la réception' },
                { id: 'CARD', title: 'Carte Bancaire', icon: 'credit_card', desc: 'Paiement en ligne sécurisé (Bientôt)' }
              ].map(opt => (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: form.methode_paiement === opt.id ? '2px solid #0071E3' : '2px solid transparent', background: '#F5F5F7', borderRadius: 16, cursor: opt.id==='CARD'?'not-allowed':'pointer', opacity: opt.id==='CARD'?0.5:1, transition: 'all 200ms' }}>
                  <input type="radio" name="payment" checked={form.methode_paiement === opt.id} onChange={() => setForm({...form, methode_paiement:opt.id})} disabled={opt.id === 'CARD'} style={{ width: 20, height: 20, accentColor: '#0071E3' }} />
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#1D1D1F' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1F' }}>{opt.title}</div>
                    <div style={{ fontSize: 13, color: '#6E6E73' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', height: 56, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 17, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', marginTop: 40, transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#006EDB'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#0071E3'; }}
            >
              {loading ? 'Traitement...' : `Payer ${finalTotal.toFixed(2)} €`}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#8E8E93', marginTop: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>lock</span>
              Connexion sécurisée SSL 256 bits
            </p>
          </form>

          {/* RÉSUMÉ */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', position: 'sticky', top: 100 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginBottom: 24 }}>Votre commande</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
              {items.map(it => {
                const pid = it.id_produit || it.idProduit;
                return (
                  <div key={pid} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 12, background: '#F5F5F7', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={it.image_produit || it.imageProduit ? getImageUrl(it.image_produit || it.imageProduit) : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt={it.nom_produit || it.nomProduit} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{it.nom_produit || it.nomProduit}</div>
                      <div style={{ fontSize: 13, color: '#6E6E73' }}>Qté: {it.quantite}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>{(it.quantite * parseFloat(it.prix_unitaire_snapshot || it.prixUnitaireSnapshot || 0)).toFixed(2)} €</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ height: 1, background: '#EDEDF2', margin: '24px 0' }} />
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Code Promo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={promoInput} onChange={e=>setPromoInput(e.target.value)} disabled={!!appliedPromo} className="apple-input" style={{ textTransform: 'uppercase' }} placeholder="Ex: ETE2024" />
                {!appliedPromo ? (
                  <button type="button" onClick={handleApplyPromo} disabled={promoLoading || !promoInput.trim()} style={{ padding: '0 16px', borderRadius: 12, background: '#1D1D1F', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: promoLoading || !promoInput.trim() ? 0.5 : 1 }}>
                    {promoLoading ? '...' : 'Appliquer'}
                  </button>
                ) : (
                  <button type="button" onClick={() => setAppliedPromo(null)} style={{ padding: '0 16px', borderRadius: 12, background: 'rgba(255,69,58,0.1)', color: '#FF453A', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Retirer
                  </button>
                )}
              </div>
              {appliedPromo && (
                <div style={{ fontSize: 13, color: '#30D158', fontWeight: 600, marginTop: 8 }}>
                  Code {appliedPromo.code} appliqué (-{Number(appliedPromo.remise).toFixed(2)} €)
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6E6E73' }}>
                <span>Sous-total ({count} articles)</span>
                <span>{Number(total).toFixed(2)} €</span>
              </div>
              {appliedPromo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#30D158' }}>
                  <span>Remise ({appliedPromo.code})</span>
                  <span>-{Number(appliedPromo.remise).toFixed(2)} €</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6E6E73' }}>
                <span>Livraison</span>
                <span style={{ color: isFreeShipping ? '#30D158' : '#1D1D1F' }}>{isFreeShipping ? 'Offerte' : '5.99 €'}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F' }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.02em' }}>{finalTotal.toFixed(2)} €</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

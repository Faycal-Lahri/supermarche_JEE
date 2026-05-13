import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicCommandesApi } from '../api/api';
import ClientNavbar from '../components/ClientNavbar';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [cmd, setCmd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicCommandesApi.getById(id)
      .then(res => setCmd(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh' }}>
      <ClientNavbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <div className="spinner" style={{ borderColor: '#0071E3', borderTopColor: 'transparent' }} />
      </div>
    </div>
  );

  if (!cmd) return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', textAlign: 'center', paddingTop: 120 }}>
      <ClientNavbar />
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Commande introuvable</h1>
    </div>
  );

  const STATUS_CFG = {
    en_attente:     { label: 'En attente', color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)', step: 1 },
    confirmee:      { label: 'Confirmée', color: '#0A84FF', bg: 'rgba(10,132,255,0.1)', step: 2 },
    en_preparation: { label: 'Préparation', color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)', step: 3 },
    en_livraison:   { label: 'En livraison', color: '#32ADE6', bg: 'rgba(50,173,230,0.1)', step: 4 },
    livree:         { label: 'Livrée', color: '#30D158', bg: 'rgba(48,209,88,0.1)', step: 5 },
    annulee:        { label: 'Annulée', color: '#FF453A', bg: 'rgba(255,69,58,0.1)', step: 0 },
  };

  const cfg = STATUS_CFG[cmd.statut_commande || cmd.statutCommande || cmd.statut] || STATUS_CFG.en_attente;

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar />
      <div className="apple-container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 1100 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#30D158', marginBottom: 16 }}>check_circle</span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 8 }}>Merci pour votre commande.</h1>
          <p style={{ fontSize: 17, color: '#6E6E73' }}>Votre commande #{cmd.id_commande || cmd.numero_commande} a bien été enregistrée.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: window.innerWidth < 768 ? 24 : 32, animation: 'fadeSlideUp 600ms ease forwards' }}>
          {/* COLONNE GAUCHE : INFOS COMMANDE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Statut de la commande</div>
                <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, padding: '6px 12px', borderRadius: 9999, fontSize: 13, fontWeight: 700 }}>{cfg.label}</span>
              </div>
              
              {cmd.statut_commande !== 'annulee' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} style={{ flex: 1, height: 6, borderRadius: 3, background: step <= cfg.step ? '#0071E3' : '#D5D5D7', transition: 'background 500ms' }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Livraison</div>
                <div style={{ fontSize: 15, color: '#1D1D1F', lineHeight: 1.6 }}>{cmd.adresse_livraison || cmd.adresseLivraison || 'Adresse non renseignée'}</div>
                {(cmd.code_postal_livraison || cmd.ville_livraison) && (
                  <div style={{ fontSize: 15, color: '#6E6E73', marginTop: 4 }}>
                    {cmd.code_postal_livraison} {cmd.ville_livraison}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Paiement</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#1D1D1F', lineHeight: 1.6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#FF9F0A' }}>
                    {(cmd.mode_paiement || cmd.methode_paiement) === 'carte' ? 'credit_card' : 'local_shipping'}
                  </span>
                  {(cmd.mode_paiement || cmd.methode_paiement) === 'carte' ? 'Carte bancaire' : 'À la livraison'}
                </div>
              </div>
            </div>
            
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>Détails de la transaction</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#6E6E73' }}>Référence</span>
                  <span style={{ fontWeight: 600, color: '#1D1D1F' }}>#{cmd.numero_commande || cmd.id_commande}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#6E6E73' }}>Date de commande</span>
                  <span style={{ fontWeight: 600, color: '#1D1D1F' }}>{new Date(cmd.date_commande || cmd.dateCommande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : ARTICLES ET TOTAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginBottom: 20 }}>Détail des articles</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {(cmd.lignes || cmd.lignesCommande || []).map((l, i) => {
                  const nom = l.nom_produit_snapshot || l.nomProduitSnapshot || l.nom_produit || l.nomProduit || `Article #${l.id_produit || l.idProduit}`;
                  const image = l.image_produit || l.imageProduit || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100';
                  const prix = parseFloat(l.prix_unitaire_snapshot || l.prixUnitaireSnapshot || l.prix_unitaire || l.prixUnitaire || 0);
                  const sousTotal = parseFloat(l.sous_total || l.sousTotal || (prix * l.quantite));
                  return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#F5F5F7', borderRadius: 16 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: '#EDEDF2', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', marginBottom: 4 }}>{nom}</div>
                        <div style={{ fontSize: 14, color: '#6E6E73' }}>Qté: {l.quantite} × {prix.toFixed(2)} €</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1F', display: 'flex', alignItems: 'center' }}>
                      {sousTotal.toFixed(2)} €
                    </div>
                  </div>
                )})}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px', background: '#FAFAFC', borderRadius: 20, border: '1px solid #EDEDF2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#6E6E73' }}>
                  <span>Sous-total des articles</span>
                  <span style={{ fontWeight: 600, color: '#1D1D1F' }}>
                    {Number((cmd.lignes || cmd.lignesCommande || []).reduce((acc, l) => acc + parseFloat(l.sous_total || l.sousTotal || (l.quantite * parseFloat(l.prix_unitaire_snapshot || l.prixUnitaireSnapshot || 0))), 0)).toFixed(2)} €
                  </span>
                </div>
                
                {(cmd.code_promo_utilise || cmd.codePromoUtilise) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#30D158' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                      Code Promo ({cmd.code_promo_utilise || cmd.codePromoUtilise})
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      −{Number(cmd.montant_remise || cmd.montantRemise || 0).toFixed(2)} €
                    </span>
                  </div>
                )}
                
                <div style={{ height: 1, background: '#EDEDF2', margin: '4px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, color: '#1D1D1F', fontWeight: 700 }}>Total Payé</span>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.02em' }}>{Number(cmd.montant_total || cmd.montantTotal || cmd.total || 0).toFixed(2)} €</span>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 32px', background: '#0071E3', color: '#fff', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 200ms, transform 200ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#005BB5'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Retour à la boutique
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

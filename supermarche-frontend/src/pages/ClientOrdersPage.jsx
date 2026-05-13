import { useState, useEffect } from 'react';
import { publicCommandesApi, clientApi } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_CFG = {
  en_attente:     { label: 'En attente',    color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)',  step: 1 },
  confirmee:      { label: 'Confirmée',     color: '#0A84FF', bg: 'rgba(10,132,255,0.1)',  step: 2 },
  en_preparation: { label: 'Préparation',   color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)', step: 3 },
  en_livraison:   { label: 'En livraison',  color: '#32ADE6', bg: 'rgba(50,173,230,0.1)', step: 4 },
  livree:         { label: 'Livrée',        color: '#30D158', bg: 'rgba(48,209,88,0.1)',  step: 5 },
  annulee:        { label: 'Annulée',       color: '#FF453A', bg: 'rgba(255,69,58,0.1)',  step: 0 },
};

export default function ClientOrdersPage() {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annulant, setAnnulant] = useState(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    publicCommandesApi.getMesCommandes()
      .then(res => setCommandes(Array.isArray(res.data || res) ? (res.data || res) : []))
      .catch(() => error('Erreur de chargement des commandes'))
      .finally(() => setLoading(false));
  }, []);

  const handleAnnuler = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setAnnulant(id);
    try {
      await clientApi.annulerCommande(id, { raison: 'Annulée par le client' });
      success('Commande annulée avec succès.');
      setCommandes(prev => prev.map(c =>
        (c.id_commande || c.idCommande) === id
          ? { ...c, statut_commande: 'annulee', statutCommande: 'annulee' }
          : c
      ));
    } catch (err) {
      error(err.message || 'Impossible d\'annuler cette commande.');
    } finally {
      setAnnulant(null);
    }
  };

  const filteredCommandes = commandes.filter(cmd => {
    const num = (cmd.numero_commande || cmd.numeroCommande || '').toLowerCase();
    const matchesSearch = num.includes(searchTerm.toLowerCase());
    const statut = cmd.statut_commande || cmd.statutCommande || cmd.statut || 'en_attente';
    const matchesStatus = statusFilter === 'all' || statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div style={{ padding: 120, textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto', borderColor: '#0071E3', borderTopColor: 'transparent' }} />
    </div>
  );

  if (commandes.length === 0) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'var(--font-sf)' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#D5D5D7', marginBottom: 24, display: 'block' }}>receipt_long</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', marginBottom: 12 }}>Aucune commande</h2>
      <p style={{ color: '#6E6E73', marginBottom: 32 }}>Vous n'avez pas encore passé de commande.</p>
      <Link to="/catalogue" style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 24px', background: '#0071E3', color: '#fff', borderRadius: 9999, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
        Découvrir nos produits
      </Link>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-sf)', paddingBottom: 80 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: window.innerWidth < 768 ? 24 : 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 24 }}>Historique d'achats</h2>
        
        {/* Barre de recherche et filtres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: window.innerWidth < 768 ? '100%' : 440 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', fontSize: 20 }}>search</span>
            <input 
              type="text"
              placeholder="Rechercher une commande (ex: CMD-2026...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', height: 44, padding: '0 16px 0 44px',
                background: '#F5F5F7', border: 'none', borderRadius: 12,
                fontSize: 15, fontFamily: 'inherit', outline: 'none',
                transition: 'background 200ms'
              }}
              onFocus={e => e.target.style.background = '#EDEDF2'}
              onBlur={e => e.target.style.background = '#F5F5F7'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            <button 
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '8px 16px', borderRadius: 9999, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: statusFilter === 'all' ? '#0071E3' : '#F5F5F7',
                color: statusFilter === 'all' ? '#fff' : '#6E6E73',
                transition: 'all 200ms', whiteSpace: 'nowrap'
              }}
            >
              Toutes
            </button>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <button 
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '8px 16px', borderRadius: 9999, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: statusFilter === key ? cfg.color : '#F5F5F7',
                  color: statusFilter === key ? '#fff' : '#6E6E73',
                  transition: 'all 200ms', whiteSpace: 'nowrap'
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredCommandes.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', background: '#F5F5F7', borderRadius: 24 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D5D5D7', marginBottom: 16, display: 'block' }}>search_off</span>
          <p style={{ color: '#6E6E73', fontSize: 16, fontWeight: 500 }}>Aucune commande ne correspond à votre recherche.</p>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              style={{ marginTop: 16, background: 'none', border: 'none', color: '#0071E3', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredCommandes.map(cmd => {
          const statut = cmd.statut_commande || cmd.statutCommande || cmd.statut || 'en_attente';
          const cfg = STATUS_CFG[statut] || STATUS_CFG.en_attente;
          const id = cmd.id_commande || cmd.idCommande;
          const num = cmd.numero_commande || cmd.numeroCommande || `#${id}`;
          const dateStr = new Date(cmd.date_commande || cmd.dateCommande || Date.now())
            .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          return (
            <div key={id} className="order-card" style={{ marginBottom: 12 }}>
              {/* En-tête commande */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    #{num.split('-').pop()} • {num}
                  </div>
                  <div style={{ fontSize: 14, color: '#1D1D1F', fontWeight: 700 }}>{dateStr}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                    {cfg.label}
                  </span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                    {Number(cmd.montant_total || cmd.montantTotal || cmd.total || 0).toFixed(2)} €
                  </div>
                </div>
              </div>

              {/* Barre de progression (sauf annulée) */}
              {statut !== 'annulee' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} style={{ flex: 1, height: 3, borderRadius: 9999, background: step <= cfg.step ? cfg.color : '#D5D5D7', transition: 'background 400ms' }} />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ marginTop: statut !== 'annulee' ? 0 : 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {/* Voir détails */}
                <Link
                  to={`/order-confirmation/${id}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', background: '#fff', border: '1px solid #D5D5D7', color: '#1D1D1F', borderRadius: 9999, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 200ms' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span>
                  Voir les détails
                </Link>

                {/* Bouton Annuler (seulement si en_attente) */}
                {statut === 'en_attente' && (
                  <button
                    onClick={() => handleAnnuler(id)}
                    disabled={annulant === id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      height: 36, padding: '0 16px',
                      background: 'rgba(255,69,58,0.08)',
                      border: '1px solid rgba(255,69,58,0.2)',
                      color: '#FF453A', borderRadius: 9999,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 200ms',
                      opacity: annulant === id ? 0.6 : 1
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,69,58,0.08)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>
                    {annulant === id ? 'Annulation...' : 'Annuler la commande'}
                  </button>
                )}

                {/* Bouton Recommander (seulement si livrée) */}
                {statut === 'livree' && (
                  <button
                    onClick={() => navigate('/catalogue')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      height: 36, padding: '0 16px',
                      background: 'rgba(0,113,227,0.08)',
                      border: '1px solid rgba(0,113,227,0.2)',
                      color: '#0071E3', borderRadius: 9999,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 200ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,113,227,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,113,227,0.08)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                    Recommander
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}

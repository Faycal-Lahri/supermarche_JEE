import { useState, useEffect, useRef } from 'react';
import { adminStockApi, getImageUrl } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Dropdown, Pagination, SearchInput, FilterBar } from '../../components/AdminFilterBar';

const PER_PAGE = 8;

// ── Modal Ajustement Stock ──────────────────────────────────────────────────
function StockAdjustModal({ produit, stockActuel, onClose, onConfirm, saving }) {
  const [type, setType]       = useState('entree');   // 'entree' | 'sortie'
  const [quantite, setQuantite] = useState('');
  const [motif, setMotif]     = useState('');
  const [step, setStep]       = useState(1);          // 1=saisie, 2=confirmation
  const inputRef              = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const qte    = parseInt(quantite, 10) || 0;
  const delta  = type === 'entree' ? qte : -qte;
  const newQty = stockActuel + delta;
  const valid  = qte > 0 && newQty >= 0;

  const nom    = produit.nom_produit || produit.nomProduit || 'Produit';
  const image  = produit.image_produit || produit.imageProduit ? getImageUrl(produit.image_produit || produit.imageProduit) : null;

  const handleSubmit = () => {
    if (!valid) return;
    if (step === 1) { setStep(2); return; }
    onConfirm(delta);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 28, padding: '40px', width: '100%', maxWidth: 480, boxShadow: '0 40px 80px rgba(0,0,0,0.2)', animation: 'slideUp 200ms ease' }}>

        {/* En-tête produit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F5F5F7', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {image
              ? <img src={image} alt={nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#8E8E93' }}>inventory_2</span>
            }
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Ajustement de stock</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1D1D1F', lineHeight: 1.2 }}>{nom}</div>
            <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 2 }}>
              Stock actuel : <span style={{ fontWeight: 700, color: '#1D1D1F' }}>{stockActuel} unités</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* Sélection Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { val: 'entree', label: 'Entrée stock', icon: 'add_circle', color: '#30D158', bg: 'rgba(48,209,88,0.08)' },
                { val: 'sortie', label: 'Sortie stock',  icon: 'remove_circle', color: '#FF453A', bg: 'rgba(255,69,58,0.08)' },
              ].map(({ val, label, icon, color, bg }) => (
                <button key={val} onClick={() => setType(val)} style={{ padding: '14px 16px', borderRadius: 16, border: `2px solid ${type === val ? color : '#EDEDF2'}`, background: type === val ? bg : '#fff', cursor: 'pointer', transition: 'all 200ms', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: type === val ? color : '#8E8E93', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: type === val ? color : '#6E6E73' }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Quantité */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6E6E73', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quantité à {type === 'entree' ? 'ajouter' : 'retirer'}
              </label>
              <input
                ref={inputRef}
                type="number"
                min="1"
                max={type === 'sortie' ? stockActuel : undefined}
                value={quantite}
                onChange={e => setQuantite(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && valid && handleSubmit()}
                placeholder="Ex. : 50"
                className="stock-qty-input"
                style={{ borderColor: quantite && !valid ? '#FF453A' : '#EDEDF2' }}
              />
              {type === 'sortie' && qte > stockActuel && (
                <p style={{ fontSize: 12, color: '#FF453A', marginTop: 6, fontWeight: 600 }}>⚠️ Quantité supérieure au stock disponible ({stockActuel})</p>
              )}
            </div>

            {/* Motif (optionnel) */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6E6E73', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motif <span style={{ fontWeight: 400 }}>(optionnel)</span></label>
              <input
                type="text"
                value={motif}
                onChange={e => setMotif(e.target.value)}
                placeholder="Ex. : Réapprovisionnement fournisseur, casse..."
                style={{ width: '100%', height: 44, borderRadius: 12, border: '2px solid #EDEDF2', padding: '0 14px', fontSize: 14, color: '#1D1D1F', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Aperçu résultat */}
            {valid && (
              <div style={{ background: type === 'entree' ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#6E6E73', fontWeight: 600 }}>Nouveau stock :</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: type === 'entree' ? '#30D158' : '#FF453A' }}>{newQty} unités</span>
              </div>
            )}
          </>
        ) : (
          /* ── Étape 2 : Confirmation ── */
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: type === 'entree' ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: type === 'entree' ? '#30D158' : '#FF453A', fontVariationSettings: "'FILL' 1" }}>
                {type === 'entree' ? 'add_circle' : 'remove_circle'}
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1D1D1F', marginBottom: 10 }}>
              Confirmer l'ajustement
            </h3>
            <p style={{ fontSize: 15, color: '#6E6E73', lineHeight: 1.6, marginBottom: 24 }}>
              Vous êtes sur le point de {type === 'entree' ? 'ajouter' : 'retirer'}
              <br />
              <strong style={{ color: '#1D1D1F', fontSize: 18 }}>{qte} unités</strong>
              {type === 'entree' ? ' au' : ' du'} stock de <strong style={{ color: '#1D1D1F' }}>{nom}</strong>.
              <br />
              <span style={{ fontSize: 14 }}>Stock : <strong>{stockActuel}</strong> → <strong style={{ color: type === 'entree' ? '#30D158' : '#FF453A' }}>{newQty}</strong> unités</span>
              {motif && <><br /><span style={{ fontSize: 13, color: '#8E8E93', fontStyle: 'italic' }}>Motif : {motif}</span></>}
            </p>
            <button onClick={() => setStep(1)} style={{ height: 40, padding: '0 20px', borderRadius: 9999, background: '#F5F5F7', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#6E6E73', marginRight: 8 }}>
              ← Modifier
            </button>
          </div>
        )}

        {/* Boutons actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={{ height: 48, padding: '0 24px', borderRadius: 9999, background: '#F5F5F7', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={!valid || saving} style={{ height: 48, padding: '0 28px', borderRadius: 9999, background: !valid ? '#EDEDF2' : (step === 2 ? '#1D1D1F' : (type === 'entree' ? '#30D158' : '#FF453A')), border: 'none', cursor: !valid ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, color: !valid ? '#8E8E93' : '#fff', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 200ms' }}>
            {saving && <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>autorenew</span>}
            {step === 1 ? 'Continuer →' : (saving ? 'Enregistrement...' : '✓ Confirmer')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export default function AdminStockPage() {
  const { success, error } = useToast();
  const [stock, setStock]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [sortField, setSortField]   = useState('stock_asc');
  const [page, setPage]             = useState(1);
  const [modalProduit, setModalProduit] = useState(null);
  const [saving, setSaving]         = useState(false);
  
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    adminStockApi.getEtatStock()
      .then(res => setStock(Array.isArray(res.data || res) ? (res.data || res) : []))
      .catch(() => error('Erreur de chargement du stock'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchStock(); }, []);
  useEffect(() => {
    const t = setInterval(fetchStock, 60000);
    return () => clearInterval(t);
  }, []);

  const openHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await adminStockApi.getHistorique();
      setHistory(Array.isArray(res.data||res) ? (res.data||res) : []);
    } catch (err) {
      error('Erreur chargement historique');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Remettre à la page 1 quand un filtre change
  useEffect(() => { setPage(1); }, [search, filterStatut, sortField]);

  // ── Confirmer l'ajustement depuis le modal ──────────────────────────────
  const handleConfirmAdjust = async (delta) => {
    const s      = modalProduit;
    const idProd = s.id_produit || s.idProduit;
    const curQty = s.quantite_disponible ?? s.quantiteDisponible ?? 0;

    setSaving(true);
    try {
      await adminStockApi.updateStock(idProd, delta);
      const newQty = curQty + delta;
      setStock(prev => prev.map(p => {
        const pid = p.id_produit || p.idProduit;
        return pid === idProd
          ? { ...p, quantite_disponible: newQty, quantiteDisponible: newQty }
          : p;
      }));
      success(`Stock mis à jour : ${curQty} → ${newQty} unités`);
      setModalProduit(null);
    } catch (err) {
      error(err.message || 'Erreur mise à jour du stock');
    } finally {
      setSaving(false);
    }
  };

  const filtered = stock
    .filter(s => (s.nom_produit || s.nomProduit || '').toLowerCase().includes(search.toLowerCase()))
    .filter(s => {
      if (!filterStatut) return true;
      const q     = s.quantite_disponible ?? s.quantiteDisponible ?? 0;
      const seuil = s.seuil_alerte ?? s.seuilAlerte ?? 10;
      const etat  = q === 0 ? 'rupture' : q <= seuil ? 'alerte' : 'disponible';
      return etat === filterStatut;
    })
    .sort((a, b) => {
      const nA = a.nom_produit || a.nomProduit || '';
      const nB = b.nom_produit || b.nomProduit || '';
      if (sortField === 'nom')        return nA.localeCompare(nB);
      const qa = a.quantite_disponible ?? a.quantiteDisponible ?? 0;
      const qb = b.quantite_disponible ?? b.quantiteDisponible ?? 0;
      if (sortField === 'stock_asc')  return qa - qb;
      if (sortField === 'stock_desc') return qb - qa;
      return 0;
    });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Compteurs par état
  const ruptures   = stock.filter(s => (s.quantite_disponible ?? s.quantiteDisponible ?? 0) === 0).length;
  const alertes    = stock.filter(s => { const q = s.quantite_disponible ?? s.quantiteDisponible ?? 0; const sl = s.seuil_alerte ?? s.seuilAlerte ?? 10; return q > 0 && q <= sl; }).length;
  const disponible = stock.length - ruptures - alertes;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Gestion du Stock</h1>
            <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>Entrées, sorties et alertes ({stock.length} produits)</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={openHistory} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: '#fff', color: '#1D1D1F', border: '1px solid #EDEDF2', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'background 200ms' }} onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>history</span> Historique
            </button>
            <button onClick={fetchStock} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: '#fff', color: '#1D1D1F', border: '1px solid #EDEDF2', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span> Rafraîchir
            </button>
          </div>
        </header>

        {/* KPI mini */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'En stock', value: disponible, color: '#30D158', bg: 'rgba(48,209,88,0.08)', icon: 'check_circle' },
            { label: 'Stock faible', value: alertes, color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)', icon: 'warning' },
            { label: 'Rupture', value: ruptures, color: '#FF453A', bg: 'rgba(255,69,58,0.08)', icon: 'cancel' },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} style={{ background: bg, borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 26, color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <FilterBar resultCount={filtered.length} totalCount={stock.length} label="produits">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un produit..." />
          <Dropdown value={filterStatut} onChange={setFilterStatut}
            options={[{ value: 'disponible', label: 'En stock' }, { value: 'alerte', label: 'Stock faible' }, { value: 'rupture', label: 'Rupture' }]}
            placeholder="État du stock" icon="inventory" />
          <Dropdown value={sortField} onChange={setSortField}
            options={[{ value: 'stock_asc', label: 'Quantité ↑' }, { value: 'stock_desc', label: 'Quantité ↓' }, { value: 'nom', label: 'Nom A→Z' }]}
            placeholder="Trier par" icon="sort" />
          {(search || filterStatut || sortField !== 'stock_asc') && (
            <button onClick={() => { setSearch(''); setFilterStatut(''); setSortField('stock_asc'); }} style={{ background: 'transparent', border: 'none', color: '#FF453A', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span> Effacer
            </button>
          )}
        </FilterBar>

        {/* Tableau */}
        <div className="apple-card" style={{ padding: '0 0 24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EDEDF2' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produit</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>État</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Stock actuel</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Seuil alerte</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(PER_PAGE)].map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: '16px 24px' }}><div style={{ height: 20, background: '#F5F5F7', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', color: '#6E6E73', fontSize: 15 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#EDEDF2' }}>inventory_2</span>
                    Aucun produit trouvé
                  </div>
                </td></tr>
              ) : paginated.map((s) => {
                const idProd  = s.id_produit || s.idProduit;
                const stockVal = s.quantite_disponible ?? s.quantiteDisponible ?? 0;
                const seuil   = s.seuil_alerte ?? s.seuilAlerte ?? 10;
                const nom     = s.nom_produit || s.nomProduit || '—';
                const cat     = s.nom_categorie || s.nomCategorie || '—';
                const img     = s.image_produit || s.imageProduit ? getImageUrl(s.image_produit || s.imageProduit) : null;
                const etat    = stockVal === 0 ? 'rupture' : stockVal <= seuil ? 'alerte' : 'disponible';
                const ETAT_CFG = {
                  disponible: { label: 'En stock',    color: '#30D158', bg: 'rgba(48,209,88,0.1)' },
                  alerte:     { label: 'Stock faible', color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)' },
                  rupture:    { label: 'Rupture',     color: '#FF453A', bg: 'rgba(255,69,58,0.1)' },
                };
                const cfg = ETAT_CFG[etat];

                return (
                  <tr key={idProd} style={{ borderBottom: '1px solid #EDEDF2', transition: 'background 200ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5F5F7', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {img
                            ? <img src={img} alt={nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#8E8E93' }}>inventory_2</span>
                          }
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{nom}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#6E6E73' }}>{cat}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: etat === 'rupture' ? '#FF453A' : etat === 'alerte' ? '#FF9F0A' : '#1D1D1F' }}>{stockVal}</span>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: 14, color: '#6E6E73', fontWeight: 600 }}>{seuil}</td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => setModalProduit(s)}
                        style={{ height: 38, padding: '0 18px', borderRadius: 9999, background: '#1D1D1F', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 200ms' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0A84FF'}
                        onMouseLeave={e => e.currentTarget.style.background = '#1D1D1F'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
                        Ajuster
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* Modal */}
      {modalProduit && (
        <StockAdjustModal
          produit={modalProduit}
          stockActuel={modalProduit.quantite_disponible ?? modalProduit.quantiteDisponible ?? 0}
          onClose={() => !saving && setModalProduit(null)}
          onConfirm={handleConfirmAdjust}
          saving={saving}
        />
      )}

      {/* Historique Modal */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '32px 40px', width: '100%', maxWidth: 800, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', animation: 'slideUp 200ms ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(10,132,255,0.1)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>history</span>
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1D1D1F' }}>Historique du Stock</h2>
                  <div style={{ fontSize: 13, color: '#6E6E73' }}>Traçabilité complète des mouvements récents.</div>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: '#F5F5F7', border: 'none', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E73' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', borderRadius: 16, border: '1px solid #EDEDF2' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#F5F5F7', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase' }}>Produit</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', textAlign: 'center' }}>Quantité</th>
                    <th style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', textAlign: 'center' }}>Avant → Après</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingHistory ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center' }}><div style={{ display: 'inline-block', width: 30, height: 30, border: '3px solid #0A84FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#6E6E73', fontSize: 14 }}>Aucun historique disponible.</td></tr>
                  ) : history.map((h, i) => {
                    const isEntree = h.typeMouvement === 'entree';
                    const motif = h.idCommande ? `Commande #${h.idCommande}` : (h.idAdmin ? `Ajustement manuel` : 'Système');
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #EDEDF2' }}>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#6E6E73' }}>{new Date(h.dateMouvement).toLocaleString()}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>{h.nomProduit}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isEntree ? '#30D158' : '#FF453A', background: isEntree ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', padding: '4px 10px', borderRadius: 9999 }}>
                              {isEntree ? 'Entrée' : 'Sortie'}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93' }}>{motif}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 15, fontWeight: 800, color: isEntree ? '#30D158' : '#FF453A' }}>
                          {isEntree ? '+' : '-'}{Math.abs(h.quantite)}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, color: '#8E8E93', fontWeight: 600 }}>
                          {h.quantiteAvant} <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', margin: '0 4px' }}>arrow_forward</span> <span style={{ color: '#1D1D1F' }}>{h.quantiteApres}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

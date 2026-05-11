import { useState, useEffect, useCallback, Fragment } from 'react';
import { adminCommandesApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Dropdown, Pagination, SearchInput, FilterBar, AdminPage } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';

const PER_PAGE = 8;
const F = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' };

const STATUS_CFG = {
  en_attente:     { label: 'En attente', color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)', icon: 'schedule' },
  confirmee:      { label: 'Confirmée', color: '#0A84FF', bg: 'rgba(10,132,255,0.12)', icon: 'thumb_up' },
  en_preparation: { label: 'En préparation', color: '#BF5AF2', bg: 'rgba(191,90,242,0.12)', icon: 'inventory_2' },
  en_livraison:   { label: 'En livraison', color: '#32ADE6', bg: 'rgba(50,173,230,0.12)', icon: 'local_shipping' },
  livree:         { label: 'Livrée', color: '#30D158', bg: 'rgba(48,209,88,0.12)', icon: 'check_circle' },
  annulee:        { label: 'Annulée', color: '#FF453A', bg: 'rgba(255,69,58,0.12)', icon: 'cancel' },
};

function DateFilter({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, fontSize: 18, color: '#6E6E73', pointerEvents: 'none' }}>calendar_today</span>
      <input type="date" value={value} onChange={e => onChange(e.target.value)} title={placeholder}
        className="apple-input"
        style={{ paddingLeft: 36, width: 160, fontSize: 14, height: 38 }}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  const { success, error } = useToast();
  const { confirm: cfm, ConfirmDialog } = useConfirm();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [sortField, setSortField] = useState('date_desc');
  const [page, setPage] = useState(1);
  
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);

  const fetchAll = useCallback((silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    adminCommandesApi.getAll({ ...(filterStatut && { statut: filterStatut }), ...(dateDebut && { dateDebut }), ...(dateFin && { dateFin }) })
      .then(r => setCommandes(Array.isArray(r.data || r) ? (r.data || r) : []))
      .catch(() => error('Erreur chargement'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [filterStatut, dateDebut, dateFin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const t = setInterval(() => fetchAll(true), 30000); return () => clearInterval(t); }, [fetchAll]);
  // Remettre à la page 1 à chaque changement de filtre
  useEffect(() => { setPage(1); }, [search, filterStatut, dateDebut, dateFin, sortField]);

  const handleStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await adminCommandesApi.updateStatut(id, statut);
      success(`Statut mis à jour : ${STATUS_CFG[statut]?.label}`);
      fetchAll(true);
    } catch (err) {
      error(err.message || 'Erreur mise à jour statut');
    } finally {
      setUpdating(null);
    }
  };

  const handleAnnuler = async (cmd) => {
    const ok = await cfm({
      title: 'Annuler la commande',
      message: `Voulez-vous vraiment annuler la commande #${cmd.id_commande || cmd.numero_commande} ? Le stock sera automatiquement restitué.`,
      confirmLabel: 'Oui, annuler',
      cancelLabel: 'Retour',
      variant: 'danger'
    });
    if (!ok) return;
    setUpdating(cmd.id_commande);
    try {
      await adminCommandesApi.annulerCommande(cmd.id_commande);
      success('Commande annulée et stock restitué');
      fetchAll(true);
    } catch (err) {
      error(err.message || "Impossible d'annuler");
    } finally {
      setUpdating(null);
    }
  };

  const toggleDetail = async (cmd) => {
    const id = cmd.id_commande;
    if (!id) { error('ID commande invalide'); return; }
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!details[id]) {
      setLoadingDetail(id);
      try {
        const res = await adminCommandesApi.getById(id);
        const detail = res.data || res;
        setDetails(prev => ({ ...prev, [id]: detail }));
      } catch (err) {
        error('Détails indisponibles');
        setExpanded(null);
      } finally {
        setLoadingDetail(null);
      }
    }
  };

  const filtered = commandes
    .filter(c => {
      const q      = search.trim().toLowerCase();
      if (!q) return true;
      // Support camelCase (Gson default) AND snake_case (après fix JsonUtil)
      const nom    = c.nom_client    || c.nomClient    || '';
      const prenom = c.prenom_client || c.prenomClient || '';
      const email  = c.email_client  || c.emailClient  || '';
      const num    = c.numero_commande || c.numeroCommande || '';
      const idStr  = String(c.id_commande || c.idCommande || '');
      const full   = `${prenom} ${nom}`.toLowerCase();
      return full.includes(q) || email.toLowerCase().includes(q)
          || num.toLowerCase().includes(q) || idStr.includes(q);
    })
    .filter(c => {
      if (!filterStatut) return true;
      const s = c.statut_commande || c.statutCommande || c.statut || '';
      return s === filterStatut;
    })
    .sort((a, b) => {
      const da = a.date_commande || a.dateCommande;
      const db = b.date_commande || b.dateCommande;
      const ta = a.montant_total || a.montantTotal || a.total || 0;
      const tb = b.montant_total || b.montantTotal || b.total || 0;
      if (sortField === 'date_asc')   return new Date(da || 0) - new Date(db || 0);
      if (sortField === 'date_desc')  return new Date(db || 0) - new Date(da || 0);
      if (sortField === 'total_asc')  return ta - tb;
      if (sortField === 'total_desc') return tb - ta;
      return 0;
    });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Gestion des Commandes</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>
              {commandes.length} commandes au total
              {refreshing && <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>refresh</span>}
            </div>
          </div>
        </header>

        <FilterBar resultCount={filtered.length} totalCount={commandes.length} label="commandes">
          <SearchInput value={search} onChange={setSearch} placeholder="N° Cmd ou Client..." />
          <Dropdown
            value={filterStatut}
            onChange={setFilterStatut}
            options={[
              // Seulement les statuts qui existent dans les données réelles
              ...Object.entries(STATUS_CFG)
                .filter(([k]) => commandes.some(c => (c.statut_commande||c.statutCommande||c.statut) === k))
                .map(([k, v]) => ({ value: k, label: v.label }))
            ]}
            placeholder="Statut"
            icon="local_shipping"
          />
          <Dropdown value={sortField} onChange={setSortField} options={[
            { value: 'date_desc', label: 'Plus récentes' },
            { value: 'date_asc', label: 'Plus anciennes' },
            { value: 'total_desc', label: 'Montant ↓' },
            { value: 'total_asc', label: 'Montant ↑' }
          ]} placeholder="Trier par" icon="sort" />
          <DateFilter value={dateDebut} onChange={setDateDebut} placeholder="Du" />
          <DateFilter value={dateFin} onChange={setDateFin} placeholder="Au" />
          {(search || filterStatut || dateDebut || dateFin) && (
            <button onClick={() => { setSearch(''); setFilterStatut(''); setDateDebut(''); setDateFin(''); setSortField('date_desc'); }} style={{ background: 'transparent', border: 'none', color: '#FF453A', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span> Effacer
            </button>
          )}
        </FilterBar>

        <div className="apple-card" style={{ padding: '0 0 24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EDEDF2' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Référence</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(PER_PAGE)].map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: '16px 24px' }}><div style={{ height: 20, background: '#F5F5F7', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', color: '#6E6E73', fontSize: 15 }}>Aucune commande trouvée</td></tr>
              ) : paginated.map((cmd) => {
                const idCmd    = cmd.id_commande   || cmd.idCommande;
                const numCmd   = cmd.numero_commande || cmd.numeroCommande;
                const statut   = cmd.statut_commande || cmd.statutCommande || cmd.statut || 'en_attente';
                const montant  = cmd.montant_total  || cmd.montantTotal  || cmd.total  || 0;
                const dateCmde = cmd.date_commande  || cmd.dateCommande;
                // Nom client : camelCase en priorité si snake_case est vide
                const cNom    = cmd.nom_client    || cmd.nomClient    || '';
                const cPrenom = cmd.prenom_client || cmd.prenomClient || '';
                const cId     = cmd.id_client     || cmd.idClient     || '';
                const nomClient = cNom
                  ? `${cPrenom} ${cNom}`.trim()
                  : `Client #${cId}`;
                const isExp    = expanded === idCmd;
                const cfg      = STATUS_CFG[statut] || STATUS_CFG.en_attente;
                const isUpdating = updating === idCmd;
                
                return (
                  <Fragment key={idCmd}>
                    <tr style={{ borderBottom: isExp ? 'none' : '1px solid #EDEDF2', background: isExp ? '#FAFAFC' : 'transparent', transition: 'background 200ms' }}
                      onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = '#F5F5F7' }}
                      onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'transparent' }}>

                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>#{numCmd || idCmd}</td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#1D1D1F' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8E8E93' }}>person</span>
                          {nomClient}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#6E6E73' }}>
                        {dateCmde ? new Date(dateCmde).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>
                        {Number(montant).toFixed(2)} €
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button onClick={() => toggleDetail({ ...cmd, id_commande: idCmd })} style={{ width: 32, height: 32, borderRadius: '50%', background: isExp ? '#0071E3' : '#F5F5F7', color: isExp ? '#fff' : '#1D1D1F', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>expand_more</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* EXPANDED DETAILS */}
                    {isExp && (
                      <tr style={{ borderBottom: '1px solid #EDEDF2', background: '#FAFAFC' }}>
                        <td colSpan={6} style={{ padding: '0 24px 24px' }}>
                          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #EDEDF2' }}>
                            {loadingDetail === idCmd ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6E6E73', fontSize: 14 }}>
                                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
                                Chargement des détails...
                              </div>
                            ) : details[idCmd] ? (() => {
                                const det = details[idCmd];
                                const lignes = det.lignes || det.lignesCommande || det.lignes_commande || [];
                                const codePromo   = det.code_promo_utilise || det.codePromoUtilise;
                                const remise      = parseFloat(det.montant_remise || det.montantRemise || 0);
                                const sousTotal   = lignes.reduce((acc, l) => acc + parseFloat(l.sous_total || l.sousTotal || 0), 0);
                                const totalPaye   = parseFloat(det.montant_total || det.montantTotal || montant || 0);
                                const estPaye     = det.est_paye ?? det.estPaye ?? false;
                                // mode_paiement brut depuis la BDD
                                const modePaieRaw = det.mode_paiement || det.modePaiement || '';
                                const adresse     = det.adresse_livraison || det.adresseLivraison || '';
                                const ville       = det.ville_livraison   || det.villeLivraison   || '';
                                const cp          = det.code_postal_livraison || det.codePostalLivraison || '';
                                const raisonAnn   = det.raison_annulation  || det.raisonAnnulation || '';

                                // Mapping complet de tous les valeurs possibles en BDD
                                const MODE_LABELS = {
                                  carte:            'Carte bancaire',
                                  carte_bancaire:   'Carte bancaire',
                                  cb:               'Carte bancaire',
                                  a_la_livraison:   'Paiement à la livraison',
                                  livraison:        'Paiement à la livraison',
                                  virement:         'Virement bancaire',
                                  paypal:           'PayPal',
                                  especes:          'Espèces',
                                };
                                const modePaieLabel = MODE_LABELS[modePaieRaw] || (modePaieRaw ? modePaieRaw.replace(/_/g, ' ') : null);
                                // Cacher "paiement à la livraison" si c'est juste le mode par défaut non confirmé
                                const showMode = modePaieLabel && modePaieRaw !== 'a_la_livraison' || estPaye;

                                return (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 260px', gap: 24 }}>

                                    {/* Colonne 1 : Produits + Récap financier */}
                                    <div>
                                      <h4 style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Articles commandés</h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                        {lignes.length === 0 ? (
                                          <div style={{ padding: 16, background: '#F5F5F7', borderRadius: 12, fontSize: 13, color: '#8E8E93', textAlign: 'center' }}>Aucun article</div>
                                        ) : lignes.map((l, i) => {
                                          const prixU = parseFloat(l.prix_unitaire_snapshot || l.prixUnitaireSnapshot || l.prix_unitaire || l.prixUnitaire || 0);
                                          const st    = parseFloat(l.sous_total || l.sousTotal || (prixU * l.quantite));
                                          const nomP  = l.nom_produit_snapshot || l.nomProduitSnapshot || `Produit #${l.id_produit || l.idProduit}`;
                                          return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F5F5F7', borderRadius: 12 }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EDEDF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8E8E93' }}>inventory_2</span>
                                                </div>
                                                <div>
                                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>{nomP}</div>
                                                  <div style={{ fontSize: 12, color: '#6E6E73' }}>{l.quantite} × {prixU.toFixed(2)} €</div>
                                                </div>
                                              </div>
                                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', whiteSpace: 'nowrap' }}>{st.toFixed(2)} €</div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Récap financier */}
                                      <div style={{ background: '#F5F5F7', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6E6E73' }}>
                                          <span>Sous-total</span>
                                          <span style={{ fontWeight: 600, color: '#1D1D1F' }}>{sousTotal.toFixed(2)} €</span>
                                        </div>
                                        {codePromo && (
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#30D158' }}>
                                              <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                                              Code promo : <strong>{codePromo}</strong>
                                            </span>
                                            <span style={{ fontWeight: 700, color: '#30D158' }}>−{remise.toFixed(2)} €</span>
                                          </div>
                                        )}
                                        {!codePromo && remise > 0 && (
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span style={{ color: '#30D158', display: 'flex', alignItems: 'center', gap: 6 }}>
                                              <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                                              Remise appliquée
                                            </span>
                                            <span style={{ fontWeight: 700, color: '#30D158' }}>−{remise.toFixed(2)} €</span>
                                          </div>
                                        )}
                                        <div style={{ height: 1, background: '#EDEDF2' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>Total</span>
                                          <span style={{ fontSize: 20, fontWeight: 900, color: '#1D1D1F' }}>{totalPaye.toFixed(2)} €</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: 12, color: '#6E6E73' }}>Paiement</span>
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#FF9F0A', background: 'rgba(255,159,10,0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                                            À la livraison
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Colonne 2 : Livraison + Client */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                      {/* Adresse livraison */}
                                      <div>
                                        <h4 style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Livraison</h4>
                                        <div style={{ background: '#F5F5F7', borderRadius: 14, padding: '14px 16px' }}>
                                          {adresse || ville ? (
                                            <>
                                              {adresse && <div style={{ fontSize: 13, color: '#1D1D1F', fontWeight: 600, marginBottom: 2 }}>{adresse}</div>}
                                              {(cp || ville) && <div style={{ fontSize: 13, color: '#6E6E73' }}>{cp} {ville}</div>}
                                            </>
                                          ) : (
                                            <div style={{ fontSize: 13, color: '#8E8E93', fontStyle: 'italic' }}>Adresse non renseignée</div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Info client */}
                                      <div>
                                        <h4 style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Client</h4>
                                        <div style={{ background: '#F5F5F7', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                          {(det.nom_client || det.nomClient) && (
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>
                                              {det.prenom_client || det.prenomClient || ''} {det.nom_client || det.nomClient}
                                            </div>
                                          )}
                                          {(det.email_client || det.emailClient) && (
                                            <div style={{ fontSize: 12, color: '#6E6E73', display: 'flex', alignItems: 'center', gap: 5 }}>
                                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>
                                              {det.email_client || det.emailClient}
                                            </div>
                                          )}
                                          {raisonAnn && statut === 'annulee' && (
                                            <div style={{ marginTop: 6, padding: '8px 10px', background: 'rgba(255,69,58,0.08)', borderRadius: 8, fontSize: 12, color: '#FF453A', fontWeight: 600 }}>
                                              Motif annulation : {raisonAnn}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Colonne 3 : Changer statut */}
                                    <div>
                                      <h4 style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Changer le statut</h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {statut !== 'livree' && statut !== 'annulee' ? (
                                          <>
                                            {statut === 'en_attente' && (
                                              <button disabled={isUpdating} onClick={() => handleStatut(idCmd, 'confirmee')} style={{ background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: 'none', borderRadius: 10, height: 42, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>thumb_up</span> Confirmer la commande
                                              </button>
                                            )}
                                            {statut === 'confirmee' && (
                                              <button disabled={isUpdating} onClick={() => handleStatut(idCmd, 'en_preparation')} style={{ background: 'rgba(191,90,242,0.1)', color: '#BF5AF2', border: 'none', borderRadius: 10, height: 42, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>inventory_2</span> Mettre en préparation
                                              </button>
                                            )}
                                            {statut === 'en_preparation' && (
                                              <button disabled={isUpdating} onClick={() => handleStatut(idCmd, 'en_livraison')} style={{ background: 'rgba(50,173,230,0.1)', color: '#32ADE6', border: 'none', borderRadius: 10, height: 42, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>local_shipping</span> Expédier
                                              </button>
                                            )}
                                            {statut === 'en_livraison' && (
                                              <button disabled={isUpdating} onClick={() => handleStatut(idCmd, 'livree')} style={{ background: 'rgba(48,209,88,0.1)', color: '#30D158', border: 'none', borderRadius: 10, height: 42, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> Marquer comme livrée
                                              </button>
                                            )}
                                            <div style={{ height: 1, background: '#EDEDF2', margin: '4px 0' }} />
                                            <button disabled={isUpdating} onClick={() => handleAnnuler({ ...cmd, id_commande: idCmd })} style={{ background: 'rgba(255,69,58,0.08)', color: '#FF453A', border: 'none', borderRadius: 10, height: 42, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cancel</span> Annuler la commande
                                            </button>
                                          </>
                                        ) : (
                                          <div style={{ padding: 16, background: '#F5F5F7', borderRadius: 12, fontSize: 13, color: '#6E6E73', textAlign: 'center' }}>
                                            Commande finalisée<br />
                                            <span style={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })() : (
                              <div style={{ padding: 16, color: '#8E8E93', fontSize: 13, textAlign: 'center' }}>Aucun détail disponible</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}

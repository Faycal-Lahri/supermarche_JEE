import { useState, useEffect } from 'react';
import { adminPromotionsApi, adminCodesPromoApi, adminProduitsApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Dropdown, Pagination, SearchInput, FilterBar } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';

const PER_PAGE = 8;

export default function AdminPromotionsPage() {
  const { success, error } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  
  const [items, setItems] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortField, setSortField] = useState('date_desc');
  const [page, setPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typePromo, setTypePromo] = useState('PRODUIT'); // PRODUIT ou CODE
  const [form, setForm] = useState({});

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      adminPromotionsApi.getAll(),
      adminCodesPromoApi.getAll(),
      adminProduitsApi.getAll()
    ]).then(([promos, codes, prods]) => {
      const p = Array.isArray(promos.data||promos) ? (promos.data||promos).map(x => ({ ...x, _type: 'PROMO' })) : [];
      const c = Array.isArray(codes.data||codes) ? (codes.data||codes).map(x => ({ ...x, _type: 'CODE' })) : [];
      setItems([...p, ...c]);
      setProduits(Array.isArray(prods.data||prods) ? (prods.data||prods) : []);
    }).catch(() => error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = (type) => {
    setTypePromo(type);
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];

    if (type === 'CODE') {
      setForm({ code:'', description:'', type_remise:'pourcentage', valeur:'', montant_min:0, usage_max:'', date_debut:today, date_fin:nextWeek, actif:true });
    } else {
      setForm({ nom_promotion:'', id_produit:'', pourcentage:'', date_debut:today, date_fin:nextWeek, actif:true });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (typePromo === 'CODE') {
        const payload = {
          code: form.code,
          description: form.description,
          type_remise: form.type_remise,
          valeur: parseFloat(form.valeur),
          montant_min: parseFloat(form.montant_min) || 0,
          usage_max: form.usage_max ? parseInt(form.usage_max) : null,
          date_debut: form.date_debut,
          date_fin: form.date_fin,
          actif: true
        };
        await adminCodesPromoApi.create(payload);
        success('Code promo créé avec succès');
      } else {
        const payload = {
          nom_promotion: form.nom_promotion,
          pourcentage: parseFloat(form.pourcentage),
          ids_produits: form.id_produit ? [parseInt(form.id_produit)] : [],
          date_debut: form.date_debut,
          date_fin: form.date_fin,
          actif: true
        };
        await adminPromotionsApi.create(payload);
        success('Promotion créée avec succès');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      error(err.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const isCode = item._type === 'CODE';
    const name = isCode ? item.code : item.nomPromotion;
    const ok = await confirm({
      title: 'Supprimer',
      message: `Voulez-vous vraiment supprimer "${name}" ?`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger'
    });
    if (!ok) return;
    try {
      if (isCode) await adminCodesPromoApi.delete(item.idCodePromo);
      else await adminPromotionsApi.delete(item.idPromotion);
      success('Supprimé avec succès');
      fetchData();
    } catch (err) {
      error(err.message || 'Erreur suppression');
    }
  };

  const filtered = items
    .filter(p => {
      if (filterType === 'PRODUIT') return p._type === 'PROMO';
      if (filterType === 'CODE') return p._type === 'CODE';
      return true;
    })
    .filter(p => {
      const q = search.toLowerCase();
      const n1 = p.code || '';
      const n2 = p.nomPromotion || '';
      const n3 = p.nomsProduits ? p.nomsProduits.join(' ') : '';
      return n1.toLowerCase().includes(q) || n2.toLowerCase().includes(q) || n3.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortField === 'date_desc') return new Date(b.dateDebut||0) - new Date(a.dateDebut||0);
      if (sortField === 'date_asc') return new Date(a.dateDebut||0) - new Date(b.dateDebut||0);
      const vA = a._type === 'CODE' ? a.valeur : a.pourcentage;
      const vB = b._type === 'CODE' ? b.valeur : b.pourcentage;
      if (sortField === 'pourcentage_desc') return (vB||0) - (vA||0);
      return 0;
    });

  useEffect(() => setPage(1), [search, filterType, sortField]);

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Promotions & Codes</h1>
            <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>Gérez vos offres catalogue et codes panier ({items.length} actives)</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => openAdd('PRODUIT')} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,132,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,132,255,0.1)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>sell</span> Promo Produit
            </button>
            <button onClick={() => openAdd('CODE')} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms', boxShadow: '0 4px 14px rgba(0,113,227,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#006EDB'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.transform = 'none'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>local_activity</span> Code Promo
            </button>
          </div>
        </header>

        <FilterBar resultCount={filtered.length} totalCount={items.length} label="offres">
          <SearchInput value={search} onChange={setSearch} placeholder="Chercher une offre..." />
          <Dropdown value={filterType} onChange={setFilterType} options={[{value:'ALL',label:'Tout afficher'},{value:'PRODUIT',label:'Promos Produits'},{value:'CODE',label:'Codes Panier'}]} placeholder="Type" icon="filter_alt" />
          <Dropdown value={sortField} onChange={setSortField} options={[ {value:'date_desc',label:'Plus récentes'}, {value:'date_asc',label:'Plus anciennes'}, {value:'pourcentage_desc',label:'Réduction ↓'} ]} placeholder="Trier par" icon="sort" />
        </FilterBar>

        <div className="apple-card" style={{ padding: '0 0 24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EDEDF2' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom / Cible</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Réduction</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validité</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(PER_PAGE)].map((_, i) => (
                <tr key={i}><td colSpan={5} style={{ padding: '16px 24px' }}><div style={{ height: 20, background: '#F5F5F7', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '60px 24px', textAlign: 'center', color: '#6E6E73', fontSize: 15 }}>Aucune offre trouvée</td></tr>
              ) : paginated.map((p) => {
                const isCode = p._type === 'CODE';
                const now = new Date();
                const dFin = new Date(p.dateFin);
                const isExpired = dFin < now;
                const isActif = p.actif !== false && !isExpired;

                return (
                  <tr key={isCode ? `c_${p.idCodePromo}` : `p_${p.idPromotion}`} style={{ borderBottom: '1px solid #EDEDF2', transition: 'background 200ms', opacity: isActif ? 1 : 0.6 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: isCode ? 'rgba(0,113,227,0.1)' : 'rgba(191,90,242,0.1)', color: isCode ? '#0071E3' : '#BF5AF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{isCode ? 'local_activity' : 'sell'}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>{isCode ? p.code : p.nomPromotion}</div>
                          <div style={{ fontSize: 12, color: '#8E8E93' }}>
                            {isCode 
                              ? (p.description || 'Code Panier') 
                              : `Sur : ${p.nomsProduits && p.nomsProduits.length > 0 ? p.nomsProduits.join(', ') : 'Catalogue complet'}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {isCode ? (
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#0071E3' }}>
                          -{p.valeur}{p.typeRemise === 'pourcentage' ? '%' : '€'}
                        </span>
                      ) : (
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#BF5AF2' }}>
                          -{Number(p.pourcentage)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 13, color: '#1D1D1F' }}>Du {new Date(p.dateDebut).toLocaleDateString()}</div>
                      <div style={{ fontSize: 13, color: '#6E6E73' }}>Au {new Date(p.dateFin).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {isExpired ? (
                        <span style={{ background: 'rgba(0,0,0,0.08)', color: '#6E6E73', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>Expirée</span>
                      ) : isActif ? (
                        <span style={{ background: 'rgba(48,209,88,0.1)', color: '#30D158', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>En cours</span>
                      ) : (
                        <span style={{ background: 'rgba(255,69,58,0.1)', color: '#FF453A', padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>Inactive</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(p)} style={{ width: 32, height: 32, borderRadius: 8, background: '#FAFAFC', border: '1px solid #EDEDF2', color: '#FF453A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FF453A10'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
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

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', animation: 'fadeIn 200ms' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.2)', animation: 'slideUp 300ms cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #EDEDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: typePromo === 'CODE' ? 'rgba(0,113,227,0.1)' : 'rgba(191,90,242,0.1)', color: typePromo === 'CODE' ? '#0071E3' : '#BF5AF2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{typePromo === 'CODE' ? 'local_activity' : 'sell'}</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F' }}>{typePromo === 'CODE' ? 'Nouveau Code Promo' : 'Nouvelle Promo Produit'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#F5F5F7', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E73' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px 32px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: 20 }}>
                {typePromo === 'CODE' ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Code (Ex: ETE2024)</label>
                      <input required value={form.code} onChange={e=>setForm({...form, code:e.target.value.toUpperCase()})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }} placeholder="SUMMER24" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Description</label>
                      <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="Réduction de bienvenue" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Type</label>
                        <select value={form.type_remise} onChange={e=>setForm({...form, type_remise:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }}>
                          <option value="pourcentage">Pourcentage (%)</option>
                          <option value="montant">Montant (€)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Valeur</label>
                        <input required type="number" step="0.1" value={form.valeur} onChange={e=>setForm({...form, valeur:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="Ex: 10" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Nom de la promotion</label>
                      <input required value={form.nom_promotion} onChange={e=>setForm({...form, nom_promotion:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="Ex: Solde d'été" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Produit cible (Optionnel)</label>
                      <select value={form.id_produit} onChange={e=>setForm({...form, id_produit:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }}>
                        <option value="">Tous les produits</option>
                        {produits.map(p => <option key={p.idProduit} value={p.idProduit}>{p.nomProduit}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Pourcentage de réduction (%)</label>
                      <input required type="number" min="1" max="100" value={form.pourcentage} onChange={e=>setForm({...form, pourcentage:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="Ex: 20" />
                    </div>
                  </>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Date de début</label>
                    <input required type="date" value={form.date_debut} onChange={e=>setForm({...form, date_debut:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none', fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Date de fin</label>
                    <input required type="date" value={form.date_fin} onChange={e=>setForm({...form, date_fin:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none', fontSize: 14 }} />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: 44, borderRadius: 9999, background: '#F5F5F7', color: '#1D1D1F', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, height: 44, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmDialog />
    </div>
  );
}

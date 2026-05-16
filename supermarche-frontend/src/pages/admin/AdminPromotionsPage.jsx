import { useState, useEffect, useRef } from 'react';
import { adminPromotionsApi, adminCodesPromoApi, adminProduitsApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Pagination, SearchInput, FilterBar, FormSelect } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';


const PER_PAGE = 8;

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const arr = (v) => {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.data)) return v.data;
  if (v && Array.isArray(v.data?.data)) return v.data.data;
  return [];
};

export default function AdminPromotionsPage() {
  const { success, error } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [items, setItems]     = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortField, setSortField]   = useState('date_desc');
  const [page, setPage]       = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [typePromo, setTypePromo]   = useState('CODE');
  const [form, setForm]       = useState({});
  const fetchRef = useRef(0);

  const fetchData = () => {
    const token = ++fetchRef.current;
    setLoading(true);
    Promise.all([
      adminPromotionsApi.getAll().catch(() => []),
      adminCodesPromoApi.getAll().catch(() => []),
      adminProduitsApi.getAll().catch(() => []),
    ]).then(([promos, codes, prods]) => {
      if (token !== fetchRef.current) return; // stale
      const p = arr(promos).map(x => ({ ...x, _type: 'PROMO' }));
      const c = arr(codes).map(x => ({ ...x, _type: 'CODE' }));
      // Déduplication par clé unique
      const seen = new Set();
      const merged = [...p, ...c].filter(x => {
        const cid = x.idCodePromo || x.id_code_promo || x.id || Math.random();
        const pid = x.idPromotion || x.id_promotion || x.id || Math.random();
        const k = x._type === 'CODE' ? `c_${cid}` : `p_${pid}`;
        if (seen.has(k)) return false;
        seen.add(k); return true;
      });
      setItems(merged);
      setProduits(arr(prods));
    }).finally(() => { if (token === fetchRef.current) setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = (type) => {
    setTypePromo(type);
    const today    = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
    setForm(type === 'CODE'
      ? { code:'', description:'', type_remise:'pourcentage', valeur:'', montant_min:0, usage_max:'', date_debut:today, date_fin:nextWeek }
      : { nom_promotion:'', id_produit:'', pourcentage:'', date_debut:today, date_fin:nextWeek }
    );
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (typePromo === 'CODE') {
        await adminCodesPromoApi.create({
          code: form.code, description: form.description,
          type_remise: form.type_remise,
          valeur: parseFloat(form.valeur),
          montant_min: parseFloat(form.montant_min) || 0,
          usage_max: form.usage_max ? parseInt(form.usage_max) : null,
          date_debut: form.date_debut, date_fin: form.date_fin, actif: true,
        });
        success('Code promo créé !');
      } else {
        await adminPromotionsApi.create({
          nom_promotion: form.nom_promotion,
          pourcentage: parseFloat(form.pourcentage),
          ids_produits: form.id_produit ? [parseInt(form.id_produit)] : [],
          date_debut: form.date_debut, date_fin: form.date_fin, actif: true,
        });
        success('Promotion créée !');
      }
      setShowModal(false); fetchData();
    } catch (err) { error(err.message || 'Erreur création'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    const isCode = item._type === 'CODE';
    const numId  = isCode
      ? Number(item.idCodePromo  || item.id_code_promo  || 0)
      : Number(item.idPromotion  || item.id_promotion   || 0);
    const name   = isCode ? item.code : (item.nomPromotion || item.nom_promotion || 'Promotion');
    if (!numId) return error('ID introuvable — rechargez la page');

    const ok = await confirm({ title:'Supprimer', message:`Supprimer "${name}" ?`, confirmLabel:'Supprimer', cancelLabel:'Annuler', variant:'danger' });
    if (!ok) return;
    try {
      if (isCode) await adminCodesPromoApi.delete(numId);
      else        await adminPromotionsApi.delete(numId);
      // Mise à jour optimiste immédiate
      setItems(prev => prev.filter(x => x !== item));
      success('Supprimé');
    } catch (err) { error(err.message || 'Erreur suppression'); }
  };

  const filtered = items
    .filter(p => filterType === 'PRODUIT' ? p._type==='PROMO' : filterType==='CODE' ? p._type==='CODE' : true)
    .filter(p => {
      const q = search.toLowerCase();
      return (p.code||'').toLowerCase().includes(q)
          || ((p.nomPromotion || p.nom_promotion || '').toLowerCase().includes(q))
          || (p.nomsProduits||[]).join(' ').toLowerCase().includes(q);
    })
    .sort((a,b) => {
      if (sortField==='date_desc') return new Date(b.dateDebut||0)-new Date(a.dateDebut||0);
      if (sortField==='date_asc')  return new Date(a.dateDebut||0)-new Date(b.dateDebut||0);
      const vA = a._type==='CODE'?a.valeur:a.pourcentage;
      const vB = b._type==='CODE'?b.valeur:b.pourcentage;
      return (vB||0)-(vA||0);
    });

  useEffect(() => setPage(1), [search, filterType, sortField]);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const FILTER_OPTIONS = [
    { value:'ALL', label:'Tout afficher' },
    { value:'PRODUIT', label:'Promos Produits' },
    { value:'CODE', label:'Codes Panier' },
  ];
  const SORT_OPTIONS = [
    { value:'date_desc', label:'Plus récentes' },
    { value:'date_asc',  label:'Plus anciennes' },
    { value:'pourcentage_desc', label:'Réduction ↓' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F5F5F7', fontFamily:'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

        <header style={{ marginBottom:40, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <h1 style={{ fontSize:32, fontWeight:800, color:'#1D1D1F', letterSpacing:'-0.03em', marginBottom:4 }}>Promotions & Codes</h1>
            <p style={{ fontSize:13, color:'#6E6E73', fontWeight:600 }}>Gérez vos offres catalogue et codes panier ({items.length} au total)</p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => openAdd('PRODUIT')} style={{ display:'flex', alignItems:'center', gap:8, height:44, padding:'0 20px', background:'rgba(191,90,242,0.1)', color:'#BF5AF2', border:'none', borderRadius:9999, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>sell</span> Promo Produit
            </button>
            <button onClick={() => openAdd('CODE')} style={{ display:'flex', alignItems:'center', gap:8, height:44, padding:'0 20px', background:'#0071E3', color:'#fff', border:'none', borderRadius:9999, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 14px rgba(0,113,227,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>local_activity</span> Code Promo
            </button>
          </div>
        </header>

        <FilterBar resultCount={filtered.length} totalCount={items.length} label="offres">
          <SearchInput value={search} onChange={setSearch} placeholder="Chercher une offre..." />
          <FormSelect value={filterType} onChange={setFilterType} options={FILTER_OPTIONS} placeholder="Type" />
          <FormSelect value={sortField}  onChange={setSortField}  options={SORT_OPTIONS}   placeholder="Trier par" />
        </FilterBar>

        <div className="apple-card" style={{ padding:'0 0 8px 0', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #EDEDF2' }}>
                {['NOM / CIBLE','RÉDUCTION','VALIDITÉ','STATUT','ACTIONS'].map((h,i) => (
                  <th key={h} style={{ padding:'16px 24px', fontSize:12, fontWeight:700, color:'#8E8E93', textTransform:'uppercase', letterSpacing:'0.05em', textAlign: i===4?'right':'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(PER_PAGE)].map((_,i) => (
                <tr key={i}><td colSpan={5} style={{ padding:'16px 24px' }}>
                  <div style={{ height:20, background:'#F5F5F7', borderRadius:4, animation:'pulse 1.5s infinite' }} />
                </td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={5} style={{ padding:'60px 24px', textAlign:'center', color:'#6E6E73', fontSize:15 }}>
                  Aucune offre trouvée
                </td></tr>
              ) : paginated.map((p) => {
                const isCode  = p._type === 'CODE';
                const dFin    = new Date(p.dateFin || p.date_fin);
                const expired = !isNaN(dFin.getTime()) && dFin < new Date();
                const actif   = p.actif !== false && !expired;
                const uid     = isCode ? `c_${p.idCodePromo || p.id_code_promo || p.id || Math.random()}` : `p_${p.idPromotion || p.id_promotion || p.id || Math.random()}`;
                return (
                  <tr key={uid} style={{ borderBottom:'1px solid #EDEDF2', transition:'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'16px 24px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                          background: isCode ? 'rgba(0,113,227,0.1)' : 'rgba(191,90,242,0.1)',
                          color: isCode ? '#0071E3' : '#BF5AF2' }}>
                          <span className="material-symbols-outlined" style={{ fontSize:20 }}>{isCode?'local_activity':'sell'}</span>
                        </div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:'#1D1D1F' }}>{isCode ? p.code : (p.nomPromotion || p.nom_promotion || 'Promotion')}</div>
                          <div style={{ fontSize:12, color:'#8E8E93', maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {isCode ? (p.description||'Code Panier') : `Sur : ${Array.isArray(p.nomsProduits) && p.nomsProduits.length ? p.nomsProduits.join(', ') : String(p.noms_produits || 'Catalogue complet').replace(/\|\|/g, ', ')}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'16px 24px' }}>
                      <span style={{ fontSize:16, fontWeight:800, color: isCode?'#0071E3':'#BF5AF2' }}>
                        -{isCode ? `${p.valeur}${String(p.typeRemise||'').toLowerCase()==='pourcentage'?'%':'€'}` : `${Number(p.pourcentage)}%`}
                      </span>
                    </td>
                    <td style={{ padding:'16px 24px' }}>
                      <div style={{ fontSize:13, color:'#1D1D1F' }}>Du {fmtDate(p.dateDebut||p.date_debut)}</div>
                      <div style={{ fontSize:13, color:'#6E6E73' }}>Au {fmtDate(p.dateFin||p.date_fin)}</div>
                    </td>
                    <td style={{ padding:'16px 24px' }}>
                      {expired
                        ? <span style={{ background:'rgba(0,0,0,0.08)', color:'#6E6E73', padding:'4px 10px', borderRadius:9999, fontSize:12, fontWeight:700 }}>Expirée</span>
                        : actif
                          ? <span style={{ background:'rgba(48,209,88,0.1)', color:'#30D158', padding:'4px 10px', borderRadius:9999, fontSize:12, fontWeight:700 }}>En cours</span>
                          : <span style={{ background:'rgba(255,69,58,0.1)', color:'#FF453A', padding:'4px 10px', borderRadius:9999, fontSize:12, fontWeight:700 }}>Inactive</span>
                      }
                    </td>
                    <td style={{ padding:'16px 24px', textAlign:'right' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8 }}>
                        <button onClick={async () => {
                          const numId = isCode
                            ? Number(p.idCodePromo || p.id_code_promo || 0)
                            : Number(p.idPromotion || p.id_promotion || 0);
                          if (!numId) return error('ID introuvable');
                          try {
                            if (isCode) await adminCodesPromoApi.toggle(numId, { actif: !p.actif });
                            else await adminPromotionsApi.toggle(numId, { actif: !p.actif });
                            setItems(prev => prev.map(x => x === p ? {...x, actif: !p.actif} : x));
                            success(p.actif ? 'Désactivé' : 'Activé');
                          } catch(e) { error(e.message || 'Erreur'); }
                        }} title={p.actif ? 'Désactiver' : 'Activer'}
                          style={{ width:32, height:32, borderRadius:8, border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'0.2s',
                            background: p.actif ? 'rgba(48,209,88,0.1)' : 'rgba(0,0,0,0.06)',
                            color: p.actif ? '#30D158' : '#8E8E93' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize:18 }}>{p.actif ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        <button onClick={() => handleDelete(p)} title="Supprimer"
                          style={{ width:32, height:32, borderRadius:8, background:'rgba(255,69,58,0.08)', border:'none', color:'#FF453A', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,69,58,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(255,69,58,0.08)'}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize:18 }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)' }} onClick={() => setShowModal(false)} />
          <div style={{ position:'relative', background:'#fff', borderRadius:24, width:'100%', maxWidth:460, boxShadow:'0 24px 60px rgba(0,0,0,0.2)', animation:'slideUp 280ms cubic-bezier(0.34,1.56,0.64,1)', overflow:'hidden' }}>
            <div style={{ padding:'24px 32px', borderBottom:'1px solid #EDEDF2', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background: typePromo==='CODE'?'rgba(0,113,227,0.1)':'rgba(191,90,242,0.1)', color: typePromo==='CODE'?'#0071E3':'#BF5AF2' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:20 }}>{typePromo==='CODE'?'local_activity':'sell'}</span>
                </div>
                <h2 style={{ fontSize:20, fontWeight:700, color:'#1D1D1F' }}>{typePromo==='CODE'?'Nouveau Code Promo':'Nouvelle Promo Produit'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'#F5F5F7', border:'none', width:32, height:32, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6E6E73' }}>
                <span className="material-symbols-outlined" style={{ fontSize:20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding:'24px 32px', maxHeight:'70vh', overflowY:'auto' }}>
              <div style={{ display:'grid', gap:18 }}>
                {typePromo === 'CODE' ? (<>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Code (Ex: ETE2024)</label>
                    <input required value={form.code||''} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none', letterSpacing:2, fontWeight:700 }} placeholder="SUMMER24" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Description</label>
                    <input value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none' }} placeholder="Réduction de bienvenue" />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Type de remise</label>
                      <FormSelect value={form.type_remise||'pourcentage'} onChange={v=>setForm({...form,type_remise:v})}
                        options={[{value:'pourcentage',label:'Pourcentage (%)'},{value:'montant',label:'Montant fixe (€)'}]}
                        placeholder="Type" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Valeur</label>
                      <input required type="number" step="0.1" min="0" value={form.valeur||''} onChange={e=>setForm({...form,valeur:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none' }} placeholder="Ex: 10" />
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Montant minimum (€)</label>
                      <input type="number" step="0.1" min="0" value={form.montant_min||''} onChange={e=>setForm({...form,montant_min:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none' }} placeholder="Ex: 30" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Usage max (Nb clients)</label>
                      <input type="number" min="1" value={form.usage_max||''} onChange={e=>setForm({...form,usage_max:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none' }} placeholder="Illimité si vide" />
                    </div>
                  </div>
                </>) : (<>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Nom de la promotion</label>
                    <input required value={form.nom_promotion||''} onChange={e=>setForm({...form,nom_promotion:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none' }} placeholder="Ex: Solde d'été" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Produit cible (Optionnel)</label>
                    <FormSelect value={form.id_produit||''} onChange={v=>setForm({...form,id_produit:v})}
                      options={[{value:'',label:'Tous les produits (Catalogue complet)'},...produits.filter(p => {
                        // Exclude products already in an active promotion
                        const prodId = String(p.idProduit || p.id_produit);
                        return !items.some(promo => {
                          if (promo._type !== 'PROMO') return false;
                          const dFin = new Date(promo.dateFin || promo.date_fin);
                          const isExpired = !isNaN(dFin.getTime()) && dFin < new Date();
                          if (promo.actif === false || isExpired) return false;
                          if (Array.isArray(promo.idsProduits)) return promo.idsProduits.some(id => String(id) === prodId);
                          if (typeof promo.ids_produits === 'string') return promo.ids_produits.split(',').some(id => id.trim() === prodId);
                          return false;
                        });
                      }).map(p=>({ value:String(p.idProduit||p.id_produit), label:p.nomProduit||p.nom_produit||'Produit' }))]}
                      placeholder="Tous les produits" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Réduction (%)</label>
                    <input required type="number" min="1" max="100" value={form.pourcentage||''} onChange={e=>setForm({...form,pourcentage:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none' }} placeholder="Ex: 20" />
                  </div>
                </>)}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Date de début</label>
                    <input required type="date" value={form.date_debut||''} onChange={e=>setForm({...form,date_debut:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none', fontSize:14 }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:8 }}>Date de fin</label>
                    <input required type="date" value={form.date_fin||''} onChange={e=>setForm({...form,date_fin:e.target.value})} className="apple-input" style={{ width:'100%', background:'#F5F5F7', border:'none', fontSize:14 }} />
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', gap:12, marginTop:28 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, height:44, borderRadius:9999, background:'#F5F5F7', color:'#1D1D1F', border:'none', fontSize:15, fontWeight:600, cursor:'pointer' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex:1, height:44, borderRadius:9999, background:'#0071E3', color:'#fff', border:'none', fontSize:15, fontWeight:600, cursor:saving?'wait':'pointer', opacity:saving?0.7:1 }}>
                  {saving ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

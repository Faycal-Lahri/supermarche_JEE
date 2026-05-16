import { useState, useEffect, useCallback } from 'react';
import { adminClientApi, adminClientsApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Dropdown, Pagination, SearchInput, FilterBar } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const PER_PAGE = 8;
const f = (o, s, c) => o?.[s] ?? o?.[c] ?? null;

/* ── Modal Reset Mot de passe ── */
function ResetMdpModal({ client, onClose, onSave, saving }) {
  const [mdp, setMdp]         = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow]       = useState(false);
  const valid = mdp.length >= 6 && mdp === confirm;

  return (
    <div onClick={e => e.target === e.currentTarget && !saving && onClose()}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(10px)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ background:'#fff',borderRadius:28,padding:40,width:'100%',maxWidth:440,boxShadow:'0 40px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:22,background:'rgba(0,113,227,0.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:24,color:'#0071E3',fontVariationSettings:"'FILL' 1" }}>lock_reset</span>
            </div>
            <div>
              <div style={{ fontSize:17,fontWeight:800,color:'#1D1D1F' }}>Nouveau mot de passe</div>
              <div style={{ fontSize:12,color:'#6E6E73' }}>{client.prenom} {client.nom}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',background:'#F5F5F7',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize:18 }}>close</span>
          </button>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          {/* Nouveau mdp */}
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#8E8E93',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em' }}>Nouveau mot de passe</label>
            <div style={{ position:'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                value={mdp} onChange={e=>setMdp(e.target.value)}
                placeholder="Min. 6 caractères"
                style={{ width:'100%',height:46,borderRadius:12,border:'1.5px solid #EDEDF2',padding:'0 44px 0 14px',fontSize:14,outline:'none',boxSizing:'border-box',transition:'border 200ms' }}
              />
              <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#8E8E93',display:'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>{show?'visibility_off':'visibility'}</span>
              </button>
            </div>
            {/* Barre de force */}
            {mdp && <div style={{ marginTop:6,height:3,background:'#EDEDF2',borderRadius:9999,overflow:'hidden' }}>
              <div style={{ height:'100%',borderRadius:9999,transition:'all 400ms',
                width: mdp.length<6?'25%':(/[A-Z]/.test(mdp)&&/[0-9]/.test(mdp)?'100%':'60%'),
                background: mdp.length<6?'#FF453A':(/[A-Z]/.test(mdp)&&/[0-9]/.test(mdp)?'#30D158':'#FF9F0A')
              }} />
            </div>}
          </div>

          {/* Confirmer */}
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#8E8E93',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em' }}>Confirmer le mot de passe</label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm} onChange={e=>setConfirm(e.target.value)}
              placeholder="Répéter le mot de passe"
              style={{ width:'100%',height:46,borderRadius:12,border:`1.5px solid ${confirm&&confirm!==mdp?'#FF453A':'#EDEDF2'}`,padding:'0 14px',fontSize:14,outline:'none',boxSizing:'border-box',transition:'border 200ms' }}
            />
            {confirm && confirm !== mdp && <div style={{ fontSize:11,color:'#FF453A',marginTop:4,fontWeight:600 }}>Les mots de passe ne correspondent pas</div>}
          </div>

          {/* Boutons */}
          <div style={{ display:'flex',gap:10,marginTop:8 }}>
            <button onClick={onClose} disabled={saving} style={{ flex:1,height:46,borderRadius:9999,background:'#F5F5F7',border:'none',cursor:'pointer',fontSize:14,fontWeight:600,color:'#1D1D1F' }}>Annuler</button>
            <button onClick={()=>valid&&!saving&&onSave(mdp)} disabled={!valid||saving}
              style={{ flex:2,height:46,borderRadius:9999,background:valid?'#0071E3':'#EDEDF2',border:'none',cursor:valid&&!saving?'pointer':'not-allowed',fontSize:14,fontWeight:700,color:valid?'#fff':'#8E8E93',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all 200ms' }}>
              {saving && <span className="material-symbols-outlined" style={{ fontSize:16,animation:'spin 1s linear infinite' }}>autorenew</span>}
              {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ── Modal Édition ── */
function EditModal({ client, onClose, onSave, saving }) {
  const [data, setData] = useState({
    prenom:      client.prenom      || '',
    nom:         client.nom         || '',
    email:       client.email       || '',
    telephone:   client.telephone   || '',
    adresse:     client.adresse     || '',
    ville:       client.ville       || '',
    code_postal: client.code_postal || client.codePostal || '',
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div onClick={e => e.target === e.currentTarget && !saving && onClose()}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(10px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ background:'#fff',borderRadius:28,padding:40,width:'100%',maxWidth:520,boxShadow:'0 40px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28 }}>
          <div>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#1D1D1F',marginBottom:4 }}>Modifier le client</h2>
            <p style={{ fontSize:13,color:'#6E6E73' }}>{client.prenom} {client.nom}</p>
          </div>
          <button onClick={onClose} style={{ width:36,height:36,borderRadius:'50%',background:'#F5F5F7',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize:20 }}>close</span>
          </button>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
          {[['prenom','Prénom','text'],['nom','Nom','text']].map(([k,l,t]) => (
            <div key={k}>
              <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#8E8E93',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em' }}>{l}</label>
              <input type={t} value={data[k]} onChange={e=>set(k,e.target.value)} style={{ width:'100%',height:44,borderRadius:12,border:'1.5px solid #EDEDF2',padding:'0 14px',fontSize:14,outline:'none',boxSizing:'border-box' }} />
            </div>
          ))}
        </div>
        <div style={{ display:'grid',gap:12,marginBottom:20 }}>
          {[['email','Email','email'],['telephone','Téléphone','tel'],['adresse','Adresse','text']].map(([k,l,t]) => (
            <div key={k}>
              <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#8E8E93',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em' }}>{l}</label>
              <input type={t} value={data[k]} onChange={e=>set(k,e.target.value)} style={{ width:'100%',height:44,borderRadius:12,border:'1.5px solid #EDEDF2',padding:'0 14px',fontSize:14,outline:'none',boxSizing:'border-box' }} />
            </div>
          ))}
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:12 }}>
            {[['ville','Ville'],['code_postal','Code postal']].map(([k,l]) => (
              <div key={k}>
                <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#8E8E93',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em' }}>{l}</label>
                <input type="text" value={data[k]} onChange={e=>set(k,e.target.value)} style={{ width:'100%',height:44,borderRadius:12,border:'1.5px solid #EDEDF2',padding:'0 14px',fontSize:14,outline:'none',boxSizing:'border-box' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={{ height:46,padding:'0 22px',borderRadius:9999,background:'#F5F5F7',border:'none',cursor:'pointer',fontSize:15,fontWeight:600,color:'#1D1D1F' }}>Annuler</button>
          <button onClick={() => onSave(data)} disabled={saving} style={{ height:46,padding:'0 26px',borderRadius:9999,background:'#1D1D1F',border:'none',cursor:saving?'wait':'pointer',fontSize:15,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',gap:8 }}>
            {saving && <span className="material-symbols-outlined" style={{ fontSize:17,animation:'spin 1s linear infinite' }}>autorenew</span>}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ── */
export default function AdminClientsPage() {
  const { success, error } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const { user } = useAuth();
  const isSuperAdmin  = user?.typeAdmin === 'super' || user?.role === 'super_admin';
  const isAdminProduits = user?.typeAdmin === 'produits' || user?.role === 'admin_produits';
  const isAdminStock  = user?.typeAdmin === 'stock' || user?.role === 'admin_stock';
  // admin_stock = consultation uniquement ; admin_produits & super_admin = peut modifier
  const canEdit   = isSuperAdmin || isAdminProduits;
  const canDelete = isSuperAdmin;

  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [sortField, setSortField] = useState('date_desc');
  const [page, setPage]         = useState(1);
  const [working, setWorking]   = useState({});
  const [editClient, setEditClient]   = useState(null);
  const [saving, setSaving]           = useState(false);
  const [resetClient, setResetClient] = useState(null); // modal reset mdp
  const [savingReset, setSavingReset] = useState(false);

  const fetchClients = useCallback(() => {
    setLoading(true);
    adminClientApi.getAll()
      .then(res => setClients(Array.isArray(res.data||res) ? (res.data||res) : []))
      .catch(() => error('Erreur chargement clients'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { const t = setInterval(fetchClients, 30000); return () => clearInterval(t); }, [fetchClients]);
  // Remettre à la page 1 à chaque changement de filtre/recherche
  useEffect(() => { setPage(1); }, [search, filterStatut, sortField]);

  /* Reset mot de passe client */
  const handleResetMdp = async (nouveauMdp) => {
    const id = f(resetClient,'id_client','idClient') || f(resetClient,'id_utilisateur','idUtilisateur');
    if (!id) { error('ID client introuvable'); return; }
    setSavingReset(true);
    try {
      await adminClientsApi.resetPassword(id, { nouveauMotDePasse: nouveauMdp });
      success(`Mot de passe réinitialisé pour ${resetClient.prenom} ${resetClient.nom}`);
      setResetClient(null);
    } catch (e) { error(e.message || 'Erreur réinitialisation mot de passe'); }
    finally { setSavingReset(false); }
  };

  /* Sauvegarder l'édition */
  const handleSave = async (data) => {
    const id = f(editClient,'id_client','idClient');
    if (!id) { error('ID client introuvable'); return; }
    setSaving(true);
    try {
      // Le backend Java lit 'codePostal' (camelCase) — mapper depuis snake_case
      const payload = { ...data };
      if (payload.code_postal !== undefined) {
        payload.codePostal = payload.code_postal;
        delete payload.code_postal;
      }
      await adminClientsApi.updateProfile(id, payload);
      setClients(prev => prev.map(c => f(c,'id_client','idClient') === id ? { ...c, ...data } : c));
      success('Client modifié avec succès');
      setEditClient(null);
    } catch (e) { error(e.message || 'Erreur modification'); }
    finally { setSaving(false); }
  };

  /* Suspendre / Activer */
  const toggleStatut = async (c) => {
    const id     = f(c,'id_client','idClient');
    const statut = f(c,'statut','statut') || 'actif';
    const next   = statut === 'actif' ? 'suspendu' : 'actif';
    const ok = await confirm({ title:`${next==='suspendu'?'Suspendre':'Activer'} le compte`, message:`Voulez-vous vraiment ${next==='suspendu'?'suspendre':'activer'} ${c.prenom||''} ${c.nom} ?`, confirmLabel:`Oui, ${next==='suspendu'?'suspendre':'activer'}`, variant: next==='suspendu'?'danger':'primary' });
    if (!ok) return;
    setWorking(w => ({ ...w, [`s${id}`]: true }));
    try {
      await adminClientApi.updateStatus(id, next);
      setClients(prev => prev.map(x => f(x,'id_client','idClient')===id ? { ...x, statut: next } : x));
      success(`Compte ${next==='actif'?'activé':'suspendu'}`);
    } catch (e) { error(e.message || 'Erreur statut'); }
    finally { setWorking(w => ({ ...w, [`s${id}`]: false })); }
  };

  /* Supprimer (super_admin only) */
  const handleDelete = async (c) => {
    const id = f(c,'id_client','idClient');
    const ok = await confirm({ title:'Supprimer définitivement', message:`Cette action est irréversible. Voulez-vous supprimer le compte de ${c.prenom||''} ${c.nom} et toutes ses données ?`, confirmLabel:'Supprimer définitivement', variant:'danger' });
    if (!ok) return;
    setWorking(w => ({ ...w, [`d${id}`]: true }));
    try {
      await adminClientsApi.delete(id);
      setClients(prev => prev.filter(x => f(x,'id_client','idClient') !== id));
      success('Client supprimé définitivement');
    } catch (e) { error(e.message || 'Erreur suppression'); }
    finally { setWorking(w => ({ ...w, [`d${id}`]: false })); }
  };

  /* Filtrage */
  const filtered = clients
    .filter(c => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return `${c.prenom||''} ${c.nom||''}`.toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q) || (c.telephone||'').includes(q);
    })
    .filter(c => !filterStatut || (f(c,'statut','statut')||'actif') === filterStatut)
    .sort((a,b) => {
      if (sortField==='nom') return (a.nom||'').localeCompare(b.nom||'');
      const da = a.date_creation||a.dateCreation||0, db = b.date_creation||b.dateCreation||0;
      return sortField==='date_asc' ? new Date(da)-new Date(db) : new Date(db)-new Date(da);
    });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const actifs    = clients.filter(c => (f(c,'statut','statut')||'actif')==='actif').length;
  const suspendus = clients.length - actifs;

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:'#F5F5F7',fontFamily:'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex:1,padding:'40px 48px',overflowY:'auto' }}>

        {/* Header */}
        <header style={{ marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'flex-end' }}>
          <div>
            <h1 style={{ fontSize:32,fontWeight:800,color:'#1D1D1F',letterSpacing:'-0.03em',marginBottom:4 }}>Clients</h1>
            <p style={{ fontSize:13,color:'#6E6E73',fontWeight:600 }}>
              {canEdit ? 'Gestion des comptes' : 'Consultation des comptes'} ({clients.length} clients)
              {isAdminStock && <span style={{ marginLeft:8,fontSize:11,background:'rgba(255,159,10,0.1)',color:'#FF9F0A',padding:'2px 8px',borderRadius:9999,fontWeight:700 }}>Lecture seule</span>}
            </p>
          </div>
          <button onClick={fetchClients} style={{ display:'flex',alignItems:'center',gap:8,height:44,padding:'0 20px',background:'#fff',color:'#1D1D1F',border:'1px solid #EDEDF2',borderRadius:9999,fontSize:14,fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="material-symbols-outlined" style={{ fontSize:20 }}>refresh</span> Rafraîchir
          </button>
        </header>

        {/* Mini KPIs */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24 }}>
          {[
            { label:'Total clients', value:clients.length, color:'#0A84FF', bg:'rgba(10,132,255,0.08)', icon:'group' },
            { label:'Comptes actifs', value:actifs,    color:'#30D158', bg:'rgba(48,209,88,0.08)',  icon:'check_circle' },
            { label:'Suspendus',     value:suspendus,  color:'#FF453A', bg:'rgba(255,69,58,0.08)', icon:'block' },
          ].map(({ label,value,color,bg,icon }) => (
            <div key={label} style={{ background:bg,borderRadius:20,padding:'18px 22px',display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:46,height:46,borderRadius:23,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <span className="material-symbols-outlined" style={{ fontSize:24,color,fontVariationSettings:"'FILL' 1" }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize:26,fontWeight:800,color,lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:12,color:'#6E6E73',fontWeight:600,marginTop:2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <FilterBar resultCount={filtered.length} totalCount={clients.length} label="clients">
          <SearchInput value={search} onChange={setSearch} placeholder="Nom, email, téléphone..." />
          <Dropdown value={filterStatut} onChange={setFilterStatut} options={[{value:'actif',label:'Actifs'},{value:'suspendu',label:'Suspendus'}]} placeholder="Statut" icon="how_to_reg" />
          <Dropdown value={sortField} onChange={setSortField} options={[{value:'date_desc',label:'Plus récents'},{value:'date_asc',label:'Plus anciens'},{value:'nom',label:'Nom A→Z'}]} placeholder="Trier" icon="sort" />
          {(search||filterStatut||sortField!=='date_desc') && (
            <button onClick={()=>{ setSearch(''); setFilterStatut(''); setSortField('date_desc'); }} style={{ background:'transparent',border:'none',color:'#FF453A',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}>
              <span className="material-symbols-outlined" style={{ fontSize:16 }}>close</span> Effacer
            </button>
          )}
        </FilterBar>

        {/* Tableau */}
        <div className="apple-card" style={{ padding:'0 0 20px 0' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',textAlign:'left' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #EDEDF2' }}>
                {['Client','Contact','Adresse','Inscription','Statut','Actions'].map((h,i)=>(
                  <th key={h} style={{ padding:'14px 20px',fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:i===5?'right':'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(PER_PAGE)].map((_,i)=>(
                <tr key={i}><td colSpan={6} style={{ padding:'14px 20px' }}><div style={{ height:18,background:'#F5F5F7',borderRadius:4,animation:'pulse 1.5s infinite' }} /></td></tr>
              )) : paginated.length===0 ? (
                <tr><td colSpan={6} style={{ padding:'60px 24px',textAlign:'center',color:'#6E6E73',fontSize:15 }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:48,color:'#EDEDF2' }}>group</span>
                    Aucun client trouvé
                  </div>
                </td></tr>
              ) : paginated.map(c => {
                const id     = f(c,'id_client','idClient');
                const idUtil = f(c,'id_utilisateur','idUtilisateur');
                const statut = f(c,'statut','statut') || 'actif';
                const isActif = statut === 'actif';
                // Gson sérialise dateCreation (camelCase depuis getDateCreation())
                const dateRaw = c.date_creation || c.dateCreation;
                const dateStr = dateRaw
                  ? new Date(dateRaw).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : '—';
                const adresse = [c.adresse, c.code_postal||c.codePostal, c.ville].filter(Boolean).join(', ');

                return (
                  <tr key={id||c.email} style={{ borderBottom:'1px solid #EDEDF2',transition:'background 200ms',opacity:isActif?1:0.65 }}
                    onMouseEnter={e=>e.currentTarget.style.background='#F5F5F7'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    {/* Client */}
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                        <div style={{ width:42,height:42,borderRadius:21,background:isActif?'rgba(0,113,227,0.1)':'rgba(255,69,58,0.1)',color:isActif?'#0071E3':'#FF453A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,flexShrink:0 }}>
                          {(c.prenom?.[0]||'').toUpperCase()}{(c.nom?.[0]||'').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:14,fontWeight:700,color:'#1D1D1F' }}>{c.prenom} {c.nom}</div>
                          <div style={{ fontSize:11,color:'#8E8E93' }}>ID #{id ?? idUtil ?? '?'}</div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ fontSize:13,color:'#1D1D1F',display:'flex',alignItems:'center',gap:5,marginBottom:3 }}>
                        <span className="material-symbols-outlined" style={{ fontSize:14,color:'#8E8E93' }}>mail</span> {c.email||'—'}
                      </div>
                      <div style={{ fontSize:12,color:'#6E6E73',display:'flex',alignItems:'center',gap:5 }}>
                        <span className="material-symbols-outlined" style={{ fontSize:14,color:'#8E8E93' }}>call</span> {c.telephone||'Non renseigné'}
                      </div>
                    </td>
                    {/* Adresse */}
                    <td style={{ padding:'14px 20px',fontSize:12,color:'#6E6E73',maxWidth:160 }}>
                      {adresse || <span style={{ fontStyle:'italic' }}>Non renseignée</span>}
                    </td>
                    {/* Inscription */}
                    <td style={{ padding:'14px 20px',fontSize:13,color:'#6E6E73' }}>{dateStr}</td>
                    {/* Statut */}
                    <td style={{ padding:'14px 20px' }}>
                      {isActif
                        ? <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(48,209,88,0.1)',color:'#30D158',padding:'4px 10px',borderRadius:9999,fontSize:11,fontWeight:700 }}><span className="material-symbols-outlined" style={{ fontSize:13 }}>check_circle</span>Actif</span>
                        : <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(255,69,58,0.1)',color:'#FF453A',padding:'4px 10px',borderRadius:9999,fontSize:11,fontWeight:700 }}><span className="material-symbols-outlined" style={{ fontSize:13 }}>block</span>Suspendu</span>
                      }
                    </td>
                    {/* Actions */}
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'flex-end',gap:6 }}>
                        {/* Modifier — admin_produits et super_admin seulement */}
                        {canEdit && (
                          <button onClick={()=>setEditClient(c)} title="Modifier" style={{ height:34,padding:'0 12px',borderRadius:9999,background:'rgba(0,113,227,0.08)',border:'none',color:'#0071E3',cursor:'pointer',fontSize:12,fontWeight:700,display:'inline-flex',alignItems:'center',gap:5 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:14 }}>edit</span> Modifier
                          </button>
                        )}
                        {/* Réinitialiser MDP — admin_produits et super_admin seulement */}
                        {canEdit && (
                          <button onClick={()=>setResetClient(c)} title="Réinitialiser le mot de passe" style={{ height:34,width:34,borderRadius:9999,background:'rgba(0,113,227,0.06)',border:'none',color:'#0071E3',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:16 }}>lock_reset</span>
                          </button>
                        )}
                        {/* Suspendre/Activer — admin_produits et super_admin seulement */}
                        {canEdit && (
                          <button disabled={working[`s${id}`]} onClick={()=>toggleStatut(c)} title={isActif?'Suspendre':'Activer'} style={{ height:34,padding:'0 12px',borderRadius:9999,background:isActif?'rgba(255,159,10,0.09)':'rgba(48,209,88,0.1)',border:'none',color:isActif?'#FF9F0A':'#30D158',cursor:working[`s${id}`]?'wait':'pointer',fontSize:12,fontWeight:700,display:'inline-flex',alignItems:'center',gap:5 }}>
                            {working[`s${id}`]
                              ? <span className="material-symbols-outlined" style={{ fontSize:14,animation:'spin 1s linear infinite' }}>autorenew</span>
                              : <><span className="material-symbols-outlined" style={{ fontSize:14 }}>{isActif?'pause_circle':'play_circle'}</span>{isActif?'Suspendre':'Activer'}</>
                            }
                          </button>
                        )}
                        {/* Mode consultation pour admin_stock */}
                        {!canEdit && (
                          <span style={{ fontSize:12,color:'#8E8E93',fontStyle:'italic',padding:'0 8px' }}>Consultation seule</span>
                        )}
                        {/* Supprimer (super_admin uniquement) */}
                        {canDelete && (
                          <button disabled={working[`d${id}`]} onClick={()=>handleDelete(c)} title="Supprimer définitivement" style={{ height:34,width:34,borderRadius:9999,background:'rgba(255,69,58,0.08)',border:'none',color:'#FF453A',cursor:working[`d${id}`]?'wait':'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center' }}>
                            {working[`d${id}`]
                              ? <span className="material-symbols-outlined" style={{ fontSize:14,animation:'spin 1s linear infinite' }}>autorenew</span>
                              : <span className="material-symbols-outlined" style={{ fontSize:16 }}>delete</span>
                            }
                          </button>
                        )}
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

      {editClient && <EditModal client={editClient} onClose={()=>!saving&&setEditClient(null)} onSave={handleSave} saving={saving} />}
      {resetClient && <ResetMdpModal client={resetClient} onClose={()=>!savingReset&&setResetClient(null)} onSave={handleResetMdp} saving={savingReset} />}
      <ConfirmDialog />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

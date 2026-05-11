import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { superAdminApi, adminCommandesApi, adminClientsApi, adminStockApi, adminProduitsApi, adminCategoriesApi } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { KpiCard, SectionTitle, StatusBadge, Card, Skel, fmtDate, fmtMoney, arr, buildLast7, CSS, F } from './SharedComponents';

const ROLE_COLORS = { super:'#BF5AF2', produits:'#0071E3', stock:'#30D158', commandes:'#FF9F0A', clients:'#32ADE6' };
const ROLE_LABELS = { super:'Super Admin', produits:'Admin Produits', stock:'Admin Stock', commandes:'Admin Commandes', clients:'Admin Clients' };
const PIE_COLORS = ['#30D158','#FF9F0A','#FF453A','#0071E3','#BF5AF2','#32ADE6'];

const CustomTooltip = ({ active, payload, label }) => active&&payload?.length?(
  <div style={{ background:'#fff',border:'none',borderRadius:12,padding:'10px 14px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',fontSize:13,...F }}>
    <div style={{ fontWeight:700,color:'#1D1D1F',marginBottom:4 }}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{ color:p.color||'#0071E3' }}>{p.name}: {p.value?.toFixed?.(2)} {p.name==='ca'?'€':''}</div>)}
  </div>
):null;

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { error } = useToast();
  const nav = useNavigate();
  const [data, setData] = useState({ kpi:{}, commandes:[], clients:[], admins:[], alertes:[], produits:[] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      superAdminApi.dashboard(), adminCommandesApi.getAll(),
      adminClientsApi.getAll(), superAdminApi.getAdmins(),
      adminStockApi.getAlertes(), adminProduitsApi.getAll(),
    ]).then(([kpiR, cmdR, cliR, admR, altR, prodR]) => {
      setData({
        kpi: kpiR?.data?.data || kpiR?.data || kpiR || {},
        commandes: arr(cmdR), clients: arr(cliR),
        admins: arr(admR), alertes: arr(altR), produits: arr(prodR),
      });
    }).catch(()=>error('Erreur chargement')).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[]);

  const { kpi, commandes, clients, admins, alertes, produits } = data;
  const enAttente = commandes.filter(c=>(c.statut_commande||c.statutCommande)==='en_attente').length;
  const chartData = buildLast7(commandes);
  const caTotal = commandes.filter(c=>(c.statut_commande||c.statutCommande)!=='annulee').reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0),0);

  // Pie data par statut
  const statutCounts = Object.keys({en_attente:1,confirmee:1,en_preparation:1,en_livraison:1,livree:1,annulee:1}).map(k=>({
    name:k, value:commandes.filter(c=>(c.statut_commande||c.statutCommande)===k).length
  })).filter(x=>x.value>0);

  // Produits par catégorie
  const catMap={};
  produits.forEach(p=>{ const c=p.nom_categorie||p.nomCategorie||'Autre'; catMap[c]=(catMap[c]||0)+1; });
  const catData=Object.entries(catMap).map(([nom,nb])=>({nom:nom.substring(0,12),nb}));

  const STATUS_COLOR_MAP = { en_attente:'#FF9F0A',confirmee:'#0A84FF',en_preparation:'#BF5AF2',en_livraison:'#32ADE6',livree:'#30D158',annulee:'#FF453A' };

  return (
    <div style={{ flex:1, padding:'40px 40px', overflowY:'auto', ...F }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:30,fontWeight:900,color:'#1D1D1F',letterSpacing:'-0.03em',marginBottom:4 }}>Vue d'ensemble — Super Admin</h1>
          <p style={{ fontSize:13,color:'#6E6E73',fontWeight:500 }}>Bonjour {user?.prenom||'Admin'}, voici l'activité globale.</p>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <span style={{ fontSize:13,color:'#6E6E73' }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
          <span style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(48,209,88,0.1)',color:'#30D158',padding:'6px 12px',borderRadius:9999,fontSize:12,fontWeight:700 }}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:'#30D158',display:'inline-block',animation:'livePulse 1.5s infinite' }}/>Live
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="db-grid-3" style={{ marginBottom:24 }}>
        <KpiCard loading={loading} label="Chiffre d'affaires" value={caTotal} icon="payments" color="#30D158" suffix=" €" decimals={2} link="/admin/commandes" trend={0} trendLabel="ce mois"/>
        <KpiCard loading={loading} label="Commandes en attente" value={enAttente} icon="pending_actions" color={enAttente>0?'#FF9F0A':'#30D158'} link="/admin/commandes" trend={enAttente} trendLabel="en attente"/>
        <KpiCard loading={loading} label="Clients actifs" value={kpi.nb_clients||clients.length} icon="group" color="#0071E3" link="/admin/clients"/>
        <KpiCard loading={loading} label="Alertes stock" value={kpi.nb_alertes_stock||alertes.length} icon="warning" color="#FF453A" link="/admin/stock"/>
        <KpiCard loading={loading} label="Total commandes" value={kpi.nb_commandes||commandes.length} icon="receipt_long" color="#BF5AF2" link="/admin/commandes"/>
        <KpiCard loading={loading} label="Administrateurs" value={kpi.nb_admins||admins.length} icon="admin_panel_settings" color="#32ADE6" link="/superadmin"/>
      </div>

      {/* Graphes */}
      <div className="db-grid-2" style={{ marginBottom:24 }}>
        <Card>
          <SectionTitle icon="show_chart" title="Revenus — 7 derniers jours"/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071E3" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7"/>
              <XAxis dataKey="jour" tick={{ fontSize:12,fill:'#6E6E73' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:12,fill:'#6E6E73' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="ca" name="ca" stroke="#0071E3" strokeWidth={2.5} fill="url(#gCA)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle icon="donut_large" title="Statuts des commandes"/>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statutCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {statutCounts.map((e,i)=><Cell key={i} fill={STATUS_COLOR_MAP[e.name]||PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>[v, n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:8 }}>
            {statutCounts.map((e,i)=>(
              <span key={i} style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:'#6E6E73' }}>
                <span style={{ width:8,height:8,borderRadius:'50%',background:STATUS_COLOR_MAP[e.name]||PIE_COLORS[i%PIE_COLORS.length] }}/>
                {e.name.replace('_',' ')} ({e.value})
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Dernières commandes + Alertes */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:16,marginBottom:24 }}>
        <Card>
          <SectionTitle icon="receipt_long" title="Dernières commandes" actionLabel="Tout voir" actionLink="/admin/commandes"/>
          {loading?[...Array(4)].map((_,i)=><Skel key={i} h={36} mb={8}/>):(
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid #EDEDF2' }}>
                {['Référence','Client','Date','Total','Statut'].map(h=>(
                  <th key={h} style={{ padding:'8px 10px',fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',textAlign:'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...commandes].sort((a,b)=>new Date(b.date_commande||b.dateCommande)-new Date(a.date_commande||a.dateCommande)).slice(0,6).map((c,i)=>{
                  const id=c.id_commande||c.idCommande;
                  const num=c.numero_commande||c.numeroCommande||`#${id}`;
                  const nom=c.nom_client||c.nomClient?`${c.prenom_client||c.prenomClient||''} ${c.nom_client||c.nomClient}`.trim():`Client #${c.id_client||c.idClient}`;
                  return (
                    <tr key={i} onClick={()=>nav('/admin/commandes')} style={{ borderBottom:'1px solid #EDEDF2',cursor:'pointer',transition:'background 150ms' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F5F5F7'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px',fontSize:13,fontWeight:700,color:'#0071E3' }}>{num}</td>
                      <td style={{ padding:'10px',fontSize:13,color:'#1D1D1F' }}>{nom}</td>
                      <td style={{ padding:'10px',fontSize:12,color:'#6E6E73' }}>{fmtDate(c.date_commande||c.dateCommande)}</td>
                      <td style={{ padding:'10px',fontSize:13,fontWeight:700 }}>{fmtMoney(c.montant_total||c.montantTotal)}</td>
                      <td style={{ padding:'10px' }}><StatusBadge statut={c.statut_commande||c.statutCommande}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Alertes stock */}
        <Card style={{ background:'#fff5f5' }}>
          <SectionTitle icon="warning" title="Alertes stock" actionLabel="Gérer" actionLink="/admin/stock"/>
          {loading?[...Array(3)].map((_,i)=><Skel key={i} h={54} mb={8}/>):alertes.length===0?(
            <div style={{ textAlign:'center',padding:'24px 0',color:'#30D158',fontWeight:600,fontSize:14 }}>✅ Tous les stocks OK !</div>
          ):alertes.slice(0,6).map((p,i)=>{
            const q=p.quantite_disponible??p.quantiteDisponible??0;
            const s=p.seuil_alerte??p.seuilAlerte??10;
            const rupt=q===0;
            return (
              <div key={i} style={{ background:'#fff',borderRadius:12,padding:'12px',marginBottom:8,border:`1px solid ${rupt?'rgba(255,69,58,0.2)':'rgba(255,159,10,0.2)'}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                  <span style={{ fontSize:13,fontWeight:600,color:'#1D1D1F' }}>{p.nom_produit||p.nomProduit}</span>
                  <span style={{ fontSize:11,fontWeight:700,color:rupt?'#FF453A':'#FF9F0A',background:rupt?'rgba(255,69,58,0.1)':'rgba(255,159,10,0.1)',padding:'2px 8px',borderRadius:9999 }}>{rupt?'Rupture':'Alerte'}</span>
                </div>
                <div style={{ fontSize:12,color:'#6E6E73',marginBottom:6 }}>{q} / {s} unités</div>
                <div style={{ height:4,background:'#F5F5F7',borderRadius:2,overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(s>0?q/s*100:0,100)}%`,height:'100%',background:rupt?'#FF453A':'#FF9F0A',borderRadius:2 }}/>
                </div>
                <button onClick={()=>nav('/admin/stock')} style={{ marginTop:8,fontSize:11,fontWeight:700,color:'#FF453A',background:'rgba(255,69,58,0.08)',border:'none',borderRadius:9999,padding:'4px 10px',cursor:'pointer' }}>Réapprovisionner →</button>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Admins + Produits par catégorie */}
      <div className="db-grid-2">
        <Card>
          <SectionTitle icon="group" title="Équipe admin" actionLabel="+ Ajouter" actionLink="/superadmin"/>
          {loading?[...Array(3)].map((_,i)=><Skel key={i} h={48} mb={8}/>):admins.map((a,i)=>{
            const role=a.type_admin||a.typeAdmin||'produits';
            return (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<admins.length-1?'1px solid #EDEDF2':'none' }}>
                <div style={{ width:38,height:38,borderRadius:10,background:'rgba(0,113,227,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#0071E3' }}>
                  {(a.prenom?.[0]||'').toUpperCase()}{(a.nom?.[0]||'').toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:'#1D1D1F' }}>{a.prenom} {a.nom}</div>
                  <div style={{ fontSize:11,color:'#6E6E73' }}>{a.email}</div>
                </div>
                <span style={{ fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:9999,color:ROLE_COLORS[role]||'#6E6E73',background:`${ROLE_COLORS[role]||'#6E6E73'}18` }}>
                  {ROLE_LABELS[role]||role}
                </span>
              </div>
            );
          })}
        </Card>

        <Card>
          <SectionTitle icon="bar_chart" title="Produits par catégorie"/>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} margin={{ top:4,right:8,left:-20,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false}/>
              <XAxis dataKey="nom" tick={{ fontSize:11,fill:'#6E6E73' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:'#6E6E73' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'#fff',border:'none',borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',fontSize:13 }} formatter={(v)=>[`${v} produits`,'Nb']}/>
              <Bar dataKey="nb" fill="#0071E3" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

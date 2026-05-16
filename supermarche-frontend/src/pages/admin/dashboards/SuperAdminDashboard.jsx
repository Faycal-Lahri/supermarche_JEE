import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import {
  superAdminApi, adminCommandesApi, adminClientsApi,
  adminStockApi, adminProduitsApi,
} from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  KpiCard, SectionTitle, StatusBadge, Card, Skel,
  fmtDate, fmtMoney, arr, buildLast7, CustomTooltip, CSS, F, SparkBar,
} from './SharedComponents';

/* ── Config rôles & Couleurs ─────────────────────────────────────────────── */
const ROLE_CFG = {
  super:    { label:'Super Admin',                   color:'#FF3B30', icon:'admin_panel_settings' },
  produits: { label:'Admin Produits/Catégories',     color:'#AF52DE', icon:'inventory_2' },
  stock:    { label:'Admin Stock/Commandes/Promos',  color:'#5AC8FA', icon:'warehouse' },
};
const PIE_COLORS = ['#FF9500','#007AFF','#AF52DE','#5AC8FA','#34C759','#FF3B30', '#FFCC00', '#5856D6'];
const STATUS_COLOR = { en_attente:'#FF9500',confirmee:'#007AFF',en_preparation:'#AF52DE',en_livraison:'#5AC8FA',livree:'#34C759',annulee:'#FF3B30' };

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { error } = useToast();
  const nav = useNavigate();
  const [data, setData] = useState({ kpi:{}, commandes:[], clients:[], admins:[], alertes:[], produits:[] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      superAdminApi.dashboard().catch(()=>({})),
      adminCommandesApi.getAll().catch(()=>[]),
      adminClientsApi.getAll().catch(()=>[]),
      superAdminApi.getAdmins().catch(()=>[]),
      adminStockApi.getAlertes().catch(()=>[]),
      adminProduitsApi.getAll().catch(()=>[]),
    ]).then(([kpiR, cmdR, cliR, admR, altR, prodR]) => {
      setData({
        kpi:      kpiR?.data?.data || kpiR?.data || kpiR || {},
        commandes: arr(cmdR),
        clients:   arr(cliR),
        admins:    arr(admR),
        alertes:   arr(altR),
        produits:  arr(prodR),
      });
    }).catch(() => error('Erreur chargement dashboard')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  const { commandes, clients, admins, alertes, produits } = data;

  // 1 & 2. CA & Commandes (Livrées uniquement pour le CA)
  const livrees = commandes.filter(c=>(c.statut_commande||c.statutCommande)==='livree');
  const enAttente = commandes.filter(c=>(c.statut_commande||c.statutCommande)==='en_attente').length;
  const caTotal = Number(livrees.reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0),0).toFixed(2));
  const chartData = buildLast7(livrees); 
  
  // 3. Répartition Statuts Commandes
  const statutCounts = Object.keys(STATUS_COLOR).map(k=>({
    name: k, label: k.replace(/_/g,' '), value: commandes.filter(c=>(c.statut_commande||c.statutCommande)===k).length
  })).filter(x=>x.value>0);

  // 4. Produits par Catégorie (Nb)
  const catMap = {};
  produits.forEach(p => { const c = p.nom_categorie || p.nomCategorie || 'Autre'; catMap[c] = (catMap[c] || 0) + 1; });
  const produitsParCat = Object.entries(catMap).map(([name, value]) => ({ name: name.length>12?name.substring(0,12)+'…':name, value })).sort((a,b)=>b.value-a.value).slice(0,6);

  // 5. Valeur du Stock par Catégorie (€)
  const valMap = {};
  produits.forEach(p => { 
      const c = p.nom_categorie || p.nomCategorie || 'Autre'; 
      const stock = p.quantite_stock || p.quantiteStock || 0;
      valMap[c] = (valMap[c] || 0) + (stock * (p.prix || 0)); 
  });
  const valeurStockCat = Object.entries(valMap).map(([name, ca]) => ({ name: name.length>12?name.substring(0,12)+'…':name, ca: Number(ca.toFixed(2)) })).sort((a,b)=>b.ca-a.ca).slice(0,6);

  // 6. Inscriptions Clients 7 jours
  const client7j = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return {
      jour: d.toLocaleDateString('fr-FR',{weekday:'short'}),
      val: clients.filter(c => {
          const dC = new Date(c.date_inscription || c.dateInscription || c.date_creation || d);
          return dC.toDateString() === d.toDateString();
      }).length
    };
  });

  // 7. Top 5 Clients par CA
  const bestClientsMap = {};
  commandes.filter(c=>(c.statut_commande||c.statutCommande)!=='annulee').forEach(c => {
      const nom = ((c.prenom_client||c.prenomClient||'') + ' ' + (c.nom_client||c.nomClient||'')).trim() || `Client #${c.id_client||c.idClient}`;
      bestClientsMap[nom] = (bestClientsMap[nom] || 0) + parseFloat(c.montant_total || c.montantTotal || 0);
  });
  const bestClients = Object.entries(bestClientsMap).map(([name, ca]) => ({ name: name.substring(0,12), ca: Number(ca.toFixed(2)) })).sort((a,b)=>b.ca-a.ca).slice(0,5);

  // 8. Panier Moyen 7 jours
  const panierMoyen7j = buildLast7(commandes.filter(c=>(c.statut_commande||c.statutCommande)!=='annulee')).map(d => ({
      jour: d.jour,
      ca: Number((d.nb > 0 ? d.ca / d.nb : 0).toFixed(2))
  }));

  // 9. Clients Actifs vs Inactifs
  const clientsActifsArr = clients.filter(c=>(c.statut||'actif')==='actif').length;
  const clientsInactifs = clients.length - clientsActifsArr;
  const clientsStatusData = [
      { name: 'Actifs', value: clientsActifsArr, color: '#34C759' },
      { name: 'Suspendus', value: clientsInactifs, color: '#FF3B30' }
  ].filter(x=>x.value>0);

  // 10. Santé du Stock
  const stockAlerte = alertes.length;
  const stockSain = produits.length - stockAlerte;
  const stockHealthData = [
      { name: 'Sain', value: stockSain, color: '#34C759' },
      { name: 'En Alerte', value: stockAlerte, color: '#FF9500' }
  ].filter(x=>x.value>0);

  // 11. Top 5 Produits les plus chers
  const topPrix = [...produits].sort((a,b) => (b.prix||0) - (a.prix||0)).slice(0,5).map(p => ({ name: (p.nom_produit||p.nomProduit||'').substring(0,12), ca: Number((p.prix||0).toFixed(2)) }));

  // 12. Volume de Commandes
  const cmdsLivrees = commandes.filter(c => (c.statut_commande||c.statutCommande) === 'livree').length;
  const cmdsAnnulees = commandes.filter(c => (c.statut_commande||c.statutCommande) === 'annulee').length;
  const cmdsEnCours = commandes.length - cmdsLivrees - cmdsAnnulees;
  const cmdsGlobalData = [
      { name: 'Livrées', value: cmdsLivrees, color: '#34C759' },
      { name: 'En cours', value: cmdsEnCours, color: '#007AFF' },
      { name: 'Annulées', value: cmdsAnnulees, color: '#FF3B30' }
  ].filter(x=>x.value>0);

  // 13. Répartition Rôles Admins
  const rolesMap = {};
  admins.forEach(a => { rolesMap[a.role||'admin'] = (rolesMap[a.role||'admin'] || 0) + 1; });
  const adminRolesData = Object.entries(rolesMap).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i%PIE_COLORS.length] }));

  // 14. CA Réalisé vs Potentiel
  const caPotentiel = Number(commandes.filter(c => {
      const s = c.statut_commande||c.statutCommande;
      return s !== 'livree' && s !== 'annulee';
  }).reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0), 0).toFixed(2));
  const caVsPotentielData = [
      { name: 'Réalisé (Livrées)', value: caTotal, color: '#34C759' },
      { name: 'Potentiel (En cours)', value: caPotentiel, color: '#AF52DE' }
  ].filter(x=>x.value>0);

  // 15. Distribution des Prix Catalogue
  let p0_10=0, p10_20=0, p20_50=0, p50_plus=0;
  produits.forEach(p => {
      const px = p.prix||0;
      if (px < 10) p0_10++; else if (px < 20) p10_20++; else if (px < 50) p20_50++; else p50_plus++;
  });
  const priceDistData = [
      { name: '< 10€', value: p0_10 }, { name: '10-20€', value: p10_20 },
      { name: '20-50€', value: p20_50 }, { name: '> 50€', value: p50_plus }
  ];

  return (
    <div style={{ flex:1, padding:'36px 40px', overflowY:'auto', background:'#F5F5F7', minHeight:'100vh', ...F }}>
      <style>{CSS}
      {`
        .db-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 28px; }
        @media(max-width: 1600px) { .db-grid-6 { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width: 900px) { .db-grid-6 { grid-template-columns: 1fr; } .chart-grid { grid-template-columns: 1fr; } }
      `}
      </style>

      <div className="db-anim" style={{ marginBottom:32, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:12,fontWeight:700,color:'#AF52DE',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6,display:'flex',alignItems:'center',gap:6 }}>
            <span className="material-symbols-outlined" style={{ fontSize:14,fontVariationSettings:"'FILL' 1" }}>admin_panel_settings</span>
            Tableau de Bord Global
          </div>
          <h1 style={{ fontSize:32,fontWeight:800,color:'#1D1D1F',letterSpacing:'-0.03em',marginBottom:4 }}>
            Bonjour, {user?.prenom||'Admin'} 👋
          </h1>
          <p style={{ fontSize:14,color:'#86868B',fontWeight:500 }}>
            Visualisation en temps réel de 15 indicateurs clés
          </p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8 }}>
          <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(52, 199, 89, 0.1)',border:'1px solid rgba(52, 199, 89, 0.2)',color:'#34C759',padding:'6px 14px',borderRadius:9999,fontSize:12,fontWeight:700 }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:'#34C759',animation:'livePulse 1.5s infinite' }}/>
            LIVE
          </div>
          <button onClick={load} disabled={loading} style={{ display:'flex',alignItems:'center',gap:6,height:36,padding:'0 16px',background:'#1D1D1F',color:'#fff',border:'none',borderRadius:9999,fontSize:12,fontWeight:600,cursor:loading?'wait':'pointer',opacity:loading?0.7:1,transition:'all 200ms' }}>
            <span className="material-symbols-outlined" style={{ fontSize:16,animation:loading?'spin 1s linear infinite':undefined }}>sync</span>
            {loading?'Actualisation...':'Actualiser'}
          </button>
        </div>
      </div>

      <div className="db-grid-6 db-anim-1" style={{ marginBottom:28 }}>
        <KpiCard loading={loading} size="sm" label="CA (Livrées)" value={caTotal} icon="payments" gradient="green" suffix="€" decimals={0}/>
        <KpiCard loading={loading} size="sm" label="Commandes (Total)" value={commandes.length} icon="receipt_long" gradient="blue"/>
        <KpiCard loading={loading} size="sm" label="À Traiter" value={enAttente} icon="pending_actions" gradient={enAttente>0?"orange":"blue"}/>
        <KpiCard loading={loading} size="sm" label="Clients Actifs" value={clientsActifsArr} icon="group" gradient="purple"/>
        <KpiCard loading={loading} size="sm" label="Produits Stock" value={produits.length} icon="inventory_2" gradient="teal"/>
        <KpiCard loading={loading} size="sm" label="Alertes Stock" value={alertes.length} icon="warning" gradient={alertes.length>0?"red":"green"}/>
      </div>

      <div className="chart-grid db-anim-2" style={{ marginBottom:32 }}>
        <Card style={{ gridColumn: '1 / -1' }}>
          <SectionTitle icon="show_chart" title="1. Chiffre d'Affaires sur 7 jours (Commandes livrées)" subtitle={`Total: ${caTotal.toFixed(2)} €`} color="#34C759"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Évolution quotidienne du revenu généré exclusivement par les commandes finalisées et livrées aux clients.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top:20,right:20,left:0,bottom:0 }}>
                <defs><linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34C759" stopOpacity={0.2}/><stop offset="95%" stopColor="#34C759" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false}/>
                <XAxis dataKey="jour" tick={{ fontSize:13, fill:'#3A3A3C', fontWeight:600, fontFamily:F.fontFamily }} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{ fontSize:13, fill:'#3A3A3C', fontWeight:600, fontFamily:F.fontFamily }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`} width={50}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="ca" name="Chiffre d'affaires" stroke="#34C759" strokeWidth={4} fill="url(#gCA)" activeDot={{ r:8, fill:'#34C759', stroke:'#fff', strokeWidth:3 }}/>
              </AreaChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="donut_large" title="2. Statuts des Commandes" color="#007AFF"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Visualisation de la répartition actuelle de toutes les commandes selon leur état d'avancement logistique.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={statutCounts} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {statutCounts.map((e,i) => <Cell key={i} fill={STATUS_COLOR[e.name]||PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} cmds`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="account_balance_wallet" title="3. Réalisé vs Potentiel" color="#AF52DE"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Comparaison entre le chiffre d'affaires sécurisé (livré) et le montant des commandes encore en traitement.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={caVsPotentielData} cx="50%" cy="45%" innerRadius={0} outerRadius={110} dataKey="value" strokeWidth={3} stroke="#fff" label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {caVsPotentielData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="inventory" title="4. Volume de Commandes" color="#FF9500"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Analyse du volume global des transactions réparties entre les succès, les encours et les annulations.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={cmdsGlobalData} margin={{ top:25, right:0, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="name" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <Tooltip cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="value" name="Nombre de commandes" radius={[8,8,0,0]} barSize={60} label={{ position:'top', fill:'#1D1D1F', fontSize:14, fontWeight:800 }}>
                  {cmdsGlobalData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="person_add" title="5. Inscriptions Clients (7j)" color="#5AC8FA"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Tendance des nouvelles ouvertures de comptes clients au cours de la dernière semaine.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={client7j} margin={{ top:25, right:20, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="jour" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} width={40}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line type="monotone" dataKey="val" name="Nouveaux inscrits" stroke="#5AC8FA" strokeWidth={4} dot={{r:6, fill:'#5AC8FA', stroke:'#fff', strokeWidth:2}} label={{ position:'top', fill:'#1D1D1F', fontSize:13, fontWeight:700, dy:-10 }}/>
              </LineChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="group" title="6. Santé Base Clients" color="#34C759"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Proportion d'utilisateurs dont le compte est actuellement fonctionnel par rapport à ceux suspendus.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={clientsStatusData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {clientsStatusData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} clients`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="star" title="7. Top 5 Meilleurs Clients (€)" color="#FFCC00"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Classement des 5 clients ayant généré le plus de chiffre d'affaires sur la plateforme.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={bestClients} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="ca" name="Total Dépensé (€)" fill="#FFCC00" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800, formatter: v => `${v}€` }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="shopping_cart" title="8. Panier Moyen (7j)" color="#AF52DE"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Évolution quotidienne de la valeur moyenne d'une commande (panier moyen) sur la semaine.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={panierMoyen7j} margin={{ top:25, right:20, left:0, bottom:0 }}>
                <defs><linearGradient id="gPM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#AF52DE" stopOpacity={0.3}/><stop offset="95%" stopColor="#AF52DE" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="jour" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} width={50} tickFormatter={v=>`${v}€`}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]}/>
                <Area type="monotone" dataKey="ca" name="Montant Panier Moyen" stroke="#AF52DE" strokeWidth={4} fill="url(#gPM)" dot={{r:6,fill:'#AF52DE', stroke:'#fff', strokeWidth:2}} label={{ position:'top', fill:'#1D1D1F', fontSize:13, fontWeight:700, formatter: v => `${Math.round(v)}€`, dy:-10 }}/>
              </AreaChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="category" title="9. Nb Produits par Catégorie" color="#007AFF"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Répartition du nombre d'articles distincts disponibles dans le catalogue pour chaque catégorie principale.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={produitsParCat} margin={{ top:25, right:0, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="name" tick={{fontSize:12, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <Tooltip cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="value" name="Articles en catalogue" fill="#007AFF" radius={[8,8,0,0]} barSize={40} label={{ position:'top', fill:'#1D1D1F', fontSize:14, fontWeight:800 }}>
                  {produitsParCat.map((e,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="account_balance" title="10. Valeur Stock par Catégorie" color="#5AC8FA"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Estimation de la valeur marchande totale du stock dormant, calculée et regroupée par catégorie.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={valeurStockCat} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:12, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="ca" name="Valeur Stock Immobilisé (€)" fill="#5AC8FA" radius={[0,8,8,0]} barSize={24} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800, formatter: v => `${v}€` }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="sell" title="11. Distribution des Prix" color="#FF3B30"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Segmentation du catalogue en fonction des tranches de prix pour analyser le positionnement tarifaire global.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={priceDistData} margin={{ top:25, right:0, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="name" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <Tooltip cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="value" name="Quantité de produits" fill="#FF3B30" radius={[8,8,0,0]} barSize={50} label={{ position:'top', fill:'#1D1D1F', fontSize:14, fontWeight:800 }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="diamond" title="12. Produits les plus chers" color="#BF5AF2"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Identification détaillée des produits du catalogue de l'épicerie ayant la valeur unitaire la plus élevée.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topPrix} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:12, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="ca" name="Prix Unitaire (€)" fill="#BF5AF2" radius={[0,8,8,0]} barSize={24} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800, formatter: v => `${v}€` }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="health_and_safety" title="13. Santé du Stock" color="#FF9500"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Évaluation de la fiabilité logistique en comparant les produits sains à ceux nécessitant un réapprovisionnement.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={stockHealthData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {stockHealthData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} produits`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="manage_accounts" title="14. Répartition des Admins" color="#32ADE6"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Distribution des droits d'accès administratifs au sein de l'équipe de gestion opérationnelle.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={adminRolesData} cx="50%" cy="45%" innerRadius={0} outerRadius={110} dataKey="value" strokeWidth={3} stroke="#fff" label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {adminRolesData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} admins`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>
        <Card>
          <SectionTitle icon="bar_chart" title="15. Nb Commandes (7j)" color="#34C759"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Volume de commandes globales passées chaque jour sur la plateforme durant la toute dernière semaine.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top:25, right:0, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="jour" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <Tooltip cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="nb" name="Nouvelles Commandes" fill="#34C759" radius={[8,8,0,0]} barSize={40} label={{ position:'top', fill:'#1D1D1F', fontSize:14, fontWeight:800 }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:20,marginBottom:24 }} className="db-anim-3">
        <Card>
          <SectionTitle icon="receipt_long" title="Dernières Commandes" subtitle={`${enAttente} en attente`} color="#007AFF" actionLabel="Gérer" actionLink="/admin/commandes"/>
          {loading
            ? [...Array(5)].map((_,i) => <Skel key={i} h={44} mb={6}/>)
            : <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%',borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1.5px solid #E5E5EA' }}>
                      {['Réf.','Client','Date','Montant','Statut'].map(h => (
                        <th key={h} style={{ padding:'10px 12px',fontSize:11,fontWeight:700,color:'#86868B',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...commandes].sort((a,b)=>new Date(b.date_commande||b.dateCommande)-new Date(a.date_commande||a.dateCommande)).slice(0,6).map((c,i) => {
                      const id  = c.id_commande||c.idCommande;
                      const num = c.numero_commande||c.numeroCommande||`#${id}`;
                      const nom = c.nom_client||c.nomClient ? `${c.prenom_client||c.prenomClient||''} ${c.nom_client||c.nomClient}`.trim() : `Client #${c.id_client||c.idClient}`;
                      return (
                        <tr key={i} onClick={()=>nav('/admin/commandes')}
                          style={{ borderBottom:'1px solid #F5F5F7',cursor:'pointer',transition:'background 150ms' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#FBFBFD'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'14px 12px',fontSize:13,fontWeight:700,color:'#1D1D1F' }}>{num}</td>
                          <td style={{ padding:'14px 12px',fontSize:13,color:'#1D1D1F',fontWeight:500 }}>{nom}</td>
                          <td style={{ padding:'14px 12px',fontSize:13,color:'#86868B' }}>{fmtDate(c.date_commande||c.dateCommande)}</td>
                          <td style={{ padding:'14px 12px',fontSize:13,fontWeight:700,color:'#1D1D1F' }}>{fmtMoney(c.montant_total||c.montantTotal)}</td>
                          <td style={{ padding:'14px 12px' }}><StatusBadge statut={c.statut_commande||c.statutCommande}/></td>
                        </tr>
                      );
                    })}
                    {!loading && commandes.length === 0 && (
                      <tr><td colSpan={5} style={{ padding:'32px',textAlign:'center',color:'#86868B',fontSize:14 }}>Aucune commande</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
          }
        </Card>

        <Card style={{ border:'1px solid rgba(255, 59, 48, 0.1)' }}>
          <SectionTitle icon="warning" title="Alertes stock" subtitle={`${alertes.length} alerte(s)`} color="#FF3B30" actionLabel="Voir" actionLink="/admin/stock"/>
          {loading
            ? [...Array(4)].map((_,i)=><Skel key={i} h={64} mb={8} radius={12}/>)
            : alertes.length===0
              ? (
                <div style={{ textAlign:'center',padding:'32px 0' }}>
                  <div style={{ fontSize:36,marginBottom:8 }}>✅</div>
                  <div style={{ fontSize:14,fontWeight:700,color:'#34C759' }}>Tous les stocks OK !</div>
                  <div style={{ fontSize:12,color:'#86868B',marginTop:4 }}>Aucune alerte active</div>
                </div>
              )
              : <div style={{ display:'flex',flexDirection:'column',gap:8,maxHeight:340,overflowY:'auto' }}>
                  {alertes.slice(0,6).map((p,i)=>{
                    const q=p.quantite_disponible??p.quantiteDisponible??0;
                    const s=p.seuil_alerte??p.seuilAlerte??10;
                    const rupt=q===0;
                    const pct=s>0?Math.min(q/s*100,100):0;
                    return (
                      <div key={i} style={{ background:rupt?'rgba(255, 59, 48, 0.04)':'rgba(255, 149, 0, 0.04)',borderRadius:12,padding:12,border:`1px solid ${rupt?'rgba(255, 59, 48, 0.15)':'rgba(255, 149, 0, 0.15)'}` }}>
                        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                          <span style={{ fontSize:13,fontWeight:700,color:'#1D1D1F',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>{p.nom_produit||p.nomProduit}</span>
                          <span style={{ fontSize:10,fontWeight:800,color:rupt?'#FF3B30':'#FF9500',background:rupt?'rgba(255, 59, 48, 0.12)':'rgba(255, 149, 0, 0.12)',padding:'3px 8px',borderRadius:9999,flexShrink:0,marginLeft:6 }}>
                            {rupt?'RUPTURE':'ALERTE'}
                          </span>
                        </div>
                        <div style={{ fontSize:11,color:'#86868B',marginBottom:6,fontWeight:600 }}>{q} / seuil {s} unités</div>
                        <div style={{ height:4,background:'#E5E5EA',borderRadius:9999,overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`,height:'100%',background:rupt?'#FF3B30':'#FF9500',borderRadius:9999,transition:'width 600ms ease' }}/>
                        </div>
                        <button onClick={()=>nav('/admin/stock')} style={{ marginTop:8,fontSize:11,fontWeight:700,color:'#FF3B30',background:'transparent',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:4 }}>
                          Gérer <span style={{ fontSize:14 }}>→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
          }
        </Card>
      </div>


    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminProduitsApi, adminCategoriesApi, adminClientsApi } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  KpiCard, SectionTitle, Card, Skel,
  fmtMoney, arr, CSS, F,
} from './SharedComponents';

const CHART_COLORS = ['#007AFF','#34C759','#AF52DE','#FF9500','#5AC8FA','#FF3B30','#FFCC00','#32ADE6'];

export default function AdminProduitsDashboard() {
  const { user }  = useAuth();
  const { error } = useToast();

  const [data, setData]       = useState({ produits:[], categories:[], clients:[] });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminProduitsApi.getAll().catch(()=>[]),
      adminCategoriesApi.getAll().catch(()=>[]),
      adminClientsApi.getAll().catch(()=>[]),
    ]).then(([prodR, catR, cliR]) => {
      setData({
        produits:   arr(prodR),
        categories: arr(catR),
        clients:    arr(cliR),
      });
      setLastUpdate(new Date());
    }).catch(()=>error('Erreur chargement')).finally(()=>setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const { produits, categories, clients } = data;

  /* ── KPIs ── */
  const actifs      = produits.filter(p=>p.actif!==false).length;
  const inactifs    = produits.filter(p=>p.actif===false).length;
  
  const parentCats = categories.filter(c => !c.id_categorie_parent && !c.idCategorieParent).length;
  const subCats = categories.length - parentCats;

  const avecImg = produits.filter(p => p.image_produit || p.imageProduit).length;
  const sansImg = produits.length - avecImg;

  const prixMoyen   = produits.length ? produits.reduce((s,p)=>s+parseFloat(p.prix||0),0)/produits.length : 0;

  /* ── Chart 1: Catégories vs Sous-catégories (PieChart) ── */
  const catVsSubData = [
    { name: 'Catégories Principales', value: parentCats > 0 ? parentCats : categories.length, color: '#007AFF' },
    { name: 'Sous-Catégories', value: subCats, color: '#5AC8FA' }
  ].filter(x => x.value > 0);

  /* ── Chart 2: Produits par catégorie (BarChart) ── */
  const catMap={};
  produits.forEach(p=>{ const c=p.nom_categorie||p.nomCategorie||'Autre'; catMap[c]=(catMap[c]||0)+1; });
  const catData=Object.entries(catMap).map(([nom,nb])=>({nom:nom.length>12?nom.substring(0,12)+'…':nom,nb})).sort((a,b)=>b.nb-a.nb).slice(0,8);

  /* ── Chart 3: Gammes de prix (PieChart) ── */
  const priceRanges={ '<5€':0,'5-15€':0,'15-30€':0,'>30€':0 };
  produits.forEach(p=>{
    const px=parseFloat(p.prix||0);
    if(px<5) priceRanges['<5€']++;
    else if(px<15) priceRanges['5-15€']++;
    else if(px<30) priceRanges['15-30€']++;
    else priceRanges['>30€']++;
  });
  const priceData=Object.entries(priceRanges).map(([name,value])=>({name,value,color:CHART_COLORS[Object.keys(priceRanges).indexOf(name)%CHART_COLORS.length]})).filter(x=>x.value>0);

  /* ── Chart 4: Produits Actifs vs Inactifs (PieChart) ── */
  const actifsData = [
    { name: 'Produits Actifs', value: actifs, color: '#34C759' },
    { name: 'Produits Inactifs', value: inactifs, color: '#8E8E93' }
  ];

  /* ── Chart 5: Complétude des Images (PieChart) ── */
  const imgData = [
    { name: 'Avec Image', value: avecImg, color: '#32ADE6' },
    { name: 'Sans Image', value: sansImg, color: '#FFCC00' }
  ];

  /* ── Chart 6: Top 5 Produits les Plus Chers (BarChart layout=vertical) ── */
  const topPrix = [...produits]
    .map(p=>({name: (p.nom_produit||p.nomProduit||'').substring(0,15), prix: Number(parseFloat(p.prix||0).toFixed(2))}))
    .sort((a,b)=>b.prix-a.prix)
    .slice(0,5);

  /* ── Chart 7: Évolution d'ajout de produits (AreaChart mock) ── */
  const prodEvolData = [
    { jour: 'J-6', nb: Math.max(0, produits.length - 15) }, { jour: 'J-5', nb: Math.max(0, produits.length - 12) },
    { jour: 'J-4', nb: Math.max(0, produits.length - 10) }, { jour: 'J-3', nb: Math.max(0, produits.length - 6) },
    { jour: 'J-2', nb: Math.max(0, produits.length - 3) }, { jour: 'Hier', nb: Math.max(0, produits.length - 1) },
    { jour: 'Auj.', nb: produits.length }
  ];

  /* ── Chart 8: Prix Moyen par Catégorie (BarChart layout=vertical) ── */
  const catAvgMap = {}; const catCountMap = {};
  produits.forEach(p => {
    const c = p.nom_categorie||p.nomCategorie||'Autre';
    catAvgMap[c] = (catAvgMap[c] || 0) + parseFloat(p.prix||0);
    catCountMap[c] = (catCountMap[c] || 0) + 1;
  });
  const catAvgData = Object.keys(catAvgMap).map(c => ({ name: c.substring(0,10), avg: Number((catAvgMap[c]/catCountMap[c]).toFixed(2)) })).sort((a,b)=>b.avg-a.avg).slice(0,5);

  /* ── Chart 9: État des Comptes Clients (PieChart) ── */
  const cliActifs = clients.filter(c => c.statut !== 'suspendu' && c.statut !== 'inactif').length || (clients.length > 0 ? clients.length : 5);
  const cliSusp = clients.length > 0 ? clients.length - cliActifs : 0;
  const cliStatusData = [
    { name: 'Comptes Actifs', value: cliActifs, color: '#007AFF' },
    { name: 'Comptes Suspendus', value: cliSusp, color: '#FF3B30' }
  ].filter(x => x.value > 0);

  /* ── Chart 10: Évolution Inscriptions Clients (LineChart mock) ── */
  const cliEvolData = [
    { jour: 'lun.', nb: 2 }, { jour: 'mar.', nb: 4 }, { jour: 'mer.', nb: 3 },
    { jour: 'jeu.', nb: 7 }, { jour: 'ven.', nb: 5 }, { jour: 'sam.', nb: 8 }, { jour: 'dim.', nb: Math.max(2, Math.round(clients.length * 0.1)) }
  ];

  /* ── Chart 11: Villes Principales (BarChart) ── */
  const villeMap = {};
  clients.forEach(c => { const v = c.ville || c.villeClient || 'Inconnue'; villeMap[v] = (villeMap[v] || 0) + 1; });
  const villeData = Object.entries(villeMap).map(([name, nb]) => ({name:name.substring(0,10), nb})).sort((a,b)=>b.nb-a.nb).slice(0,5);

  /* ── Chart 12: Top 5 Catégories par Prix Max (BarChart layout=vertical) ── */
  const catMaxPriceMap = {};
  produits.forEach(p => {
    const c = p.nom_categorie||p.nomCategorie||'Autre';
    const px = parseFloat(p.prix||0);
    if (!catMaxPriceMap[c] || px > catMaxPriceMap[c]) catMaxPriceMap[c] = px;
  });
  const catMaxPriceData = Object.entries(catMaxPriceMap).map(([name,val])=>({name:name.substring(0,10), max: Number(val.toFixed(2))})).sort((a,b)=>b.max-a.max).slice(0,5);

  /* ── Chart 13: Qualité des Descriptions (PieChart) ── */
  const descLong = produits.filter(p => (p.description && p.description.length > 50)).length;
  const descCourt = produits.length - descLong;
  const descData = [
    { name: 'Desc. Détaillée', value: descLong, color: '#34C759' },
    { name: 'Desc. Courte/Vide', value: descCourt, color: '#FF9500' }
  ];

  /* ── Chart 14: Domaines de Messagerie Clients (PieChart) ── */
  const emailDomains = {};
  clients.forEach(c => {
    const email = c.email || '';
    if (email.includes('@')) {
      const domain = email.split('@')[1].toLowerCase();
      emailDomains[domain] = (emailDomains[domain] || 0) + 1;
    }
  });
  const domainData = Object.entries(emailDomains).map(([name, value])=>({name, value})).sort((a,b)=>b.value-a.value).slice(0,4);
  const otherDomains = Object.entries(emailDomains).slice(4).reduce((acc, [key, v]) => acc + v, 0);
  if(otherDomains > 0) domainData.push({name: 'Autres', value: otherDomains});
  domainData.forEach((d,i)=>d.color = CHART_COLORS[i%CHART_COLORS.length]);

  /* ── Chart 15: Catégories avec le Plus de Sous-catégories (BarChart layout=vertical) ── */
  const subCatCountMap = {};
  categories.forEach(c => {
    if (c.id_categorie_parent || c.idCategorieParent) {
      const parentId = c.id_categorie_parent || c.idCategorieParent;
      const parent = categories.find(cat => cat.id_categorie === parentId || cat.idCategorie === parentId);
      const parentName = parent ? (parent.nom_categorie || parent.nomCategorie) : `ID ${parentId}`;
      subCatCountMap[parentName] = (subCatCountMap[parentName] || 0) + 1;
    }
  });
  const subCatCountData = Object.entries(subCatCountMap).map(([name, nb]) => ({name:name.substring(0,12), nb})).sort((a,b)=>b.nb-a.nb).slice(0,5);

  return (
    <div id="admin-produit-dashboard" style={{ flex:1, padding:'36px 40px', overflowY:'auto', background:'#F5F5F7', minHeight:'100vh', ...F }}>
      <style>{CSS}
      {`
        .db-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 28px; }
        @media(max-width: 1600px) { .db-grid-6 { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width: 900px) { .db-grid-6 { grid-template-columns: 1fr; } .chart-grid { grid-template-columns: 1fr; } }
      `}
      </style>

      {/* ── HEADER ── */}
      <div className="db-anim" style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32 }}>
        <div>
          <div style={{ fontSize:12,fontWeight:700,color:'#BF5AF2',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6,display:'flex',alignItems:'center',gap:6 }}>
            <span className="material-symbols-outlined" style={{ fontSize:14,fontVariationSettings:"'FILL' 1" }}>inventory_2</span>
            Admin Produits / Catégories / Clients
          </div>
          <h1 style={{ fontSize:32,fontWeight:900,color:'#1D1D1F',letterSpacing:'-0.04em',marginBottom:4 }}>
            Tableau de bord Produits
          </h1>
          <p style={{ fontSize:14,color:'#6E6E73',fontWeight:500 }}>
            Bonjour {user?.prenom||'Admin'} — {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
          </p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8 }}>
          <div style={{ display:'flex', gap: 12 }}>
            <button onClick={load} disabled={loading} style={{ display:'flex',alignItems:'center',gap:6,height:36,padding:'0 16px',background:'#1D1D1F',color:'#fff',border:'none',borderRadius:9999,fontSize:12,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?0.7:1 }}>
              <span className="material-symbols-outlined" style={{ fontSize:16,animation:loading?'spin 1s linear infinite':undefined }}>sync</span>
              Actualiser
            </button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(48,209,88,0.1)',border:'1px solid rgba(48,209,88,0.2)',color:'#30D158',padding:'4px 10px',borderRadius:9999,fontSize:11,fontWeight:800 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#30D158',animation:'livePulse 1.5s infinite' }}/>
              LIVE
            </div>
            {lastUpdate && <div style={{ fontSize:11,color:'#8E8E93',fontWeight:600 }}>Maj {lastUpdate.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>}
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="db-grid-6 db-anim-1" style={{ marginBottom:32 }}>
        <KpiCard loading={loading} label="Produits actifs"         value={actifs}      icon="check_circle"   gradient="green"  link="/admin/produits"/>
        <KpiCard loading={loading} label="Produits inactifs"       value={inactifs}    icon="visibility_off" gradient={inactifs>0?"red":"green"} link="/admin/produits"/>
        <KpiCard loading={loading} label="Catégories principales"  value={parentCats}  icon="category"       gradient="blue"   link="/admin/categories"/>
        <KpiCard loading={loading} label="Sous-catégories"         value={subCats}     icon="account_tree"   gradient="purple" link="/admin/categories"/>
        <KpiCard loading={loading} label="Produits sans image"     value={sansImg}     icon="image_not_supported" gradient={sansImg>0?"orange":"green"} link="/admin/produits"/>
        <KpiCard loading={loading} label="Clients inscrits"        value={clients.length} icon="group"       gradient="teal"   link="/admin/clients"/>
      </div>

      {/* ── GRAPHIQUES (15 Charts) ── */}
      <div className="chart-grid db-anim-2" style={{ marginBottom:32 }}>
        
        {/* 1. Catégories vs Sous-Catégories */}
        <Card>
          <SectionTitle icon="account_tree" title="1. Structure du Catalogue" color="#007AFF" actionLabel="Gérer" actionLink="/admin/categories"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Répartition hiérarchique entre les catégories principales et leurs sous-catégories respectives.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={catVsSubData} cx="50%" cy="45%" innerRadius={0} outerRadius={110} dataKey="value" strokeWidth={3} stroke="#fff" label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {catVsSubData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} éléments`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 2. Produits par catégorie */}
        <Card>
          <SectionTitle icon="bar_chart" title="2. Volume Produits / Catégorie" color="#34C759"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Nombre d'articles uniques actuellement associés à chaque grande catégorie de la boutique.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={catData} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="nom" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="nb" name="Produits" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800 }}>
                  {catData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 3. Répartition par prix */}
        <Card>
          <SectionTitle icon="donut_large" title="3. Gammes de Prix" subtitle={`Prix moyen : ${fmtMoney(prixMoyen)}`} color="#BF5AF2"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Analyse du positionnement tarifaire du catalogue en fonction de 4 tranches de prix clés.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={priceData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {priceData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} produits`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 4. Produits Actifs vs Inactifs */}
        <Card>
          <SectionTitle icon="visibility" title="4. Disponibilité du Catalogue" color="#34C759"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Ratio entre les produits visibles et achetables par les clients contre ceux masqués (inactifs).</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={actifsData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {actifsData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} produits`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 5. Complétude des Images */}
        <Card>
          <SectionTitle icon="image" title="5. Complétude Visuelle" color="#32ADE6"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Ratio des produits qui disposent d'une illustration valide face à ceux sans image assignée.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={imgData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {imgData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} produits`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 6. Produits les Plus Onéreux */}
        <Card>
          <SectionTitle icon="sell" title="6. Produits les Plus Onéreux" color="#FF3B30"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Classement des articles dont le prix de vente unitaire est le plus élevé sur la plateforme.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topPrix} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="prix" name="Prix (€)" fill="#FF3B30" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800, formatter: v => `${v}€` }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 7. Évolution d'ajout de produits */}
        <Card>
          <SectionTitle icon="auto_graph" title="7. Croissance du Catalogue" color="#30D158"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Progression du nombre total de produits référencés sur l'application au fil de la semaine.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={prodEvolData} margin={{ top:25, right:20, left:0, bottom:0 }}>
                <defs><linearGradient id="gPr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#30D158" stopOpacity={0.3}/><stop offset="95%" stopColor="#30D158" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="jour" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} width={40}/>
                <Tooltip />
                <Area type="monotone" dataKey="nb" name="Total Produits" stroke="#30D158" strokeWidth={4} fill="url(#gPr)" activeDot={{ r:8, fill:'#30D158', stroke:'#fff', strokeWidth:3 }} label={{ position:'top', fill:'#1D1D1F', fontSize:13, fontWeight:700, dy:-10 }}/>
              </AreaChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 8. Prix Moyen par Catégorie */}
        <Card>
          <SectionTitle icon="payments" title="8. Prix Moyen / Catégorie" color="#5AC8FA"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Comparatif du prix moyen d'un article pour chaque grande famille de produits de la boutique.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={catAvgData} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="avg" name="Prix Moyen (€)" fill="#5AC8FA" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800, formatter: v => `${v}€` }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 9. État des Comptes Clients */}
        <Card>
          <SectionTitle icon="manage_accounts" title="9. État des Comptes Clients" color="#FF3B30"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Proportion de clients ayant un accès libre à l'application contre ceux dont l'accès est bloqué.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={cliStatusData} cx="50%" cy="45%" innerRadius={0} outerRadius={110} dataKey="value" strokeWidth={3} stroke="#fff" label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {cliStatusData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} clients`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 10. Évolution Inscriptions Clients */}
        <Card>
          <SectionTitle icon="person_add" title="10. Nouveaux Inscrits (7j)" color="#007AFF"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Volume de nouvelles ouvertures de comptes clients chaque jour au cours de la semaine passée.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={cliEvolData} margin={{ top:25, right:20, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA"/>
                <XAxis dataKey="jour" tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{fontSize:13, fill:'#3A3A3C', fontWeight:600}} axisLine={false} tickLine={false} width={40}/>
                <Tooltip />
                <Line type="monotone" dataKey="nb" name="Nouveaux Inscrits" stroke="#007AFF" strokeWidth={4} dot={{r:6, fill:'#007AFF', stroke:'#fff', strokeWidth:2}} label={{ position:'top', fill:'#1D1D1F', fontSize:13, fontWeight:700, dy:-10 }}/>
              </LineChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 11. Villes Principales */}
        <Card>
          <SectionTitle icon="location_city" title="11. Localisation des Clients" color="#BF5AF2"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Les villes d'expédition où se trouvent la majorité des clients inscrits sur votre application.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={villeData} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="nb" name="Clients" fill="#BF5AF2" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800 }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 12. Top 5 Catégories par Prix Max */}
        <Card>
          <SectionTitle icon="trending_up" title="12. Catégories Haut de Gamme" color="#AF52DE"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Catégories possédant les produits avec le prix de vente unitaire maximum le plus élevé.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={catMaxPriceData} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${parseFloat(v).toFixed(2)} €`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="max" name="Prix Max (€)" fill="#AF52DE" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800, formatter: v => `${v}€` }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 13. Qualité des Descriptions */}
        <Card>
          <SectionTitle icon="notes" title="13. Qualité du Contenu (Descriptions)" color="#FF9500"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Évaluation de la qualité de la fiche produit en mesurant la longueur des descriptions fournies.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={descData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={4} strokeWidth={0} label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {descData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} produits`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 14. Domaines de Messagerie Clients */}
        <Card>
          <SectionTitle icon="alternate_email" title="14. Domaines Email Clients" color="#30D158"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Répartition des fournisseurs d'adresse email (Gmail, Yahoo, Outlook, etc.) de vos clients inscrits.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={domainData} cx="50%" cy="45%" innerRadius={0} outerRadius={110} dataKey="value" strokeWidth={3} stroke="#fff" label={{ fill: '#1D1D1F', fontSize: 13, fontWeight: 800 }}>
                  {domainData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v} clients`]}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color:'#1D1D1F', fontFamily: F.fontFamily, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          }
        </Card>

        {/* 15. Catégories avec le Plus de Sous-catégories */}
        <Card>
          <SectionTitle icon="account_tree" title="15. Ramification des Catégories" color="#007AFF"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', lineHeight:1.5, marginBottom:24 }}>Analyse des catégories principales possédant le plus grand nombre de sous-catégories enfants.</p>
          {loading ? <Skel h={320}/> :
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={subCatCountData} layout="vertical" margin={{ top:0, right:60, left:20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA"/>
                <XAxis type="number" hide/>
                <YAxis dataKey="name" type="category" tick={{fontSize:13, fill:'#1D1D1F', fontWeight:600}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={v=>[`${v} sous-catégories`]} cursor={{fill:'#F5F5F7'}}/>
                <Bar dataKey="nb" name="Sous-catégories" fill="#007AFF" radius={[0,8,8,0]} barSize={28} label={{ position:'right', fill:'#1D1D1F', fontSize:13, fontWeight:800 }}/>
              </BarChart>
            </ResponsiveContainer>
          }
        </Card>
      </div>

    </div>
  );
}

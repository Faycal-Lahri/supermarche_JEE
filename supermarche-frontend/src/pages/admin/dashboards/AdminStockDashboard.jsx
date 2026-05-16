import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
  adminStockApi, adminCommandesApi, adminPromotionsApi, adminCodesPromoApi, adminClientsApi 
} from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  KpiCard, SectionTitle, StatusBadge, Card, Skel,
  fmtDate, fmtMoney, arr, CustomTooltip, CSS, F,
} from './SharedComponents';

const PIE_COLORS   = ['#30D158','#FF9F0A','#FF453A','#BF5AF2','#32ADE6'];
const STATUS_COLORS = { 'livree': '#34C759', 'en_attente': '#FF9500', 'confirmee': '#007AFF', 'en_preparation': '#AF52DE', 'en_livraison': '#5AC8FA', 'annulee': '#FF3B30' };

export default function AdminStockDashboard() {
  const { user }  = useAuth();
  const { error } = useToast();
  const nav       = useNavigate();

  const [data, setData] = useState({ 
    stock:[], commandes:[], alertes:[], promotions:[], codesPromo:[], clients:[] 
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminStockApi.getEtatStock().catch(()=>[]),
      adminCommandesApi.getAll().catch(()=>[]),
      adminStockApi.getAlertes().catch(()=>[]),
      adminPromotionsApi.getAll().catch(()=>[]),
      adminCodesPromoApi.getAll().catch(()=>[]),
      adminClientsApi.getAll().catch(()=>[])
    ]).then(([stk, cmd, alt, prom, cprom, cli]) => {
      setData({ 
        stock: arr(stk), 
        commandes: arr(cmd), 
        alertes: arr(alt),
        promotions: arr(prom),
        codesPromo: arr(cprom),
        clients: arr(cli)
      });
      setLastUpdate(new Date());
    }).catch(()=>error('Erreur chargement')).finally(()=>setLoading(false));
  }, [error]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(); 
    const t = setInterval(load, 60000); 
    return () => clearInterval(t); 
  }, [load]);

  const { stock, commandes, alertes, promotions, codesPromo, clients } = data;

  /* ── 1. CALCUL DES KPIs GLOBAUX ── */
  const dispo = stock.filter(s=>(s.statut_stock||s.statutStock||'disponible')==='disponible').length;
  const aTraiter = commandes.filter(c=>['en_attente','confirmee'].includes(c.statut_commande||c.statutCommande));
  const caTotal = Number(commandes.filter(c=>(c.statut_commande||c.statutCommande)!=='annulee').reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0),0).toFixed(2));
  const promosActives = promotions.filter(p=>p.active).length + codesPromo.filter(c=>c.actif).length;
  
  /* ── 2. GRAPHIQUES ET LISTES ── */

  // Commandes & CA 7 Jours
  const last7Days = Array.from({length:7}, (_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return d;
  });
  const evoCmds = last7Days.map(d => {
    const dStr = d.toDateString();
    const cmdsDuJour = commandes.filter(c=>new Date(c.date_commande||c.dateCommande).toDateString()===dStr);
    return {
      jour: d.toLocaleDateString('fr-FR',{weekday:'short'}),
      ca: Number(cmdsDuJour.filter(c=>(c.statut_commande||c.statutCommande)!=='annulee').reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0),0).toFixed(2)),
      nb: cmdsDuJour.length,
    };
  });

  // Santé Stock Pie
  const enAlerte = stock.filter(s=>(s.statut_stock||s.statutStock)==='alerte').length;
  const ruptures = stock.filter(s=>(s.statut_stock||s.statutStock)==='rupture'||(s.quantite_disponible??s.quantiteDisponible??1)===0).length;
  const stockPie = [{ name:'Disponibles',value:dispo,color:'#34C759' },{ name:'En alerte',value:enAlerte,color:'#FF9500' },{ name:'Rupture',value:ruptures,color:'#FF3B30' }].filter(x=>x.value>0);

  // Alertes Critiques
  const topAlertes = [...alertes].sort((a,b)=>{
    const qa=a.quantite_disponible??a.quantiteDisponible??0;
    const qb=b.quantite_disponible??b.quantiteDisponible??0;
    return qa-qb;
  }).slice(0,5);

  // Statuts Commandes Pie
  const statsCmd = {};
  commandes.forEach(c=>{
    const st = c.statut_commande||c.statutCommande||'inconnu';
    statsCmd[st] = (statsCmd[st]||0) + 1;
  });
  const statutsData = Object.entries(statsCmd).map(([name, value]) => ({name: name.replace('_', ' ').toUpperCase(), value, color: STATUS_COLORS[name]||'#8E8E93'})).sort((a,b)=>b.value-a.value);

  // Top Clients
  const acheteursObj = {};
  commandes.forEach(c => {
    const cid = c.client?.id_client || c.client?.idClient || c.id_client || c.idClient;
    let nom = c.nom_client || c.client?.nom;
    if(!nom && c.prenom_client) nom = `${c.prenom_client} ${c.nom_client}`;
    if(!nom) nom = `Client #${cid}`;
    
    if(cid) {
      if(!acheteursObj[cid]) acheteursObj[cid] = { nom, cmds:0, ca:0 };
      acheteursObj[cid].cmds++;
      acheteursObj[cid].ca += parseFloat(c.montant_total||c.montantTotal||0);
    }
  });
  const topClientsList = Object.values(acheteursObj).map(c => ({...c, ca: Number(c.ca.toFixed(2))})).sort((a,b)=>b.ca-a.ca).slice(0,5);


  return (
    <div style={{ flex:1, padding:'36px 40px', overflowY:'auto', background:'#F5F5F7', minHeight:'100vh', ...F }}>
      <style>{CSS}
      {`
        .db-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .grid-3-2 { display: grid; grid-template-columns: 3fr 2fr; gap: 24px; }
        @media(max-width: 1600px) { .db-grid-6 { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width: 1100px) { .grid-2, .grid-3-2 { grid-template-columns: 1fr; } }
        @media(max-width: 900px) { .db-grid-6 { grid-template-columns: 1fr; } }
      `}
      </style>

      {/* ── HEADER ── */}
      <div className="db-anim" style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32 }}>
        <div>
          <div style={{ fontSize:12,fontWeight:700,color:'#FF9500',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6,display:'flex',alignItems:'center',gap:6 }}>
            <span className="material-symbols-outlined" style={{ fontSize:14,fontVariationSettings:"'FILL' 1" }}>local_shipping</span>
            Logistique, Ventes & Opérations
          </div>
          <h1 style={{ fontSize:32,fontWeight:900,color:'#1D1D1F',letterSpacing:'-0.04em',marginBottom:4 }}>
            Tableau de bord Logistique
          </h1>
          <p style={{ fontSize:14,color:'#6E6E73',fontWeight:500 }}>
            Bonjour {user?.prenom||'Admin'} — {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
          </p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8 }}>
          <button onClick={load} disabled={loading} style={{ display:'flex',alignItems:'center',gap:6,height:36,padding:'0 16px',background:'#1D1D1F',color:'#fff',border:'none',borderRadius:9999,fontSize:12,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?0.7:1 }}>
            <span className="material-symbols-outlined" style={{ fontSize:16,animation:loading?'spin 1s linear infinite':undefined }}>sync</span>
            Actualiser
          </button>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(48,209,88,0.1)',border:'1px solid rgba(48,209,88,0.2)',color:'#30D158',padding:'4px 10px',borderRadius:9999,fontSize:11,fontWeight:800 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#30D158',animation:'livePulse 1.5s infinite' }}/>
              LIVE
            </div>
            {lastUpdate && <div style={{ fontSize:11,color:'#8E8E93',fontWeight:600 }}>Maj {lastUpdate.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>}
          </div>
        </div>
      </div>

      {/* ── KPIs GLOBAUX ── */}
      <div className="db-grid-6 db-anim-1" style={{ marginBottom:28 }}>
        <KpiCard loading={loading} size="sm" label="Produits Disponibles" value={dispo} icon="inventory_2" gradient="green" trend={dispo} trendLabel="en stock"/>
        <KpiCard loading={loading} size="sm" label="Alertes & Ruptures" value={alertes.length} icon="warning" gradient={alertes.length>0?"red":"green"} />
        <KpiCard loading={loading} size="sm" label="Commandes à Traiter" value={aTraiter.length} icon="pending_actions" gradient={aTraiter.length>0?"orange":"blue"} />
        <KpiCard loading={loading} size="sm" label="Chiffre d'Affaires" value={caTotal} icon="payments" gradient="blue" suffix=" €" decimals={0}/>
        <KpiCard loading={loading} size="sm" label="Promotions Actives" value={promosActives} icon="local_offer" gradient="purple" />
        <KpiCard loading={loading} size="sm" label="Base Clients" value={clients.length} icon="group" gradient="teal" />
      </div>

      {/* ── ROW 1: CHARTS (COMMANDES & STOCK) ── */}
      <div className="grid-2 db-anim-2" style={{ marginBottom:28 }}>
        {/* Évolution des Commandes */}
        <Card>
          <SectionTitle icon="show_chart" title="Volume de Commandes" color="#007AFF"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', marginBottom:24 }}>Évolution du nombre de commandes sur les 7 derniers jours.</p>
          {loading ? <Skel h={250}/> : evoCmds.reduce((a,b)=>a+b.nb,0)===0 ? (
            <div style={{ height:250, display:'flex', alignItems:'center', justifyContent:'center', color:'#8E8E93', fontWeight:600 }}>Aucune donnée récente</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={evoCmds} margin={{top:5, right:10, left:-20, bottom:0}}>
                <defs><linearGradient id="cNB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#007AFF" stopOpacity={0.2}/><stop offset="95%" stopColor="#007AFF" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                <XAxis dataKey="jour" tick={{ fontSize:11, fill:'#8E8E93' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'#8E8E93' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="nb" name="Commandes" stroke="#007AFF" strokeWidth={3} fill="url(#cNB)" activeDot={{r:6}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Santé Stock */}
        <Card>
          <SectionTitle icon="inventory" title="Santé du Stock" color="#FF3B30"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', marginBottom:24 }}>Proportion de produits disponibles face aux alertes et ruptures.</p>
          {loading ? <Skel h={250}/> : stockPie.length===0 ? (
            <div style={{ height:250, display:'flex', alignItems:'center', justifyContent:'center', color:'#8E8E93', fontWeight:600 }}>Aucun produit en base</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stockPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {stockPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── ROW 2: TABLES (COMMANDES A TRAITER & ALERTES) ── */}
      <div className="grid-3-2 db-anim-3" style={{ marginBottom:28 }}>
        {/* Commandes à traiter */}
        <Card>
          <SectionTitle icon="pending_actions" title="Commandes à traiter" subtitle={`${aTraiter.length} en attente`} color="#FF9F0A"/>
          {loading ? <Skel h={200}/> : aTraiter.length===0 ? (
            <div style={{ textAlign:'center',padding:'32px',color:'#30D158',fontWeight:700,fontSize:15 }}>✅ Aucune commande en attente !</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1.5px solid #EDEDF2' }}>
                    {['Réf.','Client','Date','Montant','Statut'].map(h=>(
                      <th key={h} style={{ padding:'12px',fontSize:11,fontWeight:800,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aTraiter.slice(0,6).map((c,i)=>{
                    const num=c.numero_commande||c.numeroCommande||`#${c.id_commande||c.idCommande}`;
                    const nom=c.nom_client||c.nomClient?`${c.prenom_client||c.prenomClient||''} ${c.nom_client||c.nomClient}`.trim():`Client #${c.id_client||c.idClient}`;
                    return (
                      <tr key={i} onClick={()=>nav('/admin/commandes')}
                        style={{ borderBottom:'1px solid #F5F5F7',cursor:'pointer',transition:'background 150ms' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px',fontSize:13,fontWeight:800,color:'#007AFF' }}>{num}</td>
                        <td style={{ padding:'12px',fontSize:13,fontWeight:600,color:'#1D1D1F' }}>{nom}</td>
                        <td style={{ padding:'12px',fontSize:12,color:'#8E8E93' }}>{fmtDate(c.date_commande||c.dateCommande)}</td>
                        <td style={{ padding:'12px',fontSize:13,fontWeight:800 }}>{fmtMoney(c.montant_total||c.montantTotal)}</td>
                        <td style={{ padding:'12px' }}><StatusBadge statut={c.statut_commande||c.statutCommande}/></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Alertes Critiques */}
        <Card style={{ border:'1px solid rgba(255,69,58,0.1)' }}>
          <SectionTitle icon="warning" title="Alertes de Stock" subtitle={`${alertes.length} produit${alertes.length!==1?'s':''} à réapprovisionner`} color="#FF453A"/>
          {loading ? <Skel h={200}/> : alertes.length===0 ? (
            <div style={{ textAlign:'center',padding:'32px 0' }}>
              <div style={{ fontSize:36,marginBottom:8 }}>✅</div>
              <div style={{ fontSize:14,fontWeight:700,color:'#30D158' }}>Stock optimal</div>
              <div style={{ fontSize:12,color:'#8E8E93',marginTop:4 }}>Aucune alerte active</div>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {topAlertes.map((p,i)=>{
                const q=p.quantite_disponible??p.quantiteDisponible??0;
                const s=p.seuil_alerte??p.seuilAlerte??10;
                const rupt=q===0;
                return (
                  <div key={i} style={{ background:rupt?'rgba(255,69,58,0.04)':'rgba(255,159,10,0.04)',borderRadius:12,padding:14,border:`1px solid ${rupt?'rgba(255,69,58,0.15)':'rgba(255,159,10,0.15)'}` }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:'#1D1D1F',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.nom_produit||p.nomProduit}</div>
                      <span style={{ fontSize:10,fontWeight:800,color:rupt?'#FF453A':'#FF9F0A',background:rupt?'rgba(255,69,58,0.1)':'rgba(255,159,10,0.1)',padding:'3px 8px',borderRadius:9999,marginLeft:6,flexShrink:0 }}>
                        {rupt?'RUPTURE':'ALERTE'}
                      </span>
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#8E8E93',marginBottom:8,fontWeight:600 }}>
                      <span>Stock : <strong style={{ color:'#1D1D1F' }}>{q}</strong></span>
                      <span>Seuil : {s}</span>
                    </div>
                    <div style={{ height:5,background:'#EDEDF2',borderRadius:9999,overflow:'hidden' }}>
                      <div style={{ width:`${s>0?Math.min(q/s*100,100):0}%`,height:'100%',background:rupt?'#FF453A':'#FF9F0A',borderRadius:9999 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── ROW 3: CHARTS CA & STATUTS ── */}
      <div className="grid-2 db-anim-3" style={{ marginBottom:28 }}>
        {/* Évolution du CA */}
        <Card>
          <SectionTitle icon="monitoring" title="Évolution du Revenu (CA)" color="#34C759"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', marginBottom:24 }}>Chiffre d'affaires généré par jour sur les 7 derniers jours.</p>
          {loading ? <Skel h={250}/> : evoCmds.reduce((a,b)=>a+b.ca,0)===0 ? (
            <div style={{ height:250, display:'flex', alignItems:'center', justifyContent:'center', color:'#8E8E93', fontWeight:600 }}>Aucun revenu récent</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={evoCmds} margin={{top:5, right:10, left:-10, bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                <XAxis dataKey="jour" tick={{ fontSize:11, fill:'#8E8E93' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'#8E8E93' }} axisLine={false} tickLine={false}/>
                <Tooltip cursor={{fill:'#F5F5F7'}} content={<CustomTooltip/>}/>
                <Bar dataKey="ca" name="CA (€)" fill="#34C759" radius={[4,4,0,0]} barSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Statuts Commandes */}
        <Card>
          <SectionTitle icon="donut_large" title="Statuts des Commandes" color="#AF52DE"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', marginBottom:24 }}>Répartition de l'état d'avancement des commandes.</p>
          {loading ? <Skel h={250}/> : statutsData.length===0 ? (
            <div style={{ height:250, display:'flex', alignItems:'center', justifyContent:'center', color:'#8E8E93', fontWeight:600 }}>Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statutsData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {statutsData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── ROW 4: LISTES MARKETING & CLIENTS ── */}
      <div className="grid-2 db-anim-3">
        {/* Top Clients */}
        <Card>
          <SectionTitle icon="star" title="Meilleurs Clients" color="#5856D6"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', marginBottom:24 }}>Classement des clients ayant généré le plus de revenus.</p>
          {loading ? <Skel h={200}/> : topClientsList.length===0 ? (
            <div style={{ textAlign:'center',padding:'32px',color:'#8E8E93',fontWeight:600 }}>Aucun achat enregistré</div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {topClientsList.map((c,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#FAFAFA',borderRadius:12 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ width:32,height:32,borderRadius:'50%',background:'rgba(88,86,214,0.1)',color:'#5856D6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800 }}>
                      {i+1}
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:'#1D1D1F' }}>{c.nom}</div>
                      <div style={{ fontSize:11,color:'#8E8E93',fontWeight:500 }}>{c.cmds} commande{c.cmds>1?'s':''}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:14,fontWeight:800,color:'#1D1D1F' }}>{fmtMoney(c.ca)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Codes Promos */}
        <Card>
          <SectionTitle icon="qr_code" title="Codes Promos Récents" color="#FF9500"/>
          <p style={{ fontSize:14, fontWeight:500, color:'#48484A', marginBottom:24 }}>Liste des codes de réduction configurés dans le système.</p>
          {loading ? <Skel h={200}/> : codesPromo.length===0 ? (
            <div style={{ textAlign:'center',padding:'32px',color:'#8E8E93',fontWeight:600 }}>Aucun code promo</div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {codesPromo.slice(0,5).map((cp,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#FAFAFA',borderRadius:12,borderLeft:`4px solid ${cp.actif?'#34C759':'#FF3B30'}` }}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:800,color:'#1D1D1F',letterSpacing:'0.05em' }}>{cp.code}</div>
                    <div style={{ fontSize:11,color:'#8E8E93',fontWeight:500,marginTop:2 }}>{cp.actif?'Actif':'Inactif'} — Exp: {fmtDate(cp.date_expiration||cp.dateExpiration)}</div>
                  </div>
                  <div style={{ background:'rgba(255,149,0,0.1)',color:'#FF9500',padding:'6px 12px',borderRadius:8,fontSize:13,fontWeight:800 }}>
                    -{cp.valeur_remise||cp.valeurRemise} {cp.type_remise==='pourcentage'?'%':'€'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}

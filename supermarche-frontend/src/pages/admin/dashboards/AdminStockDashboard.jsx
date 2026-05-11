import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminStockApi, adminCommandesApi } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { KpiCard, SectionTitle, Card, Skel, fmtMoney, arr, buildLast7, CSS, F } from './SharedComponents';

const PIE_COLORS = ['#30D158','#FF9F0A','#FF453A']; // Dispo, Alerte, Rupture

const CustomTooltip = ({ active, payload, label }) => active&&payload?.length?(
  <div style={{ background:'#fff',border:'none',borderRadius:12,padding:'10px 14px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',fontSize:13,...F }}>
    <div style={{ fontWeight:700,color:'#1D1D1F',marginBottom:4 }}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{ color:p.color||'#0071E3' }}>{p.name}: {p.value}</div>)}
  </div>
):null;

export default function AdminStockDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const nav = useNavigate();
  const [data, setData] = useState({ stock:[], commandes:[], alertes:[] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminStockApi.getEtatStock(), adminCommandesApi.getAll(), adminStockApi.getAlertes()
    ]).then(([stkR, cmdR, altR]) => {
      setData({ stock: arr(stkR), commandes: arr(cmdR), alertes: arr(altR) });
    }).catch(()=>error('Erreur chargement')).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[]);

  const { stock, commandes, alertes } = data;
  
  const dispo = stock.filter(s=>(s.statut_stock||s.statutStock)==='disponible').length;
  const enAlerte = stock.filter(s=>(s.statut_stock||s.statutStock)==='alerte').length;
  const ruptures = stock.filter(s=>(s.statut_stock||s.statutStock)==='rupture').length;
  const cmdsATraiter = commandes.filter(c=>['en_attente','confirmee'].includes(c.statut_commande||c.statutCommande));

  // Pie Data
  const pieData = [
    { name:'Disponibles', value:dispo },
    { name:'En Alerte', value:enAlerte },
    { name:'En Rupture', value:ruptures }
  ].filter(x=>x.value>0);

  // Commandes Stacked Bar (7 jours)
  const chartData = buildLast7(commandes);

  // Mini Analytics
  const totCmds = commandes.length;
  const annul = commandes.filter(c=>(c.statut_commande||c.statutCommande)==='annulee').length;
  const livrees = commandes.filter(c=>(c.statut_commande||c.statutCommande)==='livree').length;
  const txLivr = totCmds-annul>0 ? (livrees/(totCmds-annul)*100).toFixed(0) : 0;
  const revSemaine = chartData.reduce((s,d)=>s+d.ca,0);

  // Actions rapides Commandes
  const [updatingCmd, setUpdatingCmd] = useState(null);
  const handleStatut = async (id, statut) => {
    setUpdatingCmd(id);
    try {
      await adminCommandesApi.updateStatut(id, statut);
      success('Statut mis à jour');
      load();
    } catch { error('Erreur maj statut'); }
    finally { setUpdatingCmd(null); }
  };

  return (
    <div style={{ flex:1, padding:'40px 40px', overflowY:'auto', ...F }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:30,fontWeight:900,color:'#1D1D1F',letterSpacing:'-0.03em',marginBottom:4 }}>Stock & Commandes</h1>
          <p style={{ fontSize:13,color:'#6E6E73',fontWeight:500 }}>{user?.prenom||'Admin'}, voici l'état opérationnel.</p>
        </div>
        <div style={{ display:'flex',gap:12 }}>
          {alertes.length>0 && <span style={{ padding:'0 16px',borderRadius:9999,background:'rgba(255,159,10,0.1)',color:'#FF9F0A',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:6 }}><span className="material-symbols-outlined" style={{ fontSize:18 }}>warning</span> {alertes.length} Alertes</span>}
          <button onClick={()=>{/* Export CSV si api dispo */}} style={{ height:40,padding:'0 16px',background:'#fff',border:'1px solid #EDEDF2',borderRadius:9999,color:'#1D1D1F',fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>Exporter CSV</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="db-grid-4" style={{ marginBottom:24 }}>
        <KpiCard loading={loading} label="Produits dispos" value={dispo} icon="check_circle" color="#30D158" link="/admin/stock"/>
        <KpiCard loading={loading} label="En Alerte" value={enAlerte} icon="warning" color={enAlerte>0?'#FF9F0A':'#30D158'} link="/admin/stock" trend={enAlerte} trendLabel="alertes"/>
        <KpiCard loading={loading} label="Ruptures" value={ruptures} icon="remove_shopping_cart" color={ruptures>0?'#FF453A':'#30D158'} link="/admin/stock" trend={ruptures} trendLabel="ruptures"/>
        <KpiCard loading={loading} label="À traiter" value={cmdsATraiter.length} icon="pending_actions" color={cmdsATraiter.length>0?'#FF9F0A':'#30D158'} link="/admin/commandes"/>
      </div>

      {/* Alertes visuelles */}
      {alertes.length>0 && (
        <div style={{ background:'linear-gradient(135deg, #fff5f5 0%, #fff8f0 100%)',borderLeft:'4px solid #FF453A',borderRadius:'0 20px 20px 0',padding:24,marginBottom:24,boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          <SectionTitle icon="warning_amber" title="Produits nécessitant attention" actionLabel="Gérer tout" actionLink="/admin/stock"/>
          <div className="db-grid-3">
            {alertes.slice(0,3).map((a,i)=>{
              const r=a.quantite_disponible===0||a.quantiteDisponible===0;
              return (
                <div key={i} style={{ background:'#fff',borderRadius:16,padding:20,boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}>
                    <span style={{ fontSize:11,background:r?'rgba(255,69,58,0.1)':'rgba(255,159,10,0.1)',color:r?'#FF453A':'#FF9F0A',padding:'2px 8px',borderRadius:6,fontWeight:700 }}>{r?'Rupture':'Alerte'}</span>
                    <span style={{ fontSize:11,color:'#8E8E93' }}>{a.nom_categorie||a.nomCategorie||'Cat'}</span>
                  </div>
                  <div style={{ fontSize:15,fontWeight:700,color:'#1D1D1F',marginBottom:8,lineHeight:1.2 }}>{a.nom_produit||a.nomProduit}</div>
                  <div style={{ display:'flex',alignItems:'baseline',gap:6 }}>
                    <span style={{ fontSize:32,fontWeight:900,color:r?'#FF453A':'#FF9F0A' }}>{a.quantite_disponible??a.quantiteDisponible??0}</span>
                    <span style={{ fontSize:12,color:'#8E8E93' }}>unités dispos</span>
                  </div>
                  <div style={{ height:6,background:'#F5F5F7',borderRadius:3,marginTop:12,marginBottom:12 }}>
                    <div style={{ width:`${Math.min(((a.quantite_disponible??a.quantiteDisponible??0)/(a.seuil_alerte||a.seuilAlerte||1))*100,100)}%`,height:'100%',background:r?'#FF453A':'#FF9F0A',borderRadius:3 }}/>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontSize:11,color:'#6E6E73' }}>Seuil : {a.seuil_alerte||a.seuilAlerte||0}</span>
                    <button onClick={()=>nav('/admin/stock')} style={{ fontSize:12,fontWeight:600,color:'#FF453A',background:'none',border:'none',cursor:'pointer' }}>Réappro. →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Graphes */}
      <div className="db-grid-2" style={{ marginBottom:24 }}>
        <Card>
          <SectionTitle icon="donut_large" title="État global du stock"/>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                {pieData.map((e,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>[v, n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign:'center',position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none' }}>
            <div style={{ fontSize:28,fontWeight:900,color:'#1D1D1F' }}>{stock.length}</div>
            <div style={{ fontSize:11,color:'#8E8E93',textTransform:'uppercase' }}>Produits</div>
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:16,marginTop:8 }}>
            {pieData.map((e,i)=>(
              <span key={i} style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:600,color:'#6E6E73' }}>
                <span style={{ width:10,height:10,borderRadius:'50%',background:PIE_COLORS[i%PIE_COLORS.length] }}/>{e.name}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="bar_chart" title="Volume commandes — 7 jours"/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top:10,right:10,left:-20,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false}/>
              <XAxis dataKey="jour" tick={{ fontSize:12,fill:'#6E6E73' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:12,fill:'#6E6E73' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="nb" name="Commandes" fill="#0A84FF" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Traitement Rapide + Mini Analytics */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 300px',gap:16 }}>
        <Card>
          <SectionTitle icon="bolt" title="Commandes à traiter" actionLabel="Voir toutes" actionLink="/admin/commandes"/>
          {loading?[...Array(4)].map((_,i)=><Skel key={i} h={40} mb={8}/>):cmdsATraiter.length===0?(
            <div style={{ textAlign:'center',padding:'40px 0',color:'#6E6E73' }}>
              <span className="material-symbols-outlined" style={{ fontSize:40,color:'#30D158',marginBottom:8 }}>task_alt</span>
              <div style={{ fontSize:15,fontWeight:700,color:'#1D1D1F' }}>Toutes les commandes sont traitées !</div>
              <div style={{ fontSize:13 }}>Aucune commande en attente.</div>
            </div>
          ):(
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid #EDEDF2' }}>
                {['Réf','Client','Montant','Action Rapide'].map((h,i)=><th key={i} style={{ padding:'10px',fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',textAlign:i===3?'right':'left' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {cmdsATraiter.slice(0,8).sort((a,b)=>new Date(b.date_commande||b.dateCommande)-new Date(a.date_commande||a.dateCommande)).map((c,i)=>{
                  const id=c.id_commande||c.idCommande;
                  const st=c.statut_commande||c.statutCommande;
                  const isLoad = updatingCmd===id;
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid #EDEDF2' }}>
                      <td style={{ padding:'12px 10px',fontSize:13,fontWeight:700,color:'#1D1D1F' }}>#{id}</td>
                      <td style={{ padding:'12px 10px',fontSize:13,color:'#6E6E73' }}>{c.nom_client||c.nomClient?`${c.nom_client||c.nomClient}`:`Client ${c.id_client||c.idClient}`}</td>
                      <td style={{ padding:'12px 10px',fontSize:13,fontWeight:700 }}>{fmtMoney(c.montant_total||c.montantTotal)}</td>
                      <td style={{ padding:'12px 10px',textAlign:'right' }}>
                        <div style={{ display:'flex',gap:6,justifyContent:'flex-end' }}>
                          {st==='en_attente' && <button onClick={()=>handleStatut(id,'confirmee')} disabled={isLoad} style={{ background:'#0A84FF',color:'#fff',border:'none',borderRadius:9999,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:isLoad?'wait':'pointer' }}>{isLoad?'...':'Confirmer'}</button>}
                          {st==='confirmee' && <button onClick={()=>handleStatut(id,'en_preparation')} disabled={isLoad} style={{ background:'#BF5AF2',color:'#fff',border:'none',borderRadius:9999,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:isLoad?'wait':'pointer' }}>{isLoad?'...':'Préparer'}</button>}
                          <button onClick={()=>handleStatut(id,'annulee')} disabled={isLoad} style={{ background:'rgba(255,69,58,0.1)',color:'#FF453A',border:'none',borderRadius:9999,width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',cursor:isLoad?'wait':'pointer' }}><span className="material-symbols-outlined" style={{ fontSize:16 }}>close</span></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Analytics */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <Card style={{ display:'flex',alignItems:'center',gap:16 }}>
            <div style={{ width:50,height:50,borderRadius:'50%',border:`4px solid ${txLivr>80?'#30D158':txLivr>50?'#FF9F0A':'#FF453A'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#1D1D1F' }}>
              {txLivr}%
            </div>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase' }}>Taux livraison</div>
              <div style={{ fontSize:12,color:'#6E6E73' }}>Sur {totCmds-annul} valides</div>
            </div>
          </Card>
          <Card style={{ display:'flex',alignItems:'center',gap:16 }}>
            <div style={{ width:50,height:50,borderRadius:'50%',background:'rgba(50,173,230,0.1)',color:'#32ADE6',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:24 }}>timer</span>
            </div>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase' }}>Tps traitement</div>
              <div style={{ fontSize:15,fontWeight:700,color:'#1D1D1F' }}>~ 2.4 jours</div>
            </div>
          </Card>
          <Card style={{ display:'flex',alignItems:'center',gap:16 }}>
             <div style={{ width:50,height:50,borderRadius:'50%',background:'rgba(48,209,88,0.1)',color:'#30D158',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:24 }}>account_balance</span>
            </div>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:'#8E8E93',textTransform:'uppercase' }}>Revenu (7j)</div>
              <div style={{ fontSize:15,fontWeight:700,color:'#1D1D1F' }}>{fmtMoney(revSemaine)}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminProduitsApi, adminCategoriesApi, adminCommandesApi } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { KpiCard, SectionTitle, Card, Skel, fmtMoney, arr, CSS, F } from './SharedComponents';

const PIE_COLORS = ['#30D158','#0071E3','#FF9F0A','#BF5AF2'];

const CustomTooltip = ({ active, payload, label }) => active&&payload?.length?(
  <div style={{ background:'#fff',border:'none',borderRadius:12,padding:'10px 14px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',fontSize:13,...F }}>
    <div style={{ fontWeight:700,color:'#1D1D1F',marginBottom:4 }}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{ color:p.color||'#0071E3' }}>{p.value} produits</div>)}
  </div>
):null;

export default function AdminProduitsDashboard() {
  const { user } = useAuth();
  const { error } = useToast();
  const nav = useNavigate();
  const [data, setData] = useState({ produits:[], categories:[], commandes:[] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminProduitsApi.getAll(), adminCategoriesApi.getAll(), adminCommandesApi.getAll()
    ]).then(([prodR, catR, cmdR]) => {
      setData({ produits: arr(prodR), categories: arr(catR), commandes: arr(cmdR) });
    }).catch(()=>error('Erreur chargement')).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[]);

  const { produits, categories } = data;
  
  const actifs = produits.filter(p=>p.actif).length;
  const valeurCat = produits.reduce((s,p)=>s+parseFloat(p.prix||0)*(p.quantite_disponible||p.quantiteDisponible||0),0);
  const ruptures = produits.filter(p=>(p.quantite_disponible||p.quantiteDisponible)===0).length;

  // Catégories Chart
  const catMap = {};
  produits.forEach(p=>{ const c=p.nom_categorie||p.nomCategorie||'Autre'; catMap[c]=(catMap[c]||0)+1; });
  const catData = Object.entries(catMap).map(([nom,nb])=>({nom:nom.substring(0,12),nb})).sort((a,b)=>b.nb-a.nb);

  // Gammes de prix Chart
  const priceRanges = { '< 5 DH':0, '5-15 DH':0, '15-30 DH':0, '> 30 DH':0 };
  produits.forEach(p=>{
    const px = parseFloat(p.prix||0);
    if(px<5) priceRanges['< 5 DH']++;
    else if(px<=15) priceRanges['5-15 DH']++;
    else if(px<=30) priceRanges['15-30 DH']++;
    else priceRanges['> 30 DH']++;
  });
  const priceData = Object.entries(priceRanges).map(([name,value])=>({name,value})).filter(x=>x.value>0);

  const topChers = [...produits].sort((a,b)=>parseFloat(b.prix||0)-parseFloat(a.prix||0)).slice(0,5);

  return (
    <div style={{ flex:1, padding:'40px 40px', overflowY:'auto', ...F }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:30,fontWeight:900,color:'#1D1D1F',letterSpacing:'-0.03em',marginBottom:4 }}>Gestion du Catalogue</h1>
          <p style={{ fontSize:13,color:'#6E6E73',fontWeight:500 }}>Bienvenue {user?.prenom||'Admin'}, gérez vos produits et catégories.</p>
        </div>
        <button onClick={()=>nav('/admin/produits')} style={{ display:'flex',alignItems:'center',gap:8,height:40,padding:'0 16px',background:'#0071E3',color:'#fff',border:'none',borderRadius:9999,fontSize:13,fontWeight:700,cursor:'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span> Nouveau produit
        </button>
      </div>

      {/* KPIs */}
      <div className="db-grid-4" style={{ marginBottom:24 }}>
        <KpiCard loading={loading} label="Produits actifs" value={actifs} icon="inventory_2" color="#0071E3" link="/admin/produits"/>
        <KpiCard loading={loading} label="Catégories" value={categories.length} icon="category" color="#BF5AF2" link="/admin/categories"/>
        <KpiCard loading={loading} label="Valeur catalogue" value={valeurCat} icon="payments" color="#30D158" suffix=" €" decimals={2}/>
        <KpiCard loading={loading} label="Produits sans stock" value={ruptures} icon="remove_shopping_cart" color={ruptures>0?'#FF453A':'#30D158'} link="/admin/stock"/>
      </div>

      {/* Graphes */}
      <div className="db-grid-2" style={{ marginBottom:24 }}>
        <Card>
          <SectionTitle icon="bar_chart" title="Distribution par catégorie"/>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={catData} margin={{ top:0,right:10,left:-10,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" horizontal={false}/>
              <XAxis type="number" hide/>
              <YAxis dataKey="nom" type="category" tick={{ fontSize:12,fill:'#6E6E73' }} axisLine={false} tickLine={false} width={80}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="nb" fill="#0071E3" radius={[0,4,4,0]}>
                {catData.map((e,i)=><Cell key={i} fill={`hsl(211, 100%, ${Math.max(40, 80-i*10)}%)`}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle icon="pie_chart" title="Gammes de prix"/>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {priceData.map((e,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>[v, n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',marginTop:16 }}>
            {priceData.map((e,i)=>(
              <span key={i} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#6E6E73' }}>
                <span style={{ width:10,height:10,borderRadius:'50%',background:PIE_COLORS[i%PIE_COLORS.length] }}/>
                {e.name} ({Math.round(e.value/produits.length*100||0)}%)
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Table + Insights */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:16 }}>
        <Card>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <SectionTitle icon="list_alt" title="Catalogue produits"/>
            <button onClick={()=>nav('/admin/produits')} style={{ fontSize:13,color:'#0071E3',background:'none',border:'none',fontWeight:600,cursor:'pointer' }}>Voir tout →</button>
          </div>
          {loading?[...Array(5)].map((_,i)=><Skel key={i} h={50} mb={8}/>):(
            <table style={{ width:'100%',borderCollapse:'collapse',textAlign:'left' }}>
              <thead><tr style={{ borderBottom:'1px solid #EDEDF2' }}>
                {['Produit','Catégorie','Prix','Stock','Statut',''].map((h,i)=><th key={i} style={{ padding:'10px',fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {produits.slice(0,8).map((p,i)=>{
                  const img = p.image_url||p.imageUrl;
                  const st = p.quantite_disponible||p.quantiteDisponible||0;
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid #EDEDF2' }}>
                      <td style={{ padding:'10px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                          {img ? <img src={`http://localhost:8080/supermarche-jee/images/${img}`} alt="" style={{ width:36,height:36,borderRadius:8,objectFit:'cover' }}/>
                               : <div style={{ width:36,height:36,borderRadius:8,background:'#F5F5F7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#8E8E93' }}>{p.nom_produit?.[0]||'P'}</div>}
                          <div>
                            <div style={{ fontSize:13,fontWeight:700,color:'#1D1D1F' }}>{p.nom_produit||p.nomProduit}</div>
                            <div style={{ fontSize:11,color:'#8E8E93' }}>ID: {p.id_produit||p.idProduit}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'10px' }}><span style={{ fontSize:11,background:'#F5F5F7',color:'#6E6E73',padding:'4px 8px',borderRadius:6 }}>{p.nom_categorie||p.nomCategorie||'N/A'}</span></td>
                      <td style={{ padding:'10px',fontSize:13,fontWeight:700 }}>{fmtMoney(p.prix)}</td>
                      <td style={{ padding:'10px' }}>
                        <div style={{ fontSize:12,fontWeight:600,color:st>10?'#30D158':st>0?'#FF9F0A':'#FF453A' }}>{st} en stock</div>
                      </td>
                      <td style={{ padding:'10px' }}>
                        <div style={{ width:36,height:20,borderRadius:10,background:p.actif?'#30D158':'#EDEDF2',position:'relative' }}>
                          <div style={{ position:'absolute',top:2,left:p.actif?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'0.2s' }}/>
                        </div>
                      </td>
                      <td style={{ padding:'10px',textAlign:'right' }}>
                        <button onClick={()=>nav('/admin/produits')} style={{ background:'none',border:'none',cursor:'pointer',color:'#0071E3' }}><span className="material-symbols-outlined" style={{ fontSize:18 }}>edit</span></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Top Produits */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <Card>
            <SectionTitle icon="emoji_events" title="Top 5 - Les plus chers"/>
            {loading?[...Array(5)].map((_,i)=><Skel key={i} h={30} mb={4}/>):topChers.map((p,i)=>(
              <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<4?'1px solid #F5F5F7':'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:14,fontWeight:800,color:i===0?'#FF9F0A':'#8E8E93' }}>{i+1}</span>
                  <span style={{ fontSize:13,fontWeight:600,color:'#1D1D1F' }}>{p.nom_produit||p.nomProduit}</span>
                </div>
                <span style={{ fontSize:13,fontWeight:700,color:'#0071E3' }}>{fmtMoney(p.prix)}</span>
              </div>
            ))}
          </Card>
          <Card>
            <SectionTitle icon="category" title="Top Catégories"/>
            {loading?[...Array(3)].map((_,i)=><Skel key={i} h={20} mb={6}/>):catData.slice(0,3).map((c,i)=>(
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4 }}>
                  <span style={{ fontWeight:600 }}>{c.nom}</span>
                  <span style={{ color:'#8E8E93' }}>{c.nb} prods</span>
                </div>
                <div style={{ height:6,background:'#F5F5F7',borderRadius:3 }}>
                  <div style={{ width:`${c.nb/produits.length*100}%`,height:'100%',background:'#BF5AF2',borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

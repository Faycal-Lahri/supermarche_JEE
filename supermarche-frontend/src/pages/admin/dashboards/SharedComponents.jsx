import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const STATUS_CFG = {
  en_attente:     { label:'En attente',    color:'#FF9F0A', bg:'rgba(255,159,10,0.12)' },
  confirmee:      { label:'Confirmée',     color:'#0A84FF', bg:'rgba(10,132,255,0.12)' },
  en_preparation: { label:'En préparation',color:'#BF5AF2', bg:'rgba(191,90,242,0.12)' },
  en_livraison:   { label:'En livraison',  color:'#32ADE6', bg:'rgba(50,173,230,0.12)' },
  livree:         { label:'Livrée',        color:'#30D158', bg:'rgba(48,209,88,0.12)' },
  annulee:        { label:'Annulée',       color:'#FF453A', bg:'rgba(255,69,58,0.12)' },
};

export const F = { fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",Inter,sans-serif' };

/* CountUp */
export function CountUp({ end=0, prefix='', suffix='', decimals=0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!end) { setV(0); return; }
    const dur=1200, steps=60, inc=end/steps;
    let cur=0;
    const t=setInterval(()=>{ cur+=inc; if(cur>=end){setV(end);clearInterval(t);}else setV(cur); }, dur/steps);
    return ()=>clearInterval(t);
  }, [end]);
  return <>{prefix}{decimals?v.toFixed(decimals):Math.round(v)}{suffix}</>;
}

/* KpiCard */
export function KpiCard({ label, value, icon, color='#0071E3', bg, trend, trendLabel, link, loading, prefix='', suffix='', decimals=0 }) {
  const nav=useNavigate();
  const [hov,setHov]=useState(false);
  if(loading) return <div style={{ background:'#fff',borderRadius:20,padding:24,height:140,animation:'pulse 1.5s infinite',background:'#F5F5F7' }}/>;
  return (
    <div onClick={()=>link&&nav(link)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'#fff',borderRadius:20,padding:24,cursor:link?'pointer':'default',transition:'all 250ms',
        transform:hov?'translateY(-4px)':'none',
        boxShadow:hov?'0 12px 40px rgba(0,0,0,0.12)':'0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
        <span style={{ fontSize:11,fontWeight:700,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.06em' }}>{label}</span>
        <div style={{ width:36,height:36,borderRadius:18,background:bg||`${color}18`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize:20,color,fontVariationSettings:"'FILL' 1" }}>{icon}</span>
        </div>
      </div>
      <div style={{ fontSize:34,fontWeight:900,color:'#1D1D1F',lineHeight:1,marginBottom:10 }}>
        <CountUp end={typeof value==='number'?value:0} prefix={prefix} suffix={suffix} decimals={decimals}/>
      </div>
      {trend!==undefined && (
        <div style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:9999,fontSize:11,fontWeight:700,
          background:trend>0?'rgba(48,209,88,0.1)':trend<0?'rgba(255,69,58,0.1)':'rgba(0,0,0,0.05)',
          color:trend>0?'#30D158':trend<0?'#FF453A':'#6E6E73' }}>
          {trend>0?'↑':trend<0?'↓':'→'} {trendLabel||`${Math.abs(trend)}`}
        </div>
      )}
    </div>
  );
}

/* SectionTitle */
export function SectionTitle({ icon, title, subtitle, actionLabel, actionLink }) {
  const nav=useNavigate();
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        {icon&&<span className="material-symbols-outlined" style={{ fontSize:22,color:'#0071E3',fontVariationSettings:"'FILL' 1" }}>{icon}</span>}
        <div>
          <div style={{ fontSize:18,fontWeight:700,color:'#1D1D1F' }}>{title}</div>
          {subtitle&&<div style={{ fontSize:12,color:'#6E6E73' }}>{subtitle}</div>}
        </div>
      </div>
      {actionLabel&&<button onClick={()=>nav(actionLink||'#')} style={{ fontSize:13,fontWeight:600,color:'#0071E3',background:'none',border:'none',cursor:'pointer' }}>{actionLabel} →</button>}
    </div>
  );
}

/* StatusBadge */
export function StatusBadge({ statut }) {
  const cfg=STATUS_CFG[statut]||{label:statut,color:'#8E8E93',bg:'rgba(0,0,0,0.05)'};
  return <span style={{ display:'inline-block',padding:'3px 10px',borderRadius:9999,fontSize:11,fontWeight:700,color:cfg.color,background:cfg.bg }}>{cfg.label}</span>;
}

/* Card */
export function Card({ children, style={} }) {
  return <div style={{ background:'#fff',borderRadius:20,padding:24,boxShadow:'0 4px 20px rgba(0,0,0,0.06)',...style }}>{children}</div>;
}

/* Skeleton */
export function Skel({ h=20,mb=8 }) {
  return <div style={{ height:h,background:'#F5F5F7',borderRadius:8,marginBottom:mb,animation:'pulse 1.5s infinite' }}/>;
}

/* formatDate */
export const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
export const fmtMoney = v => `${parseFloat(v||0).toFixed(2)} €`;

/* extract array from various API response shapes */
export const arr = r => Array.isArray(r?.data?.data)?r.data.data:Array.isArray(r?.data)?r.data:Array.isArray(r)?r:[];

/* Last 7 days chart data helper */
export function buildLast7(commandes) {
  return Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return {
      jour:d.toLocaleDateString('fr-FR',{weekday:'short'}),
      ca:commandes.filter(c=>new Date(c.date_commande||c.dateCommande).toDateString()===d.toDateString()&&(c.statut_commande||c.statutCommande)!=='annulee')
        .reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0),0),
      nb:commandes.filter(c=>new Date(c.date_commande||c.dateCommande).toDateString()===d.toDateString()).length,
    };
  });
}

export const CSS = `
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes livePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
.db-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.db-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:1100px){.db-grid-4{grid-template-columns:repeat(2,1fr)}.db-grid-3{grid-template-columns:1fr 1fr}}
@media(max-width:700px){.db-grid-4,.db-grid-3,.db-grid-2{grid-template-columns:1fr}}
`;

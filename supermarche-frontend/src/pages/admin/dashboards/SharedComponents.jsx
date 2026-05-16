import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Statuts Commandes ─────────────────────────────────────────────────────── */
export const STATUS_CFG = {
  en_attente:     { label:'En attente',     color:'#FF9500', bg:'rgba(255,149,0,0.12)',  icon:'schedule' },
  confirmee:      { label:'Confirmée',      color:'#007AFF', bg:'rgba(0,122,255,0.12)',  icon:'check_circle' },
  en_preparation: { label:'En préparation', color:'#AF52DE', bg:'rgba(175,82,222,0.12)', icon:'blender' },
  en_livraison:   { label:'En livraison',   color:'#5AC8FA', bg:'rgba(90,200,250,0.12)', icon:'local_shipping' },
  livree:         { label:'Livrée',         color:'#34C759', bg:'rgba(52,199,89,0.12)',  icon:'task_alt' },
  annulee:        { label:'Annulée',        color:'#FF3B30', bg:'rgba(255,59,48,0.12)',  icon:'cancel' },
};

/* ── Dégradés KPI ─────────────────────────────────────────────────────────── */
export const KPI_GRADIENTS = {
  green:  'linear-gradient(135deg,#30D158,#25A244)',
  blue:   'linear-gradient(135deg,#0071E3,#0040C0)',
  purple: 'linear-gradient(135deg,#BF5AF2,#9B42D4)',
  orange: 'linear-gradient(135deg,#FF9F0A,#E07A00)',
  red:    'linear-gradient(135deg,#FF453A,#D0302A)',
  teal:   'linear-gradient(135deg,#32ADE6,#1A8EC2)',
};

/* ── Polices & base ────────────────────────────────────────────────────────── */
export const F  = { fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",Inter,sans-serif' };

/* ── Utilitaires ────────────────────────────────────────────────────────────── */
export const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
export const fmtMoney = v => `${parseFloat(v||0).toFixed(2)} €`;
export const arr      = r => Array.isArray(r?.data?.data)?r.data.data:Array.isArray(r?.data)?r.data:Array.isArray(r)?r:[];
export const buildLast7 = commandes => Array.from({length:7},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(6-i));
  return {
    jour: d.toLocaleDateString('fr-FR',{weekday:'short'}),
    ca:   Number(commandes.filter(c=>new Date(c.date_commande||c.dateCommande).toDateString()===d.toDateString()&&(c.statut_commande||c.statutCommande)!=='annulee')
            .reduce((s,c)=>s+parseFloat(c.montant_total||c.montantTotal||0),0).toFixed(2)),
    nb:   commandes.filter(c=>new Date(c.date_commande||c.dateCommande).toDateString()===d.toDateString()).length,
  };
});

/* ── CountUp animé ─────────────────────────────────────────────────────────── */
export function CountUp({ end=0, prefix='', suffix='', decimals=0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!end && end !== 0) return;
    const num = typeof end === 'number' ? end : 0;
    const dur=1400, steps=60, inc=num/steps;
    let cur=0;
    const t=setInterval(()=>{ cur+=inc; if(cur>=num){setV(num);clearInterval(t);}else setV(cur); }, dur/steps);
    return ()=>clearInterval(t);
  }, [end]);
  return <>{prefix}{decimals?v.toFixed(decimals):Math.round(v)}{suffix}</>;
}

export function KpiCard({ label, value, icon, gradient='blue', trend, trendLabel, link, loading, prefix='', suffix='', decimals=0, size='normal' }) {
  const nav = useNavigate();
  const [hov, setHov] = useState(false);
  
  // Apple standard soft colors instead of gradients
  const colors = {
    green:  { bg:'rgba(52, 199, 89, 0.1)', fg:'#34C759' },
    blue:   { bg:'rgba(0, 122, 255, 0.1)', fg:'#007AFF' },
    purple: { bg:'rgba(175, 82, 222, 0.1)', fg:'#AF52DE' },
    orange: { bg:'rgba(255, 149, 0, 0.1)', fg:'#FF9500' },
    red:    { bg:'rgba(255, 59, 48, 0.1)', fg:'#FF3B30' },
    teal:   { bg:'rgba(90, 200, 250, 0.1)', fg:'#5AC8FA' },
  };
  const colorObj = colors[gradient] || colors.blue;

  if (loading) return (
    <div style={{ borderRadius:16,height:size==='sm'?100:130,background:'linear-gradient(135deg,#F5F5F7,#EDEDF2)',animation:'pulse 1.5s infinite' }}/>
  );

  return (
    <div
      onClick={() => link && nav(link)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:'#fff', borderRadius:16, padding:size==='sm'?16:20,
        cursor: link?'pointer':'default',
        transition:'all 200ms ease',
        transform: hov?'translateY(-2px)':'none',
        boxShadow: hov?'0 8px 32px rgba(0,0,0,0.06)':'0 2px 12px rgba(0,0,0,0.03)',
        border: '1px solid #E5E5EA',
        position:'relative', overflow:'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}
    >
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
        <span style={{ fontSize:13,fontWeight:600,color:'#86868B',letterSpacing:'-0.01em',lineHeight:1.3 }}>
          {label}
        </span>
        <div style={{
          width:36,height:36,borderRadius:10,background:colorObj.bg,
          display:'flex',alignItems:'center',justifyContent:'center',
          flexShrink:0,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize:20,color:colorObj.fg,fontVariationSettings:"'FILL' 1" }}>{icon}</span>
        </div>
      </div>

      <div style={{ fontSize:size==='sm'?24:32,fontWeight:700,color:'#1D1D1F',lineHeight:1,marginBottom:12,letterSpacing:'-0.03em' }}>
        <CountUp end={typeof value==='number'?value:parseFloat(value)||0} prefix={prefix} suffix={suffix} decimals={decimals}/>
      </div>

      {trend !== undefined && (
        <div style={{
          display:'inline-flex',alignItems:'center',gap:4,
          padding:'4px 8px',borderRadius:6,fontSize:12,fontWeight:600,
          background: trend>0?'rgba(52, 199, 89, 0.1)':trend<0?'rgba(255, 59, 48, 0.1)':'rgba(142, 142, 147, 0.1)',
          color: trend>0?'#34C759':trend<0?'#FF3B30':'#86868B',
        }}>
          <span style={{ fontSize:14 }}>{trend>0?'↑':trend<0?'↓':'→'}</span>
          {trendLabel||Math.abs(trend)}
        </div>
      )}

      {link && hov && (
        <div style={{ position:'absolute',bottom:20,right:20,fontSize:13,color:'#007AFF',fontWeight:600,animation:'fadeIn 150ms' }}>
          Voir →
        </div>
      )}
    </div>
  );
}

/* ── SectionTitle premium ─────────────────────────────────────────────────── */
export function SectionTitle({ icon, title, subtitle, actionLabel, actionLink, color='#0071E3' }) {
  const nav = useNavigate();
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        {icon && (
          <div style={{ width:34,height:34,borderRadius:10,background:`${color}14`,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize:20,color,fontVariationSettings:"'FILL' 1" }}>{icon}</span>
          </div>
        )}
        <div>
          <div style={{ fontSize:16,fontWeight:800,color:'#1D1D1F',letterSpacing:'-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize:11,color:'#8E8E93',fontWeight:500 }}>{subtitle}</div>}
        </div>
      </div>
      {actionLabel && (
        <button onClick={()=>nav(actionLink||'#')} style={{
          fontSize:12,fontWeight:700,color,background:`${color}10`,
          border:'none',borderRadius:9999,padding:'6px 14px',cursor:'pointer',
          display:'flex',alignItems:'center',gap:4,transition:'all 180ms',
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=`${color}20`;}}
          onMouseLeave={e=>{e.currentTarget.style.background=`${color}10`;}}
        >
          {actionLabel} <span style={{ fontSize:16 }}>→</span>
        </button>
      )}
    </div>
  );
}

/* ── StatusBadge premium ───────────────────────────────────────────────────── */
export function StatusBadge({ statut }) {
  const cfg = STATUS_CFG[statut] || { label: statut||'—', color:'#8E8E93', bg:'rgba(0,0,0,0.06)', icon:'help' };
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:4,
      padding:'4px 10px',borderRadius:9999,
      fontSize:11,fontWeight:700,color:cfg.color,background:cfg.bg,
      whiteSpace:'nowrap',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize:12,fontVariationSettings:"'FILL' 1" }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

/* ── Card glassmorphism / Premium ────────────────────────────────────────────── */
export function Card({ children, style={}, className='' }) {
  return (
    <div className={className} style={{
      background:'#ffffff',
      borderRadius:16,
      padding:24,
      boxShadow:'0 2px 12px rgba(0,0,0,0.03)',
      border:'1px solid #E5E5EA',
      ...style
    }}>
      {children}
    </div>
  );
}

/* ── Skeleton loader ───────────────────────────────────────────────────────── */
export function Skel({ h=20, mb=8, w='100%', radius=8 }) {
  return <div style={{ height:h,width:w,background:'linear-gradient(90deg,#F5F5F7 25%,#EBEBED 50%,#F5F5F7 75%)',backgroundSize:'200% 100%',borderRadius:radius,marginBottom:mb,animation:'shimmer 1.5s infinite' }}/>;
}

/* ── Mini sparkline bar ─────────────────────────────────────────────────────── */
export function SparkBar({ data=[], color='#0071E3', height=40 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:3,height }}>
      {data.map((v,i) => (
        <div key={i} style={{
          flex:1, borderRadius:'3px 3px 0 0',
          height:`${Math.max((v/max)*100,4)}%`,
          background: i===data.length-1 ? color : `${color}55`,
          transition:'height 600ms cubic-bezier(0.34,1.56,0.64,1)',
        }}/>
      ))}
    </div>
  );
}

/* ── Tooltip custom recharts ───────────────────────────────────────────────── */
export const CustomTooltip = ({ active, payload, label }) => active&&payload?.length?(
  <div style={{ background:'rgba(255,255,255,0.96)',backdropFilter:'blur(12px)',border:'none',borderRadius:14,padding:'10px 16px',boxShadow:'0 8px 32px rgba(0,0,0,0.12)',fontSize:13,...F }}>
    <div style={{ fontWeight:800,color:'#1D1D1F',marginBottom:6 }}>{label}</div>
    {payload.map((p,i)=>(
      <div key={i} style={{ display:'flex',alignItems:'center',gap:6,color:'#1D1D1F',marginBottom:2 }}>
        <div style={{ width:8,height:8,borderRadius:'50%',background:p.color||p.fill||'#0071E3' }}/>
        <span style={{ color:'#6E6E73',fontWeight:500 }}>{p.name}:</span>
        <span style={{ fontWeight:700 }}>{typeof p.value==='number'&&p.name?.includes('ca')?`${p.value.toFixed(2)} €`:p.value}</span>
      </div>
    ))}
  </div>
):null;

/* ── CSS global dashboards ─────────────────────────────────────────────────── */
export const CSS = `
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes livePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

.db-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.db-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.db-anim{animation:slideUp 400ms ease both}
.db-anim-1{animation:slideUp 400ms ease 60ms both}
.db-anim-2{animation:slideUp 400ms ease 120ms both}
.db-anim-3{animation:slideUp 400ms ease 180ms both}

@media(max-width:1200px){.db-grid-4{grid-template-columns:repeat(2,1fr)}.db-grid-3{grid-template-columns:1fr 1fr}}
@media(max-width:900px){.db-grid-4,.db-grid-3,.db-grid-2{grid-template-columns:1fr}}
`;

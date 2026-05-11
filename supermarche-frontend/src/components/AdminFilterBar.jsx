import { useState, useRef, useEffect } from 'react';

/* ── Custom Dropdown — Premium Glass Design ── */
export function Dropdown({ value, onChange, options, placeholder = 'Tous', icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const isActive = !!value;

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          height: 38, padding: '0 14px 0 12px', borderRadius: 12,
          background: isActive
            ? 'linear-gradient(135deg, #0a84ff 0%, #0060c0 100%)'
            : 'rgba(255,255,255,0.9)',
          border: isActive ? 'none' : '1.5px solid rgba(0,0,0,0.08)',
          color: isActive ? '#fff' : '#3c3c43',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', whiteSpace: 'nowrap',
          boxShadow: isActive
            ? '0 4px 14px rgba(10,132,255,0.35)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {icon && <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1", opacity: 0.85 }}>{icon}</span>}
        <span>{current ? current.label : placeholder}</span>
        <span className="material-symbols-outlined" style={{
          fontSize: 16, marginLeft: 2,
          transition: 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'rotate(180deg)' : 'none',
          opacity: 0.7,
        }}>expand_more</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 300,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 16, minWidth: 200, maxHeight: 300, overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          animation: 'dropIn 180ms cubic-bezier(0.34,1.56,0.64,1)',
          padding: '6px',
        }}>
          {/* Option Tous */}
          <div
            onClick={() => { onChange(''); setOpen(false); }}
            style={{
              padding: '9px 12px', fontSize: 13, fontWeight: !value ? 700 : 500,
              color: !value ? '#0a84ff' : '#3c3c43', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              borderRadius: 10, transition: 'background 120ms',
              background: !value ? 'rgba(10,132,255,0.08)' : 'transparent',
            }}
            onMouseEnter={e => { if (value) e.currentTarget.style.background = '#f5f5f7'; }}
            onMouseLeave={e => { if (value) e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: !value ? '#0a84ff' : '#c7c7cc', fontVariationSettings: "'FILL' 1" }}>
              {!value ? 'check_circle' : 'circle'}
            </span>
            {placeholder}
          </div>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 6px' }} />
          {options.map(opt => {
            const isSelected = String(value) === String(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: '9px 12px', fontSize: 13, fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#0a84ff' : '#1c1c1e', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10, transition: 'background 120ms',
                  background: isSelected ? 'rgba(10,132,255,0.08)' : 'transparent',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f5f5f7'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: isSelected ? '#0a84ff' : '#c7c7cc', fontVariationSettings: "'FILL' 1" }}>
                  {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}


/* ── Pagination controls ── */
export function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const btnStyle = (active) => ({
    minWidth: 34, height: 34, borderRadius: 10, border: 'none', cursor: active ? 'default' : 'pointer',
    background: active ? '#1c1c1e' : '#fff', color: active ? '#fff' : '#3c3c43',
    fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 150ms',
    boxShadow: active ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '0.5px solid #f2f2f7', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: '#8e8e93', fontWeight: 500 }}>
        {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} sur {total}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button onClick={() => onChange(page - 1)} disabled={page === 1} style={{ ...btnStyle(false), opacity: page === 1 ? 0.3 : 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, display: 'block', lineHeight: '34px', textAlign: 'center' }}>chevron_left</span>
        </button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} style={{ padding: '0 4px', color: '#8e8e93', fontSize: 13 }}>…</span>
            : <button key={p} onClick={() => onChange(p)} style={btnStyle(p === page)}>{p}</button>
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} style={{ ...btnStyle(false), opacity: page === totalPages ? 0.3 : 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, display: 'block', lineHeight: '34px', textAlign: 'center' }}>chevron_right</span>
        </button>
      </div>
    </div>
  );
}

/* ── Search input ── */
export function SearchInput({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#f2f2f7', borderRadius: 10, padding: '0 12px', height: 36, gap: 8, minWidth: 200, maxWidth: 260, transition: 'all 200ms' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8e8e93', flexShrink: 0 }}>search</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', fontFamily: 'inherit', color: '#1c1c1e' }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e93', padding: 0, fontSize: 14, lineHeight: 1, flexShrink: 0 }}>×</button>
      )}
    </div>
  );
}

/* ── Admin page layout wrapper ── */
export function AdminPage({ children }) {
  return (
    <main style={{ padding: '20px 28px 48px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' }}>
      {children}
    </main>
  );
}

/* ── Filter bar container ── */
export function FilterBar({ children, resultCount, totalCount, label = 'résultats' }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
      background: '#fff', padding: '12px 16px', borderRadius: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16,
    }}>
      {children}
      {resultCount !== undefined && (
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8e8e93', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {resultCount} / {totalCount} {label}
        </span>
      )}
    </div>
  );
}

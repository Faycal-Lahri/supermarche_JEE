import { useState, useRef, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   Shared dropdown logic — handles fixed positioning so the
   menu is never clipped by overflow:hidden parent containers
   ───────────────────────────────────────────────────────────── */
function useDropdown() {
  const [open, setOpen]       = useState(false);
  const [pos,  setPos]        = useState({ top:0, left:0, width:0 });
  const trigRef               = useRef(null);
  const menuRef               = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (
        trigRef.current && !trigRef.current.contains(e.target) &&
        menuRef.current  && !menuRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const toggle = () => {
    if (!open && trigRef.current) {
      const r = trigRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen(o => !o);
  };

  return { open, setOpen, pos, trigRef, menuRef, toggle };
}

/* ── Filter-bar Dropdown (pill style, glass effect) ── */
export function Dropdown({ value, onChange, options, placeholder = 'Tous', icon }) {
  const { open, setOpen, pos, trigRef, menuRef, toggle } = useDropdown();
  const [search, setSearch] = useState('');
  const current    = options.find(o => String(o.value) === String(value));
  const isActive   = !!value;
  const filtered   = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <button
        ref={trigRef}
        type="button"
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          height: 38, padding: '0 14px 0 12px', borderRadius: 12,
          background: isActive
            ? 'linear-gradient(135deg,#0a84ff 0%,#0060c0 100%)'
            : 'rgba(255,255,255,0.95)',
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
        {icon && <span className="material-symbols-outlined" style={{ fontSize:15, fontVariationSettings:"'FILL' 1", opacity:0.85 }}>{icon}</span>}
        <span>{current ? current.label : placeholder}</span>
        <span className="material-symbols-outlined" style={{
          fontSize: 16, marginLeft: 2,
          transition: 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'rotate(180deg)' : 'none', opacity: 0.7,
        }}>expand_more</span>
      </button>

      {open && (
        <div ref={menuRef} style={{
          position: 'fixed', top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 200),
          zIndex: 9999,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'dropIn 180ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {options.length > 5 && (
            <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%', padding: '7px 12px', borderRadius: 8,
                  border: '1.5px solid #EDEDF2', fontSize: 12, outline: 'none',
                  background: '#F5F5F7', color: '#1D1D1F', fontFamily: 'inherit',
                }}
              />
            </div>
          )}
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px' }}>
            {/* Option "Tous" */}
            <div
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              style={{
                padding: '9px 12px', fontSize: 13, fontWeight: !value ? 700 : 500,
                color: !value ? '#0a84ff' : '#3c3c43', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10,
                background: !value ? 'rgba(10,132,255,0.08)' : 'transparent',
              }}
              onMouseEnter={e => { if (value) e.currentTarget.style.background = '#f5f5f7'; }}
              onMouseLeave={e => { if (value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize:14, color: !value?'#0a84ff':'#c7c7cc', fontVariationSettings:"'FILL' 1" }}>
                {!value ? 'check_circle' : 'circle'}
              </span>
              {placeholder}
            </div>
            <div style={{ height:1, background:'rgba(0,0,0,0.04)', margin:'4px 6px' }} />
            {filtered.length === 0
              ? <div style={{ padding:'12px', textAlign:'center', fontSize:12, color:'#8E8E93' }}>Aucun résultat</div>
              : filtered.map(opt => {
                const sel = String(value) === String(opt.value);
                return (
                  <div key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
                    style={{
                      padding: '9px 12px', fontSize: 13, fontWeight: sel ? 700 : 500,
                      color: sel ? '#0a84ff' : '#1c1c1e', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10,
                      background: sel ? 'rgba(10,132,255,0.08)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f5f5f7'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize:14, color:sel?'#0a84ff':'#c7c7cc', fontVariationSettings:"'FILL' 1" }}>
                      {sel ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {opt.label}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <style>{`
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Form Select (for modals & forms — white bg, bordered) ── */
export function FormSelect({ value, onChange, options, placeholder = 'Sélectionner' }) {
  const { open, setOpen, pos, trigRef, menuRef, toggle } = useDropdown();
  const [search, setSearch] = useState('');
  const current  = options.find(o => String(o.value) === String(value));
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <button
        ref={trigRef}
        type="button"
        onClick={toggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', borderRadius: 12,
          border: open ? '1.5px solid #0A84FF' : '1.5px solid #EDEDF2',
          background: '#ffffff', color: current ? '#1D1D1F' : '#8E8E93',
          fontSize: 14, fontWeight: current ? 500 : 400,
          cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
          boxShadow: open ? '0 0 0 4px rgba(10,132,255,0.1)' : 'none',
          transition: 'all 200ms',
        }}
      >
        <span>{current ? current.label : placeholder}</span>
        <span className="material-symbols-outlined" style={{
          fontSize: 18, color: '#8E8E93',
          transform: open ? 'rotate(180deg)' : 'none', transition: '200ms',
        }}>expand_more</span>
      </button>

      {open && (
        <div ref={menuRef} style={{
          position: 'fixed', top: pos.top, left: pos.left, width: pos.width,
          zIndex: 9999, background: '#fff', borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden', animation: 'dropIn 160ms ease',
        }}>
          {options.length > 5 && (
            <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid #F5F5F7' }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1.5px solid #EDEDF2', fontSize: 13, outline: 'none',
                  background: '#F9F9FB', color: '#1D1D1F', fontFamily: 'inherit',
                }}
              />
            </div>
          )}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding:'16px', textAlign:'center', color:'#8E8E93', fontSize:13 }}>Aucun résultat</div>
              : filtered.map(opt => {
                const sel = String(value) === String(opt.value);
                return (
                  <div key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
                    style={{
                      padding: '10px 14px', fontSize: 14, fontWeight: sel ? 700 : 400,
                      color: sel ? '#0A84FF' : '#1D1D1F', cursor: 'pointer',
                      background: sel ? 'rgba(10,132,255,0.06)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#F5F5F7'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize:14, color:sel?'#0A84FF':'#C7C7CC', fontVariationSettings:"'FILL' 1" }}>
                      {sel ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {opt.label}
                  </div>
                );
              })}
          </div>
        </div>
      )}
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
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: '#ffffff', borderRadius: 12, padding: '0 14px', height: 38, gap: 8,
      minWidth: 220, maxWidth: 300,
      border: focused ? '1.5px solid #0A84FF' : '1.5px solid #EDEDF2',
      boxShadow: focused ? '0 0 0 4px rgba(10,132,255,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
      transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: focused ? '#0A84FF' : '#8E8E93', flexShrink: 0, transition: 'color 200ms' }}>search</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', boxShadow: 'none',
          fontSize: 13, background: 'transparent', fontFamily: 'inherit',
          color: '#1D1D1F', fontWeight: 500, padding: 0, margin: 0
        }}
        className="no-focus-ring"
      />
      {value && (
        <button onClick={() => onChange('')} style={{ background: '#F5F5F7', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#8E8E93', padding: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 200ms' }}
          onMouseEnter={e => e.currentTarget.style.background = '#E5E5EA'}
          onMouseLeave={e => e.currentTarget.style.background = '#F5F5F7'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, fontWeight: 600 }}>close</span>
        </button>
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

import { useState, useRef, useEffect } from 'react';

const F = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' };

/* ─────────────────────────────────────────────
   FormSelect — Custom dropdown for forms
   Props:
     value, onChange, options [{value,label}],
     placeholder, label, required, disabled, error
   ───────────────────────────────────────────── */
export function FormSelect({ value, onChange, options = [], placeholder = 'Choisir...', label, required, disabled, error, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const hasValue = value !== '' && value !== null && value !== undefined;

  return (
    <div ref={ref} style={{ position: 'relative', ...F }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
          {label}{required && <span style={{ color: '#ff453a', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', height: 44, padding: '0 14px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          background: disabled ? '#f9f9fb' : '#fff',
          border: error ? '1.5px solid #ff453a' : open ? '1.5px solid #0a84ff' : '1.5px solid #e5e5ea',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: 14, fontFamily: 'inherit',
          color: hasValue ? '#1c1c1e' : '#aeaeb2',
          textAlign: 'left',
          boxShadow: open ? '0 0 0 4px rgba(10,132,255,0.1)' : 'none',
          transition: 'all 180ms',
          outline: 'none',
        }}
      >
        {icon && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8e8e93', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>{icon}</span>}
        <span style={{ flex: 1, fontWeight: hasValue ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current ? current.label : placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#aeaeb2', transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          expand_more
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 500,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 16, maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          animation: 'fsDropIn 200ms cubic-bezier(0.34,1.56,0.64,1)',
          padding: '6px',
        }}>
          {!required && (
            <>
              <div
                onClick={() => { onChange(''); setOpen(false); }}
                style={{
                  padding: '10px 14px', fontSize: 14, color: '#8e8e93', cursor: 'pointer',
                  borderRadius: 10, transition: 'background 120ms',
                  background: !hasValue ? 'rgba(10,132,255,0.06)' : 'transparent',
                  fontStyle: 'italic',
                }}
                onMouseEnter={e => { if (hasValue) e.currentTarget.style.background = '#f5f5f7'; }}
                onMouseLeave={e => { if (hasValue) e.currentTarget.style.background = 'transparent'; }}
              >
                {placeholder}
              </div>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 6px' }} />
            </>
          )}
          {options.map(opt => {
            const isSel = String(value) === String(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: '11px 14px', fontSize: 14, fontWeight: isSel ? 700 : 400,
                  color: isSel ? '#0a84ff' : '#1c1c1e', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10, transition: 'background 120ms',
                  background: isSel ? 'rgba(10,132,255,0.08)' : 'transparent',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f5f5f7'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: isSel ? '#0a84ff' : '#d1d1d6', fontVariationSettings: "'FILL' 1" }}>
                  {isSel ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}

      {error && <p style={{ fontSize: 11, color: '#ff453a', marginTop: 4, fontWeight: 500 }}>{error}</p>}

      <style>{`
        @keyframes fsDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MultiSelect — Checkbox multi-selection
   Props: value (array), onChange, options, label
   ───────────────────────────────────────────── */
export function MultiSelect({ value = [], onChange, options = [], label, placeholder = 'Sélectionner des produits...' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const toggle = (v) => {
    const numV = typeof v === 'number' ? v : parseInt(v);
    if (value.includes(numV)) onChange(value.filter(x => x !== numV));
    else onChange([...value, numV]);
  };

  const filtered = options.filter(o => (o.label||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position: 'relative', ...F }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', minHeight: 44, padding: '8px 14px', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
          background: '#fff', border: open ? '1.5px solid #0a84ff' : '1.5px solid #e5e5ea',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          boxShadow: open ? '0 0 0 4px rgba(10,132,255,0.1)' : 'none',
          transition: 'all 180ms', outline: 'none',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, flex: 1 }}>
          {value.length === 0 ? (
            <span style={{ fontSize: 14, color: '#aeaeb2', fontStyle: 'italic' }}>{placeholder}</span>
          ) : (
            value.map(v => {
              const opt = options.find(o => (o.value === v || o.value === String(v) || parseInt(o.value) === v));
              return opt ? (
                <span key={v} style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(10,132,255,0.1)', color: '#0a84ff', fontSize: 12, fontWeight: 700 }}>
                  {opt.label}
                </span>
              ) : null;
            })
          )}
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#aeaeb2', transition: 'transform 220ms', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>expand_more</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 500,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          borderRadius: 16, maxHeight: 300, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          animation: 'fsDropIn 200ms cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f7', borderRadius: 10, padding: '6px 12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#8e8e93' }}>search</span>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: '#1c1c1e' }}
                onClick={e => e.stopPropagation()}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e93', padding: 0, fontSize: 14 }}>×</button>}
            </div>
          </div>

          {/* Badge: count + select all */}
          {value.length > 0 && (
            <div style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.04)', flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: '#8e8e93' }}>{value.length} sélectionné{value.length > 1 ? 's' : ''}</span>
              <button onClick={() => onChange([])} style={{ border: 'none', background: 'none', color: '#ff453a', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Tout désélectionner
              </button>
            </div>
          )}

          {/* Options */}
          <div style={{ overflowY: 'auto', padding: '6px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8e8e93', fontSize: 13 }}>Aucun résultat</div>
            ) : filtered.map(opt => {
              const isSelected = value.includes(parseInt(opt.value)) || value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderRadius: 10, transition: 'background 120ms',
                    background: isSelected ? 'rgba(10,132,255,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f5f5f7'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, border: isSelected ? 'none' : '1.5px solid #d1d1d6',
                    background: isSelected ? '#0a84ff' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 150ms',
                  }}>
                    {isSelected && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? '#0a84ff' : '#1c1c1e' }}>{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

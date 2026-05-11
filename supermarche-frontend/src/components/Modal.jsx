import React, { useEffect } from 'react';

export default function Modal({ title, children, onClose, footer, maxWidth = 480, accent = '#0a84ff' }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'overlayIn 200ms ease',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 24,
        width: '100%', maxWidth,
        boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
        overflow: 'hidden',
        animation: 'modalIn 220ms cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
      }}>

        {/* Accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}99)` }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}>
          <h2 style={{
            fontSize: 18, fontWeight: 800, color: '#1c1c1e',
            letterSpacing: '-0.02em', margin: 0,
          }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#f2f2f7', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e5ea'; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f2f2f7'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#3c3c43' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            padding: '0 24px 20px',
            borderTop: '1px solid rgba(0,0,0,0.04)',
            paddingTop: 16, marginTop: -4,
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}


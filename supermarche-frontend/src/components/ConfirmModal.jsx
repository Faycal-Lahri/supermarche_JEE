import { useState, useCallback } from 'react';

/* ─────────────────────────────────────────────
   ConfirmModal — Popup de confirmation premium
   ───────────────────────────────────────────── */
export function ConfirmModal({ open, message, title = 'Confirmer', confirmLabel = 'Confirmer', cancelLabel = 'Annuler', variant = 'danger', onConfirm, onCancel }) {
  if (!open) return null;

  const colors = {
    danger:  { accent: '#ff453a', gradFrom: '#ff453a', gradTo: '#cc0000', icon: 'warning', iconBg: 'rgba(255,69,58,0.1)', iconColor: '#ff453a' },
    warning: { accent: '#ff9f0a', gradFrom: '#ff9f0a', gradTo: '#cc7d00', icon: 'info',    iconBg: 'rgba(255,159,10,0.1)', iconColor: '#ff9f0a' },
    info:    { accent: '#0a84ff', gradFrom: '#0a84ff', gradTo: '#0060c0', icon: 'help',    iconBg: 'rgba(10,132,255,0.1)', iconColor: '#0a84ff' },
  };
  const cfg = colors[variant] || colors.danger;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onCancel()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'cfOverlayIn 180ms ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 24,
        width: '100%', maxWidth: 400,
        boxShadow: '0 40px 100px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        animation: 'cfModalIn 220ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Accent top bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${cfg.gradFrom}, ${cfg.gradTo})` }} />

        {/* Content */}
        <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: cfg.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 30, color: cfg.iconColor, fontVariationSettings: "'FILL' 1" }}>
              {cfg.icon}
            </span>
          </div>

          <h3 style={{
            fontSize: 18, fontWeight: 800, color: '#1c1c1e',
            letterSpacing: '-0.02em', marginBottom: 10,
          }}>{title}</h3>

          <p style={{
            fontSize: 14, color: '#6b6b70', lineHeight: 1.6,
            marginBottom: 28,
          }}>{message}</p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Cancel */}
            <button
              onClick={onCancel}
              style={{
                flex: 1, height: 46, borderRadius: 14,
                background: '#f2f2f7', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, color: '#3c3c43',
                fontFamily: 'inherit', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e5ea'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f2f2f7'; }}
            >
              {cancelLabel}
            </button>

            {/* Confirm */}
            <button
              onClick={onConfirm}
              style={{
                flex: 1, height: 46, borderRadius: 14,
                background: `linear-gradient(135deg, ${cfg.gradFrom}, ${cfg.gradTo})`,
                border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, color: '#fff',
                fontFamily: 'inherit',
                boxShadow: `0 6px 20px ${cfg.accent}40`,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cfOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cfModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   useConfirm — Hook pour remplacer confirm()
   Usage :
     const { confirm, ConfirmDialog } = useConfirm();
     const ok = await confirm({ title, message, variant });
     if (ok) { ...do action... }
     // Dans le JSX : <ConfirmDialog />
   ───────────────────────────────────────────── */
export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', title: 'Confirmer', confirmLabel: 'Confirmer', cancelLabel: 'Annuler', variant: 'danger', resolve: null });

  const confirm = useCallback((opts) => {
    const options = typeof opts === 'string' ? { message: opts } : opts;
    return new Promise((resolve) => {
      setState({
        open: true,
        message:      options.message      || '',
        title:        options.title        || 'Confirmer',
        confirmLabel: options.confirmLabel || 'Confirmer',
        cancelLabel:  options.cancelLabel  || 'Annuler',
        variant:      options.variant      || 'danger',
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(s => ({ ...s, open: false }));
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState(s => ({ ...s, open: false }));
  }, [state.resolve]);

  const ConfirmDialog = useCallback(() => (
    <ConfirmModal
      open={state.open}
      message={state.message}
      title={state.title}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ), [state, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog };
}

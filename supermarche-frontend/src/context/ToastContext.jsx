import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type, duration }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const success = useCallback((msg) => show(msg, 'success'), [show]);
  const error   = useCallback((msg) => show(msg, 'error'), [show]);
  const info    = useCallback((msg) => show(msg, 'info'), [show]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div style={{
        position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.05)', borderRadius: '1rem',
            padding: '16px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px',
            animation: 'fadeSlideRight 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
            position: 'relative', overflow: 'hidden'
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '24px',
              color: t.type === 'success' ? '#30d158' : t.type === 'error' ? '#ff453a' : '#0071e3'
            }}>
              {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>{t.message}</span>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, height: '3px',
              background: t.type === 'success' ? '#30d158' : t.type === 'error' ? '#ff453a' : '#0071e3',
              width: '100%', transformOrigin: 'left',
              animation: `scaleOut ${t.duration}ms linear forwards`
            }} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scaleOut {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

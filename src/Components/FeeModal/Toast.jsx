// Toast.jsx — lightweight toast notification system
// Usage: wrap app with <ToastProvider>, then use useToast() hook anywhere
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: { bg: '#ECFDF5', border: '#D1FAE5', text: '#065F46', icon: '#0D7A55' },
  error:   { bg: '#FEF2F2', border: '#FEE2E2', text: '#991B1B', icon: '#B91C1C' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#3B82F6' },
  warning: { bg: '#FFFBEB', border: '#FEF3C7', text: '#92400E', icon: '#D97706' },
};

let _id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 360,
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const c = COLORS[toast.type] || COLORS.info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: '11px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,.1)',
        pointerEvents: 'all',
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: c.icon, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1,
      }}>
        {ICONS[toast.type]}
      </div>
      {/* Message */}
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.text, lineHeight: 1.45 }}>
        {toast.message}
      </div>
      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.text, opacity: 0.5, fontSize: 15, lineHeight: 1,
          padding: 0, flexShrink: 0,
        }}
      >✕</button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

export default ToastProvider;
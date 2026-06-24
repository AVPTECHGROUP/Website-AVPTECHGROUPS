import { useEffect } from "react";

/**
 * ConfirmModal
 *
 * Props:
 *  open        – boolean, controls visibility
 *  title       – string, dialog heading
 *  message     – string | ReactNode, body text
 *  confirmLabel – string (default "Confirm")
 *  cancelLabel  – string (default "Cancel")
 *  variant     – "danger" | "primary" (default "primary")
 *  onConfirm   – () => void
 *  onCancel    – () => void
 *
 *  For the rejection modal with a text input:
 *  withInput   – boolean
 *  inputLabel  – string
 *  inputValue  – string
 *  onInputChange – (val: string) => void
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  withInput = false,
  inputLabel = "",
  inputValue = "",
  onInputChange,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const confirmBg = variant === "danger" ? "#dc2626" : "#1d4ed8";
  const confirmHover = variant === "danger" ? "#b91c1c" : "#1e40af";

  return (
    <div style={styles.backdrop} onClick={onCancel} aria-modal="true" role="dialog">
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div style={{ ...styles.iconWrap, background: variant === "danger" ? "#fee2e2" : "#dbeafe" }}>
          {variant === "danger" ? (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01"
              />
              <circle cx="12" cy="12" r="9" stroke="#1d4ed8" strokeWidth="2" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 style={styles.title}>{title}</h2>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Optional text input (for rejection reason) */}
        {withInput && (
          <div style={styles.inputWrap}>
            {inputLabel && <label style={styles.label}>{inputLabel}</label>}
            <textarea
              style={styles.textarea}
              rows={3}
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder="Enter reason…"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            style={{ ...styles.confirmBtn, background: confirmBg }}
            onMouseOver={(e) => (e.currentTarget.style.background = confirmHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = confirmBg)}
            onClick={onConfirm}
            disabled={withInput && !inputValue.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    padding: "1rem",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    padding: "2rem",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  },
  iconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.25rem",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#0f172a",
    textAlign: "center",
  },
  message: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    textAlign: "center",
    lineHeight: 1.6,
  },
  inputWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "0.25rem",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#334155",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#0f172a",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  actions: {
    display: "flex",
    gap: "10px",
    width: "100%",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  confirmBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: "8px",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
  },
};

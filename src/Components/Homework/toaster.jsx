import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

/**
 * Safely extract a display string from whatever was passed as `message`.
 *
 * The API returns envelopes like:
 *   { success, message, data, pagination, timestamp }
 *
 * Callers sometimes pass the whole envelope, a plain string, an Error, or undefined.
 * This helper always yields a short, human-readable string — never "[object Object]".
 */
function safeMessage(raw) {
  if (!raw) return "";

  // Plain string — most common case
  if (typeof raw === "string") return raw;

  // Error instance
  if (raw instanceof Error) return raw.message || "An error occurred";

  // API envelope: { message: "…" }
  if (typeof raw === "object") {
    if (typeof raw.message === "string" && raw.message) return raw.message;
    // Fallback: don't stringify the whole object — just stay silent
    return "";
  }

  return String(raw);
}

// ── Toast item ────────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(show);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const styles = {
    success: {
      bar:  "bg-green-500",
      icon: <CheckCircle size={16} className="text-green-600 flex-shrink-0" />,
      ring: "border-green-100",
    },
    error: {
      bar:  "bg-red-500",
      icon: <XCircle size={16} className="text-red-500 flex-shrink-0" />,
      ring: "border-red-100",
    },
    warning: {
      bar:  "bg-amber-400",
      icon: <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />,
      ring: "border-amber-100",
    },
  };

  const s = styles[toast.type] ?? styles.success;

  // Resolve title and message to safe strings — never raw objects
  const titleText   = safeMessage(toast.title);
  const messageText = safeMessage(toast.message);

  return (
    <div
      className={`flex items-start gap-3 bg-white border ${s.ring} rounded-xl shadow-lg w-[340px] overflow-hidden
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {/* left colour bar */}
      <div className={`w-1 self-stretch rounded-l-xl flex-shrink-0 ${s.bar}`} />

      <div className="flex items-start gap-2.5 py-3 pr-3 flex-1 min-w-0">
        {s.icon}
        <div className="flex-1 min-w-0">
          {titleText && (
            <p className="text-sm font-semibold text-gray-900 leading-snug">{titleText}</p>
          )}
          {messageText && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{messageText}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Toaster container ─────────────────────────────────────────────────────────
export function Toaster({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = ({ type = "success", title, message, duration = 4000 }) => {
    // Resolve both slots to safe strings before storing — guarantees
    // the Toast component never receives a raw object or response envelope.
    const safeTitle   = safeMessage(title);
    const safeMsg     = safeMessage(message);

    const id = ++_id;
    setToasts((prev) => [
      ...prev,
      { id, type, title: safeTitle, message: safeMsg },
    ]);
    setTimeout(() => dismiss(id), duration);
  };

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return {
    toasts,
    dismiss,
    success: (title, message) => push({ type: "success", title, message }),
    error:   (title, message) => push({ type: "error",   title, message }),
    warning: (title, message) => push({ type: "warning", title, message }),
  };
}
// src/Component/CommonComp/ConfirmationModal.jsx
import React, { useEffect } from "react";
import { X } from "lucide-react";
export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Redirect to Teachers Module",
  message = "You will be redirected to the Teachers Module to manage this teacher. Do you wish to continue?",
  confirmLabel = "Yes, Continue",
  cancelLabel = "Cancel",
}) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    // Backdrop — click outside to dismiss
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100
                   animate-[fadeZoomIn_0.2s_ease-out_both]"
        style={{ animation: "fadeZoomIn 0.2s ease-out both" }}
        onClick={(e) => e.stopPropagation()} // prevent backdrop click
      >
        {/* Keyframe style injected inline — works without a global CSS file */}
        <style>{`
          @keyframes fadeZoomIn {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400
                     hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg,#0ea5e9,#3b82f6)" }}
          >
            {/* Arrow redirect icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>

          <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                       text-gray-700 bg-gray-100 hover:bg-gray-200
                       border border-gray-200 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold
                       text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#0ea5e9,#3b82f6)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { CheckCircle2, X, Loader2, ExternalLink } from "lucide-react";
import { STORAGE_KEYS, CONFIG, ROUTES, STYLES, UI_TEXT } from "../../Constants/StringConstants/SelectSchoolConstants";

// ── Persist selected school SYNCHRONOUSLY before opening new tab ──────────────
function saveSchoolToStorage(school) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
    localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, String(school.id));
    localStorage.setItem(STORAGE_KEYS.SCHOOL_CODE, school.code || "");
    localStorage.setItem(STORAGE_KEYS.SCHOOL_NAME, school.name || "");
  } catch (e) {
    console.error("SchoolSelectedCard: failed to persist school", e);
  }
}

export default function SchoolSelectedCard({ school, onClose }) {
  const [confirming, setConfirming] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === CONFIG.KEY_ESCAPE) onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleEnterDashboard = () => {
    // Step 1: Write to localStorage FIRST (synchronous, blocking)
    saveSchoolToStorage(school);

    // Step 2: Open new tab immediately (MUST be synchronous in click handler)
    const newTab = window.open(ROUTES.DASHBOARD, CONFIG.WINDOW_TARGET, CONFIG.WINDOW_FEATURES);

    if (!newTab || newTab.closed) {
      // Popup was blocked — fall back to same-tab navigation
      window.location.href = ROUTES.DASHBOARD;
      return;
    }

    // Step 3: Brief "Opening…" feedback, then close modal
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      onClose?.();
    }, CONFIG.TIMEOUT_DELAY);
  };

  if (!school) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: STYLES.MODAL_BG, backdropFilter: STYLES.MODAL_BACKDROP }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Top */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{UI_TEXT.MODAL_TITLE}</h2>
          <p className="text-blue-600 font-semibold text-base mt-1">{school.name}</p>
          <p className="text-sm text-gray-500 mt-1">{UI_TEXT.WORKSPACE_UPDATED}</p>
        </div>

        {/* Access validated row */}
        <div className="mx-6 mb-4 bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{UI_TEXT.ACCESS_VALIDATED}</p>
            {school.board && (
              <p className="text-xs text-gray-400 mt-0.5">{school.board} · {school.city || UI_TEXT.FALLBACK_DASH}</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleEnterDashboard}
            disabled={confirming}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold transition-all duration-200 shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {confirming ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {UI_TEXT.OPENING}
              </>
            ) : (
              <>
                {UI_TEXT.ENTER_DASHBOARD}
                <ExternalLink size={15} />
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2.5">
            {UI_TEXT.MODAL_FOOTER}
          </p>
        </div>

      </div>
    </div>
  );
}
import { useState } from "react";
import {
  X, Calendar, Clock, MapPin, TrendingUp, Bell,
  Trash2, AlertTriangle, CheckCircle2, XCircle, Timer, Loader2,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  try { return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return str; }
}
function fmtTime(str) {
  if (!str) return "";
  try { return new Date(str).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}
function typeLabel(t) {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TYPE_ICONS = { SCHOOL_WIDE: "🏫", CLASS_SPECIFIC: "📚" };

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toUpperCase();
  const map = {
    PUBLISHED:        "bg-green-50 text-green-700 border-green-200",
    APPROVED:         "bg-green-50 text-green-700 border-green-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED:        "bg-red-50 text-red-600 border-red-200",
    DRAFT:            "bg-blue-50 text-blue-600 border-blue-200",
    REJECTED:         "bg-red-50 text-red-600 border-red-200",
  };
  const labels = {
    PUBLISHED: "Published", APPROVED: "Approved",
    PENDING_APPROVAL: "Pending Approval", CANCELLED: "Cancelled",
    DRAFT: "Draft", REJECTED: "Rejected",
  };
  const cls = map[s] || "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls}`}>
      {(s === "PUBLISHED" || s === "APPROVED") && <CheckCircle2 size={10} />}
      {s === "PENDING_APPROVAL" && <Timer size={10} />}
      {(s === "CANCELLED" || s === "DRAFT" || s === "REJECTED") && <XCircle size={10} />}
      {labels[s] || status}
    </span>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-blue-500 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-slate-800 break-words">{value || "—"}</div>
      </div>
    </div>
  );
}

// ── Delete Confirm Sub-modal ───────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onCancel, deleting }) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 p-6 z-10">
      <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <AlertTriangle size={26} className="text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-slate-800 mb-1">Delete this event?</p>
        <p className="text-sm text-slate-500">This action cannot be undone. The event will be permanently removed.</p>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {deleting ? "Deleting…" : "Yes, Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────
export default function EventDetailModal({ ev, onClose, onDeleted, onDeleteEvent }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!ev) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const { error: err } = await onDeleteEvent(ev.id);
    setDeleting(false);
    if (!err) {
      onDeleted?.();
      onClose();
    } else {
      alert(err);
    }
  };

  // ── Fix: use startDatetime/endDatetime with fallbacks ──
  const startDt = ev.startDatetime ?? ev.startDate ?? ev.date ?? null;
  const endDt   = ev.endDatetime   ?? ev.endDate   ?? null;

  const timeStr = startDt
    ? `${fmtTime(startDt)}${endDt ? ` – ${fmtTime(endDt)}` : ""}`
    : "—";

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Delete confirm overlay */}
        {showDeleteConfirm && (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            deleting={deleting}
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-[1]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">{TYPE_ICONS[ev.type] || "📅"}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-snug mb-1 break-words">{ev.title || "Untitled Event"}</p>
              <StatusBadge status={ev.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors shrink-0 ml-3"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 flex-1">

          {/* Description */}
          {ev.description && (
            <p className="text-sm text-slate-500 leading-relaxed bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
              {ev.description}
            </p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <InfoRow icon={<Calendar size={14} />} label="Date"     value={fmtDate(startDt)} />
            <InfoRow icon={<Clock size={14} />}    label="Time"     value={timeStr} />
            <InfoRow icon={<MapPin size={14} />}   label="Location" value={ev.location} />
            <InfoRow icon={<TrendingUp size={14} />} label="Type"   value={typeLabel(ev.type)} />
          </div>

          {/* Target groups */}
          {ev.targetGroups?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipients</p>
              <div className="flex flex-wrap gap-1.5">
                {ev.targetGroups.map((tg, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {tg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notified count */}
          {ev.notifiedCount != null && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-slate-600">
              <Bell size={14} className="text-green-600 shrink-0" />
              <span><strong className="text-slate-800">{ev.notifiedCount}</strong> people notified</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} /> Delete Event
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
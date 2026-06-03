import { useState, useEffect, useCallback } from "react";
import {
  Calendar, MapPin, Clock, Users, Bell, Plus, Search,
  Filter, ChevronDown, CheckCircle2, XCircle, Eye,
  Loader2, AlertCircle, RefreshCw, CalendarDays, LayoutList,
  CheckCheck, Timer, TrendingUp, ArrowLeft, Upload,
  X, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import { fetchEvents, fetchPendingEvents, approveEvent, cancelEvent, createEvent } from '../../../Api/CircularApi.js';

// ── Helpers ────────────────────────────────────────────────────────────────
function typeLabel(t) {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function fmtDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return str; }
}
function fmtTime(str) {
  if (!str) return "";
  try {
    return new Date(str).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

const TYPE_ICONS = { SCHOOL_WIDE: "🏫", CLASS_SPECIFIC: "📚" };
const TARGET_OPTIONS = ["All Staff", "All Teachers", "All Parents", "Class 9", "Class 10"];
const PER_PAGE = 10;

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const map = {
    published: "bg-green-50 text-green-700 border-green-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    draft: "bg-blue-50 text-blue-600 border-blue-200",
  };
  const labels = {
    published: "Published", approved: "Approved",
    pending: "Pending", cancelled: "Cancelled", draft: "Draft",
  };
  const cls = map[s] || "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls}`}>
      {(s === "published" || s === "approved") && <CheckCircle2 size={10} />}
      {s === "pending" && <Timer size={10} />}
      {(s === "cancelled" || s === "draft") && <XCircle size={10} />}
      {labels[s] || status}
    </span>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner({ size = 18 }) {
  return <Loader2 size={size} className="animate-spin" />;
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ message = "No events found." }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-slate-400">
      <CalendarDays size={40} className="mb-3 text-blue-200" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// ── Error Banner ───────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      <AlertCircle size={15} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 bg-white text-red-600 text-xs cursor-pointer hover:bg-red-50 transition-colors"
        >
          <RefreshCw size={11} /> Retry
        </button>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accentClass, bgClass, borderClass }) {
  return (
    <div className={`bg-white border ${borderClass} rounded-2xl p-4 shadow-sm flex items-center gap-3.5`}>
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={accentClass} />
      </div>
      <div>
        <div className={`text-2xl font-extrabold leading-none ${accentClass}`}>{value ?? "—"}</div>
        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      </div>
    </div>
  );
}

// ── Calendar Strip ─────────────────────────────────────────────────────────
function CalendarStrip({ events }) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const firstDay = base.getDay();
  const monthLabel = base.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const eventDates = new Set(
    (events || [])
      .map((e) => { const d = e.startDate || e.date; return d ? new Date(d).toDateString() : null; })
      .filter(Boolean)
  );
  const todayStr = now.toDateString();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(base.getFullYear(), base.getMonth(), d);
    cells.push({ d, isToday: date.toDateString() === todayStr, hasEvent: eventDates.has(date.toDateString()) });
  }

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-800">{monthLabel}</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Today
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Event
          </div>
          <button
            onClick={() => setOffset((p) => p - 1)}
            className="w-7 h-7 rounded-lg border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setOffset((p) => p + 1)}
            className="w-7 h-7 rounded-lg border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-slate-300 pb-1">{d}</div>
        ))}
        {cells.map((c, i) => (
          <div
            key={i}
            className={`rounded-lg py-1.5 px-1 text-center ${!c ? "invisible" :
                c.isToday ? "bg-blue-50 border border-blue-200" :
                  c.hasEvent ? "bg-violet-50 border border-violet-200" :
                    "bg-slate-50 border border-slate-100"
              }`}
          >
            {c && (
              <>
                <div className={`text-sm font-bold ${c.isToday ? "text-blue-600" : "text-slate-800"}`}>{c.d}</div>
                {c.hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mx-auto mt-0.5" />}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Info Pill (modal) ──────────────────────────────────────────────────────
function InfoPill({ icon, label, value }) {
  return (
    <div className="flex gap-2 p-3 bg-blue-50 rounded-xl items-start">
      <span className="text-blue-500 mt-0.5">{icon}</span>
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[13px] font-semibold text-slate-800">{value || "—"}</div>
      </div>
    </div>
  );
}

// ── Event Detail Modal ─────────────────────────────────────────────────────
function EventDetailModal({ ev, onClose }) {
  if (!ev) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between px-5 py-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{TYPE_ICONS[ev.type] || "📅"}</span>
            <div>
              <div className="text-sm font-bold text-slate-800 mb-1">{ev.title}</div>
              <StatusBadge status={ev.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {ev.description && (
            <p className="text-sm text-slate-500 leading-relaxed">{ev.description}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <InfoPill icon={<Calendar size={14} />} label="Date" value={fmtDate(ev.startDate || ev.date)} />
            <InfoPill icon={<Clock size={14} />} label="Time" value={`${fmtTime(ev.startDate)}${ev.endDate ? ` – ${fmtTime(ev.endDate)}` : ""}`} />
            <InfoPill icon={<MapPin size={14} />} label="Location" value={ev.location} />
            <InfoPill icon={<TrendingUp size={14} />} label="Type" value={typeLabel(ev.type)} />
          </div>
          {ev.targetGroups?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipients</div>
              <div className="flex flex-wrap gap-1.5">
                {ev.targetGroups.map((tg, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{tg}</span>
                ))}
              </div>
            </div>
          )}
          {ev.notifiedCount != null && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 rounded-xl text-sm text-slate-500">
              <Bell size={14} className="text-blue-500" />
              <strong className="text-slate-800">{ev.notifiedCount}</strong> people notified
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Action Button ──────────────────────────────────────────────────────────
function ActionBtn({ children, onClick, loading, colorClass, title }) {
  return (
    <button
      title={title}
      disabled={loading}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm cursor-pointer transition-all ${colorClass}`}
    >
      {children}
    </button>
  );
}

// ── Event Row ──────────────────────────────────────────────────────────────
function EventRow({ ev, onApprove, onCancel, onView, approving, cancelling }) {
  return (
    <div className="px-4 py-4 border-b border-blue-50 hover:bg-blue-50/40 transition-colors last:border-b-0">
      <div className="flex flex-wrap gap-3 items-start">
        {/* Title + meta */}
        <div className="flex-1 min-w-0" style={{ flexBasis: 220 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{TYPE_ICONS[ev.type] || "📅"}</span>
            <span className="text-sm font-bold text-slate-800 truncate">{ev.title || "Untitled Event"}</span>
          </div>
          {ev.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{ev.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {typeLabel(ev.type)}
            </span>
            {ev.targetGroups?.map?.((tg, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{tg}</span>
            ))}
          </div>
        </div>

        {/* Date + Location */}
        <div className="flex flex-col gap-1.5 shrink-0" style={{ minWidth: 140 }}>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={12} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700">{fmtDate(ev.startDate || ev.date)}</span>
          </div>
          {(ev.startDate || ev.time) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock size={12} className="text-blue-500 shrink-0" />
              <span>{fmtTime(ev.startDate)}{ev.endDate ? ` – ${fmtTime(ev.endDate)}` : ""}</span>
            </div>
          )}
          {ev.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={12} className="text-blue-500 shrink-0" />
              <span className="truncate max-w-[120px]">{ev.location}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <StatusBadge status={ev.status} />
          {ev.notifiedCount != null && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Bell size={10} /> {ev.notifiedCount} notified
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(ev.status === "pending" || ev.status === "PENDING") && (
            <>
              <ActionBtn
                onClick={() => onApprove(ev.id)}
                loading={approving}
                title="Approve"
                colorClass="border-green-200 text-green-600 hover:bg-green-50 bg-white"
              >
                {approving ? <Spinner size={13} /> : <Check size={13} />}
              </ActionBtn>
              <ActionBtn
                onClick={() => onCancel(ev.id)}
                loading={cancelling}
                title="Cancel"
                colorClass="border-red-200 text-red-500 hover:bg-red-50 bg-white"
              >
                {cancelling ? <Spinner size={13} /> : <X size={13} />}
              </ActionBtn>
            </>
          )}
          <button
            onClick={() => onView(ev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-600 text-xs font-semibold hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <Eye size={12} /> View
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Button ────────────────────────────────────────────────────────────
function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-8 rounded-lg border px-2 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer
        ${active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-blue-100 text-slate-500 hover:bg-blue-50"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Filter Select ──────────────────────────────────────────────────────────
function FilterSel({ value, onChange, opts }) {
  return (
    <div className="relative flex items-center">
      <Filter size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-[1.5px] border-blue-100 rounded-lg py-1.5 pl-7 pr-7 text-sm text-slate-700 bg-slate-50 outline-none cursor-pointer appearance-none"
      >
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Form Card ──────────────────────────────────────────────────────────────
function FormCard({ title, children }) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
      <div className="text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-blue-50">{title}</div>
      {children}
    </div>
  );
}

// ── Create Event Form ──────────────────────────────────────────────────────
function CreateEventForm({ onBack, onCreated }) {
  const [form, setForm] = useState({
    title: "", type: "SCHOOL_WIDE", location: "",
    startDate: "", endDate: "", description: "",
  });
  const [targets, setTargets] = useState([]);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleTarget = (t) => setTargets((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const calcDuration = () => {
    try {
      const s = new Date(form.startDate), e = new Date(form.endDate);
      if (isNaN(s) || isNaN(e) || e <= s) return null;
      const hrs = Math.round((e - s) / 36e5);
      return hrs < 24 ? `${hrs}h` : `${Math.round(hrs / 24)}d`;
    } catch { return null; }
  };

  const handleSubmit = async (asDraft) => {
    if (!form.title || !form.startDate) { setError("Title and start date are required."); return; }
    setLoading(true); setError(null);
    const { data, error: err } = await createEvent({ ...form, status: asDraft ? "draft" : "pending", targetGroups: targets });
    setLoading(false);
    if (err) { setError(err); return; }
    onCreated?.(data);
    onBack();
  };

  const inp = "w-full border-[1.5px] border-blue-100 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 bg-blue-50/30 outline-none focus:border-blue-400 focus:bg-white transition-colors";
  const lbl = "block text-[12.5px] font-semibold text-slate-500 mb-1.5";
  const dur = calcDuration();

  return (
    <div className="bg-blue-50/60 min-h-screen p-4 sm:p-6 font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 cursor-pointer transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 leading-none">Create New Event</h1>
          <p className="text-xs text-slate-400 mt-1">Schedule and notify parents, staff, or specific classes.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 max-w-4xl">
        {/* Left col */}
        <div className="flex flex-col gap-4">
          <FormCard title="Event Details">
            <div className="flex flex-col gap-3.5">
              <div>
                <label className={lbl}>Event Title <span className="text-red-500">*</span></label>
                <input className={inp} value={form.title} onChange={set("title")} placeholder="e.g. Annual Sports Day 2025" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Event Type <span className="text-red-500">*</span></label>
                  <select className={`${inp} cursor-pointer`} value={form.type} onChange={set("type")}>
                    <option value="SCHOOL_WIDE">School-Wide</option>
                    <option value="CLASS_SPECIFIC">Class-Specific</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Location</label>
                  <input className={inp} value={form.location} onChange={set("location")} placeholder="e.g. School Ground" />
                </div>
              </div>
            </div>
          </FormCard>

          <FormCard title="Date & Time">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Start <span className="text-red-500">*</span></label>
                <input type="datetime-local" className={inp} value={form.startDate} onChange={set("startDate")} />
              </div>
              <div>
                <label className={lbl}>End</label>
                <input type="datetime-local" className={inp} value={form.endDate} onChange={set("endDate")} />
              </div>
            </div>
            {dur && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                <Clock size={12} /> Duration: {dur}
              </div>
            )}
          </FormCard>

          <FormCard title="Description">
            <label className={lbl}>About the event</label>
            <textarea
              className={`${inp} resize-y min-h-[100px] leading-relaxed`}
              value={form.description} onChange={set("description")} placeholder="Describe the event…"
            />
          </FormCard>

          <FormCard title="Target Recipients">
            <label className={lbl}>Who should be notified? <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TARGET_OPTIONS.map((t) => {
                const sel = targets.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTarget(t)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] cursor-pointer transition-all
                      ${sel ? "border-blue-500 bg-blue-50 text-blue-700" : "border-blue-100 bg-white text-slate-500 hover:border-blue-300"}`}
                  >
                    {sel && <Check size={11} />}{t}
                  </button>
                );
              })}
            </div>
            {targets.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                <Users size={12} /> Notifying: {targets.join(", ")}
              </div>
            )}
          </FormCard>

          <FormCard title="Attachments">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); }}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${drag ? "border-blue-500 bg-blue-50" : "border-blue-100 bg-slate-50/50 hover:border-blue-300"}`}
            >
              <Upload size={26} className="text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-500">Click to upload or drag & drop</div>
              <div className="text-xs text-slate-400 mt-1">PDF, Images up to 10 MB</div>
            </div>
          </FormCard>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-blue-100 bg-white text-slate-500 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-blue-100 bg-white text-slate-700 text-sm font-semibold hover:bg-blue-50 cursor-pointer transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-60"
            >
              {loading ? <><Spinner size={14} /> Publishing…</> : "Publish & Notify"}
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm sticky top-4">
            <div className="text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-blue-50">Event Summary</div>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Calendar size={13} />, label: "Title", value: form.title || "—" },
                { icon: <TrendingUp size={13} />, label: "Type", value: typeLabel(form.type) },
                { icon: <MapPin size={13} />, label: "Location", value: form.location || "—" },
                { icon: <CalendarDays size={13} />, label: "Date", value: form.startDate ? form.startDate.split("T")[0] : "—" },
                { icon: <Clock size={13} />, label: "Time", value: form.startDate ? form.startDate.split("T")[1] : "—" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-[12.5px]">
                  <span className="text-blue-500 shrink-0">{icon}</span>
                  <span className="text-slate-400 w-14 shrink-0">{label}</span>
                  <span className="text-slate-700 font-medium truncate">{value}</span>
                </div>
              ))}
            </div>
            {targets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notifying</div>
                <div className="flex flex-wrap gap-1.5">
                  {targets.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Events Page ───────────────────────────────────────────────────────
export default function EventsPage() {
  const [view, setView] = useState("events");
  const [events, setEvents] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [page, setPage] = useState(1);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError(null);
    const params = {};
    if (statusFilter !== "All") params.status = statusFilter.toLowerCase();
    if (typeFilter !== "All") params.type = typeFilter.toUpperCase().replace(/ /g, "_");
    if (search) params.search = search;
    params.page = page; params.limit = PER_PAGE;

    const [{ data, error: err }, { data: pending }] = await Promise.all([
      fetchEvents(params),
      fetchPendingEvents(),
    ]);
    setLoading(false);
    if (err) { setError(err); return; }
    setEvents(Array.isArray(data) ? data : data?.events || data?.data || []);
    setPendingCount(Array.isArray(pending) ? pending.length : pending?.total || 0);
  }, [statusFilter, typeFilter, search, page]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleApprove = async (id) => {
    setActionLoading((p) => ({ ...p, [`approve_${id}`]: true }));
    const { error: err } = await approveEvent(id);
    setActionLoading((p) => ({ ...p, [`approve_${id}`]: false }));
    if (!err) loadEvents();
  };

  const handleCancel = async (id) => {
    setActionLoading((p) => ({ ...p, [`cancel_${id}`]: true }));
    const { error: err } = await cancelEvent(id);
    setActionLoading((p) => ({ ...p, [`cancel_${id}`]: false }));
    if (!err) loadEvents();
  };

  if (view === "create") {
    return <CreateEventForm onBack={() => setView("events")} onCreated={loadEvents} />;
  }

  const published = events.filter((e) => ["published", "approved"].includes(e.status?.toLowerCase())).length;
  const upcoming = events.filter((e) => {
    const d = e.startDate || e.date;
    if (!d) return false;
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  return (
    <div className="bg-blue-50/60 min-h-screen p-4 sm:p-6 font-sans text-slate-800">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
            <CalendarDays size={22} className="text-blue-600" /> School Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">Plan and manage school-wide and class-specific events.</p>
        </div>
        <button
          onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow-md shadow-blue-200"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Events" value={events.length} icon={LayoutList} accentClass="text-blue-600" bgClass="bg-blue-50" borderClass="border-blue-100 border-t-4 border-t-blue-500" />
        <StatCard label="Published" value={published} icon={CheckCheck} accentClass="text-green-600" bgClass="bg-green-50" borderClass="border-green-100 border-t-4 border-t-green-500" />
        <StatCard label="Pending Approval" value={pendingCount} icon={Timer} accentClass="text-amber-600" bgClass="bg-amber-50" borderClass="border-amber-100 border-t-4 border-t-amber-500" />
        <StatCard label="Upcoming (30d)" value={upcoming} icon={TrendingUp} accentClass="text-violet-600" bgClass="bg-violet-50" borderClass="border-violet-100 border-t-4 border-t-violet-500" />
      </div>

      {/* Calendar */}
      <CalendarStrip events={events} />

      {error && <ErrorBanner message={error} onRetry={loadEvents} />}

      {/* Events Panel */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="px-4 py-3.5 border-b border-blue-50 flex flex-wrap gap-2.5 items-center">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search events…"
              className="w-full border-[1.5px] border-blue-100 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-700 bg-slate-50 outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          <FilterSel value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} opts={["All", "Published", "Pending", "Cancelled", "Draft"]} />
          <FilterSel value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} opts={["All", "School Wide", "Class Specific"]} />
          <button
            onClick={loadEvents}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-100 bg-white text-slate-400 text-xs hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid px-5 py-2.5 bg-blue-50/70 border-b border-blue-50" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 120px 110px" }}>
          {["EVENT", "DATE", "LOCATION", "STATUS", "ACTIONS"].map((h) => (
            <div key={h} className="text-[10px] font-bold text-slate-400 tracking-wider">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-blue-500">
            <Spinner size={28} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState message="No events found. Try adjusting your filters." />
        ) : (
          events.map((ev, i) => (
            <EventRow
              key={ev.id || i}
              ev={ev}
              onApprove={handleApprove}
              onCancel={handleCancel}
              onView={setSelectedEvent}
              approving={!!actionLoading[`approve_${ev.id}`]}
              cancelling={!!actionLoading[`cancel_${ev.id}`]}
            />
          ))
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-blue-50 flex items-center justify-between flex-wrap gap-2 bg-blue-50/30">
          <span className="text-xs text-slate-400">
            Showing {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-1.5">
            <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></PageBtn>
            <PageBtn active>{page}</PageBtn>
            <PageBtn onClick={() => setPage((p) => p + 1)} disabled={events.length < PER_PAGE}><ChevronRight size={14} /></PageBtn>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal ev={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
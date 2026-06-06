import { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, MapPin, Clock, Users, Bell, Plus, Search,
  ChevronDown, CheckCircle2, XCircle, Eye,
  AlertCircle, RefreshCw, CalendarDays, LayoutList,
  CheckCheck, Timer, TrendingUp, ArrowLeft, Upload,
  X, Check, ChevronLeft, ChevronRight, SlidersHorizontal,
  Loader2, Filter, EyeOff,
} from "lucide-react";
import CardComponent from '../../../Components/CommonComp/CardComponent';
import ListLoader from '../../../Components/CommonComp/ListLoader';
import {
  fetchEvents, fetchPendingEvents,
  approveEvent, cancelEvent, createEvent,
} from '../../../Api/CircularApi.js';
import EventDetailModal from '../../../Components/CircularDetailsPopup/EventDetailsModel.jsx';
import { useNavigate } from "react-router-dom";
// ── Helpers ────────────────────────────────────────────────────────────────
function typeLabel(t) {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
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

const TYPE_ICONS = { SCHOOL_WIDE: "🏫", CLASS_SPECIFIC: "📚" };
const TARGET_OPTIONS = ["All Staff", "All Teachers", "All Parents", "Class 9", "Class 10"];
const PER_PAGE = 10;

// API enum values (exact values expected by backend)
const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];
const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "School-Wide", value: "SCHOOL_WIDE" },
  { label: "Class-Specific", value: "CLASS_SPECIFIC" },
];

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toUpperCase();
  const map = {
    PUBLISHED: "bg-green-50 text-green-700 border-green-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
    DRAFT: "bg-blue-50 text-blue-600 border-blue-200",
  };
  const labels = {
    PUBLISHED: "Published", APPROVED: "Approved",
    PENDING_APPROVAL: "Pending Approval", CANCELLED: "Cancelled",
    REJECTED: "Rejected", DRAFT: "Draft",
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
        <button onClick={onRetry} className="flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 bg-white text-red-600 text-xs cursor-pointer hover:bg-red-50 transition-colors">
          <RefreshCw size={11} /> Retry
        </button>
      )}
    </div>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────
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
    cells.push({ d, isToday: date.toDateString() === todayStr, hasEvent: eventDates.has(date.toDateString()), isSunday: date.getDay() === 0 });
  }

  const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mb-5 rounded-2xl overflow-hidden shadow-sm border border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <CalendarDays size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">{monthLabel}</h2>
            <p className="text-blue-100 text-xs font-medium">
              {eventDates.size} event{eventDates.size !== 1 ? "s" : ""} this month
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Legend — desktop only */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/80 inline-block border border-white" />
              <span className="text-blue-100 text-xs font-medium">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-300 inline-block" />
              <span className="text-blue-100 text-xs font-medium">Event</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" />
              <span className="text-blue-100 text-xs font-medium">Sunday</span>
            </div>
          </div>
          {/* Nav */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setOffset((p) => p - 1)}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setOffset(0)}
              className="px-2.5 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer transition-colors">
              Today
            </button>
            <button onClick={() => setOffset((p) => p + 1)}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-gradient-to-b from-blue-50 to-white p-3 sm:p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysFull.map((day, i) => (
            <div key={i}
              className={`text-center py-1.5 sm:py-2 text-xs font-bold uppercase tracking-wide rounded-md
                ${i === 0 ? "text-red-500 bg-red-50" : "text-blue-700 bg-blue-100/70"}`}>
              <span className="hidden md:inline">{day}</span>
              <span className="inline md:hidden">{daysShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            return (
              <div key={i}
                className={`relative rounded-lg sm:rounded-xl py-1.5 sm:py-2.5 px-1 text-center transition-all
                  ${c.isToday
                    ? "bg-blue-600 shadow-md shadow-blue-200 ring-2 ring-blue-400 ring-offset-1"
                    : c.hasEvent
                      ? "bg-violet-100 border border-violet-300 hover:bg-violet-200 cursor-pointer"
                      : c.isSunday
                        ? "bg-red-50 border border-red-100"
                        : "bg-white border border-blue-100 hover:bg-blue-50"
                  }`}>
                <div className={`text-xs sm:text-sm font-bold leading-none
                  ${c.isToday ? "text-white" : c.isSunday ? "text-red-500" : "text-slate-700"}`}>
                  {c.d}
                </div>
                {c.hasEvent && !c.isToday && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mx-auto mt-1" />}
                {c.hasEvent && c.isToday && <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Mobile legend */}
        <div className="flex sm:hidden items-center justify-center gap-4 mt-3 pt-3 border-t border-blue-100">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /><span className="text-slate-500 text-xs">Today</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /><span className="text-slate-500 text-xs">Event</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /><span className="text-slate-500 text-xs">Sunday</span></div>
        </div>
      </div>
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

// ── Event Row ──────────────────────────────────────────────────────────────
function EventRow({ ev, onApprove, onCancel, onView, approving, cancelling }) {
  return (
    <div className="px-4 py-4 border-b border-blue-50 hover:bg-blue-50/40 transition-colors last:border-b-0">
      <div className="flex flex-wrap gap-3 items-start">
        {/* Title + meta */}
        <div className="flex-1 min-w-0" style={{ flexBasis: 220 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl shrink-0">{TYPE_ICONS[ev.type] || "📅"}</span>
            <span className="text-sm font-bold text-slate-800 truncate">{ev.title || "Untitled Event"}</span>
          </div>
          {ev.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{ev.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {typeLabel(ev.type)}
            </span>
            {ev.targetGroups?.map?.((tg, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{tg}</span>
            ))}
          </div>
        </div>

        {/* Date + Location */}
        <div className="flex flex-col gap-1.5 shrink-0 min-w-36">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={12} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700">{fmtDate(ev.startDate || ev.date)}</span>
          </div>
          {ev.startDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock size={12} className="text-blue-500 shrink-0" />
              <span>{fmtTime(ev.startDate)}{ev.endDate ? ` – ${fmtTime(ev.endDate)}` : ""}</span>
            </div>
          )}
          {ev.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={12} className="text-blue-500 shrink-0" />
              <span className="truncate max-w-28">{ev.location}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <StatusBadge status={ev.status} />
          {ev.notifiedCount != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Bell size={10} /> {ev.notifiedCount} notified
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(ev.status === "PENDING_APPROVAL" || ev.status === "pending") && (
            <>
              <button onClick={() => onApprove(ev.id)} disabled={approving} title="Approve"
                className="group w-8 h-8 rounded-lg border border-green-200 bg-white hover:bg-green-50 flex items-center justify-center cursor-pointer transition-all">
                {approving ? <Loader2 size={13} className="animate-spin text-green-600" /> : <Check size={13} className="text-green-600" />}
              </button>
              <button onClick={() => onCancel(ev.id)} disabled={cancelling} title="Cancel"
                className="group w-8 h-8 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all">
                {cancelling ? <Loader2 size={13} className="animate-spin text-red-500" /> : <X size={13} className="text-red-500" />}
              </button>
            </>
          )}
          <button onClick={() => onView(ev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-600 text-xs font-semibold hover:bg-blue-50 cursor-pointer transition-colors">
            <Eye size={12} /> View
          </button>
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [page, setPage] = useState(0); // 0-based pagination
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);

  const navigate = useNavigate();

  // 700ms debounce
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(0); }, 700);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // ── Load events only (pending count fetched separately on mount) ───────────
  const loadEvents = useCallback(async () => {
    setLoading(true); setError(null);
    const params = { page, size: PER_PAGE };
    if (statusFilter) params.status = statusFilter;       // e.g. PUBLISHED, PENDING_APPROVAL
    if (typeFilter) params.type = typeFilter;           // e.g. SCHOOL_WIDE
    if (debouncedSearch) params.search = debouncedSearch;

    const { data, error: err } = await fetchEvents(params);
    setLoading(false);
    if (err) { setError(err); return; }

    const list = Array.isArray(data) ? data : (data?.data || data?.events || []);
    const pagination = data?.pagination ?? {};
    setEvents(list);
    setTotalPages(pagination.totalPages ?? 1);
    setTotalElements(pagination.totalElements ?? list.length);
  }, [statusFilter, typeFilter, debouncedSearch, page]);

  // Fetch pending count once on mount (not on every filter change)
  useEffect(() => {
    fetchPendingEvents().then(({ data }) => {
      setPendingCount(Array.isArray(data) ? data.length : data?.total ?? data?.pagination?.totalElements ?? 0);
    });
  }, []);

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

  const handleDeleteEvent = async (id) => {
    const { error: err } = await cancelEvent(id);
    return { error: err };
  };

  if (view === "create") {
    navigate("/communication/events/create");
  }

  const published = events.filter((e) => ["PUBLISHED", "APPROVED", "published", "approved"].includes(e.status)).length;
  const upcoming = events.filter((e) => {
    const d = e.startDate || e.date;
    if (!d) return false;
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const cardsArray = [
    { keyName: "Total Events", val: totalElements, IconName: LayoutList, iconTxColor: "text-blue-600", iconBgColor: "bg-blue-50" },
    { keyName: "Published", val: published, IconName: CheckCheck, iconTxColor: "text-green-600", iconBgColor: "bg-green-50" },
    { keyName: "Pending Approval", val: pendingCount, IconName: Timer, iconTxColor: "text-amber-600", iconBgColor: "bg-amber-50" },
    { keyName: "Upcoming (30 Days)", val: upcoming, IconName: TrendingUp, iconTxColor: "text-violet-600", iconBgColor: "bg-violet-50" },
  ];

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-5 gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            <CalendarDays size={20} className="text-blue-600 shrink-0" /> School Events
          </h1>
          <p className="hidden sm:block text-sm text-slate-400 mt-0.5">Plan and manage school-wide and class-specific events.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Show/hide calendar toggle */}
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer
              ${showCalendar
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
          >
            {showCalendar ? <EyeOff size={14} /> : <CalendarDays size={14} />}
            <span className="hidden sm:inline">{showCalendar ? "Hide" : "Show"} Calendar</span>
          </button>
          <button
            onClick={() => setView("create")}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow-md shadow-blue-200 whitespace-nowrap"
          >
            <Plus size={15} /> <span className="hidden sm:inline">Create</span> Event
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        {cardsArray.map((card) => (
          <CardComponent
            key={card.keyName}
            IconName={card.IconName}
            keyName={card.keyName.toUpperCase()}
            val={loading ? "—" : card.val}
            iconTxColor={card.iconTxColor}
            iconBgColor={card.iconBgColor}
          />
        ))}
      </div>

      {/* Calendar — toggleable */}
      {showCalendar && <CalendarStrip events={events} />}

      {error && <ErrorBanner message={error} onRetry={loadEvents} />}

      {/* Events Panel */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="px-4 py-3.5 border-b border-blue-50">
          {/* Mobile */}
          <div className="flex gap-2 sm:hidden">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…"
                className="w-full border border-blue-100 rounded-lg py-2 pl-8 pr-3 text-sm text-slate-700 bg-slate-50 outline-none focus:border-blue-400 transition-colors" />
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-colors shrink-0 ${showFilters ? "border-blue-400 bg-blue-50 text-blue-600" : "border-blue-100 bg-white text-slate-400"}`}>
              <SlidersHorizontal size={13} />
            </button>
            <button onClick={loadEvents} className="flex items-center px-3 py-2 rounded-lg border border-blue-100 bg-white text-slate-400 hover:bg-blue-50 transition-colors shrink-0">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-col gap-2 mt-2 sm:hidden">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="border border-blue-100 rounded-lg py-2 px-3 text-sm text-slate-700 bg-slate-50 outline-none w-full">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                className="border border-blue-100 rounded-lg py-2 px-3 text-sm text-slate-700 bg-slate-50 outline-none w-full">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}

          {/* Desktop */}
          <div className="hidden sm:flex flex-wrap gap-2.5 items-center">
            <div className="relative flex-1 min-w-44 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…"
                className="w-full border border-blue-100 rounded-lg py-2 pl-8 pr-3 text-sm text-slate-700 bg-slate-50 outline-none focus:border-blue-400 transition-colors" />
            </div>
            <div className="relative flex items-center">
              <Filter size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="border border-blue-100 rounded-lg py-2 pl-7 pr-7 text-sm text-slate-700 bg-slate-50 outline-none cursor-pointer appearance-none">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative flex items-center">
              <Filter size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                className="border border-blue-100 rounded-lg py-2 pl-7 pr-7 text-sm text-slate-700 bg-slate-50 outline-none cursor-pointer appearance-none">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={loadEvents} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-100 bg-white text-slate-400 text-sm hover:bg-blue-50 cursor-pointer transition-colors">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Rows */}
        {loading ? (
          <table className="w-full">
            <tbody>
              <ListLoader colSpanSet={6} />
            </tbody>
          </table>
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

        {/* Pagination — 0-based, display as 1-based */}
        {!loading && totalPages > 0 && (
          <div className="px-4 py-3 border-t border-blue-50 flex items-center justify-between flex-wrap gap-2 bg-blue-50/30">
            <span className="text-xs text-slate-400">
              Page {page + 1} of {totalPages} · {totalElements} event{totalElements !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg border border-blue-100 bg-white flex items-center justify-center text-slate-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button className="min-w-8 h-8 rounded-lg border border-blue-600 bg-blue-600 text-white text-sm font-semibold px-2.5 flex items-center justify-center">
                {page + 1}
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-lg border border-blue-100 bg-white flex items-center justify-center text-slate-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event detail modal — separate component */}
      {selectedEvent && (
        <EventDetailModal
          ev={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDeleteEvent={handleDeleteEvent}
          onDeleted={() => { loadEvents(); setSelectedEvent(null); }}
        />
      )}
    </div>
  );
}
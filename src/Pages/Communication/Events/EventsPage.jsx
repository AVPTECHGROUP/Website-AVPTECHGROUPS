import { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, MapPin, Clock, Users, Bell, Plus, Search,
  ChevronDown, CheckCircle2, XCircle, Eye,
  AlertCircle, RefreshCw, CalendarDays, LayoutList,
  CheckCheck, Timer, TrendingUp, ArrowLeft, Upload,
  X, Check, ChevronLeft, ChevronRight, SlidersHorizontal,
  Loader2, Filter, EyeOff, CalendarCheck,
} from "lucide-react";
import CardComponent from '../../../Components/CommonComp/CardComponent';
import ListLoader from '../../../Components/CommonComp/ListLoader';
import {
  fetchEvents, fetchPendingEvents,
  approveEvent, cancelEvent, createEvent,
} from '../../../Api/Communication/CircularApi.js';
import EventDetailModal from '../../../Components/CircularDetailsPopup/EventDetailsModel.jsx';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS as P } from '../../../Constants/Permission';

// ── Helpers ────────────────────────────────────────────────────────────────────
function typeLabel(t) {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getEventDate(ev) {
  return ev.startDatetime || ev.startDate || ev.date || null;
}
function getEventEnd(ev) {
  return ev.endDatetime || ev.endDate || null;
}

function fmtDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return str; }
}

function fmtTime(str) {
  if (!str) return "";
  try {
    return new Date(str).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

function fmtTimeRange(startStr, endStr) {
  const s = fmtTime(startStr);
  if (!s) return null;
  const e = fmtTime(endStr);
  if (!e || e === s) return s;
  return `${s} – ${e}`;
}

const TYPE_ICONS = { SCHOOL_WIDE: "🏫", CLASS_SPECIFIC: "📚" };
const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: "All Status",       value: "" },
  { label: "Published",        value: "PUBLISHED" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Draft",            value: "DRAFT" },
  { label: "Rejected",         value: "REJECTED" },
  { label: "Cancelled",        value: "CANCELLED" },
];
const TYPE_OPTIONS = [
  { label: "All Types",      value: "" },
  { label: "School-Wide",    value: "SCHOOL_WIDE" },
  { label: "Class-Specific", value: "CLASS_SPECIFIC" },
];

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toUpperCase();
  const map = {
    PUBLISHED:        "bg-green-50 text-green-700 border-green-200",
    APPROVED:         "bg-green-50 text-green-700 border-green-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED:        "bg-red-50 text-red-600 border-red-200",
    REJECTED:         "bg-red-50 text-red-600 border-red-200",
    DRAFT:            "bg-blue-50 text-blue-600 border-blue-200",
  };
  const labels = {
    PUBLISHED: "Published", APPROVED: "Approved",
    PENDING_APPROVAL: "Pending Approval", CANCELLED: "Cancelled",
    REJECTED: "Rejected", DRAFT: "Draft",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${map[s] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {(s === "PUBLISHED" || s === "APPROVED") && <CheckCircle2 size={10} />}
      {s === "PENDING_APPROVAL" && <Timer size={10} />}
      {(s === "CANCELLED" || s === "DRAFT" || s === "REJECTED") && <XCircle size={10} />}
      {labels[s] || status}
    </span>
  );
}

function EmptyState({ message = "No events found." }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-slate-400">
      <CalendarDays size={40} className="mb-3 text-blue-200" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      <AlertCircle size={15} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 bg-white text-red-600 text-xs cursor-pointer hover:bg-red-50">
          <RefreshCw size={11} /> Retry
        </button>
      )}
    </div>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────────
function CalendarStrip({ events, selectedDate, onDateSelect }) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const firstDay = base.getDay();
  const monthLabel = base.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const statusPriority = (s) => {
    const u = s?.toUpperCase();
    if (u === "PENDING_APPROVAL") return 3;
    if (u === "PUBLISHED" || u === "APPROVED") return 2;
    if (u === "REJECTED" || u === "CANCELLED") return 1;
    return 0;
  };

  const eventMap = {};
  (events || []).forEach((ev) => {
    const d = getEventDate(ev);
    if (!d) return;
    const key = new Date(d).toDateString();
    const pri = statusPriority(ev.status);
    const existing = eventMap[key];
    const s = ev.status?.toUpperCase();
    const color = (s === "PENDING_APPROVAL") ? "bg-amber-400"
      : (s === "PUBLISHED" || s === "APPROVED") ? "bg-green-500"
      : "bg-red-400";
    if (!existing || pri > existing.priority) {
      eventMap[key] = { priority: pri, color, events: existing?.events || [] };
    }
    if (!eventMap[key].events) eventMap[key].events = [];
    eventMap[key].events.push(ev);
    eventMap[key].count = (eventMap[key].count || 0) + 1;
  });

  const todayStr = now.toDateString();
  const selectedStr = selectedDate ? new Date(selectedDate).toDateString() : null;

  const totalEventsThisMonth = Object.keys(eventMap).filter((k) => {
    const d = new Date(k);
    return d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear();
  }).reduce((sum, k) => sum + (eventMap[k].count || 0), 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(base.getFullYear(), base.getMonth(), d);
    const ds = date.toDateString();
    cells.push({ d, date, isToday: ds === todayStr, isSelected: ds === selectedStr, eventInfo: eventMap[ds] || null, isSunday: date.getDay() === 0 });
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const selectedDayEvents = selectedDate
    ? (eventMap[new Date(selectedDate).toDateString()]?.events || [])
    : [];

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
              {totalEventsThisMonth} event{totalEventsThisMonth !== 1 ? "s" : ""} this month
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {[["bg-green-400","Published"],["bg-amber-400","Pending"],["bg-red-400","Rejected"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${c} inline-block`} />
                <span className="text-blue-100 text-xs font-medium">{l}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setOffset((p) => p - 1)}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => { setOffset(0); onDateSelect && onDateSelect(null); }}
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

      {/* Grid */}
      <div className="bg-gradient-to-b from-blue-50 to-white p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((d, i) => (
            <div key={i} className={`text-center py-1.5 text-xs font-bold uppercase tracking-wide rounded-md
              ${i === 0 ? "text-red-500 bg-red-50" : "text-blue-700 bg-blue-100/70"}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            const hasEvents = !!c.eventInfo;
            return (
              <div key={i}
                onClick={() => hasEvents && onDateSelect && onDateSelect(c.isSelected ? null : c.date.toISOString())}
                className={`relative rounded-lg sm:rounded-xl py-2 sm:py-3 px-1 text-center transition-all
                  ${c.isSelected
                    ? "bg-blue-700 shadow-lg ring-2 ring-blue-400 ring-offset-1 scale-105"
                    : c.isToday
                      ? "bg-blue-600 shadow-md shadow-blue-200 ring-2 ring-blue-400 ring-offset-1"
                      : hasEvents
                        ? "bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm cursor-pointer hover:scale-105"
                        : c.isSunday
                          ? "bg-red-50 border border-red-100"
                          : "bg-white border border-blue-100 hover:bg-blue-50/50"
                  }`}
              >
                <div className={`text-xs sm:text-sm font-bold leading-none
                  ${c.isSelected || c.isToday ? "text-white" : c.isSunday ? "text-red-500" : "text-slate-700"}`}>
                  {c.d}
                </div>
                {c.eventInfo && !c.isToday && !c.isSelected && (
                  <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${c.eventInfo.color}`} />
                )}
                {c.eventInfo && (c.isToday || c.isSelected) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 mx-auto mt-1" />
                )}
                {c.eventInfo?.count > 1 && !c.isToday && !c.isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {c.eventInfo.count}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex sm:hidden items-center justify-center gap-4 mt-3 pt-3 border-t border-blue-100">
          {[["bg-green-500","Published"],["bg-amber-400","Pending"],["bg-red-400","Rejected"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${c} inline-block`} />
              <span className="text-slate-500 text-xs">{l}</span>
            </div>
          ))}
        </div>

        {selectedDate && selectedDayEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <CalendarCheck size={14} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">
                  {fmtDate(selectedDate)} · {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <button onClick={() => onDateSelect(null)}
                className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                <X size={11} /> Clear
              </button>
            </div>
            <div className="space-y-2">
              {selectedDayEvents.map((ev, i) => {
                const start = getEventDate(ev);
                const end = getEventEnd(ev);
                const timeStr = fmtTimeRange(start, end);
                return (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-blue-100 px-3 py-2.5 hover:border-blue-300 transition-colors">
                    <span className="text-xl shrink-0">{TYPE_ICONS[ev.type] || "📅"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{ev.title || "Untitled"}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {timeStr && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={10} className="text-blue-400" /> {timeStr}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
                            <MapPin size={10} className="text-blue-400" /> {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Column header ──────────────────────────────────────────────────────────────
function EventListHeader() {
  return (
    <div className="hidden sm:grid px-5 py-2.5 border-b border-gray-100 bg-gray-50/80"
             style={{ gridTemplateColumns: "40% 25% 15% 20%" }}>
      <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Event</span>
      <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</span>
      <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
      <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</span>
    </div>
  );
}

// ── Event Row ──────────────────────────────────────────────────────────────────
// canApprove prop controls whether approve/reject buttons render.
function EventRow({ ev, onApprove, onCancel, onView, approving, cancelling, canApprove }) {
  const startDate = getEventDate(ev);
  const endDate   = getEventEnd(ev);
  const timeStr   = fmtTimeRange(startDate, endDate);
  const isPending = ev.status === "PENDING_APPROVAL" || ev.status === "pending";

  // ── ROLE GUARD: show approve/reject only when user has access AND event is pending ──
  const showApproveActions = canApprove && isPending;

  return (
    <div className="border-b border-gray-100 hover:bg-slate-50/60 transition-colors last:border-b-0">

      {/* Desktop row */}
      <div className="hidden sm:grid px-5 py-4 items-center gap-4"
        style={{ gridTemplateColumns: "2fr 1.3fr 0.9fr 1fr" }}>

        {/* Col 1: Icon + Title + Tags */}
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[ev.type] || "📅"}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{ev.title || "Untitled Event"}</p>
            {ev.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {typeLabel(ev.type)}
              </span>
              {(ev.targets || ev.targetGroups)?.map?.((tg, i) => {
                const label = tg?.targetType
                  ? tg.targetType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                  : tg;
                return (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 2: Date + Time + Location */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar size={12} className="text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-700">{fmtDate(startDate)}</span>
          </div>
          {timeStr && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} className="text-blue-400 shrink-0" />
              <span>{timeStr}</span>
            </div>
          )}
          {ev.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={12} className="text-blue-400 shrink-0" />
              <span className="truncate max-w-[140px]">{ev.location}</span>
            </div>
          )}
        </div>

        {/* Col 3: Status */}
        <div className="flex items-center">
          <StatusBadge status={ev.status} />
        </div>

        {/* Col 4: Actions */}
        <div className="flex items-center justify-end gap-1.5">
          {showApproveActions && (
            <>
              <button onClick={() => onApprove(ev.id)} disabled={approving} title="Approve"
                className="w-8 h-8 rounded-lg border border-green-200 bg-white hover:bg-green-50 flex items-center justify-center cursor-pointer transition-all shadow-sm">
                {approving
                  ? <Loader2 size={13} className="animate-spin text-green-600" />
                  : <Check size={13} className="text-green-600" />}
              </button>
              <button onClick={() => onCancel(ev.id)} disabled={cancelling} title="Reject"
                className="w-8 h-8 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all shadow-sm">
                {cancelling
                  ? <Loader2 size={13} className="animate-spin text-red-500" />
                  : <X size={13} className="text-red-500" />}
              </button>
            </>
          )}
          <button onClick={() => onView(ev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-600 text-xs font-semibold hover:bg-blue-50 cursor-pointer transition-colors shadow-sm">
            <Eye size={12} /> View
          </button>
        </div>
      </div>

      {/* Mobile row */}
      <div className="sm:hidden px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <span className="text-xl shrink-0">{TYPE_ICONS[ev.type] || "📅"}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{ev.title || "Untitled"}</p>
              {ev.description && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>
              )}
            </div>
          </div>
          <StatusBadge status={ev.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 pl-9">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar size={11} className="text-blue-400" />
            {fmtDate(startDate)}
          </span>
          {timeStr && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} className="text-blue-400" /> {timeStr}
            </span>
          )}
          {ev.location && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={11} className="text-blue-400" /> {ev.location}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pl-9">
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {typeLabel(ev.type)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {showApproveActions && (
              <>
                <button onClick={() => onApprove(ev.id)} disabled={approving}
                  className="w-7 h-7 rounded-lg border border-green-200 bg-white hover:bg-green-50 flex items-center justify-center cursor-pointer">
                  {approving ? <Loader2 size={12} className="animate-spin text-green-600" /> : <Check size={12} className="text-green-600" />}
                </button>
                <button onClick={() => onCancel(ev.id)} disabled={cancelling}
                  className="w-7 h-7 rounded-lg border border-red-200 bg-white hover:bg-red-50 flex items-center justify-center cursor-pointer">
                  {cancelling ? <Loader2 size={12} className="animate-spin text-red-500" /> : <X size={12} className="text-red-500" />}
                </button>
              </>
            )}
            <button onClick={() => onView(ev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-white text-blue-600 text-xs font-semibold hover:bg-blue-50 cursor-pointer">
              <Eye size={11} /> View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Events Page ───────────────────────────────────────────────────────────
export default function EventsPage() {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission(P.EVENT_APPROVE);
  const canCreate  = hasPermission(P.EVENT_CREATE);

  const [view,            setView]            = useState("events");
  const [events,          setEvents]          = useState([]);
  const [pendingCount,    setPendingCount]    = useState(0);
  const [totalPages,      setTotalPages]      = useState(1);
  const [totalElements,   setTotalElements]   = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [typeFilter,      setTypeFilter]      = useState("");
  const [selectedEvent,   setSelectedEvent]   = useState(null);
  const [actionLoading,   setActionLoading]   = useState({});
  const [page,            setPage]            = useState(0);
  const [showFilters,     setShowFilters]     = useState(false);
  const [showCalendar,    setShowCalendar]    = useState(true);
  const [selectedDate,    setSelectedDate]    = useState(null);

  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 700);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError(null);
    const params = { page, size: PER_PAGE };
    if (statusFilter)    params.status = statusFilter;
    if (typeFilter)      params.type   = typeFilter;
    if (debouncedSearch) params.search = debouncedSearch;

    const { data, error: err } = await fetchEvents(params);
    setLoading(false);
    if (err) { setError(err); return; }

    const list = Array.isArray(data) ? data
      : Array.isArray(data?.data) ? data.data
      : (data?.events || []);

    const pagination = data?.pagination ?? {};
    setEvents(list);
    setTotalPages(pagination.totalPages ?? 1);
    setTotalElements(pagination.totalElements ?? list.length);
  }, [statusFilter, typeFilter, debouncedSearch, page]);

  useEffect(() => {
    fetchPendingEvents().then(({ data }) => {
      setPendingCount(
        Array.isArray(data) ? data.length
          : data?.total ?? data?.pagination?.totalElements ?? 0
      );
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

  const published = events.filter((e) =>
    ["PUBLISHED", "APPROVED", "published", "approved"].includes(e.status)
  ).length;

  const upcoming = events.filter((e) => {
    const d = getEventDate(e);
    if (!d) return false;
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const cardsArray = [
    { keyName: "Total Events",       val: totalElements, IconName: LayoutList,  iconTxColor: "text-blue-600",   iconBgColor: "bg-blue-50"   },
    { keyName: "Published",          val: published,     IconName: CheckCheck,  iconTxColor: "text-green-600",  iconBgColor: "bg-green-50"  },
    { keyName: "Pending Approval",   val: pendingCount,  IconName: Timer,       iconTxColor: "text-amber-600",  iconBgColor: "bg-amber-50"  },
    { keyName: "Upcoming (30 Days)", val: upcoming,      IconName: TrendingUp,  iconTxColor: "text-violet-600", iconBgColor: "bg-violet-50" },
  ];

  const displayedEvents = selectedDate
    ? events.filter((ev) => {
        const d = getEventDate(ev);
        return d && new Date(d).toDateString() === new Date(selectedDate).toDateString();
      })
    : events;

  return (
    <div className="min-h-screen bg-[#f0f4f9] p-4 md:p-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-5 gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">School Events</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Plan and manage school-wide and class-specific events.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer
              ${showCalendar ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {showCalendar ? <EyeOff size={14} /> : <CalendarDays size={14} />}
            <span className="hidden sm:inline">{showCalendar ? "Hide" : "Show"} Calendar</span>
          </button>
          {canCreate && (
            <button
              onClick={() => setView("create")}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={15} /> <span className="hidden sm:inline">Create</span> Event
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {cardsArray.map((card) => (
          <CardComponent
            key={card.keyName}
            IconName={card.IconName}
            keyName={card.keyName}
            val={loading ? "—" : card.val}
            iconTxColor={card.iconTxColor}
            iconBgColor={card.iconBgColor}
          />
        ))}
      </div>

      {/* Calendar */}
      {showCalendar && (
        <CalendarStrip
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      )}

      {error && <ErrorBanner message={error} onRetry={loadEvents} />}

      {/* Events Panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="px-4 py-3.5 border-b border-gray-100">
          {selectedDate && (
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <CalendarCheck size={12} />
                Showing events on {fmtDate(selectedDate)}
                <button onClick={() => setSelectedDate(null)} className="ml-1 text-blue-400 hover:text-blue-700 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

          {/* Mobile */}
          <div className="flex gap-2 sm:hidden">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="w-full border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-sm text-gray-700 bg-gray-50 outline-none focus:border-blue-400" />
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-colors shrink-0
                ${showFilters ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-200 bg-white text-gray-400"}`}>
              <SlidersHorizontal size={13} />
            </button>
            <button onClick={loadEvents}
              className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 shrink-0">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-col gap-2 mt-2 sm:hidden">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 bg-gray-50 outline-none w-full">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 bg-gray-50 outline-none w-full">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}

          {/* Desktop */}
          <div className="hidden sm:flex flex-wrap gap-2.5 items-center">
            <div className="relative flex-1 min-w-44 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="w-full border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-sm text-gray-700 bg-gray-50 outline-none focus:border-blue-400" />
            </div>
            <div className="relative flex items-center">
              <Filter size={12} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="border border-gray-200 rounded-lg py-2 pl-7 pr-7 text-sm text-gray-700 bg-gray-50 outline-none cursor-pointer appearance-none">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex items-center">
              <Filter size={12} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                className="border border-gray-200 rounded-lg py-2 pl-7 pr-7 text-sm text-gray-700 bg-gray-50 outline-none cursor-pointer appearance-none">
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={loadEvents}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-sm hover:bg-gray-50 cursor-pointer">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <EventListHeader />

        {loading ? (
          <table className="w-full"><tbody><ListLoader colSpanSet={6} /></tbody></table>
        ) : displayedEvents.length === 0 ? (
          <EmptyState message={
            selectedDate
              ? `No events on ${fmtDate(selectedDate)}.`
              : "No events found. Try adjusting your filters."
          } />
        ) : (
          displayedEvents.map((ev, i) => (
            <EventRow
              key={ev.id || i}
              ev={ev}
              onApprove={handleApprove}
              onCancel={handleCancel}
              onView={setSelectedEvent}
              approving={!!actionLoading[`approve_${ev.id}`]}
              cancelling={!!actionLoading[`cancel_${ev.id}`]}
              canApprove={canApprove}
            />
          ))
        )}

        {/* Pagination */}
        {!loading && !selectedDate && totalPages > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 bg-gray-50/50">
            <span className="text-xs text-gray-400">
              Page {page + 1} of {totalPages} · {totalElements} event{totalElements !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <button className="min-w-8 h-8 rounded-lg border border-blue-600 bg-blue-600 text-white text-sm font-semibold px-2.5 flex items-center justify-center">
                {page + 1}
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event detail modal */}
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
// pages/NotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Bell, RefreshCw, CheckCheck, AlertCircle, Inbox } from "lucide-react";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import CardLoader from "../../../Components/CommonComp/CardLoader";
import { getNotifications } from "../../../Api/Notification";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function kindIcon(type) {
  if (!type) return "🔔";
  const t = type.toLowerCase();
  if (t.includes("circular")) return "📜";
  if (t.includes("event"))    return "📅";
  return "🔔";
}

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function extractItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 animate-pulse">
    <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0" />
    <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="h-3.5 bg-gray-200 rounded w-2/5" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
    <div className="h-3 w-12 bg-gray-100 rounded shrink-0 mt-1" />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [page,    setPage]    = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  const loadNotifications = useCallback(async (pageNum = 0, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({ page: pageNum, size: PAGE_SIZE, sort: "Id" });
      const raw  = extractItems(data);
      const items = raw.map((n) => ({
        id:     n.id,
        unread: !n.read,
        kind:   n.type ?? "notification",
        title:  n.title ?? n.subject ?? "Notification",
        sub:    n.body  ?? n.message  ?? "",
        time:   relativeTime(n.createdAt ?? n.sentAt),
      }));
      setNotifs((prev) => append ? [...prev, ...items] : items);
      setHasMore(data?.last === false ? true : items.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(0, false); }, [loadNotifications]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadNotifications(next, true);
  };

  const unread     = notifs.filter((n) => n.unread).length;
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, unread: false })));
  const markRead    = (id) => setNotifs((p) => p.map((x) => x.id === id ? { ...x, unread: false } : x));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    // Same outer shell as Timetable & ApprovalQueue
    <div className="min-h-screen bg-[#f0f4f9] p-4 md:p-6">

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">In-app notification feed and push delivery tracking.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button
            onClick={() => { setPage(0); loadNotifications(0, false); }}
            className="text-red-600 hover:text-red-800 font-semibold text-sm shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main white card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <Bell size={15} className="text-gray-500 shrink-0" />
          <span className="text-sm font-bold text-gray-800 flex-1">Notification Feed</span>

          {unread > 0 && (
            <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {unread} unread
            </span>
          )}

          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition shrink-0"
          >
            <CheckCheck size={13} />
            <span className="hidden sm:inline">Mark all read</span>
          </button>

          <button
            onClick={() => { setPage(0); loadNotifications(0, false); }}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition shrink-0"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Skeleton — initial load */}
        {loading && notifs.length === 0 && (
          <div>
            {Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Inbox size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">You're all caught up</p>
          </div>
        )}

        {/* Notification rows */}
        {notifs.map((n, i) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`flex items-start gap-3 px-4 sm:px-5 py-3.5 cursor-pointer transition-colors
              ${i < notifs.length - 1 ? 'border-b border-gray-50' : ''}
              ${n.unread ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50/70'}`}
          >
            {/* Unread dot */}
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors ${n.unread ? 'bg-blue-500' : 'bg-transparent'}`} />

            {/* Icon badge */}
            <div className={`w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-base shrink-0
              ${n.kind?.toLowerCase().includes('circular') ? 'bg-blue-50' : 'bg-violet-50'}`}>
              {kindIcon(n.kind)}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${n.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                {n.title}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{n.sub}</p>
            </div>

            {/* Time */}
            <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
          </div>
        ))}

        {/* Load more button */}
        {hasMore && !loading && notifs.length > 0 && (
          <div className="px-4 py-3.5 text-center border-t border-gray-50">
            <button
              onClick={loadMore}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 bg-blue-50 hover:bg-blue-100 px-5 py-1.5 rounded-lg transition"
            >
              Load more
            </button>
          </div>
        )}

        {/* Inline loading spinner for load-more */}
        {loading && notifs.length > 0 && (
          <div className="px-4 py-3 text-center border-t border-gray-50">
            <span className="text-xs text-gray-400">Loading…</span>
          </div>
        )}
      </div>
    </div>
  );
}
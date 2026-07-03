// pages/NotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Bell, RefreshCw, CheckCheck, AlertCircle, Inbox } from "lucide-react";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import CardLoader from "../../../Components/CommonComp/CardLoader";
import { getNotifications } from "../../../Api/Communication/Notification";

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

// ─── Responsive Skeleton Row (Matches updated UI structure) ───────────────────
const SkeletonRow = () => (
  <div className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 py-4 border-b border-gray-50 animate-pulse">
    <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0" />
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2.5 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="h-3.5 bg-gray-200 rounded w-2/5" />
        <div className="h-2.5 bg-gray-100 rounded w-12 shrink-0" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
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

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 w-full overflow-x-hidden px-3 py-4 sm:p-6 md:p-8 lg:p-12 transition-all duration-200">
      
      {/* Container Constraints for Desktop/Laptop viewports */}
      <div className="max-w-4xl xl:max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 ">
        
        {/* Header Section */}
        <div className="flex flex-col gap-1 px-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            In-app notification feed and push delivery tracking.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm mx-1">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span className="text-xs sm:text-sm text-red-700 flex-1 font-medium">{error}</span>
            <button
              onClick={() => { setPage(0); loadNotifications(0, false); }}
              className="text-red-600 hover:text-red-800 font-bold text-xs sm:text-sm shrink-0 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Feed Box */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mx-1">
          
          {/* Responsive Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2 min-w-0">
              <Bell size={16} className="text-gray-500 shrink-0 hidden xs:inline" />
              <span className="text-sm sm:text-base font-bold text-gray-800 truncate">
                Notification Feed
              </span>
              {unread > 0 && (
                <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  {unread} <span className="hidden xs:inline">unread</span>
                </span>
              )}
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <CheckCheck size={15} className="shrink-0" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>

              <button
                onClick={() => { setPage(0); loadNotifications(0, false); }}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                <RefreshCw size={14} className={`shrink-0 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Skeleton Initialization Frame */}
          {loading && notifs.length === 0 && (
            <div className="divide-y divide-gray-50">
              {Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {/* Empty Inbox Flag */}
          {!loading && !error && notifs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Inbox size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold text-sm sm:text-base">No notifications yet</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">You're all caught up</p>
            </div>
          )}

          {/* Notification List Container */}
          <div className="divide-y divide-gray-50">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 cursor-pointer transition-all duration-150 w-full
                  ${n.unread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-gray-50/60'}`}
              >
                {/* Status Indicator Dot */}
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-transform duration-200
                  ${n.unread ? 'bg-blue-500 scale-100' : 'bg-transparent scale-0'}`} 
                />

                {/* Context-aware Icon Badge */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-100 flex items-center justify-center text-base sm:text-lg shrink-0
                  ${n.kind?.toLowerCase().includes('circular') ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                  {kindIcon(n.kind)}
                </div>

                {/* Unified Content Frame */}
                <div className="flex-1 min-w-0">
                  {/* Dynamic Header Block: Title + Timestamp Alignment */}
                  <div className="flex items-start justify-between gap-3 w-full">
                    <p className={`text-sm sm:text-base leading-snug break-words pr-1
                      ${n.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium shrink-0 mt-0.5 whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                  
                  {/* Subtitle Message Body */}
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1 break-words">
                    {n.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Trigger Container */}
          {hasMore && !loading && notifs.length > 0 && (
            <div className="px-4 py-4 text-center bg-gray-50/30 border-t border-gray-50">
              <button
                onClick={loadMore}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 bg-blue-50 hover:bg-blue-100/80 px-6 py-2 rounded-lg shadow-sm transition active:scale-95"
              >
                Load more
              </button>
            </div>
          )}

          {/* Sequential Bottom Loader */}
          {loading && notifs.length > 0 && (
            <div className="px-4 py-4 text-center border-t border-gray-50 bg-gray-50/20">
              <span className="text-xs sm:text-sm font-medium text-gray-400 animate-pulse">
                Loading older notifications…
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { Bell, RefreshCw, CheckCheck, AlertCircle, Inbox } from "lucide-react";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import CardLoader from "../../../Components/CommonComp/CardLoader";
import { getNotifications } from "../../../Api/Communication/Notification";
import COMMUNICATION_CONSTS from '../../../Constants/StringConstants/CommunicationConstants';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function kindIcon(type) {
  if (!type) return COMMUNICATION_CONSTS.NOTIFICATION_KIND_ICON.DEFAULT;
  const t = type.toLowerCase();
  if (t.includes("circular")) return COMMUNICATION_CONSTS.NOTIFICATION_KIND_ICON.CIRCULAR;
  if (t.includes("event")) return COMMUNICATION_CONSTS.NOTIFICATION_KIND_ICON.EVENT;
  return COMMUNICATION_CONSTS.NOTIFICATION_KIND_ICON.DEFAULT;
}

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.TIME_JUST_NOW;
  if (mins < 60) return COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.TIME_MINS(mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.TIME_HRS(hrs);
  const days = Math.floor(hrs / 24);
  return days === 1 ? COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.TIME_YESTERDAY : COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.TIME_DAYS(days);
}

function extractItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = useCallback(async (pageNum = 0, isRefresh = false) => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotifications({
        page: pageNum,
        size: COMMUNICATION_CONSTS.PAGINATION.NOTIFICATIONS_PAGE_SIZE,
        sort: COMMUNICATION_CONSTS.NOTIFICATION_SORT_FIELD,
        order: "desc",
      });

      const data = res?.data || res;
      const itemsRaw = extractItems(data);

      const mapped = itemsRaw.map((n) => ({
        id: n.id,
        title: n.title || COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.FALLBACK_TITLE,
        sub: n.message || n.content || "",
        time: relativeTime(n.createdAt || n.created_at),
        unread: !n.isRead && !n.read,
        kind: n.notificationType || n.type || COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.FALLBACK_KIND,
      }));

      setNotifs((prev) => (isRefresh ? mapped : [...prev, ...mapped]));
      setHasMore(mapped.length === COMMUNICATION_CONSTS.PAGINATION.NOTIFICATIONS_PAGE_SIZE);
      setPage(pageNum);

      // if (isRefresh) {
      //   const totalUnread = data?.unreadCount ?? mapped.filter(x => x.unread).length;
      //   setUnreadCount(totalUnread);
      // }
    } catch (err) {
      console.error("Notifications fetch error:", err);
      setError(COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.LOAD_ERROR_DEFAULT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(0, true);
  }, [loadData]);

  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
    loadData(0, true);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    loadData(page + 1, false);
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6 bg-linear-to-b from-sky-50 to-sky-100">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.TITLE}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.SUBTITLE}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition shadow-sm cursor-pointer"
              >
                <CheckCheck size={14} />
                {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.MARK_ALL_READ}
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
            >
              <RefreshCw size={14} className={loading && page === 0 ? "animate-spin text-blue-500" : ""} />
              {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.REFRESH}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => loadData(0, true)} className="text-xs font-bold text-red-600 hover:underline px-2 py-1 cursor-pointer">
              {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.RETRY}
            </button>
          </div>
        )}

        {/* Main Feed Container */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">

          {/* Feed Header */}
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-white/50 flex items-center justify-between backdrop-blur-sm sticky top-0 z-10">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-400" />
              {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.FEED_LABEL}
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {unreadCount} {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.UNREAD_SUFFIX}
              </span>
            )}
          </div>

          {/* Feed List */}
          <div className="divide-y divide-gray-50">
            {loading && page === 0 ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-50 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.EMPTY_TITLE}</h3>
                <p className="text-sm text-gray-500">{COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.EMPTY_SUBTITLE}</p>
              </div>
            ) : notifs.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 sm:gap-4 p-4 sm:p-5 transition duration-200 group hover:bg-gray-50/80 ${n.unread ? "bg-blue-50/20" : ""}`}
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-xs border 
                  ${n.unread ? "bg-white border-blue-100 shadow-blue-100/50" : "bg-gray-50 border-gray-100 shadow-gray-100/50"}`}
                >
                  {kindIcon(n.kind)}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className={`text-sm sm:text-[15px] leading-snug truncate pr-2 ${n.unread ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium shrink-0 mt-0.5 whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1 break-words">
                    {n.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMore && !loading && notifs.length > 0 && (
            <div className="px-4 py-4 text-center bg-gray-50/30 border-t border-gray-50">
              <button
                onClick={loadMore}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 bg-blue-50 hover:bg-blue-100/80 px-6 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.LOAD_MORE}
              </button>
            </div>
          )}

          {loading && notifs.length > 0 && (
            <div className="px-4 py-4 text-center border-t border-gray-50 bg-gray-50/20">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {COMMUNICATION_CONSTS.NOTIFICATIONS_PAGE_TEXT.LOADING_OLDER}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
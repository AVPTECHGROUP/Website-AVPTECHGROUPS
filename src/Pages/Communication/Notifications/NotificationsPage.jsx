// pages/NotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { getNotifications } from "../../../Api/Notification";

const T = {
  bg: "#f5f7fa", white: "#ffffff", border: "#e8ecf0", borderLight: "#f0f2f5",
  blue: "#2563eb", blueLight: "#eff6ff", blueMid: "#dbeafe",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  red: "#dc2626", redBg: "#fef2f2",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

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
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

// safely extract array from any backend shape
function extractItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

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

      const raw = extractItems(data);

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

  useEffect(() => {
    loadNotifications(0, false);
  }, [loadNotifications]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadNotifications(next, true);
  };

  const unread = notifs.filter((n) => n.unread).length;
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, unread: false })));
  const markRead = (id) => setNotifs((p) => p.map((x) => x.id === id ? { ...x, unread: false } : x));

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 24, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", color: T.text }}>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Notifications</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "4px 0 0" }}>In-app notification feed and push delivery tracking.</p>
      </div>

      {/* Feed — full width, no right panel */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: "#fafbfc" }}>
          <span style={{ fontSize: 16 }}>🔔</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>Notification Feed</span>
          {unread > 0 && (
            <span style={{ background: T.redBg, color: T.red, border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 9 }}>
              {unread} unread
            </span>
          )}
          <button onClick={markAllRead}
            style={{ fontSize: 12.5, color: T.blue, fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            Mark all read
          </button>
          <button onClick={() => { setPage(0); loadNotifications(0, false); }}
            style={{ fontSize: 12.5, color: T.textSub, fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            ↻ Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "14px 18px", color: T.red, fontSize: 13 }}>⚠️ {error}</div>
        )}

        {/* Loading */}
        {loading && notifs.length === 0 && (
          <div style={{ padding: "40px 18px", color: T.textMuted, fontSize: 13, textAlign: "center" }}>
            Loading notifications…
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifs.length === 0 && (
          <div style={{ padding: "40px 18px", color: T.textMuted, fontSize: 13, textAlign: "center" }}>
            No notifications yet.
          </div>
        )}

        {/* Items */}
        {notifs.map((n, i) => (
          <div key={n.id} onClick={() => markRead(n.id)}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 18px", borderBottom: i < notifs.length - 1 ? `1px solid ${T.borderLight}` : "none", cursor: "pointer", background: n.unread ? "#f0f7ff" : "transparent", transition: "background .12s" }}
            onMouseEnter={(e) => !n.unread && (e.currentTarget.style.background = "#fafbff")}
            onMouseLeave={(e) => !n.unread && (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.unread ? T.blue : "transparent", flexShrink: 0, marginTop: 5 }} />
            <div style={{ width: 36, height: 36, borderRadius: 9, background: n.kind?.toLowerCase().includes("circular") ? T.blueLight : "#f5f3ff", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
              {kindIcon(n.kind)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: n.unread ? 700 : 500, color: T.text, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.sub}</div>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, flexShrink: 0, marginTop: 2 }}>{n.time}</div>
          </div>
        ))}

        {/* Load more */}
        {hasMore && !loading && notifs.length > 0 && (
          <div style={{ padding: "14px 18px", textAlign: "center" }}>
            <button onClick={loadMore}
              style={{ fontSize: 12.5, color: T.blue, fontWeight: 600, cursor: "pointer", background: "none", border: `1px solid ${T.blueMid}`, padding: "6px 18px", borderRadius: 7 }}>
              Load more
            </button>
          </div>
        )}

        {loading && notifs.length > 0 && (
          <div style={{ padding: "10px 18px", textAlign: "center", fontSize: 12, color: T.textMuted }}>Loading…</div>
        )}
      </div>
    </div>
  );
}
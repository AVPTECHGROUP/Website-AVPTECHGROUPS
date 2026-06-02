import { useState } from "react";

const T = {
  bg: "#f5f7fa", white: "#ffffff", border: "#e8ecf0", borderLight: "#f0f2f5",
  blue: "#2563eb", blueLight: "#eff6ff", blueMid: "#dbeafe",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  red: "#dc2626", redBg: "#fef2f2",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const NOTIFS = [
  { id:1, unread:true,  kind:"circular", title:"📢 Annual Sports Day — Parent Invitation", sub:"All parents and staff are cordially invited to the Annual Sports Day event to be held on 15 December 2025…", time:"2m ago" },
  { id:2, unread:true,  kind:"event",    title:"🗓 Science Exhibition — Class 9 & 10", sub:"Annual Science Exhibition on 19 Dec 2025 at School Auditorium", time:"1h ago" },
  { id:3, unread:false, kind:"circular", title:"Class 10-A Parent–Teacher Meeting", sub:"PTM scheduled for Saturday, 1st June 2025, 10:00 AM – 1:00 PM", time:"3h ago" },
  { id:4, unread:false, kind:"event",    title:"Republic Day Celebration 2025", sub:"All staff and students to report by 7:45 AM on 26th January", time:"Yesterday" },
  { id:5, unread:false, kind:"circular", title:"School Timing Update — Summer Schedule", sub:"School hours updated to 7:30 AM – 12:30 PM from 1st June", time:"2 days ago" },
  { id:6, unread:false, kind:"circular", title:"Library Book Return Notice", sub:"All borrowed books must be returned by 31st May 2025", time:"3 days ago" },
];

const DELIVERY = [
  { label: "Total Recipients",    value: 642,  color: T.blue,  icon: "👥" },
  { label: "FCM Mobile (Parents)",value: 421,  color: T.green, icon: "📱" },
  { label: "FCM Web (Staff)",     value: 186,  color: T.green, icon: "🌐" },
  { label: "In-App",              value: 186,  color: T.green, icon: "🔔" },
  { label: "Failed",              value: 35,   color: T.red,   icon: "⚠️", divider: true },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const unread = notifs.filter((n) => n.unread).length;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 24, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", color: T.text }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Notifications</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "4px 0 0" }}>In-app notification feed and push delivery tracking.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>

        {/* ── Left: Feed ── */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: "#fafbfc" }}>
            <span style={{ fontSize: 16 }}>🔔</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>Notification Feed</span>
            {unread > 0 && (
              <span style={{ background: T.redBg, color: T.red, border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 9 }}>
                {unread} unread
              </span>
            )}
            <button onClick={() => setNotifs((p) => p.map((n) => ({ ...n, unread: false })))}
              style={{ fontSize: 12.5, color: T.blue, fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
              Mark all read
            </button>
          </div>

          {/* Items */}
          {notifs.map((n, i) => (
            <div key={n.id} onClick={() => setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 18px", borderBottom: i < notifs.length - 1 ? `1px solid ${T.borderLight}` : "none", cursor: "pointer", transition: "background .12s", background: n.unread ? "#f0f7ff" : "transparent" }}
              onMouseEnter={(e) => !n.unread && (e.currentTarget.style.background = "#fafbff")}
              onMouseLeave={(e) => !n.unread && (e.currentTarget.style.background = "transparent")}>
              {/* Unread dot */}
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.unread ? T.blue : "transparent", flexShrink: 0, marginTop: 5 }} />
              {/* Icon */}
              <div style={{ width: 36, height: 36, borderRadius: 9, background: n.kind === "circular" ? T.blueLight : "#f5f3ff", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                {n.kind === "circular" ? "📜" : "📅"}
              </div>
              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: n.unread ? 700 : 500, color: T.text, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.sub}</div>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, flexShrink: 0, marginTop: 2 }}>{n.time}</div>
            </div>
          ))}
        </div>

        {/* ── Right ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Delivery report */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, boxShadow: T.shadow }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>📊 Delivery Report</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>Annual Sports Day Circular · 24 May 2025</div>

            {/* Progress bar total */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                <span>Success rate</span><span style={{ fontWeight: 700, color: T.green }}>94.5%</span>
              </div>
              <div style={{ height: 6, background: T.border, borderRadius: 9 }}>
                <div style={{ height: 6, background: T.green, borderRadius: 9, width: "94.5%" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DELIVERY.map((d) => (
                <div key={d.label}>
                  {d.divider && <div style={{ height: 1, background: T.border, margin: "4px 0" }} />}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.textSub, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 18 }}>{d.icon}</span>{d.label}
                    </span>
                    <span style={{ fontWeight: 700, color: d.color }}>{d.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch flow */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, boxShadow: T.shadow }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>🔀 Dispatch Flow</div>
            {[
              { n:1, title:"Circular / Event published",     sub:"" },
              { n:2, title:"Event listener fires (async)",    sub:"Spring @ApplicationModuleListener" },
              { n:3, title:"Batch FCM multicast",             sub:"500 tokens per call" },
              { n:4, title:"Delivery recorded in DB",         sub:"", done:true },
            ].map((s, i, arr) => (
              <div key={s.n}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.done ? T.greenBg : T.blueLight, border: `1px solid ${s.done ? T.greenBorder : T.blueMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.done ? T.green : T.blue, flexShrink: 0, marginTop: 1 }}>
                    {s.n}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 0 : 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{s.title}</div>
                    {s.sub && <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 1 }}>{s.sub}</div>}
                  </div>
                </div>
                {i < arr.length - 1 && <div style={{ marginLeft: 10, borderLeft: `2px dashed ${T.border}`, height: 14 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

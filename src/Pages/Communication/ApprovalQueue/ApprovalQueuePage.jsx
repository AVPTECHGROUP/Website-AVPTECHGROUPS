import { useState } from "react";
import { CircularsAPI, SchoolEventsAPI } from "../../../Api/api";

const T = {
  bg: "#f5f7fa", white: "#ffffff", border: "#e8ecf0", borderLight: "#f0f2f5",
  blue: "#2563eb", blueLight: "#eff6ff", blueMid: "#dbeafe",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#d97706", amberBg: "#fffbeb", amberBorder: "#fde68a",
  red: "#dc2626", redBg: "#fef2f2", redBorder: "#fecaca",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const QUEUE = [
  {
    id: 1, kind: "circular",
    title: "Revised Exam Schedule — Term 2",
    type: "School-Wide", date: "23 May 2025", author: "Ravi Kumar",
    authorRole: "Teacher",
    preview: "Due to unavoidable circumstances, the Term 2 examination schedule has been revised. Parents are requested to ensure students prepare accordingly.",
    targets: [{ label: "All Parents", kind: "all" }, { label: "All Teachers", kind: "staff" }],
    warn: "Approving will instantly send push notifications to all parents and teachers.",
  },
  {
    id: 2, kind: "event",
    title: "Science Exhibition — Class 9 & 10",
    date: "19 Dec 2025 · 10:00 AM", author: "Meena Patel",
    authorRole: "Teacher",
    preview: "Annual Science Exhibition for Class 9 and 10 students at the School Auditorium.",
    targets: [{ label: "Parents of Class 9", kind: "parent" }, { label: "Parents of Class 10", kind: "parent" }],
    warn: "Approving will send push notification to parents of Class 9 & Class 10.",
  },
  {
    id: 3, kind: "circular",
    title: "Fee Payment Reminder — Q3",
    type: "School-Wide", date: "22 May 2025", author: "Anita Sharma",
    authorRole: "Teacher",
    preview: "Reminder to all parents regarding the Q3 fee payment due by 30th May 2025. Late fee will apply after the due date.",
    targets: [{ label: "All Parents", kind: "all" }],
    warn: "Approving will send push notification to all parent devices.",
  },
];

const TARGET_COLORS = {
  all:    { bg: T.blueLight, color: T.blue,    border: T.blueMid },
  staff:  { bg: "#f5f3ff",   color: "#7c3aed", border: "#ddd6fe" },
  parent: { bg: "#fff7ed",   color: "#c2410c", border: "#fed7aa" },
};

export default function ApprovalQueuePage() {
  const [tab, setTab]   = useState("All");
  const [items, setItems] = useState(QUEUE);
  const [actioned, setActioned] = useState(null);

  const tabs = [
    { label: "All",       count: items.length },
    { label: "Circulars", count: items.filter((i) => i.kind === "circular").length },
    { label: "Events",    count: items.filter((i) => i.kind === "event").length },
  ];

  const visible = items.filter((i) => tab === "Circulars" ? i.kind === "circular" : tab === "Events" ? i.kind === "event" : true);

  const handleAction = (id) => {
    setActioned(id);
    setTimeout(() => { setItems((p) => p.filter((i) => i.id !== id)); setActioned(null); }, 500);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 24, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", color: T.text }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Approval Queue</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "4px 0 0" }}>Review and approve pending circulars and events submitted by teachers.</p>
      </div>

      {/* Summary alert */}
      {items.length > 0 && (
        <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.amber }}>{items.length} item{items.length !== 1 ? "s" : ""} awaiting your approval</div>
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 1 }}>Approvals will immediately trigger push notifications to recipients.</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "inline-flex", gap: 4, background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3, marginBottom: 16, boxShadow: T.shadow }}>
        {tabs.map((t) => (
          <button key={t.label} onClick={() => setTab(t.label)}
            style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: tab === t.label ? T.blue : "transparent", color: tab === t.label ? "#fff" : T.textSub, transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
            {t.label}
            <span style={{ padding: "1px 6px", borderRadius: 9, fontSize: 10, fontWeight: 700, background: tab === t.label ? "rgba(255,255,255,.25)" : T.blueLight, color: tab === t.label ? "#fff" : T.blue }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.length === 0 && (
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "48px 20px", textAlign: "center", boxShadow: T.shadow }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>All clear!</div>
            <div style={{ fontSize: 12.5, color: T.textSub, marginTop: 4 }}>No pending items in this category.</div>
          </div>
        )}

        {visible.map((item) => (
          <div key={item.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.amber}`, borderRadius: 12, padding: 20, boxShadow: T.shadow, transition: "opacity .4s", opacity: actioned === item.id ? 0.3 : 1 }}>
            {/* Row 1: title + kind badge */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: item.kind === "circular" ? T.blueLight : "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${T.border}` }}>
                {item.kind === "circular" ? "📜" : "📅"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text }}>{item.title}</div>
                  <span style={{ padding: "2px 9px", borderRadius: 9, fontSize: 11, fontWeight: 700, background: item.kind === "circular" ? T.blueLight : "#f5f3ff", color: item.kind === "circular" ? T.blue : "#7c3aed", border: `1px solid ${item.kind === "circular" ? T.blueMid : "#ddd6fe"}` }}>
                    {item.kind === "circular" ? "Circular" : "Event"}
                  </span>
                  <span style={{ padding: "2px 9px", borderRadius: 9, fontSize: 11, fontWeight: 700, background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}>
                    ⏳ Awaiting Approval
                  </span>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: T.textSub, flexWrap: "wrap" }}>
                  {item.type && <span>🌐 {item.type}</span>}
                  <span>📅 {item.date}</span>
                  <span>👤 {item.author} <span style={{ color: T.textMuted }}>({item.authorRole})</span></span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.55, marginBottom: 10, paddingLeft: 52 }}>{item.preview}</div>

            {/* Targets */}
            {item.targets.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, paddingLeft: 52 }}>
                {item.targets.map((tg) => {
                  const cc = TARGET_COLORS[tg.kind];
                  return <span key={tg.label} style={{ padding: "2px 9px", borderRadius: 9, fontSize: 11, fontWeight: 600, background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>{tg.label}</span>;
                })}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: T.borderLight, marginBottom: 12 }} />

            {/* Warning + actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: T.amberBg, borderRadius: 8, border: `1px solid ${T.amberBorder}` }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: T.amber }}>
                    {item.kind === "circular" ? "School-Wide Circular" : "School Event"} — Admin Approval Required
                  </div>
                  <div style={{ fontSize: 12, color: "#92400e", marginTop: 1 }}>{item.warn}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleAction(item.id)}
                  style={{ padding: "8px 20px", borderRadius: 8, background: T.green, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  ✓ Approve & Notify
                </button>
                <button onClick={() => handleAction(item.id)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: T.white, color: T.red, border: `1px solid ${T.redBorder}`, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  ✕ Reject
                </button>
                <button style={{ padding: "8px 12px", borderRadius: 8, background: "#f9fafb", color: T.textSub, border: `1px solid ${T.border}`, fontSize: 13, cursor: "pointer" }}>View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

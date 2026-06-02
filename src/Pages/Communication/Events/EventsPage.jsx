import { useState } from "react";
import { SchoolEventsAPI } from "../../../Api/api";

const T = {
  bg: "#f5f7fa", white: "#ffffff", border: "#e8ecf0", borderLight: "#f0f2f5",
  blue: "#2563eb", blueLight: "#eff6ff", blueMid: "#dbeafe",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#d97706", amberBg: "#fffbeb", amberBorder: "#fde68a",
  red: "#dc2626", redBg: "#fef2f2", redBorder: "#fecaca",
  purple: "#7c3aed", purpleBg: "#f5f3ff", purpleBorder: "#ddd6fe",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const STATS = [
  { label: "Total Events",       value: 11, accent: T.purple, bg: T.purpleBg  },
  { label: "Published",          value: 8,  accent: T.green,  bg: T.greenBg   },
  { label: "Pending Approval",   value: 2,  accent: T.amber,  bg: T.amberBg   },
  { label: "Upcoming (30 days)", value: 3,  accent: T.blue,   bg: T.blueLight },
];

const CAL = [
  { n:"Mon",d:8 },{ n:"Tue",d:9 },{ n:"Wed",d:10 },{ n:"Thu",d:11 },{ n:"Fri",d:12 },
  { n:"Sat",d:13,ev:true,today:true },{ n:"Sun",d:14 },
  { n:"Mon",d:15,ev:true },{ n:"Tue",d:16 },{ n:"Wed",d:17 },{ n:"Thu",d:18 },
  { n:"Fri",d:19,ev:true },{ n:"Sat",d:20 },{ n:"Sun",d:21 },
];

const EVENTS = [
  {
    id: 1, status: "published", type: "School-Wide", icon: "🏆",
    title: "Annual Sports Day 2025",
    date: "15 Dec 2025", time: "9:00 AM – 5:00 PM", location: "School Ground", notified: 720,
    preview: "A grand celebration of athleticism. All students, parents, and staff are invited.",
    targets: [{ label: "All Parents", kind: "all" }, { label: "All Staff", kind: "staff" }],
  },
  {
    id: 2, status: "pending", type: "Class-Specific", icon: "🔬",
    title: "Science Exhibition — Class 9 & 10",
    date: "19 Dec 2025", time: "10:00 AM – 2:00 PM", location: "School Auditorium",
    preview: "Annual Science Exhibition. Students from Class 9 and 10 will present their projects.",
    targets: [{ label: "Parents of Class 9", kind: "parent" }, { label: "Parents of Class 10", kind: "parent" }],
  },
  {
    id: 3, status: "published", type: "School-Wide", icon: "🎭",
    title: "Annual Day Cultural Program",
    date: "22 Dec 2025", time: "5:00 PM – 9:00 PM", location: "School Auditorium", notified: 540,
    preview: "An evening of cultural performances, prize distribution, and celebration.",
    targets: [{ label: "All Parents", kind: "all" }, { label: "All Staff", kind: "staff" }],
  },
];

const TARGET_COLORS = {
  all:    { bg: T.blueLight, color: T.blue,   border: T.blueMid      },
  staff:  { bg: T.purpleBg,  color: T.purple, border: T.purpleBorder },
  parent: { bg: "#fff7ed",   color: "#c2410c", border: "#fed7aa"     },
};

const STATUS_MAP = {
  published: { label: "Published",        bg: T.greenBg, color: T.green, border: T.greenBorder },
  pending:   { label: "Pending Approval", bg: T.amberBg, color: T.amber, border: T.amberBorder },
  cancelled: { label: "Cancelled",        bg: T.redBg,   color: T.red,   border: T.redBorder   },
};

export default function EventsPage() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("All Status");
  const [view, setView]       = useState("list"); // list | calendar

  const rows = EVENTS.filter((e) => {
    if (status === "Published" && e.status !== "published") return false;
    if (status === "Pending"   && e.status !== "pending")   return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 24, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", color: T.text }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>School Events</h1>
          <p style={{ fontSize: 13, color: T.textSub, margin: "4px 0 0" }}>Plan and manage school-wide and class-specific events.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: T.blue, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Create Event
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", boxShadow: T.shadow, borderTop: `3px solid ${s.accent}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.accent }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: T.textSub, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar strip */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16, boxShadow: T.shadow }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>December 2025</div>
          <div style={{ display: "flex", gap: 6, fontSize: 11, color: T.textSub }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: T.blue, display: "inline-block" }} /> Today</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: T.purple, display: "inline-block" }} /> Has event</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {CAL.map((d, i) => (
            <div key={i} style={{ borderRadius: 8, padding: "7px 4px", textAlign: "center", cursor: "pointer", transition: "all .15s",
              background: d.today ? T.blueLight : d.ev ? T.purpleBg : "#fafbfc",
              border: `1px solid ${d.today ? T.blueMid : d.ev ? T.purpleBorder : T.border}` }}>
              <div style={{ fontSize: 9.5, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 1 }}>{d.n}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: d.today ? T.blue : T.text }}>{d.d}</div>
              {d.ev && <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.today ? T.blue : T.purple, margin: "3px auto 0" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Filter + table */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow, overflow: "hidden" }}>
        {/* Filters */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 14 }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…"
              style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 12px 7px 34px", fontSize: 13, color: T.text, outline: "none", background: "#fafbfc", boxSizing: "border-box" }} />
          </div>
          <Sel value={status} onChange={setStatus} opts={["All Status","Published","Pending","Cancelled"]} />
          <Sel value="All Types" onChange={() => {}} opts={["All Types","School-Wide","Class-Specific"]} />
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px 100px", padding: "10px 20px", background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
          {["EVENT", "TYPE", "DATE & TIME", "LOCATION", "STATUS", "ACTION"].map((h) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: ".5px" }}>{h}</div>
          ))}
        </div>

        {rows.map((ev, i) => {
          const s = STATUS_MAP[ev.status];
          return (
            <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 120px 100px", padding: "14px 20px", borderBottom: i < rows.length - 1 ? `1px solid ${T.borderLight}` : "none", alignItems: "start", transition: "background .12s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fafbff"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ paddingRight: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{ev.icon}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{ev.title}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSub, marginBottom: 5 }}>{ev.preview}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {ev.targets.map((tg) => {
                    const cc = TARGET_COLORS[tg.kind];
                    return <span key={tg.label} style={{ padding: "1px 7px", borderRadius: 9, fontSize: 10.5, fontWeight: 600, background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>{tg.label}</span>;
                  })}
                </div>
              </div>
              <div><span style={{ padding: "2px 8px", borderRadius: 6, background: T.blueLight, color: T.blue, fontWeight: 600, fontSize: 11 }}>{ev.type}</span></div>
              <div style={{ fontSize: 12.5, color: T.textSub }}>
                <div style={{ fontWeight: 600, color: T.text }}>{ev.date}</div>
                <div style={{ marginTop: 2 }}>{ev.time}</div>
              </div>
              <div style={{ fontSize: 12.5, color: T.textSub, display: "flex", alignItems: "flex-start", gap: 4 }}>
                📍 {ev.location}
              </div>
              <div>
                <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                  {ev.status === "published" ? "● " : "⏳ "}{s.label}
                </span>
                {ev.notified && <div style={{ fontSize: 10.5, color: T.textMuted, marginTop: 3 }}>🔔 {ev.notified} notified</div>}
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {ev.status === "pending" && <>
                  <Btn2 color={T.green} bg={T.greenBg} border={T.greenBorder}>✓</Btn2>
                  <Btn2 color={T.red} bg={T.redBg} border={T.redBorder}>✕</Btn2>
                </>}
                <button style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.white, color: T.blue, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View</button>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Showing {rows.length} of {EVENTS.length} events</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2].map((p) => (
              <button key={p} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${p === 1 ? T.blue : T.border}`, background: p === 1 ? T.blue : T.white, color: p === 1 ? "#fff" : T.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Btn2({ children, color, bg, border }) {
  const [h, setH] = useState(false);
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${h ? color : border}`, background: h ? bg : T.white, color: h ? color : T.textSub, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
      {children}
    </button>
  );
}

function Sel({ value, onChange, opts }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 28px 7px 12px", fontSize: 13, color: T.text, background: `#fafbfc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center`, outline: "none", cursor: "pointer", appearance: "none" }}>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

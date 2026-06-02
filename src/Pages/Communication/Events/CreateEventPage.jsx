import { useState } from "react";
import { SchoolEventsAPI } from "../../../Api/api";

const T = {
  bg: "#f5f7fa", white: "#ffffff", border: "#e8ecf0", borderLight: "#f0f2f5",
  blue: "#2563eb", blueLight: "#eff6ff", blueMid: "#dbeafe", blueDark: "#1d4ed8",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#d97706", amberBg: "#fffbeb", amberBorder: "#fde68a",
  red: "#dc2626", shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const TARGET_OPTIONS = ["All Staff", "All Teachers", "All Parents", "Class", "Section"];

export default function CreateEventPage() {
  const [form, setForm] = useState({
    title: "Annual Sports Day 2025",
    type: "SCHOOL_WIDE",
    location: "School Ground",
    startDate: "2025-12-15T09:00",
    endDate: "2025-12-15T17:00",
    description: "A grand celebration of athleticism and school spirit. House competitions include relay race, long jump, shot-put and more. Refreshments will be served.",
  });
  const [targets, setTargets] = useState(["All Staff", "All Parents"]);
  const [drag, setDrag] = useState(false);

  const toggleTarget = (t) => setTargets((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inp = { background: "#fafbfc", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", width: "100%", fontFamily: "inherit", boxSizing: "border-box", colorScheme: "light" };
  const lbl = { fontSize: 12.5, fontWeight: 600, color: T.textSub, marginBottom: 6, display: "block" };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 24, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", color: T.text }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer", fontSize: 14, color: T.textSub, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>Create New Event</h1>
            <p style={{ fontSize: 12.5, color: T.textSub, margin: "2px 0 0" }}>Schedule a school event and notify parents, staff, or specific classes.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, maxWidth: 1000 }}>

        {/* ── Left: Form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Basic info */}
          <Card title="Event Details">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Event Title <Req /></label>
                <input style={inp} value={form.title} onChange={set("title")} placeholder="e.g. Annual Sports Day 2025" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Event Type <Req /></label>
                  <select style={{ ...inp, cursor: "pointer", appearance: "none", backgroundImage: chevron, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 }}
                    value={form.type} onChange={set("type")}>
                    <option value="SCHOOL_WIDE">School-Wide</option>
                    <option value="CLASS_SPECIFIC">Class-Specific</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Location</label>
                  <input style={inp} value={form.location} onChange={set("location")} placeholder="e.g. School Ground" />
                </div>
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card title="Date & Time">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Start Date & Time <Req /></label>
                <input type="datetime-local" style={inp} value={form.startDate} onChange={set("startDate")} />
              </div>
              <div>
                <label style={lbl}>End Date & Time <Req /></label>
                <input type="datetime-local" style={inp} value={form.endDate} onChange={set("endDate")} />
              </div>
            </div>
            {/* Duration badge */}
            {form.startDate && form.endDate && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: T.blueLight, borderRadius: 7, border: `1px solid ${T.blueMid}`, fontSize: 12, color: T.blue, fontWeight: 500 }}>
                📅 Duration: {calcDuration(form.startDate, form.endDate)}
              </div>
            )}
          </Card>

          {/* Description */}
          <Card title="Description">
            <label style={lbl}>Event Description</label>
            <textarea style={{ ...inp, resize: "vertical", minHeight: 110, lineHeight: 1.65 }}
              value={form.description} onChange={set("description")} placeholder="Describe the event…" />
          </Card>

          {/* Recipients */}
          <Card title="Target Recipients">
            <label style={lbl}>Who should be notified? <Req /></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {TARGET_OPTIONS.map((t) => {
                const sel = targets.includes(t);
                return (
                  <button key={t} onClick={() => toggleTarget(t)}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${sel ? T.blue : T.border}`, background: sel ? T.blueLight : T.white, color: sel ? T.blue : T.textSub, transition: "all .15s" }}>
                    {sel && "✓ "}{t}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", background: "#fafbfc", borderRadius: 8, border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.textSub }}>Add specific class:</span>
              <select style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, background: T.white, outline: "none", cursor: "pointer" }}>
                <option>-- Select Class --</option>
                <option>Class 10-A</option>
                <option>Class 9-B</option>
                <option>Class 8-C</option>
              </select>
              <button style={{ padding: "5px 12px", borderRadius: 6, background: T.blue, color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>+ Add</button>
            </div>
          </Card>

          {/* Attachments */}
          <Card title="Attachments">
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); }}
              style={{ border: `2px dashed ${drag ? T.blue : T.border}`, borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer", background: drag ? T.blueLight : "#fafbfc", transition: "all .2s" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>☁️</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textSub }}>Click to upload or drag & drop</div>
              <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 3 }}>PDF, Images up to 10 MB</div>
            </div>
          </Card>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost">Cancel</Btn>
            <Btn variant="outline">Save as Draft</Btn>
            <Btn variant="primary">Publish & Notify</Btn>
          </div>
        </div>

        {/* ── Right: Summary ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, boxShadow: T.shadow, position: "sticky", top: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.borderLight}` }}>Event Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SumRow icon="📋" label="Title" value={form.title || "—"} />
              <SumRow icon="🌐" label="Type" value={form.type === "SCHOOL_WIDE" ? "School-Wide" : "Class-Specific"} />
              <SumRow icon="📍" label="Location" value={form.location || "—"} />
              <SumRow icon="📅" label="Date" value={form.startDate ? form.startDate.split("T")[0] : "—"} />
              <SumRow icon="⏰" label="Time" value={form.startDate ? form.startDate.split("T")[1] : "—"} />
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>NOTIFYING</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {targets.length === 0
                  ? <span style={{ fontSize: 12, color: T.textMuted }}>No recipients selected</span>
                  : targets.map((t) => (
                    <span key={t} style={{ padding: "2px 8px", borderRadius: 6, background: T.blueLight, color: T.blue, border: `1px solid ${T.blueMid}`, fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calcDuration(start, end) {
  try {
    const s = new Date(start), e = new Date(end);
    const hrs = Math.round((e - s) / 36e5);
    return hrs < 24 ? `${hrs} hour${hrs !== 1 ? "s" : ""}` : `${Math.round(hrs/24)} day${Math.round(hrs/24) !== 1 ? "s" : ""}`;
  } catch { return "—"; }
}

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

function Req() { return <span style={{ color: T.red, marginLeft: 2 }}>*</span>; }

function Card({ title, children }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, boxShadow: T.shadow }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.borderLight}` }}>{title}</div>
      {children}
    </div>
  );
}

function Btn({ children, variant }) {
  const s = {
    ghost:   { background: T.white,  color: T.textSub, border: `1px solid ${T.border}` },
    outline: { background: T.white,  color: T.text,    border: `1px solid ${T.border}` },
    primary: { background: T.blue,   color: "#fff",    border: "none" },
  };
  return <button style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", ...s[variant] }}>{children}</button>;
}

function SumRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12.5 }}>
      <span>{icon}</span>
      <span style={{ color: T.textMuted, width: 58, flexShrink: 0 }}>{label}</span>
      <span style={{ color: T.text, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

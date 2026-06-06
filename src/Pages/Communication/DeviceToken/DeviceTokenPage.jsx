import { useState } from "react";

const T = {
  bg: "#f5f7fa", white: "#ffffff", border: "#e8ecf0", borderLight: "#f0f2f5",
  blue: "#2563eb", blueLight: "#eff6ff", blueMid: "#dbeafe",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#d97706", amberBg: "#fffbeb", amberBorder: "#fde68a",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const STAFF_FLOW = [
  { num: 1, title: "App Login",      desc: "User logs in, receives JWT from auth endpoint" },
  { num: 2, title: "Get FCM Token",  desc: "Firebase SDK returns registration token on app open" },
  { num: 3, title: "Register Token", desc: "Backend upserts by user_id + device_type" },
];

const DEVICE_TYPES = [
  { type: "WEB",     icon: "🌐", desc: "Browser-based push via Firebase Web SDK. Used by staff web app.", who: "Staff" },
  { type: "ANDROID", icon: "🤖", desc: "Android native push via FCM. Used by parent & teacher mobile apps.", who: "Both" },
  { type: "IOS",     icon: "🍎", desc: "iOS native push via APNs through FCM. Used by parent & teacher iOS apps.", who: "Both" },
];

export default function DeviceTokenPage() {
  const [staffToken, setStaffToken]   = useState("");
  const [parentToken, setParentToken] = useState("");
  const [staffDevice, setStaffDevice]   = useState("WEB");
  const [parentDevice, setParentDevice] = useState("ANDROID");
  const [staffStatus, setStaffStatus]   = useState(null); // null | "success" | "error"
  const [parentStatus, setParentStatus] = useState(null);

  const testStaff = () => { setStaffStatus("success"); setTimeout(() => setStaffStatus(null), 3000); };
  const testParent = () => { setParentStatus("success"); setTimeout(() => setParentStatus(null), 3000); };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 24, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", color: T.text }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Device Token Registration</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "4px 0 0" }}>Register FCM tokens for staff and parent devices to enable push notifications.</p>
      </div>

      {/* Info banner */}
      <div style={{ background: T.blueLight, border: `1px solid ${T.blueMid}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
        <div style={{ fontSize: 12.5, color: T.blue, lineHeight: 1.55 }}>
          <strong>How it works:</strong> After login, the app receives an FCM token from Firebase. This token must be registered with the server so the backend can send targeted push notifications. Call the registration on every app open as FCM tokens can rotate.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Staff registration */}
        <TokenCard
          title="Staff / Teacher Token"
          icon="👔"
          subtitle="Register FCM tokens for staff logged in on the web or teacher mobile app."
          tokenValue={staffToken}
          onTokenChange={setStaffToken}
          deviceValue={staffDevice}
          onDeviceChange={setStaffDevice}
          deviceOptions={["WEB", "ANDROID", "IOS"]}
          onTest={testStaff}
          status={staffStatus}
          noteText="Tokens are upserted — one record per user + device type combination."
        />

        {/* Parent registration */}
        <TokenCard
          title="Parent Token"
          icon="🏠"
          subtitle="Register FCM tokens for parents logged in via the parent mobile app."
          tokenValue={parentToken}
          onTokenChange={setParentToken}
          deviceValue={parentDevice}
          onDeviceChange={setParentDevice}
          deviceOptions={["ANDROID", "IOS"]}
          onTest={testParent}
          status={parentStatus}
          noteText="Call this every time the parent app opens, as tokens can rotate. Unique per parent + device type."
          noteType="warning"
        />
      </div>

      {/* Flow steps */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: T.shadow }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 16 }}>Registration Flow</div>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          {STAFF_FLOW.map((s, i) => (
            <>
              <div key={s.num} style={{ flex: 1, background: "#fafbfc", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.blueLight, border: `1.5px solid ${T.blueMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: T.blue, marginBottom: 10 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              {i < STAFF_FLOW.length - 1 && (
                <div key={`arr-${i}`} style={{ display: "flex", alignItems: "center", color: T.textMuted, fontSize: 18, flexShrink: 0 }}>→</div>
              )}
            </>
          ))}
        </div>
      </div>

      {/* Device type reference */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, boxShadow: T.shadow }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 14 }}>Device Type Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {DEVICE_TYPES.map((d) => (
            <div key={d.type} style={{ background: "#fafbfc", border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{d.icon}</span>
                <code style={{ fontSize: 13, fontWeight: 700, color: T.blue, background: T.blueLight, padding: "2px 8px", borderRadius: 5 }}>{d.type}</code>
                <span style={{ marginLeft: "auto", background: T.blueLight, color: T.blue, fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 9 }}>{d.who}</span>
              </div>
              <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.55 }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TokenCard({ title, icon, subtitle, tokenValue, onTokenChange, deviceValue, onDeviceChange, deviceOptions, onTest, status, noteText, noteType = "info" }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, boxShadow: T.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: T.textSub, marginBottom: 16, lineHeight: 1.5 }}>{subtitle}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 5, display: "block" }}>FCM Token</label>
          <input value={tokenValue} onChange={(e) => onTokenChange(e.target.value)}
            placeholder="Paste FCM registration token here…"
            style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: T.text, outline: "none", background: "#fafbfc", boxSizing: "border-box", fontFamily: "'Courier New', monospace" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 5, display: "block" }}>Device Type</label>
          <div style={{ display: "flex", gap: 6 }}>
            {deviceOptions.map((opt) => (
              <button key={opt} onClick={() => onDeviceChange(opt)}
                style={{ flex: 1, padding: "7px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${deviceValue === opt ? T.blue : T.border}`, background: deviceValue === opt ? T.blueLight : T.white, color: deviceValue === opt ? T.blue : T.textSub, transition: "all .15s" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test button + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
        <button onClick={onTest} style={{ padding: "8px 18px", borderRadius: 8, background: T.blue, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Test Registration
        </button>
        {status === "success" && (
          <span style={{ fontSize: 12.5, color: T.green, fontWeight: 600 }}>✓ Token registered successfully</span>
        )}
        {status === "error" && (
          <span style={{ fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>✕ Registration failed</span>
        )}
      </div>

      {/* Note */}
      <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: noteType === "warning" ? T.amberBg : T.blueLight, border: `1px solid ${noteType === "warning" ? T.amberBorder : T.blueMid}`, fontSize: 12, color: noteType === "warning" ? T.amber : T.blue, lineHeight: 1.5 }}>
        💡 {noteText}
      </div>
    </div>
  );
}

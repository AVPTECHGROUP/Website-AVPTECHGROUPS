import { useState } from "react";
import {
  STUDENT_STRENGTH_OPTIONS,
  COUNTRY_CODES,
  initialForm,
} from "./constants";
import { submitDemoRequest } from "../../Api/DemorequestApi";

export default function DemoRequestForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null); // { kind: "success" | "fail", message }
  
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }
    if (!form.schoolName.trim() || form.schoolName.trim().length < 2) {
      nextErrors.schoolName = "Please enter your school's name.";
    }
    const digitsOnly = form.phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length < 6) {
      nextErrors.phoneNumber = "Please enter a valid phone number.";
    }
    if (!form.studentStrength) {
      nextErrors.studentStrength = "Please select your student strength.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    console.log("handleSubmit called =================>");
    e.preventDefault();
    setBanner(null);

    if (!validate()) {
      setBanner({ kind: "fail", message: "Please fix the highlighted fields and try again." });
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      schoolName: form.schoolName.trim(),
      phoneNumber: form.countryCode + form.phoneNumber.replace(/\D/g, ""),
      studentStrength: form.studentStrength,
    };

      console.log("handleSubmit called payload =================>", payload);

    setLoading(true);
    try {
      const json = await submitDemoRequest(payload);
      console.log("handleSubmit api called json =================>", json);
      setBanner({
        kind: "success",
        message:
          json.message ||
          "Thank you! We've received your request and will contact you within 24 hours.",
      });
      setForm(initialForm);
    } catch (err) {
      setBanner({
        kind: "fail",
        message: err.message || "We couldn't reach the server. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ss-page">
      <style>{css}</style>

      <nav className="ss-nav">
        <div className="ss-brand">
          <span className="ss-dot" /> SchoolSpine
        </div>
        <a className="ss-cta-link" href="#demo-form">
          Book a demo →
        </a>
      </nav>

      <section className="ss-hero">
        <div>
          <span className="ss-eyebrow">● Now onboarding schools for the 2026–27 session</span>
          <h1>
            Run your school
            <br />
            on <em>one</em> screen.
          </h1>
          <p className="ss-lede">
            Admissions, attendance, fees, and staff — one platform your front
            office will actually enjoy using. Tell us a bit about your school
            and we'll set up a walkthrough built around your workflow.
          </p>
          <div className="ss-roll-stats">
            <div>
              <span className="num">1,200+</span>
              <span className="lbl">schools onboarded</span>
            </div>
            <div>
              <span className="num">24 hrs</span>
              <span className="lbl">avg. response time</span>
            </div>
            <div>
              <span className="num">4.8/5</span>
              <span className="lbl">admin satisfaction</span>
            </div>
          </div>
        </div>

        <div className="ss-card" id="demo-form">
          <h2>Book your free demo</h2>
          <p className="ss-sub">
            Fill this in — someone from our team will call you within 24 hours.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={`ss-field ${errors.fullName ? "error" : ""}`}>
              <label htmlFor="fullName">
                Your full name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                autoComplete="name"
                placeholder="e.g. Anjali Sharma"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
              />
              {errors.fullName && <span className="err-msg">{errors.fullName}</span>}
            </div>

            <div className={`ss-field ${errors.schoolName ? "error" : ""}`}>
              <label htmlFor="schoolName">
                School name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="schoolName"
                autoComplete="organization"
                placeholder="e.g. Sunrise Public School"
                value={form.schoolName}
                onChange={(e) => updateField("schoolName", e.target.value)}
              />
              {errors.schoolName && <span className="err-msg">{errors.schoolName}</span>}
            </div>

            <div className={`ss-field ${errors.phoneNumber ? "error" : ""}`}>
              <label htmlFor="phoneNumber">
                Phone number <span className="req">*</span>
              </label>
              <div className="ss-phone-row">
                <select
                  value={form.countryCode}
                  onChange={(e) => updateField("countryCode", e.target.value)}
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  value={form.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                />
              </div>
              {errors.phoneNumber && <span className="err-msg">{errors.phoneNumber}</span>}
            </div>

            <div className={`ss-field ${errors.studentStrength ? "error" : ""}`}>
              <label htmlFor="studentStrength">
                Number of students <span className="req">*</span>
              </label>
              <select
                id="studentStrength"
                value={form.studentStrength}
                onChange={(e) => updateField("studentStrength", e.target.value)}
              >
                <option value="" disabled>
                  Select a range
                </option>
                {STUDENT_STRENGTH_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.studentStrength && (
                <span className="err-msg">{errors.studentStrength}</span>
              )}
            </div>

            <button type="submit" className={`ss-submit ${loading ? "loading" : ""}`} disabled={loading}>
              <span className="btn-label">Request my demo</span>
              <span className="spinner" />
            </button>

            {banner && (
              <div className={`ss-status-banner show ${banner.kind}`}>{banner.message}</div>
            )}

            <p className="ss-privacy-note">
              We'll only use these details to set up your demo call. No spam.
            </p>
          </form>
        </div>
      </section>

      <footer>© 2026 SchoolSpine. Built for schools that would rather teach than do paperwork.</footer>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root{
  --ink:#12261F;
  --ink-soft:#3C5248;
  --paper:#F6F4EC;
  --paper-raised:#FFFFFF;
  --line:#D8D3C2;
  --gold:#D6A34C;
  --gold-deep:#B8842F;
  --green-deep:#0E1F19;
  --green-mid:#1F3D31;
  --error:#B3452C;
  --radius:14px;
}

.ss-page{
  background:var(--paper);
  color:var(--ink);
  font-family:'Manrope', sans-serif;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
}

.ss-page h1, .ss-page h2{
  font-family:'Fraunces', serif;
  font-weight:600;
  margin:0;
  letter-spacing:-0.01em;
}

.ss-nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:24px 6vw;
  border-bottom:1px solid var(--line);
}
.ss-brand{
  display:flex;
  align-items:center;
  gap:10px;
  font-family:'Fraunces', serif;
  font-weight:600;
  font-size:1.25rem;
}
.ss-dot{
  width:10px;height:10px;border-radius:50%;
  background:var(--gold);
  box-shadow:0 0 0 3px rgba(214,163,76,0.25);
}
.ss-cta-link{
  font-size:0.85rem;
  font-weight:700;
  text-decoration:none;
  color:inherit;
  border-bottom:2px solid var(--gold);
  padding-bottom:2px;
}

.ss-hero{
  display:grid;
  grid-template-columns:1.1fr 0.9fr;
  gap:5vw;
  padding:7vw 6vw 5vw;
  align-items:start;
}
.ss-eyebrow{
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-family:'IBM Plex Mono', monospace;
  font-size:0.72rem;
  text-transform:uppercase;
  letter-spacing:0.12em;
  color:var(--gold-deep);
  background:rgba(214,163,76,0.14);
  padding:6px 12px;
  border-radius:999px;
  margin-bottom:22px;
}
.ss-hero h1{
  font-size:clamp(2.3rem, 4.4vw, 3.6rem);
  line-height:1.06;
}
.ss-hero h1 em{ font-style:italic; color:var(--gold-deep); }
.ss-lede{
  margin-top:22px;
  font-size:1.08rem;
  line-height:1.65;
  color:var(--ink-soft);
  max-width:46ch;
}
.ss-roll-stats{
  display:flex;
  gap:34px;
  margin-top:40px;
  flex-wrap:wrap;
}
.ss-roll-stats div{ border-left:2px solid var(--line); padding-left:14px; }
.ss-roll-stats .num{
  font-family:'Fraunces', serif;
  font-size:1.7rem;
  font-weight:600;
  display:block;
}
.ss-roll-stats .lbl{ font-size:0.78rem; color:var(--ink-soft); }

.ss-card{
  background:var(--paper-raised);
  border:1px solid var(--line);
  border-radius:var(--radius);
  padding:36px;
  box-shadow:0 24px 48px -28px rgba(18,38,31,0.28);
  position:relative;
  overflow:hidden;
}
.ss-card::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:5px;
  background:linear-gradient(90deg, var(--gold), var(--green-mid));
}
.ss-card h2{ font-size:1.5rem; margin-bottom:6px; }
.ss-sub{ font-size:0.9rem; color:var(--ink-soft); margin-bottom:26px; }

.ss-field{ margin-bottom:18px; display:flex; flex-direction:column; gap:7px; }
.ss-field label{ font-size:0.82rem; font-weight:700; color:var(--ink); }
.ss-field .req{ color:var(--gold-deep); }
.ss-field input, .ss-field select{
  font-family:'Manrope', sans-serif;
  font-size:0.98rem;
  padding:12px 14px;
  border:1.5px solid var(--line);
  border-radius:9px;
  background:#FCFBF7;
  color:var(--ink);
  outline:none;
  transition:border-color .15s ease, box-shadow .15s ease;
  width:100%;
}
.ss-field input:focus, .ss-field select:focus{
  border-color:var(--gold-deep);
  box-shadow:0 0 0 4px rgba(214,163,76,0.16);
}
.ss-field.error input, .ss-field.error select{ border-color:var(--error); }
.ss-field .err-msg{ font-size:0.78rem; color:var(--error); }

.ss-phone-row{ display:flex; gap:8px; }
.ss-phone-row select{ flex:0 0 96px; }
.ss-phone-row input{ flex:1; }

.ss-submit{
  width:100%;
  margin-top:6px;
  padding:14px 20px;
  background:var(--green-deep);
  color:var(--paper);
  border:none;
  border-radius:9px;
  font-family:'Manrope', sans-serif;
  font-weight:700;
  font-size:1rem;
  cursor:pointer;
  transition:background .15s ease, transform .1s ease;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
}
.ss-submit:hover{ background:var(--green-mid); }
.ss-submit:active{ transform:scale(0.99); }
.ss-submit:disabled{ opacity:0.6; cursor:not-allowed; }

.spinner{
  width:16px;height:16px;
  border:2px solid rgba(246,244,236,0.4);
  border-top-color:var(--paper);
  border-radius:50%;
  display:none;
  animation:ss-spin .7s linear infinite;
}
.ss-submit.loading .spinner{ display:inline-block; }
.ss-submit.loading .btn-label{ display:none; }
@keyframes ss-spin{ to{ transform:rotate(360deg); } }

.ss-status-banner{
  margin-top:16px;
  padding:14px 16px;
  border-radius:9px;
  font-size:0.88rem;
  line-height:1.5;
}
.ss-status-banner.success{
  background:rgba(31,61,49,0.08);
  border:1px solid rgba(31,61,49,0.25);
  color:var(--green-deep);
}
.ss-status-banner.fail{
  background:rgba(179,69,44,0.08);
  border:1px solid rgba(179,69,44,0.3);
  color:var(--error);
}

.ss-privacy-note{
  margin-top:16px;
  font-size:0.74rem;
  color:#8C8778;
  text-align:center;
}

.ss-page footer{
  padding:26px 6vw 40px;
  font-size:0.78rem;
  color:var(--ink-soft);
  border-top:1px solid var(--line);
  text-align:center;
}

@media (max-width: 880px){
  .ss-hero{ grid-template-columns:1fr; padding:12vw 6vw 6vw; }
  .ss-roll-stats{ gap:24px; }
}
`;
import { useContext, useState } from "react";
import {
  STUDENT_STRENGTH_OPTIONS,
  COUNTRY_CODES,
  initialForm,
} from "../../Constants/Demorequestconstant";
import { submitDemoRequest } from "../../Api/DemorequestApi";
import { UserContext } from "../../ContextAPI/UserContext";

// Field wrapper classes are shared across every input in the form, so the
// error-state / dark-mode variants are composed once instead of repeated
// per field.
function fieldInputClasses({ hasError, isDark }) {
  const base =
    "w-full font-sans text-[0.98rem] px-3.5 py-3 rounded-[9px] border-[1.5px] outline-none transition-colors duration-150 focus:shadow-[0_0_0_4px_rgba(214,163,76,0.16)]";

  const surface = isDark
    ? "bg-white/[0.04] text-[#F1EFE6] placeholder:text-slate-500"
    : "bg-[#FCFBF7] text-[#12261F] placeholder:text-slate-400";

  const border = hasError
    ? "border-[#B3452C] focus:border-[#B3452C]"
    : isDark
    ? "border-white/10 focus:border-[#D6A34C]/70"
    : "border-[#D8D3C2] focus:border-[#B8842F]";

  return `${base} ${surface} ${border}`;
}

export default function DemoRequestForm() {
  const { theme } = useContext(UserContext);
  const isDark = theme === "dark";

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
    if (digitsOnly.length < 10 ) {
      nextErrors.phoneNumber = "Please enter a valid phone number.";
    }
    if (!form.studentStrength) {
      nextErrors.studentStrength = "Please select your student strength.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
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

    setLoading(true);
    try {
      const json = await submitDemoRequest(payload);
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

  const labelClasses = `text-[0.82rem] font-bold ${isDark ? "text-[#F1EFE6]" : "text-[#12261F]"}`;
  const mutedText = isDark ? "text-slate-400" : "text-[#3C5248]";

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
        isDark ? "bg-[#0B1410] text-[#F1EFE6]" : "bg-[#F6F4EC] text-[#12261F]"
      }`}
    >
      {/*
        Fraunces / Manrope / IBM Plex Mono are referenced below via Tailwind's
        font-['...'] arbitrary syntax. Load them once, globally, e.g. in
        public/index.html <head> or your global src/index.css:

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

        Keeping the <link> in the document head (not a <style> block in this
        component) is what lets every page share one font download instead
        of re-declaring @import per component.
      */}

      <nav
        className={`flex items-center justify-between px-[6vw] py-6 border-b transition-colors duration-300 ${
          isDark ? "border-white/10" : "border-[#D8D3C2]"
        }`}
      >
        <div className="flex items-center gap-2.5 font-['Fraunces',serif] font-semibold text-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D6A34C] shadow-[0_0_0_3px_rgba(214,163,76,0.25)]" />
          SchoolSpine
        </div>
        <a
          href="#demo-form"
          className="text-[0.85rem] font-bold text-inherit no-underline border-b-2 border-[#D6A34C] pb-0.5"
        >
          Book a demo →
        </a>
      </nav>

      <section className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-[5vw] px-[6vw] pt-[12vw] pb-[6vw] md:pt-[7vw] md:pb-[5vw] items-start">
        <div>
          <span
            className={`inline-flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-[0.72rem] uppercase tracking-[0.12em] text-[#D6A34C] px-3 py-1.5 rounded-full mb-[22px] ${
              isDark ? "bg-[#D6A34C]/[0.12]" : "bg-[#D6A34C]/[0.14] text-[#B8842F]"
            }`}
          >
            ● Now onboarding schools for the 2026–27 session
          </span>
          <h1 className="font-['Fraunces',serif] font-semibold text-[clamp(2.3rem,4.4vw,3.6rem)] leading-[1.06] m-0">
            Run your school
            <br />
            on <em className="italic text-[#D6A34C]">one</em> screen.
          </h1>
          <p className={`mt-[22px] text-[1.08rem] leading-[1.65] max-w-[46ch] ${mutedText}`}>
            Admissions, attendance, fees, and staff — one platform your front
            office will actually enjoy using. Tell us a bit about your school
            and we'll set up a walkthrough built around your workflow.
          </p>
          <div className="flex gap-[24px] md:gap-[34px] mt-10 flex-wrap">
            {[
              { num: "1,200+", lbl: "schools onboarded" },
              { num: "24 hrs", lbl: "avg. response time" },
              { num: "4.8/5", lbl: "admin satisfaction" },
            ].map(({ num, lbl }) => (
              <div
                key={num}
                className={`border-l-2 pl-3.5 ${isDark ? "border-white/15" : "border-[#D8D3C2]"}`}
              >
                <span className="font-['Fraunces',serif] text-[1.7rem] font-semibold block">{num}</span>
                <span className={`text-[0.78rem] ${mutedText}`}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          id="demo-form"
          className={`relative overflow-hidden rounded-[14px] p-9 border transition-colors duration-300 before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[5px] before:bg-gradient-to-r before:from-[#D6A34C] before:to-[#1F3D31] ${
            isDark
              ? "bg-white/[0.03] border-white/10 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.6)]"
              : "bg-white border-[#D8D3C2] shadow-[0_24px_48px_-28px_rgba(18,38,31,0.28)]"
          }`}
        >
          <h2 className="font-['Fraunces',serif] font-semibold text-2xl mb-1.5">Book your free demo</h2>
          <p className={`text-sm mb-[26px] ${mutedText}`}>
            Fill this in — someone from our team will call you within 24 hours.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-[18px] flex flex-col gap-[7px]">
              <label htmlFor="fullName" className={labelClasses}>
                Your full name <span className="text-[#D6A34C]">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                autoComplete="name"
                placeholder="e.g. Anjali Sharma"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={fieldInputClasses({ hasError: Boolean(errors.fullName), isDark })}
              />
              {errors.fullName && (
                <span className="text-[0.78rem] text-[#B3452C]">{errors.fullName}</span>
              )}
            </div>

            <div className="mb-[18px] flex flex-col gap-[7px]">
              <label htmlFor="schoolName" className={labelClasses}>
                School name <span className="text-[#D6A34C]">*</span>
              </label>
              <input
                type="text"
                id="schoolName"
                autoComplete="organization"
                placeholder="e.g. Sunrise Public School"
                value={form.schoolName}
                onChange={(e) => updateField("schoolName", e.target.value)}
                className={fieldInputClasses({ hasError: Boolean(errors.schoolName), isDark })}
              />
              {errors.schoolName && (
                <span className="text-[0.78rem] text-[#B3452C]">{errors.schoolName}</span>
              )}
            </div>

            <div className="mb-[18px] flex flex-col gap-[7px]">
              <label htmlFor="phoneNumber" className={labelClasses}>
                Phone number <span className="text-[#D6A34C]">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => updateField("countryCode", e.target.value)}
                  aria-label="Country code"
                  className={`${fieldInputClasses({ hasError: false, isDark })} flex-none w-24 cursor-pointer ${
                    isDark ? "" : "bg-[#FCFBF7]"
                  }`}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-white text-slate-900">
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
                  className={`${fieldInputClasses({ hasError: Boolean(errors.phoneNumber), isDark })} flex-1`}
                />
              </div>
              {errors.phoneNumber && (
                <span className="text-[0.78rem] text-[#B3452C]">{errors.phoneNumber}</span>
              )}
            </div>

            <div className="mb-[18px] flex flex-col gap-[7px]">
              <label htmlFor="studentStrength" className={labelClasses}>
                Number of students <span className="text-[#D6A34C]">*</span>
              </label>
              <select
                id="studentStrength"
                value={form.studentStrength}
                onChange={(e) => updateField("studentStrength", e.target.value)}
                className={`${fieldInputClasses({
                  hasError: Boolean(errors.studentStrength),
                  isDark,
                })} cursor-pointer`}
              >
                <option value="" disabled className="bg-white text-slate-900">
                  Select a range
                </option>
                {STUDENT_STRENGTH_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-white text-slate-900">
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.studentStrength && (
                <span className="text-[0.78rem] text-[#B3452C]">{errors.studentStrength}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1.5 px-5 py-3.5 bg-[#0E1F19] text-[#F6F4EC] border-none rounded-[9px] font-sans font-bold text-base cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2.5 hover:bg-[#1F3D31] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[rgba(246,244,236,0.4)] border-t-[#F6F4EC] rounded-full animate-spin" />
              ) : (
                <span>Request my demo</span>
              )}
            </button>

            {banner && (
              <div
                className={`mt-4 px-4 py-3.5 rounded-[9px] text-[0.88rem] leading-relaxed border ${
                  banner.kind === "success"
                    ? isDark
                      ? "bg-[#1F3D31]/30 border-[#1F3D31]/60 text-[#8FD6B4]"
                      : "bg-[#1F3D31]/[0.08] border-[#1F3D31]/[0.25] text-[#0E1F19]"
                    : isDark
                    ? "bg-[#B3452C]/20 border-[#B3452C]/50 text-[#F3A98F]"
                    : "bg-[#B3452C]/[0.08] border-[#B3452C]/[0.3] text-[#B3452C]"
                }`}
              >
                {banner.message}
              </div>
            )}

            <p className={`mt-4 text-[0.74rem] text-center ${isDark ? "text-slate-500" : "text-[#8C8778]"}`}>
              We'll only use these details to set up your demo call. No spam.
            </p>
          </form>
        </div>
      </section>

      <footer
        className={`px-[6vw] pt-[26px] pb-10 text-[0.78rem] text-center border-t transition-colors duration-300 ${
          isDark ? "border-white/10 text-slate-400" : "border-[#D8D3C2] text-[#3C5248]"
        }`}
      >
        © 2026 SchoolSpine. Built for schools that would rather teach than do paperwork.
      </footer>
    </div>
  );
}
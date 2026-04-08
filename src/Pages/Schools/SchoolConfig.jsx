import { useState, useRef, useEffect } from "react";
import {
  School, Phone, Globe, MapPin, Award, Clock,
  Fingerprint, Navigation, Upload, Image as ImageIcon,
  RotateCcw, Save, ChevronDown, CheckCircle, X,
  Settings, CalendarClock, Building2,
  Mail, User, Hash, Calendar, Shield, Zap,
  Info, Wifi, WifiOff, Loader2, AlertCircle,
} from "lucide-react";
import { getSchoolById, updateSchool, uploadSchoolLogo } from "../../Api/SchoolConfig";
import { getAttendanceConfig, updateAttendanceConfig } from "../../Api/SchoolConfig";
import { toast } from "react-toastify";
import { getListOfValues } from "../../Api/ListOfValues";

const TABS = [
  { id: "school", label: "School Info", icon: Settings },
  { id: "attendance", label: "Attendance", icon: CalendarClock },
  { id: "logo", label: "Logo", icon: ImageIcon },
];

const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "IGCSE"];
const STATUSES = ["Active", "Inactive", "Suspended"];

const EMPTY_SCHOOL = {
  name: "", code: "", board: "CBSE",
  establishedYear: "", status: "Active",
  phone: "", email: "",
  website: "", principalName: "",
  address: "", city: "",
  state: "", pincode: "",
  affiliationNumber: "",
  logoUrl: "",
};

const EMPTY_ATTENDANCE = {
  workStartTime: "", gracePeriodMinutes: "",
  faceConfidenceThreshold: "", schoolLatitude: null,
  schoolLongitude: null, allowedRadiusMeters: 0,
  gpsCheckEnabled: false,
};

// ── Validation helpers ────────────────────────────────────────────────────────
const VALIDATORS = {
  name: (v) => {
    if (!v?.trim()) return "School name is required";
    if (v.trim().length < 3) return "Name must be at least 3 characters";
    if (v.trim().length > 100) return "Name must be under 100 characters";
    return null;
  },
  code: (v) => {
    if (!v?.trim()) return "School code is required";
    if (!/^[A-Za-z0-9_-]{2,20}$/.test(v.trim())) return "Code: 2–20 chars, letters/numbers/_ only";
    return null;
  },
  phone: (v) => {
    if (!v) return null;
    const cleaned = v.replace(/[\s\-().+]/g, "");
    if (!/^\d{7,15}$/.test(cleaned)) return "Enter a valid phone number (7–15 digits)";
    return null;
  },
  email: (v) => {
    if (!v) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address";
    return null;
  },

  establishedYear: (v) => {
    if (!v) return null;
    const yr = parseInt(v);
    if (isNaN(yr) || yr < 1800 || yr > new Date().getFullYear())
      return `Year must be between 1800 and ${new Date().getFullYear()}`;
    return null;
  },
  pincode: (v) => {
    if (!v) return null;
    if (!/^\d{6}$/.test(v.trim())) return "Pincode must be exactly 6 digits";
    return null;
  },
  affiliationNumber: (v) => {
    if (!v) return null;
    if (v.trim().length > 50) return "Affiliation number too long";
    return null;
  },
};

function validateSchool(data) {
  const errors = {};
  ["name", "code", "phone", "email", "website", "establishedYear", "pincode", "affiliationNumber"].forEach(k => {
    const err = VALIDATORS[k]?.(data[k]);
    if (err) errors[k] = err;
  });
  return errors;
}

function validateAttendance(data) {
  const errors = {};
  if (!data.workStartTime) errors.workStartTime = "Start time is required";
  if (data.gracePeriodMinutes < 0 || data.gracePeriodMinutes > 120)
    errors.gracePeriodMinutes = "Grace period must be 0–120 minutes";
  if (data.faceConfidenceThreshold < 0 || data.faceConfidenceThreshold > 100)
    errors.faceConfidenceThreshold = "Threshold must be 0–100%";
  if (data.gpsCheckEnabled) {
    if (data.schoolLatitude === null || data.schoolLatitude === "")
      errors.schoolLatitude = "Latitude is required when GPS is enabled";
    else if (isNaN(data.schoolLatitude) || data.schoolLatitude < -90 || data.schoolLatitude > 90)
      errors.schoolLatitude = "Latitude must be between -90 and 90";
    if (data.schoolLongitude === null || data.schoolLongitude === "")
      errors.schoolLongitude = "Longitude is required when GPS is enabled";
    else if (isNaN(data.schoolLongitude) || data.schoolLongitude < -180 || data.schoolLongitude > 180)
      errors.schoolLongitude = "Longitude must be between -180 and 180";
    if (data.allowedRadiusMeters > 10000)
      errors.allowedRadiusMeters = "Radius cannot exceed 10,000 metres";
  }
  return errors;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ── Small reusable primitives ────────────────────────────────────────────────

function FieldError({ error }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium">
      <AlertCircle className="w-3 h-3 shrink-0" />{error}
    </p>
  );
}

function FieldHint({ hint }) {
  if (!hint) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
      <Info className="w-3 h-3 shrink-0" />{hint}
    </p>
  );
}

function Label({ children, required, icon }) {
  return (
    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
      {icon && <span className="text-slate-400">{icon}</span>}
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, disabled, type = "text", placeholder, hasError }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      disabled={disabled}
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      className={`w-full border rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent
        ${disabled
          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
          : hasError
            ? "bg-red-50 border-red-300 text-slate-800 focus:ring-red-400"
            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:ring-blue-500"
        }`}
    />
  );
}

function SelectInput({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="cursor-pointer w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none hover:border-slate-300 transition-colors"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function SaveButton({ saveState, onClick, label = "Save Changes", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || saveState === "saving"}
      className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
        ${saveState === "saved" ? "bg-emerald-600 text-white" :
          saveState === "saving" ? "bg-blue-400 text-white cursor-wait" :
            saveState === "error" ? "bg-red-500 text-white" :
              disabled ? "bg-slate-200 text-slate-400 cursor-not-allowed" :
                "bg-blue-600 hover:bg-blue-700 text-white"}`}
    >
      {saveState === "saved" ? <><CheckCircle className="w-4 h-4" /><span>Saved!</span></> :
        saveState === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></> :
          saveState === "error" ? <><AlertCircle className="w-4 h-4" /><span>Failed</span></> :
            <><Save className="w-4 h-4" /><span>{label}</span></>}
    </button>
  );
}

// ── Section wrapper used inside each tab ─────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-blue-600">{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Stat Card shown in the hero area ─────────────────────────────────────────
function StatCard({ label, value, sub, color = "blue" }) {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className={`${c.bg} rounded-2xl px-4 py-3.5 flex flex-col gap-0.5 min-w-0`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
      <p className={`text-sm font-extrabold ${c.text} truncate`}>{value || "—"}</p>
      {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SchoolConfig() {
  const [activeTab, setActiveTab] = useState("school");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [schoolSaveState, setSchoolSaveState] = useState("idle");
  const [attSaveState, setAttSaveState] = useState("idle");
  const [logoSaveState, setLogoSaveState] = useState("idle");

  const [schoolData, setSchoolData] = useState(EMPTY_SCHOOL);
  const [attendanceData, setAttData] = useState(EMPTY_ATTENDANCE);

  const [schoolErrors, setSchoolErrors] = useState({});
  const [attErrors, setAttErrors] = useState({});
  const [logoError, setLogoError] = useState(null);
  const [boards, setBoards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attFetchError, setAttFetchError] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch school on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadSchool = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const schoolInfo = (() => {
          try { return JSON.parse(localStorage.getItem("school")) || null; }
          catch { return null; }
        })();

        const id = schoolInfo?.id || schoolInfo?.schoolId;
        if (!id) throw new Error("No school selected. Please select a school first.");

        setSchoolId(id);
        const res = await getSchoolById(id);
        const s = res.data;

        const mapped = {
          name: s.name || "",
          code: s.code ?? "",
          board: s.board || "CBSE",
          establishedYear: s.establishedYear ? String(s.establishedYear) : "",
          status: s.status
            ? s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase()
            : "Active",
          phone: s.phone || "",
          email: s.email || "",
          website: s.website || "",
          principalName: s.principalName || "",
          address: s.address || "",
          city: s.city || "",
          state: s.state || "",
          pincode: s.pincode || "",
          affiliationNumber: s.affiliationNumber || "",
          logoUrl: s.logoUrl || "",
        };
        setSchoolData(mapped);
        if (s.logoUrl) setLogoPreview(s.logoUrl);
      } catch (err) {
        console.error("SchoolConfig fetch error:", err);
        setFetchError(err.message || "Failed to load school data.");
      } finally {
        setLoading(false);
      }
    };
    loadSchool();
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await getListOfValues("SCHOOL_BOARD");

        // assuming API returns [{ label: "CBSE", value: "CBSE" }]
        const formatted = res.map(item => item.value || item.label);

        setBoards(formatted);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
        // fallback (optional)
        setBoards(["CBSE", "ICSE"]);
      }
    };

    fetchBoards();
  }, []);

  // ── Fetch attendance when tab opened ──────────────────────────────────────
  useEffect(() => {
    if (!schoolId || activeTab !== "attendance") return;

    const loadAttendance = async () => {
      try {
        setAttLoading(true);
        setAttFetchError(null);

        const res = await getAttendanceConfig(schoolId);
        const ac = res?.data;

        if (ac) {
          setAttData({
            workStartTime: ac.workStartTime || "",
            gracePeriodMinutes: ac.gracePeriodMinutes ?? "",
            faceConfidenceThreshold: ac.faceConfidenceThreshold ?? "",
            schoolLatitude: ac.schoolLatitude ?? null,
            schoolLongitude: ac.schoolLongitude ?? null,
            allowedRadiusMeters: ac.allowedRadiusMeters ?? 0,
            gpsCheckEnabled: ac.gpsCheckEnabled ?? false,
          });
          localStorage.setItem("attendanceConfig", JSON.stringify({
            schoolLatitude: ac.schoolLatitude,
            schoolLongitude: ac.schoolLongitude,
          }));
        } else {
          // No config exists — show empty form, no error banner
          setAttData(EMPTY_ATTENDANCE);
        }
      } catch (err) {
        console.error("Attendance config fetch error:", err);
        // If 404-like: treat as "no config yet" — empty form, no scary error
        const is404 = err?.response?.status === 404 || err?.status === 404;
        if (is404) {
          setAttData(EMPTY_ATTENDANCE);
        } else {
          setAttFetchError(err.message || "Failed to load attendance config.");
          setAttData(EMPTY_ATTENDANCE);
        }
      } finally {
        setAttLoading(false);
      }
    };
    loadAttendance();
  }, [schoolId, activeTab]);

  // ── Field change handlers ──────────────────────────────────────────────────
  const handleSchoolChange = (k, v) => {
    setSchoolData(p => ({ ...p, [k]: v }));
    if (schoolErrors[k]) {
      const err = VALIDATORS[k]?.(v);
      setSchoolErrors(prev => ({ ...prev, [k]: err || undefined }));
    }
  };

  const handleAttendanceChange = (k, v) => {
    setAttData(p => ({ ...p, [k]: v }));
    if (attErrors[k]) setAttErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const handleSaveSchool = async () => {
    if (!schoolId) return;
    const errors = validateSchool(schoolData);
    if (Object.keys(errors).length > 0) { setSchoolErrors(errors); return; }
    setSchoolErrors({});
    setSchoolSaveState("saving");
    try {
      const payload = {
        name: schoolData.name.trim(),
        code: schoolData.code?.trim(),
        board: schoolData.board,
        establishedYear: parseInt(schoolData.establishedYear) || 0,
        status: schoolData.status.toUpperCase(),
        phone: schoolData.phone?.trim() || "",
        email: schoolData.email?.trim() || "",
        website: schoolData.website?.trim() || "",
        principalName: schoolData.principalName?.trim() || "",
        address: schoolData.address?.trim() || "",
        city: schoolData.city?.trim() || "",
        state: schoolData.state?.trim() || "",
        pincode: schoolData.pincode?.trim() || "",
        affiliationNumber: schoolData.affiliationNumber?.trim() || "",
        logoUrl: schoolData.logoUrl || null,
      };
      await updateSchool(schoolId, payload);
      const fresh = await getSchoolById(schoolId);
      const s = fresh.data;
      setSchoolData({
        name: s.name || "",
        code: s.code ?? "",
        board: s.board || "CBSE",
        establishedYear: s.establishedYear ? String(s.establishedYear) : "",
        status: s.status
          ? s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase()
          : "Active",
        phone: s.phone || "",
        email: s.email || "",
        website: s.website || "",
        principalName: s.principalName || "",
        address: s.address || "",
        city: s.city || "",
        state: s.state || "",
        pincode: s.pincode || "",
        affiliationNumber: s.affiliationNumber || "",
        logoUrl: s.logoUrl || "",
      });
      const currentSchool = JSON.parse(localStorage.getItem("school") || "{}");
      localStorage.setItem("school", JSON.stringify({
        ...currentSchool,
        schoolName: s.name,
        schoolCode: s.code,
        logoUrl: s.logoUrl || currentSchool.logoUrl,
      }));
      window.dispatchEvent(new Event("storage"));
      setSchoolSaveState("saved");
      setTimeout(() => setSchoolSaveState("idle"), 2500);
    } catch (err) {
      console.error("School save error:", err);
      setSchoolSaveState("error");
      setTimeout(() => setSchoolSaveState("idle"), 3000);
    }
  };

  // ── Save: Attendance ───────────────────────────────────────────────────────
  const handleSaveAttendance = async () => {
    if (!schoolId) return;
    const errors = validateAttendance(attendanceData);
    if (Object.keys(errors).length > 0) { setAttErrors(errors); return; }
    setAttErrors({});
    setAttSaveState("saving");
    try {
      const payload = {
        workStartTime: attendanceData.workStartTime,
        gracePeriodMinutes: attendanceData.gracePeriodMinutes,
        faceConfidenceThreshold: attendanceData.faceConfidenceThreshold,
        gpsCheckEnabled: attendanceData.gpsCheckEnabled,
        schoolLatitude: attendanceData.gpsCheckEnabled ? attendanceData.schoolLatitude : null,
        schoolLongitude: attendanceData.gpsCheckEnabled ? attendanceData.schoolLongitude : null,
        allowedRadiusMeters: attendanceData.gpsCheckEnabled ? attendanceData.allowedRadiusMeters : 0,
      };
      await updateAttendanceConfig(schoolId, payload);

      // Re-fetch fresh
      try {
        const fresh = await getAttendanceConfig(schoolId);
        const ac = fresh?.data;
        if (ac) {
          setAttData({
            workStartTime: ac.workStartTime || "",
            gracePeriodMinutes: ac.gracePeriodMinutes ?? "",
            faceConfidenceThreshold: ac.faceConfidenceThreshold ?? "",
            schoolLatitude: ac.schoolLatitude ?? null,
            schoolLongitude: ac.schoolLongitude ?? null,
            allowedRadiusMeters: ac.allowedRadiusMeters ?? 0,
            gpsCheckEnabled: ac.gpsCheckEnabled ?? false,
          });
        }
      } catch (_) { /* silent — save already succeeded */ }

      setAttSaveState("saved");
      setTimeout(() => setAttSaveState("idle"), 2500);
    } catch (err) {
      console.error("Attendance save error:", err);
      setAttSaveState("error");
      setTimeout(() => setAttSaveState("idle"), 3000);
    }
  };

  const handleUploadLogo = async () => {
    if (!schoolId) return;
    setLogoError(null);
    if (!logoFile) { setLogoError("Please select a logo file first"); return; }
    if (logoFile.size > MAX_FILE_SIZE) { setLogoError("File size exceeds 5 MB limit"); return; }

    setLogoSaveState("saving");
    try {
      await uploadSchoolLogo(schoolId, logoFile);
      setLogoSaveState("saved");
      toast.info("Logo uploaded! It may take a few seconds to reflect.");

      let attempts = 0;
      const poll = async () => {
        attempts++;
        try {
          const fresh = await getSchoolById(schoolId);
          const newLogoUrl = fresh.data?.logoUrl;
          if (newLogoUrl && newLogoUrl !== schoolData.logoUrl) {
            setSchoolData(prev => ({ ...prev, logoUrl: newLogoUrl }));
            setLogoFile(null);
            setLogoPreview(newLogoUrl);
            toast.success("Logo updated successfully!");

            const currentSchool = JSON.parse(localStorage.getItem("school") || "{}");
            localStorage.setItem("school", JSON.stringify({
              ...currentSchool,
              logoUrl: newLogoUrl,
            }));
            window.dispatchEvent(new Event("storage"));

          } else if (attempts < 3) {
            setTimeout(poll, 3000);
          }
        } catch (e) { console.warn("Logo poll failed:", e); }
      };
      setTimeout(poll, 3000);
      setTimeout(() => setLogoSaveState("idle"), 3000);
    } catch (err) {
      console.error("Logo upload error:", err);
      setLogoSaveState("error");
      setTimeout(() => setLogoSaveState("idle"), 3000);
    }
  };

  const handleReset = () => {
    setSchoolData(prev => ({ ...EMPTY_SCHOOL, code: prev.code, logoUrl: prev.logoUrl }));
    setSchoolErrors({});
  };

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setLogoError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Only JPG, PNG, or WEBP files are accepted"); return;
    }
    if (file.size > MAX_FILE_SIZE) { setLogoError("File size exceeds 5 MB limit"); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading school details…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">Failed to Load School</h2>
          <p className="text-sm text-slate-500">{fetchError}</p>
        </div>
      </div>
    );
  }

  const statusColor =
    schoolData.status === "Active" ? "bg-emerald-100 text-emerald-700" :
      schoolData.status === "Inactive" ? "bg-amber-100 text-amber-700" :
        "bg-red-100 text-red-600";

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">

      {/* ══ PAGE HEADER ══ */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          School Configuration
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Manage school profile, attendance rules &amp; branding
        </p>
      </div>

      {/* ══ STAT CARD HERO ══ */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top strip — identity */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
            {/* Logo / Avatar */}
            <div className="relative shrink-0">
              {schoolData.logoUrl ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border border-blue-100 shadow-md bg-white">
                  <img
                    src={schoolData.logoUrl}
                    alt={schoolData.name}
                    className="w-full h-full object-contain"
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md flex items-center justify-center border border-blue-400/20">
                  <School className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* Name + badges */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {schoolData.code && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-lg font-bold tracking-wide">
                    {schoolData.code}
                  </span>
                )}
                {schoolData.board && (
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-lg font-semibold">
                    {schoolData.board}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold inline-flex items-center gap-1 ${statusColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {schoolData.status}
                </span>
                {schoolData.establishedYear && (
                  <span className="text-slate-400 text-xs font-medium">Est. {schoolData.establishedYear}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
            <StatCard
              label="Principal"
              value={schoolData.principalName || "—"}
              color="blue"
            />
            <StatCard
              label="City / State"
              value={[schoolData.city, schoolData.state].filter(Boolean).join(", ") || "—"}
              sub={schoolData.pincode ? `PIN ${schoolData.pincode}` : undefined}
              color="violet"
            />
            <StatCard
              label="Phone"
              value={schoolData.phone || "—"}
              sub={schoolData.email || undefined}
              color="amber"
            />
            <StatCard
              label="Affiliation No."
              value={schoolData.affiliationNumber || "—"}
              sub={schoolData.website ? "Website set" : "No website"}
              color="green"
            />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-5">
        {/* Mobile: grid */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all border
                  ${active
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop: underline tabs */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="flex gap-1 min-w-max border-b border-gray-200">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center cursor-pointer gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px
                    ${active
                      ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ TAB CONTENT ══ */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-4">

        {/* ─── TAB 1 : School Info ─── */}
        {activeTab === "school" && (
          <>
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Basic Information</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* School Name */}
                <div className="sm:col-span-2 md:col-span-1">
                  <Label required icon={<School className="w-3.5 h-3.5" />}>School Name</Label>
                  <TextInput
                    value={schoolData.name}
                    onChange={v => handleSchoolChange("name", v)}
                    placeholder="Enter school name"
                    hasError={!!schoolErrors.name}
                  />
                  <FieldError error={schoolErrors.name} />
                </div>

                {/* School Code */}
                <div>
                  <Label icon={<Hash className="w-3.5 h-3.5" />}>School Code</Label>
                  <TextInput value={schoolData.code} disabled />
                  <FieldHint hint="Read-only — assigned by system" />
                </div>

                {/* Board */}
                <div>
                  <Label icon={<Award className="w-3.5 h-3.5" />}>Board</Label>
                  <SelectInput
                    value={schoolData.board}
                    options={boards}
                    onChange={v => handleSchoolChange("board", v)}
                  />
                </div>

                {/* Est. Year */}
                <div>
                  <Label icon={<Calendar className="w-3.5 h-3.5" />}>Est. Year</Label>
                  <TextInput
                    value={schoolData.establishedYear}
                    onChange={v => handleSchoolChange("establishedYear", v)}
                    placeholder="1972"
                    hasError={!!schoolErrors.establishedYear}
                  />
                  <FieldError error={schoolErrors.establishedYear} />
                </div>

                {/* Status */}
                <div>
                  <Label icon={<Shield className="w-3.5 h-3.5" />}>Status</Label>
                  <SelectInput value={schoolData.status} options={STATUSES} onChange={v => handleSchoolChange("status", v)} />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <Phone className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Details</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label icon={<Phone className="w-3.5 h-3.5" />}>Phone</Label>
                  <TextInput
                    value={schoolData.phone}
                    onChange={v => handleSchoolChange("phone", v)}
                    placeholder="+91-XXXXXXXXXX"
                    hasError={!!schoolErrors.phone}
                  />
                  <FieldError error={schoolErrors.phone} />
                  {!schoolErrors.phone && <FieldHint hint="E.g. +91-9876543210" />}
                </div>

                <div>
                  <Label icon={<Mail className="w-3.5 h-3.5" />}>Email</Label>
                  <TextInput
                    value={schoolData.email}
                    onChange={v => handleSchoolChange("email", v)}
                    placeholder="school@example.in"
                    hasError={!!schoolErrors.email}
                  />
                  <FieldError error={schoolErrors.email} />
                </div>

                <div>
                  <Label icon={<Globe className="w-3.5 h-3.5" />}>Website</Label>
                  <TextInput
                    value={schoolData.website}
                    onChange={v => handleSchoolChange("website", v)}
                    placeholder="https://www.school.in"
                    hasError={!!schoolErrors.website}
                  />
                  <FieldError error={schoolErrors.website} />
                </div>

                <div>
                  <Label icon={<User className="w-3.5 h-3.5" />}>Principal</Label>
                  <TextInput
                    value={schoolData.principalName}
                    onChange={v => handleSchoolChange("principalName", v)}
                    placeholder="Dr. / Mr. / Mrs."
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <MapPin className="w-4 h-4 text-violet-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Address</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Label icon={<MapPin className="w-3.5 h-3.5" />}>Street Address</Label>
                  <TextInput
                    value={schoolData.address}
                    onChange={v => handleSchoolChange("address", v)}
                    placeholder="House No., Street, Area"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>City</Label>
                    <TextInput value={schoolData.city} onChange={v => handleSchoolChange("city", v)} placeholder="City" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <TextInput value={schoolData.state} onChange={v => handleSchoolChange("state", v)} placeholder="State" />
                  </div>
                  <div>
                    <Label>PIN</Label>
                    <TextInput
                      value={schoolData.pincode}
                      onChange={v => handleSchoolChange("pincode", v)}
                      placeholder="110075"
                      hasError={!!schoolErrors.pincode}
                    />
                    <FieldError error={schoolErrors.pincode} />
                  </div>
                </div>
              </div>
            </div>

            {/* Accreditation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Accreditation</h3>
              </div>
              <div className="p-5">
                <Label icon={<Award className="w-3.5 h-3.5" />}>Affiliation Number</Label>
                <TextInput
                  value={schoolData.affiliationNumber}
                  onChange={v => handleSchoolChange("affiliationNumber", v)}
                  placeholder="AFF-CBSE-XXXXX"
                  hasError={!!schoolErrors.affiliationNumber}
                />
                <FieldError error={schoolErrors.affiliationNumber} />
              </div>
            </div>
          </>
        )}

        {/* ─── TAB 2 : Attendance ─── */}
        {activeTab === "attendance" && (
          <>
            {/* Loading skeleton */}
            {attLoading && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3.5 border-b bg-slate-50">
                      <div className="h-3 bg-slate-200 rounded w-36" />
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4">
                      {[1, 2].map(j => (
                        <div key={j} className="space-y-2">
                          <div className="h-3 bg-slate-200 rounded w-24" />
                          <div className="h-10 bg-slate-100 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hard fetch error (non-404) */}
            {!attLoading && attFetchError && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">Failed to Load Attendance Config</p>
                  <p className="text-xs text-slate-500 mt-1">{attFetchError}</p>
                </div>
                <button
                  onClick={() => {
                    setAttFetchError(null);
                    setActiveTab("school");
                    setTimeout(() => setActiveTab("attendance"), 50);
                  }}
                  className="shrink-0 text-xs font-semibold text-blue-600 hover:underline"
                >Retry</button>
              </div>
            )}

            {/* Attendance form */}
            {!attLoading && !attFetchError && (
              <>
                {/* Time Window */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <Clock className="w-4 h-4 text-red-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Time Window</h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label icon={<Clock className="w-3.5 h-3.5" />}>Start Time</Label>
                      <input
                        type="time"
                        value={attendanceData.workStartTime}
                        onChange={e => handleAttendanceChange("workStartTime", e.target.value)}
                        className={`cursor-pointer w-full border rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:border-slate-300
                          ${attErrors.workStartTime ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                      />
                      <FieldError error={attErrors.workStartTime} />
                      {!attErrors.workStartTime && <FieldHint hint="24-hour HH:mm" />}
                    </div>

                    <div>
                      <Label icon={<Zap className="w-3.5 h-3.5" />}>Grace Period</Label>
                      <div className="flex items-center gap-2">
                        <TextInput
                          type="number"
                          value={attendanceData.gracePeriodMinutes}
                          onChange={v => handleAttendanceChange("gracePeriodMinutes", Math.min(120, Math.max(0, parseInt(v) || 0)))}
                          hasError={!!attErrors.gracePeriodMinutes}
                        />
                        <div className="shrink-0 w-12 h-10 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                          <span className="text-sm font-extrabold text-blue-600 leading-none">{attendanceData.gracePeriodMinutes || 0}</span>
                          <span className="text-xs text-blue-400 leading-none">min</span>
                        </div>
                      </div>
                      <FieldError error={attErrors.gracePeriodMinutes} />
                      {!attErrors.gracePeriodMinutes && <FieldHint hint="0–120 minutes" />}
                    </div>
                  </div>
                </div>

                {/* Face Recognition */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <Fingerprint className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Face Recognition</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <Label icon={<Fingerprint className="w-3.5 h-3.5" />}>Face Confidence Threshold (%)</Label>
                      <TextInput
                        type="number"
                        value={attendanceData.faceConfidenceThreshold}
                        onChange={v => handleAttendanceChange("faceConfidenceThreshold", Math.min(100, Math.max(0, parseInt(v) || 0)))}
                        hasError={!!attErrors.faceConfidenceThreshold}
                      />
                      <FieldError error={attErrors.faceConfidenceThreshold} />
                      {!attErrors.faceConfidenceThreshold && <FieldHint hint="Recommended: 70–85%" />}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>0%</span>
                        <span className="text-emerald-600 font-semibold">70–85% optimal</span>
                        <span>100%</span>
                      </div>
                      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                          style={{
                            width: `${attendanceData.faceConfidenceThreshold || 0}%`,
                            background:
                              attendanceData.faceConfidenceThreshold >= 70 && attendanceData.faceConfidenceThreshold <= 85
                                ? "#10b981"
                                : attendanceData.faceConfidenceThreshold < 70
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        />
                        <div className="absolute inset-y-0 bg-emerald-300/30 border-x-2 border-emerald-400/60" style={{ left: "70%", width: "15%" }} />
                      </div>
                      <p className="text-xs mt-2 font-semibold"
                        style={{
                          color:
                            attendanceData.faceConfidenceThreshold >= 70 && attendanceData.faceConfidenceThreshold <= 85
                              ? "#10b981"
                              : attendanceData.faceConfidenceThreshold < 70
                                ? "#f59e0b"
                                : "#ef4444",
                        }}>
                        {attendanceData.faceConfidenceThreshold >= 70 && attendanceData.faceConfidenceThreshold <= 85
                          ? "✓ Optimal range"
                          : attendanceData.faceConfidenceThreshold < 70
                            ? "⚠ Below recommended"
                            : "⚠ Above recommended"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* GPS Geo-Fence */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                    <Navigation className="w-4 h-4 text-violet-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">GPS Geo-Fence</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Toggle row */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${attendanceData.gpsCheckEnabled ? "bg-blue-100" : "bg-slate-200"}`}>
                        {attendanceData.gpsCheckEnabled
                          ? <Wifi className="w-4 h-4 text-blue-600" />
                          : <WifiOff className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">Enable GPS Check</p>
                        <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                          Require staff &amp; students to be within radius when marking attendance.
                        </p>
                      </div>
                      <button
                        onClick={() => handleAttendanceChange("gpsCheckEnabled", !attendanceData.gpsCheckEnabled)}
                        role="switch"
                        aria-checked={attendanceData.gpsCheckEnabled}
                        className="cursor-pointer shrink-0 relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        style={{
                          width: 44, height: 24,
                          backgroundColor: attendanceData.gpsCheckEnabled ? "#2563eb" : "#cbd5e1",
                          transition: "background-color 200ms ease",
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 2, left: 2, width: 20, height: 20,
                          borderRadius: "50%", backgroundColor: "white",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                          transform: attendanceData.gpsCheckEnabled ? "translateX(20px)" : "translateX(0px)",
                          transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)", display: "block",
                        }} />
                      </button>
                    </div>

                    {/* GPS fields */}
                    {attendanceData.gpsCheckEnabled && (
                      <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40 space-y-3">
                        <div className="flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <p className="text-xs text-blue-600 font-medium">Set school coordinates to define the attendance zone.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label>Latitude</Label>
                            <TextInput
                              type="number"
                              value={attendanceData.schoolLatitude ?? ""}
                              onChange={() => { }}
                              placeholder="28.61"
                              hasError={!!attErrors.schoolLatitude}
                              disabled={true}
                            />
                            <FieldError error={attErrors.schoolLatitude} />
                          </div>
                          <div>
                            <Label>Longitude</Label>
                            <TextInput
                              type="number"
                              value={attendanceData.schoolLongitude ?? ""}
                              onChange={() => { }}
                              placeholder="77.20"
                              hasError={!!attErrors.schoolLongitude}
                              disabled={true}
                            />
                            <FieldError error={attErrors.schoolLongitude} />
                          </div>
                          <div>
                            <Label>Radius (m)</Label>
                            <TextInput
                              type="number"
                              value={attendanceData.allowedRadiusMeters}
                              onChange={v => handleAttendanceChange("allowedRadiusMeters", parseInt(v) || 0)}
                              placeholder="200"
                              hasError={!!attErrors.allowedRadiusMeters}
                            />
                            <FieldError error={attErrors.allowedRadiusMeters} />
                          </div>
                        </div>

                        {/* Capture Location Button */}
                        <button
                          onClick={() => {
                            if (!navigator.geolocation) {
                              toast.error("Geolocation is not supported by your browser.");
                              return;
                            }
                            toast.info("Fetching your location…");
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                handleAttendanceChange("schoolLatitude", parseFloat(pos.coords.latitude.toFixed(6)));
                                handleAttendanceChange("schoolLongitude", parseFloat(pos.coords.longitude.toFixed(6)));
                                if (!attendanceData.allowedRadiusMeters || attendanceData.allowedRadiusMeters === 0) {
                                  handleAttendanceChange("allowedRadiusMeters", 200);
                                }
                                toast.success("Location captured successfully!");
                              },
                              (err) => {
                                const messages = {
                                  1: "Location permission denied. Please allow access in browser settings.",
                                  2: "Location unavailable. Try again.",
                                  3: "Location request timed out. Try again.",
                                };
                                toast.error(messages[err.code] || "Failed to get location.");
                              },
                              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                            );
                          }}
                          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm mt-1"
                        >
                          <Navigation className="w-4 h-4" />
                          Capture Current Location
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ─── TAB 3 : Logo ─── */}
        {activeTab === "logo" && (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-800">School Logo</h2>
                <p className="text-xs text-slate-500 mt-0.5">Upload JPG, PNG, or WEBP · Max 5 MB</p>
              </div>
            </div>

            {logoError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium flex-1">{logoError}</p>
                <button onClick={() => setLogoError(null)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload zone */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Logo</p>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[200px]
                    ${dragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40"}`}
                >
                  {logoFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={logoPreview} alt="preview" className="max-h-28 max-w-full rounded-xl object-contain shadow-md" />
                      <p className="text-xs text-slate-500 text-center break-all">{logoFile.name}</p>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Ready to upload</span>
                    </div>
                  ) : (
                    <>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${dragOver ? "bg-blue-100" : "bg-slate-100"}`}>
                        <Upload className={`w-6 h-6 ${dragOver ? "text-blue-500" : "text-slate-400"}`} />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 text-center">Click to browse or drag &amp; drop</p>
                      <p className="text-xs text-slate-400 mt-1 text-center">JPG · PNG · WEBP · Max 5 MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => e.target.files[0] && processFile(e.target.files[0])}
                  />
                </div>
              </div>

              {/* Current logo */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Logo</p>
                  <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[120px] bg-white">
                    {schoolData.logoUrl ? (
                      <img
                        src={schoolData.logoUrl}
                        alt="Current logo"
                        className="max-h-24 max-w-full object-contain rounded-xl"
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                          <School className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No logo uploaded yet</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ BOTTOM ACTION BAR ══ */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-5 py-3 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400 hidden sm:block truncate">
              {schoolData.name ? `Editing: ${schoolData.name}` : "No school loaded"}
            </p>
            <div className="flex items-center gap-2 ml-auto">

              {activeTab === "school" && (
                <>
                  <button
                    onClick={handleReset}
                    disabled={schoolSaveState === "saving"}
                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <SaveButton saveState={schoolSaveState} onClick={handleSaveSchool} />
                </>
              )}

              {activeTab === "attendance" && (
                <SaveButton
                  saveState={attLoading ? "saving" : attFetchError ? "error" : attSaveState}
                  onClick={handleSaveAttendance}
                  disabled={attLoading || !!attFetchError}
                />
              )}

              {activeTab === "logo" && (
                <>
                  <button
                    onClick={() => { setLogoFile(null); setLogoPreview(schoolData.logoUrl || null); setLogoError(null); }}
                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /><span>Clear</span>
                  </button>
                  <button
                    onClick={handleUploadLogo}
                    disabled={!logoFile || logoSaveState === "saving"}
                    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
                      ${logoSaveState === "saved" ? "bg-emerald-600 text-white" :
                        logoSaveState === "saving" ? "bg-blue-400 text-white cursor-wait" :
                          logoSaveState === "error" ? "bg-red-500 text-white" :
                            logoFile ? "bg-blue-600 hover:bg-blue-700 text-white" :
                              "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                  >
                    {logoSaveState === "saved" ? <><CheckCircle className="w-4 h-4" /><span>Uploaded!</span></> :
                      logoSaveState === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading…</span></> :
                        logoSaveState === "error" ? <><AlertCircle className="w-4 h-4" /><span>Failed</span></> :
                          <><Upload className="w-4 h-4" /><span>Upload Logo</span></>}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
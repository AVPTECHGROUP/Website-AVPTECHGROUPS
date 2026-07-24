import { useState, useEffect } from "react";
import {
  School, Phone, Globe, MapPin, Award,
  ChevronDown, CheckCircle, RotateCcw, Save,
  Settings, CalendarClock, Building2,
  Mail, User, Hash, Calendar, Shield, Image as ImageIcon,
  Loader2, AlertCircle, Info, Sliders
} from "lucide-react";
import { getSchoolById, updateSchool } from "../../Api/SchoolConfiguration/schoolconfig";
import { getListOfValues } from "../../Api/Lov/ListOfValues";
import SCHOOL_CONFIG_CONST from "../../Constants/StringConstants/SchoolConfigConstants";

import AttendanceTab from "./AttendanceTab";
import FeaturesTab from "./FeaturesTab";
import LogoTab from "./LogoTab";

const TABS = [
  { id: "school", label: SCHOOL_CONFIG_CONST.TAB_SCHOOL_INFO, icon: Settings },
  { id: "attendance", label: SCHOOL_CONFIG_CONST.TAB_ATTENDANCE, icon: CalendarClock },
  { id: "features", label: "Enabled Features", icon: Sliders },
  { id: "logo", label: SCHOOL_CONFIG_CONST.TAB_LOGO, icon: ImageIcon },
];

const STATUSES = [SCHOOL_CONFIG_CONST.STATUS_ACTIVE, SCHOOL_CONFIG_CONST.STATUS_INACTIVE, SCHOOL_CONFIG_CONST.STATUS_SUSPENDED];

const EMPTY_SCHOOL = {
  name: "", code: "", board: "CBSE",
  establishedYear: "", status: SCHOOL_CONFIG_CONST.STATUS_ACTIVE,
  phone: "", email: "",
  website: "", principalName: "",
  address: "", city: "",
  state: "", pincode: "",
  affiliationNumber: "",
  logoUrl: "",
};

const VALIDATORS = {
  name: (v) => {
    if (!v?.trim()) return SCHOOL_CONFIG_CONST.ERR_SCHOOL_NAME_REQUIRED;
    if (v.trim().length < 3) return SCHOOL_CONFIG_CONST.ERR_SCHOOL_NAME_LENGTH;
    if (v.trim().length > 100) return SCHOOL_CONFIG_CONST.ERR_SCHOOL_NAME_MAX;
    return null;
  },
  code: (v) => {
    if (!v?.trim()) return SCHOOL_CONFIG_CONST.ERR_SCHOOL_CODE_REQUIRED;
    if (!/^[A-Za-z0-9_-]{2,20}$/.test(v.trim())) return SCHOOL_CONFIG_CONST.ERR_SCHOOL_CODE_FORMAT;
    return null;
  },
  phone: (v) => {
    if (!v) return null;
    const cleaned = v.replace(/[\s\-().+]/g, "");
    if (!/^\d{7,15}$/.test(cleaned)) return SCHOOL_CONFIG_CONST.ERR_PHONE_INVALID;
    return null;
  },
  email: (v) => {
    if (!v) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return SCHOOL_CONFIG_CONST.ERR_EMAIL_INVALID;
    return null;
  },
  establishedYear: (v) => {
    if (!v) return null;
    const yr = parseInt(v);
    const currentYear = new Date().getFullYear();
    if (isNaN(yr) || yr < 1800 || yr > currentYear)
      return SCHOOL_CONFIG_CONST.ERR_YEAR_RANGE(1800, currentYear);
    return null;
  },
  pincode: (v) => {
    if (!v) return null;
    if (!/^\d{6}$/.test(v.trim())) return SCHOOL_CONFIG_CONST.ERR_PINCODE_LENGTH;
    return null;
  },
  affiliationNumber: (v) => {
    if (!v) return null;
    if (v.trim().length > 50) return SCHOOL_CONFIG_CONST.ERR_AFFILIATION_LONG;
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

function StatCard({ label, value, sub, color = "blue" }) {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-700" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    violet: { bg: "bg-violet-50", text: "text-violet-700" },
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

export default function SchoolConfig() {
  const [activeTab, setActiveTab] = useState("school");
  const [schoolSaveState, setSchoolSaveState] = useState("idle");
  const [schoolData, setSchoolData] = useState(EMPTY_SCHOOL);
  const [featuresData, setFeaturesData] = useState(null);
  const [schoolErrors, setSchoolErrors] = useState({});
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [schoolId, setSchoolId] = useState(null);

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
            : SCHOOL_CONFIG_CONST.STATUS_ACTIVE,
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
        if (s.features) setFeaturesData(s.features);
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
        const formatted = res.map(item => item.value || item.label);
        setBoards(formatted);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
        setBoards(["CBSE", "ICSE"]);
      }
    };
    fetchBoards();
  }, []);

  const handleSchoolChange = (k, v) => {
    setSchoolData(p => ({ ...p, [k]: v }));
    if (schoolErrors[k]) {
      const err = VALIDATORS[k]?.(v);
      setSchoolErrors(prev => ({ ...prev, [k]: err || undefined }));
    }
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
        features: featuresData,
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
          : SCHOOL_CONFIG_CONST.STATUS_ACTIVE,
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
      if (s.features) setFeaturesData(s.features);

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

  const handleReset = () => {
    setSchoolData(prev => ({ ...EMPTY_SCHOOL, code: prev.code, logoUrl: prev.logoUrl }));
    setSchoolErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-sm font-medium">{SCHOOL_CONFIG_CONST.LOADING_SCHOOL_DETAILS}</p>
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
          <h2 className="text-base font-bold text-slate-800 mb-2">{SCHOOL_CONFIG_CONST.FAILED_TO_LOAD_SCHOOLS}</h2>
          <p className="text-sm text-slate-500">{fetchError}</p>
        </div>
      </div>
    );
  }

  const statusColor =
    schoolData.status === SCHOOL_CONFIG_CONST.STATUS_ACTIVE ? "bg-emerald-100 text-emerald-700" :
      schoolData.status === SCHOOL_CONFIG_CONST.STATUS_INACTIVE ? "bg-amber-100 text-amber-700" :
        "bg-red-100 text-red-600";

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">
      {/* ══ PAGE HEADER ══ */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {SCHOOL_CONFIG_CONST.SchoolConfig}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          {SCHOOL_CONFIG_CONST.SCHOOL_CONFIG_SUBTITLE}
        </p>
      </div>

      {/* ══ HERO SECTION ══ */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
            <StatCard label="Principal" value={schoolData.principalName || "—"} color="blue" />
            <StatCard
              label="City / State"
              value={[schoolData.city, schoolData.state].filter(Boolean).join(", ") || "—"}
              sub={schoolData.pincode ? `PIN ${schoolData.pincode}` : undefined}
              color="violet"
            />
            <StatCard label="Phone" value={schoolData.phone || "—"} sub={schoolData.email || undefined} color="amber" />
            <StatCard
              label="Affiliation No."
              value={schoolData.affiliationNumber || "—"}
              sub={schoolData.website ? "Website set" : "No website"}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* ══ NAVIGATION TABS ══ */}
      <div className="px-4 sm:px-6 lg:px-8 mt-5">
        <div className="grid grid-cols-4 gap-2 sm:hidden">
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
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

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

      {/* ══ TAB CONTENTS ══ */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* TAB 1: School Information */}
        {activeTab === "school" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {SCHOOL_CONFIG_CONST.BASIC_INFORMATION_LABEL}
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required icon={<School className="w-3.5 h-3.5" />}>School Name</Label>
                  <TextInput
                    value={schoolData.name}
                    onChange={v => handleSchoolChange("name", v)}
                    placeholder="Enter school name"
                    hasError={!!schoolErrors.name}
                  />
                  <FieldError error={schoolErrors.name} />
                </div>
                <div>
                  <Label icon={<Hash className="w-3.5 h-3.5" />}>School Code</Label>
                  <TextInput value={schoolData.code} disabled />
                  <FieldHint hint="Read-only — assigned by system" />
                </div>
                <div>
                  <Label icon={<Award className="w-3.5 h-3.5" />}>Board</Label>
                  <SelectInput value={schoolData.board} options={boards} onChange={v => handleSchoolChange("board", v)} />
                </div>
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
                <div>
                  <Label icon={<Shield className="w-3.5 h-3.5" />}>Status</Label>
                  <SelectInput value={schoolData.status} options={STATUSES} onChange={v => handleSchoolChange("status", v)} />
                </div>
              </div>
            </div>

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

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-5 py-3 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400 hidden sm:block truncate">
                  {schoolData.name ? `Editing: ${schoolData.name}` : "No school loaded"}
                </p>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleReset}
                    disabled={schoolSaveState === "saving"}
                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <SaveButton saveState={schoolSaveState} onClick={handleSaveSchool} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Attendance Config */}
        {activeTab === "attendance" && (
          <AttendanceTab schoolId={schoolId} schoolName={schoolData.name} />
        )}

        {/* TAB 3: Features Config */}
        {activeTab === "features" && (
          <FeaturesTab
            schoolId={schoolId}
            schoolData={schoolData}
            initialFeatures={featuresData}
            schoolName={schoolData.name}
            onFeaturesUpdated={(updated) => setFeaturesData(updated)}
          />
        )}

        {/* TAB 4: Logo Config */}
        {activeTab === "logo" && (
          <LogoTab
            schoolId={schoolId}
            currentLogoUrl={schoolData.logoUrl}
            schoolName={schoolData.name}
            onLogoUpdated={(newLogoUrl) =>
              setSchoolData(prev => ({ ...prev, logoUrl: newLogoUrl }))
            }
          />
        )}
      </div>
    </div>
  );
}
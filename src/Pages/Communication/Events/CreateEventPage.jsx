import { useState } from "react";
import {
  ArrowLeft, Clock, MapPin, CalendarDays, Users, Upload,
  Check, ChevronDown, Loader2, AlertCircle, X, FileText,
  Globe, BookOpen, Plus
} from "lucide-react";
import { SchoolEventsAPI } from '../../../Api/api.js';
import { useClasses } from '../../../ContextAPI/ClassContext.jsx';

// ── Constants ──────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: "SCHOOL_WIDE", label: "School-Wide", icon: Globe },
  { value: "CLASS_SPECIFIC", label: "Class-Specific", icon: BookOpen },
];

const TARGET_OPTIONS = [
  { label: "All Staff", value: "ALL_STAFF", color: "blue" },
  { label: "All Teachers", value: "ALL_TEACHERS", color: "indigo" },
  { label: "All Parents", value: "ALL_PARENTS", color: "violet" },
  { label: "All Students", value: "ALL_STUDENTS", color: "cyan" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function calcDuration(start, end) {
  try {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e) || e <= s) return null;
    const hrs = Math.round((e - s) / 36e5);
    return hrs < 24
      ? `${hrs} hour${hrs !== 1 ? "s" : ""}`
      : `${Math.round(hrs / 24)} day${Math.round(hrs / 24) !== 1 ? "s" : ""}`;
  } catch { return null; }
}

function toISOString(localDatetime) {
  if (!localDatetime) return null;
  try { return new Date(localDatetime).toISOString(); } catch { return null; }
}

function fmtDisplay(localDatetime) {
  if (!localDatetime) return "—";
  try {
    return new Date(localDatetime).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin" />;
}

// Required field asterisk asterisk
function Req() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function FormCard({ title, children }) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
      <div className="text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-blue-50">
        {title}
      </div>
      {children}
    </div>
  );
}

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-500 mb-1.5">
      {children}
    </label>
  );
}

const inputCls =
  "w-full border-[1.5px] border-blue-100 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 bg-blue-50/30 outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-300";

function SumRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 text-[12.5px]">
      <Icon size={13} className="text-blue-400 mt-0.5 shrink-0" />
      <span className="text-slate-400 w-16 shrink-0">{label}</span>
      <span className="text-slate-700 font-medium truncate flex-1">{value || "—"}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CreateEventPage({ onBack }) {
  const { classes, getClassLabel } = useClasses();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startDatetime: "",
    endDatetime: "",
    type: "SCHOOL_WIDE",
  });

  const [targets, setTargets] = useState([]);
  const [classInput, setClassInput] = useState({ classId: "", sectionId: "" });

  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Toggle quick selection targets (ALL_STAFF, ALL_TEACHERS, etc.)
  const toggleTarget = (targetType) => {
    setTargets((prev) =>
      prev.find((t) => t.targetType === targetType)
        ? prev.filter((t) => t.targetType !== targetType)
        : [...prev, { targetType, classId: null, sectionId: null }] // 👈 Set null instead of 0
    );
  };

  // Add specific targeted class configurations
  const addClassTarget = () => {
    const cId = classInput.classId ? parseInt(classInput.classId) : null;
    const sId = classInput.sectionId ? parseInt(classInput.sectionId) : null;

    if (!cId) return;

    // Check for duplicate targets inside arrays
    const exists = targets.some(t => t.targetType === "CLASS" && t.classId === cId && t.sectionId === sId);
    if (exists) { setError("This class target target is already added."); return; }

    setTargets((p) => [...p, { targetType: "CLASS", classId: cId, sectionId: sId }]);
    setClassInput({ classId: "", sectionId: "" });
  };

  const removeTargetIndex = (targetToRemove) => {
    setTargets((p) => p.filter((t) => t !== targetToRemove));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((p) => [...p, ...dropped]);
  };

  const handleFileInput = (e) => {
    setFiles((p) => [...p, ...Array.from(e.target.files)]);
  };

  // ── Payload builder formatting null outputs ───────────────────────────────
  const buildPayload = () => ({
    title: form.title,
    description: form.description || "",
    location: form.location || "",
    startDatetime: toISOString(form.startDatetime),
    endDatetime: toISOString(form.endDatetime),
    type: form.type,
    targets: targets.map((t) => ({
      targetType: t.targetType,
      classId: t.classId !== undefined ? t.classId : null,    // 👈 Fixed payload rules
      sectionId: t.sectionId !== undefined ? t.sectionId : null, // 👈 Fixed payload rules
    })),
  });

  const handleSubmit = async (asDraft = false) => {
    if (!form.title.trim()) { setError("Event title is required."); return; }
    if (!form.startDatetime) { setError("Start date & time is required."); return; }
    if (!form.endDatetime) { setError("End date & time is required."); return; }
    if (targets.length === 0) { setError("Select at least one target recipient."); return; }

    setLoading(true); setError(null);
    try {
      const payload = buildPayload();
      if (asDraft) payload.status = "DRAFT";

      const res = await SchoolEventsAPI.create(payload);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to create event.");
        setLoading(false);
        return;
      }

      if (files.length && data?.id) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await SchoolEventsAPI.uploadAttachment(data.id, fd);
      }

      setSuccess(true);
      setTimeout(() => { onBack?.(); }, 1500);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const dur = calcDuration(form.startDatetime, form.endDatetime);
  const allSelected = (v) => targets.some((t) => t.targetType === v);

  const renderingClassTargets = targets.filter(t => t.targetType === "CLASS");
  const activeSelectedClass = classes?.find(c => c.id === parseInt(classInput.classId));

  if (success) {
    return (
      <div className="min-h-screen bg-blue-50/60 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <Check size={28} className="text-green-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">Event Created!</div>
          <p className="text-sm text-slate-400">Your event has been published and recipients will be notified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/60 min-h-screen p-4 sm:p-6 font-sans text-slate-800">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 cursor-pointer transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 leading-none">Create New Event</h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedule a school event and notify parents, staff, or specific classes.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-4 max-w-5xl">

        {/* ════ LEFT COLUMN ════ */}
        <div className="flex flex-col gap-4">

          {/* Event Details */}
          <FormCard title="Event Details">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="title">Event Title <Req /></Label>
                <input
                  id="title"
                  className={inputCls}
                  value={form.title}
                  onChange={set("title")}
                  placeholder="e.g. Annual Sports Day 2025"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Event Type <Req /></Label>
                  <div className="relative">
                    <select
                      id="type"
                      className={`${inputCls} cursor-pointer appearance-none pr-9`}
                      value={form.type}
                      onChange={set("type")}
                    >
                      {EVENT_TYPES.map((et) => (
                        <option key={et.value} value={et.value}>{et.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
                    <input
                      id="location"
                      className={`${inputCls} pl-8`}
                      value={form.location}
                      onChange={set("location")}
                      placeholder="e.g. School Ground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormCard>

          {/* Date & Time */}
          <FormCard title="Date & Time">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDatetime">Start Date & Time <Req /></Label>
                <input
                  id="startDatetime"
                  type="datetime-local"
                  className={inputCls}
                  value={form.startDatetime}
                  onChange={set("startDatetime")}
                />
              </div>
              <div>
                <Label htmlFor="endDatetime">End Date & Time <Req /></Label>
                <input
                  id="endDatetime"
                  type="datetime-local"
                  className={inputCls}
                  value={form.endDatetime}
                  onChange={set("endDatetime")}
                />
              </div>
            </div>
            {dur && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                <Clock size={12} /> Duration: {dur}
              </div>
            )}
          </FormCard>

          {/* Description */}
          <FormCard title="Description">
            <Label htmlFor="description">Event Description</Label>
            <textarea
              id="description"
              className={`${inputCls} resize-y min-h-[108px] leading-relaxed`}
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the event, schedule, and what participants can expect…"
            />
          </FormCard>

          {/* Target Recipients */}
          <FormCard title="Target Recipients">
            <Label>Who should be notified? <Req /></Label>

            {/* Quick targets */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TARGET_OPTIONS.map((t) => {
                const sel = allSelected(t.value);
                const colorMap = {
                  blue: sel ? "border-blue-500 bg-blue-50 text-blue-700" : "border-blue-100 bg-white text-slate-500 hover:border-blue-300",
                  indigo: sel ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-blue-100 bg-white text-slate-500 hover:border-indigo-300",
                  violet: sel ? "border-violet-500 bg-violet-50 text-violet-700" : "border-blue-100 bg-white text-slate-500 hover:border-violet-300",
                  cyan: sel ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-blue-100 bg-white text-slate-500 hover:border-cyan-300",
                };
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleTarget(t.value)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] cursor-pointer transition-all ${colorMap[t.color]}`}
                  >
                    {sel && <Check size={11} />}
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Context Dropdown Layer selectors */}
            <div className="flex flex-wrap gap-2 items-end p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Select Class</span>
                <div className="relative">
                  <select
                    className="border border-blue-100 rounded-lg py-1.5 pl-2.5 pr-8 text-sm bg-white outline-none focus:border-blue-400 w-full appearance-none cursor-pointer"
                    value={classInput.classId}
                    onChange={(e) => setClassInput({ classId: e.target.value, sectionId: "" })}
                  >
                    <option value="">-- Choose Class --</option>
                    {classes?.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Section <span className="normal-case text-slate-300">(opt)</span>
                </span>
                <div className="relative">
                  <select
                    className="border border-blue-100 rounded-lg py-1.5 pl-2.5 pr-8 text-sm bg-white outline-none focus:border-blue-400 w-full appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    value={classInput.sectionId}
                    disabled={!classInput.classId}
                    onChange={(e) => setClassInput((p) => ({ ...p, sectionId: e.target.value }))}
                  >
                    <option value="">All Sections (Entire Class)</option>
                    {activeSelectedClass?.sections?.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={addClassTarget}
                disabled={!classInput.classId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed h-[34px]"
              >
                <Plus size={13} /> Add Target
              </button>
            </div>

            {/* Display active targeting badges pills */}
            {renderingClassTargets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {renderingClassTargets.map((target, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {getClassLabel(target.classId, target.sectionId)}
                    <button
                      type="button"
                      onClick={() => removeTargetIndex(target)}
                      className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormCard>

          {/* Attachments */}
          <FormCard title="Attachments">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${drag ? "border-blue-500 bg-blue-50" : "border-blue-100 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
            >
              <Upload size={26} className="text-blue-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-500">Click to upload or drag & drop</div>
              <div className="text-xs text-slate-400 mt-1">PDF, Images up to 10 MB</div>
              <input id="fileInput" type="file" multiple className="hidden" onChange={handleFileInput} />
            </div>
            {files.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-3">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 text-xs text-slate-600">
                    <FileText size={13} className="text-blue-400 shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormCard>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 justify-end pb-6">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-blue-100 bg-white text-slate-500 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-blue-100 bg-white text-slate-700 text-sm font-semibold hover:bg-blue-50 cursor-pointer transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-60 shadow-md shadow-blue-200"
            >
              {loading ? <><Spinner size={14} /> Publishing…</> : "Publish & Notify"}
            </button>
          </div>
        </div>

        {/* ════ RIGHT COLUMN — Summary ════ */}
        <div>
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm sticky top-4">
            <div className="text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-blue-50">
              Event Summary
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <SumRow icon={FileText} label="Title" value={form.title} />
              <SumRow icon={Globe} label="Type" value={form.type === "SCHOOL_WIDE" ? "School-Wide" : "Class-Specific"} />
              <SumRow icon={MapPin} label="Location" value={form.location} />
              <SumRow icon={CalendarDays} label="Start" value={fmtDisplay(form.startDatetime)} />
              <SumRow icon={CalendarDays} label="End" value={fmtDisplay(form.endDatetime)} />
              {dur && (
                <SumRow icon={Clock} label="Duration" value={dur} />
              )}
            </div>

            {/* Target Display Summary Section */}
            <div className="pt-4 border-t border-blue-50">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Notifying
              </div>
              {targets.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Users size={12} /> No recipients selected
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {targets.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11.5px] font-semibold"
                    >
                      <Users size={10} className="shrink-0" />
                      {t.targetType === "CLASS"
                        ? getClassLabel(t.classId, t.sectionId)
                        : TARGET_OPTIONS.find((o) => o.value === t.targetType)?.label || t.targetType}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live JSON preview */}
            <div className="mt-4 pt-4 border-t border-blue-50">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payload Preview
              </div>
              <pre className="text-[10px] text-slate-500 bg-blue-50/60 rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(buildPayload(), null, 2)}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
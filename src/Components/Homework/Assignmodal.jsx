import { useState, useRef, useEffect } from "react";
import {
  X, ChevronDown, SendHorizonal, Upload,
  Pencil, Loader2, FileText, CalendarDays, User,
  ExternalLink, Image as ImageIcon, Link2, RefreshCw,
  Download, Eye, EyeOff, AlignLeft, ArrowLeft, ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";

// ── Academic year helpers ─────────────────────────────────────────────────────
const buildAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    const short = String(y + 1).slice(-2);
    years.push(`${y}-${short}`);
  }
  return years;
};
const ACADEMIC_YEARS = buildAcademicYears();

const currentAcademicYear = () => {
  const now       = new Date();
  const year      = now.getFullYear();
  const month     = now.getMonth() + 1;
  const startYear = month >= 4 ? year : year - 1;
  const short     = String(startYear + 1).slice(-2);
  return `${startYear}-${short}`;
};

// ── Resolve existing attachment URL / type ────────────────────────────────────
function getExistingAttachUrl(hw) {
  if (!hw) return null;
  return hw.attachmentUrl ?? hw.fileUrl ?? hw.url ?? hw.linkUrl ?? null;
}

function resolveExistingType(hw) {
  if (!hw?.attachmentType) return null;
  const t = hw.attachmentType.toLowerCase();
  if (t.includes("pdf"))   return "pdf";
  if (t.includes("image")) return "image";
  return "link";
}

// ── EMPTY form ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  subjectId:    "",
  title:        "",
  description:  "",
  assignedDate: "",
  dueDate:      "",
  attachType:   "NONE",
  linkUrl:      "",
  status:       "PUBLISHED",
  academicYear: currentAcademicYear(),
  teacherId:    "",
};

// ── Shared helpers ────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalSelect({ value, onChange, disabled = false, loading = false, children }) {
  return (
    <div className="relative">
      {loading && (
        <Loader2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full appearance-none border-[1.5px] border-gray-300 rounded-lg pr-7 py-2 text-sm
          outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white
          disabled:opacity-60 ${loading ? "pl-8" : "pl-3"}`}
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── Lazy Attachment Viewer ────────────────────────────────────────────────────
function LazyAttachmentViewer({ url, type, label = "Attachment" }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;

  const isPdf   = type === "pdf";
  const isImage = type === "image";
  const isLink  = !isPdf && !isImage;

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href     = blobUrl;
      a.download = url.split("/").pop() || "attachment";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab if CORS blocks direct download
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          {isPdf   && <FileText  size={13} className="text-red-500"  />}
          {isImage && <ImageIcon size={13} className="text-blue-500" />}
          {isLink  && <Link2     size={13} className="text-gray-500" />}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isLink && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              {open ? <EyeOff size={12} /> : <Eye size={12} />}
              {open ? "Hide" : "View"}
            </button>
          )}
          {(isPdf || isImage) && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Download size={12} /> Download
            </button>
          )}
          <a
            href={isPdf ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}` : url}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ExternalLink size={12} /> Open
          </a>
        </div>
      </div>

      {open && !isLink && (
        <>
          {isPdf && (
            <div className="bg-gray-100" style={{ height: 320 }}>
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                title="PDF Preview" width="100%" height="100%"
                style={{ border: "none", display: "block" }}
              />
            </div>
          )}
          {isImage && (
            <div className="bg-gray-100 flex items-center justify-center p-3 min-h-[80px]">
              <img
                src={url} alt="Attachment preview"
                className="max-w-full max-h-56 rounded-lg object-contain shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextElementSibling)
                    e.currentTarget.nextElementSibling.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center gap-1 text-sm text-gray-400 py-4">
                <ImageIcon size={16} className="text-gray-300" />
                <span>Image could not be loaded.</span>
              </div>
            </div>
          )}
        </>
      )}

      {isLink && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 transition-colors group"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Link2 size={13} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 truncate">{url}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Click to open in new tab</div>
          </div>
          <ExternalLink size={13} className="ml-auto flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </a>
      )}
    </div>
  );
}

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ file, onFileChange, disabled, existingUrl, existingType }) {
  const ref = useRef(null);

  return (
    <div className="space-y-3">
      {/* Always show existing attachment preview when no new file chosen */}
      {existingUrl && !file && (
        <LazyAttachmentViewer
          url   = {existingUrl}
          type  = {existingType}
          label = "Current Attachment"
        />
      )}

      {/* Upload / replace zone */}
      <div
        onClick={() => !disabled && ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors
          ${file
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}
          ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={ref}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-blue-700">
              <FileText size={16} />
              <span className="text-sm font-medium truncate max-w-[240px]">{file.name}</span>
            </div>
            <p className="text-xs text-blue-400">Click to choose a different file</p>
          </div>
        ) : (
          <>
            <Upload size={18} className="mx-auto mb-1 text-gray-400" />
            <p className="text-sm text-gray-400">
              {existingUrl ? "Click to replace with a new file" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-300 mt-0.5">PDF, PNG, JPG up to 10 MB</p>
          </>
        )}
      </div>

      {/* Revert button — only shown after user picks a replacement */}
      {file && existingUrl && (
        <button
          type="button"
          onClick={() => onFileChange(null)}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw size={11} /> Revert to existing attachment
        </button>
      )}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function Tab({ active, onClick, icon: Icon, label, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap
        ${active
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
    >
      <Icon size={13} />
      {label}
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-2 right-1.5" />
      )}
    </button>
  );
}

// ── Resolve teacher name — handles all known API shapes safely ────────────────
// NOTE: ?? and || must NOT be mixed without parens — Babel requires explicit grouping.
function resolveTeacherName(t) {
  const id = (t.id ?? t.userId ?? t.profile?.id ?? "");

  // Build name: try every known field in order, then fall back
  const fromFields = (
    t.name ??
    t.fullName ??
    t.profile?.fullName ??
    (
      `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || null
    )
  );

  const name = fromFields || t.email || `Teacher #${id}`;

  return { id: String(id), name: String(name) };
}

// ── AssignModal ───────────────────────────────────────────────────────────────
export default function AssignModal({
  mode            = "assign",
  hw,
  subjects        = [],
  subjectsLoading = false,
  submitting      = false,
  onClose,
  onSave,
  isTeacher       = false,
  teacherId       = null,
  teacherName     = "",
  teachers        = [],
  teachersLoading = false,
}) {
  const isEdit = mode === "edit";

  const existingAttachUrl  = isEdit ? getExistingAttachUrl(hw) : null;
  const existingAttachType = isEdit ? resolveExistingType(hw)  : null;

  const [activeTab, setActiveTab] = useState("details");

  const [form, setForm] = useState(() =>
    isEdit && hw
      ? {
          subjectId:    String(hw.subjectId ?? ""),
          title:        hw.title        ?? "",
          description:  hw.description  ?? hw.desc ?? "",
          assignedDate: hw.assignedDate ?? "",
          dueDate:      hw.dueDate      ?? "",
          attachType:   (hw.attachmentType ?? hw.attachType ?? hw.attach ?? "NONE").toUpperCase(),
          linkUrl:      hw.linkUrl      ?? "",
          status:       hw.status       ?? "PUBLISHED",
          academicYear: hw.academicYear ?? currentAcademicYear(),
          teacherId:    String(hw.teacherId ?? ""),
        }
      : {
          ...EMPTY_FORM,
          teacherId: isTeacher && teacherId ? String(teacherId) : "",
        }
  );

  // ── When subjects load in edit mode, ensure subjectId is still set ─────────
  useEffect(() => {
    if (isEdit && hw?.subjectId && subjects.length > 0) {
      const match = subjects.find((s) => String(s.id) === String(hw.subjectId));
      if (match) {
        setForm((f) => ({ ...f, subjectId: String(hw.subjectId) }));
      }
    }
  }, [subjects, isEdit, hw?.subjectId]);

  // attachFile = newly chosen file; null = keep existing (or none)
  const [attachFile, setAttachFile] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const effectiveTeacherId = isTeacher ? teacherId : form.teacherId;

  const handleSubmit = async () => {
    if (form.assignedDate && form.dueDate) {
      if (new Date(form.dueDate) < new Date(form.assignedDate)) {
        toast.error("Due date cannot be earlier than assigned date");
        return;
      }
    }
    if (!isTeacher && !form.teacherId) {
      toast.error("Please select a teacher");
      return;
    }

    const payload = {
      subjectId:      form.subjectId,
      title:          form.title.trim(),
      status:         form.status,
      academicYear:   form.academicYear,
      attachmentType: form.attachType || "NONE",
      teacherId:      effectiveTeacherId,
      ...(form.description.trim()  && { description:  form.description.trim()  }),
      ...(form.assignedDate        && { assignedDate: form.assignedDate        }),
      ...(form.dueDate             && { dueDate:      form.dueDate             }),
      ...(form.attachType === "LINK" && form.linkUrl && { linkUrl: form.linkUrl }),
    };

    const isFileBased = form.attachType !== "NONE" && form.attachType !== "LINK";

    // Preserve existing attachment when editing without a new file
    if (isEdit && isFileBased && !attachFile && existingAttachUrl) {
      payload.attachmentUrl  = existingAttachUrl;
      payload.attachmentType = hw.attachmentType ?? form.attachType;
    }

    // Only pass a real File object when user actually chose a new one
    const file = isFileBased ? attachFile : null;

    await onSave(payload, file);
  };

  const showUpload = form.attachType !== "NONE" && form.attachType !== "LINK";
  const showLink   = form.attachType === "LINK";

  const canSubmit =
    !submitting &&
    form.title.trim() &&
    form.subjectId &&
    form.academicYear &&
    (isTeacher ? true : !!form.teacherId);

  const handleAttachTypeChange = (v) => {
    set("attachType", v);
    setAttachFile(null);
  };

  const contentHasDot = !!(form.description.trim() || form.attachType !== "NONE");
  const isOnDetails   = activeTab === "details";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={!submitting ? onClose : undefined}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-blue-700" />
            <h2 className="text-sm font-bold text-gray-900">
              {isEdit ? "Edit Homework" : "Assign Homework"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 px-5 flex-shrink-0">
          <Tab active={activeTab === "details"} onClick={() => setActiveTab("details")} icon={FileText} label="Details" />
          <Tab
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={AlignLeft}
            label="Description & Attachment"
            dot={contentHasDot}
          />
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ══ TAB 1: Details ══ */}
          {activeTab === "details" && (
            <div className="space-y-4">

              {/*
                Teacher field:
                - Logged-in TEACHER → read-only blue banner
                - Admin / Principal / Staff → dropdown from teacher lookup API
              */}
              {isTeacher ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <User size={13} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-blue-700 font-medium">{teacherName || "Teacher"}</span>
                  <span className="ml-auto text-[10px] text-blue-400 font-semibold tracking-wide uppercase">Assigned by you</span>
                </div>
              ) : (
                <Field label="On behalf of teacher" required>
                  <div className="relative">
                    {teachersLoading && (
                      <Loader2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
                    )}
                    <User
                      size={13}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${teachersLoading ? "left-6" : "left-2.5"}`}
                    />
                    <select
                      value={form.teacherId}
                      onChange={(e) => set("teacherId", e.target.value)}
                      disabled={submitting || teachersLoading}
                      className="w-full appearance-none border-[1.5px] border-gray-300 rounded-lg pl-8 pr-7 py-2 text-sm outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    >
                      <option value="">
                        {teachersLoading ? "Loading teachers…" : "Select teacher…"}
                      </option>
                      {teachers.map((t) => {
                        const { id, name } = resolveTeacherName(t);
                        return (
                          <option key={id} value={id}>{name}</option>
                        );
                      })}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {/* Debug hint — remove after teachers confirmed loading */}
                  {!teachersLoading && teachers.length === 0 && (
                    <p className="text-[10px] text-red-400 mt-1">
                      No teachers loaded — check console for [getTeacherLookup] logs.
                    </p>
                  )}
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Academic Year" required>
                  <div className="relative">
                    <CalendarDays size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      value={form.academicYear}
                      onChange={(e) => set("academicYear", e.target.value)}
                      disabled={submitting}
                      className="w-full appearance-none border-[1.5px] border-gray-300 rounded-lg pl-8 pr-7 py-2 text-sm outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    >
                      <option value="">Select year</option>
                      {ACADEMIC_YEARS.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Status" required>
                  <ModalSelect value={form.status} onChange={(v) => set("status", v)} disabled={submitting}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </ModalSelect>
                </Field>
              </div>

              <Field label="Subject" required>
                <ModalSelect
                  value    = {form.subjectId}
                  onChange = {(v) => set("subjectId", v)}
                  disabled = {submitting}
                  loading  = {subjectsLoading}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.label}</option>
                  ))}
                </ModalSelect>
              </Field>

              <Field label="Title" required>
                <input
                  type="text"
                  value={form.title}
                  disabled={submitting}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Chapter 4 – Exercise 4.3"
                  className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Assigned Date" required>
                  <input
                    type="date" value={form.assignedDate} disabled={submitting}
                    onChange={(e) => set("assignedDate", e.target.value)}
                    className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  />
                </Field>
                <Field label="Due Date" required>
                  <input
                    type="date" value={form.dueDate} disabled={submitting}
                    min={form.assignedDate || undefined}
                    onChange={(e) => set("dueDate", e.target.value)}
                    className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ══ TAB 2: Description & Attachment ══ */}
          {activeTab === "content" && (
            <div className="space-y-4">

              <Field label="Description">
            <textarea
              value={form.description}
                disabled={submitting}
                onChange={(e) => {
               if (e.target.value.length <= 1000) set("description", e.target.value);
                 }}
                 placeholder="Instructions for students…"
                rows={6}
             className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none overflow-y-auto
            disabled:opacity-60"
            style={{ maxHeight: "200px" }}
           />
           <div className="flex items-center justify-between mt-1">
             {form.description?.length >= 950 && (
               <span className="text-[10px] text-orange-500 font-medium">
              {1000 - (form.description?.length ?? 0)} characters remaining
           </span>
          )}
             <span className={`text-[10px] ml-auto font-medium ${
             (form.description?.length ?? 0) >= 1000
                ? "text-red-500"
              : (form.description?.length ?? 0) >= 950
                ? "text-orange-400"
                : "text-gray-400"
             }`}>
               {form.description?.length ?? 0} / 1000
            </span>
            </div>
        </Field>

              <Field label="Attachment Type">
                <ModalSelect value={form.attachType} onChange={handleAttachTypeChange} disabled={submitting}>
                  <option value="NONE">None</option>
                  <option value="PDF">PDF</option>
                  <option value="IMAGE">Image</option>
                  <option value="LINK">Link / URL</option>
                </ModalSelect>
              </Field>

              {showUpload && (
                <UploadZone
                  file         = {attachFile}
                  onFileChange = {setAttachFile}
                  disabled     = {submitting}
                  existingUrl  = {existingAttachUrl}
                  existingType = {existingAttachType}
                />
              )}

              {showLink && (
                <Field label="Resource Link">
                  <div className="space-y-2">
                    <input
                      type="url" value={form.linkUrl} disabled={submitting}
                      onChange={(e) => set("linkUrl", e.target.value)}
                      placeholder="https://…"
                      className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />
                    {form.linkUrl && (
                      <LazyAttachmentViewer url={form.linkUrl} type="link" label="Link Preview" />
                    )}
                  </div>
                </Field>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex gap-1.5 items-center">
            {["details", "content"].map((t) => (
              <button
                key={t} type="button" onClick={() => setActiveTab(t)}
                className={`w-2 h-2 rounded-full transition-all ${activeTab === t ? "bg-blue-600 scale-110" : "bg-gray-300 hover:bg-gray-400"}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose} disabled={submitting}
              className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>

            {isOnDetails && (
              <button
                type="button" onClick={() => setActiveTab("content")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
              >
                Next <ArrowRight size={13} />
              </button>
            )}

            {!isOnDetails && (
              <>
                <button
                  type="button" onClick={() => setActiveTab("details")} disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <ArrowLeft size={13} /> Previous
                </button>
                <button
                  onClick={handleSubmit} disabled={!canSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    : <><SendHorizonal size={13} /> {isEdit ? "Save Changes" : "Publish"}</>
                  }
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
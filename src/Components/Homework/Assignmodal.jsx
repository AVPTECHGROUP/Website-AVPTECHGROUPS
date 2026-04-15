import { useState, useRef } from "react";
import {
  X, ChevronDown, SendHorizonal, Upload,
  Pencil, Loader2, FileText, CalendarDays,
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

// ── Initial form state ────────────────────────────────────────────────────────
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
};

// ── Shared sub-components ─────────────────────────────────────────────────────
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
            <Loader2
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none"
            />
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
        <ChevronDown
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
  );
}

function UploadZone({ file, onFileChange, disabled }) {
  const ref = useRef(null);
  return (
      <div
          onClick={() => !disabled && ref.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
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
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <FileText size={18} />
              <span className="text-sm font-medium truncate max-w-[240px]">{file.name}</span>
            </div>
        ) : (
            <>
              <Upload size={20} className="mx-auto mb-1 text-gray-400" />
              <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-300 mt-0.5">PDF, PNG, JPG up to 10 MB</p>
            </>
        )}
      </div>
  );
}

// ── AssignModal ───────────────────────────────────────────────────────────────
/**
 * Props
 *  mode            – "assign" | "edit"
 *  hw              – existing homework record (edit mode only)
 *  subjects        – [{ id, label }]
 *  subjectsLoading – boolean
 *  submitting      – boolean
 *  onClose         – () => void
 *  onSave          – async (payload, file | null) => void
 *
 * The payload built here is passed to HomeworkPage.handleSave which enriches it
 * with sectionId and teacherId before calling the API.
 */
export default function AssignModal({
                                      mode = "assign",
                                      hw,
                                      subjects        = [],
                                      subjectsLoading = false,
                                      submitting      = false,
                                      onClose,
                                      onSave,
                                    }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() =>
      isEdit && hw
          ? {
            subjectId:    String(hw.subjectId ?? ""),
            title:        hw.title        ?? "",
            description:  hw.description  ?? hw.desc ?? "",
            assignedDate: hw.assignedDate ?? "",
            dueDate:      hw.dueDate      ?? "",
            // Normalise attachment type — the API may use "attachmentType" as the key
            attachType:   hw.attachmentType ?? hw.attachType ?? hw.attach?.toUpperCase() ?? "NONE",
            linkUrl:      hw.linkUrl      ?? "",
            status:       hw.status       ?? "PUBLISHED",
            academicYear: hw.academicYear ?? currentAcademicYear(),
          }
          : { ...EMPTY_FORM }
  );

  const [attachFile, setAttachFile] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    // Build a clean payload — HomeworkPage.handleSave adds sectionId + teacherId.
    // All ID fields are intentionally kept as their original type here;
    // sanitizePayload() in homework.js will coerce them to numbers before the request.
      if (form.assignedDate && form.dueDate) {
    if (new Date(form.dueDate) < new Date(form.assignedDate)) {
      toast.error("Due date cannot be earlier than assigned date");
      return;
    }
  }

    const payload = {
      // ── Required ──────────────────────────────────────────────────────────
      subjectId:      form.subjectId,       // sanitizePayload coerces → number
      title:          form.title.trim(),
      status:         form.status,
      academicYear:   form.academicYear,
      attachmentType: form.attachType || "NONE",

      // ── Optional — omit entirely when empty so the backend sees null vs. "" ─
      ...(form.description.trim()  && { description:  form.description.trim()  }),
      ...(form.assignedDate        && { assignedDate: form.assignedDate        }),
      ...(form.dueDate             && { dueDate:      form.dueDate             }),
      ...(form.attachType === "LINK" && form.linkUrl && { linkUrl: form.linkUrl }),
    };

    // The file is passed separately — HomeworkPage calls uploadHomeworkAttachment
    // after the create/update resolves and it has the saved homework ID.
    const file =
        form.attachType !== "NONE" && form.attachType !== "LINK"
            ? attachFile
            : null;

    await onSave(payload, file);
  };

  const showUpload = form.attachType !== "NONE" && form.attachType !== "LINK";
  const showLink   = form.attachType === "LINK";
  const canSubmit  = !submitting && form.title.trim() && form.subjectId && form.academicYear;

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={!submitting ? onClose : undefined}
      >
        <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
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

          {/* ── Body ── */}
          <div className="px-5 py-4 space-y-4">

            {/* Academic Year + Status */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Academic Year" required>
                <div className="relative">
                  <CalendarDays
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <select
                      value={form.academicYear}
                      onChange={(e) => set("academicYear", e.target.value)}
                      disabled={submitting}
                      className="w-full appearance-none border-[1.5px] border-gray-300 rounded-lg
                    pl-8 pr-7 py-2 text-sm outline-none bg-white
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    disabled:opacity-60"
                  >
                    <option value="">Select year</option>
                    {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                  <ChevronDown
                      size={13}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </Field>

              <Field label="Status" required>
                <ModalSelect
                    value={form.status}
                    onChange={(v) => set("status", v)}
                    disabled={submitting}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </ModalSelect>
              </Field>
            </div>

            {/* Subject */}
            <Field label="Subject" required>
              <ModalSelect
                  value={form.subjectId}
                  onChange={(v) => set("subjectId", v)}
                  disabled={submitting}
                  loading={subjectsLoading}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </ModalSelect>
            </Field>

            {/* Title */}
            <Field label="Title" required>
              <input
                  type="text"
                  value={form.title}
                  disabled={submitting}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Chapter 4 – Exercise 4.3"
                  className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
            </Field>

            {/* Description */}
            <Field label="Description">
            <textarea
                value={form.description}
                disabled={submitting}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Instructions for students…"
                rows={3}
                className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-y disabled:opacity-60"
            />
            </Field>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assigned Date" required>
                <input
                    type="date"
                    value={form.assignedDate}
                    disabled={submitting}
                    onChange={(e) => set("assignedDate", e.target.value)}
                    className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </Field>
              <Field label="Due Date" required> 
                <input
                    type="date"
                    value={form.dueDate}
                    disabled={submitting}
                     min={form.assignedDate || undefined}
                    onChange={(e) => set("dueDate", e.target.value)}
                    className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </Field>
            </div>

            {/* Attachment Type */}
            <Field label="Attachment Type">
              <ModalSelect
                  value={form.attachType}
                  onChange={(v) => { set("attachType", v); setAttachFile(null); }}
                  disabled={submitting}
              >
                <option value="NONE">None</option>
                <option value="PDF">PDF</option>
                <option value="IMAGE">Image</option>
                <option value="LINK">Link / URL</option>
              </ModalSelect>
            </Field>

            {showUpload && (
                <UploadZone file={attachFile} onFileChange={setAttachFile} disabled={submitting} />
            )}

            {showLink && (
                <Field label="Resource Link">
                  <input
                      type="url"
                      value={form.linkUrl}
                      disabled={submitting}
                      onChange={(e) => set("linkUrl", e.target.value)}
                      placeholder="https://…"
                      className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  />
                </Field>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600
              bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700
              hover:bg-blue-800 text-white rounded-lg transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : <><SendHorizonal size={13} /> {isEdit ? "Save Changes" : "Publish"}</>
              }
            </button>
          </div>
        </div>
      </div>
  );
}
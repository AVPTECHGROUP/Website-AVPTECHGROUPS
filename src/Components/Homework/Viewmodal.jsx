import { useState } from "react";
import {
  X, Pencil, ExternalLink, FileText,
  Image as ImageIcon, Link2, Download, Eye, EyeOff,
  AlignLeft, CalendarDays, User, BookOpen,
} from "lucide-react";
import { DuePill, StatusBadge, AttachChip } from "./Badges";

// ── colour palette ────────────────────────────────────────────────────────────
const SUBJECT_COLOURS = [
  { dot: "bg-amber-400",    text: "text-amber-700"   },
  { dot: "bg-blue-500",     text: "text-blue-700"    },
  { dot: "bg-emerald-500",  text: "text-emerald-700" },
  { dot: "bg-violet-500",   text: "text-violet-700"  },
  { dot: "bg-teal-500",     text: "text-teal-700"    },
  { dot: "bg-orange-500",   text: "text-orange-700"  },
  { dot: "bg-pink-500",     text: "text-pink-700"    },
  { dot: "bg-cyan-500",     text: "text-cyan-700"    },
];

function subjectColour(subject = "") {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  return SUBJECT_COLOURS[hash % SUBJECT_COLOURS.length];
}

function getSubjectName(hw)  { return hw.subjectName ?? hw.subject ?? hw.subjectTitle ?? "—"; }
function getTeacherName(hw)  { return hw.teacherName ?? hw.teacher ?? null; }
function getAttachUrl(hw)    { return hw.attachmentUrl ?? hw.fileUrl ?? hw.url ?? hw.linkUrl ?? null; }

function getAttachType(hw) {
  if (hw.attachmentType) {
    const t = hw.attachmentType.toLowerCase();
    if (t.includes("pdf"))   return "pdf";
    if (t.includes("image")) return "image";
    if (t.includes("link"))  return "link";
    return t;
  }
  if (hw.attachmentUrl || hw.fileUrl || hw.url || hw.linkUrl) return "link";
  return "none";
}

function getDueState(hw) {
  if (hw.dueState) return hw.dueState;
  if (!hw.dueDate) return "ok";
  const diff = (new Date(hw.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return "over";
  if (diff <= 2) return "soon";
  return "ok";
}

function getDueLabel(hw) {
  const state = getDueState(hw);
  if (state === "over") return "Overdue";
  if (hw.due)     return hw.due;
  if (hw.dueDate) return new Date(hw.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return "—";
}

function getAssignedLabel(hw) {
  if (hw.assigned)     return hw.assigned;
  if (hw.assignedDate) return new Date(hw.assignedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return "—";
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

// ── Read-only Field wrapper ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Read-only input look-alike ────────────────────────────────────────────────
function ReadBox({ children, className = "" }) {
  return (
    <div className={`w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 ${className}`}>
      {children || <span className="text-gray-300 italic">—</span>}
    </div>
  );
}

// ── Download helper — tries blob download, falls back to new tab ──────────────
async function triggerDownload(url) {
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
    // CORS may block direct blob download — open in new tab as fallback
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ── Attachment Section ────────────────────────────────────────────────────────
function AttachmentSection({ hw }) {
  const [open, setOpen] = useState(false);
  const type = getAttachType(hw);
  const url  = getAttachUrl(hw);
  if (type === "none" || !url) return null;

  const isPdf   = type === "pdf";
  const isImage = type === "image";
  const isLink  = !isPdf && !isImage;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50">
        <div className="flex items-center gap-1.5">
          {isPdf   && <FileText  size={13} className="text-red-500"  />}
          {isImage && <ImageIcon size={13} className="text-blue-500" />}
          {isLink  && <Link2     size={13} className="text-gray-500" />}
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {isPdf ? "PDF Attachment" : isImage ? "Image Attachment" : "Resource Link"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View/Hide toggle — only for file types, not links */}
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

          {/* Download — only for file types */}
          {(isPdf || isImage) && (
            <button
              type="button"
              onClick={() => triggerDownload(url)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Download size={12} /> Download
            </button>
          )}

          {/* Open in new tab — always shown */}
          <a
            href={isPdf ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}` : url}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ExternalLink size={12} /> Open
          </a>
        </div>
      </div>

      {/* ── Inline preview panel ── */}
      {open && (
        <div className="border-t border-gray-200">
          {isPdf && (
            <div className="bg-gray-100" style={{ height: 380 }}>
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
              />
            </div>
          )}
          {isImage && (
            <div className="bg-gray-100 flex items-center justify-center p-3 min-h-[80px]">
              <img
                src={url}
                alt="Homework attachment"
                className="max-w-full max-h-72 rounded-lg object-contain shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextElementSibling)
                    e.currentTarget.nextElementSibling.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center gap-1 text-sm text-gray-400 py-6">
                <ImageIcon size={18} className="text-gray-300" />
                <span>Image could not be loaded.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Link row (always visible for links) ── */}
      {isLink && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 transition-colors group border-t border-gray-200"
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

// ── ViewModal ─────────────────────────────────────────────────────────────────
export default function ViewModal({ hw, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState("details");

  if (!hw) return null;

  const subjectName   = getSubjectName(hw);
  const teacherName   = getTeacherName(hw);
  const { dot, text } = subjectColour(subjectName);
  const attachType    = getAttachType(hw);
  const hasContent    = !!(hw.description ?? hw.desc) || attachType !== "none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-700" />
            <h2 className="text-sm font-bold text-gray-900">Homework Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 px-5 flex-shrink-0">
          <Tab
            active={activeTab === "details"}
            onClick={() => setActiveTab("details")}
            icon={FileText}
            label="Details"
          />
          <Tab
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={AlignLeft}
            label="Description & Attachment"
            dot={hasContent}
          />
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ══ TAB 1: Details ══ */}
          {activeTab === "details" && (
            <div className="space-y-4">

              {/* Teacher row */}
              {teacherName ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <User size={13} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-blue-700 font-medium">{teacherName}</span>
                  <span className="ml-auto text-[10px] text-blue-400 font-semibold tracking-wide uppercase">Assigned by</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <User size={13} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-400 italic">Teacher not specified</span>
                </div>
              )}

              {/* Academic Year + Status */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Academic Year">
                  <div className="relative">
                    <CalendarDays size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <ReadBox className="pl-8">
                      {hw.academicYear ?? "—"}
                    </ReadBox>
                  </div>
                </Field>
                <Field label="Status">
                  <div className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 flex items-center">
                    <StatusBadge status={hw.status} />
                  </div>
                </Field>
              </div>

              {/* Subject */}
              <Field label="Subject">
                <div className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span className={`font-semibold ${text}`}>{subjectName}</span>
                </div>
              </Field>

              {/* Title */}
              <Field label="Title">
                <ReadBox className="font-semibold text-gray-900">
                  {hw.title}
                </ReadBox>
              </Field>

              {/* Assigned Date + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Assigned Date">
                  <ReadBox>{getAssignedLabel(hw)}</ReadBox>
                </Field>
                <Field label="Due Date">
                  <div className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 flex items-center gap-2">
                    <DuePill state={getDueState(hw)} label={getDueLabel(hw)} />
                  </div>
                </Field>
              </div>

            </div>
          )}

          {/* ══ TAB 2: Description & Attachment ══ */}
          {activeTab === "content" && (
            <div className="space-y-4">

              {/* Description */}
              <Field label="Description">
                <div
                  className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700
                             overflow-y-auto resize-none leading-relaxed whitespace-pre-wrap break-words"
                  style={{ minHeight: "140px", maxHeight: "260px" }}
                >
                  {(hw.description ?? hw.desc)
                    ? (hw.description ?? hw.desc)
                    : <span className="text-gray-300 italic">No description provided.</span>
                  }
                </div>
              </Field>

              {/* Attachment type label */}
              <Field label="Attachment Type">
                <div className="w-full border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 flex items-center gap-2">
                  <AttachChip type={attachType} />
                </div>
              </Field>

              {/* Attachment viewer with View + Download + Open */}
              <AttachmentSection hw={hw} />

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">

          {/* Tab dots */}
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
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {hw.status !== "CANCELLED" && (
              <button
                onClick={() => { onClose(); onEdit(hw); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
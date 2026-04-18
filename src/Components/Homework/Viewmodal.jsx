import { useState } from "react";
import {
  X, Pencil, ExternalLink, FileText,
  Image as ImageIcon, Link2, Download, Eye, EyeOff, AlignLeft,
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
  if (hw.dueDate) return new Date(hw.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return "—";
}

function getAssignedLabel(hw) {
  if (hw.assigned)     return hw.assigned;
  if (hw.assignedDate) return new Date(hw.assignedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return "—";
}

// ── Lazy Attachment section ───────────────────────────────────────────────────
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
            <a href={url} download className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <Download size={12} /> Download
            </a>
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

      {open && (
        <div className="border-t border-gray-200">
          {isPdf && (
            <div className="bg-gray-100" style={{ height: 420 }}>
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
                src={url} alt="Homework attachment"
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

      {isLink && (
        <a
          href={url} target="_blank" rel="noopener noreferrer"
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

// ── Description Box — collapses long text so attachment stays reachable ───────
const DESC_PREVIEW_LENGTH = 300;

function DescriptionBox({ text }) {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = !text || text.trim() === "";
  const isLong  = !isEmpty && text.length > DESC_PREVIEW_LENGTH;
  const display = isLong && !expanded ? text.slice(0, DESC_PREVIEW_LENGTH) + "…" : text;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <AlignLeft size={12} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instructions</span>
      </div>
      <div className="px-4 py-3 bg-white">
        {isEmpty ? (
          <p className="text-sm text-gray-300 italic">No description provided.</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{display}</p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {expanded ? "Show less ↑" : "Show more ↓"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── ViewModal ─────────────────────────────────────────────────────────────────
export default function ViewModal({ hw, onClose, onEdit }) {
  if (!hw) return null;

  const subjectName   = getSubjectName(hw);
  const { dot, text } = subjectColour(subjectName);

  const metaItems = [
    { label: "Assigned",   value: getAssignedLabel(hw) },
    { label: "Due",        value: <DuePill state={getDueState(hw)} label={getDueLabel(hw)} /> },
    { label: "Attachment", value: <AttachChip type={getAttachType(hw)} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/*
        FIX: flex flex-col + max-h-[90vh]
        - Header + Footer are flex-shrink-0 (never squished, never scroll away)
        - Body is flex-1 overflow-y-auto (scrolls independently)
        → Description can be any length; Attachment is always reachable by scrolling
      */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — pinned */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Homework Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Body — scrolls */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${text}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
              {subjectName}
            </span>
            <StatusBadge status={hw.status} />
          </div>

          <div className="text-base font-bold text-gray-900">{hw.title}</div>

          <div className="grid grid-cols-2 gap-3">
            {metaItems.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-sm text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Description collapses if > 300 chars so attachment is never pushed offscreen */}
          <DescriptionBox text={hw.description ?? hw.desc} />

          {/* Attachment always rendered below description */}
          <AttachmentSection hw={hw} />
        </div>

        {/* Footer — pinned */}
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
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
  );
}
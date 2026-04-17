import { X, Pencil, ExternalLink, FileText, Image as ImageIcon, Link2, Download } from "lucide-react";
import { DuePill, StatusBadge, AttachChip } from "./Badges";

// ── same deterministic colour palette as SubjectLabel in Badges.jsx ───────────
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
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_COLOURS[hash % SUBJECT_COLOURS.length];
}

// ── helpers ───────────────────────────────────────────────────────────────────
function getSubjectName(hw) {
  return hw.subjectName ?? hw.subject ?? hw.subjectTitle ?? "—";
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

function getAttachType(hw) {
  if (hw.attachmentType) {
    const type = hw.attachmentType.toLowerCase();
    if (type.includes("pdf"))   return "pdf";
    if (type.includes("image")) return "image";
    if (type.includes("doc"))   return "doc";
    if (type.includes("link"))  return "link";
    return type;
  }
  if (hw.attachmentUrl || hw.fileUrl || hw.url || hw.linkUrl) return "link";
  return "none";
}

// ── Resolve attachment URL from any possible field name ───────────────────────
function getAttachUrl(hw) {
  return hw.attachmentUrl ?? hw.fileUrl ?? hw.url ?? hw.linkUrl ?? null;
}

// ── Attachment Preview component ──────────────────────────────────────────────
function AttachmentPreview({ hw }) {
  const type      = getAttachType(hw);
  const attachUrl = getAttachUrl(hw);

  // Nothing to show
  if (type === "none" || !attachUrl) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Preview header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          {type === "pdf"   && <FileText  size={13} className="text-red-500"  />}
          {type === "image" && <ImageIcon size={13} className="text-blue-500" />}
          {type === "link"  && <Link2     size={13} className="text-gray-500" />}
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {type === "pdf"   && "PDF Attachment"}
            {type === "image" && "Image Attachment"}
            {type === "link"  && "Resource Link"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Download — forces save-to-disk without triggering viewer */}
          {(type === "pdf" || type === "image") && (
            <a
              href={attachUrl}
              download
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Download size={12} />
              Download
            </a>
          )}
          <a
            href={attachUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <ExternalLink size={12} />
            Open
          </a>
        </div>
      </div>

      {/* PDF — Google Docs Viewer iframe (bypasses Content-Disposition: attachment) */}
      {type === "pdf" && (
        <div className="bg-gray-100">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(attachUrl)}&embedded=true`}
            title="PDF Preview"
            className="w-full"
            style={{ height: "420px", border: "none" }}
          />
        </div>
      )}

      {/* Image — inline preview */}
      {type === "image" && (
        <div className="bg-gray-100 flex items-center justify-center p-3">
          <img
            src={attachUrl}
            alt="Homework attachment"
            className="max-w-full max-h-72 rounded-lg object-contain shadow-sm"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback if image fails to load */}
          <div
            className="hidden items-center gap-2 text-sm text-gray-400 py-6"
          >
            <ImageIcon size={18} className="text-gray-300" />
            <span>Image could not be loaded.</span>
            <a
              href={attachUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open link
            </a>
          </div>
        </div>
      )}

      {/* Link / URL — clickable card */}
      {type === "link" && (
        <a
          href={attachUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 transition-colors group"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Link2 size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors truncate">
              {attachUrl}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Click to open in new tab</div>
          </div>
          <ExternalLink size={13} className="ml-auto flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </a>
      )}
    </div>
  );
}

// ── exported ──────────────────────────────────────────────────────────────────
export default function ViewModal({ hw, onClose, onEdit }) {
  if (!hw) return null;

  const subjectName = getSubjectName(hw);
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
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Homework Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Subject chip + status badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${text}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
              {subjectName}
            </span>
            <StatusBadge status={hw.status} />
          </div>

          {/* Title + description */}
          <div>
            <div className="text-base font-bold text-gray-900">{hw.title}</div>
            <div className="text-sm text-gray-500 mt-1 leading-relaxed">
              {hw.description ?? hw.desc ?? "—"}
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {metaItems.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {label}
                </div>
                <div className="text-sm text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* ── Attachment Preview ── */}
          <AttachmentPreview hw={hw} />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
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
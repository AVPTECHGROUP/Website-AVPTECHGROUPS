import { X, Pencil } from "lucide-react";
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

// ── helper: resolve subject display name from the hw record ──────────────────
// The API may return the name under different field names depending on the
// endpoint. We try the most specific first and fall back gracefully.
function getSubjectName(hw) {
  return hw.subjectName ?? hw.subject ?? hw.subjectTitle ?? "—";
}

// ── helper: resolve due state / label from the hw record ─────────────────────
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

    if (type.includes("pdf")) return "pdf";
    if (type.includes("image")) return "image";
    if (type.includes("doc")) return "doc";

    return type;
  }

  if (hw.attachmentUrl) return "link";

  return "none";
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
    // { label: "Sections",   value: hw.sections?.join(", ") ?? hw.sectionName ?? "—" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px]"
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
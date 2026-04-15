import { Check, Clock, AlertCircle, FileText, Image, Link, Minus, Ban } from "lucide-react";

// ── deterministic colour palette ──────────────────────────────────────────────
// No lookup table keyed by name — works with any subject from the API.
// The same string always maps to the same colour via a simple hash.
const SUBJECT_COLOURS = [
  { dot: "bg-amber-400"   },
  { dot: "bg-blue-500"    },
  { dot: "bg-emerald-500" },
  { dot: "bg-violet-500"  },
  { dot: "bg-teal-500"    },
  { dot: "bg-orange-500"  },
  { dot: "bg-pink-500"    },
  { dot: "bg-cyan-500"    },
];

function subjectColour(subject = "") {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_COLOURS[hash % SUBJECT_COLOURS.length];
}

// ── Due date pill ─────────────────────────────────────────────────────────────
export function DuePill({ state, label }) {
  const map = {
    ok:   { cls: "bg-green-50 text-green-700 border-green-200",    Icon: Check       },
    soon: { cls: "bg-orange-50 text-orange-700 border-orange-200", Icon: Clock       },
    over: { cls: "bg-red-50 text-red-600 border-red-200",          Icon: AlertCircle },
  };
  const { cls, Icon } = map[state] ?? map.soon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (status === "PUBLISHED")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Published
      </span>
    );
  if (status === "DRAFT")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Draft
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <Ban size={10} /> Cancelled
    </span>
  );
}

// ── Attachment chip ───────────────────────────────────────────────────────────
export function AttachChip({ type }) {
  const map = {
    pdf:   { icon: <FileText size={11} />, label: "PDF",   cls: "text-gray-600 bg-slate-50 border-slate-200"     },
    image: { icon: <Image size={11} />,    label: "Image", cls: "text-gray-600 bg-slate-50 border-slate-200"     },
    link:  { icon: <Link size={11} />,     label: "Link",  cls: "text-violet-600 bg-violet-50 border-violet-200" },
    none:  { icon: <Minus size={11} />,    label: "None",  cls: "text-gray-400 bg-slate-50 border-slate-200"     },
  };
  const { icon, label, cls } = map[type?.toLowerCase()] ?? map.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {icon} {label}
    </span>
  );
}

// ── Subject dot + label ───────────────────────────────────────────────────────
// Accepts the display label from the API — no static lookup needed.
export function SubjectLabel({ subject = "—" }) {
  const { dot } = subjectColour(subject);
  return (
    <span className="inline-flex items-center text-sm text-gray-700">
      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${dot}`} />
      {subject}
    </span>
  );
}
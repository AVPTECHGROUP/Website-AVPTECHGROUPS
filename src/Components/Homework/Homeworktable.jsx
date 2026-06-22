import { Eye, Pencil, Ban, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { DuePill, StatusBadge, AttachChip, SubjectLabel } from "./Badges";

const COLUMNS = ["#", "Subject", "Title / Description", "Assigned", "Due Date", "Attachment", "Status", "Actions"];

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {COLUMNS.map((c) => (
        <td key={c} className="px-4 py-4">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex gap-2 pt-1">
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
      </div>
    </div>
  );
}

function getDueState(hw) {
  if (hw.dueState) return hw.dueState;
  const due = hw.dueDate ? new Date(hw.dueDate) : null;
  if (!due) return "ok";
  const now  = new Date();
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return "over";
  if (diff <= 2) return "soon";
  return "ok";
}

function getDueLabel(hw) {
  if (hw.dueState === "over") return "Overdue";
  if (hw.due)                 return hw.due;
  if (hw.dueDate)             return new Date(hw.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
    return type;
  }
  if (hw.attachmentUrl) return "link";
  return "none";
}

function getSubject(hw) {
  return hw.subject ?? hw.subjectName ?? hw.subjectId ?? "—";
}

function ActionBtn({ onClick, disabled, title, icon: Icon, label, variant }) {
  const variants = {
    view:   "border border-gray-300 text-gray-600 bg-white hover:bg-gray-50",
    edit:   "border border-blue-400 text-blue-600 bg-white hover:bg-blue-50",
    cancel: "border border-red-400 text-red-500 bg-white hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        transition-colors whitespace-nowrap flex-1 sm:flex-none min-h-[34px]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}`}
    >
      <Icon size={12} strokeWidth={2.2} />
      {label}
    </button>
  );
}

// ── Mobile card layout ────────────────────────────────────────────────────────
function HwCard({ hw, index, submitting, onView, onEdit, onCancel }) {
  const cancelled = hw.status === "CANCELLED";
  const dueState  = getDueState(hw);

  return (
    <div className="border-b border-gray-100 last:border-0 p-3 sm:p-4 hover:bg-blue-50/20 transition-colors">
      {/* Header row: index + subject + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-xs font-semibold text-gray-400 shrink-0">{index + 1}.</span>
          <div className="min-w-0 overflow-hidden">
            <SubjectLabel subject={getSubject(hw)} />
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={hw.status} />
        </div>
      </div>

      {/* Title + description */}
      <div className="mb-2">
        <div className="text-sm font-semibold text-gray-900 leading-snug">{hw.title}</div>
        <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
          {hw.description ?? hw.desc ?? ""}
        </div>
      </div>

      {/* Meta row: assigned, due, attachment */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-gray-500">
        <span>Assigned: <span className="text-gray-700 font-medium">{getAssignedLabel(hw)}</span></span>
        <DuePill state={dueState} label={getDueLabel(hw)} />
        <AttachChip type={getAttachType(hw)} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ActionBtn onClick={() => onView(hw)} disabled={false} title="View homework" icon={Eye} label="View" variant="view" />
        <ActionBtn onClick={() => !cancelled && onEdit(hw)} disabled={cancelled || submitting} title={cancelled ? "Cannot edit a cancelled homework" : "Edit homework"} icon={Pencil} label="Edit" variant="edit" />
        <ActionBtn onClick={() => !cancelled && !submitting && onCancel(hw.id)} disabled={cancelled || submitting} title={cancelled ? "Already cancelled" : "Cancel homework"} icon={submitting ? Loader2 : Ban} label={cancelled ? "Cancelled" : "Cancel"} variant="cancel" />
      </div>
    </div>
  );
}

// ── Desktop table row (unchanged logic) ──────────────────────────────────────
function HwRow({ hw, index, submitting, onView, onEdit, onCancel }) {
  const cancelled = hw.status === "CANCELLED";
  const dueState  = getDueState(hw);

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors">
      <td className="px-4 py-3.5 text-xs font-semibold text-gray-400 w-8">{index + 1}</td>

      <td className="px-4 py-3.5 whitespace-nowrap">
        <SubjectLabel subject={getSubject(hw)} />
      </td>

      <td className="px-4 py-3.5">
        <div className="text-sm font-semibold text-gray-900 leading-snug">{hw.title}</div>
        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">
          {hw.description ?? hw.desc ?? ""}
        </div>
      </td>

      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{getAssignedLabel(hw)}</td>

      <td className="px-4 py-3.5">
        <DuePill state={dueState} label={getDueLabel(hw)} />
      </td>

      <td className="px-4 py-3.5">
        <AttachChip type={getAttachType(hw)} />
      </td>

      <td className="px-4 py-3.5">
        <StatusBadge status={hw.status} />
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <ActionBtn onClick={() => onView(hw)} disabled={false} title="View homework" icon={Eye} label="View" variant="view" />
          <ActionBtn onClick={() => !cancelled && onEdit(hw)} disabled={cancelled || submitting} title={cancelled ? "Cannot edit a cancelled homework" : "Edit homework"} icon={Pencil} label="Edit" variant="edit" />
          <ActionBtn onClick={() => !cancelled && !submitting && onCancel(hw.id)} disabled={cancelled || submitting} title={cancelled ? "Already cancelled" : "Cancel homework"} icon={submitting ? Loader2 : Ban} label={cancelled ? "Cancelled" : "Cancel"} variant="cancel" />
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ mobile }) {
  if (mobile) {
    return (
      <div className="px-4 py-16 text-center text-sm text-gray-400">
        No homework found matching your filters.
      </div>
    );
  }
  return (
    <tr>
      <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
        No homework found matching your filters.
      </td>
    </tr>
  );
}

function TableFooter({ total }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
      <span className="text-xs text-gray-500">Showing 1–{total} of {total} items</span>
      <div className="flex gap-1.5">
        <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
          <ChevronLeft size={13} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-700 border-blue-700 text-white text-xs font-semibold">
          1
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function HomeworkTable({ rows, loading, submitting, onView, onEdit, onCancel }) {
  return (
    <>
      {/* ── Card view (< xl = mobile, tablet, laptop 1024px) ─────────────── */}
      <div className="xl:hidden">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : rows.length === 0
            ? <EmptyState mobile />
            : rows.map((hw, i) => (
                <HwCard
                  key={hw.id}
                  hw={hw}
                  index={i}
                  submitting={submitting}
                  onView={onView}
                  onEdit={onEdit}
                  onCancel={onCancel}
                />
              ))
        }
      </div>

      {/* ── Desktop table view (xl+ = 1280px+) ──────────────────────────── */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="w-full border-collapse min-w-[960px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : rows.length === 0
                ? <EmptyState />
                : rows.map((hw, i) => (
                    <HwRow
                      key={hw.id}
                      hw={hw}
                      index={i}
                      submitting={submitting}
                      onView={onView}
                      onEdit={onEdit}
                      onCancel={onCancel}
                    />
                  ))
            }
          </tbody>
        </table>
      </div>

      {!loading && rows.length > 0 && <TableFooter total={rows.length} />}
    </>
  );
}
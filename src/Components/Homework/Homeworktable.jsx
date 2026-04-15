import { useState, useRef } from "react";
import { Eye, Pencil, Ban, ChevronLeft, ChevronRight, Loader2, CalendarDays } from "lucide-react";
import { DuePill, StatusBadge, AttachChip, SubjectLabel } from "./Badges";

const COLUMNS = ["#", "Subject", "Title / Description", "Assigned", "Due Date", "Attachment", "Status", "Actions"];

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── Field readers ─────────────────────────────────────────────────────────────
function getDueState(hw) {
  if (hw.dueState) return hw.dueState;
  const due = hw.dueDate ? new Date(hw.dueDate) : null;
  if (!due) return "ok";
  const diff = (due - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return "over";
  if (diff <= 2) return "soon";
  return "ok";
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toInputVal(iso) {
  if (!iso) return "";
  return iso.split("T")[0];   // "YYYY-MM-DD"
}

function getAttachType(hw) {
  if (hw.attach)     return hw.attach;
  if (hw.attachType) return hw.attachType.toLowerCase();
  if (hw.linkUrl)    return "link";
  return "none";
}

function getSubject(hw) {
  return hw.subject ?? hw.subjectName ?? hw.subjectId ?? "—";
}

// ── Inline editable date cell ─────────────────────────────────────────────────
// Renders as a styled label. Clicking it reveals a native date picker.
// On change → calls onSave(newIsoDate). Pressing Escape cancels.
function EditableDate({ iso, onSave, disabled }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const open = () => {
    if (disabled) return;
    setEditing(true);
    // Focus the hidden input after React paints
    setTimeout(() => inputRef.current?.showPicker?.(), 50);
  };

  const commit = (e) => {
    const val = e.target.value;   // "YYYY-MM-DD"
    setEditing(false);
    if (val && val !== toInputVal(iso)) onSave(val);
  };

  const cancel = (e) => {
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1 group">
      {/* Visible label */}
      <button
        onClick={open}
        disabled={disabled}
        title={disabled ? undefined : "Click to change date"}
        className={`flex items-center gap-1 text-sm text-gray-600 rounded px-1 py-0.5
          transition-colors
          ${disabled ? "cursor-default" : "hover:bg-blue-50 hover:text-blue-700 cursor-pointer"}`}
      >
        {fmtDate(iso)}
        {!disabled && (
          <CalendarDays
            size={11}
            className="text-gray-300 group-hover:text-blue-500 transition-colors"
          />
        )}
      </button>

      {/* Native date input — visible only while editing */}
      {editing && (
        <input
          ref={inputRef}
          type="date"
          defaultValue={toInputVal(iso)}
          onChange={commit}
          onKeyDown={cancel}
          onBlur={() => setEditing(false)}
          className="absolute left-0 top-0 opacity-0 w-0 h-0 pointer-events-none"
          style={{ visibility: "hidden" }}
          autoFocus
        />
      )}
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, title, icon: Icon, label, variant }) {
  const variants = {
    view:   "border border-gray-300   text-gray-600  bg-white hover:bg-gray-50",
    edit:   "border border-blue-400   text-blue-600  bg-white hover:bg-blue-50",
    cancel: "border border-red-400    text-red-500   bg-white hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}`}
    >
      <Icon size={12} strokeWidth={2.2} />
      {label}
    </button>
  );
}

// ── Single row ────────────────────────────────────────────────────────────────
function HwRow({ hw, index, submitting, onView, onEdit, onCancel, onDateSave }) {
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

      {/* Assigned date — click to edit */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <EditableDate
          iso={hw.assignedDate}
          disabled={cancelled || submitting}
          onSave={(val) => onDateSave(hw, "assignedDate", val)}
        />
      </td>

      {/* Due date — click to edit */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <DuePill state={dueState} label={fmtDate(hw.dueDate)} />
          <EditableDate
            iso={hw.dueDate}
            disabled={cancelled || submitting}
            onSave={(val) => onDateSave(hw, "dueDate", val)}
          />
        </div>
      </td>

      <td className="px-4 py-3.5">
        <AttachChip type={getAttachType(hw)} />
      </td>

      <td className="px-4 py-3.5">
        <StatusBadge status={hw.status} />
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <ActionBtn
            onClick={() => onView(hw)}
            icon={Eye} label="View" variant="view"
          />
          <ActionBtn
            onClick={() => !cancelled && onEdit(hw)}
            disabled={cancelled || submitting}
            title={cancelled ? "Cannot edit a cancelled homework" : "Edit homework"}
            icon={Pencil} label="Edit" variant="edit"
          />
          <ActionBtn
            onClick={() => !cancelled && !submitting && onCancel(hw.id)}
            disabled={cancelled || submitting}
            title={cancelled ? "Already cancelled" : "Cancel homework"}
            icon={submitting ? Loader2 : Ban}
            label={cancelled ? "Cancelled" : "Cancel"}
            variant="cancel"
          />
        </div>
      </td>
    </tr>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr>
      <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
        No homework found matching your filters.
      </td>
    </tr>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
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

// ── Export ────────────────────────────────────────────────────────────────────
/**
 * Props:
 *   rows, loading, submitting
 *   onView(hw), onEdit(hw), onCancel(hwId)
 *   onDateSave(hw, field, "YYYY-MM-DD")  ← called when user picks a new date inline
 */
export default function HomeworkTable({ rows, loading, submitting, onView, onEdit, onCancel, onDateSave }) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[960px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
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
                      onDateSave={onDateSave ?? (() => {})}
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
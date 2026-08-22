import { Eye, Pencil, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import LeadStatusBadge from "./LeadsStatusbadge.jsx";
import { STUDENT_STRENGTH_LABELS } from "../../Constants/StringConstants/LeadsConstants.js";
import { formatDateTime, getInitials, getAvatarColor } from "./Leadformatters.js";

const ROW_SKELETON_COUNT = 6;

const LeadsTable = ({
                        leads,
                        loading,
                        error,
                        onView,
                        onEdit,
                        page, // 0-indexed, matches the API's `pageable.pageNumber`
                        totalPages,
                        totalElements,
                        pageSize,
                        onPageChange,
                        onPageSizeChange,
                    }) => {
    const from = totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, totalElements);

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3 font-semibold">Full Name</th>
                        <th className="px-4 py-3 font-semibold">School</th>
                        <th className="px-4 py-3 font-semibold">Phone Number</th>
                        <th className="px-4 py-3 font-semibold">Strength</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Created</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading &&
                        Array.from({ length: ROW_SKELETON_COUNT }).map((_, i) => (
                            <tr key={`skeleton-${i}`} className="border-b border-slate-50">
                                {Array.from({ length: 7 }).map((__, j) => (
                                    <td key={j} className="px-4 py-3">
                                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-slate-100" />
                                    </td>
                                ))}
                            </tr>
                        ))}

                    {!loading && error && (
                        <tr>
                            <td colSpan={7} className="px-4 py-10 text-center text-sm text-red-500">
                                Couldn't load leads — {error}
                            </td>
                        </tr>
                    )}

                    {!loading && !error && leads.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-14 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-2">
                                    <Inbox className="h-8 w-8 text-slate-300" />
                                    <p className="text-sm">No leads match these filters.</p>
                                </div>
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        leads.map((lead) => (
                            <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                      <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                              lead.fullName
                          )}`}
                      >
                        {getInitials(lead.fullName)}
                      </span>
                                        <span className="font-medium text-slate-800">{lead.fullName || "—"}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{lead.schoolName || "—"}</td>
                                <td className="px-4 py-3 text-slate-600">{lead.phoneNumber || "—"}</td>
                                <td className="px-4 py-3 text-slate-600">
                                    {STUDENT_STRENGTH_LABELS[lead.studentStrength] ?? lead.studentStrength ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <LeadStatusBadge status={lead.status} />
                                </td>
                                <td className="px-4 py-3 text-slate-500">{formatDateTime(lead.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={() => onView(lead)}
                                            title="View"
                                            aria-label="View lead"
                                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEdit(lead)}
                                            title="Edit"
                                            aria-label="Edit lead"
                                            className="flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    Showing {from} to {to} of {totalElements}
                </p>

                <div className="flex items-center gap-3">
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-600"
                    >
                        {[10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size} / page
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(page - 1, 0))}
                            disabled={page === 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-2 text-sm text-slate-600">
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(page + 1, Math.max(totalPages - 1, 0)))}
                            disabled={page >= totalPages - 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadsTable;
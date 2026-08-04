import {
    GraduationCap, Pencil, ToggleLeft, ToggleRight, Hash, Bus,
    Calendar
} from "lucide-react";
import ListLoader from "../CommonComp/ListLoader";

// ─── Type badge colors & styling helper ────────────────────────────────────────
const getTypeBadgeClass = (type) => {
    const t = type?.replace(/_/g, " ")?.toUpperCase();
    if (t === "BOTH") return "bg-green-50 text-green-700 border-green-200";
    if (t === "PICKUP ONLY") return "bg-teal-50 text-teal-700 border-teal-200";
    if (t === "DROP ONLY") return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
};

// ─── Date Formatter Helper ───────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ─── Status Badge Component ───────────────────────────────────────────────────
function StatusBadge({ isActive, isBusy }) {
    if (isBusy)
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse whitespace-nowrap">
                Wait…
            </span>
        );
    if (isActive)
        return (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block shrink-0" />
                Active
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block shrink-0" />
            Inactive
        </span>
    );
}

// ─── Action Buttons Component ─────────────────────────────────────────────────
function ActionButtons({ a, isBusy, onAction, compact = false }) {
    return (
        /* Aligning buttons to the left matching the header */
        <div className="flex items-center justify-start gap-1.5 flex-nowrap">
            <button
                onClick={() => onAction(a, "edit")}
                className={`inline-flex items-center gap-1 font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 active:scale-95 transition-all whitespace-nowrap cursor-pointer
                    ${compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-xs"}`}
            >
                <Pencil className="w-3 h-3 shrink-0" />
                Edit
            </button>
            <button
                onClick={() => onAction(a, "toggle")}
                disabled={isBusy}
                className={`inline-flex items-center gap-1 font-semibold bg-white border rounded-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-xs"}
                    ${a.isActive
                        ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                        : "text-green-600 border-green-200 hover:bg-green-50"
                    }`}
            >
                {a.isActive ? (
                    <><ToggleLeft className="w-3 h-3 shrink-0" />Deactivate</>
                ) : (
                    <><ToggleRight className="w-3 h-3 shrink-0" />Activate</>
                )}
            </button>
        </div>
    );
}

// ─── Table Row Component ──────────────────────────────────────────────────────
function TableRow({ a, isBusy, onAction }) {
    const typeCls = getTypeBadgeClass(a.pickupDropType);

    return (
        <tr className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
            {/* Student Name & Details */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                <p className="font-bold text-gray-900 text-sm">{a.studentName}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    {a.admissionNumber && (
                        <span className="flex items-center gap-0.5">
                            <Hash className="w-3 h-3 shrink-0" />{a.admissionNumber}
                        </span>
                    )}
                    <span>•</span>
                    <span className="text-gray-500 font-medium">
                        {[a.className, a.sectionName].filter(Boolean).join(" – ") || "—"}
                    </span>
                </div>
            </td>

            {/* Route */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {a.routeCode || a.routeName}
                </span>
            </td>

            {/* Stop Name */}
            <td className="px-4 py-3.5 align-middle text-gray-700 text-sm font-medium whitespace-nowrap">
                {a.stopName || "—"}
            </td>

            {/* Type Badge */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap text-center">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${typeCls}`}>
                    {a.pickupDropType?.replace(/_/g, " ")}
                </span>
            </td>

            {/* Amount */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                <p className="font-bold text-gray-900 text-sm">
                    {a.resolvedFeeAmount != null ? `₹${Number(a.resolvedFeeAmount).toLocaleString("en-IN")}` : "—"}
                </p>
            </td>

            {/* Effective Dates */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                    {a.feePlanName && (
                        <span className="text-xs font-semibold text-purple-700 truncate max-w-[160px]">
                            {a.feePlanName}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>
                            {formatDate(a.effectiveFrom)}
                            <span className="mx-1 text-gray-400 font-normal">to</span>
                            {formatDate(a.effectiveTo)}
                        </span>
                    </div>
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                <StatusBadge isActive={a.isActive} isBusy={isBusy} />
            </td>

            {/* Actions (Aligned perfectly with the header) */}
            <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                <ActionButtons a={a} isBusy={isBusy} onAction={onAction} />
            </td>
        </tr>
    );
}

// ─── Mobile View Card ─────────────────────────────────────────────────────────
function MobileCard({ a, isBusy, onAction }) {
    const typeCls = getTypeBadgeClass(a.pickupDropType);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="min-w-0 flex-1 pr-3">
                    <p className="font-bold text-gray-900 text-sm truncate">{a.studentName}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {a.admissionNumber && (
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                <Hash className="w-3 h-3 shrink-0" />{a.admissionNumber}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">
                            {[a.className, a.sectionName].filter(Boolean).join(" – ") || "—"}
                        </span>
                    </div>
                </div>
                <StatusBadge isActive={a.isActive} isBusy={isBusy} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
                <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Bus className="w-3 h-3" /> Route & Stop
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {a.routeCode || a.routeName}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">{a.stopName || "—"}</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-1">Type</p>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${typeCls}`}>
                        {a.pickupDropType?.replace(/_/g, " ")}
                    </span>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-800">
                        {a.resolvedFeeAmount != null ? `₹${Number(a.resolvedFeeAmount).toLocaleString("en-IN")}` : "—"}
                    </p>
                </div>

                <div className="col-span-2 border-t border-gray-50 pt-2">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-500 shrink-0" /> Effective Dates
                    </p>
                    {a.feePlanName && (
                        <p className="text-xs font-semibold text-purple-700 mb-0.5">{a.feePlanName}</p>
                    )}
                    <p className="text-xs text-gray-700 font-medium">
                        {formatDate(a.effectiveFrom)} <span className="text-gray-400 font-normal">to</span> {formatDate(a.effectiveTo)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end px-4 py-3 bg-gray-50 border-t border-gray-100">
                <ActionButtons a={a} isBusy={isBusy} onAction={onAction} compact />
            </div>
        </div>
    );
}

// ─── Main Export Component ────────────────────────────────────────────────────
export default function AllocationTable({ data = [], loading = false, pageSize = 10, onAction, togglingId }) {
    return (
        <div className="w-full min-w-0" style={{ containerType: "inline-size" }}>

            {/* MOBILE CARDS VIEW (< 640px) */}
            <div className="allocation-cards w-full flex flex-col gap-3 px-4 py-4">
                {loading ? (
                    <ListLoader rows={pageSize} avatar={false} />
                ) : data.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                        <p className="font-medium">No allocations found</p>
                    </div>
                ) : (
                    data.map((a) => (
                        <MobileCard
                            key={a.id}
                            a={a}
                            isBusy={togglingId === a.id}
                            onAction={onAction}
                        />
                    ))
                )}
            </div>

            {/* FULL RESPONSIVE TABLE VIEW (≥ 640px) */}
            <div className="allocation-table w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[950px]">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            {[
                                "Student", "Route", "Stop Name", "Type",
                                "Amount", "Effective Dates", "Status", "Actions"
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <ListLoader rows={pageSize} avatar={false} />
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-16 text-gray-400">
                                    <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                                    <p className="font-medium">No allocations found</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((a) => (
                                <TableRow
                                    key={a.id}
                                    a={a}
                                    isBusy={togglingId === a.id}
                                    onAction={onAction}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .allocation-cards { display: flex; }
                .allocation-table { display: none; }

                @container (min-width: 640px) {
                    .allocation-cards { display: none; }
                    .allocation-table { display: block; }
                }
            `}</style>
        </div>
    );
}
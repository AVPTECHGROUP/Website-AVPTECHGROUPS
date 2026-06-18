import { useState, useEffect, useCallback } from "react";
import { 
    GraduationCap, Pencil, ToggleLeft, ToggleRight, Hash, Bus, 
    CreditCard, Calendar, CheckCircle, XCircle, XCircle as XCircleIcon 
} from "lucide-react";
import ListLoader from "../CommonComp/ListLoader";

// ─── Type badge colours ───────────────────────────────────────────────────────
const typeColors = {
    BOTH: "bg-green-50 text-green-700 border-green-200",
    PICKUP_ONLY: "bg-teal-50 text-teal-700 border-teal-200",
    "PICKUP ONLY": "bg-teal-50 text-teal-700 border-teal-200",
    DROP_ONLY: "bg-purple-50 text-purple-700 border-purple-200",
    "DROP ONLY": "bg-purple-50 text-purple-700 border-purple-200",
};

// ─── Shared sub-components ────────────────────────────────────────────────────
function StatusBadge({ isActive, isBusy }) {
    if (isBusy)
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">
                Wait…
            </span>
        );
    if (isActive)
        return (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block shrink-0" />
                Active
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block shrink-0" />
            Inactive
        </span>
    );
}

function ActionButtons({ a, isBusy, onAction, compact = false }) {
    return (
        /* 🔗 FIX: Changed flex-wrap to flex-nowrap to keep buttons strictly side-by-side */
        <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"} flex-nowrap`}>
            <button
                onClick={() => onAction(a, "edit")}
                className={`inline-flex items-center gap-1 font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 active:scale-95 transition-all whitespace-nowrap
                    ${compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-xs"}`}
            >
                <Pencil className="w-3 h-3 shrink-0" />
                Edit
            </button>
            <button
                onClick={() => onAction(a, "toggle")}
                disabled={isBusy}
                className={`inline-flex items-center gap-1 font-semibold bg-white border rounded-lg transition-all active:scale-95 whitespace-nowrap
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

// ─── MOBILE card  (container < 520px) ────────────────────────────────────────
function MobileCard({ a, isBusy, onAction }) {
    const typeCls = typeColors[a.pickupDropType] ?? "bg-gray-100 text-gray-600 border-gray-200";
    const formattedDate = a.effectiveFrom
        ? new Date(a.effectiveFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

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
                        <span className="text-xs text-gray-600">{a.stopName || "—"}</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-1">Type</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCls}`}>
                        {a.pickupDropType?.replace(/_/g, " ")}
                    </span>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Fee Plan
                    </p>
                    <p className="text-xs text-gray-700 font-medium truncate" title={a.feePlanName}>{a.feePlanName || "—"}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-800">
                        {a.feeAmount != null ? `₹${a.feeAmount.toLocaleString()}` : "—"}
                    </p>
                    {a.feeFrequency && <p className="text-xs text-gray-400">{a.feeFrequency}</p>}
                </div>

                <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Effective From
                    </p>
                    <p className="text-xs text-gray-700 font-medium">{formattedDate}</p>
                </div>
            </div>

            <div className="flex items-center justify-end px-4 py-3 bg-gray-50 border-t border-gray-100">
                <ActionButtons a={a} isBusy={isBusy} onAction={onAction} compact />
            </div>
        </div>
    );
}

// ─── TABLET row  (520px – 839px) ─────────────────────────────────────────────
function TabletRow({ a, isBusy, onAction }) {
    const typeCls = typeColors[a.pickupDropType] ?? "bg-gray-100 text-gray-600 border-gray-200";
    const formattedDate = a.effectiveFrom
        ? new Date(a.effectiveFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    return (
        <tr className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
            <td className="px-3 py-3 align-middle">
                <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{a.studentName}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-0.5">
                    <Hash className="w-3 h-3 shrink-0" />{a.admissionNumber || "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {[a.className, a.sectionName].filter(Boolean).join(" – ") || "—"}
                </p>
            </td>

            <td className="px-3 py-3 align-middle">
                <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                    {a.routeCode || a.routeName}
                </span>
                <p className="text-xs text-gray-600">{a.stopName || "—"}</p>
            </td>

            <td className="px-3 py-3 align-middle">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCls}`}>
                    {a.pickupDropType?.replace(/_/g, " ")}
                </span>
            </td>

            <td className="px-3 py-3 align-middle">
                <p className="font-bold text-gray-800 text-sm">
                    {a.feeAmount != null ? `₹${a.feeAmount.toLocaleString()}` : "—"}
                </p>
                {a.feeFrequency && <p className="text-xs text-gray-400">{a.feeFrequency}</p>}
                {/* 🆔 FIX: Removed cursor-help */}
                <p 
                    className="text-xs text-gray-500 mt-0.5 max-w-[140px] truncate"
                    title={a.feePlanName}
                >
                    {a.feePlanName || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
            </td>

            <td className="px-3 py-3 align-middle">
                <StatusBadge isActive={a.isActive} isBusy={isBusy} />
            </td>

            {/* 🔗 FIX: Added min-width to ensure buttons stay side-by-side on tablets */}
            <td className="px-3 py-3 align-middle min-w-[160px]">
                <ActionButtons a={a} isBusy={isBusy} onAction={onAction} compact />
            </td>
        </tr>
    );
}

// ─── DESKTOP row  (container ≥ 840px) ────────────────────────────────────────
function DesktopRow({ a, isBusy, onAction }) {
    const typeCls = typeColors[a.pickupDropType] ?? "bg-gray-100 text-gray-600 border-gray-200";
    const formattedDate = a.effectiveFrom
        ? new Date(a.effectiveFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    return (
        <tr className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
            <td className="px-4 py-4 whitespace-nowrap">
                <p className="font-bold text-gray-900">{a.studentName}</p>
                {a.admissionNumber && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-0.5">
                        <Hash className="w-3 h-3" />{a.admissionNumber}
                    </p>
                )}
            </td>
            <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                {[a.className, a.sectionName].filter(Boolean).join(" – ") || "—"}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
                <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {a.routeCode || a.routeName}
                </span>
            </td>
            <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">{a.stopName || "—"}</td>
            <td className="px-4 py-4 whitespace-nowrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeCls}`}>
                    {a.pickupDropType?.replace(/_/g, " ")}
                </span>
            </td>
            
            {/* 🆔 FIX: Removed cursor-help from layout template triggers */}
            <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                <div 
                    className="max-w-[150px] truncate font-medium" 
                    title={a.feePlanName}
                >
                    {a.feePlanName || "—"}
                </div>
            </td>

            <td className="px-4 py-4 whitespace-nowrap">
                <p className="font-semibold text-gray-800">
                    {a.feeAmount != null ? `₹${a.feeAmount.toLocaleString()}` : "—"}
                </p>
                {a.feeFrequency && <p className="text-xs text-gray-400 mt-0.5">{a.feeFrequency}</p>}
            </td>
            <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">{formattedDate}</td>
            <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge isActive={a.isActive} isBusy={isBusy} />
            </td>
            {/* 🔗 FIX: Added precise min-width bounds to desktop row cell to stop wrapping completely */}
            <td className="px-4 py-4 whitespace-nowrap min-w-[170px]">
                <ActionButtons a={a} isBusy={isBusy} onAction={onAction} />
            </td>
        </tr>
    );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ colSpan }) {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-16 text-gray-400">
                <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="font-medium">No allocations found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </td>
        </tr>
    );
}

// ─── Mobile skeleton ──────────────────────────────────────────────────────────
function MobileSkeletons({ count }) {
    return Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse space-y-3">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
                <div className="h-6 bg-gray-100 rounded-full w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded" />
                ))}
            </div>
        </div>
    ));
}

export default function AllocationTable({ data, loading, pageSize, onAction, togglingId }) {
    return (
        <div className="w-full min-w-0" style={{ containerType: "inline-size" }}>

            {/* MOBILE VIEW (< 520px) */}
            <div className="allocation-cards w-full flex flex-col gap-3 px-4 py-4">
                {loading ? (
                    <MobileSkeletons count={pageSize} />
                ) : data.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                        <p className="font-medium">No allocations found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
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

            {/* TABLET VIEW (520px–839px) */}
            <div className="allocation-tablet w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[650px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {["Student", "Route & Stop", "Type", "Amount / Plan", "Status", "Actions"].map((h) => (
                                <th key={h}
                                    className={`px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap ${h === "Actions" ? "min-w-[160px]" : ""}`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <ListLoader rows={pageSize} avatar={false} />
                        ) : data.length === 0 ? (
                            <EmptyState colSpan={6} />
                        ) : (
                            data.map((a) => (
                                <TabletRow
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

            {/* DESKTOP VIEW (≥ 840px) */}
            <div className="allocation-desktop w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[1100px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {[
                                "Student Name", "Class / Section", "Route", "Stop",
                                "Type", "Fee Plan", "Amount", "Effective From", "Status", "Actions"
                            ].map((h) => (
                                <th key={h}
                                    className={`px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap ${h === "Actions" ? "min-w-[170px]" : ""}`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <ListLoader rows={pageSize} avatar={false} />
                        ) : data.length === 0 ? (
                            <EmptyState colSpan={10} />
                        ) : (
                            data.map((a) => (
                                <DesktopRow
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
                .allocation-cards   { display: flex; }
                .allocation-tablet  { display: none; }
                .allocation-desktop { display: none; }

                @container (min-width: 520px) {
                    .allocation-cards   { display: none; }
                    .allocation-tablet  { display: block; }
                    .allocation-desktop { display: none; }
                }

                @container (min-width: 840px) {
                    .allocation-cards   { display: none; }
                    .allocation-tablet  { display: none; }
                    .allocation-desktop { display: block; }
                }
            `}</style>
        </div>
    );
}
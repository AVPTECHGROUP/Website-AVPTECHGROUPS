import { GraduationCap, Pencil, ToggleLeft, ToggleRight, Hash } from "lucide-react";
import ListLoader from "../CommonComp/ListLoader";

const typeColors = {
    BOTH: "bg-blue-100 text-blue-700 border-blue-200",
    PICKUP_ONLY: "bg-teal-100 text-teal-700 border-teal-200",
    "PICKUP ONLY": "bg-teal-100 text-teal-700 border-teal-200",
    DROP_ONLY: "bg-purple-100 text-purple-700 border-purple-200",
    "DROP ONLY": "bg-purple-100 text-purple-700 border-purple-200",
};

const COLUMNS = [
    { label: "Student Name", width: 180 },
    { label: "Class / Section", width: 140 },
    { label: "Route", width: 110 },
    { label: "Stop", width: 130 },
    { label: "Type", width: 120 },
    { label: "Fee Plan", width: 150 },
    { label: "Amount", width: 110 },
    { label: "Effective From", width: 130 },
    { label: "Status", width: 100 },
    { label: "Actions", width: 160 },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((s, c) => s + c.width, 0);

export default function AllocationTable({
    data,
    loading,
    pageSize,
    onAction,
    togglingId,
}) {
    return (
        <div className="w-full">

            {/* Horizontal scroll only when needed */}
            <div className="w-full overflow-x-auto lg:overflow-visible">

                <table
                    className="text-sm border-collapse w-full min-w-[1330px] lg:min-w-full"
                >
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {COLUMNS.map(({ label, width }) => (
                                <th
                                    key={label}
                                    style={{ minWidth: width, width }}
                                    className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap"
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <ListLoader rows={pageSize} avatar={false} />
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={COLUMNS.length}
                                    className="text-center py-16 text-gray-400"
                                >
                                    <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                                    <p className="font-medium">No allocations found</p>
                                    <p className="text-xs mt-1">
                                        Try adjusting your search or filters
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            data.map((a) => {
                                const isBusy = togglingId === a.id;

                                const typeCls =
                                    typeColors[a.pickupDropType] ??
                                    "bg-gray-100 text-gray-600 border-gray-200";

                                return (
                                    <tr
                                        key={a.id}
                                        className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors"
                                    >
                                        {/* Student Name */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="font-bold text-gray-900">
                                                {a.studentName}
                                            </p>

                                            {a.admissionNumber && (
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-0.5">
                                                    <Hash className="w-3 h-3" />
                                                    {a.admissionNumber}
                                                </p>
                                            )}
                                        </td>

                                        {/* Class / Section */}
                                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            {[a.className, a.sectionName]
                                                .filter(Boolean)
                                                .join(" – ") || "—"}
                                        </td>

                                        {/* Route */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                {a.routeCode || a.routeName}
                                            </span>
                                        </td>

                                        {/* Stop */}
                                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            {a.stopName || "—"}
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeCls}`}
                                            >
                                                {a.pickupDropType?.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        {/* Fee Plan */}
                                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            {a.feePlanName || "—"}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="font-semibold text-gray-800">
                                                {a.feeAmount != null
                                                    ? `₹${a.feeAmount.toLocaleString()}`
                                                    : "—"}
                                            </p>

                                            {a.feeFrequency && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {a.feeFrequency}
                                                </p>
                                            )}
                                        </td>

                                        {/* Effective From */}
                                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            {a.effectiveFrom
                                                ? new Date(a.effectiveFrom).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "—"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {isBusy ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">
                                                    Wait…
                                                </span>
                                            ) : a.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-full border border-green-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block shrink-0" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1.5 rounded-full border border-gray-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block shrink-0" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => onAction(a, "edit")}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    <Pencil className="w-3 h-3 shrink-0" />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => onAction(a, "toggle")}
                                                    disabled={isBusy}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            ${a.isActive
                                                            ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                                                            : "text-green-600 border-green-200 hover:bg-green-50"
                                                        }`}
                                                >
                                                    {a.isActive ? (
                                                        <>
                                                            <ToggleLeft className="w-3 h-3 shrink-0" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleRight className="w-3 h-3 shrink-0" />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
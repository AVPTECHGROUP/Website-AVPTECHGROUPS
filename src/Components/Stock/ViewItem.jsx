import React, { useEffect, useState } from "react";
import {
    X, Hash, Package, Layers, Ruler, BarChart2,
    ToggleLeft, AlignLeft, Tag, IndianRupee, Loader2,
} from "lucide-react";
import { getItemById } from "../../Api/StockApi";

const categoryColors = {
    STATIONERY:  "bg-gray-100   text-gray-700   border-gray-200",
    LAB:         "bg-purple-100 text-purple-700 border-purple-200",
    SPORTS:      "bg-blue-100   text-blue-700   border-blue-200",
    UNIFORM:     "bg-orange-100 text-orange-700 border-orange-200",
    BOOKS:       "bg-yellow-100 text-yellow-700 border-yellow-200",
    FURNITURE:   "bg-amber-100  text-amber-700  border-amber-200",
    ELECTRONICS: "bg-cyan-100   text-cyan-700   border-cyan-200",
    CLEANING:    "bg-teal-100   text-teal-700   border-teal-200",
    OTHER:       "bg-gray-100   text-gray-500   border-gray-200",
};

const categoryEmoji = {
    STATIONERY:  "✏️",
    LAB:         "🔬",
    SPORTS:      "🏏",
    UNIFORM:     "👕",
    BOOKS:       "📚",
    FURNITURE:   "🪑",
    ELECTRONICS: "💻",
    CLEANING:    "🧹",
    OTHER:       "📦",
};

function DetailRow({ icon: Icon, label, value, children }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                {children ?? <p className="text-sm font-semibold text-gray-800 wrap-break-word">{value ?? "—"}</p>}
            </div>
        </div>
    );
}

export default function ViewItem({ isOpen, onClose, item: itemSummary }) {
    // Full item data fetched from API
    const [item, setItem]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    // Fetch full item details when modal opens
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }
        document.body.style.overflow = "hidden";

        if (!itemSummary?.id) return;

        setLoading(true);
        setError(null);
        setItem(null);

        getItemById(itemSummary.id)
            .then((res) => {
                // API returns { success, data: { ...itemFields } }
                const data = res?.data ?? res;
                setItem({
                    id:          data.id,
                    code:        data.itemCode,
                    name:        data.itemName,
                    category:    data.category,
                    unit:        data.unit,
                    unitPrice:   data.unitPrice ?? 0,
                    totalStock:  data.totalQuantity ?? 0,
                    minLevel:    data.minimumStockLevel ?? 0,
                    description: data.description ?? "",
                    status:      data.status,
                    isBelowMin:  data.isBelowMinimum,
                    createdAt:   data.createdAt,
                    updatedAt:   data.updatedAt,
                });
            })
            .catch(() => setError("Failed to load item details."))
            .finally(() => setLoading(false));

        return () => { document.body.style.overflow = ""; };
    }, [isOpen, itemSummary]);

    if (!isOpen) return null;

    const isActive  = item?.status?.toUpperCase() === "ACTIVE";
    const catColor  = categoryColors[item?.category] ?? "bg-gray-100 text-gray-700 border-gray-200";
    const catEmoji  = categoryEmoji[item?.category]  ?? "📦";

    const formatDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden animate-view-in">
                <style>{`
                    @keyframes viewModalIn {
                        from { opacity: 0; transform: scale(0.95) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-view-in { animation: viewModalIn 0.2s ease-out forwards; }
                `}</style>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="text-base">🔍</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">Item Details</h2>
                            <p className="text-xs text-gray-400">{itemSummary?.code ?? "—"}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500">Loading item details…</p>
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
                        <p className="text-sm text-red-500 text-center">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                getItemById(itemSummary.id)
                                    .then((res) => setItem(res?.data ?? res))
                                    .catch(() => setError("Failed to load item details."))
                                    .finally(() => setLoading(false));
                            }}
                            className="text-sm text-blue-600 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Content ── */}
                {!loading && !error && item && (
                    <>
                        {/* Hero section */}
                        <div className="px-6 pt-5 pb-4 bg-linear-to-br from-blue-50 to-white border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl shrink-0">
                                    {catEmoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${catColor}`}>
                                            {item.category}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                            {isActive ? "● Active" : "● Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail rows */}
                        <div className="px-6 py-2 max-h-[50vh] overflow-y-auto">
                            <div className="divide-y divide-gray-100">

                                <DetailRow icon={Hash}       label="Item Code"  value={item.code} />
                                <DetailRow icon={Package}    label="Item Name"  value={item.name} />
                                <DetailRow icon={Tag}        label="Item ID"    value={`#${item.id}`} />

                                <DetailRow icon={Layers}     label="Category">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${catColor}`}>
                                        {catEmoji} {item.category}
                                    </span>
                                </DetailRow>

                                <DetailRow icon={Ruler}      label="Unit"       value={item.unit} />

                                {/* Unit Price — NEW */}
                                <DetailRow icon={IndianRupee} label="Unit Price">
                                    <span className="text-sm font-bold text-gray-800">
                                        ₹{Number(item.unitPrice).toFixed(2)}
                                    </span>
                                </DetailRow>

                                <DetailRow icon={BarChart2}  label="Total Stock">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${item.totalStock < item.minLevel ? "text-red-500" : "text-gray-800"}`}>
                                            {item.totalStock}
                                        </span>
                                        <span className="text-xs text-gray-400">{item.unit}</span>
                                        {item.isBelowMin && (
                                            <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-500 border border-red-100">
                                                Below Minimum
                                            </span>
                                        )}
                                    </div>
                                </DetailRow>

                                <DetailRow icon={BarChart2}  label="Min Stock Level" value={`${item.minLevel} ${item.unit}`} />

                                <DetailRow icon={ToggleLeft} label="Status">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </DetailRow>

                                <DetailRow icon={AlignLeft}  label="Description" value={item.description} />

                            </div>
                        </div>
                    </>
                )}

                {/* ── Footer ── */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
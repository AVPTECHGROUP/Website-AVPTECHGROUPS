import React, { useEffect } from "react";
import { X, Hash, Package, Layers, Ruler, BarChart2, ToggleLeft, AlignLeft, Tag } from "lucide-react";

const categoryColors = {
    STATIONERY: "bg-gray-100 text-gray-700 border-gray-200",
    LAB: "bg-purple-100 text-purple-700 border-purple-200",
    SPORTS: "bg-blue-100 text-blue-700 border-blue-200",
    UNIFORM: "bg-orange-100 text-orange-700 border-orange-200",
};

const categoryEmoji = {
    STATIONERY: "✏️",
    LAB: "🔬",
    SPORTS: "🏏",
    UNIFORM: "👕",
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

export default function ViewItem({ isOpen, onClose, item }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const isActive = item.status?.toUpperCase() === "ACTIVE";
    const catColor = categoryColors[item.category] ?? "bg-gray-100 text-gray-700 border-gray-200";
    const catEmoji = categoryEmoji[item.category] ?? "";

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

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="text-base">🔍</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">Item Details</h2>
                            <p className="text-xs text-gray-400">{item.code}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

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

                {/* Details */}
                <div className="px-6 py-2 max-h-[50vh] overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                        <DetailRow icon={Hash} label="Item Code" value={item.code} />
                        <DetailRow icon={Package} label="Item Name" value={item.name} />
                        <DetailRow icon={Tag} label="Item ID" value={`#${item.id}`} />
                        <DetailRow icon={Layers} label="Category">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${catColor}`}>
                                {catEmoji} {item.category}
                            </span>
                        </DetailRow>
                        <DetailRow icon={Ruler} label="Unit" value={item.unit} />
                        <DetailRow icon={BarChart2} label="Total Stock">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${item.totalStock < item.minLevel ? "text-red-500" : "text-gray-800"}`}>
                                    {item.totalStock ?? 0}
                                </span>
                                <span className="text-xs text-gray-400">{item.unit}</span>
                                {item.totalStock < item.minLevel && (
                                    <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-500 border border-red-100">
                                        Below Minimum
                                    </span>
                                )}
                            </div>
                        </DetailRow>
                        <DetailRow icon={BarChart2} label="Minimum Stock Level" value={`${item.minLevel} ${item.unit}`} />
                        <DetailRow icon={ToggleLeft} label="Status">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </DetailRow>
                        <DetailRow icon={AlignLeft} label="Description" value={item.description} />
                    </div>
                </div>

                {/* Footer */}
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
import React, { useState, useEffect, useCallback } from "react";
import { X, Package, Hash, AlignLeft, Save, BookOpen, Loader2, Pencil, Search } from "lucide-react";
import { getItemsList } from "../../Api/StockApi";

const catColors = {
    BOOKS:      "bg-blue-100 text-blue-700",
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB:        "bg-purple-100 text-purple-700",
    SPORTS:     "bg-green-100 text-green-700",
    UNIFORM:    "bg-yellow-100 text-yellow-700",
};

const inputCls =
    "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-300 transition border-gray-200";
const errCls = "border-red-400 focus:ring-red-200";

export default function AddItemStudent({
    isOpen,
    onClose,
    onSave,
    editData = null,
    className = "",
}) {
    const isEditMode = Boolean(editData);

    // ── Form state ──
    const [selectedItemId, setSelectedItemId] = useState("");
    const [quantity, setQuantity]             = useState("");
    const [remarks, setRemarks]               = useState("");
    const [errors, setErrors]                 = useState({});
    const [saving, setSaving]                 = useState(false);

    // ── Stock items for picker ──
    const [stockItems, setStockItems]     = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [itemSearch, setItemSearch]     = useState("");
    const [fetchError, setFetchError]     = useState("");

    // ── Load all active stock items (fetch all pages) ──
    const loadItems = useCallback(async () => {
        setLoadingItems(true);
        setFetchError("");
        try {
            // First page to know total
            const first = await getItemsList(0, 100, "", "", "ACTIVE");
            const all   = [...(first.items || [])];

            // If more pages exist, fetch them
            const total = first.pagination?.totalPages ?? 1;
            if (total > 1) {
                const rest = await Promise.all(
                    Array.from({ length: total - 1 }, (_, i) =>
                        getItemsList(i + 1, 100, "", "", "ACTIVE")
                    )
                );
                rest.forEach((r) => all.push(...(r.items || [])));
            }

            setStockItems(all);
        } catch {
            setFetchError("Failed to load items. Please try again.");
        } finally {
            setLoadingItems(false);
        }
    }, []);

    // ── Populate form when modal opens ──
    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        setErrors({});
        setItemSearch("");
        setSaving(false);
        setFetchError("");

        if (isEditMode) {
            setSelectedItemId(String(editData.itemId));
            setQuantity(String(editData.defaultQuantity ?? ""));
            setRemarks(editData.remarks ?? "");
        } else {
            setSelectedItemId("");
            setQuantity("");
            setRemarks("");
            loadItems(); // fetch fresh list on add open
        }

        return () => { document.body.style.overflow = ""; };
    }, [isOpen, isEditMode, editData, loadItems]);

    if (!isOpen) return null;

    // ── Filtered items ──
    const filteredItems = stockItems.filter((i) => {
        const q = itemSearch.toLowerCase();
        return (
            (i.itemName || "").toLowerCase().includes(q) ||
            (i.itemCode || "").toLowerCase().includes(q) ||
            (i.category || "").toLowerCase().includes(q)
        );
    });

    const selectedItem = stockItems.find((i) => String(i.id) === String(selectedItemId));

    // ── Validate ──
    const validate = () => {
        const e = {};
        if (!isEditMode && !selectedItemId) e.item = "Please select an item.";
        if (!quantity || isNaN(quantity) || Number(quantity) < 1)
            e.quantity = "Enter a valid quantity (min 1).";
        return e;
    };

    // ── Save ──
    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setSaving(true);
        try {
            await onSave({
                itemId:          isEditMode ? editData.itemId : Number(selectedItemId),
                itemLabel:       isEditMode ? editData.itemName : (selectedItem?.itemName || ""),
                defaultQuantity: Number(quantity),
                remarks:         remarks.trim() || null,
            });
        } catch {
            /* parent handles errors */
        } finally {
            setSaving(false);
        }
    };

    const heading = isEditMode
        ? `Edit Item — ${className}`
        : `Add Item to ${className}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden modal-pop">
                <style>{`
                    @keyframes popIn {
                        from { opacity: 0; transform: scale(0.94) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .modal-pop { animation: popIn 0.2s ease-out forwards; }
                `}</style>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            {isEditMode
                                ? <Pencil className="w-4 h-4 text-blue-600" />
                                : <BookOpen className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">{heading}</h2>
                            {isEditMode && (
                                <p className="text-xs text-gray-400 mt-0.5">{editData.itemName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-4 max-h-[72vh] overflow-y-auto">

                    {/* ── Item selector (add mode only) ── */}
                    {!isEditMode && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-gray-400" />
                                Select Item <span className="text-red-500">*</span>
                            </label>

                            {/* Loading state */}
                            {loadingItems && (
                                <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Loading items…</span>
                                </div>
                            )}

                            {/* Fetch error */}
                            {!loadingItems && fetchError && (
                                <div className="border border-red-200 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                                    <span>{fetchError}</span>
                                    <button
                                        onClick={loadItems}
                                        className="underline font-semibold shrink-0"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Item picker */}
                            {!loadingItems && !fetchError && (
                                <>
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, code, or category…"
                                            value={itemSearch}
                                            onChange={(e) => setItemSearch(e.target.value)}
                                            className={`${inputCls} pl-8 text-xs`}
                                        />
                                    </div>

                                    {/* Scrollable item list */}
                                    <div className={`border rounded-lg overflow-hidden ${errors.item ? "border-red-400" : "border-gray-200"}`}>
                                        {filteredItems.length === 0 ? (
                                            <div className="px-3 py-5 text-center text-xs text-gray-400">
                                                {stockItems.length === 0
                                                    ? "No active items found in stock."
                                                    : "No items match your search."}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                                {filteredItems.map((item) => {
                                                    const id  = String(item.id);
                                                    const isSelected = selectedItemId === id;
                                                    return (
                                                        <button
                                                            key={id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedItemId(id);
                                                                setErrors((p) => ({ ...p, item: "" }));
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors
                                                                ${isSelected
                                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                                    : "hover:bg-gray-50 border-l-4 border-transparent"}`}
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                                                                    {item.itemName}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {item.itemCode} · {item.unit}
                                                                    {item.totalQuantity !== undefined && (
                                                                        <span className={`ml-1.5 font-medium ${item.isBelowMinimum ? "text-orange-500" : "text-gray-400"}`}>
                                                                            · Stock: {item.totalQuantity}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            {item.category && (
                                                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ml-2 ${catColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected item confirmation pill */}
                                    {selectedItem && (
                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                            <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="text-xs font-semibold text-blue-700 flex-1 truncate">
                                                {selectedItem.itemName}
                                            </span>
                                            <span className="text-xs text-blue-500">{selectedItem.itemCode}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {errors.item && <p className="text-xs text-red-500">{errors.item}</p>}
                        </div>
                    )}

                    {/* ── Edit mode: read-only item badge ── */}
                    {isEditMode && (
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                            <Package className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-800 truncate">{editData.itemName}</p>
                                <p className="text-xs text-gray-400">{editData.itemCode} · {editData.itemUnit}</p>
                            </div>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${catColors[editData.itemCategory] ?? "bg-gray-100 text-gray-600"}`}>
                                {editData.itemCategory}
                            </span>
                        </div>
                    )}

                    {/* ── Default Quantity ── */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Hash className="w-4 h-4 text-gray-400" />
                            Default Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="e.g. 1"
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                                setErrors((p) => ({ ...p, quantity: "" }));
                            }}
                            className={`${inputCls} ${errors.quantity ? errCls : ""}`}
                        />
                        {errors.quantity
                            ? <p className="text-xs text-red-500">{errors.quantity}</p>
                            : <p className="text-xs text-gray-400">
                                Auto-loaded when creating a student order. Staff can adjust during order.
                              </p>
                        }
                    </div>

                    {/* ── Remarks ── */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Remarks <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g. One per student – AY 2025-26"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className={`${inputCls} resize-none`}
                        />
                    </div>

                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loadingItems}
                        className="flex items-center cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                    >
                        {saving
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating…" : "Saving…"}</>
                            : <><Save className="w-4 h-4" /> {isEditMode ? "Update Config" : "Save Config"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
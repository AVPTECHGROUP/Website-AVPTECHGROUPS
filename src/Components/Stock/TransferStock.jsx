import React, { useState, useEffect } from "react";
import { X, ArrowRight, Package, Hash, AlignLeft, ArrowLeftRight, Info, Loader2 } from "lucide-react";
import { getActiveStores, transferStock } from "../../Api/StockApi";
import { getStoreStock } from "../../Api/StoreApi";

export default function TransferStock({
    isOpen,
    onClose,
    onConfirm,
    preselectedItem = null,
}) {
    const [fromStore, setFromStore] = useState("");
    const [toStore, setToStore] = useState("");
    const [selectedItems, setSelectedItems] = useState({});
    const [remarks, setRemarks] = useState("");
    const [errors, setErrors] = useState({});
    const [storeOptions, setStoreOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [storeStockMap, setStoreStockMap] = useState({});
    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const fromStoreObj = storeOptions.find((s) => s.value === fromStore);
    const toStoreObj = storeOptions.find((s) => s.value === toStore);

    // ── Fetch stores once on open ──────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setLoadingStores(true);
        getActiveStores()
            .then((res) => {
                const stores = (res?.data || []).map((s) => ({
                    value: String(s.id),
                    label: s.storeName.trim(),
                }));
                setStoreOptions(stores);
                if (stores.length >= 2) {
                    setFromStore(stores[0].value);
                    setToStore(stores[1].value);
                }
            })
            .catch(() => setApiError("Failed to load stores."))
            .finally(() => setLoadingStores(false));
    }, [isOpen]);

    // ── Pre-fill fromStore from preselectedItem ────────────────
    // Overrides the default first-store selection when opened from table row
    useEffect(() => {
        if (!isOpen || !preselectedItem) return;

        if (preselectedItem.stores?.length > 0) {
            const sourceId = String(preselectedItem.stores[0].storeId);
            setFromStore(sourceId);

            // Set toStore to a different store (second in list, or first available that isn't sourceId)
            if (preselectedItem.stores.length > 1) {
                setToStore(String(preselectedItem.stores[1].storeId));
            } else {
                // fall back: pick any store from storeOptions that isn't the source
                setStoreOptions((opts) => {
                    const other = opts.find((o) => o.value !== sourceId);
                    if (other) setToStore(other.value);
                    return opts;
                });
            }
        }
    }, [isOpen, preselectedItem]);

    // ── Fetch items from source store whenever fromStore changes ──
    useEffect(() => {
        if (!isOpen || !fromStore) {
            setItemOptions([]);
            setStoreStockMap({});
            return;
        }
        setLoadingItems(true);
        setSelectedItems({});
        setStoreStockMap({});
        setItemOptions([]);
        setApiError("");

        getStoreStock(Number(fromStore))
            .then((stockList) => {
                const map = {};
                const opts = (stockList || []).map((s) => {
                    map[String(s.itemId)] = s.quantity;
                    return {
                        value: String(s.itemId),
                        label: `${s.itemName} (${s.itemCode})`,
                        unit: s.unit ?? "",
                        currentStock: s.quantity,
                    };
                });
                setStoreStockMap(map);
                setItemOptions(opts);
                if (opts.length === 0) setApiError("No stock found for this store.");
            })
            .catch(() => setApiError("Failed to load store stock."))
            .finally(() => setLoadingItems(false));
    }, [isOpen, fromStore]);

    // ── Once itemOptions are loaded, auto-select preselected item ──
    useEffect(() => {
        if (!preselectedItem || itemOptions.length === 0) return;

        const match = itemOptions.find(
            (o) => o.value === String(preselectedItem.id)
        );

        if (match) {
            setSelectedItems({
                [match.value]: 1,
            });
        }
    }, [itemOptions, preselectedItem]);

    // ── Body scroll lock ──────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleFromStore = (val) => {
        setFromStore(val);
        setErrors((p) => ({ ...p, fromStore: "" }));
        if (val === toStore) {
            const other = storeOptions.find((s) => s.value !== val);
            if (other) setToStore(other.value);
        }
    };

    const handleToStore = (val) => {
        setToStore(val);
        setErrors((p) => ({ ...p, toStore: "" }));
        if (val === fromStore) {
            const other = storeOptions.find((s) => s.value !== val);
            if (other) setFromStore(other.value);
        }
    };

    const handleReset = () => {
        setSelectedItems({}); setRemarks(""); setErrors({}); setApiError("");
        setSubmitting(false); setItemOptions([]); setStoreStockMap({});
        if (storeOptions.length >= 2) {
            setFromStore(storeOptions[0].value);
            setToStore(storeOptions[1].value);
        } else {
            setFromStore(""); setToStore("");
        }
    };

    const handleClose = () => { handleReset(); onClose(); };

    const validate = () => {
        const e = {};

        if (!fromStore) e.fromStore = "Source store is required";
        if (!toStore) e.toStore = "Destination store is required";

        if (Object.keys(selectedItems).length === 0) {
            e.item = "Select at least one item";
        }
        if (!remarks) e.remarks = "Remarks are required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setApiError("");
        try {
            const result = await transferStock({
                sourceStoreId: parseInt(fromStore),
                destinationStoreId: parseInt(toStore),
                items: Object.entries(selectedItems).map(([itemId, qty]) => ({
                    itemId: Number(itemId),
                    quantity: Number(qty),
                })),
                remarks,
            });
            if (onConfirm) onConfirm(result);
            handleClose();
        } catch (err) {
            setApiError(err?.message || "Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputCls = (err) =>
        `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${err ? "border-red-400" : "border-gray-200"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-transfer-in">
                <style>{`
                    @keyframes transferModalIn {
                        from { opacity: 0; transform: scale(0.95) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-transfer-in { animation: transferModalIn 0.2s ease-out forwards; }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Transfer Stock Between Stores</h2>
                        {/* Show prefilled badge if item was opened from table row */}
                        {preselectedItem && (
                            <span className="ml-1 text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                                {preselectedItem.itemName}
                            </span>
                        )}
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                            {apiError}
                        </div>
                    )}

                    {/* Store selectors */}
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                        {/* From */}
                        <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Store</p>
                            <div className="relative">
                                <select
                                    value={fromStore}
                                    disabled={loadingStores}
                                    onChange={(e) => handleFromStore(e.target.value)}
                                    className={`w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition appearance-none pr-8 ${errors.fromStore ? "border-red-500" : "border-gray-200"} ${loadingStores ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    <option value="">{loadingStores ? "Loading…" : "Select store…"}</option>
                                    {storeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                {loadingStores
                                    ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                    : <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                }
                            </div>
                            {errors.fromStore && <p className="text-red-500 text-xs mt-1">{errors.fromStore}</p>}
                        </div>

                        {/* Arrow */}
                        <div className="flex items-end pb-1 shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>

                        {/* To */}
                        <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Store</p>
                            <div className="relative">
                                <select
                                    value={toStore}
                                    disabled={loadingStores}
                                    onChange={(e) => handleToStore(e.target.value)}
                                    className={`w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition appearance-none pr-8 ${errors.toStore ? "border-red-500" : "border-gray-200"} ${loadingStores ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    <option value="">{loadingStores ? "Loading…" : "Select store…"}</option>
                                    {storeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                {loadingStores
                                    ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                    : <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                }
                            </div>
                            {errors.toStore && <p className="text-red-500 text-xs mt-1">{errors.toStore}</p>}
                        </div>
                    </div>
                    {/* Item — from source store stock */}
                    <div className="space-y-1.5">
                        <div className="relative">
                            {/* Item List with Quantity */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    Items <span className="text-red-500">*</span>

                                    {fromStore && (
                                        <span className="ml-auto text-xs font-normal text-gray-400">
                                            {loadingItems ? "Loading..." : `${itemOptions.length} item(s)`}
                                        </span>
                                    )}
                                </label>

                                <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                                    {itemOptions.map((itm) => {
                                        const qty = selectedItems[itm.value] || 0;
                                        const stock = storeStockMap[itm.value] ?? itm.currentStock;

                                        return (
                                            <div key={itm.value} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">

                                                {/* LEFT */}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {itm.label}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Stock: <span className="text-orange-500 font-semibold">{stock}</span>
                                                    </p>
                                                </div>

                                                {/* RIGHT +/- */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        disabled={qty === 0}
                                                        onClick={() => {
                                                            setSelectedItems((prev) => {
                                                                const current = prev[itm.value] || 0;

                                                                if (current <= 1) {
                                                                    const updated = { ...prev };
                                                                    delete updated[itm.value];
                                                                    return updated;
                                                                }
                                                                return {
                                                                    ...prev,
                                                                    [itm.value]: current - 1,
                                                                };
                                                            });
                                                        }}
                                                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                                                    >
                                                        −
                                                    </button>

                                                    <span className="w-8 text-center font-bold text-gray-800">
                                                        {qty}
                                                    </span>

                                                    <button
                                                        disabled={qty >= stock}
                                                        onClick={() => {
                                                            setSelectedItems((prev) => {
                                                                const current = prev[itm.value] || 0;
                                                                const stock = storeStockMap[itm.value] ?? itm.currentStock;

                                                                if (current < stock) {
                                                                    return {
                                                                        ...prev,
                                                                        [itm.value]: current + 1,
                                                                    };
                                                                }
                                                                return prev;
                                                            });
                                                        }}
                                                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.item && <p className="text-red-500 text-xs">{errors.item}</p>}
                            </div>
                        </div>
                        {errors.item && <p className="text-red-500 text-xs mt-0.5">{errors.item}</p>}
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Remarks <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g. Moving surplus to Lab Store"
                            value={remarks}
                            onChange={(e) => { setRemarks(e.target.value); setErrors((p) => ({ ...p, remarks: "" })); }}
                            className={`${inputCls(errors.remarks)} resize-none`}
                        />
                        {errors.remarks && <p className="text-red-500 text-xs mt-0.5">{errors.remarks}</p>}
                    </div>

                    {/* Preview Banner */}
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>
                                <span className="font-semibold">{fromStoreObj?.label ?? "Source"} → {toStoreObj?.label ?? "Destination"}</span>
                            </p>

                            <p className="opacity-80">
                                {Object.entries(selectedItems).length === 0
                                    ? "No items selected"
                                    : Object.entries(selectedItems).map(([id, qty]) => {
                                        const item = itemOptions.find(i => i.value === id);
                                        return `${item?.label} × ${qty}`;
                                    }).join(", ")
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Transferring…</>
                            : <><ArrowLeftRight className="w-4 h-4" /> Confirm Transfer</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
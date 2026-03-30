import React, { useState, useEffect, useCallback } from "react";
import { X, CheckSquare, Store, Package, Hash, FileText, AlignLeft, ShoppingCart, Loader2 } from "lucide-react";
import { getActiveStores, getItemsList, addStockInward, removeStockOutward } from "../../Api/StockApi";
import { getStoreStock } from "../../Api/StoreApi";

export default function StockManagementCard({
    isOpen,
    onClose,
    mode = "in",
    onConfirm,
    preselectedItem = null,  
}) {
    const isStockIn = mode === "in";

    const heading = isStockIn ? "Add Stock (Inward)" : "Remove Stock (Outward)";
    const headingIconColor = isStockIn ? "text-green-600" : "text-red-600";
    const previewBgColor = isStockIn ? "bg-green-50" : "bg-red-50";
    const previewBorderColor = isStockIn ? "border-green-200" : "border-red-200";
    const previewTextColor = isStockIn ? "text-green-700" : "text-red-700";
    const confirmBtnText = isStockIn ? "Confirm Stock IN" : "Confirm Stock OUT";
    const confirmBtnBg = isStockIn ? "bg-green-600" : "bg-red-600";
    const confirmBtnHover = isStockIn ? "hover:bg-green-700" : "hover:bg-red-700";

    const [store, setStore] = useState("");
    const [selectedItems, setSelectedItems] = useState({})
    const [reference, setReference] = useState("");
    const [removalReason, setRemovalReason] = useState("");
    const [remarks, setRemarks] = useState("");
    const [errors, setErrors] = useState({});

    const [storeOptions, setStoreOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [storeStockMap, setStoreStockMap] = useState({});
    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    // ── Fetch stores once on open ──────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setLoadingStores(true);
        getActiveStores()
            .then((res) => {
                setStoreOptions((res?.data || []).map((s) => ({
                    value: String(s.id),
                    label: s.storeName.trim(),
                })));
            })
            .catch(() => setApiError("Failed to load stores."))
            .finally(() => setLoadingStores(false));
    }, [isOpen]);

    // ── Pre-fill store from preselectedItem ────────────────────
    // Runs after stores load so the select value is recognised
    useEffect(() => {
        if (!isOpen || !preselectedItem) return;

        if (!isStockIn) {
            // Stock OUT: pre-select the first store that holds this item
            if (preselectedItem.stores?.length > 0) {
                setStore(String(preselectedItem.stores[0].storeId));
            }
        }
        // Stock IN: leave store blank — user should choose where to receive
        // but we still want to pre-select the item once item options load (handled below)
    }, [isOpen, preselectedItem, isStockIn]);

    // ── For Stock IN: fetch all active items ──────────────────
    useEffect(() => {
        if (!isOpen || !isStockIn) return;
        setLoadingItems(true);
        getItemsList(0, 500, "", "", "ACTIVE")
            .then(({ items }) => {
                setItemOptions(items.map((i) => ({
                    value: String(i.id),
                    label: `${i.itemName} (${i.itemCode})`,
                    unit: i.unit,
                    currentStock: i.totalQuantity ?? 0,
                })));
            })
            .catch(() => setApiError("Failed to load items."))
            .finally(() => setLoadingItems(false));
    }, [isOpen, isStockIn]);

    // ── For Stock OUT: fetch store-specific stock on store change ──
    useEffect(() => {
        if (!isOpen || isStockIn || !store) {
            if (!isStockIn) { setItemOptions([]); setStoreStockMap({}); }
            return;
        }
        setLoadingItems(true);
        setSelectedItems({});
        setStoreStockMap({});
        getStoreStock(Number(store))
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
    }, [isOpen, isStockIn, store]);

    useEffect(() => {
        if (!preselectedItem || itemOptions.length === 0) return;
        const match = itemOptions.find((o) => o.value === String(preselectedItem.id));
        if (match) {
            setSelectedItems({
                [match.value]: { quantity: 1 }
            });
        }
    }, [itemOptions, preselectedItem]);

    // ── Body scroll lock ──────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleQtyChange = (id, delta) => {
        setSelectedItems((prev) => {
            const existing = prev[id];
            let newQty = (existing?.quantity || 0) + delta;

            if (newQty <= 0) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }
            if (!isStockIn) {
                const available = storeStockMap[id] ?? 0;
                if (newQty > available) return prev;
            }

            return {
                ...prev,
                [id]: { quantity: newQty }
            };
        });
    };

    const handleReset = () => {
        setStore("");
        setSelectedItems({}); setReference("");
        setRemovalReason(""); setRemarks(""); setErrors({}); setApiError("");
        setSubmitting(false); setItemOptions([]); setStoreStockMap({});
    };

    const handleClose = () => { handleReset(); onClose(); };

    const validate = () => {
        const e = {};
        if (!store) e.store = "Store is required";
        const selectedEntries = Object.entries(selectedItems);

        if (selectedEntries.length === 0) {
            e.items = "Select at least one item";
        }
        for (let [id, data] of selectedEntries) {
            if (data.quantity <= 0) {
                e.items = "Quantity must be greater than 0";
                break;
            }

            if (!isStockIn) {
                const available = storeStockMap[id] ?? 0;
                if (data.quantity > available) {
                    e.items = `Only ${available} units available for some items`;
                    break;
                }
            }
        }
        if (isStockIn && !reference) e.reference = "Reference number is required";
        if (!isStockIn && !removalReason) e.removalReason = "Removal reason is required";
        if (!remarks) e.remarks = "Remarks are required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setApiError("");
        try {
            let result;
            if (isStockIn) {
                result = await addStockInward({
                    storeId: parseInt(store),
                    items: Object.entries(selectedItems)
                        .filter(([_, data]) => data.quantity > 0)
                        .map(([id, data]) => ({
                            itemId: Number(id),
                            quantity: data.quantity,
                        })),
                    referenceNumber: reference,
                    remarks,
                });
            } else {
                result = await removeStockOutward({
                    storeId: parseInt(store),
                    items: Object.entries(selectedItems).map(([id, data]) => ({
                        itemId: Number(id),
                        quantity: data.quantity,
                    })),
                    removalReason,
                    remarks,
                });
            }
            if (onConfirm) onConfirm(result);
            handleClose();
        } catch (err) {
            setApiError(err?.message || "Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const removalReasonOptions = [
        { value: "ISSUED_TO_STUDENT", label: "Issued to Student" },
        { value: "ISSUED_TO_STAFF", label: "Issued to Staff" },
        { value: "DAMAGED", label: "Damaged" },
        { value: "EXPIRED", label: "Expired" },
        { value: "LOST", label: "Lost" },
        { value: "OTHER", label: "Other" },
    ];

    const inputCls = (err) =>
        `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${err ? "border-red-400" : "border-gray-200"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/10" onClick={handleClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-stock-in">
                <style>{`
                    @keyframes stockModalIn {
                        from { opacity: 0; transform: scale(0.95) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-stock-in { animation: stockModalIn 0.2s ease-out forwards; }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className={`w-5 h-5 ${headingIconColor}`} />
                        <h2 className="text-lg font-bold text-gray-800">{heading}</h2>
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

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                            {apiError}
                        </div>
                    )}

                    {/* Store */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-gray-400" />
                            Store <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={store}
                                disabled={loadingStores}
                                onChange={(e) => { setStore(e.target.value); setErrors((p) => ({ ...p, store: "" })); setApiError(""); }}
                                className={`${inputCls(errors.store)} appearance-none pr-8 ${loadingStores ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                <option value="">{loadingStores ? "Loading stores…" : "Select a store…"}</option>
                                {storeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            {loadingStores
                                ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                : <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            }
                        </div>
                        {errors.store && <p className="text-red-500 text-xs mt-0.5">{errors.store}</p>}
                    </div>

                    {/* Item */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-gray-400" />
                            Item <span className="text-red-500">*</span>
                            {store && (
                                <span className="ml-auto text-xs font-normal text-gray-400">
                                    {loadingItems
                                        ? "Loading items..."
                                        : `${itemOptions.length} item(s)`}
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {itemOptions.map((itm) => {
                                    const qty = selectedItems[itm.value]?.quantity || 0;
                                    const stock = storeStockMap[itm.value] ?? itm.currentStock;

                                    return (
                                        <div
                                            key={itm.value}
                                            className="flex items-center justify-between px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                                        >
                                            {/* LEFT */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {itm.label}
                                                    </p>

                                                    {/* Example Tag (optional if you have category) */}
                                                    {itm.category && (
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-600">
                                                            {itm.category}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-400">
                                                    Stock:{" "}
                                                    <span className="text-orange-500 font-semibold">
                                                        {stock}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQtyChange(itm.value, -1)}
                                                    className="w-8 h-8 rounded-lg border bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm"
                                                >
                                                    −
                                                </button>

                                                <span className="w-6 text-center font-semibold text-gray-700">
                                                    {qty}
                                                </span>

                                                <button
                                                    onClick={() => handleQtyChange(itm.value, 1)}
                                                    className="w-8 h-8 rounded-lg border bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {errors.items && <p className="text-red-500 text-xs mt-0.5">{errors.items}</p>}
                    </div>
                    {isStockIn ? (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Invoice / Ref No. <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. INV-2026-031"
                                value={reference}
                                onChange={(e) => { setReference(e.target.value); setErrors((p) => ({ ...p, reference: "" })); }}
                                className={inputCls(errors.reference)}
                            />
                            {errors.reference && <p className="text-red-500 text-xs mt-0.5">{errors.reference}</p>}
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Removal Reason <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={removalReason}
                                    onChange={(e) => { setRemovalReason(e.target.value); setErrors((p) => ({ ...p, removalReason: "" })); }}
                                    className={`${inputCls(errors.removalReason)} appearance-none pr-8`}
                                >
                                    <option value="">Select reason…</option>
                                    {removalReasonOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                            {errors.removalReason && <p className="text-red-500 text-xs mt-0.5">{errors.removalReason}</p>}
                        </div>
                    )}

                    {/* Remarks */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Remarks <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder={isStockIn ? "e.g. Received from vendor ABC" : "e.g. Issued to Class 10 students"}
                            value={remarks}
                            onChange={(e) => { setRemarks(e.target.value); setErrors((p) => ({ ...p, remarks: "" })); }}
                            className={`${inputCls(errors.remarks)} resize-none`}
                        />
                        {errors.remarks && <p className="text-red-500 text-xs mt-0.5">{errors.remarks}</p>}
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
                        className={`flex items-center gap-2 ${confirmBtnBg} ${confirmBtnHover} text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                        ) : (
                            <><CheckSquare className="w-4 h-4" /> {confirmBtnText}</>
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
}
import React, { useState, useEffect } from "react";
import { X, ArrowRight, Package, Hash, AlignLeft, ArrowLeftRight, Info } from "lucide-react";
import { getActiveStores, getItemsList, transferStock } from "../../Api/StockApi";

export default function TransferStock({ isOpen, onClose, onConfirm }) {
    const [fromStore, setFromStore] = useState("");
    const [toStore, setToStore] = useState("");
    const [item, setItem] = useState("");
    const [quantity, setQuantity] = useState("");
    const [remarks, setRemarks] = useState("");
    const [errors, setErrors] = useState({});

    const [storeOptions, setStoreOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const selectedItem = itemOptions.find((i) => i.value === item);
    const parsedQty = parseInt(quantity) || 0;
    const fromAfter = selectedItem ? selectedItem.currentStock - parsedQty : null;

    // Fetch stores
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

    // Fetch items
    useEffect(() => {
        if (!isOpen) return;
        setLoadingItems(true);
        getItemsList(0, 100, "", "", "ACTIVE")
            .then(({ items }) => {
                const mapped = items.map((i) => ({
                    value: String(i.id),
                    label: `${i.itemName} (${i.itemCode})`,
                    unit: i.unit,
                    currentStock: i.totalQuantity ?? 0,
                }));
                setItemOptions(mapped);
            })
            .catch(() => setApiError("Failed to load items."))
            .finally(() => setLoadingItems(false));
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => { setItem(""); }, [fromStore]);

    const handleFromStore = (val) => {
        setFromStore(val);
        if (val === toStore) {
            const other = storeOptions.find((s) => s.value !== val);
            if (other) setToStore(other.value);
        }
    };

    const handleToStore = (val) => {
        setToStore(val);
        if (val === fromStore) {
            const other = storeOptions.find((s) => s.value !== val);
            if (other) setFromStore(other.value);
        }
    };

    const handleReset = () => {
        setItem("");
        setQuantity("");
        setRemarks("");
        setErrors({});
        setApiError("");
        setSubmitting(false);
        if (storeOptions.length >= 2) {
            setFromStore(storeOptions[0].value);
            setToStore(storeOptions[1].value);
        } else {
            setFromStore("");
            setToStore("");
        }
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const validate = () => {
        let newErrors = {};
        if (!fromStore) newErrors.fromStore = "Source store is required";
        if (!toStore) newErrors.toStore = "Destination store is required";
        if (!item) newErrors.item = "Item is required";
        if (!quantity) {
            newErrors.quantity = "Quantity is required";
        } else if (parseInt(quantity) <= 0) {
            newErrors.quantity = "Quantity must be greater than 0";
        } else if (selectedItem && parseInt(quantity) > selectedItem.currentStock) {
            newErrors.quantity = "Quantity exceeds available stock";
        }
        if (!remarks) newErrors.remarks = "Remarks are required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setApiError("");
        try {
            const payload = {
                sourceStoreId: parseInt(fromStore),
                destinationStoreId: parseInt(toStore),
                itemId: parseInt(item),
                quantity: parsedQty,
                remarks,
            };
            const result = await transferStock(payload);
            if (onConfirm) onConfirm(result);
            handleClose();
        } catch (err) {
            setApiError(err?.message || "Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const fromStoreObj = storeOptions.find((s) => s.value === fromStore);
    const toStoreObj = storeOptions.find((s) => s.value === toStore);

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
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* API Error */}
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
                            <select
                                value={fromStore}
                                disabled={loadingStores}
                                onChange={(e) => handleFromStore(e.target.value)}
                                className={`w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition ${errors.fromStore ? "border-red-500" : "border-gray-200"} ${loadingStores ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                <option value="">{loadingStores ? "Loading..." : "Select store..."}</option>
                                {storeOptions.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            {errors.fromStore && <p className="text-red-500 text-xs mt-1">{errors.fromStore}</p>}
                        </div>

                        {/* Arrow */}
                        <div className="flex items-end pb-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>

                        {/* To */}
                        <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Store</p>
                            <select
                                value={toStore}
                                disabled={loadingStores}
                                onChange={(e) => handleToStore(e.target.value)}
                                className={`w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition ${errors.toStore ? "border-red-500" : "border-gray-200"} ${loadingStores ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                <option value="">{loadingStores ? "Loading..." : "Select store..."}</option>
                                {storeOptions.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            {errors.toStore && <p className="text-red-500 text-xs mt-1">{errors.toStore}</p>}
                        </div>
                    </div>

                    {/* Item */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-gray-400" />
                            Item <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={item}
                            disabled={loadingItems}
                            onChange={(e) => {
                                setItem(e.target.value);
                                setErrors({ ...errors, item: "" });
                            }}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm ${errors.item ? "border-red-500" : "border-gray-200"} ${loadingItems ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <option value="">{loadingItems ? "Loading items..." : "Select an item..."}</option>
                            {itemOptions.map((i) => (
                                <option key={i.value} value={i.value}>{i.label}</option>
                            ))}
                        </select>
                        {errors.item && <p className="text-red-500 text-xs mt-1">{errors.item}</p>}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Hash className="w-4 h-4 text-gray-400" />
                            Quantity to Transfer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="e.g. 10"
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                                setErrors({ ...errors, quantity: "" });
                            }}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm ${errors.quantity ? "border-red-500" : "border-gray-200"}`}
                        />
                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
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
                            onChange={(e) => {
                                setRemarks(e.target.value);
                                setErrors({ ...errors, remarks: "" });
                            }}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm ${errors.remarks ? "border-red-500" : "border-gray-200"}`}
                        />
                        {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
                    </div>

                    {/* Preview Banner */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                        <Info className="w-4 h-4 text-blue-500 shrink-0" />
                        <p className="text-sm text-blue-700">
                            <span className="font-semibold">{fromStoreObj?.label ?? "Source"}:</span>{" "}
                            <span className="font-bold">
                                {selectedItem ? selectedItem.currentStock : "—"}
                            </span>
                            {" → "}
                            <span className="font-bold">
                                {selectedItem && parsedQty > 0 ? fromAfter : selectedItem ? selectedItem.currentStock : "—"}
                            </span>
                            <span className="mx-2 text-blue-400">|</span>
                            <span className="font-semibold">{toStoreObj?.label ?? "Destination"}:</span>{" "}
                            <span className="font-bold">—</span>
                            {selectedItem && (
                                <span className="font-normal opacity-70"> (preview)</span>
                            )}
                        </p>
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
                        {submitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Transferring...
                            </>
                        ) : (
                            <>
                                <ArrowLeftRight className="w-4 h-4" />
                                Confirm Transfer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
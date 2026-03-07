import React, { useState, useEffect } from "react";
import { X, CheckSquare, Store, Package, Hash, FileText, AlignLeft, ShoppingCart } from "lucide-react";
import { getActiveStores, getItemsList, addStockInward, removeStockOutward } from "../../Api/StockApi";

export default function StockManagementCard({
    isOpen,
    onClose,
    mode = "in",
    onConfirm,
}) {
    const isStockIn = mode === "in";

    // Dynamic props based on mode
    const heading = isStockIn ? "Add Stock (Inward)" : "Remove Stock (Outward)";
    const headingIconColor = isStockIn ? "text-green-600" : "text-red-600";
    const previewLabelText = isStockIn ? "Current stock:" : "Current stock:";
    const previewBgColor = isStockIn ? "bg-green-50" : "bg-red-50";
    const previewBorderColor = isStockIn ? "border-green-200" : "border-red-200";
    const previewTextColor = isStockIn ? "text-green-700" : "text-red-700";
    const confirmBtnText = isStockIn ? "Confirm Stock IN" : "Confirm Stock OUT";
    const confirmBtnBgColor = isStockIn ? "bg-green-600" : "bg-red-600";
    const confirmBtnHoverColor = isStockIn ? "hover:bg-green-700" : "hover:bg-red-700";

    const [store, setStore] = useState("");
    const [item, setItem] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reference, setReference] = useState("");
    const [removalReason, setRemovalReason] = useState("");
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
    const afterStock = selectedItem
        ? isStockIn
            ? selectedItem.currentStock + parsedQty
            : selectedItem.currentStock - parsedQty
        : null;

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

    const handleReset = () => {
        setStore("");
        setItem("");
        setQuantity("");
        setReference("");
        setRemovalReason("");
        setRemarks("");
        setErrors({});
        setApiError("");
        setSubmitting(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const validate = () => {
        let newErrors = {};
        if (!store) newErrors.store = "Store is required";
        if (!item) newErrors.item = "Item is required";
        if (!quantity) {
            newErrors.quantity = "Quantity is required";
        } else if (parseInt(quantity) <= 0) {
            newErrors.quantity = "Quantity must be greater than 0";
        } else if (!isStockIn && selectedItem && parseInt(quantity) > selectedItem.currentStock) {
            newErrors.quantity = "Quantity exceeds available stock";
        }
        if (isStockIn && !reference) newErrors.reference = "Reference number is required";
        if (!isStockIn && !removalReason) newErrors.removalReason = "Removal reason is required";
        if (!remarks) newErrors.remarks = "Remarks are required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setApiError("");
        try {
            let result;
            if (isStockIn) {
                const payload = {
                    storeId: parseInt(store),
                    itemId: parseInt(item),
                    quantity: parsedQty,
                    referenceNumber: reference,
                    remarks,
                };
                result = await addStockInward(payload);
            } else {
                const payload = {
                    storeId: parseInt(store),
                    itemId: parseInt(item),
                    quantity: parsedQty,
                    removalReason,
                    remarks,
                };
                result = await removeStockOutward(payload);
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
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* API Error */}
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
                        <select
                            value={store}
                            disabled={loadingStores}
                            onChange={(e) => {
                                setStore(e.target.value);
                                setErrors({ ...errors, store: "" });
                            }}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm ${errors.store ? "border-red-500" : "border-gray-200"} ${loadingStores ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <option value="">{loadingStores ? "Loading stores..." : "Select a store..."}</option>
                            {storeOptions.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        {errors.store && <p className="text-red-500 text-xs mt-1">{errors.store}</p>}
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
                            className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.item ? "border-red-500" : "border-gray-200"} ${loadingItems ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <option value="">{loadingItems ? "Loading items..." : "Select an item..."}</option>
                            {itemOptions.map((i) => (
                                <option key={i.value} value={i.value}>{i.label}</option>
                            ))}
                        </select>
                        {errors.item && <p className="text-red-500 text-xs">{errors.item}</p>}
                    </div>

                    {/* Quantity + Reference (Stock In) or Quantity + Removal Reason (Stock Out) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Hash className="w-4 h-4 text-gray-400" />
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 50"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    setErrors({ ...errors, quantity: "" });
                                }}
                                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.quantity ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity}</p>}
                        </div>

                        {isStockIn ? (
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Invoice / Reference No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. INV-2026-031"
                                    value={reference}
                                    onChange={(e) => {
                                        setReference(e.target.value);
                                        setErrors({ ...errors, reference: "" });
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.reference ? "border-red-500" : "border-gray-200"}`}
                                />
                                {errors.reference && <p className="text-red-500 text-xs">{errors.reference}</p>}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Removal Reason <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={removalReason}
                                    onChange={(e) => {
                                        setRemovalReason(e.target.value);
                                        setErrors({ ...errors, removalReason: "" });
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.removalReason ? "border-red-500" : "border-gray-200"}`}
                                >
                                    <option value="">Select reason...</option>
                                    {removalReasonOptions.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                {errors.removalReason && <p className="text-red-500 text-xs">{errors.removalReason}</p>}
                            </div>
                        )}
                    </div>

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
                            onChange={(e) => {
                                setRemarks(e.target.value);
                                setErrors({ ...errors, remarks: "" });
                            }}
                            className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.remarks ? "border-red-500" : "border-gray-200"}`}
                        />
                        {errors.remarks && <p className="text-red-500 text-xs">{errors.remarks}</p>}
                    </div>

                    {/* Preview Banner */}
                    <div className={`flex items-center gap-2 ${previewBgColor} border ${previewBorderColor} rounded-xl px-4 py-3`}>
                        <CheckSquare className={`w-4 h-4 ${previewTextColor} shrink-0`} />
                        <p className={`text-sm ${previewTextColor}`}>
                            {previewLabelText}{" "}
                            <span className="font-bold">
                                {selectedItem ? `${selectedItem.currentStock} ${selectedItem.unit}` : "—"}
                            </span>
                            {" → After: "}
                            <span className="font-bold">
                                {selectedItem
                                    ? `${parsedQty > 0 ? afterStock : selectedItem.currentStock} ${selectedItem.unit}`
                                    : "—"}
                            </span>
                            {" "}
                            <span className="font-normal opacity-70">(preview)</span>
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
                        className={`flex items-center gap-2 ${confirmBtnBgColor} ${confirmBtnHoverColor} text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckSquare className="w-4 h-4" />
                                {confirmBtnText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
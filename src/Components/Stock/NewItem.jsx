import React, { useState, useEffect } from "react";
import { X, Package, Hash, Layers, Ruler, BarChart2, ToggleLeft, AlignLeft, Save } from "lucide-react";

const categoryOptions = ["STATIONERY", "LAB", "SPORTS", "UNIFORM"];
const unitOptions = ["PCS", "REAM", "BOX", "SET", "KG", "LTR"];

export default function NewItem({
    isOpen,
    onClose,
    initialData = null,
    onSave,
    saving = false,
}) {
    const [itemCode, setItemCode] = useState("");
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("STATIONERY");
    const [unit, setUnit] = useState("PCS");
    const [minStock, setMinStock] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({});

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            if (initialData) {
                setItemCode(initialData.code || "");
                setItemName(initialData.name || "");
                setCategory(initialData.category || "STATIONERY");
                setUnit(initialData.unit || "PCS");
                setMinStock(initialData.minLevel ?? "");
                setStatus(initialData.status?.toUpperCase() || "ACTIVE");
                setDescription(initialData.description || "");
            } else {
                handleReset();
            }
            setErrors({});
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen, initialData]);

    const handleReset = () => {
        setItemCode("");
        setItemName("");
        setCategory("STATIONERY");
        setUnit("PCS");
        setMinStock("");
        setStatus("ACTIVE");
        setDescription("");
        setErrors({});
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const validate = () => {
        const newErrors = {};
        if (!itemCode.trim()) newErrors.itemCode = "Item code is required";
        if (!itemName.trim()) newErrors.itemName = "Item name is required";
        if (!category) newErrors.category = "Category is required";
        if (!unit) newErrors.unit = "Unit is required";
        if (minStock === "" || minStock === null) newErrors.minStock = "Minimum stock level is required";
        if (parseInt(minStock) < 0) newErrors.minStock = "Minimum stock cannot be negative";
        if (!description.trim()) newErrors.description = "Description is required";
        return newErrors;
    };

    const handleSave = () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const payload = {
            itemCode: itemCode.trim(),
            itemName: itemName.trim(),
            category,
            unit,
            minimumStockLevel: parseInt(minStock),
            status,
            description: description.trim(),
        };
        if (onSave) onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-item-in">
                <style>{`
                    @keyframes itemModalIn {
                        from { opacity: 0; transform: scale(0.95) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-item-in { animation: itemModalIn 0.2s ease-out forwards; }
                `}</style>

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <span className="text-base">📦</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {isEditMode ? "Edit Item" : "New Item"}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Hash className="w-4 h-4 text-gray-400" />
                                Item Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. ITM-001"
                                value={itemCode}
                                onChange={(e) => { setItemCode(e.target.value); setErrors((p) => ({ ...p, itemCode: "" })); }}
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition ${errors.itemCode ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400"}`}
                            />
                            {errors.itemCode && <p className="text-xs text-red-500 mt-0.5">{errors.itemCode}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-gray-400" />
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. A4 Copy Paper"
                                value={itemName}
                                onChange={(e) => { setItemName(e.target.value); setErrors((p) => ({ ...p, itemName: "" })); }}
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition ${errors.itemName ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400"}`}
                            />
                            {errors.itemName && <p className="text-xs text-red-500 mt-0.5">{errors.itemName}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-gray-400" />
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={category}
                                onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: "" })); }}
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition ${errors.category ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400"}`}
                            >
                                {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-xs text-red-500 mt-0.5">{errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-gray-400" />
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={unit}
                                onChange={(e) => { setUnit(e.target.value); setErrors((p) => ({ ...p, unit: "" })); }}
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition ${errors.unit ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400"}`}
                            >
                                {unitOptions.map((u) => <option key={u}>{u}</option>)}
                            </select>
                            {errors.unit && <p className="text-xs text-red-500 mt-0.5">{errors.unit}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <BarChart2 className="w-4 h-4 text-gray-400" />
                                Minimum Stock Level <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 10"
                                value={minStock}
                                onChange={(e) => { setMinStock(e.target.value); setErrors((p) => ({ ...p, minStock: "" })); }}
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition ${errors.minStock ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400"}`}
                            />
                            {errors.minStock && <p className="text-xs text-red-500 mt-0.5">{errors.minStock}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Enter item description..."
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition resize-none ${errors.description ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400"}`}
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
                    </div>

                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleClose}
                        disabled={saving}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : isEditMode ? "Update Item" : "Save Item"}
                    </button>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect, useCallback } from "react";
import {
    X, Package, Hash, Layers, Ruler, BarChart2,
    ToggleLeft, AlignLeft, Save, Loader2, IndianRupee,
} from "lucide-react";
import { getListOfValues } from "../../Api/Lov/ListOfValues";

// ─── Fallback values ────────────────────────────────────────────────
const FALLBACK_CATEGORIES = ["Books", "Uniform", "Lab", "Stationery", "Sports", "Furniture", "Electronics", "Cleaning", "Other"];
const FALLBACK_UNITS       = ["PCS", "REAM", "BOX", "SET", "KG", "LTR"];

const base = "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition";
const ok   = "border-gray-200 focus:ring-blue-300 focus:border-blue-400";
const bad  = "border-red-400 focus:ring-red-200";
const cls  = (err) => `${base} ${err ? bad : ok}`;

export default function NewItem({
    isOpen,
    onClose,
    initialData = null,
    onSave,
    saving = false,
}) {
    const isEditMode = Boolean(initialData);

    // ── Form state ──
    const [itemCode,    setItemCode]    = useState("");
    const [itemName,    setItemName]    = useState("");
    const [category,    setCategory]    = useState("");
    const [unit,        setUnit]        = useState("");
    const [unitPrice,   setUnitPrice]   = useState("");   // ← NEW
    const [minStock,    setMinStock]    = useState("");
    const [status,      setStatus]      = useState("ACTIVE");
    const [description, setDescription] = useState("");
    const [errors,      setErrors]      = useState({});

    // ── Dropdown options ──
    const [categoryOptions, setCategoryOptions] = useState(
        FALLBACK_CATEGORIES.map((c) => ({ label: c, value: c.toUpperCase() }))
    );
    const [units,          setUnits]          = useState(FALLBACK_UNITS);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // ── Fetch categories from LOV API ──
    const loadOptions = useCallback(async () => {
        setLoadingOptions(true);
        try {
            const lovData = await getListOfValues("ITEM_CATEGORY");
            if (lovData && lovData.length > 0) {
                setCategoryOptions(lovData.map((item) => ({ label: item.label, value: item.value })));
            }
        } catch {
            // Keep fallback
        } finally {
            setLoadingOptions(false);
        }
    }, []);

    // ── Populate form on open ──
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }
        document.body.style.overflow = "hidden";
        setErrors({});

        if (initialData) {
            setItemCode(initialData.itemCode   || initialData.code  || "");
            setItemName(initialData.itemName   || initialData.name  || "");
            setCategory(initialData.category                         || "");
            setUnit(initialData.unit                                 || "");
            setUnitPrice(
                initialData.unitPrice !== undefined && initialData.unitPrice !== null
                    ? String(initialData.unitPrice)
                    : initialData.price !== undefined && initialData.price !== null
                        ? String(initialData.price)
                        : ""
            );
            setMinStock(
                initialData.minimumStockLevel !== undefined
                    ? String(initialData.minimumStockLevel)
                    : initialData.minLevel !== undefined
                        ? String(initialData.minLevel)
                        : ""
            );
            setStatus((initialData.status || "ACTIVE").toUpperCase());
            setDescription(initialData.description || "");
        } else {
            setItemCode(""); setItemName(""); setCategory(""); setUnit("");
            setUnitPrice(""); setMinStock(""); setStatus("ACTIVE"); setDescription("");
        }

        loadOptions();
        return () => { document.body.style.overflow = ""; };
    }, [isOpen, initialData, loadOptions]);

    // Auto-select first option in add mode
    useEffect(() => {
        if (!isEditMode && !category && categoryOptions.length > 0)
            setCategory(categoryOptions[0].value);
    }, [categoryOptions, isEditMode, category]);

    useEffect(() => {
        if (!isEditMode && !unit && units.length > 0) setUnit(units[0]);
    }, [units, isEditMode, unit]);

    if (!isOpen) return null;

    // ── Validate ──
    const validate = () => {
        const e = {};
        if (!itemCode.trim())           e.itemCode    = "Item code is required";
        if (!itemName.trim())           e.itemName    = "Item name is required";
        if (!category)                  e.category    = "Category is required";
        if (!unit)                      e.unit        = "Unit is required";
        if (unitPrice === "")           e.unitPrice   = "Unit price is required";
        if (Number(unitPrice) < 0)      e.unitPrice   = "Price cannot be negative";
        if (minStock === "")            e.minStock    = "Minimum stock level is required";
        if (parseInt(minStock) < 0)     e.minStock    = "Minimum stock cannot be negative";
        if (!description.trim())        e.description = "Description is required";
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        onSave?.({
            itemCode:          itemCode.trim(),
            itemName:          itemName.trim(),
            category,
            unit,
            unitPrice:         parseFloat(unitPrice),   // ← included in payload
            minimumStockLevel: parseInt(minStock),
            status,
            description:       description.trim(),
        });
    };

    const handleClose = () => { setErrors({}); onClose(); };

    // ── Shared select renderer ──
    const Select = ({ value, onChange, children, loading, errorKey }) => (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => { onChange(e.target.value); setErrors((p) => ({ ...p, [errorKey]: "" })); }}
                disabled={loading}
                className={`${cls(errors[errorKey])} appearance-none pr-8 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {loading && <option value="">Loading…</option>}
                {children}
            </select>
            {loading
                ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                : <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
            }
        </div>
    );

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

                {/* ── Header ── */}
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

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Item Code + Item Name */}
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
                                className={cls(errors.itemCode)}
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
                                className={cls(errors.itemName)}
                            />
                            {errors.itemName && <p className="text-xs text-red-500 mt-0.5">{errors.itemName}</p>}
                        </div>
                    </div>

                    {/* Category + Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-gray-400" />
                                Category <span className="text-red-500">*</span>
                            </label>
                            <Select value={category} onChange={setCategory} loading={loadingOptions} errorKey="category">
                                {categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>
                            {errors.category && <p className="text-xs text-red-500 mt-0.5">{errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-gray-400" />
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <Select value={unit} onChange={setUnit} loading={false} errorKey="unit">
                                {units.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </Select>
                            {errors.unit && <p className="text-xs text-red-500 mt-0.5">{errors.unit}</p>}
                        </div>
                    </div>

                    {/* Unit Price + Min Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* ── Unit Price (NEW) ── */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                Unit Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none font-medium">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={unitPrice}
                                    onChange={(e) => { setUnitPrice(e.target.value); setErrors((p) => ({ ...p, unitPrice: "" })); }}
                                    className={`${cls(errors.unitPrice)} pl-7`}
                                />
                            </div>
                            {errors.unitPrice && <p className="text-xs text-red-500 mt-0.5">{errors.unitPrice}</p>}
                        </div>

                        {/* Min Stock */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <BarChart2 className="w-4 h-4 text-gray-400" />
                                Min Stock Level <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 10"
                                value={minStock}
                                onChange={(e) => { setMinStock(e.target.value); setErrors((p) => ({ ...p, minStock: "" })); }}
                                className={cls(errors.minStock)}
                            />
                            {errors.minStock && <p className="text-xs text-red-500 mt-0.5">{errors.minStock}</p>}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                            Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`${cls(false)} appearance-none pr-8`}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Enter item description…"
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                            className={`${cls(errors.description)} resize-none`}
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
                    </div>

                </div>

                {/* ── Footer ── */}
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
                        {saving
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                            : <><Save className="w-4 h-4" /> {isEditMode ? "Update Item" : "Save Item"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect, useCallback } from "react";
import { X, Package, Hash, Layers, Ruler, BarChart2, ToggleLeft, AlignLeft, Save, Loader2 } from "lucide-react";
import { getItemsList } from "../../Api/StockApi";

// ─── Fallback values (shown while loading / if API fails) ─────────
const FALLBACK_CATEGORIES = ["BOOKS", "STATIONERY", "LAB", "SPORTS", "UNIFORM"];
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
    const [itemCode,   setItemCode]   = useState("");
    const [itemName,   setItemName]   = useState("");
    const [category,   setCategory]   = useState("");
    const [unit,       setUnit]       = useState("");
    const [minStock,   setMinStock]   = useState("");
    const [status,     setStatus]     = useState("ACTIVE");
    const [description, setDescription] = useState("");
    const [errors,     setErrors]     = useState({});

    // ── Dropdown options (fetched from API) ──
    const [categories,     setCategories]     = useState(FALLBACK_CATEGORIES);
    const [units,          setUnits]          = useState(FALLBACK_UNITS);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // ── Fetch all items once to derive unique categories + units ──
    const loadOptions = useCallback(async () => {
        setLoadingOptions(true);
        try {
            // Fetch enough items to cover all categories/units — size 200 is plenty
            const res = await getItemsList(0, 200, "", "", "");
            const items = res.items || [];

            const cats  = [...new Set(items.map((i) => i.category).filter(Boolean))].sort();
            const unitSet = [...new Set(items.map((i) => i.unit).filter(Boolean))].sort();

            if (cats.length  > 0) setCategories(cats);
            if (unitSet.length > 0) setUnits(unitSet);
        } catch {
            // Keep fallback values — UI still works
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
            // Edit mode — map from API field names
            setItemCode(initialData.itemCode   || initialData.code        || "");
            setItemName(initialData.itemName   || initialData.name        || "");
            setCategory(initialData.category                               || "");
            setUnit(initialData.unit                                       || "");
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
            setItemCode("");
            setItemName("");
            setCategory("");
            setUnit("");
            setMinStock("");
            setStatus("ACTIVE");
            setDescription("");
        }

        // Always (re)fetch options so dropdowns stay current
        loadOptions();

        return () => { document.body.style.overflow = ""; };
    }, [isOpen, initialData, loadOptions]);

    // Auto-select first category / unit once options load (add mode only)
    useEffect(() => {
        if (!isEditMode && !category && categories.length > 0) setCategory(categories[0]);
    }, [categories, isEditMode, category]);

    useEffect(() => {
        if (!isEditMode && !unit && units.length > 0) setUnit(units[0]);
    }, [units, isEditMode, unit]);

    if (!isOpen) return null;

    // ── Validate ──
    const validate = () => {
        const e = {};
        if (!itemCode.trim())    e.itemCode    = "Item code is required";
        if (!itemName.trim())    e.itemName    = "Item name is required";
        if (!category)           e.category    = "Category is required";
        if (!unit)               e.unit        = "Unit is required";
        if (minStock === "")     e.minStock    = "Minimum stock level is required";
        if (parseInt(minStock) < 0) e.minStock = "Minimum stock cannot be negative";
        if (!description.trim()) e.description = "Description is required";
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
            minimumStockLevel: parseInt(minStock),
            status,
            description:       description.trim(),
        });
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    // ── Shared select renderer ──
    const Select = ({ value, onChange, options, loading, errorKey }) => (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => { onChange(e.target.value); setErrors((p) => ({ ...p, [errorKey]: "" })); }}
                disabled={loading}
                className={`${cls(errors[errorKey])} appearance-none pr-8 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {loading && <option value="">Loading…</option>}
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
                            <Select
                                value={category}
                                onChange={setCategory}
                                options={categories}
                                loading={loadingOptions}
                                errorKey="category"
                            />
                            {errors.category && <p className="text-xs text-red-500 mt-0.5">{errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-gray-400" />
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={unit}
                                onChange={setUnit}
                                options={units}
                                loading={loadingOptions}
                                errorKey="unit"
                            />
                            {errors.unit && <p className="text-xs text-red-500 mt-0.5">{errors.unit}</p>}
                        </div>
                    </div>

                    {/* Min Stock + Status */}
                    <div className="grid grid-cols-2 gap-4">
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
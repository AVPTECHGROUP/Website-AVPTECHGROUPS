import React, { useState, useEffect } from "react";
import { X, Store, MapPin, AlignLeft, ToggleLeft, Save } from "lucide-react";

export default function NewStore({
    isOpen,
    onClose,
    initialData = null,
    onSave,
}) {
    const [storeName, setStoreName] = useState("");
    const [storeCode, setStoreCode] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            if (initialData) {
                setStoreName(initialData.storeName || "");
                setStoreCode(initialData.storeCode || "");
                setLocation(initialData.location || "");
                setDescription(initialData.description || "");
                setStatus(initialData.status?.toUpperCase() || "ACTIVE");
            } else {
                handleReset();
            }
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, initialData]);

    const handleReset = () => {
        setStoreName("");
        setStoreCode("");
        setLocation("");
        setDescription("");
        setStatus("ACTIVE");
        setIsSaving(false);
    };

    const handleClose = () => {
        if (isSaving) return; // saving ke waqt close mat hone do
        handleReset();
        onClose();
    };

    const handleSave = async () => {
        const payload = {
            storeName,
            storeCode,
            location,
            description,
            status,
        };
        if (onSave) {
            setIsSaving(true);
            try {
                await onSave(payload);
                handleReset();
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/20"
                onClick={handleClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-store-in">
                <style>{`
                    @keyframes storeModalIn {
                        from { opacity: 0; transform: scale(0.95) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-store-in { animation: storeModalIn 0.2s ease-out forwards; }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Store className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {isEditMode ? "Edit Store" : "New Store"}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                    className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
                >
                    {/* Store Name + Store Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Store className="w-4 h-4 text-gray-400" />
                                Store Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Main Store"
                                value={storeName}
                                required
                                disabled={isSaving}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Store className="w-4 h-4 text-gray-400" />
                                Store Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. STR-001"
                                value={storeCode}
                                required
                                disabled={isSaving}
                                onChange={(e) => setStoreCode(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Ground Floor, Admin Block"
                            value={location}
                            required
                            disabled={isSaving}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Description
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Optional description..."
                            value={description}
                            disabled={isSaving}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-5">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex items-center gap-2 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors
                                ${isSaving
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? "Update Store" : "Save Store"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
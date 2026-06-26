import React, { useState } from "react";
import { X, Calendar, Tag, Star } from "lucide-react";
import { createAcademicYear } from "../../../Api/AcademicYears/AcademicYear"; 

const NewAcademicYear = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        label: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.label.trim()) return setError("Label is required.");
        if (!form.startDate) return setError("Start date is required.");
        if (!form.endDate) return setError("End date is required.");
        if (form.startDate >= form.endDate)
            return setError("End date must be after start date.");

        try {
            setLoading(true);
            await createAcademicYear({
                label: form.label.trim(),
                startDate: form.startDate,
                endDate: form.endDate,
                isCurrent: form.isCurrent,
            });
            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err.message || "Failed to create academic year.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm({ label: "", startDate: "", endDate: "", isCurrent: false });
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Add Academic Year
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Fill in the details to create a new academic year
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Label */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Tag size={14} className="text-gray-400" />
                            Label
                        </label>
                        <input
                            type="text"
                            name="label"
                            value={form.label}
                            onChange={handleChange}
                            placeholder="e.g. 2027-28"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Date Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Current Year Toggle */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Star size={15} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    Set as Current Year
                                </p>
                                <p className="text-xs text-gray-500">
                                    This will replace the existing current year
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setForm((prev) => ({ ...prev, isCurrent: !prev.isCurrent }))
                            }
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${form.isCurrent ? "bg-blue-600" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.isCurrent ? "translate-x-5" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                "Create Year"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewAcademicYear;
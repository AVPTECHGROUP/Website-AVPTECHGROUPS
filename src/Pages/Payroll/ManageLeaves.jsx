import React, { useState } from "react";
import { toast } from "react-toastify";
import { Plus, CalendarCog, Pencil, Trash2, X, Save } from "lucide-react";

// ── UI-only mock data ───────────────────────────────────────────────────
// Swap this initial state for a `getAllLeavePolicyConfigs()` API call later.
const MOCK_POLICIES = [
    { id: 1, leaveType: "Medical Leave", allocatedDays: 12, halfDayAllowed: true, isPaid: true, lateFeePerOccurrence: 0, isActive: true },
    { id: 2, leaveType: "Casual Leave", allocatedDays: 8, halfDayAllowed: true, isPaid: true, lateFeePerOccurrence: 0, isActive: true },
    { id: 3, leaveType: "Unpaid Leave", allocatedDays: 0, halfDayAllowed: false, isPaid: false, lateFeePerOccurrence: 0, isActive: true },
    { id: 4, leaveType: "Late Arrival", allocatedDays: 0, halfDayAllowed: false, isPaid: false, lateFeePerOccurrence: 100, isActive: true },
];

const emptyForm = {
    leaveType: "",
    allocatedDays: "",
    halfDayAllowed: true,
    isPaid: true,
    lateFeePerOccurrence: "",
};

const LeaveConfigManager = ({ readOnly = false }) => {
    const [policies, setPolicies] = useState(MOCK_POLICIES);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const openCreateForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setErrors({});
        setShowForm(true);
    };

    const openEditForm = (policy) => {
        setForm({
            leaveType: policy.leaveType,
            allocatedDays: policy.allocatedDays,
            halfDayAllowed: policy.halfDayAllowed,
            isPaid: policy.isPaid,
            lateFeePerOccurrence: policy.lateFeePerOccurrence,
        });
        setEditingId(policy.id);
        setErrors({});
        setShowForm(true);
    };

    const validate = () => {
        const errs = {};
        if (!form.leaveType.trim()) errs.leaveType = "Enter a leave type name";
        if (form.allocatedDays === "" || Number(form.allocatedDays) < 0) errs.allocatedDays = "Enter valid allocated days";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        // TODO: replace with createLeavePolicyConfig(payload) / updateLeavePolicyConfig(id, payload)
        const payload = {
            leaveType: form.leaveType.trim(),
            allocatedDays: Number(form.allocatedDays) || 0,
            halfDayAllowed: form.halfDayAllowed,
            isPaid: form.isPaid,
            lateFeePerOccurrence: Number(form.lateFeePerOccurrence) || 0,
            isActive: true,
        };

        if (editingId) {
            setPolicies((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p)));
            toast.success("Leave policy updated");
        } else {
            setPolicies((prev) => [...prev, { id: Date.now(), ...payload }]);
            toast.success("Leave policy created");
        }
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleDisable = (id) => {
        // TODO: replace with deleteLeavePolicyConfig(id)
        setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    };

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                            <CalendarCog className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Policy Configuration</h2>
                            <p className="text-xs sm:text-sm text-gray-500">Applies school-wide across all teaching staff</p>
                        </div>
                    </div>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={openCreateForm}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" /> New Leave Type
                        </button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                                {editingId ? "Edit Leave Type" : "New Leave Type"}
                            </h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Leave Type Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.leaveType}
                                    onChange={(e) => setForm((prev) => ({ ...prev, leaveType: e.target.value }))}
                                    placeholder="e.g. Medical Leave"
                                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.leaveType ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.leaveType && <p className="text-red-500 text-xs mt-1">{errors.leaveType}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Days Allocated / Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.allocatedDays}
                                    onChange={(e) => setForm((prev) => ({ ...prev, allocatedDays: e.target.value }))}
                                    placeholder="0"
                                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.allocatedDays ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.allocatedDays && <p className="text-red-500 text-xs mt-1">{errors.allocatedDays}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Late Fee / Occurrence
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.lateFeePerOccurrence}
                                        onChange={(e) => setForm((prev) => ({ ...prev, lateFeePerOccurrence: e.target.value }))}
                                        placeholder="0"
                                        className="w-full pl-7 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Only used for lateness-linked types</p>
                            </div>

                            <div className="flex items-center gap-6 pt-5">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.halfDayAllowed}
                                        onChange={(e) => setForm((prev) => ({ ...prev, halfDayAllowed: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Half-day allowed
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isPaid}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isPaid: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Paid leave
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5">
                                <Save className="w-3.5 h-3.5" /> {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Policy table */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[640px] text-xs sm:text-sm">
                        <thead>
                        <tr className="text-left text-gray-500 uppercase text-[11px] tracking-wide border-b border-gray-200">
                            <th className="py-2.5 px-4 sm:px-2 font-medium">Leave Type</th>
                            <th className="py-2.5 px-4 sm:px-2 font-medium">Days / Year</th>
                            <th className="py-2.5 px-4 sm:px-2 font-medium">Half-day</th>
                            <th className="py-2.5 px-4 sm:px-2 font-medium">Paid</th>
                            <th className="py-2.5 px-4 sm:px-2 font-medium">Late Fee</th>
                            <th className="py-2.5 px-4 sm:px-2 font-medium">Status</th>
                            {!readOnly && <th className="py-2.5 px-4 sm:px-2 font-medium text-right">Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {policies.map((p) => (
                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 sm:px-2 font-medium text-gray-900">{p.leaveType}</td>
                                <td className="py-3 px-4 sm:px-2 text-gray-700">{p.allocatedDays}</td>
                                <td className="py-3 px-4 sm:px-2 text-gray-700">{p.halfDayAllowed ? "Yes" : "No"}</td>
                                <td className="py-3 px-4 sm:px-2 text-gray-700">{p.isPaid ? "Yes" : "No"}</td>
                                <td className="py-3 px-4 sm:px-2 text-gray-700">{p.lateFeePerOccurrence ? `₹${p.lateFeePerOccurrence}` : "—"}</td>
                                <td className="py-3 px-4 sm:px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        p.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                      {p.isActive ? "Active" : "Disabled"}
                    </span>
                                </td>
                                {!readOnly && (
                                    <td className="py-3 px-4 sm:px-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditForm(p)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDisable(p.id)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveConfigManager;
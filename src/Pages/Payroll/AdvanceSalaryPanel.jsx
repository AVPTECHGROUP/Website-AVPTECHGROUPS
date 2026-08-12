import React, { useState } from "react";
import { toast } from "react-toastify";
import { HandCoins, Plus, X, CheckCircle2, Clock } from "lucide-react";
import { getAdvanceSalaryByUser, createAdvanceSalary, settleAdvanceSalary } from "../../Api/Payroll/Payrollapi";

// Advance salary records are fetched from API when available

const emptyForm = { amount: "", reason: "", installments: "1" };

const AdvanceSalaryPanel = ({ teacher, readOnly = false }) => {
    const [advances, setAdvances] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            if (!teacher?.id) return;
            try {
                const data = await getAdvanceSalaryByUser(teacher.id);
                if (mounted) setAdvances(Array.isArray(data) ? data : data?.data || []);
            } catch (err) {
                console.error("Failed to load advances:", err.message || err);
            }
        })();
        return () => (mounted = false);
    }, [teacher?.id]);

    const validate = () => {
        const errs = {};
        if (!form.amount || Number(form.amount) <= 0) errs.amount = "Enter a valid amount";
        if (!form.reason.trim()) errs.reason = "Enter a reason";
        if (!form.installments || Number(form.installments) < 1) errs.installments = "At least 1 installment";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        (async () => {
            try {
                const payload = {
                    userId: teacher.id,
                    amount: Number(form.amount),
                    reason: form.reason.trim(),
                    installments: Number(form.installments),
                };
                const created = await createAdvanceSalary(payload);
                setAdvances((prev) => [created, ...prev]);
                toast.success("Advance salary recorded — deductions will apply from next payroll cycle");
                setForm(emptyForm);
                setShowForm(false);
            } catch (err) {
                console.error("Failed to create advance:", err.message || err);
                toast.error(err.message || "Failed to record advance");
            }
        })();
    };

    const handleSettle = async (id) => {
        try {
            const res = await settleAdvanceSalary(id);
            // optimistic update — backend should return updated record
            setAdvances((prev) => prev.map((a) => (a.id === id ? { ...a, status: "SETTLED", installmentsPaid: a.installments } : a)));
            toast.success("Advance marked as settled");
        } catch (err) {
            console.error("Failed to settle advance:", err.message || err);
            toast.error(err.message || "Failed to mark settled");
        }
    };

    const totalOutstanding = advances
        .filter((a) => a.status === "ACTIVE")
        .reduce((sum, a) => {
            const perInstallment = a.amount / a.installments;
            return sum + perInstallment * (a.installments - a.installmentsPaid);
        }, 0);

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Outstanding Balance</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{totalOutstanding.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Advances</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{advances.filter((a) => a.status === "ACTIVE").length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Taken (All Time)</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹{advances.reduce((s, a) => s + a.amount, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <HandCoins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Advance Salary Records</h2>
                    </div>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Record Advance
                        </button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">New Advance for {teacher?.name}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.amount}
                                        onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full pl-7 pr-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.amount ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                </div>
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Deduct Over (Installments) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.installments}
                                    onChange={(e) => setForm((prev) => ({ ...prev, installments: e.target.value }))}
                                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.installments ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.installments && <p className="text-red-500 text-xs mt-1">{errors.installments}</p>}
                            </div>

                            <div className="sm:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.reason}
                                    onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                                    placeholder="e.g. Medical emergency"
                                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.reason ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Deductions begin from the next payroll cycle onward, split evenly across the chosen number of installments.
                        </p>

                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Record Advance
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-2.5 sm:space-y-3">
                    {advances.length === 0 ? (
                        <p className="text-xs sm:text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                            No advance salary records
                        </p>
                    ) : (
                        advances.map((a) => {
                            const perInstallment = a.amount / a.installments;
                            const remaining = perInstallment * (a.installments - a.installmentsPaid);
                            return (
                                <div key={a.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex-wrap">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                        a.status === "ACTIVE" ? "bg-amber-100" : "bg-green-100"
                                    }`}>
                                        {a.status === "ACTIVE" ? (
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                        <p className="font-medium text-gray-900 text-xs sm:text-sm">₹{a.amount.toLocaleString()} — {a.reason}</p>
                                        <p className="text-[11px] sm:text-xs text-gray-500">
                                            Taken on {a.takenOn} · {a.installmentsPaid}/{a.installments} installments paid
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900">₹{remaining.toLocaleString()} left</p>
                                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                            a.status === "ACTIVE" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"
                                        }`}>
                      {a.status === "ACTIVE" ? "Active" : "Settled"}
                    </span>
                                    </div>
                                    {!readOnly && a.status === "ACTIVE" && (
                                        <button
                                            type="button"
                                            onClick={() => handleSettle(a.id)}
                                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shrink-0"
                                        >
                                            Mark Settled
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvanceSalaryPanel;
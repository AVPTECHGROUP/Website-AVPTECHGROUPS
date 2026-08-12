import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Plus,
    Wallet,
    Calendar,
    AlertTriangle,
    RotateCcw,
    IndianRupee,
    Save,
    Gift,
    Flag,
} from "lucide-react";
import { getSalaryConfigByUser, saveSalaryConfig, updateTeacherBaseSalary } from "../../Api/Payroll/Payrollapi";

const ErrorText = ({ msg }) =>
    msg ? (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {msg}
        </p>
    ) : null;

const ALLOWANCE_OPTIONS = [
    "houseRentAllowance",
    "travelAllowance",
    "dearnessAllowance",
    "specialAllowance",
    "otherAllowances",
    "providentFund",
];

const ALLOWANCE_LABELS = {
    houseRentAllowance: "House Rent Allowance",
    travelAllowance: "Travel Allowance",
    dearnessAllowance: "Dearness Allowance",
    specialAllowance: "Special Allowance",
    otherAllowances: "Other Allowances",
    providentFund: "Provident Fund",
};

const DEDUCTION_OPTIONS = [
    { label: "Professional Tax", key: "professionalTax" },
    { label: "Income Tax", key: "incomeTax" },
    { label: "Late Fee Deduction", key: "lateFeeDeduction" },
    { label: "Other Deductions", key: "otherDeductions" },
];

// Purely cosmetic mapping — no update wired up until the payroll-status API is ready.
// Falls back to "PENDING" if the field isn't present on the record yet.
const STATUS_META = {
    INCLUDED: { label: "Included", badge: "bg-green-50 text-green-700 border-green-300", dot: "bg-green-500" },
    EXCLUDED: { label: "Excluded", badge: "bg-red-50 text-red-700 border-red-300", dot: "bg-red-500" },
    PENDING: { label: "Pending", badge: "bg-yellow-50 text-yellow-700 border-yellow-300", dot: "bg-yellow-500" },
    ON_HOLD: { label: "On Hold", badge: "bg-gray-100 text-gray-700 border-gray-300", dot: "bg-gray-500" },
};

const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-medium ${meta.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

const emptyForm = {
    salaryType: "MONTHLY",
    baseSalary: "",
    bonus: "",
    leaveDeductionPerDay: "",
    houseRentAllowance: 0,
    travelAllowance: 0,
    dearnessAllowance: 0,
    specialAllowance: 0,
    otherAllowances: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0,
    lateFeeDeduction: 0,
    otherDeductions: 0,
};

const TeacherSalaryConfig = ({ teacher, readOnly = false }) => {
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quickBaseSalary, setQuickBaseSalary] = useState("");
    const [confirmBaseUpdate, setConfirmBaseUpdate] = useState(false);
    const [payrollStatus, setPayrollStatus] = useState("PENDING");

    const [allowances, setAllowances] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [leaveDeductionEnabled, setLeaveDeductionEnabled] = useState(true);
    const [showAddAllowanceForm, setShowAddAllowanceForm] = useState(false);
    const [showAddPenaltyForm, setShowAddPenaltyForm] = useState(false);
    const [newAllowance, setNewAllowance] = useState({ name: "", amount: "" });
    const [newPenalty, setNewPenalty] = useState({ name: "", amount: "" });

    const loadSalary = async () => {
        if (!teacher?.id) return;
        try {
            setLoading(true);
            const existing = await getSalaryConfigByUser(teacher.id);
            if (existing) {
                setFormData({ ...emptyForm, ...existing });
                setAllowances(
                    ALLOWANCE_OPTIONS.filter((k) => Number(existing[k]) > 0).map((k) => ({
                        id: k,
                        name: k,
                        amount: Number(existing[k]),
                    }))
                );
                setPenalties(
                    DEDUCTION_OPTIONS.filter((o) => Number(existing[o.key]) > 0).map((o) => ({
                        id: o.key,
                        key: o.key,
                        label: o.label,
                        amount: Number(existing[o.key]),
                    }))
                );
                setLeaveDeductionEnabled(!!existing.leaveDeductionPerDay);
                // Cosmetic only — reads whatever the backend already sends, defaults if absent
                setPayrollStatus(existing.payrollStatus || "PENDING");
            } else {
                setFormData(emptyForm);
                setAllowances([]);
                setPenalties([]);
                setPayrollStatus("PENDING");
            }
        } catch (err) {
            toast.error(err.message || "Failed to load salary configuration");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSalary();
        setQuickBaseSalary("");
        setConfirmBaseUpdate(false);
    }, [teacher?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calculateNet = () => {
        const base = parseFloat(formData.baseSalary) || 0;
        const bonus = parseFloat(formData.bonus) || 0;
        const allowanceTotal = allowances.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
        const penaltyTotal = penalties.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        return base + bonus + allowanceTotal - penaltyTotal;
    };

    const getAvailableAllowances = () => {
        const added = allowances.map((a) => a.name);
        return ALLOWANCE_OPTIONS.filter((o) => !added.includes(o));
    };

    const getAvailableDeductions = () => {
        const selected = penalties.map((p) => p.key);
        return DEDUCTION_OPTIONS.filter((o) => !selected.includes(o.key));
    };

    const blockNonPositiveKeys = (e) => {
        if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
    };

    const handleAddAllowance = (e) => {
        e.preventDefault();
        if (!newAllowance.name || !newAllowance.amount) return;
        const amount = Math.abs(parseFloat(newAllowance.amount)) || 0;
        if (amount <= 0) return;
        setAllowances((prev) => [...prev, { id: Date.now(), name: newAllowance.name, amount }]);
        setFormData((prev) => ({ ...prev, [newAllowance.name]: amount }));
        setNewAllowance({ name: "", amount: "" });
        setShowAddAllowanceForm(false);
    };

    const handleAddPenalty = (e) => {
        e.preventDefault();
        if (!newPenalty.name || !newPenalty.amount) return;
        const selected = DEDUCTION_OPTIONS.find((o) => o.key === newPenalty.name);
        if (!selected) return;
        const amount = Math.abs(parseFloat(newPenalty.amount));
        setPenalties((prev) => [...prev, { id: Date.now(), key: selected.key, label: selected.label, amount }]);
        setFormData((prev) => ({ ...prev, [selected.key]: amount }));
        setNewPenalty({ name: "", amount: "" });
        setShowAddPenaltyForm(false);
    };

    const handleDeleteAllowance = (id, name) => {
        setAllowances((prev) => prev.filter((a) => a.id !== id));
        setFormData((prev) => ({ ...prev, [name]: 0 }));
    };

    const handleDeletePenalty = (id, key) => {
        setPenalties((prev) => prev.filter((p) => p.id !== id));
        setFormData((prev) => ({ ...prev, [key]: 0 }));
    };

    const handleReset = () => {
        setAllowances([]);
        setPenalties([]);
        setFormData(emptyForm);
        setErrors({});
        setLeaveDeductionEnabled(true);
        setShowAddAllowanceForm(false);
        setShowAddPenaltyForm(false);
        setConfirmBaseUpdate(false);
        setQuickBaseSalary("");
    };

    const validate = () => {
        const errs = {};
        if (!formData.salaryType) errs.salaryType = "Select a salary type";
        if (!formData.baseSalary || Number(formData.baseSalary) <= 0) errs.baseSalary = "Enter a valid base salary";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await saveSalaryConfig(teacher.id, {
                ...formData,
                baseSalary: Number(formData.baseSalary) || 0,
                bonus: Number(formData.bonus) || 0,
                leaveDeductionPerDay: leaveDeductionEnabled ? Number(formData.leaveDeductionPerDay) || 0 : 0,
            });
            toast.success("Salary structure saved");
        } catch (err) {
            toast.error(err.message || "Failed to save salary structure");
        } finally {
            setSaving(false);
        }
    };

    /** Updates only the base salary, leaving allowances/deductions/bonus untouched.
     *  Gated behind the confirm checkbox so it can't be fired by accident. */
    const handleQuickSetBase = async () => {
        if (!confirmBaseUpdate) {
            toast.error("Please confirm the update before proceeding");
            return;
        }
        if (!quickBaseSalary || Number(quickBaseSalary) <= 0) {
            toast.error("Enter a valid base salary");
            return;
        }
        try {
            setSaving(true);
            await updateTeacherBaseSalary(teacher.id, quickBaseSalary);
            await loadSalary(); // pull the merged record back so the form reflects reality
            setQuickBaseSalary("");
            setConfirmBaseUpdate(false);
            toast.success(`Base salary updated to ₹${Number(quickBaseSalary).toLocaleString()}`);
        } catch (err) {
            toast.error(err.message || "Failed to update base salary");
        } finally {
            setSaving(false);
        }
    };

    const quickBaseSalaryValid = quickBaseSalary && Number(quickBaseSalary) > 0;
    const canSubmitQuickUpdate = quickBaseSalaryValid && confirmBaseUpdate && !saving;

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
                Loading salary configuration…
            </div>
        );
    }

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <fieldset disabled={readOnly} className={readOnly ? "opacity-90" : ""}>
                {/* Header row: title + payroll status badge (cosmetic only) */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Salary Structure</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-500">Payroll Status:</span>
                        <StatusBadge status={payrollStatus} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {/* ── Left Column ─────────────────────────────────────────────── */}
                    <div className="col-span-1 lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                        {/* Core Compensation */}
                        <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-5 md:p-6 ${errors.salaryType || errors.baseSalary ? "border-red-300" : "border-gray-200"}`}>
                            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Core Compensation</h2>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-wide uppercase">
                                        Salary Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {["MONTHLY", "PER_DAY"].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData((prev) => ({ ...prev, salaryType: type }))}
                                                className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors border-2 ${
                                                    formData.salaryType === type
                                                        ? "bg-blue-50 text-blue-700 border-blue-500"
                                                        : "bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100"
                                                }`}
                                            >
                                                {type === "MONTHLY" ? "Monthly" : "Per Day"}
                                            </button>
                                        ))}
                                    </div>
                                    <ErrorText msg={errors.salaryType} />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-wide uppercase">
                                        Base Salary Amount <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">₹</span>
                                        <input
                                            name="baseSalary"
                                            type="number"
                                            min="0"
                                            onKeyDown={blockNonPositiveKeys}
                                            value={formData.baseSalary}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            className={`w-full pl-7 sm:pl-8 pr-28 sm:pr-32 py-2.5 sm:py-3 border-2 rounded-lg text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 transition-colors ${
                                                errors.baseSalary ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
                                            }`}
                                        />
                                        <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                            {formData.salaryType === "PER_DAY" ? "INR / DAY" : "INR / MONTH"}
                                        </span>
                                    </div>
                                    <ErrorText msg={errors.baseSalary} />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-wide uppercase flex items-center gap-1.5">
                                        <Gift className="w-3.5 h-3.5 text-green-600" /> Bonus (optional)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                        <input
                                            name="bonus"
                                            type="number"
                                            min="0"
                                            onKeyDown={blockNonPositiveKeys}
                                            value={formData.bonus}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            className="w-full pl-7 sm:pl-8 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">One-time or recurring bonus added to net pay</p>
                                </div>
                            </div>
                        </div>

                        {/* Leave Deduction Rules */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Unpaid Leaves</h2>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                                    <input
                                        type="checkbox"
                                        checked={leaveDeductionEnabled}
                                        onChange={(e) => {
                                            setLeaveDeductionEnabled(e.target.checked);
                                            if (!e.target.checked) setFormData((prev) => ({ ...prev, leaveDeductionPerDay: "" }));
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 sm:w-12 p-0.5 px-1 shadow h-5 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-wide uppercase">
                                    Unpaid Leave (Total unpaid leaves)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Days</span>
                                    <input
                                        type="number"
                                        name="leaveDeductionPerDay"
                                        onKeyDown={blockNonPositiveKeys}
                                        value={formData.leaveDeductionPerDay}
                                        onChange={handleInputChange}
                                        disabled={!leaveDeductionEnabled}
                                        min="0"
                                        placeholder="0"
                                        className="w-full pl-7 sm:pl-8 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Rate applied per unpaid/absent day, calculated automatically from attendance during payroll
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ────────────────────────────────────────────── */}
                    <div className="col-span-1 space-y-4 sm:space-y-5 md:space-y-6">
                        {/* Allowances */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Allowances</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddAllowanceForm(!showAddAllowanceForm)}
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs sm:text-sm font-medium"
                                >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add New
                                </button>
                            </div>

                            <div className="space-y-2.5 sm:space-y-3">
                                {showAddAllowanceForm && (
                                    <div className="bg-white p-3 sm:p-4 rounded-md shadow-sm space-y-2.5 sm:space-y-3 border border-blue-200">
                                        {getAvailableAllowances().length > 0 ? (
                                            <>
                                                <select
                                                    value={newAllowance.name}
                                                    onChange={(e) => setNewAllowance((prev) => ({ ...prev, name: e.target.value }))}
                                                    className="w-full border-2 border-gray-300 px-2 py-2 text-xs sm:text-sm outline-none rounded-sm focus:border-blue-500"
                                                >
                                                    <option value="" disabled>Select allowance</option>
                                                    {getAvailableAllowances().map((o) => (
                                                        <option key={o} value={o}>{ALLOWANCE_LABELS[o]}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2 border-2 border-gray-300 px-2 py-1 rounded-sm">
                                                    <span className="text-gray-500 text-lg sm:text-xl">₹</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={newAllowance.amount}
                                                        onKeyDown={blockNonPositiveKeys}
                                                        onChange={(e) =>
                                                            setNewAllowance((prev) => ({ ...prev, amount: e.target.value.replace(/[-+eE]/g, "") }))
                                                        }
                                                        className="w-full text-xs sm:text-sm outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={handleAddAllowance} className="flex-1 bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-blue-600">Add</button>
                                                    <button type="button" onClick={() => setShowAddAllowanceForm(false)} className="flex-1 bg-gray-300 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-400">Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-xs sm:text-sm text-gray-500 py-3 sm:py-4">All allowances have been added</div>
                                        )}
                                    </div>
                                )}

                                {allowances.length === 0 && !showAddAllowanceForm && (
                                    <p className="text-xs sm:text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No allowances added yet</p>
                                )}

                                {allowances.map((allowance) => (
                                    <div key={allowance.id} className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center shrink-0">
                                            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{ALLOWANCE_LABELS[allowance.name]}</p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                            <span className="font-semibold text-gray-900 text-xs sm:text-sm">₹{allowance.amount.toLocaleString()}</span>
                                            <button type="button" onClick={() => handleDeleteAllowance(allowance.id, allowance.name)} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 text-xs">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Active Deductions</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddPenaltyForm(!showAddPenaltyForm)}
                                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs sm:text-sm font-medium"
                                >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add
                                </button>
                            </div>

                            <div className="space-y-2.5 sm:space-y-3">
                                {showAddPenaltyForm && (
                                    <div className="bg-white p-3 sm:p-4 rounded-md shadow-sm space-y-2.5 sm:space-y-3 border border-red-200">
                                        {getAvailableDeductions().length > 0 ? (
                                            <>
                                                <select
                                                    value={newPenalty.name}
                                                    onChange={(e) => setNewPenalty((prev) => ({ ...prev, name: e.target.value }))}
                                                    className="w-full border-2 border-gray-300 px-2 py-2 text-xs sm:text-sm outline-none rounded-sm focus:border-red-500"
                                                >
                                                    <option value="" disabled>Select deduction</option>
                                                    {getAvailableDeductions().map((o) => (
                                                        <option key={o.key} value={o.key}>{o.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2 border-2 border-gray-300 px-2 py-1 rounded-sm">
                                                    <span className="text-gray-500 text-lg sm:text-xl">₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        value={newPenalty.amount}
                                                        onKeyDown={blockNonPositiveKeys}
                                                        onChange={(e) => setNewPenalty((prev) => ({ ...prev, amount: e.target.value.replace(/[-+eE]/g, "") }))}
                                                        className="w-full text-xs sm:text-sm outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={handleAddPenalty} className="flex-1 bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-red-600">Add</button>
                                                    <button type="button" onClick={() => setShowAddPenaltyForm(false)} className="flex-1 bg-gray-300 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-400">Cancel</button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-xs sm:text-sm text-gray-500 py-3 sm:py-4">All deductions have been added</div>
                                        )}
                                    </div>
                                )}

                                {penalties.length === 0 && !showAddPenaltyForm && (
                                    <p className="text-xs sm:text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No deductions added yet</p>
                                )}

                                {penalties.map((penalty) => (
                                    <div key={penalty.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                                            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-xs sm:text-sm">{penalty.label}</div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                            <div className="font-semibold text-red-600 text-xs sm:text-sm">-₹{penalty.amount.toLocaleString()}</div>
                                            <button type="button" onClick={() => handleDeletePenalty(penalty.id, penalty.key)} className="text-red-400 hover:text-red-600 text-xs sm:text-sm">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Net Estimate */}
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-5 md:p-6">
                            <div className="text-xs sm:text-sm font-medium text-blue-700 mb-1.5 sm:mb-2 tracking-wide uppercase">Total Estimated Net</div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                ₹{calculateNet().toLocaleString()}
                                <span className="text-base sm:text-lg font-normal text-gray-600 ml-0.5">
                                    {formData.salaryType === "PER_DAY" ? "/day" : "/month"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">Base + bonus + allowances − fixed deductions. Leave rates apply during payroll processing.</p>
                        </div>
                    </div>
                </div>

                {!readOnly && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 flex items-start sm:items-center gap-3">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0 mt-0.5 sm:mt-0" />
                        <p className="text-xs sm:text-sm text-orange-800">
                            <strong>Attention:</strong> Changes apply to future payroll cycles only. Current processing cycles remain unaffected.
                        </p>
                    </div>
                )}

                {/* Quick Base Salary Update — confirm-gated, hits the real updateTeacherBaseSalary API */}
                {!readOnly && (
                    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4 sm:p-5 md:p-6 mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Base Salary Update</h2>
                                <p className="text-xs text-gray-500">Saves immediately — doesn't require "Save Structure" below</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                            <div className="w-full sm:w-56">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 tracking-wide uppercase">
                                    New Base Salary
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={blockNonPositiveKeys}
                                        value={quickBaseSalary}
                                        onChange={(e) => setQuickBaseSalary(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-7 pr-3 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 select-none sm:mb-2.5">
                                <input
                                    type="checkbox"
                                    checked={confirmBaseUpdate}
                                    onChange={(e) => setConfirmBaseUpdate(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                I confirm this base salary update
                            </label>

                            <button
                                type="button"
                                onClick={handleQuickSetBase}
                                disabled={!canSubmitQuickUpdate}
                                className="px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap sm:mb-0"
                            >
                                {saving ? "Updating…" : "Update Base Salary"}
                            </button>
                        </div>

                        {!confirmBaseUpdate && quickBaseSalaryValid && (
                            <p className="text-[11px] sm:text-xs text-gray-400 mt-2">Tick the confirmation box to enable the update button.</p>
                        )}
                    </div>
                )}

                {!readOnly && (
                    <div className="flex justify-end gap-3 mt-4 sm:mt-6">
                        <button type="button" onClick={handleReset} className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Structure"}
                        </button>
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default TeacherSalaryConfig;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
    HandCoins, Zap, Plus, X, CheckCircle2, Clock, Settings2,
    Calendar, AlertCircle, ChevronDown, ChevronRight, Trash2, Ban,
} from "lucide-react";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * NO BACKEND YET — this entire panel runs on localStorage.
 *
 * Two localStorage keys are used:
 *   - "payrollCycleConfig"                → one global config: which day of
 *     the month salary is paid on. Shared across all teachers since it's a
 *     school-wide payroll setting, not a per-teacher one.
 *   - `advanceLoanRecords_${teacherId}`   → this teacher's advance/loan
 *     records array.
 *
 * TODO (once backend exists): replace every `loadRecords`/`persistRecords`
 * call with real API calls (e.g. getAdvanceSalaryByUser / createAdvanceSalary
 * / settleAdvanceSalary from Payrollapi.js, extended to cover loans and the
 * payroll-cycle config), and replace `loadConfig`/`persistConfig` with a
 * school-settings API. The computation functions below (getPayrollDateFor
 * Month / computeAdvanceDeductionCycle / generateLoanSchedule) are pure and
 * don't touch storage — they can be reused as-is, or ported server-side so
 * the backend enforces the same cycle logic.
 * ─────────────────────────────────────────────────────────────────────────
 */

const CONFIG_KEY = "payrollCycleConfig";
const recordsKey = (teacherId) => `advanceLoanRecords_${teacherId}`;

const DEFAULT_CONFIG = { mode: "fixedDay", day: 30 }; // mode: 'fixedDay' | 'lastDay'

const loadConfig = () => {
    try {
        const raw = localStorage.getItem(CONFIG_KEY);
        return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch {
        return DEFAULT_CONFIG;
    }
};
const persistConfig = (cfg) => {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
};

const loadRecords = (teacherId) => {
    if (!teacherId) return [];
    try {
        const raw = localStorage.getItem(recordsKey(teacherId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};
const persistRecords = (teacherId, records) => {
    if (!teacherId) return;
    try { localStorage.setItem(recordsKey(teacherId), JSON.stringify(records)); } catch { /* ignore */ }
};

// ─── Date / payroll-cycle math ──────────────────────────────────────────────
const toISO = (d) => d.toISOString().slice(0, 10);
const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
};
const fmtMonthYear = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    } catch { return iso; }
};
const fmtMoney = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

const lastDayOfMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0);

// Returns the actual payroll date for a given (year, monthIndex) under the
// current config — clamped to the real number of days in that month (e.g. a
// "31" salary day config still resolves to Feb 28/29 in February).
const getPayrollDateForMonth = (year, monthIndex, config) => {
    if (config.mode === "lastDay") return lastDayOfMonth(year, monthIndex);
    const daysInMonth = lastDayOfMonth(year, monthIndex).getDate();
    const day = Math.min(Number(config.day) || 30, daysInMonth);
    return new Date(year, monthIndex, day);
};

// THE core rule requested: "advance taken on the 2nd, salary comes on the
// 30th → adjusted in that same month". If the request date falls on or
// before that month's payroll date, it's deducted from THIS cycle;
// otherwise (the salary date for this month has already passed) it rolls
// forward to next month's payroll.
const computeAdvanceDeductionCycle = (requestedOnISO, config) => {
    const requested = new Date(requestedOnISO);
    const thisCyclePayDate = getPayrollDateForMonth(requested.getFullYear(), requested.getMonth(), config);
    if (requested <= thisCyclePayDate) return thisCyclePayDate;
    return getPayrollDateForMonth(requested.getFullYear(), requested.getMonth() + 1, config);
};

// Next upcoming payroll date from "today" — used as the default starting
// cycle for a new loan's first installment.
const nextUpcomingPayrollDate = (config) => {
    const today = new Date();
    const thisCycle = getPayrollDateForMonth(today.getFullYear(), today.getMonth(), config);
    if (today <= thisCycle) return thisCycle;
    return getPayrollDateForMonth(today.getFullYear(), today.getMonth() + 1, config);
};

// Generates an N-installment schedule starting from `startISO`'s cycle,
// equal split with any rounding remainder absorbed into the LAST
// installment so the total always exactly equals `amount`.
const generateLoanSchedule = (amount, installments, startISO, config) => {
    const n = Math.max(1, Number(installments) || 1);
    const total = Number(amount) || 0;
    const base = Math.floor((total / n) * 100) / 100;
    const schedule = [];
    let running = 0;
    let cursor = new Date(startISO);
    for (let i = 0; i < n; i++) {
        const dueDate = getPayrollDateForMonth(cursor.getFullYear(), cursor.getMonth(), config);
        const isLast = i === n - 1;
        const amt = isLast ? Math.round((total - running) * 100) / 100 : base;
        running += amt;
        schedule.push({ index: i + 1, dueDate: toISO(dueDate), amount: amt, paid: false });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return schedule;
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyForm = {
    type: "ADVANCE",
    amount: "",
    reason: "",
    requestedOn: toISO(new Date()),
    installments: "3",
    startCycle: "", // resolved lazily from config when the form opens
};

// ─── Small local UI primitives (kept in-file, matching this component's
// existing plain-Tailwind style rather than introducing a shared library) ──
const Field = ({ label, required, error, children, hint }) => (
    <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const inputCls = (hasError) =>
    `w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
        hasError ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"
    }`;

const AdvanceSalaryPanel = ({ teacher, readOnly = false }) => {
    const [config, setConfig] = useState(loadConfig);
    const [showSettings, setShowSettings] = useState(false);
    const [draftConfig, setDraftConfig] = useState(config);

    const [records, setRecords] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [expandedLoanId, setExpandedLoanId] = useState(null);

    useEffect(() => {
        setRecords(loadRecords(teacher?.id));
    }, [teacher?.id]);

    const saveRecords = useCallback((next) => {
        setRecords(next);
        persistRecords(teacher?.id, next);
    }, [teacher?.id]);

    // ── Settings (payroll cycle config) ─────────────────────────────────────
    const openSettings = () => { setDraftConfig(config); setShowSettings(true); };
    const saveSettings = () => {
        const cleaned = draftConfig.mode === "fixedDay"
            ? { mode: "fixedDay", day: Math.min(31, Math.max(1, Number(draftConfig.day) || 30)) }
            : { mode: "lastDay" };
        setConfig(cleaned);
        persistConfig(cleaned);
        setShowSettings(false);
        toast.success("Payroll cycle settings updated");
    };

    // ── Form open/reset ──────────────────────────────────────────────────────
    const openForm = (type) => {
        setForm({ ...emptyForm, type, startCycle: toISO(nextUpcomingPayrollDate(config)) });
        setErrors({});
        setShowForm(true);
    };

    // ── Live previews ────────────────────────────────────────────────────────
    const advancePreviewDate = useMemo(() => {
        if (form.type !== "ADVANCE" || !form.requestedOn) return null;
        return computeAdvanceDeductionCycle(form.requestedOn, config);
    }, [form.type, form.requestedOn, config]);

    const loanPreviewSchedule = useMemo(() => {
        if (form.type !== "LOAN" || !form.amount || !form.installments || !form.startCycle) return [];
        return generateLoanSchedule(form.amount, form.installments, form.startCycle, config);
    }, [form.type, form.amount, form.installments, form.startCycle, config]);

    // ── Validation + submit ──────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!form.amount || Number(form.amount) <= 0) errs.amount = "Enter a valid amount";
        if (!form.reason.trim()) errs.reason = "Enter a reason";
        if (form.type === "ADVANCE" && !form.requestedOn) errs.requestedOn = "Select a date";
        if (form.type === "LOAN") {
            if (!form.installments || Number(form.installments) < 1) errs.installments = "At least 1 installment";
            if (!form.startCycle) errs.startCycle = "Select a starting payroll cycle";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (form.type === "ADVANCE") {
            const deductionCycle = computeAdvanceDeductionCycle(form.requestedOn, config);
            const record = {
                id: uid(),
                type: "ADVANCE",
                amount: Number(form.amount),
                reason: form.reason.trim(),
                requestedOn: form.requestedOn,
                deductionCycle: toISO(deductionCycle),
                status: "PENDING", // PENDING → SETTLED (deducted) | CANCELLED
            };
            saveRecords([record, ...records]);
            toast.success(`Advance recorded — will be deducted from the ${fmtMonthYear(record.deductionCycle)} payroll`);
        } else {
            const schedule = generateLoanSchedule(form.amount, form.installments, form.startCycle, config);
            const record = {
                id: uid(),
                type: "LOAN",
                amount: Number(form.amount),
                reason: form.reason.trim(),
                requestedOn: toISO(new Date()),
                installments: Number(form.installments),
                schedule,
                status: "ACTIVE", // ACTIVE → SETTLED | CANCELLED
            };
            saveRecords([record, ...records]);
            toast.success(`Loan recorded — split across ${schedule.length} installment${schedule.length > 1 ? "s" : ""} starting ${fmtMonthYear(schedule[0].dueDate)}`);
        }

        setShowForm(false);
        setForm(emptyForm);
    };

    // ── Record actions ───────────────────────────────────────────────────────
    const markAdvanceDeducted = (id) => {
        saveRecords(records.map((r) => (r.id === id ? { ...r, status: "SETTLED" } : r)));
        toast.success("Advance marked as deducted");
    };
    const cancelAdvance = (id) => {
        saveRecords(records.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r)));
    };
    const toggleInstallmentPaid = (recordId, index) => {
        saveRecords(records.map((r) => {
            if (r.id !== recordId) return r;
            const schedule = r.schedule.map((s) => (s.index === index ? { ...s, paid: !s.paid } : s));
            const allPaid = schedule.every((s) => s.paid);
            return { ...r, schedule, status: allPaid ? "SETTLED" : "ACTIVE" };
        }));
    };
    const settleLoanRemaining = (recordId) => {
        saveRecords(records.map((r) => {
            if (r.id !== recordId) return r;
            return { ...r, schedule: r.schedule.map((s) => ({ ...s, paid: true })), status: "SETTLED" };
        }));
        toast.success("Loan marked fully settled");
    };
    const cancelLoan = (id) => {
        saveRecords(records.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r)));
    };
    const deleteRecord = (id) => {
        saveRecords(records.filter((r) => r.id !== id));
    };

    // ── Summary figures ──────────────────────────────────────────────────────
    const activeAdvances = records.filter((r) => r.type === "ADVANCE" && r.status === "PENDING");
    const activeLoans = records.filter((r) => r.type === "LOAN" && r.status === "ACTIVE");
    const outstandingBalance =
        activeAdvances.reduce((s, r) => s + r.amount, 0) +
        activeLoans.reduce((s, r) => s + r.schedule.filter((i) => !i.paid).reduce((s2, i) => s2 + i.amount, 0), 0);
    const totalTaken = records
        .filter((r) => r.status !== "CANCELLED")
        .reduce((s, r) => s + r.amount, 0);

    const cycleLabel = config.mode === "lastDay"
        ? "Last day of every month"
        : `Day ${config.day} of every month`;

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Outstanding Balance</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{fmtMoney(outstandingBalance)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pending Advances</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeAdvances.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Loans</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeLoans.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Taken (All Time)</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{fmtMoney(totalTaken)}</p>
                </div>
            </div>

            {/* ── Main panel ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <HandCoins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Advance Salary & Loans</h2>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" /> Payroll cycle: {cycleLabel}
                            </p>
                        </div>
                    </div>
                    {!readOnly && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={openSettings}
                                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50"
                            >
                                <Settings2 className="w-4 h-4" /> Payroll Cycle
                            </button>
                            <button
                                type="button"
                                onClick={() => openForm("ADVANCE")}
                                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" /> New Request
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Payroll cycle settings ── */}
                {showSettings && !readOnly && (
                    <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Payroll Cycle Settings</h3>
                            <button type="button" onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            This decides which month's payroll an advance gets deducted from, and which cycle a loan's
                            first installment starts in.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer ${draftConfig.mode === "fixedDay" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
                                <input type="radio" name="cycleMode" checked={draftConfig.mode === "fixedDay"}
                                       onChange={() => setDraftConfig((p) => ({ ...p, mode: "fixedDay" }))} />
                                <span className="text-sm text-gray-800">Fixed day of month</span>
                            </label>
                            <label className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer ${draftConfig.mode === "lastDay" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
                                <input type="radio" name="cycleMode" checked={draftConfig.mode === "lastDay"}
                                       onChange={() => setDraftConfig((p) => ({ ...p, mode: "lastDay" }))} />
                                <span className="text-sm text-gray-800">Last day of month</span>
                            </label>
                        </div>
                        {draftConfig.mode === "fixedDay" && (
                            <div className="max-w-[160px]">
                                <Field label="Salary Day">
                                    <input type="number" min="1" max="31" value={draftConfig.day ?? 30}
                                           onChange={(e) => setDraftConfig((p) => ({ ...p, day: e.target.value }))}
                                           className={inputCls(false)} />
                                </Field>
                                <p className="text-[11px] text-gray-400 mt-1">Clamped automatically for shorter months (e.g. Feb).</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="button" onClick={saveSettings} className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Save Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* ── New request form ── */}
                {showForm && !readOnly && (
                    <form onSubmit={handleSubmit} className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">New Request for {teacher?.name}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Type selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setForm((p) => ({ ...p, type: "ADVANCE" }))}
                                    className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 text-left transition ${form.type === "ADVANCE" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Advance Salary</p>
                                    <p className="text-[11px] text-gray-500">One-off, deducted next payroll cycle</p>
                                </div>
                            </button>
                            <button type="button" onClick={() => setForm((p) => ({ ...p, type: "LOAN" }))}
                                    className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 text-left transition ${form.type === "LOAN" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                                <HandCoins className="w-4 h-4 text-indigo-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Loan</p>
                                    <p className="text-[11px] text-gray-500">Split across multiple installments</p>
                                </div>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Field label="Amount" required error={errors.amount}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                    <input type="number" min="0" value={form.amount}
                                           onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                                           placeholder="0" className={`${inputCls(!!errors.amount)} pl-7`} />
                                </div>
                            </Field>
                            <Field label="Reason" required error={errors.reason}>
                                <input type="text" value={form.reason}
                                       onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                                       placeholder="e.g. Medical emergency" className={inputCls(!!errors.reason)} />
                            </Field>
                        </div>

                        {form.type === "ADVANCE" ? (
                            <>
                                <Field label="Requested On" required error={errors.requestedOn}>
                                    <input type="date" value={form.requestedOn}
                                           onChange={(e) => setForm((p) => ({ ...p, requestedOn: e.target.value }))}
                                           className={`${inputCls(!!errors.requestedOn)} max-w-[220px]`} />
                                </Field>
                                {advancePreviewDate && (
                                    <div className="flex items-start gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2.5">
                                        <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-gray-700">
                                            Will be deducted from the <span className="font-semibold">{fmtMonthYear(toISO(advancePreviewDate))}</span> payroll
                                            (paid on <span className="font-semibold">{fmtDate(toISO(advancePreviewDate))}</span>).
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Field label="Number of Installments" required error={errors.installments}
                                           hint="School decides how many payroll cycles this is spread across.">
                                        <input type="number" min="1" value={form.installments}
                                               onChange={(e) => setForm((p) => ({ ...p, installments: e.target.value }))}
                                               className={inputCls(!!errors.installments)} />
                                    </Field>
                                    <Field label="Starting Payroll Cycle" required error={errors.startCycle}>
                                        <input type="date" value={form.startCycle}
                                               onChange={(e) => setForm((p) => ({ ...p, startCycle: e.target.value }))}
                                               className={inputCls(!!errors.startCycle)} />
                                    </Field>
                                </div>

                                {loanPreviewSchedule.length > 0 && (
                                    <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                                            Installment Preview
                                        </div>
                                        <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                            {loanPreviewSchedule.map((s) => (
                                                <div key={s.index} className="flex items-center justify-between px-3 py-2 text-xs">
                                                    <span className="text-gray-500">#{s.index} · {fmtMonthYear(s.dueDate)}</span>
                                                    <span className="font-semibold text-gray-800">{fmtMoney(s.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Record {form.type === "ADVANCE" ? "Advance" : "Loan"}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── Records list ── */}
                <div className="space-y-2.5 sm:space-y-3">
                    {records.length === 0 ? (
                        <p className="text-xs sm:text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                            No advance or loan records yet
                        </p>
                    ) : (
                        records.map((r) => {
                            if (r.type === "ADVANCE") {
                                const statusStyle = {
                                    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
                                    SETTLED: "bg-green-100 text-green-700 border-green-200",
                                    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
                                }[r.status];
                                return (
                                    <div key={r.id} className="p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                                        <div className="flex items-start gap-3 flex-wrap">
                                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${r.status === "PENDING" ? "bg-amber-100" : r.status === "SETTLED" ? "bg-green-100" : "bg-gray-100"}`}>
                                                {r.status === "PENDING" ? <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                                                    : r.status === "SETTLED" ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                                        : <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                                            </div>
                                            <div className="flex-1 min-w-[180px]">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">Advance</span>
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle}`}>
                                                        {r.status === "PENDING" ? "Pending Deduction" : r.status === "SETTLED" ? "Deducted" : "Cancelled"}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-gray-900 text-xs sm:text-sm mt-1">{fmtMoney(r.amount)} — {r.reason}</p>
                                                <p className="text-[11px] sm:text-xs text-gray-500">
                                                    Requested {fmtDate(r.requestedOn)} · Deducts from {fmtMonthYear(r.deductionCycle)} payroll ({fmtDate(r.deductionCycle)})
                                                </p>
                                            </div>
                                            {!readOnly && r.status === "PENDING" && (
                                                <div className="flex gap-1.5 shrink-0">
                                                    <button type="button" onClick={() => markAdvanceDeducted(r.id)}
                                                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                                        Mark Deducted
                                                    </button>
                                                    <button type="button" onClick={() => cancelAdvance(r.id)}
                                                            className="px-2.5 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            {!readOnly && r.status !== "PENDING" && (
                                                <button type="button" onClick={() => deleteRecord(r.id)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 shrink-0" title="Remove from list">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            // LOAN
                            const paidCount = r.schedule.filter((s) => s.paid).length;
                            const remaining = r.schedule.filter((s) => !s.paid).reduce((s, i) => s + i.amount, 0);
                            const expanded = expandedLoanId === r.id;
                            const statusStyle = {
                                ACTIVE: "bg-indigo-100 text-indigo-700 border-indigo-200",
                                SETTLED: "bg-green-100 text-green-700 border-green-200",
                                CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
                            }[r.status];
                            return (
                                <div key={r.id} className="rounded-lg border border-gray-200 hover:bg-gray-50/60">
                                    <div className="p-3 sm:p-4 flex items-start gap-3 flex-wrap">
                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${r.status === "ACTIVE" ? "bg-indigo-100" : r.status === "SETTLED" ? "bg-green-100" : "bg-gray-100"}`}>
                                            {r.status === "ACTIVE" ? <HandCoins className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                                : r.status === "SETTLED" ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                                    : <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-[180px]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">Loan</span>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle}`}>
                                                    {r.status === "ACTIVE" ? "Active" : r.status === "SETTLED" ? "Settled" : "Cancelled"}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 text-xs sm:text-sm mt-1">{fmtMoney(r.amount)} — {r.reason}</p>
                                            <p className="text-[11px] sm:text-xs text-gray-500">
                                                {paidCount}/{r.schedule.length} installments paid · {fmtMoney(remaining)} remaining
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {!readOnly && r.status === "ACTIVE" && (
                                                <>
                                                    <button type="button" onClick={() => settleLoanRemaining(r.id)}
                                                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                                        Settle Remaining
                                                    </button>
                                                    <button type="button" onClick={() => cancelLoan(r.id)}
                                                            className="px-2.5 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {!readOnly && r.status !== "ACTIVE" && (
                                                <button type="button" onClick={() => deleteRecord(r.id)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500" title="Remove from list">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button type="button" onClick={() => setExpandedLoanId(expanded ? null : r.id)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600">
                                                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {expanded && (
                                        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                    Installment Schedule
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                    {r.schedule.map((s) => (
                                                        <div key={s.index} className="flex items-center justify-between px-3 py-2 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                {!readOnly && r.status === "ACTIVE" ? (
                                                                    <input type="checkbox" checked={s.paid}
                                                                           onChange={() => toggleInstallmentPaid(r.id, s.index)}
                                                                           className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                                                                ) : (
                                                                    s.paid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Clock className="w-3.5 h-3.5 text-gray-300" />
                                                                )}
                                                                <span className={s.paid ? "text-gray-400 line-through" : "text-gray-600"}>
                                                                    #{s.index} · {fmtMonthYear(s.dueDate)}
                                                                </span>
                                                            </div>
                                                            <span className={`font-semibold ${s.paid ? "text-gray-400" : "text-gray-800"}`}>{fmtMoney(s.amount)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
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
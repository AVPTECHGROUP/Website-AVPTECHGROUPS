import React, { useState } from "react";
import { generatePayroll } from "./Payrollservice.jsx";
import { Notice, ErrorBanner, formatCurrency, MONTH_NAMES } from "./payrollUi";

const today = new Date();
const emptyOverride = () => ({ userId: "", userType: "TEACHER", presentDays: "", leaveDays: "" });

export default function PayrollGenerate() {
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [useOverrides, setUseOverrides] = useState(false);
    const [overrides, setOverrides] = useState([emptyOverride()]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null); // PayrollGenerationResultDto

    function updateOverride(idx, field, value) {
        setOverrides((prev) => prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
    }
    function addOverrideRow() {
        setOverrides((prev) => [...prev, emptyOverride()]);
    }
    function removeOverrideRow(idx) {
        setOverrides((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleGenerate() {
        setError("");
        setResult(null);
        const payload = { month, year };

        if (useOverrides) {
            const cleaned = overrides
                .filter((o) => o.userId !== "")
                .map((o) => ({
                    userId: Number(o.userId),
                    userType: o.userType,
                    presentDays: o.presentDays === "" ? undefined : Number(o.presentDays),
                    leaveDays: o.leaveDays === "" ? undefined : Number(o.leaveDays),
                }));
            if (cleaned.length > 0) payload.overrides = cleaned;
        }

        setBusy(true);
        try {
            const res = await generatePayroll(payload);
            setResult(res);
        } catch (e) {
            setError(e.message || "Failed to generate payroll");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Generate Payroll</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Creates payroll records for a month. Attendance and leave are auto-calculated server-side;
                    add an override row only for employees whose attendance/leave data is incomplete.
                </p>
            </div>

            <ErrorBanner message={error} onRetry={null} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="text-sm font-bold text-slate-900 mb-4">Payroll Period</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11.5px] font-semibold text-slate-600 mb-1 block">Month</label>
                                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                    {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11.5px] font-semibold text-slate-600 mb-1 block">Year</label>
                                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                    {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-bold text-slate-900">Per-employee overrides</div>
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <input type="checkbox" checked={useOverrides} onChange={(e) => setUseOverrides(e.target.checked)} />
                                Enable
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            Leave disabled to auto-calculate everyone from attendance & leave records. Present/leave days must not
                            exceed the month's total days, and each userId must belong to this school — the server validates both.
                        </p>
                        {useOverrides && (
                            <div className="flex flex-col gap-2">
                                {overrides.map((o, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <input
                                            type="number"
                                            placeholder="User ID"
                                            value={o.userId}
                                            onChange={(e) => updateOverride(idx, "userId", e.target.value)}
                                            className="col-span-3 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                        />
                                        <select
                                            value={o.userType}
                                            onChange={(e) => updateOverride(idx, "userType", e.target.value)}
                                            className="col-span-3 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                        >
                                            <option value="TEACHER">Teacher</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="ACCOUNTANT">Accountant</option>
                                            <option value="PRINCIPAL">Principal</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Present days"
                                            value={o.presentDays}
                                            onChange={(e) => updateOverride(idx, "presentDays", e.target.value)}
                                            className="col-span-2 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Leave days"
                                            value={o.leaveDays}
                                            onChange={(e) => updateOverride(idx, "leaveDays", e.target.value)}
                                            className="col-span-3 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                        />
                                        <button onClick={() => removeOverrideRow(idx)} className="col-span-1 text-red-500 text-xs font-bold">✕</button>
                                    </div>
                                ))}
                                <button onClick={addOverrideRow} className="text-xs font-semibold text-blue-700 self-start mt-1">
                                    + Add override row
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        disabled={busy}
                        onClick={handleGenerate}
                        className="bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                        {busy ? "Generating…" : `⚡ Generate Payroll for ${MONTH_NAMES[month - 1]} ${year}`}
                    </button>
                </div>

                <div>
                    {result ? (
                        <div className="flex flex-col gap-3">
                            {result.skippedCount > 0 && (
                                <Notice tone="warn">
                                    <strong>{result.skippedCount}</strong> employee{result.skippedCount === 1 ? "" : "s"} were skipped —
                                    see reasons below.
                                </Notice>
                            )}
                            <Notice tone="success">
                                Generated <strong>{result.generatedCount}</strong> payroll record{result.generatedCount === 1 ? "" : "s"} for{" "}
                                {MONTH_NAMES[month - 1]} {year}.
                            </Notice>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-slate-200 text-sm font-bold text-slate-900">Generated</div>
                                <table className="w-full text-sm">
                                    <tbody>
                                    {(result.generated ?? []).map((g) => (
                                        <tr key={g.payrollId ?? g.id} className="border-t border-slate-100">
                                            <td className="px-4 py-2.5 font-medium text-slate-700">{g.userName}</td>
                                            <td className="px-4 py-2.5 text-slate-500">{g.userType}</td>
                                            <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{formatCurrency(g.netSalary)}</td>
                                        </tr>
                                    ))}
                                    {(!result.generated || result.generated.length === 0) && (
                                        <tr><td className="px-4 py-4 text-center text-slate-400 text-sm">Nothing generated.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {(result.skipped ?? []).length > 0 && (
                                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b border-amber-200 text-sm font-bold text-amber-800">Skipped</div>
                                    <table className="w-full text-sm">
                                        <tbody>
                                        {result.skipped.map((s, i) => (
                                            <tr key={i} className="border-t border-amber-100">
                                                <td className="px-4 py-2.5 font-medium text-slate-700">{s.userName}</td>
                                                <td className="px-4 py-2.5 text-slate-500">{s.userType}</td>
                                                <td className="px-4 py-2.5 text-amber-700">{s.reason}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-sm text-slate-400">
                            Results will appear here after you generate payroll.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
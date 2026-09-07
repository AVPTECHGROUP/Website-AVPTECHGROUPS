import React, { useEffect, useState, useCallback } from "react";
import { getPayroll, getPayrollTotal } from "./Payrollservice.jsx";
import {
    StatCard,
    StatusBadge,
    RoleBadge,
    Notice,
    Spinner,
    ErrorBanner,
    formatCurrency,
    MONTH_NAMES,
    normalizeList,
} from "./Payrollui.jsx";

const today = new Date();

export default function PayrollDashboard({ onReviewDraft }) {
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [counts, setCounts] = useState({ total: 0, draft: 0, approved: 0, paid: 0 });
    const [totalPayout, setTotalPayout] = useState(0);
    const [recent, setRecent] = useState([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [allRes, draftRes, approvedRes, paidRes, totalRes, recentRes] = await Promise.all([
                getPayroll(month, year, "", "", 0, 1),
                getPayroll(month, year, "DRAFT", "", 0, 1),
                getPayroll(month, year, "APPROVED", "", 0, 1),
                getPayroll(month, year, "PAID", "", 0, 1),
                getPayrollTotal(month, year),
                getPayroll(month, year, "", "", 0, 5),
            ]);

            const all = normalizeList(allRes);
            const draft = normalizeList(draftRes);
            const approved = normalizeList(approvedRes);
            const paid = normalizeList(paidRes);
            const recentList = normalizeList(recentRes);

            setCounts({ total: all.total, draft: draft.total, approved: approved.total, paid: paid.total });
            setTotalPayout(totalRes?.total ?? totalRes?.amount ?? (typeof totalRes === "number" ? totalRes : 0));
            setRecent(recentList.items);
        } catch (e) {
            setError(e.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payroll Dashboard</h1>
                    <p className="text-xs text-slate-500 mt-1">Status overview and recent activity</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                        {MONTH_NAMES.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                        {[year - 1, year, year + 1].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        onClick={load}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                        ⟳ Refresh
                    </button>
                </div>
            </div>

            <ErrorBanner message={error} onRetry={load} />

            {loading ? (
                <Spinner label="Loading dashboard…" />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
                        <StatCard icon="📋" label="Total Records" value={counts.total} tone="blue" sub={`${MONTH_NAMES[month - 1]} ${year}`} />
                        <StatCard icon="💸" label="Total Payout" value={formatCurrency(totalPayout)} tone="green" sub="Net payable this month" />
                        <StatCard icon="⏳" label="Pending Approval" value={counts.draft} tone="yellow" sub="DRAFT records" />
                        <StatCard icon="✅" label="Approved" value={counts.approved} tone="blue" sub="Awaiting payment" />
                    </div>

                    {counts.draft > 0 && (
                        <Notice
                            tone="warn"
                            action={
                                <button
                                    onClick={onReviewDraft}
                                    className="bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
                                >
                                    Review Now →
                                </button>
                            }
                        >
                            <strong>{counts.draft} payroll record{counts.draft === 1 ? "" : "s"}</strong> are in DRAFT status and
                            awaiting approval for {MONTH_NAMES[month - 1]} {year}.
                        </Notice>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Latest payroll records for {MONTH_NAMES[month - 1]} {year}</p>
                            </div>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="text-left px-4 py-2.5 font-bold">Employee</th>
                                <th className="text-left px-4 py-2.5 font-bold">Role</th>
                                <th className="text-left px-4 py-2.5 font-bold">Net Salary</th>
                                <th className="text-left px-4 py-2.5 font-bold">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recent.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-slate-400 text-sm py-10">
                                        No payroll records for this period yet.
                                    </td>
                                </tr>
                            ) : (
                                recent.map((r) => (
                                    <tr key={r.payrollId ?? r.id} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{r.userName}</td>
                                        <td className="px-4 py-3"><RoleBadge role={r.userType} /></td>
                                        <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(r.netSalary)}</td>
                                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    getPayroll,
    approvePayrolls,
    approvePayrollsBulk,
    markPayrollAsPaid,
    deletePayroll,
} from "./Payrollservice.jsx";
import {
    RoleBadge,
    StatusBadge,
    Pagination,
    Spinner,
    ErrorBanner,
    formatCurrency,
    MONTH_NAMES,
    normalizeList,
} from "./payrollUi";

const today = new Date();
const PAGE_SIZE = 10;

export default function PayrollRecords({ onViewSlip }) {
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [status, setStatus] = useState("");
    const [userType, setUserType] = useState("");
    const [search, setSearch] = useState(""); // client-side only — not a documented query param
    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState(() => new Set());
    const [payAllRemarks, setPayAllRemarks] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getPayroll(month, year, status, userType, page, PAGE_SIZE);
            // TEMP GUARD (see normalizeList in payrollUi.jsx): normalizes whatever
            // shape Payrollservice.jsx's getPayroll() actually returns — remove
            // this indirection once that shape is confirmed and read the field
            // directly instead.
            const { items: normalizedItems, total: normalizedTotal, totalPages: normalizedTotalPages } = normalizeList(res);
            setItems(normalizedItems);
            setTotal(normalizedTotal);
            setTotalPages(normalizedTotalPages);
            setSelected(new Set());
        } catch (e) {
            setError(e.message || "Failed to load payroll records");
        } finally {
            setLoading(false);
        }
    }, [month, year, status, userType, page]);

    useEffect(() => {
        load();
    }, [load]);

    const visible = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        if (!search.trim()) return safeItems;
        const q = search.trim().toLowerCase();
        return safeItems.filter(
            (r) =>
                r.userName?.toLowerCase().includes(q) ||
                r.employeeCode?.toLowerCase().includes(q)
        );
    }, [items, search]);

    const draftSelected = [...selected].filter((id) => {
        const row = items.find((r) => (r.payrollId ?? r.id) === id);
        return row?.status === "DRAFT";
    });
    const approvedSelected = [...selected].filter((id) => {
        const row = items.find((r) => (r.payrollId ?? r.id) === id);
        return row?.status === "APPROVED";
    });

    function toggleAll(checked) {
        setSelected(checked ? new Set(items.map((r) => r.payrollId ?? r.id)) : new Set());
    }
    function toggleRow(id, checked) {
        setSelected((prev) => {
            const next = new Set(prev);
            checked ? next.add(id) : next.delete(id);
            return next;
        });
    }

    async function handleApproveOne(id) {
        setBusy(true);
        setError("");
        try {
            await approvePayrolls([id]);
            await load();
        } catch (e) {
            setError(e.message || "Failed to approve");
        } finally {
            setBusy(false);
        }
    }

    async function handleApproveSelected() {
        if (draftSelected.length === 0) return;
        setBusy(true);
        setError("");
        try {
            await approvePayrolls(draftSelected);
            await load();
        } catch (e) {
            setError(e.message || "Failed to approve selected");
        } finally {
            setBusy(false);
        }
    }

    async function handleApproveAllDraft() {
        if (!window.confirm(`Approve all DRAFT payroll records for ${MONTH_NAMES[month - 1]} ${year}?`)) return;
        setBusy(true);
        setError("");
        try {
            await approvePayrollsBulk(month, year);
            await load();
        } catch (e) {
            setError(e.message || "Failed to bulk approve");
        } finally {
            setBusy(false);
        }
    }

    async function handleMarkPaidSelected() {
        if (approvedSelected.length === 0) return;
        setBusy(true);
        setError("");
        try {
            await markPayrollAsPaid(approvedSelected, payAllRemarks);
            setPayAllRemarks("");
            await load();
        } catch (e) {
            setError(e.message || "Failed to mark as paid");
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this DRAFT payroll record? This cannot be undone.")) return;
        setBusy(true);
        setError("");
        try {
            await deletePayroll(id);
            await load();
        } catch (e) {
            setError(e.message || "Failed to delete");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payroll Records</h1>
                    <p className="text-xs text-slate-500 mt-1">View, approve, and mark payroll as paid</p>
                </div>
                <div className="flex gap-2">
                    {draftSelected.length > 0 && (
                        <button
                            disabled={busy}
                            onClick={handleApproveSelected}
                            className="border border-blue-600 text-blue-700 text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                        >
                            ✅ Approve Selected ({draftSelected.length})
                        </button>
                    )}
                    {approvedSelected.length > 0 && (
                        <button
                            disabled={busy}
                            onClick={handleMarkPaidSelected}
                            className="border border-slate-300 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        >
                            💳 Mark Selected Paid ({approvedSelected.length})
                        </button>
                    )}
                    <button
                        disabled={busy}
                        onClick={handleApproveAllDraft}
                        className="bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                        ✅ Approve All DRAFT
                    </button>
                </div>
            </div>

            <ErrorBanner message={error} onRetry={load} />

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <select value={month} onChange={(e) => { setPage(0); setMonth(Number(e.target.value)); }} className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                    {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => { setPage(0); setYear(Number(e.target.value)); }} className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                    {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={userType} onChange={(e) => { setPage(0); setUserType(e.target.value); }} className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                    <option value="">All Roles</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="PRINCIPAL">Principal</option>
                </select>
                <select value={status} onChange={(e) => { setPage(0); setStatus(e.target.value); }} className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                    <option value="">All Status</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PAID">PAID</option>
                </select>
                <input
                    type="text"
                    placeholder="Search by name / code… (this page only)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium w-64"
                />
            </div>

            {loading ? (
                <Spinner label="Loading records…" />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">{MONTH_NAMES[month - 1]} {year}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{total} record{total === 1 ? "" : "s"}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-2.5"><input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} checked={items.length > 0 && selected.size === items.length} /></th>
                                <th className="text-left px-4 py-2.5 font-bold">Employee</th>
                                <th className="text-left px-4 py-2.5 font-bold">Role</th>
                                <th className="text-left px-4 py-2.5 font-bold">Present / Total</th>
                                <th className="text-left px-4 py-2.5 font-bold">Leave Days</th>
                                <th className="text-left px-4 py-2.5 font-bold">Base Salary</th>
                                <th className="text-left px-4 py-2.5 font-bold">Deductions</th>
                                <th className="text-left px-4 py-2.5 font-bold">Net Salary</th>
                                <th className="text-left px-4 py-2.5 font-bold">Status</th>
                                <th className="text-left px-4 py-2.5 font-bold">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visible.length === 0 ? (
                                <tr><td colSpan={10} className="text-center text-slate-400 text-sm py-10">No records match these filters.</td></tr>
                            ) : (
                                visible.map((r) => {
                                    const id = r.payrollId ?? r.id;
                                    return (
                                        <tr key={id} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-3"><input type="checkbox" checked={selected.has(id)} onChange={(e) => toggleRow(id, e.target.checked)} /></td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-800">{r.userName}</div>
                                                <div className="text-[11px] text-slate-400">{r.employeeCode}</div>
                                            </td>
                                            <td className="px-4 py-3"><RoleBadge role={r.userType} /></td>
                                            <td className="px-4 py-3 text-slate-600">{r.presentDays ?? "—"} / {r.totalDays ?? "—"}</td>
                                            <td className="px-4 py-3 text-slate-600">{r.leaveDays ?? 0}</td>
                                            <td className="px-4 py-3 text-slate-600">{formatCurrency(r.baseSalary)}</td>
                                            <td className="px-4 py-3 text-red-600 font-medium">-{formatCurrency(r.totalDeductions)}</td>
                                            <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(r.netSalary)}</td>
                                            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    {r.status === "DRAFT" && (
                                                        <>
                                                            <button disabled={busy} onClick={() => handleApproveOne(id)} className="text-xs font-semibold text-blue-700 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50 disabled:opacity-50">Approve</button>
                                                            <button disabled={busy} onClick={() => handleDelete(id)} className="text-xs font-semibold text-red-600 border border-red-300 rounded px-2 py-1 hover:bg-red-50 disabled:opacity-50">Delete</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => onViewSlip?.(r)} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded px-2 py-1 hover:bg-slate-50">Slip</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            )}
        </div>
    );
}
import React, { useEffect, useMemo, useState } from "react";
import { generatePayroll, getPayroll } from "./Payrollservice.jsx";
import { Notice, ErrorBanner, formatCurrency, MONTH_NAMES } from "./Payrollui.jsx";
import { getUsersSummary } from "../../Api/StaffManagement/UserManagementAPI.js"; // TODO: point this at wherever getUsersSummary actually lives in your tree
import { getCurrUserDetails} from "../../utils/getCurrUserDetails/index.js";


const today = new Date();

const ROLE_BADGE = {
    TEACHER: { label: "Teacher", className: "bg-blue-50 text-blue-700" },
    ADMIN: { label: "Admin", className: "bg-purple-50 text-purple-700" },
    ACCOUNTANT: { label: "Accountant", className: "bg-amber-50 text-amber-800" },
    PRINCIPAL: { label: "Principal", className: "bg-emerald-50 text-emerald-700" },
};

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function RoleBadge({ role }) {
    const cfg = ROLE_BADGE[role] || { label: role || "—", className: "bg-slate-100 text-slate-600" };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
    );
}

function Row({ label, value, highlight }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-500">{label}</span>
            <span className={`font-semibold ${highlight ? "text-slate-900" : "text-slate-700"}`}>{value}</span>
        </div>
    );
}

export default function PayrollGenerate() {
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [scope, setScope] = useState("all"); // "all" | "custom"

    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [empError, setEmpError] = useState("");

    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [overrideRows, setOverrideRows] = useState({}); // userId -> { presentDays, leaveDays }

    const [alreadyGenerated, setAlreadyGenerated] = useState(null);
    const [statsError, setStatsError] = useState("");

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const generatedBy = useMemo(() => {
        const decoded = getCurrUserDetails();
        return (
            decoded?.name ||
            [decoded?.firstName, decoded?.lastName].filter(Boolean).join(" ") ||
            decoded?.username ||
            decoded?.email ||
            "—"
        );
    }, []);

    // Employee roster — powers the override table and the "eligible staff" count.
    useEffect(() => {
        let cancelled = false;
        setEmpLoading(true);
        setEmpError("");
        getUsersSummary({ size: 500, sort: "firstName,asc" })
            .then((res) => {
                if (cancelled) return;
                const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.content ?? [];
                setEmployees(list);
            })
            .catch((e) => !cancelled && setEmpError(e.message || "Failed to load employees"))
            .finally(() => !cancelled && setEmpLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    // How many payroll records already exist for this month/year.
    useEffect(() => {
        let cancelled = false;
        setStatsError("");
        setAlreadyGenerated(null);
        getPayroll(month, year, "", "", 0, 1)
            .then((res) => {
                if (cancelled) return;
                const total = res?.totalElements ?? res?.data?.totalElements ?? res?.page?.totalElements ?? null;
                setAlreadyGenerated(typeof total === "number" ? total : null);
            })
            .catch((e) => !cancelled && setStatsError(e.message || "Failed to load payroll status"));
        return () => {
            cancelled = true;
        };
    }, [month, year]);

    const eligibleCount = employees.length;
    const willGenerate = alreadyGenerated == null ? null : Math.max(eligibleCount - alreadyGenerated, 0);
    const monthDayCount = daysInMonth(month, year);

    function toggleSelected(id) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function selectAll(checked) {
        setSelectedIds(checked ? new Set(employees.map((e) => e.id ?? e.userId)) : new Set());
    }

    function updateOverride(userId, field, value) {
        setOverrideRows((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: value },
        }));
    }

    function buildOverridesPayload() {
        const rows = scope === "custom" ? employees.filter((e) => selectedIds.has(e.id ?? e.userId)) : employees;
        return rows
            .map((emp) => {
                const id = emp.id ?? emp.userId;
                const row = overrideRows[id];
                const hasPresent = row?.presentDays !== undefined && row?.presentDays !== "";
                const hasLeave = row?.leaveDays !== undefined && row?.leaveDays !== "";
                if (!hasPresent && !hasLeave) return null;
                return {
                    userId: Number(id),
                    userType: emp.role || emp.userType,
                    presentDays: hasPresent ? Number(row.presentDays) : undefined,
                    leaveDays: hasLeave ? Number(row.leaveDays) : undefined,
                };
            })
            .filter(Boolean);
    }

    async function handleGenerate() {
        setError("");
        setResult(null);
        const payload = { month, year };
        const overrides = buildOverridesPayload();
        if (overrides.length > 0) payload.overrides = overrides;

        setBusy(true);
        try {
            const res = await generatePayroll(payload);
            setResult(res);
            getPayroll(month, year, "", "", 0, 1)
                .then((r) => setAlreadyGenerated(r?.totalElements ?? r?.data?.totalElements ?? r?.page?.totalElements ?? null))
                .catch(() => {});
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
                    Creates payroll records for a month. Attendance and leave are auto-calculated server-side; add an
                    override row only for employees whose attendance/leave data is incomplete.
                </p>
            </div>

            <ErrorBanner message={error} onRetry={null} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <div className="flex flex-col gap-4">
                    {/* Payroll Period */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="text-sm font-bold text-slate-900 mb-4">Payroll Period</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11.5px] font-semibold text-slate-600 mb-1 block">Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    {MONTH_NAMES.map((m, i) => (
                                        <option key={m} value={i + 1}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11.5px] font-semibold text-slate-600 mb-1 block">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    {[year - 1, year, year + 1].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-[11.5px] font-semibold text-slate-600 mb-1 block">Generated By</label>
                            <input
                                value={generatedBy}
                                readOnly
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="text-sm font-bold text-slate-900 mb-1">Scope</div>
                        <p className="text-xs text-slate-500 mb-3">Choose who to generate payroll for</p>
                        <div className="inline-flex rounded-lg border border-slate-200 p-1 mb-3">
                            <button
                                onClick={() => setScope("all")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                                    scope === "all" ? "bg-slate-900 text-white" : "text-slate-600"
                                }`}
                            >
                                All Eligible Staff
                            </button>
                            <button
                                onClick={() => setScope("custom")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                                    scope === "custom" ? "bg-slate-900 text-white" : "text-slate-600"
                                }`}
                            >
                                Selected Employees
                            </button>
                        </div>
                        {scope === "all" ? (
                            <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5">
                                Payroll will be generated for <strong>{eligibleCount}</strong> eligible staff across all roles.
                                Staff with no salary structure or payroll status EXCLUDED will be skipped by the server.
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500">
                                Use the checkboxes in the Employee Override table to pick who to submit override values for.
                                <div className="text-slate-400 mt-1">
                                    Note: /v1/payroll/generate always processes every eligible employee for the school — this
                                    selection only controls which rows get override values sent, it isn't a server-side filter.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="text-sm font-bold text-slate-900 mb-3">
                            Preview — {MONTH_NAMES[month - 1]} {year}
                        </div>
                        <div className="flex flex-col gap-2 text-xs">
                            <Row label="Days in month" value={monthDayCount} />
                            <Row label="Eligible Staff" value={empLoading ? "…" : eligibleCount} />
                            <Row label="Already Generated" value={alreadyGenerated == null ? (statsError ? "—" : "…") : alreadyGenerated} />
                            <Row label="Will Generate (est.)" value={willGenerate == null ? "—" : willGenerate} highlight />
                        </div>
                        {empError && <div className="text-[11px] text-red-600 mt-2">{empError}</div>}
                        {statsError && <div className="text-[11px] text-red-600 mt-1">{statsError}</div>}
                        <button
                            disabled={busy}
                            onClick={handleGenerate}
                            className="mt-4 w-full bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >
                            {busy ? "Generating…" : `⚡ Generate Payroll for ${MONTH_NAMES[month - 1]} ${year}`}
                        </button>
                    </div>
                </div>

                {/* Employee Override table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <div className="text-sm font-bold text-slate-900">Employee Override</div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Leave blank to auto-calculate. Enter values to override attendance / leave days.
                        </p>
                    </div>
                    <div className="mx-4 mt-3 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                        ℹ️ Overrides are useful when attendance or leave records are incomplete. Net salary will be recalculated
                        using your values.
                    </div>
                    <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                {scope === "custom" && (
                                    <th className="px-4 py-2.5 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => selectAll(e.target.checked)}
                                            checked={selectedIds.size > 0 && selectedIds.size === employees.length}
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-2.5 text-left">Employee</th>
                                <th className="px-4 py-2.5 text-left">Role</th>
                                <th className="px-4 py-2.5 text-left">Override Present</th>
                                <th className="px-4 py-2.5 text-left">Override Leave</th>
                            </tr>
                            </thead>
                            <tbody>
                            {empLoading && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">
                                        Loading employees…
                                    </td>
                                </tr>
                            )}
                            {!empLoading && employees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                            {!empLoading &&
                                employees.map((emp) => {
                                    const id = emp.id ?? emp.userId;
                                    const row = overrideRows[id] || {};
                                    const name =
                                        emp.fullName || [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.name || `User ${id}`;
                                    const code = emp.employeeCode || emp.empCode || `#${id}`;
                                    const role = emp.role || emp.userType;
                                    return (
                                        <tr key={id} className="border-t border-slate-100">
                                            {scope === "custom" && (
                                                <td className="px-4 py-2.5">
                                                    <input type="checkbox" checked={selectedIds.has(id)} onChange={() => toggleSelected(id)} />
                                                </td>
                                            )}
                                            <td className="px-4 py-2.5">
                                                <div className="font-semibold text-slate-700 text-[12.5px]">{name}</div>
                                                <div className="text-[10.5px] text-slate-400">{code}</div>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <RoleBadge role={role} />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={monthDayCount}
                                                    placeholder="Auto"
                                                    value={row.presentDays ?? ""}
                                                    onChange={(e) => updateOverride(id, "presentDays", e.target.value)}
                                                    className="w-20 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={monthDayCount}
                                                    placeholder="Auto"
                                                    value={row.leaveDays ?? ""}
                                                    onChange={(e) => updateOverride(id, "leaveDays", e.target.value)}
                                                    className="w-20 border border-slate-200 rounded px-2 py-1.5 text-xs"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {result && (
                <div className="mt-5 flex flex-col gap-3">
                    {result.skippedCount > 0 && (
                        <Notice tone="warn">
                            <strong>{result.skippedCount}</strong> employee{result.skippedCount === 1 ? "" : "s"} were skipped — see
                            reasons below.
                        </Notice>
                    )}
                    <Notice tone="success">
                        Generated <strong>{result.generatedCount}</strong> payroll record{result.generatedCount === 1 ? "" : "s"}{" "}
                        for {MONTH_NAMES[month - 1]} {year}.
                    </Notice>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-200 text-sm font-bold text-slate-900">Generated</div>
                        <table className="w-full text-sm">
                            <tbody>
                            {(result.generated ?? []).map((g) => (
                                <tr key={g.payrollId ?? g.id} className="border-t border-slate-100">
                                    <td className="px-4 py-2.5 font-medium text-slate-700">{g.userName}</td>
                                    <td className="px-4 py-2.5 text-slate-500">{g.userType}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                                        {formatCurrency(g.netSalary)}
                                    </td>
                                </tr>
                            ))}
                            {(!result.generated || result.generated.length === 0) && (
                                <tr>
                                    <td className="px-4 py-4 text-center text-slate-400 text-sm">Nothing generated.</td>
                                </tr>
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
            )}
        </div>
    );
}
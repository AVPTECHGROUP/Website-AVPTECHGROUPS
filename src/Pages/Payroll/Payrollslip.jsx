import React, { useEffect, useState, useCallback } from "react";
import { getPayrollSlip, getPayrollUserHistory } from "./Payrollservice.jsx";
import { Spinner, ErrorBanner, formatCurrency, MONTH_NAMES } from "./payrollUi";

const today = new Date();

/**
 * initialTarget (optional): { userId, userType, month, year } — pass this
 * when navigating here from a Records row ("Slip" button) to preload it.
 */
export default function PayrollSlip({ initialTarget }) {
  const [userId, setUserId] = useState(initialTarget?.userId ?? "");
  const [userType, setUserType] = useState(initialTarget?.userType ?? "TEACHER");
  const [month, setMonth] = useState(initialTarget?.month ?? today.getMonth() + 1);
  const [year, setYear] = useState(initialTarget?.year ?? today.getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slip, setSlip] = useState(null);

  const [history, setHistory] = useState([]);

  const loadSlip = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getPayrollSlip(userId, userType, month, year);
      setSlip(res);
    } catch (e) {
      setError(e.message || "Failed to load salary slip");
      setSlip(null);
    } finally {
      setLoading(false);
    }
  }, [userId, userType, month, year]);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getPayrollUserHistory(userId, userType, 0, 12);
      setHistory(res.items);
    } catch {
      setHistory([]);
    }
  }, [userId, userType]);

  useEffect(() => {
    if (initialTarget?.userId) {
      loadSlip();
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Salary Slip</h1>
        <p className="text-xs text-slate-500 mt-1">Look up an employee's itemized salary slip for any month.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap items-end gap-3">
        <Field label="User ID">
          <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-28" />
        </Field>
        <Field label="User Type">
          <select value={userType} onChange={(e) => setUserType(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="PRINCIPAL">Principal</option>
          </select>
        </Field>
        <Field label="Month">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </Field>
        <Field label="Year">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <button
          onClick={() => { loadSlip(); loadHistory(); }}
          disabled={!userId}
          className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
        >
          Load Slip
        </button>
        {history.length > 0 && (
          <Field label="Or pick from history">
            <select
              onChange={(e) => {
                const h = history[Number(e.target.value)];
                if (h) { setMonth(h.month); setYear(h.year); }
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {history.map((h, i) => (
                <option key={i} value={i}>{MONTH_NAMES[h.month - 1]} {h.year}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <ErrorBanner message={error} onRetry={loadSlip} />

      {loading && <Spinner label="Loading slip…" />}

      {!loading && slip && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-0">
            <div className="bg-slate-900 text-white px-7 py-6 flex justify-between items-start">
              <div>
                <div className="text-lg font-extrabold tracking-tight">{slip.schoolName ?? "School"}</div>
                <div className="text-xs opacity-70 mt-1">Salary Slip</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold opacity-90">{slip.monthLabel ?? `${MONTH_NAMES[month - 1]} ${year}`}</div>
                <div className="text-xs opacity-65 mt-0.5">Payroll ID: {slip.payrollId}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200">
              <MetaItem label="Employee" value={slip.userName} />
              <MetaItem label="Designation" value={slip.designation ?? slip.userType} />
              <MetaItem label="Employee Code" value={slip.employeeCode} />
            </div>
            <div className="grid grid-cols-4 border-b border-slate-200">
              <MetaItem label="Total Days" value={slip.totalDays} />
              <MetaItem label="Present" value={slip.presentDays} />
              <MetaItem label="Absent" value={slip.absentDays} />
              <MetaItem label="Leave" value={slip.leaveDays} />
            </div>

            <div className="grid grid-cols-2">
              <SlipColumn
                title="Earnings"
                rows={[
                  ["Base Salary", slip.baseSalary],
                  ["House Rent Allowance", slip.houseRentAllowance],
                  ["Travel Allowance", slip.travelAllowance],
                  ["Dearness Allowance", slip.dearnessAllowance],
                  ["Special Allowance", slip.specialAllowance],
                  ["Other Allowances", slip.otherAllowances],
                ]}
                totalLabel="Gross Earnings"
                totalValue={slip.grossEarnings}
                tone="green"
              />
              <SlipColumn
                title="Deductions"
                rows={[
                  ["Provident Fund", slip.providentFund],
                  ["Professional Tax", slip.professionalTax],
                  ["Income Tax", slip.incomeTax],
                  ["Leave Deduction", slip.leaveDeduction],
                  ["Other Deductions", slip.otherDeductions],
                ]}
                totalLabel="Total Deductions"
                totalValue={slip.totalDeductions}
                tone="red"
              />
            </div>

            <div className="bg-slate-900 text-white px-7 py-4 flex justify-between items-center">
              <span className="text-xs opacity-80">Net Salary ({slip.status})</span>
              <span className="text-2xl font-extrabold tracking-tight">{formatCurrency(slip.netSalary)}</span>
            </div>

            {slip.remarks && (
              <div className="px-7 py-3 text-xs text-slate-500 border-t border-slate-200">Remarks: {slip.remarks}</div>
            )}
          </div>

          <div className="flex justify-end mt-3 print:hidden">
            <button onClick={() => window.print()} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2 hover:bg-slate-50">
              🖨 Print / Save as PDF
            </button>
          </div>
        </div>
      )}

      {!loading && !slip && !error && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-sm text-slate-400">
          Enter an employee and period, then Load Slip.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="px-5 py-3 border-r border-slate-200 last:border-r-0">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-900 mt-0.5">{value ?? "—"}</div>
    </div>
  );
}

function SlipColumn({ title, rows, totalLabel, totalValue, tone }) {
  const toneClass = tone === "green" ? "text-emerald-700" : "text-red-600";
  return (
    <div className="p-5 border-r border-slate-200 last:border-r-0">
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 pb-2.5 border-b border-slate-200 mb-3">{title}</div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between py-1 text-[12.5px]">
          <span className="text-slate-600">{label}</span>
          <span className="font-semibold text-slate-800">{formatCurrency(value)}</span>
        </div>
      ))}
      <div className={`flex justify-between pt-2.5 mt-2 border-t-2 border-slate-200 font-extrabold text-[13px] ${toneClass}`}>
        <span>{totalLabel}</span>
        <span>{formatCurrency(totalValue)}</span>
      </div>
    </div>
  );
}
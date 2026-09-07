import React, { useEffect, useMemo, useState } from "react";
import { getPayrollSlip, getPayrollUserHistory } from "./Payrollservice.jsx";
import { ErrorBanner, formatCurrency, MONTH_NAMES } from "./Payrollui.jsx";
import { getUsersSummary } from "../../Api/StaffManagement/UserManagementAPI.js";
import { getTeacherLookup } from "../../Api/Teachers/TeachersAPI.js";
import { getDefaultPrintTemplate } from "../../Api/PrintTemplate/PrintTemplatesApi.js";
import {
  cacheDefaultTemplate,
  getCachedDefaultTemplate,
} from "../../utils/TemplateStorage/templateCache";
import { renderPrintTemplate } from "../../utils/renderPrintTemplate";
import { mapSlipToTemplateData } from "./salarySlipTemplateAdapter";

const TEMPLATE_TYPE = "SALARY_SLIP";
const today = new Date();

const STATUS_STYLE = {
  DRAFT: "bg-slate-100 text-slate-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  EXCLUDED: "bg-red-100 text-red-700",
};

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function EarnRow({ label, value }) {
  return (
      <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 text-[13px]">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-emerald-700">{value == null ? "—" : formatCurrency(value)}</span>
      </div>
  );
}

function DeductRow({ label, value }) {
  return (
      <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 text-[13px]">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-red-600">{value == null ? "—" : formatCurrency(value)}</span>
      </div>
  );
}

function Stat({ label, value, color }) {
  return (
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
        <div className={`text-xl font-extrabold mt-0.5 ${color}`}>{value}</div>
      </div>
  );
}

// The built-in layout used when no default SALARY_SLIP template exists yet.
function DefaultSlipLayout({ slip, month, year }) {
  return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between">
          <div>
            {/* TODO: wire real school name/address here — not part of SalarySlipResponseDto. */}
            <div className="text-base font-bold">School ID: {slip.schoolId}</div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-extrabold tracking-wide">SALARY SLIP</h3>
            <p className="text-xs opacity-80">
              {slip.monthLabel || `${MONTH_NAMES[(slip.month || month) - 1]} ${slip.year || year}`}
            </p>
            <div className="mt-2 inline-block bg-white/15 rounded-md px-3 py-1 text-[11px]">
              Status:{" "}
              <strong className={`px-1.5 py-0.5 rounded ${STATUS_STYLE[slip.status] || "bg-white/20"}`}>
                {slip.status}
              </strong>
              {slip.paidAt && <> · {fmtDate(slip.paidAt)}</>}
            </div>
          </div>
        </div>

        {/* Employee meta */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-slate-100">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Employee Name</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{slip.userName}</div>
          </div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Employee Code</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{slip.employeeCode}</div>
          </div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Designation</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{slip.designation || "—"}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-slate-100">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Department</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{slip.department || "—"}</div>
          </div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Employee Type</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{slip.userType}</div>
          </div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Total Days</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {slip.totalDays} days ({slip.monthLabel || `${MONTH_NAMES[(slip.month || month) - 1]} ${slip.year || year}`})
            </div>
          </div>
        </div>

        {/* Attendance summary */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-8 items-center">
          <Stat label="Days Present" value={slip.presentDays} color="text-emerald-600" />
          <Stat label="Leave Days" value={slip.leaveDays} color="text-amber-600" />
          <Stat label="Absent Days" value={slip.absentDays} color="text-red-600" />
          {(slip.approvedBy || slip.approvedAt) && (
              <div className="ml-auto text-xs text-slate-500 flex items-center gap-2">
                {slip.approvedBy && (
                    <span>
                Approved by: <strong className="text-slate-700">{slip.approvedBy}</strong>
              </span>
                )}
                {slip.approvedAt && (
                    <>
                      <span>·</span>
                      <span>{fmtDate(slip.approvedAt)}</span>
                    </>
                )}
              </div>
          )}
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Earnings</div>
            <EarnRow label="Basic Salary" value={slip.baseSalary} />
            <EarnRow label="House Rent Allowance" value={slip.houseRentAllowance} />
            <EarnRow label="Travel Allowance" value={slip.travelAllowance} />
            <EarnRow label="Dearness Allowance" value={slip.dearnessAllowance} />
            <EarnRow label="Special Allowance" value={slip.specialAllowance} />
            <EarnRow label="Other Allowances" value={slip.otherAllowances} />
            <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-slate-200 text-sm font-bold">
              <span className="text-slate-800">Gross Earnings</span>
              <span className="text-emerald-700">{formatCurrency(slip.grossEarnings)}</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Deductions</div>
            <DeductRow label="Provident Fund" value={slip.providentFund} />
            <DeductRow label="Professional Tax" value={slip.professionalTax} />
            <DeductRow label="Income Tax (TDS)" value={slip.incomeTax} />
            <DeductRow label="Other Deductions" value={slip.otherDeductions} />
            <DeductRow
                label={`Leave Deduction${slip.leaveDays ? ` (${slip.leaveDays} day${slip.leaveDays === 1 ? "" : "s"})` : ""}`}
                value={slip.leaveDeduction}
            />
            <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-slate-200 text-sm font-bold">
              <span className="text-slate-800">Total Deductions</span>
              <span className="text-red-600">{formatCurrency(slip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Net */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Net Salary (Take Home)</div>
            <div className="text-[11px] opacity-60 mt-0.5">
              Gross {formatCurrency(slip.grossEarnings)} − Deductions {formatCurrency(slip.totalDeductions)}
            </div>
          </div>
          <div className="text-2xl font-extrabold">{formatCurrency(slip.netSalary)}</div>
        </div>

        {slip.remarks && (
            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-600">
              <strong className="text-slate-700">Remarks:</strong> {slip.remarks}
            </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Generated by {slip.generatedBy || "—"} · Ref #PAY-{slip.year}-{String(slip.month).padStart(2, "0")}-
          {slip.employeeCode}
        </span>
          <span>This is a computer-generated slip and does not require a signature.</span>
        </div>
      </div>
  );
}

export default function PayrollSlip({ schoolInfo }) {
  // schoolInfo (optional): { name, address, phone, email, logoUrl, initials }
  // TODO: wire this from your UserContext (same source FeeReceiptPrint.jsx
  // already pulls the school name from) — SalarySlipResponseDto has no
  // branding fields of its own, only schoolId.
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [employeePage, setEmployeePage] = useState(1);

  const [userId, setUserId] = useState("");
  const [userType, setUserType] = useState("");
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [history, setHistory] = useState([]);

  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default SALARY_SLIP template: show the cached one instantly, refresh from
  // the API in the background, and re-cache whatever the server currently
  // considers default. Falls back to null (built-in layout) on any failure.
  const [template, setTemplate] = useState(() => getCachedDefaultTemplate(TEMPLATE_TYPE));

  useEffect(() => {
    getDefaultPrintTemplate(TEMPLATE_TYPE)
        .then((tpl) => {
          if (tpl) {
            setTemplate(tpl);
            cacheDefaultTemplate(TEMPLATE_TYPE, tpl);
          }
        })
        .catch(() => {
          // Keep whatever was cached (if anything) — no default template set,
          // or the fetch failed. Either way the built-in layout still works.
        });
  }, []);

  // Employee picker
  useEffect(() => {
    let cancelled = false;
    setEmpLoading(true);
    setEmpError("");

    const normalizeEmployee = (item, fallbackRole = "") => {
      const id = item?.id ?? item?.userId ?? item?.teacherId ?? item?.employeeId;
      const name =
        item?.fullName ||
        item?.name ||
        [item?.firstName, item?.lastName].filter(Boolean).join(" ") ||
        item?.userName ||
        "Unknown User";
      const role =
        item?.userType ||
        item?.role ||
        item?.roles?.[0] ||
        item?.userRole ||
        fallbackRole ||
        "";
      const employeeCode =
        item?.employeeCode ||
        item?.empCode ||
        item?.staffCode ||
        item?.code ||
        item?.employeeId ||
        "";

      return {
        id: id != null ? String(id) : "",
        userId: id != null ? String(id) : "",
        name,
        fullName: name,
        userType: role,
        role,
        employeeCode,
      };
    };

    Promise.all([
      getUsersSummary({ size: 500, sort: "firstName,asc" }).catch(() => ({ data: [] })),
      getTeacherLookup().catch(() => []),
    ])
        .then(([userRes, teacherList]) => {
          if (cancelled) return;

          const userList = Array.isArray(userRes?.data)
            ? userRes.data
            : Array.isArray(userRes)
              ? userRes
              : Array.isArray(userRes?.content)
                ? userRes.content
                : [];

          const teacherRows = Array.isArray(teacherList) ? teacherList : [];
          const allowedRoles = new Set(["TEACHER", "PRINCIPAL", "ADMIN", "ACCOUNTANT", "SUPER_ADMIN", "GLOBAL_ADMIN"]);

          const merged = [...userList, ...teacherRows]
            .map((item) => normalizeEmployee(item, item?.role || item?.userType || ""))
            .filter((employee) => {
              const role = (employee.userType || employee.role || "").toUpperCase();
              return employee.id && (role === "" || allowedRoles.has(role) || role.includes("TEACHER") || role.includes("ADMIN") || role.includes("PRINCIPAL") || role.includes("ACCOUNTANT"));
            });

          const deduped = Array.from(new Map(merged.map((emp) => [emp.id, emp])).values());
          deduped.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

          setEmployees(deduped);
          if (deduped.length > 0) {
            const first = deduped[0];
            setUserId(first.id);
            setUserType(first.userType || first.role || "");
          }
        })
        .catch((e) => !cancelled && setEmpError(e.message || "Failed to load employees"))
        .finally(() => !cancelled && setEmpLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    if (roleFilter === "ALL") return employees;
    return employees.filter((emp) => (emp.userType || emp.role || "").toUpperCase() === roleFilter);
  }, [employees, roleFilter]);

  const totalEmployeePages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const safeEmployeePage = Math.min(employeePage, totalEmployeePages);
  const paginatedEmployees = filteredEmployees.slice(
    (safeEmployeePage - 1) * rowsPerPage,
    safeEmployeePage * rowsPerPage
  );

  useEffect(() => {
    setEmployeePage(1);
  }, [roleFilter, rowsPerPage]);

  useEffect(() => {
    if (!paginatedEmployees.some((emp) => String(emp.id ?? emp.userId) === String(userId))) {
      const nextEmployee = paginatedEmployees[0] || employees[0];
      if (nextEmployee) {
        setUserId(String(nextEmployee.id ?? nextEmployee.userId));
        setUserType(nextEmployee.userType || nextEmployee.role || "");
      }
    }
  }, [paginatedEmployees, employees, userId]);

  // Recent payslip history for the selected employee (month-picker helper)
  useEffect(() => {
    if (!userId || !userType) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    getPayrollUserHistory(userId, userType, 0, 12, "")
        .then((res) => {
          if (cancelled) return;
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.content ?? [];
          setHistory(list);
        })
        .catch(() => !cancelled && setHistory([]));
    return () => {
      cancelled = true;
    };
  }, [userId, userType]);

  function handleEmployeeChange(id) {
    setUserId(id);
    const emp = employees.find((e) => String(e.id ?? e.userId) === String(id));
    setUserType(emp?.role || emp?.userType || "");
  }

  async function handleLoad() {
    if (!userId || !userType) return;
    setError("");
    setLoading(true);
    try {
      const res = await getPayrollSlip(userId, userType, month, year);
      const data = res?.data || res;
      setSlip(data);
    } catch (e) {
      setSlip(null);
      setError(e.message || "Failed to load salary slip");
    } finally {
      setLoading(false);
    }
  }

  function handleMonthInput(value) {
    const [y, m] = value.split("-").map(Number);
    if (y) setYear(y);
    if (m) setMonth(m);
  }

  function handlePrint() {
    window.print();
  }

  const monthInputValue = useMemo(() => `${year}-${String(month).padStart(2, "0")}`, [year, month]);

  const renderedTemplateHtml = useMemo(() => {
    if (!slip || !template?.templateHtml) return null;
    const templateData = mapSlipToTemplateData(slip, schoolInfo);
    return renderPrintTemplate(template.templateHtml, templateData);
  }, [slip, template, schoolInfo]);

  return (
      <div>
        <style>{`
        @media print {
          body * { visibility: hidden; }
          #payroll-slip-printable, #payroll-slip-printable * { visibility: visible; }
          #payroll-slip-printable { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

        <div className="mb-2 flex flex-wrap items-end justify-between gap-3 print:hidden">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Salary Slip</h1>
            <p className="text-xs text-slate-500 mt-1">View and download individual salary slips</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
            <select
                value={userId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs min-w-[260px]"
            >
              {empLoading && <option>Loading…</option>}
              {!empLoading && paginatedEmployees.length === 0 && <option>No employees found</option>}
              {paginatedEmployees.map((emp) => {
                const id = emp.id ?? emp.userId;
                const name = emp.fullName || [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.name || `User ${id}`;
                const role = (emp.userType || emp.role || "").toUpperCase();
                const displayRole = role === "TEACHER" ? "Teacher" : role === "ADMIN" ? "Admin" : role === "PRINCIPAL" ? "Principal" : role === "ACCOUNTANT" ? "Accountant" : role || "Staff";
                return (
                    <option key={id} value={id}>
                      {name} — {displayRole}
                    </option>
                );
              })}
            </select>
            <input
                type="month"
                value={monthInputValue}
                onChange={(e) => handleMonthInput(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
            {history.length > 0 && (
                <select
                    onChange={(e) => {
                      const rec = history.find((h) => String(h.payrollId ?? h.id) === e.target.value);
                      if (rec) {
                        setMonth(rec.month);
                        setYear(rec.year);
                      }
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    defaultValue=""
                >
                  <option value="" disabled>
                    Recent…
                  </option>
                  {history.map((h) => (
                      <option key={h.payrollId ?? h.id} value={h.payrollId ?? h.id}>
                        {h.monthLabel || `${MONTH_NAMES[(h.month || 1) - 1]} ${h.year}`}
                      </option>
                  ))}
                </select>
            )}
            <button
                onClick={handleLoad}
                disabled={loading || !userId}
                className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load"}
            </button>
            <button
                onClick={handlePrint}
                disabled={!slip}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              ⬇ Download PDF
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 text-[11px] text-slate-400 print:hidden">
          <div>
            Template: <strong className="text-slate-500">{template?.templateName || "Default layout"}</strong>
            {template?.updatedAt && <> · updated {fmtDate(template.updatedAt)}</>}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-[10px] uppercase tracking-wide">Rows</label>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] bg-white"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEmployeePage((p) => Math.max(1, p - 1))}
                disabled={safeEmployeePage <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[11px] text-slate-500">
                Page {safeEmployeePage} / {totalEmployeePages}
              </span>
              <button
                type="button"
                onClick={() => setEmployeePage((p) => Math.min(totalEmployeePages, p + 1))}
                disabled={safeEmployeePage >= totalEmployeePages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="print:hidden">
          <ErrorBanner message={error} onRetry={null} />
          {empError && <div className="text-[11px] text-red-600 mb-3">{empError}</div>}
        </div>

        {!slip && !loading && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-sm text-slate-400 print:hidden">
              Pick an employee and month, then click Load to view the salary slip.
            </div>
        )}

        {slip && (
            <div id="payroll-slip-printable" className="max-w-[800px] mx-auto">
              {renderedTemplateHtml ? (
                  <div
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: renderedTemplateHtml }}
                  />
              ) : (
                  <DefaultSlipLayout slip={slip} month={month} year={year} />
              )}
            </div>
        )}
      </div>
  );
}
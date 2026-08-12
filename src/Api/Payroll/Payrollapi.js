// Payroll API with static data integrated with real Leaves, Attendance, and Teachers APIs
// This shim computes realistic payslips using actual leave/attendance/salary data
// When the real payroll backend is ready, just swap out the functions below with real API calls

import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";
import { getTeacherLookup, getTeacherSalary, upsertTeacherSalary, getTeacherById } from "../Teachers/TeachersAPI";
import { getUsersLeaveBalance, getUserLeaveRequest } from "../Leaves/LeavesManagementAPI";
import { getUserMonthlyAttendance } from "../Attendance/AttendanceApi";

/**
 * Payroll API wrapper - uses static salary structures + real leave/attendance data
 * to compute realistic payslips. Integrates with existing teacher, leave, and attendance APIs.
 * This keeps UI development independent of backend payroll service availability.
 */

// ──────────────────────────────────────────────────────────────────────────────
// STATIC PAYROLL CONFIGURATION & SALARY TEMPLATES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Default salary template for teachers (static data)
 * Each school/teacher can override via salary config endpoint
 */
const DEFAULT_SALARY_STRUCTURE = {
  basic: 40000,
  hra: 12000, // 30% of basic
  dearness: 4000,
  allowances: {
    transport: 2000,
    medical: 1000,
    other: 1500,
  },
  totalEarnings: 60500,
  deductions: {
    pf: 3600, // 9% of basic
    it: 5000, // income tax
    esi: 0, // typically for non-managerial
  },
  totalDeductions: 8600,
  netPay: 51900,
};

/**
 * Static payroll run cache with sample data
 * In production, these would be stored in a real database
 */
const PAYROLL_RUNS_CACHE = {
  "run-2024-jul": { id: "run-2024-jul", month: 7, year: 2024, status: "finalized", createdAt: "2024-07-01" },
  "run-2024-aug": { id: "run-2024-aug", month: 8, year: 2024, status: "finalized", createdAt: "2024-08-01" },
  "run-2024-sep": { id: "run-2024-sep", month: 9, year: 2024, status: "draft", createdAt: "2024-09-01" },
};

/**
 * Static payslips cache (keyed by userId-month-year)
 * Computed on-demand from leaves, attendance, and salary config
 */
const PAYSLIPS_CACHE = {};

/**
 * Get salary configuration for a teacher
 * First tries real backend, falls back to default structure
 */
export const getSalaryConfigByUser = async (userId) => {
  try {
    const data = await getTeacherSalary(userId);
    return data || DEFAULT_SALARY_STRUCTURE;
  } catch (err) {
    console.warn("getSalaryConfigByUser fallback:", err.message || err);
    return DEFAULT_SALARY_STRUCTURE;
  }
};

export const saveSalaryConfig = async (userId, payload) => {
  try {
    return await upsertTeacherSalary(userId, payload);
  } catch (err) {
    console.error("saveSalaryConfig error:", err);
    throw err;
  }
};

/**
 * Convenience helper to update only the base salary for a teacher.
 * Fetches the existing salary config, applies the new base salary and saves.
 */
export const updateTeacherBaseSalary = async (userId, baseSalary) => {
  try {
    const existing = await getSalaryConfigByUser(userId).catch(() => ({}));
    const payload = { ...existing, baseSalary: Number(baseSalary) || 0 };
    return await saveSalaryConfig(userId, payload);
  } catch (err) {
    console.error("updateTeacherBaseSalary error:", err);
    throw err;
  }
};

// Leave policy configuration uses the existing LEAVE_CONFIG endpoints
export const getAllLeavePolicyConfigs = async () => {
  const res = await authFetch(API_ENDPOINTS.LEAVE_CONFIG, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch leave configs");
  return await res.json();
};

export const createLeavePolicyConfig = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.LEAVE_CONFIG, { method: "POST", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create leave config");
  return data;
};

export const updateLeavePolicyConfig = async (id, payload) => {
  const res = await authFetch(API_ENDPOINTS.leaveConfigById(id), { method: "PUT", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update leave config");
  return data;
};

export const deleteLeavePolicyConfig = async (id) => {
  const res = await authFetch(API_ENDPOINTS.leaveConfigById(id), { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text() || "Failed to delete leave config");
  return await res.json();
};

// Advance salary - backend may not be ready; attempt to call endpoints if present
export const getAdvanceSalaryByUser = async (userId) => {
  try {
    const res = await authFetch(API_ENDPOINTS.payrollAdvanceByUser(userId), { method: "GET" });
    if (!res.ok) throw new Error(await res.text() || "Failed to fetch advances");
    return await res.json();
  } catch (err) {
    // fallback: empty list
    console.warn("getAdvanceSalaryByUser fallback:", err.message || err);
    return [];
  }
};

export const createAdvanceSalary = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.PAYROLL_ADVANCES, { method: "POST", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create advance");
  return data;
};

export const settleAdvanceSalary = async (advanceId) => {
  const res = await authFetch(API_ENDPOINTS.payrollAdvanceById(advanceId), { method: "PATCH" });
  if (!res.ok) throw new Error(await res.text() || "Failed to settle advance");
  return await res.json();
};

export const getPayrollLeaveStats = async (userId) => {
  try {
    const data = await getUsersLeaveBalance(userId);
    // Normalize response shape
    return data?.data || data || { totalAllocated: 20, used: 0, remaining: 20, pending: 0 };
  } catch (err) {
    console.warn("getPayrollLeaveStats fallback:", err.message || err);
    return { totalAllocated: 20, used: 0, remaining: 20, pending: 0 };
  }
};

export const getPayrollAttendanceSummary = async (userId, month, year) => {
  try {
    const data = await getUserMonthlyAttendance({ userId, userType: "TEACHER", year, month });
    return data || { presentDays: 20, absentDays: 0, totalDays: 22 };
  } catch (err) {
    console.warn("getPayrollAttendanceSummary fallback:", err.message || err);
    return { presentDays: 20, absentDays: 0, totalDays: 22 };
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PAYSLIP COMPUTATION (integrates leaves, attendance, salary)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Compute a payslip for a teacher for a given month/year
 * Fetches real leave and attendance data, then calculates net pay
 * @param {string} userId - Teacher ID
 * @param {number} month - 1-12
 * @param {number} year - e.g., 2024
 * @returns {object} Payslip with breakdown (earnings, deductions, net)
 */
async function computePayslip(userId, month, year) {
  try {
    // Fetch real leave balance and attendance data
    const [leaveBalance, attendanceData] = await Promise.all([
      getUsersLeaveBalance(userId).catch(() => ({ totalAllocated: 20, used: 3, remaining: 17 })),
      getUserMonthlyAttendance({ userId, userType: "TEACHER", year, month }).catch(() => ({ presentDays: 22, absentDays: 0 })),
    ]);

    // Get salary config (or use default)
    const salaryConfig = await getSalaryConfigByUser(userId).catch(() => DEFAULT_SALARY_STRUCTURE);

    // Compute unpaid leave deduction
    const workingDaysInMonth = 22; // Standard: 22 working days/month
    const absentDays = attendanceData?.absentDays || 0;
    const unpaidLeaveDays = Math.max(0, (leaveBalance?.used || 0) - (leaveBalance?.totalAllocated ? Math.min(leaveBalance.used, leaveBalance.totalAllocated) : 0));

    const basicSalary = salaryConfig?.basic || DEFAULT_SALARY_STRUCTURE.basic;
    const perDayAmount = basicSalary / workingDaysInMonth;
    const leaveDeduction = Math.max(0, absentDays + unpaidLeaveDays) * perDayAmount;

    const earnings = {
      basic: basicSalary,
      hra: salaryConfig?.hra || DEFAULT_SALARY_STRUCTURE.hra,
      dearness: salaryConfig?.dearness || DEFAULT_SALARY_STRUCTURE.dearness,
      ...salaryConfig?.allowances,
    };

    const totalEarnings = Object.values(earnings).reduce((a, b) => typeof b === 'number' ? a + b : a, 0);

    const deductions = {
      leaveDeduction,
      pf: salaryConfig?.deductions?.pf || DEFAULT_SALARY_STRUCTURE.deductions.pf,
      it: salaryConfig?.deductions?.it || DEFAULT_SALARY_STRUCTURE.deductions.it,
      esi: salaryConfig?.deductions?.esi || 0,
    };

    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const netPay = totalEarnings - totalDeductions;

    return {
      userId,
      month,
      year,
      generatedAt: new Date().toISOString(),
      status: "generated",
      earnings,
      totalEarnings,
      deductions,
      totalDeductions,
      netPay,
      details: {
        presentDays: attendanceData?.presentDays || 20,
        absentDays,
        unpaidLeaveDays,
        totalLeave: leaveBalance?.used || 0,
        leaveBalance: leaveBalance?.remaining || 0,
      },
    };
  } catch (err) {
    console.error("Payslip computation error:", err);
    throw err;
  }
}

/**
 * Get or compute a salary slip for a teacher
 * First checks cache, then computes if not found
 */
export const getSalarySlip = async (userId, month, year) => {
  try {
    const cacheKey = `${userId}-${month}-${year}`;

    // Do NOT call the (missing) backend salary-slip endpoint here.
    // Compute locally from teacher salary, leaves and attendance so the UI
    // works even if payroll backend is not available.

    // Return cached if present
    if (PAYSLIPS_CACHE[cacheKey]) return PAYSLIPS_CACHE[cacheKey];

    // Compute payslip using available data
    const payslip = await computePayslip(userId, month, year);
    PAYSLIPS_CACHE[cacheKey] = payslip;
    return payslip;
  } catch (err) {
    console.warn("getSalarySlip error:", err.message || err);
    return null;
  }
};

/**
 * Generate a PDF blob for a payslip (HTML template → PDF conversion)
 * For now, returns a simple text-based representation
 * In production, use a library like puppeteer, jspdf, or wkhtmltopdf
 */
export const downloadSalarySlip = async (userId, month, year) => {
  try {
    const payslip = await getSalarySlip(userId, month, year);
    if (!payslip) return { success: false };

    // Get teacher details for payslip header
    const teacher = await getTeacherById(userId).catch(() => ({ name: "Employee", employeeCode: "N/A" }));

    // Generate HTML for payslip (simple template)
    const html = generatePayslipHTML(teacher, payslip);

    // Convert HTML to blob (in a real app, use jspdf or wkhtmltopdf)
    // For now, we'll return a data URL blob
    const blob = new Blob([html], { type: "text/html" });

    return { blob, success: true };
  } catch (err) {
    console.warn("downloadSalarySlip error:", err.message || err);
    return { success: false };
  }
};

/**
 * Generate HTML payslip template
 * @private
 */
function generatePayslipHTML(teacher, payslip) {
  const { month, year, earnings, totalEarnings, deductions, totalDeductions, netPay, details } = payslip;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .payslip { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .header h1 { margin: 0; color: #333; }
        .header p { margin: 5px 0; color: #666; }
        .period { text-align: center; font-size: 16px; color: #666; margin-bottom: 30px; }
        .employee-info { margin-bottom: 30px; }
        .employee-info table { width: 100%; }
        .employee-info td { padding: 8px; }
        .section { margin-bottom: 30px; }
        .section-title { font-weight: bold; font-size: 14px; background: #f0f0f0; padding: 8px; margin-bottom: 10px; }
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .details-table .label { width: 60%; }
        .details-table .amount { text-align: right; width: 40%; }
        .total-row { font-weight: bold; background: #f9f9f9; }
        .net-pay-row { font-weight: bold; background: #e8f5e9; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="payslip">
        <div class="header">
          <h1>SALARY SLIP</h1>
          <p>SchoolSpine Management System</p>
        </div>
        
        <div class="period">
          <p>For the month of <strong>${monthNames[month - 1]} ${year}</strong></p>
        </div>
        
        <div class="employee-info">
          <table>
            <tr>
              <td><strong>Employee Name:</strong> ${teacher.name}</td>
              <td><strong>Employee ID:</strong> ${teacher.employeeCode || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Designation:</strong> ${teacher.designation || 'Teacher'}</td>
              <td><strong>Date of Slip:</strong> ${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">EARNINGS</div>
          <table class="details-table">
            ${Object.entries(earnings).map(([key, value]) => typeof value === 'number' ? 
              `<tr><td class="label">${key.charAt(0).toUpperCase() + key.slice(1)}:</td><td class="amount">₹ ${value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>` 
              : '').join('')}
            <tr class="total-row">
              <td class="label">TOTAL EARNINGS:</td>
              <td class="amount">₹ ${totalEarnings.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">DEDUCTIONS</div>
          <table class="details-table">
            ${Object.entries(deductions).map(([key, value]) => 
              `<tr><td class="label">${key.charAt(0).toUpperCase() + key.slice(1)}:</td><td class="amount">₹ ${value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>`
            ).join('')}
            <tr class="total-row">
              <td class="label">TOTAL DEDUCTIONS:</td>
              <td class="amount">₹ ${totalDeductions.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <table class="details-table">
            <tr class="net-pay-row">
              <td class="label">NET PAY:</td>
              <td class="amount">₹ ${netPay.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">ATTENDANCE SUMMARY</div>
          <table class="details-table">
            <tr>
              <td class="label">Present Days:</td>
              <td class="amount">${details.presentDays}</td>
            </tr>
            <tr>
              <td class="label">Absent Days:</td>
              <td class="amount">${details.absentDays}</td>
            </tr>
            <tr>
              <td class="label">Leave Taken:</td>
              <td class="amount">${details.totalLeave}</td>
            </tr>
            <tr>
              <td class="label">Leave Balance:</td>
              <td class="amount">${details.leaveBalance}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const getAllTeachersForPayroll = async () => {
  try {
    const data = await getTeacherLookup();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (err) {
    console.warn("getAllTeachersForPayroll error:", err.message || err);
    return [];
  }
};

/**
 * Get payroll dashboard summary (for admins)
 */
export const getPayrollDashboardSummary = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.PAYROLL_DASHBOARD, { method: "GET" });
    if (!res.ok) throw new Error(await res.text() || "Failed to fetch payroll dashboard summary");
    return await res.json();
  } catch (err) {
    console.warn("getPayrollDashboardSummary fallback:", err.message || err);
    return { totalTeachers: 0, totalAdvances: 0, outstandingAmount: 0 };
  }
};

/**
 * Get teacher payroll dashboard (for individual teacher view)
 * Shows payslip history, leave balance, and upcoming payroll info
 * @param {string} userId - Teacher ID
 * @returns {object} Dashboard data with payslips, leave balance, etc.
 */
export const getTeacherPayrollDashboard = async (userId) => {
  try {
    // Fetch teacher details
    const teacher = await getTeacherById(userId).catch(() => ({}));

    // Fetch leave balance
    const leaveBalance = await getUsersLeaveBalance(userId).catch(() => ({
      totalAllocated: 20,
      used: 0,
      remaining: 20,
      pending: 0,
    }));

    // Fetch salary configuration
    const salaryConfig = await getSalaryConfigByUser(userId);

    // Generate payslips for last 6 months (compute in parallel to improve responsiveness)
    const now = new Date();
    const monthsToFetch = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const slipPromises = monthsToFetch.map(({ month, year }) =>
      getSalarySlip(userId, month, year).catch(() => null)
    );

    const slipResults = await Promise.all(slipPromises);
    const payslips = slipResults
      .map((s, idx) => (s ? s : null))
      .filter(Boolean)
      // ensure chronological order: oldest first
      .reverse();

    // Get current month attendance
    const currentAttendance = await getPayrollAttendanceSummary(userId, now.getMonth() + 1, now.getFullYear());

    return {
      teacher: {
        id: userId,
        name: teacher.name,
        employeeCode: teacher.employeeCode,
        designation: teacher.designation,
      },
      leaveBalance,
      salaryConfig,
      payslips,
      currentMonthAttendance: currentAttendance,
      lastPayslip: payslips[payslips.length - 1] || null,
    };
  } catch (err) {
    console.error("getTeacherPayrollDashboard error:", err);
    throw err;
  }
};

/**
 * Get payslip history for a teacher (last N months)
 * @param {string} userId - Teacher ID
 * @param {number} months - Number of months to fetch (default: 12)
 * @returns {array} List of payslips
 */
export const getTeacherPayslipHistory = async (userId, months = 12) => {
  try {
    const now = new Date();
    const payslips = [];

    // Fetch payslips in parallel for better performance
    const monthsToFetch = Array.from({ length: months }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const promises = monthsToFetch.map(({ month, year }) =>
      getSalarySlip(userId, month, year).then((slip) => (slip ? { ...slip, month, year } : null)).catch(() => null)
    );

    const results = await Promise.all(promises);
    // Keep chronological order (oldest first)
    const ordered = results.filter(Boolean).reverse();
    return ordered;
  } catch (err) {
    console.error("getTeacherPayslipHistory error:", err);
    throw err;
  }
};

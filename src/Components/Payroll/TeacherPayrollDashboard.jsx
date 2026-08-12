import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader,
  Wallet,
  ClipboardList,
  FileText,
  LeafyGreen
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getTeacherPayrollDashboard,
  downloadSalarySlip,
  getTeacherPayslipHistory
} from "../../Api/Payroll/Payrollapi";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Teacher Payroll Dashboard Component
 * Displays:
 * - Latest payslip summary
 * - Payslip history (last 12 months)
 * - Leave balance & attendance
 * - Download payslip functionality
 * - Salary breakdown charts
 */
const TeacherPayrollDashboard = ({ userId }) => {
  const [dashboard, setDashboard] = useState(null);
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [expandedPayslip, setExpandedPayslip] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashData, historyData] = await Promise.all([
        getTeacherPayrollDashboard(userId),
        getTeacherPayslipHistory(userId, 12),
      ]);
      setDashboard(dashData);
      setPayslipHistory(historyData);
      setSelectedPayslip(dashData?.lastPayslip || null);
    } catch (err) {
      console.error("Failed to load payroll dashboard:", err);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSlip = async (slip) => {
    if (!slip) return;
    setDownloading(true);
    try {
      const result = await downloadSalarySlip(userId, slip.month, slip.year);
      if (result?.blob) {
        const url = window.URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `salary-slip-${slip.year}-${slip.month}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Payslip downloaded successfully");
      } else {
        toast.error("Failed to download payslip");
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Error downloading payslip");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Unable to load payroll data</p>
        <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
      </div>
    );
  }

  const lastPayslip = dashboard?.lastPayslip || selectedPayslip;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
          My Payroll Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          View payslips, leave balance, and payroll details
        </p>
      </div>

      {/* Latest Payslip Summary Card */}
      {lastPayslip && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Latest Payslip
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {MONTHS[lastPayslip.month - 1]} {lastPayslip.year}
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Total Earnings</p>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                ₹{lastPayslip.totalEarnings?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Deductions</p>
              <p className="text-sm sm:text-base font-bold text-red-600">
                -₹{lastPayslip.totalDeductions?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-600 mb-1">Net Pay</p>
              <p className="text-sm sm:text-base font-bold text-green-600">
                ₹{lastPayslip.netPay?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownloadSlip(lastPayslip)}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {downloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Payslip
              </>
            )}
          </button>
        </div>
      )}

      {/* Leave Balance Card */}
      {dashboard?.leaveBalance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <LeafyGreen className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Leave Balance
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Total Allocated</span>
                <span className="font-bold text-gray-900">
                  {dashboard.leaveBalance.totalAllocated || 20}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${((dashboard.leaveBalance.used || 0) / (dashboard.leaveBalance.totalAllocated || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs sm:text-sm text-gray-600">Used: {dashboard.leaveBalance.used || 0}</span>
                <span className="text-xs sm:text-sm text-green-600 font-bold">
                  Available: {dashboard.leaveBalance.remaining || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Current Month Attendance */}
          {dashboard?.currentMonthAttendance && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2.5 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Current Month
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Present Days</span>
                  <span className="font-bold text-green-600">
                    {dashboard.currentMonthAttendance.presentDays || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Absent Days</span>
                  <span className="font-bold text-red-600">
                    {dashboard.currentMonthAttendance.absentDays || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Total Days</span>
                  <span className="font-bold text-gray-900">
                    {dashboard.currentMonthAttendance.totalDays || 22}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payslip Breakdown (if selected) */}
      {selectedPayslip && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 sm:px-6 py-4">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Payslip Breakdown - {MONTHS[selectedPayslip.month - 1]} {selectedPayslip.year}
            </h3>
          </div>

          <div className="p-5 sm:p-6">
            {/* Earnings */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Earnings
              </h4>
              <div className="space-y-2">
                {Object.entries(selectedPayslip.earnings || {}).map(([key, value]) =>
                  typeof value === 'number' ? (
                    <div key={key} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 capitalize">
                        {key === 'basic' ? 'Basic Salary' : key === 'hra' ? 'HRA' : key === 'dearness' ? 'Dearness Allowance' : key}
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ) : null
                )}
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span>Total Earnings</span>
                  <span className="text-green-600">
                    ₹{selectedPayslip.totalEarnings?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Deductions
              </h4>
              <div className="space-y-2">
                {Object.entries(selectedPayslip.deductions || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 capitalize">
                      {key === 'leaveDeduction' ? 'Leave Deduction' : key === 'pf' ? 'Provident Fund' : key === 'it' ? 'Income Tax' : key === 'esi' ? 'ESI' : key}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">
                    -₹{selectedPayslip.totalDeductions?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Net Pay</span>
                <span className="text-lg sm:text-xl font-bold text-green-600">
                  ₹{selectedPayslip.netPay?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Attendance Details */}
            {selectedPayslip.details && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  Attendance Summary
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Present Days</p>
                    <p className="font-bold text-gray-900">{selectedPayslip.details.presentDays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Absent Days</p>
                    <p className="font-bold text-gray-900">{selectedPayslip.details.absentDays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Leave</p>
                    <p className="font-bold text-gray-900">{selectedPayslip.details.totalLeave}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Leave Balance</p>
                    <p className="font-bold text-gray-900">{selectedPayslip.details.leaveBalance}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payslip History */}
      {payslipHistory && payslipHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 sm:px-6 py-4">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Payslip History
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {payslipHistory.map((slip, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedPayslip(slip);
                  setExpandedPayslip(expandedPayslip === idx ? null : idx);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {MONTHS[slip.month - 1]} {slip.year}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Net Pay: ₹{slip.netPay?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        ₹{slip.netPay?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gray-500">Net</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSlip(slip);
                      }}
                      disabled={downloading}
                      className="bg-blue-100 hover:bg-blue-200 disabled:bg-gray-200 p-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-blue-600 disabled:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Payslips Message */}
      {(!payslipHistory || payslipHistory.length === 0) && (
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No payslips available yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Payslips will appear once payroll is processed
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherPayrollDashboard;


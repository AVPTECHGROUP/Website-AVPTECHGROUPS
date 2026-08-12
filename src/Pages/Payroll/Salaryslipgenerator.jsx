import React, { useState } from "react";
import { FileText, Download, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── UI-only mock slip data ──────────────────────────────────────────────
// Swap this for getSalarySlip(teacher.id, month, year) later.
const MOCK_SLIP = {
    workingDays: 26,
    presentDays: 23,
    paidLeaveDays: 2,
    unpaidLeaveDays: 1,
    baseSalary: 45000,
    bonus: 2000,
    earnings: [
        { label: "House Rent Allowance", amount: 9000 },
        { label: "Travel Allowance", amount: 2500 },
        { label: "Dearness Allowance", amount: 3200 },
    ],
    deductions: [
        { label: "Provident Fund", amount: 1800 },
        { label: "Professional Tax", amount: 200 },
        { label: "Unpaid Leave (1 day)" },
    ],
};

const SalarySlip = ({ teacher }) => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [downloading, setDownloading] = useState(false);

    const slip = MOCK_SLIP; // TODO: fetch based on teacher.id + month + year

    const totalEarnings = slip.baseSalary + slip.bonus + slip.earnings.reduce((s, e) => s + e.amount, 0);
    const totalDeductions = slip.deductions.reduce((s, d) => s + d.amount, 0);
    const netPay = totalEarnings - totalDeductions;

    const handleDownload = async () => {
        setDownloading(true);
        // TODO: replace with downloadSalarySlip(teacher.id, month + 1, year)
        setTimeout(() => setDownloading(false), 800);
    };

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Period selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Salary Slip</h2>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[year - 1, year, year + 1].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Download className="w-4 h-4" /> {downloading ? "Preparing…" : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Working days / leave stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: "Working Days", value: slip.workingDays, icon: CalendarDays, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                    { label: "Present Days", value: slip.presentDays, icon: TrendingUp, iconBg: "bg-green-100", iconColor: "text-green-600" },
                    { label: "Paid Leave", value: slip.paidLeaveDays, icon: CalendarDays, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
                    { label: "Unpaid Leave", value: slip.unpaidLeaveDays, icon: TrendingDown, iconBg: "bg-red-100", iconColor: "text-red-600" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-sm">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 ${stat.iconBg} rounded-lg flex items-center justify-center mb-2`}>
                                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-[11px] sm:text-xs text-gray-500">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Slip breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">{teacher?.name}</p>
                        <p className="text-xs text-gray-500">{teacher?.designation || "Teacher"} · {MONTHS[month]} {year}</p>
                    </div>
                    <span className="bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            Net Pay ₹{netPay.toLocaleString()}
          </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    {/* Earnings */}
                    <div className="p-4 sm:p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Earnings</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-700">Base Salary</span>
                                <span className="font-medium text-gray-900">₹{slip.baseSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-700">Bonus</span>
                                <span className="font-medium text-gray-900">₹{slip.bonus.toLocaleString()}</span>
                            </div>
                            {slip.earnings.map((e) => (
                                <div key={e.label} className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-700">{e.label}</span>
                                    <span className="font-medium text-gray-900">₹{e.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm font-semibold border-t border-gray-100 mt-3 pt-3">
                            <span className="text-gray-900">Total Earnings</span>
                            <span className="text-green-600">₹{totalEarnings.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="p-4 sm:p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Deductions</p>
                        <div className="space-y-2">
                            {slip.deductions.map((d) => (
                                <div key={d.label} className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-700">{d.label}</span>
                                    <span className="font-medium text-red-600">-₹{d.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm font-semibold border-t border-gray-100 mt-3 pt-3">
                            <span className="text-gray-900">Total Deductions</span>
                            <span className="text-red-600">-₹{totalDeductions.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border-t border-blue-100 p-4 sm:p-5 flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">Net Pay</span>
                    <span className="text-lg sm:text-xl font-bold text-blue-700">₹{netPay.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default SalarySlip;
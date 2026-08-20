import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    FileText, Download, CalendarDays, TrendingUp, TrendingDown,
    Loader2, AlertTriangle, RefreshCw,
} from "lucide-react";
import { getDefaultPrintTemplate } from "../../Api/PrintTemplate/PrintTemplatesApi";
import {renderMergeTemplate} from "../../Components/Templates/Mergetemplate.js";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── UI-only mock slip data ──────────────────────────────────────────────
// TODO: swap this for getSalarySlip(teacher.id, month, year) once the
// backend endpoint exists — still pending as of this change. Everything
// below this point (template fetch, merge, preview, print) is real and
// already wired to whatever `slip` ends up containing.
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
        { label: "Unpaid Leave (1 day)", amount: 0 },
    ],
};

const SalarySlip = ({ teacher }) => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    // ── Default SALARY_SLIP template (fetched from the Print Templates
    // module, same source PrintTemplatesPage's "Preview Default" uses) ──
    const [template, setTemplate] = useState(null);
    const [templateLoading, setTemplateLoading] = useState(true);
    const [templateError, setTemplateError] = useState("");

    const fetchTemplate = async () => {
        setTemplateLoading(true);
        setTemplateError("");
        try {
            const data = await getDefaultPrintTemplate("SALARY_SLIP");
            if (data) {
                setTemplate(data);
            } else {
                setTemplate(null);
                setTemplateError("No default Salary Slip template has been set yet.");
            }
        } catch (err) {
            setTemplate(null);
            setTemplateError(err.message || "Failed to load the default Salary Slip template.");
        } finally {
            setTemplateLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, []);

    const slip = MOCK_SLIP;

    const totalEarnings = slip.baseSalary + slip.bonus + slip.earnings.reduce((s, e) => s + e.amount, 0);
    const totalDeductions = slip.deductions.reduce((s, d) => s + (d.amount || 0), 0);
    const netPay = totalEarnings - totalDeductions;

    // Data merged into the template's {{tokens}} / {{#earnings}} loops.
    const mergeData = useMemo(() => ({
        employeeName: teacher?.name || "",
        designation: teacher?.designation || "Teacher",
        employeeCode: teacher?.employeeCode || "—",
        month: MONTHS[month],
        year: String(year),
        period: `${MONTHS[month]} ${year}`,
        workingDays: slip.workingDays,
        presentDays: slip.presentDays,
        paidLeaveDays: slip.paidLeaveDays,
        unpaidLeaveDays: slip.unpaidLeaveDays,
        baseSalary: slip.baseSalary.toLocaleString("en-IN"),
        bonus: slip.bonus.toLocaleString("en-IN"),
        totalEarnings: totalEarnings.toLocaleString("en-IN"),
        totalDeductions: totalDeductions.toLocaleString("en-IN"),
        netPay: netPay.toLocaleString("en-IN"),
        earnings: slip.earnings.map((e) => ({
            label: e.label,
            amount: e.amount != null ? e.amount.toLocaleString("en-IN") : "",
        })),
        deductions: slip.deductions.map((d) => ({
            label: d.label,
            amount: d.amount ? d.amount.toLocaleString("en-IN") : "",
        })),
    }), [teacher, slip, month, year, totalEarnings, totalDeductions, netPay]);

    const mergedHtml = useMemo(
        () => (template?.templateHtml ? renderMergeTemplate(template.templateHtml, mergeData) : ""),
        [template, mergeData]
    );

    const handlePrint = () => {
        if (!mergedHtml) return;
        const printWindow = window.open("", "_blank", "width=900,height=1100");
        if (!printWindow) {
            toast.error("Please allow pop-ups for this site to print or download the slip.");
            return;
        }
        printWindow.document.open();
        printWindow.document.write(mergedHtml);
        printWindow.document.close();

        // Templates are plain HTML/CSS (no React lifecycle), so we trigger
        // print on load with a short fallback in case the load event is
        // skipped after document.write in some browsers. The `printed` flag
        // stops both paths from opening the dialog twice.
        let printed = false;
        const triggerPrint = () => {
            if (printed) return;
            printed = true;
            printWindow.focus();
            printWindow.print();
        };
        printWindow.onload = triggerPrint;
        setTimeout(triggerPrint, 400);
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
                        onClick={handlePrint}
                        disabled={!mergedHtml}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        title={mergedHtml ? "Opens the print dialog — choose \"Save as PDF\" to download" : "No template loaded yet"}
                    >
                        <Download className="w-4 h-4" /> Print / Download PDF
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

            {/* Template-rendered slip */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between gap-2">
                    <span>Rendered from default Salary Slip template</span>
                    {templateError && !templateLoading && (
                        <button
                            type="button"
                            onClick={fetchTemplate}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 normal-case font-semibold"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    )}
                </div>

                {templateLoading ? (
                    <div className="px-5 py-16 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Loading template…
                    </div>
                ) : templateError ? (
                    <div className="px-5 py-16 text-center">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-700 font-medium">{templateError}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Set a default template under Payroll → Print Templates → Salary Slip.
                        </p>
                    </div>
                ) : (
                    <iframe
                        title="salary-slip-preview"
                        srcDoc={mergedHtml}
                        sandbox=""
                        className="w-full border-0 bg-white"
                        style={{ minHeight: "70vh" }}
                    />
                )}
            </div>
        </div>
    );
};

export default SalarySlip;
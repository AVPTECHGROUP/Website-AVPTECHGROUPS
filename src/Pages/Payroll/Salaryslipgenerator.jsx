import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    FileText, Download, CalendarDays, TrendingUp, TrendingDown,
    Loader2, AlertTriangle, RefreshCw,
} from "lucide-react";
import { getDefaultPrintTemplate } from "../../Api/PrintTemplate/PrintTemplatesApi";
import { renderTemplate, buildSalarySlipMergeData } from "../../Components/Templates/Mergetemplate.js";
import {
    getCachedDefaultTemplate,
    cacheDefaultTemplate,
    clearCachedDefaultTemplate,
} from "../../utils/TemplateStorage/templateCache";

const TEMPLATE_TYPE = "SALARY_SLIP";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── UI-only mock slip data (mirrors the fields on the printed slip: basic
// pay is itemized in `earnings`, statutory/attendance deductions are itemized
// in `deductions` — gross/net/words are all derived by buildSalarySlipMergeData) ──
// TODO: swap this for getSalarySlip(teacher.id, month, year) once the
// backend endpoint exists — still pending as of this change. Everything
// below this point (template fetch, merge, preview, print) is real and
// already wired to whatever `slip` ends up containing.
const MOCK_SLIP = {
    department: "Mathematics",
    dateOfJoining: "15/06/2023",
    paymentMode: "Bank Transfer",
    payrollStatus: "PROCESSED",

    workingDays: 26,
    presentDays: 24,
    paidLeaveDays: 1,
    unpaidLeaveDays: 1,
    halfDayDays: 0,
    lateMarks: 3,

    earnings: [
        { label: "Basic Salary", amount: 30000 },
        { label: "HRA", amount: 8000 },
        { label: "Conveyance Allowance", amount: 2000 },
        { label: "Academic / Teaching Allowance", amount: 3000 },
        { label: "Other Allowance", amount: 2000 },
    ],
    deductions: [
        { label: "Unpaid Leave - 1 Day", amount: 1153.85 },
        { label: "Unauthorized Absence - 1 Day", amount: 1153.85 },
        { label: "Late Penalty - 3 Marks", amount: 576.92 },
        { label: "Provident Fund (PF)", amount: 3000 },
        { label: "Professional Tax", amount: 200 },
        { label: "TDS", amount: 500 },
    ],

    bankName: "—",
    ifscCode: "—",
    accountNumber: "—",
    transactionId: "—",
};

const pad2 = (n) => String(n).padStart(2, "0");
const formatDMY = (date) => `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;

// `school` should come from the same UserContext source FeeReceiptPrint.jsx
// pulls schoolName from — pass it down as a prop once that's wired here too.
const SalarySlip = ({ teacher, school = {} }) => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    // ── Default SALARY_SLIP template. Read the cache synchronously first so
    // the slip renders instantly on repeat visits, then refresh from the API
    // in the background (silently, if we already had something to show). ──
    const [template, setTemplate] = useState(() => getCachedDefaultTemplate(TEMPLATE_TYPE));
    const [templateLoading, setTemplateLoading] = useState(() => !getCachedDefaultTemplate(TEMPLATE_TYPE));
    const [templateError, setTemplateError] = useState("");

    const fetchTemplate = async ({ silent = false } = {}) => {
        if (!silent) setTemplateLoading(true);
        setTemplateError("");
        try {
            const data = await getDefaultPrintTemplate(TEMPLATE_TYPE);
            if (data) {
                setTemplate(data);
                cacheDefaultTemplate(TEMPLATE_TYPE, data);
            } else {
                clearCachedDefaultTemplate(TEMPLATE_TYPE);
                setTemplate(null);
                setTemplateError("No default Salary Slip template has been set yet.");
            }
        } catch (err) {
            // Network/API failure — keep showing whatever cached template we
            // already have rather than blanking the screen; only surface an
            // error if there's genuinely nothing to render.
            setTemplate((prev) => {
                if (!prev) setTemplateError(err.message || "Failed to load the default Salary Slip template.");
                return prev;
            });
        } finally {
            setTemplateLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplate({ silent: !!template });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const slip = MOCK_SLIP;

    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + 1, 0); // last day of the selected month

    // Flat record combining employee + period + attendance + pay data, in
    // the same shape buildFeeReceiptMergeData / buildGatePassMergeData etc.
    // expect for their "record" argument.
    const slipRecord = useMemo(() => ({
        employeeName: teacher?.name,
        designation: teacher?.designation,
        employeeCode: teacher?.employeeCode,
        department: teacher?.department || slip.department,
        dateOfJoining: teacher?.dateOfJoining || slip.dateOfJoining,
        paymentMode: slip.paymentMode,
        payrollStatus: slip.payrollStatus,

        month: MONTHS[month],
        year: String(year),
        period: `${MONTHS[month]} ${year}`,
        payPeriod: `${formatDMY(periodStart)} - ${formatDMY(periodEnd)}`,
        paymentDate: formatDMY(periodEnd),
        generatedOn: formatDMY(now),

        workingDays: slip.workingDays,
        presentDays: slip.presentDays,
        paidLeaveDays: slip.paidLeaveDays,
        unpaidLeaveDays: slip.unpaidLeaveDays,
        halfDayDays: slip.halfDayDays,
        lateMarks: slip.lateMarks,

        bankName: slip.bankName,
        ifscCode: slip.ifscCode,
        accountNumber: slip.accountNumber,
        transactionId: slip.transactionId,

        earnings: slip.earnings,
        deductions: slip.deductions,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [teacher, slip, month, year]);

    const mergeData = useMemo(
        () => buildSalarySlipMergeData(slipRecord, school),
        [slipRecord, school]
    );

    const mergedHtml = useMemo(
        () => (template?.templateHtml ? renderTemplate(template.templateHtml, mergeData) : ""),
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
                            onClick={() => fetchTemplate()}
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
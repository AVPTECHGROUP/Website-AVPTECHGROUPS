import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    Wallet, CalendarDays, CheckCircle2, AlertCircle, Download, FileText, ShieldCheck,
    ChevronLeft, ChevronRight, XCircle, Clock, Umbrella, Info, ClipboardList,
} from "lucide-react";
import {getCurrUserDetails} from "../../utils/getCurrUserDetails/index.js";
import {getUserId} from "../../utils/getCurrUserDetails/GetCurrUserDetails.js";
import { isTeacher } from "../../utils/authSession";
import { getTeacherById, getTeacherSalary } from "../../Api/Teachers/TeachersAPI";
import { getUsersLeaveBalance, getUserLeaveRequest } from "../../Api/Leaves/LeavesManagementAPI.js";
import {getAllLeaveConfigs} from "../../Api/Leaves/LeaveConfigAPI.js";
import {getUserMonthlyAttendance} from "../../Api/Attendance/AttendanceApi.js";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REQUESTS_PAGE_SIZE_OPTIONS = [5, 10, 20];

const ALLOWANCE_KEYS = [
    ["houseRentAllowance", "House Rent Allowance"],
    ["travelAllowance", "Travel Allowance"],
    ["dearnessAllowance", "Dearness Allowance"],
    ["specialAllowance", "Special Allowance"],
    ["otherAllowances", "Other Allowances"],
    ["providentFund", "Provident Fund"],
];
const DEDUCTION_KEYS = [
    ["professionalTax", "Professional Tax"],
    ["incomeTax", "Income Tax"],
    ["lateFeeDeduction", "Late Fee Deduction"],
    ["otherDeductions", "Other Deductions"],
];

const normalizeStatus = (raw) => {
    if (!raw) return "NOT_MARKED";
    const s = raw.toString().trim().toUpperCase().replace(/\s+/g, "_");
    if (["PRESENT", "P"].includes(s)) return "PRESENT";
    if (["ABSENT", "A"].includes(s)) return "ABSENT";
    if (["ON_LEAVE", "LEAVE", "L"].includes(s)) return "ON_LEAVE";
    if (["HALF_DAY", "HALFDAY", "HD"].includes(s)) return "HALF_DAY";
    if (["HOLIDAY", "H"].includes(s)) return "HOLIDAY";
    if (["WEEKEND", "WEEK_OFF", "OFF"].includes(s)) return "WEEKEND";
    return "NOT_MARKED";
};

const STATUS_META = {
    PRESENT: { label: "Present", chip: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", Icon: CheckCircle2 },
    ABSENT: { label: "Absent", chip: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", Icon: XCircle },
    ON_LEAVE: { label: "On Leave", chip: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", Icon: Umbrella },
    HALF_DAY: { label: "Half Day", chip: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500", Icon: Clock },
    HOLIDAY: { label: "Holiday", chip: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500", Icon: CalendarDays },
    WEEKEND: { label: "Weekend", chip: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-300", Icon: CalendarDays },
    NOT_MARKED: { label: "Not Marked", chip: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-300", Icon: AlertCircle },
};

const normalizeMonthly = (raw) => {
    if (!raw) return { byDate: {}, summary: {} };
    const list = Array.isArray(raw) ? raw : raw.days || raw.records || raw.attendance || [];
    const byDate = {};
    list.forEach((entry) => {
        const dateKey = entry.date || entry.attendanceDate || entry.day;
        if (!dateKey) return;
        byDate[dateKey.slice(0, 10)] = normalizeStatus(entry.status);
    });

    const providedSummary = raw.summary || raw.stats || null;
    let summary;
    if (providedSummary) {
        summary = providedSummary;
    } else {
        summary = {};
        Object.values(byDate).forEach((s) => {
            summary[s] = (summary[s] || 0) + 1;
        });
    }
    return { byDate, summary };
};

// TODO: replace with the real field once confirmed — currently tries several
// common names before falling back to a from/to date diff.
const extractRequestDays = (req) => {
    if (req.numberOfDays != null) return Number(req.numberOfDays);
    if (req.totalDays != null) return Number(req.totalDays);
    if (req.days != null) return Number(req.days);
    if (req.fromDate && req.toDate) {
        const from = new Date(req.fromDate);
        const to = new Date(req.toDate);
        const diff = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
        return req.halfDay ? diff * 0.5 : Math.max(diff, 0);
    }
    return 0;
};

const emptySalary = {
    salaryType: "MONTHLY", baseSalary: 0, bonus: 0, leaveDeductionPerDay: 0,
    houseRentAllowance: 0, travelAllowance: 0, dearnessAllowance: 0,
    specialAllowance: 0, otherAllowances: 0, providentFund: 0,
    professionalTax: 0, incomeTax: 0, lateFeeDeduction: 0, otherDeductions: 0,
};
const emptyLeave = { totalAllocated: 0, used: 0, remaining: 0, pending: 0 };

const TeacherPayrollSelfView = () => {
    const currentUser = getCurrUserDetails();
    const selfId = getUserId(currentUser);
    const userType = isTeacher(currentUser) ? "TEACHER" : "STAFF";

    const [profile, setProfile] = useState(null);
    const [salary, setSalary] = useState(emptySalary);
    const [leave, setLeave] = useState(emptyLeave);
    const [leaveConfigs, setLeaveConfigs] = useState([]);
    const [leaveConfigsError, setLeaveConfigsError] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [attendance, setAttendance] = useState({ byDate: {}, summary: {} });
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // ── Leave requests pagination (client-side — getUserLeaveRequest doesn't
    // currently accept page/size params; swap to server pagination once it does) ──
    const [reqPage, setReqPage] = useState(1);
    const [reqPageSize, setReqPageSize] = useState(5);

    useEffect(() => {
        if (!selfId) return;
        (async () => {
            try {
                setLoading(true);
                const [profileR, salaryR, leaveR, configsR, requestsR] = await Promise.allSettled([
                    getTeacherById(selfId),
                    getTeacherSalary(selfId),
                    getUsersLeaveBalance(selfId),
                    getAllLeaveConfigs(true),
                    getUserLeaveRequest(selfId),
                ]);

                if (profileR.status === "fulfilled") setProfile(profileR.value);

                if (salaryR.status === "fulfilled" && salaryR.value) {
                    setSalary({ ...emptySalary, ...salaryR.value });
                }

                if (leaveR.status === "fulfilled" && leaveR.value) {
                    const lb = leaveR.value;
                    setLeave({
                        totalAllocated: lb.totalAllocated ?? lb.allocated ?? 0,
                        used: lb.used ?? lb.usedDays ?? 0,
                        remaining: lb.remaining ?? lb.balance ?? 0,
                        pending: lb.pending ?? lb.pendingDays ?? 0,
                    });
                } else if (leaveR.status === "rejected") {
                    toast.error(leaveR.reason?.message || "Failed to load leave balance");
                }

                if (configsR.status === "fulfilled") {
                    const list = Array.isArray(configsR.value?.data) ? configsR.value.data
                        : Array.isArray(configsR.value) ? configsR.value : [];
                    setLeaveConfigs(list.filter((c) => c.isActive !== false));
                    setLeaveConfigsError(false);
                } else {
                    setLeaveConfigsError(true);
                    toast.error(configsR.reason?.message || "Failed to load configured leave types");
                }

                if (requestsR.status === "fulfilled") {
                    const list = Array.isArray(requestsR.value?.data) ? requestsR.value.data
                        : Array.isArray(requestsR.value) ? requestsR.value : [];
                    // Most recent first
                    list.sort((a, b) => new Date(b.fromDate || b.createdAt || 0) - new Date(a.fromDate || a.createdAt || 0));
                    setLeaveRequests(list);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [selfId]);

    useEffect(() => {
        if (!selfId) return;
        (async () => {
            try {
                setLoadingAttendance(true);
                const data = await getUserMonthlyAttendance({ userId: selfId, userType, year, month: month + 1 });
                setAttendance(normalizeMonthly(data));
            } catch (err) {
                toast.error(err.message || "Failed to load attendance for this month");
                setAttendance({ byDate: {}, summary: {} });
            } finally {
                setLoadingAttendance(false);
            }
        })();
    }, [selfId, userType, month, year]);

    // Reset to page 1 whenever the underlying data or page size changes
    useEffect(() => {
        setReqPage(1);
    }, [leaveRequests, reqPageSize]);

    // ── Per-leave-type balance, computed from configs + this user's requests ──
    const leaveBreakdown = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return leaveConfigs.map((cfg) => {
            const matching = leaveRequests.filter(
                (r) => (r.leaveType || "").toLowerCase() === (cfg.leaveType || "").toLowerCase()
                    && new Date(r.fromDate || r.createdAt || 0).getFullYear() === currentYear
            );
            const used = matching
                .filter((r) => (r.status || "").toUpperCase() === "APPROVED")
                .reduce((sum, r) => sum + extractRequestDays(r), 0);
            const pending = matching
                .filter((r) => (r.status || "").toUpperCase() === "PENDING")
                .reduce((sum, r) => sum + extractRequestDays(r), 0);
            const allocated = Number(cfg.allocatedDays) || 0;
            return {
                id: cfg.id,
                leaveType: cfg.leaveType,
                isPaid: cfg.isPaid,
                halfDayAllowed: cfg.halfDayAllowed,
                allocated,
                used,
                pending,
                remaining: Math.max(allocated - used, 0),
            };
        });
    }, [leaveConfigs, leaveRequests]);

    const leaveTotals = useMemo(
        () =>
            leaveBreakdown.reduce(
                (acc, lt) => ({
                    allocated: acc.allocated + lt.allocated,
                    used: acc.used + lt.used,
                    remaining: acc.remaining + lt.remaining,
                    pending: acc.pending + lt.pending,
                }),
                { allocated: 0, used: 0, remaining: 0, pending: 0 }
            ),
        [leaveBreakdown]
    );

    // ── Leave requests — paginated slice ────────────────────────────────
    const reqTotalPages = Math.max(1, Math.ceil(leaveRequests.length / reqPageSize));
    const pagedRequests = useMemo(() => {
        const start = (reqPage - 1) * reqPageSize;
        return leaveRequests.slice(start, start + reqPageSize);
    }, [leaveRequests, reqPage, reqPageSize]);

    // ── Salary breakdown ───────────────────────────────────────────────────
    const allowanceRows = ALLOWANCE_KEYS.filter(([key]) => Number(salary[key]) > 0);
    const deductionRows = DEDUCTION_KEYS.filter(([key]) => Number(salary[key]) > 0);
    const allowanceTotal = allowanceRows.reduce((sum, [key]) => sum + Number(salary[key]), 0);
    const deductionTotal = deductionRows.reduce((sum, [key]) => sum + Number(salary[key]), 0);

    const unpaidDaysThisMonth = attendance.summary?.ABSENT || 0;
    const leaveDeductionEstimate = (Number(salary.leaveDeductionPerDay) || 0) * unpaidDaysThisMonth;

    const baseNet = (Number(salary.baseSalary) || 0) + (Number(salary.bonus) || 0) + allowanceTotal - deductionTotal;
    const estimatedNet = baseNet - leaveDeductionEstimate;
    const displayName = profile?.name || currentUser?.name || "Your";
    const designation = profile?.designation || (userType === "TEACHER" ? "Teacher" : "Staff");

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const calendarCells = useMemo(() => {
        const cells = Array(firstWeekday).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            cells.push({ day: d, status: attendance.byDate[dateKey] || null, dateKey });
        }
        return cells;
    }, [firstWeekday, daysInMonth, year, month, attendance]);

    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    const goPrevMonth = () => {
        if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
    };
    const goNextMonth = () => {
        if (isCurrentMonth) return;
        if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
    };

    const handleDownloadSlip = async () => {
        setDownloading(true);
        // TODO: replace with downloadSalarySlip(selfId, month + 1, year) once a slip endpoint exists
        setTimeout(() => setDownloading(false), 800);
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-2 sm:py-4">
            {/* Header */}
            <div className="mb-4 sm:mb-6 flex items-start justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        My Payroll
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
                        {displayName} · {designation} — salary, leave balance, and attendance for payroll.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Visible to you only
                </div>
            </div>

            {/* ── Salary breakdown ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Salary Breakdown</h2>
                </div>

                {baseNet === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-lg">
                        No salary structure configured yet. Contact your school admin.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                            <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-2">Earnings</p>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600">Base Salary</span>
                                    <span className="font-medium text-gray-900">₹{Number(salary.baseSalary).toLocaleString()}</span>
                                </div>
                                {Number(salary.bonus) > 0 && (
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">Bonus</span>
                                        <span className="font-medium text-gray-900">₹{Number(salary.bonus).toLocaleString()}</span>
                                    </div>
                                )}
                                {allowanceRows.map(([key, label]) => (
                                    <div key={key} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">{label}</span>
                                        <span className="font-medium text-gray-900">₹{Number(salary[key]).toLocaleString()}</span>
                                    </div>
                                ))}
                                {allowanceRows.length === 0 && (
                                    <p className="text-xs text-gray-400">No allowances configured</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-2">Deductions</p>
                            <div className="space-y-1.5">
                                {deductionRows.map(([key, label]) => (
                                    <div key={key} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">{label}</span>
                                        <span className="font-medium text-red-600">-₹{Number(salary[key]).toLocaleString()}</span>
                                    </div>
                                ))}
                                {Number(salary.leaveDeductionPerDay) > 0 && (
                                    <div className="flex justify-between text-xs sm:text-sm pt-1.5 mt-1.5 border-t border-dashed border-gray-200">
                                        <span className="text-gray-600">
                                            Unpaid Leave ({unpaidDaysThisMonth} day{unpaidDaysThisMonth === 1 ? "" : "s"} this month)
                                        </span>
                                        <span className="font-medium text-red-600">-₹{leaveDeductionEstimate.toLocaleString()}</span>
                                    </div>
                                )}
                                {deductionRows.length === 0 && Number(salary.leaveDeductionPerDay) === 0 && (
                                    <p className="text-xs text-gray-400">No deductions configured</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3.5 sm:p-4 flex flex-col justify-center">
                            <p className="text-[11px] sm:text-xs text-blue-700 uppercase tracking-wide mb-1">Est. Net Pay</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-700">
                                ₹{estimatedNet.toLocaleString()}
                                <span className="text-xs font-normal text-blue-500 ml-1">
                                    {salary.salaryType === "PER_DAY" ? "/day" : "/month"}
                                </span>
                            </p>
                            <p className="text-[11px] text-blue-500 mt-1.5 flex items-start gap-1">
                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                Earnings − fixed deductions − this month's unpaid leave. Final payroll may vary slightly.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Leave balance by type ───────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 mt-4 sm:mt-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Balance</h2>
                            <p className="text-xs text-gray-500">
                                {leaveConfigs.length > 0
                                    ? `${leaveConfigs.length} leave type${leaveConfigs.length === 1 ? "" : "s"} configured for ${new Date().getFullYear()}`
                                    : "By leave type, this calendar year"}
                            </p>
                        </div>
                    </div>

                    {leaveBreakdown.length > 0 && (
                        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <span className="text-gray-500">Total Allocated: <strong className="text-gray-900">{leaveTotals.allocated}</strong></span>
                            <span className="text-gray-500">Used: <strong className="text-gray-900">{leaveTotals.used}</strong></span>
                            <span className="text-gray-500">Remaining: <strong className="text-green-600">{leaveTotals.remaining}</strong></span>
                        </div>
                    )}
                </div>

                {leaveConfigsError ? (
                    <p className="text-sm text-red-500 text-center py-8 border border-dashed border-red-200 rounded-lg bg-red-50">
                        Couldn't load your school's leave type configuration. Try refreshing, or contact your admin.
                    </p>
                ) : leaveBreakdown.length === 0 ? (
                    // Fallback to the aggregate balance endpoint only if no per-type
                    // configs came back at all (e.g. school hasn't configured any yet).
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Allocated</span>
                            <span className="font-semibold text-gray-900">{leave.totalAllocated} days</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Used</span>
                            <span className="font-semibold text-gray-900">{leave.used} days</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Pending Approval</span>
                            <span className="font-semibold text-amber-600">{leave.pending} day(s)</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm pt-1 border-t border-gray-100">
                            <span className="text-gray-900 font-medium">Remaining</span>
                            <span className="font-bold text-green-600">{leave.remaining} days</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {leaveBreakdown.map((lt) => {
                            const pct = lt.allocated > 0 ? Math.min((lt.used / lt.allocated) * 100, 100) : 0;
                            return (
                                <div key={lt.id} className="border border-gray-200 rounded-lg p-3.5 sm:p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{lt.leaveType}</p>
                                        {!lt.isPaid && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 shrink-0">Unpaid</span>
                                        )}
                                    </div>

                                    {lt.allocated > 0 ? (
                                        <>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-1 text-center">
                                                <div>
                                                    <p className="text-sm sm:text-base font-bold text-gray-900">{lt.allocated}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Allocated</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm sm:text-base font-bold text-gray-700">{lt.used}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Used</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm sm:text-base font-bold text-green-600">{lt.remaining}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Left</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-[11px] sm:text-xs text-gray-500">{lt.used} taken this year (no yearly cap)</p>
                                    )}

                                    {lt.pending > 0 && (
                                        <p className="text-[11px] sm:text-xs text-amber-600 mt-2 pt-2 border-t border-gray-100">
                                            {lt.pending} day(s) pending approval
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Monthly attendance ──────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 mt-4 sm:mt-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Monthly Attendance</h2>
                            <p className="text-xs text-gray-500">Feeds directly into payroll for the month</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button type="button" onClick={goPrevMonth} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 w-28 sm:w-32 text-center">
                            {MONTHS[month]} {year}
                        </span>
                        <button
                            type="button"
                            onClick={goNextMonth}
                            disabled={isCurrentMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {loadingAttendance ? (
                    <p className="text-sm text-gray-400 text-center py-10">Loading attendance…</p>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {["PRESENT", "ABSENT", "ON_LEAVE", "HALF_DAY", "NOT_MARKED"].map((key) => {
                                const meta = STATUS_META[key];
                                const count = attendance.summary?.[key] || 0;
                                return (
                                    <div key={key} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-medium ${meta.chip}`}>
                                        <meta.Icon className="w-3.5 h-3.5" /> {meta.label}: {count}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-1">
                            {WEEKDAYS.map((d) => (
                                <div key={d} className="text-[10px] sm:text-xs font-medium text-gray-400 py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                            {calendarCells.map((cell, idx) => {
                                if (!cell) return <div key={`empty-${idx}`} />;
                                const meta = STATUS_META[cell.status || "NOT_MARKED"];
                                const isFuture = new Date(cell.dateKey) > now;
                                return (
                                    <div
                                        key={cell.dateKey}
                                        title={`${cell.dateKey}: ${meta.label}`}
                                        className={`aspect-square rounded-md sm:rounded-lg border flex flex-col items-center justify-center text-[10px] sm:text-xs ${
                                            isFuture ? "border-gray-100 text-gray-300" : `${meta.chip} border`
                                        }`}
                                    >
                                        <span className="font-medium">{cell.day}</span>
                                        {!isFuture && cell.status && (
                                            <span className={`w-1 h-1 rounded-full mt-0.5 ${meta.dot}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            See a mismatch? Report it to your admin before the payroll cycle closes for the month.
                        </p>
                    </>
                )}
            </div>

            {/* ── Leave requests (paginated) ──────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 mt-4 sm:mt-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Requests</h2>
                            <p className="text-xs text-gray-500">{leaveRequests.length} total request{leaveRequests.length === 1 ? "" : "s"}</p>
                        </div>
                    </div>

                    {leaveRequests.length > 0 && (
                        <select
                            value={reqPageSize}
                            onChange={(e) => setReqPageSize(Number(e.target.value))}
                            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {REQUESTS_PAGE_SIZE_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n} / page</option>
                            ))}
                        </select>
                    )}
                </div>

                {leaveRequests.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                        No leave requests filed yet
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full min-w-[520px] text-xs sm:text-sm">
                                <thead>
                                <tr className="text-left text-gray-500 uppercase text-[11px] tracking-wide border-b border-gray-200">
                                    <th className="py-2.5 px-4 sm:px-2 font-medium">Leave Type</th>
                                    <th className="py-2.5 px-4 sm:px-2 font-medium">From</th>
                                    <th className="py-2.5 px-4 sm:px-2 font-medium">To</th>
                                    <th className="py-2.5 px-4 sm:px-2 font-medium">Days</th>
                                    <th className="py-2.5 px-4 sm:px-2 font-medium">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pagedRequests.map((r) => {
                                    const status = (r.status || "").toUpperCase();
                                    const statusStyle =
                                        status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200"
                                            : status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200"
                                                : status === "CANCELLED" ? "bg-gray-100 text-gray-500 border-gray-200"
                                                    : "bg-amber-100 text-amber-700 border-amber-200";
                                    return (
                                        <tr key={r.id} className="border-b border-gray-100">
                                            <td className="py-3 px-4 sm:px-2 font-medium text-gray-900">{r.leaveType}</td>
                                            <td className="py-3 px-4 sm:px-2 text-gray-700">{(r.fromDate || "").slice(0, 10)}</td>
                                            <td className="py-3 px-4 sm:px-2 text-gray-700">{(r.toDate || "").slice(0, 10)}</td>
                                            <td className="py-3 px-4 sm:px-2 text-gray-700">{extractRequestDays(r)}</td>
                                            <td className="py-3 px-4 sm:px-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle}`}>
                                                        {r.status || "—"}
                                                    </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pager */}
                        <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                            <p className="text-[11px] sm:text-xs text-gray-500">
                                Showing {(reqPage - 1) * reqPageSize + 1}–{Math.min(reqPage * reqPageSize, leaveRequests.length)} of {leaveRequests.length}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setReqPage((p) => Math.max(1, p - 1))}
                                    disabled={reqPage === 1}
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs sm:text-sm font-medium text-gray-700 px-1">
                                    Page {reqPage} of {reqTotalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setReqPage((p) => Math.min(reqTotalPages, p + 1))}
                                    disabled={reqPage === reqTotalPages}
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Salary slip download ────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 mt-4 sm:mt-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Download Salary Slip</h2>
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
                        {[year - 1, year].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleDownloadSlip}
                        disabled={downloading}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Download className="w-4 h-4" /> {downloading ? "Preparing…" : "Download"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherPayrollSelfView;
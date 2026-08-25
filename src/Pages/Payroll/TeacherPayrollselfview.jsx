import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    Wallet, CalendarDays, CheckCircle2, AlertCircle, Download, FileText, ShieldCheck,
    ChevronLeft, ChevronRight, XCircle, Clock, Umbrella, Info, ClipboardList, RefreshCw,
} from "lucide-react";
import {getCurrUserDetails} from "../../utils/getCurrUserDetails/index.js";
import {getUserId} from "../../utils/getCurrUserDetails/GetCurrUserDetails.js";
import { isTeacher } from "../../utils/authSession";
import { getTeacherById, getTeacherSalary } from "../../Api/Teachers/TeachersAPI";
// TODO: confirm these exist / are named this way in your Staff API module.
// Until wired up, staff users fall back to the teacher endpoints below so the
// page won't crash — but the profile/salary record will be wrong for staff.
let getStaffById, getStaffSalary;
try {
    ({ getStaffById, getStaffSalary } = require("../../Api/Staff/StaffAPI"));
} catch (e) {
    getStaffById = null;
    getStaffSalary = null;
}
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

// ── Normalizes GET /api/leave/user/{id}/balance into a flat per-type list.
// Real response shape (confirmed from network tab):
//   {
//     success, message,
//     data: {
//       userId, year,
//       leaveBalances: [
//         { leaveType, leaveName, annualLimit, daysUsed, daysAvailable,
//           carryForwardAllowed, maxCarryForwardDays },
//         ...
//       ],
//       totalDaysUsed, totalDaysAvailable
//     },
//     timestamp
//   }
// getUsersLeaveBalance() returns the raw parsed body (res.json()), so the
// array we want lives at raw.data.leaveBalances.
const normalizeLeaveBalanceList = (raw) => {
    if (!raw) return null;
    const payload = raw.data || raw;
    const list = Array.isArray(payload.leaveBalances) ? payload.leaveBalances
        : Array.isArray(payload) ? payload
            : Array.isArray(payload.balances) ? payload.balances
                : null;
    if (!list) return null;
    return list.map((b) => ({
        leaveType: b.leaveType,
        leaveName: b.leaveName || b.leaveType,
        allocated: Number(b.annualLimit ?? 0),
        used: Number(b.daysUsed ?? 0),
        remaining: Number(b.daysAvailable ?? 0),
        carryForwardAllowed: !!b.carryForwardAllowed,
        maxCarryForwardDays: Number(b.maxCarryForwardDays ?? 0),
    }));
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
    // Per-leave-type balances straight from GET /leave/user/{id}/balance —
    // this is the authoritative source now, not leaveConfigs.
    const [leaveBalanceByType, setLeaveBalanceByType] = useState([]);
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

    const loadPayrollData = async () => {
        if (!selfId) return;
        try {
            setLoading(true);

            const profileFetcher = userType === "TEACHER"
                ? getTeacherById(selfId)
                : (getStaffById ? getStaffById(selfId) : getTeacherById(selfId));
            const salaryFetcher = userType === "TEACHER"
                ? getTeacherSalary(selfId)
                : (getStaffSalary ? getStaffSalary(selfId) : getTeacherSalary(selfId));

            const [profileR, salaryR, leaveR, configsR, requestsR] = await Promise.allSettled([
                profileFetcher,
                salaryFetcher,
                getUsersLeaveBalance(selfId),
                getAllLeaveConfigs(true),
                getUserLeaveRequest(selfId),
            ]);

            if (profileR.status === "fulfilled") setProfile(profileR.value);
            else if (profileR.status === "rejected") {
                toast.error(profileR.reason?.message || "Failed to load your profile");
            }

            if (salaryR.status === "fulfilled" && salaryR.value) {
                setSalary({ ...emptySalary, ...salaryR.value });
            } else if (salaryR.status === "rejected") {
                toast.error(salaryR.reason?.message || "Failed to load salary details");
            }

            if (leaveR.status === "fulfilled" && leaveR.value) {
                const perType = normalizeLeaveBalanceList(leaveR.value);
                if (perType && perType.length > 0) {
                    setLeaveBalanceByType(perType);
                    const payload = leaveR.value.data || leaveR.value;
                    setLeave({
                        totalAllocated: perType.reduce((s, b) => s + b.allocated, 0),
                        used: Number(payload.totalDaysUsed ?? perType.reduce((s, b) => s + b.used, 0)),
                        remaining: Number(payload.totalDaysAvailable ?? perType.reduce((s, b) => s + b.remaining, 0)),
                        pending: 0,
                    });
                } else {
                    const lb = leaveR.value.data || leaveR.value;
                    setLeave({
                        totalAllocated: lb.totalAllocated ?? lb.allocated ?? 0,
                        used: lb.used ?? lb.usedDays ?? lb.totalDaysUsed ?? 0,
                        remaining: lb.remaining ?? lb.balance ?? lb.totalDaysAvailable ?? 0,
                        pending: lb.pending ?? lb.pendingDays ?? 0,
                    });
                }
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
            }

            if (requestsR.status === "fulfilled") {
                const list = Array.isArray(requestsR.value?.data) ? requestsR.value.data
                    : Array.isArray(requestsR.value) ? requestsR.value : [];
                list.sort((a, b) => new Date(b.fromDate || b.createdAt || 0) - new Date(a.fromDate || a.createdAt || 0));
                setLeaveRequests(list);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayrollData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selfId, userType]);

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

    // ── Per-leave-type balance. Built primarily from the /balance endpoint
    // (leaveBalanceByType), enriched with isPaid/halfDayAllowed metadata from
    // leaveConfigs when a matching config exists. Only falls back to computing
    // allocated/used/remaining from configs+requests if the balance endpoint
    // returned nothing at all. ──────────────────────────────────────────────
    const leaveBreakdown = useMemo(() => {
        const currentYear = new Date().getFullYear();

        const pendingForType = (leaveType) => {
            const matching = leaveRequests.filter(
                (r) => (r.leaveType || "").toLowerCase() === (leaveType || "").toLowerCase()
                    && new Date(r.fromDate || r.createdAt || 0).getFullYear() === currentYear
            );
            return matching
                .filter((r) => (r.status || "").toUpperCase() === "PENDING")
                .reduce((sum, r) => sum + extractRequestDays(r), 0);
        };

        if (leaveBalanceByType.length > 0) {
            return leaveBalanceByType.map((b) => {
                const cfg = leaveConfigs.find(
                    (c) => (c.leaveType || "").toLowerCase() === (b.leaveType || "").toLowerCase()
                );
                return {
                    id: b.leaveType,
                    leaveType: b.leaveName || b.leaveType,
                    isPaid: cfg?.isPaid ?? cfg?.paid ?? true,
                    halfDayAllowed: cfg?.halfDayAllowed ?? true,
                    allocated: b.allocated,
                    used: b.used,
                    remaining: b.remaining,
                    pending: pendingForType(b.leaveType),
                    carryForwardAllowed: b.carryForwardAllowed,
                    maxCarryForwardDays: b.maxCarryForwardDays,
                };
            });
        }

        // Fallback: balance API returned nothing usable — recompute from
        // configs + this user's approved requests (best-effort only).
        return leaveConfigs.map((cfg) => {
            const matching = leaveRequests.filter(
                (r) => (r.leaveType || "").toLowerCase() === (cfg.leaveType || "").toLowerCase()
                    && new Date(r.fromDate || r.createdAt || 0).getFullYear() === currentYear
            );
            const used = matching
                .filter((r) => (r.status || "").toUpperCase() === "APPROVED")
                .reduce((sum, r) => sum + extractRequestDays(r), 0);
            const allocated = Number(cfg.allocatedDays ?? cfg.allocated ?? cfg.days) || 0;
            return {
                id: cfg.id,
                leaveType: cfg.leaveType,
                isPaid: cfg.isPaid ?? cfg.paid ?? true,
                halfDayAllowed: cfg.halfDayAllowed,
                allocated,
                used,
                pending: pendingForType(cfg.leaveType),
                remaining: Math.max(allocated - used, 0),
            };
        });
    }, [leaveConfigs, leaveRequests, leaveBalanceByType]);

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
        // Pad the trailing end of the grid too, so every month renders a full
        // set of 7-day rows instead of an uneven, oddly-cut-off last row.
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [firstWeekday, daysInMonth, year, month, attendance]);

    const isToday = (dateKey) => {
        const d = new Date(dateKey);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    };

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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
            {/* Header */}
            <div className="mb-5 sm:mb-7 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        My Payroll
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1.5">
                        {displayName} · {designation} — salary, leave balance, and attendance for payroll.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={loadPayrollData}
                        title="Refresh"
                        className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Visible to you only
                    </div>
                </div>
            </div>

            <div className="space-y-5 sm:space-y-7">
                {/* ── Salary breakdown ─────────────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-7">
                    <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Salary Breakdown</h2>
                    </div>

                    {baseNet === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-lg">
                            No salary structure configured yet. Contact your school admin.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7">
                            <div>
                                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">Earnings</p>
                                <div className="space-y-2">
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
                                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">Deductions</p>
                                <div className="space-y-2">
                                    {deductionRows.map(([key, label]) => (
                                        <div key={key} className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-gray-600">{label}</span>
                                            <span className="font-medium text-red-600">-₹{Number(salary[key]).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {Number(salary.leaveDeductionPerDay) > 0 && (
                                        <div className="flex justify-between text-xs sm:text-sm pt-2 mt-2 border-t border-dashed border-gray-200">
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

                            <div className="bg-blue-50 rounded-lg p-4 sm:p-5 flex flex-col justify-center">
                                <p className="text-[11px] sm:text-xs text-blue-700 uppercase tracking-wide mb-1.5 font-medium">Est. Net Pay</p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-700">
                                    ₹{estimatedNet.toLocaleString()}
                                    <span className="text-xs font-normal text-blue-500 ml-1">
                                        {salary.salaryType === "PER_DAY" ? "/day" : "/month"}
                                    </span>
                                </p>
                                <p className="text-[11px] text-blue-500 mt-2 flex items-start gap-1.5">
                                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                    Earnings − fixed deductions − this month's unpaid leave. Final payroll may vary slightly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Leave balance by type ───────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-7">
                    <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Balance</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {leaveBreakdown.length > 0
                                        ? `${leaveBreakdown.length} leave type${leaveBreakdown.length === 1 ? "" : "s"} · ${new Date().getFullYear()}`
                                        : "By leave type, this calendar year"}
                                </p>
                            </div>
                        </div>

                        {leaveBreakdown.length > 0 && (
                            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
                                <span className="text-gray-500">Allocated: <strong className="text-gray-900">{leaveTotals.allocated}</strong></span>
                                <span className="text-gray-500">Used: <strong className="text-gray-900">{leaveTotals.used}</strong></span>
                                <span className="text-gray-500">Remaining: <strong className="text-green-600">{leaveTotals.remaining}</strong></span>
                            </div>
                        )}
                    </div>

                    {leaveConfigsError && leaveBreakdown.length === 0 ? (
                        <p className="text-sm text-red-500 text-center py-8 border border-dashed border-red-200 rounded-lg bg-red-50">
                            Couldn't load your leave balance. Try refreshing, or contact your admin.
                        </p>
                    ) : leaveBreakdown.length === 0 ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Allocated</span>
                                <span className="font-semibold text-gray-900">{leave.totalAllocated} days</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Used</span>
                                <span className="font-semibold text-gray-900">{leave.used} days</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm pt-1 border-t border-gray-100">
                                <span className="text-gray-900 font-medium">Remaining</span>
                                <span className="font-bold text-green-600">{leave.remaining} days</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {leaveBreakdown.map((lt) => {
                                const pct = lt.allocated > 0 ? Math.min((lt.used / lt.allocated) * 100, 100) : 0;
                                return (
                                    <div key={lt.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                        <div className="flex items-center justify-between mb-3 gap-2">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{lt.leaveType}</p>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {lt.carryForwardAllowed && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                        Carry-fwd
                                                    </span>
                                                )}
                                                {!lt.isPaid && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">Unpaid</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
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

                                        {lt.pending > 0 && (
                                            <p className="text-[11px] sm:text-xs text-amber-600 mt-3 pt-3 border-t border-gray-100">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-7">
                    <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Monthly Attendance</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Feeds directly into payroll for the month</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
                            <button type="button" onClick={goPrevMonth} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:shadow-sm transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs sm:text-sm font-medium text-gray-900 w-28 sm:w-32 text-center">
                                {MONTHS[month]} {year}
                            </span>
                            <button
                                type="button"
                                onClick={goNextMonth}
                                disabled={isCurrentMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
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
                                        <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-medium ${meta.chip}`}>
                                            <meta.Icon className="w-3.5 h-3.5" /> {meta.label}: {count}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Calendar */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                    {WEEKDAYS.map((d) => (
                                        <div key={d} className="text-[11px] sm:text-xs font-semibold text-gray-500 text-center py-2.5">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-gray-100">
                                    {calendarCells.map((cell, idx) => {
                                        if (!cell) return <div key={`empty-${idx}`} className="bg-gray-50 min-h-[3.25rem] sm:min-h-[4rem]" />;
                                        const meta = STATUS_META[cell.status || "NOT_MARKED"];
                                        const isFuture = new Date(cell.dateKey) > now;
                                        const today = isToday(cell.dateKey);
                                        return (
                                            <div
                                                key={cell.dateKey}
                                                title={`${cell.dateKey}: ${meta.label}`}
                                                className={`min-h-[3.25rem] sm:min-h-[4rem] flex flex-col items-center justify-center gap-1 text-xs sm:text-sm bg-white relative ${
                                                    isFuture ? "text-gray-300" : "text-gray-700"
                                                } ${today ? "ring-2 ring-inset ring-blue-500" : ""}`}
                                            >
                                                <span className={`font-medium ${today ? "text-blue-600" : ""}`}>{cell.day}</span>
                                                {!isFuture && cell.status && (
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium border ${meta.chip}`}>
                                                        {meta.label}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                See a mismatch? Report it to your admin before the payroll cycle closes for the month.
                            </p>
                        </>
                    )}
                </div>

                {/* ── Leave requests (paginated) ──────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-7">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Requests</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{leaveRequests.length} total request{leaveRequests.length === 1 ? "" : "s"}</p>
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
                            <div className="overflow-x-auto -mx-5 sm:mx-0 border-t border-gray-100 sm:border-t-0">
                                <table className="w-full min-w-[520px] text-xs sm:text-sm">
                                    <thead>
                                    <tr className="text-left text-gray-500 uppercase text-[11px] tracking-wide border-b border-gray-200">
                                        <th className="py-3 px-5 sm:px-2 font-medium">Leave Type</th>
                                        <th className="py-3 px-5 sm:px-2 font-medium">From</th>
                                        <th className="py-3 px-5 sm:px-2 font-medium">To</th>
                                        <th className="py-3 px-5 sm:px-2 font-medium">Days</th>
                                        <th className="py-3 px-5 sm:px-2 font-medium">Status</th>
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
                                                <td className="py-3.5 px-5 sm:px-2 font-medium text-gray-900">{r.leaveType}</td>
                                                <td className="py-3.5 px-5 sm:px-2 text-gray-700">{(r.fromDate || "").slice(0, 10)}</td>
                                                <td className="py-3.5 px-5 sm:px-2 text-gray-700">{(r.toDate || "").slice(0, 10)}</td>
                                                <td className="py-3.5 px-5 sm:px-2 text-gray-700">{extractRequestDays(r)}</td>
                                                <td className="py-3.5 px-5 sm:px-2">
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
                            <div className="flex items-center justify-between flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-7 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
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
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Download className="w-4 h-4" /> {downloading ? "Preparing…" : "Download"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherPayrollSelfView;
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
    X, Download, Calendar, Users, CheckCircle2,
    Maximize2, Minimize2, ChevronDown, FileSpreadsheet, Loader2, RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import { allUserFilter } from "../../Api/StaffManagement/UserManagementAPI";
import { getTeachers } from "../../Api/Teachers/TeachersAPI";
import { allAttendanceDetails } from "../../Api/Attendance/AttendanceApi";
import { AVATAR_INITIALS_COLORS } from "../../Constants/StringConstants/AttendanceConstants";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const getInitials = (fullName = "") => {
    const parts = (fullName || "").trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColor = (initials = "??") => {
    const colors = AVATAR_INITIALS_COLORS || [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-amber-500"
    ];
    return colors[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % colors.length];
};

const mapStatusToCode = (statusStr) => {
    if (!statusStr) return null;
    const s = String(statusStr).toUpperCase();
    if (s.includes("PRESENT") || s === "P") return "P";
    if (s.includes("LATE") || s === "L") return "L";
    if (s.includes("ABSENT") || s === "A") return "A";
    if (s.includes("LEAVE") || s === "ON_LEAVE" || s === "LV") return "LV";
    return null;
};

export default function MonthlyStaffAttendanceSheetModal({
    isOpen,
    onClose,
    roles = [],
}) {
    const today = new Date();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [monthlyDataMap, setMonthlyDataMap] = useState({});
    const [staffList, setStaffList] = useState([]);
    const lastFetchedKeyRef = useRef("");

    // Exact days in the SELECTED month only (28, 29, 30, or 31)
    const daysInMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth, 0).getDate();
    }, [selectedYear, selectedMonth]);

    const daysArray = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [daysInMonth]);

    const isSundayDate = (day) => {
        return new Date(selectedYear, selectedMonth - 1, day).getDay() === 0;
    };

    // Parallel batch fetch for ALL 63 Staff + Teachers of the selected month
    const fetchMonthlyStaffRoster = useCallback(async (force = false) => {
        if (!isOpen) return;

        const currentKey = `${selectedRole}_${selectedYear}_${selectedMonth}`;
        if (!force && lastFetchedKeyRef.current === currentKey) {
            return;
        }

        setLoading(true);
        lastFetchedKeyRef.current = currentKey;

        try {
            const staffProfiles = {};
            const attendanceMap = {};

            // 1. Fetch Staff and Teachers in Parallel to get all 63 members
            const fetchPromises = [];

            if (selectedRole === "ALL" || selectedRole !== "TEACHER") {
                const userFilters = {};
                if (selectedRole !== "ALL") userFilters.role = selectedRole;
                fetchPromises.push(allUserFilter(userFilters, 0, 5000, "firstName,asc"));
            } else {
                fetchPromises.push(Promise.resolve({ data: [] }));
            }

            if (selectedRole === "ALL" || selectedRole === "TEACHER") {
                fetchPromises.push(getTeachers(0, 5000));
            } else {
                fetchPromises.push(Promise.resolve({ data: [] }));
            }

            const [usersRes, teachersRes] = await Promise.all(fetchPromises);
            const rawUsers = usersRes?.data || [];
            const rawTeachers = teachersRes?.data || [];

            // Add General Staff
            rawUsers.forEach((u) => {
                const uid = String(u.id);
                staffProfiles[uid] = {
                    id: uid,
                    name: u.fullName || u.name || "Unknown",
                    empCode: u.employeeCode || u.empCode || "—",
                    role: Array.isArray(u.roles) ? u.roles[0] : (u.roles || u.role || "Staff"),
                    initials: getInitials(u.fullName || u.name),
                };
                attendanceMap[uid] = {};
            });

            // Add Teachers
            rawTeachers.forEach((t) => {
                const teacherUid = String(t.userId || t.id);
                if (!staffProfiles[teacherUid]) {
                    staffProfiles[teacherUid] = {
                        id: teacherUid,
                        name: t.fullName || t.name || "Unknown",
                        empCode: t.employeeCode || "—",
                        role: t.designation || "Teacher",
                        initials: getInitials(t.fullName || t.name),
                    };
                }
                if (!attendanceMap[teacherUid]) {
                    attendanceMap[teacherUid] = {};
                }
            });

            // 2. Fetch Day-wise Attendance for the month
            const dateKeys = Array.from({ length: daysInMonth }, (_, i) => {
                const d = String(i + 1).padStart(2, "0");
                const m = String(selectedMonth).padStart(2, "0");
                return `${selectedYear}-${m}-${d}`;
            });

            const responses = await Promise.allSettled(
                dateKeys.map((dateStr) =>
                    allAttendanceDetails({
                        attendanceDate: dateStr,
                        role: selectedRole !== "ALL" ? selectedRole : undefined,
                        size: 5000,
                    })
                )
            );

            responses.forEach((res, index) => {
                if (res.status === "fulfilled" && res.value) {
                    const raw = res.value;
                    const records = Array.isArray(raw?.data) ? raw.data : (raw?.attendanceList || []);
                    const attDateKey = dateKeys[index];

                    records.forEach((rec) => {
                        const recUid = String(rec.userId || rec.id);
                        if (!staffProfiles[recUid]) {
                            staffProfiles[recUid] = {
                                id: recUid,
                                name: rec.userName || rec.name || "Unknown",
                                empCode: rec.employeeCode || rec.empCode || "—",
                                role: rec.userType || "Staff",
                                initials: getInitials(rec.userName || rec.name),
                            };
                        }
                        if (!attendanceMap[recUid]) {
                            attendanceMap[recUid] = {};
                        }

                        const statusCode = mapStatusToCode(rec.status);
                        if (statusCode) {
                            attendanceMap[recUid][attDateKey] = statusCode;
                        }
                    });
                }
            });

            setMonthlyDataMap(attendanceMap);
            setStaffList(Object.values(staffProfiles));
        } catch (err) {
            console.error("Staff monthly register fetch error:", err);
            toast.error(err.message || "Failed to load monthly staff attendance");
        } finally {
            setLoading(false);
        }
    }, [isOpen, selectedRole, selectedMonth, selectedYear, daysInMonth]);

    useEffect(() => {
        if (isOpen) {
            fetchMonthlyStaffRoster(false);
        }
    }, [isOpen, selectedMonth, selectedYear, selectedRole, fetchMonthlyStaffRoster]);

    const getDayStatus = (staffId, day) => {
        const dayStr = String(day).padStart(2, "0");
        const monthStr = String(selectedMonth).padStart(2, "0");
        const cellDateKey = `${selectedYear}-${monthStr}-${dayStr}`;

        const sid = String(staffId);
        if (monthlyDataMap[sid] && monthlyDataMap[sid][cellDateKey]) {
            return monthlyDataMap[sid][cellDateKey];
        }

        if (isSundayDate(day)) {
            return "SUN";
        }

        return "-";
    };

    const filteredStaff = useMemo(() => {
        return staffList.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(s.empCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(s.role || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [staffList, searchTerm]);

    const dailyStats = useMemo(() => {
        return daysArray.map((d) => {
            if (isSundayDate(d)) return { isSun: true, p: 0 };
            let p = 0;
            let l = 0;
            let a = 0;
            let lv = 0;
            staffList.forEach((s) => {
                const st = getDayStatus(s.id, d);
                if (st === "P") p++;
                else if (st === "L") l++;
                else if (st === "A") a++;
                else if (st === "LV") lv++;
            });
            return { isSun: false, p, l, a, lv, totalMarked: p + l + a + lv };
        });
    }, [daysArray, staffList, monthlyDataMap, selectedYear, selectedMonth]);

    const overallStats = useMemo(() => {
        let totalP = 0;
        let totalL = 0;
        let totalA = 0;
        let totalLV = 0;

        staffList.forEach((s) => {
            daysArray.forEach((d) => {
                const st = getDayStatus(s.id, d);
                if (st === "P") totalP++;
                else if (st === "L") totalL++;
                else if (st === "A") totalA++;
                else if (st === "LV") totalLV++;
            });
        });

        const totalWorkingDays = daysArray.filter((d) => !isSundayDate(d)).length;
        const totalPossible = (staffList.length * totalWorkingDays) || 1;
        const avgAttendanceRate = Math.min(
            100,
            Math.round(((totalP + totalL * 0.5) / totalPossible) * 100)
        );

        return { totalP, totalL, totalA, totalLV, totalWorkingDays, avgAttendanceRate };
    }, [staffList, daysArray, monthlyDataMap, selectedYear, selectedMonth]);

    const handleExportCSV = () => {
        const monthName = MONTH_NAMES[selectedMonth - 1];
        const cell = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
        const rows = [];

        rows.push([cell("Staff & Teachers Attendance Register Sheet"), "", ""]);
        rows.push([cell("Role Filter:"), cell(selectedRole === "ALL" ? "All Staff & Teachers" : selectedRole)]);
        rows.push([cell("Month / Year:"), cell(`${monthName} ${selectedYear}`)]);
        rows.push([""]);

        const headers = [
            "#",
            "Staff Name",
            "Role",
            "Emp Code",
            ...daysArray.map((d) => `Day ${d}`),
            "Present (P)",
            "Late (L)",
            "Absent (A)",
            "Leave (LV)",
            "Attendance Rate %"
        ];
        rows.push(headers.map(cell));

        staffList.forEach((s, idx) => {
            let pCount = 0;
            let lCount = 0;
            let aCount = 0;
            let lvCount = 0;

            const dayStatuses = daysArray.map((d) => {
                const st = getDayStatus(s.id, d);
                if (st === "P") pCount++;
                else if (st === "L") lCount++;
                else if (st === "A") aCount++;
                else if (st === "LV") lvCount++;
                return st;
            });

            const markedDays = pCount + lCount + aCount + lvCount;
            const rate = markedDays > 0 ? Math.min(100, Math.round(((pCount + lCount * 0.5) / markedDays) * 100)) : 0;

            rows.push([
                cell(idx + 1),
                cell(`${s.name} (${s.role})`),
                cell(s.role),
                cell(s.empCode),
                ...dayStatuses.map(cell),
                cell(pCount),
                cell(lCount),
                cell(aCount),
                cell(lvCount),
                cell(`${rate}%`),
            ]);
        });

        const csvContent = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Staff_AttendanceRegister_${selectedRole}_${monthName}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    const yearOptions = [selectedYear - 1, selectedYear, selectedYear + 1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-1 sm:p-3 md:p-4">
            <div
                className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-gray-300 ${isFullscreen
                    ? "w-full h-full rounded-none"
                    : "w-full max-w-[98vw] xl:max-w-[96vw] h-[94vh] max-h-[96vh]"
                    }`}
            >
                {/* ── Header Toolbar (Green Excel Theme) ── */}
                <div className="bg-[#107c41] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 shadow-md">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
                            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-bold text-sm sm:text-base md:text-lg leading-tight tracking-wide truncate">
                                    Staff Attendance Register Sheet
                                </h2>
                                <span className="bg-emerald-800 text-emerald-100 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-700 whitespace-nowrap">
                                    {selectedRole === "ALL" ? "All Staff & Teachers" : selectedRole}
                                </span>
                            </div>
                            <p className="text-[11px] text-emerald-100 truncate hidden sm:block">
                                Official Monthly Attendance Matrix • {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {/* Month Selector */}
                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-white text-gray-800 font-semibold rounded-lg pl-2.5 pr-6 py-1.5 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer shadow"
                            >
                                {MONTH_NAMES.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 top-2.5 pointer-events-none" />
                        </div>

                        {/* Year Selector */}
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-white text-gray-800 font-semibold rounded-lg pl-2.5 pr-6 py-1.5 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer shadow"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 top-2.5 pointer-events-none" />
                        </div>

                        {/* Role Filter Selector */}
                        <div className="relative">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="bg-white text-gray-800 font-semibold rounded-lg pl-2.5 pr-6 py-1.5 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer shadow"
                            >
                                <option value="ALL">All Roles</option>
                                {roles.map((r) => (
                                    <option key={r.id || r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 top-2.5 pointer-events-none" />
                        </div>

                        {/* Force Refresh */}
                        <button
                            onClick={() => fetchMonthlyStaffRoster(true)}
                            disabled={loading}
                            className="p-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Force Refresh Data"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>

                        {/* Export Excel Button */}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-600 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Export Excel</span>
                        </button>

                        {/* Fullscreen & Close */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-white hidden sm:inline-flex"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-red-600 rounded-lg transition-colors cursor-pointer text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Sub-header Stats & Search ── */}
                <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                    <div className="flex items-center gap-3 sm:gap-5 text-xs text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>Total: <strong className="text-gray-900">{staffList.length}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Working: <strong className="text-gray-900">{overallStats.totalWorkingDays}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>Avg Rate: <strong className="text-green-700 font-bold">{overallStats.avgAttendanceRate}%</strong></span>
                        </div>
                        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-200 text-[11px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">P = Present</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">L = Late</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">A = Absent</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">LV = Leave</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded border border-gray-300">SUN = Sunday</span>
                        </div>
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by name, code or role..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal shadow-xs"
                        />
                    </div>
                </div>

                {/* ── Table Container: Full Horizontal & Vertical Scroll (No Squishing) ── */}
                <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-3 md:p-4 min-h-0 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-40 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 text-[#107c41] animate-spin" />
                            <p className="text-xs font-semibold text-gray-700">Loading {MONTH_NAMES[selectedMonth - 1]} Staff Attendance Matrix ({daysInMonth} days)...</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow border border-gray-300 overflow-x-auto">
                        <div className="bg-[#f3f9f5] border-b-2 border-emerald-600 px-4 py-3 text-center min-w-max">
                            <h3 className="text-sm sm:text-base font-black text-gray-800 tracking-wide uppercase">
                                Staff & Teachers Attendance Register
                            </h3>
                            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                                Category: {selectedRole === "ALL" ? "All Staff & Teachers" : selectedRole} | Period: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                            </p>
                        </div>

                        <table className="border-collapse text-xs select-none min-w-max w-full">
                            <thead>
                                {/* Excel Column Letters */}
                                <tr className="bg-gray-100 text-gray-400 font-mono text-[10px] border-b border-gray-200">
                                    <th className="border-r border-gray-200 py-1 px-2 text-center w-12 min-w-[48px]">A</th>
                                    <th className="border-r border-gray-200 py-1 px-3 text-left w-72 min-w-[280px]">B</th>
                                    <th className="border-r border-gray-200 py-1 px-2 text-center w-28 min-w-[110px]">C</th>
                                    {daysArray.map((d, idx) => (
                                        <th key={d} className="border-r border-gray-200 py-1 text-center w-9 min-w-[36px]">
                                            {String.fromCharCode(68 + (idx % 23))}
                                        </th>
                                    ))}
                                    <th className="border-r border-gray-300 py-1 text-center w-14 min-w-[56px] bg-green-100 text-green-800 font-bold">P</th>
                                    <th className="border-r border-gray-300 py-1 text-center w-14 min-w-[56px] bg-amber-100 text-amber-800 font-bold">L</th>
                                    <th className="border-r border-gray-300 py-1 text-center w-14 min-w-[56px] bg-red-100 text-red-800 font-bold">A</th>
                                    <th className="border-r border-gray-300 py-1 text-center w-14 min-w-[56px] bg-purple-100 text-purple-800 font-bold">LV</th>
                                    <th className="py-1 text-center w-20 min-w-[76px] bg-blue-100 text-blue-800 font-bold">%</th>
                                </tr>

                                {/* Main Table Headers */}
                                <tr className="bg-gray-50 text-gray-700 font-bold border-b-2 border-gray-300">
                                    <th className="border-r border-gray-300 py-2.5 px-2 text-center w-12 min-w-[48px]">#</th>
                                    <th className="border-r border-gray-300 py-2.5 px-3 text-left w-72 min-w-[280px]">Staff Name (Role)</th>
                                    <th className="border-r border-gray-300 py-2.5 px-2 text-center w-28 min-w-[110px]">Emp Code</th>
                                    {daysArray.map((d) => {
                                        const isSun = isSundayDate(d);
                                        const dayName = new Date(selectedYear, selectedMonth - 1, d).toLocaleDateString("en-US", { weekday: "narrow" });
                                        return (
                                            <th
                                                key={d}
                                                className={`border-r border-gray-200 py-1.5 text-center w-9 min-w-[36px] ${isSun
                                                    ? "bg-red-50 text-red-600 font-bold"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                <div className="font-bold text-xs">{d}</div>
                                                <div className="text-[9px] uppercase font-normal">{dayName}</div>
                                            </th>
                                        );
                                    })}
                                    <th className="border-r border-gray-300 py-2.5 text-center w-14 min-w-[56px] bg-green-50 text-green-800 font-bold">P</th>
                                    <th className="border-r border-gray-300 py-2.5 text-center w-14 min-w-[56px] bg-amber-50 text-amber-800 font-bold">L</th>
                                    <th className="border-r border-gray-300 py-2.5 text-center w-14 min-w-[56px] bg-red-800 text-red-800 font-bold">A</th>
                                    <th className="border-r border-gray-300 py-2.5 text-center w-14 min-w-[56px] bg-purple-50 text-purple-800 font-bold">LV</th>
                                    <th className="py-2.5 text-center w-20 min-w-[76px] bg-blue-50 text-blue-800 font-bold">Rate</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 font-medium">
                                {filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={daysArray.length + 8} className="py-12 text-center text-gray-400">
                                            No staff or teacher records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((s, idx) => {
                                        let pCount = 0;
                                        let lCount = 0;
                                        let aCount = 0;
                                        let lvCount = 0;

                                        daysArray.forEach((d) => {
                                            const st = getDayStatus(s.id, d);
                                            if (st === "P") pCount++;
                                            else if (st === "L") { lCount++; pCount++; }
                                            else if (st === "A") aCount++;
                                            else if (st === "LV") lvCount++;
                                        });

                                        const markedDays = pCount + aCount + lvCount;
                                        const staffRate = markedDays > 0
                                            ? Math.min(100, Math.round((pCount / daysInMonth) * 100))
                                            : 0;

                                        return (
                                            <tr
                                                key={s.id}
                                                className={`hover:bg-emerald-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#fcfdfc]"
                                                    }`}
                                            >
                                                <td className="border-r border-gray-200 py-2 px-2 text-center text-gray-500 font-mono text-xs w-12 min-w-[48px]">
                                                    {idx + 1}
                                                </td>

                                                <td className="border-r border-gray-200 py-2 px-3 font-semibold text-gray-800 w-72 min-w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${avatarColor(s.initials)}`}>
                                                            {s.initials}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="font-semibold text-gray-900 truncate">{s.name}</span>
                                                            <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                                                                ({s.role})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="border-r border-gray-200 py-2 px-2 text-center font-mono text-gray-600 w-28 min-w-[110px]">
                                                    {s.empCode}
                                                </td>

                                                {daysArray.map((d) => {
                                                    const status = getDayStatus(s.id, d);
                                                    const isSun = status === "SUN" || isSundayDate(d);

                                                    return (
                                                        <td
                                                            key={d}
                                                            className={`border-r border-gray-200 py-1 px-0.5 text-center font-bold text-[11px] w-9 min-w-[36px] ${isSun
                                                                ? "bg-gray-100/70 text-gray-400 font-normal"
                                                                : status === "P"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : status === "L"
                                                                        ? "bg-amber-50 text-amber-700"
                                                                        : status === "A"
                                                                            ? "bg-red-50 text-red-700"
                                                                            : status === "LV"
                                                                                ? "bg-purple-50 text-purple-700"
                                                                                : "text-gray-300 font-normal"
                                                                }`}
                                                        >
                                                            {isSun ? (
                                                                <span className="text-[9px] text-gray-400 select-none">SUN</span>
                                                            ) : status === "P" ? (
                                                                <span className="inline-block w-5 h-5 leading-5 rounded bg-green-100 text-green-800 font-black shadow-xs">P</span>
                                                            ) : status === "L" ? (
                                                                <span className="inline-block w-5 h-5 leading-5 rounded bg-amber-100 text-amber-800 font-black shadow-xs">L</span>
                                                            ) : status === "A" ? (
                                                                <span className="inline-block w-5 h-5 leading-5 rounded bg-red-100 text-red-800 font-black shadow-xs">A</span>
                                                            ) : status === "LV" ? (
                                                                <span className="inline-block w-5 h-5 leading-5 rounded bg-purple-100 text-purple-800 font-black shadow-xs">LV</span>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                <td className="border-r border-gray-300 py-2 px-1 text-center font-bold text-green-700 bg-green-50/40 w-14 min-w-[56px]">
                                                    {pCount}
                                                </td>
                                                <td className="border-r border-gray-300 py-2 px-1 text-center font-bold text-amber-700 bg-amber-50/40 w-14 min-w-[56px]">
                                                    {lCount}
                                                </td>
                                                <td className="border-r border-gray-300 py-2 px-1 text-center font-bold text-red-700 bg-red-50/40 w-14 min-w-[56px]">
                                                    {aCount}
                                                </td>
                                                <td className="border-r border-gray-300 py-2 px-1 text-center font-bold text-purple-700 bg-purple-50/40 w-14 min-w-[56px]">
                                                    {lvCount}
                                                </td>
                                                <td className="py-2 px-1 text-center font-bold bg-blue-50/50 w-20 min-w-[76px]">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${staffRate >= 75
                                                            ? "bg-green-100 text-green-800 border border-green-200"
                                                            : staffRate >= 50
                                                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                                : "bg-red-100 text-red-800 border border-red-200"
                                                            }`}
                                                    >
                                                        {staffRate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                            <tfoot>
                                <tr className="bg-gray-100 text-gray-800 font-bold border-t-2 border-gray-300">
                                    <td colSpan={3} className="py-2.5 px-3 text-right font-black uppercase text-xs border-r border-gray-300">
                                        Daily Present Total:
                                    </td>
                                    {dailyStats.map((st, i) => (
                                        <td
                                            key={i}
                                            className={`border-r border-gray-200 py-2 text-center font-bold text-xs w-9 min-w-[36px] ${st.isSun ? "bg-gray-200 text-gray-400" : st.p > 0 ? "text-green-700 bg-green-50/50" : "text-gray-400"
                                                }`}
                                        >
                                            {st.isSun ? "-" : st.p}
                                        </td>
                                    ))}
                                    <td className="border-r border-gray-300 py-2.5 text-center text-green-800 font-black bg-green-100 w-14 min-w-[56px]">
                                        {overallStats.totalP}
                                    </td>
                                    <td className="border-r border-gray-300 py-2.5 text-center text-amber-800 font-black bg-amber-100 w-14 min-w-[56px]">
                                        {overallStats.totalL}
                                    </td>
                                    <td className="border-r border-gray-300 py-2.5 text-center text-red-800 font-black bg-red-100 w-14 min-w-[56px]">
                                        {overallStats.totalA}
                                    </td>
                                    <td className="border-r border-gray-300 py-2.5 text-center text-purple-800 font-black bg-purple-100 w-14 min-w-[56px]">
                                        {overallStats.totalLV}
                                    </td>
                                    <td className="py-2.5 text-center text-blue-800 font-black bg-blue-100 w-20 min-w-[76px]">
                                        {overallStats.avgAttendanceRate}%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* ── Modal Footer ── */}
                <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
                    <p className="text-xs text-gray-500 truncate">
                        Showing all <strong>{filteredStaff.length}</strong> staff & teachers for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow whitespace-nowrap"
                    >
                        Close Register
                    </button>
                </div>
            </div>
        </div>
    );
}
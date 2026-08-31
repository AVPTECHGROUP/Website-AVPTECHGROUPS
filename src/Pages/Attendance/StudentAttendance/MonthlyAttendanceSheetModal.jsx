import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
    X, Download, Calendar, Users, CheckCircle2,
    Maximize2, Minimize2, ChevronDown, FileSpreadsheet, Loader2, RefreshCw
} from "lucide-react";
import { getAttendanceRoster } from "../../../Api/Attendance/AttendanceApi";
import {
    AVATAR_INITIALS_COLORS,
    STATUS_NOT_MARKED,
} from "../../../Constants/StringConstants/AttendanceConstants";

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
    const colors = AVATAR_INITIALS_COLORS;
    return colors[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % colors.length];
};

const mapStatusToCode = (statusStr) => {
    if (!statusStr || statusStr === STATUS_NOT_MARKED) return null;
    const s = String(statusStr).toUpperCase();
    if (s.includes("PRESENT")) return "P";
    if (s.includes("LATE")) return "L";
    if (s.includes("ABSENT")) return "A";
    return null;
};

export default function MonthlyAttendanceSheetModal({
    isOpen,
    onClose,
    baseStudents = [],
    selectedClass,
    selectedSection,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [monthlyDataMap, setMonthlyDataMap] = useState({});
    const [studentsList, setStudentsList] = useState([]);
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

    // Fetch strictly the days of this selected month (max 28–31 API calls)
    const fetchMonthlyRoster = useCallback(async (force = false) => {
        if (!isOpen || !selectedClass?.id || !selectedSection?.id) return;

        const currentKey = `${selectedClass.id}_${selectedSection.id}_${selectedYear}_${selectedMonth}`;
        if (!force && lastFetchedKeyRef.current === currentKey) {
            return; // Cache guard: Avoid re-fetching if already loaded
        }

        setLoading(true);
        lastFetchedKeyRef.current = currentKey;

        try {
            const dateKeys = Array.from({ length: daysInMonth }, (_, i) => {
                const d = String(i + 1).padStart(2, "0");
                const m = String(selectedMonth).padStart(2, "0");
                return `${selectedYear}-${m}-${d}`;
            });

            // Parallel batch calls strictly for the selected month's dates
            const responses = await Promise.allSettled(
                dateKeys.map((k) => getAttendanceRoster(selectedClass.id, selectedSection.id, k))
            );

            const attendanceMap = {};
            const studentProfiles = {};

            baseStudents.forEach((st) => {
                const sid = String(st.id || st.studentId);
                studentProfiles[sid] = {
                    id: sid,
                    name: st.name || st.studentName || "Unknown",
                    rollNo: st.rollNo || st.rollNumber || "—",
                    initials: getInitials(st.name || st.studentName),
                };
                attendanceMap[sid] = {};
            });

            responses.forEach((res, index) => {
                if (res.status === "fulfilled" && res.value) {
                    const raw = res.value;
                    const dataObj = raw?.data?.students ? raw.data : (raw?.students ? raw : (raw?.data || {}));
                    const rosterStudents = Array.isArray(dataObj?.students) ? dataObj.students : [];
                    const attDateKey = dataObj?.attendanceDate || dateKeys[index];

                    rosterStudents.forEach((st) => {
                        const sid = String(st.studentId || st.id);
                        if (!studentProfiles[sid]) {
                            studentProfiles[sid] = {
                                id: sid,
                                name: st.studentName || st.name || "Unknown",
                                rollNo: st.rollNumber || st.rollNo || st.admissionNumber || "—",
                                initials: getInitials(st.studentName || st.name),
                            };
                        }
                        if (!attendanceMap[sid]) {
                            attendanceMap[sid] = {};
                        }

                        const statusCode = mapStatusToCode(st.status);
                        if (statusCode) {
                            attendanceMap[sid][attDateKey] = statusCode;
                        }
                    });
                }
            });

            setMonthlyDataMap(attendanceMap);
            setStudentsList(Object.values(studentProfiles));
        } catch (err) {
            console.error("Monthly sheet fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [isOpen, selectedClass, selectedSection, selectedMonth, selectedYear, daysInMonth, baseStudents]);

    useEffect(() => {
        if (isOpen) {
            fetchMonthlyRoster(false);
        }
    }, [isOpen, selectedMonth, selectedYear, fetchMonthlyRoster]);

    const getDayStatus = (studentId, day) => {
        const dayStr = String(day).padStart(2, "0");
        const monthStr = String(selectedMonth).padStart(2, "0");
        const cellDateKey = `${selectedYear}-${monthStr}-${dayStr}`;

        const sid = String(studentId);
        if (monthlyDataMap[sid] && monthlyDataMap[sid][cellDateKey]) {
            return monthlyDataMap[sid][cellDateKey];
        }

        if (isSundayDate(day)) {
            return "SUN";
        }

        return "-";
    };

    const filteredStudents = useMemo(() => {
        return studentsList.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(s.rollNo || "").includes(searchTerm)
        );
    }, [studentsList, searchTerm]);

    const dailyStats = useMemo(() => {
        return daysArray.map((d) => {
            if (isSundayDate(d)) return { isSun: true, p: 0 };
            let p = 0;
            let l = 0;
            let a = 0;
            studentsList.forEach((s) => {
                const st = getDayStatus(s.id, d);
                if (st === "P") p++;
                else if (st === "L") l++;
                else if (st === "A") a++;
            });
            return { isSun: false, p, l, a, totalMarked: p + l + a };
        });
    }, [daysArray, studentsList, monthlyDataMap, selectedYear, selectedMonth]);

    const classStats = useMemo(() => {
        let totalP = 0;
        let totalL = 0;
        let totalA = 0;
        studentsList.forEach((s) => {
            daysArray.forEach((d) => {
                const st = getDayStatus(s.id, d);
                if (st === "P") totalP++;
                else if (st === "L") totalL++;
                else if (st === "A") totalA++;
            });
        });
        const totalWorkingDays = daysArray.filter((d) => !isSundayDate(d)).length;
        const totalPossible = (studentsList.length * totalWorkingDays) || 1;
        const avgAttendanceRate = Math.min(
            100,
            Math.round(((totalP + totalL * 0.5) / totalPossible) * 100)
        );

        return { totalP, totalL, totalA, totalWorkingDays, avgAttendanceRate };
    }, [studentsList, daysArray, monthlyDataMap, selectedYear, selectedMonth]);

    const handleExportCSV = () => {
        const className = selectedClass?.name || "Class";
        const sectionName = selectedSection?.name || "Section";
        const monthName = MONTH_NAMES[selectedMonth - 1];

        const cell = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
        const rows = [];

        rows.push([cell("Attendance Register Sheet"), "", ""]);
        rows.push([cell("Class:"), cell(className), cell("Section:"), cell(sectionName)]);
        rows.push([cell("Month / Year:"), cell(`${monthName} ${selectedYear}`)]);
        rows.push([""]);

        const headers = ["#", "Student Name", "Roll No", ...daysArray.map((d) => `Day ${d}`), "Present (P)", "Late (L)", "Absent (A)", "Attendance Rate %"];
        rows.push(headers.map(cell));

        studentsList.forEach((s, idx) => {
            let pCount = 0;
            let lCount = 0;
            let aCount = 0;

            const dayStatuses = daysArray.map((d) => {
                const st = getDayStatus(s.id, d);
                if (st === "P") pCount++;
                else if (st === "L") lCount++;
                else if (st === "A") aCount++;
                return st;
            });

            const markedDays = pCount + lCount + aCount;
            const rate = markedDays > 0 ? Math.min(100, Math.round(((pCount + lCount * 0.5) / markedDays) * 100)) : 0;

            rows.push([
                cell(idx + 1),
                cell(s.name),
                cell(s.rollNo),
                ...dayStatuses.map(cell),
                cell(pCount),
                cell(lCount),
                cell(aCount),
                cell(`${rate}%`),
            ]);
        });

        const csvContent = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${className}_${sectionName}_AttendanceRegister_${monthName}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    const yearOptions = [selectedYear - 1, selectedYear, selectedYear + 1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
            <div
                className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-gray-300 ${isFullscreen
                        ? "w-full h-full rounded-none"
                        : "w-full max-w-[97vw] h-[92vh]"
                    }`}
            >
                {/* ── Header Toolbar ── */}
                <div className="bg-[#107c41] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
                            <FileSpreadsheet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-base sm:text-lg leading-tight tracking-wide">
                                    Attendance Register Sheet
                                </h2>
                                <span className="bg-emerald-800 text-emerald-100 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-700">
                                    {selectedClass?.name} - Section {selectedSection?.name}
                                </span>
                            </div>
                            <p className="text-xs text-emerald-100">
                                Official Monthly Attendance Matrix • {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Month Selector */}
                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-white text-gray-800 font-semibold rounded-lg pl-3 pr-7 py-1.5 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer shadow"
                            >
                                {MONTH_NAMES.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
                        </div>

                        {/* Year Selector */}
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-white text-gray-800 font-semibold rounded-lg pl-3 pr-7 py-1.5 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer shadow"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchMonthlyRoster(true)}
                            disabled={loading}
                            className="p-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Force Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Export Excel</span>
                        </button>

                        {/* Fullscreen & Close */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-white"
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
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 sm:gap-6 text-xs text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Total Students: <strong className="text-gray-900">{studentsList.length}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span>Working Days: <strong className="text-gray-900">{classStats.totalWorkingDays}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Avg Rate: <strong className="text-green-700 font-bold">{classStats.avgAttendanceRate}%</strong></span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 text-[11px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">P = Present</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">L = Late</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">A = Absent</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded border border-gray-300">SUN = Sunday</span>
                        </div>
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by name or roll..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal"
                        />
                    </div>
                </div>

                {/* ── Table Container ── */}
                <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4 min-h-0 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-40 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 text-[#107c41] animate-spin" />
                            <p className="text-xs font-semibold text-gray-700">Loading {MONTH_NAMES[selectedMonth - 1]} Attendance Register ({daysInMonth} days)...</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow border border-gray-300 overflow-hidden">
                        <div className="bg-[#f3f9f5] border-b-2 border-emerald-600 px-6 py-4 text-center">
                            <h3 className="text-base sm:text-lg font-black text-gray-800 tracking-wide uppercase">
                                Xavier Model School — Student Attendance Register
                            </h3>
                            <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                                Class: {selectedClass?.name || "—"} | Section: {selectedSection?.name || "—"} | Period: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs select-none">
                                <thead>
                                    {/* Excel Column Letters */}
                                    <tr className="bg-gray-100 text-gray-400 font-mono text-[10px] border-b border-gray-200">
                                        <th className="border-r border-gray-200 py-0.5 px-2 text-center w-12 sticky left-0 bg-gray-100 z-30">A</th>
                                        <th className="border-r border-gray-200 py-0.5 px-3 text-left w-52 min-w-[200px] sticky left-12 bg-gray-100 z-30">B</th>
                                        <th className="border-r border-gray-200 py-0.5 px-2 text-center w-16 sticky left-[248px] bg-gray-100 z-30">C</th>
                                        {daysArray.map((d, idx) => (
                                            <th key={d} className="border-r border-gray-200 py-0.5 text-center w-8 min-w-[32px]">
                                                {String.fromCharCode(68 + (idx % 23))}
                                            </th>
                                        ))}
                                        <th className="border-r border-gray-200 py-0.5 text-center w-12 bg-green-100 text-green-800 font-bold">P</th>
                                        <th className="border-r border-gray-200 py-0.5 text-center w-12 bg-amber-100 text-amber-800 font-bold">L</th>
                                        <th className="border-r border-gray-200 py-0.5 text-center w-12 bg-red-100 text-red-800 font-bold">A</th>
                                        <th className="py-0.5 text-center w-16 bg-blue-100 text-blue-800 font-bold">%</th>
                                    </tr>

                                    {/* Main Table Headers */}
                                    <tr className="bg-gray-50 text-gray-700 font-bold border-b-2 border-gray-300">
                                        <th className="border-r border-gray-300 py-2.5 px-2 text-center sticky left-0 bg-gray-50 z-30 shadow-[1px_0_0_rgba(0,0,0,0.1)]">#</th>
                                        <th className="border-r border-gray-300 py-2.5 px-3 text-left sticky left-12 bg-gray-50 z-30 shadow-[1px_0_0_rgba(0,0,0,0.1)]">Student Name</th>
                                        <th className="border-r border-gray-300 py-2.5 px-2 text-center sticky left-[248px] bg-gray-50 z-30 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">Roll No</th>
                                        {daysArray.map((d) => {
                                            const isSun = isSundayDate(d);
                                            const dayName = new Date(selectedYear, selectedMonth - 1, d).toLocaleDateString("en-US", { weekday: "narrow" });
                                            return (
                                                <th
                                                    key={d}
                                                    className={`border-r border-gray-200 py-1.5 text-center min-w-[32px] ${isSun
                                                            ? "bg-red-50 text-red-600 font-bold"
                                                            : "text-gray-700"
                                                        }`}
                                                >
                                                    <div className="font-bold text-xs">{d}</div>
                                                    <div className="text-[9px] uppercase font-normal">{dayName}</div>
                                                </th>
                                            );
                                        })}
                                        <th className="border-r border-gray-300 py-2.5 text-center bg-green-50 text-green-800 font-bold">P</th>
                                        <th className="border-r border-gray-300 py-2.5 text-center bg-amber-50 text-amber-800 font-bold">L</th>
                                        <th className="border-r border-gray-300 py-2.5 text-center bg-red-50 text-red-800 font-bold">A</th>
                                        <th className="py-2.5 text-center bg-blue-50 text-blue-800 font-bold">Rate</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 font-medium">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={daysArray.length + 7} className="py-12 text-center text-gray-400">
                                                No student records found for this class & section.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((s, idx) => {
                                            let pCount = 0;
                                            let lCount = 0;
                                            let aCount = 0;

                                            daysArray.forEach((d) => {
                                                const st = getDayStatus(s.id, d);
                                                if (st === "P") pCount++;
                                                else if (st === "L") lCount++;
                                                else if (st === "A") aCount++;
                                            });

                                            const markedDays = pCount + lCount + aCount;
                                            const studentRate = markedDays > 0
                                                ? Math.min(100, Math.round(((pCount + lCount * 0.5) / markedDays) * 100))
                                                : 0;

                                            return (
                                                <tr
                                                    key={s.id}
                                                    className={`hover:bg-emerald-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#fcfdfc]"
                                                        }`}
                                                >
                                                    <td className="border-r border-gray-200 py-2 px-2 text-center text-gray-500 font-mono text-xs sticky left-0 bg-inherit z-20 shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                                                        {idx + 1}
                                                    </td>

                                                    <td className="border-r border-gray-200 py-2 px-3 font-semibold text-gray-800 sticky left-12 bg-inherit z-20 shadow-[1px_0_0_rgba(0,0,0,0.06)] truncate">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${avatarColor(s.initials)}`}>
                                                                {s.initials}
                                                            </div>
                                                            <span className="truncate">{s.name}</span>
                                                        </div>
                                                    </td>

                                                    <td className="border-r border-gray-200 py-2 px-2 text-center font-mono text-gray-600 sticky left-[248px] bg-inherit z-20 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                                                        {s.rollNo}
                                                    </td>

                                                    {daysArray.map((d) => {
                                                        const status = getDayStatus(s.id, d);
                                                        const isSun = status === "SUN" || isSundayDate(d);

                                                        return (
                                                            <td
                                                                key={d}
                                                                className={`border-r border-gray-200 py-1 px-0.5 text-center font-bold text-[11px] ${isSun
                                                                        ? "bg-gray-100/70 text-gray-400 font-normal"
                                                                        : status === "P"
                                                                            ? "bg-green-50 text-green-700"
                                                                            : status === "L"
                                                                                ? "bg-amber-50 text-amber-700"
                                                                                : status === "A"
                                                                                    ? "bg-red-50 text-red-700"
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
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="border-r border-gray-200 py-2 text-center font-bold text-green-700 bg-green-50/40">
                                                        {pCount}
                                                    </td>
                                                    <td className="border-r border-gray-200 py-2 text-center font-bold text-amber-700 bg-amber-50/40">
                                                        {lCount}
                                                    </td>
                                                    <td className="border-r border-gray-200 py-2 text-center font-bold text-red-700 bg-red-50/40">
                                                        {aCount}
                                                    </td>
                                                    <td className="py-2 text-center font-bold bg-blue-50/50">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${studentRate >= 75
                                                                    ? "bg-green-100 text-green-800 border border-green-200"
                                                                    : studentRate >= 50
                                                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                                        : "bg-red-100 text-red-800 border border-red-200"
                                                                }`}
                                                        >
                                                            {studentRate}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>

                                <tfoot>
                                    <tr className="bg-gray-100 text-gray-800 font-bold border-t-2 border-gray-300">
                                        <td colSpan={3} className="py-2 px-3 text-right font-black uppercase text-xs sticky left-0 bg-gray-100 z-30 border-r border-gray-300 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                                            Daily Present Total:
                                        </td>
                                        {dailyStats.map((st, i) => (
                                            <td
                                                key={i}
                                                className={`border-r border-gray-200 py-2 text-center font-bold text-xs ${st.isSun ? "bg-gray-200 text-gray-400" : st.p > 0 ? "text-green-700 bg-green-50/50" : "text-gray-400"
                                                    }`}
                                            >
                                                {st.isSun ? "-" : st.p}
                                            </td>
                                        ))}
                                        <td className="border-r border-gray-300 py-2 text-center text-green-800 font-black bg-green-100">
                                            {classStats.totalP}
                                        </td>
                                        <td className="border-r border-gray-300 py-2 text-center text-amber-800 font-black bg-amber-100">
                                            {classStats.totalL}
                                        </td>
                                        <td className="border-r border-gray-300 py-2 text-center text-red-800 font-black bg-red-100">
                                            {classStats.totalA}
                                        </td>
                                        <td className="py-2 text-center text-blue-800 font-black bg-blue-100">
                                            {classStats.avgAttendanceRate}%
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
                    <p className="text-xs text-gray-500">
                        Showing all <strong>{filteredStudents.length}</strong> students for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow"
                    >
                        Close Register
                    </button>
                </div>
            </div>
        </div>
    );
}
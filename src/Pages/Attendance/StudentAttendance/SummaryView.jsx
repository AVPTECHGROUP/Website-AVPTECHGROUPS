import { useState, useEffect, useCallback } from "react";
import {
    BarChart2, TrendingUp, AlertTriangle, Star, RefreshCw,
    ChevronDown, AlertCircle, Loader2, CalendarDays,
} from "lucide-react";
import { getAttendanceSummary } from "../../../Api/AttendanceApi";
import { useDecodedUser } from "../../../ContextAPI/UserContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const defaultAvatarColor = (initials = "??") => {
    const colors = [
        "bg-blue-100 text-blue-700",
        "bg-green-100 text-green-700",
        "bg-purple-100 text-purple-700",
        "bg-orange-100 text-orange-700",
        "bg-pink-100 text-pink-700",
        "bg-teal-100 text-teal-700",
    ];
    return colors[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % colors.length];
};

const DAY_COLORS = {
    MON: "bg-blue-500", TUE: "bg-blue-500", WED: "bg-blue-500",
    THU: "bg-blue-500", FRI: "bg-blue-500",
};

const rateColor = (rate) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 75) return "bg-yellow-500";
    if (rate >= 50) return "bg-orange-500";
    return "bg-red-500";
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SummarySkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse">
                    <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-3" />
                    <div className="h-14 w-28 bg-gray-200 rounded mx-auto mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded mx-auto" />
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse space-y-4">
                    <div className="h-5 w-48 bg-gray-200 rounded" />
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-52 animate-pulse" />
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-52 animate-pulse" />
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SummaryView({ selectedClass, selectedSection, date, avatarColor }) {
    const { currentAcademicYear } = useDecodedUser() || {};
    const getAvatarColor = avatarColor || defaultAvatarColor;

    const baseDate = date ? new Date(date) : new Date();
    const [month, setMonth] = useState(baseDate.getMonth() + 1);
    const [year, setYear] = useState(baseDate.getFullYear());
    const [atRiskThreshold, setAtRiskThreshold] = useState(75);
    const [thresholdInput, setThresholdInput] = useState("75");

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Keep month/year in sync whenever the roster date changes from outside
    useEffect(() => {
        if (!date) return;
        const d = new Date(date);
        setMonth(d.getMonth() + 1);
        setYear(d.getFullYear());
    }, [date]);

    const classId = selectedClass?.id;
    const sectionId = selectedSection?.id;

    const fetchSummary = useCallback(async () => {
        if (!classId || !sectionId) return;
        setLoading(true);
        setError("");
        try {
            const data = await getAttendanceSummary({
                classId,
                sectionId,
                date,
                year,
                month,
                atRiskThreshold,
            });
            setSummary(data);
        } catch (err) {
            setError(err.message || "Failed to load attendance summary");
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [classId, sectionId, date, year, month, atRiskThreshold]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    if (!classId || !sectionId) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400 text-sm">
                Select a class and section to view the attendance summary.
            </div>
        );
    }

    if (loading && !summary) return <SummarySkeleton />;

    if (error && !summary) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700 mb-1">Couldn't load summary</p>
                <p className="text-xs text-gray-400 mb-4">{error}</p>
                <button
                    onClick={fetchSummary}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
            </div>
        );
    }

    const {
        totalStudents = 0,
        presentCount = 0,
        lateCount = 0,
        absentCount = 0,
        notMarkedCount = 0,
        attendanceRate = 0,
        weeklyTrend = [],
        monthlyAvgRate = 0,
        monthSchoolDays = 0,
        atRiskStudents = [],
    } = summary || {};

    const unmarkedOrAbsent = absentCount + notMarkedCount;
    const presentPct = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
    const latePct = totalStudents > 0 ? ((lateCount / totalStudents) * 100).toFixed(1) : 0;
    const absentPct = totalStudents > 0 ? ((unmarkedOrAbsent / totalStudents) * 100).toFixed(1) : 0;

    const formattedDate = date
        ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "";

    const todayISO = new Date().toISOString().split("T")[0];
    const yearOptions = [year - 1, year, year + 1];

    return (
        <div className="space-y-4">

            {/* ── Header / Controls ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                        {selectedClass?.name} · {selectedSection?.name}
                    </span>
                    {currentAcademicYear?.yearLabel || currentAcademicYear?.name ? (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-medium">
                            AY {currentAcademicYear?.yearLabel || currentAcademicYear?.name}
                        </span>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="border border-gray-200 bg-white rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                        >
                            {MONTH_NAMES.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="border border-gray-200 bg-white rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                        >
                            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg pl-2.5 pr-1 py-1 bg-white">
                        <span className="text-xs text-gray-500 font-medium">At-risk &lt;</span>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={thresholdInput}
                            onChange={(e) => setThresholdInput(e.target.value)}
                            onBlur={() => {
                                const n = Math.min(100, Math.max(1, Number(thresholdInput) || 75));
                                setThresholdInput(String(n));
                                setAtRiskThreshold(n);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                            className="w-10 text-xs font-semibold text-center outline-none"
                        />
                        <span className="text-xs text-gray-500">%</span>
                    </div>
                    <button
                        onClick={fetchSummary}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Refresh
                    </button>
                </div>
            </div>

            {loading && summary && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating…
                </p>
            )}

            {/* ── Today's Rate + Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Today's Rate</p>
                    <p className="text-5xl font-black text-green-600">{attendanceRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {presentCount + lateCount} of {totalStudents} marked
                    </p>
                    <div className="w-full mt-3">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-700"
                                style={{ width: `${attendanceRate}%` }}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{selectedClass?.name} · {selectedSection?.name}</p>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-blue-600" />
                        Status Breakdown — {selectedClass?.name} {selectedSection?.name} · {formattedDate}
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: "Present", pct: presentPct, count: presentCount, color: "bg-green-500", textColor: "text-green-600" },
                            { label: "Late", pct: latePct, count: lateCount, color: "bg-orange-400", textColor: "text-orange-500" },
                            { label: "Absent / Not Marked", pct: absentPct, count: unmarkedOrAbsent, color: "bg-red-400", textColor: "text-red-500" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${item.textColor}`}>
                                        {item.count} students ({item.pct}%)
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Weekly Trend + Monthly / At-Risk ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" /> This Week's Daily Trend
                    </h3>
                    {weeklyTrend.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                            No trend data available yet.
                        </div>
                    ) : (
                        <div className="flex items-end justify-around gap-2 h-32">
                            {weeklyTrend.map((d) => {
                                const isToday = d.date === todayISO;
                                const barColor = DAY_COLORS[d.dayOfWeek] || "bg-blue-500";
                                return (
                                    <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
                                        <span className={`text-xs font-bold ${isToday ? "text-blue-600" : "text-gray-600"}`}>
                                            {d.attendanceRate}%
                                        </span>
                                        <div
                                            className="w-full rounded-t-lg overflow-hidden"
                                            style={{ height: `${Math.max((d.attendanceRate / 100) * 96, 4)}px` }}
                                        >
                                            <div className={`w-full h-full ${barColor} rounded-t-lg`} />
                                        </div>
                                        <span className={`text-xs font-semibold ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                                            {d.dayOfWeek?.slice(0, 3)}
                                            {isToday && <Star className="w-3 h-3 inline ml-0.5 text-blue-500 fill-blue-500" />}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">{selectedClass?.name} · {selectedSection?.name}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> At-Risk Students
                        </h3>
                        <span className="text-xs text-gray-400">Below {atRiskThreshold}% this month</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                        Monthly avg: <span className="font-semibold text-gray-600">{monthlyAvgRate}%</span> · {monthSchoolDays} school days
                    </p>
                    {atRiskStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">🎉 No students below threshold this month!</div>
                    ) : (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {atRiskStudents.map((s) => {
                                const initials = getInitials(s.studentName);
                                return (
                                    <div
                                        key={s.studentId}
                                        className="rounded-xl border p-3 bg-red-50 border-red-100 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(initials)}`}>
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{s.studentName}</p>
                                                <p className="text-xs text-gray-500">
                                                    Roll {s.rollNumber} · {s.daysPresent}/{s.totalSchoolDays} days
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-xs font-bold text-red-600">{s.monthlyAttendanceRate}%</span>
                                            <div className="w-14 h-1.5 bg-red-100 rounded-full overflow-hidden mt-1">
                                                <div
                                                    className={`h-full rounded-full ${rateColor(s.monthlyAttendanceRate)}`}
                                                    style={{ width: `${s.monthlyAttendanceRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
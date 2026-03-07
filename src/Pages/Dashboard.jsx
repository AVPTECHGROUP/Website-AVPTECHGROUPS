import React, { useState, useEffect } from "react";
import {
  GraduationCap, Users, AlertTriangle, Calendar,
  RefreshCw, Package, Bus, Banknote, FileBarChart,
  CheckSquare, UserPlus, Eye, Edit, Clock, TrendingUp, BookOpen,
  Star
} from "lucide-react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import CardComponent from "../Components/CommonComp/CardComponent";
import CardLoader from "../Components/CommonComp/CardLoader";
import ListLoader from "../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../Components/CommonComp/ActionDropDownComp";
import { getDashboardAnalytics, getUpcomingHolidays } from "../Api/DashboardApi";

Chart.register(ArcElement, Tooltip, Legend);

const quickActions = [
  { label: "Review Attendance", sub: "pending", subColor: "text-red-500", icon: Eye, bg: "bg-orange-50", iconColor: "text-orange-500", key: "pendingAttendanceApprovals" },
  { label: "Approve Leaves", sub: "pending", subColor: "text-red-500", icon: CheckSquare, bg: "bg-green-50", iconColor: "text-green-600", key: "pendingLeaveRequests" },
  { label: "Add New User", sub: "Staff / Teacher / Admin", subColor: "text-gray-400", icon: UserPlus, bg: "bg-blue-50", iconColor: "text-blue-600", key: null },
  { label: "Admit Student", sub: "New registration", subColor: "text-gray-400", icon: GraduationCap, bg: "bg-purple-50", iconColor: "text-purple-600", key: null },
  { label: "Manage Stock", sub: "3 items low", subColor: "text-orange-500", icon: Package, bg: "bg-yellow-50", iconColor: "text-yellow-600", key: null },
  { label: "Transport", sub: "Allocate / Manage", subColor: "text-gray-400", icon: Bus, bg: "bg-cyan-50", iconColor: "text-cyan-600", key: null },
  { label: "Payroll", sub: "Process payroll", subColor: "text-gray-400", icon: Banknote, bg: "bg-emerald-50", iconColor: "text-emerald-600", key: null },
  { label: "Reports", sub: "Attendance / Leave", subColor: "text-gray-400", icon: FileBarChart, bg: "bg-indigo-50", iconColor: "text-indigo-600", key: null },
];

const avatarColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500"];
const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length || 0];

const doughnutOptions = {
  cutout: "72%",
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
};

// ─── Holiday helpers ──────────────────────────────────────────────────────────
const formatHolidayDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    date: d.getDate().toString(),
    month: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
    dayLabel: d.toLocaleString("en-GB", { weekday: "long" }),
    fullDisplay: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
};

const getDaysAway = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const holidayTypeStyle = (type, isOptional) => {
  if (isOptional) return { label: "OPTIONAL", color: "bg-gray-100 text-gray-600" };
  switch (type) {
    case "NATIONAL": return { label: "NATIONAL", color: "bg-orange-100 text-orange-600" };
    case "RELIGIOUS": return { label: "RELIGIOUS", color: "bg-purple-100 text-purple-600" };
    default: return { label: type, color: "bg-blue-100 text-blue-600" };
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getDashboardAnalytics(), getUpcomingHolidays(5)])
      .then(([statsData, holidaysData]) => {
        if (cancelled) return;
        setStats(statsData);
        setHolidays(holidaysData);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Failed to load dashboard data. Please refresh.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshKey]);

  // ── Derived values from stats ─────────────────────────────────────────────
  const totalPendingActions = stats
    ? (stats.pendingLeaveRequests || 0) + (stats.pendingAttendanceApprovals || 0)
    : 0;

  const topStats = stats
    ? [
      { key: "Total Students", val: stats.totalStudents, icon: GraduationCap, txColor: "text-blue-600", bgColor: "bg-blue-50" },
      { key: "Total Teachers", val: stats.totalTeachers, icon: BookOpen, txColor: "text-green-600", bgColor: "bg-green-50" },
      { key: "Total Staff", val: stats.totalStaff, icon: Users, txColor: "text-purple-600", bgColor: "bg-purple-50" },
      { key: "Pending Actions", val: totalPendingActions, icon: AlertTriangle, txColor: "text-orange-500", bgColor: "bg-orange-50" },
    ]
    : [];

  const peopleStats = stats
    ? [
      {
        label: "Total Students",
        val: stats.totalStudents,
        active: stats.activeStudents,
        inactive: stats.totalStudents - stats.activeStudents,
        inactivePercent: stats.totalStudents ? `${Math.round(((stats.totalStudents - stats.activeStudents) / stats.totalStudents) * 100)}%` : "0%",
        color: "bg-blue-500", iconColor: "text-blue-600", bgColor: "bg-blue-50", icon: GraduationCap,
      },
      {
        label: "Total Teachers",
        val: stats.totalTeachers,
        active: stats.activeTeachers,
        inactive: stats.inactiveTeachers,
        inactivePercent: stats.totalTeachers ? `${Math.round((stats.inactiveTeachers / stats.totalTeachers) * 100)}%` : "0%",
        color: "bg-green-500", iconColor: "text-green-600", bgColor: "bg-green-50", icon: BookOpen,
      },
      {
        label: "Staff / Users",
        val: stats.totalStaff,
        active: stats.activeStaff,
        inactive: stats.totalStaff - stats.activeStaff,
        inactivePercent: stats.totalStaff ? `${Math.round(((stats.totalStaff - stats.activeStaff) / stats.totalStaff) * 100)}%` : "0%",
        color: "bg-purple-500", iconColor: "text-purple-600", bgColor: "bg-purple-50", icon: Users,
      },
    ]
    : [];

  // Attendance chart derived from stats
  const attendanceTotalRecords = stats?.attendanceTotalRecords || 0;
  const attendancePresent = stats?.attendancePresent || 0;
  const attendanceLate = stats?.attendanceLate || 0;
  const attendanceAbsent = stats?.attendanceAbsent || 0;
  const attendanceOnLeave = stats?.attendanceOnLeave || 0;
  const attendancePending = stats?.attendancePendingApproval || 0;
  const presentPct = attendanceTotalRecords > 0
    ? Math.round((attendancePresent / attendanceTotalRecords) * 100)
    : 0;

  const attendanceChartData = {
    labels: ["Present", "Late", "Absent", "On Leave", "Pending Review"],
    datasets: [{
      data: attendanceTotalRecords > 0
        ? [attendancePresent, attendanceLate, attendanceAbsent, attendanceOnLeave, attendancePending]
        : [1, 0, 0, 0, 0], // fallback so chart renders
      backgroundColor: ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8", "#f97316"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const attendanceRows = [
    { label: "Present", val: attendancePresent, pct: `${attendanceTotalRecords > 0 ? Math.round((attendancePresent / attendanceTotalRecords) * 100) : 0}%`, color: "bg-green-500" },
    { label: "Late", val: attendanceLate, pct: `${attendanceTotalRecords > 0 ? Math.round((attendanceLate / attendanceTotalRecords) * 100) : 0}%`, color: "bg-yellow-400" },
    { label: "Absent", val: attendanceAbsent, pct: `${attendanceTotalRecords > 0 ? Math.round((attendanceAbsent / attendanceTotalRecords) * 100) : 0}%`, color: "bg-red-500" },
    { label: "On Leave", val: attendanceOnLeave, pct: `${attendanceTotalRecords > 0 ? Math.round((attendanceOnLeave / attendanceTotalRecords) * 100) : 0}%`, color: "bg-slate-400" },
    { label: "Pending Review", val: attendancePending, pct: `${attendanceTotalRecords > 0 ? Math.round((attendancePending / attendanceTotalRecords) * 100) : 0}%`, color: "bg-orange-400" },
  ];

  // Next holiday from first item in holidays list (most accurate) or from stats
  const nextHoliday = holidays.length > 0 ? holidays[0] : null;
  const nextHolidayName = nextHoliday?.name || stats?.nextHolidayName || "—";
  const nextHolidayDate = nextHoliday?.holidayDate || stats?.nextHolidayDate;
  const nextHolidayDays = nextHolidayDate ? getDaysAway(nextHolidayDate) : stats?.daysUntilNextHoliday;
  const nextHolidayFormatted = nextHolidayDate ? formatHolidayDate(nextHolidayDate) : null;
  const nextHolidayTypeRaw = nextHoliday?.holidayType || stats?.nextHolidayType || "NATIONAL";

  // Payroll month label
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payrollLabel = stats
    ? `Process ${monthNames[(stats.currentMonth || 3) - 1]} ${stats.currentYear || 2026}`
    : "Process payroll";

  const pendingActionsCards = stats
    ? [
      {
        id: 1, label: "Pending Leave Requests", val: stats.pendingLeaveRequests || 0,
        sub: "Awaiting approval", badge: "Needs Action",
        badgeColor: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200",
      },
      {
        id: 2, label: "Attendance Manual Reviews", val: stats.pendingAttendanceApprovals || 0,
        sub: "Face confidence below threshold", badge: "Review Now",
        badgeColor: "text-red-500", bg: "bg-red-50", border: "border-red-200",
      },
    ]
    : [];

  // ── Action table ─────────────────────────────────────────────────────────
  const actionOptions = [
    { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
    { value: "edit", label: "Edit", icon: Edit, text: "text-orange-600", bg: "bg-orange-50", hover: "hover:bg-orange-100" },
  ];
  const callAllActions = (optVal, row) => {
    if (optVal === "view") console.log("View:", row.id);
    else console.log("Edit:", row.id);
  };

  const attendanceDateLabel = stats?.attendanceDate
    ? new Date(stats.attendanceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : today;

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Good morning, Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening today · {today}</p>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-semibold text-red-700">{error}</span>
            <button onClick={() => setRefreshKey((k) => k + 1)} className="ml-auto text-xs font-bold text-red-600 underline">
              Retry
            </button>
          </div>
        )}

        {/* Action required banner */}
        {!loading && stats && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex-1">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-sm font-semibold text-amber-800">Action Required</span>
              <div className="ml-auto flex flex-wrap gap-2">
                {stats.pendingLeaveRequests > 0 && (
                  <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    ✕ {stats.pendingLeaveRequests} Leave Request{stats.pendingLeaveRequests !== 1 ? "s" : ""} Pending
                  </span>
                )}
                {stats.pendingAttendanceApprovals > 0 && (
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                    ⚠ {stats.pendingAttendanceApprovals} Attendance Manual Review{stats.pendingAttendanceApprovals !== 1 ? "s" : ""}
                  </span>
                )}
                {stats.pendingLeaveRequests === 0 && stats.pendingAttendanceApprovals === 0 && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                    ✓ All caught up!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next holiday bar */}
        {!loading && (nextHolidayName || stats?.nextHolidayName) && (
          <div className="flex items-center justify-between bg-blue-100 border-blue-400 border text-white rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                Next holiday:{" "}
                <span className="font-bold">
                  {nextHolidayName}
                  {nextHolidayFormatted ? ` – ${nextHolidayFormatted.date} ${nextHolidayFormatted.month.charAt(0) + nextHolidayFormatted.month.slice(1).toLowerCase()} ${nextHolidayDate?.split("-")[0]}` : ""}
                </span>{" "}
                {nextHolidayDays != null ? `(${nextHolidayDays} day${nextHolidayDays !== 1 ? "s" : ""} away)` : ""}
              </span>
            </div>
            <button className="text-xs font-semibold bg-white text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition whitespace-nowrap">
              View Calendar →
            </button>
          </div>
        )}

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)
            : topStats.map((s) => (
              <CardComponent
                key={s.key}
                IconName={s.icon}
                keyName={s.key}
                val={s.val}
                iconTxColor={s.txColor}
                iconBgColor={s.bgColor}
              />
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

          {/* ── Left column ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Attendance chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold text-gray-800">
                    Staff Attendance — {attendanceDateLabel}
                  </h2>
                </div>
                <button className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap">View All →</button>
              </div>
              <div className="p-5 flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative w-36 h-36 shrink-0">
                  <Doughnut data={attendanceChartData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {attendanceTotalRecords === 0 ? (
                      <>
                        <span className="text-lg font-bold text-gray-400">No Data</span>
                        <span className="text-xs text-gray-400">Today</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-gray-800">{presentPct}%</span>
                        <span className="text-xs text-gray-400">Present</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {attendanceRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.color} shrink-0`} />
                      <span className="text-sm text-gray-600 w-32">{row.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`${row.color} h-2 rounded-full`} style={{ width: attendanceTotalRecords > 0 ? row.pct : "0%" }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-6 text-right">{row.val}</span>
                      <span className="text-xs text-gray-400 w-8 text-right">({row.pct})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-5 divide-x divide-gray-100 border-t border-gray-100">
                {[
                  { label: "Total Records", val: attendanceTotalRecords, color: "text-gray-700" },
                  { label: "Present", val: attendancePresent, color: "text-green-600" },
                  { label: "Late", val: attendanceLate, color: "text-yellow-500" },
                  { label: "Absent", val: attendanceAbsent, color: "text-red-500" },
                  { label: "Reviews", val: attendancePending, color: "text-orange-500" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center py-3">
                    <span className={`text-lg font-bold ${s.color}`}>{s.val}</span>
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-500">
                  {attendancePending > 0 && `⚠ ${attendancePending} pending manual review approval${attendancePending !== 1 ? "s" : ""} · `}
                  {attendanceOnLeave > 0 && `🏖 ${attendanceOnLeave} on approved leave`}
                  {attendancePending === 0 && attendanceOnLeave === 0 && "No pending reviews today"}
                </span>
                {attendancePending > 0 && (
                  <button className="text-xs text-blue-600 font-semibold hover:underline">Review Pending →</button>
                )}
              </div>
            </div>

            {/* People stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)
                : peopleStats.map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <div className={`w-10 h-10 ${s.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                      <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                    </div>
                    <p className={`text-3xl font-bold ${s.iconColor}`}>{s.val}</p>
                    <p className="text-sm text-gray-500 mt-0.5 mb-3">{s.label}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                      <div className={`${s.color} h-1.5 rounded-full`} style={{ width: s.val > 0 ? `${(s.active / s.val) * 100}%` : "0%" }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{s.active} <span className="text-green-600 font-semibold ml-1">Active</span></span>
                      <span>{s.inactive} Inactive <span className="text-gray-400">({s.inactivePercent})</span></span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pending Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h2 className="font-semibold text-gray-800">Pending Actions</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => <CardLoader key={i} />)
                  : pendingActionsCards.map((action) => (
                    <div key={action.id} className={`border ${action.border} ${action.bg} rounded-xl p-4`}>
                      <div className="flex justify-between items-start mb-3">
                        <AlertTriangle className="w-8 h-8 text-gray-400" />
                        <span className={`text-xs font-bold ${action.badgeColor}`}>{action.badge}</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-800">{action.val}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">{action.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{action.sub}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-semibold text-gray-800">Quick Actions</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
                {quickActions.map((qa) => {
                  const dynamicSub = qa.key && stats
                    ? `${stats[qa.key] || 0} pending`
                    : qa.key === null && qa.label === "Payroll"
                      ? payrollLabel
                      : qa.sub;
                  const subColor = qa.key && stats && stats[qa.key] > 0 ? "text-red-500" : qa.subColor;
                  return (
                    <button key={qa.label} className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-3 transition-all">
                      <div className={`w-12 h-12 ${qa.bg} rounded-xl flex items-center justify-center`}>
                        <qa.icon className={`w-6 h-6 ${qa.iconColor}`} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{qa.label}</p>
                      <p className={`text-xs ${subColor} text-center leading-tight`}>{dynamicSub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">

            {/* Next Holiday hero card */}
            {loading ? (
              <CardLoader />
            ) : (
              <div className="bg-blue-600 rounded-2xl text-white overflow-hidden">
                <div className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Next Holiday</p>
                    <h2 className="text-3xl font-bold">{nextHolidayName}</h2>
                    <p className="text-sm text-blue-200 mt-1">
                      📅{" "}
                      {nextHolidayFormatted
                        ? `${nextHolidayFormatted.dayLabel}, ${nextHolidayFormatted.date} ${nextHolidayFormatted.month.charAt(0) + nextHolidayFormatted.month.slice(1).toLowerCase()} ${nextHolidayDate?.split("-")[0]}`
                        : "—"}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-white ${nextHolidayTypeRaw === "NATIONAL" ? "text-orange-600" :
                      nextHolidayTypeRaw === "RELIGIOUS" ? "text-purple-600" :
                        "text-blue-600"
                    }`}>
                    {nextHolidayTypeRaw}
                  </span>
                </div>
                <div className="px-5 pb-5">
                  <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    🏅 {nextHolidayDays} day{nextHolidayDays !== 1 ? "s" : ""} away
                  </span>
                </div>
              </div>
            )}

            {/* Upcoming Holidays list */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-semibold text-gray-800 text-sm">Upcoming Holidays</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                  : holidays.map((h) => {
                    const fmt = formatHolidayDate(h.holidayDate);
                    const daysAway = getDaysAway(h.holidayDate);
                    const typeInfo = holidayTypeStyle(h.holidayType, h.isOptional);
                    return (
                      <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="text-center w-10 shrink-0">
                          <p className="text-lg font-bold text-gray-800 leading-none">{fmt.date}</p>
                          <p className="text-xs text-gray-400 font-semibold">{fmt.month}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{h.name}</p>
                          <p className="text-xs text-gray-400">{fmt.dayLabel} · {daysAway} day{daysAway !== 1 ? "s" : ""} away</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${typeInfo.color} shrink-0`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400">Showing next {holidays.length} holidays</span>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View Full Calendar →</button>
              </div>
            </div>

            {/* Month Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                <FileBarChart className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-800 text-sm">
                  {stats
                    ? `${monthNames[(stats.currentMonth || 3) - 1]} ${stats.currentYear || 2026} Summary`
                    : "Month Summary"}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {[
                  { label: "Holidays", val: holidays.filter(h => !h.isOptional).length, bg: "bg-red-50", color: "text-red-500" },
                  { label: "Optional", val: holidays.filter(h => h.isOptional).length, bg: "bg-yellow-50", color: "text-yellow-600" },
                  { label: "Total Staff", val: stats?.totalStaff || 0, bg: "bg-blue-50", color: "text-blue-600" },
                  { label: "Active Staff", val: stats?.activeStaff || 0, bg: "bg-green-50", color: "text-green-600" },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
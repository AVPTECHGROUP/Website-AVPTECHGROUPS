import React, { useState, useEffect } from "react";
import {
  GraduationCap, Users, AlertTriangle, Calendar,
  RefreshCw, Package, Bus, FileBarChart,
  CheckSquare, UserPlus, Eye, BookOpen,
  Star, ArrowRight, Zap,
} from "lucide-react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import CardLoader from "../../Components/CommonComp/CardLoader";
import { getDashboardAnalytics, getUpcomingHolidays } from "../../Api/Dashboard/DashboardApi";
import { useNavigate } from "react-router-dom";
import { DASHBOARD_CONST, ACCENT } from "../../Constants/StringConstants/DashboardConstants";

Chart.register(ArcElement, Tooltip, Legend);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return DASHBOARD_CONST.GREETINGS.MORNING;
  if (h < 17) return DASHBOARD_CONST.GREETINGS.AFTERNOON;
  return DASHBOARD_CONST.GREETINGS.EVENING;
}

const formatHolidayDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    date: d.getDate().toString(),
    month: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
    dayLabel: d.toLocaleString("en-GB", { weekday: "long" }),
  };
};

const getDaysAway = (dateStr) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

const holidayTypeStyle = (type, isOptional) => {
  if (isOptional) return { label: "Optional", color: "bg-gray-100 text-gray-600" };
  switch (type) {
    case "NATIONAL": return { label: "National", color: "bg-orange-100 text-orange-600" };
    case "RELIGIOUS": return { label: "Religious", color: "bg-purple-100 text-purple-600" };
    default: return { label: type, color: "bg-blue-100 text-blue-600" };
  }
};

// ─── Compact People Stat Card ─────────────────────────────────────────────────
// FIX: all content constrained inside card, no overflow on any screen width
function PeopleStatCard({ label, val, active, inactive, inactivePercent, accent: accentKey, iconColor, bgColor, icon: Icon }) {
  const ac = ACCENT[accentKey] || ACCENT.blue;
  const fillPct = val > 0 ? (active / val) * 100 : 0;
  const activePct = val > 0 ? Math.round((active / val) * 100) : 0;

  return (
    <div
      className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm
                 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default
                 w-full"
      style={{ borderBottom: `3px solid ${ac.hex}` }}
    >
      {/* Subtle wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, rgba(${ac.rgb},0.05) 0%, transparent 60%)` }}
      />

      <div className="relative px-3 py-3 sm:px-4">
        {/* ROW 1: icon | label+value | badge — all items shrink safely */}
        <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
          {/* Icon — fixed size, never shrinks */}
          <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>

          {/* Label + value — takes remaining space, clips if needed */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide truncate leading-tight">
              {label}
            </p>
            <p
              className="text-2xl sm:text-3xl font-black tabular-nums leading-none mt-0.5"
              style={{ color: ac.hex }}
            >
              {val ?? 0}
            </p>
          </div>

          {/* % badge — shrink-0 so it never disappears, compact on mobile */}
          <span
            className="text-[11px] sm:text-xs font-black px-2 py-1 rounded-lg shrink-0 whitespace-nowrap"
            style={{ color: ac.hex, background: `rgba(${ac.rgb},0.1)` }}
          >
            {activePct}%
          </span>
        </div>

        {/* ROW 2: progress bar */}
        <div className="mt-2.5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${fillPct}%`, backgroundColor: ac.hex }}
          />
        </div>

        {/* ROW 3: active / inactive — truncate long numbers gracefully */}
        <div className="flex items-center justify-between mt-1.5 gap-2 min-w-0">
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            {active} Active
          </span>
          <span className="text-xs text-gray-400 truncate text-right">
            {inactive} Inactive
            <span className="text-gray-300 ml-1 hidden xs:inline">({inactivePercent})</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Quick actions config ─────────────────────────────────────────────────────
const quickActions = [
  { label: "Review Attendance", sub: DASHBOARD_CONST.LABELS.PENDING, icon: Eye, bg: "bg-orange-50", iconColor: "text-orange-500", key: "pendingAttendanceApprovals", route: "/attendance/usersAttendance" },
  { label: "Approve Leaves", sub: DASHBOARD_CONST.LABELS.PENDING, icon: CheckSquare, bg: "bg-green-50", iconColor: "text-green-600", key: "pendingLeaveRequests", route: "/leaves" },
  { label: "Add New User", sub: DASHBOARD_CONST.LABELS.NEW_STAFF, icon: UserPlus, bg: "bg-blue-50", iconColor: "text-blue-600", key: null, route: "/manageUsers/adduser" },
  { label: "Add New Teacher", sub: DASHBOARD_CONST.LABELS.NEW_TEACHER, icon: UserPlus, bg: "bg-blue-50", iconColor: "text-blue-600", key: null, route: "/teachers/addTeacher" },
  { label: "Admit Student", sub: DASHBOARD_CONST.LABELS.NEW_REGISTRATION, icon: GraduationCap, bg: "bg-purple-50", iconColor: "text-purple-600", key: null, route: "/students/addStudents" },
  { label: "Manage Stock", sub: DASHBOARD_CONST.LABELS.INVENTORY, icon: Package, bg: "bg-yellow-50", iconColor: "text-yellow-600", key: null, route: "/stock" },
  { label: "Transport", sub: DASHBOARD_CONST.LABELS.ALLOCATE_MANAGE, icon: Bus, bg: "bg-cyan-50", iconColor: "text-cyan-600", key: null, route: "/route" },
  { label: "Reports", sub: DASHBOARD_CONST.LABELS.ATTENDANCE_LEAVE, icon: FileBarChart, bg: "bg-indigo-50", iconColor: "text-indigo-600", key: null, route: "/attendance" },
];

const doughnutOptions = {
  cutout: "74%",
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: false,
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setUserName(user.fullName);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getDashboardAnalytics(), getUpcomingHolidays(4)])
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
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const peopleStats = stats ? [
    {
      label: "Total Students", val: stats.totalStudents, active: stats.activeStudents,
      inactive: stats.totalStudents - stats.activeStudents,
      inactivePercent: stats.totalStudents
        ? `${Math.round(((stats.totalStudents - stats.activeStudents) / stats.totalStudents) * 100)}%`
        : "0%",
      accent: "blue", iconColor: "text-blue-600", bgColor: "bg-blue-50", icon: GraduationCap,
    },
    {
      label: "Total Teachers", val: stats.totalTeachers, active: stats.activeTeachers,
      inactive: stats.inactiveTeachers,
      inactivePercent: stats.totalTeachers
        ? `${Math.round((stats.inactiveTeachers / stats.totalTeachers) * 100)}%`
        : "0%",
      accent: "green", iconColor: "text-green-600", bgColor: "bg-green-50", icon: BookOpen,
    },
    {
      label: "Staff / Users", val: stats.totalStaff, active: stats.activeStaff,
      inactive: stats.totalStaff - stats.activeStaff,
      inactivePercent: stats.totalStaff
        ? `${Math.round(((stats.totalStaff - stats.activeStaff) / stats.totalStaff) * 100)}%`
        : "0%",
      accent: "purple", iconColor: "text-purple-600", bgColor: "bg-purple-50", icon: Users,
    },
  ] : [];

  const attendanceTotalRecords = stats?.attendanceTotalRecords || 0;
  const attendancePresent = stats?.attendancePresent || 0;
  const attendanceLate = stats?.attendanceLate || 0;
  const attendanceAbsent = stats?.attendanceAbsent || 0;
  const attendanceOnLeave = stats?.attendanceOnLeave || 0;
  const attendancePending = stats?.attendancePendingApproval || 0;
  const presentPct = attendanceTotalRecords > 0
    ? Math.round((attendancePresent / attendanceTotalRecords) * 100) : 0;

  const attendanceChartData = {
    labels: ["Present", "Late", "Absent", "On Leave", "Pending Review"],
    datasets: [{
      data: attendanceTotalRecords > 0
        ? [attendancePresent, attendanceLate, attendanceAbsent, attendanceOnLeave, attendancePending]
        : [1, 0, 0, 0, 0],
      backgroundColor: ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8", "#f97316"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const attendanceRows = [
    { label: "Present", val: attendancePresent, hex: "#22C55E" },
    { label: "Late", val: attendanceLate, hex: "#FACC15" },
    { label: "Absent", val: attendanceAbsent, hex: "#EF4444" },
    { label: "On Leave", val: attendanceOnLeave, hex: "#94A3B8" },
    { label: "Pending Review", val: attendancePending, hex: "#FB923C" },
  ].map((r) => ({
    ...r,
    pct: attendanceTotalRecords > 0
      ? `${Math.round((r.val / attendanceTotalRecords) * 100)}%`
      : "0%",
  }));

  const nextHoliday = holidays[0] ?? null;
  const nextHolidayName = nextHoliday?.name || stats?.nextHolidayName || "—";
  const nextHolidayDate = nextHoliday?.holidayDate || stats?.nextHolidayDate;
  const nextHolidayDays = nextHolidayDate ? getDaysAway(nextHolidayDate) : stats?.daysUntilNextHoliday;
  const nextHolidayFormatted = nextHolidayDate ? formatHolidayDate(nextHolidayDate) : null;
  const nextHolidayTypeRaw = nextHoliday?.holidayType || stats?.nextHolidayType || "NATIONAL";

  const pendingActionsCards = stats ? [
    {
      id: 1, label: "Pending Leave Requests", val: stats.pendingLeaveRequests || 0,
      sub: "Awaiting approval", badge: "Needs Action",
      badgeColor: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
      route: "/leaves",
    },
    {
      id: 2, label: "Attendance Manual Reviews", val: stats.pendingAttendanceApprovals || 0,
      sub: "Face confidence below threshold", badge: "Review Now",
      badgeColor: "text-red-600", bg: "bg-red-50", border: "border-red-200",
      route: "/attendance/usersAttendance",
    },
  ] : [];

  const attendanceDateLabel = stats?.attendanceDate
    ? new Date(stats.attendanceDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : today;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    // FIX: overflow-x-hidden on root prevents any child from causing horizontal scroll
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100 font-sans overflow-x-hidden">
      <div className="w-full max-w-screen-2xl mx-auto px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-blue-500 uppercase tracking-[0.12em]">
                {getGreeting()}
              </p>
              <h1 className="text-xl sm:text-4xl font-bold text-gray-900 ">
                {userName || "Admin"}
              </h1>
              <p className="text-sm text-gray-400 font-medium truncate">{today}</p>
            </div>
          </div>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 bg-white hover:bg-blue-50 active:scale-95
           text-gray-700 text-sm font-bold px-4 py-2 rounded-xl transition-all
           border border-gray-200 shadow-sm w-fit self-start sm:self-auto shrink-0 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
             {DASHBOARD_CONST.ACTIONS.REFRESH}
          </button>
        </div>

        {/* ── ERROR BANNER ──────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl
                          px-3 py-3 mb-4 w-full">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-red-700 flex-1 min-w-0">{error}</p>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-xs font-black text-red-600 bg-white border border-red-200 px-2.5 py-1
                         rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            >
               {DASHBOARD_CONST.ACTIONS.RETRY}
            </button>
          </div>
        )}

        {/* ── ACTION REQUIRED BANNER ────────────────────────────────────────── */}
        {/* FIX: chips now wrap to next line on mobile, no overflow */}
        {!loading && stats && (
          <div className="flex flex-col gap-3 bg-amber-50 border border-amber-200 rounded-2xl
                          px-3 py-3 mb-4 w-full">
            {/* Title row */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900">{DASHBOARD_CONST.LABELS.ACTION_REQUIRED}</p>
                <p className="text-xs text-amber-500 font-medium">{DASHBOARD_CONST.LABELS.SOME_ITEMS_ATTENTION}</p>
              </div>
            </div>
            {/* Chips row — always wraps, full width so nothing clips */}
            <div className="flex flex-wrap gap-2">
              {stats.pendingLeaveRequests > 0 && (
                <span
                  onClick={() => navigate("/leaves")}
                  className="text-xs font-bold cursor-pointer text-red-600 bg-white border
                             border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors
                             whitespace-nowrap"
                >
                  ✕ {stats.pendingLeaveRequests} Leave Request{stats.pendingLeaveRequests !== 1 ? "s" : ""} Pending
                </span>
              )}
              {stats.pendingAttendanceApprovals > 0 && (
                <span
                  onClick={() => navigate("/attendance/usersAttendance")}
                  className="text-xs font-bold cursor-pointer text-orange-600 bg-white border
                             border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors
                             whitespace-nowrap"
                >
                  ⚠ {stats.pendingAttendanceApprovals} Attendance Review{stats.pendingAttendanceApprovals !== 1 ? "s" : ""}
                </span>
              )}
              {stats.pendingLeaveRequests === 0 && stats.pendingAttendanceApprovals === 0 && (
                <span className="text-xs font-bold text-green-600 bg-white border border-green-200
                                 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  {DASHBOARD_CONST.LABELS.ALL_CAUGHT_UP}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── NEXT HOLIDAY BAR ──────────────────────────────────────────────── */}
        {/* FIX: two-row layout on mobile so text doesn't get clipped by button */}
        {!loading && nextHolidayName !== "—" && (
          <div
            className="rounded-2xl px-3 py-3 mb-5 w-full"
            style={{ background: "#DCEBFF", border: "1px solid #3B82F6" }}
          >
            <div className="flex items-center justify-between gap-2">
              {/* Left: icon + text */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 lg:flex lg:items-center lg:justify-center lg:gap-1">
                  <p className="text-[13px] font-bold text-gray-900">
                    {DASHBOARD_CONST.LABELS.NEXT_HOLIDAY}
                  </p>
                  {/* Name on its own line, date+days below — no single long truncated string */}
                  <p className="text-[13px] font-bold text-gray-900 truncate">
                    {nextHolidayName}
                  </p>
                  {(nextHolidayFormatted || nextHolidayDays != null) && (
                    <p className="text-[13px] text-gray-800 font-bold truncate">
                      {nextHolidayFormatted &&
                        `${nextHolidayFormatted.date} ${nextHolidayFormatted.month.charAt(0)}${nextHolidayFormatted.month.slice(1).toLowerCase()}`}
                      {nextHolidayDays != null &&
                        ` - (${nextHolidayDays} day${nextHolidayDays !== 1 ? "s" : ""} away)`}
                    </p>
                  )}
                </div>
              </div>
              {/* Right: View button — always visible, never clipped */}
              <button
                onClick={() => navigate("/leaves/manageHolidays")}
                className="flex items-center gap-1 text-xs font-black bg-white text-blue-700
                           px-2.5 py-1.5 rounded-xl hover:bg-blue-50 transition-colors
                           whitespace-nowrap cursor-pointer shrink-0"
              >
                View <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ── PEOPLE STAT CARDS ─────────────────────────────────────────────── */}
        {/*
          Mobile  (<640px) : 1 column — full width, no overflow
          Tablet  (≥640px) : 3 columns
        */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
            ))
            : peopleStats.map((s) => <PeopleStatCard key={s.label} {...s} />)
          }
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">

          {/* ── LEFT 2 COLS ── */}
          <div className="xl:col-span-2 space-y-4">

            {/* ── Attendance Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">

              {/* Card header */}
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 text-sm truncate">Staff Attendance</h2>
                    <p className="text-xs text-gray-400 font-medium truncate">{attendanceDateLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/attendance")}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600
                             hover:text-blue-700 cursor-pointer shrink-0"
                >
                  {DASHBOARD_CONST.ACTIONS.VIEW_ALL}<ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Chart + legend */}
              {/*
                Mobile  : donut on top, rows below (flex-col)
                Tablet+ : side by side (sm:flex-row)
              */}
              <div className="p-4 flex flex-col sm:flex-row gap-5 items-center">
                {/* Donut */}
                <div className="relative w-28 h-28 shrink-0">
                  <Doughnut data={attendanceChartData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {attendanceTotalRecords === 0 ? (
                      <span className="text-xs font-bold text-gray-300">{DASHBOARD_CONST.STATUS.NO_DATA}</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-gray-800 tabular-nums">{presentPct}%</span>
                        <span className="text-xs text-gray-400 font-medium">{DASHBOARD_CONST.STATUS.PRESENT}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Rows — w-full so they use available space without overflowing */}
                <div className="flex-1 w-full space-y-2 min-w-0">
                  {attendanceRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-2 w-full min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.hex }} />
                      <span className="text-xs font-medium text-gray-500 w-20 shrink-0 truncate">{row.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden min-w-0">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{
                            width: attendanceTotalRecords > 0 ? row.pct : "0%",
                            backgroundColor: row.hex,
                          }}
                        />
                      </div>
                      <span className="text-sm font-black text-gray-700 w-5 text-right tabular-nums shrink-0">{row.val}</span>
                      <span className="text-xs text-gray-400 w-8 text-right shrink-0">({row.pct})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary pills — wraps naturally on small screens */}
              <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                {[
                  { label: "Total", val: attendanceTotalRecords, hex: "#64748B" },
                  { label: "Present", val: attendancePresent, hex: "#22C55E" },
                  { label: "Late", val: attendanceLate, hex: "#F59E0B" },
                  { label: "Absent", val: attendanceAbsent, hex: "#EF4444" },
                  { label: "On Leave", val: attendanceOnLeave, hex: "#94A3B8" },
                  { label: "Pending", val: attendancePending, hex: "#F97316" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1 bg-gray-50 border border-gray-100
                               rounded-xl px-2 py-1 whitespace-nowrap"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.hex }} />
                    <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                    <span className="text-xs font-black tabular-nums" style={{ color: s.hex }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Pending review nudge */}
              {attendancePending > 0 && (
                <div className="mx-4 mb-4 flex items-center justify-between gap-2 bg-orange-50 border
                                border-orange-100 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-orange-700 min-w-0 flex-1">
                    ⚠ {attendancePending} record{attendancePending !== 1 ? "s" : ""} pending review
                  </p>
                  <button
                    onClick={() => navigate("/attendance/usersAttendance")}
                    className="flex items-center gap-1 text-xs font-bold text-orange-600
                               hover:underline cursor-pointer shrink-0"
                  >
                     {DASHBOARD_CONST.ACTIONS.REVIEW} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Pending Actions ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">{DASHBOARD_CONST.LABELS.PENDING_ACTIONS}</h2>
                    <p className="text-xs text-gray-400 font-medium">{DASHBOARD_CONST.LABELS.ITEMS_REQUIRING_ATTENTION}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => <CardLoader key={i} />)
                  : pendingActionsCards.map((action) => (
                    <div
                      key={action.id}
                      onClick={() => action.route && navigate(action.route)}
                      className={`relative overflow-hidden border ${action.border} rounded-2xl p-4
                                  cursor-pointer group transition-all duration-300 hover:-translate-y-0.5
                                  hover:shadow-md w-full`}
                    >
                      <div className={`absolute inset-0 ${action.bg} opacity-60`} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className={`w-9 h-9 bg-white/70 border ${action.border} rounded-xl
                                          flex items-center justify-center shrink-0`}>
                            <AlertTriangle className={`w-4 h-4 ${action.badgeColor}`} />
                          </div>
                          <span className={`text-xs font-black ${action.badgeColor} bg-white px-2.5
                                           py-1 rounded-lg border ${action.border} whitespace-nowrap`}>
                            {action.badge}
                          </span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 tabular-nums mb-0.5">{action.val}</p>
                        <p className="text-sm font-bold text-gray-800">{action.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 mb-3">{action.sub}</p>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600
                                        group-hover:gap-2 transition-all">
                           {DASHBOARD_CONST.ACTIONS.TAKE_ACTION}<ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COL ── */}
          <div className="space-y-2">

            {/* Holiday Hero */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
            ) : (
              <div
                className="rounded-2xl text-white overflow-hidden relative w-full"
                style={{ background: "#2563EB" }}
              >
                {/* Decorative circles */}
                <div
                  className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }}
                />
                <div
                  className="absolute right-4 bottom-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)" }}
                />

                <div className="relative p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-300" />
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">
                      Next Holiday
                    </p>
                  </div>

                  <h2 className="text-xl font-black text-white mb-1 leading-tight">{nextHolidayName}</h2>
                  <p className="text-sm text-blue-100 font-medium mb-4">
                    {nextHolidayFormatted
                      ? `${nextHolidayFormatted.dayLabel}, ${nextHolidayFormatted.date} ${nextHolidayFormatted.month.charAt(0)}${nextHolidayFormatted.month.slice(1).toLowerCase()} ${nextHolidayDate?.split("-")[0]}`
                      : DASHBOARD_CONST.STATUS.DATE_NOT_AVAILABLE}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="flex items-center gap-1.5 bg-white/28 text-white text-xs font-bold
                                     px-3 py-1.5 rounded-xl whitespace-nowrap">
                      🗓 {nextHolidayDays ?? DASHBOARD_CONST.STATUS.NOT_AVAILABLE } day{nextHolidayDays !== 1 ? "s" : ""} away
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-1.5 rounded-xl bg-white whitespace-nowrap ${nextHolidayTypeRaw === "NATIONAL" ? "text-orange-600" :
                        nextHolidayTypeRaw === "RELIGIOUS" ? "text-purple-600" : "text-blue-600"
                        }`}
                    >
                      {nextHolidayTypeRaw}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/leaves/manageHolidays")}
                    className="w-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white
                               text-sm font-bold py-2 rounded-xl transition-colors flex items-center
                               justify-center gap-2 cursor-pointer"
                  >
                    View Full Calendar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Holidays List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-sm">{DASHBOARD_CONST.LABELS.UPCOMING_HOLIDAYS}</h2>
                  <p className="text-xs text-gray-400 font-medium">Next {holidays.length || 5} scheduled</p>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                  : holidays.map((h) => {
                    const fmt = formatHolidayDate(h.holidayDate);
                    const daysAway = getDaysAway(h.holidayDate);
                    const typeInfo = holidayTypeStyle(h.holidayType, h.isOptional);
                    return (
                      <div
                        key={h.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex flex-col items-center
                                        justify-center shrink-0">
                          <p className="text-sm font-black text-blue-600 leading-none tabular-nums">{fmt.date}</p>
                          <p className="text-[10px] font-bold text-blue-400">{fmt.month}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{h.name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">
                            {fmt.dayLabel} · {daysAway}d away
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${typeInfo.color}
                                         shrink-0 whitespace-nowrap`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => navigate("/leaves/manageHolidays")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold
                           text-blue-600 hover:bg-blue-50 py-3 border-t border-gray-100
                           transition-colors cursor-pointer"
              >
                 {DASHBOARD_CONST.ACTIONS.VIEW_CALENDAR} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{DASHBOARD_CONST.LABELS.QUICK_ACTIONS}</h2>
                <p className="text-xs text-gray-400 font-medium">{DASHBOARD_CONST.LABELS.FREQUENTLY_USED}</p>
              </div>
            </div>
          </div>

          {/* FIX IMPLEMENTED: 
    - Mobile par grid-cols-2 kiya taaki text ko puri width mile.
    - Tablets par grid-cols-4 aur Desktop screens par grid-cols-8 banega.
  */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 p-3 sm:p-4">
            {quickActions.map((qa) => {
              const dynamicSub = qa.key && stats ? `${stats[qa.key] || 0} pending` : qa.sub;
              const subColor = qa.key && stats && stats[qa.key] > 0 ? "text-red-500" : "text-gray-400";

              return (
                <button
                  key={qa.label}
                  onClick={() => qa.route && navigate(qa.route)}
                  className="flex flex-col items-center gap-1.5 bg-slate-50 hover:bg-sky-50 border
                     border-gray-100 hover:border-sky-200 rounded-xl p-3 transition-all
                     group hover:-translate-y-0.5 hover:shadow-sm cursor-pointer w-full min-w-0"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 ${qa.bg} rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    <qa.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${qa.iconColor}`} />
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-700 text-center leading-tight w-full whitespace-normal line-clamp-2 min-h-[28px] flex items-center justify-center">
                    {qa.label}
                  </p>

                  <p className={`text-[10px] ${subColor} text-center leading-tight font-medium hidden sm:block`}>
                    {dynamicSub}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div >
  );
}
import { useState, useEffect, useCallback } from "react";
import {
    BarChart2, Trophy, AlertTriangle, CheckSquare, TrendingDown,
    ChevronDown, Medal, TrendingUp, RefreshCw, Filter, Info,
} from "lucide-react";

import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import {
    getExams,
    getExamSubjects,
    getClassResultSummary,
    getFailedStudents,
    getSubjectAnalysis,
    getToppers,
    getGradeDistribution,
} from "../../Api/Exams";
import { getActiveClasses, getSectionsByClass } from "../../Api/TeachersAPI";
import { getAcademicYears } from "../../Api/AcademicYear";
import { useDecodedUser } from "../../ContextAPI/UserContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const PASS_LINE = 33;
const SUBJECT_MAX_DISPLAY = 100; // every analytics figure here is already a %, out of 100

const SUBJECT_COLORS = [
    "#6366f1", "#3b82f6", "#8b5cf6", "#a855f7",
    "#10b981", "#f59e0b", "#ef4444", "#06b6d4",
];

const RANK_MEDAL_BG = ["bg-yellow-400", "bg-gray-300", "bg-orange-400"];

const GRADE_STYLES = {
    "A+": { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700" },
    "A": { bar: "bg-green-500", chip: "bg-green-100 text-green-700" },
    "B+": { bar: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
    "B": { bar: "bg-violet-500", chip: "bg-violet-100 text-violet-700" },
    "C": { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700" },
    "D": { bar: "bg-orange-600", chip: "bg-orange-100 text-orange-700" },
    "F": { bar: "bg-red-500", chip: "bg-red-100 text-red-700" },
    "AB": { bar: "bg-gray-400", chip: "bg-gray-100 text-gray-600" },
};
const GRADE_ORDER = ["A+", "A", "B+", "B", "C", "D", "F", "AB"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function subjectColor(index) {
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

function gradeBadgeBg(grade = "") {
    return GRADE_STYLES[grade]?.chip ?? "bg-gray-100 text-gray-600";
}

function safeFixed(val, decimals = 1, fallback = "—") {
    const n = Number(val);
    return isNaN(n) ? fallback : n.toFixed(decimals);
}

function pct(part, total) {
    const p = Number(part), t = Number(total);
    if (!t || isNaN(p) || isNaN(t)) return null;
    return (p / t) * 100;
}

// De-dupe exam-subject configs (one row per section) down to one option per subject
function dedupeSubjects(list) {
    const seen = new Map();
    (list || []).forEach((s) => {
        const key = s.subjectId ?? s.id ?? s.subjectName;
        if (!seen.has(key)) seen.set(key, s);
    });
    return Array.from(seen.values());
}

// ══════════════════════════════════════════════════════════════════
// SELECT
// ══════════════════════════════════════════════════════════════════
function FilterSelect({ label, hint, value, onChange, disabled, children }) {
    return (
        <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
                {label} {hint && <span className="text-gray-400">({hint})</span>}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// STAT CARDS
// ══════════════════════════════════════════════════════════════════
function StatCard({ icon: Icon, iconBg, iconColor, title, value, caption }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 min-w-0">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-none truncate">{value}</p>
            {caption && <p className="text-xs text-gray-400 mt-1.5 truncate">{caption}</p>}
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-7 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// SUBJECT-WISE AVERAGE % BAR CHART
// ══════════════════════════════════════════════════════════════════
function SubjectBarChart({ subjectStats, loading }) {
    const maxVal = 100;
    const passLinePct = (PASS_LINE / maxVal) * 100;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-800">Subject-wise Average %</h2>
            </div>

            <div className="flex items-center gap-4 mb-4 sm:mb-5">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                    <span className="text-xs text-gray-500 font-medium">Avg %</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="text-xs text-gray-500 font-medium">Pass line ({PASS_LINE}%)</span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-6 rounded-full bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : subjectStats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No subject data available.</p>
            ) : (
                <div className="space-y-3 sm:space-y-3.5">
                    {subjectStats.map((sub, idx) => {
                        const color = subjectColor(idx);
                        const raw = Number(sub.avgPercentage);
                        const avg = (!isNaN(raw) && raw > 0) ? raw : 0;
                        const barWidthPct = Math.min((avg / maxVal) * 100, 100);
                        const labelOutside = barWidthPct < 14;
                        const labelText = `${safeFixed(avg)}%`;

                        return (
                            <div key={sub.subjectId ?? sub.subjectName} className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xs text-gray-500 font-medium w-16 sm:w-20 text-right shrink-0 truncate">
                                    {sub.subjectName}
                                </span>

                                <div className="flex-1 relative flex items-center">
                                    <div className="w-full h-5 sm:h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                        {avg > 0 && (
                                            <div
                                                className="h-full rounded-full flex items-center transition-all duration-700"
                                                style={{
                                                    width: `${barWidthPct}%`,
                                                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                                                    paddingLeft: labelOutside ? 0 : "0.5rem",
                                                }}
                                            >
                                                {!labelOutside && (
                                                    <span className="text-white text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
                                                        {labelText}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                                            style={{ left: `${passLinePct}%` }}
                                        />
                                    </div>
                                    {labelOutside && (
                                        <span className="ml-2 text-[11px] font-bold text-gray-700 whitespace-nowrap shrink-0">
                                            {labelText}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// PASS / FAIL PER SUBJECT TABLE
// ══════════════════════════════════════════════════════════════════
function PassFailTable({ subjectStats, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-800">Pass / Fail per Subject</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {["Subject", "Max", "Avg", "Pass", "Fail", "Absent", "Pass %"].map((h) => (
                                <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={7} className="px-3 sm:px-4 py-3">
                                        <div className="h-5 bg-gray-100 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : subjectStats.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-sm text-gray-400">
                                    No data available.
                                </td>
                            </tr>
                        ) : (
                            subjectStats.map((sub, i) => {
                                const total = Number(sub.totalStudents);
                                const passed = Number(sub.passedStudents);
                                const passRate = total > 0 && !isNaN(total) && !isNaN(passed)
                                    ? Math.round((passed / total) * 100)
                                    : 0;
                                return (
                                    <tr
                                        key={sub.subjectId ?? sub.subjectName}
                                        className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                                    >
                                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{sub.subjectName}</td>
                                        <td className="px-3 sm:px-4 py-3 text-gray-500">{SUBJECT_MAX_DISPLAY}</td>
                                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-700">{safeFixed(sub.avgPercentage)}</td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                {sub.passedStudents ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                                                {sub.failedStudents ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                                {sub.absentStudents ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="hidden sm:block w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${passRate >= 80 ? "bg-green-500" : passRate >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                                                        style={{ width: `${passRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{passRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// GRADE DISTRIBUTION  (NEW)
// ══════════════════════════════════════════════════════════════════
function GradeDistributionCard({ gradeDistribution, loading }) {
    const bands = gradeDistribution?.bands || [];
    const bandMap = {};
    bands.forEach((b) => { bandMap[b.grade] = b; });
    const total = gradeDistribution?.totalStudents ?? bands.reduce((s, b) => s + (Number(b.count) || 0), 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-violet-500 shrink-0" />
                    <h2 className="text-sm font-semibold text-gray-800">Grade Distribution</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                    New
                </span>
            </div>

            {loading ? (
                <div className="space-y-2.5">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-6 rounded-full bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : bands.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                    Grade distribution isn't available yet — generate report cards for this exam first.
                </p>
            ) : (
                <div className="space-y-2.5">
                    {GRADE_ORDER.filter((g) => bandMap[g]).map((grade) => {
                        const b = bandMap[grade];
                        const style = GRADE_STYLES[grade] ?? GRADE_STYLES.AB;
                        const widthPct = Math.max(Number(b.percentage) || 0, 3);
                        return (
                            <div key={grade} className="flex items-center gap-2 sm:gap-3">
                                <span className={`w-9 text-center shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${style.chip}`}>
                                    {grade}
                                </span>
                                <div className="flex-1 h-5 sm:h-6 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full flex items-center pl-2 transition-all duration-700 ${style.bar}`}
                                        style={{ width: `${widthPct}%` }}
                                    >
                                        <span className="text-white text-[10px] font-bold whitespace-nowrap">
                                            {safeFixed(b.percentage, 0)}% · {b.count}
                                        </span>
                                    </div>
                                </div>
                                <span className="w-8 text-right text-xs font-semibold text-gray-500 shrink-0">{b.count}</span>
                            </div>
                        );
                    })}
                    <p className="text-xs text-gray-400 text-right pt-1">Total: {total} students</p>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// SECTION-WISE COMPARISON  (NEW)
// ══════════════════════════════════════════════════════════════════
function SectionComparisonCard({ classSummary, sectionFiltered, loading }) {
    const rows = classSummary?.sectionResults || [];
    const bestAvg = rows.length > 0 ? Math.max(...rows.map((r) => Number(r.avgPercentage) || 0)) : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-800">Section-wise Comparison</h2>
            </div>

            {loading ? (
                <div className="p-4 sm:p-5 space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : sectionFiltered ? (
                <p className="text-sm text-gray-400 text-center py-10 px-4">
                    Choose "All Sections" in the filters above to compare sections.
                </p>
            ) : rows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10 px-4">
                    Section comparison isn't available for this exam.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[440px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {["Section", "Students", "Pass", "Fail", "Avg %", "High", "Low"].map((h) => (
                                    <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.sectionId ?? r.sectionName} className="border-b border-gray-50">
                                    <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                                        {r.sectionName}
                                        {bestAvg !== null && Number(r.avgPercentage) === bestAvg && (
                                            <span className="ml-2 text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                                Best avg
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 text-gray-600">{r.totalStudents ?? "—"}</td>
                                    <td className="px-3 sm:px-4 py-3 text-green-700 font-semibold">{r.passedStudents ?? "—"}</td>
                                    <td className="px-3 sm:px-4 py-3 text-red-600 font-semibold">{r.failedStudents ?? "—"}</td>
                                    <td className="px-3 sm:px-4 py-3 font-bold text-gray-800">{safeFixed(r.avgPercentage)}%</td>
                                    <td className="px-3 sm:px-4 py-3 text-gray-600">{safeFixed(r.highestPercentage)}%</td>
                                    <td className="px-3 sm:px-4 py-3 text-gray-600">{safeFixed(r.lowestPercentage)}%</td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/60 font-semibold">
                                <td className="px-3 sm:px-4 py-3 text-gray-800">Class Total</td>
                                <td className="px-3 sm:px-4 py-3 text-gray-700">{classSummary?.totalStudents ?? "—"}</td>
                                <td className="px-3 sm:px-4 py-3 text-green-700">{classSummary?.passedStudents ?? "—"}</td>
                                <td className="px-3 sm:px-4 py-3 text-red-600">{classSummary?.failedStudents ?? "—"}</td>
                                <td className="px-3 sm:px-4 py-3 text-gray-800">{safeFixed(classSummary?.classAvgPercentage)}%</td>
                                <td className="px-3 sm:px-4 py-3 text-gray-400" colSpan={2}>—</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// TOP PERFORMERS TABLE
// ══════════════════════════════════════════════════════════════════
function TopPerformersTable({ toppers, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-800">Top Performers</h2>
            </div>
            {loading ? (
                <div className="p-4 sm:p-5 space-y-2">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : toppers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No topper data available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {["Rank", "Student", "Adm No", "Section", "Sec Rank", "%", "Grade"].map((h) => (
                                    <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {toppers.map((s, i) => {
                                const rankNum = s.classRank ?? i + 1;
                                const medalBg = RANK_MEDAL_BG[i];
                                return (
                                    <tr key={s.studentId} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                                        <td className="px-3 sm:px-4 py-3">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${medalBg ? `${medalBg} text-white` : "bg-gray-100 text-gray-600"}`}>
                                                {rankNum}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{s.studentName}</td>
                                        <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">{s.admissionNumber}</td>
                                        <td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">{s.sectionName ?? "—"}</td>
                                        <td className="px-3 sm:px-4 py-3 text-gray-600">{s.sectionRank ?? "—"}</td>
                                        <td className="px-3 sm:px-4 py-3 font-bold text-gray-800">{safeFixed(s.percentage)}%</td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${gradeBadgeBg(s.overallGrade)}`}>
                                                {s.overallGrade}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// FAILED STUDENTS TABLE
// ══════════════════════════════════════════════════════════════════
function FailedStudentsTable({ failedStudents, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-800">Failed Students</h2>
                {failedStudents.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold">
                        {failedStudents.length}
                    </span>
                )}
            </div>
            {loading ? (
                <div className="p-4 sm:p-5 space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : failedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                    <CheckSquare className="w-10 h-10 mb-2" />
                    <p className="text-sm font-medium">All students passed!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {["Student", "Adm No", "Section", "%", "Grade", "Failed In"].map((h) => (
                                    <th key={h} className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {failedStudents.map((s) => (
                                <tr key={s.studentId} className="border-b border-gray-50 hover:bg-red-50/20 transition-colors">
                                    <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{s.studentName}</td>
                                    <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">{s.admissionNumber}</td>
                                    <td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">{s.sectionName ?? "—"}</td>
                                    <td className="px-3 sm:px-4 py-3 font-bold text-red-600">{safeFixed(s.percentage)}%</td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600">
                                            {s.overallGrade}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(s.failedSubjects || []).map((sub) => (
                                                <span key={sub} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════
export default function Analytics() {
    const { currentAcademicYear } = useDecodedUser();

    // ── meta (loaded once) ──────────────────────────────────────────
    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [metaError, setMetaError] = useState(null);

    // ── filter state ─────────────────────────────────────────────────
    const [yearId, setYearId] = useState("");
    const [classId, setClassId] = useState("");
    const [examId, setExamId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [subjectId, setSubjectId] = useState("");

    // ── class-dependent option lists ────────────────────────────────
    const [exams, setExams] = useState([]);
    const [sections, setSections] = useState([]);
    const [examSubjectOptions, setExamSubjectOptions] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [examsError, setExamsError] = useState(null);

    // ── analytics data ───────────────────────────────────────────────
    const [classSummary, setClassSummary] = useState(null);
    const [subjectStats, setSubjectStats] = useState([]);
    const [toppers, setToppers] = useState([]);
    const [failedStudents, setFailedStudents] = useState([]);
    const [gradeDistribution, setGradeDistribution] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [resultNotDeclared, setResultNotDeclared] = useState(false);

    // ── 1. Academic years + classes, once ───────────────────────────
    useEffect(() => {
        (async () => {
            setLoadingMeta(true);
            try {
                const [yearsRes, cls] = await Promise.all([
                    getAcademicYears(),
                    getActiveClasses(),
                ]);
                const yearsList = yearsRes?.years || [];
                setAcademicYears(yearsList);
                setClasses(Array.isArray(cls) ? cls : []);

                if (currentAcademicYear?.id) {
                    setYearId(String(currentAcademicYear.id));
                } else if (yearsList.length > 0) {
                    setYearId(String(yearsList[0].id));
                }
            } catch {
                setMetaError("Failed to load filters. Please refresh.");
            } finally {
                setLoadingMeta(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 2. Sections + Exams whenever class (or year) changes ───────
    const fetchClassDependent = useCallback(async () => {
        if (!classId) {
            setSections([]); setExams([]); setExamId("");
            return;
        }
        setLoadingExams(true); setExamsError(null);
        try {
            const [sectionsList, examsList] = await Promise.all([
                getSectionsByClass(classId),
                getExams({ classId, academicYearId: yearId || undefined }),
            ]);
            setSections(Array.isArray(sectionsList) ? sectionsList : []);
            const list = Array.isArray(examsList) ? examsList : [];
            setExams(list);
            setExamId(list.length > 0 ? String(list[0].id) : "");
            setSectionId("");
        } catch {
            setExamsError("Failed to load exams for this class.");
            setExams([]); setSections([]); setExamId("");
        } finally {
            setLoadingExams(false);
        }
    }, [classId, yearId]);

    useEffect(() => { fetchClassDependent(); }, [fetchClassDependent]);

    // ── 3. Subject filter options whenever exam changes ────────────
    useEffect(() => {
        (async () => {
            setSubjectId("");
            if (!examId) { setExamSubjectOptions([]); return; }
            try {
                const subs = await getExamSubjects(examId);
                setExamSubjectOptions(dedupeSubjects(subs));
            } catch {
                setExamSubjectOptions([]);
            }
        })();
    }, [examId]);

    // ── 4. Analytics fetch (class-result, subject-analysis, toppers, failed-students, grade-distribution) ─
    const fetchAnalytics = useCallback(async (examIdParam, sectionIdParam, subjectIdParam) => {
        if (!examIdParam) return;
        setLoadingAnalytics(true); setAnalyticsError(null);
        try {
            const [summary, subjects, toppersData, failed, grades] = await Promise.all([
                getClassResultSummary(examIdParam, sectionIdParam || null),
                getSubjectAnalysis(examIdParam, sectionIdParam || null, subjectIdParam || null),
                getToppers(examIdParam, 10, sectionIdParam || null),
                getFailedStudents(examIdParam, sectionIdParam || null),
                getGradeDistribution(examIdParam, sectionIdParam || null),
            ]);
            setClassSummary(summary);
            setSubjectStats(Array.isArray(subjects) ? subjects : []);
            setToppers(Array.isArray(toppersData) ? toppersData : []);
            setFailedStudents(Array.isArray(failed) ? failed : []);
            setGradeDistribution(grades);
        } catch (err) {
            setAnalyticsError(err?.message || "Failed to load analytics data. Please try again.");
            setClassSummary(null); setSubjectStats([]); setToppers([]); setFailedStudents([]); setGradeDistribution(null);
        } finally {
            setLoadingAnalytics(false);
        }
    }, []);

    // Auto-load on first exam selection, and re-fire whenever section / subject change
    // — without ever resetting the chosen exam.
    useEffect(() => {
        if (!examId) return;
        const selectedExam = exams.find((e) => String(e.id) === String(examId));
        if (selectedExam && !selectedExam.resultDeclared) {
            setResultNotDeclared(true);
            setClassSummary(null); setSubjectStats([]); setToppers([]); setFailedStudents([]); setGradeDistribution(null);
            return;
        }
        setResultNotDeclared(false);
        fetchAnalytics(examId, sectionId, subjectId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId, sectionId, subjectId, exams]);

    const handleApply = () => {
        if (examId) fetchAnalytics(examId, sectionId, subjectId);
    };

    // ── derived display values ──────────────────────────────────────
    const selectedClass = classes.find((c) => String(c.id) === String(classId));
    const selectedExam = exams.find((e) => String(e.id) === String(examId));
    const selectedSection = sections.find((s) => String(s.id) === String(sectionId));
    const selectedSubject = examSubjectOptions.find((s) => String(s.subjectId ?? s.id) === String(subjectId));

    const total = Number(classSummary?.totalStudents);
    const passedCount = Number(classSummary?.passedStudents);
    const failedCount = Number(classSummary?.failedStudents);
    const avgPct = Number(classSummary?.classAvgPercentage);
    const topTopper = toppers[0];

    const passRatePct = pct(passedCount, total);
    const failedRatePct = pct(failedCount, total);
    const sectionsCovered = Array.isArray(classSummary?.sectionResults) ? classSummary.sectionResults.length : sections.length;

    const weakestSubject = subjectStats.length > 0
        ? subjectStats.reduce((min, s) => (Number(s.avgPercentage) < Number(min.avgPercentage) ? s : min), subjectStats[0])
        : null;

    const STATS = [
        {
            key: "avg", title: "Class Average",
            value: classSummary && !isNaN(avgPct) ? `${avgPct.toFixed(1)}%` : "—",
            caption: classSummary ? `${sectionsCovered || 0} section${sectionsCovered === 1 ? "" : "s"} · ${total || 0} students` : "No data yet",
            icon: BarChart2, iconBg: "bg-blue-50", iconColor: "text-blue-600",
        },
        {
            key: "high", title: "Highest Score",
            value: topTopper ? `${safeFixed(topTopper.percentage)}%` : "—",
            caption: topTopper ? `${topTopper.studentName}${topTopper.sectionName ? ` · ${topTopper.sectionName}` : ""}` : "No data yet",
            icon: Trophy, iconBg: "bg-yellow-50", iconColor: "text-yellow-600",
        },
        {
            key: "failed", title: "Failed Students",
            value: classSummary ? `${failedCount || 0}` : "—",
            caption: failedRatePct != null ? `${failedRatePct.toFixed(1)}% of class` : "No data yet",
            icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500",
        },
        {
            key: "pass", title: "Pass Rate",
            value: passRatePct != null ? `${passRatePct.toFixed(1)}%` : "—",
            caption: classSummary ? `${passedCount || 0} of ${total || 0} passed` : "No data yet",
            icon: CheckSquare, iconBg: "bg-green-50", iconColor: "text-green-600",
        },
        {
            key: "weak", title: "Weakest Subject",
            value: weakestSubject ? weakestSubject.subjectName : "—",
            caption: weakestSubject ? `Avg ${safeFixed(weakestSubject.avgPercentage)}% · ${weakestSubject.failedStudents ?? 0} failed` : "No data yet",
            icon: TrendingDown, iconBg: "bg-pink-50", iconColor: "text-pink-600",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f3f6fb] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <TooltipComponent message="Efficiently manage analytics." direction="right" color="nocolor">
                        Manage Analytics
                    </TooltipComponent>
                </h2>
            </div>

            {/* ── error banners ─────────────────────────────────────── */}
            {metaError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {metaError}
                    <button onClick={() => window.location.reload()} className="ml-auto text-xs font-medium underline shrink-0">Refresh</button>
                </div>
            )}
            {examsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {examsError}
                    <button onClick={fetchClassDependent} className="ml-auto text-xs font-medium underline shrink-0">Retry</button>
                </div>
            )}
            {analyticsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {analyticsError}
                    <button onClick={handleApply} className="ml-auto flex items-center gap-1 text-xs font-medium underline hover:no-underline shrink-0">
                        <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                </div>
            )}

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-gray-800">Filters</h2>
                    <span className="text-xs text-gray-400">Section &amp; Subject are optional — leave blank for all</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_1fr_1fr_auto] gap-3">
                    <FilterSelect
                        label="Academic Year"
                        value={yearId}
                        disabled={loadingMeta}
                        onChange={(e) => { setYearId(e.target.value); setClassId(""); }}
                    >
                        {academicYears.length === 0 ? (
                            <option value="">No years</option>
                        ) : (
                            academicYears.map((y) => {
                                const isCurrent = currentAcademicYear?.id === y.id;
                                return (
                                    <option key={y.id} value={y.id}>
                                        {isCurrent ? "🟢 " : ""}{y.label ?? y.name ?? y.value}{isCurrent ? " (Current)" : ""}
                                    </option>
                                );
                            })
                        )}
                    </FilterSelect>

                    <FilterSelect
                        label="Class"
                        value={classId}
                        disabled={loadingMeta || !yearId}
                        onChange={(e) => setClassId(e.target.value)}
                    >
                        <option value="">Select class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </FilterSelect>

                    <FilterSelect
                        label="Exam"
                        value={examId}
                        disabled={!classId || loadingExams}
                        onChange={(e) => setExamId(e.target.value)}
                    >
                        {exams.length === 0 ? (
                            <option value="">{loadingExams ? "Loading…" : "No exams"}</option>
                        ) : (
                            exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)
                        )}
                    </FilterSelect>

                    <FilterSelect
                        label="Section"
                        hint="optional"
                        value={sectionId}
                        disabled={!classId || loadingExams}
                        onChange={(e) => setSectionId(e.target.value)}
                    >
                        <option value="">All Sections</option>
                        {sections.map((s) => <option key={s.id} value={s.id}>{s.name ?? s.sectionName}</option>)}
                    </FilterSelect>

                    <FilterSelect
                        label="Subject"
                        hint="optional"
                        value={subjectId}
                        disabled={!examId}
                        onChange={(e) => setSubjectId(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {examSubjectOptions.map((s) => (
                            <option key={s.subjectId ?? s.id} value={s.subjectId ?? s.id}>{s.subjectName}</option>
                        ))}
                    </FilterSelect>

                    <div className="flex items-end">
                        <button
                            onClick={handleApply}
                            disabled={!examId || loadingAnalytics}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loadingAnalytics ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                            Apply
                        </button>
                    </div>
                </div>

                <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                        Pick an Academic Year and Class to load exams. Section and Subject stay optional —
                        changing either updates the report right away without losing your selected exam.
                    </p>
                </div>

                {selectedExam && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-gray-400">Showing:</span>
                        {selectedClass && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{selectedClass.name}</span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{selectedExam.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {selectedSection?.name ?? selectedSection?.sectionName ?? "All Sections"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {selectedSubject?.subjectName ?? "All Subjects"}
                        </span>
                    </div>
                )}
            </div>

            {!examId ? (
                <div className="bg-white border border-gray-200 text-gray-400 text-sm rounded-2xl px-4 sm:px-5 py-10 text-center">
                    Select an academic year, class and exam above to view analytics.
                </div>
            ) : resultNotDeclared ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-2xl px-4 sm:px-5 py-8 flex flex-col items-center text-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    <p className="font-medium">Result not declared yet for this exam.</p>
                    <p className="text-xs text-amber-600">Declare the result from the Exams page to unlock analytics.</p>
                </div>
            ) : (
                <>
                    {/* ── stat cards ─────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        {loadingAnalytics
                            ? Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                            : STATS.map((s) => (
                                <StatCard
                                    key={s.key}
                                    icon={s.icon}
                                    iconBg={s.iconBg}
                                    iconColor={s.iconColor}
                                    title={s.title}
                                    value={s.value}
                                    caption={s.caption}
                                />
                            ))
                        }
                    </div>

                    {/* ── subject avg chart + pass/fail table ──────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <SubjectBarChart subjectStats={subjectStats} loading={loadingAnalytics} />
                        <PassFailTable subjectStats={subjectStats} loading={loadingAnalytics} />
                    </div>

                    {/* ── grade distribution + section comparison ─────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <GradeDistributionCard gradeDistribution={gradeDistribution} loading={loadingAnalytics} />
                        <SectionComparisonCard classSummary={classSummary} sectionFiltered={!!sectionId} loading={loadingAnalytics} />
                    </div>

                    {/* ── top performers + failed students ─────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <TopPerformersTable toppers={toppers} loading={loadingAnalytics} />
                        <FailedStudentsTable failedStudents={failedStudents} loading={loadingAnalytics} />
                    </div>
                </>
            )}
        </div>
    );
}
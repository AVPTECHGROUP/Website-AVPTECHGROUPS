import { useState, useEffect, useCallback } from "react";
import {
    BarChart2, Trophy, AlertTriangle, CheckSquare, TrendingDown,
    ChevronDown, Medal, TrendingUp, RefreshCw, Filter, Info, Layers
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
    getExamEventSummary,
    getClassPerformanceTrend,
    getExamEvents,
} from "../../Api/Academics/Exams";
import { getActiveClasses, getSectionsByClass } from "../../Api/Teachers/TeachersAPI";
import { getAcademicYears } from "../../Api/AcademicYears/AcademicYear";
import { useDecodedUser } from "../../ContextAPI/UserContext";
import { EXAM_CONSTS } from "../../Constants/StringConstants/AcademicsConstants";

// ─── Constants ────────────────────────────────────────────────────────────────
const PASS_LINE = 33;
const SUBJECT_MAX_DISPLAY = 100;

const SUBJECT_COLORS = [
    "#4f46e5", "#3b82f6", "#6366f1", "#a855f7",
    "#10b981", "#f59e0b", "#ef4444", "#06b6d4",
];

const RANK_MEDAL_BG = ["bg-amber-400", "bg-slate-300", "bg-amber-600"];

const GRADE_STYLES = {
    "A+": { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700" },
    "A": { bar: "bg-green-500", chip: "bg-green-100 text-green-700" },
    "B+": { bar: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
    "B": { bar: "bg-violet-500", chip: "bg-violet-100 text-violet-700" },
    "C": { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700" },
    "D": { bar: "bg-orange-500", chip: "bg-orange-100 text-orange-700" },
    "F": { bar: "bg-red-500", chip: "bg-red-100 text-red-700" },
    "AB": { bar: "bg-slate-400", chip: "bg-slate-100 text-slate-600" },
};
const GRADE_ORDER = ["A+", "A", "B+", "B", "C", "D", "F", "AB"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function subjectColor(index) {
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

function gradeBadgeBg(grade = "") {
    return GRADE_STYLES[grade]?.chip ?? "bg-gray-100 text-gray-600";
}

function safeFixed(val, decimals = 1, fallback = EXAM_CONSTS.ANALYTICS.FALLBACK_DASH) {
    const n = Number(val);
    return isNaN(n) ? fallback : n.toFixed(decimals);
}

function dedupeSubjects(list) {
    const seen = new Map();
    (list || []).forEach((s) => {
        const key = s.subjectId ?? s.id ?? s.subjectName;
        if (!seen.has(key)) seen.set(key, s);
    });
    return Array.from(seen.values());
}

// ─── Filter Dropdown Menu Selector ────────────────────────────────────────────
function FilterSelect({ label, hint, value, onChange, disabled, children }) {
    return (
        <div className="min-w-0 flex-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {label} {hint && <span className="normal-case font-medium text-slate-400">({hint})</span>}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 h-12 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}

// ─── Component: Event Summary Panel ───
function EventSummaryPanel({ summaryData, examName, loading }) {
    if (loading) {
        return <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse h-64" />;
    }
    if (!summaryData) return null;

    const classResults = summaryData.classResults || [];
    const totalClasses = summaryData.totalClasses ?? classResults.length;
    const totalSections = summaryData.totalSections ?? classResults.reduce((acc, c) => acc + (c.sectionResults?.length || 1), 0);
    const calculatedPassRate = summaryData.totalStudents > 0 ? (summaryData.passedStudents / summaryData.totalStudents) * 100 : 0;
    const schoolAvg = summaryData.schoolAvgPercentage ?? 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <h3 className="text-sm font-bold text-gray-800">
                        {EXAM_CONSTS.ANALYTICS.EVENT_SUMMARY}{summaryData.eventName || examName || "Selected Event"}
                    </h3>
                    <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {EXAM_CONSTS.ANALYTICS.ALL_CLASSES}
                    </span>
                </div>

            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50/40 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{totalClasses}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">{EXAM_CONSTS.ANALYTICS.CLASSES}</p>
                </div>
                <div className="bg-gray-50/40 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{totalSections}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">{EXAM_CONSTS.ANALYTICS.SECTIONS}</p>
                </div>
                <div className="bg-gray-50/40 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">{safeFixed(calculatedPassRate)}%</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">{EXAM_CONSTS.ANALYTICS.OVERALL_PASS}</p>
                </div>
                <div className="bg-gray-50/40 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{safeFixed(schoolAvg)}%</p>
                    <p className="text-xs font-semibold text-gray-400 mt-1">{EXAM_CONSTS.ANALYTICS.SCHOOL_AVG}</p>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{EXAM_CONSTS.ANALYTICS.PASS_RATE_BY_CLASS}</h4>
                <div className="space-y-3.5">
                    {classResults.map((cls, idx) => {
                        const passRate = cls.passRate !== null ? Number(cls.passRate) : Number(cls.avgPercentage) || 0;

                        let barTheme = "bg-emerald-500";
                        let pillTheme = "bg-emerald-50 text-emerald-700 border-emerald-100";

                        if (cls.className?.toLowerCase().includes("10")) {
                            barTheme = "bg-blue-500";
                            pillTheme = "bg-blue-50 text-blue-700 border-blue-100";
                        } else if (cls.className?.toLowerCase().includes("11")) {
                            barTheme = "bg-purple-500";
                            pillTheme = "bg-purple-50 text-purple-700 border-purple-100";
                        } else if (!cls.resultDeclared) {
                            barTheme = "bg-slate-300";
                            pillTheme = "bg-slate-50 text-slate-600 border-slate-200";
                        }

                        return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                                <span className="w-20 font-bold text-gray-600 shrink-0">{cls.className}</span>
                                <div className="flex-1 h-6 bg-gray-50 rounded-md overflow-hidden relative flex items-center border border-gray-100">
                                    <div
                                        className={`h-full flex items-center pl-3 transition-all duration-500 rounded-md ${barTheme}`}
                                        style={{ width: `${passRate || 4}%` }}
                                    >
                                        {passRate > 0 && <span className="text-white font-black text-[11px]">{safeFixed(passRate)}%</span>}
                                    </div>
                                    {!cls.resultDeclared && (
                                        <span className="text-gray-400 font-bold text-[11px] ml-3 italic">{EXAM_CONSTS.ANALYTICS.RESULT_UNDECLARED}</span>
                                    )}
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${pillTheme}`}>
                                    {cls.sectionResults?.length || 1} {EXAM_CONSTS.ANALYTICS.SECTIONS.toLowerCase()} · {cls.totalStudents ?? 0} {EXAM_CONSTS.ANALYTICS.STUDENTS.toLowerCase()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Component: Performance Trend Timeline ───────────────────────────────────
function PerformanceTrendCard({ trendData, currentExamId, currentClassName, loading }) {
    if (loading) {
        return <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm animate-pulse h-56" />;
    }
    const points = trendData?.points || [];
    if (points.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-800">
                        {EXAM_CONSTS.ANALYTICS.PERF_TREND}{currentClassName || EXAM_CONSTS.ANALYTICS.LBL_CLASS} — {trendData?.academicYearLabel || ""}
                    </h3>

                </div>
            </div>

            <div className="space-y-3.5 relative">
                {points.map((pt, i) => {
                    const isCurrent = String(pt.examId) === String(currentExamId);
                    const isUndeclared = !pt.resultDeclared || pt.avgPercentage === null;
                    const val = isUndeclared ? 0 : Number(pt.avgPercentage);

                    let barColor = "bg-indigo-600";
                    if (pt.examName?.toLowerCase().includes("unit test 1")) barColor = "bg-slate-400";
                    else if (pt.examName?.toLowerCase().includes("unit test 2")) barColor = "bg-purple-500";

                    return (
                        <div key={pt.examId || i} className="flex items-center gap-4">
                            <div className="w-32 text-right shrink-0">
                                <span className={`text-xs font-semibold ${isCurrent ? "text-indigo-600 font-bold" : "text-gray-500"}`}>
                                    {pt.examName} {isCurrent && <span className="text-indigo-500 ml-1 font-bold">{EXAM_CONSTS.ANALYTICS.NOW}</span>}
                                </span>
                            </div>

                            <div className="flex-1 h-7 bg-gray-50 rounded-md overflow-hidden relative flex items-center border border-gray-100/70">
                                {!isUndeclared ? (
                                    <div
                                        className={`h-full flex items-center pl-3 transition-all duration-500 ${barColor}`}
                                        style={{ width: `${val}%` }}
                                    >
                                        <span className="text-white font-black text-[11px]">{safeFixed(val)}%</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-100/40 flex items-center pl-3">
                                        <span className="text-gray-300 font-medium text-xs italic">{EXAM_CONSTS.ANALYTICS.UNDECLARED_TIMELINE}</span>
                                    </div>
                                )}
                                <div
                                    className="absolute top-0 bottom-0 w-0 border-l border-dashed border-red-500/80 z-20"
                                    style={{ left: `${PASS_LINE}%` }}
                                />
                            </div>

                            <div className="w-12 text-left shrink-0">
                                <span className={`text-xs font-bold ${isCurrent ? "text-indigo-600" : "text-gray-500"}`}>
                                    {!isUndeclared ? `${safeFixed(val)}%` : EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Individual Dashboard KPI Cards ──────────────────────────────────────────
function StatCard({ title, value, caption, icon: Icon, iconBg, iconColor }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{title}</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">{value}</p>
                </div>
                <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
            </div>
            {caption && <p className="text-xs font-medium text-gray-500 mt-2 truncate bg-gray-50 px-2 py-1 rounded border border-gray-100/50">{caption}</p>}
        </div>
    );
}

function StatCardSkeleton() {
    return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse h-28" />;
}

// ─── Subject Average Graphic Chart ─────────────────
function SubjectBarChart({ subjectStats, loading }) {
    const maxVal = 100;
    const passLinePct = (PASS_LINE / maxVal) * 100;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h3 className="text-sm font-bold text-gray-800">{EXAM_CONSTS.ANALYTICS.SUB_WISE_AVG}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        <span className="text-[11px] text-gray-500 font-medium">{EXAM_CONSTS.ANALYTICS.AVG_PCT}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-[11px] text-gray-500 font-medium">{EXAM_CONSTS.ANALYTICS.PASS_LINE} ({PASS_LINE}%)</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3 py-2">
                    {Array(5).fill(0).map((_, i) => <div key={i} className="h-6 rounded bg-gray-100 animate-pulse" />)}
                </div>
            ) : subjectStats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">{EXAM_CONSTS.ANALYTICS.NO_SUB_METRICS}</p>
            ) : (
                <div className="space-y-3.5">
                    {subjectStats.map((sub, idx) => {
                        const color = subjectColor(idx);
                        const raw = Number(sub.avgPercentage);
                        const avg = (!isNaN(raw) && raw > 0) ? raw : 0;
                        const barWidthPct = Math.min((avg / maxVal) * 100, 100);
                        const labelOutside = barWidthPct < 15;
                        const isFailing = avg < PASS_LINE;

                        return (
                            <div key={sub.subjectId ?? sub.subjectName} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-600 w-20 text-right truncate">
                                    {sub.subjectName}
                                </span>

                                <div className="flex-1 relative flex items-center">
                                    <div className="w-full h-6 bg-gray-100 rounded-md overflow-hidden relative">
                                        {avg > 0 && (
                                            <div
                                                className="h-full flex items-center transition-all duration-500"
                                                style={{
                                                    width: `${barWidthPct}%`,
                                                    backgroundColor: isFailing ? "#ef4444" : color,
                                                    paddingLeft: labelOutside ? 0 : "0.5rem",
                                                }}
                                            >
                                                {!labelOutside && (
                                                    <span className="text-white text-[11px] font-black">
                                                        {safeFixed(avg)}%
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 border-dashed"
                                            style={{ left: `${passLinePct}%` }}
                                        />
                                    </div>
                                    {labelOutside && (
                                        <span className="ml-2 text-[11px] font-black text-gray-700">
                                            {safeFixed(avg)}%
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

// ─── Pass / Fail Matrix Table Layout ───────────────
function PassFailTable({ subjectStats, loading }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/20 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-800">{EXAM_CONSTS.ANALYTICS.PASS_FAIL_SUB}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3">{EXAM_CONSTS.ANALYTICS.LBL_SUBJECT}</th>
                                <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.MAX}</th>
                                <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.AVG.trim()}</th>
                                <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.PASS}</th>
                                <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.FAIL.trim()}</th>
                                <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.ABS}</th>
                                <th className="px-4 py-3 text-right">{EXAM_CONSTS.ANALYTICS.PASS_RATE.replace('Rate', '%')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="p-4"><div className="h-5 bg-gray-50 rounded animate-pulse" /></td></tr>
                                ))
                            ) : subjectStats.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">{EXAM_CONSTS.ANALYTICS.NO_DATA}</td></tr>
                            ) : (
                                subjectStats.map((sub) => {
                                    const total = Number(sub.totalStudents || 0);
                                    const passed = Number(sub.passedStudents || 0);
                                    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
                                    return (
                                        <tr key={sub.subjectId ?? sub.subjectName} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-gray-900">{sub.subjectName}</td>
                                            <td className="px-3 py-3 text-gray-400">{SUBJECT_MAX_DISPLAY}</td>
                                            <td className="px-3 py-3 font-bold">{safeFixed(sub.avgPercentage)}</td>
                                            <td className="px-3 py-3"><span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">{sub.passedStudents ?? 0}</span></td>
                                            <td className="px-3 py-3"><span className="text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">{sub.failedStudents ?? 0}</span></td>
                                            <td className="px-3 py-3 text-gray-400">{sub.absentStudents ?? 0}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className={`h-full rounded-full ${passRate >= 75 ? "bg-emerald-500" : passRate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                                            style={{ width: `${passRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{passRate}%</span>
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
        </div>
    );
}

// ─── Grade Distribution Card Summary Layer ───────────────────────────────
function GradeDistributionCard({ gradeDistribution, loading }) {
    const bands = gradeDistribution?.bands || [];
    const bandMap = {};
    bands.forEach((b) => { bandMap[b.grade] = b; });
    const total = gradeDistribution?.totalStudents ?? bands.reduce((s, b) => s + (Number(b.count) || 0), 0);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-violet-600 shrink-0" />
                    <h3 className="text-sm font-bold text-gray-800">{EXAM_CONSTS.ANALYTICS.GRADE_DIST}</h3>
                </div>

            </div>

            {loading ? (
                <div className="space-y-2.5 py-2">
                    {Array(4).fill(0).map((_, i) => <div key={i} className="h-6 rounded bg-gray-100 animate-pulse" />)}
                </div>
            ) : bands.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">{EXAM_CONSTS.ANALYTICS.GRADE_MISSING}</p>
            ) : (
                <div className="space-y-2.5">
                    {GRADE_ORDER.map((grade) => {
                        const b = bandMap[grade] || { count: 0, percentage: 0 };
                        const style = GRADE_STYLES[grade] ?? GRADE_STYLES.AB;
                        const widthPct = Math.max(Number(b.percentage) || 0, 0);

                        return (
                            <div key={grade} className="flex items-center gap-3">
                                <span className={`w-10 text-center text-xs font-bold py-0.5 rounded-md ${style.chip}`}>
                                    {grade}
                                </span>
                                <div className="flex-1 h-6 bg-gray-50 rounded-md overflow-hidden relative flex items-center">
                                    {widthPct > 0 && (
                                        <div
                                            className={`h-full flex items-center pl-2.5 transition-all duration-500 ${style.bar}`}
                                            style={{ width: `${widthPct}%` }}
                                        >
                                            {widthPct > 15 && (
                                                <span className="text-white text-[11px] font-bold">
                                                    {Math.round(widthPct)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {widthPct <= 15 && widthPct > 0 && (
                                        <span className="text-gray-700 text-[11px] font-bold ml-2">
                                            {Math.round(widthPct)}%
                                        </span>
                                    )}
                                </div>
                                <span className="w-8 text-right text-xs font-bold text-gray-500">{b.count}</span>
                            </div>
                        );
                    })}
                    <div className="text-right pt-2 border-t border-gray-50 text-xs text-gray-400 font-medium">
                        {EXAM_CONSTS.ANALYTICS.TOTAL}{total}{EXAM_CONSTS.ANALYTICS.TOTAL_VERIFIED}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Section Comparative Component Table ──────────────────────────────────────
function SectionComparisonCard({ classSummary, sectionFiltered, loading }) {
    const rows = classSummary?.sectionResults || [];
    const bestAvg = rows.length > 0 ? Math.max(...rows.map((r) => Number(r.avgPercentage) || 0)) : null;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/20 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-800">{EXAM_CONSTS.ANALYTICS.SEC_WISE_COMP}</h3>
                </div>

                {loading ? (
                    <div className="p-5 space-y-3">
                        {Array(3).fill(0).map((_, i) => <div key={i} className="h-7 bg-gray-50 rounded animate-pulse" />)}
                    </div>
                ) : sectionFiltered ? (
                    <div className="p-8 text-center text-sm text-gray-400 font-medium">
                        {EXAM_CONSTS.ANALYTICS.SELECT_ALL_SEC_VIS}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400 font-medium">
                        {EXAM_CONSTS.ANALYTICS.NO_COMP_ROWS}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-4 py-3">{EXAM_CONSTS.ANALYTICS.LBL_SECTION}</th>
                                    <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.STUDENTS}</th>
                                    <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.PASS}</th>
                                    <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.FAIL.trim()}</th>
                                    <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.AVG_PCT}</th>
                                    <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.HIGH}</th>
                                    <th className="px-4 py-3 text-right">{EXAM_CONSTS.ANALYTICS.LOW}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                                {rows.map((r) => (
                                    <tr key={r.sectionId ?? r.sectionName} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                                            {r.sectionName}
                                            {bestAvg !== null && Number(r.avgPercentage) === bestAvg && (
                                                <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/50">
                                                    {EXAM_CONSTS.ANALYTICS.BEST_AVG}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">{r.totalStudents ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                        <td className="px-3 py-3 text-emerald-600 font-bold">{r.passedStudents ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                        <td className="px-3 py-3 text-red-500 font-bold">{r.failedStudents ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                        <td className="px-3 py-3 font-black text-gray-900">{safeFixed(r.avgPercentage)}%</td>
                                        <td className="px-3 py-3 text-gray-600">{safeFixed(r.highestPercentage)}%</td>
                                        <td className="px-4 py-3 text-right text-gray-400">{safeFixed(r.lowestPercentage)}%</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50/40 font-bold text-gray-900 border-t border-gray-100">
                                    <td className="px-4 py-3 text-indigo-600">{EXAM_CONSTS.ANALYTICS.CLASS_TOTAL}</td>
                                    <td className="px-3 py-3">{classSummary?.totalStudents ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                    <td className="px-3 py-3 text-emerald-600">{classSummary?.passedStudents ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                    <td className="px-3 py-3 text-red-500">{classSummary?.failedStudents ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                    <td className="px-3 py-3 font-black text-indigo-600">{safeFixed(classSummary?.classAvgPercentage)}%</td>
                                    <td colSpan={2} className="px-4 py-3 text-right text-gray-300">{EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Top Performers List ──────────────────────────────────────────────────────
function TopPerformersTable({ toppers, loading }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/20 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-800">{EXAM_CONSTS.ANALYTICS.TOP_PERFORMERS}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-3 w-16">{EXAM_CONSTS.ANALYTICS.RANK}</th>
                            <th className="px-4 py-3">{EXAM_CONSTS.ANALYTICS.STUDENT}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.ADM_NO}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.LBL_SECTION}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.SEC_RANK}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.PERCENTAGE}</th>
                            <th className="px-4 py-3 text-right">{EXAM_CONSTS.ANALYTICS.GRADE}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i}><td colSpan={7} className="p-4"><div className="h-5 bg-gray-50 rounded animate-pulse" /></td></tr>
                            ))
                        ) : toppers.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">{EXAM_CONSTS.ANALYTICS.NO_PARAMS}</td></tr>
                        ) : (
                            toppers.map((s, idx) => {
                                const rankNum = s.classRank ?? idx + 1;
                                const medalStyle = RANK_MEDAL_BG[idx] ? `${RANK_MEDAL_BG[idx]} text-white` : "bg-gray-100 text-gray-600";
                                return (
                                    <tr key={s.studentId} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${medalStyle}`}>
                                                {rankNum}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 font-bold text-gray-900">{s.studentName}</td>
                                        <td className="px-3 py-2.5 text-gray-400 font-mono text-xs">{s.admissionNumber}</td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-600">{s.sectionName ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                        <td className="px-3 py-2.5 text-gray-500 font-bold">{s.sectionRank ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                        <td className="px-3 py-2.5 font-black text-indigo-600">{safeFixed(s.percentage)}%</td>
                                        <td className="px-4 py-2.5 text-right">
                                            <span className={`px-2 py-0.5 rounded font-black text-xs ${gradeBadgeBg(s.overallGrade)}`}>
                                                {s.overallGrade || EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}
                                            </span>
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

// ─── Failed Student Profiles List ─────────────────────────────────────────────
function FailedStudentsTable({ failedStudents, loading }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-gray-800">{EXAM_CONSTS.ANALYTICS.FAILED_STUDENTS}</h3>
                {failedStudents.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-0.5 rounded-full">
                        {failedStudents.length}
                    </span>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-3">{EXAM_CONSTS.ANALYTICS.STUDENT}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.ADM_NO}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.LBL_SECTION}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.PERCENTAGE}</th>
                            <th className="px-3 py-3">{EXAM_CONSTS.ANALYTICS.GRADE}</th>
                            <th className="px-4 py-3 text-right">{EXAM_CONSTS.ANALYTICS.FAILED_IN}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i}><td colSpan={6} className="p-4"><div className="h-5 bg-gray-50 rounded animate-pulse" /></td></tr>
                            ))
                        ) : failedStudents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-emerald-600 font-bold bg-emerald-50/20">
                                    <CheckSquare className="w-6 h-6 mx-auto mb-1 text-emerald-500" /> {EXAM_CONSTS.ANALYTICS.ALL_PASSED}
                                </td>
                            </tr>
                        ) : (
                            failedStudents.map((s) => (
                                <tr key={s.studentId} className="hover:bg-red-50/10 transition-colors">
                                    <td className="px-4 py-3 font-bold text-gray-900">{s.studentName}</td>
                                    <td className="px-3 py-3 text-gray-400 font-mono text-xs">{s.admissionNumber}</td>
                                    <td className="px-3 py-3 font-semibold text-gray-600">{s.sectionName ?? EXAM_CONSTS.ANALYTICS.FALLBACK_DASH}</td>
                                    <td className="px-3 py-3 text-red-600 font-black">{safeFixed(s.percentage)}%</td>
                                    <td className="px-3 py-3"><span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-black text-xs">F</span></td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-wrap justify-end gap-1">
                                            {(s.failedSubjects || []).map((sub, i) => (
                                                <span key={i} className="bg-red-100/60 border border-red-200 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Controller Component ─────
export default function Analytics() {
    const { currentAcademicYear } = useDecodedUser();

    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [metaError, setMetaError] = useState(null);

    const [yearId, setYearId] = useState("");
    const [classId, setClassId] = useState("");
    const [examId, setExamId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [subjectId, setSubjectId] = useState("");

    const [exams, setExams] = useState([]);
    const [sections, setSections] = useState([]);
    const [examSubjectOptions, setExamSubjectOptions] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [examsError, setExamsError] = useState(null);

    const [eventSummary, setEventSummary] = useState(null);
    const [classSummary, setClassSummary] = useState(null);
    const [subjectStats, setSubjectStats] = useState([]);
    const [toppers, setToppers] = useState([]);
    const [failedStudents, setFailedStudents] = useState([]);
    const [gradeDistribution, setGradeDistribution] = useState(null);
    const [performanceTrend, setPerformanceTrend] = useState(null);

    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [resultNotDeclared, setResultNotDeclared] = useState(false);

    useEffect(() => {
        (async () => {
            setLoadingMeta(true);
            try {
                const [yearsRes, cls] = await Promise.all([
                    getAcademicYears(),
                    getActiveClasses(),
                ]);
                const yearsList = yearsRes || [];
                setAcademicYears(yearsList);
                setClasses(Array.isArray(cls) ? cls : []);

                if (currentAcademicYear?.id) {
                    setYearId(String(currentAcademicYear.id));
                } else if (yearsList.length > 0) {
                    setYearId(String(yearsList[0].id));
                }
            } catch {
                setMetaError(EXAM_CONSTS.ANALYTICS.ERR_META);
            } finally {
                setLoadingMeta(false);
            }
        })();
    }, [currentAcademicYear]);

    const fetchClassDependent = useCallback(async () => {
        if (!classId) {
            setSections([]); setExams([]); setExamId(""); return;
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
            setExamsError(EXAM_CONSTS.ANALYTICS.ERR_EXAMS);
            setExams([]); setSections([]); setExamId("");
        } finally {
            setLoadingExams(false);
        }
    }, [classId, yearId]);

    useEffect(() => { fetchClassDependent(); }, [fetchClassDependent]);

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

    // ─── Parallel Pipeline Execution Logic ───
    const fetchAnalytics = useCallback(async (targetExamId, targetSectionId, targetSubjectId, fallbackExamsList) => {
        if (!targetExamId) return;
        setLoadingAnalytics(true);
        setAnalyticsError(null);

        const activeExamsArray = fallbackExamsList || exams;
        const selectedExamObj = activeExamsArray.find((e) => String(e.id) === String(targetExamId));

        let matchedEventId = selectedExamObj?.examEventId || selectedExamObj?.eventId || selectedExamObj?.examEvent?.id || selectedExamObj?.exam_event_id;
        const isDeclared = selectedExamObj?.resultDeclared ?? true;

        setResultNotDeclared(!isDeclared);

        try {
            if (!matchedEventId && yearId) {
                try {
                    const globalEvents = await getExamEvents({ academicYearId: yearId });
                    const match = globalEvents.find(evt =>
                        String(evt.id) === String(targetExamId) ||
                        evt.name?.toLowerCase() === selectedExamObj?.name?.toLowerCase() ||
                        (evt.exams && evt.exams.some(ex => String(ex.id) === String(targetExamId)))
                    );
                    if (match) matchedEventId = match.id;
                } catch (e) {
                    console.warn("Event auto-resolution fallback bypass.", e);
                }
            }

            const [crossClassSummary, trend] = await Promise.all([
                matchedEventId ? getExamEventSummary(matchedEventId).catch(() => null) : Promise.resolve(null),
                getClassPerformanceTrend(classId, yearId).catch(() => null)
            ]);

            setEventSummary(crossClassSummary);
            setPerformanceTrend(trend);

            if (isDeclared) {
                const [summary, subjects, toppersData, failed, grades] = await Promise.all([
                    getClassResultSummary(targetExamId, targetSectionId || null),
                    getSubjectAnalysis(targetExamId, targetSectionId || null, targetSubjectId || null),
                    getToppers(targetExamId, 10, targetSectionId || null),
                    getFailedStudents(targetExamId, targetSectionId || null),
                    getGradeDistribution(targetExamId, targetSectionId || null),
                ]);

                setClassSummary(summary);
                setSubjectStats(Array.isArray(subjects) ? subjects : []);
                setToppers(Array.isArray(toppersData) ? toppersData : []);
                setFailedStudents(Array.isArray(failed) ? failed : []);
                setGradeDistribution(grades);
            } else {
                setClassSummary(null); setSubjectStats([]); setToppers([]); setFailedStudents([]); setGradeDistribution(null);
            }
        } catch (err) {
            setAnalyticsError(err?.message || EXAM_CONSTS.ANALYTICS.ERR_SYNC);
        } finally {
            setLoadingAnalytics(false);
        }
    }, [exams, classId, yearId]);

    useEffect(() => {
        if (!examId || exams.length === 0) return;
        fetchAnalytics(examId, sectionId, subjectId, exams);
    }, [examId, sectionId, subjectId, exams, fetchAnalytics]);

    const handleApply = () => {
        if (examId) fetchAnalytics(examId, sectionId, subjectId, exams);
    };

    const selectedClass = classes.find((c) => String(c.id) === String(classId));
    const selectedExam = exams.find((e) => String(e.id) === String(examId));
    const total = Number(classSummary?.totalStudents || 0);
    const passedCount = Number(classSummary?.passedStudents || 0);
    const failedCount = Number(classSummary?.failedStudents || 0);
    const avgPct = Number(classSummary?.classAvgPercentage || 0);
    const topTopper = toppers[0];

    const passRatePct = total > 0 ? (passedCount / total) * 100 : 0;
    const failedRatePct = total > 0 ? (failedCount / total) * 100 : 0;
    const sectionsCovered = Array.isArray(classSummary?.sectionResults) ? classSummary.sectionResults.length : sections.length;

    const cleanSubjectStats = subjectStats.filter(sub => Number(sub.totalStudents || 0) > 0 || Number(sub.avgPercentage || 0) > 0);

    const weakestSubject = cleanSubjectStats.length > 0
        ? cleanSubjectStats.reduce((min, s) => (Number(s.avgPercentage) < Number(min.avgPercentage) ? s : min), cleanSubjectStats[0])
        : null;

    const STATS_CONFIG = [
        {
            title: EXAM_CONSTS.ANALYTICS.CLASS_AVG, value: classSummary ? `${avgPct.toFixed(1)}%` : EXAM_CONSTS.ANALYTICS.FALLBACK_DASH,
            caption: classSummary ? `${sectionsCovered} sections · ${total} students` : EXAM_CONSTS.ANALYTICS.AWAITING,
            icon: BarChart2, iconBg: "bg-blue-50", iconColor: "text-blue-600",
        },
        {
            title: EXAM_CONSTS.ANALYTICS.HIGH_SCORE, value: topTopper ? `${safeFixed(topTopper.percentage)}%` : EXAM_CONSTS.ANALYTICS.FALLBACK_DASH,
            caption: topTopper ? `${topTopper.studentName}${topTopper.sectionName ? ` (${topTopper.sectionName})` : ""}` : EXAM_CONSTS.ANALYTICS.AWAITING,
            icon: Trophy, iconBg: "bg-amber-50", iconColor: "text-amber-500",
        },
        {
            title: EXAM_CONSTS.ANALYTICS.FAILED_STUDENTS, value: classSummary ? `${failedCount}` : EXAM_CONSTS.ANALYTICS.FALLBACK_DASH,
            caption: classSummary ? `${failedRatePct.toFixed(1)}%${EXAM_CONSTS.ANALYTICS.OF_TOTAL_LAYOUT}` : EXAM_CONSTS.ANALYTICS.AWAITING,
            icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500",
        },
        {
            title: EXAM_CONSTS.ANALYTICS.PASS_RATE, value: classSummary ? `${passRatePct.toFixed(1)}%` : EXAM_CONSTS.ANALYTICS.FALLBACK_DASH,
            caption: classSummary ? `${passedCount}${EXAM_CONSTS.ANALYTICS.OF}${total}${EXAM_CONSTS.ANALYTICS.VERIFIED}` : EXAM_CONSTS.ANALYTICS.AWAITING,
            icon: CheckSquare, iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
        },
        {
            title: EXAM_CONSTS.ANALYTICS.WEAKEST_SUB, value: weakestSubject ? weakestSubject.subjectName : EXAM_CONSTS.ANALYTICS.FALLBACK_DASH,
            caption: weakestSubject ? `${EXAM_CONSTS.ANALYTICS.AVG}${safeFixed(weakestSubject.avgPercentage)}% · ${weakestSubject.failedStudents ?? 0}${EXAM_CONSTS.ANALYTICS.FAIL}` : EXAM_CONSTS.ANALYTICS.AWAITING,
            icon: TrendingDown, iconBg: "bg-rose-50", iconColor: "text-rose-600",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 space-y-6 text-gray-800">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                    <TooltipComponent message={EXAM_CONSTS.ANALYTICS.TOOLTIP} direction="right" color="nocolor">
                        {EXAM_CONSTS.ANALYTICS.TITLE}
                    </TooltipComponent>
                </h1>
            </div>

            {/* Cascade Parameter Configuration Dashboard */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-gray-900">{EXAM_CONSTS.ANALYTICS.CASCADE_FILTER}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_160px] gap-5 items-end">
                    <div className="contents">
                        <FilterSelect
                            label={EXAM_CONSTS.ANALYTICS.LBL_ACADEMIC_YEAR}
                            value={yearId}
                            disabled={loadingMeta}
                            onChange={(e) => { setYearId(e.target.value); setClassId(""); }}
                        >
                            {academicYears.map((y) => (
                                <option key={y.id} value={y.id}>{y.label ?? y.name ?? y.value}</option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label={EXAM_CONSTS.ANALYTICS.LBL_CLASS}
                            value={classId}
                            disabled={loadingMeta || !yearId}
                            onChange={(e) => setClassId(e.target.value)}
                        >
                            <option value="">{EXAM_CONSTS.ANALYTICS.SELECT_CLASS}</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </FilterSelect>

                        <FilterSelect
                            label={EXAM_CONSTS.ANALYTICS.LBL_EXAM}
                            value={examId}
                            disabled={!classId || loadingExams}
                            onChange={(e) => setExamId(e.target.value)}
                        >
                            {exams.length === 0 ? (
                                <option value="">{loadingExams ? EXAM_CONSTS.ANALYTICS.LOADING : EXAM_CONSTS.ANALYTICS.SELECT_EXAM}</option>
                            ) : (
                                exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)
                            )}
                        </FilterSelect>

                        <FilterSelect
                            label={EXAM_CONSTS.ANALYTICS.LBL_SECTION}
                            hint={EXAM_CONSTS.ANALYTICS.OPTIONAL}
                            value={sectionId}
                            disabled={!classId || loadingExams}
                            onChange={(e) => setSectionId(e.target.value)}
                        >
                            <option value="">{EXAM_CONSTS.ANALYTICS.ALL_SECTIONS}</option>
                            {sections.map((s) => <option key={s.id} value={s.id}>{s.name ?? s.sectionName}</option>)}
                        </FilterSelect>

                        <FilterSelect
                            label={EXAM_CONSTS.ANALYTICS.LBL_SUBJECT}
                            hint={EXAM_CONSTS.ANALYTICS.OPTIONAL}
                            value={subjectId}
                            disabled={!examId}
                            onChange={(e) => setSubjectId(e.target.value)}
                        >
                            <option value="">{EXAM_CONSTS.ANALYTICS.ALL_SUBJECTS}</option>
                            {examSubjectOptions.map((s) => (
                                <option key={s.subjectId ?? s.id} value={s.subjectId ?? s.id}>{s.subjectName}</option>
                            ))}
                        </FilterSelect>
                    </div>

                    <button
                        onClick={handleApply}
                        disabled={!examId || loadingAnalytics}
                        className="
w-full
h-12
bg-indigo-600
hover:bg-indigo-700
text-white
font-bold
text-base
rounded-xl
shadow-md
transition-all
flex items-center
justify-center
"
                    >
                        {loadingAnalytics ? <RefreshCw className="w-4 h-4 animate-spin" /> : EXAM_CONSTS.ANALYTICS.APPLY_SYNC}
                    </button>
                </div>
            </div>

            {/* Render Dashboard Tree */}
            {!examId ? (
                <div className="bg-white border border-gray-100 text-gray-400 font-medium text-sm rounded-xl p-12 text-center shadow-sm">
                    {EXAM_CONSTS.ANALYTICS.ISOLATE_CONTEXT}
                </div>
            ) : (
                <div className="space-y-6 animate-fadeIn">

                    {/* Event Summary Card Panel */}
                    <EventSummaryPanel
                        summaryData={eventSummary}
                        examName={selectedExam?.name}
                        loading={loadingAnalytics}
                    />

                    {/* Active State Context Label Bar */}
                    <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-gray-400 bg-gray-100 px-4 py-2.5 rounded-lg border border-gray-200/40">
                        <span className="uppercase tracking-wider text-[10px]">{EXAM_CONSTS.ANALYTICS.CONTEXT}</span>
                        <span className="bg-white text-indigo-700 px-2 py-0.5 rounded border border-gray-200 shadow-2xs">{selectedClass?.name}</span>
                        <span className="bg-white text-blue-700 px-2 py-0.5 rounded border border-gray-200 shadow-2xs">{selectedExam?.name}</span>
                        <span className="bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200 shadow-2xs">{sectionId ? `${EXAM_CONSTS.ANALYTICS.LBL_SECTION} ${sections.find(s => String(s.id) === String(sectionId))?.name}` : EXAM_CONSTS.ANALYTICS.ALL_SECTIONS}</span>
                        <span className="bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200 shadow-2xs">{subjectId ? examSubjectOptions.find(s => String(s.subjectId ?? s.id) === String(subjectId))?.subjectName : EXAM_CONSTS.ANALYTICS.ALL_SUBJECTS}</span>
                    </div>

                    {/* Conditional Split: Real Non-Blocking Info Alert Banner vs Class Analytical Grids */}
                    {resultNotDeclared ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-900">
                                    {EXAM_CONSTS.ANALYTICS.RES_NOT_DEC}
                                </h4>
                                <p className="text-xs text-amber-700">
                                    {EXAM_CONSTS.ANALYTICS.CLASS_ANA_AVAIL}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Standard Performance KPI Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {loadingAnalytics
                                    ? Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                                    : STATS_CONFIG.map((s, i) => <StatCard key={i} {...s} />)
                                }
                            </div>

                            {/* Cleaned Subject Analytics Row Display */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SubjectBarChart subjectStats={cleanSubjectStats} loading={loadingAnalytics} />
                                <PassFailTable subjectStats={cleanSubjectStats} loading={loadingAnalytics} />
                            </div>

                            {/* Grade Configuration Data Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <GradeDistributionCard gradeDistribution={gradeDistribution} loading={loadingAnalytics} />
                                <SectionComparisonCard classSummary={classSummary} sectionFiltered={!!sectionId} loading={loadingAnalytics} />
                            </div>

                            {/* Standing Registers Data Grids */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TopPerformersTable toppers={toppers} loading={loadingAnalytics} />
                                <FailedStudentsTable failedStudents={failedStudents} loading={loadingAnalytics} />
                            </div>
                        </>
                    )}

                    {/* Performance History Trend Matrix Card Line */}
                    <PerformanceTrendCard
                        trendData={performanceTrend}
                        currentExamId={examId}
                        currentClassName={selectedClass?.name}
                        loading={loadingAnalytics}
                    />
                </div>
            )}
        </div>
    );
}
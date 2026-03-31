import { useState, useEffect, useCallback } from "react";
import {
    BarChart2, Trophy, AlertTriangle, CheckSquare,
    ChevronDown, Medal, TrendingUp, RefreshCw,
} from "lucide-react";

import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import {
    getExams,
    getClassResultSummary,
    getFailedStudents,
    getSubjectAnalysis,
    getToppers,
} from "../../Api/Exams";

// ─── Constants ────────────────────────────────────────────────────────────────
const PASS_LINE = 33;

const SUBJECT_COLORS = [
    { color: "#6366f1", bg: "bg-indigo-500" },
    { color: "#3b82f6", bg: "bg-blue-500" },
    { color: "#8b5cf6", bg: "bg-violet-500" },
    { color: "#a855f7", bg: "bg-purple-500" },
    { color: "#10b981", bg: "bg-emerald-500" },
    { color: "#f59e0b", bg: "bg-amber-500" },
    { color: "#ef4444", bg: "bg-red-500" },
    { color: "#06b6d4", bg: "bg-cyan-500" },
];

const RANK_MEDAL = [
    { bg: "bg-yellow-400", text: "text-white", shadow: "shadow-yellow-200" },
    { bg: "bg-gray-300", text: "text-white", shadow: "shadow-gray-200" },
    { bg: "bg-orange-400", text: "text-white", shadow: "shadow-orange-200" },
];

const RANK_CARD_BG = [
    "from-yellow-50 to-amber-50 border-yellow-200",
    "from-gray-50 to-slate-50 border-gray-200",
    "from-orange-50 to-amber-50 border-orange-200",
];

const EXAM_OPTIONS = [
    { label: "Mid Term — Class 10 — 2025-26", id: 1 },
    { label: "Unit Test 1 — Class 10 — 2025-26", id: 2 },
    { label: "Final Term — Class 10 — 2025-26", id: 3 },
];

const SECTION_OPTIONS = ["Section 10-A", "Section 10-B", "Section 10-C"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function subjectColor(index) {
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

function gradeBadgeBg(grade = "") {
    if (grade.startsWith("A")) return "bg-emerald-100 text-emerald-700";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
    if (grade === "F") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ExamSelect({ value, onChange, options, loading, className = "" }) {
    if (loading) {
        return (
            <div className={`h-9 rounded-lg bg-gray-100 animate-pulse ${className}`} />
        );
    }
    return (
        <Select value={value} onChange={onChange} options={options} className={className} />
    );
}

/** Safely format a number to fixed decimals, returns fallback if not a valid number */
function safeFixed(val, decimals = 1, fallback = "—") {
    const n = Number(val);
    return isNaN(n) ? fallback : n.toFixed(decimals);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Select({ value, onChange, options, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                disabled={options.length === 0}
            >
                {options.length === 0 ? (
                    <option>No exams available</option>
                ) : (
                    options.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                            {exam.label}
                        </option>
                    ))
                )}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

// ─── Subject Bar Chart ────────────────────────────────────────────────────────
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
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-6 rounded-full bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : subjectStats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No subject data available.</p>
            ) : (
                <div className="space-y-3 sm:space-y-3.5">
                    {subjectStats.map((sub, idx) => {
                        const { color } = subjectColor(idx);
                        const avg = Number(sub.avgPercentage);
                        const barWidth = `${Math.min(isNaN(avg) ? 0 : (avg / maxVal) * 100, 100)}%`;
                        return (
                            <div key={sub.subjectId ?? sub.subjectName} className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xs text-gray-500 font-medium w-16 sm:w-20 text-right shrink-0 truncate">
                                    {sub.subjectName}
                                </span>
                                <div className="flex-1 relative">
                                    <div className="w-full h-5 sm:h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                        <div
                                            className="h-full rounded-full flex items-center pl-2 sm:pl-2.5 transition-all duration-700"
                                            style={{
                                                width: barWidth,
                                                background: `linear-gradient(90deg, ${color}cc, ${color})`,
                                            }}
                                        >
                                            <span className="text-white text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
                                                {safeFixed(sub.avgPercentage)}%
                                            </span>
                                        </div>
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                                            style={{ left: `${passLinePct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Pass/Fail Table  
function PassFailTable({ subjectStats, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-800">Pass / Fail per Subject</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-90">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {["Subject", "Pass", "Fail", "Absent", "Pass %"].map((h) => (
                                <th key={h} className="text-left px-4 sm:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <ListLoader rows={5} avatar={false} colSpanSet={5} />
                        ) : subjectStats.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-sm text-gray-400">
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
                                        <td className="px-4 sm:px-5 py-3 font-semibold text-gray-800 whitespace-nowrap">{sub.subjectName}</td>
                                        <td className="px-4 sm:px-5 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                {sub.passedStudents ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-5 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                                                {sub.failedStudents ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-5 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                                {sub.absentStudents ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-5 py-3">
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

// ─── Top Students ─────────────────────────────────────────────────────────────
function TopStudents({ toppers, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🏆</span>
                <h2 className="text-sm font-semibold text-gray-800">Top 3 Students</h2>
            </div>
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : toppers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No topper data available.</p>
            ) : (
                <div className="space-y-3">
                    {toppers.slice(0, 3).map((s, i) => (
                        <div
                            key={s.studentId}
                            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl border-2 bg-linear-to-r ${RANK_CARD_BG[i]}`}
                        >
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${RANK_MEDAL[i].bg} ${RANK_MEDAL[i].text} ${RANK_MEDAL[i].shadow}`}>
                                {i === 0 ? (
                                    <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <span className="text-sm font-extrabold">{s.classRank}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{s.studentName}</p>
                                <p className="text-xs text-gray-400 truncate">
                                    {s.admissionNumber}
                                    <span className="hidden sm:inline"> · {s.sectionName}</span>
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900">
                                    {safeFixed(s.percentage)}%
                                </p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${gradeBadgeBg(s.overallGrade)}`}>
                                    {s.overallGrade}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Failed Students ──────────────────────────────────────────────────────────
function FailedStudents({ failedStudents, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⚠️</span>
                <h2 className="text-sm font-semibold text-gray-800">Failed Students</h2>
            </div>
            {loading ? (
                <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ) : failedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                    <CheckSquare className="w-10 h-10 mb-2" />
                    <p className="text-sm font-medium">All students passed!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {failedStudents.map((s) => (
                        <div key={s.studentId} className="rounded-xl border-2 border-red-200 bg-linear-to-br from-red-50 to-rose-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{s.studentName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {s.admissionNumber}
                                        <span className="hidden sm:inline"> · {s.sectionName}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 sm:hidden">{s.sectionName}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xl font-extrabold text-red-600">
                                        {safeFixed(s.percentage)}%
                                    </p>
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600">
                                        {s.overallGrade}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-[11px] font-semibold text-gray-400 mb-1.5">Failed subjects:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(s.failedSubjects || []).map((sub) => (
                                        <span key={sub} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Analytics() {
    const [examOptions, setExamOptions] = useState([]);
    const [examsLoading, setExamsLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState(null);

    const [classSummary, setClassSummary] = useState(null);
    const [subjectStats, setSubjectStats] = useState([]);
    const [toppers, setToppers] = useState([]);
    const [failedStudents, setFailedStudents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Fetch exam list on mount ───────────────────────────────────────────────
    useEffect(() => {
        const fetchExams = async () => {
            setExamsLoading(true);
            try {
                const data = await getExams();
                // Always stringify IDs so <select> value matching works correctly
                const normalized = data.map((exam) => ({
                    id: String(exam.id ?? exam._id),
                    label: exam.name ?? exam.title ?? exam.examName ?? `Exam #${exam.id ?? exam._id}`,
                }));
                setExamOptions(normalized);
                if (normalized.length > 0) {
                    setSelectedExamId(normalized[0].id);
                }
            } catch (err) {
                setError("Failed to load exam list.");
            } finally {
                setExamsLoading(false);
            }
        };
        fetchExams();
    }, []);

    // ── Fetch analytics when exam changes ────────────────────────────────────
    const fetchAnalytics = useCallback(async (examId) => {

        if (!examId) return;
        setLoading(true);
        setError(null);
        // Clear previous data so old values don't show while loading
        setClassSummary(null);
        setSubjectStats([]);
        setToppers([]);
        setFailedStudents([]);
        try {
            const [summary, subjects, toppersData, failed] = await Promise.all([
                getClassResultSummary(examId),
                getSubjectAnalysis(examId),
                getToppers(examId, 3),
                getFailedStudents(examId),
            ]);
            setClassSummary(summary);
            setSubjectStats(subjects);
            setToppers(toppersData);
            setFailedStudents(failed);
        } catch (err) {
            setError("Failed to load analytics data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedExamId) fetchAnalytics(selectedExamId);
    }, [selectedExamId, fetchAnalytics]);

    // ── No type conversion — id is always a string from <select> ─────────────
    const handleExamChange = (id) => setSelectedExamId(id);

    // ── Derived stats ─────────────────────────────────────────────────────────
    const topTopper = toppers[0];

    const total = Number(classSummary?.totalStudents);
    const passedCount = Number(classSummary?.passedStudents);
    const failedCount = Number(classSummary?.failedStudents);
    const avgPct = Number(classSummary?.classAvgPercentage);

    const passRate = classSummary && total > 0 && !isNaN(total) && !isNaN(passedCount)
        ? ((passedCount / total) * 100).toFixed(1)
        : null;

    const failRate = classSummary && total > 0 && !isNaN(total) && !isNaN(failedCount)
        ? `${failedCount} — ${((failedCount / total) * 100).toFixed(1)}%`
        : null;

    const STATS = [
        {
            key: "Class Average",
            val: classSummary && !isNaN(avgPct) ? `${avgPct.toFixed(1)}%` : "—",
            icon: BarChart2,
            iconBgColor: "bg-blue-50",
            iconTxColor: "text-blue-600",
        },
        {
            key: "Highest Score",
            val: topTopper && !isNaN(Number(topTopper.percentage))
                ? `${Number(topTopper.percentage).toFixed(1)}% — ${topTopper.studentName}`
                : "—",
            icon: Trophy,
            iconBgColor: "bg-yellow-50",
            iconTxColor: "text-yellow-600",
        },
        {
            key: "Failed Students",
            val: failRate ?? "—",
            icon: AlertTriangle,
            iconBgColor: "bg-red-50",
            iconTxColor: "text-red-500",
        },
        {
            key: "Pass Rate",
            val: passRate != null ? `${passRate}%` : "—",
            icon: CheckSquare,
            iconBgColor: "bg-green-50",
            iconTxColor: "text-green-600",
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

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                    <button
                        onClick={() => fetchAnalytics(selectedExamId)}
                        className="ml-auto flex items-center gap-1 text-xs font-medium underline hover:no-underline"
                    >
                        <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                    <ExamSelect
                        value={selectedExamId ?? ""}
                        onChange={handleExamChange}
                        options={examOptions}
                        loading={examsLoading}
                        className="w-full sm:w-72"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {loading
                    ? Array(4).fill(0).map((_, i) => <CardLoader key={i} />)
                    : STATS.map((s) => (
                        <CardComponent
                            key={s.key}
                            IconName={s.icon}
                            keyName={s.key}
                            val={s.val}
                            iconBgColor={s.iconBgColor}
                            iconTxColor={s.iconTxColor}
                        />
                    ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <SubjectBarChart subjectStats={subjectStats} loading={loading} />
                <PassFailTable subjectStats={subjectStats} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TopStudents toppers={toppers} loading={loading} />
                <FailedStudents failedStudents={failedStudents} loading={loading} />
            </div>
        </div>
    );
}
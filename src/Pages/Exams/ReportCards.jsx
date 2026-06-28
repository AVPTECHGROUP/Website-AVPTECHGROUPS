import { useState, useEffect, useCallback, useRef } from "react";
import {
    Users, CheckSquare, XCircle, UserMinus,
    ChevronDown, Sparkles, Download, Eye, Medal,
    Loader2, AlertCircle, RefreshCw,
} from "lucide-react";

import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import StudentReportCard from "./StudentReportCard";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import { useParams } from "react-router-dom";

import {
    generateReportCards,
    getReportCards,
    getStudentReportCard,
    updateReportCardRemarks,
} from "../../Api/Exams";
import { getExams } from "../../Api/Exams";
import { getActiveClasses, getAllSections } from "../../Api/TeachersAPI";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGrade(pct, absent) {
    if (absent) return { label: "AB", bg: "bg-gray-100 text-gray-600" };
    if (pct >= 91) return { label: "A+", bg: "bg-green-100 text-green-700" };
    if (pct >= 81) return { label: "A", bg: "bg-green-100 text-green-600" };
    if (pct >= 71) return { label: "B+", bg: "bg-blue-100 text-blue-700" };
    if (pct >= 61) return { label: "B", bg: "bg-blue-100 text-blue-600" };
    if (pct >= 51) return { label: "C", bg: "bg-purple-100 text-purple-700" };
    if (pct >= 33) return { label: "D", bg: "bg-orange-100 text-orange-600" };
    return { label: "F", bg: "bg-red-100 text-red-600" };
}

function getRowBg(student) {
    if (!student.isPassed && !student.isAbsent) return "bg-red-50/30";
    const pct = student.percentage ?? 0;
    if (pct >= 75) return "bg-yellow-50/40";
    return "";
}

function getStatus(student) {
    if (student.isAbsent) return { label: "ABSENT", cls: "bg-gray-100 text-gray-600 border-gray-200" };
    return student.isPassed
        ? { label: "PASS", cls: "bg-green-100 text-green-700 border-green-200" }
        : { label: "FAIL", cls: "bg-red-100 text-red-600 border-red-200" };
}

function getRankDisplay(rank) {
    if (!rank) return <span className="text-gray-300 font-bold text-lg">—</span>;
    const colors = ["bg-yellow-400", "bg-gray-300", "bg-orange-400"];
    const bg = colors[rank - 1] || "bg-blue-100";
    const text = rank <= 3 ? "text-white" : "text-blue-700";
    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${bg} ${text} shadow-sm`}>
            {rank}
        </span>
    );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportStudentsCSV({ students, examName, sectionLabel }) {
    try {
        const esc = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
        const row = (arr) => arr.map(esc).join(",");
        const lines = [];
        lines.push(row(["Report Cards Export"]));
        if (examName) lines.push(row(["Exam", examName]));
        if (sectionLabel) lines.push(row(["Section", sectionLabel]));
        lines.push(row(["Total Students", students.length]));
        lines.push("");
        lines.push(row([
            "Rank", "Student Name", "Roll No.", "Admission No.",
            "Section", "Marks Obtained", "Max Marks",
            "Percentage", "Grade", "Status"
        ]));
        students.forEach((s) => {
            const pct = s.percentage ?? 0;
            const grade = getGrade(pct, s.isAbsent);
            const status = getStatus(s);
            lines.push(row([
                s.classRank ?? "",
                s.studentName ?? "",
                s.rollNumber ?? "",
                s.admissionNumber ?? "",
                s.sectionName ?? "",
                s.totalMarksObtained ?? "",
                s.totalMaxMarks ?? "",
                s.isAbsent ? "ABSENT" : `${pct.toFixed(1)}%`,
                s.isAbsent ? "AB" : (s.overallGrade || grade.label),
                status.label,
            ]));
        });
        const csvString = lines.join("\r\n");
        const dataUri = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvString);
        const fileName = `report_cards_${examName ?? "export"}_${sectionLabel ?? "all"}.csv`
            .replace(/[^a-z0-9_.\-]/gi, "_");
        const link = document.createElement("a");
        link.href = dataUri;
        link.download = fileName;
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("CSV export failed:", err);
        alert("Export failed: " + err.message);
    }
}

// ─── Reusable Select ──────────────────────────────────────────────────────────
function Select({ value, onChange, options = [], disabled, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

// ─── Mobile student card ──────────────────────────────────────────────────────
function StudentCard({ student, onView }) {
    const pct = student.percentage ?? 0;
    const grade = getGrade(pct, student.isAbsent);
    const status = getStatus(student);
    const rowBg = getRowBg(student);

    return (
        <div className={`p-3 border-b border-gray-100 last:border-0 ${rowBg}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    {getRankDisplay(student.classRank)}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{student.studentName}</p>
                        <p className="text-xs text-gray-400">
                            Roll {student.rollNumber || "—"} · {student.admissionNumber || "—"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onView(student)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shrink-0"
                >
                    <Eye className="w-3 h-3" />
                    View
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-gray-600 font-medium">
                    {student.totalMarksObtained}/{student.totalMaxMarks}
                </span>
                <span className={`text-xs font-bold ${student.isAbsent ? "text-gray-300" : "text-gray-800"}`}>
                    {student.isAbsent ? "—" : `${pct.toFixed(1)}%`}
                </span>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${grade.bg}`}>
                    {grade.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${status.cls}`}>
                    {status.label}
                </span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportCards() {

    const { examId: paramExamId } = useParams();

    // ── Meta ──────────────────────────────────────────────────────────────────
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [exams, setExams] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("");

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [loadingExams, setLoadingExams] = useState(false);

    // ── Report cards data ─────────────────────────────────────────────────────
    const [students, setStudents] = useState([]);
    const studentsRef = useRef([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [cardsError, setCardsError] = useState(null);
    const [cardsLoaded, setCardsLoaded] = useState(false);

    // ── Generate state ────────────────────────────────────────────────────────
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState(null);
    const [generateMsg, setGenerateMsg] = useState(null);

    // ── View single student ───────────────────────────────────────────────────
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingStudentCard, setLoadingStudentCard] = useState(false);
    const [studentCardError, setStudentCardError] = useState(null);

    // ── Derived stats ─────────────────────────────────────────────────────────
    const passed = students.filter((s) => s.isPassed && !s.isAbsent).length;
    const failed = students.filter((s) => !s.isPassed && !s.isAbsent).length;
    const absent = students.filter((s) => s.isAbsent).length;

    const STATS = [
        { key: "Total Students", val: students.length, icon: Users, iconBgColor: "bg-blue-50", iconTxColor: "text-blue-600" },
        { key: "Passed", val: students.length ? `${passed} — ${((passed / students.length) * 100).toFixed(1)}%` : "0", icon: CheckSquare, iconBgColor: "bg-green-50", iconTxColor: "text-green-600" },
        { key: "Failed", val: failed, icon: XCircle, iconBgColor: "bg-red-50", iconTxColor: "text-red-500" },
        { key: "Absent (All)", val: absent, icon: UserMinus, iconBgColor: "bg-gray-100", iconTxColor: "text-gray-500" },
    ];

    const filteredSections = selectedClassId
        ? sections.filter((s) => {
            return (
                String(s.classId) === String(selectedClassId) ||
                String(s.schoolClassId) === String(selectedClassId) ||
                String(s.class_id) === String(selectedClassId)
            );
        })
        : sections;

    const sectionLabel = (s) => {
        if (!s) return "—";
        if (s.schoolClassName) return `${s.schoolClassName} — ${s.name}`;
        if (s.className) return `${s.className} — ${s.name}`;
        return s.name ?? "—";
    };

    // ── 1. Load active classes + sections on mount ─────────────────────────
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoadingMeta(true);
            try {
                const [cls, secsRaw] = await Promise.all([
                    getActiveClasses(),
                    getAllSections()
                ]);

                if (!mounted) return;
                setClasses(cls);

                const secArr = Array.isArray(secsRaw)
                    ? secsRaw
                    : secsRaw?.data ?? [];

                setSections(secArr);

                if (!paramExamId && cls.length > 0) {
                    setSelectedClassId(String(cls[0].id));
                }
            } catch (err) {
                console.error("ReportCards meta load error:", err);
            } finally {
                if (mounted) setLoadingMeta(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    // Route Exam Resolve
    useEffect(() => {
        if (!paramExamId || !classes.length) return;

        const resolveRouteExamClass = async () => {
            try {
                const allExams = await getExams();
                const matchedExam = Array.isArray(allExams)
                    ? allExams.find((e) => String(e.id) === String(paramExamId))
                    : null;

                if (!matchedExam) return;

                const examClassId =
                    matchedExam.schoolClassId ??
                    matchedExam.classId ??
                    matchedExam.class_id ??
                    null;

                if (examClassId) {
                    setSelectedClassId(String(examClassId));
                }
            } catch (err) {
                console.error("ReportCards route exam resolve error:", err);
            }
        };
        resolveRouteExamClass();
    }, [paramExamId, classes]);

    // Section Selector Alignment
    useEffect(() => {
        if (filteredSections.length === 0) {
            setSelectedSectionId("");
            return;
        }
        const hasCurrent = filteredSections.some(
            (s) => String(s.id) === String(selectedSectionId)
        );
        if (!hasCurrent) {
            setSelectedSectionId(String(filteredSections[0].id));
        }
    }, [selectedClassId, sections, filteredSections, selectedSectionId]);

    // ── 2. Load exams when class changes ──────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoadingExams(true);
            setExams([]);
            setSelectedExamId("");
            setCardsLoaded(false);
            setStudents([]);
            studentsRef.current = [];
            setCardsError(null);

            try {
                const data = await getExams({ classId: selectedClassId });
                const allExams = Array.isArray(data) ? data : [];

                if (!mounted) return;
                setExams(allExams);

                if (paramExamId) {
                    const matchedExam = allExams.find(
                        (e) => String(e.id) === String(paramExamId)
                    );
                    if (matchedExam) {
                        setSelectedExamId(String(matchedExam.id));
                        return;
                    }
                }

                const declared = allExams.filter((e) => e.resultDeclared);
                if (declared.length > 0) {
                    setSelectedExamId(String(declared[0].id));
                } else if (allExams.length > 0) {
                    setSelectedExamId(String(allExams[0].id));
                }
            } catch (err) {
                console.error("Load exams error:", err);
            } finally {
                if (mounted) setLoadingExams(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [selectedClassId, paramExamId]);

    // ── 3. Load report cards ──────────────────────────────────────────────────
    const loadReportCards = useCallback(async () => {
        if (!selectedExamId) return;
        setLoadingCards(true);
        setCardsError(null);
        setCardsLoaded(false);
        setStudents([]);
        studentsRef.current = [];
        try {
            const data = await getReportCards(
                Number(selectedExamId),
                selectedSectionId ? Number(selectedSectionId) : null
            );
            const arr = Array.isArray(data) ? data : [];
            setStudents(arr);
            studentsRef.current = arr;
            setCardsLoaded(true);
        } catch (err) {
            console.error("loadReportCards error:", err);
            setCardsError("Failed to load report cards. Click Generate All first if not yet generated.");
        } finally {
            setLoadingCards(false);
        }
    }, [selectedExamId, selectedSectionId]);

    useEffect(() => {
        if (selectedExamId) {
            loadReportCards();
        } else {
            setStudents([]);
            studentsRef.current = [];
            setCardsLoaded(false);
            setCardsError(null);
        }
    }, [loadReportCards, selectedExamId]);

    // ── Generate All ──────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!selectedExamId) return;
        setGenerating(true);
        setGenerateError(null);
        setGenerateMsg(null);
        try {
            await generateReportCards(Number(selectedExamId));
            setGenerateMsg("Report cards generated successfully!");
            await loadReportCards();
        } catch (err) {
            setGenerateError(err.message ?? "Failed to generate report cards.");
        } finally {
            setGenerating(false);
        }
    };

    // ── View single student report card ───────────────────────────────────────
    const handleViewStudent = async (student) => {
        if (!selectedExamId) return;
        setLoadingStudentCard(true);
        setStudentCardError(null);
        setSelectedStudent(null);
        try {
            const data = await getStudentReportCard(Number(selectedExamId), student.studentId);
            setSelectedStudent(data);
        } catch (err) {
            setStudentCardError(`Failed to load report card for ${student.studentName}.`);
        } finally {
            setLoadingStudentCard(false);
        }
    };

    // ── Update remarks ────────────────────────────────────────────────────────
    const handleUpdateRemarks = async (studentId, remarksData) => {
        if (!selectedExamId) return;
        await updateReportCardRemarks(Number(selectedExamId), studentId, remarksData);
        const updated = await getStudentReportCard(Number(selectedExamId), studentId);
        setSelectedStudent(updated);
        loadReportCards();
    };

    // ── Handle Export ─────────────────────────────────────────────────────────
    const handleExport = () => {
        const data = studentsRef.current;
        if (!data || data.length === 0) {
            alert("No data to export. Please load the report cards first.");
            return;
        }
        const selectedExamObj = exams.find((e) => String(e.id) === selectedExamId);
        const selectedSectionObj = filteredSections.find((s) => String(s.id) === selectedSectionId);
        exportStudentsCSV({
            students: data,
            examName: selectedExamObj?.name ?? "",
            sectionLabel: selectedSectionObj ? sectionLabel(selectedSectionObj) : "",
        });
    };

    const selectedSectionObj = filteredSections.find((s) => String(s.id) === selectedSectionId);
    const selectedExamObj = exams.find((e) => String(e.id) === selectedExamId);

    return (
        // FIX 1: Root container — overflow-x-hidden prevents any child from blowing out the page width
        <div className="min-h-screen bg-[#f3f6fb] p-2 sm:p-3 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 w-full max-w-full overflow-x-hidden">

            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900">
                    <TooltipComponent message="Efficiently manage report cards." direction="right" color="nocolor">
                        Manage Report Cards
                    </TooltipComponent>
                </h2>
            </div>

            {/* ── 1. Stats Cards ── */}
            {/*
                FIX 2: Stats cards grid
                - was: grid-cols-2 lg:grid-cols-4  → at 1024px (lg) all 4 cards squeezed into a row that's too narrow
                - now: grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
                  · mobile  (< 640px)  → 1 column   — full width, no squeezing
                  · tablet  (640–1279px) → 2 columns — comfortable on 768 and 1024px
                  · desktop (≥ 1280px) → 4 columns  — original look on large screens
                  Each card also gets min-w-0 so text truncates instead of blowing out the cell.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
                {loadingCards || loadingMeta
                    ? Array(4).fill(0).map((_, i) => <CardLoader key={i} />)
                    : STATS.map((s) => (
                        <div key={s.key} className="min-w-0">
                            <CardComponent
                                IconName={s.icon}
                                keyName={s.key}
                                val={s.val}
                                iconBgColor={s.iconBgColor}
                                iconTxColor={s.iconTxColor}
                            />
                        </div>
                    ))}
            </div>

            {/* ── 2. Top Filter Bar ── */}
            {/*
                FIX 3: Filter bar layout
                - was: flex-col lg:flex-row  → at 1024px (lg) it goes single-row but all selects + buttons
                  crammed horizontally, causing the exam select and action buttons to overflow.
                - now: flex-col xl:flex-row  → stays stacked until 1280px, comfortable at 1024px.
                  Left side inputs stay flex-col sm:flex-row (they wrap nicely on tablet).
                  Action buttons stay flex-row with shrink-0 so they never collapse.
            */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm px-3 sm:px-4 lg:px-5 py-3.5">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">

                    {/* Left side: Inputs + Icon-only Reload */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Class Select */}
                        <Select
                            value={selectedClassId}
                            onChange={(v) => { setSelectedClassId(v); setCardsLoaded(false); }}
                            options={[
                                ...(loadingMeta ? [{ value: "", label: "Loading..." }] : []),
                                ...classes.map((c) => ({ value: String(c.id), label: c.name }))
                            ]}
                            disabled={loadingMeta}
                            className="w-full sm:w-32 lg:w-36 shrink-0"
                        />

                        {/* Section Select */}
                        <Select
                            value={selectedSectionId}
                            onChange={(v) => { setSelectedSectionId(v); }}
                            options={[
                                { value: "", label: "All Sections" },
                                ...filteredSections.map((s) => ({ value: String(s.id), label: sectionLabel(s) }))
                            ]}
                            disabled={loadingMeta}
                            className="w-full sm:w-40 lg:w-44 shrink-0"
                        />

                        {/* Exam Select — flex-1 so it takes remaining space but never overflows */}
                        <Select
                            value={selectedExamId}
                            onChange={(v) => setSelectedExamId(v)}
                            options={[
                                { value: "", label: loadingExams ? "Loading exams..." : "Select Exam" },
                                ...exams.map((e) => ({
                                    value: String(e.id),
                                    label: e.resultDeclared ? e.name : `${e.name} (Pending)`
                                }))
                            ]}
                            disabled={loadingExams || !selectedClassId}
                            className="w-full sm:flex-1 sm:min-w-0"
                        />

                        {/* Icon-only Reload Button */}
                        <button
                            onClick={loadReportCards}
                            disabled={!selectedExamId || loadingCards}
                            title="Reload Data"
                            className="flex items-center justify-center h-[38px] w-full sm:w-[38px] text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60 shrink-0"
                        >
                            {loadingCards ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Right side: Action Buttons */}
                    {/*
                        FIX 4: Action buttons
                        - was: flex-col sm:flex-row  — at 1024px these stacked under selects when
                          the parent was still in flex-col mode, then overflowed when parent went flex-row.
                        - now: always flex-row with shrink-0 on each button so they never collapse.
                          On mobile they stretch full-width via w-full; on sm+ they auto-size.
                    */}
                    <div className="flex flex-row items-stretch gap-2 sm:gap-3 shrink-0">
                        {/* Generate All */}
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedExamId || generating}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 lg:px-4 h-[38px] text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {generating ? (
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            ) : (
                                <Sparkles className="w-4 h-4 shrink-0" />
                            )}
                            <span>{generating ? "Generating..." : "Generate All"}</span>
                        </button>

                        {/* Export CSV */}
                        <button
                            onClick={handleExport}
                            disabled={loadingCards || !cardsLoaded || students.length === 0}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 lg:px-4 h-[38px] text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Download className="w-4 h-4 shrink-0" />
                            <span>Export CSV</span>
                        </button>
                    </div>

                </div>

                {generateMsg && (
                    <div className="mt-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 shrink-0" />
                        {generateMsg}
                    </div>
                )}
                {generateError && (
                    <div className="mt-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {generateError}
                    </div>
                )}
            </div>

            {studentCardError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {studentCardError}
                </div>
            )}

            {loadingStudentCard && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-6 flex items-center justify-center gap-3 text-sm text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    Loading report card...
                </div>
            )}

            {/* ── 3. Class Rank Table ── */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
                        <h2 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 truncate">
                            Class Rank
                            {selectedSectionObj && (
                                <> — <span className="text-blue-600">{sectionLabel(selectedSectionObj)}</span></>
                            )}
                            {selectedExamObj && (
                                <span className="text-gray-400 font-normal text-xs ml-1 hidden sm:inline">
                                    {selectedExamObj.name}
                                </span>
                            )}
                        </h2>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full shrink-0">
                        {students.length} students
                    </span>
                </div>

                {cardsError && (
                    <div className="px-4 py-3 text-sm text-amber-700 bg-amber-50 flex items-center gap-2 border-b border-amber-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs sm:text-sm">{cardsError}</span>
                    </div>
                )}

                {/*
                    FIX 5: Mobile/tablet card list breakpoint
                    - was: block lg:hidden  → card list hidden at 1024px, desktop table shown instead (but overflows)
                    - now: block xl:hidden  → card list shown up to 1279px (covers 768 and 1024px safely),
                      desktop table only kicks in at 1280px where there's enough room.
                */}
                <div className="block xl:hidden">
                    {loadingCards ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : students.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">
                            {cardsLoaded ? "No report cards found." : "Select an exam and click Generate All or Reload."}
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {students.map((student) => (
                                <StudentCard key={student.studentId} student={student} onView={handleViewStudent} />
                            ))}
                        </div>
                    )}
                </div>

                {/*
                    FIX 6: Desktop table breakpoint + scroll containment
                    - was: hidden lg:block overflow-x-auto  → shown at 1024px, table min-w-[720px] overflowed the page
                    - now: hidden xl:block                  → only shown at ≥ 1280px
                      Inner wrapper gets overflow-x-auto + w-full so the scroll stays inside the card,
                      not the whole page. min-w raised to 800px to give columns enough room.
                */}
                <div className="hidden xl:block">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[800px] text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["Rank", "Student Name", "Roll No.", "Adm. No.", "Section",
                                        "Total", "%", "Grade", "Status", "Action"].map((h) => (
                                            <th key={h} className="text-left px-2 xl:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loadingCards ? (
                                    <ListLoader rows={5} avatar={false} colSpanSet={10} />
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center text-sm text-gray-400 py-12">
                                            {cardsLoaded
                                                ? "No report cards found for this selection."
                                                : "Select an exam and click Generate All or Reload."}
                                        </td>
                                    </tr>
                                ) : students.map((student) => {
                                    const pct = student.percentage ?? 0;
                                    const grade = getGrade(pct, student.isAbsent);
                                    const status = getStatus(student);
                                    const rowBg = getRowBg(student);
                                    return (
                                        <tr
                                            key={student.studentId}
                                            className={`border-b border-gray-50 transition-colors hover:bg-blue-50/40 ${rowBg}`}
                                        >
                                            <td className="px-2 xl:px-4 py-3">{getRankDisplay(student.classRank)}</td>
                                            <td className="px-2 xl:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{student.studentName}</td>
                                            <td className="px-2 xl:px-4 py-3 text-gray-500">{student.rollNumber || "—"}</td>
                                            <td className="px-2 xl:px-4 py-3 text-gray-500 whitespace-nowrap">{student.admissionNumber || "—"}</td>
                                            <td className="px-2 xl:px-4 py-3 text-gray-500 whitespace-nowrap">{student.sectionName || "—"}</td>
                                            <td className="px-2 xl:px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                                                {student.totalMarksObtained} / {student.totalMaxMarks}
                                            </td>
                                            <td className={`px-2 xl:px-4 py-3 font-bold whitespace-nowrap ${student.isAbsent ? "text-gray-300" : "text-gray-800"}`}>
                                                {student.isAbsent ? "—" : `${pct.toFixed(1)}%`}
                                            </td>
                                            <td className="px-2 xl:px-4 py-3">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${grade.bg}`}>
                                                    {student.overallGrade || grade.label}
                                                </span>
                                            </td>
                                            <td className="px-2 xl:px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${status.cls}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-2 xl:px-4 py-3">
                                                <button
                                                    onClick={() => handleViewStudent(student)}
                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all whitespace-nowrap"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedStudent && (
                <StudentReportCard
                    student={selectedStudent}
                    onClose={() => { setSelectedStudent(null); setStudentCardError(null); }}
                    onUpdateRemarks={handleUpdateRemarks}
                />
            )}
        </div>
    );
}
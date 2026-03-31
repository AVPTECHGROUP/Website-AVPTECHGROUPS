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

import {
    generateReportCards,
    getReportCards,
    getStudentReportCard,
    updateReportCardRemarks,
} from "../../Api/Exams";
import { getExams } from "../../Api/Exams";
import { getClasses, getAllSections } from "../../Api/TeachersAPI";

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
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold ${bg} ${text} shadow-sm`}>
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

        // Meta header
        lines.push(row(["Report Cards Export"]));
        if (examName) lines.push(row(["Exam", examName]));
        if (sectionLabel) lines.push(row(["Section", sectionLabel]));
        lines.push(row(["Total Students", students.length]));
        lines.push("");

        // Column headers
        lines.push(row([
            "Rank", "Student Name", "Roll No.", "Admission No.",
            "Section", "Marks Obtained", "Max Marks",
            "Percentage", "Grade", "Status"
        ]));

        // Data rows
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
        <div className={`p-4 border-b border-gray-100 last:border-0 ${rowBg}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                    {getRankDisplay(student.classRank)}
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{student.studentName}</p>
                        <p className="text-xs text-gray-400">
                            Roll {student.rollNumber || "—"} · {student.admissionNumber || "—"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onView(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shrink-0"
                >
                    <Eye className="w-3.5 h-3.5" />
                    View
                </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-600 font-medium">
                    {student.totalMarksObtained}/{student.totalMaxMarks}
                </span>
                <span className={`text-xs font-bold ${student.isAbsent ? "text-gray-300" : "text-gray-800"}`}>
                    {student.isAbsent ? "—" : `${pct.toFixed(1)}%`}
                </span>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${grade.bg}`}>
                    {grade.label}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${status.cls}`}>
                    {status.label}
                </span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportCards() {

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
    const studentsRef = useRef([]); // ← always holds latest students for export
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

    const sectionLabel = (s) => {
        if (!s) return "—";
        if (s.schoolClassName) return `${s.schoolClassName} — ${s.name}`;
        if (s.className) return `${s.className} — ${s.name}`;
        return s.name ?? "—";
    };

    // ── 1. Load classes + sections on mount ───────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoadingMeta(true);
            try {
                const [cls, secsRaw] = await Promise.all([getClasses(), getAllSections()]);
                setClasses(cls);
                const secArr = Array.isArray(secsRaw) ? secsRaw : secsRaw?.data ?? [];
                setSections(secArr);
                if (cls.length > 0) setSelectedClassId(String(cls[0].id));
                if (secArr.length > 0) setSelectedSectionId(String(secArr[0].id));
            } catch (err) {
                console.error("ReportCards meta load error:", err);
            } finally {
                setLoadingMeta(false);
            }
        };
        load();
    }, []);

    // ── 2. Load exams when class changes ──────────────────────────────────────
    useEffect(() => {
        if (!selectedClassId) return;
        const load = async () => {
            setLoadingExams(true);
            setExams([]);
            setSelectedExamId("");
            setCardsLoaded(false);
            setStudents([]);
            studentsRef.current = [];
            try {
                const data = await getExams({ classId: selectedClassId });
                const declared = data.filter((e) => e.resultDeclared);
                setExams(declared);
                if (declared.length > 0) setSelectedExamId(String(declared[0].id));
            } catch (err) {
                console.error("Load exams error:", err);
            } finally {
                setLoadingExams(false);
            }
        };
        load();
    }, [selectedClassId]);

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
            setStudents(data);
            studentsRef.current = data; // ← keep ref in sync
            setCardsLoaded(true);
        } catch (err) {
            setCardsError("Failed to load report cards. Click Generate All first if not yet generated.");
        } finally {
            setLoadingCards(false);
        }
    }, [selectedExamId, selectedSectionId]);

    useEffect(() => {
        if (selectedExamId) loadReportCards();
    }, [loadReportCards]);

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
        const selectedSectionObj = sections.find((s) => String(s.id) === selectedSectionId);
        exportStudentsCSV({
            students: data,
            examName: selectedExamObj?.name ?? "",
            sectionLabel: selectedSectionObj ? sectionLabel(selectedSectionObj) : "",
        });
    };

    const selectedSectionObj = sections.find((s) => String(s.id) === selectedSectionId);
    const selectedExamObj = exams.find((e) => String(e.id) === selectedExamId);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f3f6fb] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">

            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <TooltipComponent message="Efficiently manage report cards." direction="right" color="nocolor">
                        Manage Report Cards
                    </TooltipComponent>
                </h2>
            </div>

            {/* ── Top Filter Bar ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">

                    <Select
                        value={selectedClassId}
                        onChange={(v) => { setSelectedClassId(v); setCardsLoaded(false); }}
                        options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
                        disabled={loadingMeta}
                        className="w-full sm:w-40"
                    />

                    <Select
                        value={selectedSectionId}
                        onChange={(v) => { setSelectedSectionId(v); }}
                        options={sections.map((s) => ({ value: String(s.id), label: sectionLabel(s) }))}
                        disabled={loadingMeta}
                        className="w-full sm:w-52"
                    />

                    <Select
                        value={selectedExamId}
                        onChange={(v) => setSelectedExamId(v)}
                        options={exams.map((e) => ({ value: String(e.id), label: e.name }))}
                        disabled={loadingExams || !selectedClassId}
                        className="w-full sm:w-72"
                    />

                    <button
                        onClick={loadReportCards}
                        disabled={!selectedExamId || loadingCards}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60"
                    >
                        {loadingCards
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />}
                        Reload
                    </button>

                    <div className="hidden sm:block flex-1" />

                    <button
                        onClick={handleGenerate}
                        disabled={!selectedExamId || generating}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {generating
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Sparkles className="w-4 h-4" />}
                        {generating ? "Generating..." : "Generate All"}
                    </button>

                    {/* ← Export button now wired up */}
                    <button
                        onClick={handleExport}
                        disabled={!cardsLoaded || students.length === 0}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {generateMsg && (
                    <div className="mt-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 shrink-0" />
                        {generateMsg}
                    </div>
                )}
                {generateError && (
                    <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {generateError}
                    </div>
                )}
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {loadingCards || loadingMeta
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

            {studentCardError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {studentCardError}
                </div>
            )}

            {loadingStudentCard && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 flex items-center justify-center gap-3 text-sm text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    Loading report card...
                </div>
            )}

            {/* ── Class Rank Table ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Medal className="w-5 h-5 text-yellow-500 shrink-0" />
                        <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                            Class Rank
                            {selectedSectionObj && (
                                <> — <span className="text-blue-600">{sectionLabel(selectedSectionObj)}</span></>
                            )}
                            {selectedExamObj && (
                                <span className="text-gray-400 font-normal text-xs ml-2">
                                    {selectedExamObj.name}
                                </span>
                            )}
                        </h2>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                        {students.length} students
                    </span>
                </div>

                {cardsError && (
                    <div className="px-6 py-4 text-sm text-amber-700 bg-amber-50 flex items-center gap-2 border-b border-amber-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {cardsError}
                    </div>
                )}

                {/* Mobile */}
                <div className="block md:hidden">
                    {loadingCards ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : students.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-12">
                            {cardsLoaded ? "No report cards found." : "Select an exam and click Generate All or Reload."}
                        </p>
                    ) : (
                        students.map((student) => (
                            <StudentCard key={student.studentId} student={student} onView={handleViewStudent} />
                        ))
                    )}
                </div>

                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {["Rank", "Student Name", "Roll No.", "Adm. No.", "Section",
                                    "Total", "%", "Grade", "Status", "Action"].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
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
                                    <tr key={student.studentId} className={`border-b border-gray-50 transition-colors ${rowBg}`}>
                                        <td className="px-4 py-3">{getRankDisplay(student.classRank)}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{student.studentName}</td>
                                        <td className="px-4 py-3 text-gray-500">{student.rollNumber || "—"}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{student.admissionNumber || "—"}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{student.sectionName || "—"}</td>
                                        <td className="px-4 py-3 font-medium text-gray-700">
                                            {student.totalMarksObtained} / {student.totalMaxMarks}
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${student.isAbsent ? "text-gray-300" : "text-gray-800"}`}>
                                            {student.isAbsent ? "—" : `${pct.toFixed(1)}%`}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${grade.bg}`}>
                                                {student.overallGrade || grade.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${status.cls}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewStudent(student)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Card
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
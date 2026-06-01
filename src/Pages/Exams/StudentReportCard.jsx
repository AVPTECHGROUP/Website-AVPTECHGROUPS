import { useState } from "react";
import { X, Printer, Medal, CheckCircle, XCircle, Award, BookOpen, Star, Loader2 } from "lucide-react";
import { updateReportCardRemarks } from "../../Api/Exams";

// ─── Grade helper ─────────────────────────────────────────────────────────────
function getGrade(pct) {
    if (pct >= 91) return { label: "A+", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", bar: "bg-emerald-500" };
    if (pct >= 81) return { label: "A", color: "text-green-700", bg: "bg-green-50", border: "border-green-300", bar: "bg-green-500" };
    if (pct >= 71) return { label: "B+", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", bar: "bg-blue-500" };
    if (pct >= 61) return { label: "B", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", bar: "bg-blue-400" };
    if (pct >= 51) return { label: "C", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-300", bar: "bg-violet-500" };
    if (pct >= 33) return { label: "D", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300", bar: "bg-orange-500" };
    return { label: "F", color: "text-red-700", bg: "bg-red-50", border: "border-red-300", bar: "bg-red-500" };
}

function getSchoolInfo() {
    try {
        const school = JSON.parse(localStorage.getItem("school"));
        return {
            name: school?.schoolName || "School Management System",
            address: school?.address || "",
            board: school?.board || "CBSE Affiliated",
            logoUrl: school?.logoUrl || null,
        };
    } catch {
        return { name: "School Management System", address: "", board: "CBSE Affiliated", logoUrl: null };
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentReportCard({ student, examId, onClose, onUpdateRemarks }) {
    const school = getSchoolInfo();

    const subjects = student?.subjectMarks ?? [];
    const pct = student?.percentage ?? 0;
    const overallGrade = getGrade(Number(pct));
    const isPassed = student?.isPassed ?? false;
    const isAbsent = subjects.length > 0 && subjects.every((s) => s.isAbsent);

    const initials = school.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();

    // ── Remarks edit state ────────────────────────────────────────────────────
    const [editingRemarks, setEditingRemarks] = useState(false);
    const [teacherRemarks, setTeacherRemarks] = useState(student?.teacherRemarks ?? "");
    const [principalRemarks, setPrincipalRemarks] = useState(student?.principalRemarks ?? "");
    const [savingRemarks, setSavingRemarks] = useState(false);
    const [remarksError, setRemarksError] = useState(null);
    const [remarksSaved, setRemarksSaved] = useState(false);

    const handleSaveRemarks = async () => {
        setSavingRemarks(true);
        setRemarksError(null);
        setRemarksSaved(false);
        try {
            await updateReportCardRemarks(
                examId ?? student?.examId,
                student.studentId,
                { teacherRemarks, principalRemarks }
            );
            setRemarksSaved(true);
            setEditingRemarks(false);
            onUpdateRemarks?.(student.studentId, { teacherRemarks, principalRemarks });
        } catch (err) {
            setRemarksError(err.message ?? "Failed to save remarks.");
        } finally {
            setSavingRemarks(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @media print {
                    /* Hide everything first */
                    body * { visibility: hidden !important; }

                    /* Make only the report content visible */
                    .rc-print-content,
                    .rc-print-content * { visibility: visible !important; }

                    /* Stretch the content to fill the printed page */
                    .rc-print-content {
                        position: fixed !important;
                        inset: 0 !important;
                        z-index: 99999 !important;
                        background: white !important;
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                        padding: 16px !important;
                    }

                    /* Remove scroll clipping so nothing gets cut off */
                    .rc-scroll {
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                    }

                    /* Hide the sticky header and footer (buttons etc.) */
                    .rc-no-print {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    /* Prevent subject rows splitting across pages */
                    tr { page-break-inside: avoid; }
                }

                .rc-scroll::-webkit-scrollbar { width: 4px; }
                .rc-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
                .rc-scroll::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 99px; }
                @keyframes rcFadeIn { from { opacity:0; transform:scale(0.96) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
                .rc-root { animation: rcFadeIn 0.22s ease-out; }
            `}</style>

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-y-auto">
                <div
                    className="rc-root bg-white w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-2xl flex flex-col rounded-t-2xl"
                    style={{ maxHeight: "96vh", height: "100vh" }}
                >
                    {/* ── Sticky Header ── */}
                    <div className="rc-no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-gray-100 shrink-0 rounded-t-2xl bg-white z-10">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-gray-800">Report Card</span>
                            <span className="hidden sm:inline text-xs text-gray-400 truncate max-w-[180px]">
                                — {student?.studentName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ── Scrollable Content (this is what gets printed) ── */}
                    <div className="rc-scroll rc-print-content overflow-y-auto flex-1">
                        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">

                            {/* ══ School Header ══ */}
                            <div
                                className="relative rounded-2xl border-2 border-indigo-200 overflow-hidden"
                                style={{ background: "linear-gradient(135deg,#eef2ff 0%,#f0f9ff 60%,#faf5ff 100%)" }}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30 blur-3xl"
                                    style={{ background: "radial-gradient(circle,#818cf8,transparent)" }} />
                                <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-20 blur-2xl"
                                    style={{ background: "radial-gradient(circle,#38bdf8,transparent)" }} />
                                <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6,#06b6d4)" }} />
                                <div className="relative px-4 sm:px-5 py-4 sm:py-5 text-center">
                                    <div className="flex justify-center mb-3">
                                        {school.logoUrl ? (
                                            <img src={school.logoUrl} alt="Logo"
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-white border-2 border-indigo-200 shadow-lg p-1"
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-indigo-300"
                                                style={{ background: "linear-gradient(135deg,#6366f1,#3b82f6)" }}>
                                                <span className="text-white text-base sm:text-lg font-black tracking-tight">{initials}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h1 className="text-base sm:text-lg lg:text-2xl font-black text-gray-900 tracking-tight leading-tight">{school.name}</h1>
                                    {school.address && <p className="text-xs text-gray-400 mt-0.5">{school.address} &middot; {school.board}</p>}
                                    <div className="mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-md"
                                        style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6)" }}>
                                        <Star className="w-3 h-3" />
                                        <span className="hidden sm:inline">{student?.examTypeName} — {student?.examName} Report Card</span>
                                        <span className="sm:hidden">{student?.examTypeName}</span>
                                        <Star className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="h-1 w-full opacity-40" style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6,#06b6d4)" }} />
                            </div>

                            {/* ══ Student Info ══ */}
                            <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                                    <div className="w-1.5 h-4 rounded-full bg-indigo-500" />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Student Information</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
                                        {[
                                            ["Student Name", student?.studentName ?? "—"],
                                            ["Admission No.", student?.admissionNumber ?? "—"],
                                            ["Class", student?.className ?? "—"],
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex items-start sm:items-center gap-2">
                                                <span className="text-[11px] font-semibold text-indigo-400 w-24 sm:w-28 shrink-0 pt-0.5 sm:pt-0">{label}</span>
                                                <span className="text-sm font-bold text-gray-800">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
                                        {[
                                            ["Section", student?.sectionName ?? "—"],
                                            ["Roll No.", student?.rollNumber ?? "—"],
                                            ["Exam", student?.examTypeName ?? student?.examName ?? "—"],
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex items-start sm:items-center gap-2">
                                                <span className="text-[11px] font-semibold text-indigo-400 w-24 sm:w-28 shrink-0 pt-0.5 sm:pt-0">{label}</span>
                                                <span className="text-sm font-bold text-gray-800">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ══ Marks Table ══ */}
                            <div className="rounded-xl border-2 border-indigo-100 overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-indigo-100"
                                    style={{ background: "linear-gradient(90deg,#eef2ff,#eff6ff)" }}>
                                    <div className="w-1.5 h-4 rounded-full bg-indigo-500" />
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Subject-wise Marks</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[460px]">
                                        <thead>
                                            <tr style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6)" }}>
                                                {["Subject", "Max", "Theory", "Practical", "Total", "%", "Grade", "Status"].map((h) => (
                                                    <th key={h} className="text-left px-2.5 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center text-xs text-gray-400 py-6">
                                                        No subject marks available.
                                                    </td>
                                                </tr>
                                            ) : subjects.map((sub, i) => {
                                                const subPct = sub.maxMarks
                                                    ? Math.round((sub.totalMarks / sub.maxMarks) * 100)
                                                    : 0;
                                                const g = getGrade(subPct);
                                                const pass = !sub.isAbsent && sub.totalMarks >= (sub.passingMarks ?? 0);

                                                return (
                                                    <tr key={`${sub.subjectId}-${i}`}
                                                        className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-indigo-50/30 transition-colors`}>
                                                        <td className="px-2.5 sm:px-3 py-2 sm:py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                                                            {sub.subjectName}
                                                        </td>
                                                        <td className="px-2.5 sm:px-3 py-2 text-gray-400 text-xs">{sub.maxMarks}</td>
                                                        <td className="px-2.5 sm:px-3 py-2 text-gray-500 text-xs">
                                                            {sub.isAbsent ? <span className="text-blue-400 font-semibold">AB</span>
                                                                : sub.theoryMarks != null ? sub.theoryMarks
                                                                    : <span className="text-gray-200">—</span>}
                                                        </td>
                                                        <td className="px-2.5 sm:px-3 py-2 text-gray-500 text-xs">
                                                            {sub.isAbsent ? <span className="text-blue-400 font-semibold">AB</span>
                                                                : sub.practicalMarks != null ? sub.practicalMarks
                                                                    : <span className="text-gray-200">—</span>}
                                                        </td>
                                                        <td className="px-2.5 sm:px-3 py-2">
                                                            <span className="font-extrabold text-gray-900">
                                                                {sub.isAbsent ? <span className="text-blue-400 font-semibold">AB</span> : sub.totalMarks}
                                                            </span>
                                                        </td>
                                                        <td className="px-2.5 sm:px-3 py-2">
                                                            <div className="flex items-center gap-1 sm:gap-1.5">
                                                                <div className="w-6 sm:w-8 h-1.5 rounded-full bg-gray-100 overflow-hidden hidden sm:block shrink-0">
                                                                    <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${subPct}%` }} />
                                                                </div>
                                                                <span className="text-xs font-semibold text-gray-600">
                                                                    {sub.isAbsent ? "—" : `${subPct}%`}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-2.5 sm:px-3 py-2">
                                                            <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] font-extrabold border-2 ${g.bg} ${g.color} ${g.border}`}>
                                                                {sub.isAbsent ? "AB" : (sub.grade || g.label)}
                                                            </span>
                                                        </td>
                                                        <td className="px-2.5 sm:px-3 py-2">
                                                            {sub.isAbsent ? (
                                                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold border bg-gray-50 text-gray-500 border-gray-200">
                                                                    Absent
                                                                </span>
                                                            ) : (
                                                                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold border ${pass ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                                                    {pass ? "Pass" : "Fail"}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ══ Summary Cards ══ */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                <div className="col-span-2 sm:col-span-1 rounded-xl border-2 border-indigo-100 p-3 text-center"
                                    style={{ background: "linear-gradient(135deg,#eef2ff,#eff6ff)" }}>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Marks</p>
                                    <p className="text-lg sm:text-xl font-extrabold text-gray-900">
                                        {student?.totalMarksObtained ?? "—"}
                                        <span className="text-xs font-semibold text-gray-400"> / {student?.totalMaxMarks ?? "—"}</span>
                                    </p>
                                </div>
                                <div className="rounded-xl border-2 border-blue-100 p-3 text-center"
                                    style={{ background: "linear-gradient(135deg,#eff6ff,#f0f9ff)" }}>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Percentage</p>
                                    <p className="text-lg sm:text-xl font-extrabold text-gray-900">
                                        {pct != null ? `${Number(pct).toFixed(1)}%` : "—"}
                                    </p>
                                </div>
                                <div className={`rounded-xl border-2 p-3 text-center ${overallGrade.bg} ${overallGrade.border}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-400">Grade</p>
                                    <span className={`text-2xl font-extrabold ${overallGrade.color}`}>
                                        {student?.overallGrade || overallGrade.label}
                                    </span>
                                </div>
                                <div className="rounded-xl border-2 border-amber-200 p-3 text-center"
                                    style={{ background: "linear-gradient(135deg,#fffbeb,#fef9c3)" }}>
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Class Rank</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <Medal className="w-4 h-4 text-amber-500" />
                                        <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                                            {student?.classRank ?? "—"}
                                        </span>
                                    </div>
                                    {student?.sectionRank && (
                                        <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                                            Section: {student.sectionRank}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ══ Result Banner ══ */}
                            <div className={`relative flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl py-3 sm:py-3.5 font-bold text-xs sm:text-sm border-2 overflow-hidden ${isAbsent
                                    ? "bg-gray-50 border-gray-200 text-gray-500"
                                    : isPassed
                                        ? "border-emerald-300 text-emerald-700"
                                        : "border-red-300 text-red-600"
                                }`}
                                style={!isAbsent ? {
                                    background: isPassed
                                        ? "linear-gradient(90deg,#ecfdf5,#f0fdf4,#ecfdf5)"
                                        : "linear-gradient(90deg,#fef2f2,#fff1f2,#fef2f2)"
                                } : {}}>
                                {isAbsent ? (
                                    <><Award className="w-4 h-4 sm:w-5 sm:h-5" /> RESULT: ABSENT — Exam not appeared</>
                                ) : isPassed ? (
                                    <><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> RESULT: PASSED — Promoted to next class</>
                                ) : (
                                    <><XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> RESULT: FAILED — Not promoted</>
                                )}
                            </div>

                            {/* ══ Remarks ══ */}
                            <div className="rounded-xl border-2 border-indigo-100 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/40 border-b border-indigo-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-4 rounded-full bg-indigo-500" />
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Remarks</p>
                                    </div>
                                    {!editingRemarks && (
                                        <button
                                            onClick={() => { setEditingRemarks(true); setRemarksSaved(false); setRemarksError(null); }}
                                            className="rc-no-print text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all"
                                        >
                                            {(student?.teacherRemarks || student?.principalRemarks) ? "Edit" : "+ Add Remarks"}
                                        </button>
                                    )}
                                </div>

                                {remarksSaved && (
                                    <div className="px-4 py-2 bg-green-50 text-xs text-green-700 border-b border-green-100 flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Remarks saved successfully.
                                    </div>
                                )}
                                {remarksError && (
                                    <div className="px-4 py-2 bg-red-50 text-xs text-red-600 border-b border-red-100">
                                        {remarksError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4">
                                    {/* Teacher Remarks */}
                                    <div className="rounded-xl border border-indigo-100 p-3 bg-indigo-50/40">
                                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Teacher's Remarks</p>
                                        {editingRemarks ? (
                                            <textarea
                                                value={teacherRemarks}
                                                onChange={(e) => setTeacherRemarks(e.target.value)}
                                                rows={3}
                                                placeholder="Enter teacher's remarks..."
                                                className="w-full text-xs text-gray-700 border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
                                            />
                                        ) : (
                                            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                                                {teacherRemarks
                                                    ? `"${teacherRemarks}"`
                                                    : <span className="text-gray-300 not-italic">No remarks added yet.</span>}
                                            </p>
                                        )}
                                    </div>

                                    {/* Principal Remarks */}
                                    <div className="rounded-xl border border-blue-100 p-3 bg-blue-50/40">
                                        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">Principal's Remarks</p>
                                        {editingRemarks ? (
                                            <textarea
                                                value={principalRemarks}
                                                onChange={(e) => setPrincipalRemarks(e.target.value)}
                                                rows={3}
                                                placeholder="Enter principal's remarks..."
                                                className="w-full text-xs text-gray-700 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                                            />
                                        ) : (
                                            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                                                {principalRemarks
                                                    ? `"${principalRemarks}"`
                                                    : <span className="text-gray-300 not-italic">No remarks added yet.</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Edit mode action buttons */}
                                {editingRemarks && (
                                    <div className="rc-no-print flex items-center justify-end gap-2 px-4 pb-4">
                                        <button
                                            onClick={() => {
                                                setTeacherRemarks(student?.teacherRemarks ?? "");
                                                setPrincipalRemarks(student?.principalRemarks ?? "");
                                                setEditingRemarks(false);
                                                setRemarksError(null);
                                            }}
                                            disabled={savingRemarks}
                                            className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveRemarks}
                                            disabled={savingRemarks}
                                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-60"
                                        >
                                            {savingRemarks && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            {savingRemarks ? "Saving..." : "Save Remarks"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ══ Signatures ══ */}
                            <div className="rounded-xl border-2 border-dashed border-gray-200 px-4 sm:px-5 py-4 flex flex-col sm:flex-row justify-between gap-6">
                                <div className="flex flex-col gap-3 items-start">
                                    <span className="text-xs font-semibold text-gray-500">Class Teacher Signature</span>
                                    <div className="w-36 border-b-2 border-gray-300" />
                                </div>
                                <div className="flex flex-col gap-3 items-start sm:items-end">
                                    <span className="text-xs font-semibold text-gray-500">Principal Signature</span>
                                    <div className="w-36 border-b-2 border-gray-300" />
                                </div>
                            </div>

                            {/* Footer */}
                            <p className="text-center text-[10px] text-gray-300 pb-1">
                                {school.name} · {school.board} · Generated by School Management System
                                {student?.generatedAt && (
                                    <> · {new Date(student.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* ── Sticky Footer ── */}
                    <div className="rc-no-print flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-gray-100 shrink-0 bg-gray-50/80 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm active:scale-95 transition-all"
                            style={{ background: "linear-gradient(90deg,#6366f1,#3b82f6)" }}
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Print Report Card</span>
                            <span className="sm:hidden">Print</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
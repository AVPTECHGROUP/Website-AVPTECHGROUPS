import { useState, useEffect, useCallback } from "react";
import { Save, RotateCcw, ChevronDown, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import { useParams } from "react-router-dom";

import {
    getMarksSheet,
    bulkEnterMarks,
    updateMarks,
    getExams,
    getExamSubjects,
} from "../../Api/Exams";
import { getActiveClasses, getAllSections } from "../../Api/TeachersAPI";

// ─── Grade colour helper ──────────────────────────────────────────────────────
function getGrade(marks, max, absent) {
    if (absent || !max) return { label: "AB", bg: "bg-gray-100 text-gray-600" };
    const pct = (marks / max) * 100;
    if (pct >= 91) return { label: "A+", bg: "bg-green-100 text-green-700" };
    if (pct >= 81) return { label: "A", bg: "bg-green-100 text-green-600" };
    if (pct >= 71) return { label: "B+", bg: "bg-blue-100 text-blue-700" };
    if (pct >= 61) return { label: "B", bg: "bg-blue-100 text-blue-600" };
    if (pct >= 51) return { label: "C", bg: "bg-purple-100 text-purple-700" };
    if (pct >= 33) return { label: "D", bg: "bg-orange-100 text-orange-600" };
    return { label: "F", bg: "bg-red-100 text-red-600" };
}

function getRowBg(marks, max, absent) {
    if (absent) return "bg-blue-50/40";
    if (!max) return "";
    const pct = (marks / max) * 100;
    if (pct >= 60) return "bg-yellow-50/50";
    if (pct >= 33) return "";
    return "bg-red-50/40";
}

// ─── Helper: extract examSubjectConfigId from subject config object ────────────
function extractConfigId(obj) {
    if (!obj) return null;
    return (
        obj.examSubjectConfigId ??
        obj.configId ??
        obj.examSubjectId ??
        obj.subjectConfigId ??
        obj.id ??
        null
    );
}

// ─── Reusable Select ─────────────────────────────────────────────────────────
function Select({ value, onChange, options = [], placeholder, disabled, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

// ─── Controlled marks input ───────────────────────────────────────────────────
function MarksInput({ value, max, disabled, onChange }) {
    const [raw, setRaw] = useState(String(value ?? 0));

    useEffect(() => { setRaw(String(value ?? 0)); }, [value]);

    const handleChange = (e) => {
        const input = e.target.value;
        if (input === "") { setRaw(""); onChange(0); return; }
        if (!/^\d+$/.test(input)) return;
        const clamped = Math.min(parseInt(input, 10), max);
        setRaw(String(clamped));
        onChange(clamped);
    };

    const handleBlur = () => {
        if (raw === "" || isNaN(parseInt(raw, 10))) { setRaw("0"); onChange(0); }
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={disabled ? "0" : raw}
            disabled={disabled}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full max-w-[5rem] border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
        />
    );
}

// ─── sectionLabel helper ──────────────────────────────────────────────────────
function sectionLabel(s) {
    if (!s) return "—";
    if (s.schoolClassName) return `${s.schoolClassName} — ${s.name}`;
    if (s.className) return `${s.className} — ${s.name}`;
    return s.name ?? "—";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarksEntry() {

    // ── Meta dropdowns ────────────────────────────────────────────────────────
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("");
    const [selectedSectionSubjectId, setSelectedSectionSubjectId] = useState("");

    const [loadingMeta, setLoadingMeta] = useState(true);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // ── Marks sheet ───────────────────────────────────────────────────────────
    const [localRows, setLocalRows] = useState([]);
    const [savedRows, setSavedRows] = useState([]);
    const [loadingSheet, setLoadingSheet] = useState(false);
    const [sheetLoaded, setSheetLoaded] = useState(false);
    const [sheetError, setSheetError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // ── Save state ────────────────────────────────────────────────────────────
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ── Derived ───────────────────────────────────────────────────────────────
    const anyAlreadySaved = savedRows.some((r) => r.marksId != null && r.marksId !== 0);
    const isUpdateMode = anyAlreadySaved && hasChanges;

    const { examId: paramExamId } = useParams();

    const selectedSubjectConfig = subjects.find(
        (s) => String(s.sectionSubjectId) === selectedSectionSubjectId
    );
    const hasTheoryPractical = selectedSubjectConfig?.hasTheoryPractical ?? false;
    const maxMarks = selectedSubjectConfig?.maxMarks ?? 100;
    const maxTheory = selectedSubjectConfig?.maxTheoryMarks ?? 0;
    const maxPractical = selectedSubjectConfig?.maxPracticalMarks ?? 0;
    const passingMarks = selectedSubjectConfig?.passingMarks ?? 33;

    const examSubjectConfigId =
        extractConfigId(selectedSubjectConfig) ??
        localRows[0]?.examSubjectConfigId ??
        null;

    // ── 1. Load classes + sections on mount ───────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoadingMeta(true);
            try {
                const [cls, secsRaw] = await Promise.all([
                    getActiveClasses(),
                    getAllSections()
                ]);

                setClasses(cls);

                const secArr = Array.isArray(secsRaw)
                    ? secsRaw
                    : secsRaw?.data ?? [];

                setSections(secArr);

                if (cls.length > 0) {
                    setSelectedClassId(String(cls[0].id));
                }

            } catch (err) {
                console.error("MarksEntry meta load error:", err);
            } finally {
                setLoadingMeta(false);
            }
        };

        load();
    }, []);

    // Section Auto-Sync Effect cuando cambia la clase
    useEffect(() => {
        if (!selectedClassId || sections.length === 0) return;

        const classSections = sections.filter(
            (s) => String(s.classId) === String(selectedClassId) || String(s.schoolClassId) === String(selectedClassId)
        );

        const isCurrentSectionValid = classSections.some((s) => String(s.id) === String(selectedSectionId));

        if (!isCurrentSectionValid && classSections.length > 0) {
            setSelectedSectionId(String(classSections[0].id));
        }
    }, [selectedClassId, sections, selectedSectionId]);

    // ── 2. Route Resolve Effect ───────────────────────────────────────────────
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
                console.error("MarksEntry route exam resolve error:", err);
            }
        };

        resolveRouteExamClass();
    }, [paramExamId, classes]);

    // ── 3. Load exams when class changes ──────────────────────────────────────
    useEffect(() => {
        if (!selectedClassId) return;
        const load = async () => {
            setLoadingExams(true);
            setExams([]);
            setSelectedExamId("");
            setSubjects([]);
            setSelectedSectionSubjectId("");
            setSheetLoaded(false);
            setLocalRows([]);
            setSavedRows([]);
            try {
                const data = await getExams({ classId: selectedClassId });
                setExams(data);
                if (paramExamId) {
                    const matchedExam = data.find((e) => String(e.id) === String(paramExamId));
                    if (matchedExam) {
                        setSelectedExamId(String(matchedExam.id));
                        return;
                    }
                }
                if (data.length > 0) setSelectedExamId(String(data[0].id));
            } catch (err) {
                console.error("Load exams error:", err);
            } finally {
                setLoadingExams(false);
            }
        };
        load();
    }, [selectedClassId, paramExamId]);

    // ── 4. Load subject configs when exam + section changes ───────────────────
    useEffect(() => {
        if (!selectedExamId || !selectedSectionId) return;
        const load = async () => {
            setLoadingSubjects(true);
            setSubjects([]);
            setSelectedSectionSubjectId("");
            setSheetLoaded(false);
            setLocalRows([]);
            setSavedRows([]);
            try {
                const data = await getExamSubjects(Number(selectedExamId), Number(selectedSectionId));
                setSubjects(data);
                if (data.length > 0) setSelectedSectionSubjectId(String(data[0].sectionSubjectId));
            } catch (err) {
                console.error("Load subjects error:", err);
            } finally {
                setLoadingSubjects(false);
            }
        };
        load();
    }, [selectedExamId, selectedSectionId]);

    // ── 5. Marks Sheet Fetch Callback ─────────────────────────────────────────
    const loadSheet = useCallback(async () => {
        if (!selectedExamId || !selectedSectionSubjectId) return;
        setLoadingSheet(true);
        setSheetError(null);
        setSheetLoaded(false);
        setSaveSuccess(false);
        setSaveError(null);
        setHasChanges(false);
        try {
            const data = await getMarksSheet(
                Number(selectedExamId),
                Number(selectedSectionSubjectId)
            );

            const rows = data.map((s) => ({
                marksId: s.id ?? null,
                examSubjectConfigId: s.examSubjectConfigId ?? s.configId ?? s.examSubjectId ?? null,
                studentId: s.studentId,
                studentName: s.studentName,
                admissionNumber: s.admissionNumber ?? "",
                rollNumber: s.rollNumber ?? "",
                subjectName: s.subjectName ?? "",
                maxMarks: s.maxMarks ?? 100,
                isAbsent: s.isAbsent ?? false,
                totalMarks: s.totalMarks ?? 0,
                theoryMarks: s.theoryMarks ?? 0,
                practicalMarks: s.practicalMarks ?? 0,
                remarks: s.remarks ?? "",
                grade: s.grade ?? "",
            }));

            setLocalRows(rows);
            setSavedRows(JSON.parse(JSON.stringify(rows)));
            setSheetLoaded(true);
            setHasChanges(false);
        } catch (err) {
            console.error("loadSheet error:", err);
            setSheetError("Failed to load marks sheet automaticamente.");
        } finally {
            setLoadingSheet(false);
        }
    }, [selectedExamId, selectedSectionSubjectId]);

    // FIX FEATURE: सब्जेक्ट सिलेक्ट होते ही ऑटोमैटिकली शीट लोड करने का नया Effect हुक
    useEffect(() => {
        if (selectedExamId && selectedSectionSubjectId) {
            loadSheet();
        }
    }, [selectedExamId, selectedSectionSubjectId, loadSheet]);

    // ── Row update helpers ────────────────────────────────────────────────────
    const updateRow = (studentId, field, val) => {
        setHasChanges(true);
        setSaveSuccess(false);
        setSaveError(null);
        setLocalRows((prev) =>
            prev.map((r) => r.studentId === studentId ? { ...r, [field]: val } : r)
        );
    };

    const handleAbsent = (studentId, checked) => {
        setHasChanges(true);
        setSaveSuccess(false);
        setSaveError(null);
        setLocalRows((prev) =>
            prev.map((r) =>
                r.studentId === studentId
                    ? { ...r, isAbsent: checked, totalMarks: 0, theoryMarks: 0, practicalMarks: 0 }
                    : r
            )
        );
    };

    const handleReset = () => {
        setLocalRows(JSON.parse(JSON.stringify(savedRows)));
        setHasChanges(false);
        setSaveSuccess(false);
        setSaveError(null);
    };

    // ── Save / Update ─────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!selectedExamId) {
            setSaveError("No exam selected.");
            return;
        }

        const resolvedConfigId = examSubjectConfigId;
        if (!resolvedConfigId) {
            setSaveError("Subject config ID not found.");
            return;
        }

        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            const examId = Number(selectedExamId);

            if (anyAlreadySaved) {
                const changedRows = localRows.filter((row) => {
                    const saved = savedRows.find((s) => s.studentId === row.studentId);
                    if (!saved) return true;
                    return (
                        row.isAbsent !== saved.isAbsent ||
                        row.totalMarks !== saved.totalMarks ||
                        row.theoryMarks !== saved.theoryMarks ||
                        row.practicalMarks !== saved.practicalMarks ||
                        row.remarks !== saved.remarks
                    );
                });

                if (changedRows.length === 0) {
                    setSaveSuccess(true);
                    setHasChanges(false);
                    setSaving(false);
                    return;
                }

                await Promise.all(
                    changedRows.map((row) => {
                        if (!row.marksId) {
                            throw new Error(`Student "${row.studentName}" has no marksId.`);
                        }
                        return updateMarks(examId, row.marksId, {
                            examSubjectConfigId: row.examSubjectConfigId ?? resolvedConfigId,
                            studentId: row.studentId,
                            isAbsent: row.isAbsent,
                            totalMarks: row.isAbsent ? 0 : row.totalMarks,
                            theoryMarks: row.isAbsent ? 0 : row.theoryMarks,
                            practicalMarks: row.isAbsent ? 0 : row.practicalMarks,
                            remarks: row.remarks,
                        });
                    })
                );
            } else {
                const payload = {
                    examSubjectConfigId: resolvedConfigId,
                    marks: localRows.map((row) => ({
                        examSubjectConfigId: row.examSubjectConfigId ?? resolvedConfigId,
                        studentId: row.studentId,
                        isAbsent: row.isAbsent,
                        totalMarks: row.isAbsent ? 0 : row.totalMarks,
                        theoryMarks: row.isAbsent ? 0 : row.theoryMarks,
                        practicalMarks: row.isAbsent ? 0 : row.practicalMarks,
                        remarks: row.remarks,
                    })),
                };
                await bulkEnterMarks(examId, payload);
            }

            await loadSheet();
            setSaveSuccess(true);
        } catch (err) {
            console.error("handleSave error:", err);
            setSaveError(err.message ?? "Failed to save marks.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f6fb] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <TooltipComponent message="Enter and manage student marks." direction="right" color="nocolor">
                        Manage Marks Entry
                    </TooltipComponent>
                </h2>
            </div>

            {/* ── Fixed Filter Bar (4 Equal Columns without manual button) ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <Select
                        value={selectedClassId}
                        onChange={(v) => { setSelectedClassId(v); setSheetLoaded(false); setLocalRows([]); setSavedRows([]); setHasChanges(false); }}
                        options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
                        placeholder={loadingMeta ? "Loading..." : "Select Class"}
                        disabled={loadingMeta}
                        className="w-full"
                    />

                    <Select
                        value={selectedSectionId}
                        onChange={(v) => { setSelectedSectionId(v); setSheetLoaded(false); setLocalRows([]); setSavedRows([]); setHasChanges(false); }}
                        options={sections
                            .filter((s) => String(s.classId) === String(selectedClassId) || String(s.schoolClassId) === String(selectedClassId))
                            .map((s) => ({ value: String(s.id), label: sectionLabel(s) }))}
                        placeholder={loadingMeta ? "Loading..." : "Select Section"}
                        disabled={loadingMeta || !selectedClassId}
                        className="w-full"
                    />

                    <Select
                        value={selectedExamId}
                        onChange={(v) => { setSelectedExamId(v); setSheetLoaded(false); setLocalRows([]); setSavedRows([]); setHasChanges(false); }}
                        options={exams.map((e) => ({ value: String(e.id), label: e.name }))}
                        placeholder={loadingExams ? "Loading exams..." : "Select Exam"}
                        disabled={loadingExams || !selectedClassId}
                        className="w-full"
                    />

                    <Select
                        value={selectedSectionSubjectId}
                        onChange={(v) => { setSelectedSectionSubjectId(v); setSheetLoaded(false); setLocalRows([]); setSavedRows([]); setHasChanges(false); }}
                        options={subjects.map((s) => ({
                            value: String(s.sectionSubjectId),
                            label: s.subjectName + (s.subjectCode ? ` (${s.subjectCode})` : ""),
                        }))}
                        placeholder={loadingSubjects ? "Loading subjects..." : "Select Subject"}
                        disabled={loadingSubjects || !selectedExamId || !selectedSectionId}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Loading Indicator for automated fetches */}
            {loadingSheet && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-500 font-medium">Fetching student marks sheet automatically...</p>
                </div>
            )}

            {sheetLoaded && !loadingSheet && (
                <MarksSheet
                    rows={localRows}
                    hasTheoryPractical={hasTheoryPractical}
                    maxMarks={maxMarks}
                    maxTheory={maxTheory}
                    maxPractical={maxPractical}
                    passingMarks={passingMarks}
                    subjectName={selectedSubjectConfig?.subjectName ?? ""}
                    examName={exams.find((e) => String(e.id) === selectedExamId)?.name ?? ""}
                    sectionName={sectionLabel(sections.find((s) => String(s.id) === selectedSectionId))}
                    onUpdateRow={updateRow}
                    onAbsent={handleAbsent}
                    onReset={handleReset}
                    onSave={handleSave}
                    saving={saving}
                    saveError={saveError}
                    saveSuccess={saveSuccess}
                    hasChanges={hasChanges}
                    isUpdateMode={isUpdateMode}
                    anyAlreadySaved={anyAlreadySaved}
                />
            )}

            {!sheetLoaded && !loadingSheet && !sheetError && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-16 text-center">
                    <p className="text-sm text-gray-400">
                        Select a Class, Section, Exam and Subject. The sheet will load automatically.
                    </p>
                </div>
            )}

            {sheetError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {sheetError}
                </div>
            )}
        </div>
    );
}

// ─── MarksSheet sub-component ─────────────────────────────────────────────────
function MarksSheet({
    rows, hasTheoryPractical,
    maxMarks, maxTheory, maxPractical, passingMarks,
    subjectName, examName, sectionName,
    onUpdateRow, onAbsent, onReset, onSave,
    saving, saveError, saveSuccess, hasChanges, isUpdateMode, anyAlreadySaved,
}) {
    const saveLabel = () => {
        if (saving) return anyAlreadySaved ? "Updating..." : "Saving...";
        if (anyAlreadySaved && !hasChanges) return "Saved ✓";
        if (isUpdateMode) return "Update Marks";
        return "Save Marks (Bulk)";
    };

    const saveBtnColor = () => {
        if (saving) return "bg-gray-400 cursor-not-allowed";
        if (anyAlreadySaved && !hasChanges) return "bg-green-700 opacity-80";
        if (isUpdateMode) return "bg-orange-500 hover:bg-orange-600";
        return "bg-green-600 hover:bg-green-700";
    };

    const saveDisabled = saving || (anyAlreadySaved && !hasChanges);

    const headCols = [
        "#", "Roll No.", "Student Name", "Adm. No.",
        ...(hasTheoryPractical
            ? [`Theory (/${maxTheory})`, `Practical (/${maxPractical})`, `Total (/${maxMarks})`]
            : [`Marks (/${maxMarks})`]),
        "Absent", "Grade", "Remarks",
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                    Marks Sheet —{" "}
                    <span className="text-blue-600">{subjectName} — {sectionName} — {examName}</span>
                </h2>
                <div className="flex items-center flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Max: {maxMarks}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">Pass: {passingMarks}</span>
                    {hasTheoryPractical && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            Th {maxTheory} + Pr {maxPractical}
                        </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{rows.length} students</span>
                    {anyAlreadySaved && !hasChanges && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Marks Saved
                        </span>
                    )}
                    {anyAlreadySaved && hasChanges && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                            Unsaved Changes
                        </span>
                    )}
                </div>
            </div>

            {saveSuccess && (
                <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Marks saved successfully!
                </div>
            )}
            {saveError && (
                <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
                </div>
            )}

            {/* Mobile cards */}
            <div className="block xl:hidden divide-y divide-gray-100">
                {rows.map((row) => {
                    const displayMarks = hasTheoryPractical ? row.theoryMarks + row.practicalMarks : row.totalMarks;
                    const grade = getGrade(displayMarks, maxMarks, row.isAbsent);
                    const rowBg = getRowBg(displayMarks, maxMarks, row.isAbsent);
                    return (
                        <div key={row.studentId} className={`p-4 ${rowBg}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{row.studentName}</p>
                                    <p className="text-xs text-gray-400">{row.admissionNumber}{row.rollNumber ? ` · Roll ${row.rollNumber}` : ""}</p>
                                </div>
                                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${grade.bg}`}>{grade.label}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                {hasTheoryPractical ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500 whitespace-nowrap">Theory (/{maxTheory})</label>
                                            <MarksInput value={row.isAbsent ? 0 : row.theoryMarks} max={maxTheory} disabled={row.isAbsent} onChange={(v) => onUpdateRow(row.studentId, "theoryMarks", v)} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500 whitespace-nowrap">Pract. (/{maxPractical})</label>
                                            <MarksInput value={row.isAbsent ? 0 : row.practicalMarks} max={maxPractical} disabled={row.isAbsent} onChange={(v) => onUpdateRow(row.studentId, "practicalMarks", v)} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-500 whitespace-nowrap">Marks (/{maxMarks})</label>
                                        <MarksInput value={row.isAbsent ? 0 : row.totalMarks} max={maxMarks} disabled={row.isAbsent} onChange={(v) => onUpdateRow(row.studentId, "totalMarks", v)} />
                                    </div>
                                )}
                                <label className="flex items-center gap-1.5 text-xs text-gray-500 font-medium cursor-pointer">
                                    <input type="checkbox" checked={row.isAbsent} onChange={(e) => onAbsent(row.studentId, e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                                    Absent
                                </label>
                            </div>
                            <input type="text" value={row.remarks} onChange={(e) => onUpdateRow(row.studentId, "remarks", e.target.value)} placeholder="Remarks..."
                                className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden xl:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {headCols.map((h) => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => {
                            const displayMarks = hasTheoryPractical ? row.theoryMarks + row.practicalMarks : row.totalMarks;
                            const grade = getGrade(displayMarks, maxMarks, row.isAbsent);
                            const rowBg = getRowBg(displayMarks, maxMarks, row.isAbsent);
                            return (
                                <tr key={row.studentId} className={`border-b border-gray-50 transition-colors ${rowBg}`}>
                                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{row.rollNumber || "—"}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.studentName}</td>
                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.admissionNumber || "—"}</td>
                                    {hasTheoryPractical ? (
                                        <>
                                            <td className="px-4 py-3"><MarksInput value={row.isAbsent ? 0 : row.theoryMarks} max={maxTheory} disabled={row.isAbsent} onChange={(v) => onUpdateRow(row.studentId, "theoryMarks", v)} /></td>
                                            <td className="px-4 py-3"><MarksInput value={row.isAbsent ? 0 : row.practicalMarks} max={maxPractical} disabled={row.isAbsent} onChange={(v) => onUpdateRow(row.studentId, "practicalMarks", v)} /></td>
                                            <td className="px-4 py-3 font-bold text-gray-800">{row.isAbsent ? 0 : row.theoryMarks + row.practicalMarks}</td>
                                        </>
                                    ) : (
                                        <td className="px-4 py-3"><MarksInput value={row.isAbsent ? 0 : row.totalMarks} max={maxMarks} disabled={row.isAbsent} onChange={(v) => onUpdateRow(row.studentId, "totalMarks", v)} /></td>
                                    )}
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={row.isAbsent} onChange={(e) => onAbsent(row.studentId, e.target.checked)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${grade.bg}`}>{grade.label}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="text" value={row.remarks} onChange={(e) => onUpdateRow(row.studentId, "remarks", e.target.value)} placeholder="Remarks..."
                                            className="w-32 lg:w-44 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button onClick={onReset} disabled={saving || !hasChanges}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button onClick={onSave} disabled={saveDisabled}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed ${saveBtnColor()}`}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : anyAlreadySaved && !hasChanges ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span className="hidden sm:inline">{saveLabel()}</span>
                    <span className="sm:hidden">{saving ? "..." : isUpdateMode ? "Update" : anyAlreadySaved && !hasChanges ? "✓" : "Save"}</span>
                </button>
            </div>
        </div>
    );
}
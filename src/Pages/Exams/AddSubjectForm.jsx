import { useState, useEffect, useCallback } from "react";
import {
    X, BookOpen, Loader2, CheckCircle2, AlertCircle,
    FlaskConical, ChevronDown, ChevronUp, Save
} from "lucide-react";
import { addExamSubject, bulkAddExamSubjects, updateExamSubject } from "../../Api/Academics/Exams";
import { getSectionSubjectsByClass } from "../../Api/Teachers/TeachersAPI";
import { EXAM_CONSTS } from "../../Constants/StringConstants/AcademicsConstants";

// ─── Per-subject row state factory ────────────────────────────────────────────
function makeRowState(subject, editData = null, alreadyAdded = false) {
    const e = editData;

    return {
        sectionSubjectId: subject.id,
        className: subject.className || "",
        sectionName: subject.sectionName || "",
        subjectName: subject.subjectName || subject.subject?.name || `Subject #${subject.id}`,
        subjectCode: subject.subjectCode || "",
        included: e ? true : false,
        // Already added to this exam — cannot be selected again
        alreadyAdded,
        maxMarks: e?.maxMarks != null ? String(e.maxMarks) : "",
        passingMarks: e?.passingMarks != null ? String(e.passingMarks) : "",
        hasTheoryPractical: e?.hasTheoryPractical ?? false,
        maxTheoryMarks: e?.maxTheoryMarks != null ? String(e.maxTheoryMarks) : "",
        maxPracticalMarks: e?.maxPracticalMarks != null ? String(e.maxPracticalMarks) : "",
        passingTheoryMarks: e?.passingTheoryMarks != null ? String(e.passingTheoryMarks) : "",
        passingPracticalMarks: e?.passingPracticalMarks != null ? String(e.passingPracticalMarks) : "",
        expanded: e?.hasTheoryPractical ?? false,
        errors: {},
    };
}

// ─── Validate a single row ─────────────────────────────────────────────────────
function validateRow(row) {
    if (!row.included) return {};
    const errors = {};
    const max = Number(row.maxMarks);
    const pass = Number(row.passingMarks);

    if (!row.maxMarks || isNaN(max) || max < 1) errors.maxMarks = EXAM_CONSTS.VALIDATION.REQ_MIN_1;
    if (!row.passingMarks || isNaN(pass) || pass < 1) errors.passingMarks = EXAM_CONSTS.VALIDATION.REQ_MIN_1;
    if (!errors.maxMarks && !errors.passingMarks && pass > max)
        errors.passingMarks = EXAM_CONSTS.VALIDATION.EXCEEDS_MAX(max);

    if (row.hasTheoryPractical) {
        const th = Number(row.maxTheoryMarks);
        const pr = Number(row.maxPracticalMarks);
        const pth = Number(row.passingTheoryMarks || 0);
        const ppr = Number(row.passingPracticalMarks || 0);

        if (!row.maxTheoryMarks || isNaN(th) || th < 0) errors.maxTheoryMarks = EXAM_CONSTS.VALIDATION.REQUIRED;
        if (!row.maxPracticalMarks || isNaN(pr) || pr < 0) errors.maxPracticalMarks = EXAM_CONSTS.VALIDATION.REQUIRED;
        if (!errors.maxTheoryMarks && !errors.maxPracticalMarks && !errors.maxMarks && th + pr !== max)
            errors.tpSum = EXAM_CONSTS.VALIDATION.TP_SUM(max);
        if (!errors.maxTheoryMarks && pth > th) errors.passingTheoryMarks = EXAM_CONSTS.VALIDATION.MAX_LIMIT(th);
        if (!errors.maxPracticalMarks && ppr > pr) errors.passingPracticalMarks = EXAM_CONSTS.VALIDATION.MAX_LIMIT(pr);
    }
    return errors;
}

// ─── Small input ──────────────────────────────────────────────────────────────
function NumInput({ value, onChange, placeholder, disabled, hasError, onKeyDown }) {
    return (
        <input
            type="number"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={onKeyDown ?? ((e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault())}
            className={[
                "w-full rounded-lg border px-2 py-1.5 text-sm text-gray-800 bg-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                "placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
                hasError ? "border-red-400 ring-1 ring-red-300" : "border-gray-200",
            ].join(" ")}
        />
    );
}

// ─── Theory/Practical expandable panel ───────────────────────────────────────
function TPPanel({ row, rowIdx, onChange, disabled }) {
    const th = Number(row.maxTheoryMarks || 0);
    const pr = Number(row.maxPracticalMarks || 0);
    const sum = th + pr;
    const max = Number(row.maxMarks || 0);
    const sumOk = sum > 0 && max > 0 && sum === max;

    return (
        <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> {EXAM_CONSTS.ADD_SUBJECT.TP_BREAKDOWN}
            </p>
            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">{EXAM_CONSTS.ADD_SUBJECT.MAX_THEORY}</p>
                    <NumInput
                        value={row.maxTheoryMarks} disabled={disabled}
                        placeholder="e.g. 70"
                        hasError={!!row.errors.maxTheoryMarks || !!row.errors.tpSum}
                        onChange={(e) => onChange(rowIdx, "maxTheoryMarks", e.target.value)}
                    />
                    {row.errors.maxTheoryMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.maxTheoryMarks}</p>}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">{EXAM_CONSTS.ADD_SUBJECT.MAX_PRACTICAL}</p>
                    <NumInput
                        value={row.maxPracticalMarks} disabled={disabled}
                        placeholder="e.g. 30"
                        hasError={!!row.errors.maxPracticalMarks || !!row.errors.tpSum}
                        onChange={(e) => onChange(rowIdx, "maxPracticalMarks", e.target.value)}
                    />
                    {row.errors.maxPracticalMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.maxPracticalMarks}</p>}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">{EXAM_CONSTS.ADD_SUBJECT.PASS_THEORY}</p>
                    <NumInput
                        value={row.passingTheoryMarks} disabled={disabled}
                        placeholder="e.g. 23"
                        hasError={!!row.errors.passingTheoryMarks}
                        onChange={(e) => onChange(rowIdx, "passingTheoryMarks", e.target.value)}
                    />
                    {row.errors.passingTheoryMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.passingTheoryMarks}</p>}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">{EXAM_CONSTS.ADD_SUBJECT.PASS_PRACTICAL}</p>
                    <NumInput
                        value={row.passingPracticalMarks} disabled={disabled}
                        placeholder="e.g. 10"
                        hasError={!!row.errors.passingPracticalMarks}
                        onChange={(e) => onChange(rowIdx, "passingPracticalMarks", e.target.value)}
                    />
                    {row.errors.passingPracticalMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.passingPracticalMarks}</p>}
                </div>
            </div>
            {/* Live sum indicator */}
            {(row.maxTheoryMarks || row.maxPracticalMarks) && (
                <div className={[
                    "mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                    sumOk ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                ].join(" ")}>
                    {sumOk
                        ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                        : <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span className="font-mono">{th} + {pr} = {sum}</span>
                    <span>{sumOk ? EXAM_CONSTS.ADD_SUBJECT.MATCHES_MAX : EXAM_CONSTS.ADD_SUBJECT.MUST_EQUAL(max)}</span>
                </div>
            )}
            {row.errors.tpSum && <p className="text-[10px] text-red-500 mt-1">{row.errors.tpSum}</p>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddSubjectForm({
    examId,
    examName = "",
    classId,
    editData = null,
    alreadyAddedSubjects = [],   // subjects already configured for this exam (from parent)
    onClose,
    onSuccess,
}) {
    const isEdit = Boolean(editData);

    // Build a Set of sectionSubjectIds already added to this exam
    // getExamSubjects returns objects with a `sectionSubjectId` field
    const alreadyAddedIds = new Set(
        (Array.isArray(alreadyAddedSubjects) ? alreadyAddedSubjects : [])
            .map((s) => String(s.sectionSubjectId))
            .filter(Boolean)
    );

    const [sectionSubjects, setSectionSubjects] = useState([]);
    const [rows, setRows] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [topError, setTopError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // Load subjects
    useEffect(() => {
        if (!classId) {
            setTopError(EXAM_CONSTS.ADD_SUBJECT.NO_CLASS_SELECTED);
            setLoadingMeta(false);
            return;
        }
        const load = async () => {
            setLoadingMeta(true);
            setTopError(null);
            try {
                const data = await getSectionSubjectsByClass(classId);
                const list = Array.isArray(data) ? data : [];
                setSectionSubjects(list);

                if (isEdit) {
                    // In edit mode: show only the subject being edited
                    const match = list.find((s) => String(s.id) === String(editData.sectionSubjectId));
                    const subjectToUse = match ?? {
                        id: editData.sectionSubjectId,
                        subjectName: editData.subjectName,
                        subjectCode: editData.subjectCode,
                        sectionName: editData.sectionName,
                    };
                    setRows([makeRowState(subjectToUse, editData, false)]);
                } else {
                    // Add mode: mark subjects already added to this exam
                    setRows(list.map((s) => {
                        const isAlreadyAdded = alreadyAddedIds.has(String(s.id));
                        return makeRowState(s, null, isAlreadyAdded);
                    }));
                    if (list.length === 0) {
                        setTopError(EXAM_CONSTS.ADD_SUBJECT.NO_SUBJECTS_MAPPED);
                    }
                }
            } catch (err) {
                console.error("getSectionSubjectsByClass error:", err);
                setTopError(EXAM_CONSTS.ADD_SUBJECT.LOAD_FAIL);
            } finally {
                setLoadingMeta(false);
            }
        };
        load();
    }, [classId, isEdit, editData]);

    // Update a single field on a row
    const handleFieldChange = useCallback((rowIdx, field, value) => {
        setRows((prev) => {
            const next = [...prev];
            const row = { ...next[rowIdx], [field]: value };
            // Clear related errors on change
            row.errors = { ...row.errors, [field]: undefined };
            if (field === "maxMarks" || field === "maxTheoryMarks" || field === "maxPracticalMarks") {
                row.errors.tpSum = undefined;
            }
            next[rowIdx] = row;
            return next;
        });
        setSubmitError(null);
    }, []);

    // Toggle "included" checkbox — blocked for alreadyAdded rows
    const handleToggleInclude = useCallback((rowIdx) => {
        setRows((prev) => {
            const next = [...prev];
            if (next[rowIdx].alreadyAdded) return next; // no-op
            next[rowIdx] = { ...next[rowIdx], included: !next[rowIdx].included, errors: {} };
            return next;
        });
    }, []);

    // Toggle theory/practical
    const handleToggleTP = useCallback((rowIdx) => {
        setRows((prev) => {
            const next = [...prev];
            const row = { ...next[rowIdx] };
            row.hasTheoryPractical = !row.hasTheoryPractical;
            if (!row.hasTheoryPractical) {
                row.maxTheoryMarks = "";
                row.maxPracticalMarks = "";
                row.passingTheoryMarks = "";
                row.passingPracticalMarks = "";
            }
            row.errors = {};
            next[rowIdx] = row;
            return next;
        });
    }, []);

    // Select all / deselect all — never touches alreadyAdded rows
    const handleSelectAll = (checked) => {
        setRows((prev) => prev.map((r) => r.alreadyAdded ? r : { ...r, included: checked, errors: {} }));
    };

    const selectableRows = rows.filter((r) => !r.alreadyAdded);
    const allSelected = selectableRows.length > 0 && selectableRows.every((r) => r.included);
    const someSelected = rows.some((r) => r.included && !r.alreadyAdded);
    const includedCount = rows.filter((r) => r.included && !r.alreadyAdded).length;
    const alreadyAddedCount = rows.filter((r) => r.alreadyAdded).length;

    const groupedRows = rows.reduce((acc, row) => {
        const groupKey = `${row.className}__${row.sectionName}`;

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }

        acc[groupKey].push(row);

        return acc;
    }, {});
    // Submit
    const handleSubmit = async () => {
        setSubmitError(null);

        if (isEdit) {
            // Edit mode: validate single row
            const row = rows[0];
            const errors = validateRow(row);

            if (Object.keys(errors).length > 0) {
                setRows((prev) => {
                    const next = [...prev];
                    next[0] = { ...next[0], errors };
                    return next;
                });

                setSubmitError(EXAM_CONSTS.ADD_SUBJECT.FIX_ERRORS);
                return;
            }
        } else {
            // Add mode: validate all included rows
            if (!someSelected) {
                setSubmitError(EXAM_CONSTS.ADD_SUBJECT.SELECT_AT_LEAST_ONE);
                return;
            }

            let hasErrors = false;

            const nextRows = rows.map((row) => {
                if (!row.included) return row;

                const errors = validateRow(row);

                if (Object.keys(errors).length > 0) {
                    hasErrors = true;
                }

                return { ...row, errors };
            });

            if (hasErrors) {
                setRows(nextRows);
                setSubmitError(EXAM_CONSTS.ADD_SUBJECT.FIX_HIGHLIGHTED);
                return;
            }
        }

        setSubmitting(true);

        try {
            // ─────────────────────────────
            // EDIT MODE → SINGLE UPDATE API
            // ─────────────────────────────
            if (isEdit) {
                const row = rows[0];
                const tp = row.hasTheoryPractical;

                const payload = {
                    sectionSubjectId: Number(row.sectionSubjectId),
                    maxMarks: Number(row.maxMarks),
                    passingMarks: Number(row.passingMarks),
                    hasTheoryPractical: tp,
                    maxTheoryMarks: tp ? Number(row.maxTheoryMarks) : null,
                    maxPracticalMarks: tp ? Number(row.maxPracticalMarks) : null,
                    passingTheoryMarks: tp ? Number(row.passingTheoryMarks || 0) : null,
                    passingPracticalMarks: tp ? Number(row.passingPracticalMarks || 0) : null,
                };

                await updateExamSubject(examId, editData.id, payload);

                onSuccess?.();
                return;
            }

            // ─────────────────────────────
            // ADD MODE
            // SINGLE → addExamSubject
            // MULTIPLE → bulkAddExamSubjects
            // ─────────────────────────────
            const includedRows = rows.filter((r) => r.included);

            const payloads = includedRows.map((row) => {
                const tp = row.hasTheoryPractical;

                return {
                    sectionSubjectId: Number(row.sectionSubjectId),
                    maxMarks: Number(row.maxMarks),
                    passingMarks: Number(row.passingMarks),
                    hasTheoryPractical: tp,
                    maxTheoryMarks: tp ? Number(row.maxTheoryMarks) : null,
                    maxPracticalMarks: tp ? Number(row.maxPracticalMarks) : null,
                    passingTheoryMarks: tp ? Number(row.passingTheoryMarks || 0) : null,
                    passingPracticalMarks: tp ? Number(row.passingPracticalMarks || 0) : null,
                };
            });

            // Single add
            if (payloads.length === 1) {
                await addExamSubject(examId, payloads[0]);
            }

            // Bulk add
            else {
                const result = await bulkAddExamSubjects(examId, payloads);

                // Optional skipped message
                if (result?.skippedCount > 0) {
                    setSubmitError(EXAM_CONSTS.ADD_SUBJECT.SKIPPED(result.skippedCount));
                }
            }

            onSuccess?.();

        } catch (err) {
            setSubmitError(
                err?.message || EXAM_CONSTS.ADD_SUBJECT.SAVE_FAIL
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ─── RENDER 
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            {/* Modal card */}
            <div className="bg-white w-full sm:max-w-3xl lg:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                                {isEdit ? EXAM_CONSTS.ADD_SUBJECT.TITLE_EDIT : EXAM_CONSTS.ADD_SUBJECT.TITLE_ADD}
                            </h2>
                            {examName && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{examName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose} disabled={submitting}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0 ml-3"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Top error banner ──────────────────────────────────────── */}
                {(topError || submitError) && (
                    <div className="mx-4 sm:mx-6 mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex-shrink-0">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{topError || submitError}</span>
                    </div>
                )}

                {/* ── Body ─────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">

                    {/* Loading skeleton */}
                    {loadingMeta ? (
                        <div className="space-y-3">
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            {EXAM_CONSTS.ADD_SUBJECT.NO_SUBJECTS_AVAIL}
                        </div>
                    ) : isEdit ? (
                        /* ── EDIT MODE: single subject form ── */
                        <EditSingleRow
                            row={rows[0]}
                            rowIdx={0}
                            onChange={handleFieldChange}
                            onToggleTP={handleToggleTP}
                            disabled={submitting}
                        />
                    ) : (
                        /* ── ADD MODE: bulk subject table ── */
                        <div>
                            {/* Info bar + select all */}
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Select all checkbox — only selects non-added subjects */}
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            disabled={selectableRows.length === 0}
                                            className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">{EXAM_CONSTS.ADD_SUBJECT.SELECT_ALL}</span>
                                    </label>
                                    {someSelected && (
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                            {includedCount} {EXAM_CONSTS.ADD_SUBJECT.SELECTED}
                                        </span>
                                    )}
                                    {alreadyAddedCount > 0 && (
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {alreadyAddedCount} {EXAM_CONSTS.ADD_SUBJECT.ALREADY_ADDED}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">{rows.length} subject{rows.length !== 1 ? "s" : ""} {EXAM_CONSTS.ADD_SUBJECT.TOTAL}</p>
                            </div>

                            {/* ── DESKTOP TABLE (md+) ── */}
                            <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="w-10 px-3 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{EXAM_CONSTS.ADD_SUBJECT.SUBJECT}</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28">{EXAM_CONSTS.ADD_SUBJECT.MAX_MARKS}</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28">{EXAM_CONSTS.ADD_SUBJECT.PASS_MARKS}</th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36">{EXAM_CONSTS.ADD_SUBJECT.TP_COL}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedRows).map(([groupKey, subjects]) => {
                                            const firstSubject = subjects[0];

                                            return (
                                                <>
                                                    {/* Section Badge Row */}
                                                    <tr key={`header-${groupKey}`}>
                                                        <td
                                                            colSpan={5}
                                                            className="bg-slate-50 px-4 py-3 border-y border-slate-200"
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                                                    📚 {firstSubject.className}
                                                                    <span className="text-blue-400">•</span>
                                                                    Section {firstSubject.sectionName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {subjects.map((row) => {
                                                        const actualIndex = rows.findIndex(
                                                            (r) => r.sectionSubjectId === row.sectionSubjectId
                                                        );

                                                        return (
                                                            <DesktopRow
                                                                key={row.sectionSubjectId}
                                                                row={row}
                                                                rowIdx={actualIndex}
                                                                onChange={handleFieldChange}
                                                                onToggleInclude={handleToggleInclude}
                                                                onToggleTP={handleToggleTP}
                                                                disabled={submitting}
                                                            />
                                                        );
                                                    })}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── MOBILE / TABLET CARDS (< md) ── */}
                            <div className="md:hidden space-y-4">
                                {Object.entries(groupedRows).map(([groupKey, subjects]) => {
                                    const firstSubject = subjects[0];

                                    return (
                                        <div key={groupKey}>
                                            {/* Section Header */}
                                            <div className="sticky top-0 z-10 mb-2">
                                                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                                    📚 {firstSubject.className}
                                                    <span className="text-blue-400">•</span>
                                                    Section {firstSubject.sectionName}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {subjects.map((row) => {
                                                    const actualIndex = rows.findIndex(
                                                        (r) => r.sectionSubjectId === row.sectionSubjectId
                                                    );

                                                    return (
                                                        <MobileCard
                                                            key={row.sectionSubjectId}
                                                            row={row}
                                                            rowIdx={actualIndex}
                                                            onChange={handleFieldChange}
                                                            onToggleInclude={handleToggleInclude}
                                                            onToggleTP={handleToggleTP}
                                                            disabled={submitting}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <div className="text-xs text-gray-400 hidden sm:block">
                        {!isEdit && someSelected && `${includedCount} subject${includedCount !== 1 ? "s" : ""} will be added`}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={onClose} disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            {EXAM_CONSTS.ADD_SUBJECT.CANCEL}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || loadingMeta || (!isEdit && !someSelected)}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Save className="w-4 h-4" />}
                            {submitting
                                ? (isEdit ? EXAM_CONSTS.ADD_SUBJECT.SAVING : EXAM_CONSTS.ADD_SUBJECT.ADDING)
                                : (isEdit ? EXAM_CONSTS.ADD_SUBJECT.SAVE_CHANGES : `${EXAM_CONSTS.ADD_SUBJECT.ADD_SUBJECT_BTN}${includedCount > 1 ? "s" : ""}`)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Edit mode: single subject full-width form ────────────────────────────────
function EditSingleRow({ row, rowIdx, onChange, onToggleTP, disabled }) {
    return (
        <div className="space-y-4">
            {/* Subject header */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">{row.subjectName}</p>
                    <p className="text-xs text-blue-500">{row.subjectCode} {row.sectionName ? `· Section ${row.sectionName}` : ""}</p>
                </div>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{EXAM_CONSTS.ADD_SUBJECT.MAX_MARKS}</p>
                    <NumInput
                        value={row.maxMarks} disabled={disabled}
                        placeholder="e.g. 100"
                        hasError={!!row.errors.maxMarks}
                        onChange={(e) => onChange(rowIdx, "maxMarks", e.target.value)}
                    />
                    {row.errors.maxMarks && <p className="text-xs text-red-500 mt-1">{row.errors.maxMarks}</p>}
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{EXAM_CONSTS.ADD_SUBJECT.PASS_MARKS}</p>
                    <NumInput
                        value={row.passingMarks} disabled={disabled}
                        placeholder="e.g. 33"
                        hasError={!!row.errors.passingMarks}
                        onChange={(e) => onChange(rowIdx, "passingMarks", e.target.value)}
                    />
                    {row.errors.passingMarks && <p className="text-xs text-red-500 mt-1">{row.errors.passingMarks}</p>}
                </div>
            </div>

            {/* Theory toggle */}
            <label className={[
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none",
                row.hasTheoryPractical ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
            ].join(" ")}>
                <input
                    type="checkbox"
                    checked={row.hasTheoryPractical}
                    onChange={() => onToggleTP(rowIdx)}
                    disabled={disabled}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                />
                <div>
                    <p className="text-sm font-semibold text-gray-700">{EXAM_CONSTS.ADD_SUBJECT.HAS_TP_SPLIT}</p>
                    <p className="text-xs text-gray-400">{EXAM_CONSTS.ADD_SUBJECT.ENABLE_TP_SPLIT}</p>
                </div>
            </label>

            {row.hasTheoryPractical && (
                <TPPanel row={row} rowIdx={rowIdx} onChange={onChange} disabled={disabled} />
            )}
        </div>
    );
}

// ─── Desktop table row ────────────────────────────────────────────────────────
function DesktopRow({ row, rowIdx, onChange, onToggleInclude, onToggleTP, disabled }) {
    const hasRowError = Object.keys(row.errors).length > 0;

    // Already-added rows get a distinct muted green treatment
    if (row.alreadyAdded) {
        return (
            <tr className="bg-emerald-50/40 border-l-2 border-l-emerald-400">
                {/* Disabled checkbox */}
                <td className="px-3 py-3 align-middle">
                    <input
                        type="checkbox"
                        checked disabled
                        className="w-4 h-4 accent-emerald-500 cursor-not-allowed opacity-60 mt-1"
                    />
                </td>
                {/* Subject name */}
                <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 leading-tight">{row.subjectName}</p>
                            {row.subjectCode && <p className="text-xs text-gray-400 font-mono">{row.subjectCode}</p>}
                        </div>
                    </div>
                </td>
                {/* Already added badge spanning remaining cols */}
                <td colSpan={3} className="px-3 py-3 align-middle">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        {EXAM_CONSTS.ADD_SUBJECT.ALREADY_ADDED_BADGE}
                    </span>
                </td>
            </tr>
        );
    }

    return (
        <>
            <tr className={[
                "transition-colors group",
                row.included ? "bg-blue-50/30" : "bg-white hover:bg-gray-50/60",
                hasRowError ? "border-l-2 border-l-red-400" : row.included ? "border-l-2 border-l-blue-500" : ""
            ].join(" ")}>
                {/* Checkbox */}
                <td className="px-3 py-3 align-top">
                    <input
                        type="checkbox"
                        checked={row.included}
                        onChange={() => onToggleInclude(rowIdx)}
                        disabled={disabled}
                        className="w-4 h-4 accent-blue-600 cursor-pointer mt-1"
                    />
                </td>

                {/* Subject name */}
                <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-2">
                        <div className={[
                            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                            row.included ? "bg-blue-100" : "bg-gray-100"
                        ].join(" ")}>
                            <BookOpen className={["w-3.5 h-3.5", row.included ? "text-blue-600" : "text-gray-400"].join(" ")} />
                        </div>
                        <div>
                            <p className={["text-sm font-semibold leading-tight", row.included ? "text-gray-800" : "text-gray-500"].join(" ")}>
                                {row.subjectName}
                            </p>
                            {row.subjectCode && (
                                <p className="text-xs text-gray-400 font-mono">{row.subjectCode}</p>
                            )}
                        </div>
                    </div>
                </td>

                {/* Max marks */}
                <td className="px-3 py-3 align-top w-28">
                    <NumInput
                        value={row.maxMarks}
                        onChange={(e) => onChange(rowIdx, "maxMarks", e.target.value)}
                        placeholder="e.g. 100"
                        disabled={disabled || !row.included}
                        hasError={!!row.errors.maxMarks}
                    />
                    {row.errors.maxMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.maxMarks}</p>}
                </td>

                {/* Pass marks */}
                <td className="px-3 py-3 align-top w-28">
                    <NumInput
                        value={row.passingMarks}
                        onChange={(e) => onChange(rowIdx, "passingMarks", e.target.value)}
                        placeholder="e.g. 33"
                        disabled={disabled || !row.included}
                        hasError={!!row.errors.passingMarks}
                    />
                    {row.errors.passingMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.passingMarks}</p>}
                </td>

                {/* Theory + Practical toggle */}
                <td className="px-3 py-3 align-top text-center w-36">
                    <label className={[
                        "inline-flex items-center gap-1.5 cursor-pointer select-none",
                        (!row.included || disabled) ? "opacity-40 cursor-not-allowed" : ""
                    ].join(" ")}>
                        <input
                            type="checkbox"
                            checked={row.hasTheoryPractical}
                            onChange={() => onToggleTP(rowIdx)}
                            disabled={disabled || !row.included}
                            className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                        />
                        <FlaskConical className={["w-3.5 h-3.5", row.hasTheoryPractical ? "text-indigo-500" : "text-gray-400"].join(" ")} />
                        <span className="text-xs font-semibold text-gray-600">{EXAM_CONSTS.ADD_SUBJECT.SPLIT}</span>
                    </label>
                </td>
            </tr>

            {/* Theory/Practical expanded row */}
            {row.included && row.hasTheoryPractical && (
                <tr className="bg-indigo-50/40">
                    <td colSpan={5} className="px-4 pb-4 pt-0">
                        <TPPanel row={row} rowIdx={rowIdx} onChange={onChange} disabled={disabled} />
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function MobileCard({ row, rowIdx, onChange, onToggleInclude, onToggleTP, disabled }) {
    const hasRowError = Object.keys(row.errors).length > 0;

    // Already-added: show locked card
    if (row.alreadyAdded) {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-3">
                    <input
                        type="checkbox"
                        checked disabled
                        className="w-4 h-4 accent-emerald-500 cursor-not-allowed opacity-60 flex-shrink-0"
                    />
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-500 truncate">{row.subjectName}</p>
                        {row.subjectCode && <p className="text-xs text-gray-400 font-mono">{row.subjectCode}</p>}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {EXAM_CONSTS.ADD_SUBJECT.ADDED_SHORT}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={[
            "rounded-xl border transition-all overflow-hidden",
            hasRowError ? "border-red-300" : row.included ? "border-blue-300 bg-blue-50/20" : "border-gray-200 bg-white"
        ].join(" ")}>
            {/* Card header: checkbox + subject name */}
            <div
                className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                onClick={() => !disabled && onToggleInclude(rowIdx)}
            >
                <input
                    type="checkbox"
                    checked={row.included}
                    onChange={() => onToggleInclude(rowIdx)}
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                />
                <div className={[
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    row.included ? "bg-blue-100" : "bg-gray-100"
                ].join(" ")}>
                    <BookOpen className={["w-4 h-4", row.included ? "text-blue-600" : "text-gray-400"].join(" ")} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={["text-sm font-bold truncate", row.included ? "text-gray-800" : "text-gray-500"].join(" ")}>
                        {row.subjectName}
                    </p>
                    {row.subjectCode && (
                        <p className="text-xs text-gray-400 font-mono">{row.subjectCode}</p>
                    )}
                </div>
                {row.included && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">Selected</span>
                )}
            </div>

            {/* Expanded fields when included */}
            {row.included && (
                <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
                    {/* Marks row */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">{EXAM_CONSTS.ADD_SUBJECT.MAX_MARKS}</p>
                            <NumInput
                                value={row.maxMarks}
                                onChange={(e) => onChange(rowIdx, "maxMarks", e.target.value)}
                                placeholder="e.g. 100"
                                disabled={disabled}
                                hasError={!!row.errors.maxMarks}
                            />
                            {row.errors.maxMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.maxMarks}</p>}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">{EXAM_CONSTS.ADD_SUBJECT.PASS_MARKS}</p>
                            <NumInput
                                value={row.passingMarks}
                                onChange={(e) => onChange(rowIdx, "passingMarks", e.target.value)}
                                placeholder="e.g. 33"
                                disabled={disabled}
                                hasError={!!row.errors.passingMarks}
                            />
                            {row.errors.passingMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.passingMarks}</p>}
                        </div>
                    </div>

                    {/* Theory toggle */}
                    <label className={[
                        "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all select-none",
                        row.hasTheoryPractical ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white"
                    ].join(" ")}>
                        <input
                            type="checkbox"
                            checked={row.hasTheoryPractical}
                            onChange={() => onToggleTP(rowIdx)}
                            disabled={disabled}
                            className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                        />
                        <FlaskConical className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-700">{EXAM_CONSTS.ADD_SUBJECT.HAS_TP_SPLIT}</span>
                    </label>

                    {row.hasTheoryPractical && (
                        <TPPanel row={row} rowIdx={rowIdx} onChange={onChange} disabled={disabled} />
                    )}
                </div>
            )}
        </div>
    );
}
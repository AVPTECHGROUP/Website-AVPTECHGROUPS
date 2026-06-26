import { useState, useCallback, useEffect } from "react";
import {
    X, BookOpen, Loader2, CheckCircle2, AlertCircle,
    FlaskConical, Save, RefreshCw,
} from "lucide-react";
import { bulkUpdateExamSubjects } from "../../Api/Academics/Exams";

function makeRowFromConfig(subject) {
    return {
        configId: subject.id,                        // existing config ID — needed for PUT
        sectionSubjectId: subject.sectionSubjectId,
        subjectName: subject.subjectName ?? `Subject #${subject.id}`,
        subjectCode: subject.subjectCode ?? "",
        sectionName: subject.sectionName ?? "",
        maxMarks: subject.maxMarks != null ? String(subject.maxMarks) : "",
        passingMarks: subject.passingMarks != null ? String(subject.passingMarks) : "",
        hasTheoryPractical: subject.hasTheoryPractical ?? false,
        maxTheoryMarks: subject.maxTheoryMarks != null ? String(subject.maxTheoryMarks) : "",
        maxPracticalMarks: subject.maxPracticalMarks != null ? String(subject.maxPracticalMarks) : "",
        passingTheoryMarks: subject.passingTheoryMarks != null ? String(subject.passingTheoryMarks) : "",
        passingPracticalMarks: subject.passingPracticalMarks != null ? String(subject.passingPracticalMarks) : "",
        errors: {},
    };
}

// ─── Validate a single row ────────────────────────────────────────────────────
function validateRow(row) {
    const errors = {};
    const max = Number(row.maxMarks);
    const pass = Number(row.passingMarks);

    if (!row.maxMarks || isNaN(max) || max < 1) errors.maxMarks = "Required, min 1";
    if (!row.passingMarks || isNaN(pass) || pass < 1) errors.passingMarks = "Required, min 1";
    if (!errors.maxMarks && !errors.passingMarks && pass > max)
        errors.passingMarks = `Cannot exceed ${max}`;

    if (row.hasTheoryPractical) {
        const th = Number(row.maxTheoryMarks);
        const pr = Number(row.maxPracticalMarks);
        const pth = Number(row.passingTheoryMarks || 0);
        const ppr = Number(row.passingPracticalMarks || 0);

        if (!row.maxTheoryMarks || isNaN(th) || th < 0) errors.maxTheoryMarks = "Required";
        if (!row.maxPracticalMarks || isNaN(pr) || pr < 0) errors.maxPracticalMarks = "Required";
        if (!errors.maxTheoryMarks && !errors.maxPracticalMarks && !errors.maxMarks && th + pr !== max)
            errors.tpSum = `Theory + Practical must = ${max}`;
        if (!errors.maxTheoryMarks && pth > th) errors.passingTheoryMarks = `Max ${th}`;
        if (!errors.maxPracticalMarks && ppr > pr) errors.passingPracticalMarks = `Max ${pr}`;
    }
    return errors;
}

// ─── Small number input ───────────────────────────────────────────────────────
function NumInput({ value, onChange, placeholder, disabled, hasError }) {
    return (
        <input
            type="number"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
            className={[
                "w-full rounded-lg border px-2 py-1.5 text-sm text-gray-800 bg-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                "placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
                hasError ? "border-red-400 ring-1 ring-red-300" : "border-gray-200",
            ].join(" ")}
        />
    );
}

// ─── Theory/Practical panel ───────────────────────────────────────────────────
function TPPanel({ row, rowIdx, onChange, disabled }) {
    const th = Number(row.maxTheoryMarks || 0);
    const pr = Number(row.maxPracticalMarks || 0);
    const sum = th + pr;
    const max = Number(row.maxMarks || 0);
    const sumOk = sum > 0 && max > 0 && sum === max;

    return (
        <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> Theory / Practical Breakdown
            </p>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Max Theory *</p>
                    <NumInput
                        value={row.maxTheoryMarks} disabled={disabled}
                        placeholder="e.g. 70"
                        hasError={!!row.errors.maxTheoryMarks || !!row.errors.tpSum}
                        onChange={(e) => onChange(rowIdx, "maxTheoryMarks", e.target.value)}
                    />
                    {row.errors.maxTheoryMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.maxTheoryMarks}</p>}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Max Practical *</p>
                    <NumInput
                        value={row.maxPracticalMarks} disabled={disabled}
                        placeholder="e.g. 30"
                        hasError={!!row.errors.maxPracticalMarks || !!row.errors.tpSum}
                        onChange={(e) => onChange(rowIdx, "maxPracticalMarks", e.target.value)}
                    />
                    {row.errors.maxPracticalMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.maxPracticalMarks}</p>}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Pass Theory</p>
                    <NumInput
                        value={row.passingTheoryMarks} disabled={disabled}
                        placeholder="e.g. 23"
                        hasError={!!row.errors.passingTheoryMarks}
                        onChange={(e) => onChange(rowIdx, "passingTheoryMarks", e.target.value)}
                    />
                    {row.errors.passingTheoryMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.passingTheoryMarks}</p>}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Pass Practical</p>
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
                    <span>{sumOk ? "✓ Matches max marks" : `Must equal ${max || "max marks"}`}</span>
                </div>
            )}
            {row.errors.tpSum && <p className="text-[10px] text-red-500 mt-1">{row.errors.tpSum}</p>}
        </div>
    );
}

// ─── Desktop table row ────────────────────────────────────────────────────────
function DesktopRow({ row, rowIdx, onChange, onToggleTP, disabled }) {
    const hasRowError = Object.keys(row.errors).length > 0;

    return (
        <>
            <tr className={[
                "transition-colors",
                hasRowError ? "bg-red-50/30 border-l-2 border-l-red-400" : "bg-white hover:bg-gray-50/50 border-l-2 border-l-transparent",
            ].join(" ")}>
                {/* Subject info */}
                <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{row.subjectName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {row.subjectCode && (
                                    <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                        {row.subjectCode}
                                    </span>
                                )}
                                {row.sectionName && (
                                    <span className="text-[10px] text-gray-400">§ {row.sectionName}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                {/* Max marks */}
                <td className="px-3 py-3 align-top w-28">
                    <NumInput
                        value={row.maxMarks}
                        onChange={(e) => onChange(rowIdx, "maxMarks", e.target.value)}
                        placeholder="e.g. 100"
                        disabled={disabled}
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
                        disabled={disabled}
                        hasError={!!row.errors.passingMarks}
                    />
                    {row.errors.passingMarks && <p className="text-[10px] text-red-500 mt-0.5">{row.errors.passingMarks}</p>}
                </td>

                {/* Theory + Practical toggle */}
                <td className="px-3 py-3 align-top text-center w-36">
                    <label className={[
                        "inline-flex items-center gap-1.5 cursor-pointer select-none",
                        disabled ? "opacity-40 cursor-not-allowed" : ""
                    ].join(" ")}>
                        <input
                            type="checkbox"
                            checked={row.hasTheoryPractical}
                            onChange={() => onToggleTP(rowIdx)}
                            disabled={disabled}
                            className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                        />
                        <FlaskConical className={["w-3.5 h-3.5", row.hasTheoryPractical ? "text-indigo-500" : "text-gray-400"].join(" ")} />
                        <span className="text-xs font-semibold text-gray-600">Split</span>
                    </label>
                </td>
            </tr>

            {/* Theory/Practical expanded row */}
            {row.hasTheoryPractical && (
                <tr className="bg-indigo-50/30">
                    <td colSpan={4} className="px-4 pb-4 pt-0">
                        <TPPanel row={row} rowIdx={rowIdx} onChange={onChange} disabled={disabled} />
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function MobileCard({ row, rowIdx, onChange, onToggleTP, disabled }) {
    const hasRowError = Object.keys(row.errors).length > 0;

    return (
        <div className={[
            "rounded-xl border transition-all overflow-hidden",
            hasRowError ? "border-red-300 bg-red-50/10" : "border-gray-200 bg-white"
        ].join(" ")}>
            {/* Subject header */}
            <div className="flex items-center gap-3 px-3 py-3 bg-gray-50/60 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{row.subjectName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {row.subjectCode && (
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-200/60 px-1.5 py-0.5 rounded">
                                {row.subjectCode}
                            </span>
                        )}
                        {row.sectionName && (
                            <span className="text-[10px] text-gray-400">§ {row.sectionName}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Marks fields */}
            <div className="px-3 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Max Marks *</p>
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
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Pass Marks *</p>
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
                    row.hasTheoryPractical ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"
                ].join(" ")}>
                    <input
                        type="checkbox"
                        checked={row.hasTheoryPractical}
                        onChange={() => onToggleTP(rowIdx)}
                        disabled={disabled}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                    />
                    <FlaskConical className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">Has Theory + Practical Split</span>
                </label>

                {row.hasTheoryPractical && (
                    <TPPanel row={row} rowIdx={rowIdx} onChange={onChange} disabled={disabled} />
                )}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UpdateSubjectForm({
    examId,
    examName = "",
    subjects = [],        // already-added subjects from getExamSubjects (passed from parent)
    onClose,
    onSuccess,
}) {
    const [rows, setRows] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // Build rows from passed-in subjects
    useEffect(() => {
        if (Array.isArray(subjects) && subjects.length > 0) {
            setRows(subjects.map(makeRowFromConfig));
        }
    }, [subjects]);

    // Update a single field on a row
    const handleFieldChange = useCallback((rowIdx, field, value) => {
        setRows((prev) => {
            const next = [...prev];
            const row = { ...next[rowIdx], [field]: value };
            row.errors = { ...row.errors, [field]: undefined };
            if (["maxMarks", "maxTheoryMarks", "maxPracticalMarks"].includes(field)) {
                row.errors.tpSum = undefined;
            }
            next[rowIdx] = row;
            return next;
        });
        setSubmitError(null);
        setSuccessMsg(null);
    }, []);

    // Toggle theory/practical for a row
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

    // Submit — calls bulkUpdateExamSubjects
    const handleSubmit = async () => {
        setSubmitError(null);
        setSuccessMsg(null);

        // Validate all rows
        let hasErrors = false;
        const validatedRows = rows.map((row) => {
            const errors = validateRow(row);
            if (Object.keys(errors).length > 0) hasErrors = true;
            return { ...row, errors };
        });

        if (hasErrors) {
            setRows(validatedRows);
            setSubmitError("Please fix the errors in the highlighted rows.");
            return;
        }

        setSubmitting(true);
        try {
            // Build payload: each item needs configId + marks fields
            const payload = rows.map((row) => {
                const tp = row.hasTheoryPractical;
                return {
                    configId: row.configId,
                    maxMarks: Number(row.maxMarks),
                    passingMarks: Number(row.passingMarks),
                    hasTheoryPractical: tp,
                    maxTheoryMarks: tp ? Number(row.maxTheoryMarks) : null,
                    maxPracticalMarks: tp ? Number(row.maxPracticalMarks) : null,
                    passingTheoryMarks: tp ? Number(row.passingTheoryMarks || 0) : null,
                    passingPracticalMarks: tp ? Number(row.passingPracticalMarks || 0) : null,
                };
            });

            await bulkUpdateExamSubjects(examId, payload);
            onSuccess?.();
        } catch (err) {
            console.error("bulkUpdateExamSubjects error:", err);
            const msg = err?.message || "Failed to update subjects. Please try again.";
            // API rejects if marks already entered — surface that clearly
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const hasAnyError = rows.some((r) => Object.keys(r.errors).length > 0);

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-3xl lg:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <RefreshCw className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                                Update Subject Config
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

                {/* ── Info notice ──────────────────────────────────────────── */}
                <div className="mx-4 sm:mx-6 mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex-shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                        Updates are only allowed if <strong>no marks have been entered</strong> for any subject in this exam. All {rows.length} subject{rows.length !== 1 ? "s" : ""} will be updated together.
                    </span>
                </div>

                {/* ── Error / success banner ───────────────────────────────── */}
                {submitError && (
                    <div className="mx-4 sm:mx-6 mt-2 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex-shrink-0">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                    </div>
                )}

                {/* ── Body ─────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">

                    {rows.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            No subjects configured for this exam yet.
                        </div>
                    ) : (
                        <>
                            {/* ── DESKTOP TABLE (md+) ── */}
                            <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Max Marks *</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Pass Marks *</th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Theory + Practical</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rows.map((row, idx) => (
                                            <DesktopRow
                                                key={row.configId}
                                                row={row}
                                                rowIdx={idx}
                                                onChange={handleFieldChange}
                                                onToggleTP={handleToggleTP}
                                                disabled={submitting}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── MOBILE CARDS (< md) ── */}
                            <div className="md:hidden space-y-2">
                                {rows.map((row, idx) => (
                                    <MobileCard
                                        key={row.configId}
                                        row={row}
                                        rowIdx={idx}
                                        onChange={handleFieldChange}
                                        onToggleTP={handleToggleTP}
                                        disabled={submitting}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <div className="text-xs text-gray-400 hidden sm:block">
                        {rows.length > 0 && `Updating ${rows.length} subject${rows.length !== 1 ? "s" : ""}`}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={onClose} disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || rows.length === 0}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Save className="w-4 h-4" />}
                            {submitting ? "Updating…" : `Update Subject${rows.length !== 1 ? "s" : ""}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect, useMemo } from 'react';
import {
    Info, AlertTriangle, Check, X, Pause, GraduationCap, Search,
    History, ArrowRight, ArrowLeft, Loader2, PartyPopper,
    ClipboardList, ChevronRight, Rocket,
} from 'lucide-react';

import { useClasses } from '../../ContextAPI/ClassContext';
import { useDecodedUser } from '../../ContextAPI/UserContext';
import { getAcademicYears } from '../../Api/AcademicYears/AcademicYear';
import {
    getEligibleStudentsForPromotion,
    previewStudentPromotion,
    executeStudentPromotion,
} from '../../Api/Academics/StudentPromotion';

import PromotionHistoryModal from './Promotionhistorymodal';

// ─── Static config ──────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Select Class' },
    { id: 2, label: 'Review & Assign' },
    { id: 3, label: 'Confirm & Execute' },
];

const OUTCOME_META = {
    PASS: { label: 'Pass', short: 'Pass', icon: Check, chip: 'bg-green-100 text-green-700', badge: 'bg-green-100 text-green-700' },
    FAIL: { label: 'Fail', short: 'Fail', icon: X, chip: 'bg-red-100 text-red-700', badge: 'bg-red-100 text-red-700' },
    HELD_BACK: { label: 'Held Back', short: 'Hold', icon: Pause, chip: 'bg-amber-100 text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    GRADUATED: { label: 'Graduate', short: 'Grad', icon: GraduationCap, chip: 'bg-purple-100 text-purple-700', badge: 'bg-purple-100 text-purple-700' },
};

const yearLabel = (y) => y?.yearLabel || y?.label || y?.name || `Year #${y?.id}`;

// ─── Stepper ────────────────────────────────────────────────────────────────
const Stepper = ({ current }) => (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 px-4 sm:px-8 py-5 mb-6 flex items-start [&::-webkit-scrollbar]:hidden">
        {STEPS.map((s, i) => (
            <div key={s.id} className={`flex items-center ${i === STEPS.length - 1 ? 'flex-none' : 'flex-1 min-w-[150px]'}`}>
                <div className="flex flex-col items-center gap-1.5 min-w-[92px]">
                    <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors
            ${current > s.id ? 'bg-blue-600 border-blue-600 text-white'
                                : current === s.id ? 'border-blue-600 text-blue-600 bg-blue-50'
                                    : 'border-gray-200 text-gray-300 bg-white'}`}
                    >
                        {current > s.id ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span
                        className={`text-[11px] font-semibold text-center whitespace-nowrap
            ${current === s.id ? 'text-blue-600' : current > s.id ? 'text-gray-600' : 'text-gray-300'}`}
                    >
                        {s.label}
                    </span>
                </div>
                {i !== STEPS.length - 1 && (
                    <div className={`flex-1 min-w-[40px] h-0.5 mx-2 -mt-4 ${current > s.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
            </div>
        ))}
    </div>
);

// ─── Main component ─────────────────────────────────────────────────────────
const StudentPromotion = () => {
    const { classes, loading: classesLoading } = useClasses();
    const { currentAcademicYear } = useDecodedUser();

    const [step, setStep] = useState(1);

    // ── Step 1 — setup form state ──
    const [academicYears, setAcademicYears] = useState([]);
    const [loadingYears, setLoadingYears] = useState(true);
    const [toAcademicYearId, setToAcademicYearId] = useState('');

    const [fromClassId, setFromClassId] = useState('');
    const [fromSectionId, setFromSectionId] = useState('');
    const [toClassId, setToClassId] = useState(''); // number, or 'GRADUATE'
    const [toClassManuallySet, setToClassManuallySet] = useState(false);
    const [defaultTargetSectionId, setDefaultTargetSectionId] = useState('');
    const [defaultOutcomeMode, setDefaultOutcomeMode] = useState('PASS');

    const [loadingStudents, setLoadingStudents] = useState(false);
    const [setupError, setSetupError] = useState('');

    // ── Step 2 — review & assign state ──
    const [rows, setRows] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [historyStudent, setHistoryStudent] = useState(null);

    // ── Step 3 — confirm & execute state ──
    const [previewData, setPreviewData] = useState(null);
    const [activeTab, setActiveTab] = useState('PASS');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);
    const [executeResult, setExecuteResult] = useState(null);
    const [actionError, setActionError] = useState('');

    // ── Load academic years, default "To Academic Year" to active year right after current ──
    useEffect(() => {
        (async () => {
            try {
                setLoadingYears(true);
                const res = await getAcademicYears();
                const rawYears = Array.isArray(res) ? res : (res?.data || []);

                // Exclude closed academic years
                const activeYears = rawYears.filter((y) => y.status !== 'CLOSED');
                setAcademicYears(activeYears);

                if (currentAcademicYear?.id) {
                    const sorted = [...activeYears].sort((a, b) => a.id - b.id);
                    const idx = sorted.findIndex((y) => y.id === currentAcademicYear.id);
                    const next = idx !== -1 ? sorted[idx + 1] : null;
                    if (next) setToAcademicYearId(next.id);
                }
            } catch (err) {
                setSetupError(err.message || 'Failed to load academic years');
            } finally {
                setLoadingYears(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAcademicYear?.id]);

    // ── Auto-map "To Class" to the next class whenever "From Class" changes ──
    useEffect(() => {
        if (!fromClassId || toClassManuallySet || classes.length === 0) return;
        const idx = classes.findIndex((c) => c.id === Number(fromClassId));
        if (idx === -1) return;
        const next = classes[idx + 1];
        setToClassId(next ? next.id : 'GRADUATE');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromClassId, classes]);

    // ── Reset default target section whenever "To Class" changes ──
    useEffect(() => {
        if (!toClassId || toClassId === 'GRADUATE') {
            setDefaultTargetSectionId('');
            return;
        }
        const toClass = classes.find((c) => c.id === Number(toClassId));
        setDefaultTargetSectionId(toClass?.sections?.[0]?.id || '');
    }, [toClassId, classes]);

    const fromClass = classes.find((c) => c.id === Number(fromClassId));
    const fromSections = fromClass?.sections || [];
    const isGraduatingClass = toClassId === 'GRADUATE';
    const toClass = !isGraduatingClass ? classes.find((c) => c.id === Number(toClassId)) : null;
    const toSections = toClass?.sections || [];

    const handleFromClassChange = (val) => {
        setFromClassId(val);
        setFromSectionId('');
        setToClassManuallySet(false);
    };

    const handleToClassChange = (val) => {
        setToClassId(val === 'GRADUATE' ? 'GRADUATE' : Number(val));
        setToClassManuallySet(true);
    };

    const handleLoadStudents = async () => {
        if (!fromClassId || !toClassId || !toAcademicYearId) return;
        setLoadingStudents(true);
        setSetupError('');
        try {
            const data = await getEligibleStudentsForPromotion(fromClassId, fromSectionId || null);
            const initialOutcome = isGraduatingClass ? 'GRADUATED' : 'PASS';
            const mapped = data.map((s) => ({
                studentId: s.studentId,
                studentName: s.studentName,
                rollNumber: s.rollNumber,
                admissionNumber: s.admissionNumber,
                currentClassName: s.currentClassName,
                currentSectionName: s.currentSectionName,
                outcome: initialOutcome,
                toSectionId: initialOutcome === 'PASS' ? (defaultTargetSectionId || '') : '',
                remarks: '',
            }));
            setRows(mapped);
            setSelectedIds(new Set());
            setSearchTerm('');
            setPreviewData(null);
            setActionError('');
            setStep(2);
        } catch (err) {
            setSetupError(err.message || 'Failed to load eligible students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const setRowOutcome = (studentId, outcome) => {
        setRows((prev) =>
            prev.map((r) => {
                if (r.studentId !== studentId) return r;
                const nextSection =
                    outcome === 'PASS' || outcome === 'HELD_BACK' ? (r.toSectionId || defaultTargetSectionId || '') : '';
                return { ...r, outcome, toSectionId: nextSection };
            })
        );
    };

    const setRowSection = (studentId, sectionId) => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, toSectionId: sectionId } : r)));
    };

    const setRowRemarks = (studentId, remarks) => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r)));
    };

    const bulkSetOutcome = (outcome) => {
        setRows((prev) =>
            prev.map((r) => {
                if (!selectedIds.has(r.studentId)) return r;
                const nextSection = outcome === 'PASS' || outcome === 'HELD_BACK' ? (defaultTargetSectionId || '') : '';
                return { ...r, outcome, toSectionId: nextSection };
            })
        );
    };

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const q = searchTerm.trim().toLowerCase();
        return rows.filter(
            (r) => r.studentName?.toLowerCase().includes(q) || r.rollNumber?.toLowerCase().includes(q)
        );
    }, [rows, searchTerm]);

    const counts = useMemo(() => {
        const c = { PASS: 0, FAIL: 0, HELD_BACK: 0, GRADUATED: 0 };
        rows.forEach((r) => { c[r.outcome] = (c[r.outcome] || 0) + 1; });
        return c;
    }, [rows]);

    const allFilteredSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.studentId));

    const toggleSelectAll = (checked) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            filteredRows.forEach((r) => (checked ? next.add(r.studentId) : next.delete(r.studentId)));
            return next;
        });
    };

    const toggleSelectRow = (studentId, checked) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(studentId); else next.delete(studentId);
            return next;
        });
    };

    const buildPayload = () => ({
        fromAcademicYearId: currentAcademicYear?.id,
        toAcademicYearId,
        items: rows.map((r) => ({
            studentId: r.studentId,
            outcome: r.outcome,
            toSectionId: r.outcome === 'PASS' || r.outcome === 'HELD_BACK' ? (r.toSectionId || null) : null,
            remarks: r.remarks || '',
        })),
    });

    const handlePreview = async () => {
        setPreviewLoading(true);
        setActionError('');
        try {
            const data = await previewStudentPromotion(buildPayload());
            setPreviewData(data);
            const firstTab = ['PASS', 'FAIL', 'HELD_BACK', 'GRADUATED'].find((k) =>
                (data.rows || []).some((r) => r.outcome === k)
            );
            setActiveTab(firstTab || 'PASS');
            setStep(3);
        } catch (err) {
            setActionError(err.message || 'Failed to generate promotion preview');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleExecute = async () => {
        setExecuteLoading(true);
        setActionError('');
        try {
            const result = await executeStudentPromotion(buildPayload());
            setExecuteResult(result);
        } catch (err) {
            setActionError(err.message || 'Failed to execute promotion');
        } finally {
            setExecuteLoading(false);
        }
    };

    const handlePromoteAnother = () => {
        setExecuteResult(null);
        setPreviewData(null);
        setRows([]);
        setSelectedIds(new Set());
        setFromClassId('');
        setFromSectionId('');
        setToClassId('');
        setToClassManuallySet(false);
        setActionError('');
        setStep(1);
    };

    const previewRowsForTab = (previewData?.rows || []).filter((r) => r.outcome === activeTab);

    const tabCounts = {
        PASS: previewData?.passCount ?? 0,
        FAIL: previewData?.failCount ?? 0,
        HELD_BACK: previewData?.heldBackCount ?? 0,
        GRADUATED: previewData?.graduateCount ?? 0,
    };

    // ── Success screen ──
    if (executeResult) {
        return (
            <div className="w-full min-w-0 max-w-4xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 sm:px-10 py-14 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                        <PartyPopper className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Promotion Complete</h2>
                    <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                        {executeResult.totalProcessed} students have been processed for{' '}
                        {previewData?.fromAcademicYearLabel} → {previewData?.toAcademicYearLabel}.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-xl mx-auto mb-10 w-full">
                        <SummaryCard value={executeResult.promoted} label="Promoted" cls="bg-green-50 text-green-700" />
                        <SummaryCard value={executeResult.failed} label="Failed" cls="bg-red-50 text-red-700" />
                        <SummaryCard value={executeResult.heldBack} label="Held Back" cls="bg-amber-50 text-amber-700" />
                        <SummaryCard value={executeResult.graduated} label="Graduated" cls="bg-purple-50 text-purple-700" />
                    </div>

                    <div className="flex items-center justify-center gap-3 w-full">
                        <button
                            onClick={handlePromoteAnother}
                            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Promote Another Class
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 grid grid-cols-1 max-w-7xl mx-auto px-4 sm:px-6 py-6">

            {/* Header */}
            <div className="mb-6 w-full">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Promotion</h1>
                <p className="text-sm text-gray-500 mt-1 break-words">
                    Bulk promote students to the next class at the end of an academic year. Changes are applied only after
                    final confirmation.
                </p>
            </div>

            <Stepper current={step} />

            {/* ════════ STEP 1 — SELECT CLASS ════════ */}
            {step === 1 && (
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900">Promotion Setup</h2>
                        <span className="inline-flex shrink-0 items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            Step 1 of 3
                        </span>
                    </div>

                    <div className="px-5 sm:px-6 py-5 w-full">
                        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg px-3.5 py-3 mb-5 w-full">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="flex-1 break-words leading-relaxed">
                                Students are promoted from the <strong>current academic year</strong> into the selected{' '}
                                <strong>target year</strong>. Make sure the target year already exists before proceeding.
                            </span>
                        </div>

                        {setupError && (
                            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3 mb-5 w-full">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="break-words">{setupError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 w-full">
                            <Field label="From Academic Year">
                                <div className="h-10 w-full flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 truncate">
                                    {currentAcademicYear ? yearLabel(currentAcademicYear) : 'No current year set'}
                                </div>
                            </Field>

                            <Field label="To Academic Year">
                                <select
                                    value={toAcademicYearId}
                                    onChange={(e) => setToAcademicYearId(e.target.value ? Number(e.target.value) : '')}
                                    disabled={loadingYears}
                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                >
                                    <option value="">{loadingYears ? 'Loading…' : '— Select Year —'}</option>
                                    {academicYears
                                        .filter((y) => y.id !== currentAcademicYear?.id && y.status !== 'CLOSED')
                                        .map((y) => (
                                            <option key={y.id} value={y.id}>{yearLabel(y)}</option>
                                        ))}
                                </select>
                            </Field>

                            <Field label="From Class">
                                <select
                                    value={fromClassId}
                                    onChange={(e) => handleFromClassChange(e.target.value)}
                                    disabled={classesLoading}
                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                >
                                    <option value="">{classesLoading ? 'Loading…' : '— Select Class —'}</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="From Section">
                                <select
                                    value={fromSectionId}
                                    onChange={(e) => setFromSectionId(e.target.value ? Number(e.target.value) : '')}
                                    disabled={!fromClassId}
                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                >
                                    <option value="">All Sections</option>
                                    {fromSections.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            <Field label="To Class (Auto-mapped)" hint="Auto-maps to next class. Override if needed.">
                                <select
                                    value={toClassId}
                                    onChange={(e) => handleToClassChange(e.target.value)}
                                    disabled={!fromClassId}
                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                >
                                    <option value="">— will auto-fill —</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                    <option value="GRADUATE">Graduate (Alumni)</option>
                                </select>
                            </Field>

                            <Field label="Default Target Section" hint="Applied to all — override per student.">
                                <select
                                    value={defaultTargetSectionId}
                                    onChange={(e) => setDefaultTargetSectionId(e.target.value ? Number(e.target.value) : '')}
                                    disabled={isGraduatingClass || !toClassId}
                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                >
                                    <option value="">Select section</option>
                                    {toSections.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Default Outcome">
                                <select
                                    value={defaultOutcomeMode}
                                    onChange={(e) => setDefaultOutcomeMode(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="PASS">Pass — promote all</option>
                                    <option value="MANUAL">Manual — set per student</option>
                                </select>
                            </Field>
                        </div>

                        <div className="flex justify-end mt-6 pt-5 border-t border-gray-100">
                            <button
                                onClick={handleLoadStudents}
                                disabled={!fromClassId || !toClassId || !toAcademicYearId || loadingStudents}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingStudents ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Load Students <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ STEP 2 — REVIEW & ASSIGN ════════ */}
            {step === 2 && (
                <div className="w-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 leading-tight">
                            Review Students — {fromClass?.name}
                            {fromSectionId ? ` ${fromSections.find((s) => s.id === fromSectionId)?.name || ''}` : ''}
                            {' '}<ChevronRight className="w-3.5 h-3.5 inline text-gray-300" />{' '}
                            {isGraduatingClass ? 'Alumni' : toClass?.name}
                        </h2>
                        <span className="inline-flex shrink-0 items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <ClipboardList className="w-3.5 h-3.5" /> {rows.length} students
                        </span>
                    </div>

                    <div className="px-4 sm:px-6 py-5 w-full">
                        {actionError && (
                            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3 mb-4 w-full">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="break-words">{actionError}</span>
                            </div>
                        )}

                        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg px-3.5 py-3 mb-4 w-full">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="flex-1 break-words leading-relaxed">
                                Set the <strong>outcome</strong> for each student. Students marked <strong>Graduate</strong> will be
                                moved to Alumni status. <strong>Held Back</strong> students stay in the same class.
                            </span>
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-sm text-gray-700 w-full">
                                <span className="whitespace-nowrap"><strong className="text-blue-700">{selectedIds.size}</strong> selected — Bulk set:</span>
                                <div className="flex flex-wrap gap-2 flex-1">
                                    {Object.entries(OUTCOME_META).map(([key, meta]) => {
                                        const Icon = meta.icon;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => bulkSetOutcome(key)}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${meta.chip} hover:opacity-80 transition-opacity`}
                                            >
                                                <Icon className="w-3.5 h-3.5" /> {meta.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="w-full sm:w-auto text-center text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 bg-white sm:bg-transparent sm:border-transparent mt-1 sm:mt-0"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer mr-2">
                                    <input type="checkbox" checked={allFilteredSelected} onChange={(e) => toggleSelectAll(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                    Select All
                                </label>
                                <CountPill label={`${counts.PASS} Pass`} cls="bg-green-100 text-green-700" />
                                <CountPill label={`${counts.FAIL} Fail`} cls="bg-red-100 text-red-700" />
                                <CountPill label={`${counts.HELD_BACK} Held`} cls="bg-amber-100 text-amber-700" />
                                <CountPill label={`${counts.GRADUATED} Grad`} cls="bg-purple-100 text-purple-700" />
                            </div>

                            <div className="relative w-full xl:w-64 shrink-0">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search student…"
                                    className="h-9 w-full rounded-md border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="w-full text-xs min-w-[950px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wide">
                                        <th className="px-3 py-3 text-left w-10">
                                            <input type="checkbox" checked={allFilteredSelected} onChange={(e) => toggleSelectAll(e.target.checked)} className="accent-blue-600" />
                                        </th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap w-12">#</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap min-w-[160px]">Student</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap">Roll No.</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap">Current Class</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap">Outcome</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap min-w-[140px]">Target Section</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap min-w-[140px]">Remarks</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap">History</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((row, i) => (
                                        <tr key={row.studentId} className="border-t border-gray-100 hover:bg-gray-50/60">
                                            <td className="px-3 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(row.studentId)}
                                                    onChange={(e) => toggleSelectRow(row.studentId, e.target.checked)}
                                                    className="accent-blue-600 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-gray-400 font-medium">{i + 1}</td>
                                            <td className="px-3 py-3 min-w-[160px]">
                                                <div className="font-semibold text-gray-900 truncate">{row.studentName}</div>
                                                <div className="text-gray-400 text-[11px] truncate">Roll {row.rollNumber}</div>
                                            </td>
                                            <td className="px-3 py-3 text-gray-600 font-medium">{row.rollNumber}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                                    {row.currentClassName}{row.currentSectionName ? ` ${row.currentSectionName}` : ''}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                                    {Object.entries(OUTCOME_META).map(([key, meta], idx) => {
                                                        const Icon = meta.icon;
                                                        const active = row.outcome === key;
                                                        return (
                                                            <button
                                                                key={key}
                                                                onClick={() => setRowOutcome(row.studentId, key)}
                                                                className={`flex items-center gap-1 px-2.5 py-1.5 font-semibold transition-colors
                                  ${idx !== 0 ? 'border-l border-gray-200' : ''}
                                  ${active ? meta.chip : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" /> {meta.short}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.outcome === 'PASS' || row.outcome === 'HELD_BACK' ? (
                                                    <select
                                                        value={row.toSectionId || ''}
                                                        onChange={(e) => setRowSection(row.studentId, e.target.value ? Number(e.target.value) : '')}
                                                        className="h-8 w-full min-w-[120px] rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select section</option>
                                                        {(row.outcome === 'HELD_BACK' ? fromSections : toSections).map((s) => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-gray-400 text-[11px] whitespace-nowrap">
                                                        {row.outcome === 'GRADUATED' ? '→ Alumni' : 'Stays in current class'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="text"
                                                    value={row.remarks}
                                                    onChange={(e) => setRowRemarks(row.studentId, e.target.value)}
                                                    placeholder="Optional…"
                                                    className="h-8 w-full min-w-[120px] rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => setHistoryStudent(row)}
                                                    title="View promotion history"
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredRows.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-3 py-10 text-center text-gray-400 text-sm">
                                                {rows.length === 0 ? 'No eligible students found for this class.' : 'No students match your search.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 mt-6 pt-5 border-t border-gray-100">
                            <button
                                onClick={() => setStep(1)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={handlePreview}
                                disabled={rows.length === 0 || previewLoading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Preview &amp; Confirm <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ STEP 3 — CONFIRM & EXECUTE ════════ */}
            {step === 3 && previewData && (
                <div className="w-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900">Confirm Promotion</h2>
                        <span className="inline-flex shrink-0 items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" /> Step 3 of 3 — irreversible
                        </span>
                    </div>

                    <div className="px-4 sm:px-6 py-5 w-full">
                        {actionError && (
                            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3 mb-5 w-full">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="break-words">{actionError}</span>
                            </div>
                        )}

                        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-lg px-3.5 py-3 mb-5 w-full">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="flex-1 break-words leading-relaxed">
                                <strong>This action cannot be undone.</strong> Once executed, all student records will be updated to
                                the target class and section. A full audit log will be saved to the promotion history table.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 w-full">
                            <SummaryCard value={tabCounts.PASS} label={`Promoted to ${toClass?.name || 'next class'}`} cls="bg-green-50 text-green-700" />
                            <SummaryCard value={tabCounts.FAIL} label={`Failed — stay in ${fromClass?.name || 'class'}`} cls="bg-red-50 text-red-700" />
                            <SummaryCard value={tabCounts.HELD_BACK} label="Held Back — same class" cls="bg-amber-50 text-amber-700" />
                            <SummaryCard value={tabCounts.GRADUATED} label="Graduated → Alumni" cls="bg-purple-50 text-purple-700" />
                        </div>

                        <div className="flex border-b-2 border-gray-100 mb-4 overflow-x-auto w-full hide-scrollbar">
                            {Object.entries(OUTCOME_META).map(([key, meta]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-0.5 transition-colors
                    ${activeTab === key ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    {meta.label} ({tabCounts[key]})
                                </button>
                            ))}
                        </div>

                        <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="w-full text-xs min-w-[750px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wide">
                                        <th className="px-3 py-3 text-left whitespace-nowrap w-12">#</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap min-w-[160px]">Student</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap">Roll No.</th>
                                        <th className="px-3 py-3 text-left whitespace-nowrap">From</th>
                                        {activeTab !== 'HELD_BACK' && <th className="px-3 py-3 text-left whitespace-nowrap">To</th>}
                                        {(activeTab === 'PASS' || activeTab === 'HELD_BACK') && <th className="px-3 py-3 text-left whitespace-nowrap">Section</th>}
                                        {(activeTab === 'FAIL' || activeTab === 'HELD_BACK') && <th className="px-3 py-3 text-left whitespace-nowrap">Remarks</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRowsForTab.map((r, i) => (
                                        <tr key={r.studentId} className="border-t border-gray-100 hover:bg-gray-50/60">
                                            <td className="px-3 py-3 text-gray-400 font-medium">{i + 1}</td>
                                            <td className="px-3 py-3 font-semibold text-gray-900 min-w-[160px]">
                                                {r.studentName}
                                                {r.sectionAtCapacity && (
                                                    <span className="ml-2 mt-1 sm:mt-0 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                                        <AlertTriangle className="w-3 h-3" /> At capacity
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-gray-600 font-medium">{r.rollNumber}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                                    {r.fromClassName} {r.fromSectionName}
                                                </span>
                                            </td>
                                            {activeTab !== 'HELD_BACK' && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${OUTCOME_META[r.outcome]?.badge}`}>
                                                        {activeTab === 'GRADUATED' ? 'Alumni' : r.toClassName}
                                                    </span>
                                                </td>
                                            )}
                                            {(activeTab === 'PASS' || activeTab === 'HELD_BACK') && (
                                                <td className="px-3 py-3 text-gray-600 font-medium whitespace-nowrap">{r.toSectionName || '—'}</td>
                                            )}
                                            {(activeTab === 'FAIL' || activeTab === 'HELD_BACK') && (
                                                <td className="px-3 py-3 text-gray-500 min-w-[120px]">{r.remarks || '—'}</td>
                                            )}
                                        </tr>
                                    ))}
                                    {previewRowsForTab.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-10 text-center text-gray-400 text-sm">No students in this category.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 mt-5 text-xs text-gray-600 w-full">
                            <strong className="text-gray-700">Audit record — </strong>
                            Each promotion is stored with the student, from/to class &amp; section, outcome, academic year,
                            promoted-by user, and timestamp, plus any remarks.
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 mt-6 pt-5 border-t border-gray-100">
                            <button
                                onClick={() => setStep(2)}
                                disabled={executeLoading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Review
                            </button>
                            <button
                                onClick={handleExecute}
                                disabled={executeLoading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {executeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                                Execute Promotion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {historyStudent && (
                <PromotionHistoryModal student={historyStudent} onClose={() => setHistoryStudent(null)} />
            )}
        </div>
    );
};

// ─── Small presentational helpers ───────────────────────────────────────────
const Field = ({ label, hint, children }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        {children}
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
);

const CountPill = ({ label, cls }) => (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>{label}</span>
);

const SummaryCard = ({ value, label, cls }) => (
    <div className={`rounded-lg px-4 py-3.5 w-full ${cls}`}>
        <div className="text-2xl font-extrabold">{value ?? 0}</div>
        <div className="text-[11px] font-semibold mt-0.5 truncate">{label}</div>
    </div>
);

export default StudentPromotion;
import { useState, useMemo } from "react";
import {
  X, ClipboardList, Loader2, Check, ChevronRight, ChevronLeft,
  AlertCircle, Rocket,
} from "lucide-react";
import { createExamEvent } from "../../Api/Academics/Exams";
import { getSectionSubjectsByClass, getSectionsByClass } from "../../Api/Teachers/TeachersAPI";
import { EXAM_CONSTS } from "../../Constants/StringConstants/AcademicsConstants";
// Builds [{ sectionId, sectionName, subjects:[{sectionSubjectId, subjectId, subjectName, subjectCode}] }]
async function getClassSectionsWithSubjects(classId) {
  const [mappings, sections] = await Promise.all([
    getSectionSubjectsByClass(classId),
    getSectionsByClass(classId),
  ]);

  const sectionNameMap = new Map(
    (sections || []).map(s => [s.id, s.name ?? s.sectionName])
  );

  const bySection = new Map();
  (mappings || []).forEach(m => {
    const sectionId = m.sectionId;
    if (sectionId == null) return;
    if (!bySection.has(sectionId)) {
      bySection.set(sectionId, {
        sectionId,
        sectionName: m.sectionName ?? sectionNameMap.get(sectionId) ?? `Section ${sectionId}`,
        subjects: [],
      });
    }
    bySection.get(sectionId).subjects.push({
      sectionSubjectId: m.id,
      subjectId: m.subjectId,
      subjectName: m.subjectName,
      subjectCode: m.subjectCode ?? null,
    });
  });

  const ordered = (sections || []).map(s => bySection.get(s.id)).filter(Boolean);
  bySection.forEach((val, key) => {
    if (!ordered.some(o => o.sectionId === key)) ordered.push(val);
  });

  return ordered;
}

const STEPS = [
  { id: 1, label: "Event Details" },
  { id: 2, label: "Select Classes" },
  { id: 3, label: "Configure Subjects" },
  { id: 4, label: "Review & Create" },
];

// ─── Stepper ────────────────────────────────────────────────────────────────
function Stepper({ current }) {
  return (
    <div className="flex items-center px-4 sm:px-6 py-4 border-b border-gray-100 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done   = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${done ? "bg-green-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap
                ${active ? "text-indigo-600" : done ? "text-gray-700" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-14 mx-2 ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

// ══════════════════════════════════════════════════════════════════
// MAIN WIZARD
// ══════════════════════════════════════════════════════════════════
export default function CreateExamEventWizard({
  examTypes, academicYears, classes,
  currentAcademicYearId, onClose, onSuccess,
}) {
  const [step, setStep] = useState(1);

  // Step 1 — Event Details
  const [form, setForm] = useState({
    examTypeId:      examTypes[0]?.id ?? "",
    academicYearId:  currentAcademicYearId ?? academicYears[0]?.id ?? "",
    name:            "",
    startDate:       "",
    endDate:         "",
    description:     "",
  });

  // Step 2 — Select Classes
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [defaultMarks, setDefaultMarks] = useState({
    maximumMarks:          100,
    passingMarks:          33,
    hasTheoryPractical:    false,
  });

  // Step 3 — Configure Subjects
  const [classSectionsData, setClassSectionsData] = useState({});
  const [rows, setRows]                           = useState([]);
  const [loadingSubjects, setLoadingSubjects]     = useState(false);
  const [activeSectionTab, setActiveSectionTab]   = useState({});
  const [quickApply, setQuickApply]               = useState({ maximumMarks: 100, passingMarks: 33 });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  const classMap = useMemo(
    () => new Map(classes.map(c => [Number(c.id), c])),
    [classes]
  );

  // ── Step 1 validation ────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.examTypeId)     return "Please select an exam type.";
    if (!form.academicYearId) return "Please select an academic year.";
    if (!form.startDate)      return "Start date is required.";
    if (!form.endDate)        return "End date is required.";
    if (form.startDate > form.endDate) return "Start date cannot be after end date.";
    return null;
  };

  // ── Step 2 → 3: fetch sections + subjects per selected class ──
  const goToSubjects = async () => {
    if (selectedClassIds.length === 0) {
      setError("Please select at least one class.");
      return;
    }
    setError(null);
    setLoadingSubjects(true);
    try {
      const entries = await Promise.all(
        selectedClassIds.map(async classId => {
          const sections = await getClassSectionsWithSubjects(classId);
          const subjectSets = sections.map(s => new Set(s.subjects.map(sub => sub.subjectId)));
          const sameAcrossSections =
            subjectSets.length <= 1 ||
            subjectSets.every(
              set => set.size === subjectSets[0].size && [...set].every(id => subjectSets[0].has(id))
            );
          return [classId, { sections, sameAcrossSections }];
        })
      );

      const dataMap = Object.fromEntries(entries);
      setClassSectionsData(dataMap);

      const draftRows = [];
      entries.forEach(([classId, { sections }]) => {
        sections.forEach(sec => {
          sec.subjects.forEach(sub => {
            draftRows.push({
              key:              sub.sectionSubjectId,
              classId,
              sectionId:        sec.sectionId,
              sectionName:      sec.sectionName,
              subjectId:        sub.subjectId,
              subjectName:      sub.subjectName,
              subjectCode:      sub.subjectCode,
              included:         true,
              maximumMarks:             defaultMarks.maximumMarks,
              passingMarks:     defaultMarks.passingMarks,
              hasTheoryPractical: defaultMarks.hasTheoryPractical,
              maximumTheoryMarks:    defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.maximumMarks * 0.7) : 0,
              maximumPracticalMarks: defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.maximumMarks * 0.3) : 0,
              passingTheoryMarks:    defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.passingMarks  * 0.7) : 0,
              passingPracticalMarks: defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.passingMarks  * 0.3) : 0,
            });
          });
        });
      });
      setRows(draftRows);
      setQuickApply({ maximumMarks: defaultMarks.maximumMarks, passingMarks: defaultMarks.passingMarks });

      const tabs = {};
      entries.forEach(([classId, { sections }]) => {
        if (sections[0]) tabs[classId] = sections[0].sectionId;
      });
      setActiveSectionTab(tabs);

      setStep(3);
    } catch (err) {
      setError(err?.message || "Failed to load subjects for selected classes.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ── Row helpers ──────────────────────────────────────────────
  const updateRow = (key, patch) =>
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));

  // Compact (same-across-sections) mode: propagate changes to all rows sharing subjectId in that class
  const updateCompactRow = (classId, subjectId, patch) =>
    setRows(prev => prev.map(r => (r.classId === classId && r.subjectId === subjectId ? { ...r, ...patch } : r)));

  const toggleClassAll = (classId, include) =>
    setRows(prev => prev.map(r => (r.classId === classId ? { ...r, included: include } : r)));

  const applyQuickToAll = () =>
    setRows(prev =>
      prev.map(r => ({
        ...r,
        maximumMarks: Number(quickApply.maximumMarks),
        passingMarks: Number(quickApply.passingMarks),
      }))
    );

  // ── Derived summary for Step 4 ───────────────────────────────
  const includedRows  = rows.filter(r => r.included);
  const summaryByClass = selectedClassIds.map(classId => {
    const classRows  = rows.filter(r => r.classId === classId);
    const included   = classRows.filter(r => r.included);
    const sectionIds = new Set(classRows.map(r => r.sectionId));
    const includedSubjectCount = new Set(included.map(r => r.subjectId)).size;
    const excludedNames = [...new Set(classRows.filter(r => !r.included).map(r => r.subjectName))];
    return {
      classId,
      className:        classMap.get(Number(classId))?.name ?? `Class ${classId}`,
      sectionCount:     sectionIds.size,
      totalSubjects:    new Set(classRows.map(r => r.subjectId)).size,
      includedSubjects: includedSubjectCount,
      excludedNames,
      ready:            included.length > 0,
    };
  });

  // ── Build API payload ────────────────────────────────────────
  const buildPayload = () => ({
    examTypeId:      Number(form.examTypeId),
    academicYearId:  Number(form.academicYearId),
    name:            form.name.trim() || undefined,
    startDate:       form.startDate,
    endDate:         form.endDate,
    description:     form.description.trim() || undefined,
    classIds:        selectedClassIds.map(Number),
    subjectConfigs:  includedRows.map(r => ({
      sectionSubjectId:   r.key,
      maxMarks:           Number(r.maximumMarks),
      passingMarks:       Number(r.passingMarks),
      hasTheoryPractical: !!r.hasTheoryPractical,
      ...(r.hasTheoryPractical ? {
        maxTheoryMarks:       Number(r.maximumTheoryMarks),
        maxPracticalMarks:    Number(r.maximumPracticalMarks),
        passingTheoryMarks:   Number(r.passingTheoryMarks),
        passingPracticalMarks: Number(r.passingPracticalMarks),
      } : {}),
    })),
  });

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createExamEvent(buildPayload());
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Failed to create exam event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Next button handler ──────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      const validationError = validateStep1();
      if (validationError) { setError(validationError); return; }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      goToSubjects();
    } else if (step === 3) {
      const activeRows = rows.filter(r => r.included);
      if (activeRows.length === 0) { setError("Please include at least one subject."); return; }
      setError(null);
      setStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Create Exam Event — {STEPS.find(s => s.id === step)?.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Stepper current={step} />

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex-shrink-0 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Step body */}
        <div className="px-4 sm:px-6 py-4 space-y-5 overflow-y-auto flex-1">
          {step === 1 && (
            <Step1EventDetails
              form={form}
              setForm={setForm}
              examTypes={examTypes}
              academicYears={academicYears}
              currentAcademicYearId={currentAcademicYearId}
            />
          )}
          {step === 2 && (
            <Step2SelectClasses
              classes={classes}
              selectedClassIds={selectedClassIds}
              setSelectedClassIds={setSelectedClassIds}
              defaultMarks={defaultMarks}
              setDefaultMarks={setDefaultMarks}
            />
          )}
          {step === 3 && (
            loadingSubjects ? (
              <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Loading sections and subjects…</p>
              </div>
            ) : (
              <Step3ConfigureSubjects
                selectedClassIds={selectedClassIds}
                classMap={classMap}
                classSectionsData={classSectionsData}
                rows={rows}
                updateRow={updateRow}
                updateCompactRow={updateCompactRow}
                toggleClassAll={toggleClassAll}
                activeSectionTab={activeSectionTab}
                setActiveSectionTab={setActiveSectionTab}
                quickApply={quickApply}
                setQuickApply={setQuickApply}
                applyQuickToAll={applyQuickToAll}
              />
            )
          )}
          {step === 4 && (
            <Step4ReviewAndCreate
              summaryByClass={summaryByClass}
              includedRowsCount={includedRows.length}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(s => s - 1))}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {step > 1 && <ChevronLeft className="w-4 h-4" />}
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={loadingSubjects}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm disabled:opacity-60"
            >
              {loadingSubjects && <Loader2 className="w-4 h-4 animate-spin" />}
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {submitting ? "Creating Exam Event…" : "Create Exam Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 1 — Event Details
// ══════════════════════════════════════════════════════════════════
function Step1EventDetails({ form, setForm, examTypes, academicYears, currentAcademicYearId }) {
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const autoGeneratedName = useMemo(() => {
    const typeName = examTypes.find(t => String(t.id) === String(form.examTypeId))?.name ?? "";
    const yearLabel =
      academicYears.find(y => String(y.id) === String(form.academicYearId))?.label ??
      academicYears.find(y => String(y.id) === String(form.academicYearId))?.name ??
      "";
    return typeName && yearLabel ? `Auto: ${typeName} ${yearLabel}` : "Auto-generated from exam type and year";
  }, [form.examTypeId, form.academicYearId, examTypes, academicYears]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exam Type <span className="text-red-500">*</span>
        </label>
        <select name="examTypeId" value={form.examTypeId} onChange={handleChange} className={inputCls}>
          <option value="" disabled>Select exam type</option>
          {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Academic Year <span className="text-red-500">*</span>
        </label>
        <select name="academicYearId" value={form.academicYearId} onChange={handleChange} className={inputCls}>
          <option value="" disabled>Select academic year</option>
          {academicYears.map(y => {
            const isCurrent = y.id === currentAcademicYearId || y.isCurrent;
            return (
              <option key={y.id} value={y.id}>
                {isCurrent ? "● " : ""}{y.label ?? y.name}{isCurrent ? " (Current)" : ""}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Name{" "}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={autoGeneratedName}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          min={form.startDate}
          onChange={handleChange}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional notes or remarks…"
          className={inputCls}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 2 — Select Classes
// ══════════════════════════════════════════════════════════════════
function Step2SelectClasses({ classes, selectedClassIds, setSelectedClassIds, defaultMarks, setDefaultMarks }) {
  const toggleClass  = id => {
    const numId = Number(id);
    setSelectedClassIds(prev =>
      prev.includes(numId) ? prev.filter(c => c !== numId) : [...prev, numId]
    );
  };
  const selectAllClasses = () => setSelectedClassIds(classes.map(c => Number(c.id)));
  const clearAllClasses  = () => setSelectedClassIds([]);

  return (
    <div>
      {/* Class picker */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-700">
          Select Classes <span className="text-red-500">*</span>
          <span className="text-xs font-normal text-gray-400 ml-2">
            — a separate exam is created for each class
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={selectAllClasses}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full hover:bg-green-100"
          >
            <Check className="w-3 h-3" /> Select All
          </button>
          <button
            type="button"
            onClick={clearAllClasses}
            className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-5">
        {classes.map(c => {
          const id         = Number(c.id);
          const isSelected = selectedClassIds.includes(id);
          return (
            <label
              key={c.id}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all select-none text-sm font-medium
                ${isSelected
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                  : "border-gray-200 text-gray-700 bg-white hover:border-gray-300"
                }`}
            >
              <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleClass(id)} />
              {c.name}
            </label>
          );
        })}
      </div>

      {/* Default marks */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
          <p className="text-sm font-semibold text-blue-800">Default Marks</p>
          <p className="text-xs text-blue-500">You can adjust these per subject in the next step.</p>
        </div>

        <div className="flex flex-wrap items-end gap-5">
          <div>
            <label className="block text-xs font-medium text-blue-700 mb-1">Maximum Marks</label>
            <input
              type="number"
              value={defaultMarks.maximumMarks}
              onChange={e => setDefaultMarks(d => ({ ...d, maximumMarks: Number(e.target.value) }))}
              className="w-28 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-700 mb-1">Passing Marks</label>
            <input
              type="number"
              value={defaultMarks.passingMarks}
              onChange={e => setDefaultMarks(d => ({ ...d, passingMarks: Number(e.target.value) }))}
              className="w-28 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-blue-700 cursor-pointer pb-1.5">
            <input
              type="checkbox"
              checked={defaultMarks.hasTheoryPractical}
              onChange={e => setDefaultMarks(d => ({ ...d, hasTheoryPractical: e.target.checked }))}
              className="w-4 h-4 accent-indigo-600"
            />
            Theory + Practical split
          </label>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {selectedClassIds.length} of {classes.length} selected
        {selectedClassIds.length === classes.length && classes.length > 0 ? " (all classes)" : ""}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 3 — Configure Subjects
// ══════════════════════════════════════════════════════════════════
function Step3ConfigureSubjects({
  selectedClassIds, classMap, classSectionsData, rows,
  updateRow, updateCompactRow, toggleClassAll,
  activeSectionTab, setActiveSectionTab,
  quickApply, setQuickApply, applyQuickToAll,
}) {
  const totalConfigs = rows.length;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Subjects are loaded per section. Uncheck any subject to exclude it from the exam.
      </p>

      {/* Quick apply bar */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
        <span className="text-sm font-semibold text-gray-700">Apply to All Subjects:</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Maximum Marks</label>
          <input
            type="number"
            value={quickApply.maximumMarks}
            onChange={e => setQuickApply(q => ({ ...q, maximumMarks: e.target.value }))}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Passing Marks</label>
          <input
            type="number"
            value={quickApply.passingMarks}
            onChange={e => setQuickApply(q => ({ ...q, passingMarks: e.target.value }))}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
          />
        </div>
        <button
          onClick={applyQuickToAll}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Apply <ChevronRight className="w-3 h-3" />
        </button>
        <span className="ml-auto text-xs text-gray-400">
          {totalConfigs} subject configs across {selectedClassIds.length} class{selectedClassIds.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Per-class blocks */}
      <div className="space-y-5">
        {selectedClassIds.map(classId => (
          <ClassSubjectBlock
            key={classId}
            classId={classId}
            className={classMap.get(Number(classId))?.name ?? `Class ${classId}`}
            data={classSectionsData[classId]}
            rows={rows.filter(r => r.classId === classId)}
            updateRow={updateRow}
            updateCompactRow={updateCompactRow}
            toggleClassAll={toggleClassAll}
            activeSectionId={activeSectionTab[classId]}
            setActiveSectionId={sid => setActiveSectionTab(prev => ({ ...prev, [classId]: sid }))}
          />
        ))}
      </div>
    </div>
  );
}

// ── ClassSubjectBlock ────────────────────────────────────────────
function ClassSubjectBlock({
  classId, className, data, rows,
  updateRow, updateCompactRow, toggleClassAll,
  activeSectionId, setActiveSectionId,
}) {
  if (!data) return null;
  const { sections, sameAcrossSections } = data;
  const includedCount  = rows.filter(r => r.included).length;

  if (sections.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700">{className}</p>
        <p className="text-xs text-gray-400 mt-1">No sections or subjects found for this class.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Block header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{className}</span>
          {sameAcrossSections ? (
            <span className="text-xs text-gray-400">
              {sections.length} section{sections.length !== 1 ? "s" : ""} · {includedCount} of {rows.length} subjects selected
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
              {sections.length} sections — subjects vary by section
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <button onClick={() => toggleClassAll(classId, true)}  className="text-indigo-600 hover:underline">Include All</button>
          <button onClick={() => toggleClassAll(classId, false)} className="text-red-500 hover:underline">Exclude All</button>
        </div>
      </div>

      {sameAcrossSections ? (
        /* Compact view — one row per unique subject */
        <SubjectTable
          rows={dedupeBySubject(rows)}
          onToggle={(subjectId, included) => updateCompactRow(classId, subjectId, { included })}
          onChange={(subjectId, patch)    => updateCompactRow(classId, subjectId, patch)}
        />
      ) : (
        /* Per-section tab view */
        <div>
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
            {sections.map(sec => (
              <button
                key={sec.sectionId}
                onClick={() => setActiveSectionId(sec.sectionId)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg whitespace-nowrap
                  ${activeSectionId === sec.sectionId
                    ? "bg-white border border-b-0 border-gray-200 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {sec.sectionName}
              </button>
            ))}
          </div>
          <SubjectTable
            rows={rows.filter(r => r.sectionId === activeSectionId)}
            onToggle={(_subjectId, included, key) => updateRow(key, { included })}
            onChange={(_subjectId, patch, key)    => updateRow(key, patch)}
            useRowKey
          />
        </div>
      )}
    </div>
  );
}

// De-duplicate rows so compact view shows one row per unique subject
function dedupeBySubject(rows) {
  const seen = new Map();
  rows.forEach(r => { if (!seen.has(r.subjectId)) seen.set(r.subjectId, r); });
  return [...seen.values()];
}

// ── SubjectTable ─────────────────────────────────────────────────
function SubjectTable({ rows, onToggle, onChange, useRowKey }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No subjects found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-400 uppercase">
            <th className="px-4 py-2 w-8"></th>
            <th className="px-2 py-2">Subject</th>
            <th className="px-2 py-2 w-28">Maximum Marks</th>
            <th className="px-2 py-2 w-28">Passing Marks</th>
            <th className="px-2 py-2 w-44">Assessment Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr
              key={r.key}
              className={`border-t border-gray-50 transition-opacity ${!r.included ? "opacity-40" : ""}`}
            >
              {/* Include / exclude toggle */}
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={r.included}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  onChange={e => onToggle(r.subjectId, e.target.checked, r.key)}
                />
              </td>

              {/* Subject name */}
              <td className="px-2 py-2 font-medium text-gray-700">{r.subjectName}</td>

              {/* Maximum Marks */}
              <td className="px-2 py-2">
                <input
                  type="number"
                  value={r.maximumMarks}
                  disabled={!r.included}
                  onChange={e => onChange(r.subjectId, { maximumMarks: Number(e.target.value) }, r.key)}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </td>

              {/* Passing Marks */}
              <td className="px-2 py-2">
                <input
                  type="number"
                  value={r.passingMarks}
                  disabled={!r.included}
                  onChange={e => onChange(r.subjectId, { passingMarks: Number(e.target.value) }, r.key)}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </td>

              {/* Assessment type — checkbox: Theory + Practical */}
              <td className="px-2 py-2">
                <label className={`flex items-center gap-2 ${!r.included ? "pointer-events-none" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={!!r.hasTheoryPractical}
                    disabled={!r.included}
                    onChange={e => onChange(r.subjectId, { hasTheoryPractical: e.target.checked }, r.key)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className={`text-xs whitespace-nowrap font-medium
                    ${r.hasTheoryPractical ? "text-indigo-700" : "text-gray-400"}`}>
                    {r.hasTheoryPractical ? "Theory + Practical" : "Theory Only"}
                  </span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 4 — Review & Create
// ══════════════════════════════════════════════════════════════════
function Step4ReviewAndCreate({ summaryByClass, includedRowsCount }) {
  const totalSections = summaryByClass.reduce((sum, c) => sum + c.sectionCount, 0);
  const allReady      = summaryByClass.every(c => c.ready);

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 bg-green-50 border border-green-100 rounded-xl p-4 mb-5 text-center">
        <div>
          <p className="text-2xl font-extrabold text-green-700">{summaryByClass.length}</p>
          <p className="text-xs text-green-600">Classes</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-green-700">{totalSections}</p>
          <p className="text-xs text-green-600">Sections Covered</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-green-700">{includedRowsCount}</p>
          <p className="text-xs text-green-600">Subject Configurations</p>
        </div>
      </div>

      {!allReady && (
        <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          One or more classes have no subjects selected. Go back to include at least one subject per class.
        </div>
      )}

      {/* Per-class breakdown */}
      <table className="w-full text-sm mb-5">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">
            <th className="py-2">Class</th>
            <th className="py-2">Sections</th>
            <th className="py-2">Subjects</th>
            <th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {summaryByClass.map(c => (
            <tr key={c.classId} className="border-b border-gray-50">
              <td className="py-2.5 font-medium text-gray-800">{c.className}</td>
              <td className="py-2.5">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {c.sectionCount} {c.sectionCount === 1 ? "section" : "sections"}
                </span>
              </td>
              <td className="py-2.5 text-gray-600">
                {c.includedSubjects} selected
                {c.excludedNames.length > 0 && (
                  <span className="text-gray-400"> ({c.excludedNames.join(", ")} excluded)</span>
                )}
              </td>
              <td className="py-2.5 text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                  ${c.ready ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {c.ready ? <><Check className="w-3 h-3" /> Ready</> : "No subjects selected"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
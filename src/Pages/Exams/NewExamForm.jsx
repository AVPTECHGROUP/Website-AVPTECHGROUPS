import { useState, useEffect, useMemo } from "react";
import {
  X, ClipboardList, Loader2, Check, ChevronRight, ChevronLeft,
  AlertCircle, Sparkles, Rocket
} from "lucide-react";
import { createExamEvent } from "../../Api/Academics/Exams";
import { getSectionSubjectsByClass, getSectionsByClass } from "../../Api/Teachers/TeachersAPI";

// Builds [{ sectionId, sectionName, subjects:[{sectionSubjectId, subjectId, subjectName, subjectCode}] }]
// for one class, straight from your existing TeachersAPI endpoints:
//   - getSectionSubjectsByClass(classId) -> flat mappings; mapping.id IS the sectionSubjectId
//   - getSectionsByClass(classId)        -> section names + correct display order
async function getClassSectionsWithSubjects(classId) {
  const [mappings, sections] = await Promise.all([
    getSectionSubjectsByClass(classId),
    getSectionsByClass(classId),
  ]);

  const sectionNameMap = new Map((sections || []).map(s => [s.id, s.name ?? s.sectionName]));

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
      sectionSubjectId: m.id, // id field IS the sectionSubjectId
      subjectId: m.subjectId,
      subjectName: m.subjectName,
      subjectCode: m.subjectCode ?? null,
    });
  });

  // Preserve section order as returned by getSectionsByClass (9-A, 9-B, 9-C…)
  const ordered = (sections || []).map(s => bySection.get(s.id)).filter(Boolean);
  bySection.forEach((val, key) => {
    if (!ordered.some(o => o.sectionId === key)) ordered.push(val);
  });

  return ordered;
}

const STEPS = [
  { id: 1, label: "Event Info" },
  { id: 2, label: "Classes" },
  { id: 3, label: "Subjects" },
  { id: 4, label: "Confirm" },
];

// ─── Stepper ────────────────────────────────────────────────────────────────
function Stepper({ current }) {
  return (
    <div className="flex items-center px-4 sm:px-6 py-4 border-b border-gray-100 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? "bg-green-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-indigo-600" : done ? "text-gray-700" : "text-gray-400"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 sm:w-14 mx-2 ${done ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

// ══════════════════════════════════════════════════════════════════
// MAIN WIZARD
// ══════════════════════════════════════════════════════════════════
export default function CreateExamEventWizard({ examTypes, academicYears, classes, currentAcademicYearId, onClose, onSuccess }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [form, setForm] = useState({
    examTypeId: examTypes[0]?.id ?? "",
    academicYearId: currentAcademicYearId ?? academicYears[0]?.id ?? "",
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // Step 2
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [defaultMarks, setDefaultMarks] = useState({ maxMarks: 100, passingMarks: 33, hasTheoryPractical: false });

  // Step 3
  const [classSectionsData, setClassSectionsData] = useState({}); // classId -> { sections, sameAcrossSections }
  const [rows, setRows] = useState([]); // flat list of subject-config draft rows
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState({}); // classId -> sectionId
  const [quickApply, setQuickApply] = useState({ maxMarks: 100, passingMarks: 33 });

  // submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const classMap = useMemo(() => new Map(classes.map(c => [Number(c.id), c])), [classes]);

  // ── Step 1 validation ────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.examTypeId) return "Please select an exam type.";
    if (!form.academicYearId) return "Please select an academic year.";
    if (!form.startDate) return "Start date is required.";
    if (!form.endDate) return "End date is required.";
    if (form.startDate > form.endDate) return "Start date cannot be after end date.";
    return null;
  };

  // ── Step 2 -> 3: fetch sections+subjects per selected class ───
  const goToSubjects = async () => {
    if (selectedClassIds.length === 0) { setError("Please select at least one class."); return; }
    setError(null);
    setLoadingSubjects(true);
    try {
      const entries = await Promise.all(
        selectedClassIds.map(async (classId) => {
          const sections = await getClassSectionsWithSubjects(classId);
          const subjectSets = sections.map(s => new Set(s.subjects.map(sub => sub.subjectId)));
          const sameAcrossSections = subjectSets.length <= 1 || subjectSets.every(set =>
            set.size === subjectSets[0].size && [...set].every(id => subjectSets[0].has(id))
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
              key: sub.sectionSubjectId,
              classId,
              sectionId: sec.sectionId,
              sectionName: sec.sectionName,
              subjectId: sub.subjectId,
              subjectName: sub.subjectName,
              subjectCode: sub.subjectCode,
              included: true,
              maxMarks: defaultMarks.maxMarks,
              passingMarks: defaultMarks.passingMarks,
              hasTheoryPractical: defaultMarks.hasTheoryPractical,
              maxTheoryMarks: defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.maxMarks * 0.7) : 0,
              maxPracticalMarks: defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.maxMarks * 0.3) : 0,
              passingTheoryMarks: defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.passingMarks * 0.7) : 0,
              passingPracticalMarks: defaultMarks.hasTheoryPractical ? Math.round(defaultMarks.passingMarks * 0.3) : 0,
            });
          });
        });
      });
      setRows(draftRows);
      setQuickApply({ maxMarks: defaultMarks.maxMarks, passingMarks: defaultMarks.passingMarks });

      const tabs = {};
      entries.forEach(([classId, { sections }]) => { if (sections[0]) tabs[classId] = sections[0].sectionId; });
      setActiveSectionTab(tabs);

      setStep(3);
    } catch (err) {
      setError(err?.message || "Failed to load class subjects.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ── row helpers ─────────────────────────────────────────────
  const updateRow = (key, patch) => setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));

  // Editing one row in a "same subjects across sections" class propagates
  // numeric/type changes to every row sharing that subjectId in that class.
  const updateCompactRow = (classId, subjectId, patch) => {
    setRows(prev => prev.map(r => (r.classId === classId && r.subjectId === subjectId ? { ...r, ...patch } : r)));
  };

  const toggleClassAll = (classId, include) => {
    setRows(prev => prev.map(r => (r.classId === classId ? { ...r, included: include } : r)));
  };

  const applyQuickToAll = () => {
    setRows(prev => prev.map(r => ({ ...r, maxMarks: Number(quickApply.maxMarks), passingMarks: Number(quickApply.passingMarks) })));
  };

  // ── derived summary ─────────────────────────────────────────
  const includedRows = rows.filter(r => r.included);
  const summaryByClass = selectedClassIds.map(classId => {
    const classRows = rows.filter(r => r.classId === classId);
    const included = classRows.filter(r => r.included);
    const sectionIds = new Set(classRows.map(r => r.sectionId));
    const totalSubjectsInClass = new Set(classRows.map(r => r.subjectId)).size;
    const includedSubjectNames = new Set(included.map(r => r.subjectId)).size;
    const excludedNames = [...new Set(classRows.filter(r => !r.included).map(r => r.subjectName))];
    return {
      classId,
      className: classMap.get(Number(classId))?.name ?? `Class ${classId}`,
      sectionCount: sectionIds.size,
      totalSubjects: totalSubjectsInClass,
      includedSubjects: includedSubjectNames,
      excludedNames,
      ready: included.length > 0,
    };
  });

  // ── submit ───────────────────────────────────────────────────
  const buildPayload = () => ({
    examTypeId: Number(form.examTypeId),
    academicYearId: Number(form.academicYearId),
    name: form.name.trim() || undefined,
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description.trim() || undefined,
    classIds: selectedClassIds.map(Number),
    subjectConfigs: includedRows.map(r => ({
      sectionSubjectId: r.key,
      maxMarks: Number(r.maxMarks),
      passingMarks: Number(r.passingMarks),
      hasTheoryPractical: !!r.hasTheoryPractical,
      ...(r.hasTheoryPractical ? {
        maxTheoryMarks: Number(r.maxTheoryMarks),
        maxPracticalMarks: Number(r.maxPracticalMarks),
        passingTheoryMarks: Number(r.passingTheoryMarks),
        passingPracticalMarks: Number(r.passingPracticalMarks),
      } : {}),
    })),
  });

  const handleCreate = async () => {
    setSubmitting(true); setError(null);
    try {
      await createExamEvent(buildPayload());
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Failed to create exam event.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Create Exam Event — Step {step}: {STEPS.find(s => s.id === step)?.label}</h2>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Stepper current={step} />

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex-shrink-0 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 space-y-5 overflow-y-auto flex-1">
          {step === 1 && (
            <Step1EventInfo form={form} setForm={setForm} examTypes={examTypes} academicYears={academicYears} currentAcademicYearId={currentAcademicYearId} />
          )}
          {step === 2 && (
            <Step2Classes
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
                <p className="text-sm">Loading sections & subjects…</p>
              </div>
            ) : (
              <Step3Subjects
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
            <Step4Confirm
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
            {step > 1 && <ChevronLeft className="w-4 h-4" />} {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1) {
                  const ve = validateStep1();
                  if (ve) { setError(ve); return; }
                  setError(null); setStep(2);
                } else if (step === 2) {
                  goToSubjects();
                } else if (step === 3) {
                  const includedRows = rows.filter(r => r.included);

                  if (includedRows.length === 0) {
                    setError("Please select at least one subject.");
                    return;
                  }

                  setError(null);
                  setStep(4);
                }
              }}
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
              {submitting ? "Creating…" : "Create Exam Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 1 — Event Info
// ══════════════════════════════════════════════════════════════════
function Step1EventInfo({ form, setForm, examTypes, academicYears, currentAcademicYearId }) {
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const autoName = useMemo(() => {
    const t = examTypes.find(t => String(t.id) === String(form.examTypeId))?.name ?? "";
    const y = academicYears.find(y => String(y.id) === String(form.academicYearId))?.label
      ?? academicYears.find(y => String(y.id) === String(form.academicYearId))?.name ?? "";
    return t && y ? `Auto: ${t} ${y}` : "Auto-generated if blank";
  }, [form.examTypeId, form.academicYearId, examTypes, academicYears]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type <span className="text-red-500">*</span></label>
        <select name="examTypeId" value={form.examTypeId} onChange={handleChange} className={inputCls}>
          <option value="" disabled>Select type</option>
          {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
        <select name="academicYearId" value={form.academicYearId} onChange={handleChange} className={inputCls}>
          <option value="" disabled>Select year</option>
          {academicYears.map(y => {
            const isCur = y.id === currentAcademicYearId || y.isCurrent;
            return <option key={y.id} value={y.id}>{isCur ? "● " : ""}{y.label ?? y.name}{isCur ? " (Current)" : ""}</option>;
          })}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name <span className="text-xs font-normal text-gray-400">(optional)</span></label>
        <input name="name" value={form.name} onChange={handleChange} placeholder={autoName} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
        <input type="date" name="endDate" value={form.endDate} min={form.startDate} onChange={handleChange} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input name="description" value={form.description} onChange={handleChange} placeholder="Optional notes…" className={inputCls} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 2 — Select Classes
// ══════════════════════════════════════════════════════════════════
function Step2Classes({ classes, selectedClassIds, setSelectedClassIds, defaultMarks, setDefaultMarks }) {
  const toggle = (id) => {
    const numId = Number(id);
    setSelectedClassIds(prev => prev.includes(numId) ? prev.filter(c => c !== numId) : [...prev, numId]);
  };
  const selectAll = () => setSelectedClassIds(classes.map(c => Number(c.id)));
  const clearAll = () => setSelectedClassIds([]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-700">
          Select Classes <span className="text-red-500">*</span>
          <span className="text-xs font-normal text-gray-400 ml-2">— one exam created per selected class</span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={selectAll} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full hover:bg-green-100">
            <Check className="w-3 h-3" /> Select All
          </button>
          <button type="button" onClick={clearAll} className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50">Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-5">
        {classes.map(c => {
          const id = Number(c.id);
          const isSelected = selectedClassIds.includes(id);
          return (
            <label key={c.id} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all select-none text-sm font-medium ${isSelected ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "border-gray-200 text-gray-700 bg-white hover:border-gray-300"
              }`}>
              <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggle(id)} />
              {c.name}
            </label>
          );
        })}
      </div>

      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-3">Default Marks <span className="text-xs font-normal text-blue-500">— applied to all subjects; override per-subject in next step</span></p>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-blue-700 mb-1">Max Marks</label>
            <input type="number" value={defaultMarks.maxMarks} onChange={e => setDefaultMarks(d => ({ ...d, maxMarks: Number(e.target.value) }))} className="w-24 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-700 mb-1">Pass Marks</label>
            <input type="number" value={defaultMarks.passingMarks} onChange={e => setDefaultMarks(d => ({ ...d, passingMarks: Number(e.target.value) }))} className="w-24 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-blue-700 cursor-pointer mt-4">
            <input type="checkbox" checked={defaultMarks.hasTheoryPractical} onChange={e => setDefaultMarks(d => ({ ...d, hasTheoryPractical: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
            Theory + Practical split
          </label>
        </div>
        <p className="mt-3 text-xs text-blue-500 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> These defaults apply to every subject in every selected class. Fine-tune individual subjects in the next step.</p>
      </div>

      <p className="mt-3 text-xs text-gray-400">{selectedClassIds.length} of {classes.length} selected{selectedClassIds.length === classes.length && classes.length > 0 ? " (all classes)" : ""}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 3 — Review Subjects
// ══════════════════════════════════════════════════════════════════
function Step3Subjects({
  selectedClassIds, classMap, classSectionsData, rows,
  updateRow, updateCompactRow, toggleClassAll,
  activeSectionTab, setActiveSectionTab, quickApply, setQuickApply, applyQuickToAll
}) {
  const totalConfigs = rows.length;

  return (
    <div>
      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 text-sm text-green-800">
        <strong>Subjects auto-loaded per section</strong> — sections with identical subjects are shown compactly; sections with different subjects (e.g. streams) are shown per section. Uncheck any subject to exclude it.
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
        <span className="text-sm font-semibold text-gray-700">Quick apply to all:</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Max</span>
          <input type="number" value={quickApply.maxMarks} onChange={e => setQuickApply(q => ({ ...q, maxMarks: e.target.value }))} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
          <span className="text-xs text-gray-500">Pass</span>
          <input type="number" value={quickApply.passingMarks} onChange={e => setQuickApply(q => ({ ...q, passingMarks: e.target.value }))} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
        </div>
        <button onClick={applyQuickToAll} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
          Apply to all <ChevronRight className="w-3 h-3" />
        </button>
        <span className="ml-auto text-xs text-gray-400">{totalConfigs} section-subject configs across {selectedClassIds.length} classes</span>
      </div>

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
            setActiveSectionId={(sid) => setActiveSectionTab(prev => ({ ...prev, [classId]: sid }))}
          />
        ))}
      </div>
    </div>
  );
}

function ClassSubjectBlock({ classId, className, data, rows, updateRow, updateCompactRow, toggleClassAll, activeSectionId, setActiveSectionId }) {
  if (!data) return null;
  const { sections, sameAcrossSections } = data;
  const includedCount = rows.filter(r => r.included).length;
  const totalSubjects = new Set(rows.map(r => r.subjectId)).size;

  if (sections.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700">{className}</p>
        <p className="text-xs text-gray-400 mt-1">No sections/subjects found for this class.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{className}</span>
          {sameAcrossSections ? (
            <span className="text-xs text-gray-400">{sections.length} section{sections.length !== 1 ? "s" : ""} · same subjects · {includedCount} of {rows.length} selected</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">{sections.length} sections · different subjects</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button onClick={() => toggleClassAll(classId, true)} className="text-indigo-600 hover:underline">All ✓</button>
          <button onClick={() => toggleClassAll(classId, false)} className="text-red-500 hover:underline">None ✗</button>
        </div>
      </div>

      {sameAcrossSections ? (
        <SubjectTable
          rows={dedupeBySubject(rows)}
          onToggle={(subjectId, included) => updateCompactRow(classId, subjectId, { included })}
          onChange={(subjectId, patch) => updateCompactRow(classId, subjectId, patch)}
        />
      ) : (
        <div>
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
            {sections.map(sec => (
              <button key={sec.sectionId} onClick={() => setActiveSectionId(sec.sectionId)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg whitespace-nowrap ${activeSectionId === sec.sectionId ? "bg-white border border-b-0 border-gray-200 text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}>
                {sec.sectionName}
              </button>
            ))}
          </div>
          <SubjectTable
            rows={rows.filter(r => r.sectionId === activeSectionId)}
            onToggle={(_subjectId, included, key) => updateRow(key, { included })}
            onChange={(_subjectId, patch, key) => updateRow(key, patch)}
            useRowKey
          />
        </div>
      )}
    </div>
  );
}

// For compact (same-across-sections) display, show one representative row per subjectId.
function dedupeBySubject(rows) {
  const seen = new Map();
  rows.forEach(r => { if (!seen.has(r.subjectId)) seen.set(r.subjectId, r); });
  return [...seen.values()];
}

function SubjectTable({ rows, onToggle, onChange, useRowKey }) {
  if (rows.length === 0) return <p className="text-sm text-gray-400 text-center py-6">No subjects.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs font-semibold text-gray-400 uppercase">
          <th className="px-4 py-2 w-8"></th>
          <th className="px-2 py-2">Subject</th>
          <th className="px-2 py-2 w-24">Max Marks</th>
          <th className="px-2 py-2 w-24">Pass Marks</th>
          <th className="px-2 py-2 w-28">Type</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.key} className={`border-t border-gray-50 ${!r.included ? "opacity-40" : ""}`}>
            <td className="px-4 py-2">
              <input type="checkbox" checked={r.included} className="w-4 h-4 accent-indigo-600"
                onChange={e => onToggle(r.subjectId, e.target.checked, r.key)} />
            </td>
            <td className="px-2 py-2 font-medium text-gray-700">{r.subjectName}</td>
            <td className="px-2 py-2">
              <input type="number" value={r.maxMarks} disabled={!r.included}
                onChange={e => onChange(r.subjectId, { maxMarks: Number(e.target.value) }, r.key)}
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm disabled:bg-gray-50" />
            </td>
            <td className="px-2 py-2">
              <input type="number" value={r.passingMarks} disabled={!r.included}
                onChange={e => onChange(r.subjectId, { passingMarks: Number(e.target.value) }, r.key)}
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm disabled:bg-gray-50" />
            </td>
            <td className="px-2 py-2">
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button disabled={!r.included} onClick={() => onChange(r.subjectId, { hasTheoryPractical: false }, r.key)}
                  className={`px-2.5 py-1 text-xs font-semibold ${!r.hasTheoryPractical ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}>Full</button>
                <button disabled={!r.included} onClick={() => onChange(r.subjectId, { hasTheoryPractical: true }, r.key)}
                  className={`px-2.5 py-1 text-xs font-semibold ${r.hasTheoryPractical ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}>T+P</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ══════════════════════════════════════════════════════════════════
// STEP 4 — Confirm & Create
// ══════════════════════════════════════════════════════════════════
function Step4Confirm({ summaryByClass, includedRowsCount, payloadPreview }) {
  const sectionsCovered = new Set();
  summaryByClass.forEach(c => { /* sectionCount already per class */ });
  const totalSections = summaryByClass.reduce((sum, c) => sum + c.sectionCount, 0);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-green-50 border border-green-100 rounded-xl p-4 mb-5 text-center">
        <div><p className="text-2xl font-extrabold text-green-700">{summaryByClass.length}</p><p className="text-xs text-green-600">Classes</p></div>
        <div><p className="text-2xl font-extrabold text-green-700">{includedRowsCount}</p><p className="text-xs text-green-600">Subject Configs</p></div>
        <div><p className="text-2xl font-extrabold text-green-700">{totalSections}</p><p className="text-xs text-green-600">Sections Covered</p></div>
        <div><p className="text-2xl font-extrabold text-green-700">0</p><p className="text-xs text-green-600">Manual Steps After</p></div>
      </div>

      <table className="w-full text-sm mb-5">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">
            <th className="py-2">Class</th><th className="py-2">Sections</th><th className="py-2">Subjects</th><th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {summaryByClass.map(c => (
            <tr key={c.classId} className="border-b border-gray-50">
              <td className="py-2.5 font-medium text-gray-800">{c.className}</td>
              <td className="py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{c.sectionCount} sections</span></td>
              <td className="py-2.5 text-gray-600">{c.includedSubjects} subjects selected{c.excludedNames.length ? ` (${c.excludedNames.join(", ")} excluded)` : ""}</td>
              <td className="py-2.5 text-right">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.ready ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {c.ready ? <><Check className="w-3 h-3" /> Ready</> : "No subjects"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
}
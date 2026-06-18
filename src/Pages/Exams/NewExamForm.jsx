import { useState, useEffect } from "react";
import { X, ClipboardList, Loader2, Check } from "lucide-react";
import { createExam, getExamTypes } from "../../Api/Exams";
import { getClasses } from "../../Api/TeachersAPI";
import { getAcademicYears, getCurrentAcademicYear } from "../../Api/AcademicYear";

export default function NewExamForm({ onClose, onSuccess, defaultClassId = null }) {
  const [formData, setFormData] = useState({
    examTypeId: "",
    academicYearId: "",
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [examTypes, setExamTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentYearId, setCurrentYearId] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState(null);

  // ── Fetch dropdown data ──────────────────────────────────────────────────
  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [types, cls, yearsRes, currentRes] = await Promise.all([
          getExamTypes(),
          getClasses(),
          getAcademicYears(),
          getCurrentAcademicYear(),
        ]);

        const unwrap = (res) =>
          Array.isArray(res) ? res :
            Array.isArray(res?.data) ? res.data :
              Array.isArray(res?.years) ? res.years :
                Array.isArray(res?.content) ? res.content : [];

        const typesList = unwrap(types);
        const classesList = unwrap(cls);
        const yearsList = unwrap(yearsRes);

        const currentYear = currentRes?.data ?? currentRes ?? null;
        const curId = currentYear?.id
          ?? yearsList.find(y => y.isCurrent)?.id
          ?? null;

        const sorted = [...yearsList].sort((a, b) => {
          if (a.id === curId) return -1;
          if (b.id === curId) return 1;
          return b.id - a.id;
        });

        setExamTypes(typesList);
        setClasses(classesList);
        setAcademicYears(sorted);
        setCurrentYearId(curId);

        setSelectedClassIds(
          defaultClassId
            ? [Number(defaultClassId)]
            : classesList.map(c => Number(c.id))
        );

        setFormData(prev => ({
          ...prev,
          examTypeId: typesList[0]?.id ?? "",
          academicYearId: curId ?? sorted[0]?.id ?? "",
        }));
      } catch (err) {
        setError("Failed to load form data. Please close and try again.");
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleClass = (id) => {
    const numId = Number(id);
    setSelectedClassIds(prev =>
      prev.includes(numId) ? prev.filter(c => c !== numId) : [...prev, numId]
    );
  };

  const selectAllClasses = () => setSelectedClassIds(classes.map(c => Number(c.id)));
  const deselectAllClasses = () => setSelectedClassIds([]);

  const validate = () => {
    if (!formData.examTypeId) return "Please select an exam type.";
    if (selectedClassIds.length === 0) return "Please select at least one class.";
    if (!formData.academicYearId) return "Please select an academic year.";
    if (!formData.startDate) return "Start date is required.";
    if (!formData.endDate) return "End date is required.";
    if (formData.startDate > formData.endDate) return "Start date cannot be after end date.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const ve = validate();
    if (ve) { setError(ve); return; }

    setSubmitting(true);
    const total = selectedClassIds.length;
    let completed = 0;
    setSubmitProgress({ completed: 0, total });

    const basePayload = {
      examTypeId: Number(formData.examTypeId),
      academicYearId: Number(formData.academicYearId),
      name: formData.name.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description.trim() || undefined,
    };

    try {
      const results = await Promise.allSettled(
        selectedClassIds.map(classId =>
          createExam({ ...basePayload, schoolClassId: classId }).then(res => {
            completed += 1;
            setSubmitProgress({ completed, total });
            return res;
          })
        )
      );

      const classMap = new Map(classes.map(c => [Number(c.id), c]));
      const failures = results
        .map((r, i) => ({ r, classId: selectedClassIds[i] }))
        .filter(x => x.r.status === "rejected");

      if (failures.length === 0) {
        onSuccess?.();
      } else if (failures.length === total) {
        setError("Failed to create exam(s). Please try again.");
      } else {
        const names = failures
          .map(f => classMap.get(f.classId)?.name ?? `Class ${f.classId}`)
          .join(", ");
        setError(`Created ${total - failures.length} of ${total} exam(s). Failed for: ${names}.`);
        onSuccess?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const Skeleton = () => <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />;
  const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  const allSelected = classes.length > 0 && selectedClassIds.length === classes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Schedule New Exam</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex-shrink-0">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="px-4 sm:px-6 py-4 space-y-5 overflow-y-auto flex-1">

          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Type <span className="text-red-500">*</span>
            </label>
            {loadingMeta ? <Skeleton /> : (
              <select name="examTypeId" value={formData.examTypeId} onChange={handleChange} className={selectCls}>
                <option value="" disabled>Select type</option>
                {examTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Select Classes */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-gray-700">
                Select Classes <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-400 ml-2">
                  — creates a separate exam for each selected class
                </span>
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={selectAllClasses}
                  disabled={loadingMeta || submitting}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllClasses}
                  disabled={loadingMeta || submitting}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {loadingMeta ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[52px] bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No classes available.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {classes.map(c => {
                    const id = Number(c.id);
                    const isSelected = selectedClassIds.includes(id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-50/70 ring-1 ring-indigo-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        } ${submitting ? "pointer-events-none opacity-60" : ""}`}
                      >
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded flex-shrink-0 border transition-colors ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => toggleClass(id)}
                        />
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {c.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {selectedClassIds.length} of {classes.length} selected
                  {allSelected ? " (all classes)" : ""}
                </p>
              </>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            {loadingMeta ? <Skeleton /> : (
              <div>
                <select
                  name="academicYearId"
                  value={formData.academicYearId}
                  onChange={handleChange}
                  className={selectCls}
                >
                  <option value="" disabled>Select year</option>
                  {academicYears.map(y => {
                    const isCur = y.id === currentYearId || y.isCurrent;
                    return (
                      <option key={y.id} value={y.id}>
                        {isCur ? "● " : ""}{y.label ?? y.name}{isCur ? " (Current)" : ""}
                      </option>
                    );
                  })}
                </select>

                <div className="mt-1.5 h-6">
                  {formData.academicYearId && Number(formData.academicYearId) === currentYearId && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-green-600">
                        Current Academic Year
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Exam Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Auto-generated if blank"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingMeta}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting
              ? `Creating ${submitProgress.completed}/${submitProgress.total}...`
              : selectedClassIds.length > 1
                ? `Create ${selectedClassIds.length} Exams`
                : "Create Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
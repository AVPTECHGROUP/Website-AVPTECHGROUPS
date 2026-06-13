import { useState, useEffect } from "react";
import { X, ClipboardList, Loader2 } from "lucide-react";
import { createExam, getExamTypes } from "../../Api/Exams";
import { getClasses } from "../../Api/TeachersAPI";
import { getAcademicYears, getCurrentAcademicYear } from "../../Api/AcademicYear";

export default function NewExamForm({ onClose, onSuccess, defaultClassId = null }) {
  const [formData, setFormData] = useState({
    examTypeId:    "",
    schoolClassId: defaultClassId ?? "",
    academicYearId: "",
    name:          "",
    startDate:     "",
    endDate:       "",
    description:   "",
  });

  const [examTypes,     setExamTypes]     = useState([]);
  const [classes,       setClasses]       = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentYearId, setCurrentYearId] = useState(null);
  const [loadingMeta,   setLoadingMeta]   = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState(null);

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

        // Unwrap helper — handles ALL known shapes:
        //   raw array            → [...] 
        //   { data: [...] }      → standard envelope
        //   { years: [...] }     → AcademicYear API shape
        //   { content: [...] }   → paginated
        const unwrap = (res) =>
          Array.isArray(res)            ? res :
          Array.isArray(res?.data)      ? res.data :
          Array.isArray(res?.years)     ? res.years :
          Array.isArray(res?.content)   ? res.content : [];

        const typesList   = unwrap(types);
        const classesList = unwrap(cls);
        const yearsList   = unwrap(yearsRes);

        // Current year — { success, data: { id, isCurrent, label, ... } }
        // OR { id, isCurrent, ... } directly
        const currentYear = currentRes?.data ?? currentRes ?? null;
        const curId = currentYear?.id
          ?? yearsList.find(y => y.isCurrent)?.id
          ?? null;

        // Sort: current first, then by id desc
        const sorted = [...yearsList].sort((a, b) => {
          if (a.id === curId) return -1;
          if (b.id === curId) return 1;
          return b.id - a.id;
        });

        // Debug — remove after confirming dropdowns work
        console.log("[NewExamForm] types:", typesList);
        console.log("[NewExamForm] classes:", classesList);
        console.log("[NewExamForm] years:", yearsList);
        console.log("[NewExamForm] currentYearId:", curId);

        setExamTypes(typesList);
        setClasses(classesList);
        setAcademicYears(sorted);
        setCurrentYearId(curId);

        setFormData(prev => ({
          ...prev,
          examTypeId:     typesList[0]?.id  ?? "",
          schoolClassId:  defaultClassId    ?? classesList[0]?.id ?? "",
          academicYearId: curId             ?? sorted[0]?.id ?? "",
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

  const validate = () => {
    if (!formData.examTypeId)     return "Please select an exam type.";
    if (!formData.schoolClassId)  return "Please select a class.";
    if (!formData.academicYearId) return "Please select an academic year.";
    if (!formData.startDate)      return "Start date is required.";
    if (!formData.endDate)        return "End date is required.";
    if (formData.startDate > formData.endDate) return "Start date cannot be after end date.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const ve = validate();
    if (ve) { setError(ve); return; }

    setSubmitting(true);
    try {
      await createExam({
        examTypeId:    Number(formData.examTypeId),
        schoolClassId: Number(formData.schoolClassId),
        academicYearId: Number(formData.academicYearId),
        name:          formData.name.trim()        || undefined,
        startDate:     formData.startDate,
        endDate:       formData.endDate,
        description:   formData.description.trim() || undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err.message ?? "Failed to create exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const Skeleton  = () => <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />;
  const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
          <div className="mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="px-6 py-4 space-y-4">

          {/* Row 1 — Exam Type + Class */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              {loadingMeta ? <Skeleton /> : (
                <select name="schoolClassId" value={formData.schoolClassId} onChange={handleChange} className={selectCls}>
                  <option value="" disabled>Select class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            {loadingMeta ? <Skeleton /> : (
              <div className="relative">
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

                {/* Current year badge — shown below select, matches mockup green pill */}
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
          <div className="grid grid-cols-2 gap-4">
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
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingMeta}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Creating..." : "Create Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
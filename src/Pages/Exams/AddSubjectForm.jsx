import { useState, useEffect, useMemo } from "react";
import { X, BookOpen, Loader2, CheckCircle2, AlertCircle, ChevronDown, FlaskConical, Hash } from "lucide-react";
import { addExamSubject, updateExamSubject } from "../../Api/Exams";
import { getSectionSubjectsByClass } from "../../Api/TeachersAPI";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .asf-root { font-family: 'DM Sans', sans-serif; }
  .asf-mono { font-family: 'JetBrains Mono', monospace; }

  .asf-overlay {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    background: rgba(8, 12, 30, 0.72);
    backdrop-filter: blur(6px);
    padding: 1rem;
  }

  .asf-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 32px 80px rgba(8,12,30,.18), 0 0 0 1px rgba(0,0,0,.06);
    width: 100%; max-width: 560px;
    max-height: 92vh;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ── */
  .asf-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px;
    border-bottom: 1px solid #f0f0f4;
    flex-shrink: 0;
  }
  .asf-header-left { display: flex; align-items: center; gap: 10px; }
  .asf-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #3b5bdb 0%, #6741d9 100%);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .asf-title { font-size: 15px; font-weight: 700; color: #111827; line-height: 1.2; }
  .asf-subtitle { font-size: 12px; color: #9ca3af; margin-top: 1px; }
  .asf-close-btn {
    width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
    background: #f3f4f6; color: #6b7280;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, color .15s;
  }
  .asf-close-btn:hover { background: #fee2e2; color: #ef4444; }
  .asf-close-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* ── Body ── */
  .asf-body { padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }

  /* ── Error banner ── */
  .asf-error {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 10px 14px;
    background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px;
    font-size: 13px; color: #be123c;
    flex-shrink: 0;
    margin: 0 24px 0;
  }
  .asf-error svg { flex-shrink: 0; margin-top: 1px; }

  /* ── Field ── */
  .asf-field { display: flex; flex-direction: column; gap: 5px; }
  .asf-label { font-size: 12px; font-weight: 600; color: #374151; letter-spacing: .3px; text-transform: uppercase; }
  .asf-req { color: #ef4444; }

  /* ── Input / Select ── */
  .asf-input, .asf-select {
    width: 100%; padding: 9px 12px;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 14px; color: #111827; font-family: 'DM Sans', sans-serif;
    background: #fff; outline: none;
    transition: border-color .15s, box-shadow .15s;
    box-sizing: border-box;
  }
  .asf-input:focus, .asf-select:focus {
    border-color: #3b5bdb;
    box-shadow: 0 0 0 3px rgba(59,91,219,.1);
  }
  .asf-input::placeholder { color: #c4c9d4; }
  .asf-input:disabled, .asf-select:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
  .asf-input-readonly {
    padding: 9px 12px;
    background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 14px; color: #374151;
    display: flex; align-items: center; gap: 8px;
    min-height: 40px;
  }

  /* ── Select wrapper ── */
  .asf-select-wrap { position: relative; }
  .asf-select-wrap select { appearance: none; padding-right: 36px; }
  .asf-select-wrap .asf-chevron {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: #9ca3af;
  }

  /* ── Skeleton ── */
  .asf-skeleton {
    height: 40px; border-radius: 10px;
    background: linear-gradient(90deg, #f0f0f4 25%, #e8e8ed 50%, #f0f0f4 75%);
    background-size: 200% 100%;
    animation: asf-shimmer 1.4s infinite;
  }
  @keyframes asf-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Subject preview card ── */
  .asf-preview {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px;
    background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
    border: 1.5px solid #c7d2fe; border-radius: 12px;
  }
  .asf-preview-icon {
    width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(135deg, #3b5bdb, #6741d9);
    display: flex; align-items: center; justify-content: center;
    color: white;
  }
  .asf-preview-name { font-size: 14px; font-weight: 600; color: #1e1b4b; }
  .asf-preview-meta { font-size: 12px; color: #6366f1; margin-top: 1px; }
  .asf-preview-code {
    margin-left: auto; flex-shrink: 0;
    font-size: 11px; font-weight: 600; color: #4338ca;
    background: #e0e7ff; padding: 3px 8px; border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── Grid ── */
  .asf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── Toggle checkbox row ── */
  .asf-toggle-row {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    background: #fafafa; border: 1.5px solid #e5e7eb; border-radius: 12px;
    cursor: pointer; user-select: none;
    transition: border-color .15s, background .15s;
  }
  .asf-toggle-row:hover { border-color: #c7d2fe; background: #f5f3ff; }
  .asf-toggle-row.active { border-color: #6366f1; background: #eef2ff; }
  .asf-toggle-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: #4f46e5; cursor: pointer; flex-shrink: 0; }
  .asf-toggle-label { font-size: 13px; font-weight: 600; color: #374151; }
  .asf-toggle-desc { font-size: 11px; color: #9ca3af; margin-top: 1px; }

  /* ── Theory/Practical panel ── */
  .asf-tp-panel {
    padding: 16px;
    background: #f8f9ff;
    border: 1.5px solid #c7d2fe; border-radius: 14px;
  }
  .asf-tp-header {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; color: #4338ca;
    text-transform: uppercase; letter-spacing: .6px;
    margin-bottom: 14px;
  }
  .asf-tp-header svg { color: #6366f1; }

  /* ── Sum indicator ── */
  .asf-sum-row {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    margin-top: 4px;
  }
  .asf-sum-ok { background: #dcfce7; color: #166534; }
  .asf-sum-err { background: #fff7ed; color: #9a3412; }

  /* ── Section label (divider-style) ── */
  .asf-section-label {
    font-size: 11px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: .6px;
    display: flex; align-items: center; gap: 8px;
  }
  .asf-section-label::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }

  /* ── Footer ── */
  .asf-footer {
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #f0f0f4;
    background: #fafafa;
    flex-shrink: 0;
  }
  .asf-btn {
    padding: 9px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; border: none;
    display: flex; align-items: center; gap: 6px;
    transition: all .15s;
  }
  .asf-btn:disabled { opacity: .5; cursor: not-allowed; }
  .asf-btn-cancel {
    background: white; color: #374151;
    border: 1.5px solid #e5e7eb;
  }
  .asf-btn-cancel:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }
  .asf-btn-submit {
    background: linear-gradient(135deg, #3b5bdb 0%, #6741d9 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(59,91,219,.3);
  }
  .asf-btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(59,91,219,.4);
  }
  .asf-btn-submit:active:not(:disabled) { transform: translateY(0); }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function AddSubjectForm({
  examId,
  examName = "",
  classId,          // ← REQUIRED: used to fetch section-subjects for this class
  editData = null,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(editData);

  /* ── State ─────────────────────────────── */
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [loadingMeta, setLoadingMeta]         = useState(true);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState(null);

  const [formData, setFormData] = useState({
    sectionSubjectId:      editData?.sectionSubjectId ?? "",
    maxMarks:              editData?.maxMarks          ?? "",
    passingMarks:          editData?.passingMarks      ?? "",
    hasTheoryPractical:    editData?.hasTheoryPractical ?? false,
    maxTheoryMarks:        editData?.maxTheoryMarks     ?? "",
    maxPracticalMarks:     editData?.maxPracticalMarks  ?? "",
    passingTheoryMarks:    editData?.passingTheoryMarks ?? "",
    passingPracticalMarks: editData?.passingPracticalMarks ?? "",
  });

  /* ── Fetch section-subjects for this class ── */
  useEffect(() => {
    if (!classId) {
      setError("classId prop is required to load subject mappings.");
      setLoadingMeta(false);
      return;
    }
    const load = async () => {
      setLoadingMeta(true);
      setError(null);
      try {
        const data = await getSectionSubjectsByClass(classId);
        setSectionSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load subject mappings. Please close and try again.");
      } finally {
        setLoadingMeta(false);
      }
    };
    load();
  }, [classId]);

  /* ── Re-sync on editData change ── */
  useEffect(() => {
    if (editData) {
      setFormData({
        sectionSubjectId:      editData.sectionSubjectId      ?? "",
        maxMarks:              editData.maxMarks               ?? "",
        passingMarks:          editData.passingMarks           ?? "",
        hasTheoryPractical:    editData.hasTheoryPractical     ?? false,
        maxTheoryMarks:        editData.maxTheoryMarks         ?? "",
        maxPracticalMarks:     editData.maxPracticalMarks      ?? "",
        passingTheoryMarks:    editData.passingTheoryMarks     ?? "",
        passingPracticalMarks: editData.passingPracticalMarks  ?? "",
      });
    }
  }, [editData]);

  /* ── Derived: selected subject info ── */
  const selectedMapping = useMemo(
    () => sectionSubjects.find((s) => String(s.id) === String(formData.sectionSubjectId)) ?? null,
    [sectionSubjects, formData.sectionSubjectId]
  );

  // In EDIT mode, fall back to editData fields if sectionSubjects not yet loaded
  const previewSubject = selectedMapping ?? (isEdit ? {
    subjectName: editData?.subjectName,
    subjectCode: editData?.subjectCode,
    sectionName: editData?.sectionName,
    className:   editData?.className,
  } : null);

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  /* ── Validation ── */
  const validate = () => {
    if (!formData.sectionSubjectId)
      return "Please select a section subject.";

    const max     = Number(formData.maxMarks);
    const passing = Number(formData.passingMarks);

    if (!max || max < 1)
      return "Max marks must be at least 1.";
    if (!passing || passing < 1)
      return "Passing marks must be at least 1.";
    if (passing > max)
      return "Passing marks cannot exceed max marks.";

    if (formData.hasTheoryPractical) {
      const th  = Number(formData.maxTheoryMarks);
      const pr  = Number(formData.maxPracticalMarks);
      const pth = Number(formData.passingTheoryMarks);
      const ppr = Number(formData.passingPracticalMarks);

      if (!th || !pr)
        return "Both max theory and max practical marks are required.";
      if (th + pr !== max)
        return `Theory (${th}) + Practical (${pr}) must equal Max Marks (${max}).`;
      if (pth > th)
        return "Passing theory marks cannot exceed max theory marks.";
      if (ppr > pr)
        return "Passing practical marks cannot exceed max practical marks.";
    }
    return null;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    try {
      const tp = formData.hasTheoryPractical;
      const payload = {
        sectionSubjectId:      Number(formData.sectionSubjectId),
        maxMarks:              Number(formData.maxMarks),
        passingMarks:          Number(formData.passingMarks),
        hasTheoryPractical:    tp,
        maxTheoryMarks:        tp ? Number(formData.maxTheoryMarks)        : null,
        maxPracticalMarks:     tp ? Number(formData.maxPracticalMarks)     : null,
        passingTheoryMarks:    tp ? Number(formData.passingTheoryMarks)    : null,
        passingPracticalMarks: tp ? Number(formData.passingPracticalMarks) : null,
      };

      if (isEdit) {
        await updateExamSubject(examId, editData.id, payload);
      } else {
        await addExamSubject(examId, payload);
      }

      onSuccess?.();
    } catch (err) {
      setError(err.message ?? `Failed to ${isEdit ? "update" : "add"} subject. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Live sum hint ── */
  const theorySum    = Number(formData.maxTheoryMarks || 0) + Number(formData.maxPracticalMarks || 0);
  const sumMatchesMax = theorySum > 0 && theorySum === Number(formData.maxMarks);
  const showSumHint  = formData.hasTheoryPractical && (formData.maxTheoryMarks || formData.maxPracticalMarks);

  /* ── Label builder for dropdown ── */
  const mappingLabel = (m) => {
    const parts = [m.className, m.sectionName, m.subjectName].filter(Boolean);
    return parts.join(" — ");
  };

  return (
    <>
      <style>{STYLE}</style>

      <div className="asf-root asf-overlay">
        <div className="asf-card">

          {/* ── Header ─────────────────────────────── */}
          <div className="asf-header">
            <div className="asf-header-left">
              <div className="asf-icon-wrap">
                <BookOpen size={17} color="white" />
              </div>
              <div>
                <div className="asf-title">
                  {isEdit ? "Edit Subject Config" : "Add Subject to Exam"}
                </div>
                {examName && (
                  <div className="asf-subtitle">{examName}</div>
                )}
              </div>
            </div>
            <button
              className="asf-close-btn"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Error ─────────────────────────────── */}
          {error && (
            <div className="asf-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Body ──────────────────────────────── */}
          <div className="asf-body">

            {/* Section Subject Dropdown / Read-only */}
            <div className="asf-field">
              <label className="asf-label">
                Section & Subject <span className="asf-req">*</span>
              </label>

              {isEdit ? (
                /* EDIT: read-only display */
                <div className="asf-input-readonly">
                  <BookOpen size={14} color="#6366f1" />
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    {previewSubject
                      ? [previewSubject.className, previewSubject.sectionName, previewSubject.subjectName].filter(Boolean).join(" — ")
                      : "—"}
                  </span>
                  {previewSubject?.subjectCode && (
                    <span className="asf-mono" style={{ fontSize: 11, color: "#4338ca", background: "#e0e7ff", padding: "2px 7px", borderRadius: 5 }}>
                      {previewSubject.subjectCode}
                    </span>
                  )}
                </div>
              ) : loadingMeta ? (
                <div className="asf-skeleton" />
              ) : (
                <div className="asf-select-wrap">
                  <select
                    name="sectionSubjectId"
                    value={formData.sectionSubjectId}
                    onChange={handleChange}
                    className="asf-select"
                    disabled={submitting}
                  >
                    <option value="" disabled>Select section + subject…</option>
                    {sectionSubjects.map((m) => (
                      <option key={m.id} value={m.id}>{mappingLabel(m)}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="asf-chevron" />
                </div>
              )}
            </div>

            {/* Subject Preview Card */}
            {previewSubject && (
              <div className="asf-preview">
                <div className="asf-preview-icon">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="asf-preview-name">{previewSubject.subjectName}</div>
                  <div className="asf-preview-meta">{previewSubject.sectionName}</div>
                </div>
                {previewSubject.subjectCode && (
                  <div className="asf-preview-code asf-mono">{previewSubject.subjectCode}</div>
                )}
              </div>
            )}

            {/* Marks section */}
            <div className="asf-section-label">Marks Configuration</div>

            <div className="asf-grid-2">
              <div className="asf-field">
                <label className="asf-label">
                  Max Marks <span className="asf-req">*</span>
                </label>
                <input
                  type="number"
                  name="maxMarks"
                  value={formData.maxMarks}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g. 100"
                  disabled={submitting}
                  className="asf-input"
                />
              </div>
              <div className="asf-field">
                <label className="asf-label">
                  Passing Marks <span className="asf-req">*</span>
                </label>
                <input
                  type="number"
                  name="passingMarks"
                  value={formData.passingMarks}
                  onChange={handleChange}
                  min={1}
                  max={formData.maxMarks || undefined}
                  placeholder="e.g. 33"
                  disabled={submitting}
                  className="asf-input"
                />
              </div>
            </div>

            {/* Theory + Practical Toggle */}
            <label
              className={`asf-toggle-row ${formData.hasTheoryPractical ? "active" : ""}`}
              htmlFor="hasTheoryPractical"
            >
              <input
                id="hasTheoryPractical"
                type="checkbox"
                name="hasTheoryPractical"
                checked={formData.hasTheoryPractical}
                onChange={handleChange}
                disabled={submitting}
              />
              <div>
                <div className="asf-toggle-label">Has Theory + Practical Split</div>
                <div className="asf-toggle-desc">Enable separate breakdown for theory and practical marks</div>
              </div>
            </label>

            {/* Theory / Practical Fields */}
            {formData.hasTheoryPractical && (
              <div className="asf-tp-panel">
                <div className="asf-tp-header">
                  <FlaskConical size={13} />
                  Theory / Practical Breakdown
                </div>

                <div className="asf-grid-2" style={{ marginBottom: 12 }}>
                  <div className="asf-field">
                    <label className="asf-label">Max Theory <span className="asf-req">*</span></label>
                    <input
                      type="number"
                      name="maxTheoryMarks"
                      value={formData.maxTheoryMarks}
                      onChange={handleChange}
                      min={0}
                      placeholder="e.g. 70"
                      disabled={submitting}
                      className="asf-input"
                    />
                  </div>
                  <div className="asf-field">
                    <label className="asf-label">Max Practical <span className="asf-req">*</span></label>
                    <input
                      type="number"
                      name="maxPracticalMarks"
                      value={formData.maxPracticalMarks}
                      onChange={handleChange}
                      min={0}
                      placeholder="e.g. 30"
                      disabled={submitting}
                      className="asf-input"
                    />
                  </div>
                  <div className="asf-field">
                    <label className="asf-label">Pass Theory</label>
                    <input
                      type="number"
                      name="passingTheoryMarks"
                      value={formData.passingTheoryMarks}
                      onChange={handleChange}
                      min={0}
                      max={formData.maxTheoryMarks || undefined}
                      placeholder="e.g. 23"
                      disabled={submitting}
                      className="asf-input"
                    />
                  </div>
                  <div className="asf-field">
                    <label className="asf-label">Pass Practical</label>
                    <input
                      type="number"
                      name="passingPracticalMarks"
                      value={formData.passingPracticalMarks}
                      onChange={handleChange}
                      min={0}
                      max={formData.maxPracticalMarks || undefined}
                      placeholder="e.g. 10"
                      disabled={submitting}
                      className="asf-input"
                    />
                  </div>
                </div>

                {/* Live sum hint */}
                {showSumHint && (
                  <div className={`asf-sum-row ${sumMatchesMax ? "asf-sum-ok" : "asf-sum-err"}`}>
                    {sumMatchesMax
                      ? <CheckCircle2 size={14} />
                      : <AlertCircle size={14} />}
                    <span className="asf-mono">
                      {Number(formData.maxTheoryMarks || 0)} + {Number(formData.maxPracticalMarks || 0)} = {theorySum}
                    </span>
                    <span>
                      {sumMatchesMax
                        ? "✓ Matches max marks"
                        : `Must equal ${formData.maxMarks || "max marks"}`}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── Footer ─────────────────────────────── */}
          <div className="asf-footer">
            <button
              className="asf-btn asf-btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="asf-btn asf-btn-submit"
              onClick={handleSubmit}
              disabled={submitting || loadingMeta}
            >
              {submitting && <Loader2 size={15} className="spin" style={{ animation: "spin 1s linear infinite" }} />}
              {submitting
                ? (isEdit ? "Saving…" : "Adding…")
                : (isEdit ? "Save Changes" : "Add Subject")}
            </button>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ScrollText, Upload, X, Send,
  Info, AlertCircle, CheckCircle2, Loader2,
  Users, GraduationCap, ChevronDown,
  BellIcon,
  UserRoundCheckIcon,
  LucideClockPlus,
  PiIcon,
} from 'lucide-react';
import { createCircular, uploadCircularAttachment } from '../../../Api/Communication/CircularApi';
import { useClasses } from '../../../ContextAPI/ClassContext.jsx';
import COMMUNICATION_CONSTS from '../../../Constants/StringConstants/CommunicationConstants';

// ── Constants ──────────────────────────────────────────────────────────────────

const inputCls = (err) =>
    `w-full border ${err ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-50'
    } rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 transition-all`;

// ── Sub-components ─────────────────────────────────────────────────────────────

function FormCard({ title, children }) {
  return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</p>
        {children}
      </div>
  );
}

function Field({ label, required, error, hint, children }) {
  return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
        {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={11} />{error}
            </p>
        )}
      </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CreateCircularPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(COMMUNICATION_CONSTS.CREATE_CIRCULAR_INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [submitting, setSub] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Broadcast audience selections (e.g. ALL_STAFF, ALL_PARENTS …)
  const [selectedBroadcast, setSelectedBroadcast] = useState([]);

  // ── Class / section audience selections: [{ classId, sectionId | null, label }]
  const [selectedClassTargets, setSelectedClassTargets] = useState([]);

  // ── API data from ClassContext
  const { classes, loading: classesLoading } = useClasses();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setField = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const toggleBroadcast = (val) => {
    setSelectedBroadcast((p) =>
        p.includes(val) ? p.filter((x) => x !== val) : [...p, val]
    );
    setErrors((p) => ({ ...p, targets: '' }));
  };

  // Add a class (all sections) or specific section to targets
  const addClassTarget = (classId, sectionId = null) => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;

    const key = sectionId ? `section-${sectionId}` : `class-${classId}`;
    const alreadyExists = selectedClassTargets.some((t) => t.key === key);
    if (alreadyExists) return;

    const sectionName = sectionId
        ? (cls.sections ?? []).find((s) => s.id === sectionId)?.name
        : null;

    setSelectedClassTargets((p) => [
      ...p,
      {
        key,
        classId,
        sectionId,
        label: sectionName ? `${cls.name} – Section ${sectionName}` : `${cls.name} (All Sections)`,
      },
    ]);
    setErrors((p) => ({ ...p, targets: '' }));
  };

  const removeClassTarget = (key) =>
      setSelectedClassTargets((p) => p.filter((t) => t.key !== key));

  // Handle the grouped <select> change
  const handleClassSectionSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    e.target.value = ''; // reset
    if (val.startsWith('class-')) {
      addClassTarget(Number(val.replace('class-', '')));
    } else if (val.startsWith('section-')) {
      const [, classIdStr, sectionIdStr] = val.split('-');
      addClassTarget(Number(classIdStr), Number(sectionIdStr));
    }
  };

  const addFile = (fileList) => {
    const newFiles = Array.from(fileList).filter((f) => f.size <= COMMUNICATION_CONSTS.ATTACHMENT_MAX_SIZE_BYTES);
    setFiles((p) => [...p, ...newFiles]);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = COMMUNICATION_CONSTS.CREATE_CIRCULAR_VALIDATION.TITLE_REQUIRED;
    if (!form.content.trim()) e.content = COMMUNICATION_CONSTS.CREATE_CIRCULAR_VALIDATION.CONTENT_REQUIRED;
    if (selectedBroadcast.length === 0 && selectedClassTargets.length === 0)
      e.targets = COMMUNICATION_CONSTS.CREATE_CIRCULAR_VALIDATION.TARGETS_REQUIRED;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), COMMUNICATION_CONSTS.TOAST_DURATION_MS);
  };

  // ── Build targets array for payload ────────────────────────────────────────
  const buildTargets = () => {
    const targets = [];

    // Broadcast groups
    selectedBroadcast.forEach((targetType) => {
      targets.push({ targetType, classId: null, sectionId: null });
    });

    // Class / section specific
    selectedClassTargets.forEach(({ classId, sectionId }) => {
      targets.push({
        targetType: sectionId ? 'SECTION' : 'CLASS',
        classId,
        sectionId: sectionId ?? null,
      });
    });

    return targets;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  // NOTE: Draft option removed — a circular is either being created (and goes
  // through the normal approval/publish flow) or it isn't. No "save as draft" path.
  const handleSubmit = async () => {
    if (!validate()) return;
    setSub(true);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      targets: buildTargets(),
    };

    const { data, error } = await createCircular(payload);

    if (error) {
      showToast('error', error);
      setSub(false);
      return;
    }

    if (files.length > 0 && data?.id) {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      await uploadCircularAttachment(data.id, fd);
    }

    showToast('success', COMMUNICATION_CONSTS.CREATE_CIRCULAR_TOAST.SUBMITTED);
    setTimeout(() => navigate(COMMUNICATION_CONSTS.COMMUNICATION_ROUTES.CIRCULARS), COMMUNICATION_CONSTS.SUBMIT_REDIRECT_DELAY_MS);
  };

  // ── Derived: total recipient label for preview ──────────────────────────────
  const allTargetLabels = [
    ...selectedBroadcast.map((v) => COMMUNICATION_CONSTS.BROADCAST_TARGETS.find((t) => t.value === v)?.label ?? v),
    ...selectedClassTargets.map((t) => t.label),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen relative">

        {/* Toast */}
        {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {toast.msg}
            </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors flex-shrink-0">
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <ScrollText size={18} className="text-blue-600 flex-shrink-0" />
              {COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.HEADER_TITLE}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
              {COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.HEADER_SUBTITLE}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">

          {/* ── Left: Form ─────────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Basic info */}
            <FormCard title="Basic Information">
              <div className="space-y-4">
                <Field label={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.TITLE_LABEL} required error={errors.title}>
                  <input
                      value={form.title}
                      onChange={setField('title')}
                      placeholder={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.TITLE_PLACEHOLDER}
                      className={inputCls(errors.title)}
                  />
                </Field>

                <Field
                    label={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.TYPE_LABEL}
                    required
                    hint={form.type === 'SCHOOL_WIDE'
                        ? COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.TYPE_HINT_SCHOOL_WIDE
                        : COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.TYPE_HINT_CLASS_SPECIFIC}
                >
                  <select value={form.type} onChange={setField('type')} className={inputCls()}>
                    <option value="SCHOOL_WIDE">School-Wide</option>
                    <option value="CLASS_SPECIFIC">Class-Specific</option>
                  </select>
                </Field>
              </div>
            </FormCard>

            {/* Content */}
            <FormCard title="Content">
              <Field label={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CONTENT_LABEL} required error={errors.content}>
              <textarea
                  value={form.content}
                  onChange={setField('content')}
                  rows={6}
                  placeholder={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CONTENT_PLACEHOLDER}
                  className={`${inputCls(errors.content)} resize-y leading-relaxed`}
              />
              </Field>
            </FormCard>

            {/* Recipients */}
            <FormCard title="Target Recipients">
              <div className="space-y-4">

                {/* Broadcast groups */}
                <Field label={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.BROADCAST_LABEL} error={errors.targets}>
                  <div className="flex flex-wrap gap-2">
                    {COMMUNICATION_CONSTS.BROADCAST_TARGETS.map((t) => {
                      const sel = selectedBroadcast.includes(t.value);
                      const Icon = t.icon;
                      return (
                          <button
                              key={t.value}
                              type="button"
                              onClick={() => toggleBroadcast(t.value)}
                              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all ${sel
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
                          >
                            <span><Icon size={16} /></span>
                            {t.label}
                            {sel && <CheckCircle2 size={13} className="ml-0.5" />}
                          </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-100" />
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CLASS_SECTION_DIVIDER}</span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>

                {/* Class / Section grouped dropdown */}
                <Field label={COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CLASS_SECTION_LABEL}>
                  <div className="relative">
                    <select
                        onChange={handleClassSectionSelect}
                        defaultValue=""
                        disabled={classesLoading}
                        className={`${inputCls()} appearance-none pr-8 cursor-pointer`}
                    >
                      <option value="" disabled>
                        {classesLoading ? COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CLASS_SECTION_LOADING : COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CLASS_SECTION_PLACEHOLDER}
                      </option>
                      {classes.map((cls) => (
                          <optgroup key={cls.id} label={`📚 ${cls.name}`}>
                            <option value={`class-${cls.id}`}>
                              {cls.name} — All Sections
                            </option>
                            {(cls.sections ?? []).map((sec) => (
                                <option key={sec.id} value={`section-${cls.id}-${sec.id}`}>
                                  {cls.name} · Section {sec.name}
                                  {sec.roomNumber ? ` (${sec.roomNumber})` : ''}
                                </option>
                            ))}
                          </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </Field>

                {/* Selected class/section chips */}
                {selectedClassTargets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedClassTargets.map((t) => (
                          <span
                              key={t.key}
                              className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                          >
                      <GraduationCap size={11} />
                            {t.label}
                            <button
                                onClick={() => removeClassTarget(t.key)}
                                className="text-indigo-400 hover:text-red-500 ml-0.5 transition-colors"
                            >
                        <X size={11} />
                      </button>
                    </span>
                      ))}
                    </div>
                )}

                {/* Validation error for targets */}
                {errors.targets && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />{errors.targets}
                    </p>
                )}
              </div>
            </FormCard>

            {/* Attachments */}
            <FormCard title="Attachments">
              <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); addFile(e.dataTransfer.files); }}
                  onClick={() => document.getElementById('file-input').click()}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'}`}
              >
                <Upload size={22} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">{COMMUNICATION_CONSTS.ATTACHMENT_HINT_TEXT}</p>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => addFile(e.target.files)}
                    accept={COMMUNICATION_CONSTS.ATTACHMENT_ACCEPT}
                />
              </div>

              {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((f, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                        >
                    📄 {f.name}
                          <button
                              onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                      <X size={11} />
                    </button>
                  </span>
                    ))}
                  </div>
              )}
            </FormCard>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
              <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.CANCEL}
              </button>
              <button
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="flex items-center cursor-pointer justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {form.type === 'CLASS_SPECIFIC' ? COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.SUBMIT_CLASS_SPECIFIC : COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.SUBMIT_SCHOOL_WIDE}
              </button>
            </div>
          </div>

          {/* ── Right: Info panels ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* ── Approval Rules ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Info size={14} className="text-blue-500" />
                </div>
                <p className="text-sm font-bold text-gray-900">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.HOW_PUBLISHING_WORKS}</p>
              </div>

              <div className="space-y-3">
                {/* Rule 1 */}
                <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                  <span className="text-base flex-shrink-0 mt-0.5"><UserRoundCheckIcon className="text-green-500" /></span>
                  <div>
                    <p className="text-xs font-bold text-green-800">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.RULE_ADMIN_TITLE}</p>
                    <p className="text-xs text-green-700 mt-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.RULE_ADMIN_TEXT }} />
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-base flex-shrink-0 mt-0.5"><LucideClockPlus className="text-amber-500" /></span>
                  <div>
                    <p className="text-xs font-bold text-amber-800">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.RULE_TEACHER_TITLE}</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.RULE_TEACHER_TEXT }} />
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-base flex-shrink-0 mt-0.5"><PiIcon className="text-blue-500" /></span>
                  <div>
                    <p className="text-xs font-bold text-blue-800">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.RULE_ANY_ROLE_TITLE}</p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.RULE_ANY_ROLE_TEXT }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Notification Preview ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm"><BellIcon size={14} /></span>
                </div>
                <p className="text-sm font-bold text-gray-900">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.NOTIFICATION_PREVIEW_TITLE}</p>
              </div>

              {/* Mock notification card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Phone-style top bar */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <ScrollText size={10} className="text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.NOTIFICATION_PREVIEW_APP_LABEL}</span>
                </div>

                {/* Notification body */}
                <div className="p-3.5 bg-white">
                  <p className="text-xs font-bold text-gray-900 leading-snug mb-1">
                    📢 {form.title || <span className="text-gray-400 font-normal italic">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.NOTIFICATION_TITLE_PLACEHOLDER}</span>}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {form.content
                        ? form.content.slice(0, COMMUNICATION_CONSTS.NOTIFICATION_PREVIEW_CONTENT_TRUNCATE_LENGTH) + (form.content.length > COMMUNICATION_CONSTS.NOTIFICATION_PREVIEW_CONTENT_TRUNCATE_LENGTH ? '…' : '')
                        : <span className="italic">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.NOTIFICATION_CONTENT_PLACEHOLDER}</span>}
                  </p>
                </div>

                {/* Recipients footer */}
                {allTargetLabels.length > 0 && (
                    <div className="px-3.5 pb-3 pt-0">
                      <p className="text-[10.5px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.SENDING_TO_LABEL}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {allTargetLabels.map((label, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1 text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
                            >
                        <Users size={9} /> {label}
                      </span>
                        ))}
                      </div>
                    </div>
                )}

                {allTargetLabels.length === 0 && (
                    <div className="px-3.5 pb-3">
                      <p className="text-[11px] text-gray-400 italic">{COMMUNICATION_CONSTS.CREATE_CIRCULAR_TEXT.NO_RECIPIENTS_YET}</p>
                    </div>
                )}
              </div>

              {/* Attachments note */}
              {files.length > 0 && (
                  <p className="text-xs text-violet-600 mt-3 flex items-center gap-1.5">
                    <span>📎</span>
                    {files.length} attachment{files.length > 1 ? 's' : ''} will be included
                  </p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
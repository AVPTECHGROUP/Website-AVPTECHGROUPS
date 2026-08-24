import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, CalendarDays, Users, Upload,
  CheckCircle2, ChevronDown, Loader2, AlertCircle, X, FileText,
  Globe,
} from 'lucide-react';
import { createEvent, uploadEventAttachment } from '../../../Api/Communication/CircularApi';
import { useClasses } from '../../../ContextAPI/ClassContext.jsx';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS as P } from '../../../Constants/Permission';
import {
  EVENT_TYPES,
  BROADCAST_TARGETS,
  CREATE_EVENT_INITIAL_FORM,
  CREATE_EVENT_TEXT,
  CREATE_EVENT_VALIDATION,
  CREATE_EVENT_TOAST,
  COMMUNICATION_ROUTES,
  TOAST_DURATION_MS,
  SUBMIT_REDIRECT_DELAY_MS,
  ATTACHMENT_MAX_SIZE_BYTES,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_HINT_TEXT,
} from '../../../Constants/StringConstants/CommunicationConstants';

// ── Local (non-shared) constants ────────────────────────────────────────────

const inputCls = (err) =>
    `w-full border ${err ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-50'
    } rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 transition-all`;

// ── Helpers ────────────────────────────────────────────────────────────────────

// FIX: previously rounded to whole hours, so a 30-minute gap showed as
// "0 hours" (or got swallowed entirely). Now breaks duration into
// days / hours / minutes and shows the smallest meaningful unit
// (e.g. "30 minutes", "1 hour 30 min", "2 days 3 hours").
function calcDuration(start, end) {
  try {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e) || e <= s) return null;

    const totalMinutes = Math.round((e - s) / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      let str = `${days} day${days !== 1 ? 's' : ''}`;
      if (hours > 0) str += ` ${hours} hour${hours !== 1 ? 's' : ''}`;
      return str;
    }
    if (hours > 0) {
      let str = `${hours} hour${hours !== 1 ? 's' : ''}`;
      if (minutes > 0) str += ` ${minutes} min`;
      return str;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } catch { return null; }
}

function toISO(localDt) {
  if (!localDt) return null;
  // Strip seconds fractions and the trailing Z — backend expects "2025-12-15T09:00:00"
  return localDt.length === 16 ? `${localDt}:00` : localDt.slice(0, 19);
}

function fmtDisplay(localDt) {
  if (!localDt) return '—';
  try {
    return new Date(localDt).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

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

function SumRow({ icon: Icon, label, value }) {
  return (
      <div className="flex items-start gap-2.5 text-[12.5px]">
        <Icon size={13} className="text-blue-400 mt-0.5 shrink-0" />
        <span className="text-gray-400 w-16 shrink-0">{label}</span>
        <span className="text-gray-700 font-medium truncate flex-1">{value || '—'}</span>
      </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CreateEventPage() {
  const navigate = useNavigate();

  // FIX: authority check — users who can approve events publish directly;
  // everyone else submits for approval. Draft option removed entirely.
  const { hasPermission } = useAuth();
  const canPublishDirectly = hasPermission(P.EVENT_APPROVE);

  const [form, setForm] = useState(CREATE_EVENT_INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [submitting, setSub] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Broadcast audience selections
  const [selectedBroadcast, setSelectedBroadcast] = useState([]);

  // ── Class / section audience selections
  const [selectedClassTargets, setSelectedClassTargets] = useState([]);

  // ── API data from ClassContext
  const { classes, loading: classesLoading } = useClasses();

  // ── State Handlers ─────────────────────────────────────────────────────────
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
    const newFiles = Array.from(fileList).filter((f) => f.size <= ATTACHMENT_MAX_SIZE_BYTES);
    setFiles((p) => [...p, ...newFiles]);
  };

  // ── Validation & Submission ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = CREATE_EVENT_VALIDATION.TITLE_REQUIRED;
    if (!form.startDatetime) e.startDatetime = CREATE_EVENT_VALIDATION.START_REQUIRED;
    if (!form.endDatetime) e.endDatetime = CREATE_EVENT_VALIDATION.END_REQUIRED;
    if (selectedBroadcast.length === 0 && selectedClassTargets.length === 0)
      e.targets = CREATE_EVENT_VALIDATION.TARGETS_REQUIRED;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const buildTargets = () => {
    const targets = [];
    selectedBroadcast.forEach((targetType) => {
      targets.push({ targetType, classId: null, sectionId: null });
    });
    selectedClassTargets.forEach(({ classId, sectionId }) => {
      targets.push({
        targetType: sectionId ? 'SECTION' : 'CLASS',
        classId,
        sectionId: sectionId ?? null,
      });
    });
    return targets;
  };

  // FIX: draft path removed. Single submit — backend decides PUBLISHED vs
  // PENDING_APPROVAL based on the creator's own permissions, same as
  // createCircular's flow.
  const handleSubmit = async () => {
    if (!validate()) return;
    setSub(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      startDatetime: toISO(form.startDatetime),
      endDatetime: toISO(form.endDatetime),
      type: form.type,
      targets: buildTargets(),
    };

    const { data, error } = await createEvent(payload);

    if (error) {
      showToast('error', error);
      setSub(false);
      return;
    }

    if (files.length > 0 && data?.id) {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      await uploadEventAttachment(data.id, fd);
    }

    showToast(
        'success',
        canPublishDirectly
            ? (CREATE_EVENT_TOAST.PUBLISHED ?? 'Event published.')
            : (CREATE_EVENT_TOAST.SUBMITTED ?? 'Event submitted for approval.')
    );
    setTimeout(() => navigate(COMMUNICATION_ROUTES.EVENTS), SUBMIT_REDIRECT_DELAY_MS);
  };

  // ── Derived Data for Previews ──────────────────────────────────────────────
  const dur = calcDuration(form.startDatetime, form.endDatetime);
  const allTargetLabels = [
    ...selectedBroadcast.map((v) => BROADCAST_TARGETS.find((t) => t.value === v)?.label ?? v),
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
              <CalendarDays size={18} className="text-blue-600 flex-shrink-0" />
              {CREATE_EVENT_TEXT.HEADER_TITLE}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
              {CREATE_EVENT_TEXT.HEADER_SUBTITLE}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">

          {/* ── Left: Form ─────────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Event Details */}
            <FormCard title={CREATE_EVENT_TEXT.EVENT_DETAILS_SECTION}>
              <div className="space-y-4">
                <Field label={CREATE_EVENT_TEXT.TITLE_LABEL} required error={errors.title}>
                  <input
                      value={form.title}
                      onChange={setField('title')}
                      placeholder={CREATE_EVENT_TEXT.TITLE_PLACEHOLDER}
                      className={inputCls(errors.title)}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={CREATE_EVENT_TEXT.TYPE_LABEL} required>
                    <div className="relative">
                      <select value={form.type} onChange={setField('type')} className={`${inputCls()} appearance-none pr-9 cursor-pointer`}>
                        {EVENT_TYPES.map((et) => (
                            <option key={et.value} value={et.value}>{et.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label={CREATE_EVENT_TEXT.LOCATION_LABEL}>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                          value={form.location}
                          onChange={setField('location')}
                          placeholder={CREATE_EVENT_TEXT.LOCATION_PLACEHOLDER}
                          className={`${inputCls()} pl-8`}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </FormCard>

            {/* Date & Time */}
            <FormCard title={CREATE_EVENT_TEXT.DATE_TIME_SECTION}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={CREATE_EVENT_TEXT.START_LABEL} required error={errors.startDatetime}>
                  <input type="datetime-local" value={form.startDatetime} onChange={setField('startDatetime')}
                         className={inputCls(errors.startDatetime)} style={{ colorScheme: 'light' }} />
                </Field>
                <Field label={CREATE_EVENT_TEXT.END_LABEL} required error={errors.endDatetime}>
                  <input type="datetime-local" value={form.endDatetime} onChange={setField('endDatetime')}
                         className={inputCls(errors.endDatetime)} style={{ colorScheme: 'light' }} />
                </Field>
              </div>
              {dur && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                    <Clock size={12} /> {CREATE_EVENT_TEXT.SUMMARY_DURATION_ROW}: {dur}
                  </div>
              )}
            </FormCard>

            {/* Description */}
            <FormCard title={CREATE_EVENT_TEXT.DESCRIPTION_SECTION}>
              <Field label={CREATE_EVENT_TEXT.DESCRIPTION_LABEL}>
              <textarea
                  value={form.description}
                  onChange={setField('description')}
                  placeholder={CREATE_EVENT_TEXT.DESCRIPTION_PLACEHOLDER}
                  className={`${inputCls()} resize-y min-h-[100px] leading-relaxed`}
              />
              </Field>
            </FormCard>

            {/* Target Recipients (Mirrored from Circulars) */}
            <FormCard title={CREATE_EVENT_TEXT.TARGET_RECIPIENTS}>
              <div className="space-y-4">

                {/* Broadcast groups — FIX: marked required */}
                <Field label={CREATE_EVENT_TEXT.BROADCAST_LABEL} required error={errors.targets}>
                  <div className="flex flex-wrap gap-2">
                    {BROADCAST_TARGETS.map((t) => {
                      const sel = selectedBroadcast.includes(t.value);
                      const Icon = t.icon;
                      return (
                          <button
                              key={t.value}
                              type="button"
                              onClick={() => toggleBroadcast(t.value)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all ${sel
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
                          >
                            <Icon size={16} />
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
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{CREATE_EVENT_TEXT.CLASS_SECTION_DIVIDER}</span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>

                {/* Class / Section grouped dropdown — FIX: marked required */}
                <Field label={CREATE_EVENT_TEXT.CLASS_SECTION_LABEL} required>
                  <div className="relative">
                    <select
                        onChange={handleClassSectionSelect}
                        defaultValue=""
                        disabled={classesLoading}
                        className={`${inputCls()} appearance-none pr-8 cursor-pointer`}
                    >
                      <option value="" disabled>
                        {classesLoading ? CREATE_EVENT_TEXT.CLASS_SECTION_LOADING : CREATE_EVENT_TEXT.CLASS_SECTION_PLACEHOLDER}
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
                      <Users size={11} />
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
            <FormCard title={CREATE_EVENT_TEXT.ATTACHMENTS_SECTION}>
              <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); addFile(e.dataTransfer.files); }}
                  onClick={() => document.getElementById('file-input').click()}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'}`}
              >
                <Upload size={22} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">{CREATE_EVENT_TEXT.CLICK_TO_UPLOAD}</p>
                <p className="text-xs text-gray-400 mt-1">{ATTACHMENT_HINT_TEXT}</p>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => addFile(e.target.files)}
                    accept={ATTACHMENT_ACCEPT}
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

            {/* Actions — FIX: Save Draft button removed. Single submit button,
              labeled based on the creator's own approval authority. */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
              <button
                  onClick={() => navigate(-1)}
                  className="px-4 cursor-pointer py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {CREATE_EVENT_TEXT.CANCEL}
              </button>
              <button
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className={`flex items-center ${submitting ? 'cursor-not-allowed' : 'cursor-pointer'}  justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors`}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitting
                    ? (canPublishDirectly ? (CREATE_EVENT_TEXT.PUBLISHING ?? 'Publishing…') : 'Submitting…')
                    : (canPublishDirectly ? (CREATE_EVENT_TEXT.PUBLISH ?? 'Publish') : 'Submit for Approval')}
              </button>
            </div>
          </div>

          {/* ── Right: Info panels ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-6">
              <p className="text-sm font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">{CREATE_EVENT_TEXT.SUMMARY_TITLE}</p>

              <div className="flex flex-col gap-3 mb-4">
                <SumRow icon={FileText} label={CREATE_EVENT_TEXT.SUMMARY_TITLE_ROW} value={form.title} />
                <SumRow icon={Globe} label={CREATE_EVENT_TEXT.SUMMARY_TYPE_ROW} value={form.type === 'SCHOOL_WIDE' ? 'School-Wide' : 'Class-Specific'} />
                <SumRow icon={MapPin} label={CREATE_EVENT_TEXT.SUMMARY_LOCATION_ROW} value={form.location} />
                <SumRow icon={CalendarDays} label={CREATE_EVENT_TEXT.SUMMARY_START_ROW} value={fmtDisplay(form.startDatetime)} />
                <SumRow icon={CalendarDays} label={CREATE_EVENT_TEXT.SUMMARY_END_ROW} value={fmtDisplay(form.endDatetime)} />
                {dur && <SumRow icon={Clock} label={CREATE_EVENT_TEXT.SUMMARY_DURATION_ROW} value={dur} />}
              </div>

              {/* Notifying summary */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{CREATE_EVENT_TEXT.NOTIFYING_LABEL}</p>
                {allTargetLabels.length === 0 ? (
                    <p className="flex items-center gap-2 text-xs text-gray-400">
                      <Users size={12} /> {CREATE_EVENT_TEXT.NO_RECIPIENTS}
                    </p>
                ) : (
                    <div className="flex flex-col gap-1.5">
                      {allTargetLabels.map((label, i) => (
                          <div key={i}
                               className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[11.5px] font-semibold text-blue-700">
                            <Users size={10} className="shrink-0" />
                            {label}
                          </div>
                      ))}
                    </div>
                )}
              </div>

              {/* Attachments note */}
              {files.length > 0 && (
                  <p className="text-xs text-violet-600 mt-3 flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <span>📎</span>
                    {CREATE_EVENT_TEXT.FILES_INCLUDED_HINT(files.length)}
                  </p>
              )}
            </div>
          </div>

        </div>
      </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ScrollText, Upload, X, Send,
  Save, Info, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { createCircular, uploadCircularAttachment } from '../../../Api/CircularApi';

// ── Constants ──────────────────────────────────────────────────────────────────
const TARGET_OPTIONS = [
  { value: 'ALL_STAFF', label: 'All Staff' },
  { value: 'ALL_TEACHERS', label: 'All Teachers' },
  { value: 'ALL_PARENTS', label: 'All Parents' },
  { value: 'CLASS', label: 'Class' },
  { value: 'SECTION', label: 'Section' },
];

const APPROVAL_RULES = [
  { role: 'Admin / Principal / Global Admin', rule: 'School-Wide → Published immediately', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  { role: 'Teacher', rule: 'School-Wide → Queued for approval', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { role: 'Any Role', rule: 'Class-Specific → Published immediately', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const INITIAL_FORM = {
  title: '',
  type: 'SCHOOL_WIDE',
  content: '',
  targetGroups: [],
  specificClass: '',
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function CreateCircularPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [submitting, setSub] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [errors, setErrors] = useState({});

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setErrors((p) => ({ ...p, [k]: '' })); };

  const toggleTarget = (val) =>
    setForm((p) => ({
      ...p,
      targetGroups: p.targetGroups.includes(val)
        ? p.targetGroups.filter((x) => x !== val)
        : [...p.targetGroups, val],
    }));

  const addFile = (fileList) => {
    const newFiles = Array.from(fileList).filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((p) => [...p, ...newFiles]);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.content.trim()) e.content = 'Content is required';
    if (form.targetGroups.length === 0) e.targets = 'Select at least one recipient group';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (asDraft = false) => {
    if (!validate()) return;
    setSub(true);

    const payload = {
      title: form.title.trim(),
      type: form.type,
      content: form.content.trim(),
      targetGroups: form.targetGroups,
      status: asDraft ? 'DRAFT' : undefined, // let backend decide if not draft
      ...(form.specificClass ? { specificClass: form.specificClass } : {}),
    };

    const { data, error } = await createCircular(payload);

    if (error) {
      showToast('error', error);
      setSub(false);
      return;
    }

    // Upload attachments if any
    if (files.length > 0 && data?.id) {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      await uploadCircularAttachment(data.id, fd);
      // Non-blocking — attachment failure doesn't block navigation
    }

    showToast('success', asDraft ? 'Saved as draft.' : 'Circular submitted successfully.');
    setTimeout(() => navigate('/communication/circulars'), 1200);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ScrollText size={18} className="text-blue-600" /> Create New Circular
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Draft and publish a circular to parents, staff, or specific classes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: Form ── */}
        <div className="space-y-4">

          {/* Basic info */}
          <FormCard title="Basic Information">
            <div className="space-y-4">
              <Field label="Title" required error={errors.title}>
                <input value={form.title} onChange={set('title')} placeholder="e.g. Annual Sports Day — Parent Invitation"
                  className={inputCls(errors.title)} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Circular Type" required>
                  <select value={form.type} onChange={set('type')} className={inputCls()}>
                    <option value="SCHOOL_WIDE">School-Wide</option>
                    <option value="CLASS_SPECIFIC">Class-Specific</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {form.type === 'SCHOOL_WIDE' ? 'Teachers require admin approval' : 'Published directly'}
                  </p>
                </Field>

                <Field label="Publish Status">
                  <input value="Auto-determined by role & type" readOnly
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-400 cursor-default" />
                </Field>
              </div>
            </div>
          </FormCard>

          {/* Content */}
          <FormCard title="Content">
            <Field label="Circular Body" required error={errors.content}>
              <textarea value={form.content} onChange={set('content')} rows={6}
                placeholder="Write the circular content here…"
                className={`${inputCls(errors.content)} resize-y leading-relaxed`} />
            </Field>
          </FormCard>

          {/* Recipients */}
          <FormCard title="Target Recipients">
            <Field label="Select recipient groups" required error={errors.targets}>
              <div className="flex flex-wrap gap-2 mb-3">
                {TARGET_OPTIONS.map((t) => {
                  const sel = form.targetGroups.includes(t.value);
                  return (
                    <button key={t.value} type="button" onClick={() => toggleTarget(t.value)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all ${sel ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
                      {sel && '✓ '}{t.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs text-gray-500">Specific class:</span>
                <select value={form.specificClass} onChange={set('specificClass')}
                  className="border border-gray-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:border-blue-400">
                  <option value="">-- Select --</option>
                  {/* TODO: fetch classes from /v1/classes API */}
                  <option>Class 10-A</option>
                  <option>Class 9-B</option>
                  <option>Class 8-C</option>
                </select>
              </div>
            </Field>
          </FormCard>

          {/* Attachments */}
          <FormCard title="Attachments">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFile(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-input').click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'}`}>
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Images up to 10 MB</p>
              <input id="file-input" type="file" multiple hidden onChange={(e) => addFile(e.target.files)} accept=".pdf,.png,.jpg,.jpeg" />
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                    📄 {f.name}
                    <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormCard>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => handleSubmit(true)} disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <Save size={14} /> Save as Draft
            </button>
            <button onClick={() => handleSubmit(false)} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {form.type === 'CLASS_SPECIFIC' ? 'Publish Circular' : 'Submit for Approval'}
            </button>
          </div>
        </div>

        {/* ── Right: Info panels ── */}
        <div className="space-y-4">
          {/* Approval rules */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
              <Info size={15} className="text-blue-500" /> Approval Rules
            </div>
            <div className="space-y-2.5">
              {APPROVAL_RULES.map((r) => (
                <div key={r.role} className={`p-3 rounded-lg border ${r.bg} ${r.border}`}>
                  <p className={`text-xs font-bold ${r.color}`}>{r.role}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{r.rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-900 mb-3">📲 Push Preview</p>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Notification preview</p>
              <p className="text-sm font-bold text-slate-100 mb-1.5">
                📢 {form.title || 'Circular Title'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {(form.content || 'Content will appear here…').slice(0, 90)}{form.content?.length > 90 ? '…' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.targetGroups.includes('ALL_STAFF') && <span className="bg-blue-900 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded">Staff · Web + In-App</span>}
                {form.targetGroups.includes('ALL_PARENTS') && <span className="bg-purple-900 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded">Parents · Mobile</span>}
                {form.targetGroups.includes('ALL_TEACHERS') && <span className="bg-orange-900 text-orange-300 text-[10px] font-semibold px-2 py-0.5 rounded">Teachers · In-App</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function FormCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full border ${err ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-50'} rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 transition-all`;
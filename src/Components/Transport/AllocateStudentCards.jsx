import { useState, useEffect } from "react";
import { X, GraduationCap, Save, Loader2, Info, MapPin, Clock, CreditCard, FileText } from "lucide-react";

const STUDENTS = [
  "#101 – Aarav Sharma", "#102 – Priya Patel", "#103 – Rohan Verma",
  "#104 – Sneha Kulkarni", "#105 – Arjun Mehta",
];
const ROUTES = ["RT-001 – Route A (North Zone)", "RT-002 – Route B (South Zone)"];
const STOPS_MAP = {
  "RT-001 – Route A (North Zone)": ["Main Gate", "Sunrise Colony", "Model Colony Chowk", "Aundh Road"],
  "RT-002 – Route B (South Zone)": ["City Centre", "South Market", "Railway Colony"],
};
const FEE_PLANS = ["Route A Monthly", "Route B Monthly", "Quarterly Plan", "Annual Plan"];
const PICKUP_TYPES = ["BOTH", "PICKUP ONLY", "DROP ONLY"];

const EMPTY = {
  student: "", route: "", stop: "", pickupType: "BOTH",
  effectiveFrom: "", effectiveTo: "", feePlan: "", remarks: "",
};

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const base =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 transition border-gray-200 focus:ring-blue-300 focus:border-blue-400";
const errCls = "border-red-400 focus:ring-red-200 focus:border-red-400";

function SelectInput({ value, onChange, options, placeholder, hasError, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${base} appearance-none pr-9 cursor-pointer ${hasError ? errCls : ""} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function AllocateStudentCard({ isOpen, onClose, onSave }) {
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) { setForm(EMPTY); setErrors({}); }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v, ...(k === "route" ? { stop: "" } : {}) }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.student)       e.student      = "Please select a student";
    if (!form.route)         e.route        = "Please select a route";
    if (!form.stop)          e.stop         = "Please select a stop";
    if (!form.pickupType)    e.pickupType   = "Please select pickup/drop type";
    if (!form.effectiveFrom) e.effectiveFrom = "Effective from date is required";
    if (!form.feePlan)       e.feePlan      = "Please select a fee plan";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    onSave?.({ ...form });
    setSaving(false);
    onClose();
  };

  const availableStops = form.route ? (STOPS_MAP[form.route] || []) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-alloc-in">
        <style>{`
          @keyframes allocIn {
            from { opacity:0; transform:scale(0.95) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .animate-alloc-in { animation: allocIn 0.2s ease-out forwards; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Allocate Student to Transport</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-4 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span>Vehicle capacity is validated automatically. A student can have only one active transport allocation.</span>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Student + Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Student" required>
              <SelectInput value={form.student} onChange={(e) => set("student", e.target.value)}
                options={STUDENTS} placeholder="— Select Student —" hasError={!!errors.student} />
              {errors.student && <p className="text-xs text-red-500 mt-0.5">{errors.student}</p>}
            </Field>
            <Field label="Route" required>
              <SelectInput value={form.route} onChange={(e) => set("route", e.target.value)}
                options={ROUTES} placeholder="— Select Route —" hasError={!!errors.route} />
              {errors.route && <p className="text-xs text-red-500 mt-0.5">{errors.route}</p>}
            </Field>
          </div>

          {/* Stop + Pickup Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stop" required>
              <SelectInput value={form.stop} onChange={(e) => set("stop", e.target.value)}
                options={availableStops}
                placeholder={form.route ? "— Select Stop —" : "— Select Stop (after route) —"}
                hasError={!!errors.stop} disabled={!form.route} />
              {errors.stop && <p className="text-xs text-red-500 mt-0.5">{errors.stop}</p>}
            </Field>
            <Field label="Pickup / Drop Type" required>
              <SelectInput value={form.pickupType} onChange={(e) => set("pickupType", e.target.value)}
                options={PICKUP_TYPES} placeholder="— Select Type —" hasError={!!errors.pickupType} />
              {errors.pickupType && <p className="text-xs text-red-500 mt-0.5">{errors.pickupType}</p>}
            </Field>
          </div>

          {/* Effective From + Effective To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Effective From" required>
              <input type="date" value={form.effectiveFrom} onChange={(e) => set("effectiveFrom", e.target.value)}
                className={`${base} ${errors.effectiveFrom ? errCls : ""}`} />
              {errors.effectiveFrom && <p className="text-xs text-red-500 mt-0.5">{errors.effectiveFrom}</p>}
            </Field>
            <Field label="Effective To">
              <input type="date" value={form.effectiveTo} onChange={(e) => set("effectiveTo", e.target.value)}
                className={base} />
            </Field>
          </div>

          {/* Fee Plan + Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fee Plan" required>
              <SelectInput value={form.feePlan} onChange={(e) => set("feePlan", e.target.value)}
                options={FEE_PLANS} placeholder="— Select Fee Plan —" hasError={!!errors.feePlan} />
              {errors.feePlan && <p className="text-xs text-red-500 mt-0.5">{errors.feePlan}</p>}
            </Field>
            <Field label="Remarks">
              <input type="text" placeholder="Optional"
                value={form.remarks} onChange={(e) => set("remarks", e.target.value)}
                className={base} />
            </Field>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Allocating…</>
              : <><Save className="w-4 h-4" /> Allocate</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
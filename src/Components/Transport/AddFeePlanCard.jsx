import { useState, useEffect } from "react";
import { X, CreditCard, Save, Loader2, Tag, DollarSign, RefreshCw, Ruler, AlignLeft } from "lucide-react";

const ROUTES = [
  "— Generic / Distance Plan —",
  "RT-001 – Route A (North Zone)",
  "RT-002 – Route B (South Zone)",
];
const FREQUENCIES = ["MONTHLY", "QUARTERLY", "ANNUALLY", "ONE-TIME"];

const EMPTY = {
  planName: "",
  route: "",
  feeAmount: "",
  frequency: "MONTHLY",
  distanceSlab: "",
  description: "",
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

function SelectInput({ value, onChange, options, hasError }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${base} appearance-none pr-9 cursor-pointer ${hasError ? errCls : ""}`}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function AddFeePlanCard({ isOpen, onClose, onSave }) {
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
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.planName.trim()) e.planName  = "Plan name is required";
    if (!form.feeAmount)       e.feeAmount = "Fee amount is required";
    else if (isNaN(Number(form.feeAmount)) || Number(form.feeAmount) <= 0)
      e.feeAmount = "Enter a valid positive amount";
    if (!form.frequency)       e.frequency = "Frequency is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    onSave?.({ ...form, feeAmount: Number(form.feeAmount) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-fee-in">
        <style>{`
          @keyframes feeIn {
            from { opacity:0; transform:scale(0.95) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .animate-fee-in { animation: feeIn 0.2s ease-out forwards; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Create Fee Plan</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Plan Name + Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Plan Name" required>
              <input type="text" placeholder="e.g. Route C Monthly Fee"
                value={form.planName} onChange={(e) => set("planName", e.target.value)}
                className={`${base} ${errors.planName ? errCls : ""}`} />
              {errors.planName && <p className="text-xs text-red-500 mt-0.5">{errors.planName}</p>}
            </Field>

            <Field label="Route (optional)">
              <SelectInput
                value={form.route || ROUTES[0]}
                onChange={(e) => set("route", e.target.value === ROUTES[0] ? "" : e.target.value)}
                options={ROUTES}
              />
            </Field>
          </div>

          {/* Fee Amount + Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fee Amount" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
                <input type="number" min="0" step="0.01" placeholder="1200.00"
                  value={form.feeAmount} onChange={(e) => set("feeAmount", e.target.value)}
                  className={`${base} pl-7 ${errors.feeAmount ? errCls : ""}`} />
              </div>
              {errors.feeAmount && <p className="text-xs text-red-500 mt-0.5">{errors.feeAmount}</p>}
            </Field>

            <Field label="Frequency" required>
              <SelectInput
                value={form.frequency}
                onChange={(e) => set("frequency", e.target.value)}
                options={FREQUENCIES}
                hasError={!!errors.frequency}
              />
              {errors.frequency && <p className="text-xs text-red-500 mt-0.5">{errors.frequency}</p>}
            </Field>
          </div>

          {/* Distance Slab + Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Distance Slab (km)">
              <input type="text" placeholder="5.0 (optional)"
                value={form.distanceSlab} onChange={(e) => set("distanceSlab", e.target.value)}
                className={base} />
            </Field>

            <Field label="Description" required>
              <input type="text" placeholder="Optional description"
                value={form.description} onChange={(e) => set("description", e.target.value)}
                className={`${base} ${errors.description ? errCls : ""}`} />
              {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
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
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Plan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
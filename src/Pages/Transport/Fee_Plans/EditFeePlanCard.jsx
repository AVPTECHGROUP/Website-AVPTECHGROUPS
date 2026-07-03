import { useState, useEffect } from "react";
import { X, CreditCard, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getActiveRoutes, updateTransportFeePlan } from "../../../Api/Transport/TransportAPI";
import {
  FEE_FREQUENCY_OPTIONS,
  FEE_FREQUENCIES,
  SHARED_INPUT_STYLES,
  VALIDATION_MESSAGES,
  TOAST_MESSAGES,
  FEE_PLAN_UI_TEXT
} from "../../../Constants/StringConstants/TransportConstants";

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

function SelectInput({ value, onChange, children, hasError }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${SHARED_INPUT_STYLES.base} appearance-none pr-9 cursor-pointer ${hasError ? SHARED_INPUT_STYLES.errCls : ""}`}
      >
        {children}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function EditFeePlanCard({ isOpen, onClose, onSave, plan }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    if (isOpen && plan) {
      setForm({
        planName: plan.planName ?? "",
        routeId: plan.routeId ?? "",
        feeAmount: plan.amount ?? "",
        frequency: plan.frequency ?? FEE_FREQUENCIES.MONTHLY,
        distanceSlabKm: plan.distanceSlab && plan.distanceSlab !== "—"
          ? plan.distanceSlab.replace(" km", "")
          : "",
        description: plan.description ?? "",
      });
      setErrors({});
      fetchRoutes();
    }
  }, [isOpen, plan]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const data = await getActiveRoutes();
      setRoutes(data);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      toast.error(TOAST_MESSAGES.ROUTES_LOAD_FAIL);
    } finally {
      setLoadingRoutes(false);
    }
  };

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.planName?.trim()) e.planName = VALIDATION_MESSAGES.PLAN_NAME_REQ;
    if (!form.feeAmount) e.feeAmount = VALIDATION_MESSAGES.FEE_AMOUNT_REQ;
    else if (isNaN(Number(form.feeAmount)) || Number(form.feeAmount) <= 0)
      e.feeAmount = VALIDATION_MESSAGES.FEE_AMOUNT_INVALID;
    if (!form.frequency) e.frequency = VALIDATION_MESSAGES.FREQUENCY_REQ;
    if (!form.description?.trim()) e.description = VALIDATION_MESSAGES.DESCRIPTION_REQ;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        planName: form.planName.trim(),
        feeAmount: Number(form.feeAmount),
        frequency: form.frequency,
        description: form.description.trim(),
        ...(form.routeId && { routeId: Number(form.routeId) }),
        ...(form.distanceSlabKm && { distanceSlabKm: Number(form.distanceSlabKm) }),
      };
      await updateTransportFeePlan(plan.id, payload);
      toast.success(TOAST_MESSAGES.FEE_PLAN_UPDATE_SUCCESS);
      onSave?.();
      onClose();
    } catch (err) {
      console.error("Failed to update fee plan:", err);
      toast.error(TOAST_MESSAGES.FEE_PLAN_UPDATE_FAIL);
    } finally {
      setSaving(false);
    }
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
            <h2 className="text-lg font-bold text-gray-800">{FEE_PLAN_UI_TEXT.EDIT_MODAL_TITLE}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={FEE_PLAN_UI_TEXT.LBL_PLAN_NAME} required>
              <input type="text" placeholder={FEE_PLAN_UI_TEXT.PH_PLAN_NAME}
                value={form.planName ?? ""} onChange={(e) => set("planName", e.target.value)}
                className={`${SHARED_INPUT_STYLES.base} ${errors.planName ? SHARED_INPUT_STYLES.errCls : ""}`} />
              {errors.planName && <p className="text-xs text-red-500 mt-0.5">{errors.planName}</p>}
            </Field>

            <Field label={FEE_PLAN_UI_TEXT.LBL_ROUTE}>
              <SelectInput value={form.routeId ?? ""} onChange={(e) => set("routeId", e.target.value)}>
                <option value="">{FEE_PLAN_UI_TEXT.OPT_GENERIC_ROUTE}</option>
                {loadingRoutes
                  ? <option disabled>{FEE_PLAN_UI_TEXT.OPT_LOADING_ROUTES}</option>
                  : routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.routeName || r.name}</option>
                  ))
                }
              </SelectInput>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={FEE_PLAN_UI_TEXT.LBL_FEE_AMOUNT} required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">{FEE_PLAN_UI_TEXT.CURRENCY_SYMBOL}</span>
                <input type="number" min="0" step="0.01" placeholder={FEE_PLAN_UI_TEXT.PH_FEE_AMOUNT}
                  value={form.feeAmount ?? ""} onChange={(e) => set("feeAmount", e.target.value)}
                  className={`${SHARED_INPUT_STYLES.base} pl-7 ${errors.feeAmount ? SHARED_INPUT_STYLES.errCls : ""}`} />
              </div>
              {errors.feeAmount && <p className="text-xs text-red-500 mt-0.5">{errors.feeAmount}</p>}
            </Field>

            <Field label={FEE_PLAN_UI_TEXT.LBL_FREQUENCY} required>
              <SelectInput value={form.frequency ?? FEE_FREQUENCIES.MONTHLY} onChange={(e) => set("frequency", e.target.value)} hasError={!!errors.frequency}>
                {FEE_FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </SelectInput>
              {errors.frequency && <p className="text-xs text-red-500 mt-0.5">{errors.frequency}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={FEE_PLAN_UI_TEXT.LBL_DISTANCE_SLAB}>
              <input type="number" min="0" step="0.1" placeholder={FEE_PLAN_UI_TEXT.PH_DISTANCE_SLAB}
                value={form.distanceSlabKm ?? ""} onChange={(e) => set("distanceSlabKm", e.target.value)}
                className={SHARED_INPUT_STYLES.base} />
            </Field>

            <Field label={FEE_PLAN_UI_TEXT.LBL_DESCRIPTION} required>
              <input type="text" placeholder={FEE_PLAN_UI_TEXT.PH_DESCRIPTION}
                value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
                className={`${SHARED_INPUT_STYLES.base} ${errors.description ? SHARED_INPUT_STYLES.errCls : ""}`} />
              {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
            </Field>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {FEE_PLAN_UI_TEXT.BTN_CANCEL}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {FEE_PLAN_UI_TEXT.BTN_UPDATING}</>
              : <><Save className="w-4 h-4" /> {FEE_PLAN_UI_TEXT.BTN_UPDATE}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
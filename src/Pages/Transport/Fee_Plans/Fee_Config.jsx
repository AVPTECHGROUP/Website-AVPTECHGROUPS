import { useEffect, useState } from "react";
import { Settings, Check, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  getTransportbillingconfig,
  updateTransportbillingconfig,
} from "../../../Api/Transport/TransportAPI";

const DEFAULT_CONFIG = {
  enabled: true,
  showInCollectionModal: true,
  allowMonthlyAdjustments: true,
  allowFlatOverride: true,
  requireAdjustmentReason: true,
  adjustmentReasons: [
    "School Closure",
    "Partial Month (mid-period allocation)",
    "Discount / Concession",
    "Holiday Period",
  ],
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${checked ? "bg-blue-600" : "bg-gray-300"
        }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
}

function SettingRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Fee_Config() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getTransportbillingconfig();
        if (data) setConfig({ ...DEFAULT_CONFIG, ...data });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load transport billing config");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key) => (val) => setConfig((c) => ({ ...c, [key]: val }));

  const addReason = () => {
    const val = newReason.trim();
    if (!val) return;
    if (config.adjustmentReasons.includes(val)) return toast.error("Reason already exists");
    setConfig((c) => ({ ...c, adjustmentReasons: [...c.adjustmentReasons, val] }));
    setNewReason("");
  };

  const removeReason = (idx) => {
    setConfig((c) => ({ ...c, adjustmentReasons: c.adjustmentReasons.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    try {
      setSaving(true);
      await updateTransportbillingconfig(config);
      toast.success("Configuration saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">Loading configuration...</div>;
  }

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Transport Fee Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Configure transport fee collection, calculations, and payment settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Transport Settings</h3>
          <div className="mt-3">
            <SettingRow
              title="Enable Transport Fees"
              desc="Enable transport fee collection for the school."
              checked={config.enabled}
              onChange={set("enabled")}
            />
            <SettingRow
              title="Show During Fee Collection"
              desc="Display transport fees while collecting student fees."
              checked={config.showInCollectionModal}
              onChange={set("showInCollectionModal")}
            />
            <SettingRow
              title="Allow Monthly Fee Adjustments"
              desc="Allow monthly fee changes for individual students."
              checked={config.allowMonthlyAdjustments}
              onChange={set("allowMonthlyAdjustments")}
            />
            <SettingRow
              title="Allow Quarterly Fee Override"
              desc="Set one fee for the entire quarter instead of monthly fees."
              checked={config.allowFlatOverride}
              onChange={set("allowFlatOverride")}
            />
            <SettingRow
              title="Require Reason for Adjustments"
              desc="Require a reason when adjusting transport fees."
              checked={config.requireAdjustmentReason}
              onChange={set("requireAdjustmentReason")}
            />
          </div>
        </div>

        {/* Billing Behaviour */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4">Billing Settings</h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Billing Frequency
            </label>
            <select
              disabled
              value="MONTHLY"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed font-medium"
            >
              <option value="MONTHLY">Monthly (fixed — transport is always billed per month)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Fixed. Transport fees are always monthly. Quarter totals are derived by summing covered months.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Default Calculation Method
            </label>
            <select
              value={config.defaultCalcMode || "COMPUTED"}
              onChange={(e) => set("defaultCalcMode")(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-700 cursor-pointer"
            >
              <option value="COMPUTED">Calculated Total</option>
              <option value="FLAT">Flat — single quarter amount</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Used for new students by default.
            </p>
          </div>

          <div className="mb-2 flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Adjustment Reasons
            </label>
            <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-50 bg-gray-50/50">
              {config.adjustmentReasons.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 font-medium">
                  <span>{r}</span>
                  <button onClick={() => removeReason(i)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {config.adjustmentReasons.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-3">No reasons added yet.</p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addReason()}
                placeholder="Add adjustment reason..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              />
              <button
                onClick={addReason}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              These options appear when adjusting transport fees.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400">Changes apply to future fee adjustments only.</p>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
        >
          <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
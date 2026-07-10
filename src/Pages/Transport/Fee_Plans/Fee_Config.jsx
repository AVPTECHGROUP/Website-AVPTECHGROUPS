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
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[#1A1A2E]" : "bg-gray-300"
        }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"
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
          Transport Billing Config
        </h2>
        <p className="text-gray-500 text-sm mt-1">School-level settings for transport fee integration in fee management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Integration Settings</h3>
          <div className="mt-3">
            <SettingRow
              title="Enable Transport Fee Billing"
              desc="Show transport billing tab and include transport in collection"
              checked={config.enabled}
              onChange={set("enabled")}
            />
            <SettingRow
              title="Show in Fee Collection Modal"
              desc="Display transport section when collecting a student's academic fee"
              checked={config.showInCollectionModal}
              onChange={set("showInCollectionModal")}
            />
            <SettingRow
              title="Allow Per-Student Monthly Adjustments"
              desc="Let admin waive or reduce transport fee for a specific month"
              checked={config.allowMonthlyAdjustments}
              onChange={set("allowMonthlyAdjustments")}
            />
            <SettingRow
              title="Allow Flat Quarter Override"
              desc="Let admin set a single quarterly amount instead of month sum"
              checked={config.allowFlatOverride}
              onChange={set("allowFlatOverride")}
            />
            <SettingRow
              title="Require Reason for Adjustments"
              desc="Reason field is mandatory when overriding or waiving"
              checked={config.requireAdjustmentReason}
              onChange={set("requireAdjustmentReason")}
            />
          </div>
        </div>

        {/* Billing Behaviour */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4">Billing Behaviour</h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transport Billing Frequency</label>
            <select
              disabled
              value="MONTHLY"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              <option value="MONTHLY">Monthly (fixed — transport is always billed per month)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Fixed. Transport fees are always monthly. Quarter totals are derived by summing covered months.</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Calculation Mode (per student)</label>
            <select
              value={config.defaultCalcMode || "COMPUTED"}
              onChange={(e) => set("defaultCalcMode")(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="COMPUTED">Computed — sum of monthly amounts</option>
              <option value="FLAT">Flat — single quarter amount</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Defaults to Computed. Admin can switch individual students to Flat mode anytime.</p>
          </div>

          <div className="mb-2 flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adjustment Reason Options</label>
            <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-50">
              {config.adjustmentReasons.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700">
                  <span>{r}</span>
                  <button onClick={() => removeReason(i)} className="text-gray-300 hover:text-red-500">
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
                placeholder="Add a new reason..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={addReason}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">One per line. Shown as a dropdown when admin overrides a month.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400">Changes apply immediately to new adjustments</p>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#1A1A2E] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Config"}
        </button>
      </div>
    </div>
  );
}
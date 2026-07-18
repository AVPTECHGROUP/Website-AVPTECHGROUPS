import { useEffect, useState } from "react";
import { Settings, Check, Info } from "lucide-react";
import { toast } from "react-toastify";
import {
    getTransportbillingconfig,
    updateTransportbillingconfig,
} from "../../../Api/Transport/TransportAPI";

/* ---------------------------------------------------------------- */
/* Defaults & normalization                                        */
/* ---------------------------------------------------------------- */

export const DEFAULT_TRANSPORT_CONFIG = {
    enableTransportBilling: true,
    showInCollectionModal: true,
    allowMonthlyAdjustments: true,
    allowFlatOverride: true,
    requireAdjustmentReason: true,
    billingFrequency: "MONTHLY",
    defaultCalcMode: "COMPUTED",
    adjustmentReasonOptions: [
        "School Closure",
        "Partial Month (mid-period allocation)",
        "Discount / Concession",
        "Holiday Period",
    ],
};

/**
 * Normalizes whatever shape the backend returns into the field names this
 * UI uses. Falls back to legacy field names (enabled / adjustmentReasons)
 * documented in the original API reference, in case the backend hasn't
 * been updated to the new names yet.
 */
export function normalizeTransportConfig(raw) {
    if (!raw) return DEFAULT_TRANSPORT_CONFIG;
    return {
        enableTransportBilling: raw.enableTransportBilling ?? raw.enabled ?? DEFAULT_TRANSPORT_CONFIG.enableTransportBilling,
        showInCollectionModal: raw.showInCollectionModal ?? DEFAULT_TRANSPORT_CONFIG.showInCollectionModal,
        allowMonthlyAdjustments: raw.allowMonthlyAdjustments ?? DEFAULT_TRANSPORT_CONFIG.allowMonthlyAdjustments,
        allowFlatOverride: raw.allowFlatOverride ?? DEFAULT_TRANSPORT_CONFIG.allowFlatOverride,
        requireAdjustmentReason: raw.requireAdjustmentReason ?? DEFAULT_TRANSPORT_CONFIG.requireAdjustmentReason,
        billingFrequency: raw.billingFrequency ?? "MONTHLY",
        defaultCalcMode: raw.defaultCalcMode ?? DEFAULT_TRANSPORT_CONFIG.defaultCalcMode,
        adjustmentReasonOptions:
            (raw.adjustmentReasonOptions?.length ? raw.adjustmentReasonOptions : raw.adjustmentReasons) ||
            DEFAULT_TRANSPORT_CONFIG.adjustmentReasonOptions,
    };
}

/** Builds the payload sent to the API — includes legacy key aliases too,
 *  so this keeps working whichever field names the backend expects. */
function buildConfigPayload(config) {
    return {
        ...config,
        enabled: config.enableTransportBilling,
        adjustmentReasons: config.adjustmentReasonOptions,
    };
}

/* ---------------------------------------------------------------- */
/* Small UI helpers (same visual language as TransportBilling.jsx)  */
/* ---------------------------------------------------------------- */

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[#1A1A2E]" : "bg-gray-300"
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

/* ---------------------------------------------------------------- */
/* Main Component                                                   */
/* ---------------------------------------------------------------- */

export default function Transportbillingconfig() {
    const [config, setConfig] = useState(DEFAULT_TRANSPORT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getTransportbillingconfig();
                setConfig(normalizeTransportConfig(data));
            } catch (err) {
                console.error(err);
                toast.error("Failed to load transport billing config");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const set = (key) => (val) => setConfig((c) => ({ ...c, [key]: val }));

    const save = async () => {
        try {
            setSaving(true);
            await updateTransportbillingconfig(buildConfigPayload(config));
            toast.success("Config updated");
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
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    Transport Billing Config
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    School-level settings for transport fee integration in fee management.
                </p>
            </div>

            {/* Info banner — matches TransportBilling.jsx style */}
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                    These settings drive both the <b>Transport Billing</b> and <b>Collection View</b> tabs. Changes apply
                    immediately to new adjustments after saving.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Integration Settings */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-1">Integration Settings</h3>
                    <div className="mt-3">
                        <SettingRow
                            title="Enable Transport Fee Billing"
                            desc="Show transport billing tab and include transport in collection"
                            checked={config.enableTransportBilling}
                            onChange={set("enableTransportBilling")}
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
                            value={config.billingFrequency}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                            <option value="MONTHLY">Monthly (fixed — transport is always billed per month)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Fixed. Transport fees are always monthly. Quarter totals are derived by summing covered months.
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Calculation Mode (per student)</label>
                        <select
                            value={config.defaultCalcMode}
                            onChange={(e) => set("defaultCalcMode")(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="COMPUTED">Computed — sum of monthly amounts</option>
                            <option value="FLAT">Flat — single quarter amount</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Defaults to Computed. Admin can switch individual students to Flat mode anytime.
                        </p>
                    </div>

                    <div className="mb-2 flex-1 flex flex-col">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adjustment Reason Options</label>
                        <textarea
                            rows={5}
                            value={config.adjustmentReasonOptions.join("\n")}
                            onChange={(e) =>
                                set("adjustmentReasonOptions")(
                                    e.target.value.split("\n")
                                )
                            }
                            onBlur={(e) =>
                                set("adjustmentReasonOptions")(
                                    e.target.value.split("\n").map((r) => r.trim()).filter(Boolean)
                                )
                            }
                            placeholder={"School Closure\nPartial Month (mid-period allocation)\nDiscount / Concession"}
                            className="w-full flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">One per line. Shown as a dropdown when admin overrides a month or sets a flat override.</p>
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
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Bus, Download, RefreshCcw, Search, ChevronDown, X, Info,
  AlertTriangle, Pencil, Eye, Users, IndianRupee, PiggyBank,
  SlidersHorizontal, CreditCard, Check, Trash2, EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import { authFetch } from "../../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../../Constants/Endpoints";
import {
  getTransportBilling,
  generateTransportBilling,
  updateTransportFlatOverride,
  updateTransportMonthOverride,
  getActiveRoutes,
  payTransportBilling,
  getTransportbillingconfig,
} from "../../../Api/Transport/TransportAPI";
import { normalizeTransportConfig, DEFAULT_TRANSPORT_CONFIG } from "./Transportbillingconfig";

/* ---------------------------------------------------------------- */
/* Helpers                                                         */
/* ---------------------------------------------------------------- */

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STATUS_LABELS = {
  PENDING: "UNPAID",
  UNPAID: "UNPAID",
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  HAS_OVERRIDE: "HAS_OVERRIDE",
};

const statusLabel = (status) => STATUS_LABELS[status?.toUpperCase()] || status;

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  UNPAID: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  PARTIAL: "bg-blue-50 text-blue-700 border-blue-200",
  HAS_OVERRIDE: "bg-purple-50 text-purple-700 border-purple-200",
};

const STATUS_OPTIONS = ["All Statuses", "PENDING", "PAID", "PARTIAL", "HAS_OVERRIDE"];

const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Debit/Credit Card" },
  { value: "UPI", label: "UPI / QR Code" },
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "CHEQUE", label: "Cheque" },
];

/** Fetch fee periods directly */
const getFeePeriods = async () => {
  const res = await authFetch(API_ENDPOINTS.FEE_PERIODS, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch fee periods");
  return (await res.json()).data || [];
};

/** Build the list of month keys (1..3) present on a billing record */
const getMonthCols = (record) => {
  const cols = [];
  [1, 2, 3].forEach((n) => {
    if (record?.[`month${n}Month`]) {
      cols.push({
        idx: n,
        month: record[`month${n}Month`],
        year: record[`month${n}Year`],
        amount: record[`month${n}Amount`],
        adjusted: record[`month${n}Adjusted`],
        reason: record[`month${n}Reason`],
      });
    }
  });
  return cols;
};

/* ---------------------------------------------------------------- */
/* Main Component                                                  */
/* ---------------------------------------------------------------- */

export default function TransportBilling() {
  const [feePeriods, setFeePeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [routes, setRoutes] = useState([]);

  const [billing, setBilling] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const [routeFilter, setRouteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const [generateModal, setGenerateModal] = useState(false);
  const [flatModal, setFlatModal] = useState({ open: false, mode: "add", record: null });
  const [detailModal, setDetailModal] = useState({ open: false, record: null });
  const [payModal, setPayModal] = useState({ open: false, record: null });
  const [exporting, setExporting] = useState(false);

  const [config, setConfig] = useState(DEFAULT_TRANSPORT_CONFIG);

  const selectedPeriod = feePeriods.find((p) => p.id === selectedPeriodId);

  const reasonOptions = config.adjustmentReasonOptions?.length
    ? config.adjustmentReasonOptions
    : ["School Closure", "Partial Month (mid-period allocation)", "Discount / Concession", "Holiday Period"];

  /* ---------------- Load fee periods + routes + config once ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const rawConfig = await getTransportbillingconfig();
        const normalized = normalizeTransportConfig(rawConfig);

        // Merging raw backend configuration securely to prevent normalizer property drop drops
        setConfig({
          ...normalized,
          enabled: rawConfig?.enabled ?? true,
          showInCollectionModal: rawConfig?.showInCollectionModal ?? true,
          allowFlatOverride: rawConfig?.allowFlatOverride ?? normalized.allowFlatOverride ?? true,
          allowMonthlyAdjustments: rawConfig?.allowMonthlyAdjustments ?? normalized.allowMonthlyAdjustments ?? true,
          requireAdjustmentReason: rawConfig?.requireAdjustmentReason ?? normalized.requireAdjustmentReason ?? true
        });
      } catch (err) {
        console.error(err);
      }
      try {
        const periods = await getFeePeriods();
        setFeePeriods(periods);
        if (periods.length) setSelectedPeriodId(periods[0].id);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load fee periods");
      }
      try {
        const activeRoutes = await getActiveRoutes();
        setRoutes(activeRoutes);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ---------------- Load billing whenever filters change ---------------- */
  const fetchBilling = useCallback(async (page = 0) => {
    if (!selectedPeriodId || config.enabled === false) return;
    try {
      setLoading(true);
      const isCustomStatusFilter = statusFilter !== STATUS_OPTIONS[0] && statusFilter !== "HAS_OVERRIDE";

      const { billing: rows, pagination: p } = await getTransportBilling({
        feePeriodId: selectedPeriodId,
        page,
        size: 20,
        routeId: routeFilter || undefined,
        status: isCustomStatusFilter ? statusFilter : undefined,
      });
      setBilling(rows);
      setPagination(p);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transport billing");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodId, routeFilter, statusFilter, config.enabled]);

  useEffect(() => { fetchBilling(0); }, [fetchBilling]);

  const filtered = useMemo(() => {
    let rows = billing;
    const q = search.toLowerCase();

    if (q) {
      rows = rows.filter(
        (r) =>
          r.studentName?.toLowerCase().includes(q) ||
          r.admissionNumber?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== STATUS_OPTIONS[0]) {
      if (statusFilter === "HAS_OVERRIDE") {
        rows = rows.filter((r) => r.calcMode === "FLAT" || r.finalTotal !== r.computedTotal);
      } else {
        rows = rows.filter((r) => {
          const currentStatus = r.paymentStatus?.toUpperCase();
          const targetStatus = statusFilter.toUpperCase();

          if (targetStatus === "PENDING" || targetStatus === "UNPAID") {
            return currentStatus === "PENDING" || currentStatus === "UNPAID";
          }
          return currentStatus === targetStatus;
        });
      }
    }
    return rows;
  }, [billing, search, statusFilter]);

  /* ---------------- Stat Cards ---------------- */
  const stats = useMemo(() => {
    const total = billing.reduce((s, r) => s + Number(r.finalTotal || 0), 0);
    const adjustments = billing.reduce((s, r) => {
      const monthAdj = getMonthCols(r).filter((m) => m.adjusted).length;
      return s + monthAdj;
    }, 0);
    const saved = billing.reduce(
      (s, r) => s + Math.max(0, Number(r.computedTotal || 0) - Number(r.finalTotal || 0)),
      0
    );
    return { total, adjustments, saved };
  }, [billing]);

  /* ---------------- Actions ---------------- */
  const handleGenerate = async ({ feePeriodId, routeId }) => {
    try {
      const res = await generateTransportBilling({ feePeriodId, routeId: routeId || undefined });
      toast.success(
        `Generated: ${res?.data?.generated ?? 0}, Preserved: ${res?.data?.preserved ?? 0}, Skipped: ${res?.data?.skipped ?? 0}`
      );
      setGenerateModal(false);
      fetchBilling(0);
    } catch (err) {
      console.error("Backend Error Response:", err);
      const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message || "Failed to generate transport billing.";
      toast.error(errorMessage);
    }
  };

  const handleSaveFlat = async (billingId, flatAmount, reason) => {
    try {
      await updateTransportFlatOverride(billingId, {
        flatAmount: flatAmount === "" ? null : Number(flatAmount),
        reason,
      });
      toast.success(flatAmount === "" ? "Flat override cleared" : "Flat override saved");
      setFlatModal({ open: false, mode: "add", record: null });
      fetchBilling(pagination.page || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save flat override");
    }
  };

  const handleMonthOverride = async (billingId, month, year, adjustedAmount, reason) => {
    try {
      await updateTransportMonthOverride(billingId, { month, year, adjustedAmount, reason });
      toast.success("Month updated");
      fetchBilling(pagination.page || 0);
      setDetailModal((d) => ({ ...d, open: false }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update month");
    }
  };

  const handleExport = () => {
    try {
      setExporting(true);
      const rows = filtered.map((r) => {
        const months = getMonthCols(r);
        const row = {
          Student: r.studentName,
          "Admission No": r.admissionNumber,
          Class: `${r.className || ""} ${r.sectionName || ""}`.trim(),
          Route: r.routeName,
          Stop: r.stopName,
          "Base/Month": r.baseMonthlyAmount,
        };
        months.forEach((m) => {
          row[`${MONTH_NAMES[m.month]} ${m.year}`] = m.amount;
        });
        row["Calc Mode"] = r.calcMode;
        row["Computed Total"] = r.computedTotal;
        row["Final Total"] = r.finalTotal;
        row["Paid"] = r.paidAmount;
        row["Outstanding"] = r.outstandingAmount;
        row["Status"] = statusLabel(r.paymentStatus);
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transport Billing");
      const periodLabel = selectedPeriod?.name || selectedPeriod?.label || "period";
      XLSX.writeFile(wb, `Transport_Billing_${periodLabel}.xlsx`);
      toast.success("Exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  /* ─── 1st TOGGLE TRIGGER FUNCTIONALITY ─── */
  if (config.enabled === false) {
    return (
      <div className="w-full text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm px-6">
        <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <EyeOff className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-base font-bold text-gray-800">Transport Billing is Deactivated</h3>
        <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
          The transport fee billing system has been turned off via Configuration Settings. Please navigate to the Transport Billing Config panel to enable integration features.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bus className="w-6 h-6 text-indigo-600" />
            Transport Billing
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Per-student monthly transport fees, grouped by fee period. Click any month cell to waive or adjust.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting || !filtered.length}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setGenerateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Generate / Refresh
          </button>
        </div>
      </div>

      {/* ─── 2nd TOGGLE TRIGGER FUNCTIONALITY ─── */}
      {config.showInCollectionModal === false && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Fee Integration Notice:</span> Transport Ledger items are currently configured to be <b>Hidden</b> inside the core Student Fee Collection Modals. Dues will need to be collected independently.
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <CardComponent
          IconName={Users}
          keyName="students with transport"
          val={pagination.totalElements ?? billing.length}
          iconTxColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <CardComponent
          IconName={IndianRupee}
          keyName="period transport total"
          val={fmt(stats.total)}
          iconTxColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <CardComponent
          IconName={SlidersHorizontal}
          keyName="monthly adjustments"
          val={stats.adjustments}
          iconTxColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
        <CardComponent
          IconName={PiggyBank}
          keyName="amount saved / waived"
          val={fmt(stats.saved)}
          iconTxColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
      </div>

      {/* Filters Box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 border-b border-gray-50 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student name or admission no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedPeriodId || ""}
                onChange={(e) => setSelectedPeriodId(Number(e.target.value) || e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[160px] font-semibold text-gray-700"
              >
                <option value="" disabled>Select Fee Period</option>
                {feePeriods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name || p.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[140px]"
              >
                <option value="">All Routes</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.routeName || r.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[140px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "All Statuses" ? s : statusLabel(s)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {selectedPeriod && (
          <div className="px-4 sm:px-6 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            <span>Due date: <b className="text-gray-700">{selectedPeriod.dueDate || "—"}</b></span>
            {selectedPeriod.billingType && (
              <span className="bg-gray-200 px-2 py-0.5 rounded-full font-semibold text-gray-600 text-[10px]">
                {selectedPeriod.billingType}
              </span>
            )}
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden xl:block w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse table-auto min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Student", "Route · Stop", "Base/Mo", "Months", "Calc Mode", "Total Ledger", "Status", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <ListLoader rows={6} avatar={false} colSpanSet={8} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <Bus className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium">No billing records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const months = getMonthCols(r);
                  const isFlat = r.calcMode === "FLAT";
                  return (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition-colors align-top">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-900">{r.studentName}</p>
                        <p className="text-xs text-gray-400">#{r.admissionNumber} · {r.className} {r.sectionName}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {r.routeName}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{r.stopName}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{fmt(r.baseMonthlyAmount)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {months.map((m) => (
                            <button
                              key={m.idx}
                              disabled={isFlat || r.paymentStatus?.toUpperCase() === "PAID" || !config.allowMonthlyAdjustments}
                              onClick={() => setDetailModal({ open: true, record: r })}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap transition-colors ${isFlat
                                ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                                : m.amount === 0
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : m.adjusted
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                                }`}
                            >
                              {MONTH_NAMES[m.month]} : {fmt(m.amount)}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isFlat ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                          {isFlat ? "⊞ Flat" : "Σ Computed"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        <p className="font-bold text-gray-955 text-sm">{fmt(r.finalTotal)}</p>
                        {r.finalTotal !== r.computedTotal && (
                          <p className="text-[11px] text-gray-400 line-through">{fmt(r.computedTotal)}</p>
                        )}
                        <div className="space-y-0.5 mt-1 font-medium text-[11px]">
                          <p className="text-green-600">Paid: {fmt(r.paidAmount)}</p>
                          <p className="text-amber-600 font-semibold">Due: {fmt(r.outstandingAmount)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_STYLES[r.paymentStatus?.toUpperCase()] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {statusLabel(r.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {r.paymentStatus?.toUpperCase() !== "PAID" && (
                            <button
                              onClick={() => setPayModal({ open: true, record: r })}
                              className="inline-flex items-center cursor-pointer gap-1 text-xs font-bold bg-green-600 text-white hover:bg-green-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay
                            </button>
                          )}
                          {/* ─── 4th TOGGLE TRIGGER FUNCTIONALITY ─── */}
                          {config.allowFlatOverride !== false && (
                            <button
                              onClick={() =>
                                setFlatModal({
                                  open: true,
                                  mode: r.flatOverrideAmount != null ? "edit" : "add",
                                  record: r,
                                })
                              }
                              className="inline-flex items-center cursor-pointer gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              {r.flatOverrideAmount != null ? (
                                <><Pencil className="w-3.5 h-3.5" /> Edit Flat</>
                              ) : (
                                <><CreditCard className="w-3.5 h-3.5" /> Flat</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setDetailModal({ open: true, record: r })}
                            className="inline-flex items-center cursor-pointer gap-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="xl:hidden divide-y divide-gray-100 bg-gray-50/30">
          {loading ? (
            <MobileSkeletonRows rows={4} />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 bg-white">
              <Bus className="w-10 h-10 mx-auto text-gray-200 mb-3" />
              <p className="font-medium text-sm">No billing records found</p>
            </div>
          ) : (
            filtered.map((r) => {
              const months = getMonthCols(r);
              const isFlat = r.calcMode === "FLAT";
              return (
                <div key={r.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{r.studentName}</p>
                      <p className="text-xs text-gray-400">#{r.admissionNumber} · {r.routeName}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[r.paymentStatus?.toUpperCase()] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {statusLabel(r.paymentStatus)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {months.map((m) => (
                      <span key={m.idx} className={`px-2 py-1 rounded-lg text-xs font-semibold border ${isFlat ? "bg-gray-50 text-gray-400 border-gray-100" : m.amount === 0 ? "bg-red-50 text-red-600 border-red-200" : m.adjusted ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {MONTH_NAMES[m.month]} : {fmt(m.amount)}
                      </span>
                    ))}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-gray-400 font-medium">Total Bill</p>
                      <p className="font-bold text-gray-900 mt-0.5">{fmt(r.finalTotal)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Paid</p>
                      <p className="font-bold text-green-600 mt-0.5">{fmt(r.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Outstanding</p>
                      <p className="font-bold text-amber-600 mt-0.5">{fmt(r.outstandingAmount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    {r.paymentStatus?.toUpperCase() !== "PAID" && (
                      <button
                        onClick={() => setPayModal({ open: true, record: r })}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-green-600 text-white hover:bg-green-700 px-2.5 py-1.5 rounded-lg shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay
                      </button>
                    )}
                    {/* ─── 4th TOGGLE TRIGGER FUNCTIONALITY (Mobile View) ─── */}
                    {config.allowFlatOverride !== false && (
                      <button
                        onClick={() => setFlatModal({ open: true, mode: r.flatOverrideAmount != null ? "edit" : "add", record: r })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg"
                      >
                        {r.flatOverrideAmount != null ? <><Pencil className="w-3.5 h-3.5" /> Edit Flat</> : <><CreditCard className="w-3.5 h-3.5" /> Flat</>}
                      </button>
                    )}
                    <button
                      onClick={() => setDetailModal({ open: true, record: r })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
            <p className="text-xs text-gray-400 font-medium">
              Page {(pagination.page ?? 0) + 1} of {pagination.totalPages} · {pagination.totalElements} total
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchBilling(Math.max(0, (pagination.page ?? 0) - 1))}
                disabled={pagination.first}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronDown className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button
                onClick={() => fetchBilling((pagination.page ?? 0) + 1)}
                disabled={pagination.last}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals Container */}
      {generateModal && (
        <GenerateBillingModal
          feePeriods={feePeriods}
          routes={routes}
          defaultPeriodId={selectedPeriodId}
          onClose={() => setGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}

      {flatModal.open && (
        <FlatOverrideModal
          record={flatModal.record}
          onClose={() => setFlatModal({ open: false, mode: "add", record: null })}
          onSave={handleSaveFlat}
          requireReason={config.requireAdjustmentReason}
        />
      )}

      {detailModal.open && (
        <BillingDetailModal
          record={detailModal.record}
          onClose={() => setDetailModal({ open: false, record: null })}
          onOpenFlat={(r) => {
            setDetailModal({ open: false, record: null });
            setFlatModal({ open: true, mode: r.flatOverrideAmount != null ? "edit" : "add", record: r });
          }}
          onMonthOverride={handleMonthOverride}
          reasonOptions={reasonOptions}
          requireReason={config.requireAdjustmentReason}
          allowMonthlyAdjustments={config.allowMonthlyAdjustments}
          allowFlatOverride={config.allowFlatOverride !== false}
        />
      )}

      {payModal.open && (
        <PayTransportBillingModal
          record={payModal.record}
          onClose={() => setPayModal({ open: false, record: null })}
          onSuccess={() => {
            setPayModal({ open: false, record: null });
            fetchBilling(pagination.page || 0);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Shared Modals Components                                         */
/* ---------------------------------------------------------------- */

function PayTransportBillingModal({ record, onClose, onSuccess }) {
  const defaultAmount = record?.outstandingAmount ?? record?.finalTotal ?? "";
  const [amount, setAmount] = useState(defaultAmount);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePaySubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      return toast.error("Please enter a valid payment amount.");
    }
    if (record?.outstandingAmount && Number(amount) > record.outstandingAmount) {
      return toast.error(`Payment amount cannot exceed remaining outstanding balance of ${fmt(record.outstandingAmount)}`);
    }

    try {
      setSubmitting(true);
      await payTransportBilling(record.id, {
        amount: Number(amount),
        paymentMode,
        paymentDate,
        referenceNo: referenceNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      toast.success("Payment recorded successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to submit transport fee collection record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Collect Transport Fee — ${record.studentName}`} icon={CreditCard}>
      <div className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-2 gap-4 text-sm border border-gray-100">
        <div>
          <p className="text-gray-400 text-xs uppercase font-medium">Admission Number</p>
          <p className="font-bold text-gray-800 mt-0.5">#{record.admissionNumber}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase font-medium">Route Details</p>
          <p className="font-bold text-indigo-700 mt-0.5 truncate">{record.routeName}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase font-medium">Billable Total</p>
          <p className="font-bold text-gray-800 mt-0.5">{fmt(record.finalTotal)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase font-medium">Current Paid Amount</p>
          <p className="font-bold text-green-700 mt-0.5">{fmt(record.paidAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Collection Amount (₹) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1200"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Mode *</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer font-medium text-gray-700"
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Date *</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference / Txn Number</label>
          <input
            type="text"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="e.g. Chq / UTID code (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks / Office Notes</label>
        <input
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add situational notes here (optional)"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold cursor-pointer text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePaySubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 cursor-pointer px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow transition-colors disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> {submitting ? "Processing..." : "Confirm Payment"}
        </button>
      </div>
    </ModalShell>
  );
}

function GenerateBillingModal({ feePeriods, routes, defaultPeriodId, onClose, onGenerate }) {
  const [feePeriodId, setFeePeriodId] = useState(defaultPeriodId || "");
  const [routeId, setRouteId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const period = feePeriods.find((p) => String(p.id) === String(feePeriodId));
  const route = routes.find((r) => String(r.id) === String(routeId));

  const submit = async () => {
    if (!feePeriodId) return toast.error("Please select a fee period");
    if (!routeId) return toast.error("Please select a route");
    setSubmitting(true);
    await onGenerate({ feePeriodId, routeId });
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title="Generate Transport Billing" icon={RefreshCcw}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Period *</label>
          <select
            value={feePeriodId}
            onChange={(e) => setFeePeriodId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-700"
          >
            <option value="">Select period</option>
            {feePeriods.map((p) => (
              <option key={p.id} value={p.id}>{p.name || p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Route *</label>
          <select
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-700"
          >
            <option value="">Select a Route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.routeName || r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2.5 text-sm border border-gray-100">
        <p className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">Summary Details</p>
        <Row label="Target Fee Period" value={period?.name || period?.label || "—"} colorClass="text-indigo-700 font-semibold" />
        <Row label="Selected Route" value={route ? `${route.routeName || route.name}` : "—"} colorClass="text-blue-700 font-semibold" />
        <Row label="Base Rate Source" value="Predefined Stop Fee Allocation" colorClass="text-gray-700" />
        <Row label="Preserve Custom Overrides" value="✓ Yes (Will keep modified records)" colorClass="text-green-600 font-medium" />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2.5 cursor-pointer text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={submitting || !feePeriodId || !routeId}
          className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60 transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" /> {submitting ? "Generating..." : "Generate Billing"}
        </button>
      </div>
    </ModalShell>
  );
}

function FlatOverrideModal({ record, onClose, onSave, requireReason = true }) {
  const isEdit = record?.flatOverrideAmount != null;

  const FRONTEND_REASONS = [
    "Management Discretionary Concession",
    "Special Sibling/Staff Discount",
    "Mid-Quarter Route Allocation Adjustment",
    "Seasonal Weather / School Closure Waiver",
    "Custom Fixed Corporate Billing Structure"
  ];

  const [amount, setAmount] = useState(isEdit ? record.flatOverrideAmount : "");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && record.flatOverrideReason) {
      if (FRONTEND_REASONS.includes(record.flatOverrideReason)) {
        setReason(record.flatOverrideReason);
      } else {
        setReason("Other");
        setCustomReason(record.flatOverrideReason);
      }
    } else {
      setReason(FRONTEND_REASONS[0]);
    }
  }, [isEdit, record]);

  const save = async () => {
    if (amount === "") return toast.error("Please enter a flat override amount");

    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (requireReason && !finalReason) {
      return toast.error("Please select or enter a valid reason for this override");
    }

    setSubmitting(true);
    await onSave(record.id, amount, finalReason);
    setSubmitting(false);
  };

  const clearOverride = async () => {
    setSubmitting(true);
    await onSave(record.id, "", "Revert to standard computed billing structure");
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title={`Flat Quarter Override — ${record.studentName}`} icon={CreditCard}>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-900">Important Operational Notice</p>
          <p className="text-xs text-amber-800 mt-0.5">
            Setting a flat override <b>disables month-level editing</b> for this student. The flat value explicitly replaces the calculated sum total.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 grid grid-cols-2 gap-4 text-sm shadow-inner">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Computed Total (Sum)</p>
          <p className="font-extrabold text-gray-900 text-base mt-0.5">{fmt(record.computedTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Current Lock Status</p>
          <p className={`font-extrabold text-base mt-0.5 ${isEdit ? "text-purple-600" : "text-gray-500"}`}>
            {isEdit ? fmt(record.flatOverrideAmount) : "None (Computed)"}
          </p>
        </div>
      </div>

      {isEdit && (
        <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-red-955">Reset to Default Calculation</h4>
            <p className="text-xs text-red-700">Remove flat lock fee and recalculate row via individual standard monthly tiers.</p>
          </div>
          <button
            type="button"
            onClick={clearOverride}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" /> Revert to Computed
          </button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Flat Override Amount (₹) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 3500"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Reason Selection *</label>
          <div className="relative">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer text-gray-700 font-medium transition-all appearance-none"
            >
              {FRONTEND_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="Other">Other / Custom Exception</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {reason === "Other" && (
          <div className="animate-fadeIn">
            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">Specify Custom Reason *</label>
            <input
              type="text"
              required
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter context reason details manually..."
              className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-xl bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all font-medium"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Contextual Office Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type administrative context tracking notes..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold cursor-pointer text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={submitting}
          className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-sm active:scale-[0.98]"
        >
          <Check className="w-4 h-4" /> {submitting ? "Saving changes..." : "Save Flat Override"}
        </button>
      </div>
    </ModalShell>
  );
}

function BillingDetailModal({
  record, onClose, onOpenFlat, onMonthOverride,
  reasonOptions,
  requireReason = true,
  allowMonthlyAdjustments = true,
  allowFlatOverride = true,
}) {
  const [editingMonth, setEditingMonth] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(reasonOptions[0] || "");
  const months = getMonthCols(record);
  const isFlat = record.calcMode === "FLAT";

  const startEdit = (m) => {
    setEditingMonth(m.idx);
    setAmount(m.amount);
    setReason(reasonOptions[0] || "");
  };

  const saveMonth = async (m) => {
    if (requireReason && !reason) return toast.error("Select a reason");
    await onMonthOverride(record.id, m.month, m.year, amount === "" ? null : Number(amount), reason);
    setEditingMonth(null);
  };

  return (
    <ModalShell onClose={onClose} title={`Transport Billing Detail — ${record.studentName}`} icon={Bus}>
      <div className="bg-blue-50 rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Student</p>
          <p className="font-bold text-gray-900">{record.studentName} · #{record.admissionNumber}</p>
          <p className="text-xs text-gray-400">{record.className} {record.sectionName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Allocation</p>
          <p className="font-bold text-gray-900">{record.routeName}</p>
          <p className="text-xs text-gray-400">{record.stopName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Base Rate</p>
          <p className="font-bold text-green-700">{fmt(record.baseMonthlyAmount)}/mo</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Status</p>
          <p className="font-bold text-gray-900">{statusLabel(record.paymentStatus)}</p>
          <p className="text-xs text-gray-400">{isFlat ? "⊞ Flat" : "Σ Computed"}</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Monthly Breakdown</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {months.map((m) => (
          <div key={m.idx} className="border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{MONTH_NAMES[m.month]} {m.year}</p>
            {editingMonth === m.idx ? (
              <div className="space-y-2">
                <input
                  type="number"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-center px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg"
                >
                  {!requireReason && <option value="">No reason</option>}
                  {reasonOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => saveMonth(m)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg">Save</button>
                  <button onClick={() => setEditingMonth(null)} className="text-xs font-semibold text-gray-500 hover:bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-2">{fmt(m.amount)}</p>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${m.adjusted ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                  {m.adjusted ? (m.reason || "Adjusted") : "Base rate"}
                </span>
                <button
                  disabled={isFlat || record.paymentStatus?.toUpperCase() === "PAID" || !allowMonthlyAdjustments}
                  onClick={() => startEdit(m)}
                  className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Pencil className="w-3.5 h-3.5" /> Override {MONTH_NAMES[m.month]}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-6 border border-gray-100">
        <Row label="Computed sum of months" value={fmt(record.computedTotal)} />
        <Row label="Flat override adjustment" value={record.flatOverrideAmount != null ? fmt(record.flatOverrideAmount) : "None — using computed"} />
        <div className="border-t border-gray-200 my-2" />
        <Row label="Final total billable amount" value={fmt(record.finalTotal)} colorClass="text-gray-900 font-bold" />
        <Row label="Paid amount collected" value={fmt(record.paidAmount)} colorClass="text-green-600 font-bold" />
        <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
          <span className="font-bold text-gray-800">Net Outstanding Balance</span>
          <span className="font-bold text-amber-600 text-lg">{fmt(record.outstandingAmount)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {allowFlatOverride ? (
          <button
            onClick={() => onOpenFlat(record)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl"
          >
            <CreditCard className="w-4 h-4" /> Set Flat Override
          </button>
        ) : <span />}
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold cursor-pointer border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
}

function Row({ label, value, colorClass = "text-gray-800" }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

function MobileSkeletonRows({ rows = 4 }) {
  return (
    <div className="bg-white divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 space-y-3 animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-2/5 bg-gray-200 rounded" />
              <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-9 bg-gray-50 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function ModalShell({ title, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-indigo-600" />} {title}
          </h3>
          <button onClick={onClose} className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
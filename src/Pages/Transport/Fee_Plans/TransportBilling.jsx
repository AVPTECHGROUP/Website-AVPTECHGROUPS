import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Bus, Download, RefreshCcw, Search, ChevronDown, X, Info,
  AlertTriangle, Pencil, Eye, Users, IndianRupee, PiggyBank,
  SlidersHorizontal, CreditCard, Check, Trash2, EyeOff,
  HandCoins, ChevronsLeft, ChevronsRight, Sparkles, Calendar,
  CheckSquare, Square, Layers,
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
  bulkUpdateTransportMonthOverride,
  getActiveRoutes,
  payTransportBilling,
  getTransportbillingconfig,
} from "../../../Api/Transport/TransportAPI";
import { normalizeTransportConfig, DEFAULT_TRANSPORT_CONFIG } from "./Transportbillingconfig";

/* ---------------------------------------------------------------- */
/* Helpers & Constants                                             */
/* ---------------------------------------------------------------- */

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Valid default reasons for adjusting monthly & total transport fees */
const DEFAULT_ADJUSTMENT_REASONS = [
  "Sibling Concession",
  "Staff Ward Concession",
  "Mid-Session Joining / Pro-rata Charge",
  "One-Way Transport Exemption",
  "Vacation / Weather Closure Waiver",
  "Stop Distance Recalculation",
  "Management Discretionary Waiver",
  "Scholarship / Financial Assistance",
  "Other",
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

const STATUS_OPTIONS = ["All Status", "PENDING", "PAID", "PARTIAL", "HAS_OVERRIDE"];

/* Backend exact match enum options */
const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "ONLINE", label: "Online" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "DD", label: "Demand Draft (DD)" },
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

/** Whether a billing record currently has ANY kind of adjustment applied */
const hasAdjustment = (r) => {
  const hasFlat = r.calcMode === "FLAT" || r.flatOverrideAmount != null;
  const hasMonthAdj = getMonthCols(r).some((m) => m.adjusted);
  return hasFlat || hasMonthAdj;
};

/** Concession amount for a record */
const concessionAmount = (r) => {
  const computed = Number(r.computedTotal || 0);
  const final = Number(r.finalTotal || 0);
  return computed > final ? computed - final : 0;
};

const isPaid = (r) => r.paymentStatus?.toUpperCase() === "PAID";

/* ---------------------------------------------------------------- */
/* Main Component                                                   */
/* ---------------------------------------------------------------- */

export default function TransportBilling() {
  const [feePeriods, setFeePeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [routes, setRoutes] = useState([]);

  const [billing, setBilling] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(false);

  const [routeFilter, setRouteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  /* Selection for Bulk Operations */
  const [selectedIds, setSelectedIds] = useState([]);

  /* Modals State */
  const [generateModal, setGenerateModal] = useState(false);
  const [flatModal, setFlatModal] = useState({ open: false, mode: "add", record: null });
  const [monthModal, setMonthModal] = useState({ open: false, record: null, monthObj: null });
  const [bulkMonthModal, setBulkMonthModal] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, record: null });
  const [payModal, setPayModal] = useState({ open: false, record: null });
  const [exporting, setExporting] = useState(false);

  const [config, setConfig] = useState(DEFAULT_TRANSPORT_CONFIG);

  const selectedPeriod = feePeriods.find((p) => String(p.id) === String(selectedPeriodId));

  /* Filter out dummy backend 'string' values and fallback to standard reasons */
  const reasonOptions = useMemo(() => {
    const rawOpts = config.adjustmentReasonOptions;
    if (!Array.isArray(rawOpts)) return DEFAULT_ADJUSTMENT_REASONS;

    const sanitized = rawOpts.filter(
      (r) => typeof r === "string" && r.trim() && r.trim().toLowerCase() !== "string"
    );

    return sanitized.length > 0 ? sanitized : DEFAULT_ADJUSTMENT_REASONS;
  }, [config.adjustmentReasonOptions]);

  /* ---------------- 1. Load config, fee periods + routes once ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const rawConfig = await getTransportbillingconfig();
        const normalized = normalizeTransportConfig(rawConfig);

        setConfig({
          ...normalized,
          enabled: rawConfig?.enabled ?? true,
          showInCollectionModal: rawConfig?.showInCollectionModal ?? true,
          allowFlatOverride: rawConfig?.allowFlatOverride ?? normalized.allowFlatOverride ?? true,
          allowMonthlyAdjustments: rawConfig?.allowMonthlyAdjustments ?? normalized.allowMonthlyAdjustments ?? true,
          requireAdjustmentReason: rawConfig?.requireAdjustmentReason ?? normalized.requireAdjustmentReason ?? true,
          adjustmentReasonOptions: rawConfig?.adjustmentReasonOptions ?? normalized.adjustmentReasonOptions,
        });
      } catch (err) {
        console.error(err);
      }

      try {
        const periods = await getFeePeriods();
        setFeePeriods(periods);
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

  /* ---------------- 2. Load billing whenever filters change ---------------- */
  const fetchBilling = useCallback(async (page = 0) => {
    if (!selectedPeriodId || config.enabled === false) {
      setBilling([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setSelectedIds([]); // reset selection
      const isCustomStatusFilter = statusFilter !== STATUS_OPTIONS[0] && statusFilter !== "HAS_OVERRIDE";

      const { billing: rows, pagination: p } = await getTransportBilling({
        feePeriodId: selectedPeriodId,
        page,
        size: 20,
        routeId: routeFilter || undefined,
        status: isCustomStatusFilter ? statusFilter : undefined,
      });

      setBilling(rows || []);
      setPagination(p || { page: 0, totalPages: 1, totalElements: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transport billing");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodId, routeFilter, statusFilter, config.enabled]);

  useEffect(() => {
    fetchBilling(0);
  }, [fetchBilling]);

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

  /* Selection Handlers */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ---------------- Stat Cards ---------------- */
  const stats = useMemo(() => {
    const total = billing.reduce((s, r) => s + Number(r.finalTotal || 0), 0);

    let adjustments = 0;
    let saved = 0;

    billing.forEach((r) => {
      if (hasAdjustment(r)) adjustments += 1;
      saved += concessionAmount(r);
    });

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
      toast.success(flatAmount === "" ? "Fee override cleared" : "Adjusted fee saved");
      setFlatModal({ open: false, mode: "add", record: null });
      fetchBilling(pagination.page || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save adjusted fee");
    }
  };

  const handleMonthOverride = async (billingId, month, year, adjustedAmount, reason) => {
    try {
      await updateTransportMonthOverride(billingId, { month, year, adjustedAmount, reason });
      toast.success("Month fee updated successfully");
      fetchBilling(pagination.page || 0);
      setMonthModal({ open: false, record: null, monthObj: null });
      setDetailModal({ open: false, record: null });
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update month override");
    }
  };

  const handleBulkMonthOverride = async (payload) => {
    try {
      const res = await bulkUpdateTransportMonthOverride(payload);
      const { succeeded, skipped, failed, failures } = res.data || {};

      if (failed > 0) {
        toast.warn(`Updated: ${succeeded}, Failed: ${failed}. ${failures?.[0]?.reason || ''}`);
      } else {
        toast.success(`Successfully updated ${succeeded} billing record(s)!`);
      }

      fetchBilling(pagination.page || 0);
      setSelectedIds([]);
      setBulkMonthModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to apply bulk month override");
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
        row["Concession"] = concessionAmount(r);
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
    <div className="w-full max-w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bus className="w-6 h-6 text-indigo-600" />
            Transport Fee Collection
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            View and manage transport fees for the selected billing period.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting || !filtered.length}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setGenerateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" /> Generate Fees
          </button>
        </div>
      </div>

      {config.showInCollectionModal === false && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl px-4 py-3 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Fee Integration Notice:</span> Transport Ledger items are currently configured to be <b>Hidden</b> inside the core Student Fee Collection Modals. Dues will need to be collected independently.
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CardComponent
          IconName={Users}
          keyName="Transport Students"
          val={pagination.totalElements ?? billing.length}
          iconTxColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <CardComponent
          IconName={IndianRupee}
          keyName="Total Fees"
          val={fmt(stats.total)}
          iconTxColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <CardComponent
          IconName={SlidersHorizontal}
          keyName="Fee Adjustments"
          val={stats.adjustments}
          iconTxColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
        <CardComponent
          IconName={HandCoins}
          keyName="Fee Concessions"
          val={fmt(stats.saved)}
          iconTxColor="text-yellow-600"
          iconBgColor="bg-yellow-50"
        />
      </div>

      {/* Filters & Data View Box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Responsive Filters Layout */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row items-center gap-3">

          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Student Name or Admission No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800 placeholder-gray-400 font-medium transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto lg:flex lg:items-center shrink-0">
            {/* Fee Period Dropdown */}
            <div className="relative w-full lg:w-44">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="appearance-none w-full pl-3.5 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer font-semibold text-gray-700 truncate"
              >
                <option value="">Fee Period</option>
                {feePeriods.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name || p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Route Dropdown */}
            <div className="relative w-full lg:w-40">
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="appearance-none w-full pl-3.5 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer font-medium text-gray-700 truncate"
              >
                <option value="">All Routes</option>
                {routes.map((r) => (
                  <option key={r.id} value={String(r.id)}>{r.routeName || r.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full lg:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full pl-3.5 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer font-medium text-gray-700 truncate"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "All Status" ? s : statusLabel(s)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Rows Action Bar */}
        {selectedIds.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 animate-fadeIn">
            <span className="font-bold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              {selectedIds.length} student record{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkMonthModal(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" /> Bulk Month Override
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-gray-500 hover:text-gray-700 font-semibold px-2 py-1"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

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

        {/* Desktop Table View */}
        <div className="hidden xl:block w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse table-auto min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                {["Student", "Route & Stop", "Monthly Fee", "Fee Summary", "Payment Status", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <ListLoader rows={6} avatar={false} colSpanSet={9} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400">
                    <Bus className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium">
                      {!selectedPeriodId
                        ? "Select a Fee Period to view billing records."
                        : "No transport billing records found for this period."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const months = getMonthCols(r);
                  const isFlat = r.calcMode === "FLAT";
                  const concession = concessionAmount(r);
                  const paid = isPaid(r);
                  const isSelected = selectedIds.includes(r.id);

                  return (
                    <tr key={r.id} className={`hover:bg-blue-50/30 transition-colors align-top ${isSelected ? "bg-blue-50/20" : ""}`}>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(r.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
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
                      <td className="px-4 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {months.map((m) => (
                            <button
                              key={m.idx}
                              disabled={paid || !config.allowMonthlyAdjustments}
                              onClick={() => setMonthModal({ open: true, record: r, monthObj: m })}
                              title="Click to override month transport fee"
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${m.amount === 0
                                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer"
                                  : m.adjusted
                                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                                }`}
                            >
                              {MONTH_NAMES[m.month]} : {fmt(m.amount)}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        <p className="font-bold text-gray-900 text-sm">{fmt(r.finalTotal)}</p>
                        {r.finalTotal !== r.computedTotal && (
                          <p className="text-[11px] text-gray-400 line-through">{fmt(r.computedTotal)}</p>
                        )}
                        {concession > 0 && (
                          <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 mt-0.5">
                            <Sparkles className="w-3 h-3" /> Concession: {fmt(concession)}
                          </p>
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
                          {!paid && (
                            <button
                              onClick={() => setPayModal({ open: true, record: r })}
                              className="inline-flex items-center cursor-pointer gap-1 text-xs font-bold bg-green-600 text-white hover:bg-green-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Collect Fee
                            </button>
                          )}
                          {!paid && config.allowMonthlyAdjustments && (
                            <button
                              onClick={() => setMonthModal({ open: true, record: r, monthObj: months[0] || null })}
                              className="inline-flex items-center cursor-pointer gap-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Month Override
                            </button>
                          )}
                          {config.allowFlatOverride !== false && !paid && (
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
                                <><Pencil className="w-3.5 h-3.5" /> Edit Flat Fee</>
                              ) : (
                                <><CreditCard className="w-3.5 h-3.5" /> Flat Fee</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setDetailModal({ open: true, record: r })}
                            className="inline-flex items-center cursor-pointer gap-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
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

        {/* Mobile & Tablet Card View */}
        <div className="xl:hidden p-4 space-y-4 bg-gray-50/50">
          {loading ? (
            <MobileSkeletonRows rows={4} />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
              <Bus className="w-10 h-10 mx-auto text-gray-200 mb-3" />
              <p className="font-medium text-sm">
                {!selectedPeriodId
                  ? "Select a Fee Period to view billing records."
                  : "No transport billing records found for this period."}
              </p>
            </div>
          ) : (
            filtered.map((r) => {
              const months = getMonthCols(r);
              const concession = concessionAmount(r);
              const paid = isPaid(r);
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-md hover:shadow-lg transition-all space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-base truncate">{r.studentName}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        #{r.admissionNumber} {r.className ? `· ${r.className} ${r.sectionName || ""}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {r.routeName}
                        </span>
                        {r.stopName && (
                          <span className="text-xs text-gray-500 font-medium">
                            Stop: {r.stopName}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${STATUS_STYLES[r.paymentStatus?.toUpperCase()] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {statusLabel(r.paymentStatus)}
                    </span>
                  </div>

                  {months.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {months.map((m) => (
                        <button
                          key={m.idx}
                          disabled={paid || !config.allowMonthlyAdjustments}
                          onClick={() => setMonthModal({ open: true, record: r, monthObj: m })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap transition-colors ${m.amount === 0
                              ? "bg-red-50 text-red-600 border-red-200 cursor-pointer"
                              : m.adjusted
                                ? "bg-amber-50 text-amber-700 border-amber-200 cursor-pointer"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 cursor-pointer"
                            }`}
                        >
                          {MONTH_NAMES[m.month]} : {fmt(m.amount)}
                        </button>
                      ))}
                    </div>
                  )}

                  {concession > 0 && (
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600">
                      <Sparkles className="w-3.5 h-3.5" /> Concession applied: {fmt(concession)}
                    </p>
                  )}

                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-gray-400 font-medium">Total Bill</p>
                      <p className="font-bold text-gray-900 mt-0.5 text-sm">{fmt(r.finalTotal)}</p>
                      {r.finalTotal !== r.computedTotal && (
                        <p className="text-[10px] text-gray-400 line-through">{fmt(r.computedTotal)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Paid</p>
                      <p className="font-bold text-green-600 mt-0.5 text-sm">{fmt(r.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Outstanding</p>
                      <p className="font-bold text-amber-600 mt-0.5 text-sm">{fmt(r.outstandingAmount)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-gray-100">
                    {!paid && (
                      <button
                        onClick={() => setPayModal({ open: true, record: r })}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Collect Fee
                      </button>
                    )}
                    {!paid && config.allowMonthlyAdjustments && (
                      <button
                        onClick={() => setMonthModal({ open: true, record: r, monthObj: months[0] || null })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Month Override
                      </button>
                    )}
                    {config.allowFlatOverride !== false && !paid && (
                      <button
                        onClick={() => setFlatModal({ open: true, mode: r.flatOverrideAmount != null ? "edit" : "add", record: r })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        {r.flatOverrideAmount != null ? <><Pencil className="w-3.5 h-3.5" /> Edit Flat Fee</> : <><CreditCard className="w-3.5 h-3.5" /> Flat Fee</>}
                      </button>
                    )}
                    <button
                      onClick={() => setDetailModal({ open: true, record: r })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && (
          <Pagination pagination={pagination} onPageChange={fetchBilling} />
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
          reasonOptions={reasonOptions}
          requireReason={config.requireAdjustmentReason}
        />
      )}

      {monthModal.open && (
        <SingleMonthOverrideModal
          record={monthModal.record}
          initialMonthObj={monthModal.monthObj}
          onClose={() => setMonthModal({ open: false, record: null, monthObj: null })}
          onSave={handleMonthOverride}
          reasonOptions={reasonOptions}
          requireReason={config.requireAdjustmentReason}
        />
      )}

      {bulkMonthModal && (
        <BulkMonthOverrideModal
          selectedIds={selectedIds}
          billingRows={billing}
          onClose={() => setBulkMonthModal(false)}
          onSave={handleBulkMonthOverride}
          reasonOptions={reasonOptions}
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
          onOpenMonthOverride={(r, m) => {
            setDetailModal({ open: false, record: null });
            setMonthModal({ open: true, record: r, monthObj: m });
          }}
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
/* Single Month Override Modal                                       */
/* ---------------------------------------------------------------- */

function SingleMonthOverrideModal({
  record,
  initialMonthObj,
  onClose,
  onSave,
  reasonOptions = DEFAULT_ADJUSTMENT_REASONS,
  requireReason = true,
}) {
  const months = getMonthCols(record);
  const selectedMonthObj = initialMonthObj || months[0] || { month: 12, year: new Date().getFullYear(), amount: record?.baseMonthlyAmount || 0 };

  const [selectedMonth, setSelectedMonth] = useState(selectedMonthObj.month);
  const [selectedYear, setSelectedYear] = useState(selectedMonthObj.year || new Date().getFullYear());

  /* Override Action Mode: CUSTOM, WAIVE (0), REVERT (null) */
  const [overrideMode, setOverrideMode] = useState(selectedMonthObj.adjusted ? (selectedMonthObj.amount === 0 ? "WAIVE" : "CUSTOM") : "CUSTOM");
  const [amount, setAmount] = useState(selectedMonthObj.amount ?? record?.baseMonthlyAmount ?? "");

  const availableReasons = useMemo(() => {
    const list = reasonOptions.filter((r) => typeof r === "string" && r.toLowerCase() !== "other" && r.toLowerCase() !== "string");
    return [...list, "Other"];
  }, [reasonOptions]);

  const [reason, setReason] = useState(selectedMonthObj.reason || availableReasons[0] || "Other");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleMonthChange = (mVal) => {
    const found = months.find((m) => m.month === Number(mVal));
    setSelectedMonth(Number(mVal));
    if (found) {
      setSelectedYear(found.year || selectedYear);
      setAmount(found.amount ?? record.baseMonthlyAmount);
      if (found.adjusted) {
        setOverrideMode(found.amount === 0 ? "WAIVE" : "CUSTOM");
      }
    }
  };

  const submit = async () => {
    let finalAmount = null;
    if (overrideMode === "CUSTOM") {
      if (amount === "" || amount == null) {
        return toast.error("Please enter a valid adjusted fee amount");
      }
      finalAmount = Number(amount);
    } else if (overrideMode === "WAIVE") {
      finalAmount = 0;
    } else if (overrideMode === "REVERT") {
      finalAmount = null;
    }

    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (requireReason && overrideMode !== "REVERT" && !finalReason) {
      return toast.error("Please select or enter a valid reason for this override");
    }

    setSubmitting(true);
    await onSave(record.id, Number(selectedMonth), Number(selectedYear), finalAmount, finalReason || "Month Override");
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title={`Month Override — ${record.studentName}`} icon={Calendar}>
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-5 text-xs text-purple-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
        <div>
          <span className="font-bold">Month-Level Adjustment:</span> Override a single month's transport fee. Setting amount to <b>0</b> waives the month completely, while selecting <b>Revert</b> restores base monthly rates.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Month *</label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.idx} value={m.month}>
                {MONTH_NAMES[m.month]} {m.year} (Current: {fmt(m.amount)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Base Monthly Rate</label>
          <div className="w-full px-3.5 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-50 font-bold text-gray-700">
            {fmt(record.baseMonthlyAmount)}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-800 mb-2">Override Type</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setOverrideMode("CUSTOM")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${overrideMode === "CUSTOM" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
          >
            Custom Fee
          </button>
          <button
            type="button"
            onClick={() => setOverrideMode("WAIVE")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${overrideMode === "WAIVE" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
          >
            Waive Month (₹0)
          </button>
          <button
            type="button"
            onClick={() => setOverrideMode("REVERT")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${overrideMode === "REVERT" ? "bg-amber-600 text-white border-amber-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
          >
            Revert Base Rate
          </button>
        </div>
      </div>

      {overrideMode === "CUSTOM" && (
        <div className="mb-5 animate-fadeIn">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Adjusted Fee Amount (₹) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}

      {overrideMode !== "REVERT" && (
        <div className="space-y-4 mb-6 animate-fadeIn">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Adjustment Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
            >
              {availableReasons.map((r) => (
                <option key={r} value={r}>
                  {r === "Other" ? "Other (Custom Reason)" : r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">Specify Custom Reason *</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason..."
                className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-xl bg-blue-50/20 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold cursor-pointer text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-sm"
        >
          <Check className="w-4 h-4" /> {submitting ? "Applying..." : "Apply Month Override"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ---------------------------------------------------------------- */
/* Bulk Month Override Modal                                        */
/* ---------------------------------------------------------------- */

function BulkMonthOverrideModal({
  selectedIds,
  billingRows,
  onClose,
  onSave,
  reasonOptions = DEFAULT_ADJUSTMENT_REASONS,
  requireReason = true,
}) {
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [overrideMode, setOverrideMode] = useState("WAIVE");
  const [amount, setAmount] = useState(0);

  const availableReasons = useMemo(() => {
    const list = reasonOptions.filter((r) => typeof r === "string" && r.toLowerCase() !== "other" && r.toLowerCase() !== "string");
    return [...list, "Other"];
  }, [reasonOptions]);

  const [reason, setReason] = useState(availableReasons[0] || "Other");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    let finalAmount = null;
    if (overrideMode === "CUSTOM") {
      if (amount === "" || amount == null) {
        return toast.error("Please enter a valid fee amount");
      }
      finalAmount = Number(amount);
    } else if (overrideMode === "WAIVE") {
      finalAmount = 0;
    } else if (overrideMode === "REVERT") {
      finalAmount = null;
    }

    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (requireReason && overrideMode !== "REVERT" && !finalReason) {
      return toast.error("Please select or enter a valid reason");
    }

    const payload = {
      billingIds: selectedIds,
      month: Number(selectedMonth),
      year: Number(selectedYear),
      adjustedAmount: finalAmount,
      reason: finalReason || "Bulk Month Override",
    };

    setSubmitting(true);
    await onSave(payload);
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose} title={`Bulk Month Override (${selectedIds.length} Students)`} icon={Layers}>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5 text-xs text-indigo-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
        <div>
          <span className="font-bold">Bulk Action Notice:</span> Applying month override to <b>{selectedIds.length} selected students</b> simultaneously. Note: Records set to FLAT override mode will be skipped by backend.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Target Month *</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
          >
            {MONTH_NAMES.map((m, idx) => idx > 0 && (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Target Year *</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-800 mb-2">Override Type for All Selected</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setOverrideMode("WAIVE")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${overrideMode === "WAIVE" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
          >
            Waive Month (₹0)
          </button>
          <button
            type="button"
            onClick={() => setOverrideMode("CUSTOM")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${overrideMode === "CUSTOM" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
          >
            Set Custom Fee
          </button>
          <button
            type="button"
            onClick={() => setOverrideMode("REVERT")}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${overrideMode === "REVERT" ? "bg-amber-600 text-white border-amber-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
          >
            Revert Base Rate
          </button>
        </div>
      </div>

      {overrideMode === "CUSTOM" && (
        <div className="mb-5 animate-fadeIn">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Custom Fee Amount (₹) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}

      {overrideMode !== "REVERT" && (
        <div className="space-y-4 mb-6 animate-fadeIn">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Reason for Bulk Override *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
            >
              {availableReasons.map((r) => (
                <option key={r} value={r}>
                  {r === "Other" ? "Other (Custom Reason)" : r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">Specify Custom Reason *</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter reason details..."
                className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-xl bg-blue-50/20 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold cursor-pointer text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-sm"
        >
          <Check className="w-4 h-4" /> {submitting ? "Processing..." : `Apply to ${selectedIds.length} Records`}
        </button>
      </div>
    </ModalShell>
  );
}

/* ---------------------------------------------------------------- */
/* Pagination                                                       */
/* ---------------------------------------------------------------- */

function getPageList(current, total) {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last !== undefined) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
}

function Pagination({ pagination, onPageChange }) {
  const current = pagination.page ?? 0;
  const total = pagination.totalPages ?? 1;

  if (total <= 1) {
    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400 font-medium">
          {pagination.totalElements ?? 0} total record{(pagination.totalElements ?? 0) === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  const pages = getPageList(current, total);

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
      <p className="text-xs text-gray-400 font-medium order-2 sm:order-1">
        Page {current + 1} of {total} · {pagination.totalElements} total
      </p>

      <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2">
        <button
          onClick={() => onPageChange(0)}
          disabled={current === 0}
          title="First page"
          className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(0, current - 1))}
          disabled={current === 0}
          title="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5 rotate-90" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-8 h-8 px-1.5 flex items-center justify-center rounded-lg border text-xs font-bold cursor-pointer transition-colors ${p === current
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(total - 1, current + 1))}
          disabled={current >= total - 1}
          title="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
        </button>
        <button
          onClick={() => onPageChange(total - 1)}
          disabled={current >= total - 1}
          title="Last page"
          className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
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
      const payload = {
        amount: Number(amount),
        paymentMode: paymentMode || "CASH",
        paymentDate,
        referenceNo: referenceNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
      };

      await payTransportBilling(record.id, payload);
      toast.success("Payment recorded successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || err?.response?.data?.message || "Failed to submit transport fee collection record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Collect Transport Fee — ${record.studentName}`} icon={CreditCard}>
      <div className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-2 gap-4 text-sm border border-gray-100">
        <div>
          <p className="text-gray-400 text-xs font-medium">Admission Number</p>
          <p className="font-bold text-gray-800 mt-0.5">#{record.admissionNumber}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-medium">Transport Route</p>
          <p className="font-bold text-indigo-700 mt-0.5 truncate">{record.routeName}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-medium">Amount Due</p>
          <p className="font-bold text-gray-800 mt-0.5">{fmt(record.finalTotal)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-medium">Amount Paid</p>
          <p className="font-bold text-green-700 mt-0.5">{fmt(record.paidAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Amount (₹) *</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference Number</label>
          <input
            type="text"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="Enter reference number (Optional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks</label>
        <input
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add remarks (Optional)"
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
  const [feePeriodId, setFeePeriodId] = useState(defaultPeriodId ? String(defaultPeriodId) : "");
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
    <ModalShell onClose={onClose} title="Generate Transport Fees" icon={RefreshCcw}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fee Period *</label>
          <select
            value={feePeriodId}
            onChange={(e) => setFeePeriodId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-700 cursor-pointer"
          >
            <option value="">Select Fee Period</option>
            {feePeriods.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name || p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transport Route *</label>
          <select
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-700 cursor-pointer"
          >
            <option value="">Select Transport Route</option>
            {routes.map((r) => (
              <option key={r.id} value={String(r.id)}>{r.routeName || r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2.5 text-sm border border-gray-100">
        <p className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">Summary</p>
        <Row label="Fee Period" value={period?.name || period?.label || "—"} colorClass="text-indigo-700 font-semibold" />
        <Row label="Selected Route" value={route ? `${route.routeName || route.name}` : "—"} colorClass="text-blue-700 font-semibold" />
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

function FlatOverrideModal({ record, onClose, onSave, reasonOptions = DEFAULT_ADJUSTMENT_REASONS, requireReason = true }) {
  const isEdit = record?.flatOverrideAmount != null;

  const availableReasons = useMemo(() => {
    const list = reasonOptions.filter((r) => typeof r === "string" && r.toLowerCase() !== "other" && r.toLowerCase() !== "string");
    return [...list, "Other"];
  }, [reasonOptions]);

  const [amount, setAmount] = useState(isEdit ? record.flatOverrideAmount : "");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && record.flatOverrideReason) {
      if (availableReasons.includes(record.flatOverrideReason)) {
        setReason(record.flatOverrideReason);
      } else {
        setReason("Other");
        setCustomReason(record.flatOverrideReason);
      }
    } else {
      setReason(availableReasons[0] || "Other");
    }
  }, [isEdit, record, availableReasons]);

  const save = async () => {
    if (amount === "") return toast.error("Please enter an adjusted fee amount");

    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (requireReason && !finalReason) {
      return toast.error("Please select or enter a valid reason for this adjustment");
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
    <ModalShell onClose={onClose} title={`Adjust Flat Fee — ${record.studentName}`} icon={CreditCard}>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-900">Please Note</p>
          <p className="text-xs text-amber-800 mt-0.5">
            Updating the flat fee will override the calculated monthly fee for this student across all months.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 grid grid-cols-2 gap-4 text-sm shadow-inner">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Calculated Fee</p>
          <p className="font-extrabold text-gray-900 text-base mt-0.5">{fmt(record.computedTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Fee Status</p>
          <p className={`font-extrabold text-base mt-0.5 ${isEdit ? "text-purple-600" : "text-gray-500"}`}>
            {isEdit ? fmt(record.flatOverrideAmount) : "No Adjustment"}
          </p>
        </div>
      </div>

      {isEdit && (
        <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-red-955">Reset to Default Calculation</h4>
            <p className="text-xs text-red-700">Remove adjusted fee override and recalculate row via individual standard monthly tiers.</p>
          </div>
          <button
            type="button"
            onClick={clearOverride}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 active:scale-[0.98] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Revert
          </button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Adjusted Fee Amount (₹) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter adjusted total amount"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 font-semibold transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Adjustment Reason *</label>
          <div className="relative">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer text-gray-700 font-medium transition-all appearance-none"
            >
              {availableReasons.map((r) => (
                <option key={r} value={r}>
                  {r === "Other" ? "Other (Specify Custom Reason)" : r}
                </option>
              ))}
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
              placeholder="Enter custom adjustment reason details..."
              className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-xl bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all font-medium"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Remarks (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add additional situational notes (optional)"
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
          <Check className="w-4 h-4" /> {submitting ? "Saving changes..." : "Save Adjusted Fee"}
        </button>
      </div>
    </ModalShell>
  );
}

function BillingDetailModal({
  record, onClose, onOpenFlat, onOpenMonthOverride,
  reasonOptions = DEFAULT_ADJUSTMENT_REASONS,
  requireReason = true,
  allowMonthlyAdjustments = true,
  allowFlatOverride = true,
}) {
  const months = getMonthCols(record);
  const isFlat = record.calcMode === "FLAT";
  const paid = isPaid(record);
  const concession = concessionAmount(record);

  return (
    <ModalShell onClose={onClose} title={`Transport Fee Details — ${record.studentName}`} icon={Bus}>
      <div className="bg-blue-50 rounded-xl p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Student</p>
          <p className="font-bold text-sm text-gray-900">{record.studentName} <br /> #{record.admissionNumber}</p>
          <p className="text-xs text-gray-400">{record.className} {record.sectionName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Transport Route</p>
          <p className="font-bold text-gray-900">{record.routeName}</p>
          <p className="text-xs text-gray-400">{record.stopName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Monthly Fee</p>
          <p className="font-bold text-green-700">{fmt(record.baseMonthlyAmount)}/mo</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Payment Status</p>
          <p className="font-bold text-gray-900">{statusLabel(record.paymentStatus)}</p>
        </div>
      </div>

      {concession > 0 && (
        <div className="bg-purple-50 border border-purple-100 text-purple-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span><b>Concession applied:</b> {fmt(concession)} off the computed total.</span>
        </div>
      )}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Monthly Breakdown</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {months.map((m) => (
          <div key={m.idx} className="border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{MONTH_NAMES[m.month]} {m.year}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{fmt(m.amount)}</p>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${m.adjusted ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
              {m.adjusted ? (m.reason || "Adjusted") : "Standard Fee"}
            </span>
            <button
              disabled={paid || !allowMonthlyAdjustments}
              onClick={() => onOpenMonthOverride(record, m)}
              className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Adjust {MONTH_NAMES[m.month]}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm mb-6 border border-gray-100">
        <Row label="Calculated Total" value={fmt(record.computedTotal)} />
        <Row label="Flat Fee Adjustment" value={record.flatOverrideAmount != null ? fmt(record.flatOverrideAmount) : "No Adjustment"} />
        {concession > 0 && (
          <Row label="Concession given" value={fmt(concession)} colorClass="text-purple-600 font-bold" />
        )}
        <div className="border-t border-gray-200 my-2" />
        <Row label="Total Amount" value={fmt(record.finalTotal)} colorClass="text-gray-900 font-bold" />
        <Row label="Amount Paid" value={fmt(record.paidAmount)} colorClass="text-green-600 font-bold" />
        <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
          <span className="font-bold text-gray-800">Balance Due</span>
          <span className="font-bold text-amber-600 text-lg">{fmt(record.outstandingAmount)}</span>
        </div>
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
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 sm:p-5 space-y-3 animate-pulse bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-2/5 bg-gray-200 rounded" />
              <div className="h-3 w-1/3 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-12 bg-gray-50 rounded-xl" />
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
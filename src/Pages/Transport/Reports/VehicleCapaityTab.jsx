import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, AlertTriangle, LocateFixedIcon } from "lucide-react";
import { toast } from "react-toastify";
import { getVehicleCapacityReport } from "../../../Api/Transport/TransportAPI";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import {
  VEHICLE_TYPE_COLORS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_CAPACITY_COLUMNS,
  REPORT_UI_TEXT,
  EXPORT_CONSTANTS,
  CSV_HEADERS,
  TOAST_MESSAGES
} from "../../../Constants/StringConstants/TransportConstants";

function UtilBar({ alloc, cap }) {
  const pct = cap > 0 ? Math.round((alloc / cap) * 100) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : pct > 0 ? "bg-blue-500" : "bg-gray-200";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 sm:w-32 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-xs font-bold ${pct >= 100 ? "text-red-600" : pct >= 80 ? "text-orange-500" : "text-gray-500"}`}>
        {pct}%
      </span>
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────
function exportToCSV(data) {
  if (!data?.length) return;

  const rows = [];
  rows.push([EXPORT_CONSTANTS.CAPACITY_REPORT_TITLE]);
  rows.push([]);
  rows.push(CSV_HEADERS.VEHICLE_CAPACITY);

  data.forEach((v) => {
    rows.push([
      v.vehicleNumber,
      VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType,
      v.makeModel,
      v.totalCapacity,
      v.totalStudentsAllocated,
      v.availableSeats,
      `${Math.round(v.utilizationPercent)}%`,
      v.insuranceExpiryDate || REPORT_UI_TEXT.N_A,
      v.insuranceExpiringSoon ? REPORT_UI_TEXT.YES : REPORT_UI_TEXT.NO,
      v.fitnessCertExpiryDate || REPORT_UI_TEXT.N_A,
      v.fitnessExpiringSoon ? REPORT_UI_TEXT.YES : REPORT_UI_TEXT.NO,
      v.gpsEnabled ? REPORT_UI_TEXT.YES : REPORT_UI_TEXT.NO,
      v.status,
      v.routeBreakdown?.map((r) => r.routeCode).join(", ") || REPORT_UI_TEXT.UNASSIGNED,
    ]);
  });

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = EXPORT_CONSTANTS.CAPACITY_FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Expiry date formatter ────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return REPORT_UI_TEXT.N_A;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Vehicle Card (used for phone / tablet / laptop grid views) ────
function VehicleCard({ v }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-2.5 bg-white hover:bg-gray-50/60 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-bold text-gray-900 block truncate">{v.vehicleNumber}</span>
          {v.gpsEnabled && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
              <LocateFixedIcon className="w-3.5 h-3.5" /> GPS
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${VEHICLE_TYPE_COLORS[v.vehicleType] ?? "bg-gray-100 text-gray-600"}`}>
          {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}
        </span>
      </div>

      <p className="text-xs text-gray-400 truncate">{v.makeModel}</p>
      <UtilBar alloc={v.totalStudentsAllocated} cap={v.totalCapacity} />

      <div className="grid grid-cols-3 gap-2 bg-gray-50/70 p-2.5 rounded-xl text-xs border border-gray-100">
        <div>
          <span className="text-gray-400 block mb-0.5">{REPORT_UI_TEXT.LBL_CAPACITY}</span>
          <span className="font-bold text-gray-700">{v.totalCapacity}</span>
        </div>
        <div>
          <span className="text-gray-400 block mb-0.5">{REPORT_UI_TEXT.LBL_ALLOCATED}</span>
          <span className="font-bold text-gray-700">{v.totalStudentsAllocated}</span>
        </div>
        <div>
          <span className="text-gray-400 block mb-0.5">{REPORT_UI_TEXT.LBL_AVAILABLE}</span>
          <span className={`font-bold flex items-center gap-1 ${v.availableSeats === 0 ? "text-orange-500" : v.availableSeats < 0 ? "text-red-500" : "text-green-600"}`}>
            {v.availableSeats}
            {v.availableSeats === 0 && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <span className={v.insuranceExpiringSoon ? "text-orange-500 font-semibold flex items-center gap-1" : "text-gray-500 flex items-center gap-1"}>
          {v.insuranceExpiringSoon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          {REPORT_UI_TEXT.LBL_INS} {fmtDate(v.insuranceExpiryDate)}
        </span>
        <span className={v.fitnessExpiringSoon ? "text-orange-500 font-semibold flex items-center gap-1" : "text-gray-500 flex items-center gap-1"}>
          {v.fitnessExpiringSoon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          {REPORT_UI_TEXT.LBL_FIT} {fmtDate(v.fitnessCertExpiryDate)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 pt-0.5">
        {v.routeBreakdown?.length > 0
          ? v.routeBreakdown.map((r) => (
            <span key={r.routeId} className="bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
              {r.routeCode}
            </span>
          ))
          : <span className="italic text-gray-400 text-xs">{REPORT_UI_TEXT.UNASSIGNED}</span>
        }
      </div>
    </div>
  );
}

export default function VehicleCapacityTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyOver, setOnlyOver] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getVehicleCapacityReport({
        onlyOverCapacity: onlyOver,
        expiringSoonDays: Number(expiryDays),
      });
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error(TOAST_MESSAGES.VEHICLE_REPORT_LOAD_FAIL);
    } finally {
      setLoading(false);
    }
  }, [onlyOver, expiryDays]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          {REPORT_UI_TEXT.CAPACITY_TAB_TITLE}
        </h2>
        <button
          onClick={() => {
            if (!data.length) return toast.info(TOAST_MESSAGES.EXPORT_NO_DATA);
            exportToCSV(data);
            toast.success(TOAST_MESSAGES.EXPORT_SUCCESS);
          }}
          className="inline-flex items-center justify-center gap-1.5 border cursor-pointer border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-fit"
        >
          <Download className="w-3.5 h-3.5" /> {REPORT_UI_TEXT.BTN_EXPORT_CSV}
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyOver}
            onChange={(e) => setOnlyOver(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600"
          />
          <span className="whitespace-nowrap">{REPORT_UI_TEXT.SHOW_OVER_CAPACITY}</span>
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="whitespace-nowrap">{REPORT_UI_TEXT.EXPIRY_ALERT_WITHIN}</span>
          <input
            type="number"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            min={1}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {REPORT_UI_TEXT.DAYS}
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto sm:ml-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? REPORT_UI_TEXT.LBL_LOADING : REPORT_UI_TEXT.BTN_REFRESH}
        </button>
      </div>

      {/* Main Table */}
      <div className="hidden 2xl:block overflow-x-auto w-full max-w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {VEHICLE_CAPACITY_COLUMNS.map((h) => (
                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <ListLoader rows={4} avatar={false} colSpanSet={10} />}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={10} className="py-16 text-center text-gray-400">
                  <span className="text-4xl block mb-3">🚌</span>
                  <p className="font-medium text-sm">{REPORT_UI_TEXT.NO_VEHICLES_FOUND}</p>
                </td>
              </tr>
            )}
            {!loading && data.map((v) => (
              <tr key={v.vehicleId} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-bold text-gray-900">{v.vehicleNumber}</div>
                  {v.gpsEnabled && (
                    <span className="text-xs text-green-600 font-medium flex gap-1 mt-0.5">
                      <LocateFixedIcon className="w-3.5 h-3.5" /> GPS
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${VEHICLE_TYPE_COLORS[v.vehicleType] ?? "bg-gray-100 text-gray-600"}`}>
                    {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500 text-xs">{v.makeModel}</td>
                <td className="px-4 py-4 text-gray-700 font-medium">{v.totalCapacity}</td>
                <td className="px-4 py-4 text-gray-700">{v.totalStudentsAllocated}</td>
                <td className="px-4 py-4">
                  <span className={`font-semibold flex items-center gap-1 ${v.availableSeats === 0 ? "text-orange-500" : v.availableSeats < 0 ? "text-red-500" : "text-green-600"}`}>
                    {v.availableSeats}
                    {v.availableSeats === 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <UtilBar alloc={v.totalStudentsAllocated} cap={v.totalCapacity} />
                </td>
                <td className="px-4 py-4">
                  <span className={v.insuranceExpiringSoon ? "text-orange-500 font-semibold flex items-center gap-1" : "text-gray-600"}>
                    {v.insuranceExpiringSoon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                    {fmtDate(v.insuranceExpiryDate)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={v.fitnessExpiringSoon ? "text-orange-500 font-semibold flex items-center gap-1" : "text-gray-600"}>
                    {v.fitnessExpiringSoon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                    {fmtDate(v.fitnessCertExpiryDate)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {v.routeBreakdown?.length > 0
                    ? <div className="flex flex-wrap gap-1">
                      {v.routeBreakdown.map((r) => (
                        <span key={r.routeId} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {r.routeCode}
                        </span>
                      ))}
                    </div>
                    : <span className="text-gray-400 italic text-xs">{REPORT_UI_TEXT.UNASSIGNED}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="2xl:hidden w-full">
        {loading && (
          <div className="py-4 px-4">
            <table className="w-full">
              <tbody><ListLoader rows={4} avatar={false} colSpanSet={1} /></tbody>
            </table>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <span className="text-4xl block mb-3">🚌</span>
            <p className="font-medium text-sm">{REPORT_UI_TEXT.NO_VEHICLES_FOUND}</p>
          </div>
        )}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4 sm:p-5">
            {data.map((v) => <VehicleCard key={v.vehicleId} v={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
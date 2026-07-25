import { useState, useEffect, useCallback } from "react";
import { Download, ChevronDown, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { getTransportFeeReport, getActiveRoutes } from "../../../Api/Transport/TransportAPI";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import {
  PICKUP_DROP_COLORS,
  PICKUP_DROP_LABELS,
  FEE_FREQ_COLORS,
  REPORT_TABLE_HEADERS,
  REPORT_UI_TEXT,
  EXPORT_CONSTANTS,
  TOAST_MESSAGES
} from "../../../Constants/StringConstants/TransportConstants";

// ─── Helper Functions ─────────────────────────────────────────────
function fmt(n) {
  if (n === null || n === undefined) return "N/A";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function formatFeeSource(source, planName) {
  if (planName) return planName;
  if (source === "STOP_DEFAULT") return "Stop Default";
  if (source === "OVERRIDE") return "Override";
  return source || "-";
}

function formatEffectivePeriod(from, to) {
  if (!from && !to) return "-";
  if (from && to) return `${from} → ${to}`;
  return from || to;
}

// ─── Table Headers (Synced with Reports.jsx) ──────────────────────
const STUDENT_FEE_TABLE_HEADERS = [
  "Roll No.",
  "Student Name",
  "Class & Sec",
  "Route",
  "Stop",
  "Type",
  "Fee Source",
  "Amount",
  "Effective Period"
];

// ─── CSV Export ───────────────────────────────────────────────────
function exportToCSV(report) {
  if (!report?.students?.length) return;

  const rows = [];
  rows.push([EXPORT_CONSTANTS.FEE_REPORT_TITLE || "Student Transport Fee Report"]);
  rows.push([EXPORT_CONSTANTS.FEE_META_TOTAL_STUDENTS || "Total Students", report.totalStudentsWithTransport]);
  rows.push(["Students With Transport Fee", report.totalStudentsWithFee]);
  rows.push(["Students Without Fee", report.totalStudentsWithoutFee]);
  rows.push([REPORT_UI_TEXT.LBL_TOTAL_MONTHLY_REV, fmt(report.totalMonthlyFeeRevenue)]);
  rows.push([REPORT_UI_TEXT.LBL_TOTAL_ANNUAL_REV, fmt(report.totalAnnualFeeRevenue)]);
  rows.push([]);

  rows.push([
    "Roll Number",
    "Student Name",
    "Class",
    "Section",
    "Route",
    "Stop Name",
    "Type",
    "Fee Source",
    "Fee Amount",
    "Effective Period",
    "Active Status"
  ]);

  report.students.forEach((s) => {
    rows.push([
      s.studentRollNumber || `#${s.studentId}`,
      s.studentName,
      s.className,
      s.sectionName,
      `${s.routeCode} – ${s.routeName}`,
      s.stopName,
      PICKUP_DROP_LABELS[s.pickupDropType] || s.pickupDropType,
      formatFeeSource(s.feeSource, s.feePlanName),
      s.feeAmount ?? s.stopMonthlyFee ?? "N/A",
      formatEffectivePeriod(s.effectiveFrom, s.effectiveTo),
      s.isActive ? REPORT_UI_TEXT.YES : REPORT_UI_TEXT.NO,
    ]);
  });

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = EXPORT_CONSTANTS.FEE_FILE_NAME || "student_fee_report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Student Grid Card (Used for < 1280px: Mobile, 768px Tablet & 1024px Laptop) ───
function StudentCard({ s }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3.5 space-y-2.5 bg-white hover:border-blue-200 transition-all shadow-2xs">
      {/* Top Section: Roll No, Name, Route Badge */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 font-bold text-[11px] rounded">
              {s.studentRollNumber || `#${s.studentId}`}
            </span>
            <span className="font-bold text-gray-900 text-sm truncate">{s.studentName}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {s.className} {s.sectionName} • <span className="font-semibold text-gray-700">{s.stopName}</span>
          </p>
        </div>
        <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
          {s.routeCode}
        </span>
      </div>

      {/* Middle Grid: Fee Source & Amount */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Fee Source</span>
          <span className={`inline-block mt-0.5 font-medium text-xs ${s.feeSource === "OVERRIDE" ? "text-amber-700 font-semibold" : "text-gray-700"
            }`}>
            {formatFeeSource(s.feeSource, s.feePlanName)}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Amount</span>
          <span className="font-bold text-gray-900 text-xs">
            {fmt(s.feeAmount ?? s.stopMonthlyFee)}
          </span>
        </div>
      </div>

      {/* Bottom Footer: Type Badge & Effective Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
        <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${PICKUP_DROP_COLORS[s.pickupDropType] ?? "bg-gray-100 text-gray-600"}`}>
          {PICKUP_DROP_LABELS[s.pickupDropType] || s.pickupDropType}
        </span>
        <span className="font-semibold text-gray-700 text-[11px] flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          {formatEffectivePeriod(s.effectiveFrom, s.effectiveTo)}
        </span>
      </div>
    </div>
  );
}

export default function StudentFeeTab() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [report, setReport] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const data = await getActiveRoutes();
        setRoutes(data);
      } catch (err) {
        console.error(err);
        toast.error(TOAST_MESSAGES.ROUTES_LOAD_FAIL);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const fetchReport = useCallback(async (routeId) => {
    try {
      setLoading(true);
      const data = await getTransportFeeReport({
        ...(routeId ? { routeId } : {}),
      });
      setReport(data);
    } catch (err) {
      console.error(err);
      toast.error(TOAST_MESSAGES.FEE_REPORT_LOAD_FAIL);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport("");
  }, [fetchReport]);

  const handleRouteChange = (e) => {
    const val = e.target.value;
    setSelectedRouteId(val);
    fetchReport(val);
  };

  const routeSummaryRows = report?.routeSummary ? Object.values(report.routeSummary) : [];
  const freqRows = report?.studentsByFrequency ? Object.entries(report.studentsByFrequency) : [];
  const students = report?.students || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
          {REPORT_UI_TEXT.FEE_TAB_TITLE}
        </h2>
        <button
          onClick={() => {
            if (!report?.students?.length) return toast.info(TOAST_MESSAGES.EXPORT_NO_DATA);
            exportToCSV(report);
            toast.success(TOAST_MESSAGES.EXPORT_SUCCESS);
          }}
          className="inline-flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-fit"
        >
          <Download className="w-3.5 h-3.5" /> {REPORT_UI_TEXT.BTN_EXPORT_CSV}
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto">
          {loadingRoutes ? (
            <div className="w-full sm:w-48 h-9 bg-gray-100 animate-pulse rounded-xl" />
          ) : (
            <>
              <select
                value={selectedRouteId}
                onChange={handleRouteChange}
                disabled={loading}
                className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 text-xs lg:text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-60 sm:min-w-72 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
              >
                <option value="">{REPORT_UI_TEXT.OPT_ALL_ROUTES}</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeCode ? `${r.routeCode} – ` : ""}{r.routeName || r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 border-b border-gray-200">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4 text-center animate-pulse">
              <div className="h-7 w-24 bg-gray-200 rounded-lg mx-auto mb-2" />
              <div className="h-3 w-32 bg-gray-100 rounded mx-auto" />
            </div>
          ))
          : [
            { label: REPORT_UI_TEXT.LBL_TOTAL_STUDENTS_TRANSPORT, value: report?.totalStudentsWithTransport ?? 0, blue: false },
            { label: REPORT_UI_TEXT.LBL_TOTAL_MONTHLY_REV, value: fmt(report?.totalMonthlyFeeRevenue ?? 0), blue: true },
            { label: REPORT_UI_TEXT.LBL_TOTAL_ANNUAL_REV, value: fmt(report?.totalAnnualFeeRevenue ?? 0), blue: true },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center min-w-0">
              <p className={`text-xl lg:text-2xl font-extrabold truncate ${c.blue ? "text-blue-600" : "text-gray-900"}`}>{c.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1 truncate">{c.label}</p>
            </div>
          ))
        }
      </div>

      {/* Route Breakdown + Frequency Distribution */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-gray-100">
        <div className="min-w-0">
          <p className="font-bold text-gray-800 mb-3 text-xs lg:text-sm">{REPORT_UI_TEXT.SECTION_ROUTE_BREAKDOWN}</p>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : routeSummaryRows.length === 0 ? (
            <p className="text-xs text-gray-400 italic">{REPORT_UI_TEXT.NO_ROUTE_DATA}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {REPORT_TABLE_HEADERS.ROUTE_BREAKDOWN.map((h) => (
                      <th key={h} className="pb-2 text-xs font-semibold text-gray-400 text-left pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {routeSummaryRows.map((r) => (
                    <tr key={r.routeId} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-700 text-xs whitespace-nowrap font-medium">{r.routeName}</td>
                      <td className="py-2.5 pr-4 font-semibold text-gray-800">{r.studentCount}</td>
                      <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">{fmt(r.totalMonthlyRevenue)}</td>
                      <td className="py-2.5 text-gray-700 whitespace-nowrap">{fmt(r.totalAnnualRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-bold text-gray-800 mb-3 text-xs lg:text-sm">{REPORT_UI_TEXT.SECTION_FREQ_DIST}</p>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : freqRows.length === 0 ? (
            <p className="text-xs text-gray-400 italic">{REPORT_UI_TEXT.NO_FREQ_DATA}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {REPORT_TABLE_HEADERS.FREQ_DISTRIBUTION.map((h) => (
                      <th key={h} className="pb-2 text-xs font-semibold text-gray-400 text-left pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {freqRows.map(([freq, count]) => (
                    <tr key={freq} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${FEE_FREQ_COLORS[freq] ?? "bg-gray-100 text-gray-600"}`}>
                          {freq}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold text-gray-800">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── GRID CARD VIEW (Active for Mobile, 768px Tablet & 1024px Laptop with Sidebar) ─── */}
      <div className="xl:hidden w-full p-4">
        {loading && (
          <div className="py-2">
            <table className="w-full">
              <tbody><ListLoader rows={5} avatar={false} colSpanSet={1} /></tbody>
            </table>
          </div>
        )}
        {!loading && students.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">{REPORT_UI_TEXT.NO_STUDENTS_FOUND}</div>
        )}
        {!loading && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map((s) => <StudentCard key={s.allocationId} s={s} />)}
          </div>
        )}
      </div>

      {/* ─── DESKTOP TABLE VIEW (Active on XL Screens 1280px+ & 1440px Large Laptops) ─── */}
      <div className="hidden xl:block overflow-x-auto w-full max-w-full">
        <table className="w-full text-left border-collapse text-xs 2xl:text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
              {STUDENT_FEE_TABLE_HEADERS.map((h) => (
                <th key={h} className="px-2.5 2xl:px-4 py-3.5 whitespace-nowrap text-xs tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <ListLoader rows={5} avatar={false} colSpanSet={9} />}
            {!loading && students.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">{REPORT_UI_TEXT.NO_STUDENTS_FOUND}</td>
              </tr>
            )}
            {!loading && students.map((s) => (
              <tr key={s.allocationId} className="hover:bg-blue-50/30 transition-colors">
                {/* Roll No. */}
                <td className="px-2.5 2xl:px-4 py-3.5 text-gray-700 text-xs font-semibold whitespace-nowrap">
                  {s.studentRollNumber || `#${s.studentId}`}
                </td>

                {/* Student Name */}
                <td className="px-2.5 2xl:px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                  {s.studentName}
                </td>

                {/* Class & Sec */}
                <td className="px-2.5 2xl:px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                  {s.className} {s.sectionName}
                </td>

                {/* Route Code */}
                <td className="px-2.5 2xl:px-4 py-3.5 whitespace-nowrap">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {s.routeCode}
                  </span>
                </td>

                {/* Stop Name */}
                <td className="px-2.5 2xl:px-4 py-3.5 text-gray-600 text-xs font-medium whitespace-nowrap">
                  {s.stopName}
                </td>

                {/* Pickup / Drop Type */}
                <td className="px-2.5 2xl:px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PICKUP_DROP_COLORS[s.pickupDropType] ?? "bg-gray-100 text-gray-600"}`}>
                    {PICKUP_DROP_LABELS[s.pickupDropType] || s.pickupDropType}
                  </span>
                </td>

                {/* Fee Source */}
                <td className="px-2.5 2xl:px-4 py-3.5 whitespace-nowrap">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md ${s.feeSource === "OVERRIDE"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 font-semibold"
                      : "bg-gray-100 text-gray-700"
                    }`}>
                    {formatFeeSource(s.feeSource, s.feePlanName)}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-2.5 2xl:px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                  {fmt(s.feeAmount ?? s.stopMonthlyFee)}
                </td>

                {/* Effective Period */}
                <td className="px-2.5 2xl:px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                  {formatEffectivePeriod(s.effectiveFrom, s.effectiveTo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
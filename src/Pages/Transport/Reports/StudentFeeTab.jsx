import { useState, useEffect, useCallback } from "react";
import { Download, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { getTransportFeeReport, getActiveRoutes } from "../../../Api/Transport/TransportAPI";
import ListLoader from "../../../Components/CommonComp/ListLoader";

const typeColors = {
  "BOTH":        "bg-blue-100 text-blue-700",
  "PICKUP_ONLY": "bg-teal-100 text-teal-700",
  "DROP_ONLY":   "bg-purple-100 text-purple-700",
};

const typeLabel = {
  "BOTH":        "BOTH",
  "PICKUP_ONLY": "PICKUP ONLY",
  "DROP_ONLY":   "DROP ONLY",
};

const freqColors = {
  MONTHLY:    "bg-blue-100 text-blue-700",
  ANNUALLY:   "bg-orange-100 text-orange-700",
  QUARTERLY:  "bg-purple-100 text-purple-700",
  "ONE-TIME": "bg-gray-100 text-gray-600",
};

function fmt(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }

// ─── CSV Export ───────────────────────────────────────────────────
function exportToCSV(report) {
  if (!report?.students?.length) return;

  const rows = [];
  rows.push(["Student Transport Fee Report"]);
  rows.push(["Total Students",         report.totalStudentsWithTransport]);
  rows.push(["Students with Fee Plan", report.totalStudentsWithFeePlan]);
  rows.push(["Students without Plan",  report.totalStudentsWithoutFeePlan]);
  rows.push(["Total Monthly Revenue",  fmt(report.totalMonthlyFeeRevenue)]);
  rows.push(["Total Annual Revenue",   fmt(report.totalAnnualFeeRevenue)]);
  rows.push([]);
  rows.push([
    "Student ID", "Name", "Class", "Section", "Roll No.",
    "Route", "Stop", "Pickup/Drop",
    "Fee Plan", "Amount", "Frequency",
    "Effective From", "Effective To", "Active",
  ]);

  report.students.forEach((s) => {
    rows.push([
      s.studentId,
      s.studentName,
      s.className,
      s.sectionName,
      s.studentRollNumber || "",
      `${s.routeCode} – ${s.routeName}`,
      s.stopName,
      typeLabel[s.pickupDropType] || s.pickupDropType,
      s.feePlanName,
      s.feeAmount,
      s.feeFrequency,
      s.effectiveFrom,
      s.effectiveTo,
      s.isActive ? "Yes" : "No",
    ]);
  });

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = "student_fee_report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Student Card (used for phone / tablet / laptop grid views) ────
function StudentCard({ s }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-2.5 bg-white hover:bg-gray-50/60 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-bold text-gray-900 block truncate">{s.studentName}</span>
          <p className="text-xs text-gray-400 mt-0.5">
            #{s.studentId} • {s.className} {s.sectionName}
            {s.studentRollNumber && <> • Roll: {s.studentRollNumber}</>}
          </p>
        </div>
        <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
          {s.routeCode}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`font-semibold px-2.5 py-1 rounded-full ${typeColors[s.pickupDropType] ?? "bg-gray-100 text-gray-600"}`}>
          {typeLabel[s.pickupDropType] || s.pickupDropType}
        </span>
        <span className={`font-semibold px-2.5 py-1 rounded-full ${freqColors[s.feeFrequency] ?? "bg-gray-100 text-gray-600"}`}>
          {s.feeFrequency}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-gray-50/70 p-2.5 rounded-xl text-xs border border-gray-100">
        <div className="min-w-0">
          <span className="text-gray-400 block mb-0.5">Stop</span>
          <span className="text-gray-700 font-medium truncate block">{s.stopName}</span>
        </div>
        <div className="min-w-0">
          <span className="text-gray-400 block mb-0.5">Fee Plan</span>
          <span className="text-gray-700 font-medium truncate block">{s.feePlanName}</span>
        </div>
      </div>

      <div className="flex items-center justify-end pt-0.5">
        <span className="text-gray-900 font-bold text-sm bg-gray-100 px-3 py-1 rounded-lg">
          {fmt(s.feeAmount)}
        </span>
      </div>
    </div>
  );
}

export default function StudentFeeTab() {
  const [routes, setRoutes]                   = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [report, setReport]                   = useState(null);
  const [loadingRoutes, setLoadingRoutes]     = useState(true);
  const [loading, setLoading]                 = useState(true);

  // 1. Fetch active routes on mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const data = await getActiveRoutes();
        setRoutes(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load routes.");
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  // 2. Fetch report
  const fetchReport = useCallback(async (routeId) => {
    try {
      setLoading(true);
      const data = await getTransportFeeReport({
        ...(routeId ? { routeId } : {}),
      });
      setReport(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load fee report.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount (all routes)
  useEffect(() => {
    fetchReport("");
  }, []);

  const handleRouteChange = (e) => {
    const val = e.target.value;
    setSelectedRouteId(val);
    fetchReport(val);
  };

  // Derived data
  const routeSummaryRows = report?.routeSummary ? Object.values(report.routeSummary) : [];
  const freqRows         = report?.studentsByFrequency ? Object.entries(report.studentsByFrequency) : [];
  const students         = report?.students || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full min-w-0 max-w-full">

      {/* Header */}
      <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          🪪 Student Transport Fee Report
        </h2>
        <button
          onClick={() => {
            if (!report?.students?.length) return toast.info("No data to export.");
            exportToCSV(report);
            toast.success("CSV exported successfully!");
          }}
          className="inline-flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-fit"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto">
          {loadingRoutes ? (
            <div className="w-full sm:w-44 h-9 bg-gray-100 animate-pulse rounded-xl" />
          ) : (
            <>
              <select
                value={selectedRouteId}
                onChange={handleRouteChange}
                disabled={loading}
                className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-44 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Routes</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeCode ? `${r.routeCode} – ` : ""}{r.routeName || r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </>
          )}
        </div>
      </div>

      {/* Summary Cards — skeleton while loading */}
      <div className="px-4 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-200">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-5 text-center animate-pulse">
                <div className="h-8 w-24 bg-gray-200 rounded-lg mx-auto mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded mx-auto" />
              </div>
            ))
          : [
              { label: "Students with Transport", value: report?.totalStudentsWithTransport ?? 0, blue: false },
              { label: "Total Monthly Revenue",   value: fmt(report?.totalMonthlyFeeRevenue ?? 0), blue: true },
              { label: "Total Annual Revenue",    value: fmt(report?.totalAnnualFeeRevenue  ?? 0), blue: true },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-200 p-5 text-center min-w-0">
                <p className={`text-2xl font-extrabold truncate ${c.blue ? "text-blue-600" : "text-gray-900"}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.label}</p>
              </div>
            ))
        }
      </div>

      {/* Route Breakdown + Frequency Distribution */}
      <div className="px-4 sm:px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100">

        {/* Route Breakdown */}
        <div className="min-w-0">
          <p className="font-bold text-gray-800 mb-3 text-sm">Route Breakdown</p>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : routeSummaryRows.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No route data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Route", "Students", "Monthly Rev.", "Annual Rev."].map((h) => (
                      <th key={h} className="pb-2 text-xs font-semibold text-gray-400 text-left pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {routeSummaryRows.map((r) => (
                    <tr key={r.routeId} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-700 text-xs whitespace-nowrap">{r.routeName}</td>
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

        {/* Frequency Distribution */}
        <div className="min-w-0">
          <p className="font-bold text-gray-800 mb-3 text-sm">Frequency Distribution</p>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : freqRows.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No frequency data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Frequency", "Students"].map((h) => (
                      <th key={h} className="pb-2 text-xs font-semibold text-gray-400 text-left pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {freqRows.map(([freq, count]) => (
                    <tr key={freq} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${freqColors[freq] ?? "bg-gray-100 text-gray-600"}`}>
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

      {/* ── Student Detail table — only on very wide screens (2xl: 1536px+) ── */}
      {/* Tablet 768px and laptop 1024px/1440px all get the card-grid below instead, so nothing gets cut off */}
      <div className="hidden 2xl:block overflow-x-auto w-full max-w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Student ID", "Name", "Class", "Route", "Stop", "Type", "Fee Plan", "Amount", "Frequency"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">

            {/* ListLoader */}
            {loading && <ListLoader rows={5} avatar={false} colSpanSet={9} />}

            {/* Empty */}
            {!loading && students.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                  No students found.
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading && students.map((s) => (
              <tr key={s.allocationId} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3.5 text-gray-500 text-xs font-medium">#{s.studentId}</td>
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-gray-900">{s.studentName}</p>
                  {s.studentRollNumber && (
                    <p className="text-xs text-gray-400 mt-0.5">Roll: {s.studentRollNumber}</p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-xs">
                  {s.className} {s.sectionName}
                </td>
                <td className="px-4 py-3.5">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {s.routeCode}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-600 text-xs">{s.stopName}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[s.pickupDropType] ?? "bg-gray-100 text-gray-600"}`}>
                    {typeLabel[s.pickupDropType] || s.pickupDropType}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-600 text-xs">{s.feePlanName}</td>
                <td className="px-4 py-3.5 font-semibold text-gray-800">{fmt(s.feeAmount)}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${freqColors[s.feeFrequency] ?? "bg-gray-100 text-gray-600"}`}>
                    {s.feeFrequency}
                  </span>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* ── Card grid — phone (1 col), tablet (2 col), laptop / laptop L (3 col) ── */}
      {/* Covers everything below 1536px, including the 768px tablet, 1024px and 1440px laptop cases */}
      <div className="2xl:hidden w-full">
        {loading && (
          <div className="py-2 px-4">
            <table className="w-full">
              <tbody>
                <ListLoader rows={5} avatar={false} colSpanSet={1} />
              </tbody>
            </table>
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No students found.</div>
        )}

        {!loading && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4 sm:p-5">
            {students.map((s) => <StudentCard key={s.allocationId} s={s} />)}
          </div>
        )}
      </div>

    </div>
  );
}
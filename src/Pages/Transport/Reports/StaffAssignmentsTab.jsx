import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { getStaffAssignmentReport } from "../../../Api/TransportAPI";
import ListLoader from "../../../Components/CommonComp/ListLoader";

const roleColors = {
  DRIVER:    "bg-blue-100 text-blue-700",
  ATTENDANT: "bg-teal-100 text-teal-700",
};

const ROLE_OPTIONS = ["All Roles", "DRIVER", "ATTENDANT"];

// ─── CSV Export ───────────────────────────────────────────────────
function exportToCSV(data) {
  if (!data?.length) return;

  const rows = [];
  rows.push(["Staff Assignment Report"]);
  rows.push([]);
  rows.push([
    "Name", "Role", "Contact", "License No.", "License Expiry",
    "License Status", "Total Routes", "Routes Assigned", "Total Students",
  ]);

  data.forEach((s) => {
    const licStatus = s.staffRole === "ATTENDANT"
      ? "N/A"
      : s.licenseExpired
        ? "EXPIRED"
        : s.licenseExpiringSoon
          ? "EXPIRING SOON"
          : "Valid";

    const routes        = s.assignedRoutes?.map((r) => r.routeCode).join(", ") || "—";
    const totalStudents = s.assignedRoutes?.reduce((sum, r) => sum + (r.studentsAllocated || 0), 0) || 0;

    rows.push([
      s.fullName,
      s.staffRole,
      s.contactNumber,
      s.licenseNumber  || "—",
      s.licenseExpiryDate || "—",
      licStatus,
      s.totalRoutesAssigned,
      routes,
      totalStudents,
    ]);
  });

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = "staff_assignment_report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function LicenseBadge({ s }) {
  if (s.staffRole === "ATTENDANT") {
    return <span className="text-gray-400 text-xs">N/A</span>;
  }
  if (s.licenseExpired) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
        <XCircle className="w-3.5 h-3.5" /> Expired
      </span>
    );
  }
  if (s.licenseExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200">
        <Clock className="w-3.5 h-3.5" /> Expiring Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
      <CheckCircle2 className="w-3.5 h-3.5" /> Valid
    </span>
  );
}

export default function StaffAssignmentsTab() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [roleFilter, setRoleFilter]   = useState("All Roles");
  const [onlyExpiring, setOnlyExpiring] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getStaffAssignmentReport({
        role:         roleFilter === "All Roles" ? "" : roleFilter,
        onlyExpiring,
      });
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff assignment report.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, onlyExpiring]);

  // Fetch on mount
  useEffect(() => {
    fetchReport();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchReport();
  }, [roleFilter, onlyExpiring]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          🧑‍✈️ Driver & Attendant Assignment Report
        </h2>
        <button
          onClick={() => {
            if (!data.length) return toast.info("No data to export.");
            exportToCSV(data);
            toast.success("CSV exported successfully!");
          }}
          className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-fit"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center gap-4">

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            disabled={loading}
            className="appearance-none pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-36 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expiring filter */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyExpiring}
            onChange={(e) => setOnlyExpiring(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
          />
          Show only expiring licences
        </label>

        {/* Refresh */}
        <button
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Name", "Role", "Contact", "License No.", "License Expiry", "Status", "Routes Assigned", "Students"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">

            {/* ListLoader */}
            {loading && <ListLoader rows={4} avatar={true} colSpanSet={8} />}

            {/* Empty */}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No staff records found.
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading && data.map((s) => {
              const totalStudents = s.assignedRoutes?.reduce((sum, r) => sum + (r.studentsAllocated || 0), 0) || 0;
              const rowBg = s.licenseExpired
                ? "bg-red-50/40 hover:bg-red-50"
                : s.licenseExpiringSoon
                  ? "bg-orange-50/40 hover:bg-orange-50"
                  : "hover:bg-blue-50/30";

              return (
                <tr key={s.staffId} className={`transition-colors ${rowBg}`}>
                  {/* Name */}
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900">{s.fullName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.status}</p>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.staffRole] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.staffRole}
                    </span>
                  </td>
                  {/* Contact */}
                  <td className="px-4 py-4 text-gray-600">{s.contactNumber}</td>
                  {/* License No */}
                  <td className="px-4 py-4 text-gray-600 font-mono text-xs">
                    {s.licenseNumber || "—"}
                  </td>
                  {/* License Expiry */}
                  <td className={`px-4 py-4 font-semibold text-sm ${s.licenseExpired ? "text-red-500" : s.licenseExpiringSoon ? "text-orange-500" : "text-gray-600"}`}>
                    {s.staffRole === "ATTENDANT" ? "—" : fmtDate(s.licenseExpiryDate)}
                  </td>
                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <LicenseBadge s={s} />
                  </td>
                  {/* Routes */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {s.assignedRoutes?.length > 0
                        ? s.assignedRoutes.map((r) => (
                            <span key={r.routeId} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {r.routeCode}
                            </span>
                          ))
                        : <span className="text-gray-400 italic text-xs">Unassigned</span>
                      }
                    </div>
                  </td>
                  {/* Students */}
                  <td className="px-4 py-4 font-semibold text-gray-700">{totalStudents}</td>
                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden divide-y divide-gray-100">

        {/* Mobile loading */}
        {loading && (
          <div className="py-4">
            <table className="w-full">
              <tbody>
                <ListLoader rows={4} avatar={true} colSpanSet={1} />
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile empty */}
        {!loading && data.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            No staff records found.
          </div>
        )}

        {/* Mobile data */}
        {!loading && data.map((s) => {
          const totalStudents = s.assignedRoutes?.reduce((sum, r) => sum + (r.studentsAllocated || 0), 0) || 0;
          const rowBg = s.licenseExpired
            ? "bg-red-50/40"
            : s.licenseExpiringSoon
              ? "bg-orange-50/40"
              : "";

          return (
            <div key={s.staffId} className={`px-4 py-4 space-y-2 ${rowBg}`}>
              {/* Name + Role */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-gray-900">{s.fullName}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{s.contactNumber}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.staffRole] ?? "bg-gray-100 text-gray-600"}`}>
                  {s.staffRole}
                </span>
              </div>

              {/* License info */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 items-center">
                {s.licenseNumber && (
                  <span className="font-mono">{s.licenseNumber}</span>
                )}
                {s.staffRole !== "ATTENDANT" && (
                  <span className={s.licenseExpired ? "text-red-500 font-bold" : s.licenseExpiringSoon ? "text-orange-500 font-bold" : ""}>
                    {fmtDate(s.licenseExpiryDate)}
                  </span>
                )}
              </div>

              {/* Status + Routes + Students */}
              <div className="flex items-center gap-2 flex-wrap">
                <LicenseBadge s={s} />
                {s.assignedRoutes?.length > 0
                  ? s.assignedRoutes.map((r) => (
                      <span key={r.routeId} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {r.routeCode}
                      </span>
                    ))
                  : <span className="italic text-gray-400 text-xs">Unassigned</span>
                }
                <span className="text-gray-500 text-xs">{totalStudents} students</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
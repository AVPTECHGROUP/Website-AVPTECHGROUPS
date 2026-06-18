import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
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
    return <span className="text-gray-400 text-xs font-medium">N/A</span>;
  }
  if (s.licenseExpired) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-200 whitespace-nowrap shrink-0">
        <XCircle className="w-3 h-3" /> Expired
      </span>
    );
  }
  if (s.licenseExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-orange-200 whitespace-nowrap shrink-0">
        <Clock className="w-3 h-3" /> Expiring
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-200 whitespace-nowrap shrink-0">
      <CheckCircle2 className="w-3 h-3" /> Valid
    </span>
  );
}

// ─── Staff Card (used for mobile + laptop grid views) ───────────────
function StaffCard({ s }) {
  const totalStudents = s.assignedRoutes?.reduce((sum, r) => sum + (r.studentsAllocated || 0), 0) || 0;
  const rowBg = s.licenseExpired
    ? "bg-red-50/40 border-red-100"
    : s.licenseExpiringSoon
      ? "bg-orange-50/40 border-orange-100"
      : "bg-white border-gray-100 hover:bg-gray-50/60";

  return (
    <div className={`rounded-xl border p-4 flex flex-col space-y-3 transition-colors ${rowBg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-bold text-gray-900 block truncate text-sm">{s.fullName}</span>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{s.contactNumber} • <span className="capitalize">{s.status?.toLowerCase()}</span></p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${roleColors[s.staffRole] ?? "bg-gray-100 text-gray-600"}`}>
          {s.staffRole}
        </span>
      </div>

      {s.staffRole !== "ATTENDANT" && (
        <div className="grid grid-cols-2 gap-2 bg-gray-50/70 p-2.5 rounded-xl text-xs border border-gray-100">
          <div className="min-w-0">
            <span className="text-gray-400 block mb-0.5">License Number</span>
            <span className="font-mono text-gray-700 font-medium break-all">{s.licenseNumber || "—"}</span>
          </div>
          <div className="min-w-0">
            <span className="text-gray-400 block mb-0.5">Expiry Date</span>
            <span className={`font-semibold ${s.licenseExpired ? "text-red-600" : s.licenseExpiringSoon ? "text-orange-600" : "text-gray-700"}`}>
              {fmtDate(s.licenseExpiryDate)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <LicenseBadge s={s} />
          {s.assignedRoutes?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {s.assignedRoutes.map((r) => (
                <span key={r.routeId} className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {r.routeCode}
                </span>
              ))}
            </div>
          ) : (
            <span className="italic text-gray-400 text-xs px-1">Unassigned</span>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-lg inline-block">
            {totalStudents} <span className="text-gray-500 font-medium text-[11px]">students</span>
          </span>
        </div>
      </div>
    </div>
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
        role:          roleFilter === "All Roles" ? "" : roleFilter,
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

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full flex flex-col min-w-0 max-w-full">

      {/* Header */}
      <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base break-words">
          🧑‍✈️ Driver & Attendant Assignment Report
        </h2>
        <button
          onClick={() => {
            if (!data.length) return toast.info("No data to export.");
            exportToCSV(data);
            toast.success("CSV exported successfully!");
          }}
          className="inline-flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-fit shadow-sm">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">

        {/* Role filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            disabled={loading}
            className="appearance-none w-full pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-36 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expiring filter */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none py-1 sm:py-0">
          <input
            type="checkbox"
            checked={onlyExpiring}
            onChange={(e) => setOnlyExpiring(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
          />
          <span className="whitespace-nowrap">Show only expiring licences</span>
        </label>

        {/* Refresh */}
        <button
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer w-full sm:w-auto sm:ml-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* ── Full data table — only on very wide screens (2xl: 1536px+) ── */}
      {/* Laptops (1024–1535px) get the card-grid layout below, so nothing ever gets cut off */}
      <div className="hidden 2xl:block w-full overflow-x-auto max-w-full">
        <table className="w-full text-xs text-left table-auto">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Name", "Role", "Contact", "License No.", "License Expiry", "Status", "Routes Assigned", "Students"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {loading && <ListLoader rows={4} avatar={true} colSpanSet={8} />}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No staff records found.
                </td>
              </tr>
            )}

            {!loading && data.map((s) => {
              const totalStudents = s.assignedRoutes?.reduce((sum, r) => sum + (r.studentsAllocated || 0), 0) || 0;
              const rowBg = s.licenseExpired
                ? "bg-red-50/40 hover:bg-red-50"
                : s.licenseExpiringSoon
                  ? "bg-orange-50/40 hover:bg-orange-50"
                  : "hover:bg-blue-50/30";

              return (
                <tr key={s.staffId} className={`transition-colors ${rowBg}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-900 whitespace-nowrap">{s.fullName}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{s.status}</p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${roleColors[s.staffRole] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.staffRole}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{s.contactNumber}</td>
                  <td className="px-4 py-3.5 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                    {s.licenseNumber || "—"}
                  </td>
                  <td className={`px-4 py-3.5 font-semibold whitespace-nowrap ${s.licenseExpired ? "text-red-500" : s.licenseExpiringSoon ? "text-orange-500" : "text-gray-600"}`}>
                    {s.staffRole === "ATTENDANT" ? "—" : fmtDate(s.licenseExpiryDate)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <LicenseBadge s={s} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {s.assignedRoutes?.length > 0
                        ? s.assignedRoutes.map((r) => (
                            <span key={r.routeId} className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              {r.routeCode}
                            </span>
                          ))
                        : <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-700 whitespace-nowrap">{totalStudents}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Card layout — mobile (1 col), tablet (1 col), laptop/desktop (2 col) ── */}
      {/* Covers everything below 1536px, including the 1024px laptop case */}
      <div className="2xl:hidden w-full">
        {loading && (
          <div className="py-4 px-4">
            <table className="w-full">
              <tbody>
                <ListLoader rows={3} avatar={true} colSpanSet={1} />
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            No staff records found.
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-4 sm:p-5">
            {data.map((s) => <StaffCard key={s.staffId} s={s} />)}
          </div>
        )}
      </div>

    </div>
  );
}
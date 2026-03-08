import { useState } from "react";
import { RefreshCw, Download, CheckCircle2, XCircle } from "lucide-react";

const staff = [
  { name: "Ramesh Kumar", role: "DRIVER",    contact: "9876543210", licNo: "MH1220120001", licExpiry: "15 Mar 2027", expired: false, route: "RT-001", students: 38 },
  { name: "Suresh Patil",  role: "DRIVER",    contact: "9123456780", licNo: "MH1220110002", licExpiry: "20 Nov 2025", expired: true,  route: "RT-002", students: 20 },
  { name: "Sunita Jadhav", role: "ATTENDANT", contact: "9988776655", licNo: "—",            licExpiry: "—",          expired: false, route: "RT-001", students: 38 },
  { name: "Pooja Sharma",  role: "ATTENDANT", contact: "9977665544", licNo: "—",            licExpiry: "—",          expired: false, route: "RT-002", students: 20 },
];

const roleColors = { DRIVER: "bg-blue-100 text-blue-700", ATTENDANT: "bg-teal-100 text-teal-700" };
const ROLE_OPTIONS = ["All Roles", "DRIVER", "ATTENDANT"];

export default function DriverAssignmentsTab() {
  const [roleFilter, setRoleFilter]   = useState("All Roles");
  const [onlyExpiring, setOnlyExpiring] = useState(false);

  const data = staff.filter(s => {
    const matchRole = roleFilter === "All Roles" || s.role === roleFilter;
    const matchExp  = !onlyExpiring || s.expired;
    return matchRole && matchExp;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          🧑‍✈️ Driver & Attendant Assignment Report
        </h2>
        <button className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center gap-4">
        <div className="relative">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-30">
            {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={onlyExpiring} onChange={e => setOnlyExpiring(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600" />
          Show only expiring licences
        </label>
        <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Name", "Role", "Contact", "License No.", "License Expiry", "Flag", "Routes Assigned", "Total Students"].map(h => (
                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No records found</td></tr>
            ) : data.map(s => (
              <tr key={s.name} className={`transition-colors ${s.expired ? "bg-yellow-50/60 hover:bg-yellow-50" : "hover:bg-blue-50/30"}`}>
                <td className="px-4 py-4 font-bold text-gray-900">{s.name}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.role]}`}>{s.role}</span>
                </td>
                <td className="px-4 py-4 text-gray-600">{s.contact}</td>
                <td className="px-4 py-4 text-gray-600 font-mono text-xs">{s.licNo}</td>
                <td className={`px-4 py-4 font-semibold ${s.expired ? "text-red-500" : "text-gray-600"}`}>{s.licExpiry}</td>
                <td className="px-4 py-4">
                  {s.role === "ATTENDANT"
                    ? <span className="text-gray-400 text-xs">N/A</span>
                    : s.expired
                      ? <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> EXPIRED
                        </span>
                      : <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                  }
                </td>
                <td className="px-4 py-4">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{s.route}</span>
                </td>
                <td className="px-4 py-4 font-semibold text-gray-700">{s.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden divide-y divide-gray-100">
        {data.map(s => (
          <div key={s.name} className={`px-4 py-4 space-y-2 ${s.expired ? "bg-yellow-50/60" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-gray-900">{s.name}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.role]}`}>{s.role}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span>{s.contact}</span>
              {s.licNo !== "—" && <span className="font-mono">{s.licNo}</span>}
              <span className={s.expired ? "text-red-500 font-bold" : ""}>{s.licExpiry}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {s.role === "ATTENDANT"
                ? <span className="text-gray-400 text-xs">Licence: N/A</span>
                : s.expired
                  ? <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200"><XCircle className="w-3 h-3" /> EXPIRED</span>
                  : <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200"><CheckCircle2 className="w-3 h-3" /> Valid</span>
              }
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{s.route}</span>
              <span className="text-gray-500 text-xs">{s.students} students</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState } from "react";
import { RefreshCw, Download, AlertTriangle } from "lucide-react";

const vehicles = [
  { no: "MH12AB1234", type: "BUS",     cap: 40, alloc: 38, insExpiry: "28 Mar 2026", insWarn: true,  fitExpiry: "15 Jun 2026", fitWarn: false, route: "RT-001" },
  { no: "MH12CD5678", type: "MINI BUS",cap: 20, alloc: 20, insExpiry: "15 Apr 2026", insWarn: false, fitExpiry: "20 May 2026", fitWarn: false, route: "RT-002" },
  { no: "MH12EF9012", type: "VAN",     cap: 10, alloc: 0,  insExpiry: "30 Sep 2026", insWarn: false, fitExpiry: "12 Aug 2026", fitWarn: false, route: null },
];

const typeColors = { BUS: "bg-blue-100 text-blue-700", "MINI BUS": "bg-teal-100 text-teal-700", VAN: "bg-orange-100 text-orange-700" };

function UtilBar({ alloc, cap }) {
  const pct = cap > 0 ? Math.round((alloc / cap) * 100) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : pct > 0 ? "bg-blue-500" : "bg-gray-200";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 sm:w-32 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold ${pct >= 100 ? "text-red-600" : pct >= 80 ? "text-orange-500" : "text-gray-500"}`}>{pct}%</span>
    </div>
  );
}

export default function VehicleCapacityTab() {
  const [onlyOver, setOnlyOver]     = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);

  const data = onlyOver ? vehicles.filter(v => v.alloc >= v.cap) : vehicles;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          🚌 Vehicle Capacity Utilisation Report
        </h2>
        <button className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={onlyOver} onChange={e => setOnlyOver(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600" />
          Show only over-capacity vehicles
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          Expiry alert within
          <input type="number" value={expiryDays} onChange={e => setExpiryDays(e.target.value)} min={1}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-200" />
          days
        </div>
        <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Vehicle No.", "Type", "Capacity", "Allocated", "Available", "Utilisation", "Insurance Expiry", "Fitness Expiry", "Routes"].map(h => (
                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(v => {
              const avail = v.cap - v.alloc;
              const pct   = Math.round((v.alloc / v.cap) * 100);
              return (
                <tr key={v.no} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-4 font-bold text-gray-900">{v.no}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[v.type]}`}>{v.type}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{v.cap}</td>
                  <td className="px-4 py-4 text-gray-700">{v.alloc}</td>
                  <td className="px-4 py-4">
                    <span className={`font-semibold ${avail === 0 ? "text-orange-500 flex items-center gap-1" : avail > 0 ? "text-green-600" : "text-red-500"}`}>
                      {avail}{avail === 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                    </span>
                  </td>
                  <td className="px-4 py-4"><UtilBar alloc={v.alloc} cap={v.cap} /></td>
                  <td className="px-4 py-4">
                    <span className={v.insWarn ? "text-orange-500 font-semibold flex items-center gap-1" : "text-gray-600"}>
                      {v.insWarn && <AlertTriangle className="w-3.5 h-3.5" />}{v.insExpiry}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{v.fitExpiry}</td>
                  <td className="px-4 py-4">
                    {v.route
                      ? <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{v.route}</span>
                      : <span className="text-gray-400 italic text-xs">Unassigned</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden divide-y divide-gray-100">
        {data.map(v => {
          const avail = v.cap - v.alloc;
          return (
            <div key={v.no} className="px-4 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{v.no}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[v.type]}`}>{v.type}</span>
              </div>
              <UtilBar alloc={v.alloc} cap={v.cap} />
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span>Cap: <b>{v.cap}</b></span>
                <span>Alloc: <b>{v.alloc}</b></span>
                <span className={avail === 0 ? "text-orange-500 font-bold" : "text-green-600 font-bold"}>Avail: {avail}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className={v.insWarn ? "text-orange-500 font-semibold" : ""}>Ins: {v.insExpiry}</span>
                <span>Fit: {v.fitExpiry}</span>
                {v.route ? <span className="bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full">{v.route}</span>
                          : <span className="italic text-gray-400">Unassigned</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
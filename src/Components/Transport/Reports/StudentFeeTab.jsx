import { useState } from "react";
import { Download } from "lucide-react";

const ROUTES_OPT = ["All Routes", "RT-001 – North Zone", "RT-002 – South Zone"];

const typeColors = { "BOTH": "bg-blue-100 text-blue-700", "PICKUP ONLY": "bg-teal-100 text-teal-700", "DROP ONLY": "bg-purple-100 text-purple-700" };
const freqColors = { "MONTHLY": "bg-blue-100 text-blue-700", "ANNUALLY": "bg-orange-100 text-orange-700", "QUARTERLY": "bg-purple-100 text-purple-700" };

const allStudents = [
  { id: "#101", name: "Aarav Sharma",   route: "RT-001", stop: "Sunrise Colony", type: "BOTH",        feePlan: "Route A Monthly", amount: 1200, freq: "MONTHLY",  monthly: 1200 },
  { id: "#102", name: "Priya Patel",    route: "RT-001", stop: "Aundh Road",     type: "PICKUP ONLY", feePlan: "Route A Monthly", amount: 1200, freq: "MONTHLY",  monthly: 1200 },
  { id: "#103", name: "Rohan Verma",    route: "RT-002", stop: "Camp Road",      type: "DROP ONLY",   feePlan: "Route B Monthly", amount: 900,  freq: "MONTHLY",  monthly: 900  },
  { id: "#108", name: "Dev Kapoor",     route: "RT-001", stop: "Main Gate",      type: "BOTH",        feePlan: "Annual Slab 5km", amount: 8000, freq: "ANNUALLY", monthly: 667  },
  { id: "#104", name: "Meera Singh",    route: "RT-001", stop: "Main Gate",      type: "PICKUP ONLY", feePlan: "Route A Monthly", amount: 1200, freq: "MONTHLY",  monthly: 1200 },
  { id: "#105", name: "Arjun Nair",     route: "RT-001", stop: "Sunrise Colony", type: "BOTH",        feePlan: "Route A Monthly", amount: 1200, freq: "MONTHLY",  monthly: 1200 },
];

const summaryStats = { students: 58, monthlyRev: 55200, annualRev: 662400 };
const routeBreakdown = [
  { code: "RT-001 – North Zone", students: 38, monthly: 45600, annual: 547200 },
  { code: "RT-002 – South Zone", students: 20, monthly: 18000, annual: 216000 },
];
const freqDist = [
  { freq: "MONTHLY",  students: 52 },
  { freq: "ANNUALLY", students: 4  },
  { freq: null,       students: 2  },
];

function fmt(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }

export default function StudentFeeTab() {
  const [routeFilter, setRouteFilter] = useState("All Routes");
  const [generated, setGenerated]     = useState(true);

  const data = routeFilter === "All Routes"
    ? allStudents
    : allStudents.filter(s => routeFilter.startsWith(s.route));

  const hiddenCount = summaryStats.students - data.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          🪪 Student Transport Fee Report
        </h2>
        <button className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select value={routeFilter} onChange={e => setRouteFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-40">
            {ROUTES_OPT.map(r => <option key={r}>{r}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button onClick={() => setGenerated(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          Generate
        </button>
      </div>

      {generated && (
        <>
          {/* Summary Cards */}
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-200">
            {[
              { label: "Students with Transport", value: summaryStats.students, blue: false },
              { label: "Total Monthly Revenue",   value: fmt(summaryStats.monthlyRev),   blue: true },
              { label: "Total Annual Revenue",    value: fmt(summaryStats.annualRev),    blue: true },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-gray-300 p-5 text-center">
                <p className={`text-2xl font-extrabold ${c.blue ? "text-blue-600" : "text-gray-900"}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Breakdown + Distribution */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100">
            {/* Route Breakdown */}
            <div>
              <p className="font-bold text-gray-800 mb-3 text-sm">Route Breakdown</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Route", "Students", "Monthly Rev.", "Annual Rev."].map(h => (
                      <th key={h} className="pb-2 text-xs font-semibold text-gray-400 text-left pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {routeBreakdown.map(r => (
                    <tr key={r.code} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-700 text-xs">{r.code}</td>
                      <td className="py-2.5 pr-4 font-semibold text-gray-800">{r.students}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{fmt(r.monthly)}</td>
                      <td className="py-2.5 text-gray-700">{fmt(r.annual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Frequency Distribution */}
            <div>
              <p className="font-bold text-gray-800 mb-3 text-sm">Frequency Distribution</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Frequency", "Students"].map(h => (
                      <th key={h} className="pb-2 text-xs font-semibold text-gray-400 text-left pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {freqDist.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        {f.freq
                          ? <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${freqColors[f.freq] ?? "bg-gray-100 text-gray-600"}`}>{f.freq}</span>
                          : <span className="text-gray-400 italic text-xs">No Fee Plan</span>
                        }
                      </td>
                      <td className="py-2.5 font-semibold text-gray-800">{f.students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Detail Table — Desktop */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Student ID", "Name", "Route", "Stop", "Type", "Fee Plan", "Amount", "Frequency", "Monthly Equiv."].map(h => (
                    <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-gray-500 text-xs font-medium">{s.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{s.route}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{s.stop}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[s.type] ?? "bg-gray-100 text-gray-600"}`}>{s.type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{s.feePlan}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{fmt(s.amount)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${freqColors[s.freq] ?? "bg-gray-100 text-gray-600"}`}>{s.freq}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{fmt(s.monthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {data.map(s => (
              <div key={s.id} className="px-4 py-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{s.name} <span className="text-xs text-gray-400 font-normal">{s.id}</span></span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{s.route}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`font-semibold px-2 py-0.5 rounded-full ${typeColors[s.type]}`}>{s.type}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full ${freqColors[s.freq]}`}>{s.freq}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{s.feePlan}</span>
                  <span className="font-bold text-gray-800">{fmt(s.amount)}</span>
                  <span>Monthly: {fmt(s.monthly)}</span>
                </div>
              </div>
            ))}
            {hiddenCount > 0 && (
              <div className="px-4 py-4 text-center text-sm text-blue-500 font-medium">+ {hiddenCount} more rows…</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
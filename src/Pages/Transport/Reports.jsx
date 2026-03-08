import { useState } from "react";
import { FileText, Download, ChevronDown } from "lucide-react";
import VehicleCapacityTab   from "../../Components/Transport/Reports/VehicleCapaityTab";
import DriverAssignmentsTab from "../../Components/Transport/Reports/DriverAssignmentsTab";
import StudentFeeTab        from "../../Components/Transport/Reports/StudentFeeTab";

// ─── Route Student List Data ──────────────────────────────────────
const ROUTES_OPT = [
  { label: "RT-001 – Route A North Zone", value: "RT-001" },
  { label: "RT-002 – Route B South Zone", value: "RT-002" },
];

const routeMeta = {
  "RT-001": {
    name: "Route A – North Zone (RT-001)", vehicle: "MH12AB1234 (BUS)",
    driver: "Ramesh Kumar · 9876543210", attendant: "Sunita Jadhav · 9988776655",
    time: "07:00 → 14:30", alloc: 38, cap: 40,
  },
  "RT-002": {
    name: "Route B – South Zone (RT-002)", vehicle: "MH12CD5678 (MINI BUS)",
    driver: "Suresh Patil · 9123456780", attendant: "Pooja Sharma · 9977665544",
    time: "07:15 → 14:45", alloc: 20, cap: 20,
  },
};

const stopsData = {
  "RT-001": [
    { order: 1, name: "Main Gate", addr: "School Main Gate, ABC Nagar", time: "07:00",
      students: [
        { id: "#101", name: "Aarav Sharma", type: "BOTH",        plan: "Route A Monthly", amount: "₹1,200/mo" },
        { id: "#104", name: "Meera Singh",  type: "PICKUP ONLY", plan: "Route A Monthly", amount: "₹1,200/mo" },
        { id: "#108", name: "Dev Kapoor",   type: "BOTH",        plan: "Annual Slab 5km", amount: "₹8,000/yr" },
      ],
    },
    { order: 2, name: "Sunrise Colony", addr: "Sector 4", time: "07:15",
      students: [
        { id: "#102", name: "Priya Patel", type: "DROP ONLY", plan: "Route A Monthly", amount: "₹1,200/mo" },
        { id: "#105", name: "Arjun Nair",  type: "BOTH",      plan: "Route A Monthly", amount: "₹1,200/mo" },
      ],
      extra: 3,
    },
  ],
  "RT-002": [
    { order: 1, name: "City Centre", addr: "City Centre Bus Stop", time: "07:15",
      students: [
        { id: "#103", name: "Rohan Verma", type: "DROP ONLY", plan: "Route B Monthly", amount: "₹900/mo" },
        { id: "#106", name: "Kavya Iyer",  type: "BOTH",      plan: "Route B Monthly", amount: "₹900/mo" },
      ],
    },
    { order: 2, name: "South Market", addr: "South Market Gate", time: "07:30",
      students: [
        { id: "#107", name: "Nikhil Shah", type: "PICKUP ONLY", plan: "Route B Monthly", amount: "₹900/mo" },
      ],
    },
  ],
};

const typeColors = {
  "BOTH":        "bg-blue-100 text-blue-700",
  "PICKUP ONLY": "bg-teal-100 text-teal-700",
  "DROP ONLY":   "bg-purple-100 text-purple-700",
};

// ─── Route Student List ───────────────────────────────────────────
function RouteStudentList() {
  const [selectedRoute, setSelectedRoute] = useState("RT-001");
  const meta  = routeMeta[selectedRoute];
  const stops = stopsData[selectedRoute] || [];
  const pct   = Math.round((meta.alloc / meta.cap) * 100);
  const utilColor = pct >= 100 ? "text-red-500" : pct >= 80 ? "text-orange-500" : "text-blue-600";

  const metaFields = [
    { label: "Route",         val: meta.name      },
    { label: "Vehicle",       val: meta.vehicle    },
    { label: "Driver",        val: meta.driver     },
    { label: "Attendant",     val: meta.attendant  },
    { label: "Pickup / Drop", val: meta.time       },
    { label: "Utilisation",
      val: <span className={`font-extrabold text-sm ${utilColor}`}>{meta.alloc}/{meta.cap} ({pct}%)</span> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
          📋 Route-wise Student List
        </h2>
        <button className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 sm:flex-none">
          <select
            value={selectedRoute}
            onChange={e => setSelectedRoute(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-60"
          >
            {ROUTES_OPT.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        <button className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto">
          Generate Report
        </button>
      </div>

      {/* Route Meta Banner */}
      <div className="mx-4 sm:mx-6 my-4 rounded-xl bg-blue-50 border border-blue-100 px-4 sm:px-5 py-4">
        {/* 2-col on mobile, 3-col on sm, 6-col on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {metaFields.map(c => (
            <div key={c.label}>
              <p className="text-gray-400 mb-0.5">{c.label}</p>
              <p className="font-bold text-gray-800 text-xs wrap-break-word">{c.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-5">
        {stops.map(stop => (
          <div key={stop.order} className="rounded-xl border border-gray-100 overflow-hidden">

            {/* Stop header */}
            <div className="flex items-start sm:items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 gap-2">
              <div className="flex items-start sm:items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 sm:mt-0">
                  {stop.order}
                </span>
                <div>
                  <span className="font-bold text-gray-900 text-sm">{stop.name}</span>
                  {/* Show address & time stacked on mobile, inline on sm+ */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 mt-0.5 sm:mt-0">
                    <span className="text-gray-400 text-xs">– {stop.addr}</span>
                    <span className="text-gray-400 text-xs sm:ml-1">| ⏱ {stop.time} pickup</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-bold shrink-0 mt-0.5 sm:mt-0">
                {stop.students.length}{stop.extra ? `+${stop.extra}` : ""} students
              </span>
            </div>

            {/* Student table — desktop (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Student ID", "Student Name", "Pickup/Drop", "Fee Plan", "Amount"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-400 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stop.students.map(s => (
                    <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-medium">{s.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[s.type] ?? "bg-gray-100 text-gray-600"}`}>{s.type}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.plan}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{s.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Student cards — mobile (xs only) */}
            <div className="sm:hidden divide-y divide-gray-50">
              {stop.students.map(s => (
                <div key={s.id} className="px-4 py-3 space-y-1.5">
                  {/* Name + ID + badge row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.id}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${typeColors[s.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.type}
                    </span>
                  </div>
                  {/* Plan + amount row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">{s.plan}</span>
                    <span className="text-xs font-semibold text-gray-800">{s.amount}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab Config ───────────────────────────────────────────────────
const TABS = [
  { id: "route",   label: "Route Student List", emoji: "📋" },
  { id: "vehicle", label: "Vehicle Capacity",   emoji: "🚌" },
  { id: "driver",  label: "Driver Assignments", emoji: "🧑‍✈️" },
  { id: "fee",     label: "Student Fee Report", emoji: "🪪" },
];

// ─── Main ─────────────────────────────────────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab] = useState("route");

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">

      {/* ── Page Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500 shrink-0" />
          Reports Management
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
          View route-wise student lists, vehicle capacity, driver assignments, and student fee reports.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* ── Sub Tabs ── */}
        {/* Mobile: 2×2 grid | sm+: horizontal scrollable tab bar */}
        <div className="mb-4 sm:mb-5">

          {/* Mobile tab grid (xs only) */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all border
                  ${activeTab === tab.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                  }`}
              >
                <span>{tab.emoji}</span>
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop tab bar (sm+) */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="flex gap-1 min-w-max border-b border-gray-200">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px
                    ${activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-white rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "route"   && <RouteStudentList />}
        {activeTab === "vehicle" && <VehicleCapacityTab />}
        {activeTab === "driver"  && <DriverAssignmentsTab />}
        {activeTab === "fee"     && <StudentFeeTab />}

      </div>
    </div>
  );
}
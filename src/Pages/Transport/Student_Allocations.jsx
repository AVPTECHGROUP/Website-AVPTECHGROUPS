import { useState } from "react";
import {
  GraduationCap, Search, ChevronDown, Plus, Pencil,
  ToggleLeft, ToggleRight, SlidersHorizontal,
} from "lucide-react";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import AllocateStudentCard from "../../Components/Transport/AllocateStudentCards";

const initialAllocations = [
  {
    id: 1, studentId: "#101", studentName: "Aarav Sharma",
    route: "RT-001", stop: "Sunrise Colony", type: "BOTH",
    feePlan: "Route A Monthly", amount: "₹1,200",
    effectiveFrom: "01 Apr 2025", status: "ACTIVE",
  },
  {
    id: 2, studentId: "#102", studentName: "Priya Patel",
    route: "RT-001", stop: "Aundh Road", type: "PICKUP ONLY",
    feePlan: "Route A Monthly", amount: "₹1,200",
    effectiveFrom: "01 Apr 2025", status: "ACTIVE",
  },
  {
    id: 3, studentId: "#103", studentName: "Rohan Verma",
    route: "RT-002", stop: "Camp Road", type: "DROP ONLY",
    feePlan: "Route B Monthly", amount: "₹900",
    effectiveFrom: "01 Jun 2025", status: "ACTIVE",
  },
  {
    id: 4, studentId: "#104", studentName: "Sneha Kulkarni",
    route: "RT-001", stop: "Main Gate", type: "BOTH",
    feePlan: "Route A Monthly", amount: "₹1,200",
    effectiveFrom: "01 Apr 2025", status: "INACTIVE",
  },
  {
    id: 5, studentId: "#105", studentName: "Arjun Mehta",
    route: "RT-002", stop: "City Centre", type: "PICKUP ONLY",
    feePlan: "Route B Monthly", amount: "₹900",
    effectiveFrom: "15 May 2025", status: "ACTIVE",
  },
];

const typeColors = {
  "BOTH":        "bg-blue-100 text-blue-700",
  "PICKUP ONLY": "bg-teal-100 text-teal-700",
  "DROP ONLY":   "bg-purple-100 text-purple-700",
};

const ROUTE_OPTIONS  = ["All Routes", "RT-001", "RT-002"];
const STOP_OPTIONS   = ["All Stops", "Main Gate", "Sunrise Colony", "Aundh Road", "Model Colony Chowk", "City Centre", "South Market", "Railway Colony", "Camp Road"];
const ITEMS_PER_PAGE = 5;

// ─── Main ─────────────────────────────────────────────────────────
export default function Student_Allocations() {
  const [allocations, setAllocations]   = useState(initialAllocations);
  const [search, setSearch]             = useState("");
  const [routeFilter, setRouteFilter]   = useState("All Routes");
  const [stopFilter, setStopFilter]     = useState("All Stops");
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);

  // Save new allocation
  const handleSave = (data) => {
    const routeCode = data.route.split(" – ")[0];
    const newEntry = {
      id: allocations.length + 1,
      studentId: `#${100 + allocations.length + 1}`,
      studentName: data.student.split(" – ")[1] || data.student,
      route: routeCode,
      stop: data.stop,
      type: data.pickupType,
      feePlan: data.feePlan,
      amount: "₹—",
      effectiveFrom: data.effectiveFrom
        ? new Date(data.effectiveFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—",
      status: "ACTIVE",
    };
    setAllocations((prev) => [newEntry, ...prev]);
  };

  // Toggle status
  const handleAction = (id, value) => {
    if (value === "toggle") {
      setAllocations((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: a.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : a
        )
      );
    }
  };

  // Filter
  const filtered = allocations.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.studentName.toLowerCase().includes(q) ||
      a.studentId.toLowerCase().includes(q);
    const matchRoute = routeFilter === "All Routes" || a.route === routeFilter;
    const matchStop  = stopFilter  === "All Stops"  || a.stop  === stopFilter;
    return matchSearch && matchRoute && matchStop;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">

      {/* ── Page Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-purple-600" />
          Student Allocation Management
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Allocate students to transport routes and stops, manage pickup/drop preferences and fee plans.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── Table Header ── */}
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                Student Transport Allocations
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} allocation{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm w-fit"
            >
              <Plus className="w-4 h-4" />
              Allocate Student
            </button>
          </div>

          {/* ── Filters ── */}
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search student name, ID…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Route Filter */}
              <div className="relative">
                <select value={routeFilter} onChange={(e) => { setRouteFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-32.5">
                  {ROUTE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              {/* Stop Filter */}
              <div className="relative">
                <select value={stopFilter} onChange={(e) => { setStopFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-32.5">
                  {STOP_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Desktop Table ── */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 ">
                  {["Student ID", "Student Name", "Route", "Stop", "Type", "Fee Plan", "Amount", "Effective From", "Status", "Actions"].map((h) => (
                    <th key={h} className={`text-center px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center" : "text-center"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-gray-400">
                      <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                      <p className="font-medium">No allocations found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((a) => (
                    <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Student ID */}
                      <td className="px-4 py-4 text-gray-500 text-xs text-center font-medium">{a.studentId}</td>
                      {/* Name */}
                      <td className="px-4 py-4 font-bold text-nowrap text-gray-900">{a.studentName}</td>
                      {/* Route */}
                      <td className="px-4 py-4">
                        <span className="inline-flex text-nowrap items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          {a.route}
                        </span>
                      </td>
                      {/* Stop */}
                      <td className="px-4 py-4 text-gray-600 text-sm">{a.stop}</td>
                      {/* Type */}
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs text-nowrap font-semibold px-2.5 py-1 rounded-full ${typeColors[a.type] ?? "bg-gray-100 text-gray-600"}`}>
                          {a.type}
                        </span>
                      </td>
                      {/* Fee Plan */}
                      <td className="px-4 py-4 text-gray-600 text-sm">{a.feePlan}</td>
                      {/* Amount */}
                      <td className="px-4 py-4 font-semibold text-gray-800">{a.amount}</td>
                      {/* Effective From */}
                      <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">{a.effectiveFrom}</td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        {a.status === "ACTIVE"
                          ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> Active
                            </span>
                          : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                            </span>
                        }
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <ActionDropDownComp
                          onAction={(val) => handleAction(a.id, val)}
                          actionOptions={[
                            { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                            {
                              label: a.status === "ACTIVE" ? "Deactivate" : "Activate",
                              value: "toggle",
                              icon: a.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                              bg: "bg-white",
                              text: a.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                              hover: a.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="font-medium text-sm">No allocations found</p>
              </div>
            ) : (
              paginated.map((a) => (
                <div key={a.id} className="px-4 py-4 space-y-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{a.studentName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.studentId}</p>
                    </div>
                    {a.status === "ACTIVE"
                      ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                        </span>
                      : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                        </span>
                    }
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full">{a.route}</span>
                    <span className="text-gray-500">{a.stop}</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full ${typeColors[a.type] ?? "bg-gray-100 text-gray-600"}`}>{a.type}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{a.feePlan}</span>
                    <span className="font-semibold text-gray-700">{a.amount}</span>
                    <span>From: {a.effectiveFrom}</span>
                  </div>
                  <div className="pt-1">
                    <ActionDropDownComp
                      onAction={(val) => handleAction(a.id, val)}
                      actionOptions={[
                        { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                        {
                          label: a.status === "ACTIVE" ? "Deactivate" : "Activate",
                          value: "toggle",
                          icon: a.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                          bg: "bg-white",
                          text: a.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                          hover: a.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
                        },
                      ]}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-gray-400 font-medium">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} allocation{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronDown className="w-3.5 h-3.5 rotate-90" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${safePage === p ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal ── */}
      <AllocateStudentCard
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}
import { useState } from "react";
import {
  Users, Search, ChevronDown, AlertTriangle, CheckCircle2,
  Pencil, ToggleLeft, ToggleRight, Plus, SlidersHorizontal,
  XCircle, Phone,
} from "lucide-react";
import AddStaffCard from "../../Components/Transport/AddStaffCard";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";

const initialStaff = [
  {
    id: 1, name: "Ramesh Kumar", role: "DRIVER",
    contact: "9876543210", licenseNo: "MH1220120001",
    licenseExpiry: "15 Mar 2027", licenseExpired: false,
    assignedRoute: "RT-001", status: "ACTIVE",
  },
  {
    id: 2, name: "Suresh Patil", role: "DRIVER",
    contact: "9123456780", licenseNo: "MH1220110002",
    licenseExpiry: "20 Nov 2025", licenseExpired: true,
    assignedRoute: "RT-002", status: "ACTIVE",
  },
  {
    id: 3, name: "Sunita Jadhav", role: "ATTENDANT",
    contact: "9988776655", licenseNo: "—",
    licenseExpiry: "—", licenseExpired: false,
    assignedRoute: "RT-001", status: "ACTIVE",
  },
  {
    id: 4, name: "Pooja Sharma", role: "ATTENDANT",
    contact: "9977665544", licenseNo: "—",
    licenseExpiry: "—", licenseExpired: false,
    assignedRoute: "RT-002", status: "ACTIVE",
  },
];

const roleColors = {
  DRIVER:    "bg-blue-100 text-blue-700",
  ATTENDANT: "bg-teal-100 text-teal-700",
};

const ROLE_OPTIONS   = ["All Roles", "DRIVER", "ATTENDANT"];
const STATUS_OPTIONS = ["All Status", "ACTIVE", "INACTIVE"];
const ITEMS_PER_PAGE = 5;

export default function Driver_Attendants() {
  const [staff, setStaff]               = useState(initialStaff);
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage]                 = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Save new staff member
  const handleSaveStaff = (data) => {
    const entry = {
      id: staff.length + 1,
      name: data.fullName,
      role: data.role,
      contact: data.contactNumber,
      licenseNo: data.licenseNumber || "—",
      licenseExpiry: data.licenseExpiry
        ? new Date(data.licenseExpiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—",
      licenseExpired: false,
      assignedRoute: "—",
      status: "ACTIVE",
    };
    setStaff((prev) => [entry, ...prev]);
  };

  // Toggle status
  const handleAction = (id, value) => {
    if (value === "toggle") {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : s
        )
      );
    }
  };

  // Filter
  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.contact.includes(q);
    const matchRole   = roleFilter   === "All Roles"   || s.role   === roleFilter;
    const matchStatus = statusFilter === "All Status"  || s.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Shared action options builder
  const getActionOptions = (s) => [
    {
      label: "Edit",
      value: "edit",
      icon: Pencil,
      bg: "bg-white",
      text: "text-blue-600",
      hover: "hover:bg-blue-50",
    },
    {
      label: s.status === "ACTIVE" ? "Deactivate" : "Activate",
      value: "toggle",
      icon: s.status === "ACTIVE" ? ToggleLeft : ToggleRight,
      bg: "bg-white",
      text: s.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
      hover: s.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
    },
  ];

  const newLocal = "appearance-none w-full pl-3 sm:pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-32.5";
  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">

      {/* ── Page Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600 shrink-0" />
          Drivers & Attendants
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
          Manage all transport staff — add drivers and attendants, track licence
          expiry, assigned routes, and toggle active status.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── Table Header ── */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                Manage Drivers & Attendants
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} staff member{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>

          {/* ── Filters ── */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or contact…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="appearance-none w-full pl-3 sm:pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-32.5"
                >
                  {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className={newLocal}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Desktop Table (sm+) ── */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Name", "Role", "Contact", "License No.", "License Expiry", "Assigned Route", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === "Actions" ? "text-center" : "text-left"} whitespace-nowrap`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400">
                      <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                      <p className="font-medium">No staff found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* # */}
                      <td className="px-4 py-4 text-gray-400 text-xs font-medium w-8">
                        {(safePage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900">{s.name}</p>
                      </td>
                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[s.role]}`}>
                          {s.role}
                        </span>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-4 text-gray-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {s.contact}
                        </span>
                      </td>
                      {/* License No */}
                      <td className="px-4 py-4 text-gray-600 font-mono text-xs">
                        {s.licenseNo}
                      </td>
                      {/* License Expiry */}
                      <td className="px-4 py-4">
                        {s.licenseExpired ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
                            <span className="font-semibold">{s.licenseExpiry}</span>
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-bold">
                              <XCircle className="w-3 h-3" /> EXPIRED
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">{s.licenseExpiry}</span>
                        )}
                      </td>
                      {/* Assigned Route */}
                      <td className="px-4 py-4">
                        {s.assignedRoute !== "—" ? (
                          <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {s.assignedRoute}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        {s.status === "ACTIVE"
                          ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                              Active
                            </span>
                          : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                              Inactive
                            </span>
                        }
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <ActionDropDownComp
                          onAction={(val) => handleAction(s.id, val)}
                          actionOptions={getActionOptions(s)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards (xs only) ── */}
          <div className="sm:hidden px-4 py-4 space-y-3">
            {paginated.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="font-medium text-sm">No staff found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              paginated.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                      <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3 h-3" /> {s.contact}
                      </span>
                    </div>
                    {s.status === "ACTIVE"
                      ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                        </span>
                      : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                        </span>
                    }
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-400 font-medium mb-0.5">Role</p>
                      <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${roleColors[s.role]}`}>{s.role}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-400 font-medium mb-0.5">Route</p>
                      {s.assignedRoute !== "—"
                        ? <span className="bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">{s.assignedRoute}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-400 font-medium mb-0.5">License No.</p>
                      <p className="font-mono font-semibold text-gray-700 truncate">{s.licenseNo}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-400 font-medium mb-0.5">License Expiry</p>
                      {s.licenseExpired
                        ? <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <XCircle className="w-3 h-3" /> EXPIRED
                          </span>
                        : <p className="font-semibold text-gray-700">{s.licenseExpiry}</p>
                      }
                    </div>
                  </div>

                  {/* Actions */}
                  <ActionDropDownComp
                    onAction={(val) => handleAction(s.id, val)}
                    actionOptions={getActionOptions(s)}
                  />
                </div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-gray-400 font-medium">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} staff member{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5 rotate-90" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                    ${safePage === p
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <AddStaffCard
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveStaff}
      />
    </div>
  );
}
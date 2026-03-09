import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, ChevronDown, AlertTriangle,
  Pencil, ToggleLeft, ToggleRight, Plus, SlidersHorizontal,
  XCircle, Phone, CheckCircle, XCircle as XCircleIcon,
} from "lucide-react";
import AddStaffCard       from "../../Components/Transport/AddStaffCard";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import ListLoader         from "../../Components/CommonComp/ListLoader";
import {
  getTransportStaff,
  activateTransportStaff,
  deactivateTransportStaff,
} from "../../Api/TransportAPI";

const ROLE_OPTIONS = [
  { value: "",          label: "All Roles"  },
  { value: "DRIVER",    label: "Driver"     },
  { value: "ATTENDANT", label: "Attendant"  },
];
const STATUS_OPTIONS = [
  { value: "",         label: "All Status" },
  { value: "ACTIVE",   label: "Active"     },
  { value: "INACTIVE", label: "Inactive"   },
];
const ITEMS_PER_PAGE = 10;
const roleColors = {
  DRIVER:    "bg-blue-100 text-blue-700",
  ATTENDANT: "bg-teal-100 text-teal-700",
};

// ─── Toast ────────────────────────────────────────────────────────
let _setToasts = null;
const toast = {
  success: (msg) => _setToasts?.((p) => [...p, { id: Date.now(), type: "success", msg }]),
  error:   (msg) => _setToasts?.((p) => [...p, { id: Date.now(), type: "error",   msg }]),
};
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;
  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => remove(toasts[toasts.length - 1].id), 3500);
    return () => clearTimeout(t);
  }, [toasts]);
  return (
    <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-55 max-w-xs
          ${t.type === "success" ? "bg-white border border-green-200 text-green-800" : "bg-white border border-red-200 text-red-700"}`}>
          {t.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            : <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function isExpiringSoon(dateStr, days = 30) {
  if (!dateStr) return false;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= days;
}
function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ─── Mobile Staff Card ────────────────────────────────────────────
function StaffCard({ s, onAction }) {
  const licExpired = isExpired(s.licenseExpiryDate);
  const licWarn    = !licExpired && isExpiringSoon(s.licenseExpiryDate);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">{s.fullName}</p>
          <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <Phone className="w-3 h-3" /> {s.contactNumber}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleColors[s.staffRole] || "bg-gray-100 text-gray-600"}`}>{s.staffRole}</span>
          {s.status === "ACTIVE"
            ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active</span>
            : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive</span>
          }
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">License No.</p>
          <p className="font-mono font-semibold text-gray-700 truncate">{s.licenseNumber || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">License Expiry</p>
          {licExpired
            ? <span className="inline-flex items-center gap-1 text-red-600 font-bold"><XCircle className="w-3 h-3" /> EXPIRED</span>
            : licWarn
              ? <span className="inline-flex items-center gap-1 text-orange-600 font-semibold"><AlertTriangle className="w-3 h-3" />{fmtDate(s.licenseExpiryDate)}</span>
              : <p className="font-semibold text-gray-700">{fmtDate(s.licenseExpiryDate)}</p>
          }
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">Joining Date</p>
          <p className="font-semibold text-gray-700">{fmtDate(s.joiningDate)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">Alt. Contact</p>
          <p className="font-semibold text-gray-700">{s.alternateContact || "—"}</p>
        </div>
      </div>
      <ActionDropDownComp
        onAction={(val) => onAction(s, val)}
        actionOptions={[
          { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
          {
            label: s.status === "ACTIVE" ? "Deactivate" : "Activate",
            value: "toggle",
            icon: s.status === "ACTIVE" ? ToggleLeft : ToggleRight,
            bg: "bg-white",
            text: s.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
            hover: s.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
          },
        ]}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Driver_Attendants() {
  const [allStaff, setAllStaff]         = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [togglingId, setTogglingId]     = useState(null);

  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]                 = useState(0);

  const [showModal, setShowModal]       = useState(false);
  const [editStaff, setEditStaff]       = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransportStaff({
        page, size: ITEMS_PER_PAGE, searchTerm: search, role: roleFilter, status: statusFilter,
      });
      setAllStaff(res.staff || []);
      setPagination(res.pagination);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);
  useEffect(() => { setPage(0); }, [roleFilter, statusFilter]);

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.totalElements / ITEMS_PER_PAGE)) : 1;
  const totalItems = pagination?.totalElements ?? allStaff.length;

  const pageNumbers = () => {
    const pages = [];
    for (let i = Math.max(0, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    return pages;
  };

  // Toggle
  const handleAction = async (staff, value) => {
    if (value === "edit") { setEditStaff(staff); setShowModal(true); return; }
    if (value === "toggle") {
      const isActive = staff.status === "ACTIVE";
      setTogglingId(staff.id);
      try {
        isActive ? await deactivateTransportStaff(staff.id) : await activateTransportStaff(staff.id);
        toast.success(isActive ? `${staff.fullName} deactivated.` : `${staff.fullName} activated.`);
        await fetchStaff();
      } catch (e) {
        toast.error(`Failed to ${isActive ? "deactivate" : "activate"} ${staff.fullName}.`);
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleSaved = async (isEdit) => {
    setShowModal(false);
    setEditStaff(null);
    toast.success(isEdit ? "Staff updated successfully." : "Staff added successfully.");
    await fetchStaff();
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#f0f2f8] font-sans">

        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600 shrink-0" />
            Drivers &amp; Attendants
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Manage all transport staff — add drivers and attendants, track licence expiry, and toggle active status.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Table Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                  Manage Staff
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{totalItems} staff member{totalItems !== 1 ? "s" : ""} found</p>
              </div>
              <button
                onClick={() => { setEditStaff(null); setShowModal(true); }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" /> Add Staff
              </button>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" placeholder="Search by name or contact…"
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                {[
                  { val: roleFilter,   set: setRoleFilter,   opts: ROLE_OPTIONS   },
                  { val: statusFilter, set: setStatusFilter, opts: STATUS_OPTIONS  },
                ].map(({ val, set, opts }, fi) => (
                  <div key={fi} className="relative flex-1 sm:flex-none">
                    <select value={val} onChange={(e) => set(e.target.value)}
                      className="appearance-none w-full pl-3 sm:pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-32.5">
                      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="block lg:hidden px-4 py-4 space-y-3">
              {loading ? (
                <table className="w-full"><tbody><ListLoader rows={4} avatar={false} /></tbody></table>
              ) : allStaff.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-sm">No staff found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              ) : allStaff.map((s) => <StaffCard key={s.id} s={s} onAction={handleAction} />)}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Name", "Role", "Contact", "Alt. Contact", "License No.", "License Expiry", "Joining Date", "Status", "Actions"].map((h, i) => (
                      <th key={i} className={`${i === 0 ? "px-6 w-8" : i === 9 ? "px-4 text-center" : "px-4"} py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <ListLoader rows={ITEMS_PER_PAGE} avatar={false} />
                  ) : allStaff.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                        <p className="font-medium">No staff found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : allStaff.map((s, idx) => {
                    const licExpired = isExpired(s.licenseExpiryDate);
                    const licWarn    = !licExpired && isExpiringSoon(s.licenseExpiryDate);
                    const isBusy     = togglingId === s.id;
                    return (
                      <tr key={s.id} className="hover:bg-teal-50/20 transition-colors">
                         <td className="px-4 py-4">
                          <p className="font-bold text-gray-900 whitespace-nowrap">{s.fullName}</p>
                          {s.address && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-40">{s.address}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${roleColors[s.staffRole] || "bg-gray-100 text-gray-600"}`}>{s.staffRole}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400 shrink-0" />{s.contactNumber}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-sm">{s.alternateContact || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-4 text-gray-600 font-mono text-xs">{s.licenseNumber || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {!s.licenseExpiryDate ? <span className="text-gray-300">—</span>
                            : licExpired
                              ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">{fmtDate(s.licenseExpiryDate)}<span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-bold"><XCircle className="w-3 h-3" />EXPIRED</span></span>
                              : licWarn
                                ? <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-semibold"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />{fmtDate(s.licenseExpiryDate)}</span>
                                : <span className="text-gray-600 text-sm">{fmtDate(s.licenseExpiryDate)}</span>
                          }
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">{fmtDate(s.joiningDate)}</td>
                        <td className="px-4 py-4">
                          {isBusy
                            ? <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">Wait…</span>
                            : s.status === "ACTIVE"
                              ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />Active</span>
                              : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Inactive</span>
                          }
                        </td>
                        <td className="px-4 py-4 text-center">
                          <ActionDropDownComp
                            onAction={(val) => handleAction(s, val)}
                            actionOptions={[
                              { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                              {
                                label: s.status === "ACTIVE" ? "Deactivate" : "Activate",
                                value: "toggle",
                                icon: s.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                                bg: "bg-white",
                                text: s.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                                hover: s.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
                                disabled: isBusy,
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-gray-400 font-medium">
                  Showing {totalItems === 0 ? 0 : page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  {pageNumbers().map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${page === p ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {p + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <AddStaffCard
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditStaff(null); }}
        onSaved={handleSaved}
        editData={editStaff}
      />
    </>
  );
}
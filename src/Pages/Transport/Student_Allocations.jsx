import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Search, ChevronDown, Plus, Pencil,
  ToggleLeft, ToggleRight, SlidersHorizontal,
  RefreshCw, CheckCircle, XCircle, MapPin, Bus, CreditCard,
  Calendar, Hash,
} from "lucide-react";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import AllocateStudentCard from "../../Components/Transport/AllocateStudentCards";
import EditAllocateStudentCards from "../../Components/Transport/EditAllocateStudentCards";
import ListLoader from "../../Components/CommonComp/ListLoader";
import { getTransportAllocations, deleteTransportAllocation  } from "../../Api/TransportAPI";

// ─── Type badge colours ───────────────────────────────────────────
const typeColors = {
  "BOTH":        "bg-blue-100 text-blue-700 border-blue-200",
  "PICKUP_ONLY": "bg-teal-100 text-teal-700 border-teal-200",
  "PICKUP ONLY": "bg-teal-100 text-teal-700 border-teal-200",
  "DROP_ONLY":   "bg-purple-100 text-purple-700 border-purple-200",
  "DROP ONLY":   "bg-purple-100 text-purple-700 border-purple-200",
};

const ITEMS_PER_PAGE = 10;

// ─── Toast system (same pattern as Driver_Attendants) ─────────────
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
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-55 max-w-xs
            ${t.type === "success" ? "bg-white border border-green-200 text-green-800" : "bg-white border border-red-200 text-red-700"}`}>
          {t.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            : <XCircle    className="w-4 h-4 text-red-500 shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile Allocation Card ───────────────────────────────────────
function AllocationCard({ a, onAction, togglingId }) {
  const isBusy = togglingId === a.id;
  const typeKey = a.pickupDropType;
  const typeCls = typeColors[typeKey] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      {/* Top row — name + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{a.studentName}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {a.admissionNumber && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <Hash className="w-3 h-3" />{a.admissionNumber}
              </span>
            )}
            {a.className && (
              <span className="text-xs text-gray-500">
                {[a.className, a.sectionName].filter(Boolean).join(" – ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {isBusy
            ? <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">Wait…</span>
            : a.isActive
              ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                </span>
              : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                </span>
          }
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeCls}`}>
            {typeKey?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1"><Bus className="w-3 h-3" />Route</p>
          <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
            {a.routeCode || a.routeName}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />Stop</p>
          <p className="font-semibold text-gray-700 truncate">{a.stopName || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1"><CreditCard className="w-3 h-3" />Fee Plan</p>
          <p className="font-semibold text-gray-700 truncate">{a.feePlanName || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" />Effective</p>
          <p className="font-semibold text-gray-700">
            {a.effectiveFrom
              ? new Date(a.effectiveFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>

      {/* Amount */}
      {a.feeAmount != null && (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
          <span className="text-xs text-blue-600 font-medium">Amount</span>
          <span className="text-sm font-bold text-blue-700">
            ₹{a.feeAmount.toLocaleString()}
            {a.feeFrequency && <span className="text-xs font-normal ml-1 opacity-70">{a.feeFrequency}</span>}
          </span>
        </div>
      )}

      {/* Actions */}
      <ActionDropDownComp
        onAction={(val) => onAction(a, val)}
        actionOptions={[
          { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
          {
            label: a.isActive ? "Deactivate" : "Activate",
            value: "toggle",
            icon: a.isActive ? ToggleLeft : ToggleRight,
            bg: "bg-white",
            text: a.isActive ? "text-orange-600" : "text-green-600",
            hover: a.isActive ? "hover:bg-orange-50" : "hover:bg-green-50",
            disabled: isBusy,
          },
        ]}
      />
    </div>
  );
}

// ─── Pagination helper ────────────────────────────────────────────
function pageNumbers(current, total) {
  const pages = [];
  for (let i = Math.max(0, current - 2); i <= Math.min(total - 1, current + 2); i++) pages.push(i);
  return pages;
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Student_Allocations() {
  const [allocations,  setAllocations]  = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [togglingId,   setTogglingId]   = useState(null);

  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(0);

  const [showCreate,   setShowCreate]   = useState(false);
  const [editAlloc,    setEditAlloc]    = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTransportAllocations({ page, size: ITEMS_PER_PAGE });
      setAllocations(result.allocations || []);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load allocations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAllocations(); }, [fetchAllocations]);

  // Client-side search filter
  const filtered = allocations.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.studentName?.toLowerCase().includes(q) ||
      String(a.admissionNumber || "").toLowerCase().includes(q) ||
      String(a.rollNumber || "").toLowerCase().includes(q)
    );
  });

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.totalElements / ITEMS_PER_PAGE)) : 1;
  const totalItems = pagination?.totalElements ?? allocations.length;
  const currentPage = pagination?.currentPage ?? 0;

  // Action handler
  const handleAction = async (alloc, value) => {
  if (value === "edit") {
    setEditAlloc(alloc);
    return;
  }

  if (value === "toggle") {
    try {
      setTogglingId(alloc.id);

      // If active → deactivate using DELETE API
      if (alloc.isActive) {
        await deleteTransportAllocation(alloc.id);
        toast.success("Student transport deactivated successfully.");
      } else {
        toast.error("Activation API not implemented yet.");
      }

      await fetchAllocations();

    } catch (error) {
      console.error(error);
      toast.error("Failed to update allocation status.");
    } finally {
      setTogglingId(null);
    }
  }
};

  const handleSaved = async (isEdit) => {
    toast.success(isEdit ? "Allocation updated successfully." : "Student allocated successfully.");
    await fetchAllocations();
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#f0f2f8] font-sans">

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 shrink-0" />
            Student Allocation Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Allocate students to transport routes and stops, manage pickup/drop preferences and fee plans.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">

            {/* ── Table / Card Header ── */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                  Student Transport Allocations
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalItems} allocation{totalItems !== 1 ? "s" : ""} total
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={fetchAllocations} disabled={loading}
                  title="Refresh"
                  className="inline-flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-40 shrink-0">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => setShowCreate(true)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm flex-1 sm:flex-none">
                  <Plus className="w-4 h-4" />
                  Allocate Student
                </button>
              </div>
            </div>

            {/* ── Search ── */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student name, admission no…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="block lg:hidden px-4 py-4 space-y-3">
              {loading ? (
                <table className="w-full"><tbody><ListLoader rows={4} avatar={false} /></tbody></table>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-sm">No allocations found</p>
                  <p className="text-xs mt-1">Try adjusting your search</p>
                </div>
              ) : (
                filtered.map((a) => (
                  <AllocationCard key={a.id} a={a} onAction={handleAction} togglingId={togglingId} />
                ))
              )}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm min-w-225">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">Student Name</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-28">Class</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-24">Route</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-28">Stop</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-28">Type</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap">Fee Plan</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-24">Amount</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-32">Effective From</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-24">Status</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <ListLoader rows={ITEMS_PER_PAGE} avatar={false} />
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-16 text-gray-400">
                        <GraduationCap className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                        <p className="font-medium">No allocations found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => {
                      const isBusy  = togglingId === a.id;
                      const typeKey = a.pickupDropType;
                      const typeCls = typeColors[typeKey] ?? "bg-gray-100 text-gray-600 border-gray-200";
                      return (
                        <tr key={a.id} className="hover:bg-blue-50/20 transition-colors">
                          {/* Student Name */}
                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-900 whitespace-nowrap">{a.studentName}</p>
                          </td>
                          {/* Class */}
                          <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                            {[a.className, a.sectionName].filter(Boolean).join(" – ") || "—"}
                          </td>
                          {/* Route */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                              {a.routeCode || a.routeName}
                            </span>
                          </td>
                          {/* Stop */}
                          <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                            {a.stopName || "—"}
                          </td>
                          {/* Type */}
                          <td className="px-4 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${typeCls}`}>
                              {typeKey?.replace(/_/g, " ")}
                            </span>
                          </td>
                          {/* Fee Plan */}
                          <td className="px-4 py-4 text-gray-600 text-sm">
                            {a.feePlanName || "—"}
                          </td>
                          {/* Amount */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <p className="font-semibold text-gray-800">
                              {a.feeAmount != null ? `₹${a.feeAmount.toLocaleString()}` : "—"}
                            </p>
                            {a.feeFrequency && (
                              <p className="text-xs text-gray-400 mt-0.5">{a.feeFrequency}</p>
                            )}
                          </td>
                          {/* Effective From */}
                          <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                            {a.effectiveFrom
                              ? new Date(a.effectiveFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </td>
                          {/* Status */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {isBusy
                              ? <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">Wait…</span>
                              : a.isActive
                                ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                                  </span>
                                : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                                  </span>
                            }
                          </td>
                          {/* Actions — inline buttons matching screenshot */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAction(a, "edit")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleAction(a, "toggle")}
                                disabled={isBusy}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed
                                  ${a.isActive
                                    ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                                    : "text-green-600 border-green-200 hover:bg-green-50"
                                  }`}
                              >
                                {a.isActive
                                  ? <><ToggleLeft  className="w-3 h-3" /> Deactivate</>
                                  : <><ToggleRight className="w-3 h-3" /> Activate</>
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-gray-400 font-medium">
                  Showing {totalItems === 0 ? 0 : currentPage * ITEMS_PER_PAGE + 1}–{Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={pagination?.isFirst || loading}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  {pageNumbers(currentPage, totalPages).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                        ${currentPage === p ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {p + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={pagination?.isLast || loading}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Create Modal ── */}
      <AllocateStudentCard
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={() => handleSaved(false)}
      />

      {/* ── Edit Modal ── */}
      <EditAllocateStudentCards
        isOpen={!!editAlloc}
        onClose={() => setEditAlloc(null)}
        onUpdate={() => { handleSaved(true); setEditAlloc(null); }}
        editData={editAlloc}
      />
    </>
  );
}
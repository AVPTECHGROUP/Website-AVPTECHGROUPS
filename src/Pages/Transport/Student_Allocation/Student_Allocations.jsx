import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Search, Plus, Pencil,
  ToggleLeft, ToggleRight, SlidersHorizontal,
  RefreshCw, CheckCircle, XCircle, MapPin, Bus, CreditCard,
  Calendar, Hash, ChevronLeft, ChevronRight,
} from "lucide-react";
import ActionDropDownComp from "../../../Components/CommonComp/ActionDropDownComp";
import AllocateStudentCard from "./AllocateStudentCards";
import EditAllocateStudentCards from "./EditAllocateStudentCards";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import AllocationTable from "../../../Components/Transport/StudentAllocation";
import { getTransportAllocations, deleteTransportAllocation } from "../../../Api/TransportAPI";

// ─── Type badge colours ───────────────────────────────────────────
const typeColors = {
  BOTH: "bg-blue-100 text-blue-700 border-blue-200",
  PICKUP_ONLY: "bg-teal-100 text-teal-700 border-teal-200",
  "PICKUP ONLY": "bg-teal-100 text-teal-700 border-teal-200",
  DROP_ONLY: "bg-purple-100 text-purple-700 border-purple-200",
  "DROP ONLY": "bg-purple-100 text-purple-700 border-purple-200",
};

const ROWS_OPTIONS = [10, 25, 50, 100];

// ─── Toast system ─────────────────────────────────────────────────
let _setToasts = null;
const toast = {
  success: (msg) =>
    _setToasts?.((p) => [...p, { id: Date.now(), type: "success", msg }]),
  error: (msg) =>
    _setToasts?.((p) => [...p, { id: Date.now(), type: "error", msg }]),
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
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-[220px] max-w-xs
            ${t.type === "success"
              ? "bg-white border border-green-200 text-green-800"
              : "bg-white border border-red-200 text-red-700"
            }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span className="flex-1">{t.msg}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-gray-400 hover:text-gray-600 ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile / Tablet Allocation Card ─────────────────────────────
function AllocationCard({ a, onAction, togglingId }) {
  const isBusy = togglingId === a.id;
  const typeKey = a.pickupDropType;
  const typeCls = typeColors[typeKey] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      {/* Top row */}
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
          {isBusy ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">
              Wait…
            </span>
          ) : a.isActive ? (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
              Inactive
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeCls}`}>
            {typeKey?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1">
            <Bus className="w-3 h-3" />Route
          </p>
          <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
            {a.routeCode || a.routeName}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />Stop
          </p>
          <p className="font-semibold text-gray-700 truncate">{a.stopName || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />Fee Plan
          </p>
          <p className="font-semibold text-gray-700 truncate">{a.feePlanName || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />Effective
          </p>
          <p className="font-semibold text-gray-700">
            {a.effectiveFrom
              ? new Date(a.effectiveFrom).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
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
            {a.feeFrequency && (
              <span className="text-xs font-normal ml-1 opacity-70">{a.feeFrequency}</span>
            )}
          </span>
        </div>
      )}

      {/* Actions */}
      <ActionDropDownComp
        onAction={(val) => onAction(a, val)}
        actionOptions={[
          {
            label: "Edit",
            value: "edit",
            icon: Pencil,
            bg: "bg-white",
            text: "text-blue-600",
            hover: "hover:bg-blue-50",
          },
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

// ─── Pagination page number helper ───────────────────────────────
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = -1;
  for (const p of sorted) {
    if (p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Student_Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showCreate, setShowCreate] = useState(false);
  const [editAlloc, setEditAlloc] = useState(null);

  // Debounce search → reset to page 0
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch from API — server-side pagination
  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTransportAllocations({ page, size: pageSize });
      setAllocations(result.allocations || []);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load allocations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  // Client-side search filter (on current page data)
  const filtered = allocations.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.studentName?.toLowerCase().includes(q) ||
      String(a.admissionNumber ?? "").toLowerCase().includes(q) ||
      String(a.rollNumber ?? "").toLowerCase().includes(q)
    );
  });

  // Derive pagination values from API response
  const totalElements = pagination?.totalElements ?? allocations.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? 0;
  const isFirst = pagination?.isFirst ?? currentPage === 0;
  const isLast = pagination?.isLast ?? currentPage >= totalPages - 1;

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Action handler
  const handleAction = async (alloc, value) => {
    if (value === "edit") {
      setEditAlloc(alloc);
      return;
    }
    if (value === "toggle") {
      try {
        setTogglingId(alloc.id);
        if (alloc.isActive) {
          await deleteTransportAllocation(alloc.id);
          toast.success("Student transport deactivated successfully.");
        } else {
          toast.error("Activation API not implemented yet.");
        }
        await fetchAllocations();
      } catch (err) {
        console.error(err);
        toast.error("Failed to update allocation status.");
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleSaved = async (isEdit) => {
    toast.success(
      isEdit ? "Allocation updated successfully." : "Student allocated successfully."
    );
    await fetchAllocations();
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  return (
    <>
      <ToastContainer />

      {/*
        ── Outer shell ──
        Full width, fills available space inside whatever sidebar layout wraps this page.
        No fixed max-width here — let the parent layout control that.
      */}
      <div className="min-h-screen bg-[#f0f2f8] font-sans w-full">

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 pb-2">
          <h1 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 shrink-0" />
            Student Allocation Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Allocate students to transport routes and stops, manage pickup/drop preferences and fee plans.
          </p>
        </div>

        {/* ── Content area ── */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 w-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full overflow-hidden">

            {/* ── Table Header ── */}
            <div className="px-4 sm:px-6 lg:px-6 xl:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-500 shrink-0" />
                  Student Transport Allocations
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalElements} allocation{totalElements !== 1 ? "s" : ""} total
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={fetchAllocations}
                  disabled={loading}
                  title="Refresh"
                  className="inline-flex items-center justify-center w-9 h-9 text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-40 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">Allocate Student</span>
                  <span className="xs:hidden sm:hidden">Allocate</span>
                </button>
              </div>
            </div>

            {/* ── Search ── */}
            <div className="px-4 sm:px-6 lg:px-6 xl:px-8 py-3 sm:py-4 border-b border-gray-50">
              <div className="relative w-full sm:max-w-sm lg:max-w-md xl:max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student name, admission no…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            {/*
              ── Responsive view switching ──
              Cards:  mobile + tablet  (below lg)
              Table:  laptop and above (lg+)
            */}

            {/* Mobile / Tablet — Cards */}
            <div className="block lg:hidden px-4 py-4 space-y-3">
              {loading ? (
                <table className="w-full">
                  <tbody>
                    <ListLoader rows={4} avatar={false} />
                  </tbody>
                </table>
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

            {/* Laptop and above — Table (full width, no clipping) */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <AllocationTable
                data={filtered}
                loading={loading}
                pageSize={pageSize}
                onAction={handleAction}
                togglingId={togglingId}
              />
            </div>

            {/* ── Pagination Bar ── */}
            {!loading && (
              <div className="px-4 sm:px-6 lg:px-6 xl:px-8 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                {/* Left: count + rows per page */}
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    Showing {startItem}–{endItem} of {totalElements}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                    >
                      {ROWS_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: page buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Prev */}
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={isFirst || loading}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers with ellipsis */}
                    {pageNumbers(currentPage, totalPages).map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          disabled={loading}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed
                            ${currentPage === p
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {p + 1}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={isLast || loading}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
        onUpdate={() => {
          handleSaved(true);
          setEditAlloc(null);
        }}
        editData={editAlloc}
      />
    </>
  );
}
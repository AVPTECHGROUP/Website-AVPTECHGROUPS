import { useState, useEffect, useCallback } from "react";
import {
    GraduationCap, Search, Plus,
    SlidersHorizontal, RefreshCw,
    CheckCircle, XCircle,
    ChevronLeft, ChevronRight,
} from "lucide-react";
import AllocateStudentCard    from "./AllocateStudentCards";
import EditAllocateStudentCards from "./EditAllocateStudentCards";
import AllocationTable        from "../../../Components/Transport/StudentAllocation";
import { getTransportAllocations, deleteTransportAllocation } from "../../../Api/Transport/TransportAPI";

const ROWS_OPTIONS = [10, 25, 50, 100];

// ─── Toast ────────────────────────────────────────────────────────────────────
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
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id}
                     className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm
                                 font-medium pointer-events-auto min-w-[220px] max-w-xs bg-white
                                 ${t.type === "success"
                                     ? "border border-green-200 text-green-800"
                                     : "border border-red-200   text-red-700"}`}>
                    {t.type === "success"
                        ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        : <XCircle     className="w-4 h-4 text-red-500   shrink-0" />}
                    <span className="flex-1">{t.msg}</span>
                    <button onClick={() => remove(t.id)}
                            className="text-gray-400 hover:text-gray-600 ml-1">✕</button>
                </div>
            ))}
        </div>
    );
}

// ─── Pagination helper ────────────────────────────────────────────────────────
function pageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages = new Set([0, total - 1, current]);
    if (current > 0)          pages.add(current - 1);
    if (current < total - 1)  pages.add(current + 1);
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Student_Allocations() {
    const [allocations, setAllocations] = useState([]);
    const [pagination,  setPagination]  = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [togglingId,  setTogglingId]  = useState(null);

    const [searchInput, setSearchInput] = useState("");
    const [search,      setSearch]      = useState("");
    const [page,        setPage]        = useState(0);
    const [pageSize,    setPageSize]    = useState(10);

    const [showCreate, setShowCreate] = useState(false);
    const [editAlloc,  setEditAlloc]  = useState(null);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Fetch
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

    useEffect(() => { fetchAllocations(); }, [fetchAllocations]);

    // Client-side search filter
    const filtered = allocations.filter((a) => {
        const q = search.toLowerCase();
        return (
            a.studentName?.toLowerCase().includes(q) ||
            String(a.admissionNumber ?? "").toLowerCase().includes(q) ||
            String(a.rollNumber      ?? "").toLowerCase().includes(q)
        );
    });

    const totalElements = pagination?.totalElements ?? allocations.length;
    const totalPages    = pagination?.totalPages    ?? 1;
    const currentPage   = pagination?.currentPage   ?? 0;
    const isFirst       = pagination?.isFirst       ?? currentPage === 0;
    const isLast        = pagination?.isLast        ?? currentPage >= totalPages - 1;
    const startItem     = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    const endItem       = Math.min((currentPage + 1) * pageSize, totalElements);

    const handleAction = async (alloc, value) => {
        if (value === "edit") { setEditAlloc(alloc); return; }
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
        toast.success(isEdit ? "Allocation updated successfully." : "Student allocated successfully.");
        await fetchAllocations();
    };

    return (
        <>
            <ToastContainer />

            {/*
                LAYOUT ROOT
                ───────────
                min-w-0 is mandatory — this component is a flex/grid child of the
                sidebar layout. Without min-w-0, CSS refuses to shrink a flex child
                below its intrinsic content width, causing overflow regardless of w-full.
            */}
            <div className="min-h-screen bg-[#f0f2f8] w-full min-w-0">

                {/* Page header */}
                <div className="px-4 sm:px-6 xl:px-10 pt-6 pb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-purple-600 shrink-0" />
                        Student Allocation Management
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        Allocate students to transport routes and stops, manage pickup/drop preferences and fee plans.
                    </p>
                </div>

                {/* Card */}
                <div className="px-4 sm:px-6 xl:px-10 py-4 sm:py-6 min-w-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full min-w-0">

                        {/* Card header — flex row that wraps on tiny screens */}
                        <div className="px-4 sm:px-6 py-4 flex flex-wrap items-center
                                        justify-between gap-3 border-b border-gray-100">
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900
                                               flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-purple-500 shrink-0" />
                                    Student Transport Allocations
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {totalElements} allocation{totalElements !== 1 ? "s" : ""} total
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchAllocations}
                                    disabled={loading}
                                    title="Refresh"
                                    className="w-9 h-9 inline-flex items-center justify-center
                                               text-gray-500 border border-gray-200 hover:bg-gray-50
                                               rounded-xl transition-colors disabled:opacity-40"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                </button>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                                               text-white text-sm font-semibold px-4 py-2 rounded-xl
                                               transition-colors shadow-sm whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" /> Allocate Student
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="px-4 sm:px-6 py-3 border-b border-gray-100">
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2
                                                   w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search student name, admission no…"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200
                                               rounded-xl focus:outline-none focus:ring-2
                                               focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/*
                            Grid table — AllocationTable uses CSS Grid internally.
                            No overflow-hidden here so the grid can breathe.
                            The grid itself handles all responsive reflow.
                        */}
                        <AllocationTable
                            data={filtered}
                            loading={loading}
                            pageSize={pageSize}
                            onAction={handleAction}
                            togglingId={togglingId}
                        />

                        {/* Pagination */}
                        {!loading && (
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-100
                                            flex flex-wrap items-center justify-between gap-3">
                                {/* Count + rows per page */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                        Showing {startItem}–{endItem} of {totalElements}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            Rows per page:
                                        </span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5
                                                       bg-white text-gray-700 font-medium cursor-pointer
                                                       focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        >
                                            {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Page buttons */}
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <button
                                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                                            disabled={isFirst || loading}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                                       border border-gray-200 text-gray-500 hover:bg-gray-50
                                                       disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {pageNumbers(currentPage, totalPages).map((p, idx) =>
                                            p === "..." ? (
                                                <span key={`e-${idx}`}
                                                      className="w-8 h-8 flex items-center justify-center
                                                                 text-gray-400 text-xs select-none">…</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    disabled={loading}
                                                    className={`w-8 h-8 flex items-center justify-center
                                                        rounded-lg text-xs font-semibold transition-colors
                                                        disabled:cursor-not-allowed
                                                        ${currentPage === p
                                                            ? "bg-blue-600 text-white shadow-sm"
                                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                                                >
                                                    {p + 1}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                            disabled={isLast || loading}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                                       border border-gray-200 text-gray-500 hover:bg-gray-50
                                                       disabled:opacity-40 disabled:cursor-not-allowed"
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

            <AllocateStudentCard
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSave={() => handleSaved(false)}
            />
            <EditAllocateStudentCards
                isOpen={!!editAlloc}
                onClose={() => setEditAlloc(null)}
                onUpdate={() => { handleSaved(true); setEditAlloc(null); }}
                editData={editAlloc}
            />
        </>
    );
}
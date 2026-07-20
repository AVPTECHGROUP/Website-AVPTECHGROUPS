import { useState, useEffect, useCallback } from "react";
import {
    GraduationCap, Search, Plus,
    SlidersHorizontal, RefreshCw,
    CheckCircle, XCircle,
    ChevronLeft, ChevronRight,
} from "lucide-react";
import AllocateStudentCard from "./AllocateStudentCards";
import EditAllocateStudentCards from "./EditAllocateStudentCards";
import AllocationTable from "../../../Components/Transport/StudentAllocation";
import { getTransportAllocations, deleteTransportAllocation } from "../../../Api/Transport/TransportAPI";
import {
    PAGINATION,
    TOAST_MESSAGES,
    ALLOCATION_UI_TEXT
} from "../../../Constants/StringConstants/TransportConstants";

// ─── Toast ────────────────────────────────────────────────────────────────────
let _setToasts = null;
const toast = {
    success: (msg) => _setToasts?.((p) => [...p, { id: Date.now(), type: "success", msg }]),
    error: (msg) => _setToasts?.((p) => [...p, { id: Date.now(), type: "error", msg }]),
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
                        : <XCircle className="w-4 h-4 text-red-500   shrink-0" />}
                    <span className="flex-1">{t.msg}</span>
                    <button onClick={() => remove(t.id)}
                        className="text-gray-400 hover:text-gray-600 ml-1">✕</button>
                </div>
            ))}
        </div>
    );
}

// ─── Standard Pagination Helper (1, 2, 3 ... 6 Format) ────────────────────────
function pageNumbers(current, total) {
    const siblingCount = 1;

    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i);
    }

    const leftSiblingIndex = Math.max(current - siblingCount, 0);
    const rightSiblingIndex = Math.min(current + siblingCount, total - 1);

    const shouldShowLeftDots = leftSiblingIndex > 1;
    const shouldShowRightDots = rightSiblingIndex < total - 2;

    const firstPageIndex = 0;
    const lastPageIndex = total - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 4;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
        return [...leftRange, "...", lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 4;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i);
        return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = [current - 1, current, current + 1];
        return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return Array.from({ length: total }, (_, i) => i);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Student_Allocations() {
    const [allocations, setAllocations] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION.ITEMS_PER_PAGE);

    const [showCreate, setShowCreate] = useState(false);
    const [editAlloc, setEditAlloc] = useState(null);

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
            toast.error(TOAST_MESSAGES.ALLOCATION_LOAD_FAIL);
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
            String(a.rollNumber ?? "").toLowerCase().includes(q)
        );
    });

    const totalElements = pagination?.totalElements ?? allocations.length;
    const totalPages = pagination?.totalPages ?? 1;
    const currentPage = pagination?.currentPage ?? 0;
    const isFirst = pagination?.isFirst ?? currentPage === 0;
    const isLast = pagination?.isLast ?? currentPage >= totalPages - 1;
    const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    const handleAction = async (alloc, value) => {
        if (value === "edit") { setEditAlloc(alloc); return; }
        if (value === "toggle") {
            try {
                setTogglingId(alloc.id);
                if (alloc.isActive) {
                    await deleteTransportAllocation(alloc.id);
                    toast.success(TOAST_MESSAGES.ALLOCATION_DEACTIVATE_SUCCESS);
                } else {
                    toast.error(TOAST_MESSAGES.API_NOT_IMPLEMENTED);
                }
                await fetchAllocations();
            } catch (err) {
                console.error(err);
                toast.error(TOAST_MESSAGES.ALLOCATION_UPDATE_FAIL);
            } finally {
                setTogglingId(null);
            }
        }
    };

    const handleSaved = async (isEdit) => {
        toast.success(isEdit ? TOAST_MESSAGES.ALLOCATION_UPDATE_SUCCESS : TOAST_MESSAGES.ALLOCATION_CREATE_SUCCESS);
        await fetchAllocations();
    };

    return (
        <>
            <ToastContainer />

            <div className="min-h-screen bg-[#f0f2f8] w-full min-w-0">

                {/* Page header */}
                <div className="px-4 sm:px-6 xl:px-10 pt-6 pb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-purple-600 shrink-0" />
                        {ALLOCATION_UI_TEXT.PAGE_TITLE}
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        {ALLOCATION_UI_TEXT.PAGE_SUBTITLE}
                    </p>
                </div>

                {/* Card */}
                <div className="px-4 sm:px-6 xl:px-10 py-4 sm:py-6 min-w-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full min-w-0">

                        {/* Card header */}
                        <div className="px-4 sm:px-6 py-4 flex flex-wrap items-center
                                        justify-between gap-3 border-b border-gray-100">
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900
                                               flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-purple-500 shrink-0" />
                                    {ALLOCATION_UI_TEXT.SECTION_TITLE}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {totalElements} {totalElements !== 1 ? ALLOCATION_UI_TEXT.ALLOCATION_PLURAL : ALLOCATION_UI_TEXT.ALLOCATION_SINGULAR} {ALLOCATION_UI_TEXT.TOTAL}
                                </p>
                            </div>
                        </div>

                        {/* Search & Actions Bar (Fully Responsive with Optimal Large Screen Width) */}
                        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Input Box - Responsive Widths */}
                            <div className="relative w-full sm:w-80 md:w-96 lg:w-[420px] transition-all">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={ALLOCATION_UI_TEXT.SEARCH_PLACEHOLDER}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200
                       rounded-xl focus:outline-none focus:ring-2
                       focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                                />
                            </div>

                            {/* Buttons Container */}
                            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                                <button
                                    onClick={fetchAllocations}
                                    disabled={loading}
                                    title="Refresh"
                                    className="w-10 h-10 sm:w-9 sm:h-9 inline-flex items-center justify-center
                       text-gray-500 border border-gray-200 hover:bg-gray-50
                       rounded-xl transition-colors disabled:opacity-40 shrink-0"
                                >
                                    <RefreshCw className={`w-4 h-4 cursor-pointer ${loading ? "animate-spin" : ""}`} />
                                </button>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold px-4 py-2.5 sm:py-2 rounded-xl
                       transition-colors shadow-sm whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" /> {ALLOCATION_UI_TEXT.BTN_ALLOCATE}
                                </button>
                            </div>
                        </div>
                        {/* Table */}
                        <AllocationTable
                            data={filtered}
                            loading={loading}
                            pageSize={pageSize}
                            onAction={handleAction}
                            togglingId={togglingId}
                        />

                        {/* Pagination UI */}
                        {!loading && (
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-100
                                            flex flex-wrap items-center justify-between gap-3">
                                {/* Count + rows per page */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                        {ALLOCATION_UI_TEXT.SHOWING} {startItem}–{endItem} {ALLOCATION_UI_TEXT.OF} {totalElements}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {ALLOCATION_UI_TEXT.ROWS_PER_PAGE}
                                        </span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5
                                                       bg-white text-gray-700 font-medium cursor-pointer
                                                       focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        >
                                            {PAGINATION.ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Dynamic Standard Page Buttons (Condition removed so it always shows) */}
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
                                            <span key={`dots-${idx}`}
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
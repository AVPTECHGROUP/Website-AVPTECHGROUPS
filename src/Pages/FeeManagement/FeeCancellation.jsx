import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Ban, AlertCircle, RotateCcw } from 'lucide-react';
import { getCancelledFeeCollections } from '../../Api/FeeManagement/FeeCollection';
import { getTodayDate, getOneMonthAgoDate, PAGE_SIZE } from '../../Constants/StringConstants/FeeManagementConstants';

// ─── Formatters ─────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
};
const fmtDateTime = (d) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch { return d; }
};

// Same "backend has no free-text search param" pattern used elsewhere in
// CollectionsHistory.jsx — pull a larger batch matching the real filters
// (classId/periodId/fromDate/toDate) and filter/paginate client-side.
const SEARCH_FETCH_SIZE = 1000;

// FIX (requested): "sorted data not getting to top" — this was previously
// never sent at all, even though getCancelledFeeCollections already accepts
// a `sort` param. Without it, ordering depended entirely on the backend's
// default.
//
// CONFIRMED against a real API response (GET
// /v1/fee/collections/cancelled with sort left empty): the backend's own
// default sort is `pageable.sort: [{property: "updatedAt", direction:
// "DESC"}, {property: "id", direction: "DESC"}]` — i.e. newest-updated
// first, with `id` as a tiebreaker for records touched in the same instant.
// (An earlier version of this constant guessed `cancelledAt` — that field
// name doesn't match what the backend actually sorts by.)
//
// Sent as an ARRAY because Spring Data's Pageable multi-field sort is
// expressed as REPEATED query params (`?sort=updatedAt,desc&sort=id,desc`),
// not a single comma-joined string — buildQueryParams in FeeCollection.js
// was updated to append one `sort=` entry per array item to match this.
const DEFAULT_SORT = ['updatedAt,desc', 'id,desc'];

// ─── Small shared primitives (kept local so this file has no dependency
// on CollectionsHistory.jsx internals) ──────────────────────────────────────
const Btn = ({ children, variant = 'secondary', size = 'sm', onClick, disabled, className = '' }) => {
    const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-xs' }[size];
    const v = {
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
        ghost: 'bg-blue-50 text-[#1E3A5F] border border-blue-200 hover:bg-blue-100',
    }[variant];
    return (
        <button type="button" onClick={onClick} disabled={disabled}
                className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sz} ${v} ${className}`}>
            {children}
        </button>
    );
};

const Inp = ({ className = '', ...props }) => (
    <input className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${className}`} {...props} />
);

const Sel = ({ options = [], placeholder, value, onChange, className = '' }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
            className={`px-3 py-2 cursor-pointer text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${className}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

// FIX (requested): parity with CollectionsHistory.jsx's table — a faded
// edge + styled horizontal scrollbar so it's obvious there are more
// columns to scroll to instead of the table just looking "cut off" at
// 1024–1439px widths where the full 1180px-min table doesn't fit.
const TableScrollStyles = () => (
    <style>{`
      .cfc-table-scroll {
        scrollbar-width: thin;
        scrollbar-color: #93c5fd #f3f4f6;
        background:
          linear-gradient(to right, white 30%, rgba(255,255,255,0)) 0 0,
          linear-gradient(to left, white 30%, rgba(255,255,255,0)) 100% 0,
          linear-gradient(to right, rgba(15,23,42,0.10), rgba(15,23,42,0)) 0 0,
          linear-gradient(to left, rgba(15,23,42,0.10), rgba(15,23,42,0)) 100% 0;
        background-repeat: no-repeat;
        background-color: white;
        background-size: 32px 100%, 32px 100%, 12px 100%, 12px 100%;
        background-attachment: local, local, scroll, scroll;
      }
      .cfc-table-scroll::-webkit-scrollbar { height: 10px; }
      .cfc-table-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 999px; }
      .cfc-table-scroll::-webkit-scrollbar-thumb { background: #93c5fd; border-radius: 999px; }
      .cfc-table-scroll::-webkit-scrollbar-thumb:hover { background: #60a5fa; }
    `}</style>
);

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const Pagination = ({ page, totalPages, pageSize, onPageSizeChange, onPageChange, rangeStart, rangeEnd, totalElements }) => {
    const safeTotalPages = Math.max(1, totalPages || 1);
    const pageNumbers = useMemo(() => {
        const delta = 1;
        const range = [];
        const withDots = [];
        for (let i = 1; i <= safeTotalPages; i++) {
            if (i === 1 || i === safeTotalPages || (i >= page - delta && i <= page + delta)) range.push(i);
        }
        let last;
        range.forEach((i) => {
            if (last !== undefined) {
                if (i - last === 2) withDots.push(last + 1);
                else if (i - last !== 1) withDots.push('…');
            }
            withDots.push(i);
            last = i;
        });
        return withDots;
    }, [page, safeTotalPages]);

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Showing {rangeStart} to {rangeEnd} of {totalElements}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Rows per page:</span>
                    <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white cursor-pointer">
                        {ROWS_PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={14} />
                </button>
                {pageNumbers.map((p, idx) => p === '…' ? (
                    <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">…</span>
                ) : (
                    <button type="button" key={p} onClick={() => onPageChange(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {p}
                    </button>
                ))}
                <button type="button" onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))} disabled={page >= safeTotalPages}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

const getStructureLabel = (name) => {
    const trimmed = (name || '').toString().trim();
    return trimmed || null;
};

// Defensive field mapping — cancelled-payment records may carry the
// "who/when cancelled" info under slightly different keys depending on how
// the backend names the audit fields.
//
// FIX (bug reported: "wrong data sometimes"): the `cancelledBy` fallback
// chain previously included `r.collectedBy` as a last resort. That field
// means something entirely different — it's whoever ORIGINALLY collected
// the payment, not whoever cancelled it. If a given record genuinely has
// no cancelledBy/deletedBy/actionBy field from the backend, falling back
// to collectedBy silently displayed the WRONG person as "cancelled by"
// (the original collector instead of the actual canceller). Removed —
// this now shows '—' honestly instead of a plausible-looking wrong name.
const mapCancelledRecord = (r, i) => ({
    id: r.id ?? i,
    receiptNo: r.receiptNo || r.paymentId || '—',
    paymentDate: r.paymentDate,
    studentName: r.studentName,
    studentCode: r.admissionNumber || r.studentCode,
    className: `${r.className || ''}${r.sectionName ? ' ' + r.sectionName : ''}`.trim() || '—',
    period: r.feePeriodName || r.period || '—',
    feeStructureName: r.feeStructureName || null,
    amount: r.amountPaid ?? r.amount ?? 0,
    discount: r.discount || 0,
    lateFine: r.lateFine || 0,
    paymentMode: r.paymentMode || r.mode || '—',
    referenceNo: r.referenceNo || '—',
    cancelledBy: r.cancelledBy || r.deletedBy || r.actionBy || '—',
    cancelledAt: r.cancelledAt || r.deletedAt || r.updatedAt || r.timestamp || null,
    reason: r.cancellationReason || r.reason || '',
});

// ─── Mobile card ────────────────────────────────────────────────────────────
const CancelledCard = ({ c }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
                <span className="text-gray-400 font-bold text-xs line-through">{c.receiptNo}</span>
                <div className="font-semibold text-gray-900 text-sm mt-0.5 truncate">{c.studentName}</div>
                <div className="text-xs text-gray-400 truncate">{c.studentCode}</div>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="font-bold text-red-500 text-base">{fmt(c.amount)}</div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-[10px] font-semibold">
          <Ban size={10} /> Cancelled
        </span>
            </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            <span><span className="text-gray-400">Paid: </span>{fmtDate(c.paymentDate)}</span>
            <span><span className="text-gray-400">Class: </span>{c.className}</span>
            <span><span className="text-gray-400">Period: </span>{c.period}</span>
            <span className="min-w-0 truncate max-w-full"><span className="text-gray-400">Fee Structure: </span>{getStructureLabel(c.feeStructureName) || '—'}</span>
            <span><span className="text-gray-400">Mode: </span>{c.paymentMode}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
            <span className="text-gray-400">Cancelled by </span>
            <span className="font-semibold text-gray-700">{c.cancelledBy}</span>
            <span className="text-gray-400"> on </span>
            <span className="font-semibold text-gray-700">{fmtDateTime(c.cancelledAt)}</span>
            {c.reason && <div className="mt-1 text-gray-500">Reason: {c.reason}</div>}
        </div>
    </div>
);

// ─── Main component ─────────────────────────────────────────────────────────
const CancelledFeeCollections = ({ classOptions = [], periodOptions = [] }) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [classF, setClassF] = useState('');
    const [periodF, setPeriodF] = useState('');
    const [fromDate, setFromDate] = useState(getOneMonthAgoDate());
    const [toDate, setToDate] = useState(getTodayDate());
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [showFilters, setShowFilters] = useState(false);

    const [records, setRecords] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch, classF, periodF, fromDate, toDate]);

    const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

    const fetchCancelled = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const isSearching = debouncedSearch.length > 0;
            // FIX (requested): sort is now always sent so the newest
            // cancellation genuinely lands on top, both in the normal
            // paginated fetch and in the "pull a big batch, then filter
            // client-side" search path below.
            const baseParams = { fromDate, toDate, sort: DEFAULT_SORT };
            if (classF) baseParams.classId = classF;
            if (periodF) baseParams.periodId = periodF;

            const params = isSearching
                ? { ...baseParams, page: 0, size: SEARCH_FETCH_SIZE }
                : { ...baseParams, page: page - 1, size: pageSize };

            const res = await getCancelledFeeCollections(params);
            const mapped = (res?.records || []).map(mapCancelledRecord);

            if (isSearching) {
                const q = debouncedSearch.toLowerCase();
                const filtered = mapped.filter((c) =>
                    (c.studentName || '').toLowerCase().includes(q) ||
                    (c.studentCode || '').toLowerCase().includes(q) ||
                    (c.receiptNo || '').toLowerCase().includes(q)
                );
                const start = (page - 1) * pageSize;
                setRecords(filtered.slice(start, start + pageSize));
                setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
                setTotalElements(filtered.length);
            } else {
                setRecords(mapped);
                setTotalPages(res?.pagination?.totalPages || 1);
                setTotalElements(res?.pagination?.totalElements ?? mapped.length);
            }
        } catch (e) {
            setError(e.message || 'Failed to load cancelled payments');
            setRecords([]);
        } finally { setLoading(false); }
    }, [fromDate, toDate, classF, periodF, page, pageSize, debouncedSearch]);

    useEffect(() => { fetchCancelled(); }, [fetchCancelled]);

    const resetFilters = () => {
        setSearch(''); setClassF(''); setPeriodF('');
        setFromDate(getOneMonthAgoDate()); setToDate(getTodayDate()); setPage(1);
    };

    return (
        <div className="space-y-3">
            <TableScrollStyles />

            {error && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm text-orange-700 min-w-0">{error}</div>
                    <button onClick={fetchCancelled} className="text-orange-600 hover:text-orange-800 font-semibold text-sm flex-shrink-0">Retry</button>
                </div>
            )}

            {/*
              FIX (requested): responsive breakpoint moved from `xl` (1280px)
              to `lg` (1024px) throughout this file. Previously a 1024px
              laptop fell into the same 2-column CARD view as a phone/tablet
              — there was no distinct "1024px laptop" treatment at all. Now:
                - < 768px  (mobile):        1-column cards
                - 768–1023 (tablet):        2-column cards
                - 1024–1439 (1024 laptop):  full table, horizontal-scrolls
                                             with the fade/scrollbar styling
                                             added above (TableScrollStyles)
                - 1440px+ (1440 laptop):    full table, comfortably fits
            */}

            {/* Mobile/tablet filter bar */}
            <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search student, receipt no."
                           className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors flex-shrink-0 whitespace-nowrap ${showFilters || classF || periodF ? 'bg-blue-50 text-[#1E3A5F] border-blue-200' : 'bg-white text-gray-700 border-gray-200'}`}>
                    <Filter size={13} /> <span>Filters</span>
                </button>
            </div>
            {showFilters && (
                <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl lg:hidden border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                        <Inp type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <Inp type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <Sel value={periodF} onChange={setPeriodF} options={periodOptions} placeholder="All Periods" className="w-full" />
                    <Sel value={classF} onChange={setClassF} options={classOptions} placeholder="All Classes" className="w-full" />
                    <Btn variant="ghost" onClick={resetFilters} className="w-full justify-center"><RotateCcw size={12} /> Reset</Btn>
                </div>
            )}

            {/* 1024px+ filter bar */}
            <div className="hidden lg:flex items-center gap-2 w-full flex-wrap xl:flex-nowrap">
                <div className="relative flex-1 min-w-[160px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search student, receipt no."
                           className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
                </div>
                <div className="w-36 xl:w-40 flex-shrink-0"><Inp type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
                <div className="w-36 xl:w-40 flex-shrink-0"><Inp type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
                <Sel value={periodF} onChange={setPeriodF} options={periodOptions} placeholder="All Periods" className="w-32 xl:w-40 flex-shrink-0" />
                <Sel value={classF} onChange={setClassF} options={classOptions} placeholder="All Classes" className="w-28 xl:w-36 flex-shrink-0" />
                <Btn variant="ghost" onClick={resetFilters}><RotateCcw size={12} /> Reset</Btn>
            </div>

            {/* 1024px+ table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto cfc-table-scroll">
                    <table className="w-full min-w-[1180px]">
                        <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            {['Receipt No.', 'Paid On', 'Student', 'Class', 'Period', 'Fee Structure', 'Amount', 'Discount', 'Late Fine', 'Mode', 'Cancelled By', 'Cancelled On'].map((h) => (
                                <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={12} className="text-center py-14">
                                <span className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                                <div className="text-sm text-gray-400">Loading cancelled payments…</div>
                            </td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={12} className="text-center py-14 text-sm text-gray-400">No cancelled payments found.</td></tr>
                        ) : records.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-3 py-3 text-xs font-bold text-gray-400 line-through whitespace-nowrap">{c.receiptNo}</td>
                                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDate(c.paymentDate)}</td>
                                <td className="px-3 py-3">
                                    <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{c.studentName}</div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{c.studentCode}</div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md">{c.className}</span>
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.period}</td>
                                <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap max-w-[160px] truncate" title={getStructureLabel(c.feeStructureName) || ''}>
                                    {getStructureLabel(c.feeStructureName) || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm font-bold text-red-500 whitespace-nowrap">{fmt(c.amount)}</td>
                                <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(c.discount)}</td>
                                <td className="px-3 py-3 text-xs text-amber-700 whitespace-nowrap">{fmt(c.lateFine)}</td>
                                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{c.paymentMode}</td>
                                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap" title={c.cancelledBy}>{c.cancelledBy}</td>
                                <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDateTime(c.cancelledAt)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    page={page} totalPages={totalPages} pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange} onPageChange={setPage}
                    rangeStart={records.length === 0 ? 0 : (page - 1) * pageSize + 1}
                    rangeEnd={(page - 1) * pageSize + records.length}
                    totalElements={totalElements}
                />
            </div>

            {/* Mobile/tablet cards (below 1024px) */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-14">
                        <span className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                        <div className="text-sm text-gray-400">Loading cancelled payments…</div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-14 text-sm text-gray-400">No cancelled payments found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {records.map((c) => <CancelledCard key={c.id} c={c} />)}
                    </div>
                )}
                {records.length > 0 && (
                    <Pagination
                        page={page} totalPages={totalPages} pageSize={pageSize}
                        onPageSizeChange={handlePageSizeChange} onPageChange={setPage}
                        rangeStart={records.length === 0 ? 0 : (page - 1) * pageSize + 1}
                        rangeEnd={(page - 1) * pageSize + records.length}
                        totalElements={totalElements}
                    />
                )}
            </div>
        </div>
    );
};

export default CancelledFeeCollections;
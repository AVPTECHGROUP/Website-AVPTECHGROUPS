import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Filter,
  CalendarDays,
  Store,
  User,
  Tag,
  ArrowRightLeft,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import { getStockMovementHistory, getActiveStores } from "../../Api/StockApi";

const ROWS_PER_PAGE = 20;

const typeMeta = {
  IN:       { dot: "bg-green-500", badge: "text-green-700 bg-green-50 border border-green-200",  label: "IN"       },
  OUT:      { dot: "bg-red-500",   badge: "text-red-600 bg-red-50 border border-red-200",         label: "OUT"      },
  TRANSFER: { dot: "bg-blue-500",  badge: "text-blue-700 bg-blue-50 border border-blue-200",      label: "TRANSFER" },
};

const qtyColor  = { IN: "text-green-600", OUT: "text-red-500",  TRANSFER: "text-blue-600" };
const qtyPrefix = { IN: "+",              OUT: "-",              TRANSFER: "±"             };

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "—", time: "—" };
  const d    = new Date(isoString);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time };
};

const mapMovement = (m) => {
  const { date, time } = formatDateTime(m.createdAt);
  const type  = m.movementType || "IN";
  let   store = m.storeName    || "—";
  if (type === "TRANSFER" && m.destinationStoreName) {
    store = `${m.storeName} → ${m.destinationStoreName}`;
  }
  const ref    = m.referenceNumber || m.transferReference || "—";
  const reason = m.remarks || (m.removalReason ? m.removalReason.replace(/_/g, " ") : "—");
  return {
    id: m.id, date, time,
    item:   m.itemName || "—",
    itemId: m.itemCode || `ITM-${m.itemId}`,
    type, store,
    qty:    m.quantity,
    before: m.quantityBefore,
    after:  m.quantityAfter,
    ref, reason,
    by: m.performedByName || "—",
  };
};

const exportToCSV = (movements) => {
  const headers = ["Date","Time","Item","Item ID","Type","Store","Qty","Before","After","Reference","Reason / Remarks","Performed By"];
  const rows    = movements.map((m) => [
    m.date, m.time, m.item, m.itemId, m.type, m.store,
    `${qtyPrefix[m.type]}${m.qty}`, m.before, m.after, m.ref, m.reason, m.by,
  ]);
  const csv  = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `stock-movements-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Mobile Card
const MobileCard = ({ m}) => {
  const meta = typeMeta[m.type] || typeMeta["IN"];
  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{m.item}</p>
          <p className="text-xs text-gray-400 mt-0.5">{m.itemId}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${meta.badge}`}>{meta.label}</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div className="flex items-start gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-700">{m.date}</p>
            <p className="text-xs text-gray-400">{m.time}</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-400">Quantity</p>
            <p className={`text-xs font-bold ${qtyColor[m.type]}`}>{qtyPrefix[m.type]}{m.qty}</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5 col-span-2">
          <Store className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed" title={m.store}>{m.store}</p>
        </div>

        <div className="flex items-start gap-1.5">
          <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-400">Stock change</p>
            <p className="text-xs font-semibold text-gray-700">{m.before} → {m.after}</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-400">Performed by</p>
            <p className="text-xs font-semibold text-gray-700 truncate">{m.by}</p>
          </div>
        </div>

        {m.ref !== "—" && (
          <div className="col-span-2 pl-0.5">
            <p className="text-xs text-gray-400">
              Ref: <span className="text-gray-600 font-medium">{m.ref}</span>
            </p>
          </div>
        )}
        {m.reason !== "—" && (
          <div className="col-span-2 pl-0.5">
            <p className="text-xs text-gray-400 line-clamp-2" title={m.reason}>
              Reason: <span className="text-gray-600">{m.reason}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyBox = ({ hasApplied, colSpan }) => {
  const content = !hasApplied ? (
    <div className="flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
        <Filter className="w-7 h-7 text-blue-300" />
      </div>
      <p className="text-sm font-semibold text-gray-600">Apply filters to view movement history</p>
      <p className="text-xs text-gray-400 text-center px-4">
        Select a store, date range or movement type and tap <strong>Apply</strong>
      </p>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-2 text-gray-400">
      <History className="w-8 h-8 opacity-30" />
      <p className="text-sm font-medium">No movements found</p>
      <p className="text-xs">Try adjusting your filters or date range</p>
    </div>
  );

  return colSpan
    ? <tr><td colSpan={colSpan} className="py-16 text-center">{content}</td></tr>
    : <div className="py-16 text-center px-4">{content}</div>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Movement() {
  const [loading,       setLoading]       = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error,         setError]         = useState(null);
  const [movements,     setMovements]     = useState([]);
  const [stores,        setStores]        = useState([]);
  const [pagination,    setPagination]    = useState({});
  const [hasApplied,    setHasApplied]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("");
  const [storeId,       setStoreId]       = useState("");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [page,          setPage]          = useState(0);

  const totalIn       = movements.filter((m) => m.type === "IN").length;
  const totalOut      = movements.filter((m) => m.type === "OUT").length;
  const totalTransfer = movements.filter((m) => m.type === "TRANSFER").length;

  const stats = [
    { key: "Total Movements", val: pagination.totalElements ?? movements.length, icon: History,         txColor: "text-blue-600",  bgColor: "bg-blue-50"   },
    { key: "Stock IN",        val: totalIn,                                       icon: ArrowDownToLine, txColor: "text-green-600", bgColor: "bg-green-50"  },
    { key: "Stock OUT",       val: totalOut,                                      icon: ArrowUpFromLine, txColor: "text-red-500",   bgColor: "bg-red-50"    },
    { key: "Transfers",       val: totalTransfer,                                 icon: ArrowLeftRight,  txColor: "text-blue-600",  bgColor: "bg-indigo-50" },
  ];

  useEffect(() => {
    (async () => {
      setStoresLoading(true);
      try {
        const data = await getActiveStores();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setStores(list.map((s) => ({ id: String(s.id), name: s.name || s.storeName })));
      } catch { setStores([]); }
      finally  { setStoresLoading(false); }
    })();
  }, []);

  const fetchMovements = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const fromISO = dateFrom ? `${dateFrom}T00:00:00.000Z` : "";
      const toISO   = dateTo   ? `${dateTo}T23:59:59.999Z`   : "";
      const { movements: raw, pagination: pg } = await getStockMovementHistory(
        pageNum, ROWS_PER_PAGE, "", storeId, typeFilter, fromISO, toISO, search
      );
      setMovements(raw.map(mapMovement));
      setPagination(pg);
      setPage(pageNum);
    } catch {
      setError("Failed to load stock movements. Please try again.");
      setMovements([]);
      setPagination({});
    } finally { setLoading(false); }
  }, [storeId, typeFilter, dateFrom, dateTo, search]);

  const handleApply      = ()  => { setHasApplied(true); fetchMovements(0); };
  const handlePageChange = (p) => fetchMovements(p);

  const totalPages    = pagination.totalPages    ?? 1;
  const currentPage   = pagination.currentPage   ?? page;
  const totalElements = pagination.totalElements ?? movements.length;
  const startItem     = totalElements === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1;
  const endItem       = Math.min((currentPage + 1) * ROWS_PER_PAGE, totalElements);

  const pageNumbers = (() => {
    const arr = [];
    const s   = Math.max(0, currentPage - 2);
    const e   = Math.min(totalPages - 1, currentPage + 2);
    for (let i = s; i <= e; i++) arr.push(i);
    return arr;
  })();

  const actionOptions  = [{ value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" }];
  const callAllActions = (val, m) => { if (val === "view") console.log("View:", m.id); };

  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6 lg:p-8 font-sans">

      {/* Heading */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Stock Movement History</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Track all stock IN, OUT and transfer movements across stores.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)
          : stats.map((s) => (
              <CardComponent key={s.key} IconName={s.icon} keyName={s.key} val={s.val}
                iconTxColor={s.txColor} iconBgColor={s.bgColor} />
            ))}
      </div>

      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Panel header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Stock Movement History</h2>
          </div>
          <button
            onClick={() => exportToCSV(movements)} disabled={movements.length === 0}
            className="flex items-center gap-2 border border-blue-300 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors w-fit disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search item, store, user..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
          </div>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700">
            <option value="">All Types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="TRANSFER">TRANSFER</option>
          </select>

          <select value={storeId} onChange={(e) => setStoreId(e.target.value)} disabled={storesLoading}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 disabled:opacity-60">
            <option value="">{storesLoading ? "Loading stores…" : "All Stores"}</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700" />

          <div className="flex gap-2">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700" />
            <button onClick={handleApply} disabled={loading}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
              Apply
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 sm:mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* DESKTOP TABLE  md and above*/}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-215 ">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 lg:px-5 py-3 text-left whitespace-nowrap">Date & Time</th>
                <th className="px-4 lg:px-5 py-3 text-left whitespace-nowrap">Item</th>
                <th className="px-4 lg:px-5 py-3 text-center whitespace-nowrap">Type</th>
                <th className="px-4 lg:px-5 py-3 text-center whitespace-nowrap">Store</th>
                <th className="px-4 lg:px-5 py-3 text-center whitespace-nowrap">Qty</th>
                <th className="px-4 lg:px-5 py-3 text-center whitespace-nowrap">Before → After</th>
                <th className="px-4 lg:px-5 py-3 text-left whitespace-nowrap">Reference</th>
                <th className="px-4 lg:px-5 py-3 text-left whitespace-nowrap hidden lg:table-cell">Reason</th>
                <th className="px-4 lg:px-5 py-3 text-center whitespace-nowrap">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <ListLoader rows={5} avatar={false} />
              ) : movements.length === 0 ? (
                <EmptyBox hasApplied={hasApplied} colSpan={10} />
              ) : (
                movements.map((m) => {
                  const meta = typeMeta[m.type] || typeMeta["IN"];
                  return (
                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-700">{m.date}</p>
                        <p className="text-xs text-gray-400">{m.time}</p>
                      </td>
                      <td className="px-4 py-3.5 max-w-30">
                        <p className="text-sm font-semibold text-gray-800 truncate" title={m.item}>{m.item}</p>
                        <p className="text-xs text-gray-400">{m.itemId}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${meta.dot} shrink-0`} />
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${meta.badge}`}>{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-30">
                        <span className="text-sm text-gray-600 truncate block" title={m.store}>{m.store}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${qtyColor[m.type]}`}>{qtyPrefix[m.type]}{m.qty}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 text-center whitespace-nowrap">
                        {m.before} → {m.after}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{m.ref}</td>
                      <td className="px-4 py-3.5 max-w-30 hidden lg:table-cell">
                        <span className="text-sm text-gray-600 truncate block" title={m.reason}>{m.reason}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 text-center whitespace-nowrap">{m.by}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS  below md*/}

        <div className="md:hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)}
            </div>
          ) : movements.length === 0 ? (
            <EmptyBox hasApplied={hasApplied} />
          ) : (
            movements.map((m) => (
              <MobileCard key={m.id} m={m} actionOptions={actionOptions} onAction={callAllActions} />
            ))
          )}
        </div>

        {/* Pagination */}
        {hasApplied && movements.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-100">
            {totalPages > 1 ? (
              <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
                <button onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pageNumbers.map((p) => (
                  <button key={p} onClick={() => handlePageChange(p)} disabled={loading}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                      p === currentPage ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                    }`}>
                    {p + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : <div />}
            <p className="text-xs sm:text-sm text-gray-400">
              Showing {startItem}–{endItem} of {totalElements} movements
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
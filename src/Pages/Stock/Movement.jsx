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
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import { getStockMovementHistory } from "../../Api/StockApi";

const ROWS_PER_PAGE = 5;

const typeMeta = {
  IN: {
    dot: "bg-green-500",
    badge: "text-green-700 bg-green-50 border border-green-200",
    label: "IN",
  },
  OUT: {
    dot: "bg-red-500",
    badge: "text-red-600 bg-red-50 border border-red-200",
    label: "OUT",
  },
  TRANSFER: {
    dot: "bg-blue-500",
    badge: "text-blue-700 bg-blue-50 border border-blue-200",
    label: "TRANSFER",
  },
};

const qtyColor = { IN: "text-green-600", OUT: "text-red-500", TRANSFER: "text-blue-600" };
const qtyPrefix = { IN: "+", OUT: "-", TRANSFER: "" };

// Format ISO date string to readable date + time
const formatDateTime = (isoString) => {
  if (!isoString) return { date: "—", time: "—" };
  const d = new Date(isoString);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time };
};

// Map API response row → display shape
const mapMovement = (m) => {
  const { date, time } = formatDateTime(m.createdAt);
  const type = m.movementType || "IN";

  let store = m.storeName || "—";
  if (type === "TRANSFER" && m.destinationStoreName) {
    store = `${m.storeName} → ${m.destinationStoreName}`;
  }

  const ref = m.referenceNumber || m.transferReference || "—";
  const reason = m.remarks || (m.removalReason ? m.removalReason.replace(/_/g, " ") : "—");

  return {
    id: m.id,
    date,
    time,
    item: m.itemName || "—",
    itemId: m.itemCode || `ITM-${m.itemId}`,
    type,
    store,
    qty: m.quantity,
    before: m.quantityBefore,
    after: m.quantityAfter,
    beforeB: type === "TRANSFER" ? m.quantityBefore : null,
    afterB: type === "TRANSFER" ? m.quantityAfter : null,
    ref,
    reason,
    by: m.performedByName || "—",
  };
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
const exportToCSV = (movements) => {
  const headers = [
    "Date",
    "Time",
    "Item",
    "Item ID",
    "Type",
    "Store",
    "Qty",
    "Before",
    "After",
    "Reference",
    "Reason / Remarks",
    "Performed By",
  ];

  const rows = movements.map((m) => [
    m.date,
    m.time,
    m.item,
    m.itemId,
    m.type,
    m.store,
    `${qtyPrefix[m.type]}${m.qty}`,
    m.before,
    m.after,
    m.ref,
    m.reason,
    m.by,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Movement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Raw movements from API (all fetched for frontend filtering)
  const [allMovements, setAllMovements] = useState([]);

  // Server pagination state (if you want server-side pagination later)
  // For now we fetch all and paginate client-side after frontend filter
  const [apiPagination, setApiPagination] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Client pagination
  const [page, setPage] = useState(1);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass date + movementType to API; search & store filtered on frontend
      const movementTypeParam = typeFilter !== "All Types" ? typeFilter : "";
      const { movements, pagination } = await getStockMovementHistory(
        0,         // page 0 to get all (or use large size)
        200,       // fetch up to 200 records for frontend filtering
        "",        // itemId
        "",        // storeId
        movementTypeParam,
        dateFrom,
        dateTo,
        search     // searchTerm passed to API too
      );
      setAllMovements(movements.map(mapMovement));
      setApiPagination(pagination);
      setPage(1);
    } catch (err) {
      setError("Failed to load stock movements. Please try again.");
      setAllMovements([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, dateFrom, dateTo, search]);

  // Initial load
  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Frontend Filtering ──────────────────────────────────────────────────────
  const allStores = ["All Stores", ...Array.from(new Set(allMovements.map((m) => m.store)))];

  const filtered = allMovements.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.item.toLowerCase().includes(q) ||
      m.store.toLowerCase().includes(q) ||
      m.by.toLowerCase().includes(q) ||
      m.itemId.toLowerCase().includes(q);
    const matchType = typeFilter === "All Types" || m.type === typeFilter;
    const matchStore = storeFilter === "All Stores" || m.store === storeFilter;
    return matchSearch && matchType && matchStore;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalIn = allMovements.filter((m) => m.type === "IN").length;
  const totalOut = allMovements.filter((m) => m.type === "OUT").length;
  const totalTransfer = allMovements.filter((m) => m.type === "TRANSFER").length;

  const stats = [
    { key: "Total Movements", val: allMovements.length, icon: History,         txColor: "text-blue-600",  bgColor: "bg-blue-50"   },
    { key: "Stock IN",        val: totalIn,              icon: ArrowDownToLine, txColor: "text-green-600", bgColor: "bg-green-50"  },
    { key: "Stock OUT",       val: totalOut,             icon: ArrowUpFromLine, txColor: "text-red-500",   bgColor: "bg-red-50"    },
    { key: "Transfers",       val: totalTransfer,        icon: ArrowLeftRight,  txColor: "text-blue-600",  bgColor: "bg-indigo-50" },
  ];

  const actionOptions = [
    { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
  ];

  const callAllActions = (optVal, movement) => {
    if (optVal === "view") console.log("View movement:", movement.id);
  };

  const handleApply = () => {
    fetchMovements();
  };

  const handleExportCSV = () => {
    exportToCSV(filtered);
  };

  const newLocal = "w-full min-w-225";
  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Stock Movement History</h1>
        <p className="text-gray-500 text-sm mt-1">Track all stock IN, OUT and transfer movements across stores.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)
          : stats.map((s) => (
              <CardComponent
                key={s.key}
                IconName={s.icon}
                keyName={s.key}
                val={s.val}
                iconTxColor={s.txColor}
                iconBgColor={s.bgColor}
              />
            ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800 text-lg">Stock Movement History</h2>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search item, store, user..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
          >
            <option>All Types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="TRANSFER">TRANSFER</option>
          </select>
          <select
            value={storeFilter}
            onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
          >
            {allStores.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
            />
            <button
              onClick={handleApply}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Apply
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden sm:block">
          <table className={newLocal}>
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3 text-left">Date & Time</th>
                <th className="px-5 py-3 text-left">Item</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Store</th>
                <th className="px-5 py-3 text-left">Qty</th>
                <th className="px-5 py-3 text-left">Before → After</th>
                <th className="px-5 py-3 text-left">Reference</th>
                <th className="px-5 py-3 text-left">Reason / Remarks</th>
                <th className="px-5 py-3 text-left">By</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <ListLoader rows={5} avatar={false} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <History className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">No movements found</p>
                      <p className="text-xs">Try adjusting your filters or date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((m) => {
                  const meta = typeMeta[m.type] || typeMeta["IN"];
                  const newLocal_1 = "px-5 py-4 text-sm text-gray-600 max-w-45 truncate";
                  return (
                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-700">{m.date}</p>
                        <p className="text-xs text-gray-400">{m.time}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-800">{m.item}</p>
                        <p className="text-xs text-gray-400">{m.itemId}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${meta.dot} shrink-0`} />
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{m.store}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${qtyColor[m.type]}`}>
                          {qtyPrefix[m.type]}{m.qty}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {m.type === "TRANSFER" && m.beforeB !== null
                          ? <span>{m.before} → {m.after} / {m.beforeB} → {m.afterB}</span>
                          : <span>{m.before} → {m.after}</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{m.ref}</td>
                      <td className={newLocal_1} title={m.reason}>{m.reason}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{m.by}</td>
                      <td className="px-5 py-4">
                        <ActionDropDownComp
                          actionOptions={actionOptions}
                          onAction={(optVal) => callAllActions(optVal, m)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-gray-400 py-14">
              <History className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium">No movements found</p>
              <p className="text-xs">Try adjusting your filters or date range</p>
            </div>
          ) : (
            paginated.map((m) => {
              const meta = typeMeta[m.type] || typeMeta["IN"];
              return (
                <div key={m.id} className="px-4 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{m.item}</p>
                      <p className="text-xs text-gray-400">{m.itemId}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                    <span>📅 {m.date} {m.time}</span>
                    <span>🏪 {m.store}</span>
                    <span>
                      Qty: <span className={`font-bold ${qtyColor[m.type]}`}>{qtyPrefix[m.type]}{m.qty}</span>
                    </span>
                    <span>By: {m.by}</span>
                    <span className="col-span-2">{m.before} → {m.after}</span>
                    <span className="col-span-2 text-gray-600">{m.reason}</span>
                  </div>
                  <div className="pt-1">
                    <ActionDropDownComp
                      actionOptions={actionOptions}
                      onAction={(optVal) => callAllActions(optVal, m)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Showing{" "}
            {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}{" "}
            of {filtered.length} movements
          </p>
        </div>
      </div>
    </div>
  );
}
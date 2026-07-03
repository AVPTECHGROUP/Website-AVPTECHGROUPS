import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  Inbox,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import { getStockMovementHistory, getStockMovementStats } from "../../Api/Stock/StockApi";
import { getActiveStores } from "../../Api/Stock/StoreApi";
import { STOCK_SHARED_CONSTS, MOVEMENT_CONSTS } from "../../Constants/StringConstants/StockAndOrdersConstants";

const ROWS_PER_PAGE_OPTIONS = MOVEMENT_CONSTS.CONFIG.ROWS_PER_PAGE_OPTIONS;
const SEARCH_DEBOUNCE_MS = MOVEMENT_CONSTS.CONFIG.SEARCH_DEBOUNCE_MS;

// ── Type metadata ─────────────────────────────────────────────────────────────
const typeMeta = {
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN]: { dot: "bg-green-500", badge: "text-green-700  bg-green-50  border border-green-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN },
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT]: { dot: "bg-red-500", badge: "text-red-600    bg-red-50    border border-red-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT },
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER]: { dot: "bg-blue-500", badge: "text-blue-700   bg-blue-50   border border-blue-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER },
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER]: { dot: "bg-orange-500", badge: "text-orange-700 bg-orange-50 border border-orange-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER },
};

const qtyColor = {
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN]: "text-green-600",
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT]: "text-red-500",
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER]: "text-blue-600",
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER]: "text-orange-600"
};
const qtyPrefix = {
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN]: "+",
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT]: "-",
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER]: "±",
  [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER]: "-"
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDateTime = (isoString) => {
  if (!isoString) return { date: "—", time: "—" };
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString(STOCK_SHARED_CONSTS.LOCALE.DATE_GB, { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(STOCK_SHARED_CONSTS.LOCALE.DATE_GB, { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

const mapMovement = (m) => {
  const { date, time } = formatDateTime(m.createdAt);
  const type = m.movementType || STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN;
  return {
    id: m.id,
    date, time,
    item: m.itemName || "—",
    itemId: m.itemCode || MOVEMENT_CONSTS.ITEM_ID_PREFIX(m.itemId),
    type,
    storeName: m.storeName || "—",
    destStore: type === STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER ? (m.destinationStoreName || null) : null,
    qty: m.quantity,
    before: m.quantityBefore,
    after: m.quantityAfter,
    ref: m.referenceNumber || m.transferReference || "—",
    reason: m.remarks || (m.removalReason ? m.removalReason.replace(/_/g, " ") : "—"),
  };
};

const exportToCSV = (movements) => {
  const headers = [
    MOVEMENT_CONSTS.TABLE_HEADERS.DATE_TIME,
    MOVEMENT_CONSTS.TABLE_HEADERS.ITEM,
    MOVEMENT_CONSTS.TABLE_HEADERS.ITEM_ID,
    MOVEMENT_CONSTS.TABLE_HEADERS.TYPE,
    MOVEMENT_CONSTS.TABLE_HEADERS.STORE,
    MOVEMENT_CONSTS.TABLE_HEADERS.DEST_STORE,
    MOVEMENT_CONSTS.TABLE_HEADERS.QTY,
    MOVEMENT_CONSTS.TABLE_HEADERS.BEFORE,
    MOVEMENT_CONSTS.TABLE_HEADERS.AFTER,
    MOVEMENT_CONSTS.TABLE_HEADERS.REFERENCE,
    MOVEMENT_CONSTS.TABLE_HEADERS.REASON_REMARKS
  ];
  const rows = movements.map((m) => [
    m.date, m.time, m.item, m.itemId, m.type,
    m.storeName, m.destStore || "",
    `${qtyPrefix[m.type] ?? ""}${m.qty}`, m.before, m.after, m.ref, m.reason,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: MOVEMENT_CONSTS.CSV.MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = MOVEMENT_CONSTS.CSV.FILE_NAME(new Date().toISOString().slice(0, 10));
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ── Store Cell ────────────────────────────────────────────────────────────────
const StoreCell = ({ storeName, destStore }) => {
  if (!destStore || storeName === destStore) {
    return (
      <span className="text-sm text-gray-700 font-medium block truncate" title={storeName}>
        {storeName}
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-1 my-1 max-w-full">
      <div className="flex items-center gap-1.5 text-xs">
        <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-wide shrink-0">From</span>
        <span className="font-medium text-gray-700 truncate" title={storeName}>{storeName}</span>
      </div>
      <div className="flex items-center pl-3">
        <ArrowRight className="w-3.5 h-3.5 text-blue-500 rotate-90 xl:rotate-0" />
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="px-1 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wide shrink-0">To</span>
        <span className="font-semibold text-blue-600 truncate" title={destStore}>{destStore}</span>
      </div>
    </div>
  );
};

// ── Mobile / Tablet Card ──────────────────────────────────────────────────────
const MobileCard = ({ m, idx, page, rowsPerPage }) => {
  const meta = typeMeta[m.type] || typeMeta[STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-xs text-gray-400 mt-0.5 shrink-0">{(page - 1) * rowsPerPage + idx + 1}.</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate" title={m.item}>{m.item}</p>
            <p className="text-xs text-gray-400 truncate">{m.itemId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${meta.badge}`}>{meta.label}</span>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <p>
          <span className="font-medium text-gray-500">{MOVEMENT_CONSTS.TEXT.DATE_LABEL}</span>
          <span className="ml-2 text-gray-700">{m.date}</span>
          <span className="ml-1 text-gray-400 text-xs">{m.time}</span>
        </p>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-500">{MOVEMENT_CONSTS.TEXT.STORE_CONTEXT_LABEL}</span>
          <div className="mt-1 pl-2 border-l-2 border-gray-200">
            <StoreCell storeName={m.storeName} destStore={m.destStore} />
          </div>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <p>
            <span className="font-medium text-gray-500">{MOVEMENT_CONSTS.TEXT.QTY_LABEL}</span>
            <span className={`ml-2 font-bold ${qtyColor[m.type] ?? "text-gray-700"}`}>
              {qtyPrefix[m.type] ?? ""}{m.qty}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-500">{MOVEMENT_CONSTS.TEXT.STOCK_LABEL}</span>
            <span className="ml-2 text-gray-700 text-xs">{m.before} → {m.after}</span>
          </p>
        </div>
        {m.ref !== "—" && (
          <p>
            <span className="font-medium text-gray-500">{MOVEMENT_CONSTS.TEXT.REF_LABEL}</span>
            <span className="ml-2 text-gray-600 text-xs">{m.ref}</span>
          </p>
        )}
        {m.reason !== "—" && (
          <p className="line-clamp-2">
            <span className="font-medium text-gray-500">{MOVEMENT_CONSTS.TEXT.REASON_LABEL}</span>
            <span className="ml-2 text-gray-600 text-xs" title={m.reason}>{m.reason}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ colSpan }) => {
  const content = (
    <div className="flex flex-col items-center gap-2 text-gray-400">
      <Inbox className="w-10 h-10 opacity-30" />
      <p className="text-sm font-bold text-gray-700 mb-1">{MOVEMENT_CONSTS.TEXT.EMPTY_TITLE}</p>
      <p className="text-xs text-gray-400">{MOVEMENT_CONSTS.TEXT.EMPTY_SUB}</p>
    </div>
  );
  return colSpan
    ? <tr><td colSpan={colSpan} className="py-16 text-center">{content}</td></tr>
    : <div className="py-16 text-center px-4">{content}</div>;
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Movement() {
  const [movements, setMovements] = useState([]);
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({});

  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [storeId, setStoreId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1] || 20);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);

  const totalElements = pagination.totalElements ?? 0;
  const totalPages = pagination.totalPages ?? Math.max(1, Math.ceil(totalElements / rowsPerPage));
  const startItem = totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage, totalElements);

  const resetPage = () => setPage(1);

  const stats = [
    { key: MOVEMENT_CONSTS.STATS.TOTAL_MOVEMENTS, val: statsData?.totalMovements ?? 0, icon: History, txColor: "text-blue-600", bgColor: "bg-blue-50" },
    { key: MOVEMENT_CONSTS.STATS.STOCK_IN, val: statsData?.stockIn ?? 0, icon: ArrowDownToLine, txColor: "text-green-600", bgColor: "bg-green-50" },
    { key: MOVEMENT_CONSTS.STATS.STOCK_OUT, val: statsData?.stockOut ?? 0, icon: ArrowUpFromLine, txColor: "text-red-500", bgColor: "bg-red-50" },
    { key: MOVEMENT_CONSTS.STATS.TRANSFERS, val: statsData?.transfers ?? 0, icon: ArrowLeftRight, txColor: "text-blue-600", bgColor: "bg-indigo-50" },
    { key: MOVEMENT_CONSTS.STATS.ORDERS, val: statsData?.orders ?? 0, icon: ShoppingCart, txColor: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  // ── Fetch stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    setStatsLoading(true);
    getStockMovementStats({})
      .then((data) => setStatsData(data))
      .catch(() => setStatsData(null))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      resetPage();
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── Fetch stores ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setStoresLoading(true);
      try {
        const data = await getActiveStores();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setStores(list.map((s) => ({ id: String(s.id), name: s.name || s.storeName })));
      } catch {
        setStores([]);
      } finally {
        setStoresLoading(false);
      }
    })();
  }, []);

  // ── Fetch movements ───────────────────────────────────────────────────────
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (storeId) filters.storeId = Number(storeId);
      if (typeFilter) filters.movementType = typeFilter;
      if (debouncedSearch) filters.searchTerm = debouncedSearch;
      if (dateFrom) filters.fromDate = `${dateFrom}T00:00:00.000Z`;
      if (dateTo) filters.toDate = `${dateTo}T23:59:59.999Z`;

      const { movements: raw, pagination: pg } = await getStockMovementHistory(filters, page - 1, rowsPerPage);
      setMovements(raw.map(mapMovement));
      setPagination(pg);
    } catch (err) {
      console.error(err);
      setError(MOVEMENT_CONSTS.MESSAGES.LOAD_FAILED);
      setMovements([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, storeId, typeFilter, dateFrom, dateTo, debouncedSearch]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  const handleTypeChange = (v) => { setTypeFilter(v); resetPage(); };
  const handleStoreChange = (v) => { setStoreId(v); resetPage(); };
  const handleFromChange = (v) => { setDateFrom(v); resetPage(); };
  const handleToChange = (v) => { setDateTo(v); resetPage(); };

  const filterCls = "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-700 w-full transition cursor-pointer";
  const tdStyle = "px-3 py-3 text-left text-gray-700 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100">
      <div className="p-2 sm:p-5 lg:p-4">

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{MOVEMENT_CONSTS.TEXT.TITLE}</h1>
            <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
              {MOVEMENT_CONSTS.TEXT.SUBTITLE}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mt-5">
          {statsLoading
            ? Array.from({ length: 5 }).map((_, i) => <CardLoader key={i} />)
            : stats.map((s) => (
              <CardComponent key={s.key} IconName={s.icon} keyName={s.key} val={s.val}
                iconTxColor={s.txColor} iconBgColor={s.bgColor} />
            ))}
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">

          {/* Panel header */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <History className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0" />
              <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">{MOVEMENT_CONSTS.TEXT.TITLE}</h2>
            </div>
            <button
              onClick={() => exportToCSV(movements)}
              disabled={movements.length === 0}
              className="flex items-center cursor-pointer gap-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 active:bg-blue-100 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="px-4 md:px-5 py-3 border-b border-gray-100 bg-white">

            {/* xl+ (Desktop layout): Single unified query filter bar */}
            <div className="hidden xl:flex items-center gap-3">
              {/* Search */}
              <div className="flex flex-1 items-center gap-2 border border-gray-200 rounded-lg bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={MOVEMENT_CONSTS.TEXT.SEARCH_ITEM_NAME_CODE}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                />
              </div>
              {/* All Types */}
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 w-36 shrink-0 cursor-pointer"
              >
                <option value="">{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ALL_TYPES}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}</option>
              </select>
              {/* All Stores */}
              <select
                value={storeId}
                onChange={(e) => handleStoreChange(e.target.value)}
                disabled={storesLoading}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 w-44 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">{storesLoading ? MOVEMENT_CONSTS.TEXT.LOADING_STORES : MOVEMENT_CONSTS.TEXT.ALL_STORES}</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {/* Date From */}
              <input
                type="date"
                value={dateFrom}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleFromChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 w-40 shrink-0 cursor-pointer"
              />
              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleToChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 w-40 shrink-0 cursor-pointer"
              />
            </div>

            {/* md to xl: 2-column stacked layout grid running on 1024px monitors */}
            <div className="hidden md:grid xl:hidden grid-cols-2 gap-2">
              <div className="col-span-2 flex items-center gap-2 border border-gray-200 rounded-lg bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={MOVEMENT_CONSTS.TEXT.SEARCH_ITEM_STORE_USER}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                />
              </div>
              <select value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)}
                className={`${filterCls} cursor-pointer`}>
                <option value="">{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ALL_TYPES}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}</option>
                <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}</option>
              </select>
              <select value={storeId} onChange={(e) => handleStoreChange(e.target.value)} disabled={storesLoading}
                className={`${filterCls} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}>
                <option value="">{storesLoading ? MOVEMENT_CONSTS.TEXT.LOADING_STORES : MOVEMENT_CONSTS.TEXT.ALL_STORES}</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={(e) => handleFromChange(e.target.value)}
                className={`${filterCls} cursor-pointer`} />
              <input type="date" value={dateTo} onChange={(e) => handleToChange(e.target.value)}
                className={`${filterCls} cursor-pointer`} />
            </div>

            {/* Mobile: Completely stacked columns below 768px */}
            <div className="flex md:hidden flex-col gap-2">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={MOVEMENT_CONSTS.TEXT.SEARCH_ITEM_STORE_USER}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)}
                  className={`${filterCls} cursor-pointer`}>
                  <option value="">{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ALL_TYPES}</option>
                  <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}</option>
                  <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}</option>
                  <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}</option>
                  <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}</option>
                </select>
                <select value={storeId} onChange={(e) => handleStoreChange(e.target.value)} disabled={storesLoading}
                  className={`${filterCls} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}>
                  <option value="">{storesLoading ? MOVEMENT_CONSTS.TEXT.LOADING_STORES : MOVEMENT_CONSTS.TEXT.ALL_STORES}</option>
                  {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dateFrom} onChange={(e) => handleFromChange(e.target.value)}
                  className={`${filterCls} cursor-pointer`} />
                <input type="date" value={dateTo} onChange={(e) => handleToChange(e.target.value)}
                  className={`${filterCls} cursor-pointer`} />
              </div>
            </div>

          </div>

          {/* Error message logging context link */}
          {error && (
            <div className="mx-4 md:mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── MOBILE / TABLET / LAPTOP CARDS (below 1280px screen resolution) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden px-4 py-4">
            {loading ? (
              <div className="text-center py-8 col-span-2">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                  <span className="text-gray-600 text-sm">{MOVEMENT_CONSTS.TEXT.LOADING}</span>
                </div>
              </div>
            ) : movements.length === 0 ? (
              <div className="col-span-2"><EmptyState /></div>
            ) : (
              movements.map((m, idx) => (
                <MobileCard key={m.id} m={m} idx={idx} page={page} rowsPerPage={rowsPerPage} />
              ))
            )}
          </div>

          {/* ── WIDESCREEN DESKTOP TABLE VIEW (1280px width and above) ── */}
          <div className="hidden xl:block bg-white rounded-xl border-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                <thead className="border-b border-gray-200">
                  <tr>
                    {[
                      [MOVEMENT_CONSTS.TABLE_HEADERS.DATE_TIME, "text-left"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.ITEM, "text-left"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.TYPE, "text-center"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.STORE_LOG, "text-left"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.QTY, "text-center"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.BEFORE_AFTER, "text-center"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.REFERENCE, "text-left"],
                      [MOVEMENT_CONSTS.TABLE_HEADERS.REASON, "text-center"]
                    ].map(([label, align]) => (
                      <th key={label} className={`px-3 py-3 ${align} text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 font-normal">
                  {loading ? (
                    <ListLoader colSpanSet={10} />
                  ) : movements.length === 0 ? (
                    <EmptyState colSpan={10} />
                  ) : (
                    movements.map((m, idx) => {
                      const meta = typeMeta[m.type] || typeMeta[STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN];
                      return (
                        <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className={tdStyle}>
                            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{m.date}</p>
                            <p className="text-xs text-gray-400 whitespace-nowrap">{m.time}</p>
                          </td>
                          <td className={`${tdStyle} max-w-40`}>
                            <p className="text-sm font-semibold text-gray-800 truncate" title={m.item}>{m.item}</p>
                            <p className="text-xs text-gray-400 truncate">{m.itemId}</p>
                          </td>
                          <td className={`${tdStyle} text-center`}>
                            <div className="flex items-center justify-center gap-1">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                              <span className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${meta.badge}`}>
                                {meta.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-left max-w-56 overflow-hidden">
                            <StoreCell storeName={m.storeName} destStore={m.destStore} />
                          </td>
                          <td className={`${tdStyle} text-center`}>
                            <span className={`text-sm font-bold whitespace-nowrap ${qtyColor[m.type] ?? "text-gray-700"}`}>
                              {qtyPrefix[m.type] ?? ""}{m.qty}
                            </span>
                          </td>
                          <td className={`${tdStyle} text-center`}>
                            <span className="text-sm text-gray-600 text-center whitespace-nowrap">
                              {m.before} → {m.after}
                            </span>
                          </td>
                          <td className={`${tdStyle} max-w-30 overflow-hidden`}>
                            <span className="text-xs text-gray-500 truncate block" title={m.ref}>{m.ref}</span>
                          </td>
                          <td className={`${tdStyle} text-center max-w-30.5 overflow-hidden`}>
                            <span className="text-xs text-gray-600 block" title={m.reason}>{m.reason}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination Control Set */}
            <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-sm text-gray-700">
                  {totalElements === 0
                    ? MOVEMENT_CONSTS.TEXT.NO_MOVEMENTS
                    : STOCK_SHARED_CONSTS.COMMON.SHOWING_RANGE(startItem, endItem, totalElements)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{STOCK_SHARED_CONSTS.COMMON.ROWS_PER_PAGE}</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                  >
                    {ROWS_PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].slice(
                    Math.max(0, page - 3),
                    Math.min(totalPages, page + 2)
                  ).map((_, i) => {
                    const p = Math.max(0, page - 3) + i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        disabled={loading}
                        className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${p === page
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0 || loading}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile / Tablet / Laptop Pagination ── */}
          <div className="xl:hidden border-t border-gray-200 px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="text-center text-sm text-gray-700">
                {totalElements === 0
                  ? MOVEMENT_CONSTS.TEXT.NO_MOVEMENTS
                  : STOCK_SHARED_CONSTS.COMMON.SHOWING_RANGE(startItem, endItem, totalElements)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-700">{STOCK_SHARED_CONSTS.COMMON.ROWS_SHORT}</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {totalPages <= 5 ? (
                    [...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setPage(idx + 1)}
                        className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${page === idx + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {idx + 1}
                      </button>
                    ))
                  ) : (
                    <>
                      <button onClick={() => setPage(1)} className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${page === 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>1</button>
                      {page > 3 && <span className="px-2 text-gray-400">…</span>}
                      {page > 2 && page < totalPages - 1 && (
                        <button onClick={() => setPage(page)} className="px-3 py-1 rounded cursor-pointer bg-blue-500 text-white text-sm font-semibold">{page}</button>
                      )}
                      {page < totalPages - 2 && <span className="px-2 text-gray-400">…</span>}
                      <button onClick={() => setPage(totalPages)} className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${page === totalPages ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{totalPages}</button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0 || loading}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center text-sm text-gray-600">Page {page} of {totalPages}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
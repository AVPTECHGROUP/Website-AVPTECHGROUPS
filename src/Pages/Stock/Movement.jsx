import React, { useState } from "react";
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
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";

const movementsData = [
  { id: 1, date: "04 Mar 2026", time: "09:45 AM", item: "A4 Copy Paper",    itemId: "ITM-001", type: "IN",       store: "Main Store",        qty: 50,  before: 35,  after: 85,  beforeB: null, afterB: null, ref: "INV-2026-031", reason: "Restocked from vendor", by: "Admin"    },
  { id: 2, date: "04 Mar 2026", time: "08:20 AM", item: "Cricket Ball",     itemId: "ITM-004", type: "OUT",      store: "Sports Store",       qty: 4,   before: 6,   after: 2,   beforeB: null, afterB: null, ref: "—",            reason: "Issued to students",   by: "Store Mgr"},
  { id: 3, date: "03 Mar 2026", time: "03:10 PM", item: "Safety Goggles",   itemId: "ITM-003", type: "TRANSFER", store: "Main → Lab Store",   qty: 5,   before: 27,  after: 22,  beforeB: 15,  afterB: 20,   ref: "TRF-A3F1B2C4", reason: "Lab requirement",       by: "Principal"},
  { id: 4, date: "03 Mar 2026", time: "11:00 AM", item: "Whiteboard Marker",itemId: "ITM-002", type: "OUT",      store: "Main Store",         qty: 2,   before: 10,  after: 8,   beforeB: null, afterB: null, ref: "—",            reason: "Issued to teacher",     by: "Admin"    },
  { id: 5, date: "02 Mar 2026", time: "04:30 PM", item: "Geometry Box",     itemId: "ITM-005", type: "IN",       store: "Main Store",         qty: 30,  before: 10,  after: 40,  beforeB: null, afterB: null, ref: "INV-2026-029", reason: "New purchase",          by: "Admin"    },
  { id: 6, date: "01 Mar 2026", time: "02:15 PM", item: "Bunsen Burner",    itemId: "ITM-007", type: "IN",       store: "Science Lab Store",  qty: 3,   before: 0,   after: 3,   beforeB: null, afterB: null, ref: "INV-2026-028", reason: "New purchase",          by: "Admin"    },
  { id: 7, date: "01 Mar 2026", time: "10:00 AM", item: "Shuttlecock",      itemId: "ITM-019", type: "OUT",      store: "Sports Store",       qty: 10,  before: 15,  after: 5,   beforeB: null, afterB: null, ref: "—",            reason: "Issued to sports dept", by: "Store Mgr"},
];

const ROWS_PER_PAGE = 5;

const typeMeta = {
  IN:       { dot: "bg-green-500", badge: "text-green-700 bg-green-50 border border-green-200",  label: "IN"       },
  OUT:      { dot: "bg-red-500",   badge: "text-red-600 bg-red-50 border border-red-200",        label: "OUT"      },
  TRANSFER: { dot: "bg-blue-500",  badge: "text-blue-700 bg-blue-50 border border-blue-200",     label: "TRANSFER" },
};

const qtyColor = { IN: "text-green-600", OUT: "text-red-500", TRANSFER: "text-blue-600" };
const qtyPrefix = { IN: "+", OUT: "-", TRANSFER: "" };

export default function Movement() {
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [dateFrom, setDateFrom] = useState("2026-03-01");
  const [dateTo, setDateTo] = useState("2026-03-04");
  const [page, setPage] = useState(1);

  const allStores = ["All Stores", ...Array.from(new Set(movementsData.map((m) => m.store)))];

  const filtered = movementsData.filter((m) => {
    const matchSearch =
      m.item.toLowerCase().includes(search.toLowerCase()) ||
      m.store.toLowerCase().includes(search.toLowerCase()) ||
      m.by.toLowerCase().includes(search.toLowerCase());
    const matchType  = typeFilter  === "All Types"  || m.type === typeFilter;
    const matchStore = storeFilter === "All Stores" || m.store === storeFilter;
    return matchSearch && matchType && matchStore;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const totalIn       = movementsData.filter((m) => m.type === "IN").length;
  const totalOut      = movementsData.filter((m) => m.type === "OUT").length;
  const totalTransfer = movementsData.filter((m) => m.type === "TRANSFER").length;

  const stats = [
    { key: "Total Movements", val: movementsData.length, icon: History,          txColor: "text-blue-600",   bgColor: "bg-blue-50"   },
    { key: "Stock IN",        val: totalIn,               icon: ArrowDownToLine,  txColor: "text-green-600",  bgColor: "bg-green-50"  },
    { key: "Stock OUT",       val: totalOut,              icon: ArrowUpFromLine,  txColor: "text-red-500",    bgColor: "bg-red-50"    },
    { key: "Transfers",       val: totalTransfer,         icon: ArrowLeftRight,   txColor: "text-blue-600",   bgColor: "bg-indigo-50" },
  ];

  const actionOptions = [
    { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
  ];

  const callAllActions = (optVal, movement) => {
    if (optVal === "view") console.log("View movement:", movement.id);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Stock Movement History</h1>
        <p className="text-gray-500 text-sm mt-1">Track all stock IN, OUT and transfer movements across stores.</p>
      </div>

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800 text-lg">Stock Movement History</h2>
          </div>
          <button className="flex items-center gap-2 border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

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
              onClick={() => setPage(1)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full min-w-225">
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
                  <td colSpan={10} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No movements found.
                  </td>
                </tr>
              ) : (
                paginated.map((m) => {
                  const meta = typeMeta[m.type];
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
                      <td className="px-5 py-4 text-sm text-gray-600">{m.reason}</td>
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

        <div className="sm:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
            </div>
          ) : paginated.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No movements found.</p>
          ) : (
            paginated.map((m) => {
              const meta = typeMeta[m.type];
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
            Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} movements
          </p>
        </div>
      </div>
    </div>
  );
}
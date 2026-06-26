import { useState, useEffect, useCallback } from "react";
import { X, Search, Loader2, Plus, Check, AlertCircle, AlertTriangle, IndianRupee } from "lucide-react";
import { getStockItems } from "../../../Api/Stock/StockApi";
import { checkItemAvailability } from "../../../Api/Stock/StudentOrder";

// ─── Category badge colors ────────────────────────────────────────
const categoryColors = {
  STATIONERY: "bg-yellow-100 text-yellow-700 border-yellow-200",
  BOOKS:      "bg-purple-100 text-purple-700 border-purple-200",
  LAB:        "bg-blue-100   text-blue-700   border-blue-200",
  SPORTS:     "bg-green-100  text-green-700  border-green-200",
  UNIFORM:    "bg-pink-100   text-pink-700   border-pink-200",
  ARTS:       "bg-orange-100 text-orange-700 border-orange-200",
};
function categoryBadgeCls(cat) {
  return categoryColors[(cat || "").toUpperCase()] || "bg-gray-100 text-gray-600 border-gray-200";
}

// ─── Main ─────────────────────────────────────────────────────────
export default function StudentOrderAddItem({ isOpen, onClose, storeId, existingItems = [], onAddItems }) {

  const [allItems,     setAllItems]     = useState([]);
  const [availMap,     setAvailMap]     = useState({});
  const [loading,      setLoading]      = useState(false);
  const [availLoading, setAvailLoading] = useState(false);
  const [error,        setError]        = useState("");

  const [search,         setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [categories,     setCategories]     = useState([]);

  const [selected, setSelected] = useState(new Set());

  const existingIds = new Set(existingItems.map((i) => String(i.itemId)));

  const loadItems = useCallback(async () => {
    setLoading(true); setError(""); setAvailMap({});
    try {
      const res  = await getStockItems({ status: "ACTIVE" });
      const list =
        res?.content || res?.data?.content || res?.items ||
        (Array.isArray(res?.data) ? res.data : null) ||
        (Array.isArray(res) ? res : []);
      setAllItems(list);
      const cats = [...new Set(list.map((i) => (i.category || "").toUpperCase()).filter(Boolean))].sort();
      setCategories(cats);
      if (list.length && storeId) {
        checkAvailability(list.map((i) => i.itemId ?? i.id), list);
      }
    } catch (e) {
      console.error("StudentOrderAddItem loadItems:", e);
      setError("Failed to load items. Please try again.");
    } finally { setLoading(false); }
  }, [storeId]); // eslint-disable-line

  const checkAvailability = useCallback(async (itemIds, itemsList) => {
    if (!storeId || !itemIds?.length) return;
    setAvailLoading(true);
    try {
      const res  = await checkItemAvailability(Number(storeId), itemIds);
      const list = Array.isArray(res) ? res : (res?.data || []);
      const map  = {};
      list.forEach((i) => {
        const fullItem = (itemsList || allItems).find((it) => String(it.itemId ?? it.id) === String(i.itemId));
        map[String(i.itemId)] = {
          availableQuantity: i.notStockedInStore ? 0 : (i.availableQuantity ?? 0),
          notStockedInStore: i.notStockedInStore ?? false,
          isAvailable:       i.isAvailable       ?? false,
          isOutOfStock:      i.isOutOfStock       ?? false,
          unitPrice:         fullItem?.unitPrice  ?? null,
        };
      });
      setAvailMap(map);
    } catch (e) { console.error("StudentOrderAddItem checkAvailability:", e); }
    finally { setAvailLoading(false); }
  }, [storeId, allItems]); // eslint-disable-line

  useEffect(() => {
    if (!isOpen) {
      setSearch(""); setCategoryFilter("ALL");
      setSelected(new Set()); setError("");
      setAvailMap({}); setAllItems([]);
      return;
    }
    loadItems();
  }, [isOpen]); // eslint-disable-line

  const filtered = allItems.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (item.itemName || item.name || "").toLowerCase().includes(q) ||
      (item.itemCode || item.code || "").toLowerCase().includes(q);
    const matchCat = categoryFilter === "ALL" || (item.category || "").toUpperCase() === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggle = (itemId) => {
    const id = String(itemId);
    if (existingIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const toAdd = allItems
      .filter((item) => selected.has(String(item.itemId ?? item.id)))
      .map((item) => {
        const id    = String(item.itemId ?? item.id);
        const avail = availMap[id];
        const unitPriceSnapshot = avail?.unitPrice ?? item.unitPrice ?? null;
        const qty   = 1;
        return {
          itemId:            item.itemId   ?? item.id,
          itemName:          item.itemName ?? item.name ?? `Item #${id}`,
          itemCode:          item.itemCode ?? item.code ?? "—",
          itemUnit:          item.itemUnit ?? item.unit ?? "PCS",
          category:          item.category ?? "",
          quantity:          qty,
          availableQty:      avail?.availableQuantity ?? item.availableQuantity ?? null,
          notStockedInStore: avail?.notStockedInStore ?? false,
          unitPriceSnapshot,
          lineTotal:         unitPriceSnapshot !== null ? unitPriceSnapshot * qty : null,
        };
      });
    if (toAdd.length) onAddItems?.(toAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] sai-anim">
        <style>{`
          @keyframes saiIn {
            from { opacity: 0; transform: scale(.95) translateY(10px); }
            to   { opacity: 1; transform: scale(1)  translateY(0);     }
          }
          .sai-anim { animation: saiIn .18s ease-out forwards; }
        `}</style>

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-0 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-gray-800">Add Extra Items</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Search + Category Filter ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex flex-1 items-center gap-2 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input type="text" placeholder="Search item by name or code..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="text-xs focus:outline-none text-gray-600 w-full bg-transparent placeholder:text-gray-400"
              autoFocus />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500 shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-gray-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600 w-full sm:w-auto">
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        {/* ── Table Header — desktop only ── */}
        <div className="hidden sm:grid items-center px-4 py-2.5 border-b border-gray-100 shrink-0 bg-sky-50/80"
          style={{ gridTemplateColumns: "32px 1fr 90px 52px 72px 80px" }}>
          <span />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Item</span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Category</span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Unit</span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider text-right">Stock</span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider text-right flex items-center justify-end gap-0.5">
            <IndianRupee className="w-3 h-3" /> Price
          </span>
        </div>

        {/* ── Item List ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <p className="text-xs">Loading items…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12 text-red-400 text-center px-6">
              <AlertCircle className="w-7 h-7 opacity-50" />
              <p className="text-xs font-medium">{error}</p>
              <button onClick={loadItems} className="text-xs text-blue-500 hover:underline mt-1">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-gray-400">
              <Search className="w-7 h-7 opacity-30" />
              <p className="text-xs font-medium">No items found</p>
              {(search || categoryFilter !== "ALL") && (
                <button onClick={() => { setSearch(""); setCategoryFilter("ALL"); }} className="text-xs text-blue-500 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filtered.map((item) => {
              const id         = String(item.itemId ?? item.id);
              const isExisting = existingIds.has(id);
              const isSelected = selected.has(id);
              const name       = item.itemName ?? item.name ?? `Item #${id}`;
              const code       = item.itemCode ?? item.code ?? "—";
              const unit       = item.itemUnit ?? item.unit ?? "PCS";
              const cat        = item.category ? item.category.toUpperCase() : "";
              const catCls     = categoryBadgeCls(cat);
              const avail      = availMap[id];
              const availQty   = avail?.availableQuantity ?? null;
              const notStocked = avail?.notStockedInStore ?? false;
              const isOutOfStock = availQty === 0;
              const unitPrice  = avail?.unitPrice ?? item.unitPrice ?? null;

              return (
                <div key={id} onClick={() => toggle(id)}
                  className={`transition-colors select-none
                    ${isExisting  ? "bg-yellow-50/60 cursor-not-allowed"
                    : isSelected  ? "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                    :               "hover:bg-gray-50 cursor-pointer"}`}>

                  {/* ── Desktop row ── */}
                  <div className="hidden sm:grid items-center px-4 py-3 gap-2"
                    style={{ gridTemplateColumns: "32px 1fr 90px 52px 72px 80px" }}>
                    <div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0
                        ${isExisting ? "border-yellow-300 bg-yellow-100"
                        : isSelected  ? "border-blue-600 bg-blue-600"
                        :               "border-gray-300 bg-white"}`}>
                        {isExisting ? <Check className="w-3 h-3 text-yellow-500" />
                        : isSelected ? <Check className="w-3 h-3 text-white" />
                        : null}
                      </div>
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className={`text-sm font-bold truncate leading-tight ${isExisting ? "text-gray-400" : "text-gray-800"}`}>{name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{code}</p>
                    </div>
                    <div>
                      {cat
                        ? <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${catCls}`}>{cat}</span>
                        : <span className="text-xs text-gray-300">—</span>}
                    </div>
                    <div><span className="text-sm text-gray-500 font-medium">{unit}</span></div>
                    <div className="text-right">
                      {availLoading && availQty === null ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-300 ml-auto" />
                      ) : notStocked ? (
                        <span className="text-xs font-semibold text-gray-400 flex items-center justify-end gap-1">
                          <AlertTriangle className="w-3 h-3 text-gray-300 shrink-0" />N/A
                        </span>
                      ) : isOutOfStock ? (
                        <span className="text-xs font-bold text-red-500">0</span>
                      ) : availQty !== null ? (
                        <span className={`text-xs font-bold ${availQty <= 5 ? "text-orange-500" : "text-green-600"}`}>{availQty}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                    <div className="text-right">
                      {availLoading && unitPrice === null ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-300 ml-auto" />
                      ) : unitPrice !== null ? (
                        <span className={`text-xs font-semibold ${isSelected ? "text-blue-700" : "text-gray-600"}`}>
                          ₹{Number(unitPrice).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </div>

                  {/* ── Mobile row ── */}
                  <div className="sm:hidden flex items-start gap-3 px-4 py-3">
                    <div className="pt-0.5 shrink-0">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all
                        ${isExisting ? "border-yellow-300 bg-yellow-100"
                        : isSelected  ? "border-blue-600 bg-blue-600"
                        :               "border-gray-300 bg-white"}`}>
                        {isExisting ? <Check className="w-3 h-3 text-yellow-500" />
                        : isSelected ? <Check className="w-3 h-3 text-white" />
                        : null}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-tight ${isExisting ? "text-gray-400" : "text-gray-800"}`}>{name}</p>
                        {unitPrice !== null && (
                          <span className={`text-xs font-semibold shrink-0 ${isSelected ? "text-blue-700" : "text-gray-600"}`}>
                            ₹{Number(unitPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{code}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {cat && <span className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded-full border ${catCls}`}>{cat}</span>}
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{unit}</span>
                        {notStocked ? (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />N/A</span>
                        ) : isOutOfStock ? (
                          <span className="text-xs font-bold text-red-500">Out of stock</span>
                        ) : availQty !== null ? (
                          <span className={`text-xs font-bold ${availQty <= 5 ? "text-orange-500" : "text-green-600"}`}>{availQty} in stock</span>
                        ) : availLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/80 shrink-0 rounded-b-2xl">
          <p className="text-xs min-w-0">
            {selected.size > 0
              ? <span className="font-semibold text-blue-600">{selected.size} item{selected.size > 1 ? "s" : ""} selected</span>
              : <span className="text-gray-400">Tap items to select</span>}
            {existingIds.size > 0 && (
              <span className="text-gray-400 ml-2 hidden sm:inline">· {existingIds.size} already in order</span>
            )}
            {availLoading && (
              <span className="text-gray-300 ml-2 hidden sm:inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> checking stock…
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleAdd} disabled={selected.size === 0}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-3.5 h-3.5" />
              Add {selected.size > 0 ? `(${selected.size})` : "Items"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
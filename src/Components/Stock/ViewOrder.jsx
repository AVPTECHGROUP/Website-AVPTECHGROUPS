import { useEffect, useState } from "react";
import {
  X, User, ShoppingBag, Package, MapPin,
  CheckCircle, Clock, XCircle, Truck, Loader2,
  FileText,
} from "lucide-react";
import { getStudentOrderById } from "../../Api/StudentOrder";

const statusConfig = {
  DRAFT: {
    cls:   "bg-gray-100   text-gray-600    border-gray-300",
    icon:  FileText,
    label: "Draft",
  },
  PENDING: {
    cls:   "bg-yellow-100 text-yellow-700  border-yellow-200",
    icon:  Clock,
    label: "Pending",
  },
  CONFIRMED: {
    cls:   "bg-blue-100   text-blue-700    border-blue-200",
    icon:  CheckCircle,
    label: "Confirmed",
  },
  APPROVED: {
    cls:   "bg-blue-100   text-blue-700    border-blue-200",
    icon:  CheckCircle,
    label: "Approved",
  },
  DISPATCHED: {
    cls:   "bg-purple-100 text-purple-700  border-purple-200",
    icon:  Truck,
    label: "Dispatched",
  },
  DELIVERED: {
    cls:   "bg-green-100  text-green-700   border-green-200",
    icon:  CheckCircle,
    label: "Delivered",
  },
  CANCELLED: {
    cls:   "bg-red-100    text-red-600     border-red-200",
    icon:  XCircle,
    label: "Cancelled",
  },
};

// Fallback for any unknown status
const fallbackStatus = {
  cls:   "bg-gray-100 text-gray-600 border-gray-200",
  icon:  FileText,
  label: "—",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Props ────────────────────────────────────────────────────────
// isOpen  — boolean
// onClose — fn()
// order   — order object from the list row (used as initial data / to get id)
export default function ViewStudentOrder({ isOpen, onClose, order }) {
  // We fetch the FULL order from API on open so we get the latest status + items
  const [fullOrder,     setFullOrder]     = useState(null);
  const [fetchLoading,  setFetchLoading]  = useState(false);
  const [fetchError,    setFetchError]    = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fetch full order details whenever modal opens
  useEffect(() => {
    if (!isOpen || !order?.id) {
      setFullOrder(null);
      setFetchError("");
      return;
    }

    setFetchLoading(true);
    setFetchError("");

    getStudentOrderById(order.id)
      .then((data) => {
        // API may return { data: {...} } or the object directly
        setFullOrder(data?.data || data);
      })
      .catch((e) => {
        console.error("ViewOrder fetch:", e);
        setFetchError("Failed to load order details. Showing cached data.");
        // Fallback: use the list row data
        setFullOrder(order);
      })
      .finally(() => setFetchLoading(false));
  }, [isOpen, order?.id]); // eslint-disable-line

  if (!isOpen || !order) return null;

  // Use fetched data if available, otherwise fall back to list row data
  const o = fullOrder || order;

  // ── Resolve status — API returns `status` (not `orderStatus`) ──
  const rawStatus = (o.status || o.orderStatus || "").toUpperCase();
  const sc        = statusConfig[rawStatus] || fallbackStatus;
  const StatusIcon = sc.icon;

  const items = o.items || o.orderItems || [];
  const total = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[92vh] vso-anim">
        <style>{`
          @keyframes vsoIn {
            from { opacity: 0; transform: scale(.95) translateY(10px); }
            to   { opacity: 1; transform: scale(1)  translateY(0);     }
          }
          .vso-anim { animation: vsoIn .2s ease-out forwards; }
        `}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Order #{o.id}</h2>
              <p className="text-xs text-gray-400">{fmtDate(o.orderDate || o.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status badge — driven by o.status */}
            {fetchLoading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sc.cls}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {sc.label}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Error banner */}
          {fetchError && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <span>⚠️ {fetchError}</span>
            </div>
          )}

          {/* Loading skeleton */}
          {fetchLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-24 bg-gray-100 rounded-xl" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
              </div>
            </div>
          ) : (
            <>
              {/* Student + Store cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Student */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                    <User className="w-3.5 h-3.5" /> Student
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {o.studentName || "—"}
                  </p>
                  {o.admissionNumber && (
                    <p className="text-xs text-gray-500">ADM: {o.admissionNumber}</p>
                  )}
                  {o.className && (
                    <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                      {o.className}
                    </span>
                  )}
                </div>

                {/* Store */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                    <ShoppingBag className="w-3.5 h-3.5" /> Store
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {o.storeName || `Store #${o.storeId}` || "—"}
                  </p>
                  {o.storeCode && (
                    <p className="text-xs text-gray-500">{o.storeCode}</p>
                  )}
                  {(o.storeLocation || o.storeAddress) && (
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                      {o.storeLocation || o.storeAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Issued by + Date row */}
              {(o.issuedByName || o.orderDate) && (
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  {o.orderDate && (
                    <span>📅 <span className="font-semibold text-gray-700">Order Date:</span> {fmtDate(o.orderDate)}</span>
                  )}
                  {o.issuedByName && (
                    <span>👤 <span className="font-semibold text-gray-700">Issued by:</span> {o.issuedByName}</span>
                  )}
                </div>
              )}

              {/* Remarks */}
              {o.remarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{o.remarks}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Items ({items.length})
                </p>

                {items.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    <Package className="w-8 h-8 mx-auto text-gray-200 mb-1" />
                    <p className="text-xs">No items found in this order.</p>
                  </div>
                ) : (
                  <>
                    {/* Column headers */}
                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="col-span-6">Item</span>
                      <span className="col-span-3 text-center">Qty</span>
                      <span className="col-span-3 text-right">Unit</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((item, idx) => {
                        const name = item.itemName  || item.name || `Item #${item.itemId || idx}`;
                        const code = item.itemCode  || item.code || "";
                        const qty  = item.quantity  || item.qty  || 0;
                        const unit = item.itemUnit  || item.unit || "—";
                        return (
                          <div key={item.id || item.itemId || idx} className="grid grid-cols-12 items-center py-3">
                            <div className="col-span-6">
                              <p className="text-sm font-semibold text-gray-800">{name}</p>
                              {code && <p className="text-xs text-gray-400 mt-0.5">{code}</p>}
                            </div>
                            <div className="col-span-3 text-center">
                              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">
                                {qty}
                              </span>
                            </div>
                            <div className="col-span-3 text-right text-xs text-gray-500 font-medium">
                              {unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex-wrap gap-3">
                <span className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">{items.length}</span>{" "}
                  item type{items.length !== 1 ? "s" : ""}
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">{total}</span> total units
                </span>

                {/* Status-specific footer note */}
                {rawStatus === "DELIVERED" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <CheckCircle className="w-4 h-4" /> Order delivered
                  </span>
                )}
                {rawStatus === "CANCELLED" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                    <XCircle className="w-4 h-4" /> Order cancelled
                  </span>
                )}
                {rawStatus === "DISPATCHED" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-600">
                    <Truck className="w-4 h-4" /> Out for delivery
                  </span>
                )}
                {rawStatus === "CONFIRMED" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                    <CheckCircle className="w-4 h-4" /> Stock issued
                  </span>
                )}
                {rawStatus === "DRAFT" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                    <FileText className="w-4 h-4" /> Saved as draft
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
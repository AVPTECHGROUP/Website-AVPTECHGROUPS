import { useEffect, useRef, useState } from "react";
import {
  X, User, ShoppingBag, Package, MapPin,
  CheckCircle, Clock, XCircle, Truck, Loader2,
  FileText, Printer,
} from "lucide-react";
import { getStudentOrderById } from "../../../Api/StudentOrder";
// BUG FIX: import shared printOrder instead of duplicating print logic here
import { printOrder } from "../../../Components/CommonComp/Print/Printorderutil";

// ── Status config ─────────────────────────────────────────────────
const statusConfig = {
  DRAFT:      { cls: "bg-gray-100   text-gray-600   border-gray-300",   icon: FileText,    label: "Draft"      },
  PENDING:    { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock,       label: "Pending"    },
  CONFIRMED:  { cls: "bg-blue-100   text-blue-700   border-blue-200",   icon: CheckCircle, label: "Confirmed"  },
  APPROVED:   { cls: "bg-blue-100   text-blue-700   border-blue-200",   icon: CheckCircle, label: "Approved"   },
  DISPATCHED: { cls: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck,       label: "Dispatched" },
  DELIVERED:  { cls: "bg-green-100  text-green-700  border-green-200",  icon: CheckCircle, label: "Delivered"  },
  CANCELLED:  { cls: "bg-red-100    text-red-600    border-red-200",    icon: XCircle,     label: "Cancelled"  },
};

const fallbackStatus = {
  cls: "bg-gray-100 text-gray-600 border-gray-200",
  icon: FileText,
  label: "—",
};

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  // BUG FIX: "YYYY-MM-DD" parsed as UTC → off by one day in local TZ
  // Detect ISO-date-only strings and append T00:00 to force local time
  const str    = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00` : d;
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return "—"; // BUG FIX: guard invalid dates
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtRupee(val) {
  if (val == null) return "—";
  const num = Number(val);
  if (isNaN(num)) return "—"; // BUG FIX: guard NaN
  return `₹${num.toFixed(2)}`;
}

// ── Main component ────────────────────────────────────────────────
export default function ViewStudentOrder({ isOpen, onClose, order }) {
  const [fullOrder,    setFullOrder]    = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError,   setFetchError]   = useState("");
  const [printing,     setPrinting]     = useState(false);
  const [gstInput,     setGstInput]     = useState("");

  // BUG FIX: unmount guard
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // BUG FIX: body scroll lock — original had a cleanup gap where overflow
  // wasn't restored if the component unmounted while isOpen was true
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // BUG FIX: Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // ── Fetch full order on open ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || !order?.id) {
      setFullOrder(null);
      setFetchError("");
      return;
    }
    setFetchLoading(true);
    setFetchError("");
    // BUG FIX: also reset gstInput when opening a new order
    setGstInput("");

    getStudentOrderById(order.id)
      .then((data) => {
        if (!mountedRef.current) return;
        setFullOrder(data?.data || data);
      })
      .catch((e) => {
        console.error("ViewOrder fetch:", e);
        if (!mountedRef.current) return;
        setFetchError("Failed to load order details. Showing cached data.");
        setFullOrder(order); // BUG FIX: fall back to the prop data, not null
      })
      .finally(() => {
        if (mountedRef.current) setFetchLoading(false);
      });
  }, [isOpen, order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !order) return null;

  const o          = fullOrder || order;
  const rawStatus  = (o.status || o.orderStatus || "").toUpperCase();
  const sc         = statusConfig[rawStatus] || fallbackStatus;
  const StatusIcon = sc.icon;
  const items      = o.items || o.orderItems || [];
  const total      = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);

  const handlePrint = () => {
    if (fetchLoading || printing) return;
    setPrinting(true);
    // BUG FIX: uses the shared printOrder utility, removed duplicate logic
    printOrder(o, gstInput);
    setTimeout(() => {
      if (mountedRef.current) setPrinting(false);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      // BUG FIX: z-50 might be below modals like CancelConfirmModal (z-1000);
      // use a higher value here
      style={{ zIndex: 900 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-order-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[92vh] vso-anim">
        <style>{`
          @keyframes vsoIn {
            from { opacity:0; transform:scale(.95) translateY(10px); }
            to   { opacity:1; transform:scale(1)   translateY(0);    }
          }
          .vso-anim { animation: vsoIn .2s ease-out forwards; }
        `}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="view-order-title" className="text-base font-bold text-gray-800">
                Order #{o.id}
              </h2>
              <p className="text-xs text-gray-400">{fmtDate(o.orderDate || o.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {fetchLoading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> Loading…
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sc.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" /> {sc.label}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {fetchError && (
            <div role="alert" className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              ⚠️ {fetchError}
            </div>
          )}

          {fetchLoading ? (
            <div className="space-y-4 animate-pulse" aria-label="Loading order details">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-24 bg-gray-100 rounded-xl" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Student & Store */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                    <User className="w-3.5 h-3.5" aria-hidden="true" /> Student
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                    <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Store
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {o.storeName || (o.storeId ? `Store #${o.storeId}` : "—")}
                  </p>
                  {o.storeCode && (
                    <p className="text-xs text-gray-500">{o.storeCode}</p>
                  )}
                  {(o.storeLocation || o.storeAddress) && (
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <MapPin className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
                      {o.storeLocation || o.storeAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Order date */}
              {o.orderDate && (
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  <span>
                    📅 <span className="font-semibold text-gray-700">Order Date:</span>{" "}
                    {fmtDate(o.orderDate)}
                  </span>
                </div>
              )}

              {/* Firm + GST */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
                    Firm Name
                  </p>
                  <p className="text-sm font-extrabold text-gray-800 tracking-wide">LEELA ENTERPRISES</p>
                </div>
                <div>
                  <label
                    htmlFor="gst-input"
                    className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1"
                  >
                    GST Number{" "}
                    <span className="text-gray-300 font-normal normal-case">
                      (optional — will appear on print)
                    </span>
                  </label>
                  <input
                    id="gst-input"
                    type="text"
                    value={gstInput}
                    onChange={(e) => setGstInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full text-sm font-mono border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-300 tracking-widest"
                  />
                </div>
              </div>

              {/* Remarks */}
              {o.remarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{o.remarks}</p>
                </div>
              )}

              {/* Items table */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Items ({items.length})
                </p>
                {items.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    <Package className="w-8 h-8 mx-auto text-gray-200 mb-1" aria-hidden="true" />
                    <p className="text-xs">No items found in this order.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-4">Item</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Rate</span>
                      <span className="col-span-3 text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((item, idx) => {
                        const name = item.itemName || item.name || `Item #${item.itemId || idx}`;
                        const code = item.itemCode || item.code || "";
                        const qty  = item.quantity  || item.qty  || 0;
                        const up   = item.unitPriceSnapshot != null ? fmtRupee(item.unitPriceSnapshot) : "—";
                        // BUG FIX: use stored lineTotal first; fallback to recalc
                        const lt   = item.lineTotal != null
                          ? fmtRupee(item.lineTotal)
                          : (item.unitPriceSnapshot != null
                              ? fmtRupee(item.unitPriceSnapshot * qty)
                              : "—");
                        return (
                          <div
                            key={item.id || item.itemId || idx}
                            className="grid grid-cols-12 items-center py-2.5"
                          >
                            <div className="col-span-1 text-center text-xs text-gray-400">{idx + 1}</div>
                            <div className="col-span-4">
                              <p className="text-sm font-semibold text-gray-800">{name}</p>
                              {code && <p className="text-xs text-gray-400">{code}</p>}
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg">
                                {qty}
                              </span>
                            </div>
                            <div className="col-span-2 text-right text-sm text-gray-700">{up}</div>
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800">{lt}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-12 items-center pt-3 mt-1 border-t-2 border-gray-200">
                      <div className="col-span-1" />
                      <div className="col-span-4 text-sm font-bold text-gray-800">Order Total</div>
                      <div className="col-span-2 text-center text-sm font-bold text-gray-800">{total}</div>
                      <div className="col-span-2" />
                      <div className="col-span-3 text-right text-sm font-bold text-blue-600">
                        {o.totalAmount != null ? fmtRupee(o.totalAmount) : "—"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{items.length}</span>{" "}
                    item type{items.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{total}</span> total units
                  </span>
                  {rawStatus === "DELIVERED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600"><CheckCircle className="w-4 h-4" aria-hidden="true" /> Delivered</span>}
                  {rawStatus === "CANCELLED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500"><XCircle className="w-4 h-4" aria-hidden="true" /> Cancelled</span>}
                  {rawStatus === "DISPATCHED" && <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-600"><Truck className="w-4 h-4" aria-hidden="true" /> Dispatched</span>}
                  {rawStatus === "CONFIRMED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600"><CheckCircle className="w-4 h-4" aria-hidden="true" /> Confirmed</span>}
                  {rawStatus === "DRAFT"      && <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500"><FileText className="w-4 h-4" aria-hidden="true" /> Draft</span>}
                </div>
                {o.totalAmount != null && (
                  <span className="text-sm font-bold text-blue-600">
                    Total: {fmtRupee(o.totalAmount)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400 hidden sm:block">
            🖨️ 3 copies · A4 Landscape · up to 25 items per page
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handlePrint}
              disabled={fetchLoading || printing}
              className="flex items-center cursor-pointer bg-blue-700 gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {printing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Preparing...</>
                : <><Printer className="w-3.5 h-3.5" aria-hidden="true" /> Print</>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
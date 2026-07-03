import { useEffect, useState } from "react";
import {
  X, User, ShoppingBag, Package, MapPin,
  CheckCircle, Clock, XCircle, Truck, Loader2,
  FileText, Printer, CreditCard,
} from "lucide-react";
import { getStudentOrderById } from "../../../Api/Stock/StudentOrder";
import { printOrder } from "../../../Components/CommonComp/Print/Printorderutil";
import { STOCK_SHARED_CONSTS, VIEW_ORDER_CONSTS } from "../../../Constants/StringConstants/StockAndOrdersConstants";

/* ─── Status config ──────────────────────────────────────────────────────── */
const statusConfig = {
  [STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API]: { cls: "bg-gray-100   text-gray-600   border-gray-300", icon: FileText, label: STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_LABEL },
  PENDING: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, label: STOCK_SHARED_CONSTS.ORDER_STATUS.PENDING_LABEL },
  [STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API]: { cls: "bg-blue-100   text-blue-700   border-blue-200", icon: CheckCircle, label: STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_LABEL },
  APPROVED: { cls: "bg-blue-100   text-blue-700   border-blue-200", icon: CheckCircle, label: STOCK_SHARED_CONSTS.ORDER_STATUS.APPROVED_LABEL },
  [STOCK_SHARED_CONSTS.ORDER_STATUS.DISPATCHED_API]: { cls: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck, label: STOCK_SHARED_CONSTS.ORDER_STATUS.DISPATCHED_LABEL },
  [STOCK_SHARED_CONSTS.ORDER_STATUS.DELIVERED_API]: { cls: "bg-green-100  text-green-700  border-green-200", icon: CheckCircle, label: STOCK_SHARED_CONSTS.ORDER_STATUS.DELIVERED_LABEL },
  [STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_API]: { cls: "bg-red-100    text-red-600    border-red-200", icon: XCircle, label: STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_LABEL },
};

const fallbackStatus = {
  cls: "bg-gray-100 text-gray-600 border-gray-200", icon: FileText, label: "—",
};

/* ─── Payment display helpers ────────────────────────────────────────────── */
const PAYMENT_LABELS = {
  CASH: STOCK_SHARED_CONSTS.PAYMENT_METHOD.CASH,
  ONLINE: STOCK_SHARED_CONSTS.PAYMENT_METHOD.ONLINE,
  UPI: STOCK_SHARED_CONSTS.PAYMENT_METHOD.UPI,
  CHEQUE: STOCK_SHARED_CONSTS.PAYMENT_METHOD.CHEQUE,
  DD: STOCK_SHARED_CONSTS.PAYMENT_METHOD.DEMAND_DRAFT,
  CARD: STOCK_SHARED_CONSTS.PAYMENT_METHOD.CARD,
  FREE_ISSUE: STOCK_SHARED_CONSTS.PAYMENT_METHOD.FREE_ISSUE,
};

const PAYMENT_COLORS = {
  CASH: "bg-green-50  text-green-700  border-green-200",
  ONLINE: "bg-blue-50   text-blue-700   border-blue-200",
  UPI: "bg-purple-50 text-purple-700 border-purple-200",
  CHEQUE: "bg-orange-50 text-orange-700 border-orange-200",
  DD: "bg-orange-50 text-orange-700 border-orange-200",
  CARD: "bg-sky-50    text-sky-700    border-sky-200",
  FREE_ISSUE: "bg-teal-50   text-teal-700   border-teal-200",
};

/* ─── Local formatters ───────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(STOCK_SHARED_CONSTS.LOCALE.DATE_IN, { day: "2-digit", month: "short", year: "numeric" });
}

function fmtPaymentMethod(val) {
  if (!val) return null;
  return PAYMENT_LABELS[(val || "").toUpperCase()] || val;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ViewStudentOrder({ isOpen, onClose, order }) {
  const [fullOrder, setFullOrder] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [printing, setPrinting] = useState(false);
  const [gstInput, setGstInput] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !order?.id) { setFullOrder(null); setFetchError(""); return; }
    setFetchLoading(true);
    setFetchError("");
    getStudentOrderById(order.id)
      .then((data) => setFullOrder(data?.data || data))
      .catch((e) => {
        console.error("ViewOrder fetch:", e);
        setFetchError(VIEW_ORDER_CONSTS.MESSAGES.LOAD_FAILED);
        setFullOrder(order);
      })
      .finally(() => setFetchLoading(false));
  }, [isOpen, order?.id]); // eslint-disable-line

  if (!isOpen || !order) return null;

  const o = fullOrder || order;
  const rawStatus = (o.status || o.orderStatus || "").toUpperCase();
  const sc = statusConfig[rawStatus] || fallbackStatus;
  const StatusIcon = sc.icon;
  const items = o.items || o.orderItems || [];
  const total = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);

  // Payment method for UI badge
  const pmKey = (o.paymentMethod || "").toUpperCase();
  const pmLabel = fmtPaymentMethod(o.paymentMethod);
  const pmColors = PAYMENT_COLORS[pmKey] || "bg-gray-50 text-gray-600 border-gray-200";
  const txnNo = o.transactionNumber || null;

  const handlePrint = () => {
    if (fetchLoading) return;
    setPrinting(true);
    printOrder(o, gstInput);           // ← printOrderUtil.js
    setTimeout(() => setPrinting(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

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
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Order #{o.id}</h2>
              <p className="text-xs text-gray-400">{fmtDate(o.orderDate || o.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {fetchLoading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                <Loader2 className="w-3 h-3 animate-spin" /> {STOCK_SHARED_CONSTS.COMMON.LOADING_ELLIPSIS}
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sc.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" /> {sc.label}
              </span>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {fetchError && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              ⚠️ {fetchError}
            </div>
          )}

          {fetchLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-24 bg-gray-100 rounded-xl" />
              </div>
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <>
              {/* Student & Store */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                    <User className="w-3.5 h-3.5" /> Student
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{o.studentName || "—"}</p>
                  {o.admissionNumber && <p className="text-xs text-gray-500">ADM: {o.admissionNumber}</p>}
                  {o.className && (
                    <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                      {o.className}
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                    <ShoppingBag className="w-3.5 h-3.5" /> Store
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {o.storeName || (o.storeId ? VIEW_ORDER_CONSTS.FALLBACKS.STORE_ID(o.storeId) : "—")}
                  </p>
                  {o.storeCode && <p className="text-xs text-gray-500">{o.storeCode}</p>}
                  {(o.storeLocation || o.storeAddress) && (
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                      {o.storeLocation || o.storeAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Order date */}
              {o.orderDate && (
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  <span>📅 <span className="font-semibold text-gray-700">{VIEW_ORDER_CONSTS.TEXT.ORDER_DATE_LABEL}</span> {fmtDate(o.orderDate)}</span>
                </div>
              )}

              {/* Payment Method */}
              {pmLabel && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment Details
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${pmColors}`}>
                      <CreditCard className="w-3 h-3" />
                      {pmLabel}
                    </span>
                    {txnNo && (
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{VIEW_ORDER_CONSTS.TEXT.REF_TXN_LABEL}</span>{" "}
                        <span className="font-mono">{txnNo}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Firm + GST */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">{VIEW_ORDER_CONSTS.TEXT.FIRM_NAME_LABEL}</p>
                  <p className="text-sm font-extrabold text-gray-800 tracking-wide">{VIEW_ORDER_CONSTS.TEXT.DEFAULT_FIRM_NAME}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    {VIEW_ORDER_CONSTS.TEXT.GST_LABEL} <span className="text-gray-300 font-normal normal-case">{VIEW_ORDER_CONSTS.TEXT.FIRM_NAME_HINT}</span>
                  </label>
                  <input
                    type="text"
                    value={gstInput}
                    onChange={(e) => setGstInput(e.target.value.toUpperCase())}
                    placeholder={VIEW_ORDER_CONSTS.TEXT.GST_PLACEHOLDER}
                    maxLength={15}
                    className="w-full text-sm font-mono border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-300 tracking-widest"
                  />
                </div>
              </div>

              {/* Remarks */}
              {o.remarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">{VIEW_ORDER_CONSTS.TEXT.PARENT_LABEL}</p>
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
                    <Package className="w-8 h-8 mx-auto text-gray-200 mb-1" />
                    <p className="text-xs">{VIEW_ORDER_CONSTS.TEXT.NO_ITEMS_IN_ORDER}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-2">{VIEW_ORDER_CONSTS.TABLE_HEADERS.CODE}</span>
                      <span className="col-span-4">{VIEW_ORDER_CONSTS.TABLE_HEADERS.ITEM_NAME}</span>
                      <span className="col-span-1 text-center">{VIEW_ORDER_CONSTS.TABLE_HEADERS.QTY}</span>
                      <span className="col-span-2 text-right">{VIEW_ORDER_CONSTS.TABLE_HEADERS.RATE}</span>
                      <span className="col-span-2 text-right">{VIEW_ORDER_CONSTS.TABLE_HEADERS.AMOUNT}</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((item, idx) => {
                        const name = item.itemName || item.name || VIEW_ORDER_CONSTS.FALLBACKS.ITEM_ID(item.itemId || idx);
                        const code = item.itemCode || item.code || "—";
                        const qty = item.quantity || item.qty || 0;
                        const up = item.unitPriceSnapshot != null ? VIEW_ORDER_CONSTS.CURRENCY.AMOUNT(item.unitPriceSnapshot) : "—";
                        const lt = item.lineTotal != null ? VIEW_ORDER_CONSTS.CURRENCY.AMOUNT(item.lineTotal) : "—";
                        return (
                          <div key={item.id || item.itemId || idx} className="grid grid-cols-12 items-center py-2">
                            <div className="col-span-1 text-center text-xs text-gray-500 font-semibold">{idx + 1}</div>
                            <div className="col-span-2 text-xs text-gray-700 font-medium">{code}</div>
                            <div className="col-span-4 text-sm font-semibold text-gray-800">{name}</div>
                            <div className="col-span-1 text-center">
                              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg">{qty}</span>
                            </div>
                            <div className="col-span-2 text-right text-sm text-gray-700">{up}</div>
                            <div className="col-span-2 text-right text-sm font-bold text-gray-800">{lt}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-12 items-center pt-3 mt-1 border-t-2 border-gray-200">
                      <div className="col-span-1" />
                      <div className="col-span-2" />
                      <div className="col-span-4 text-sm font-bold text-gray-800">{VIEW_ORDER_CONSTS.TEXT.ORDER_TOTAL}</div>
                      <div className="col-span-1 text-center text-sm font-bold text-gray-800">{total}</div>
                      <div className="col-span-2" />
                      <div className="col-span-2 text-right text-sm font-bold text-blue-600">
                        {o.totalAmount != null ? VIEW_ORDER_CONSTS.CURRENCY.AMOUNT(o.totalAmount) : "—"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-600"><span className="font-bold text-gray-800">{items.length}</span> item type{items.length !== 1 ? "s" : ""}</span>
                  <span className="text-sm text-gray-600"><span className="font-bold text-gray-800">{total}</span> {VIEW_ORDER_CONSTS.TEXT.TOTAL_UNITS}</span>
                  {rawStatus === STOCK_SHARED_CONSTS.ORDER_STATUS.DELIVERED_API && <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600"><CheckCircle className="w-4 h-4" /> {STOCK_SHARED_CONSTS.ORDER_STATUS.DELIVERED_LABEL}</span>}
                  {rawStatus === STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_API && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500"><XCircle className="w-4 h-4" /> {STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_LABEL}</span>}
                  {rawStatus === STOCK_SHARED_CONSTS.ORDER_STATUS.DISPATCHED_API && <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-600"><Truck className="w-4 h-4" /> {STOCK_SHARED_CONSTS.ORDER_STATUS.DISPATCHED_LABEL}</span>}
                  {rawStatus === STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API && <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600"><CheckCircle className="w-4 h-4" /> {STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_LABEL}</span>}
                  {rawStatus === STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API && <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500"><FileText className="w-4 h-4" /> {STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_LABEL}</span>}
                </div>
                {o.totalAmount != null && (
                  <span className="text-sm font-bold text-blue-600">Total: {VIEW_ORDER_CONSTS.CURRENCY.AMOUNT(o.totalAmount)}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400 hidden sm:block">
            {VIEW_ORDER_CONSTS.TEXT.PRINT_COPIES_INFO}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              disabled={fetchLoading || printing}
              className="flex items-center cursor-pointer bg-blue-700 gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {printing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {VIEW_ORDER_CONSTS.TEXT.PREPARING}</>
                : <><Printer className="w-3.5 h-3.5" /> {VIEW_ORDER_CONSTS.TEXT.PRINT}</>}
            </button>
            <button onClick={onClose} className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              {VIEW_ORDER_CONSTS.TEXT.CLOSE}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
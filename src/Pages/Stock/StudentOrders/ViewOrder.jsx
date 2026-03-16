import { useEffect, useState } from "react";
import {
  X, User, ShoppingBag, Package, MapPin,
  CheckCircle, Clock, XCircle, Truck, Loader2,
  FileText, Printer, CreditCard, Hash,
} from "lucide-react";
import { getStudentOrderById } from "../../../Api/StudentOrder";

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
  cls: "bg-gray-100 text-gray-600 border-gray-200", icon: FileText, label: "—",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtRupee(val) {
  if (val == null) return "—";
  return `₹${Number(val).toFixed(2)}`;
}

// Humanise payment method value → label
function fmtPaymentMethod(val) {
  if (!val) return null;
  const map = {
    CASH: "Cash", ONLINE: "Online", UPI: "UPI",
    CHEQUE: "Cheque", DD: "Demand Draft", CARD: "Card", FREE_ISSUE: "Free Issue",
  };
  return map[val.toUpperCase()] || val;
}

/* ─── Print styles ──────────────────────────────────────────────────────────── */
const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #fff;
    color: #000;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .slips-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    gap: 0;
  }

  .slip {
    flex: 1 1 0;
    min-width: 0;
    border: 1px solid #999;
    padding: 4px 5px;
    page-break-inside: avoid;
  }

  .cut {
    width: 8px;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .cut::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    left: 50%;
    border-left: 1px dashed #bbb;
  }
  .cut-label {
    writing-mode: vertical-lr;
    font-size: 5px;
    color: #aaa;
    letter-spacing: 0.1em;
    background: #fff;
    padding: 2px 0;
    z-index: 1;
    position: relative;
  }

  .hdr {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1.5px solid #000;
    padding-bottom: 3px;
    margin-bottom: 3px;
    gap: 2px;
  }
  .order-id  { font-size: 9px; font-weight: 800; color: #000; }
  .order-sub { font-size: 6px; color: #555; margin-top: 1px; }
  .hdr-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }

  .pill  { font-size: 6px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; padding: 1px 4px; border-radius: 999px; border: 1px solid #000; color: #000; display: inline-block; }
  .chip  { font-size: 6px; font-weight: 700; padding: 1px 4px; border-radius: 999px; border: 1px solid #555; color: #333; display: inline-block; }
  .pdate { font-size: 5.5px; color: #777; }

  .meta { display: flex; flex-direction: column; gap: 2px; margin-bottom: 3px; }
  .meta-row { display: flex; flex-direction: row; gap: 2px; }
  .meta-box {
    background: #f5f5f5; border: 1px solid #ddd;
    padding: 2px 4px;
  }
  .meta-box .lbl { font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #777; margin-bottom: 1px; }
  .meta-box .val { font-size: 7.5px; font-weight: 700; color: #000; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta-box .sub { font-size: 6px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .payment-bar {
    display: flex;
    gap: 6px;
    background: #f0f7ff;
    border: 1px solid #bfdbfe;
    padding: 2px 5px;
    margin-bottom: 3px;
    align-items: center;
    flex-wrap: wrap;
  }
  .payment-bar .plbl { font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #3b82f6; }
  .payment-bar .pval { font-size: 7px; font-weight: 700; color: #1e3a5f; }
  .payment-bar .sep  { font-size: 7px; color: #93c5fd; }

  .remarks {
    background: #fffbea; border: 1px solid #e5d68a;
    padding: 2px 4px; font-size: 6.5px; color: #333; margin-bottom: 3px;
  }
  .remarks b { font-weight: 700; }

  .tbl-lbl { font-size: 6px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #555; margin-bottom: 1px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #222; color: #fff; }
  thead th { padding: 2px 4px; text-align: left; font-size: 6px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
  thead th.c { text-align: center; }
  thead th.r { text-align: right; }
  tbody tr:nth-child(even) { background: #f7f7f7; }
  tbody td { padding: 1.5px 4px; border-bottom: 1px solid #e8e8e8; font-size: 7px; color: #000; vertical-align: middle; }
  tbody td.c { text-align: center; font-weight: 700; }
  tbody td.r { text-align: right; }
  .icode { font-size: 6px; color: #666; margin-left: 3px; }

  .foot { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 3px; gap: 4px; }
  .summary {
    background: #f5f5f5; border: 1px solid #ddd;
    padding: 2px 4px; font-size: 6.5px; color: #333;
  }
  .summary b { color: #000; }

  .sigs { display: flex; gap: 8px; flex: 1; justify-content: flex-end; }
  .sig  { text-align: center; min-width: 48px; }
  .sig-line { border-bottom: 1px solid #555; height: 10px; margin-bottom: 1px; }
  .sig-lbl  { font-size: 5px; color: #333; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }

  @media print {
    @page { margin: 4mm; size: A4 landscape; }
    body  { padding: 0; }
  }
`;

/* ─── Build a single slip ───────────────────────────────────────────────────── */
function buildSlip(o, copyType, items, total, rawStatus, gstNumber) {
  const sigLabel = copyType === "Parent" ? "Parent / Guardian" : copyType;

  const itemRows = items.length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#555;padding:4px 0">No items</td></tr>`
    : items.map((item, idx) => {
        const name      = item.itemName || item.name || `Item #${item.itemId || idx}`;
        const code      = item.itemCode || item.code || "";
        const qty       = item.quantity || item.qty || 0;
        const unitPrice = item.unitPriceSnapshot != null ? `₹${Number(item.unitPriceSnapshot).toFixed(2)}` : "—";
        const lineTotal = item.lineTotal        != null ? `₹${Number(item.lineTotal).toFixed(2)}`        : "—";
        return `<tr>
          <td>${name}${code ? `<span class="icode">(${code})</span>` : ""}</td>
          <td class="c">${qty}</td>
          <td class="r">${unitPrice}</td>
          <td class="r">${lineTotal}</td>
        </tr>`;
      }).join("");

  const orderTotal = o.totalAmount != null ? `₹${Number(o.totalAmount).toFixed(2)}` : "—";

  // ── Payment bar (only rendered when paymentMethod exists) ──
  const paymentMethod   = o.paymentMethod   || null;
  const txnNumber       = o.transactionNumber || null;
  const paymentBarHtml  = paymentMethod
    ? `<div class="payment-bar">
        <span class="plbl">Payment</span>
        <span class="pval">${fmtPaymentMethod(paymentMethod)}</span>
        ${txnNumber ? `<span class="sep">|</span><span class="plbl">Ref</span><span class="pval">${txnNumber}</span>` : ""}
      </div>`
    : "";

  return `
    <div class="slip">
      <div class="hdr">
        <div>
          <div class="order-id">Order #${o.id || "—"}</div>
          <div class="order-sub">${fmtDate(o.orderDate || o.createdAt)}</div>
        </div>
        <div class="hdr-right">
          <span class="pill">${copyType} Copy</span>
          <span class="chip">${rawStatus || "—"}</span>
          <span class="pdate">Printed: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      <div class="meta">
        <div class="meta-row">
          <div class="meta-box" style="flex:1">
            <div class="lbl">Student</div>
            <div class="val">${o.studentName || "—"}</div>
            ${o.admissionNumber ? `<div class="sub">ADM: ${o.admissionNumber}</div>` : ""}
            ${o.className       ? `<div class="sub">Class: ${o.className}</div>`     : ""}
          </div>
          <div class="meta-box" style="flex:1">
            <div class="lbl">Firm Name</div>
            <div class="val">LEELA ENTERPRISES</div>
            <div class="sub">GST: ${gstNumber || "—"}</div>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-box" style="flex:1">
            <div class="lbl">Issued By</div>
            <div class="val">${o.issuedByName || "—"}</div>
            <div class="sub">Date: ${fmtDate(o.orderDate || o.createdAt)}</div>
          </div>
        </div>
      </div>

      ${paymentBarHtml}

      ${o.remarks ? `<div class="remarks"><b>Remarks:</b> ${o.remarks}</div>` : ""}

      <div class="tbl-lbl">Items (${items.length})</div>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th class="c">Qty</th>
            <th class="r">Unit Price</th>
            <th class="r">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr style="border-top:1.5px solid #000;">
            <td style="font-weight:800">Order Total</td>
            <td class="c" style="font-weight:800">${total}</td>
            <td></td>
            <td class="r" style="font-weight:800;color:#1d4ed8">${orderTotal}</td>
          </tr>
        </tbody>
      </table>

      <div class="foot">
        <div class="summary">
          <span><b>${items.length}</b> type${items.length !== 1 ? "s" : ""}</span>
          <span><b>${total}</b> units</span>
          <span>Total: <b>${orderTotal}</b></span>
        </div>
        <div class="sigs">
          <div class="sig"><div class="sig-line"></div><div class="sig-lbl">${sigLabel}</div></div>
        </div>
      </div>
    </div>`;
}

/* ─── Print orchestrator ────────────────────────────────────────────────────── */
function printOrder(o, gstNumber) {
  const rawStatus = (o.status || o.orderStatus || "").toUpperCase();
  const items     = o.items || o.orderItems || [];
  const total     = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);
  const copies    = ["Accountant", "Admin", "Parent"];

  const CUT = `<div class="cut"><span class="cut-label">✂ cut</span></div>`;

  const body = `
    <div class="slips-row">
      ${copies.map((copy, idx) =>
        buildSlip(o, copy, items, total, rawStatus, gstNumber) +
        (idx < copies.length - 1 ? CUT : "")
      ).join("")}
    </div>`;

  const win = window.open("", "_blank", "width=1100,height=800");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Order #${o.id} – Print Copies</title>
    <style>${PRINT_STYLES}</style>
  </head><body>${body}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 450);
}

/* ─── Main component ────────────────────────────────────────────────────────── */
export default function ViewStudentOrder({ isOpen, onClose, order }) {
  const [fullOrder,    setFullOrder]    = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError,   setFetchError]   = useState("");
  const [printing,     setPrinting]     = useState(false);
  const [gstInput,     setGstInput]     = useState("");

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
        setFetchError("Failed to load order details. Showing cached data.");
        setFullOrder(order);
      })
      .finally(() => setFetchLoading(false));
  }, [isOpen, order?.id]); // eslint-disable-line

  if (!isOpen || !order) return null;

  const o          = fullOrder || order;
  const rawStatus  = (o.status || o.orderStatus || "").toUpperCase();
  const sc         = statusConfig[rawStatus] || fallbackStatus;
  const StatusIcon = sc.icon;
  const items      = o.items || o.orderItems || [];
  const total      = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);

  const paymentMethodLabel = fmtPaymentMethod(o.paymentMethod);
  const txnNumber          = o.transactionNumber || null;

  const handlePrint = () => {
    if (fetchLoading) return;
    setPrinting(true);
    printOrder(o, gstInput);
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
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sc.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" /> {sc.label}
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
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <>
              {/* Student & Store cards */}
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
                    {o.storeName || (o.storeId ? `Store #${o.storeId}` : "—")}
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

              {/* Order date row */}
              {o.orderDate && (
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  <span>📅 <span className="font-semibold text-gray-700">Order Date:</span> {fmtDate(o.orderDate)}</span>
                </div>
              )}

              {/* ── Payment Details (shown only if paymentMethod exists) ── */}
              {paymentMethodLabel && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-0.5">Payment Method</p>
                      <p className="text-sm font-bold text-blue-800">{paymentMethodLabel}</p>
                    </div>
                  </div>
                  {txnNumber && (
                    <>
                      <div className="w-px h-8 bg-blue-200 hidden sm:block" />
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-0.5">Transaction / Ref No.</p>
                          <p className="text-sm font-bold text-blue-800 font-mono">{txnNumber}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Firm name + GST input */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Firm Name</p>
                    <p className="text-sm font-extrabold text-gray-800 tracking-wide">LEELA ENTERPRISES</p>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    GST Number <span className="text-gray-300 font-normal normal-case">(optional — will appear on print)</span>
                  </label>
                  <input
                    type="text"
                    value={gstInput}
                    onChange={(e) => setGstInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full text-sm font-mono border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white placeholder-gray-300 tracking-widest"
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
                    <Package className="w-8 h-8 mx-auto text-gray-200 mb-1" />
                    <p className="text-xs">No items found in this order.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="col-span-5">Item</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Unit Price</span>
                      <span className="col-span-3 text-right">Line Total</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {items.map((item, idx) => {
                        const name      = item.itemName || item.name || `Item #${item.itemId || idx}`;
                        const code      = item.itemCode || item.code || "";
                        const qty       = item.quantity || item.qty || 0;
                        const unitPrice = item.unitPriceSnapshot != null ? fmtRupee(item.unitPriceSnapshot) : "—";
                        const lineTotal = item.lineTotal         != null ? fmtRupee(item.lineTotal)         : "—";

                        return (
                          <div key={item.id || item.itemId || idx} className="grid grid-cols-12 items-center py-3">
                            <div className="col-span-5">
                              <p className="text-sm font-semibold text-gray-800">{name}</p>
                              {code && <p className="text-xs text-gray-400">{code}</p>}
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">{qty}</span>
                            </div>
                            <div className="col-span-2 text-right text-sm text-gray-700">{unitPrice}</div>
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800">{lineTotal}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-12 items-center pt-3 mt-1 border-t-2 border-gray-200">
                      <div className="col-span-5 text-sm font-bold text-gray-800">Order Total</div>
                      <div className="col-span-2 text-center text-sm font-bold text-gray-800">{total}</div>
                      <div className="col-span-2" />
                      <div className="col-span-3 text-right text-sm font-bold text-blue-600">
                        {o.totalAmount != null ? fmtRupee(o.totalAmount) : "—"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer summary bar */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{items.length}</span> item type{items.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{total}</span> total units
                  </span>
                  {rawStatus === "DELIVERED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600"><CheckCircle className="w-4 h-4" /> Order delivered</span>}
                  {rawStatus === "CANCELLED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500"><XCircle className="w-4 h-4" /> Order cancelled</span>}
                  {rawStatus === "DISPATCHED" && <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-600"><Truck className="w-4 h-4" /> Out for delivery</span>}
                  {rawStatus === "CONFIRMED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600"><CheckCircle className="w-4 h-4" /> Stock deducted successfully</span>}
                  {rawStatus === "DRAFT"      && <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500"><FileText className="w-4 h-4" /> Saved as draft</span>}
                </div>
                {o.totalAmount != null && (
                  <span className="text-sm font-bold text-blue-600">Total: {fmtRupee(o.totalAmount)}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400 hidden sm:block">
            🖨️ Prints 3 copies side-by-side on A4 Landscape — Accountant · Admin · Parent
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              disabled={fetchLoading || printing}
              className="flex items-center cursor-pointer bg-blue-700 gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {printing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing...</>
                : <><Printer className="w-3.5 h-3.5" /> Print</>}
            </button>
            <button
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
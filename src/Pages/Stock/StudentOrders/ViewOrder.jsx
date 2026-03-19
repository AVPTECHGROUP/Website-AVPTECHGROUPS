import { useEffect, useState } from "react";
import {
  X, User, ShoppingBag, Package, MapPin,
  CheckCircle, Clock, XCircle, Truck, Loader2,
  FileText, Printer,
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

/* ─── Print styles ────────────────────────────────────────────────────────────
   A4 landscape usable area = 287mm × 200mm (5mm margins all around).
   .slips-row hard-locked to 200mm — nothing ever overflows to page 2.

   Space budget (per slip):
     Slip padding     : 1.5mm × 2  =  3.0mm
     Gaps (×4)        : 1mm  × 4   =  4.0mm
     Header block     :            ~  7.0mm
     Meta (1 row)     :            ~  8.5mm   ← was 2 rows (~17mm), saves 8.5mm
     Table label      :            ~  3.5mm
     Table header row :            ~  5.0mm
     Footer           :            ~  6.5mm
     ─────────────────────────────────────
     Fixed overhead   :            ~ 37.5mm
     Available rows   : 200 - 37.5 = 162.5mm
     Row height       : 0.7+2.38+0.7 = ~3.8mm   (padding 0.7mm each side, 9px font)
     Max rows         : 162.5 / 3.8  ≈ 42 rows  → comfortably holds 26+

   Font uniformity: ALL body cells are 9px / weight 600.
   Column order: # | Item Code | Item Name | Qty | Rate | Amount
──────────────────────────────────────────────────────────────────────────── */
const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 100%;
    height: 100%;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 9px;
    color: #000;
  }

  /* ── Hard-locked to one A4 landscape page ── */
  .slips-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 287mm;
    height: 200mm;
    overflow: hidden;
  }

  /* ── Each slip ── */
  .slip {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    border: 1px solid #000;
    padding: 1.5mm 2mm;
    display: flex;
    flex-direction: column;
    gap: 1mm;
  }

  /* ── Cut line ── */
  .cut {
    width: 3mm;
    align-self: stretch;
    position: relative;
    flex-shrink: 0;
  }
  .cut::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 50%;
    border-left: 1px dashed #000;
  }
  .cut-label {
    writing-mode: vertical-lr;
    font-size: 5px;
    color: #000;
    letter-spacing: 0.1em;
    background: #fff;
    padding: 1mm 0;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  /* ── Header ── */
  .hdr {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1.5px solid #000;
    padding-bottom: 1mm;
    flex-shrink: 0;
  }
  .order-id  { font-size: 13px; font-weight: 900; color: #000; line-height: 1.1; }
  .order-sub { font-size: 7.5px; font-weight: 600; color: #000; margin-top: 0.3mm; }
  .hdr-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.8mm; }
  .pill-copy {
    font-size: 7.5px; font-weight: 900; text-transform: uppercase;
    letter-spacing: 0.05em; padding: 0.3mm 2mm;
    border-radius: 999px; border: 1.5px solid #000; color: #000;
  }
  .chip  { font-size: 7px; font-weight: 800; padding: 0.2mm 1.5mm; border-radius: 999px; border: 1px solid #000; color: #000; }
  .pdate { font-size: 6.5px; font-weight: 600; color: #000; }

  /* ── Meta — ALL THREE BOXES IN ONE ROW to save vertical space ── */
  .meta      { display: flex; flex-direction: row; gap: 1.5mm; flex-shrink: 0; }
  .meta-box  {
    flex: 1;
    background: #f0f0f0;
    border: 1px solid #000;
    padding: 0.8mm 2mm;
  }
  .meta-box .lbl { font-size: 6px;  font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #000; line-height: 1.2; }
  .meta-box .val { font-size: 9px;  font-weight: 800; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
  .meta-box .sub { font-size: 7px;  font-weight: 600; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }

  /* ── Remarks ── */
  .remarks {
    background: #f5f5f5; border: 1px solid #000;
    padding: 0.5mm 2mm; font-size: 7.5px; color: #000;
    font-weight: 600; flex-shrink: 0;
  }
  .remarks b { font-weight: 900; }

  /* ── Table area: grows to fill remaining space ── */
  .table-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .tbl-lbl {
    font-size: 7px; font-weight: 900; text-transform: uppercase;
    letter-spacing: 0.06em; color: #000; margin-bottom: 0.8mm; flex-shrink: 0;
  }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; }

  thead tr { background: #000; color: #fff; }
  thead th {
    padding: 1mm 1mm;
    font-size: 9px; font-weight: 800;
    text-transform: uppercase; white-space: nowrap;
    letter-spacing: 0.02em;
    text-align: left;
    color: #fff;
  }
  thead th.c { text-align: center; }
  thead th.r { text-align: right; }

  tbody tr:nth-child(even) { background: #f0f0f0; }
  tbody tr:nth-child(odd)  { background: #fff; }

  /* ── ALL body cells: uniform 9px / 600 ── */
  tbody td {
    padding: 0.7mm 1mm;
    border-bottom: 0.5px solid #ccc;
    font-size: 9px;
    font-weight: 600;
    color: #000;
    vertical-align: middle;
    line-height: 1.2;
    text-align: left;
  }

  /* S.No — narrow, centered */
  thead th.sno { text-align: center; width: 6mm; }
  tbody  td.sno { text-align: center; }

  /* Item Code — left, same weight as rest */
  thead th.code { text-align: left; }
  tbody  td.code { text-align: left; white-space: nowrap; }

  /* Item Name */
  tbody td.name { font-weight: 700; }   /* slightly bolder to distinguish */

  /* Qty */
  tbody td.c { text-align: center; }

  /* Rate & Amount */
  tbody td.r { text-align: right; }

  /* Total row */
  .total-row td {
    border-top: 1.5px solid #000 !important;
    border-bottom: 1.5px solid #000 !important;
    font-size: 9px !important;
    font-weight: 900 !important;
    padding: 1mm !important;
    background: #e0e0e0 !important;
    color: #000 !important;
  }

  /* ── Footer ── */
  .foot {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 3mm; flex-shrink: 0;
  }
  .summary {
    background: #f0f0f0; border: 1px solid #000;
    padding: 0.8mm 2mm; font-size: 8px; color: #000; font-weight: 700; line-height: 1.5;
  }
  .summary b { font-weight: 900; color: #000; }
  .sigs { display: flex; gap: 5mm; flex: 1; justify-content: flex-end; align-items: flex-end; }
  .sig  { text-align: center; min-width: 18mm; }
  .sig-line { border-bottom: 1.5px solid #000; height: 4mm; margin-bottom: 0.5mm; }
  .sig-lbl  { font-size: 6.5px; color: #000; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }

  /* ── Print media ── */
  @media print {
    @page {
      size: A4 landscape;
      margin: 5mm;
    }
    html, body { margin: 0; padding: 0; }
    .slips-row {
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      page-break-after:   avoid;
      page-break-before:  avoid;
      page-break-inside:  avoid;
    }
    .slip { page-break-inside: avoid; overflow: hidden; }
    thead { display: table-header-group; }
    tr    { page-break-inside: avoid; }
  }
`;

/* ─── Build a single slip ──────────────────────────────────────────────────── */
function buildSlip(o, copyType, items, total, rawStatus, gstNumber) {
  const sigLabel   = copyType === "Parent" ? "Parent / Guardian" : copyType;
  const orderTotal = o.totalAmount != null ? `₹${Number(o.totalAmount).toFixed(2)}` : "—";

  const itemRows = items.length === 0
    ? `<tr><td colspan="6" style="text-align:center;padding:4mm 0;">No items</td></tr>`
    : items.map((item, idx) => {
        const name = item.itemName || item.name || `Item #${item.itemId || idx}`;
        const code = item.itemCode || item.code || "—";
        const qty  = item.quantity || item.qty  || 0;
        const up   = item.unitPriceSnapshot != null ? `₹${Number(item.unitPriceSnapshot).toFixed(2)}` : "—";
        const lt   = item.lineTotal          != null ? `₹${Number(item.lineTotal).toFixed(2)}`        : "—";
        return `<tr>
          <td class="sno">${idx + 1}</td>
          <td class="code">${code}</td>
          <td class="name">${name}</td>
          <td class="c">${qty}</td>
          <td class="r">${up}</td>
          <td class="r">${lt}</td>
        </tr>`;
      }).join("");

  return `
    <div class="slip">

      <div class="hdr">
        <div>
          <div class="order-id">Order #${o.id || "—"}</div>
          <div class="order-sub">${fmtDate(o.orderDate || o.createdAt)}</div>
        </div>
        <div class="hdr-right">
          <span class="pill-copy">${copyType} Copy</span>
          <span class="chip">${rawStatus || "—"}</span>
          <span class="pdate">Printed: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      <!-- Single-row meta: Student | Firm | Issued By side by side -->
      <div class="meta">
        <div class="meta-box">
          <div class="lbl">Student</div>
          <div class="val">${o.studentName || "—"}</div>
          ${o.admissionNumber ? `<div class="sub">ADM: ${o.admissionNumber}</div>` : ""}
          ${o.className       ? `<div class="sub">Class: ${o.className}</div>`     : ""}
        </div>
        <div class="meta-box">
          <div class="lbl">Firm</div>
          <div class="val">LEELA ENTERPRISES</div>
          <div class="sub">GST: ${gstNumber || "—"}</div>
        </div>
        <div class="meta-box">
          <div class="lbl">Issued By</div>
          <div class="val">${o.issuedByName || "—"}</div>
          <div class="sub">Date: ${fmtDate(o.orderDate || o.createdAt)}</div>
        </div>
      </div>

      ${o.remarks ? `<div class="remarks"><b>Note:</b> ${o.remarks}</div>` : ""}

      <div class="table-area">
        <div class="tbl-lbl">Items (${items.length})</div>
        <table>
          <thead>
            <tr>
              <th class="sno">#</th>
              <th class="code">Item Code</th>
              <th>Item Name</th>
              <th class="c">Qty</th>
              <th class="r">Rate</th>
              <th class="r">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <tr class="total-row">
              <td></td>
              <td></td>
              <td><b>Order Total</b></td>
              <td class="c"><b>${total}</b></td>
              <td></td>
              <td class="r"><b>${orderTotal}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="foot">
        <div class="summary">
          <div><b>${items.length}</b> types &nbsp;·&nbsp; <b>${total}</b> units</div>
          <div>Total: <b>${orderTotal}</b></div>
        </div>
        <div class="sigs">
          <div class="sig">
            <div class="sig-line"></div>
            <div class="sig-lbl">${sigLabel}</div>
          </div>
        </div>
      </div>

    </div>`;
}

/* ─── Print orchestrator ─────────────────────────────────────────────────── */
function printOrder(o, gstNumber) {
  const rawStatus = (o.status || o.orderStatus || "").toUpperCase();
  const items     = o.items || o.orderItems || [];
  const total     = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);
  const copies    = ["Accountant", "Admin", "Parent"];
  const CUT       = `<div class="cut"><span class="cut-label">✂ cut</span></div>`;

  const body = `
    <div class="slips-row">
      ${copies.map((copy, idx) =>
        buildSlip(o, copy, items, total, rawStatus, gstNumber) +
        (idx < copies.length - 1 ? CUT : "")
      ).join("")}
    </div>`;

  const win = window.open("", "_blank", "width=1400,height=900");
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Order #${o.id} – Print Copies</title>
    <style>${PRINT_STYLES}</style>
  </head><body>${body}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 450);
}

/* ─── Main component ─────────────────────────────────────────────────────── */
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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
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
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
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

              {/* Order date */}
              {o.orderDate && (
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  <span>📅 <span className="font-semibold text-gray-700">Order Date:</span> {fmtDate(o.orderDate)}</span>
                </div>
              )}

              {/* Firm + GST */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Firm Name</p>
                  <p className="text-sm font-extrabold text-gray-800 tracking-wide">LEELA ENTERPRISES</p>
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
                    <Package className="w-8 h-8 mx-auto text-gray-200 mb-1" />
                    <p className="text-xs">No items found in this order.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-2">Code</span>
                      <span className="col-span-4">Item Name</span>
                      <span className="col-span-1 text-center">Qty</span>
                      <span className="col-span-2 text-right">Rate</span>
                      <span className="col-span-2 text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((item, idx) => {
                        const name = item.itemName || item.name || `Item #${item.itemId || idx}`;
                        const code = item.itemCode || item.code || "—";
                        const qty  = item.quantity  || item.qty  || 0;
                        const up   = item.unitPriceSnapshot != null ? fmtRupee(item.unitPriceSnapshot) : "—";
                        const lt   = item.lineTotal          != null ? fmtRupee(item.lineTotal)         : "—";
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
                      <div className="col-span-4 text-sm font-bold text-gray-800">Order Total</div>
                      <div className="col-span-1 text-center text-sm font-bold text-gray-800">{total}</div>
                      <div className="col-span-2" />
                      <div className="col-span-2 text-right text-sm font-bold text-blue-600">
                        {o.totalAmount != null ? fmtRupee(o.totalAmount) : "—"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-600"><span className="font-bold text-gray-800">{items.length}</span> item type{items.length !== 1 ? "s" : ""}</span>
                  <span className="text-sm text-gray-600"><span className="font-bold text-gray-800">{total}</span> total units</span>
                  {rawStatus === "DELIVERED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600"><CheckCircle className="w-4 h-4" /> Delivered</span>}
                  {rawStatus === "CANCELLED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500"><XCircle className="w-4 h-4" /> Cancelled</span>}
                  {rawStatus === "DISPATCHED" && <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-600"><Truck className="w-4 h-4" /> Dispatched</span>}
                  {rawStatus === "CONFIRMED"  && <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600"><CheckCircle className="w-4 h-4" /> Confirmed</span>}
                  {rawStatus === "DRAFT"      && <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500"><FileText className="w-4 h-4" /> Draft</span>}
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
            🖨️ 3 copies · A4 Landscape · 1 page · 26+ rows
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
            <button onClick={onClose} className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
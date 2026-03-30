/**
 * printOrderUtil.js
 * Shared print logic — import this in ViewStudentOrder, CreateStudentOrder, EditStudentOrder.
 *
 * Usage:
 *   import { printOrder } from "../../../utils/printOrderUtil";
 *   printOrder(orderObject, gstNumber);
 */

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtPaymentMethod(val) {
  if (!val) return null;
  const map = {
    CASH: "Cash", ONLINE: "Online", UPI: "UPI",
    CHEQUE: "Cheque", DD: "Demand Draft", CARD: "Card", FREE_ISSUE: "Free Issue",
  };
  return map[(val || "").toUpperCase()] || val;
}

/* ─── Print styles ────────────────────────────────────────────────────────────
   A4 landscape usable area = 287mm × 200mm (5mm margins all around).
   .slips-row hard-locked to 200mm — nothing ever overflows to page 2.
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

  /* ── Meta — ALL THREE BOXES IN ONE ROW ── */
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

  /* ── Payment bar ── */
  .payment-bar {
    display: flex;
    align-items: center;
    gap: 4mm;
    background: #e8f0fe;
    border: 1px solid #000;
    padding: 0.8mm 2mm;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .payment-bar .plbl {
    font-size: 6px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #000;
  }
  .payment-bar .pval {
    font-size: 9px;
    font-weight: 800;
    color: #000;
  }
  .payment-bar .psep {
    font-size: 8px;
    color: #555;
    margin: 0 1mm;
  }

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

  thead th.sno { text-align: center; width: 6mm; }
  tbody  td.sno { text-align: center; }
  thead th.code { text-align: left; }
  tbody  td.code { text-align: left; white-space: nowrap; }
  tbody td.name { font-weight: 700; }
  tbody td.c { text-align: center; }
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

  // ── Payment bar HTML — only rendered when paymentMethod is present ──
  const pmLabel = fmtPaymentMethod(o.paymentMethod);
  const txnNo   = o.transactionNumber || null;
  const paymentBarHtml = pmLabel
    ? `<div class="payment-bar">
        <span class="plbl">Payment</span>
        <span class="pval">${pmLabel}</span>
        ${txnNo
          ? `<span class="psep">|</span><span class="plbl">Ref / Txn</span><span class="pval">${txnNo}</span>`
          : ""}
      </div>`
    : "";

  // ── Item rows ──
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

      ${paymentBarHtml}
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

/**
 * Opens a print window with 3 copies (Accountant, Admin, Parent) side-by-side on A4 Landscape.
 * @param {object} order      - full order data object
 * @param {string} gstNumber  - GST number string (can be empty "")
 */
export function printOrder(order, gstNumber = "") {
  const o         = order || {};
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
/**
 * printOrderUtil.js
 * Shared print logic — import this in ViewStudentOrder, CreateStudentOrder, EditStudentOrder.
 */

function fmtDate(d) {
  if (!d) return "\u2014";
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
  .meta-box { background: #f5f5f5; border: 1px solid #ddd; padding: 2px 4px; }
  .meta-box .lbl { font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #777; margin-bottom: 1px; }
  .meta-box .val { font-size: 7.5px; font-weight: 700; color: #000; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta-box .sub { font-size: 6px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ── Payment bar ── */
  .payment-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 2px 5px;
    margin-bottom: 3px;
    flex-wrap: wrap;
  }
  .payment-bar .plbl {
    font-size: 5.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #3b82f6;
  }
  .payment-bar .pval {
    font-size: 7px;
    font-weight: 700;
    color: #1e3a5f;
  }
  .payment-bar .psep {
    font-size: 7px;
    color: #93c5fd;
    margin: 0 1px;
  }

  .remarks { background: #fffbea; border: 1px solid #e5d68a; padding: 2px 4px; font-size: 6.5px; color: #333; margin-bottom: 3px; }
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
  .summary { background: #f5f5f5; border: 1px solid #ddd; padding: 2px 4px; font-size: 6.5px; color: #333; }
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

function buildSlip(o, copyType, items, total, rawStatus, gstNumber) {
  const sigLabel = copyType === "Parent" ? "Parent / Guardian" : copyType;

  const itemRows =
    items.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:#555;padding:4px 0">No items</td></tr>`
      : items
          .map((item, idx) => {
            const name      = item.itemName || item.name || `Item #${item.itemId || idx}`;
            const code      = item.itemCode || item.code || "";
            const qty       = item.quantity  || item.qty  || 0;
            const unitPrice = item.unitPriceSnapshot != null
              ? `\u20B9${Number(item.unitPriceSnapshot).toFixed(2)}` : "\u2014";
            const lineTotal = item.lineTotal != null
              ? `\u20B9${Number(item.lineTotal).toFixed(2)}` : "\u2014";
            return `<tr>
              <td>${name}${code ? `<span class="icode">(${code})</span>` : ""}</td>
              <td class="c">${qty}</td>
              <td class="r">${unitPrice}</td>
              <td class="r">${lineTotal}</td>
            </tr>`;
          })
          .join("");

  const orderTotal = o.totalAmount != null
    ? `\u20B9${Number(o.totalAmount).toFixed(2)}` : "\u2014";

  // ── Payment bar — only rendered when paymentMethod is present ──
  const pmLabel  = fmtPaymentMethod(o.paymentMethod);
  const txnNo    = o.transactionNumber || null;
  const paymentBarHtml = pmLabel
    ? `<div class="payment-bar">
        <span class="plbl">Payment</span>
        <span class="pval">${pmLabel}</span>
        ${txnNo
          ? `<span class="psep">|</span><span class="plbl">Ref</span><span class="pval">${txnNo}</span>`
          : ""}
      </div>`
    : "";

  return `
    <div class="slip">
      <div class="hdr">
        <div>
          <div class="order-id">Order #${o.id || "\u2014"}</div>
          <div class="order-sub">${fmtDate(o.orderDate || o.createdAt)}</div>
        </div>
        <div class="hdr-right">
          <span class="pill">${copyType} Copy</span>
          <span class="chip">${rawStatus || "\u2014"}</span>
          <span class="pdate">Printed: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
      </div>
      <div class="meta">
        <div class="meta-row">
          <div class="meta-box" style="flex:1">
            <div class="lbl">Student</div>
            <div class="val">${o.studentName || "\u2014"}</div>
            ${o.admissionNumber ? `<div class="sub">ADM: ${o.admissionNumber}</div>` : ""}
            ${o.className       ? `<div class="sub">Class: ${o.className}</div>`     : ""}
          </div>
          <div class="meta-box" style="flex:1">
            <div class="lbl">Firm Name</div>
            <div class="val">LEELA ENTERPRISES</div>
            <div class="sub">GST: ${gstNumber || "\u2014"}</div>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-box" style="flex:1">
            <div class="lbl">Issued By</div>
            <div class="val">${o.issuedByName || "\u2014"}</div>
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
          <span style="margin-left:6px"><b>${total}</b> units</span>
          <span style="margin-left:6px">Total: <b>${orderTotal}</b></span>
        </div>
        <div class="sigs">
          <div class="sig"><div class="sig-line"></div><div class="sig-lbl">${sigLabel}</div></div>
        </div>
      </div>
    </div>`;
}

/**
 * Opens a print window with 3 copies (Accountant, Admin, Parent) side-by-side on A4 Landscape.
 * @param {object} order      - order data object
 * @param {string} gstNumber  - GST number string (can be empty "")
 */
export function printOrder(order, gstNumber = "") {
  const o         = order || {};
  const rawStatus = (o.status || o.orderStatus || "").toUpperCase();
  const items     = o.items || o.orderItems || [];
  const total     = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);
  const copies    = ["Accountant", "Admin", "Parent"];
  const CUT       = `<div class="cut"><span class="cut-label">cut</span></div>`;

  const body = `
    <div class="slips-row">
      ${copies
        .map(
          (copy, idx) =>
            buildSlip(o, copy, items, total, rawStatus, gstNumber) +
            (idx < copies.length - 1 ? CUT : "")
        )
        .join("")}
    </div>`;

  const win = window.open("", "_blank", "width=1100,height=800");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Order #${o.id} - Print Copies</title>
    <style>${PRINT_STYLES}</style>
  </head><body>${body}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 450);
}
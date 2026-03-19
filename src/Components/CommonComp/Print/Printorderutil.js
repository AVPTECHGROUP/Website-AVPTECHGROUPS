/**
 * Printorderutil.js
 * Shared print logic — import this in ViewStudentOrder, CreateStudentOrder, EditStudentOrder.
 *
 * BUG FIX: was named "printOrderUtil.js" in comments but imported as "Printorderutil" everywhere.
 * Keep this filename consistent with the import paths already used across the codebase.
 */

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  // BUG FIX: "YYYY-MM-DD" strings parsed as UTC → off by one day in +ve TZ
  const str    = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00` : d;
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return "—"; // BUG FIX: guard invalid dates
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtPaymentMethod(val) {
  if (!val) return null;
  const map = {
    CASH:        "Cash",
    ONLINE:      "Online",
    UPI:         "UPI",
    CHEQUE:      "Cheque",
    DD:          "Demand Draft",
    CARD:        "Card",
    FREE_ISSUE:  "Free Issue",
  };
  return map[(val || "").toUpperCase()] || val;
}

// ── Print styles ──────────────────────────────────────────────────
/*
  Target: 30 items on a SINGLE A4 landscape page across 3 side-by-side slips
  A4 landscape usable area ≈ 287mm × 197mm (after 5mm margins)
  Each slip ≈ 88mm wide
  Header block  ≈ 28mm
  Meta block    ≈ 22mm
  Table header  ≈  5mm
  30 rows × 4mm ≈ 120mm
  Footer block  ≈ 10mm
  Total         ≈ 185mm  →  fits in 197mm with 12mm to spare
*/
const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #fff;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-size: 8px;
  }

  /* 3 slips side by side filling full width */
  .slips-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
  }

  .slip {
    flex: 1 1 0;
    min-width: 0;
    border: 1px solid #999;
    padding: 4px 5px;
  }

  /* Cut line */
  .cut {
    width: 10px;
    align-self: stretch;
    position: relative;
    flex-shrink: 0;
  }
  .cut::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 50%;
    border-left: 1px dashed #bbb;
  }
  .cut-label {
    writing-mode: vertical-lr;
    font-size: 5.5px;
    color: #bbb;
    letter-spacing: 0.1em;
    background: #fff;
    padding: 2px 0;
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
    padding-bottom: 3px;
    margin-bottom: 3px;
  }
  .order-id  { font-size: 10px; font-weight: 900; color: #000; }
  .order-sub { font-size: 7px;  color: #555; margin-top: 1px; }
  .hdr-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .pill  { font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 1px 5px; border-radius: 999px; border: 1px solid #000; }
  .chip  { font-size: 6.5px; font-weight: 700; padding: 1px 4px; border-radius: 999px; border: 1px solid #777; color: #333; }
  .pdate { font-size: 6px; color: #777; }

  /* ── Meta ── */
  .meta { display: flex; flex-direction: column; gap: 2px; margin-bottom: 3px; }
  .meta-row { display: flex; gap: 2px; }
  .meta-box {
    flex: 1;
    background: #f5f5f5;
    border: 1px solid #ddd;
    padding: 2px 4px;
  }
  .meta-box .lbl { font-size: 6px;  font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #777; margin-bottom: 1px; }
  .meta-box .val { font-size: 8px;  font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta-box .sub { font-size: 6.5px; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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

  /* ── Remarks ── */
  .remarks {
    background: #fffbea;
    border: 1px solid #e5d68a;
    padding: 2px 4px;
    font-size: 6.5px;
    color: #333;
    margin-bottom: 3px;
  }
  .remarks b { font-weight: 800; }

  /* ── Items table ── */
  .tbl-lbl {
    font-size: 6.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #555;
    margin-bottom: 2px;
  }

  table { width: 100%; border-collapse: collapse; }

  thead tr { background: #1e293b; color: #fff; }
  thead th {
    padding: 2.5px 3px;
    font-size: 6.5px;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
    letter-spacing: 0.03em;
    text-align: left;
  }
  thead th.c { text-align: center; }
  thead th.r { text-align: right; }

  /* alternating row colors */
  tbody tr:nth-child(even) { background: #f5f7fa; }
  tbody tr:nth-child(odd)  { background: #fff; }

  tbody td {
    padding: 3px 4px;
    border-bottom: 1px solid #e8ecf0;
    font-size: 8px;
    color: #000;
    vertical-align: middle;
    line-height: 1.25;
  }
  tbody td.sno { font-size: 6.5px; color: #999; text-align: center; width: 14px; }
  tbody td.c   { text-align: center; font-weight: 700; }
  tbody td.r   { text-align: right; }
  .icode { font-size: 6px; color: #777; display: block; }

  /* total row */
  .total-row td {
    border-top: 1.5px solid #000 !important;
    font-size: 8px !important;
    font-weight: 800 !important;
    padding: 3px !important;
    background: #eef2f7 !important;
  }
  .grand { color: #1d4ed8 !important; font-size: 9px !important; }

  /* ── Footer ── */
  .foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 3px;
    gap: 4px;
  }
  .summary {
    background: #f5f5f5;
    border: 1px solid #ddd;
    padding: 2px 5px;
    font-size: 7px;
    color: #333;
    line-height: 1.5;
  }
  .summary b { font-weight: 800; color: #000; }
  .sigs { display: flex; gap: 10px; flex: 1; justify-content: flex-end; }
  .sig  { text-align: center; min-width: 48px; }
  .sig-line { border-bottom: 1px solid #666; height: 12px; margin-bottom: 1px; }
  .sig-lbl  { font-size: 6px; color: #333; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }

  @media print {
    @page {
      size: A4 landscape;
      margin: 5mm;
    }
    body { padding: 0; }
    /* Keep each row together but allow slip to span pages if needed */
    tr     { page-break-inside: avoid; }
    thead  { display: table-header-group; }
    .slip  { page-break-inside: avoid; }
  }
`;

// ── Build a single slip ───────────────────────────────────────────
function buildSlip(o, copyType, items, total, rawStatus, gstNumber) {
  const sigLabel   = copyType === "Parent" ? "Parent / Guardian" : copyType;
  // BUG FIX: guard null/NaN for orderTotal
  const totalAmt   = o.totalAmount != null && !isNaN(Number(o.totalAmount))
    ? Number(o.totalAmount)
    : null;
  const orderTotal = totalAmt !== null ? `₹${totalAmt.toFixed(2)}` : "—";

  // ── Payment bar ──
  const pmLabel = fmtPaymentMethod(o.paymentMethod);
  const txnNo   = o.transactionNumber || null;
  const paymentBarHtml = pmLabel
    ? `<div class="payment-bar">
        <span class="plbl">Payment</span>
        <span class="pval">${pmLabel}</span>
        ${txnNo
          ? `<span class="psep">|</span><span class="plbl">Ref</span><span class="pval">${txnNo}</span>`
          : ""}
      </div>`
    : "";

  // ── Item rows ──
  // BUG FIX: escape HTML in item names/codes to prevent XSS in print window
  const escapeHtml = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const itemRows =
    items.length === 0
      ? `<tr><td colspan="5" style="text-align:center;color:#888;padding:6px 0;font-size:7px">No items</td></tr>`
      : items
          .map((item, idx) => {
            const name = escapeHtml(item.itemName || item.name || `Item #${item.itemId || idx}`);
            const code = escapeHtml(item.itemCode || item.code || "");
            const qty  = item.quantity || item.qty || 0;
            const up   = item.unitPriceSnapshot != null
              ? `₹${Number(item.unitPriceSnapshot).toFixed(2)}`
              : "—";
            // BUG FIX: use stored lineTotal first; fallback to recalc
            const lt   = item.lineTotal != null
              ? `₹${Number(item.lineTotal).toFixed(2)}`
              : (item.unitPriceSnapshot != null
                  ? `₹${(Number(item.unitPriceSnapshot) * qty).toFixed(2)}`
                  : "—");
            return `<tr>
              <td class="sno">${idx + 1}</td>
              <td>${name}${code ? `<span class="icode">${code}</span>` : ""}</td>
              <td class="c">${qty}</td>
              <td class="r">${up}</td>
              <td class="r">${lt}</td>
            </tr>`;
          })
          .join("");

  return `
    <div class="slip">
      <div class="hdr">
        <div>
          <div class="order-id">Order #${escapeHtml(o.id || "—")}</div>
          <div class="order-sub">${fmtDate(o.orderDate || o.createdAt)}</div>
        </div>
        <div class="hdr-right">
          <span class="pill">${escapeHtml(copyType)} Copy</span>
          <span class="chip">${escapeHtml(rawStatus || "—")}</span>
          <span class="pdate">Printed: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      <div class="meta">
        <div class="meta-row">
          <div class="meta-box">
            <div class="lbl">Student</div>
            <div class="val">${escapeHtml(o.studentName || "—")}</div>
            ${o.admissionNumber ? `<div class="sub">ADM: ${escapeHtml(o.admissionNumber)}</div>` : ""}
            ${o.className       ? `<div class="sub">Class: ${escapeHtml(o.className)}</div>`     : ""}
          </div>
          <div class="meta-box">
            <div class="lbl">Firm</div>
            <div class="val">LEELA ENTERPRISES</div>
            <div class="sub">GST: ${escapeHtml(gstNumber || "—")}</div>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-box">
            <div class="lbl">Issued By</div>
            <div class="val">${escapeHtml(o.issuedByName || "—")}</div>
            <div class="sub">Date: ${fmtDate(o.orderDate || o.createdAt)}</div>
          </div>
        </div>
      </div>

      ${paymentBarHtml}
      ${o.remarks ? `<div class="remarks"><b>Note:</b> ${escapeHtml(o.remarks)}</div>` : ""}

      <div class="tbl-lbl">Items (${items.length})</div>
      <table>
        <thead>
          <tr>
            <th class="c">#</th>
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
            <td><b>Order Total</b></td>
            <td class="c"><b>${total}</b></td>
            <td></td>
            <td class="r grand"><b>${orderTotal}</b></td>
          </tr>
        </tbody>
      </table>

      <div class="foot">
        <div class="summary">
          <div><b>${items.length}</b> types &nbsp;·&nbsp; <b>${total}</b> units</div>
          <div>Total: <b>${orderTotal}</b></div>
        </div>
        <div class="sigs">
          <div class="sig">
            <div class="sig-line"></div>
            <div class="sig-lbl">${escapeHtml(sigLabel)}</div>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * Opens a print window with 3 copies (Accountant, Admin, Parent) side-by-side on A4 Landscape.
 *
 * @param {object} order      - order data object
 * @param {string} gstNumber  - GST number string (can be empty "")
 */
export function printOrder(order, gstNumber = "") {
  const o = order || {};

  // BUG FIX: guard window.open being blocked by pop-up blocker
  const win = window.open("", "_blank", "width=1200,height=900");
  if (!win) {
    console.error("printOrder: pop-up was blocked. Please allow pop-ups for this site.");
    alert("Pop-up blocked. Please allow pop-ups for this site to print.");
    return;
  }

  const rawStatus = (o.status || o.orderStatus || "").toUpperCase();
  const items     = o.items || o.orderItems || [];
  const total     = items.reduce((a, i) => a + (i.quantity || i.qty || 0), 0);
  const copies    = ["Accountant", "Admin", "Parent"];
  const CUT       = `<div class="cut"><span class="cut-label">✂ cut</span></div>`;

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

  // BUG FIX: escape order ID in title to prevent XSS
  const safeId = String(o.id || "").replace(/[<>"']/g, "");

  win.document.write(`<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8" />
    <title>Order #${safeId} – Print Copies</title>
    <style>${PRINT_STYLES}</style>
  </head><body>${body}</body></html>`);
  win.document.close();
  win.focus();

  // BUG FIX: 450ms may not be enough on slow machines; use load event with fallback
  const doprint = () => {
    try { win.print(); } catch (_) { /* ignore if already closed */ }
    // Don't auto-close — user may want to re-print or check layout
  };

  if (win.document.readyState === "complete") {
    setTimeout(doprint, 150);
  } else {
    win.addEventListener("load", doprint, { once: true });
    // Fallback in case load doesn't fire (e.g. some browsers with about:blank)
    setTimeout(doprint, 500);
  }
}
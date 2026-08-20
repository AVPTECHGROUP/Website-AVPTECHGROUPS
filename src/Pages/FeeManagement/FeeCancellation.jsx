import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Ban, AlertCircle, RotateCcw, Printer, X } from 'lucide-react';
import { getCancelledFeeCollections, getFeeReceiptById } from '../../Api/FeeManagement/FeeCollection';
import { getTodayDate, getOneMonthAgoDate, PAGE_SIZE } from '../../Constants/StringConstants/FeeManagementConstants';
import { UserContext } from '../../ContextAPI/UserContext';

// ─── Formatters ─────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const fmtMoney2 = (n) =>
    '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
};
const fmtDateTime = (d) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch { return d; }
};

// Same "backend has no free-text search param" pattern used elsewhere in
// CollectionsHistory.jsx — pull a larger batch matching the real filters
// (classId/periodId/fromDate/toDate) and filter/paginate client-side.
const SEARCH_FETCH_SIZE = 1000;

// FIX (requested): "sorted data not getting to top" — this was previously
// never sent at all, even though getCancelledFeeCollections already accepts
// a `sort` param. Without it, ordering depended entirely on the backend's
// default.
//
// CONFIRMED against a real API response (GET
// /v1/fee/collections/cancelled with sort left empty): the backend's own
// default sort is `pageable.sort: [{property: "updatedAt", direction:
// "DESC"}, {property: "id", direction: "DESC"}]` — i.e. newest-updated
// first, with `id` as a tiebreaker for records touched in the same instant.
//
// Sent as an ARRAY because Spring Data's Pageable multi-field sort is
// expressed as REPEATED query params (`?sort=updatedAt,desc&sort=id,desc`),
// not a single comma-joined string — buildQueryParams in FeeCollection.js
// was updated to append one `sort=` entry per array item to match this.
const DEFAULT_SORT = ['updatedAt,desc', 'id,desc'];

// ─── Small shared primitives (kept local so this file has no dependency
// on CollectionsHistory.jsx internals) ──────────────────────────────────────
const Btn = ({ children, variant = 'secondary', size = 'sm', onClick, disabled, className = '' }) => {
    const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-[12.5px]' }[size];
    const v = {
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
        ghost: 'bg-blue-50 text-[#1E3A5F] border border-blue-200 hover:bg-blue-100',
        success: 'bg-emerald-700 text-white hover:bg-emerald-800',
    }[variant];
    return (
        <button type="button" onClick={onClick} disabled={disabled}
                className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sz} ${v} ${className}`}>
            {children}
        </button>
    );
};

const Inp = ({ className = '', ...props }) => (
    <input className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${className}`} {...props} />
);

const Sel = ({ options = [], placeholder, value, onChange, className = '' }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
            className={`px-3 py-2 cursor-pointer text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${className}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

// FIX (responsive rework): the Receipt No. column is gone, so the table no
// longer needs a wide `min-w` + horizontal-scroll fallback as its PRIMARY
// layout strategy — it's `table-fixed` with a percentage colgroup instead
// (see below), which is what makes it fit 1024–1440px+ laptops without
// scrolling. This scroll styling stays only as a safety net for unusually
// narrow windows.
const TableScrollStyles = () => (
    <style>{`
      .cfc-table-scroll {
        scrollbar-width: thin;
        scrollbar-color: #93c5fd #f3f4f6;
        background:
          linear-gradient(to right, white 30%, rgba(255,255,255,0)) 0 0,
          linear-gradient(to left, white 30%, rgba(255,255,255,0)) 100% 0,
          linear-gradient(to right, rgba(15,23,42,0.10), rgba(15,23,42,0)) 0 0,
          linear-gradient(to left, rgba(15,23,42,0.10), rgba(15,23,42,0)) 100% 0;
        background-repeat: no-repeat;
        background-color: white;
        background-size: 32px 100%, 32px 100%, 12px 100%, 12px 100%;
        background-attachment: local, local, scroll, scroll;
      }
      .cfc-table-scroll::-webkit-scrollbar { height: 10px; }
      .cfc-table-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 999px; }
      .cfc-table-scroll::-webkit-scrollbar-thumb { background: #93c5fd; border-radius: 999px; }
      .cfc-table-scroll::-webkit-scrollbar-thumb:hover { background: #60a5fa; }
    `}</style>
);

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const Pagination = ({ page, totalPages, pageSize, onPageSizeChange, onPageChange, rangeStart, rangeEnd, totalElements }) => {
    const safeTotalPages = Math.max(1, totalPages || 1);
    const pageNumbers = useMemo(() => {
        const delta = 1;
        const range = [];
        const withDots = [];
        for (let i = 1; i <= safeTotalPages; i++) {
            if (i === 1 || i === safeTotalPages || (i >= page - delta && i <= page + delta)) range.push(i);
        }
        let last;
        range.forEach((i) => {
            if (last !== undefined) {
                if (i - last === 2) withDots.push(last + 1);
                else if (i - last !== 1) withDots.push('…');
            }
            withDots.push(i);
            last = i;
        });
        return withDots;
    }, [page, safeTotalPages]);

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Showing {rangeStart} to {rangeEnd} of {totalElements}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Rows per page:</span>
                    <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white cursor-pointer">
                        {ROWS_PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={14} />
                </button>
                {pageNumbers.map((p, idx) => p === '…' ? (
                    <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">…</span>
                ) : (
                    <button type="button" key={p} onClick={() => onPageChange(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {p}
                    </button>
                ))}
                <button type="button" onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))} disabled={page >= safeTotalPages}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

const getStructureLabel = (name) => {
    const trimmed = (name || '').toString().trim();
    return trimmed || null;
};

// Defensive field mapping — cancelled-payment records may carry the
// "who/when cancelled" info under slightly different keys depending on how
// the backend names the audit fields.
//
// FIX (bug reported: "wrong data sometimes"): the `cancelledBy` fallback
// chain previously included `r.collectedBy` as a last resort. That field
// means something entirely different — it's whoever ORIGINALLY collected
// the payment, not whoever cancelled it. Removed — this now shows '—'
// honestly instead of a plausible-looking wrong name.
const mapCancelledRecord = (r, i) => ({
    id: r.id ?? i,
    receiptNo: r.receiptNo || r.paymentId || '—',
    paymentDate: r.paymentDate,
    studentName: r.studentName,
    studentId: r.studentId,
    studentCode: r.admissionNumber || r.studentCode,
    className: `${r.className || ''}${r.sectionName ? ' ' + r.sectionName : ''}`.trim() || '—',
    sectionName: r.sectionName || '',
    period: r.feePeriodName || r.period || '—',
    feeStructureName: r.feeStructureName || null,
    amount: r.amountPaid ?? r.amount ?? 0,
    discount: r.discount || 0,
    lateFine: r.lateFine || 0,
    paymentMode: r.paymentMode || r.mode || '—',
    referenceNo: r.referenceNo || '—',
    cancelledBy: r.cancelledBy || r.deletedBy || r.actionBy || '—',
    cancelledAt: r.cancelledAt || r.deletedAt || r.updatedAt || r.timestamp || null,
    reason: r.cancellationReason || r.reason || '',
    parentName: r.parentName || '',
    parentPhone: r.parentMobile || r.parentPhone || '',
});

// ── Section/Class resolution ────────────────────────────────────────────
// FIX (requested — "Section not fetching correctly"): callers/records can
// carry the section either as its own field (`sectionName`) or already
// folded into a combined class string (e.g. "Class 1 A"). This checks both
// instead of assuming one fixed shape, so Section reliably shows a value.
const resolveSection = (r) => {
    if (r.sectionName) return r.sectionName;
    if (r.section) return r.section;
    const cls = (r.className || r.class || '').trim();
    const parts = cls.split(' ');
    if (parts.length > 1) {
        const last = parts[parts.length - 1];
        if (/^[A-Za-z0-9]{1,3}$/.test(last)) return last;
    }
    return '';
};
const resolveClassOnly = (r) => {
    const cls = (r.className || r.class || '').trim();
    const section = resolveSection(r);
    if (section && cls.endsWith(section) && cls !== section) {
        return cls.slice(0, cls.length - section.length).trim();
    }
    return cls;
};

const escapeHtml = (str) =>
    String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const feeRow = (label, amount, extraClass = '', prefix = '') => {
    const sign = amount < 0 ? '-' : '';
    return `<div class="fd-row ${extraClass}"><span>${escapeHtml(label)}</span><span>${prefix}${sign}${escapeHtml(fmtMoney2(Math.abs(amount)))}</span></div>`;
};

// ── Receipt HTML builder ────────────────────────────────────────────────
// FIX (requested — "no separate files, keep it in this file"): this
// generates the full printable/previewable receipt document as a plain
// string, right here, instead of depending on FeeReceiptPrint.jsx /
// Templateengine.js / a stored default template. Same two-copy layout the
// rest of the app's fee receipts use, with:
//   - "Recorded by" removed entirely (no row/field for it at all).
//   - A CANCELLED banner + watermark when receipt.isCancelled is true.
//   - Section/Parent/Mobile resolved defensively (see resolveSection above)
//     so they populate regardless of which record shape fed this function.
const buildReceiptHtml = (receipt, school) => {
    const isCancelled = !!receipt.isCancelled;

    // FIX (bug reported: "Academic Fee row missing from receipt"): the
    // previous fallback only kicked in when the ENTIRE fee-details string
    // was empty (`... || fallbackRow`). That meant whenever a Late Fine
    // row existed, the combined string was already non-empty, so the
    // fallback never fired — silently dropping the Academic Fee line
    // whenever the receipt-by-id API returned no `components` array
    // (which is apparently what happens for a cancelled/deleted payment).
    // Academic Fee now has its OWN independent fallback, checked
    // regardless of what else is present.
    const academicRows = (receipt.academicComponents && receipt.academicComponents.length)
        ? receipt.academicComponents.map((c) => feeRow(c.name, Number(c.amount) || 0)).join('')
        : feeRow(getStructureLabel(receipt.feeStructureName) || 'Academic Fee', Number(receipt.academicCollected) || 0);
    const transportRows = (receipt.transportComponents || [])
        .map((c) => feeRow(c.name, Number(c.amount) || 0)).join('');
    const discountAmt = Number(receipt.discount) || 0;
    const discountRow = discountAmt > 0
        ? feeRow('Discount' + (receipt.discountReason ? ` (${receipt.discountReason})` : ''), -discountAmt, 'fd-discount', '- ')
        : '';
    const lateFineAmt = Number(receipt.lateFine) || 0;
    const lateFineRow = lateFineAmt > 0 ? feeRow('Late Fine', lateFineAmt, 'fd-late', '+ ') : '';
    const feeDetailsRows = academicRows + transportRows + discountRow + lateFineRow;

    const totalCollected =
        (Number(receipt.academicCollected) || 0) + (Number(receipt.transportCollected) || 0) + lateFineAmt;

    const cancelledBanner = isCancelled
        ? `<div class="cancelled-banner">⊘ CANCELLED — by ${escapeHtml(receipt.cancelledBy || '—')} on ${escapeHtml(fmtDate(receipt.cancelledAt))}${receipt.cancellationReason ? ` · ${escapeHtml(receipt.cancellationReason)}` : ''}</div>`
        : '';
    const cancelWatermark = isCancelled ? `<div class="cancel-watermark">CANCELLED</div>` : '';

    const schoolInitials = (school.schoolName || 'S').split(' ').slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || 'S';
    const logoBlock = school.schoolLogo
        ? `<img src="${school.schoolLogo}" alt="logo" />`
        : `<span class="logo-initials">${escapeHtml(schoolInitials)}</span>`;

    const copy = (label) => `
      <div class="copy">
        ${cancelWatermark}
        <div class="copy-label">${label}</div>
        ${cancelledBanner}
        <div class="header">
          <div class="logo-circle">${logoBlock}</div>
          <div class="school-block">
            <div class="school-name">${escapeHtml(school.schoolName)}</div>
            <div class="school-meta">
              ${school.schoolAddress ? `<span>${escapeHtml(school.schoolAddress)}</span>` : ''}
              ${school.schoolPhone ? `<span>${escapeHtml(school.schoolPhone)}</span>` : ''}
              ${school.schoolEmail ? `<span>${escapeHtml(school.schoolEmail)}</span>` : ''}
            </div>
          </div>
          <div class="receipt-title">FEE RECEIPT</div>
        </div>
        <div class="body-pad">
          <div class="details-grid">
            <div>
              <div class="section-label">Student Details</div>
              <div class="kv-row"><b>Admission No.</b><span>${escapeHtml(receipt.admissionNumber || '—')}</span></div>
              <div class="kv-row"><b>Roll No.</b><span>${escapeHtml(receipt.rollNo || '—')}</span></div>
              <div class="kv-row"><b>Name</b><span>${escapeHtml(receipt.studentName || '—')}</span></div>
              <div class="kv-row"><b>Class</b><span>${escapeHtml(receipt.classLabel || '—')}</span></div>
              <div class="kv-row"><b>Section</b><span>${escapeHtml(receipt.sectionLabel || '—')}</span></div>
              <div class="kv-row"><b>Parent</b><span>${escapeHtml(receipt.parentName || '—')}</span></div>
              <div class="kv-row"><b>Mobile</b><span>${escapeHtml(receipt.parentPhone || '—')}</span></div>
            </div>
            <div>
              <div class="section-label">Receipt Info</div>
              <div class="kv-row"><b>Receipt No.</b><span>${escapeHtml(receipt.receiptNo || '—')}</span></div>
              <div class="kv-row"><b>School</b><span>${escapeHtml(school.schoolName)}</span></div>
              <div class="kv-row"><b>Fee Period</b><span>${escapeHtml(receipt.period || '—')}</span></div>
              <div class="kv-row"><b>Date</b><span>${escapeHtml(fmtDate(receipt.date))}</span></div>
              <div class="kv-row"><b>Mode</b><span>${escapeHtml(receipt.paymentMode || '—')}</span></div>
              <div class="kv-row"><b>Ref. No.</b><span>${escapeHtml(receipt.referenceNo && receipt.referenceNo !== '—' ? receipt.referenceNo : '—')}</span></div>
            </div>
          </div>
          <div class="fee-details">
            <div class="section-label">Fee Details</div>
            ${feeDetailsRows}
            <div class="total-row"><span>Total Amount Collected</span><span>${escapeHtml(fmtMoney2(totalCollected))}</span></div>
          </div>
          <!-- FIX (requested): "Recorded by" row removed entirely — footer
               now holds only Remaining Balance + signature, with spacing
               tightened so there's no leftover gap. -->
          <div class="footer-row">
            <div class="remaining-balance">Remaining Balance: ${escapeHtml(fmtMoney2(receipt.balanceAfter))}</div>
            <div class="signature-line">Authorised Signature</div>
          </div>
          <div class="footer-note">This is a computer-generated receipt and does not require a signature.</div>
        </div>
      </div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Fee Receipt${isCancelled ? ' - CANCELLED' : ''}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #1f2937; }
  .receipt-wrap { display: flex; gap: 24px; max-width: 1160px; margin: 0 auto; align-items: flex-start; }
  @media (max-width: 860px) { .receipt-wrap { flex-direction: column; } }
  .copy { position: relative; flex: 1; min-width: 0; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); overflow: hidden; }
  .copy-label { text-align: right; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #9ca3af; padding: 10px 20px 0; }
  .cancelled-banner { margin: 8px 20px 0; padding: 8px 12px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 11.5px; font-weight: 700; text-align: center; }
  .cancel-watermark { position: absolute; top: 42%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); font-size: 60px; font-weight: 900; letter-spacing: 0.15em; color: rgba(220, 38, 38, 0.16); pointer-events: none; z-index: 5; white-space: nowrap; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; margin-top: 8px; background: linear-gradient(135deg, #1e3a5f 0%, #2b5487 100%); color: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .logo-circle { width: 44px; height: 44px; border-radius: 50%; background: #fff; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .logo-circle img { width: 100%; height: 100%; object-fit: cover; }
  .logo-initials { font-size: 14px; font-weight: 800; color: #1e3a5f; }
  .school-block { flex: 1; min-width: 0; }
  .school-name { font-size: 16px; font-weight: 800; line-height: 1.2; }
  .school-meta { font-size: 10.5px; color: rgba(255,255,255,0.75); margin-top: 2px; }
  .school-meta span + span::before { content: " · "; }
  .receipt-title { font-size: 12px; font-weight: 800; letter-spacing: 0.06em; white-space: nowrap; }
  .body-pad { padding: 16px 20px 20px; }
  .section-label { display: inline-block; font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #3730a3; background: #eef2ff; padding: 3px 8px; border-radius: 999px; margin-bottom: 8px; }
  .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
  @media (max-width: 480px) { .details-grid { grid-template-columns: 1fr; } }
  .kv-row { display: grid; grid-template-columns: 84px 1fr; gap: 6px; font-size: 11.5px; line-height: 1.6; }
  .kv-row b { font-weight: 700; color: #374151; }
  .kv-row span:last-child { color: #111827; }
  .fee-details { padding: 14px 0 0; }
  .fd-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 5px 0; }
  .fd-row span:first-child { color: #4b5563; }
  .fd-row span:last-child { font-weight: 700; color: #111827; }
  .fd-row.fd-late span:first-child, .fd-row.fd-late span:last-child { color: #c2410c; }
  .fd-row.fd-discount span:first-child, .fd-row.fd-discount span:last-child { color: #15803d; }
  .total-row { display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 15px; font-weight: 800; color: #111827; }
  .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px; gap: 12px; }
  .remaining-balance { font-size: 11px; color: #6b7280; }
  .signature-line { min-width: 140px; text-align: center; font-size: 10px; color: #6b7280; border-top: 1px solid #9ca3af; padding-top: 4px; }
  .footer-note { text-align: center; font-size: 9.5px; color: #9ca3af; margin-top: 16px; padding-top: 10px; border-top: 1px solid #f3f4f6; }
  @media print {
    @page { size: A4 landscape; margin: 10mm; }
    body { background: #fff; padding: 0; }
    .receipt-wrap { gap: 12mm; }
    .copy { box-shadow: none; border: 1px solid #e5e7eb; }
  }
</style>
</head>
<body>
  <div class="receipt-wrap">
    ${copy('Office Copy')}
    ${copy('Student / Parent Copy')}
  </div>
</body>
</html>`;
};

// ── Receipt modal ────────────────────────────────────────────────────────
// FIX (requested): everything needed to preview/print a cancelled payment's
// receipt lives right here — no FeeReceiptPrint.jsx, no Templateengine.js.
//
// School identity: per UserContext.jsx, `schoolInfo` is whatever object was
// last saved via `saveSchool()` at login/school-switch — its exact field
// names (e.g. `name` vs `schoolName`, `address`, `phone`, `email`,
// `logoUrl`) aren't defined in UserContext.jsx itself (it just stores
// whatever shape the caller passes in), so the fallbacks below check the
// most likely names. TODO: confirm against whatever payload actually gets
// passed to saveSchool() during login/school-switch, and trim this list to
// the real ones.
const CancelledReceiptModal = ({ receipt, onClose }) => {
    const { schoolInfo } = useContext(UserContext) || {};
    const school = {
        schoolName: schoolInfo?.schoolName || schoolInfo?.name || 'School',
        schoolAddress: schoolInfo?.address || schoolInfo?.schoolAddress || '',
        schoolPhone: schoolInfo?.phone || schoolInfo?.contactNumber || schoolInfo?.mobile || schoolInfo?.schoolPhone || '',
        schoolEmail: schoolInfo?.email || schoolInfo?.contactEmail || schoolInfo?.schoolEmail || '',
        schoolLogo: schoolInfo?.logoUrl || schoolInfo?.logo || '',
    };

    const html = useMemo(() => buildReceiptHtml(receipt, school), [receipt, school]);

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.print(); }, 400);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <h2 className="text-[14px] font-extrabold text-gray-900">
                        Fee Receipt Preview {receipt.isCancelled && <span className="text-red-600">· Cancelled</span>}
                    </h2>
                    <p className="text-[11px] text-gray-400">Office copy + Student/Parent copy</p>
                </div>
                <Btn variant="success" size="sm" onClick={handlePrint}>
                    <Printer size={13} /> Print Both Copies
                </Btn>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <X size={15} />
                </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200 p-3 sm:p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <iframe title="fee-receipt-preview" srcDoc={html} sandbox="" className="w-full border-0"
                                style={{ height: '80vh', minHeight: 480 }} />
                    </div>
                    <p className="text-center text-[11px] text-gray-500 mt-3">↑ Live preview · Click "Print Both Copies" to print</p>
                </div>
            </div>
        </div>
    );
};

// ─── Mobile card ────────────────────────────────────────────────────────────
const CancelledCard = ({ c, onViewReceipt, viewLoading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 text-sm truncate">{c.studentName}</div>
                <div className="text-xs text-gray-400 truncate">{c.studentCode}</div>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="font-bold text-red-500 text-base">{fmt(c.amount)}</div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-[10px] font-semibold">
          <Ban size={10} /> Cancelled
        </span>
            </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            <span><span className="text-gray-400">Paid: </span>{fmtDate(c.paymentDate)}</span>
            <span><span className="text-gray-400">Class: </span>{c.className}</span>
            <span><span className="text-gray-400">Period: </span>{c.period}</span>
            <span className="min-w-0 truncate max-w-full"><span className="text-gray-400">Fee Structure: </span>{getStructureLabel(c.feeStructureName) || '—'}</span>
            <span><span className="text-gray-400">Mode: </span>{c.paymentMode}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
            <span className="text-gray-400">Cancelled by </span>
            <span className="font-semibold text-gray-700">{c.cancelledBy}</span>
            <span className="text-gray-400"> on </span>
            <span className="font-semibold text-gray-700">{fmtDateTime(c.cancelledAt)}</span>
            {c.reason && <div className="mt-1 text-gray-500">Reason: {c.reason}</div>}
        </div>
        <div className="flex justify-end pt-2 mt-2 border-t border-gray-50">
            <Btn variant="ghost" size="xs" onClick={() => onViewReceipt(c)} disabled={viewLoading}>
                {viewLoading ? (
                    <span className="w-3 h-3 border-2 border-[#1E3A5F]/40 border-t-[#1E3A5F] rounded-full animate-spin" />
                ) : 'View Receipt'}
            </Btn>
        </div>
    </div>
);

// ─── Main component ─────────────────────────────────────────────────────────
const CancelledFeeCollections = ({ classOptions = [], periodOptions = [] }) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [classF, setClassF] = useState('');
    const [periodF, setPeriodF] = useState('');
    const [fromDate, setFromDate] = useState(getOneMonthAgoDate());
    const [toDate, setToDate] = useState(getTodayDate());
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [showFilters, setShowFilters] = useState(false);

    const [records, setRecords] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [receiptModal, setReceiptModal] = useState({ open: false, receipt: null });
    const [viewLoadingId, setViewLoadingId] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch, classF, periodF, fromDate, toDate]);

    const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

    const fetchCancelled = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const isSearching = debouncedSearch.length > 0;
            const baseParams = { fromDate, toDate, sort: DEFAULT_SORT };
            if (classF) baseParams.classId = classF;
            if (periodF) baseParams.periodId = periodF;

            const params = isSearching
                ? { ...baseParams, page: 0, size: SEARCH_FETCH_SIZE }
                : { ...baseParams, page: page - 1, size: pageSize };

            const res = await getCancelledFeeCollections(params);
            const mapped = (res?.records || []).map(mapCancelledRecord);

            if (isSearching) {
                const q = debouncedSearch.toLowerCase();
                const filtered = mapped.filter((c) =>
                    (c.studentName || '').toLowerCase().includes(q) ||
                    (c.studentCode || '').toLowerCase().includes(q) ||
                    (c.receiptNo || '').toLowerCase().includes(q)
                );
                const start = (page - 1) * pageSize;
                setRecords(filtered.slice(start, start + pageSize));
                setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
                setTotalElements(filtered.length);
            } else {
                setRecords(mapped);
                setTotalPages(res?.pagination?.totalPages || 1);
                setTotalElements(res?.pagination?.totalElements ?? mapped.length);
            }
        } catch (e) {
            setError(e.message || 'Failed to load cancelled payments');
            setRecords([]);
        } finally { setLoading(false); }
    }, [fromDate, toDate, classF, periodF, page, pageSize, debouncedSearch]);

    useEffect(() => { fetchCancelled(); }, [fetchCancelled]);

    const resetFilters = () => {
        setSearch(''); setClassF(''); setPeriodF('');
        setFromDate(getOneMonthAgoDate()); setToDate(getTodayDate()); setPage(1);
    };

    // FIX (requested): fetches the real receipt data and opens the local
    // CancelledReceiptModal above (built entirely in this file). Falls back
    // to reconstructing the receipt from the already-loaded cancelled row if
    // the receipt-by-id lookup fails (e.g. the backend hard-deletes the
    // original receipt record once a payment is cancelled). isCancelled is
    // always hardcoded true here — this handler only ever fires from a row
    // in the Cancelled tab.
    const handleViewReceipt = async (item) => {
        setViewLoadingId(item.id);
        let data = null;
        let generatedAt = '';
        try {
            const res = await getFeeReceiptById(item.id);
            data = res?.data || res;
            generatedAt = res?.timestamp || data?.timestamp || data?.generatedAt || data?.createdAt || '';
        } catch {
            data = null;
        } finally {
            setViewLoadingId(null);
        }

        const classSource = data
            ? { className: data.className, sectionName: data.sectionName }
            : { className: item.className, sectionName: item.sectionName };

        const receipt = {
            id: item.id,
            receiptNo: data?.receiptNo || item.receiptNo,
            date: data?.paymentDate || item.paymentDate,
            generatedAt,
            studentName: data?.studentName || item.studentName,
            admissionNumber: data?.admissionNumber || item.studentCode,
            rollNo: data?.studentId || item.studentId,
            classLabel: resolveClassOnly(classSource) || '—',
            sectionLabel: resolveSection(classSource) || '—',
            parentName: data?.parentName || item.parentName || '',
            parentPhone: data?.parentMobile || data?.parentPhone || item.parentPhone || '',
            period: data?.feePeriodName || item.period,
            feeStructureName: item.feeStructureName,
            academicComponents: (data?.components || []).map((c) => ({ name: c.customName || c.componentType, amount: c.amount })),
            academicCollected: data?.amountPaid ?? item.amount,
            transportComponents: (data?.transportComponents || []).map((c) => ({ name: c.customName || c.componentType || c.name, amount: c.amount })),
            transportCollected: data?.transportAmount || 0,
            discount: data?.discount ?? item.discount ?? 0,
            discountReason: data?.discountReason || '',
            lateFine: data?.lateFine ?? item.lateFine ?? 0,
            paymentMode: data?.paymentMode || item.paymentMode,
            referenceNo: data?.referenceNo || item.referenceNo,
            balanceAfter: data?.balanceAfter,
            // FIX (requested — "cancelled flag"): this receipt only ever
            // opens from a row in the Cancelled tab, so isCancelled is
            // hardcoded true rather than read off an ambiguous field —
            // buildReceiptHtml uses this single boolean to decide whether
            // to show the CANCELLED banner/watermark at all.
            isCancelled: true,
            cancelledBy: item.cancelledBy,
            cancelledAt: item.cancelledAt,
            cancellationReason: item.reason,
        };

        setReceiptModal({ open: true, receipt });
    };

    return (
        <div className="space-y-3">
            <TableScrollStyles />

            {error && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm text-orange-700 min-w-0">{error}</div>
                    <button onClick={fetchCancelled} className="text-orange-600 hover:text-orange-800 font-semibold text-sm flex-shrink-0">Retry</button>
                </div>
            )}

            {/* Mobile/tablet filter bar */}
            <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search student, receipt no."
                           className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors flex-shrink-0 whitespace-nowrap ${showFilters || classF || periodF ? 'bg-blue-50 text-[#1E3A5F] border-blue-200' : 'bg-white text-gray-700 border-gray-200'}`}>
                    <Filter size={13} /> <span>Filters</span>
                </button>
            </div>
            {showFilters && (
                <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl lg:hidden border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                        <Inp type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <Inp type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <Sel value={periodF} onChange={setPeriodF} options={periodOptions} placeholder="All Periods" className="w-full" />
                    <Sel value={classF} onChange={setClassF} options={classOptions} placeholder="All Classes" className="w-full" />
                    <Btn variant="ghost" onClick={resetFilters} className="w-full justify-center"><RotateCcw size={12} /> Reset</Btn>
                </div>
            )}

            {/* 1024px+ filter bar */}
            <div className="hidden lg:flex items-center gap-2 w-full flex-wrap xl:flex-nowrap">
                <div className="relative flex-1 min-w-[160px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search student, receipt no."
                           className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
                </div>
                <div className="w-36 xl:w-40 flex-shrink-0"><Inp type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
                <div className="w-36 xl:w-40 flex-shrink-0"><Inp type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
                <Sel value={periodF} onChange={setPeriodF} options={periodOptions} placeholder="All Periods" className="w-32 xl:w-40 flex-shrink-0" />
                <Sel value={classF} onChange={setClassF} options={classOptions} placeholder="All Classes" className="w-28 xl:w-36 flex-shrink-0" />
                <Btn variant="ghost" onClick={resetFilters}><RotateCcw size={12} /> Reset</Btn>
            </div>

            {/* 1024px+ table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto cfc-table-scroll">
                    <table className="w-full min-w-[900px] table-fixed">
                        <colgroup>
                            {/* FIX (requested): Cancelled By column removed — the 9%
                                it used is redistributed across the remaining 11
                                columns below so each has proper breathing room
                                instead of the table just getting narrower overall. */}
                            <col className="w-[9%]" />  {/* Paid On */}
                            <col className="w-[16%]" /> {/* Student */}
                            <col className="w-[8%]" />  {/* Class */}
                            <col className="w-[8%]" />  {/* Period */}
                            <col className="w-[13%]" /> {/* Fee Structure */}
                            <col className="w-[9%]" />  {/* Amount */}
                            <col className="w-[7%]" />  {/* Discount */}
                            <col className="w-[7%]" />  {/* Late Fine */}
                            <col className="w-[8%]" />  {/* Mode */}
                            <col className="w-[8%]" />  {/* Cancelled On */}
                            <col className="w-[7%]" />  {/* Action */}
                        </colgroup>
                        <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            {['Paid On', 'Student', 'Class', 'Period', 'Fee Structure', 'Amount', 'Discount', 'Late Fine', 'Mode', 'Cancelled On', 'Action'].map((h) => (
                                <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider truncate">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={11} className="text-center py-14">
                                <span className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                                <div className="text-sm text-gray-400">Loading cancelled payments…</div>
                            </td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={11} className="text-center py-14 text-sm text-gray-400">No cancelled payments found.</td></tr>
                        ) : records.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-3 py-3 text-xs text-gray-600 truncate">{fmtDate(c.paymentDate)}</td>
                                <td className="px-3 py-3 min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{c.studentName}</div>
                                    <div className="text-xs text-gray-400 truncate">{c.studentCode}</div>
                                </td>
                                <td className="px-3 py-3 truncate">
                                    <span className="inline-block max-w-full truncate px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md">{c.className}</span>
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-600 truncate">{c.period}</td>
                                <td className="px-3 py-3 text-xs text-gray-500 truncate" title={getStructureLabel(c.feeStructureName) || ''}>
                                    {getStructureLabel(c.feeStructureName) || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm font-bold text-red-500 truncate">{fmt(c.amount)}</td>
                                <td className="px-3 py-3 text-xs text-gray-500 truncate">{fmt(c.discount)}</td>
                                <td className="px-3 py-3 text-xs text-amber-700 truncate">{fmt(c.lateFine)}</td>
                                <td className="px-3 py-3 text-xs text-gray-600 truncate">{c.paymentMode}</td>
                                <td className="px-3 py-3 text-xs text-gray-500 truncate">{fmtDateTime(c.cancelledAt)}</td>
                                <td className="px-3 py-3">
                                    <Btn variant="ghost" size="xs" onClick={() => handleViewReceipt(c)} disabled={viewLoadingId === c.id}>
                                        {viewLoadingId === c.id ? (
                                            <span className="w-3 h-3 border-2 border-[#1E3A5F]/40 border-t-[#1E3A5F] rounded-full animate-spin" />
                                        ) : 'View Receipt'}
                                    </Btn>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    page={page} totalPages={totalPages} pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange} onPageChange={setPage}
                    rangeStart={records.length === 0 ? 0 : (page - 1) * pageSize + 1}
                    rangeEnd={(page - 1) * pageSize + records.length}
                    totalElements={totalElements}
                />
            </div>

            {/* Mobile/tablet cards (below 1024px) */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-14">
                        <span className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                        <div className="text-sm text-gray-400">Loading cancelled payments…</div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-14 text-sm text-gray-400">No cancelled payments found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {records.map((c) => (
                            <CancelledCard
                                key={c.id}
                                c={c}
                                onViewReceipt={handleViewReceipt}
                                viewLoading={viewLoadingId === c.id}
                            />
                        ))}
                    </div>
                )}
                {records.length > 0 && (
                    <Pagination
                        page={page} totalPages={totalPages} pageSize={pageSize}
                        onPageSizeChange={handlePageSizeChange} onPageChange={setPage}
                        rangeStart={records.length === 0 ? 0 : (page - 1) * pageSize + 1}
                        rangeEnd={(page - 1) * pageSize + records.length}
                        totalElements={totalElements}
                    />
                )}
            </div>

            {receiptModal.open && (
                <CancelledReceiptModal receipt={receiptModal.receipt} onClose={() => setReceiptModal({ open: false, receipt: null })} />
            )}
        </div>
    );
};

export default CancelledFeeCollections;
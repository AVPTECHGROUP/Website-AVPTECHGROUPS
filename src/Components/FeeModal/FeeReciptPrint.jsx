import React, { useState, useRef, useContext, useEffect } from 'react';
import { Settings, Printer, X } from 'lucide-react';
import { UserContext } from '../../ContextAPI/UserContext.jsx'; // TODO: confirm this path matches your project structure

// TODO: confirm this import path matches where getSchoolById actually lives
// in your project (per your Schools.js file, likely something like
// '../../Api/SchoolConfiguration/Schools').
import { getSchoolById } from '../../Api/SchoolConfiguration/schoolconfig.js';

// FIX: this was missing from the file, which is what caused the
// "ReferenceError: DEFAULT_CONFIG is not defined" crash in the console.
// School identity fields (name/address/phone/email/logo) have been
// REMOVED from this config — they are no longer hardcoded defaults or
// user-editable. They now come exclusively from the school's record via
// getSchoolById(schoolId), fetched below and rendered read-only.
const DEFAULT_CONFIG = {
  headerColor:   '#2E7D32',
  accentColor:   '#C8E6C9',
  transportAccentColor: '#BAE6FD',
  currency:      '₹',
  showAdminCopy: true,
  showParentCopy: true,
  adminCopyLabel:  'OFFICE COPY',
  parentCopyLabel: 'STUDENT / PARENT COPY',
  footerNote:    'This is a computer-generated receipt and does not require a signature.',
  showSignatureLine: true,
};

// Shown only until the real school record loads (or if it fails to load,
// so the receipt still renders instead of breaking).
const FALLBACK_SCHOOL = {
  schoolName: 'School',
  schoolAddress: '',
  schoolPhone: '',
  schoolEmail: '',
  schoolLogo: '',
};

// ─── Config Panel (read-only view — nothing here is editable) ─────────────────
// FIX: this used to be an edit form (text inputs, color pickers, toggle
// switches) for the branding/copy/currency/footer settings. Per request,
// the whole panel is now a plain read-only display of the current
// settings — no `onChange` wiring left anywhere in here. `config` and
// `school` are shown, never mutated, from this component.
const ConfigPanel = ({ config, onClose, school, schoolLoading }) => {
  const readOnlyField = (label, value) => (
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        <div className="w-full px-3 py-1.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-600 truncate">
          {value || '—'}
        </div>
      </div>
  );
  const readOnlyColor = (label, hex) => (
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: hex }} />
          <span className="text-xs text-gray-500 font-mono">{hex}</span>
        </div>
      </div>
  );
  const readOnlyFlag = (label, value) => (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${value ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      </div>
  );

  return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end p-4 backdrop-blur-sm"
           onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-2xl shadow-2xl w-80 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Settings size={15} className="text-[#2E7D32]" />
              <h3 className="font-extrabold text-gray-900 text-sm">Configuration</h3>
            </div>
            <button onClick={onClose} className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <X size={13} />
            </button>
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              School Info <span className="normal-case font-normal text-gray-300">(from school profile)</span>
            </p>
            {schoolLoading ? (
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  Loading school details…
                </div>
            ) : (
                <>
                  {readOnlyField('School Name', school.schoolName)}
                  {readOnlyField('Address', school.schoolAddress)}
                  {readOnlyField('Phone', school.schoolPhone)}
                  {readOnlyField('Email', school.schoolEmail)}
                </>
            )}

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Branding</p>
            <div className="grid grid-cols-2 gap-3">
              {readOnlyColor('Header Color', config.headerColor)}
              {readOnlyColor('Row Accent', config.accentColor)}
            </div>
            {readOnlyColor('Transport Accent', config.transportAccentColor)}

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Copies</p>
            {readOnlyFlag('Show Admin / Office Copy', config.showAdminCopy)}
            {readOnlyFlag('Show Parent / Student Copy', config.showParentCopy)}
            {readOnlyField('Admin Copy Label', config.adminCopyLabel)}
            {readOnlyField('Parent Copy Label', config.parentCopyLabel)}

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Currency</p>
            {readOnlyField('Currency Symbol', config.currency)}

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Footer</p>
            {readOnlyField('Footer Note', config.footerNote)}
            {readOnlyFlag('Show Signature Line', config.showSignatureLine)}
          </div>
        </div>
      </div>
  );
};

// ─── Single Receipt Copy ──────────────────────────────────────────────────────
// FIX: school identity is now a separate `school` prop sourced from the API,
// instead of living inside `config`.
// FIX: school phone/email were being fetched (and shown in the read-only
// Config panel) but never actually rendered on the printed receipt itself.
// They're now shown in the header, under the address, whenever present.
const ReceiptCopy = ({ config, school, data, copyLabel }) => {
  const { currency, headerColor, accentColor, transportAccentColor, showSignatureLine, footerNote } = config;
  const fmt = (n) => currency + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const academicItems = data.academicComponents || [];
  const transportItems = data.transportComponents || [];
  const academicCollected = Number(data.academicCollected) || 0;
  const transportCollected = Number(data.transportCollected) || 0;
  const discount = Number(data.discount) || 0;
  const lateFine = Number(data.lateFine) || 0;
  // academicCollected is already net of discount (matches how it's
  // submitted to the backend) — discount is shown below only for
  // transparency, not subtracted again.
  const grandTotal = academicCollected + lateFine + transportCollected;

  const renderTable = (items, sectionLabel, accent) => (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginTop: 4 }}>
        <thead>
        <tr style={{ background: accent }}>
          <th style={{ padding: '4px 10px', textAlign: 'left', fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }} colSpan={2}>
            {sectionLabel}
          </th>
        </tr>
        </thead>
        <tbody>
        {items.length === 0 ? (
            <tr><td colSpan={2} style={{ padding: '5px 10px', color: '#999', fontStyle: 'italic' }}>None</td></tr>
        ) : items.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '4px 10px' }}>{c.name || c.componentType || '—'}</td>
              <td style={{ padding: '4px 10px', textAlign: 'right' }}>{fmt(c.amount)}</td>
            </tr>
        ))}
        </tbody>
      </table>
  );

  return (
      <div style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '11px', border: '1px solid #ccc', pageBreakInside: 'avoid' }}>

        <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd', padding: '3px 10px', fontSize: '9px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>
          {copyLabel}
        </div>

        <div style={{ background: headerColor, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {school.schoolLogo ? (
                <img src={school.schoolLogo} alt="logo" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }} />
            ) : (
                <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 13 }}>
                  {(school.schoolName || '').split(' ').slice(0, 2).map(w => w[0]).join('')}
                </div>
            )}
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 }}>{school.schoolName}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }}>{school.schoolAddress}</div>
              {(school.schoolPhone || school.schoolEmail) && (
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9, marginTop: 1 }}>
                    {[school.schoolPhone, school.schoolEmail].filter(Boolean).join('  ·  ')}
                  </div>
              )}
            </div>
          </div>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
            Fee Receipt
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ddd' }}>
          <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd' }}>
            <div style={{ background: accentColor, fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', padding: '3px 6px', marginBottom: 6, letterSpacing: 0.5 }}>
              Student Details
            </div>
            {[
              ['Adm. No.', data.studentCode],
              ['Name',     data.studentName],
              ['Class',    data.class],
              ['School',   school.schoolName],
            ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 'bold', minWidth: 60, color: '#444' }}>{k}:</span>
                  <span style={{ color: '#111' }}>{v || '—'}</span>
                </div>
            ))}
          </div>

          <div style={{ padding: '8px 12px' }}>
            <div style={{ background: accentColor, fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', padding: '3px 6px', marginBottom: 6, letterSpacing: 0.5 }}>
              Receipt Info
            </div>
            {[
              ['Receipt No.', data.receiptNo],
              ['Date',        data.date],
              ['Period',      data.period],
              ['Mode',        data.paymentMode],
            ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 'bold', minWidth: 70, color: '#444' }}>{k}:</span>
                  <span style={{ color: '#111' }}>{v || '—'}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Academic block */}
        {renderTable(academicItems, 'Academic Fee', accentColor)}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 12px 6px' }}>
          <div style={{ minWidth: 220 }}>
            {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#16a34a' }}>
                  <span>Discount:</span><span>− {fmt(discount)}</span>
                </div>
            )}
            {lateFine > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#b45309' }}>
                  <span>Late Fine:</span><span>+ {fmt(lateFine)}</span>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: 'bold' }}>
              <span>Academic Amount Collected:</span><span>{fmt(academicCollected)}</span>
            </div>
          </div>
        </div>

        {/* Transport block */}
        {(transportItems.length > 0 || transportCollected > 0) && (
            <>
              {renderTable(transportItems, 'Transport Fee', transportAccentColor || '#BAE6FD')}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 12px 6px' }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: 'bold' }}>
                    <span>Transport Amount Collected:</span><span>{fmt(transportCollected)}</span>
                  </div>
                </div>
              </div>
            </>
        )}

        {/* Grand total */}
        <div style={{ borderTop: '2px solid #333', padding: '6px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 220, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 13 }}>
              <span>TOTAL COLLECTED:</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Note / Remarks */}
        {data.remarks && (
            <div style={{ borderTop: '1px solid #ddd', padding: '6px 12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 3 }}>NOTE / REMARKS:</div>
              <div style={{ minHeight: 24, border: '1px solid #ddd', padding: '4px 6px', fontSize: 10, color: '#555', background: '#fafafa', borderRadius: 2 }}>
                {data.remarks}
              </div>
            </div>
        )}

        {/* Signature + Balance After */}
        <div style={{ borderTop: '1px solid #ddd', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 10, color: '#555' }}>
            <div>Recorded by: <strong>{data.recordedBy || 'Admin'}</strong></div>
            {(parseFloat(data.balanceAfter) || 0) >= 0 && (
                <div style={{ marginTop: 3 }}>
                  Balance After Payment: <strong style={{ color: parseFloat(data.balanceAfter) > 0 ? '#e11d48' : '#16a34a' }}>{fmt(data.balanceAfter)}</strong>
                </div>
            )}
            {data.referenceNo && <div>Ref. No.: <strong>{data.referenceNo}</strong></div>}
          </div>
          {showSignatureLine && (
              <div style={{ textAlign: 'center', fontSize: 10, color: '#555' }}>
                <div style={{ borderTop: '1px solid #555', paddingTop: 3, marginTop: 24, width: 120 }}>Authorised Signature</div>
              </div>
          )}
        </div>

        <div style={{ background: '#f5f5f5', borderTop: '1px solid #eee', padding: '4px 12px', fontSize: 9, color: '#888', textAlign: 'center' }}>
          {footerNote}
        </div>
      </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeeReceiptPrint({ receipt, onClose }) {
  const { schoolId, schoolInfo } = useContext(UserContext);

  // FIX: school identity is now its own state, fetched fresh from the
  // backend for the logged-in school's schoolId — never hardcoded and
  // never user-editable. We seed it from the lightweight `schoolInfo`
  // already in UserContext (name/logo) so the header isn't blank while
  // the fuller record (address/phone/email) loads.
  const [school, setSchool] = useState({
    ...FALLBACK_SCHOOL,
    schoolName: schoolInfo?.schoolName || FALLBACK_SCHOOL.schoolName,
    schoolLogo: schoolInfo?.logoUrl || FALLBACK_SCHOOL.schoolLogo,
  });
  const [schoolLoading, setSchoolLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) { setSchoolLoading(false); return; }
    let cancelled = false;
    (async () => {
      setSchoolLoading(true);
      try {
        const res = await getSchoolById(schoolId);
        const data = res?.data || res;
        if (!cancelled && data) {
          // TODO: confirm these field names against the actual
          // getSchoolById response shape and adjust the right-hand side
          // keys if they differ (e.g. contactNumber vs phone).
          // ✅ FIX: widened fallback chain so phone/email reliably show up in
          // the Config panel regardless of which field name the backend
          // actually uses for them.
          setSchool({
            schoolName: data.name || data.schoolName || schoolInfo?.schoolName || FALLBACK_SCHOOL.schoolName,
            schoolAddress: data.address || data.schoolAddress || '',
            schoolPhone: data.phone || data.contactNumber || data.mobileNumber || data.mobile || data.contactPhone || data.schoolPhone || '',
            schoolEmail: data.email || data.contactEmail || data.officialEmail || data.schoolEmail || '',
            schoolLogo: data.logoUrl || schoolInfo?.logoUrl || FALLBACK_SCHOOL.schoolLogo,
          });
        }
      } catch {
        // Keep whatever we already have (context-seeded values) — a
        // failed lookup shouldn't block printing a receipt.
      } finally {
        if (!cancelled) setSchoolLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [schoolId, schoolInfo]);

  // FIX: config is fixed formatting defaults, shown read-only in the
  // Config panel — there's no editing UI left to call a setter from, so
  // this no longer needs to be mutable state.
  const config = DEFAULT_CONFIG;

  const [showConfig, setShowConfig] = useState(false);

  // FIX: receipt data is now fixed at open-time from the `receipt` prop.
  // The "Edit Data" panel (and every setter that mutated it) has been
  // removed per request — this now only feeds the read-only preview/print
  // output, it is never mutated after mount.
  const editData = {
    receiptNo:   receipt?.receiptNo   || '',
    date:        receipt?.date        || new Date().toLocaleDateString('en-IN'),
    studentName: receipt?.studentName || '',
    studentCode: receipt?.studentCode || '',
    class:       receipt?.class       || receipt?.className || '',
    period:      receipt?.period      || receipt?.periodName || '',
    paymentMode: receipt?.paymentMode || 'CASH',
    referenceNo: receipt?.referenceNo || '',
    remarks:     receipt?.remarks     || '',
    recordedBy:  receipt?.recordedBy  || 'Admin',
    balanceAfter:receipt?.balanceAfter ?? 0,
    discount:    receipt?.discount    || 0,
    lateFine:    receipt?.lateFine    || 0,
    // Academic and transport are tracked separately, matching the
    // two-column collection. Falls back to legacy `components` (single
    // list) if this receipt was generated before the split, so old
    // receipts still render sensibly.
    academicComponents: receipt?.academicComponents?.length
        ? receipt.academicComponents
        : (receipt?.components?.length ? receipt.components : [{ name: 'Tuition Fee', amount: 0 }]),
    academicCollected: receipt?.academicCollected ?? receipt?.amountPaid ?? 0,
    transportComponents: receipt?.transportComponents || [],
    transportCollected: receipt?.transportCollected ?? receipt?.transportPaid ?? 0,
  };

  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Fee Receipt — ${editData.receiptNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    @media print {
      body { margin: 0; }
      .receipt-page { page-break-after: avoid; }
    }
    @page { margin: 10mm; size: A4; }
  </style>
</head>
<body>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px;">
    ${content}
  </div>
</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
      <div className="fixed inset-0 bg-black/60 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-extrabold text-gray-900">Fee Receipt Preview</h2>
            <p className="text-[11px] text-gray-400">Admin copy + Parent copy · Academic + Transport itemized · Side by side · Print-ready</p>
          </div>
          <button onClick={() => setShowConfig(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition">
            <Settings size={13} /> Config
          </button>
          <button onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[12px] font-bold hover:opacity-90 transition"
                  style={{ background: config.headerColor }}>
            <Printer size={13} /> Print Both Copies
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-lg">
              {config.showAdminCopy && (
                  <ReceiptCopy config={config} school={school} data={editData} copyLabel={config.adminCopyLabel} />
              )}
              {config.showParentCopy && (
                  <ReceiptCopy config={config} school={school} data={editData} copyLabel={config.parentCopyLabel} />
              )}
            </div>
            <p className="text-center text-[11px] text-gray-500 mt-3">↑ Live preview · Click "Print Both Copies" to print</p>
          </div>
        </div>

        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            {config.showAdminCopy && (
                <div className="receipt-page">
                  <ReceiptCopy config={config} school={school} data={editData} copyLabel={config.adminCopyLabel} />
                </div>
            )}
            {config.showParentCopy && (
                <div className="receipt-page">
                  <ReceiptCopy config={config} school={school} data={editData} copyLabel={config.parentCopyLabel} />
                </div>
            )}
          </div>
        </div>

        {showConfig && (
            <ConfigPanel
                config={config}
                onClose={() => setShowConfig(false)}
                school={school}
                schoolLoading={schoolLoading}
            />
        )}
      </div>
  );
}
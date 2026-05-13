import React, { useState, useRef } from 'react';
import { Settings, Printer, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Default School Config (change once, applies everywhere) ─────────────────
const DEFAULT_CONFIG = {
  schoolName:    'ABC Public School',
  schoolAddress: '123 Education Lane, New Delhi - 110001',
  schoolPhone:   '+91 98765 43210',
  schoolEmail:   'admin@abcschool.edu.in',
  schoolLogo:    '',          // base64 or URL — leave empty to show initials
  headerColor:   '#2E7D32',   // green header (change to your brand color)
  accentColor:   '#C8E6C9',   // light green rows
  taxLabel:      'GST',
  taxRate:       0,           // set to e.g. 18 for 18% GST, 0 to hide
  currency:      '₹',
  showAdminCopy: true,
  showParentCopy: true,
  adminCopyLabel:  'OFFICE COPY',
  parentCopyLabel: 'STUDENT / PARENT COPY',
  footerNote:    'This is a computer-generated receipt and does not require a signature.',
  showSignatureLine: true,
};

// ─── Config Panel ─────────────────────────────────────────────────────────────
const ConfigPanel = ({ config, onChange, onClose }) => {
  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input type={type} value={config[key]} placeholder={placeholder}
        onChange={(e) => onChange({ ...config, [key]: type === 'number' ? +e.target.value : e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 bg-white" />
    </div>
  );
  const toggle = (label, key) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div onClick={() => onChange({ ...config, [key]: !config[key] })}
        className={`w-10 h-5 rounded-full transition-colors relative ${config[key] ? 'bg-[#2E7D32]' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${config[key] ? 'left-5' : 'left-0.5'}`} />
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-80 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-[#2E7D32]" />
            <h3 className="font-extrabold text-gray-900 text-sm">Receipt Configuration</h3>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X size={13} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">School Info</p>
          {field('School Name', 'schoolName')}
          {field('Address', 'schoolAddress')}
          {field('Phone', 'schoolPhone')}
          {field('Email', 'schoolEmail')}

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Branding</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Header Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.headerColor}
                  onChange={(e) => onChange({ ...config, headerColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                <span className="text-xs text-gray-500 font-mono">{config.headerColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Row Accent</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.accentColor}
                  onChange={(e) => onChange({ ...config, accentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                <span className="text-xs text-gray-500 font-mono">{config.accentColor}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Copies</p>
          {toggle('Show Admin / Office Copy', 'showAdminCopy')}
          {toggle('Show Parent / Student Copy', 'showParentCopy')}
          {field('Admin Copy Label', 'adminCopyLabel')}
          {field('Parent Copy Label', 'parentCopyLabel')}

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Tax & Currency</p>
          {field('Currency Symbol', 'currency')}
          {field('Tax Label', 'taxLabel')}
          {field('Tax Rate (%)', 'taxRate', 'number', '0 = no tax')}

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">Footer</p>
          {field('Footer Note', 'footerNote')}
          {toggle('Show Signature Line', 'showSignatureLine')}
        </div>
      </div>
    </div>
  );
};

// ─── Single Receipt Copy ──────────────────────────────────────────────────────
const ReceiptCopy = ({ config, data, copyLabel }) => {
  const { currency, headerColor, accentColor, taxLabel, taxRate, showSignatureLine, footerNote } = config;
  const subtotal  = data.components.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const taxAmount = taxRate > 0 ? +(subtotal * taxRate / 100).toFixed(2) : 0;
  const total     = subtotal + taxAmount + (parseFloat(data.lateFine) || 0) - (parseFloat(data.discount) || 0);
  const fmt       = (n) => currency + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif', fontSize: '11px', border: '1px solid #ccc', pageBreakInside: 'avoid' }}>

      {/* Copy label strip */}
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd', padding: '3px 10px', fontSize: '9px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>
        {copyLabel}
      </div>

      {/* Header */}
      <div style={{ background: headerColor, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {config.schoolLogo ? (
            <img src={config.schoolLogo} alt="logo" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 13 }}>
              {config.schoolName.split(' ').slice(0, 2).map(w => w[0]).join('')}
            </div>
          )}
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 }}>{config.schoolName}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }}>{config.schoolAddress}</div>
          </div>
        </div>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
          Fee Receipt
        </div>
      </div>

      {/* Student Details + Receipt Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ddd' }}>
        {/* Student block */}
        <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd' }}>
          <div style={{ background: accentColor, fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', padding: '3px 6px', marginBottom: 6, letterSpacing: 0.5 }}>
            Student Details
          </div>
          {[
            ['Adm. No.', data.studentCode],
            ['Name',     data.studentName],
            ['Class',    data.class],
            ['School',   config.schoolName],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
              <span style={{ fontWeight: 'bold', minWidth: 60, color: '#444' }}>{k}:</span>
              <span style={{ color: '#111' }}>{v || '—'}</span>
            </div>
          ))}
        </div>

        {/* Receipt meta block */}
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

      {/* Fee breakdown table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ background: accentColor }}>
            <th style={{ padding: '5px 10px', textAlign: 'left', fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, width: 30 }}>No.</th>
            <th style={{ padding: '5px 10px', textAlign: 'left', fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</th>
            <th style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 'bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.components.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '5px 10px', color: '#555' }}>{String(i + 1).padStart(2, '0')}</td>
              <td style={{ padding: '5px 10px' }}>{c.name || c.componentType || '—'}</td>
              <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmt(c.amount)}</td>
            </tr>
          ))}
          {/* Empty rows to match template look */}
          {Array.from({ length: Math.max(0, 5 - data.components.length) }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '5px 10px', color: '#ccc' }}>{String(data.components.length + i + 1).padStart(2, '0')}</td>
              <td style={{ padding: '5px 10px' }}>&nbsp;</td>
              <td style={{ padding: '5px 10px' }}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '1px solid #ddd', padding: '6px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span style={{ color: '#555' }}>Sub Total:</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {(parseFloat(data.discount) || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#16a34a' }}>
                <span>Discount:</span>
                <span>− {fmt(data.discount)}</span>
              </div>
            )}
            {(parseFloat(data.lateFine) || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#b45309' }}>
                <span>Late Fine:</span>
                <span>+ {fmt(data.lateFine)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#e11d48' }}>
                  <span>{taxLabel} Rate:</span>
                  <span style={{ color: '#e11d48' }}>{taxRate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#e11d48' }}>
                  <span>{taxLabel} Amount:</span>
                  <span>{fmt(taxAmount)}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '2px solid #333', fontWeight: 'bold', fontSize: 12, marginTop: 2 }}>
              <span>TOTAL:</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note / Remarks */}
      <div style={{ borderTop: '1px solid #ddd', padding: '6px 12px' }}>
        <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 3 }}>NOTE / REMINDERS:</div>
        <div style={{ minHeight: 36, border: '1px solid #ddd', padding: '4px 6px', fontSize: 10, color: '#555', background: '#fafafa', borderRadius: 2 }}>
          {data.remarks || ''}
        </div>
      </div>

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

      {/* Footer */}
      <div style={{ background: '#f5f5f5', borderTop: '1px solid #eee', padding: '4px 12px', fontSize: 9, color: '#888', textAlign: 'center' }}>
        {footerNote}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeeReceiptPrint({ receipt, onClose }) {
  const [config,      setConfig]      = useState(DEFAULT_CONFIG);
  const [showConfig,  setShowConfig]  = useState(false);
  const [editData,    setEditData]    = useState(() => ({
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
    components:  receipt?.components?.length
      ? receipt.components
      : [{ name: 'Tuition Fee', amount: 0 }],
  }));
  const [showEdit, setShowEdit] = useState(false);
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

  const updateComponent = (i, field, val) => {
    setEditData((p) => {
      const comps = [...p.components];
      comps[i] = { ...comps[i], [field]: field === 'amount' ? +val : val };
      return { ...p, components: comps };
    });
  };
  const addComponent    = () => setEditData((p) => ({ ...p, components: [...p.components, { name: '', amount: 0 }] }));
  const removeComponent = (i) => setEditData((p) => ({ ...p, components: p.components.filter((_, idx) => idx !== i) }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-extrabold text-gray-900">Fee Receipt Preview</h2>
          <p className="text-[11px] text-gray-400">Admin copy + Parent copy · Side by side · Print-ready</p>
        </div>
        <button onClick={() => setShowEdit((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition">
          {showEdit ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Edit Data
        </button>
        <button onClick={() => setShowConfig(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition">
          <Settings size={13} /> Configure
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

      {/* Edit panel */}
      {showEdit && (
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-6 py-4 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {/* Student fields */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student</p>
              {[['Name', 'studentName'], ['Adm. No.', 'studentCode'], ['Class', 'class'], ['Period', 'period']].map(([lbl, key]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-16 flex-shrink-0">{lbl}</span>
                  <input value={editData[key]} onChange={(e) => setEditData((p) => ({ ...p, [key]: e.target.value }))}
                    className="px-2 py-1 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-green-600 w-40 bg-white" />
                </div>
              ))}
            </div>
            {/* Receipt fields */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Receipt</p>
              {[['Receipt No.', 'receiptNo'], ['Date', 'date'], ['Mode', 'paymentMode'], ['Ref. No.', 'referenceNo'], ['Recorded By', 'recordedBy']].map(([lbl, key]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-20 flex-shrink-0">{lbl}</span>
                  <input value={editData[key]} onChange={(e) => setEditData((p) => ({ ...p, [key]: e.target.value }))}
                    className="px-2 py-1 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-green-600 w-36 bg-white" />
                </div>
              ))}
            </div>
            {/* Adjustments */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adjustments</p>
              {[['Discount', 'discount'], ['Late Fine', 'lateFine'], ['Balance After', 'balanceAfter']].map(([lbl, key]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-24 flex-shrink-0">{lbl}</span>
                  <input type="number" value={editData[key]} onChange={(e) => setEditData((p) => ({ ...p, [key]: +e.target.value }))}
                    className="px-2 py-1 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-green-600 w-28 bg-white" />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-24 flex-shrink-0">Remarks</span>
                <input value={editData.remarks} onChange={(e) => setEditData((p) => ({ ...p, remarks: e.target.value }))}
                  className="px-2 py-1 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-green-600 w-48 bg-white" />
              </div>
            </div>
            {/* Fee components */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fee Components</p>
                <button onClick={addComponent} className="flex items-center gap-1 text-[11px] font-bold text-green-700 hover:text-green-900">
                  <Plus size={11} /> Add
                </button>
              </div>
              {editData.components.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={c.name} onChange={(e) => updateComponent(i, 'name', e.target.value)} placeholder="Description"
                    className="px-2 py-1 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-green-600 w-36 bg-white" />
                  <input type="number" value={c.amount} onChange={(e) => updateComponent(i, 'amount', e.target.value)} placeholder="Amount"
                    className="px-2 py-1 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-green-600 w-24 bg-white" />
                  <button onClick={() => removeComponent(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-gray-200 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Visible preview — side by side */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-lg">
            {config.showAdminCopy && (
              <ReceiptCopy config={config} data={editData} copyLabel={config.adminCopyLabel} />
            )}
            {config.showParentCopy && (
              <ReceiptCopy config={config} data={editData} copyLabel={config.parentCopyLabel} />
            )}
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-3">↑ Live preview · Click "Print Both Copies" to print</p>
        </div>
      </div>

      {/* Hidden print target — renders BOTH copies for jsPDF/window.print */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {config.showAdminCopy && (
            <div className="receipt-page">
              <ReceiptCopy config={config} data={editData} copyLabel={config.adminCopyLabel} />
            </div>
          )}
          {config.showParentCopy && (
            <div className="receipt-page">
              <ReceiptCopy config={config} data={editData} copyLabel={config.parentCopyLabel} />
            </div>
          )}
        </div>
      </div>

      {showConfig && <ConfigPanel config={config} onChange={setConfig} onClose={() => setShowConfig(false)} />}
    </div>
  );
}
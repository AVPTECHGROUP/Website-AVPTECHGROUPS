import { FileText, CreditCard, Ticket, Award, Receipt, IndianRupee } from 'lucide-react'

// Keys must match backend `templateType` enum values used by
// /v1/print-templates (see Constants/Endpoints.js -> PRINT_TEMPLATES).
export const TEMPLATE_TYPES = {
  REPORT_CARD: {
    key: 'REPORT_CARD',
    label: 'Report Card Templates',
    shortLabel: 'Report Card',
    icon: FileText,
    stub: `<div style="font-family:Georgia,serif;padding:24px;border:2px solid #1e3a8a;max-width:600px;margin:auto;">
  <div style="text-align:center;border-bottom:3px double #1e3a8a;padding-bottom:12px;margin-bottom:14px;">
    <h2 style="margin:0;color:#1e3a8a;">{{schoolName}}</h2>
    <div style="font-size:12px;color:#555;">Annual Progress Report &mdash; {{academicYear}}</div>
  </div>
  <table style="width:100%;font-size:13px;margin-bottom:10px;">
    <tr><td><b>Student:</b> {{studentName}}</td><td><b>Class:</b> {{className}}</td></tr>
    <tr><td><b>Roll No:</b> {{rollNo}}</td><td><b>DOB:</b> {{dob}}</td></tr>
  </table>
  <div style="margin-top:12px;font-size:12.5px;"><b>Remarks:</b> {{remarks}}</div>
</div>`,
  },
  ID_CARD: {
    key: 'ID_CARD',
    label: 'ID Card Templates',
    shortLabel: 'ID Card',
    icon: CreditCard,
    stub: `<div style="width:300px;margin:auto;border:2px solid #2563eb;border-radius:10px;padding:14px;font-family:Arial;background:linear-gradient(#fff,#eff6ff);">
  <div style="text-align:center;font-weight:bold;color:#2563eb;font-size:13px;">{{schoolName}}</div>
  <div style="display:flex;gap:10px;margin-top:10px;">
    <div style="width:64px;height:76px;background:#e5e7eb;border-radius:6px;flex-shrink:0;"></div>
    <div style="font-size:11.5px;line-height:1.7;">
      <b>{{studentName}}</b><br>
      Class: {{className}}<br>
      Roll No: {{rollNo}}
    </div>
  </div>
</div>`,
  },
  ADMIT_CARD: {
    key: 'ADMIT_CARD',
    label: 'Admit Card Templates',
    shortLabel: 'Admit Card',
    icon: Ticket,
    stub: `<div style="font-family:Arial;padding:20px;max-width:600px;margin:auto;border:1px solid #ddd;">
  <h3 style="text-align:center;color:#111827;margin-top:0;">Examination Admit Card</h3>
  <table style="width:100%;font-size:12.5px;margin-bottom:12px;">
    <tr><td><b>Student:</b> {{studentName}}</td><td><b>Roll No:</b> {{rollNo}}</td></tr>
    <tr><td><b>Class:</b> {{className}}</td><td><b>Center:</b> {{examCenter}}</td></tr>
  </table>
</div>`,
  },
  CERTIFICATE: {
    key: 'CERTIFICATE',
    label: 'Certificate Templates',
    shortLabel: 'Certificate',
    icon: Award,
    stub: `<div style="font-family:Georgia,serif;padding:30px;border:4px solid #f59e0b;max-width:640px;margin:auto;text-align:center;background:#fffbeb;">
  <div style="font-size:11px;letter-spacing:3px;color:#b45309;">CERTIFICATE</div>
  <h2 style="margin:10px 0;color:#111827;">{{studentName}}</h2>
  <p style="font-size:13px;color:#444;">has been awarded this certificate for {{reason}}</p>
  <div style="margin-top:24px;font-size:11px;">Date: {{issueDate}}</div>
</div>`,
  },
  FEE_RECEIPT: {
    key: 'FEE_RECEIPT',
    label: 'Fee Receipt Templates',
    shortLabel: 'Fee Receipt',
    icon: IndianRupee,
    stub: `<div style="font-family:Arial;padding:20px;max-width:600px;margin:auto;border:1px solid #ddd;">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #16a34a;padding-bottom:10px;">
    <h3 style="margin:0;color:#16a34a;">Fee Payment Receipt</h3>
    <div style="font-size:11.5px;">Receipt No: {{receiptNo}}</div>
  </div>
  <table style="width:100%;font-size:12.5px;margin:10px 0;">
    <tr><td><b>Student:</b> {{studentName}}</td><td><b>Class:</b> {{className}}</td></tr>
    <tr><td><b>Date:</b> {{paymentDate}}</td><td><b>Amount:</b> {{amount}}</td></tr>
  </table>
</div>`,
  },
}

export const defaultHtmlStub = (typeKey) => {
  const t = TEMPLATE_TYPES[typeKey]
  return t?.stub || `<div style="font-family:Arial;padding:20px;text-align:center;">
  <h3>New ${t?.shortLabel || 'Template'}</h3>
  <p>Start building your template markup here. Use {{mergeFields}} for dynamic data.</p>
</div>`
}

export const fmtDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

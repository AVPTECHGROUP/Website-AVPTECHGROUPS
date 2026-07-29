import { FileText, CreditCard, Ticket, Award, Receipt, IndianRupee } from 'lucide-react'

// Keys must match backend `templateType` enum values used by
// /v1/print-templates (see Constants/Endpoints.js -> PRINT_TEMPLATES).
export const TEMPLATE_TYPES = {
  REPORT_CARD: {
    key: 'REPORT_CARD',
    label: 'Report Card Templates',
    shortLabel: 'Report Card',
    icon: FileText,
    stub: `<div class="rc-premium">
<style>
  .rc-premium { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e0e7ff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(79,70,229,0.14); background: #ffffff; color: #1f2937; }
  .rc-premium .rc-accent-top { height: 6px; width: 100%; background: linear-gradient(90deg,#6366f1,#3b82f6,#06b6d4); }
  .rc-premium .rc-header { position: relative; overflow: hidden; text-align: center; padding: 26px 24px 22px; background: linear-gradient(135deg,#eef2ff 0%,#f0f9ff 55%,#faf5ff 100%); }
  .rc-premium .rc-blob-a { position: absolute; top: -30px; right: -30px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle,#818cf8,transparent 70%); opacity: .35; filter: blur(2px); }
  .rc-premium .rc-blob-b { position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle,#38bdf8,transparent 70%); opacity: .3; filter: blur(2px); }
  .rc-premium .rc-logo { position: relative; width: 62px; height: 62px; margin: 0 auto 12px; border-radius: 18px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#6366f1,#3b82f6); color: #fff; font-weight: 800; font-size: 19px; letter-spacing: .5px; box-shadow: 0 10px 22px rgba(99,102,241,.35); border: 2px solid #ffffff; }
  .rc-premium .rc-school-name { position: relative; margin: 0; font-size: 23px; font-weight: 800; color: #111827; letter-spacing: -.2px; }
  .rc-premium .rc-school-meta { position: relative; margin: 4px 0 0; font-size: 11.5px; color: #6b7280; }
  .rc-premium .rc-exam-badge { position: relative; display: inline-flex; align-items: center; gap: 7px; margin-top: 14px; padding: 7px 18px; border-radius: 999px; font-size: 12.5px; font-weight: 700; color: #fff; background: linear-gradient(90deg,#6366f1,#3b82f6); box-shadow: 0 6px 16px rgba(59,130,246,.35); }

  .rc-premium .rc-section { padding: 18px 22px; }
  .rc-premium .rc-section-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #4f46e5; margin: 0 0 12px; }
  .rc-premium .rc-section-title .rc-bar { width: 5px; height: 15px; border-radius: 3px; background: #6366f1; display: inline-block; }

  .rc-premium .rc-info-box { border: 1px solid #eef0f4; border-radius: 14px; overflow: hidden; }
  .rc-premium .rc-info-row td { padding: 10px 14px; font-size: 12.5px; border-bottom: 1px solid #f1f2f6; }
  .rc-premium .rc-info-row:last-child td { border-bottom: none; }
  .rc-premium .rc-info-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #818cf8; margin-bottom: 2px; }
  .rc-premium .rc-info-value { font-weight: 700; color: #111827; }

  .rc-premium table.rc-subjects { width: 100%; border-collapse: collapse; font-size: 12px; }
  .rc-premium table.rc-subjects thead th { background: linear-gradient(90deg,#4f46e5,#3b82f6); color: #fff; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; padding: 10px 8px; text-align: center; }
  .rc-premium table.rc-subjects thead th:first-child { text-align: left; padding-left: 14px; }
  .rc-premium table.rc-subjects tbody td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #f1f2f6; color: #374151; }
  .rc-premium table.rc-subjects tbody td:first-child { text-align: left; padding-left: 14px; font-weight: 700; color: #111827; }
  .rc-premium table.rc-subjects tbody tr:nth-child(even) { background: #f8f9ff; }
  .rc-premium .rc-max-cell { color: #9ca3af; }
  .rc-premium .rc-remarks-cell { color: #9ca3af; font-style: italic; max-width: 110px; white-space: normal; word-break: break-word; }

  .rc-premium .rc-bar-track { display: inline-block; width: 48px; height: 6px; border-radius: 999px; background: #e5e7eb; overflow: hidden; vertical-align: middle; margin-right: 6px; }
  .rc-premium .rc-bar-fill { display: block; height: 100%; border-radius: 999px; background: #a1a1aa; }
  .rc-premium .rc-bar-fill[data-grade="A+"], .rc-premium .rc-bar-fill[data-grade="A"] { background: #22c55e; }
  .rc-premium .rc-bar-fill[data-grade="B+"], .rc-premium .rc-bar-fill[data-grade="B"] { background: #3b82f6; }
  .rc-premium .rc-bar-fill[data-grade="C"] { background: #8b5cf6; }
  .rc-premium .rc-bar-fill[data-grade="D"] { background: #f97316; }
  .rc-premium .rc-bar-fill[data-grade="F"] { background: #ef4444; }
  .rc-premium .rc-bar-fill[data-grade="AB"] { background: #9ca3af; }

  .rc-premium .rc-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid transparent; }
  .rc-premium .rc-grade-pill[data-grade="A+"], .rc-premium .rc-grade-pill[data-grade="A"] { background: #ecfdf5; color: #15803d; border-color: #86efac; }
  .rc-premium .rc-grade-pill[data-grade="B+"], .rc-premium .rc-grade-pill[data-grade="B"] { background: #eff6ff; color: #1d4ed8; border-color: #93c5fd; }
  .rc-premium .rc-grade-pill[data-grade="C"] { background: #f5f3ff; color: #6d28d9; border-color: #c4b5fd; }
  .rc-premium .rc-grade-pill[data-grade="D"] { background: #fff7ed; color: #c2410c; border-color: #fdba74; }
  .rc-premium .rc-grade-pill[data-grade="F"] { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
  .rc-premium .rc-grade-pill[data-grade="AB"] { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }

  .rc-premium .rc-status-pill[data-status="Pass"] { background: #ecfdf5; color: #15803d; border-color: #86efac; }
  .rc-premium .rc-status-pill[data-status="Fail"] { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
  .rc-premium .rc-status-pill[data-status="Absent"] { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }

  .rc-premium .rc-summary { display: flex; gap: 10px; padding: 4px 22px 18px; flex-wrap: wrap; }
  .rc-premium .rc-summary-card { flex: 1 1 130px; text-align: center; border-radius: 14px; padding: 12px 10px; border: 2px solid #e0e7ff; background: linear-gradient(135deg,#eef2ff,#eff6ff); }
  .rc-premium .rc-summary-label { font-size: 9.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #6366f1; margin-bottom: 4px; }
  .rc-premium .rc-summary-value { font-size: 19px; font-weight: 800; color: #111827; }
  .rc-premium .rc-summary-value .rc-sub { font-size: 11px; font-weight: 600; color: #9ca3af; }
  .rc-premium .rc-summary-card.rc-blue { border-color: #bfdbfe; background: linear-gradient(135deg,#eff6ff,#f0f9ff); }
  .rc-premium .rc-summary-card.rc-amber { border-color: #fde68a; background: linear-gradient(135deg,#fffbeb,#fef9c3); }
  .rc-premium .rc-summary-card.rc-grade-card[data-grade="A+"], .rc-premium .rc-summary-card.rc-grade-card[data-grade="A"] { border-color: #86efac; background: linear-gradient(135deg,#ecfdf5,#f0fdf4); }
  .rc-premium .rc-summary-card.rc-grade-card[data-grade="B+"], .rc-premium .rc-summary-card.rc-grade-card[data-grade="B"] { border-color: #93c5fd; background: linear-gradient(135deg,#eff6ff,#f0f9ff); }
  .rc-premium .rc-summary-card.rc-grade-card[data-grade="C"] { border-color: #c4b5fd; background: linear-gradient(135deg,#f5f3ff,#faf5ff); }
  .rc-premium .rc-summary-card.rc-grade-card[data-grade="D"], .rc-premium .rc-summary-card.rc-grade-card[data-grade="F"] { border-color: #fca5a5; background: linear-gradient(135deg,#fef2f2,#fff1f2); }

  .rc-premium .rc-result-banner { margin: 0 22px 20px; padding: 12px; text-align: center; font-weight: 800; font-size: 13px; border-radius: 12px; border: 2px solid #d1d5db; color: #4b5563; background: #f9fafb; }
  .rc-premium .rc-result-banner[data-result="PASSED"] { border-color: #86efac; color: #15803d; background: linear-gradient(90deg,#ecfdf5,#f0fdf4,#ecfdf5); }
  .rc-premium .rc-result-banner[data-result="FAILED"] { border-color: #fca5a5; color: #b91c1c; background: linear-gradient(90deg,#fef2f2,#fff1f2,#fef2f2); }

  .rc-premium .rc-footer { text-align: center; font-size: 10px; color: #b0b4bd; padding: 0 22px 18px; }
</style>

  <div class="rc-accent-top"></div>

  <!-- ══ School Header ══ -->
  <div class="rc-header">
    <div class="rc-blob-a"></div>
    <div class="rc-blob-b"></div>
    <div class="rc-logo">{{schoolInitials}}</div>
    <h1 class="rc-school-name">{{schoolName}}</h1>
    <p class="rc-school-meta">{{schoolAddress}}</p>
    <div class="rc-exam-badge">★&nbsp; {{examTypeName}} — {{examName}} — {{className}} Report Card &nbsp;★</div>
  </div>

  <!-- ══ Student Information ══ -->
  <div class="rc-section">
    <div class="rc-section-title"><span class="rc-bar"></span> Student Information</div>
    <div class="rc-info-box">
      <table style="width:100%;border-collapse:collapse;">
        <tr class="rc-info-row">
          <td style="width:50%;"><span class="rc-info-label">Student Name</span><span class="rc-info-value">{{studentName}}</span></td>
          <td><span class="rc-info-label">Section</span><span class="rc-info-value">{{sectionName}}</span></td>
        </tr>
        <tr class="rc-info-row">
          <td><span class="rc-info-label">Admission No.</span><span class="rc-info-value">{{admissionNumber}}</span></td>
          <td><span class="rc-info-label">Roll No.</span><span class="rc-info-value">{{rollNo}}</span></td>
        </tr>
        <tr class="rc-info-row">
          <td><span class="rc-info-label">Class</span><span class="rc-info-value">{{className}}</span></td>
          <td><span class="rc-info-label">Exam</span><span class="rc-info-value">{{examTypeName}}</span></td>
        </tr>
      </table>
    </div>
  </div>

  <!-- ══ Subject-wise Marks ══ -->
  <!-- {{#subjectMarks}}...{{/subjectMarks}} repeats this row once per
       subject returned by the report card API — add/remove subjects on
       the backend and this table updates automatically, no template
       edit needed. -->
  <div class="rc-section" style="padding-top:0;">
    <div class="rc-section-title"><span class="rc-bar"></span> Subject-wise Marks</div>
    <div style="overflow-x:auto;border-radius:12px;border:1px solid #f1f2f6;">
      <table class="rc-subjects">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Max</th>
            <th>Theory</th>
            <th>Practical</th>
            <th>Total</th>
            <th>%</th>
            <th>Grade</th>
            <th>Remarks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {{#subjectMarks}}
          <tr>
            <td>{{subjectName}}</td>
            <td class="rc-max-cell">{{maxMarks}}</td>
            <td>{{theoryMarks}}</td>
            <td>{{practicalMarks}}</td>
            <td style="font-weight:800;color:#111827;">{{totalMarks}}</td>
            <td>
              <span class="rc-bar-track"><span class="rc-bar-fill" data-grade="{{grade}}" style="width:{{percentage}}%;"></span></span>{{percentage}}%
            </td>
            <td><span class="rc-pill rc-grade-pill" data-grade="{{grade}}">{{grade}}</span></td>
            <td class="rc-remarks-cell">{{remarks}}</td>
            <td><span class="rc-pill rc-status-pill" data-status="{{status}}">{{status}}</span></td>
          </tr>
          {{/subjectMarks}}
        </tbody>
      </table>
    </div>
  </div>

  <!-- ══ Summary Cards ══ -->
  <div class="rc-summary">
    <div class="rc-summary-card">
      <div class="rc-summary-label">Total Marks</div>
      <div class="rc-summary-value">{{totalMarksObtained}} <span class="rc-sub">/ {{totalMaxMarks}}</span></div>
    </div>
    <div class="rc-summary-card rc-blue">
      <div class="rc-summary-label">Percentage</div>
      <div class="rc-summary-value">{{percentage}}%</div>
    </div>
    <div class="rc-summary-card rc-grade-card" data-grade="{{overallGrade}}">
      <div class="rc-summary-label">Grade</div>
      <div class="rc-summary-value">{{overallGrade}}</div>
    </div>
    <div class="rc-summary-card rc-amber">
      <div class="rc-summary-label">Class Rank</div>
      <div class="rc-summary-value">🏅 {{classRank}}</div>
    </div>
  </div>

  <!-- ══ Result Banner ══ -->
  <div class="rc-result-banner" data-result="{{resultStatus}}">
    {{resultStatus}} — Section Rank {{sectionRank}}
  </div>

  <!-- Do NOT add a remarks or signature section here — the report card
       screen already renders Teacher/Principal remarks (editable) and
       signature lines below whatever template is used. Adding them
       here would duplicate that section. -->

  <div class="rc-footer">{{schoolName}} &middot; {{schoolBoard}} &middot; Generated on {{generatedAt}}</div>

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
import {
  FileText, CreditCard, Ticket, Award, Receipt, IndianRupee,
  FileOutput, ShieldCheck, ArrowRightLeft, ClipboardCheck,
} from 'lucide-react'

// Keys must match backend `templateType` enum values used by
// /v1/print-templates (see Constants/Endpoints.js -> PRINT_TEMPLATES).
//
// NOTE: TRANSFER_CERTIFICATE, CHARACTER_CERTIFICATE, MIGRATION_CERTIFICATE
// and ELIGIBILITY_CERTIFICATE are NEW keys — the backend `templateType`
// enum + validation on POST/PUT /v1/print-templates must be updated to
// accept these 4 values, same as it already accepts CERTIFICATE.
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

  // ─────────────────────────────────────────────────────────────────────
  // Certificate family — all 5 of these live under one sidebar entry
  // ("Certificate Templates") and are switched via a dropdown on the
  // CertificateTemplates.jsx page. See CERTIFICATE_SUB_TYPES below.
  // ─────────────────────────────────────────────────────────────────────
  CERTIFICATE: {
    key: 'CERTIFICATE',
    label: 'Certificate Templates',
    shortLabel: 'Common Certificate',
    icon: Award,
    stub: `<div style="font-family:Georgia,serif;padding:30px;border:4px solid #f59e0b;max-width:640px;margin:auto;text-align:center;background:#fffbeb;">
  <div style="font-size:11px;letter-spacing:3px;color:#b45309;">CERTIFICATE</div>
  <h2 style="margin:10px 0;color:#111827;">{{studentName}}</h2>
  <p style="font-size:13px;color:#444;">has been awarded this certificate for {{reason}}</p>
  <div style="margin-top:24px;font-size:11px;">Date: {{issueDate}}</div>
</div>`,
  },
  TRANSFER_CERTIFICATE: {
    key: 'TRANSFER_CERTIFICATE',
    label: 'Transfer Certificate Templates',
    shortLabel: 'Transfer Certificate (TC)',
    icon: FileOutput,
    stub: `<div style="font-family:Georgia,serif;max-width:650px;margin:auto;border:2px solid #1e3a8a;background:#fff;">
  <div style="background:#1e3a8a;color:#fff;text-align:center;padding:16px;">
    <div style="font-size:11px;letter-spacing:2px;opacity:.85;">SCHOOL LEAVING / TRANSFER CERTIFICATE</div>
    <h2 style="margin:6px 0 0;font-size:18px;">{{schoolName}}</h2>
    <div style="font-size:11px;opacity:.8;margin-top:2px;">{{schoolAddress}}</div>
  </div>
  <div style="padding:20px 24px;">
    <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
      <tr><td style="padding:6px 0;width:55%;"><b>TC No.</b></td><td>{{tcNumber}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Admission No.</b></td><td>{{admissionNumber}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Student Name</b></td><td>{{studentName}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Father's / Mother's Name</b></td><td>{{parentName}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Nationality</b></td><td>{{nationality}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Date of Birth</b></td><td>{{dateOfBirth}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Class admitted in</b></td><td>{{admissionClass}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Class currently studying in</b></td><td>{{className}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Qualified for promotion to</b></td><td>{{promotedToClass}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Date of Leaving</b></td><td>{{leavingDate}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Reason for Leaving</b></td><td>{{leavingReason}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Conduct</b></td><td>{{conduct}}</td></tr>
    </table>
    <div style="margin-top:26px;display:flex;justify-content:space-between;font-size:11.5px;">
      <div>Date of Issue: {{issueDate}}</div>
      <div>Principal Signature</div>
    </div>
  </div>
</div>`,
  },
  CHARACTER_CERTIFICATE: {
    key: 'CHARACTER_CERTIFICATE',
    label: 'Character Certificate Templates',
    shortLabel: 'Character Certificate',
    icon: ShieldCheck,
    stub: `<div style="font-family:Georgia,serif;padding:30px;border:4px solid #16a34a;max-width:640px;margin:auto;text-align:center;background:#f0fdf4;">
  <div style="font-size:11px;letter-spacing:3px;color:#166534;">CHARACTER CERTIFICATE</div>
  <h2 style="margin:10px 0;color:#111827;">{{studentName}}</h2>
  <p style="font-size:12.5px;color:#444;line-height:1.7;">
    S/o &amp; D/o {{parentName}}, was a student of {{className}} in {{schoolName}} during the academic
    session {{academicSession}}. His/her conduct and character during this period, to the best of our
    knowledge, have been {{conductRemarks}}.
  </p>
  <div style="margin-top:26px;font-size:11px;display:flex;justify-content:space-between;text-align:left;">
    <div>Date: {{issueDate}}</div>
    <div>Principal Signature</div>
  </div>
</div>`,
  },
  MIGRATION_CERTIFICATE: {
    key: 'MIGRATION_CERTIFICATE',
    label: 'Migration Certificate Templates',
    shortLabel: 'Migration Certificate',
    icon: ArrowRightLeft,
    stub: `<div style="font-family:Georgia,serif;max-width:650px;margin:auto;border:2px solid #7c3aed;background:#fff;">
  <div style="background:#7c3aed;color:#fff;text-align:center;padding:16px;">
    <div style="font-size:11px;letter-spacing:2px;opacity:.85;">MIGRATION CERTIFICATE</div>
    <h2 style="margin:6px 0 0;font-size:18px;">{{schoolName}}</h2>
    <div style="font-size:11px;opacity:.8;margin-top:2px;">{{schoolBoard}} · {{schoolAddress}}</div>
  </div>
  <div style="padding:20px 24px;">
    <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
      <tr><td style="padding:6px 0;width:55%;"><b>Migration No.</b></td><td>{{migrationNumber}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Student Name</b></td><td>{{studentName}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Father's / Mother's Name</b></td><td>{{parentName}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Roll No.</b></td><td>{{rollNo}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Examination Passed</b></td><td>{{examName}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Year of Passing</b></td><td>{{passingYear}}</td></tr>
      <tr><td style="padding:6px 0;"><b>Eligible to join</b></td><td>{{eligibleFor}}</td></tr>
    </table>
    <p style="font-size:11.5px;color:#555;margin-top:16px;">
      This is to certify that the above-named student is eligible to migrate to another recognized institution/board.
    </p>
    <div style="margin-top:22px;display:flex;justify-content:space-between;font-size:11.5px;">
      <div>Date of Issue: {{issueDate}}</div>
      <div>Principal Signature</div>
    </div>
  </div>
</div>`,
  },
  ELIGIBILITY_CERTIFICATE: {
    key: 'ELIGIBILITY_CERTIFICATE',
    label: 'Eligibility / Provisional Certificate Templates',
    shortLabel: 'Eligibility Certificate',
    icon: ClipboardCheck,
    // This is the "admission requirement" doc — e.g. a student who passed
    // Class 10 and wants admission to Class 11 while original marksheet is
    // still pending. {{requiredDocumentsNote}} is where the admin types the
    // specific pending-document text for that case (e.g. "Original Class
    // 10 marksheet to be submitted within 15 days of admission.").
    stub: `<div style="font-family:Georgia,serif;max-width:650px;margin:auto;border:2px solid #b45309;background:#fff;">
  <div style="background:#b45309;color:#fff;text-align:center;padding:16px;">
    <div style="font-size:11px;letter-spacing:2px;opacity:.85;">PROVISIONAL ELIGIBILITY CERTIFICATE</div>
    <h2 style="margin:6px 0 0;font-size:18px;">{{schoolName}}</h2>
    <div style="font-size:11px;opacity:.8;margin-top:2px;">{{schoolAddress}}</div>
  </div>
  <div style="padding:20px 24px;">
    <p style="font-size:12.5px;line-height:1.8;color:#333;">
      This is to certify that <b>{{studentName}}</b>, S/o &amp; D/o {{parentName}}, has passed the
      <b>{{examName}}</b> examination held in {{passingYear}} from {{schoolName}}, securing
      <b>{{percentage}}%</b> marks, and is provisionally eligible for admission to
      <b>{{nextClassName}}</b>.
    </p>
    <div style="background:#fffbeb;border:1px dashed #f59e0b;border-radius:8px;padding:10px 14px;font-size:11.5px;color:#92400e;margin-top:14px;">
      <b>Note:</b> {{requiredDocumentsNote}}
    </div>
    <div style="margin-top:24px;display:flex;justify-content:space-between;font-size:11.5px;">
      <div>Date of Issue: {{issueDate}}</div>
      <div>Principal Signature</div>
    </div>
  </div>
</div>`,
  },

  FEE_RECEIPT: {
    key: 'FEE_RECEIPT',
    label: 'Fee Receipt Templates',
    shortLabel: 'Fee Receipt',
    icon: IndianRupee,
    // Fully data-driven, same pattern as REPORT_CARD above — every value
    // below is a {{mergeField}} resolved from the actual collect-fee API
    // response via buildFeeReceiptMergeData() in Templateengine.js. Prints
    // TWO copies side by side (Office + Student/Parent) from a SINGLE
    // render pass, since renderTemplate() only runs once per print — the
    // copy label text ("OFFICE COPY" / "STUDENT / PARENT COPY") is the
    // only thing hardcoded per block, everything else comes from data.
    //
    // Repeating section: {{#components}}...{{/components}} — one row per
    // fee component returned by the API (components[]).
    //
    // Conditional blocks (engine has no {{#if}}, so these are arrays with
    // 0 or 1 item — present only when the relevant amount/value is set):
    //   {{#transportRows}}  → shown only if transportAmount > 0
    //   {{#discountRows}}   → shown only if discount > 0
    //   {{#lateFineRows}}   → shown only if lateFine > 0
    //   {{#referenceRows}}  → shown only if referenceNo is present
    //   {{#remarksRows}}    → shown only if remarks is present
    stub: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Fee Receipt</title></head>
<body style="margin:0;padding:14px;background:#eef2f7;">
<div class="fr2-wrap">
<style>
  .fr2-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 980px; margin: 0 auto; }
  .fr2-copy { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 26px rgba(15,23,42,0.10); color: #1f2937; border: 1px solid #e5e7eb; page-break-inside: avoid; }

  .fr2-copy-tag { text-align: right; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; padding: 4px 12px; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; }

  .fr2-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: linear-gradient(135deg,#1e3a8a,#2563eb); color: #fff; padding: 12px 14px; }
  .fr2-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .fr2-logo { width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,.22); flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; font-weight: 800; font-size: 13px; border: 1.5px solid rgba(255,255,255,.55); }
  .fr2-logo img { width: 100%; height: 100%; object-fit: cover; }
  .fr2-school-name { margin: 0; font-size: 13.5px; font-weight: 800; letter-spacing: -.1px; }
  .fr2-school-meta { margin: 1px 0 0; font-size: 9px; opacity: .88; line-height: 1.5; }
  .fr2-badge { flex-shrink: 0; font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }

  .fr2-info-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #e5e7eb; }
  .fr2-info-col { padding: 10px 12px; }
  .fr2-info-col:first-child { border-right: 1px solid #e5e7eb; }
  .fr2-info-title { background: #dbeafe; color: #1e3a8a; font-weight: 800; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; padding: 3px 7px; border-radius: 4px; margin-bottom: 6px; display: inline-block; }
  .fr2-kv-row { display: flex; gap: 6px; font-size: 10.5px; margin-bottom: 3px; }
  .fr2-kv-row .fr2-k { font-weight: 700; min-width: 62px; color: #4b5563; flex-shrink: 0; }
  .fr2-kv-row .fr2-v { color: #111827; }

  .fr2-table-title { background: #dbeafe; padding: 4px 10px; font-weight: 800; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: #1e3a8a; }
  .fr2-table-title.fr2-transport { background: #fef3c7; color: #92400e; }
  table.fr2-items { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  table.fr2-items td { padding: 4px 12px; border-bottom: 1px solid #f1f2f6; }
  table.fr2-items td:last-child { text-align: right; }

  .fr2-summary-box { padding: 2px 12px 8px; }
  .fr2-summary-row { display: flex; justify-content: flex-end; padding: 2px 0; font-size: 10.5px; }
  .fr2-summary-row .fr2-sum-inner { min-width: 220px; display: flex; justify-content: space-between; }
  .fr2-summary-row.fr2-discount .fr2-sum-inner { color: #16a34a; }
  .fr2-summary-row.fr2-latefine .fr2-sum-inner { color: #b45309; }
  .fr2-summary-row.fr2-collected .fr2-sum-inner { font-weight: 800; }

  .fr2-grand-total { border-top: 2px solid #111827; padding: 8px 14px; }
  .fr2-grand-total-inner { display: flex; justify-content: space-between; font-weight: 800; font-size: 13px; }

  .fr2-remarks { border-top: 1px solid #e5e7eb; padding: 8px 12px; }
  .fr2-remarks-title { font-weight: 800; font-size: 9.5px; margin-bottom: 3px; color: #374151; }
  .fr2-remarks-box { border: 1px solid #e5e7eb; background: #fafafa; border-radius: 4px; padding: 5px 7px; font-size: 10px; color: #4b5563; }

  .fr2-footer { border-top: 1px solid #e5e7eb; padding: 10px 12px; display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; }
  .fr2-footer-left { font-size: 10px; color: #4b5563; line-height: 1.8; }
  .fr2-footer-left b { color: #111827; }
  .fr2-sign { text-align: center; font-size: 9.5px; color: #4b5563; }
  .fr2-sign-line { border-top: 1px solid #4b5563; padding-top: 3px; width: 110px; }

  .fr2-note { text-align: center; font-size: 8.5px; color: #9ca3af; background: #fafafa; border-top: 1px solid #f1f2f6; padding: 6px 12px; }

  @media print {
    body { background: #fff; padding: 0; }
    .fr2-wrap { max-width: 100%; gap: 8mm; }
    .fr2-copy { box-shadow: none; border: 1px solid #ccc; }
  }
</style>

  <!-- ══════════════ COPY 1 — OFFICE COPY ══════════════ -->
  <div class="fr2-copy">
    <div class="fr2-copy-tag">Office Copy</div>
    <div class="fr2-header">
      <div class="fr2-header-left">
        <div class="fr2-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.src='{{schoolLogoFallback}}'"></div>
        <div>
          <h1 class="fr2-school-name">{{schoolName}}</h1>
          <div class="fr2-school-meta">{{schoolAddress}}</div>
          <div class="fr2-school-meta">{{schoolPhone}} &middot; {{schoolEmail}}</div>
        </div>
      </div>
      <div class="fr2-badge">Fee Receipt</div>
    </div>

    <div class="fr2-info-grid">
      <div class="fr2-info-col">
        <span class="fr2-info-title">Student Details</span>
        <div class="fr2-kv-row"><span class="fr2-k">Admission No.</span><span class="fr2-v">{{admissionNumber}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Roll No.</span><span class="fr2-v">{{rollNo}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Name</span><span class="fr2-v">{{studentName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Class</span><span class="fr2-v">{{className}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Section</span><span class="fr2-v">{{sectionName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Parent</span><span class="fr2-v">{{parentName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Mobile</span><span class="fr2-v">{{parentMobile}}</span></div>
      </div>
      <div class="fr2-info-col">
        <span class="fr2-info-title">Receipt Info</span>
        <div class="fr2-kv-row"><span class="fr2-k">Receipt No.</span><span class="fr2-v">{{receiptNo}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">School</span><span class="fr2-v">{{schoolName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Fee Period</span><span class="fr2-v">{{feePeriodName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Date</span><span class="fr2-v">{{paymentDateLine}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Mode</span><span class="fr2-v">{{paymentMode}}</span></div>
        {{#referenceRows}}
        <div class="fr2-kv-row"><span class="fr2-k">{{referenceLabel}}</span><span class="fr2-v">{{referenceNo}}</span></div>
        {{/referenceRows}}
      </div>
    </div>

    <div class="fr2-table-title">Fee Details</div>
    <table class="fr2-items">
      {{#components}}
      <tr><td>{{label}}</td><td>{{amountFormatted}}</td></tr>
      {{/components}}
    </table>
    <div class="fr2-summary-box">
      {{#discountRows}}
      <div class="fr2-summary-row fr2-discount"><div class="fr2-sum-inner"><span>Discount{{discountReasonSuffix}}</span><span>&minus; {{discountFormatted}}</span></div></div>
      {{/discountRows}}
      {{#lateFineRows}}
      <div class="fr2-summary-row fr2-latefine"><div class="fr2-sum-inner"><span>Late Fine</span><span>+ {{lateFineFormatted}}</span></div></div>
      {{/lateFineRows}}
    </div>

    {{#transportRows}}
    <div class="fr2-table-title fr2-transport">Transport Fee</div>
    <table class="fr2-items">
      <tr><td>Transport Fee</td><td>{{transportAmountFormatted}}</td></tr>
    </table>
    {{/transportRows}}

    <div class="fr2-grand-total">
      <div class="fr2-grand-total-inner"><span>Total Amount Collected</span><span>{{amountPaidFormatted}}</span></div>
    </div>

    {{#remarksRows}}
    <div class="fr2-remarks">
      <div class="fr2-remarks-title">Note / Remarks</div>
      <div class="fr2-remarks-box">{{remarks}}</div>
    </div>
    {{/remarksRows}}

    <div class="fr2-footer">
      <div class="fr2-footer-left">
        Recorded by: <b>{{collectedBy}}</b><br>
        Remaining Balance: <b>{{balanceAfterFormatted}}</b>
      </div>
      <div class="fr2-sign"><div class="fr2-sign-line">Authorised Signature</div></div>
    </div>
    <div class="fr2-note">This is a computer-generated receipt and does not require a signature.</div>
  </div>

  <!-- ══════════════ COPY 2 — STUDENT / PARENT COPY ══════════════ -->
  <div class="fr2-copy">
    <div class="fr2-copy-tag">Student / Parent Copy</div>
    <div class="fr2-header">
      <div class="fr2-header-left">
        <div class="fr2-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.src='{{schoolLogoFallback}}'"></div>
        <div>
          <h1 class="fr2-school-name">{{schoolName}}</h1>
          <div class="fr2-school-meta">{{schoolAddress}}</div>
          <div class="fr2-school-meta">{{schoolPhone}} &middot; {{schoolEmail}}</div>
        </div>
      </div>
      <div class="fr2-badge">Fee Receipt</div>
    </div>

    <div class="fr2-info-grid">
      <div class="fr2-info-col">
        <span class="fr2-info-title">Student Details</span>
        <div class="fr2-kv-row"><span class="fr2-k">Admission No.</span><span class="fr2-v">{{admissionNumber}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Roll No.</span><span class="fr2-v">{{rollNo}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Name</span><span class="fr2-v">{{studentName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Class</span><span class="fr2-v">{{className}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Section</span><span class="fr2-v">{{sectionName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Parent</span><span class="fr2-v">{{parentName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Mobile</span><span class="fr2-v">{{parentMobile}}</span></div>
      </div>
      <div class="fr2-info-col">
        <span class="fr2-info-title">Receipt Info</span>
        <div class="fr2-kv-row"><span class="fr2-k">Receipt No.</span><span class="fr2-v">{{receiptNo}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">School</span><span class="fr2-v">{{schoolName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Fee Period</span><span class="fr2-v">{{feePeriodName}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Date</span><span class="fr2-v">{{paymentDateLine}}</span></div>
        <div class="fr2-kv-row"><span class="fr2-k">Mode</span><span class="fr2-v">{{paymentMode}}</span></div>
        {{#referenceRows}}
        <div class="fr2-kv-row"><span class="fr2-k">{{referenceLabel}}</span><span class="fr2-v">{{referenceNo}}</span></div>
        {{/referenceRows}}
      </div>
    </div>

    <div class="fr2-table-title">Fee Details</div>
    <table class="fr2-items">
      {{#components}}
      <tr><td>{{label}}</td><td>{{amountFormatted}}</td></tr>
      {{/components}}
    </table>
    <div class="fr2-summary-box">
      {{#discountRows}}
      <div class="fr2-summary-row fr2-discount"><div class="fr2-sum-inner"><span>Discount{{discountReasonSuffix}}</span><span>&minus; {{discountFormatted}}</span></div></div>
      {{/discountRows}}
      {{#lateFineRows}}
      <div class="fr2-summary-row fr2-latefine"><div class="fr2-sum-inner"><span>Late Fine</span><span>+ {{lateFineFormatted}}</span></div></div>
      {{/lateFineRows}}
    </div>

    {{#transportRows}}
    <div class="fr2-table-title fr2-transport">Transport Fee</div>
    <table class="fr2-items">
      <tr><td>Transport Fee</td><td>{{transportAmountFormatted}}</td></tr>
    </table>
    {{/transportRows}}

    <div class="fr2-grand-total">
      <div class="fr2-grand-total-inner"><span>Total Amount Collected</span><span>{{amountPaidFormatted}}</span></div>
    </div>

    {{#remarksRows}}
    <div class="fr2-remarks">
      <div class="fr2-remarks-title">Note / Remarks</div>
      <div class="fr2-remarks-box">{{remarks}}</div>
    </div>
    {{/remarksRows}}

    <div class="fr2-footer">
      <div class="fr2-footer-left">
        Recorded by: <b>{{collectedBy}}</b><br>
        Remaining Balance: <b>{{balanceAfterFormatted}}</b>
      </div>
      <div class="fr2-sign"><div class="fr2-sign-line">Authorised Signature</div></div>
    </div>
    <div class="fr2-note">This is a computer-generated receipt and does not require a signature.</div>
  </div>

</div>
</body>
</html>`,
  },
}

// Options shown in the "Certificate Type" dropdown on CertificateTemplates.jsx.
// Order here = order in the dropdown. Add a new certificate sub-type by:
//   1. adding a new entry to TEMPLATE_TYPES above (with its own stub), and
//   2. adding its key + dropdownLabel here.
export const CERTIFICATE_SUB_TYPES = [
  { key: 'CERTIFICATE', dropdownLabel: 'Common Certificate' },
  { key: 'TRANSFER_CERTIFICATE', dropdownLabel: 'Transfer Certificate (TC)' },
  { key: 'CHARACTER_CERTIFICATE', dropdownLabel: 'Character Certificate' },
  { key: 'MIGRATION_CERTIFICATE', dropdownLabel: 'Migration Certificate' },
  { key: 'ELIGIBILITY_CERTIFICATE', dropdownLabel: 'Eligibility / Provisional Certificate' },
]

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
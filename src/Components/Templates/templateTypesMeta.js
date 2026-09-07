import {
  FileText, CreditCard, Ticket, Award, Receipt, IndianRupee,
  FileOutput, ShieldCheck, ArrowRightLeft, ClipboardCheck, DoorOpen,
  Bike, UserCheck, CheckSquare,
} from 'lucide-react'
// Keys must match backend `templateType` enum values used by
// /v1/print-templates (see Constants/Endpoints.js -> PRINT_TEMPLATES).
//
// NOTE: TRANSFER_CERTIFICATE, CHARACTER_CERTIFICATE, MIGRATION_CERTIFICATE
// and ELIGIBILITY_CERTIFICATE are NEW keys — the backend `templateType`
// enum + validation on POST/PUT /v1/print-templates must be updated to
// accept these 4 values, same as it already accepts CERTIFICATE.
//
// NOTE: SALARY_SLIP is also a NEW key — backend `templateType` enum +
// validation on POST/PUT /v1/print-templates must be updated to accept
// this value too, same as above.
//
// NOTE: NO_DUES is also a NEW key — backend `templateType` enum +
// validation on POST/PUT /v1/print-templates must be updated to accept
// this value too, same as above.
export const TEMPLATE_TYPES = {
  REPORT_CARD: {
    key: 'REPORT_CARD',
    label: 'Report Card Templates',
    shortLabel: 'Report Card',
    icon: FileText,
    stub: `<div class="rc-green-wrap">
<style>
  /* ══ Screen Preview ══ */
  .rc-green-wrap {
    font-family: 'Times New Roman', Times, Georgia, serif;
    width: 100%;
    max-width: 840px;
    margin: 0 auto;
    background: #ffffff;
    border: 4px double #166534;
    padding: 24px;
    position: relative;
    box-sizing: border-box;
    color: #111827;
    display: flex;
    flex-direction: column;
    min-height: 980px;
    justify-content: space-between;
  }

  /* ══ Full A4 Page Print Fit ══ */
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
    }
    .rc-green-wrap {
      width: 100% !important;
      max-width: 100% !important;
      height: 278mm !important; /* Exact A4 height without creating 2nd blank page */
      min-height: 278mm !important;
      border: 4px double #166534 !important;
      padding: 16mm 14mm !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }

  /* ══ Watermark Centering ══ */
  .rc-watermark {
    position: absolute;
    top: 52%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 440px;
    height: 440px;
    opacity: 0.16;
    pointer-events: none;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rc-watermark img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* ══ Header ══ */
  .rc-head-container {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2.5px solid #166534;
    padding-bottom: 14px;
    margin-bottom: 14px;
  }
  .rc-logo-box {
    width: 88px;
    height: 88px;
    border: 1.5px solid #166534;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    flex-shrink: 0;
  }
  .rc-logo-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .rc-title-center {
    text-align: center;
    flex: 1;
    padding: 0 16px;
  }
  .rc-school-name {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    color: #14532d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.15;
  }
  .rc-school-sub {
    font-size: 12.5px;
    font-weight: 700;
    color: #374151;
    margin: 3px 0;
  }
  .rc-school-address {
    font-size: 11.5px;
    font-weight: 700;
    color: #166534;
  }
  .rc-session-badge {
    display: inline-block;
    background: #166534 !important;
    color: #ffffff !important;
    padding: 4px 24px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 800;
    margin-top: 8px;
    text-transform: uppercase;
    -webkit-print-color-adjust: exact;
  }

  /* ══ Student Info Grid ══ */
  .rc-student-info {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1.5px solid #166534;
    margin-bottom: 14px;
    background: #fdfdfd;
  }
  .rc-info-cell {
    padding: 7px 12px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13px;
    display: flex;
    gap: 8px;
    align-items: baseline;
  }
  .rc-info-cell:nth-child(odd) {
    border-right: 1.5px solid #166534;
  }
  .rc-info-cell.full-width {
    grid-column: span 2;
    border-right: none;
  }
  .rc-lbl {
    font-weight: 800;
    color: #166534;
    min-width: 140px;
    text-transform: uppercase;
    font-size: 11.5px;
  }
  .rc-val {
    font-weight: 700;
    color: #000000;
  }

  /* ══ Marks Table ══ */
  .rc-table-container {
    position: relative;
    z-index: 1;
    flex-grow: 1; /* Automatically expands space */
  }
  table.rc-marks-tbl {
    width: 100%;
    border-collapse: collapse;
    border: 1.5px solid #166534;
    font-size: 13px;
    counter-reset: serial-number;
  }
  table.rc-marks-tbl th {
    background: #166534 !important;
    color: #ffffff !important;
    padding: 10px 6px;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 11.5px;
    border: 1px solid #14532d;
    text-align: center;
    -webkit-print-color-adjust: exact;
  }
  table.rc-marks-tbl td {
    padding: 9px 6px;
    border: 1px solid #cbd5e1;
    text-align: center;
    font-weight: 600;
  }
  table.rc-marks-tbl tbody td.sno-cell::before {
    counter-increment: serial-number;
    content: counter(serial-number);
  }
  table.rc-marks-tbl tbody tr:nth-child(even) {
    background: #f0fdf4 !important;
    -webkit-print-color-adjust: exact;
  }
  table.rc-marks-tbl td.subject-name {
    text-align: left;
    padding-left: 14px;
    font-weight: 800;
  }

  /* ══ Totals Bar ══ */
  .rc-totals-bar {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1.5px solid #166534;
    border-top: none;
    background: #ffffff;
  }
  .rc-total-item {
    padding: 10px 8px;
    text-align: center;
    border-right: 1px solid #166534;
  }
  .rc-total-item:last-child {
    border-right: none;
  }
  .rc-total-lbl {
    font-size: 10.5px;
    font-weight: 800;
    color: #166534;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .rc-total-val {
    font-size: 16px;
    font-weight: 900;
    color: #000000;
  }

  /* ══ Remarks Strip ══ */
  .rc-remarks-strip {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: baseline;
    gap: 10px;
    border: 1.5px solid #166534;
    border-top: none;
    padding: 9px 14px;
    background: #fafdfb;
    font-size: 12.5px;
  }
  .rc-remarks-tag {
    font-weight: 800;
    color: #166534;
    text-transform: uppercase;
    font-size: 11.5px;
    flex-shrink: 0;
  }
  .rc-remarks-text {
    font-style: italic;
    color: #1f2937;
    font-weight: 600;
  }

  /* ══ Signatures (Sticks to Page Bottom) ══ */
  .rc-footer-sigs {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: auto; /* Pushes signatures directly to bottom */
    padding-top: 28px;
    padding-left: 14px;
    padding-right: 14px;
    align-items: flex-end;
  }
  .rc-sig-box {
    text-align: center;
  }
  .rc-seal-circle {
    width: 80px;
    height: 80px;
    border: 2px dashed #166534;
    border-radius: 50%;
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    color: #166534;
    transform: rotate(-12deg);
    opacity: 0.75;
  }
  .rc-sig-line {
    width: 85%;
    border-top: 1.5px solid #166534;
    margin: 0 auto 6px;
  }
  .rc-sig-lbl {
    font-size: 12px;
    font-weight: 800;
    color: #166534;
    text-transform: uppercase;
  }
</style>

  <!-- Center Watermark -->
  <div class="rc-watermark">
    <img src="{{schoolLogo}}" alt="Watermark" onerror="this.style.display='none'">
  </div>

  <!-- Header -->
  <div class="rc-head-container">
    <div class="rc-logo-box">
      <img src="{{schoolLogo}}" alt="Logo" onerror="this.onerror=null;this.src='{{schoolLogoFallback}}'">
    </div>
    <div class="rc-title-center">
      <h1 class="rc-school-name">{{schoolName}}</h1>
      <div class="rc-school-sub">{{schoolBoard}}</div>
      <div class="rc-school-address">📍 {{schoolAddress}}</div>
      <div class="rc-session-badge">Annual Report Card : {{academicYear}}</div>
    </div>
    <div class="rc-logo-box">
      <img src="{{studentPhoto}}" alt="Student" onerror="this.style.display='none'">
    </div>
  </div>

  <!-- Student Info -->
  <div class="rc-student-info">
    <div class="rc-info-cell"><span class="rc-lbl">Student's Name:</span><span class="rc-val">{{studentName}}</span></div>
    <div class="rc-info-cell"><span class="rc-lbl">Admission No:</span><span class="rc-val">{{admissionNumber}}</span></div>
    <div class="rc-info-cell"><span class="rc-lbl">Father's Name:</span><span class="rc-val">{{parentName}}</span></div>
    <div class="rc-info-cell"><span class="rc-lbl">Class & Section:</span><span class="rc-val">{{className}} - {{sectionName}}</span></div>
    <div class="rc-info-cell"><span class="rc-lbl">Mother's Name:</span><span class="rc-val">{{motherName}}</span></div>
    <div class="rc-info-cell"><span class="rc-lbl">Roll Number:</span><span class="rc-val">{{rollNo}}</span></div>
    <div class="rc-info-cell full-width"><span class="rc-lbl">Residential Address:</span><span class="rc-val">{{studentAddress}}</span></div>
  </div>

  <!-- Marks Table -->
  <div class="rc-table-container">
    <table class="rc-marks-tbl">
      <thead>
        <tr>
          <th style="width: 48px;">S.No.</th>
          <th>Subject</th>
          <th>Max</th>
          <th>Theory</th>
          <th>Practical</th>
          <th>Total</th>
          <th>Grade</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {{#subjectMarks}}
        <tr>
          <td class="sno-cell"></td>
          <td class="subject-name">{{subjectName}}</td>
          <td>{{maxMarks}}</td>
          <td>{{theoryMarks}}</td>
          <td>{{practicalMarks}}</td>
          <td style="color:#166534; font-weight: 900;">{{totalMarks}}</td>
          <td>{{grade}}</td>
          <td style="font-size: 11.5px;">{{status}}</td>
        </tr>
        {{/subjectMarks}}
      </tbody>
    </table>

    <div class="rc-totals-bar">
      <div class="rc-total-item"><div class="rc-total-lbl">Grand Total</div><div class="rc-total-val">{{totalMarksObtained}} / {{totalMaxMarks}}</div></div>
      <div class="rc-total-item"><div class="rc-total-lbl">Percentage</div><div class="rc-total-val">{{percentage}}%</div></div>
      <div class="rc-total-item"><div class="rc-total-lbl">Final Grade</div><div class="rc-total-val">{{overallGrade}}</div></div>
      <div class="rc-total-item"><div class="rc-total-lbl">Rank</div><div class="rc-total-val">{{sectionRank}}</div></div>
    </div>

    <div class="rc-remarks-strip">
      <span class="rc-remarks-tag">Teacher's Remarks:</span>
      <span class="rc-remarks-text">{{remarks}}</span>
    </div>
  </div>

  <!-- Signatures Section -->
  <div class="rc-footer-sigs">
    <div class="rc-sig-box">
      <div class="rc-seal-circle">SCHOOL SEAL</div>
      <div class="rc-sig-lbl">School Seal</div>
    </div>
    <div class="rc-sig-box" style="display: flex; flex-direction: column; justify-content: flex-end;">
      <div class="rc-sig-line"></div>
      <div class="rc-sig-lbl">Class Teacher</div>
    </div>
    <div class="rc-sig-box" style="display: flex; flex-direction: column; justify-content: flex-end;">
      <div class="rc-sig-line"></div>
      <div class="rc-sig-lbl">Principal</div>
    </div>
  </div>

</div>`,
  },
  ID_CARD: {
    key: 'ID_CARD',
    label: 'ID Card Templates',
    shortLabel: 'ID Card',
    icon: CreditCard,
    // CR80-ratio card (~54mm x 85.6mm), rendered as FRONT + BACK side by
    // side in one pass — same dual-block pattern as FEE_RECEIPT.
    // Optional rows (bloodGroup, transport, house, emergency contact)
    // follow the {{#xxxRows}} convention — present only when set.
    stub: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Student ID Card</title></head>
<body style="margin:0;padding:14px;background:#eef2f7;">
<div class="idc-wrap">
<style>
  .idc-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 640px; margin: 0 auto; }
  .idc-card { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; width: 300px; aspect-ratio: 54/85.6; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 10px 26px rgba(15,23,42,0.14); border: 1px solid #e0e7ff; position: relative; display: flex; flex-direction: column; }

  /* ── FRONT ── */
  .idc-front .idc-head { position: relative; overflow: hidden; text-align: center; padding: 12px 10px 10px; background: linear-gradient(135deg,#4338ca,#2563eb); color: #fff; }
  .idc-front .idc-blob { position: absolute; top: -20px; right: -20px; width: 90px; height: 90px; border-radius: 50%; background: rgba(255,255,255,.14); }
  .idc-front .idc-logo { position: relative; width: 34px; height: 34px; margin: 0 auto 6px; border-radius: 9px; background: rgba(255,255,255,.2); border: 1.5px solid rgba(255,255,255,.55); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; overflow: hidden; }
  .idc-front .idc-logo img { width: 100%; height: 100%; object-fit: cover; }
  .idc-front .idc-school-name { position: relative; margin: 0; font-size: 12.5px; font-weight: 800; letter-spacing: -.1px; line-height: 1.25; }
  .idc-front .idc-card-title { position: relative; margin-top: 3px; font-size: 8.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }

  .idc-front .idc-body { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 14px 12px 10px; }
  .idc-front .idc-photo { width: 78px; height: 92px; border-radius: 10px; background: #e5e7eb; border: 3px solid #eef2ff; box-shadow: 0 4px 10px rgba(79,70,229,.18); margin-bottom: 10px; overflow: hidden; }
  .idc-front .idc-photo img { width: 100%; height: 100%; object-fit: cover; }
  .idc-front .idc-student-name { font-size: 14px; font-weight: 800; color: #111827; text-align: center; margin: 0 0 2px; }
  .idc-front .idc-admission { font-size: 9.5px; color: #6366f1; font-weight: 700; margin-bottom: 10px; }

  .idc-front .idc-info-grid { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 8px; }
  .idc-front .idc-info-cell { background: #f8f9ff; border: 1px solid #eef0f6; border-radius: 8px; padding: 5px 8px; }
  .idc-front .idc-info-label { display: block; font-size: 7.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #818cf8; margin-bottom: 1px; }
  .idc-front .idc-info-value { font-size: 10.5px; font-weight: 700; color: #111827; }

  .idc-front .idc-footer { text-align: center; font-size: 8px; color: #9ca3af; padding: 6px 10px 10px; border-top: 1px dashed #e5e7eb; margin-top: 8px; }

  /* ── BACK ── */
  .idc-back { padding: 1px 14px; }
  .idc-back .idc-back-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: #4f46e5; margin: 0 0 8px; display: flex; align-items: center; gap: 6px; }
  .idc-back .idc-back-title .idc-bar { width: 4px; height: 12px; border-radius: 2px; background: #6366f1; display: inline-block; }

  .idc-back .idc-kv-row { display: flex; gap: 6px; font-size: 9.5px; margin-bottom: 5px; line-height: 1.4; }
  .idc-back .idc-kv-row .idc-k { font-weight: 700; min-width: 78px; color: #6b7280; flex-shrink: 0; }
  .idc-back .idc-kv-row .idc-v { color: #111827; font-weight: 600; }

  .idc-back .idc-tag-row { display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap; }
  .idc-back .idc-tag { font-size: 8.5px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }
  .idc-back .idc-tag.idc-tag-amber { background: #fffbeb; color: #92400e; border-color: #fde68a; }

  .idc-back .idc-qr-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e5e7eb; }
  .idc-back .idc-qr { width: 52px; height: 52px; border-radius: 6px; background: #f3f4f6; border: 1px solid #e5e7eb; flex-shrink: 0; overflow: hidden; }
  .idc-back .idc-qr img { width: 100%; height: 100%; object-fit: contain; }
  .idc-back .idc-return-note { font-size: 8px; color: #6b7280; line-height: 1.5; }
  .idc-back .idc-return-note b { color: #111827; display: block; font-size: 9px; }

  .idc-back .idc-signature { margin-top: 10px; text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #f1f2f6; padding-top: 6px; }

  @media print {
    body { background: #fff; padding: 0; }
    .idc-wrap { max-width: 100%; gap: 8mm; }
    .idc-card { box-shadow: none; border: 1px solid #ccc; }
  }
</style>

  <!-- ══════════════ FRONT ══════════════ -->
  <div class="idc-card idc-front">
    <div class="idc-head">
      <div class="idc-blob"></div>
      <div class="idc-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.src='{{schoolLogoFallback}}'"></div>
      <h1 class="idc-school-name">{{schoolName}}</h1>
      <div class="idc-card-title">Student Identity Card</div>
    </div>

    <div class="idc-body">
      <div class="idc-photo"><img src="{{studentPhoto}}" alt="{{studentName}}" onerror="this.style.display='none'"></div>
      <div class="idc-student-name">{{studentName}}</div>
      <div class="idc-admission">Admission No: {{admissionNumber}}</div>

      <div class="idc-info-grid">
        <div class="idc-info-cell"><span class="idc-info-label">Class</span><span class="idc-info-value">{{className}} - {{sectionName}}</span></div>
        <div class="idc-info-cell"><span class="idc-info-label">Roll No</span><span class="idc-info-value">{{rollNo}}</span></div>
        <div class="idc-info-cell"><span class="idc-info-label">DOB</span><span class="idc-info-value">{{dateOfBirth}}</span></div>
        <div class="idc-info-cell"><span class="idc-info-label">Blood Group</span><span class="idc-info-value">{{bloodGroup}}</span></div>
      </div>
    </div>

    <div class="idc-footer">Session {{academicSession}} &middot; Valid till {{sessionEndDate}}</div>
  </div>

  <!-- ══════════════ BACK ══════════════ -->
  <div class="idc-card idc-back">
    <div class="idc-back-title"><span class="idc-bar"></span> Guardian & Emergency</div>

    <div class="idc-kv-row"><span class="idc-k">Parent/Guardian</span><span class="idc-v">{{parentName}}</span></div>
    <div class="idc-kv-row"><span class="idc-k">Contact</span><span class="idc-v">{{parentMobile}}</span></div>
    <div class="idc-kv-row"><span class="idc-k">Address</span><span class="idc-v">{{studentAddress}}</span></div>

    {{#emergencyContactRows}}
    <div class="idc-kv-row"><span class="idc-k">Emergency</span><span class="idc-v">{{emergencyContact}}</span></div>
    {{/emergencyContactRows}}

    <div class="idc-tag-row">
      {{#transportRows}}
      <span class="idc-tag">🚌 {{transportRoute}}</span>
      {{/transportRows}}
      {{#houseRows}}
      <span class="idc-tag idc-tag-amber">🏠 {{houseName}}</span>
      {{/houseRows}}
    </div>

    <div class="idc-qr-row">
      <div class="idc-qr"><img src="{{qrCodeUrl}}" alt="QR" onerror="this.style.display='none'"></div>
      <div class="idc-return-note">
        <b>If found, please return to:</b>
        {{schoolName}}<br>{{schoolAddress}}<br>{{schoolPhone}}
      </div>
    </div>

    <div class="idc-signature">Authorised Signature / School Stamp</div>
  </div>

</div>
</body>
</html>`,
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

  GATE_PASS: {
    key: 'GATE_PASS',
    label: 'Gate Pass Templates',
    shortLabel: 'Gate Pass',
    icon: DoorOpen,
    stub: `<div class="gp-premium"> 
<style> 
  .gp-premium { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; max-width: 700px; margin: 0 auto; border: 2px solid #0f1e3d; border-radius: 14px; overflow: hidden; background: #ffffff; color: #1f2937; box-shadow: 0 12px 32px rgba(15,30,61,0.14); } 
 
  .gp-header { display: flex; align-items: center; gap: 14px; padding: 18px 22px 14px; border-bottom: 1px solid #e5e7eb; } 
  .gp-logo { width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg,#0f1e3d,#1e3a8a); color: #fbbf24; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; border: 2px solid #fbbf24; overflow: hidden; } 
  .gp-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; } 
  .gp-school-block { flex: 1; min-width: 0; } 
  .gp-school-name { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -.2px; color: #0f1e3d; text-transform: uppercase; line-height: 1.2; } 
  .gp-school-meta { font-size: 10.5px; color: #4b5563; display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; line-height: 1.4; } 
 
  .gp-pass-box { flex-shrink: 0; border: 1.5px solid #0f1e3d; border-radius: 10px; padding: 8px 14px; text-align: center; min-width: 118px; } 
  .gp-pass-box .gp-pb-label { font-size: 8px; font-weight: 800; letter-spacing: .06em; color: #6b7280; } 
  .gp-pass-box .gp-pb-value { font-size: 12px; font-weight: 800; color: #dc2626; margin: 1px 0 6px; } 
  .gp-pass-box .gp-pb-value.gp-pb-date { color: #0f1e3d; margin-bottom: 0; } 
 
  .gp-title-banner { text-align: center; background: #0f1e3d; color: #fff; font-size: 17px; font-weight: 800; letter-spacing: .15em; padding: 9px; margin: 16px 22px 0; border-radius: 8px; } 
 
  .gp-section { padding: 16px 22px 0; } 
  .gp-row { display: flex; align-items: baseline; gap: 10px; padding: 7px 0; border-bottom: 1px dashed #e5e7eb; } 
  .gp-row:last-child { border-bottom: none; } 
  .gp-num { flex-shrink: 0; width: 20px; height: 20px; border-radius: 5px; background: #0f1e3d; color: #fff; font-size: 10.5px; font-weight: 800; display: flex; align-items: center; justify-content: center; } 
  .gp-row-label { flex-shrink: 0; width: 130px; font-size: 12px; font-weight: 700; color: #374151; } 
  .gp-row-value { flex: 1; font-size: 12.5px; font-weight: 700; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; } 
 
  .gp-band { background: #0f1e3d; color: #fff; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 7px; margin: 18px 0 0; } 
 
  .gp-two-col { display: flex; gap: 22px; padding: 12px 22px 0; } 
  .gp-field { flex: 1; } 
  .gp-field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; margin-bottom: 3px; } 
  .gp-field-value { font-size: 12.5px; font-weight: 700; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; min-height: 15px; } 
 
  .gp-reason-row { padding: 14px 22px 0; font-size: 11.5px; color: #374151; } 
  .gp-reason-title { font-weight: 700; margin-bottom: 8px; } 
  .gp-checks { display: flex; flex-wrap: wrap; gap: 14px 20px; margin-bottom: 10px; } 
  .gp-check { display: inline-flex; align-items: center; gap: 6px; } 
  .gp-box { width: 13px; height: 13px; border: 1.5px solid #6b7280; border-radius: 3px; display: inline-block; } 
  .gp-reason-details { border-bottom: 1px solid #d1d5db; padding-bottom: 4px; font-size: 12px; font-weight: 700; color: #111827; min-height: 16px; } 
 
  .gp-instructions { padding: 14px 22px 4px; display: flex; justify-content: space-between; gap: 12px; } 
  .gp-instructions ul { margin: 0; padding-left: 16px; font-size: 11px; color: #374151; line-height: 1.9; } 
  .gp-instructions .gp-badge-icon { font-size: 38px; opacity: .12; flex-shrink: 0; } 
 
  .gp-signatures { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding: 16px 22px 6px; } 
  .gp-sign-box { border: 1px solid #d1d5db; border-radius: 8px; padding: 20px 8px 8px; text-align: center; position: relative; min-height: 66px; min-width: 0; } 
  .gp-sign-box .gp-sign-title { position: absolute; top: 7px; left: 5px; right: 5px; font-size: 7.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0; color: #6b7280; text-align: center; white-space: nowrap; } 
  .gp-sign-line { border-top: 1px solid #9ca3af; font-size: 9px; color: #6b7280; padding-top: 3px; } 
  .gp-stamp { position: absolute; bottom: 8px; right: 8px; width: 34px; height: 34px; border: 1.5px dashed #1e3a8a; border-radius: 50%; color: #1e3a8a; font-size: 6px; font-weight: 800; display: flex; align-items: center; justify-content: center; text-align: center; transform: rotate(-12deg); opacity: .55; } 
 
  .gp-footer { padding: 4px 22px 18px; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; align-items: center; gap: 10px; } 
  .gp-thankyou { font-family: Georgia, serif; font-style: italic; font-size: 15px; color: #0f1e3d; } 
</style> 
 
  <!-- ══ Header ══ --> 
  <div class="gp-header"> 
    <div class="gp-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.parentElement.textContent='{{schoolInitials}}'"></div> 
    <div class="gp-school-block"> 
      <h1 class="gp-school-name">{{schoolName}}</h1> 
      <div class="gp-school-meta"> 
        <span>📍 {{schoolAddress}}</span> 
        <span>📞 {{schoolPhone}}</span> 
        <span>✉️ {{schoolEmail}}</span> 
      </div> 
    </div> 
    <div class="gp-pass-box"> 
      <div class="gp-pb-label">GATE PASS NO.</div> 
      <div class="gp-pb-value">{{gatePassNo}}</div> 
      <div class="gp-pb-label">DATE</div> 
      <div class="gp-pb-value gp-pb-date">{{issueDate}}</div> 
    </div> 
  </div> 
 
  <div class="gp-title-banner">GATE PASS</div> 
 
  <!-- ══ Student Details ══ --> 
  <div class="gp-section"> 
    <div class="gp-row"><span class="gp-num">1</span><span class="gp-row-label">Student</span><span class="gp-row-value">{{studentName}}</span></div> 
    <div class="gp-row"><span class="gp-num">2</span><span class="gp-row-label">Class &amp; Section</span><span class="gp-row-value">{{className}} - {{sectionName}}</span></div> 
    <div class="gp-row"><span class="gp-num">3</span><span class="gp-row-label">Roll No.</span><span class="gp-row-value">{{rollNo}}</span></div> 
    <div class="gp-row"><span class="gp-num">4</span><span class="gp-row-label">Contact Number</span><span class="gp-row-value">{{parentMobile}}</span></div> 
    <div class="gp-row"><span class="gp-num">5</span><span class="gp-row-label">Father's / Guardian's Name</span><span class="gp-row-value">{{parentName}}</span></div> 
  </div> 
 
  <!-- ══ Details of Leaving ══ --> 
  <div class="gp-band">Details of Leaving</div> 
  <div class="gp-two-col"> 
    <div class="gp-field"><div class="gp-field-label">Date</div><div class="gp-field-value"></div></div> 
    <div class="gp-field"><div class="gp-field-label">Time</div><div class="gp-field-value"></div></div> 
  </div> 
 
  <div class="gp-reason-row"> 
    <div class="gp-reason-title">Reason</div> 
    <div class="gp-checks"> 
      <span class="gp-check"><span class="gp-box"></span> Medical</span> 
      <span class="gp-check"><span class="gp-box"></span> Personal</span> 
      <span class="gp-check"><span class="gp-box"></span> Family Function</span> 
      <span class="gp-check"><span class="gp-box"></span> Emergency</span> 
      <span class="gp-check"><span class="gp-box"></span> Others</span> 
    </div> 
    <div class="gp-field-label" style="margin-top:4px;">Details</div> 
    <div class="gp-reason-details"></div> 
  </div> 
 
  <!-- ══ Authorised Pickup ══ --> 
  <div class="gp-band">Person Authorised to Pick Up</div> 
  <div class="gp-two-col" style="padding-bottom:4px;"> 
    <div class="gp-field"><div class="gp-field-label">Name</div><div class="gp-field-value"></div></div> 
    <div class="gp-field"><div class="gp-field-label">Relation</div><div class="gp-field-value"></div></div> 
  </div> 
  <div class="gp-two-col" style="padding-top:10px;"> 
    <div class="gp-field"><div class="gp-field-label">Contact No.</div><div class="gp-field-value"></div></div> 
    <div class="gp-field"><div class="gp-field-label">ID Proof</div><div class="gp-field-value"></div></div> 
  </div> 
 
  <!-- ══ Instructions ══ --> 
  <div class="gp-band" style="margin-top:18px;">Instructions</div> 
  <div class="gp-instructions"> 
    <ul> 
      <li>Student must be picked up by the authorised person only.</li> 
      <li>This Gate Pass is valid only for the date and time mentioned above.</li> 
      <li>Student must report back to school on the next working day with a valid explanation.</li> 
    </ul> 
    <div class="gp-badge-icon">🏫</div> 
  </div> 
 
  <!-- ══ Signatures ══ --> 
  <div class="gp-signatures"> 
    <div class="gp-sign-box"><span class="gp-sign-title">Class Teacher</span><div class="gp-sign-line">Signature</div></div> 
    <div class="gp-sign-box"><span class="gp-sign-title">HOD / Coordinator</span><div class="gp-sign-line">Signature</div></div> 
    <div class="gp-sign-box"><span class="gp-sign-title">Admin Office</span><div class="gp-sign-line">Signature</div><div class="gp-stamp">RECEIVED</div></div> 
    <div class="gp-sign-box"><span class="gp-sign-title">Security</span><div class="gp-sign-line">Signature</div></div> 
  </div> 
 
  <div class="gp-footer"> 
    <span><b>Note:</b> Students are not allowed to leave the school campus without a valid Gate Pass.</span> 
    <span class="gp-thankyou">Thank You!</span> 
  </div> 
 
</div>`,
  },
  CYCLE_STAND_PASS: {
    key: 'CYCLE_STAND_PASS',
    label: 'Cycle Stand Pass Templates',
    shortLabel: 'Cycle Stand Pass',
    icon: Bike,
    stub: `<div class="cyc-card">
<style>
  .cyc-card {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    max-width: 460px;
    margin: 0 auto;
    border-radius: 20px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(2, 132, 199, 0.12);
    border: 1px solid #e2e8f0;
    color: #0f172a;
  }

  /* ══ Blue Gradient Header ══ */
  .cyc-header {
    background: linear-gradient(90deg, #0284c7 0%, #0f766e 100%);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #ffffff;
  }
  .cyc-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cyc-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 800;
    color: #ffffff;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.35);
  }
  .cyc-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cyc-school-name {
    font-size: 17px;
    font-weight: 800;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.2px;
  }
  .cyc-subtitle {
    font-size: 11.5px;
    opacity: 0.9;
    margin: 2px 0 0 0;
    font-weight: 500;
  }
  .cyc-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 13px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* ══ Card Body ══ */
  .cyc-body {
    padding: 18px 20px;
    display: flex;
    gap: 18px;
    align-items: center;
  }
  .cyc-photo {
    width: 95px;
    height: 105px;
    border-radius: 16px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    overflow: hidden;
    flex-shrink: 0;
  }
  .cyc-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cyc-info {
    flex: 1;
    min-width: 0;
  }
  .cyc-student-name {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px 0;
    line-height: 1.25;
  }
  .cyc-detail {
    font-size: 13px;
    color: #334155;
    margin: 3px 0;
  }
  .cyc-detail strong {
    color: #0f172a;
  }
  .cyc-code-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 4px 12px;
    background: #dcfce7;
    border-radius: 999px;
    color: #15803d;
    font-weight: 800;
    font-size: 12.5px;
    letter-spacing: 0.5px;
  }

  /* ══ Card Footer ══ */
  .cyc-footer {
    border-top: 1px dashed #cbd5e1;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    font-size: 12.5px;
  }
  .cyc-session {
    font-weight: 700;
    color: #0284c7;
  }
  .cyc-manual-stand {
    font-weight: 700;
    color: #0284c7;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cyc-blank-line {
    display: inline-block;
    width: 100px;
    border-bottom: 1.5px solid #0284c7;
    height: 14px;
  }
</style>

  <!-- Header -->
  <div class="cyc-header">
    <div class="cyc-header-left">
      <div class="cyc-logo">
        <img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.parentElement.textContent='{{schoolInitials}}'">
      </div>
      <div>
        <h1 class="cyc-school-name">{{schoolName}}</h1>
        <div class="cyc-subtitle">Bicycle Parking Pass</div>
      </div>
    </div>
    <div class="cyc-badge">CYCLE PASS</div>
  </div>

  <!-- Body -->
  <div class="cyc-body">
    <div class="cyc-photo">
      <img src="{{studentPhoto}}" alt="{{studentName}}" onerror="this.style.display='none'">
    </div>
    <div class="cyc-info">
      <h2 class="cyc-student-name">{{studentName}}</h2>
      <div class="cyc-detail"><strong>Roll No:</strong> {{rollNo}}</div>
      <div class="cyc-detail"><strong>Class:</strong> {{className}} - {{sectionName}}</div>
      <div class="cyc-code-pill">
        <span>🚲</span>
        <span>{{passNo}}</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="cyc-footer">
    <div class="cyc-session">Session {{academicSession}}</div>
    <div class="cyc-manual-stand">
      <span>Stand Name / No:</span>
      <span class="cyc-blank-line"></span>
    </div>
  </div>
</div>`,
  },
  VISITOR_PASS: {
    key: 'VISITOR_PASS',
    label: "Visitor's Pass Templates",
    shortLabel: "Visitor's Pass",
    icon: UserCheck,
    stub: `<div class="vp-premium">
<style>
  .vp-premium { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; max-width: 700px; margin: 0 auto; border: 2px solid #1e3a8a; border-radius: 14px; overflow: hidden; background: #ffffff; color: #1f2937; box-shadow: 0 12px 32px rgba(30,58,138,0.14); }

  .vp-header { display: flex; align-items: center; gap: 14px; padding: 18px 22px 14px; border-bottom: 1px solid #e5e7eb; }
  .vp-logo { width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg,#1e3a8a,#2563eb); color: #fbbf24; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; border: 2px solid #fbbf24; overflow: hidden; }
  .vp-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .vp-school-block { flex: 1; min-width: 0; }
  .vp-school-name { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -.2px; color: #1e3a8a; text-transform: uppercase; line-height: 1.2; }
  .vp-school-meta { font-size: 10.5px; color: #4b5563; display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; line-height: 1.4; }

  .vp-pass-box { flex-shrink: 0; border: 1.5px solid #1e3a8a; border-radius: 10px; padding: 8px 14px; text-align: center; min-width: 118px; }
  .vp-pass-box .vp-pb-label { font-size: 8px; font-weight: 800; letter-spacing: .06em; color: #6b7280; }
  .vp-pass-box .vp-pb-value { font-size: 12px; font-weight: 800; color: #1e3a8a; margin: 1px 0 0; }

  .vp-title-banner { text-align: center; background: #1e3a8a; color: #fff; font-size: 17px; font-weight: 800; letter-spacing: .15em; padding: 9px; margin: 16px 22px 0; border-radius: 8px; }

  .vp-band { background: #1e3a8a; color: #fff; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 7px; margin: 18px 0 0; }

  .vp-section { padding: 16px 22px 0; }
  .vp-two-col { display: flex; gap: 22px; padding: 16px 22px 0; }
  .vp-row { display: flex; align-items: baseline; gap: 10px; padding: 7px 0; border-bottom: 1px dashed #e5e7eb; }
  .vp-row:last-child { border-bottom: none; }
  .vp-num { flex-shrink: 0; width: 20px; height: 20px; border-radius: 5px; background: #1e3a8a; color: #fff; font-size: 10.5px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .vp-row-label { flex-shrink: 0; width: 140px; font-size: 12px; font-weight: 700; color: #374151; }
  .vp-row-value { flex: 1; font-size: 12.5px; font-weight: 700; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }

  .vp-field { flex: 1; }
  .vp-field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; margin-bottom: 3px; }
  .vp-field-value { font-size: 12.5px; font-weight: 700; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; min-height: 15px; }

  .vp-signatures { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; padding: 16px 22px 18px; }
  .vp-sign-box { border: 1px solid #d1d5db; border-radius: 8px; padding: 20px 8px 8px; text-align: center; position: relative; min-height: 66px; }
  .vp-sign-box .vp-sign-title { position: absolute; top: 7px; left: 8px; right: 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .03em; color: #6b7280; text-align: left; }
  .vp-sign-line { border-top: 1px solid #9ca3af; font-size: 9px; color: #6b7280; padding-top: 3px; }

  .vp-footer { text-align: center; background: #1e3a8a; color: #fff; font-size: 10.5px; font-weight: 700; letter-spacing: .04em; padding: 10px; margin-top: 4px; }
</style>

  <!-- ══ Header ══ -->
  <div class="vp-header">
    <div class="vp-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.parentElement.textContent='{{schoolInitials}}'"></div>
    <div class="vp-school-block">
      <h1 class="vp-school-name">{{schoolName}}</h1>
      <div class="vp-school-meta">
        <span>📍 {{schoolAddress}}</span>
        <span>📞 {{schoolPhone}}</span>
        <span>✉️ {{schoolEmail}}</span>
      </div>
    </div>
    <div class="vp-pass-box">
      <div class="vp-pb-label">PASS NO.</div>
      <div class="vp-pb-value">{{passNo}}</div>
    </div>
  </div>

  <div class="vp-title-banner">VISITOR PASS</div>

  <!-- ══ Visitor Details ══ -->
  <div class="vp-band">Visitor Details</div>
  <div class="vp-section">
    <div class="vp-row"><span class="vp-num">1</span><span class="vp-row-label">Visitor Name</span><span class="vp-row-value">{{visitorName}}</span></div>
    <div class="vp-row"><span class="vp-num">2</span><span class="vp-row-label">Mobile Number</span><span class="vp-row-value">{{visitorMobile}}</span></div>
    <div class="vp-row"><span class="vp-num">3</span><span class="vp-row-label">ID Proof Type</span><span class="vp-row-value">{{idProofType}}</span></div>
    <div class="vp-row"><span class="vp-num">4</span><span class="vp-row-label">ID Proof Number</span><span class="vp-row-value">{{idProofNumber}}</span></div>
  </div>

  <!-- ══ Visit Details ══ -->
  <div class="vp-band">Visit Details</div>
  <div class="vp-section">
    <div class="vp-row"><span class="vp-num">1</span><span class="vp-row-label">Purpose of Visit</span><span class="vp-row-value">{{purposeOfVisit}}</span></div>
    <div class="vp-row"><span class="vp-num">2</span><span class="vp-row-label">Person to Meet</span><span class="vp-row-value">{{personToMeet}}</span></div>
    <div class="vp-row"><span class="vp-num">3</span><span class="vp-row-label">Student / Employee</span><span class="vp-row-value">{{studentOrEmployeeName}}</span></div>
    <div class="vp-row"><span class="vp-num">4</span><span class="vp-row-label">Class / Section / Dept</span><span class="vp-row-value">{{classSectionDept}}</span></div>
  </div>

  <!-- ══ Vehicle Details ══ -->
  <div class="vp-band">Vehicle Details (If Any)</div>
  <div class="vp-section">
    <div class="vp-row" style="border-bottom:none;"><span class="vp-num">1</span><span class="vp-row-label">Vehicle Number</span><span class="vp-row-value">{{vehicleNumber}}</span></div>
  </div>

  <!-- ══ Remarks / Items Carried ══ -->
  <div class="vp-band">Remarks / Items Carried (If Any)</div>
  <div class="vp-section">
    <div class="vp-row" style="border-bottom:none;"><span class="vp-num">1</span><span class="vp-row-label">Remarks</span><span class="vp-row-value">{{remarks}}</span></div>
  </div>

  <!-- ══ Date & Time ══ -->
  <div class="vp-band">Date &amp; Time</div>
  <div class="vp-two-col">
    <div class="vp-field"><div class="vp-field-label">Date of Visit</div><div class="vp-field-value">{{dateOfVisit}}</div></div>
    <div class="vp-field"><div class="vp-field-label">Entry Time</div><div class="vp-field-value">{{entryTime}}</div></div>
    <div class="vp-field"><div class="vp-field-label">Expected Exit Time</div><div class="vp-field-value">{{expectedExitTime}}</div></div>
  </div>

  <!-- ══ Authorization ══ -->
  <div class="vp-band" style="margin-top:18px;">Authorization</div>
  <div class="vp-signatures">
    <div class="vp-sign-box"><span class="vp-sign-title">Visitor Signature</span><div class="vp-sign-line">Signature</div></div>
    <div class="vp-sign-box"><span class="vp-sign-title">Authorized By</span><div class="vp-sign-line">Signature</div></div>
    <div class="vp-sign-box"><span class="vp-sign-title">Security Guard</span><div class="vp-sign-line">Signature</div></div>
  </div>

  <div class="vp-footer">🛡 PLEASE DISPLAY THIS PASS WHILE ON CAMPUS 🛡</div>

</div>`,
  },
  NO_DUES: {
    key: 'NO_DUES',
    label: 'No Dues Form Templates',
    shortLabel: 'No Dues Form',
    icon: CheckSquare,
    // Print-and-sign clearance certificate, same family as GATE_PASS /
    // VISITOR_PASS (bands + numbered rows). departmentRows is fully
    // data-driven — one row per department returned by the API, via
    // {{#departmentRows}}...{{/departmentRows}}; add/remove clearance
    // departments on the backend and the table updates automatically.
    // Status/Signature cells stay blank on purpose — departments sign
    // off by hand once cleared.
    stub: `<div class="nd-premium">
<style>
  .nd-premium { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; max-width: 700px; margin: 0 auto; border: 2px solid #0f766e; border-radius: 14px; overflow: hidden; background: #ffffff; color: #1f2937; box-shadow: 0 12px 32px rgba(15,118,110,0.14); }

  .nd-header { display: flex; align-items: center; gap: 14px; padding: 20px 22px 16px; border-bottom: 1px solid #e5e7eb; }
  .nd-logo { width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg,#0f766e,#0891b2); color: #fff; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; border: 2px solid #a7f3d0; overflow: hidden; }
  .nd-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .nd-school-block { flex: 1; min-width: 0; }
  .nd-school-name { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -.2px; color: #0f766e; text-transform: uppercase; }
  .nd-school-meta { font-size: 10px; color: #4b5563; display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; }

  .nd-pass-box { flex-shrink: 0; border: 1.5px solid #0f766e; border-radius: 10px; padding: 8px 14px; text-align: center; min-width: 118px; }
  .nd-pass-box .nd-pb-label { font-size: 8px; font-weight: 800; letter-spacing: .06em; color: #6b7280; }
  .nd-pass-box .nd-pb-value { font-size: 12px; font-weight: 800; color: #0f766e; margin: 1px 0 6px; }
  .nd-pass-box .nd-pb-value.nd-pb-date { margin-bottom: 0; }

  .nd-title-banner { text-align: center; background: #0f766e; color: #fff; font-size: 17px; font-weight: 800; letter-spacing: .15em; padding: 9px; margin: 16px 22px 0; border-radius: 8px; }

  .nd-band { background: #0f766e; color: #fff; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 7px; margin: 18px 0 0; }

  .nd-section { padding: 16px 22px 0; }
  .nd-row { display: flex; align-items: baseline; gap: 10px; padding: 7px 0; border-bottom: 1px dashed #e5e7eb; }
  .nd-row:last-child { border-bottom: none; }
  .nd-num { flex-shrink: 0; width: 20px; height: 20px; border-radius: 5px; background: #0f766e; color: #fff; font-size: 10.5px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .nd-row-label { flex-shrink: 0; width: 150px; font-size: 12px; font-weight: 700; color: #374151; }
  .nd-row-value { flex: 1; font-size: 12.5px; font-weight: 700; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }

  .nd-declaration { padding: 14px 22px 0; font-size: 11.5px; color: #374151; line-height: 1.7; text-align: justify; }

  table.nd-dues { width: calc(100% - 44px); margin: 14px 22px 0; border-collapse: collapse; font-size: 12px; }
  table.nd-dues thead th { background: #0f766e; color: #fff; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; padding: 8px 10px; text-align: left; }
  table.nd-dues thead th:first-child { width: 34px; text-align: center; }
  table.nd-dues thead th:last-child { width: 100px; text-align: center; }
  table.nd-dues tbody td { padding: 9px 10px; font-size: 12px; border-bottom: 1px solid #f1f2f6; color: #374151; }
  table.nd-dues tbody td:first-child { text-align: center; font-weight: 700; color: #0f766e; }
  table.nd-dues tbody tr:nth-child(even) { background: #f0fdfa; }
  .nd-status-pill { display: inline-block; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 3px 10px; border-radius: 999px; background: #ecfdf5; color: #15803d; border: 1px solid #a7f3d0; }
  .nd-sign-cell { height: 30px; border-bottom: 1px dashed #9ca3af; }

  .nd-remarks-row { padding: 14px 22px 0; }
  .nd-remarks-box { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 11.5px; color: #4b5563; min-height: 32px; }
  .nd-remarks-box .nd-remarks-label { display: block; font-weight: 700; color: #374151; font-size: 9.5px; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }

  .nd-final-line { text-align: center; font-size: 12.5px; font-weight: 800; color: #0f766e; margin: 16px 22px 0; padding: 10px; border: 1.5px dashed #0f766e; border-radius: 8px; background: #f0fdfa; }

  .nd-signatures { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; padding: 18px 22px 6px; }
  .nd-sign-box { border: 1px solid #d1d5db; border-radius: 8px; padding: 20px 8px 8px; text-align: center; position: relative; min-height: 66px; }
  .nd-sign-box .nd-sign-title { position: absolute; top: 7px; left: 8px; right: 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .03em; color: #6b7280; text-align: left; }
  .nd-sign-line { border-top: 1px solid #9ca3af; font-size: 9px; color: #6b7280; padding-top: 3px; }

  .nd-footer { text-align: center; font-size: 10px; color: #9ca3af; padding: 6px 22px 18px; border-top: 1px dashed #e5e7eb; margin-top: 10px; }
</style>

  <!-- ══ Header ══ -->
  <div class="nd-header">
    <div class="nd-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.parentElement.textContent='{{schoolInitials}}'"></div>
    <div class="nd-school-block">
      <h1 class="nd-school-name">{{schoolName}}</h1>
      <div class="nd-school-meta">
        <span>📍 {{schoolAddress}}</span>
        <span>{{schoolPhone}} &middot; {{schoolEmail}}</span>
      </div>
    </div>
    <div class="nd-pass-box">
      <div class="nd-pb-label">FORM NO.</div>
      <div class="nd-pb-value">{{formNo}}</div>
      <div class="nd-pb-label">DATE</div>
      <div class="nd-pb-value nd-pb-date">{{issueDate}}</div>
    </div>
  </div>

  <div class="nd-title-banner">NO DUES CERTIFICATE</div>

  <!-- ══ Student Details ══ -->
  <div class="nd-section">
    <div class="nd-row"><span class="nd-num">1</span><span class="nd-row-label">Student Name</span><span class="nd-row-value">{{studentName}}</span></div>
    <div class="nd-row"><span class="nd-num">2</span><span class="nd-row-label">Admission No.</span><span class="nd-row-value">{{admissionNumber}}</span></div>
    <div class="nd-row"><span class="nd-num">3</span><span class="nd-row-label">Class &amp; Section</span><span class="nd-row-value">{{className}} - {{sectionName}}</span></div>
    <div class="nd-row"><span class="nd-num">4</span><span class="nd-row-label">Roll No.</span><span class="nd-row-value">{{rollNo}}</span></div>
    <div class="nd-row"><span class="nd-num">5</span><span class="nd-row-label">Father's / Guardian's Name</span><span class="nd-row-value">{{parentName}}</span></div>
    <div class="nd-row"><span class="nd-num">6</span><span class="nd-row-label">Contact Number</span><span class="nd-row-value">{{parentMobile}}</span></div>
    <div class="nd-row"><span class="nd-num">7</span><span class="nd-row-label">Academic Session</span><span class="nd-row-value">{{academicSession}}</span></div>
    <div class="nd-row"><span class="nd-num">8</span><span class="nd-row-label">Last Date of Attendance</span><span class="nd-row-value">{{lastAttendanceDate}}</span></div>
  </div>

  <p class="nd-declaration">
    This is to certify that the above-named student has been verified against records held by the
    departments listed below at <strong>{{schoolName}}</strong>. This certificate is issued for the purpose of
    <strong>{{reasonForLeaving}}</strong>.
  </p>

  <!-- ══ Department Clearance ══ -->
  <!-- {{#departmentRows}}...{{/departmentRows}} repeats this row once per
       department returned by the API — add/remove clearance departments
       on the backend and this table updates automatically. -->
  <table class="nd-dues">
    <thead>
      <tr>
        <th>#</th>
        <th>Department</th>
        <th>Status</th>
        <th>Signature</th>
      </tr>
    </thead>
    <tbody>
      {{#departmentRows}}
      <tr>
        <td>{{index}}</td>
        <td>{{departmentName}}</td>
        <td><span class="nd-status-pill">Cleared</span></td>
        <td class="nd-sign-cell"></td>
      </tr>
      {{/departmentRows}}
    </tbody>
  </table>

  <div class="nd-remarks-row">
    <div class="nd-remarks-box">
      <span class="nd-remarks-label">Remarks (If Any)</span>
      {{remarks}}
    </div>
  </div>

  <div class="nd-final-line">No dues are pending against the student in any of the departments listed above as on {{issueDate}}.</div>

  <!-- ══ Signatures ══ -->
  <div class="nd-signatures">
    <div class="nd-sign-box"><span class="nd-sign-title">Class Teacher</span><div class="nd-sign-line">Signature</div></div>
    <div class="nd-sign-box"><span class="nd-sign-title">Accounts Office</span><div class="nd-sign-line">Signature</div></div>
    <div class="nd-sign-box"><span class="nd-sign-title">Principal / Head of School</span><div class="nd-sign-line">Signature</div></div>
  </div>

  <div class="nd-footer">This is a system-generated document from {{schoolName}} and does not require a physical seal for internal verification.</div>

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

  SALARY_SLIP: {
    key: 'SALARY_SLIP',
    label: 'Salary Slip Templates',
    shortLabel: 'Salary Slip',
    icon: Receipt,
    // Fully data-driven, same convention as FEE_RECEIPT / REPORT_CARD —
    // every value below is a {{mergeField}} resolved from the payroll
    // API response for a single teacher + salary month. Backend needs a
    // buildSalarySlipMergeData() (mirroring buildFeeReceiptMergeData())
    // that pre-formats all amounts (e.g. "₹30,000.00") server-side, so
    // the template stays purely presentational.
    //
    // Repeating sections (engine has no {{#if}}, so single/multi-item
    // arrays double as both "list" and "conditional row"):
    //   {{#earnings}}    → one row per earning component (Basic, HRA,
    //                      Conveyance, Academic Allowance, Other, etc.)
    //   {{#deductions}}  → one row per deduction component (Unpaid Leave,
    //                      Unauthorized Absence, Late Mark Penalty, PF,
    //                      Professional Tax, TDS, Loan, Other, etc.)
    // Both arrays are entirely backend-driven — add/remove a salary
    // component on the backend and this table updates automatically,
    // no template edit needed (same pattern as subjectMarks/components).
    stub: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Salary Slip</title></head>
<body style="margin:0;padding:14px;background:#eef2f7;">
<div class="ss-wrap">
<style>
  .ss-wrap { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(15,23,42,0.12); color: #1f2937; border: 1px solid #e5e7eb; }

  .ss-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(135deg,#1e293b,#334155); color: #fff; padding: 18px 22px; }
  .ss-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .ss-logo { width: 46px; height: 46px; border-radius: 10px; background: rgba(255,255,255,.18); flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; font-weight: 800; font-size: 15px; border: 1.5px solid rgba(255,255,255,.5); }
  .ss-logo img { width: 100%; height: 100%; object-fit: cover; }
  .ss-school-name { margin: 0; font-size: 16px; font-weight: 800; letter-spacing: -.1px; }
  .ss-school-meta { margin: 2px 0 0; font-size: 10px; opacity: .85; line-height: 1.5; }
  .ss-badge-box { flex-shrink: 0; text-align: right; }
  .ss-badge { font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .ss-badge-sub { font-size: 9.5px; opacity: .8; margin-top: 2px; }

  .ss-band { background: #1e293b; color: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 7px 22px; }

  .ss-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid #e5e7eb; }
  .ss-info-col { padding: 12px 22px; }
  .ss-info-col:first-child { border-right: 1px solid #e5e7eb; }
  .ss-kv-row { display: flex; gap: 6px; font-size: 11.5px; margin-bottom: 5px; }
  .ss-kv-row .ss-k { font-weight: 700; min-width: 110px; color: #6b7280; flex-shrink: 0; }
  .ss-kv-row .ss-v { color: #111827; font-weight: 600; }

  .ss-attendance { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #e5e7eb; }
  .ss-att-cell { background: #f8fafc; padding: 10px 8px; text-align: center; }
  .ss-att-label { font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #64748b; margin-bottom: 2px; }
  .ss-att-value { font-size: 15px; font-weight: 800; color: #111827; }
  .ss-att-status { grid-column: span 4; background: #eef2ff; padding: 7px; text-align: center; font-size: 10.5px; font-weight: 700; color: #4338ca; }

  table.ss-items { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  table.ss-items td { padding: 7px 22px; border-bottom: 1px solid #f1f2f6; }
  table.ss-items td:last-child { text-align: right; font-weight: 600; }
  table.ss-items tr.ss-total-row td { font-weight: 800; border-top: 2px solid #1e293b; border-bottom: none; padding-top: 10px; }
  .ss-earn-amt { color: #15803d; }
  .ss-ded-amt { color: #b91c1c; }

  .ss-net-band { display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: #fff; padding: 14px 22px; margin-top: 4px; }
  .ss-net-label { font-size: 13px; font-weight: 800; }
  .ss-net-value { font-size: 19px; font-weight: 800; }
  .ss-net-words { padding: 10px 22px; font-size: 10.5px; font-style: italic; color: #4b5563; border-bottom: 1px solid #e5e7eb; }

  .ss-signatures { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; padding: 18px 22px; }
  .ss-sign-box { border-top: 1px solid #9ca3af; text-align: center; padding-top: 6px; font-size: 10px; color: #4b5563; }
  .ss-sign-box b { display: block; font-size: 10.5px; color: #111827; margin-top: 2px; }

  .ss-footer { text-align: center; font-size: 9.5px; color: #9ca3af; background: #fafafa; border-top: 1px solid #f1f2f6; padding: 8px 22px; }

  @media print {
    body { background: #fff; padding: 0; }
    .ss-wrap { box-shadow: none; border: 1px solid #ccc; }
  }
</style>

  <!-- ══ Header ══ -->
  <div class="ss-header">
    <div class="ss-header-left">
      <div class="ss-logo"><img src="{{schoolLogo}}" alt="{{schoolInitials}}" onerror="this.onerror=null;this.src='{{schoolLogoFallback}}'"></div>
      <div>
        <h1 class="ss-school-name">{{schoolName}}</h1>
        <div class="ss-school-meta">{{schoolAddress}}</div>
        <div class="ss-school-meta">{{schoolPhone}} &middot; {{schoolEmail}}</div>
      </div>
    </div>
    <div class="ss-badge-box">
      <div class="ss-badge">Salary Slip</div>
      <div class="ss-badge-sub">{{salaryMonth}}</div>
    </div>
  </div>

  <!-- ══ Employee Details ══ -->
  <div class="ss-band">Employee Details</div>
  <div class="ss-info-grid">
    <div class="ss-info-col">
      <div class="ss-kv-row"><span class="ss-k">Employee Name</span><span class="ss-v">{{employeeName}}</span></div>
      <div class="ss-kv-row"><span class="ss-k">Employee ID</span><span class="ss-v">{{employeeId}}</span></div>
      <div class="ss-kv-row"><span class="ss-k">Designation</span><span class="ss-v">{{designation}}</span></div>
      <div class="ss-kv-row"><span class="ss-k">Department</span><span class="ss-v">{{department}}</span></div>
    </div>
    <div class="ss-info-col">
      <div class="ss-kv-row"><span class="ss-k">Date of Joining</span><span class="ss-v">{{dateOfJoining}}</span></div>
      <div class="ss-kv-row"><span class="ss-k">Salary Month</span><span class="ss-v">{{salaryMonth}}</span></div>
      <div class="ss-kv-row"><span class="ss-k">Payment Date</span><span class="ss-v">{{paymentDate}}</span></div>
      <div class="ss-kv-row"><span class="ss-k">Payment Mode</span><span class="ss-v">{{paymentMode}}</span></div>
    </div>
  </div>

  <!-- ══ Attendance Summary ══ -->
  <div class="ss-band">Attendance Summary</div>
  <div class="ss-attendance">
    <div class="ss-att-cell"><div class="ss-att-label">Working Days</div><div class="ss-att-value">{{workingDays}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Present Days</div><div class="ss-att-value">{{presentDays}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Paid Leave</div><div class="ss-att-value">{{paidLeaveDays}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Unpaid Leave</div><div class="ss-att-value">{{unpaidLeaveDays}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Unauthorized Absence</div><div class="ss-att-value">{{unauthorizedAbsenceDays}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Half Day</div><div class="ss-att-value">{{halfDayCount}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Late Marks</div><div class="ss-att-value">{{lateMarksCount}}</div></div>
    <div class="ss-att-cell"><div class="ss-att-label">Status</div><div class="ss-att-value" style="font-size:11px;">{{attendanceStatus}}</div></div>
  </div>

  <!-- ══ Earnings ══ -->
  <div class="ss-band">Earnings</div>
  <table class="ss-items">
    {{#earnings}}
    <tr><td>{{label}}</td><td class="ss-earn-amt">{{amountFormatted}}</td></tr>
    {{/earnings}}
    <tr class="ss-total-row"><td>Gross Salary</td><td class="ss-earn-amt">{{grossSalaryFormatted}}</td></tr>
  </table>

  <!-- ══ Deductions ══ -->
  <div class="ss-band">Deductions</div>
  <table class="ss-items">
    {{#deductions}}
    <tr><td>{{label}}</td><td class="ss-ded-amt">{{amountFormatted}}</td></tr>
    {{/deductions}}
    <tr class="ss-total-row"><td>Total Deductions</td><td class="ss-ded-amt">{{totalDeductionsFormatted}}</td></tr>
  </table>

  <!-- ══ Net Pay ══ -->
  <div class="ss-net-band">
    <span class="ss-net-label">Net Salary Payable</span>
    <span class="ss-net-value">{{netSalaryFormatted}}</span>
  </div>
  <div class="ss-net-words">Net Salary in Words: {{netSalaryInWords}}</div>

  <!-- ══ Signatures ══ -->
  <div class="ss-signatures">
    <div class="ss-sign-box">Prepared By<b>HR / Accounts</b></div>
    <div class="ss-sign-box">Verified By<b>School Administration</b></div>
    <div class="ss-sign-box">Authorized By<b>Principal</b></div>
  </div>

  <div class="ss-footer">Payroll Status: {{payrollStatus}} &middot; Generated On: {{generatedAt}} &middot; This is a computer-generated salary slip.</div>

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
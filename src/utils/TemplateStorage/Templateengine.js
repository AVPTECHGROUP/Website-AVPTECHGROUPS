// ─────────────────────────────────────────────────────────────────────────
// Tiny mustache-style merge engine for print templates.
//
// Supports:
//   {{fieldName}}            -> scalar value substitution
//   {{nested.field}}         -> dot-path lookup
//   {{#subjectMarks}}...{{/subjectMarks}}
//                             -> repeats the block once per array item,
//                                with {{field}} inside resolved against
//                                each item in the array
//
// This intentionally stays dependency-free (no handlebars/mustache lib)
// so templates can be safely rendered client-side from raw HTML strings
// saved by the Template editor.
// ─────────────────────────────────────────────────────────────────────────

function getPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

// ₹ formatted with 2 decimals + Indian grouping, e.g. 1300 -> "₹1,300.00"
function formatCurrency(amount) {
    const n = Number(amount) || 0
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// "TUITION_FEE" -> "Tuition Fee"
function formatComponentLabel(type) {
    if (!type) return '—'
    return String(type)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

// JS Date only reliably parses up to 3 fractional-second digits; backend
// timestamps like "2026-07-21T15:02:29.199059362" carry 9, which some
// browsers silently fail to parse as Invalid Date. Truncate first.
function normalizeTimestamp(val) {
    if (typeof val !== 'string') return val
    return val.replace(/(\.\d{3})\d+/, '$1')
}

// Reference-number field label varies by payment mode, same mapping used
// on the Collections screen's collect modal — keeps the printed receipt
// consistent with how the payment was actually recorded.
const REFERENCE_LABEL_BY_MODE = {
    ONLINE: 'Transaction ID',
    CHEQUE: 'Cheque Number',
    DD: 'Demand Draft Number',
}

/**
 * Maps a fee-collection / receipt API response (see POST /v1/fees/collect
 * or GET /v1/fees/receipts/{id}) + school info into the flat data object
 * the merge engine expects for the FEE_RECEIPT template. Mirrors
 * buildReportCardMergeData below — keep field names aligned with the raw
 * API response so template authors can reference the same names.
 *
 * Accepts either the raw API receipt shape directly:
 *   { receiptNo, studentName, admissionNumber, className, sectionName,
 *     feePeriodName, amountPaid, transportAmount, discount, discountReason,
 *     lateFine, totalDue, balanceAfter, paymentMode, paymentDate,
 *     referenceNo, remarks, collectedBy, parentName, parentMobile,
 *     components: [{ componentType, customName, amount, displayOrder }] }
 * ...or the pre-normalized shape some screens already build locally
 * (class/section/period/parentPhone/recordedBy/rollNo/generatedAt/
 * academicComponents/transportComponents etc.) — same fallback pattern
 * FeeReceiptPrint.jsx already used before this template migration.
 */
export function buildFeeReceiptMergeData(receipt = {}, school = {}) {
    const schoolName = school?.name || school?.schoolName || 'School Name'

    const components =
        (receipt.components?.length ? receipt.components : receipt.academicComponents) || []

    const discount = Number(receipt.discount) || 0
    const lateFine = Number(receipt.lateFine) || 0
    const transportAmount = Number(receipt.transportAmount ?? receipt.transportCollected) || 0
    // TODO: confirm with backend whether `amountPaid` already folds in
    // transportAmount/lateFine or is academic-only. Assuming here it's the
    // academic collection (matches the sample response, where a single
    // TUITION_FEE component of 1300 == amountPaid of 1300) and transport is
    // collected as a separate additional amount on top of it.
    const amountPaid = Number(receipt.amountPaid ?? receipt.academicCollected) || 0
    const grandTotal = amountPaid + transportAmount

    const paymentMode = receipt.paymentMode || 'CASH'
    const referenceNo = receipt.referenceNo || ''
    const referenceLabel = REFERENCE_LABEL_BY_MODE[String(paymentMode).toUpperCase()] || 'Ref. No.'

    const paymentDateRaw = receipt.paymentDate || receipt.generatedAt || receipt.date
    let paymentDateLine = '—'
    if (paymentDateRaw) {
        try {
            const d = new Date(normalizeTimestamp(paymentDateRaw))
            if (!isNaN(d.getTime())) {
                const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                // Only append a time portion if the raw value actually carried one
                // (plain "2026-07-27" date-only strings shouldn't show "12:00 AM").
                const hasTime = /T\d{2}:\d{2}/.test(String(paymentDateRaw))
                const timePart = hasTime ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''
                paymentDateLine = timePart ? `${datePart}, ${timePart}` : datePart
            }
        } catch {
            paymentDateLine = String(paymentDateRaw)
        }
    }

    return {
        // School
        schoolName,
        schoolAddress: school?.address || school?.schoolAddress || '',
        schoolPhone: school?.phone || school?.schoolPhone || '',
        schoolEmail: school?.email || school?.schoolEmail || '',
        schoolLogo: school?.logoUrl || school?.schoolLogo || '',
        // Falls back to a real placeholder logo image (passed in by the caller,
        // same default asset Sidebar.jsx uses) if the school has no logo set
        // or the logo URL 404s at print time — so the receipt always shows an
        // actual image, never just text initials.
        schoolLogoFallback: school?.logoFallback || school?.schoolLogo || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        // Student
        admissionNumber: receipt.admissionNumber || receipt.studentCode || '—',
        rollNo: receipt.rollNo || receipt.studentId || '—',
        studentName: receipt.studentName || '—',
        className: receipt.className || receipt.class || '—',
        sectionName: receipt.sectionName || receipt.section || '—',
        parentName: receipt.parentName || '—',
        parentMobile: receipt.parentMobile || receipt.parentPhone || '—',

        // Receipt meta
        receiptNo: receipt.receiptNo || '—',
        feePeriodName: receipt.feePeriodName || receipt.period || '—',
        paymentDateLine,
        paymentMode,
        referenceLabel,
        referenceNo,
        collectedBy: receipt.collectedBy || receipt.recordedBy || 'Admin',
        remarks: receipt.remarks || '',

        // Amounts
        amountPaidFormatted: formatCurrency(grandTotal),
        transportAmountFormatted: formatCurrency(transportAmount),
        discountFormatted: formatCurrency(discount),
        discountReason: receipt.discountReason || '',
        discountReasonSuffix: receipt.discountReason ? ` (${receipt.discountReason})` : '',
        lateFineFormatted: formatCurrency(lateFine),
        totalDueFormatted: formatCurrency(receipt.totalDue),
        balanceAfterFormatted: formatCurrency(receipt.balanceAfter),

        // Loop data — {{#components}}...{{/components}}
        components: components.map((c) => ({
            label: c.customName || c.name || formatComponentLabel(c.componentType),
            amountFormatted: formatCurrency(c.amount),
        })),

        // Conditional single-item arrays — see stub comments in
        // templateTypesMeta.js for why these are arrays and not booleans.
        transportRows: transportAmount > 0 ? [{ transportAmountFormatted: formatCurrency(transportAmount) }] : [],
        discountRows: discount > 0 ? [{ discountFormatted: formatCurrency(discount), discountReasonSuffix: receipt.discountReason ? ` (${receipt.discountReason})` : '' }] : [],
        lateFineRows: lateFine > 0 ? [{ lateFineFormatted: formatCurrency(lateFine) }] : [],
        referenceRows: referenceNo ? [{ referenceLabel, referenceNo }] : [],
        remarksRows: receipt.remarks ? [{ remarks: receipt.remarks }] : [],
    }
}

function escapeForDisplay(val) {
    if (val === undefined || val === null) return ''
    return String(val)
}

export function renderTemplate(html, data = {}) {
    if (!html) return ''
    let out = html

    // 1) Repeating sections: {{#key}} ... {{/key}}
    out = out.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_match, key, inner) => {
        const list = data[key]
        if (!Array.isArray(list) || list.length === 0) return ''
        return list
            .map((item) =>
                inner.replace(/{{\s*([\w.]+)\s*}}/g, (_m, field) => escapeForDisplay(getPath(item, field)))
            )
            .join('')
    })

    // 2) Scalar fields: {{key}} or {{a.b}}
    out = out.replace(/{{\s*([\w.]+)\s*}}/g, (_match, path) => escapeForDisplay(getPath(data, path)))

    return out
}

/**
 * Maps a report-card API response (see getStudentReportCard) + school info
 * + live remarks-edit state into the flat data object the merge engine
 * expects. Keep field names aligned with the raw API response so template
 * authors can reference the same names they see in the API docs.
 */
export function buildReportCardMergeData(student, school, remarksOverride = {}) {
    const subjects = student?.subjectMarks ?? []
    const pct = student?.percentage
    const teacherRemarks = remarksOverride.teacherRemarks ?? student?.teacherRemarks ?? ''
    const principalRemarks = remarksOverride.principalRemarks ?? student?.principalRemarks ?? ''
    const schoolName = school?.name || 'School Name'

    return {
        // School
        schoolName,
        schoolAddress: school?.address || '',
        schoolBoard: school?.board || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        // Student / exam
        studentName: student?.studentName ?? '—',
        className: student?.className ?? '—',
        sectionName: student?.sectionName ?? '—',
        rollNo: student?.rollNumber ?? '—',
        rollNumber: student?.rollNumber ?? '—',
        admissionNumber: student?.admissionNumber ?? '—',
        examName: student?.examName ?? '—',
        examTypeName: student?.examTypeName ?? '—',
        academicYear: student?.academicYear ?? '',
        dob: student?.dob ?? '',

        // Results
        totalMarksObtained: student?.totalMarksObtained ?? '—',
        totalMaxMarks: student?.totalMaxMarks ?? '—',
        percentage: pct != null ? Number(pct).toFixed(1) : '—',
        overallGrade: student?.overallGrade ?? '—',
        classRank: student?.classRank ?? '—',
        sectionRank: student?.sectionRank ?? '—',
        resultStatus: student?.isPassed ? 'PASSED' : 'FAILED',

        // Remarks
        teacherRemarks,
        principalRemarks,
        remarks: teacherRemarks || principalRemarks || '',

        generatedAt: student?.generatedAt
            ? new Date(student.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '',

        // Loop data — use as {{#subjectMarks}} ... {{/subjectMarks}} in the template
        subjectMarks: subjects.map((s) => {
            const max = s.maxMarks || 0
            const scored = Number(s.totalMarks) || 0
            const pctOfMax = !s.isAbsent && max > 0 ? Math.round((scored / max) * 100) : 0
            const isPass = !s.isAbsent && max > 0 ? (scored / max) * 100 >= 33 : false
            return {
                subjectName: s.subjectName ?? '',
                theoryMarks: s.theoryMarks ?? '—',
                practicalMarks: s.practicalMarks ?? '—',
                totalMarks: s.isAbsent ? 'AB' : s.totalMarks,
                maxMarks: s.maxMarks ?? '',
                percentage: pctOfMax,
                grade: s.isAbsent ? 'AB' : (s.grade ?? ''),
                remarks: s.remarks || '—',
                status: s.isAbsent ? 'Absent' : (isPass ? 'Pass' : 'Fail'),
            }
        }),
    }
}
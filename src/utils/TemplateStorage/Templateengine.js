// ─────────────────────────────────────────────────────────────────────────
// Mustache-style merge engine for print templates.
// ─────────────────────────────────────────────────────────────────────────

function getPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function formatCurrency(amount) {
    const n = Number(amount) || 0
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatComponentLabel(type) {
    if (!type) return '—'
    return String(type)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function normalizeTimestamp(val) {
    if (typeof val !== 'string') return val
    return val.replace(/(\.\d{3})\d+/, '$1')
}

const REFERENCE_LABEL_BY_MODE = {
    ONLINE: 'Transaction ID',
    CHEQUE: 'Cheque Number',
    DD: 'Demand Draft Number',
}

/**
 * Maps student ID card details + school details into the data object expected
 * by the ID_CARD template merge engine (Front + Back side support)[cite: 3, 10].
 */
export function buildIdCardMergeData(student = {}, school = {}) {
    const schoolName = school?.name || school?.schoolName || 'School Name';

    const emergencyContact = student.emergencyContact || student.contact || '';
    const transportRoute = student.transportRoute || student.route || '';
    const houseName = student.houseName || student.house || '';

    return {
        // Front Side Details
        schoolName,
        schoolLogo: school?.logoUrl || school?.logo || school?.schoolLogo || '',
        schoolLogoFallback: school?.logoFallback || school?.schoolLogo || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        studentPhoto: student.profileImageUrl || '',
        studentName: student.name || '—',
        admissionNumber: student.admissionNumber || `ADM-${1000 + (student.id || 1)}`,
        className: student.className || '—',
        sectionName: student.sectionName || '—',
        rollNo: student.roll || '—',
        dateOfBirth: student.dateOfBirth || student.dob || '01-01-2015',
        bloodGroup: student.bloodGroup || 'O+',
        academicSession: student.academicSession || '2026-27',
        sessionEndDate: student.sessionEndDate || '31 Mar 2027',

        // Back Side Details
        parentName: student.father || student.parentName || '—',
        parentMobile: student.contact || student.parentMobile || '—',
        studentAddress: student.address || school?.address || 'Lucknow, Uttar Pradesh',

        emergencyContactRows: emergencyContact ? [{ emergencyContact }] : [],
        transportRows: transportRoute ? [{ transportRoute }] : [],
        houseRows: houseName ? [{ houseName }] : [],

        qrCodeUrl: student.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(student.roll || student.name || 'STUDENT')}`,
        schoolAddress: school?.address || school?.schoolAddress || '',
        schoolPhone: school?.phone || school?.schoolPhone || school?.mobile || '',
    };
}

/**
 * Maps gate pass record + school details into the data object expected
 * by the GATE_PASS template merge engine[cite: 3, 10].
 */
export function buildGatePassMergeData(student = {}, school = {}) {
    const schoolName = school?.name || school?.schoolName || 'School Name';

    return {
        // School Details
        schoolName,
        schoolTagline: school?.tagline || 'Excellence in Education',
        schoolAddress: school?.address || school?.schoolAddress || '',
        schoolPhone: school?.phone || school?.schoolPhone || school?.mobile || '',
        schoolWebsite: school?.website || '',
        schoolEmail: school?.email || school?.schoolEmail || '',
        schoolLogo: school?.logoUrl || school?.logo || school?.schoolLogo || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        // Pass Metadata
        gatePassNo: student.gatePassNo || `GP-${2000 + (student.id || 1)}`,
        issueDate: student.issueDate || new Date().toISOString().split('T')[0],

        // Student Details
        studentName: student.name || '—',
        className: student.className || '—',
        sectionName: student.sectionName || '—',
        rollNo: student.roll || '—',
        parentMobile: student.contact || student.parentMobile || '—',
        parentName: student.father || student.parentName || '—',

        // Leaving Details
        leavingDate: student.leavingDate || new Date().toISOString().split('T')[0],
        leavingTime: student.leavingTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        reasonDetails: student.reasonDetails || 'Early Departure / Personal Reason',

        // Pickup Details
        pickupPersonName: student.pickupPersonName || student.father || '—',
        pickupRelation: student.pickupRelation || 'Father / Guardian',
        pickupContact: student.pickupContact || student.contact || '—',
        pickupIdProof: student.pickupIdProof || 'Government ID Card',
    };
}

/**
 * Maps student cycle pass record + school details into the data object expected
 * by the CYCLE_STAND_PASS template merge engine[cite: 3, 10].
 */
export function buildCyclePassMergeData(student = {}, school = {}) {
    const schoolName = school?.name || school?.schoolName || 'School Name';

    return {
        schoolName,
        schoolAddress: school?.address || school?.schoolAddress || '',
        schoolPhone: school?.phone || school?.schoolPhone || school?.mobile || '',
        schoolEmail: school?.email || school?.schoolEmail || '',
        schoolLogo: school?.logoUrl || school?.logo || school?.schoolLogo || '',
        schoolLogoFallback: school?.logoFallback || school?.schoolLogo || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        studentName: student.name || '—',
        rollNo: student.roll || '—',
        className: student.className || '—',
        sectionName: student.sectionName || '—',
        studentPhoto: student.profileImageUrl || '',

        passNo: student.cycleReg || `CYC-${1000 + (student.id || 1)}`,
        academicSession: student.academicSession || '2026-27',
    };
}

/**
 * Maps visitor record + school details into the data object expected
 * by the VISITOR_PASS template merge engine[cite: 3, 10].
 */
export function buildVisitorPassMergeData(visitor = {}, school = {}) {
    const schoolName = school?.name || school?.schoolName || 'School Name';

    return {
        schoolName,
        schoolAddress: school?.address || school?.schoolAddress || '',
        schoolPhone: school?.phone || school?.schoolPhone || school?.mobile || '',
        schoolEmail: school?.email || school?.schoolEmail || '',
        schoolLogo: school?.logoUrl || school?.logo || school?.schoolLogo || '',
        schoolLogoFallback: school?.logoFallback || school?.schoolLogo || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        passNo: visitor.passNo || `VP-${1000 + (visitor.id || 1)}`,

        visitorName: visitor.name || '—',
        visitorMobile: visitor.mobile || '—',
        idProofType: visitor.idType || '—',
        idProofNumber: visitor.idNum || '—',

        purposeOfVisit: visitor.purpose || '—',
        personToMeet: visitor.personMeet || '—',
        studentOrEmployeeName: visitor.personMeet || '—',
        classSectionDept: visitor.classSecOrDept || '—',
        vehicleNumber: visitor.vehicle || '—',
        remarks: visitor.remarks || '—',

        dateOfVisit: visitor.date || new Date().toISOString().split('T')[0],
        entryTime: visitor.entry || '—',
        expectedExitTime: visitor.exit || '—',
    };
}

export function buildFeeReceiptMergeData(receipt = {}, school = {}) {
    const schoolName = school?.name || school?.schoolName || 'School Name'
    const components = (receipt.components?.length ? receipt.components : receipt.academicComponents) || []

    const discount = Number(receipt.discount) || 0
    const lateFine = Number(receipt.lateFine) || 0
    const transportAmount = Number(receipt.transportAmount ?? receipt.transportCollected) || 0
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
                const hasTime = /T\d{2}:\d{2}/.test(String(paymentDateRaw))
                const timePart = hasTime ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''
                paymentDateLine = timePart ? `${datePart}, ${timePart}` : datePart
            }
        } catch {
            paymentDateLine = String(paymentDateRaw)
        }
    }

    return {
        schoolName,
        schoolAddress: school?.address || school?.schoolAddress || '',
        schoolPhone: school?.phone || school?.schoolPhone || '',
        schoolEmail: school?.email || school?.schoolEmail || '',
        schoolLogo: school?.logoUrl || school?.schoolLogo || '',
        schoolLogoFallback: school?.logoFallback || school?.schoolLogo || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

        admissionNumber: receipt.admissionNumber || receipt.studentCode || '—',
        rollNo: receipt.rollNo || receipt.studentId || '—',
        studentName: receipt.studentName || '—',
        className: receipt.className || receipt.class || '—',
        sectionName: receipt.sectionName || receipt.section || '—',
        parentName: receipt.parentName || '—',
        parentMobile: receipt.parentMobile || receipt.parentPhone || '—',

        receiptNo: receipt.receiptNo || '—',
        feePeriodName: receipt.feePeriodName || receipt.period || '—',
        paymentDateLine,
        paymentMode,
        referenceLabel,
        referenceNo,
        collectedBy: receipt.collectedBy || receipt.recordedBy || 'Admin',
        remarks: receipt.remarks || '',

        amountPaidFormatted: formatCurrency(grandTotal),
        transportAmountFormatted: formatCurrency(transportAmount),
        discountFormatted: formatCurrency(discount),
        discountReason: receipt.discountReason || '',
        discountReasonSuffix: receipt.discountReason ? ` (${receipt.discountReason})` : '',
        lateFineFormatted: formatCurrency(lateFine),
        totalDueFormatted: formatCurrency(receipt.totalDue),
        balanceAfterFormatted: formatCurrency(receipt.balanceAfter),

        components: components.map((c) => ({
            label: c.customName || c.name || formatComponentLabel(c.componentType),
            amountFormatted: formatCurrency(c.amount),
        })),

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

    out = out.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_match, key, inner) => {
        const list = data[key]
        if (!Array.isArray(list) || list.length === 0) return ''
        return list
            .map((item) =>
                inner.replace(/{{\s*([\w.]+)\s*}}/g, (_m, field) => escapeForDisplay(getPath(item, field)))
            )
            .join('')
    })

    out = out.replace(/{{\s*([\w.]+)\s*}}/g, (_match, path) => escapeForDisplay(getPath(data, path)))

    return out
}

export function buildReportCardMergeData(student, school, remarksOverride = {}) {
    const subjects = student?.subjectMarks ?? []
    const pct = student?.percentage
    const teacherRemarks = remarksOverride.teacherRemarks ?? student?.teacherRemarks ?? ''
    const principalRemarks = remarksOverride.principalRemarks ?? student?.principalRemarks ?? ''
    const schoolName = school?.name || 'School Name'

    return {
        schoolName,
        schoolAddress: school?.address || '',
        schoolBoard: school?.board || '',
        schoolInitials: schoolName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),

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

        totalMarksObtained: student?.totalMarksObtained ?? '—',
        totalMaxMarks: student?.totalMaxMarks ?? '—',
        percentage: pct != null ? Number(pct).toFixed(1) : '—',
        overallGrade: student?.overallGrade ?? '—',
        classRank: student?.classRank ?? '—',
        sectionRank: student?.sectionRank ?? '—',
        resultStatus: student?.isPassed ? 'PASSED' : 'FAILED',

        teacherRemarks,
        principalRemarks,
        remarks: teacherRemarks || principalRemarks || '',

        generatedAt: student?.generatedAt
            ? new Date(student.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '',

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
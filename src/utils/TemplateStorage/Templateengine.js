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
const BASE_URL_V1 = import.meta.env.VITE_API_BASE_V1;
const BASE_URL = import.meta.env.VITE_API_BASE;
const BASE_URL_DOUBLE_V1 = import.meta.env.VITE_API_BASE_DOUBLE_V1;
const BASE_URL_DOUBLE = import.meta.env.VITE_API_BASE_DOUBLE;

export const API_ENDPOINTS = {

  // ─── Academic Years ──────────────────────────────────────────────────────────
  ACADEMIC_YEARS: `${BASE_URL_V1}/academic-years`,
  CURRENT_ACADEMIC_YEAR: `${BASE_URL_V1}/academic-years/current`,

  academicYearById: (id) => `${BASE_URL_V1}/academic-years/${id}`,
  setCurrentAcademicYear: (id) => `${BASE_URL_V1}/academic-years/${id}/set-current`,
  closeAcademicYear: (id) => `${BASE_URL_V1}/academic-years/${id}/close`,

  // ─── Circulars 
  CIRCULARS: `${BASE_URL_V1}/circulars`,
  CIRCULARS_PENDING: `${BASE_URL_V1}/circulars/pending-approval`,
  circularById: (id) => `${BASE_URL_V1}/circulars/${id}`,
  circularAttachments: (id) => `${BASE_URL_V1}/circulars/${id}/attachments`,
  circularApprove: (id) => `${BASE_URL_V1}/circulars/${id}/approve`,
  circularReject: (id) => `${BASE_URL_V1}/circulars/${id}/reject`,

  //Templates-->

  // ─── Print Templates ───────────────────────────────────────────────────────
  PRINT_TEMPLATES: `${BASE_URL_V1}/print-templates`,

  printTemplateById: (id) =>
    `${BASE_URL_V1}/print-templates/${id}`,

  printTemplateSetDefault: (id) =>
    `${BASE_URL_V1}/print-templates/${id}/set-default`,

  printTemplateDefault: (type) =>
    `${BASE_URL_V1}/print-templates/default?type=${encodeURIComponent(type)}`,

  // ─── School Events 
  SCHOOL_EVENTS: `${BASE_URL_V1}/school-events`,
  EVENTS_PENDING: `${BASE_URL_V1}/school-events/pending-approval`,
  eventById: (id) => `${BASE_URL_V1}/school-events/${id}`,
  eventAttachments: (id) => `${BASE_URL_V1}/school-events/${id}/attachments`,
  eventApprove: (id) => `${BASE_URL_V1}/school-events/${id}/approve`,

  // ─── Notifications 
  NOTIFICATIONS: `${BASE_URL_V1}/notifications`,
  USER_DEVICE_TOKEN: `${BASE_URL_V1}/notifications/device-token/user`,
  PARENT_DEVICE_TOKEN: `${BASE_URL_V1}/notifications/device-token/parent`,

  // ─── Attendance 
  ATTENDANCE_ENROLL: `${BASE_URL}/attendance/enroll`,
  ATTENDANCE_SUMMARY_CARD: `${BASE_URL}/attendance/students/summary?`,
  ATTENDANCE_MARK: `${BASE_URL}/attendance/mark`,
  ATTENDANCE_MANUAL_REVIEW: `${BASE_URL}/attendance/manual-review`,
  ATTENDANCE_PENDING: `${BASE_URL}/attendance/pending-approvals`,
  ATTENDANCE_PENDING_COUNT: `${BASE_URL}/attendance/pending-approvals/count`,
  ATTENDANCE_STATS: `${BASE_URL}/attendance/admin/statistics`,
  ATTENDANCE_ROSTER: `${BASE_URL}/attendance/students/roster`,
  ATTENDANCE_MANUAL_MARK: `${BASE_URL}/attendance/students/manual-mark`,
  ATTENDANCE_GROUP_MARK: `${BASE_URL}/attendance/students/group-mark`,
  ATTENDANCE_ENROLL_STAFF: `${BASE_URL}/attendance/enrollment/staff`,
  ATTENDANCE_ENROLL_STATS: `${BASE_URL}/attendance/enrollment/stats`,
  ATTENDANCE_ENROLL_STUDENTS: `${BASE_URL}/attendance/enrollment/students`,
  ATTENDANCE_ALL: `${BASE_URL}/attendance/admin/all`,
  ATTENDANCE_EXPORT_CSV: `${BASE_URL}/attendance/admin/export-csv`,
  ATTENDANCE_MANUAL_MARK_BULK: `${BASE_URL}/attendance/students/manual-mark/bulk`,
  ATTENDANCE_MANUAL_REVIEW_BULK: `${BASE_URL}/attendance/manual-review/bulk`,

  attendanceApprove: (id) => `${BASE_URL}/attendance/${id}/approve`,
  attendanceUnmark: (id) => `${BASE_URL}/attendance/students/${id}/unmark`,
  attendanceEnrollUser: (id) => `${BASE_URL}/attendance/enrollment/${id}`,
  attendanceSectionStats: (sectionId) => `${BASE_URL}/attendance/enrollment/stats/section/${sectionId}`,
  attendanceUser: (userId) => `${BASE_URL}/attendance/user/${userId}`,
  attendanceUserMonthly: (userId) => `${BASE_URL}/attendance/user/${userId}/monthly`,
  attendanceUserToday: (userId) => `${BASE_URL}/attendance/user/${userId}/today`,

  // ─── Auth 
  AUTH_LOGIN: `${BASE_URL_V1}/auth/login`,
  AUTH_LOGOUT: `${BASE_URL_V1}/auth/logout`,
  AUTH_VERIFY: `${BASE_URL_V1}/auth/verify`,
  AUTH_REFRESH: `${BASE_URL_V1}/auth/refresh`,

  // ─── School Events (Additions) ───
  eventReject: (id) => `${BASE_URL_V1}/school-events/${id}/reject`,

  // ─── Classes & Sections ───
  CLASSES: `${BASE_URL_V1}/classes`,
  SECTIONS: `${BASE_URL_V1}/sections`,
  TEACHERS_DROPDOWN: `${BASE_URL_V1}/users/teachers`,

  classesBySchool: (schoolId) => `${BASE_URL_V1}/classes/school/${schoolId}`,
  activeClassesBySchool: (schoolId) => `${BASE_URL_V1}/classes/school/${schoolId}/active`,
  classById: (id) => `${BASE_URL_V1}/classes/${id}`,

  sectionsByClass: (classId) => `${BASE_URL_V1}/sections/class/${classId}`,
  activeSectionsByClass: (classId) => `${BASE_URL_V1}/sections/class/${classId}/active`,
  sectionById: (id) => `${BASE_URL_V1}/sections/${id}`,

  // ─── Dashboard ───
  DASHBOARD_STATS: `${BASE_URL_V1}/dashboard/stats`,
  DASHBOARD_HOLIDAYS: `${BASE_URL_V1}/dashboard/upcoming-holidays`,

  // ─── Exams ───
  EXAMS: `${BASE_URL_DOUBLE_V1}/exams`,
  EXAM_TYPES: `${BASE_URL_DOUBLE_V1}/exams/exam-types`,
  GRADE_CONFIGS: `${BASE_URL_DOUBLE_V1}/exams/grade-configs`,
  EXAM_EVENTS: `${BASE_URL_DOUBLE_V1}/exam-events`,

  gradeConfigById: (id) => `${BASE_URL_DOUBLE_V1}/exams/grade-configs/${id}`,
  examSubjects: (id) => `${BASE_URL_DOUBLE_V1}/exams/${id}/subjects`,
  examSubjectById: (examId, configId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/subjects/${configId}`,
  examSubjectsBulk: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/subjects/bulk`,
  examDeclareResult: (id) => `${BASE_URL_DOUBLE_V1}/exams/${id}/declare-result`,
  examMarksSheet: (examId, sectionSubjectId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/marks/sheet/${sectionSubjectId}`,
  examMarks: (id) => `${BASE_URL_DOUBLE_V1}/exams/${id}/marks`,
  examMarksById: (examId, marksId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/marks/${marksId}`,
  examMarksBulk: (id) => `${BASE_URL_DOUBLE_V1}/exams/${id}/marks/bulk`,
  reportCardsGenerate: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/report-cards/generate`,
  reportCards: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/report-cards`,
  studentReportCard: (examId, studentId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/report-cards/${studentId}`,
  studentRemarks: (examId, studentId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/report-cards/${studentId}/remarks`,
  studentReportHistory: (studentId) => `${BASE_URL_DOUBLE_V1}/students/${studentId}/report-cards`,
  classResultSummary: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/reports/class-result`,
  failedStudents: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/reports/failed-students`,
  subjectAnalysis: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/reports/subject-analysis`,
  examToppers: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/reports/toppers`,
  gradeDistribution: (examId) => `${BASE_URL_DOUBLE_V1}/exams/${examId}/reports/grade-distribution`,
  classPerformanceTrend: (classId) => `${BASE_URL_DOUBLE_V1}/classes/${classId}/analytics/trend`,

  examTypeById: (id) => `${BASE_URL_DOUBLE_V1}/exams/exam-types/${id}`,
  examTypeActivate: (id) => `${BASE_URL_DOUBLE_V1}/exams/exam-types/${id}/activate`,
  examTypeDeactivate: (id) => `${BASE_URL_DOUBLE_V1}/exams/exam-types/${id}/deactivate`,

  examEventById: (id) => `${BASE_URL_DOUBLE_V1}/exam-events/${id}`,
  examEventCopy: (id) => `${BASE_URL_DOUBLE_V1}/exam-events/${id}/copy`,
  examEventClasses: (id) => `${BASE_URL_DOUBLE_V1}/exam-events/${id}/classes`,
  examEventClassById: (eventId, classId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/classes/${classId}`,
  examEventSummary: (id) => `${BASE_URL_DOUBLE_V1}/exam-events/${id}/analytics/summary`,
  examEventClassAnalytics: (eventId, classId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/analytics/classes/${classId}`,
  examEventToppers: (id) => `${BASE_URL_DOUBLE_V1}/exam-events/${id}/analytics/toppers`,
  eventClassSubjects: (eventId, classId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/classes/${classId}/subjects`,
  eventClassSubjectById: (eventId, classId, configId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/classes/${classId}/subjects/${configId}`,
  eventReportCardsGenerate: (eventId, classId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/classes/${classId}/report-cards/generate`,
  eventReportCards: (eventId, classId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/classes/${classId}/report-cards`,
  eventStudentRemarks: (eventId, classId, studentId) => `${BASE_URL_DOUBLE_V1}/exam-events/${eventId}/classes/${classId}/report-cards/${studentId}/remarks`,
  examEventSchedule: (id) => `${BASE_URL_DOUBLE_V1}/exam-events/${id}/schedule`,

  // ─── Fee Collections ───
  FEE_COLLECTIONS: `${BASE_URL_V1}/fee/collections`,
  FEE_COLLECTIONS_BULK: `${BASE_URL_V1}/fee/collections/bulk`,
  FEE_COLLECTIONS_HISTORY: `${BASE_URL_V1}/fee/collections/history`,
  FEE_COLLECTIONS_OUTSTANDING: `${BASE_URL_V1}/fee/collections/outstanding`,
  feeReceiptById: (id) => `${BASE_URL_V1}/fee/collections/receipt/${id}`,

  // ─── Fee Dashboard ───
  FEE_DASHBOARD_PERIODS: `${BASE_URL_V1}/fee/dashboard/active-periods`,
  FEE_DASHBOARD_CLASS_SUMMARY: `${BASE_URL_V1}/fee/dashboard/class-summary`,
  FEE_DASHBOARD_ALERTS: `${BASE_URL_V1}/fee/dashboard/overdue-alerts`,
  FEE_DASHBOARD_PAYMENTS: `${BASE_URL_V1}/fee/dashboard/recent-payments`,
  FEE_DASHBOARD_STATS: `${BASE_URL_V1}/fee/dashboard/stats`,

  // ─── Fee Periods ───
  FEE_PERIODS: `${BASE_URL_V1}/fee/periods`,
  FEE_PERIODS_ACADEMIC_YEARS: `${BASE_URL_V1}/fee/periods/academic-years`,
  feePeriodById: (id) => `${BASE_URL_V1}/fee/periods/${id}`,
  feePeriodClose: (id) => `${BASE_URL_V1}/fee/periods/${id}/close`,
  feePeriodreopen: (id) => `${BASE_URL_V1}/fee/periods/${id}/reopen`,

  // ─── Fee Structures ───
  FEE_STRUCTURES: `${BASE_URL_V1}/fee/structures`,
  feeStructureById: (id) => `${BASE_URL_V1}/fee/structures/${id}`,

  // ─── Holidays ───
  HOLIDAYS: `${BASE_URL_DOUBLE}/holidays`,
  HOLIDAYS_STATS: `${BASE_URL_DOUBLE}/holidays/statistics`,
  HOLIDAYS_NEXT: `${BASE_URL_DOUBLE}/holidays/next`,
  holidayById: (id) => `${BASE_URL_DOUBLE}/holidays/${id}`,

  // ─── Homework ───
  HOMEWORK: `${BASE_URL_V1}/homework`,
  TEACHERS_LOOKUP: `${BASE_URL_V1}/teachers/lookup`,
  homeworkById: (id) => `${BASE_URL_V1}/homework/${id}`,
  homeworkAttachment: (id) => `${BASE_URL_V1}/homework/${id}/attachment`,
  homeworkStatus: (id) => `${BASE_URL_V1}/homework/${id}/status`,
  homeworkBySection: (sectionId) => `${BASE_URL_V1}/homework/section/${sectionId}`,
  homeworkPublishedBySection: (sectionId) => `${BASE_URL_V1}/homework/section/${sectionId}/published`,
  homeworkByTeacher: (teacherId) => `${BASE_URL_V1}/homework/teacher/${teacherId}`,
  activeSubjectsBySection: (sectionId) => `${BASE_URL_V1}/section-subjects/section/${sectionId}/active`,

  // ─── Leave Configuration ───
  LEAVE_CONFIG: `${BASE_URL}/leave/config`,
  LEAVE_CONFIG_SEED: `${BASE_URL}/leave/config/seed`,
  leaveConfigById: (id) => `${BASE_URL}/leave/config/${id}`,

  // ─── Leave Management ───
  LEAVE_ADMIN_STATS: `${BASE_URL}/leave/admin/statistics`,
  LEAVE_ADMIN_ALL: `${BASE_URL}/leave/admin/all`,
  LEAVE_APPLY: `${BASE_URL}/leave/apply`,
  leaveAdminReview: (id) => `${BASE_URL}/leave/admin/${id}/review`,
  leaveCancel: (id) => `${BASE_URL}/leave/${id}/cancel`,
  leaveUserBalance: (userId) => `${BASE_URL}/leave/user/${userId}/balance`,
  leaveUserRequests: (userId) => `${BASE_URL}/leave/user/${userId}`,

  // ─── List of Values (LOV) ───
  LOV: `${BASE_URL}/common/lov`,

  // ─── Timetable / Schedule ───
  TIMETABLE: `${BASE_URL_DOUBLE_V1}/timetable`,
  TIMETABLE_CONFIG: `${BASE_URL_DOUBLE_V1}/timetable/config`,
  TIMETABLE_TEACHER_SCHEDULE: `${BASE_URL_DOUBLE_V1}/timetable/teacher-schedule`,

  timetableById: (id) => `${BASE_URL_DOUBLE_V1}/timetable/${id}`,
  timetablePublish: (id) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/publish`,
  timetableSlots: (id) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/slots`,
  timetableSlotByDayPeriod: (id, day, period) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/slots/${day}/${period}`,
  timetableSlotTeachers: (id, day, period) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/slots/${day}/${period}/teachers`,
  timetableAutoFill: (id) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/slots/auto-fill`,
  timetableBulkSave: (id) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/slots/bulk`,
  timetableSubstitutions: (id) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/substitutions`,
  timetableSubstitutionStatus: (id, subId) => `${BASE_URL_DOUBLE_V1}/timetable/${id}/substitutions/${subId}/status`,

  // ─── Schools & School Config ───
  SCHOOLS: `${BASE_URL_DOUBLE_V1}/schools`,
  SCHOOLS_ACTIVE: `${BASE_URL_DOUBLE_V1}/schools/active`,
  SCHOOLS_MY: `${BASE_URL_DOUBLE_V1}/schools/my-schools`,
  SCHOOLS_MY_STATS: `${BASE_URL_DOUBLE_V1}/schools/my-stats`,
  SCHOOLS_STATS: `${BASE_URL_DOUBLE_V1}/schools/stats`,
  SWITCH_SCHOOL: `${BASE_URL_V1}/auth/switch-school`, // Note: uses V1 auth base

  schoolById: (id) => `${BASE_URL_DOUBLE_V1}/schools/${id}`,
  schoolActivate: (id) => `${BASE_URL_DOUBLE_V1}/schools/${id}/activate`,
  schoolDeactivate: (id) => `${BASE_URL_DOUBLE_V1}/schools/${id}/deactivate`,
  schoolAttendanceConfig: (id) => `${BASE_URL_DOUBLE_V1}/schools/${id}/attendance-config`,
  schoolLogo: (id) => `${BASE_URL_DOUBLE_V1}/schools/${id}/logo`,
  schoolFeatures: (id) => `${BASE_URL_DOUBLE_V1}/schools/${id}/features`,
  // ─── Section Subjects ───
  SECTION_SUBJECTS_ASSIGN: `${BASE_URL_V1}/section-subjects/assign`,
  sectionSubjectsBySection: (sectionId) => `${BASE_URL_V1}/section-subjects/section/${sectionId}`,
  activeSectionSubjects: (sectionId) => `${BASE_URL_V1}/section-subjects/section/${sectionId}/active`,
  sectionSubjectById: (id) => `${BASE_URL_V1}/section-subjects/${id}`,
  sectionSubjectRemove: (sectionId, subjectId) => `${BASE_URL_V1}/section-subjects/section/${sectionId}/subject/${subjectId}`,

  // ─── Inventory / Stock Items ───
  STOCK_ITEMS: `${BASE_URL_V1}/stock/items`,
  STOCK_ITEMS_STATS: `${BASE_URL_V1}/stock/items/stats`,
  STOCK_INWARD: `${BASE_URL_V1}/stock/inward`,
  STOCK_OUTWARD: `${BASE_URL_V1}/stock/outward`,
  STOCK_TRANSFER: `${BASE_URL_V1}/stock/transfer`,
  STOCK_MOVEMENTS_HISTORY: `${BASE_URL_V1}/stock/movements/history`,
  STOCK_MOVEMENTS_STATS: `${BASE_URL_V1}/stock/movements/stats`,
  STOCK_LOW_STOCK: `${BASE_URL_V1}/stock/low-stock`,
  STOCK_OVERVIEW: `${BASE_URL_V1}/stock/overview`,
  STOCK_OVERVIEW_STATS: `${BASE_URL_V1}/stock/overview/stats`,

  stockItemById: (id) => `${BASE_URL_V1}/stock/items/${id}`,
  stockItemActivate: (id) => `${BASE_URL_V1}/stock/items/${id}/activate`,
  stockItemDeactivate: (id) => `${BASE_URL_V1}/stock/items/${id}/deactivate`,
  stockItemOverview: (itemId) => `${BASE_URL_V1}/stock/items/${itemId}/overview`,

  // ─── Stores ───
  STORES: `${BASE_URL_V1}/stock/stores`,
  STORES_ACTIVE: `${BASE_URL_V1}/stock/stores/active`,
  STORES_STATS: `${BASE_URL_V1}/stock/stores/stats`,

  storeById: (id) => `${BASE_URL_V1}/stock/stores/${id}`,
  storeActivate: (id) => `${BASE_URL_V1}/stock/stores/${id}/activate`,
  storeDeactivate: (id) => `${BASE_URL_V1}/stock/stores/${id}/deactivate`,
  storeStock: (storeId) => `${BASE_URL_V1}/stock/stores/${storeId}/stock`,
  storeItemsAvailability: (storeId) => `${BASE_URL_V1}/stock/stores/${storeId}/items/availability`,

  // ─── Student Orders ───
  ORDERS: `${BASE_URL_DOUBLE_V1}/stock/orders`,
  ORDERS_STATS: `${BASE_URL_DOUBLE_V1}/stock/orders/stats`,
  ORDERS_PREVIEW: `${BASE_URL_DOUBLE_V1}/stock/orders/preview`,

  orderById: (id) => `${BASE_URL_DOUBLE_V1}/stock/orders/${id}`,
  orderConfirm: (id) => `${BASE_URL_DOUBLE_V1}/stock/orders/${id}/confirm`,
  orderCancel: (id) => `${BASE_URL_DOUBLE_V1}/stock/orders/${id}/cancel`,

  // ─── Students ───
  STUDENTS: `${BASE_URL_DOUBLE_V1}/students`,
  STUDENTS_PAGINATED: `${BASE_URL_DOUBLE_V1}/students/paginated`,
  STUDENTS_SEARCH: `${BASE_URL_DOUBLE_V1}/students/search/paginated`,

  studentById: (id) => `${BASE_URL_DOUBLE_V1}/students/${id}`,
  studentByClass: (id) => `${BASE_URL_DOUBLE_V1}/students/class/${id}`,
  studentBySection: (sectionId) => `${BASE_URL_DOUBLE_V1}/students/section/${sectionId}`,

  // ─── Student Documents ───
  STUDENT_DOCUMENTS: (id) => `${BASE_URL_DOUBLE_V1}/students/${id}/documents`,
  UPLOAD_STUDENT_DOCUMENT: (id, docType) =>
    `${BASE_URL_DOUBLE_V1}/students/${id}/documents/${docType}`,

  // ─── Parent / Guardian Photos ───
  UPLOAD_PARENT_PHOTO: (id, photoType) =>
    `${BASE_URL_DOUBLE_V1}/students/${id}/photos/${photoType}`,

  // ─── Student Store (Class Item Configs) ───
  CLASS_ITEM_CONFIGS: `${BASE_URL_DOUBLE_V1}/stock/class-item-configs`,
  CLASS_ITEM_CONFIGS_STATS: `${BASE_URL_DOUBLE_V1}/stock/class-item-configs/stats`,
  classItemConfigById: (id) => `${BASE_URL_DOUBLE_V1}/stock/class-item-configs/${id}`,

  // ─── Subjects ───
  SUBJECTS: `${BASE_URL_V1}/subjects`,
  SUBJECTS_PAGINATED: `${BASE_URL_V1}/subjects/paginated`,
  subjectById: (id) => `${BASE_URL_V1}/subjects/${id}`,

  // ─── Teachers & Assignments ───
  TEACHERS: `${BASE_URL_V1}/teachers`,
  TEACHERS_STATS: `${BASE_URL_V1}/teachers/statistics`,
  TEACHERS_PAGINATED: `${BASE_URL_V1}/teachers/paginated`,
  TEACHERS_SEARCH: `${BASE_URL_V1}/teachers/search/paginated`,

  teacherById: (id) => `${BASE_URL_V1}/teachers/${id}`,
  teacherSalary: (id) => `${BASE_URL_V1}/teachers/${id}/salary-structure`,
  teacherActivate: (id) => `${BASE_URL_V1}/teachers/${id}/activate`,
  teacherDeactivate: (id) => `${BASE_URL_V1}/teachers/${id}/deactivate`,

  teacherAssignments: (id) => `${BASE_URL_V1}/teachers/${id}/assignments`,
  teacherActiveAssignments: (id) => `${BASE_URL_V1}/teachers/${id}/assignments/active`,
  teacherAssignmentById: (id) => `${BASE_URL_V1}/teachers/assignments/${id}`,
  sectionSubjectsByClass: (classId) => `${BASE_URL_V1}/section-subjects/class/${classId}`,

  // ─── Transport ───
  TRANSPORT_ROUTES: `${BASE_URL_V1}/transport/routes`,
  TRANSPORT_ROUTES_ACTIVE: `${BASE_URL_V1}/transport/routes/active`,
  TRANSPORT_STAFF: `${BASE_URL_V1}/transport/staff`,
  TRANSPORT_VEHICLES: `${BASE_URL_V1}/transport/vehicles`,
  TRANSPORT_VEHICLES_ACTIVE: `${BASE_URL_V1}/transport/vehicles/active`,
  TRANSPORT_ALLOCATIONS: `${BASE_URL_V1}/transport/allocations`,
  TRANSPORT_FEE_PLANS: `${BASE_URL_V1}/transport/fee-plans`,
  TRANSPORT_ROUTES_STUDENTS_REPORT: `${BASE_URL_V1}/transport/reports/routes/students`,
  TRANSPORT_STAFF_ASSIGNMENT_REPORT: `${BASE_URL_V1}/transport/reports/staff/assignments`,
  TRANSPORT_VEHICLE_CAPACITY_REPORT: `${BASE_URL_V1}/transport/reports/vehicles/capacity`,
  TRANSPORT_FEE_REPORT: `${BASE_URL_V1}/transport/reports/fees`,
  TRANSPORT_BILLING: `${BASE_URL_V1}/fee/transport-billing`,
  TRANSPORT_BILLING_CONFIG: `${BASE_URL_V1}/fee/transport-billing/config`,
  TRANSPORT_BILLING_GENERATE: `${BASE_URL_V1}/fee/transport-billing/generate`,

  transportRouteById: (id) => `${BASE_URL_V1}/transport/routes/${id}`,
  transportRouteActivate: (id) => `${BASE_URL_V1}/transport/routes/${id}/activate`,
  transportRouteDeactivate: (id) => `${BASE_URL_V1}/transport/routes/${id}/deactivate`,
  transportRouteStops: (routeId) => `${BASE_URL_V1}/transport/routes/${routeId}/stops`,
  transportRouteStopById: (routeId, stopId) => `${BASE_URL_V1}/transport/routes/${routeId}/stops/${stopId}`,
  transportStaffById: (id) => `${BASE_URL_V1}/transport/staff/${id}`,
  transportStaffActivate: (id) => `${BASE_URL_V1}/transport/staff/${id}/activate`,
  transportStaffDeactivate: (id) => `${BASE_URL_V1}/transport/staff/${id}/deactivate`,
  transportVehicleById: (id) => `${BASE_URL_V1}/transport/vehicles/${id}`,
  transportVehicleActivate: (id) => `${BASE_URL_V1}/transport/vehicles/${id}/activate`,
  transportVehicleDeactivate: (id) => `${BASE_URL_V1}/transport/vehicles/${id}/deactivate`,
  transportAllocationById: (id) => `${BASE_URL_V1}/transport/allocations/${id}`,
  transportFeePlanById: (id) => `${BASE_URL_V1}/transport/fee-plans/${id}`,
  transportFeePlanActivate: (id) => `${BASE_URL_V1}/transport/fee-plans/${id}/activate`,
  transportFeePlanDeactivate: (id) => `${BASE_URL_V1}/transport/fee-plans/${id}/deactivate`,
  transportFeePlansByRoute: (routeId) => `${BASE_URL_V1}/transport/fee-plans/route/${routeId}`,
  transportRouteStudentsReportByRoute: (routeId) => `${BASE_URL_V1}/transport/reports/routes/${routeId}/students`,

  transportBillingByStudent: (studentId) =>
    `${BASE_URL_V1}/fee/transport-billing/student/${studentId}`,

  transportBillingFlatOverride: (billingId) =>
    `${BASE_URL_V1}/fee/transport-billing/${billingId}/flat-override`,

  transportBillingMonthOverride: (billingId) =>
    `${BASE_URL_V1}/fee/transport-billing/${billingId}/month-override`,

  transportBillingPay: (billingId) =>
    `${BASE_URL_V1}/fee/transport-billing/${billingId}/pay`,

  // ─── User Management ───
  USERS: `${BASE_URL_V1}/users`,
  USERS_STATS: `${BASE_URL_V1}/users/statistics`,
  USERS_SEARCH: `${BASE_URL_V1}/users/search`,
  USERS_FILTER: `${BASE_URL_V1}/users/filter`,
  USERS_SUMMARY: `${BASE_URL_V1}/users/summary`,

  userById: (id) => `${BASE_URL_V1}/users/${id}`,
  userByRole: (role) => `${BASE_URL_V1}/users/by-role/${role}`,
  userByStatus: (status) => `${BASE_URL_V1}/users/by-status/${status}`,
  userActivate: (id) => `${BASE_URL_V1}/users/${id}/activate`,
  userDeactivate: (id) => `${BASE_URL_V1}/users/${id}/deactivate`,
  userResetPassword: (id) => `${BASE_URL_V1}/users/${id}/reset-password`,
  userSetPassword: (id) => `${BASE_URL_V1}/users/${id}/set-password`,

  // ─── Roles & Permissions ─────────────────────────────────────────────────────
  ROLES: `${BASE_URL_V1}/roles`,
  ROLES_SUMMARY: `${BASE_URL_V1}/roles/summary`,
  PERMISSION_ACCESS_STATISTICS: `${BASE_URL_V1}/roles/stats`,
  MODULE_FILTER_CHIPS: `${BASE_URL_V1}/roles/permissions/modules`,
  ALL_PERMISSIONS_GROUPED: `${BASE_URL_V1}/roles/permissions/grouped`,

  // Dynamic endpoints
  roleById: (roleId) => `${BASE_URL_V1}/roles/${roleId}`,
  rolePermissionsById: (roleId) => `${BASE_URL_V1}/roles/${roleId}/permissions`,

  // ─── Public (no auth) ────────────────────────────────────────────────────────
  // "Book Your Free Demo" landing page form
  DEMO_REQUEST: `${BASE_URL_V1}/public/demo-request`,
};
// src/constants/permissions.js
// Single source of truth for every permission string used across the app.
// These MUST match exactly (case-sensitive) what the backend embeds in the JWT's
// `permissions` array. If backend renames/adds a permission, fix it here once.

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  // ── Users ────────────────────────────────────────────────────────────────────
  USER_VIEW:    'USER_VIEW',
  USER_CREATE:  'USER_CREATE',
  USER_EDIT:    'USER_EDIT',
  USER_DELETE:  'USER_DELETE',
  USER_APPROVE: 'USER_APPROVE',

  // ── Teachers ─────────────────────────────────────────────────────────────────
  TEACHER_VIEW:    'TEACHER_VIEW',
  TEACHER_CREATE:  'TEACHER_CREATE',
  TEACHER_EDIT:    'TEACHER_EDIT',
  TEACHER_DELETE:  'TEACHER_DELETE',
  TEACHER_APPROVE: 'TEACHER_APPROVE',

  // ── Students ─────────────────────────────────────────────────────────────────
  STUDENT_VIEW:    'STUDENT_VIEW',
  STUDENT_CREATE:  'STUDENT_CREATE',
  STUDENT_EDIT:    'STUDENT_EDIT',
  STUDENT_DELETE:  'STUDENT_DELETE',
  STUDENT_APPROVE: 'STUDENT_APPROVE',

  // ── Academics ────────────────────────────────────────────────────────────────
  ACADEMIC_VIEW:        'ACADEMIC_VIEW',
  ACADEMIC_CREATE:      'ACADEMIC_CREATE',
  ACADEMIC_EDIT:        'ACADEMIC_EDIT',
  ACADEMIC_DELETE:      'ACADEMIC_DELETE',
  ACADEMIC_APPROVE:     'ACADEMIC_APPROVE',
  ACADEMIC_YEAR_MANAGE: 'ACADEMIC_YEAR_MANAGE',
  CLASS_SECTION_MANAGE: 'CLASS_SECTION_MANAGE',
  HOLIDAY_MANAGE:       'HOLIDAY_MANAGE',

  // ── Homework ─────────────────────────────────────────────────────────────────
  HOMEWORK_VIEW:    'HOMEWORK_VIEW',
  HOMEWORK_CREATE:  'HOMEWORK_CREATE',
  HOMEWORK_EDIT:    'HOMEWORK_EDIT',
  HOMEWORK_DELETE:  'HOMEWORK_DELETE',
  HOMEWORK_APPROVE: 'HOMEWORK_APPROVE',

  // ── Timetable ────────────────────────────────────────────────────────────────
  TIMETABLE_VIEW:       'TIMETABLE_VIEW',
  TIMETABLE_MANAGE:     'TIMETABLE_MANAGE',
  TIMETABLE_CONFIG:     'TIMETABLE_CONFIG',
  TIMETABLE_SUBSTITUTE: 'TIMETABLE_SUBSTITUTE',

  // ── Exams ────────────────────────────────────────────────────────────────────
  EXAM_VIEW:             'EXAM_VIEW',
  EXAM_CREATE:           'EXAM_CREATE',
  EXAM_EDIT:             'EXAM_EDIT',
  EXAM_DELETE:           'EXAM_DELETE',
  EXAM_APPROVE:          'EXAM_APPROVE',
  EXAM_MARKS_ENTER:      'EXAM_MARKS_ENTER',
  EXAM_MARKS_VIEW_CLASS: 'EXAM_MARKS_VIEW_CLASS',
  EXAM_ANALYTICS_VIEW:   'EXAM_ANALYTICS_VIEW',
  EXAM_CONFIG_MANAGE:    'EXAM_CONFIG_MANAGE',

  // ── Communication ────────────────────────────────────────────────────────────
  CIRCULAR_VIEW:    'CIRCULAR_VIEW',
  CIRCULAR_CREATE:  'CIRCULAR_CREATE',
  CIRCULAR_APPROVE: 'CIRCULAR_APPROVE',
  CIRCULAR_DELETE:  'CIRCULAR_DELETE',
  EVENT_VIEW:       'EVENT_VIEW',
  EVENT_CREATE:     'EVENT_CREATE',
  EVENT_APPROVE:    'EVENT_APPROVE',
  EVENT_DELETE:     'EVENT_DELETE',
  NOTICE_VIEW:      'NOTICE_VIEW',

  // ── Attendance ───────────────────────────────────────────────────────────────
  ATTENDANCE_VIEW:    'ATTENDANCE_VIEW',
  ATTENDANCE_CREATE:  'ATTENDANCE_CREATE',
  ATTENDANCE_EDIT:    'ATTENDANCE_EDIT',
  ATTENDANCE_DELETE:  'ATTENDANCE_DELETE',
  ATTENDANCE_APPROVE: 'ATTENDANCE_APPROVE',

  // ── Leaves ───────────────────────────────────────────────────────────────────
  LEAVE_VIEW:          'LEAVE_VIEW',
  LEAVE_CREATE:        'LEAVE_CREATE',
  LEAVE_EDIT:          'LEAVE_EDIT',
  LEAVE_DELETE:        'LEAVE_DELETE',
  LEAVE_APPROVE:       'LEAVE_APPROVE',
  LEAVE_CONFIG_MANAGE: 'LEAVE_CONFIG_MANAGE',

  // ── Fee Management ───────────────────────────────────────────────────────────
  FEE_VIEW:             'FEE_VIEW',
  FEE_CREATE:           'FEE_CREATE',
  FEE_EDIT:             'FEE_EDIT',
  FEE_DELETE:           'FEE_DELETE',
  FEE_APPROVE:          'FEE_APPROVE',
  FEE_COLLECT:          'FEE_COLLECT',
  FEE_PERIOD_VIEW:      'FEE_PERIOD_VIEW',
  FEE_PERIOD_MANAGE:    'FEE_PERIOD_MANAGE',
  FEE_STRUCTURE_VIEW:   'FEE_STRUCTURE_VIEW',
  FEE_STRUCTURE_MANAGE: 'FEE_STRUCTURE_MANAGE',
  FEE_REPORT_VIEW:      'FEE_REPORT_VIEW',

  // ── Payroll ──────────────────────────────────────────────────────────────────
  PAYROLL_VIEW:    'PAYROLL_VIEW',
  PAYROLL_CREATE:  'PAYROLL_CREATE',
  PAYROLL_EDIT:    'PAYROLL_EDIT',
  PAYROLL_DELETE:  'PAYROLL_DELETE',
  PAYROLL_APPROVE: 'PAYROLL_APPROVE',

  // ── Expenses ─────────────────────────────────────────────────────────────────
  EXPENSE_VIEW:    'EXPENSE_VIEW',
  EXPENSE_CREATE:  'EXPENSE_CREATE',
  EXPENSE_EDIT:    'EXPENSE_EDIT',
  EXPENSE_DELETE:  'EXPENSE_DELETE',
  EXPENSE_APPROVE: 'EXPENSE_APPROVE',

  // ── Transport ────────────────────────────────────────────────────────────────
  TRANSPORT_VIEW:   'TRANSPORT_VIEW',
  TRANSPORT_CREATE: 'TRANSPORT_CREATE',
  TRANSPORT_EDIT:   'TRANSPORT_EDIT',
  TRANSPORT_DELETE: 'TRANSPORT_DELETE',

  // ── Stock & Store ────────────────────────────────────────────────────────────
  STOCK_OVERVIEW:      'STOCK_OVERVIEW',
  STOCK_REPORT:        'STOCK_REPORT',
  STOCK_ITEM_VIEW:     'STOCK_ITEM_VIEW',
  STOCK_ITEM_CREATE:   'STOCK_ITEM_CREATE',
  STOCK_ITEM_EDIT:     'STOCK_ITEM_EDIT',
  STOCK_ITEM_DELETE:   'STOCK_ITEM_DELETE',
  STOCK_MOVEMENT_VIEW: 'STOCK_MOVEMENT_VIEW',
  STOCK_INWARD:        'STOCK_INWARD',
  STOCK_OUTWARD:       'STOCK_OUTWARD',
  STOCK_TRANSFER:      'STOCK_TRANSFER',
  STORE_VIEW:          'STORE_VIEW',
  STORE_CREATE:        'STORE_CREATE',
  STORE_EDIT:          'STORE_EDIT',
  STORE_DELETE:        'STORE_DELETE',

  // ── Student Orders ───────────────────────────────────────────────────────────
  STUDENT_ORDER_VIEW:    'STUDENT_ORDER_VIEW',
  STUDENT_ORDER_CREATE:  'STUDENT_ORDER_CREATE',
  STUDENT_ORDER_EDIT:    'STUDENT_ORDER_EDIT',
  STUDENT_ORDER_CONFIRM: 'STUDENT_ORDER_CONFIRM',
  STUDENT_ORDER_CANCEL:  'STUDENT_ORDER_CANCEL',

  // ── Class Item Config ────────────────────────────────────────────────────────
  CLASS_ITEM_CONFIG_VIEW: 'CLASS_ITEM_CONFIG_VIEW',
  CLASS_ITEM_CONFIG_EDIT: 'CLASS_ITEM_CONFIG_EDIT',

  // ── Demo Requests / Leads ────────────────────────────────────────────────────
  // Confirmed from backend JWT for GLOBAL_READ_ONLY — these are the actual
  // permission keys gating the lead-management feature, distinct from the
  // module CRUD keys above.
  VIEW_DEMO_REQUESTS:   'VIEW_DEMO_REQUESTS',
  MANAGE_DEMO_REQUESTS: 'MANAGE_DEMO_REQUESTS',
};

// These screens stay ROLE-locked on purpose — never permission-gated.
// Allowing a custom role to grant itself access to the role-editor or school-config
// via its own permission set would be a privilege-escalation hole.
export const SYSTEM_ROLES = {
  ROLE_MANAGE:          ['GLOBAL_ADMIN'],
  SCHOOL_CONFIG_MANAGE: ['SUPER_ADMIN', 'GLOBAL_ADMIN','ADMIN'],
  SCHOOL_SWITCHER:      ['SUPER_ADMIN', 'GLOBAL_ADMIN'],
  SCHOOL_PICKER:        ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'GLOBAL_READ_ONLY'],
  GLOBAL_ADMIN_ONLY:    ['GLOBAL_ADMIN'],

  // Route-level access to /leadManagement. GLOBAL_READ_ONLY reaches this
  // page the same way GLOBAL_ADMIN does. Backend also sends
  // VIEW_DEMO_REQUESTS / MANAGE_DEMO_REQUESTS as discrete permissions for
  // this role — if you want finer-grained control later (e.g. view leads
  // but not edit them), gate individual actions inside the page on those
  // permission keys via hasPermission() rather than expanding this list.
  LEAD_MANAGEMENT_ROLES: ['GLOBAL_ADMIN', 'GLOBAL_READ_ONLY'],

  // Sidebar-only visibility for the Demo Leads menu item, if/when one is
  // added inside the dashboard shell (as opposed to the Select School
  // console button). Add GLOBAL_READ_ONLY here too if it should also see
  // Demo Leads in the in-dashboard sidebar, not just on the console.
  SIDEBAR_LEAD_MANAGEMENT_ROLES: ['GLOBAL_ADMIN'],
};
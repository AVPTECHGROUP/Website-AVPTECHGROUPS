// ─────────────────────────────────────────────────────────────────────────────
// ROUTES CONSTANTS
// Single source of truth for all role groups and route paths used across the
// modular route files. Update roles/paths here — never inline in route files.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Common Role Names ──────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  GLOBAL_ADMIN: 'GLOBAL_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  ACCOUNTANT: 'ACCOUNTANT',
  RECEPTIONIST: 'RECEPTIONIST',
  PARENT: 'PARENT',
  STORE_ACCOUNTANT: 'STORE_ACCOUNTANT',
  STORE_SELLER: 'STORE_SELLER',
  // Backend-confirmed role string (see JWT `roles` claim). Full dashboard
  // access, identical navigation to GLOBAL_ADMIN across every module, but
  // every permission the backend issues for this role is a *_VIEW (or
  // VIEW_DEMO_REQUESTS / MANAGE_DEMO_REQUESTS) permission — no CREATE/EDIT/
  // DELETE/APPROVE keys. "Read only" is enforced via the permissions array,
  // not via role checks — the existing hasPermission()-gated "visible but
  // disabled" pattern (Transport/Leaves/Timetable/Exams etc.) handles this
  // automatically for any screen already wired that way. This role is added
  // to every ROLE_GROUPS entry GLOBAL_ADMIN belongs to below EXCEPT
  // GLOBAL_ADMIN_ONLY, which stays locked for privilege-sensitive screens
  // (role management etc.) — same reasoning as SYSTEM_ROLES.ROLE_MANAGE in
  // permissions.js.
  GLOBAL_READ_ONLY: 'GLOBAL_READ_ONLY',
};

// ─── Reusable Role Groups (grouped by access pattern) ──────────────────────
export const ROLE_GROUPS = {
  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, GLOBAL_READ_ONLY
  ADMIN_PRINCIPAL: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL, ROLES.GLOBAL_READ_ONLY],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER, GLOBAL_READ_ONLY
  ADMIN_PRINCIPAL_TEACHER: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.GLOBAL_READ_ONLY],

  // GLOBAL_ADMIN, SUPER_ADMIN, PRINCIPAL, ADMIN, GLOBAL_READ_ONLY
  GLOBAL_SUPER_PRINCIPAL_ADMIN: [ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.GLOBAL_READ_ONLY],

  // SUPER_ADMIN, GLOBAL_ADMIN, GLOBAL_READ_ONLY
  SUPER_GLOBAL_ADMIN: [ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.GLOBAL_READ_ONLY],

  // GLOBAL_ADMIN, SUPER_ADMIN, ADMIN, GLOBAL_READ_ONLY
  SCHEDULE_ROLES: [ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.GLOBAL_READ_ONLY],

  // GLOBAL_ADMIN only — deliberately NOT extended to GLOBAL_READ_ONLY.
  // Reserved for privilege-sensitive screens (see SYSTEM_ROLES.ROLE_MANAGE
  // in permissions.js for the matching rationale).
  GLOBAL_ADMIN_ONLY: [ROLES.GLOBAL_ADMIN],

  // ADMIN, PRINCIPAL, TEACHER, GLOBAL_ADMIN, SUPER_ADMIN, GLOBAL_READ_ONLY
  COMM_ROLES: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_READ_ONLY],

  // ADMIN, PRINCIPAL, GLOBAL_ADMIN, SUPER_ADMIN, GLOBAL_READ_ONLY
  APPROVAL_ROLES: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_READ_ONLY],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER, ACCOUNTANT, GLOBAL_READ_ONLY
  FEE_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.ACCOUNTANT, ROLES.GLOBAL_READ_ONLY],

  // TEACHER, PRINCIPAL, RECEPTIONIST, ACCOUNTANT
  // (Redirect-target group, not an access-control list — GLOBAL_READ_ONLY
  // intentionally not added here.)
  LEAVES_REDIRECT_ROLES: [ROLES.TEACHER, ROLES.PRINCIPAL, ROLES.RECEPTIONIST, ROLES.ACCOUNTANT],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, STORE_ACCOUNTANT, GLOBAL_READ_ONLY
  STOCK_ACCOUNTANT_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.STORE_ACCOUNTANT, ROLES.GLOBAL_READ_ONLY],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, STORE_ACCOUNTANT, STORE_SELLER, GLOBAL_READ_ONLY
  STOCK_SELLER_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.STORE_ACCOUNTANT, ROLES.STORE_SELLER, ROLES.GLOBAL_READ_ONLY],

  // SUPER_ADMIN, GLOBAL_ADMIN, GLOBAL_READ_ONLY (school picker / console)
  // GLOBAL_READ_ONLY logs in with requiresSchoolSelection: true, exactly
  // like GLOBAL_ADMIN — it must reach /superAdmin to pick a school before
  // entering a dashboard.
  SCHOOL_PICKER_ROLES: [ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.GLOBAL_READ_ONLY],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, GLOBAL_READ_ONLY (manage users)
  MANAGE_USERS_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL, ROLES.GLOBAL_READ_ONLY],

  // GLOBAL_ADMIN, GLOBAL_READ_ONLY (demo leads / lead management)
  // Note: backend also issues VIEW_DEMO_REQUESTS / MANAGE_DEMO_REQUESTS as
  // discrete permissions for GLOBAL_READ_ONLY — if lead management should
  // eventually be gated by permission rather than role, switch the route
  // guard to hasPermission('VIEW_DEMO_REQUESTS') instead of this array.
  LEAD_MANAGEMENT_ROLES: [ROLES.GLOBAL_ADMIN, ROLES.GLOBAL_READ_ONLY],

  // Dashboard — broadest role list across the app.
  // GLOBAL_READ_ONLY gets full dashboard/sidebar access here, same as
  // GLOBAL_ADMIN — it's a permission-driven read-only role, not a
  // route-restricted one.
  DASHBOARD_ROLES: [
    ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN,
    ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.PARENT,
    ROLES.STORE_ACCOUNTANT, ROLES.GLOBAL_READ_ONLY,
  ],
};

// ─── Route Paths — grouped by module ───────────────────────────────────────
export const ROUTE_PATHS = {
  // Auth
  LOGIN: '/login',
  SETTINGS: '/settings',

  // SchoolSpineWeb (public)
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  BOOK_DEMO: '/book-demo',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  FAQS: '/faqs',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Super Admin
  SUPER_ADMIN: '/superAdmin',
  MANAGE_USERS_ADD: '/manageUsers/addUser',
  MANAGE_USERS_EDIT: '/manageUsers/editUser/:id',
  MANAGE_USERS_DETAIL: '/manageUsers/:id',
  MANAGE_USERS: '/manageUsers',

  // Teachers
  TEACHERS: '/teachers',
  TEACHERS_ADD: '/teachers/addTeacher',
  TEACHERS_EDIT: '/teachers/editTeacher/:id',
  TEACHERS_CLASS_ASSIGNMENT: '/teachers/classAssignment/:teacherId',
  TEACHERS_DETAIL: '/teachers/:id',

  // Students
  STUDENTS: '/students',
  STUDENTS_ADD: '/students/addStudents',
  STUDENTS_DETAIL: '/students/:id',
  STUDENTS_EDIT: '/students/editStudent/:id',

  // Academics
  ACADEMICS_CLASS_SECTIONS: '/academics/classSections',

  // Subject Management
  SUBJECTS_MASTER: '/subjectMaster',
  SECTION_SUBJECT_ASSIGNMENT: '/sectionSubjectAssignment',

  // Schedule
  SCHEDULE: '/schedule',
  SCHEDULE_CREATE: '/schedule/create',

  // Homework
  HOMEWORK: '/homework',

  // Exams
  EXAMS: '/exams',
  EXAMS_MARKS_ENTRY: '/exams/marksEntry/:examId?',
  EXAMS_REPORT_CARD: '/exams/reportCard/:examId?',
  EXAMS_ANALYTICS: '/exams/analytics',
  EXAMS_CONFIG: '/exams/examConfig',

  // Fee Management
  FEE_MANAGEMENT: '/feeManagement',
  FEE_MANAGEMENT_CONFIG: '/feeManagement/config',
  FEE_MANAGEMENT_PERIOD: '/feeManagement/period',
  FEE_MANAGEMENT_STRUCTURES: '/feeManagement/structures',
  FEE_MANAGEMENT_COLLECTIONS: '/feeManagement/collections',


  // Attendance
  ATTENDANCE_MARK_USER: '/attendance/markUserAttendance',
  ATTENDANCE: '/attendance',
  ATTENDANCE_STAFF_IMG_REG: '/attendance/staffImgReg',
  ATTENDANCE_STUDENT_IMG_REG: '/attendance/studentImgReg',
  ATTENDANCE_USERS: '/attendance/usersAttendance',
  ATTENDANCE_USERS_WARNING: '/attendance/usersAttendance/warning',
  ATTENDANCE_USERS_MANUAL: '/attendance/usersAttendance/manual',
  ATTENDANCE_STUDENT: '/attendance/studentAttendance',

  // Communication
  COMM_CIRCULARS: '/communication/circulars',
  COMM_CIRCULARS_DETAIL: '/communication/circulars/:id',
  COMM_CIRCULARS_CREATE: '/communication/circulars/create',
  COMM_EVENTS: '/communication/events',
  COMM_EVENTS_CREATE: '/communication/events/create',
  COMM_APPROVAL: '/communication/approval',
  COMM_NOTIFICATIONS: '/communication/notifications',

  // Leaves
  LEAVES_APPLY: '/leaves/applyLeaves',
  LEAVES_MY: '/leaves/myLeaves',
  LEAVES: '/leaves',
  LEAVES_MANAGE_HOLIDAYS: '/leaves/manageHolidays',
  LEAVES_CONFIG: '/leaves/leaveConfig',

  // Role Based Permission
  ROLES_PERMISSIONS: '/rolesPermissions',

  // Schools
  SCHOOL_CONFIG: '/schoolConfig',
  ACADEMIC_YEAR: '/academicYear',

  // Stock
  STOCK: '/stock',
  STOCK_STORES: '/stock/stores',
  STOCK_ITEMS: '/stock/items',
  STOCK_CLASS_CONFIG: '/stock/classConfig',
  STOCK_TRANSACTIONS: '/stock/transactions',
  STOCK_MOVEMENT_HISTORY: '/stock/movementHistory',
  STOCK_STUDENT_ORDERS: '/stock/studentOrders',
  STOCK_STUDENT_ORDERS_ADD: '/stock/studentOrders/addOrder',
  STOCK_STUDENT_ORDERS_EDIT: '/stock/studentOrders/editOrder',


  // Transport
  TRANSPORT: '/route',
  TRANSPORT_VEHICLES: '/route/vehicles',
  TRANSPORT_DRIVER_ATTENDANTS: '/route/Driver&Attendants',
  TRANSPORT_ROUTES_MANAGEMENT: '/route/routes_management',
  TRANSPORT_STUDENT_ALLOCATIONS: '/route/studentAllocations',
  TRANSPORT_FEE_PLANS: '/route/feePlans',
  TRANSPORT_REPORTS: '/route/reports',

  // Lead Management (internal CRM — GLOBAL_ADMIN & GLOBAL_READ_ONLY)
  LEAD_MANAGEMENT: '/leadManagement',

  // Fallback redirect targets
  STOCK_STUDENT_ORDERS_REDIRECT: '/stock/studentOrders',
};

// ─── Misc Loader / UI Strings ───────────────────────────────────────────────
export const ROUTES_UI_STRINGS = {
  LOADING_APP: 'Loading SchoolSpine...',
};
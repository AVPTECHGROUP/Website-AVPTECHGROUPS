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
  GLOBAL_SALES_SUPPORT: 'GLOBAL_SALES_SUPPORT',
};

// ─── Reusable Role Groups (grouped by access pattern) ──────────────────────
export const ROLE_GROUPS = {
  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL
  ADMIN_PRINCIPAL: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER
  ADMIN_PRINCIPAL_TEACHER: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER],

  // GLOBAL_ADMIN, SUPER_ADMIN, PRINCIPAL, ADMIN
  GLOBAL_SUPER_PRINCIPAL_ADMIN: [ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN],

  // SUPER_ADMIN, GLOBAL_ADMIN
  SUPER_GLOBAL_ADMIN: [ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN],

  // GLOBAL_ADMIN, SUPER_ADMIN, ADMIN
  SCHEDULE_ROLES: [ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN, ROLES.ADMIN],

  // GLOBAL_ADMIN only
  GLOBAL_ADMIN_ONLY: [ROLES.GLOBAL_ADMIN],

  // ADMIN, PRINCIPAL, TEACHER, GLOBAL_ADMIN, SUPER_ADMIN
  COMM_ROLES: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN],

  // ADMIN, PRINCIPAL, GLOBAL_ADMIN, SUPER_ADMIN
  APPROVAL_ROLES: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.GLOBAL_ADMIN, ROLES.SUPER_ADMIN],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER, ACCOUNTANT
  FEE_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.ACCOUNTANT],

  // TEACHER, PRINCIPAL, RECEPTIONIST, ACCOUNTANT
  LEAVES_REDIRECT_ROLES: [ROLES.TEACHER, ROLES.PRINCIPAL, ROLES.RECEPTIONIST, ROLES.ACCOUNTANT],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, STORE_ACCOUNTANT
  STOCK_ACCOUNTANT_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.STORE_ACCOUNTANT],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, STORE_ACCOUNTANT, STORE_SELLER
  STOCK_SELLER_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.STORE_ACCOUNTANT, ROLES.STORE_SELLER],

  // SUPER_ADMIN, GLOBAL_ADMIN, GLOBAL_SALES_SUPPORT (school picker / console)
  // GLOBAL_SALES_SUPPORT is included here — this page (SuperAdminSchools.jsx)
  // is their landing page after login and their only route to Demo Leads.
  SCHOOL_PICKER_ROLES: [ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.GLOBAL_SALES_SUPPORT],

  // ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL (manage users)
  MANAGE_USERS_ROLES: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN, ROLES.PRINCIPAL],

  // GLOBAL_ADMIN, GLOBAL_SALES_SUPPORT (demo leads / lead management)
  LEAD_MANAGEMENT_ROLES: [ROLES.GLOBAL_ADMIN, ROLES.GLOBAL_SALES_SUPPORT],

  // Dashboard — broadest role list across the app.
  // GLOBAL_SALES_SUPPORT deliberately excluded: that role has no dashboard,
  // no sidebar, and no school-scoped access of any kind. Its only two
  // reachable pages are the Select School console and /leadManagement.
  DASHBOARD_ROLES: [
    ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN, ROLES.GLOBAL_ADMIN,
    ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.PARENT,
    ROLES.STORE_ACCOUNTANT,
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

  // Lead Management (internal CRM — GLOBAL_ADMIN & GLOBAL_SALES_SUPPORT)
  LEAD_MANAGEMENT: '/leadManagement',

  // Fallback redirect targets
  STOCK_STUDENT_ORDERS_REDIRECT: '/stock/studentOrders',
};

// ─── Misc Loader / UI Strings ───────────────────────────────────────────────
export const ROUTES_UI_STRINGS = {
  LOADING_APP: 'Loading SchoolSpine...',
};

// ─── Global Configurations ──────────────────────────────────────────
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  ROWS_OPTIONS: [10, 25, 50, 100],
  FEE_PLANS_PER_PAGE: 5,
};

export const ALERTS = {
  EXPIRING_SOON_DAYS: 30,
};

// ─── Enums & Identifiers ────────────────────────────────────────────
export const STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const ROLES = {
  DRIVER: "DRIVER",
  ATTENDANT: "ATTENDANT",
};

export const VEHICLE_TYPES = {
  BUS: "BUS",
  MINI_BUS: "MINI_BUS",
  VAN: "VAN",
};

export const PICKUP_DROP_TYPES = {
  BOTH: "BOTH",
  PICKUP_ONLY: "PICKUP_ONLY",
  DROP_ONLY: "DROP_ONLY",
};

export const FEE_FREQUENCIES = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  ANNUALLY: "ANNUALLY",
  ONE_TIME: "ONE-TIME",
};

export const REPORT_TABS = {
  ROUTE: "route",
  VEHICLE: "vehicle",
  DRIVER: "driver",
  FEE: "fee",
};

export const ACTION_TYPES = {
  EDIT: "edit",
  TOGGLE: "toggle",
  DELETE: "delete",
};

// ─── Dropdown Options ───────────────────────────────────────────────
export const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: STATUS.ACTIVE, label: "Active" },
  { value: STATUS.INACTIVE, label: "Inactive" },
];

export const STATUS_FILTER_OPTIONS_SIMPLE = ["All Status", "ACTIVE", "INACTIVE"];

export const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: ROLES.DRIVER, label: "Driver" },
  { value: ROLES.ATTENDANT, label: "Attendant" },
];

export const ROLE_OPTIONS_SIMPLE = ["All Roles", "DRIVER", "ATTENDANT"];

export const TYPE_OPTIONS_BASE = [
  { value: "", label: "All Types" },
];

export const PICKUP_TYPES_OPTIONS = [
  { value: PICKUP_DROP_TYPES.BOTH, label: "BOTH" },
  { value: PICKUP_DROP_TYPES.PICKUP_ONLY, label: "PICKUP ONLY" },
  { value: PICKUP_DROP_TYPES.DROP_ONLY, label: "DROP ONLY" },
];

export const FEE_FREQUENCY_OPTIONS = [
  FEE_FREQUENCIES.MONTHLY,
  FEE_FREQUENCIES.QUARTERLY,
  FEE_FREQUENCIES.ANNUALLY,
  FEE_FREQUENCIES.ONE_TIME,
];

export const FEE_FREQ_FILTER_OPTIONS = ["All Frequencies", ...FEE_FREQUENCY_OPTIONS];

// ─── Default Form States ────────────────────────────────────────────
export const EMPTY_ALLOCATION = {
  studentId: "",
  routeId: "",
  stopId: "",
  pickupDropType: PICKUP_DROP_TYPES.BOTH,
  effectiveFrom: "",
  effectiveTo: "",
  feePlanId: "",
  remarks: "",
};

export const EMPTY_FEE_PLAN = {
  planName: "",
  routeId: "",
  feeAmount: "",
  frequency: FEE_FREQUENCIES.MONTHLY,
  distanceSlabKm: "",
  description: "",
};

// ─── UI Labels & Text Mappings ──────────────────────────────────────
export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_TYPES.BUS]: "BUS",
  [VEHICLE_TYPES.MINI_BUS]: "MINI BUS",
  [VEHICLE_TYPES.VAN]: "VAN",
};

export const PICKUP_DROP_LABELS = {
  [PICKUP_DROP_TYPES.BOTH]: "BOTH",
  [PICKUP_DROP_TYPES.PICKUP_ONLY]: "PICKUP ONLY",
  [PICKUP_DROP_TYPES.DROP_ONLY]: "DROP ONLY",
};

export const REPORT_TAB_LABELS = {
  [REPORT_TABS.ROUTE]: "Route Student List",
  [REPORT_TABS.VEHICLE]: "Vehicle Capacity",
  [REPORT_TABS.DRIVER]: "Staff Assignments",
  [REPORT_TABS.FEE]: "Student Fee Report",
};

// ─── Theme & Styling Mappings ───────────────────────────────────────
export const ROLE_COLORS = {
  [ROLES.DRIVER]: "bg-blue-100 text-blue-700",
  [ROLES.ATTENDANT]: "bg-teal-100 text-teal-700",
};

export const VEHICLE_TYPE_COLORS = {
  [VEHICLE_TYPES.BUS]: "bg-blue-100 text-blue-700",
  [VEHICLE_TYPES.MINI_BUS]: "bg-teal-100 text-teal-700",
  "MINI BUS": "bg-teal-100 text-teal-700",
  [VEHICLE_TYPES.VAN]: "bg-orange-100 text-orange-700",
};

export const PICKUP_DROP_COLORS = {
  [PICKUP_DROP_TYPES.BOTH]: "bg-blue-100 text-blue-700",
  [PICKUP_DROP_TYPES.PICKUP_ONLY]: "bg-teal-100 text-teal-700",
  [PICKUP_DROP_TYPES.DROP_ONLY]: "bg-purple-100 text-purple-700",
  "PICKUP ONLY": "bg-teal-100 text-teal-700",
  "DROP ONLY": "bg-purple-100 text-purple-700",
};

export const FEE_FREQ_COLORS = {
  [FEE_FREQUENCIES.MONTHLY]: "bg-blue-100 text-blue-700",
  [FEE_FREQUENCIES.QUARTERLY]: "bg-purple-100 text-purple-700",
  [FEE_FREQUENCIES.ANNUALLY]: "bg-orange-100 text-orange-700",
  [FEE_FREQUENCIES.ONE_TIME]: "bg-gray-100 text-gray-600",
};

export const ALERT_STYLES = {
  warning: {
    wrap: "bg-amber-50 border border-amber-200",
    boldColor: "text-orange-700",
  },
  error: {
    wrap: "bg-red-50 border border-red-200",
    boldColor: "text-red-700",
  },
  info: {
    wrap: "bg-blue-50 border border-blue-200",
    boldColor: "text-blue-700",
  },
};

export const SHARED_INPUT_STYLES = {
  base: "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition border-gray-200 focus:ring-blue-300 focus:border-blue-400",
  errCls: "border-red-400 focus:ring-red-200 focus:border-red-400",
};

// ─── Table Columns ──────────────────────────────────────────────────
export const VEHICLE_TABLE_COLUMNS = [
  { label: "#", extra: "px-4 sm:px-6 w-8" },
  { label: "Vehicle", extra: "px-3 sm:px-4" },
  { label: "Type", extra: "px-3 sm:px-4" },
  { label: "Capacity", extra: "px-3 sm:px-4" },
  { label: "GPS", extra: "px-3 sm:px-4" },
  { label: "Make / Model", extra: "px-3 sm:px-4 hidden 2xl:table-cell" },
  { label: "Compliance", extra: "px-3 sm:px-4" },
  { label: "Status", extra: "px-3 sm:px-4" },
  { label: "Actions", extra: "px-3 sm:px-4 text-center" },
];

export const STAFF_TABLE_COLUMNS = [
  "Name", "Role", "Contact", "License No.", "License Expiry", "Joining Date", "Status", "Actions"
];

export const STAFF_ASSIGNMENT_COLUMNS = [
  "Name", "Role", "Contact", "License No.", "License Expiry", "Status", "Routes Assigned", "Students"
];

export const STUDENT_FEE_COLUMNS = [
  "Student ID", "Name", "Class", "Route", "Stop", "Type", "Amount", "Frequency"
];

export const VEHICLE_CAPACITY_COLUMNS = [
  "Vehicle No.", "Type", "Make/Model", "Capacity", "Allocated", "Available", "Utilisation", "Insurance Expiry", "Fitness Expiry", "Routes"
];

export const ROUTE_STUDENT_LIST_COLUMNS = [
  "Student ID", "Student Name", "Class", "Pickup/Drop", "Fee Plan", "Amount"
];

export const FEE_PLAN_TABLE_COLUMNS = [
  "Plan Name", "Route", "Amount", "Frequency", "Distance Slab", "Status", "Actions"
];

// ─── CSV Export Headers ─────────────────────────────────────────────
export const CSV_HEADERS = {
  STAFF_ASSIGNMENT: [
    "Name", "Role", "Contact", "License No.", "License Expiry", "License Status", "Total Routes", "Routes Assigned", "Total Students"
  ],
  STUDENT_FEE: [
    "Student ID", "Name", "Class", "Section", "Roll No.", "Route", "Stop", "Pickup/Drop", "Fee Plan", "Amount", "Frequency", "Effective From", "Effective To", "Active"
  ],
  VEHICLE_CAPACITY: [
    "Vehicle No.", "Type", "Make/Model", "Total Capacity", "Allocated", "Available", "Utilisation %", "Insurance Expiry", "Insurance Expiring Soon", "Fitness Expiry", "Fitness Expiring Soon", "GPS Enabled", "Status", "Routes Assigned"
  ],
  ROUTE_STUDENT_REPORT: [
    "Stop Order", "Stop Name", "Stop Address", "Student ID", "Student Name", "Class", "Section", "Roll No", "Pickup/Drop", "Fee Plan", "Fee Amount", "Fee Frequency", "Effective From", "Effective To"
  ]
};

// ─── Form Validation Messages ───────────────────────────────────────
export const VALIDATION_MESSAGES = {
  PLAN_NAME_REQ: "Plan name is required",
  FEE_AMOUNT_REQ: "Fee amount is required",
  FEE_AMOUNT_INVALID: "Enter a valid positive amount",
  FREQUENCY_REQ: "Frequency is required",
  DESCRIPTION_REQ: "Description is required",
};

// ─── Toast / Notification Messages ──────────────────────────────────
export const TOAST_MESSAGES = {
  // Staff Messages
  STAFF_LOAD_FAIL: "Failed to load staff.",
  STAFF_ADD_SUCCESS: "Staff added successfully.",
  STAFF_UPDATE_SUCCESS: "Staff updated successfully.",
  STAFF_REPORT_LOAD_FAIL: "Failed to load staff assignment report.",

  // Route Messages
  ROUTES_LOAD_FAIL: "Failed to load routes. Please try again.",
  ROUTE_CREATE_SUCCESS: "Route created successfully.",
  ROUTE_UPDATE_SUCCESS: "Route updated successfully.",
  ROUTE_REPORT_LOAD_FAIL: "Failed to load route report.",

  // Stop Messages
  STOPS_LOAD_FAIL: "Failed to load stops.",
  STOP_ADD_SUCCESS: "Stop added successfully.",
  STOP_UPDATE_SUCCESS: "Stop updated successfully.",
  STOP_DELETE_SUCCESS: "Stop deleted successfully.",
  STOP_DELETE_FAIL: "Failed to delete stop.",

  // Vehicle Messages
  VEHICLES_LOAD_FAIL: "Failed to load vehicles.",
  VEHICLE_ADD_SUCCESS: "Vehicle added successfully.",
  VEHICLE_UPDATE_SUCCESS: "Vehicle updated successfully.",
  VEHICLE_REPORT_LOAD_FAIL: "Failed to load vehicle capacity report.",

  // Allocation Messages
  ALLOCATION_LOAD_FAIL: "Failed to load allocations. Please try again.",
  ALLOCATION_UPDATE_FAIL: "Failed to update allocation status.",
  ALLOCATION_DEACTIVATE_SUCCESS: "Student transport deactivated successfully.",
  ALLOCATION_CREATE_SUCCESS: "Student allocated successfully.",
  ALLOCATION_UPDATE_SUCCESS: "Allocation updated successfully.",

  // Fee Plan Messages
  FEE_PLAN_LOAD_FAIL: "Failed to load fee plans. Please try again.",
  FEE_PLAN_CREATE_SUCCESS: "Fee plan created successfully!",
  FEE_PLAN_CREATE_FAIL: "Failed to create fee plan. Please try again.",
  FEE_PLAN_UPDATE_SUCCESS: "Fee plan updated successfully!",
  FEE_PLAN_UPDATE_FAIL: "Failed to update fee plan. Please try again.",
  FEE_PLAN_STATUS_UPDATE_FAIL: "Failed to update fee plan status. Please try again.",
  FEE_PLAN_ACTIVATE_SUCCESS: "Fee plan activated successfully.",
  FEE_PLAN_DEACTIVATE_SUCCESS: "Fee plan deactivated successfully.",

  // Fee Report Messages
  FEE_REPORT_LOAD_FAIL: "Failed to load fee report.",

  // Export Messages
  EXPORT_NO_DATA: "No data to export.",
  EXPORT_SUCCESS: "CSV exported successfully!",

  // Miscellaneous
  API_NOT_IMPLEMENTED: "Activation API not implemented yet.",
};

// ─── Fee Plan UI Text & Placeholders ─────────────────────────────────
export const FEE_PLAN_UI_TEXT = {
  // Page Level
  PAGE_TITLE: "Fees Management",
  PAGE_SUBTITLE: "Manage transport fee collection, payments, concessions, and adjustments.",
  SECTION_TITLE: "Transport Fee Plans",
  ADD_BTN: "Add Fee Plan",
  SEARCH_PLACEHOLDER: "Search plan name or route...",
  EMPTY_STATE_TITLE: "No fee plans found",
  EMPTY_STATE_SUBTITLE: "Try adjusting your search or filters",

  // Data Presentation
  GENERIC_ROUTE: "Generic",
  GENERIC_DISTANCE_PLAN: "Generic / Distance Plan",
  ROUTE_PREFIX: "Route: ",
  SLAB_PREFIX: "Slab: ",
  SHOWING: "Showing",
  OF: "of",
  PLAN_SINGULAR: "plan",
  PLAN_PLURAL: "plans",

  // Modal Titles & Buttons
  CREATE_MODAL_TITLE: "Create Fee Plan",
  EDIT_MODAL_TITLE: "Edit Fee Plan",
  BTN_CANCEL: "Cancel",
  BTN_SAVE: "Save Plan",
  BTN_SAVING: "Saving…",
  BTN_UPDATE: "Update Plan",
  BTN_UPDATING: "Updating…",

  // Form Labels, Placeholders & Options
  LBL_PLAN_NAME: "Plan Name",
  PH_PLAN_NAME: "e.g. Route C Monthly Fee",
  LBL_ROUTE: "Route (optional)",
  OPT_GENERIC_ROUTE: "— Generic / Distance Plan —",
  OPT_LOADING_ROUTES: "Loading routes…",
  LBL_FEE_AMOUNT: "Fee Amount",
  PH_FEE_AMOUNT: "1200.00",
  CURRENCY_SYMBOL: "₹",
  LBL_FREQUENCY: "Frequency",
  LBL_DISTANCE_SLAB: "Distance Slab (km)",
  PH_DISTANCE_SLAB: "5.0 (optional)",
  LBL_DESCRIPTION: "Description",
  PH_DESCRIPTION: "Brief description",
};

// ─── Reports UI Text, Labels & Export Constants ──────────────────────
export const REPORT_UI_TEXT = {
  // Page Level
  PAGE_TITLE: "Reports Management",
  PAGE_SUBTITLE: "View route-wise student lists, vehicle capacity, staff assignments, and student fee reports.",

  // Tab: Route Student List
  ROUTE_TAB_TITLE: "Route-wise Student List",
  ROUTE_META_LABELS: {
    ROUTE: "Route",
    ROUTE_CODE: "Route Code",
    VEHICLE: "Vehicle",
    DRIVER: "Driver",
    ATTENDANT: "Attendant",
    PICKUP_DROP: "Pickup / Drop",
    UTILISATION: "Utilisation"
  },
  NO_DATA_ROUTE: "No data found for the selected route.",
  NO_STUDENTS_ALLOCATED: "No students allocated to this route yet.",
  OPT_LOADING_ROUTES: "Loading routes…",
  STUDENT_COUNT_SINGULAR: "student",
  STUDENT_COUNT_PLURAL: "students",

  // Tab: Staff Assignments
  STAFF_TAB_TITLE: "🧑‍✈️ Driver & Attendant Assignment Report",
  SHOW_EXPIRING_LICENSES: "Show only expiring licences",
  NO_STAFF_RECORDS: "No staff records found.",
  LBL_LICENSE_NO: "License Number",
  LBL_EXPIRY_DATE: "Expiry Date",
  UNASSIGNED: "Unassigned",
  BADGE_EXPIRED: "Expired",
  BADGE_EXPIRING: "Expiring",
  BADGE_VALID: "Valid",

  // Tab: Student Fee Report
  FEE_TAB_TITLE: "🪪 Student Transport Fee Report",
  OPT_ALL_ROUTES: "All Routes",
  LBL_TOTAL_STUDENTS_TRANSPORT: "Students with Transport",
  LBL_TOTAL_MONTHLY_REV: "Total Monthly Revenue",
  LBL_TOTAL_ANNUAL_REV: "Total Annual Revenue",
  SECTION_ROUTE_BREAKDOWN: "Route Breakdown",
  SECTION_FREQ_DIST: "Frequency Distribution",
  NO_ROUTE_DATA: "No route data.",
  NO_FREQ_DATA: "No frequency data.",
  NO_STUDENTS_FOUND: "No students found.",

  // Tab: Vehicle Capacity
  CAPACITY_TAB_TITLE: "🚌 Vehicle Capacity Utilisation Report",
  SHOW_OVER_CAPACITY: "Show only over-capacity vehicles",
  EXPIRY_ALERT_WITHIN: "Expiry alert within",
  DAYS: "days",
  NO_VEHICLES_FOUND: "No vehicles found.",
  LBL_CAPACITY: "Capacity",
  LBL_ALLOCATED: "Allocated",
  LBL_AVAILABLE: "Available",
  LBL_INS: "Ins:",
  LBL_FIT: "Fit:",

  // Shared Common
  BTN_EXPORT_CSV: "Export CSV",
  BTN_REFRESH: "Refresh",
  LBL_LOADING: "Loading…",
  N_A: "N/A",
  YES: "Yes",
  NO: "No",
};

export const EXPORT_CONSTANTS = {
  // Route Student List
  ROUTE_REPORT_TITLE: "Route Report",
  ROUTE_REPORT_PREFIX: "student_report.csv",

  // Staff Assignment
  STAFF_REPORT_TITLE: "Staff Assignment Report",
  STAFF_FILE_NAME: "staff_assignment_report.csv",
  STAFF_LIC_EXPIRED: "EXPIRED",
  STAFF_LIC_EXPIRING: "EXPIRING SOON",

  // Student Fee
  FEE_REPORT_TITLE: "Student Transport Fee Report",
  FEE_FILE_NAME: "student_fee_report.csv",
  FEE_META_TOTAL_STUDENTS: "Total Students",
  FEE_META_WITH_PLAN: "Students with Fee Plan",
  FEE_META_WITHOUT_PLAN: "Students without Plan",

  // Vehicle Capacity
  CAPACITY_REPORT_TITLE: "Vehicle Capacity Utilisation Report",
  CAPACITY_FILE_NAME: "vehicle_capacity_report.csv",
};

export const REPORT_TABLE_HEADERS = {
  ROUTE_BREAKDOWN: ["Route", "Students", "Monthly Rev.", "Annual Rev."],
  FREQ_DISTRIBUTION: ["Frequency", "Students"],
};

// ─── Allocation ui text  ────────────────────

export const ALLOCATION_UI_TEXT = {
  // Page Level
  PAGE_TITLE: "Student Allocation Management",
  PAGE_SUBTITLE: "Allocate students to transport routes and stops, manage pickup/drop preferences and fee plans.",
  SECTION_TITLE: "Student Transport Allocations",
  ALLOCATION_SINGULAR: "allocation",
  ALLOCATION_PLURAL: "allocations",
  TOTAL: "total",
  BTN_ALLOCATE: "Allocate Student",
  SEARCH_PLACEHOLDER: "Search student name, admission no…",
  ROWS_PER_PAGE: "Rows per page:",
  SHOWING: "Showing",
  OF: "of",

  // Add Modal
  ADD_MODAL_TITLE: "Allocate Student to Transport",
  ADD_MODAL_SUBTITLE: "Assign a student to a route, stop and fee plan",
  INFO_BANNER_ADD: "Vehicle capacity is validated automatically. A student can only have one active transport allocation.",
  BTN_ALLOCATING: "Allocating…",
  BTN_ALLOCATE_SAVE: "Allocate",

  // Edit Modal
  EDIT_MODAL_TITLE: "Edit Transport Allocation",
  EDIT_MODAL_SUBTITLE_PREFIX: "Editing allocation for",
  INFO_BANNER_EDIT: "Changes to route or stop will take effect immediately. Student cannot be changed after allocation.",
  BTN_UPDATING: "Updating…",
  BTN_UPDATE_SAVE: "Update Allocation",
  LBL_READONLY_STUDENT: "Student cannot be changed after allocation",
  LBL_ADM: "Adm:",

  // Form Fields & Placeholders
  LBL_STUDENT: "Student",
  LBL_ROUTE: "Route",
  LBL_STOP: "Stop",
  LBL_PICKUP_DROP: "Pickup / Drop Type",
  LBL_EFFECTIVE_FROM: "Effective From",
  LBL_EFFECTIVE_TO: "Effective To",
  LBL_FEE_PLAN: "Fee Plan",
  LBL_REMARKS: "Remarks",
  PH_STUDENT: "— Select Student —",
  PH_ROUTE: "— Select Route —",
  PH_STOP: "— Select Stop —",
  PH_STOP_DISABLED: "— Select Route first —",
  PH_TYPE: "— Select Type —",
  PH_FEE_PLAN: "— Select Fee Plan —",
  PH_OPTIONAL: "Optional",
  PH_SELECT_DEFAULT: "— Select —",
  
  // Select Input UI
  PH_SELECT_SEARCH: "Search…",
  NO_RESULTS: "No results found",
  OPTION_SINGULAR: "option",
  OPTION_PLURAL: "options",
  LBL_LOADING: "Loading…",
};

// ─── Shared UI & Action Texts ─────────────────────────────────────────
export const COMMON_UI_TEXT = {
  WAIT: "Wait…",
  FOUND: "found",
  EDIT: "Edit",
  DELETE: "Delete",
  DEACTIVATE: "Deactivate",
  ACTIVATE: "Activate",
};

export const ACTION_MESSAGES = {
  DEACTIVATED: "deactivated.",
  ACTIVATED: "activated.",
  FAILED_DEACTIVATE: "Failed to deactivate",
  FAILED_ACTIVATE: "Failed to activate",
};

// ─── Staff Management UI Text ─────────────────────────────────────────
export const STAFF_UI_TEXT = {
  PAGE_TITLE: "Drivers & Attendants",
  PAGE_SUBTITLE: "Manage all transport staff — add drivers and attendants, track licence expiry, and toggle active status.",
  SECTION_TITLE: "Manage Staff",
  BTN_ADD_STAFF: "Add Staff",
  SEARCH_PLACEHOLDER: "Search by name or contact…",
  EMPTY_TITLE: "No staff found",
  EMPTY_SUBTITLE: "Try adjusting your search or filters",
  LBL_LICENSE_NO: "License No.",
  LBL_LICENSE_EXPIRY: "License Expiry",
  LBL_JOINING_DATE: "Joining Date",
  LBL_ALT_CONTACT: "Alt:",
  STAFF_MEMBER: "staff member",
  STAFF_MEMBERS: "staff members",
};

// ─── Routes Management UI Text ────────────────────────────────────────
export const ROUTES_UI_TEXT = {
  PAGE_TITLE: "Routes Management",
  PAGE_SUBTITLE: "Create and manage transport routes, assign vehicles and drivers, and configure stops with pickup & drop timings.",
  SECTION_ROUTES: "Routes",
  SECTION_STOPS: "Route Stops",
  BTN_NEW_ROUTE: "New Route",
  BTN_ADD_STOP: "Add Stop",
  SEARCH_PLACEHOLDER: "Search route name or code…",
  EMPTY_ROUTES_TITLE: "No routes found",
  EMPTY_ROUTES_SUBTITLE: "Try adjusting your search or filters",
  EMPTY_STOPS_TITLE: "No stops yet",
  EMPTY_STOPS_SUBTITLE: "Click \"+ Add Stop\" to add the first stop",
  SELECT_ROUTE_TITLE: "Select a route to view stops",
  SELECT_ROUTE_SUBTITLE: "Use the dropdown above to pick a route",
  SELECT_ROUTE_OPT: "— Select a Route to view Stops —",
  LBL_PICKUP: "Pickup:",
  LBL_DROP: "Drop:",
  LBL_STOP: "stop",
  LBL_STOPS: "stops",
  LBL_ROUTE: "route",
  LBL_ROUTES: "routes",
};

// ─── Transport Dashboard UI Text ──────────────────────────────────────
export const DASHBOARD_UI_TEXT = {
  PAGE_TITLE: "Transport Management",
  PAGE_SUBTITLE: "Monitor vehicles, routes, drivers and compliance across your fleet.",
  CARD_VEHICLES: "Total Vehicles",
  CARD_ROUTES: "Active Routes",
  CARD_STUDENTS: "Students Allocated",
  CARD_STAFF: "Transport Staff",
  LBL_ACTIVE: "Active",
  LBL_STOPS_TOTAL: "Stops Total",
  LBL_OUT_OF: "Out of",
  LBL_CAPACITY: "capacity",
  LBL_DRIVER: "Driver",
  LBL_DRIVERS: "Drivers",
  LBL_ATTENDANT: "Attendant",
  LBL_ATTENDANTS: "Attendants",
  SECTION_CAPACITY: "Vehicle Capacity Utilisation",
  SECTION_ALERTS: "Alerts & Expiry Notices",
  SECTION_ROUTES_SUMMARY: "Active Routes Summary",
  ALERTS_CLEAR_TITLE: "All clear! No active alerts.",
  ALERTS_CLEAR_SUB: "Insurance, fitness & licences are up to date.",
  BADGE_FULL: "Full",
  BADGE_NEAR_FULL: "Near Full",
  BADGE_AVAILABLE: "Available",
  ALERT_INS_EXPIRES: " – Insurance expires on ",
  ALERT_FIT_EXPIRES: " – Fitness certificate expires on ",
  ALERT_LIC_EXPIRES: " – Driving licence expires on ",
  ALERT_LIC_EXPIRED: " – Driving licence expired on ",
  ALERT_EXPIRED: " (EXPIRED)",
  ALERT_CAP_1: " route is at ",
  ALERT_CAP_2: "100% capacity",
  ALERT_CAP_3: ". No more students can be allocated.",
  DAYS_LEFT: "days left",
};

// ─── Vehicle Management UI Text ───────────────────────────────────────
export const VEHICLE_UI_TEXT = {
  PAGE_TITLE: "Vehicle Management",
  PAGE_SUBTITLE: "Manage your entire fleet — add vehicles, track GPS status, monitor insurance & fitness expiry, and toggle active status in one place.",
  SECTION_TITLE: "Manage Vehicles",
  BTN_ADD_VEHICLE: "Add Vehicle",
  SEARCH_PLACEHOLDER: "Search by vehicle number or model…",
  EMPTY_TITLE: "No vehicles found",
  EMPTY_SUBTITLE: "Try adjusting your search or filters",
  LBL_CAPACITY: "Capacity",
  LBL_SEATS: "seats",
  LBL_GPS: "GPS",
  LBL_ENABLED: "Enabled",
  LBL_DISABLED: "Disabled",
  LBL_INS_EXPIRY: "Insurance Expiry",
  LBL_FIT_EXPIRY: "Fitness Expiry",
  LBL_VEHICLE: "vehicle",
  LBL_VEHICLES: "vehicles",
};
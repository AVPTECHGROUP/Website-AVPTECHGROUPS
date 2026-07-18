
// ═══════════════════════════════════════════════════════════════════════
// SHARED — used across multiple Leave screens
// ═══════════════════════════════════════════════════════════════════════

// Role hierarchy used to decide who can approve whose leave request.
// Lower index = higher authority. Any role not listed ranks Infinity (cannot approve anyone).
export const ROLE_HIERARCHY = [
  'GLOBAL_ADMIN',
  'SUPER_ADMIN',
  'ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'HOD',
  'TEACHER',
  'ACCOUNTANT',
  'RECEPTIONIST',
  'STAFF',
  'STUDENT',
];

// Badge color classes keyed by leave/holiday request status
export const STATUS_STYLES = {
  PENDING: 'bg-amber-50   text-amber-800  border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  REJECTED: 'bg-red-50     text-red-800    border border-red-200',
  CANCELLED: 'bg-orange-50  text-orange-800 border border-orange-200',
  WITHDRAWN: 'bg-gray-50    text-gray-700   border border-gray-200',
};

// Avatar background colors, cycled through by initial/name
export const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-amber-500',
];

// ═══════════════════════════════════════════════════════════════════════
// ApplyLeaves.jsx
// ═══════════════════════════════════════════════════════════════════════
export const APPLY_LEAVES_TEXT = {
  pageTitle: 'New Leave Request',
  pageSubtitle: 'Submit your application for review.',
  labels: {
    employeeName: 'Employee Name',
    leaveType: 'Leave Type',
    fromDate: 'From Date',
    toDate: 'To Date',
    mobile: 'Mobile Number',
    halfDayLeave: 'Half Day Leave',
    enableHalfDay: 'Enable Half Day',
    reason: 'Reason For Leave',
  },
  placeholders: {
    employeeName: 'eg. Sah Jenkins',
    leaveTypeSelect: 'Select Leave Type',
    mobile: 'Enter mobile number during leave',
    reason: 'Please describe the reason for your absence...',
  },
  helperText: {
    halfDayHint: 'Select the same From and To date to enable half day leave.',
  },
  buttons: {
    discard: 'Discard Changes',
    submitting: 'Submitting ...',
    submit: 'Submit Request',
  },
};

export const APPLY_LEAVES_VALIDATION_MESSAGES = {
  leaveTypeRequired: 'Leave type is required',
  fromDateRequired: 'From date is required',
  toDateRequired: 'To date is required',
  reasonRequired: 'Reason for leave is required',
  toBeforeFrom: 'To leave date must be after from leave date',
  fixErrors: 'Please fix all validation errors',
};

export const APPLY_LEAVES_TOAST_MESSAGES = {
  loadLeaveTypesFailed: 'Failed to load leave types',
  validationFailed: 'Validation failed',
  createRequestFailed: 'Failed to create leave request',
};

export const APPLY_LEAVES_EMPTY_FORM = {
  leaveType: '',
  fromDate: '',
  toDate: '',
  reason: '',
};

// ═══════════════════════════════════════════════════════════════════════
// LeaveConfig.jsx
// ═══════════════════════════════════════════════════════════════════════

// Falls back to FALLBACK_COLOR for any leave type not yet color-mapped
export const LEAVE_TYPE_COLOR_PALETTE = [
  'bg-red-50 text-red-600 border-red-200',
  'bg-blue-50 text-blue-600 border-blue-200',
  'bg-green-50 text-green-600 border-green-200',
  'bg-gray-100 text-gray-600 border-gray-200',
  'bg-pink-50 text-pink-600 border-pink-200',
  'bg-indigo-50 text-indigo-600 border-indigo-200',
  'bg-slate-50 text-slate-600 border-slate-200',
  'bg-yellow-50 text-yellow-600 border-yellow-200',
  'bg-orange-50 text-orange-600 border-orange-200',
  'bg-purple-50 text-purple-600 border-purple-200',
];

export const FALLBACK_COLOR = 'bg-gray-100 text-gray-600 border-gray-200';

export const LEAVE_CONFIG_EMPTY_FORM = {
  leaveType: '',
  leaveName: '',
  annualLimit: '',
  description: '',
  carryForwardAllowed: false,
  maxCarryForwardDays: 0,
};

export const LEAVE_CONFIG_TEXT = {
  pageTitle: 'Leave Configuration',
  pageSubtitle: 'Manage annual leave limits and policies for each leave type',
  buttons: {
    seedDefaults: 'Seed Defaults',
    addLeaveType: 'Add Leave Type',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    close: 'Close',
    disable: 'Disable',
    reEnable: 'Re-enable',
  },
  statCards: {
    totalTypes: 'Total Types',
    activeTypes: 'Active Types',
    totalAnnualDays: 'Total Annual Days',
    carryForward: 'Carry Forward',
  },
  table: {
    sectionTitle: 'Leave Types',
    headers: ['#', 'Leave Type', 'Display Name', 'Annual Limit', 'Carry Forward', 'Status', 'Actions'],
    filterOptions: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  emptyStates: {
    inactive: 'No inactive leave types',
    active: 'No active leave types',
    none: 'No leave types configured',
    seedHint: 'Click "Seed Defaults" to set up standard leave types, or add one manually.',
  },
  viewModal: {
    annualLimitLabel: 'Annual Limit',
    statusLabel: 'Status',
    carryForwardLabel: 'Carry Forward',
    descriptionLabel: 'Description',
    enabled: 'Enabled',
    unlimited: 'Unlimited',
    notAllowed: 'Not allowed',
    active: 'Active',
    inactive: 'Inactive',
  },
  deleteModal: {
    title: 'Disable Leave Type',
    confirmPrefix: 'Are you sure you want to disable',
    note: 'This leave type will no longer appear in balance or apply-for-leave screens.',
  },
  seedModal: {
    title: 'Seed Default Leave Types',
    description: 'This will provision all standard leave types with platform-recommended defaults.',
    note: 'Only runs if no active configurations exist. If active configs already exist, this is a no-op.',
  },
  reEnableModal: {
    title: 'Re-enable Leave Type',
    confirmPrefix: 'Re-enable',
    note: 'It will be restored with its current settings and appear again in balance and leave application screens.',
  },
  formModal: {
    titleAdd: 'Add Leave Type',
    titleEdit: 'Edit Leave Configuration',
    leaveTypeLabel: 'Leave Type',
    leaveTypeLoading: 'Loading leave types…',
    leaveTypePlaceholder: '— Select leave type —',
    displayNameLabel: 'Display Name',
    displayNamePlaceholder: 'e.g. Sick Leave',
    annualLimitLabel: 'Annual Limit (days)',
    annualLimitUnlimitedHint: '(0 = unlimited)',
    annualLimitPlaceholder: 'e.g. 12',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Policy note shown to staff (optional)',
    carryForwardLabel: 'Carry Forward',
    carryForwardHint: 'Roll unused days to next year',
    maxCarryForwardLabel: 'Max Carry Forward Days',
    maxCarryForwardHint: '(0 = unlimited)',
  },
};

export const LEAVE_CONFIG_VALIDATION_MESSAGES = {
  leaveTypeRequired: 'Leave type is required',
  leaveTypeExists: 'Leave type already exists.',
  displayNameRequired: 'Display name is required',
  displayNameMin: 'Min 2 characters',
  displayNameMax: 'Max 100 characters',
  annualLimitRequired: 'Annual limit is required',
  annualLimitMin: 'Must be ≥ 0',
  descriptionMax: 'Max 500 characters',
  maxCarryForwardMin: 'Must be ≥ 0',
};

export const LEAVE_CONFIG_TOAST_MESSAGES = {
  loadLeaveTypeOptionsFailed: 'Failed to load leave type options',
  loadConfigsFailed: 'Failed to load leave configurations',
  seedSuccess: 'Default leave configurations seeded successfully',
  seedFailed: 'Failed to seed defaults',
  addedSuccessSuffix: 'added successfully!',
  createFailed: 'Failed to create leave configuration',
  updatedSuccessSuffix: 'updated successfully!',
  updateFailed: 'Failed to update leave configuration',
  disabledSuccessSuffix: 'disabled successfully',
  disableFailed: 'Failed to disable leave type',
  reEnabledSuccessSuffix: 're-enabled successfully',
  reEnableFailed: 'Failed to re-enable leave type',
};

// ═══════════════════════════════════════════════════════════════════════
// Leaves.jsx
// ═══════════════════════════════════════════════════════════════════════
export const LEAVES_TEXT = {
  statCards: {
    pendingRequests: 'Pending Requests',
    approvedThisMonth: 'Approved This Month',
    rejectedThisMonth: 'Rejected This Month',
    appliedThisMonth: 'Applied This Month',
  },
  table: {
    headers: ['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Action'],
  },
  buttons: {
    approve: 'Approve',
    reject: 'Reject',
    view: 'View',
    viewDetails: 'View Details',
    retry: 'Retry',
  },
  emptyStates: {
    errorTitle: 'Error Loading Requests',
    noRequests: 'No requests found',
  },
  duration: {
    halfDay: 'Half Day',
    weekendOrHoliday: 'Weekend / Holiday',
    day: 'Day',
    days: 'Days',
  },
  defaultRemark: 'As per the policy',
  rowsPerPageOptions: [10, 25, 50],
};

export const LEAVES_TOAST_MESSAGES = {
  approvalFailed: 'Leave Approval failed',
  rejectionFailed: 'Leave Rejection failed',
};

// ═══════════════════════════════════════════════════════════════════════
// MyLeaves.jsx
// ═══════════════════════════════════════════════════════════════════════
export const MY_LEAVES_TOAST_MESSAGES = {
  cancelSuccess: 'Leave request cancelled successfully.',
  cancelFailed: 'Failed to cancel leave request.',
};

export const MY_LEAVES_TEXT = {
  // ── Page header ──
  pageTitle: 'My Leave Dashboard',
  pageSubtitle: 'Track and manage your leave requests and balance.',

  // ── Buttons ──
  buttons: {
    requestNewLeave: 'Request New Leave',
    cancel: 'Cancel',
    cancelRequest: 'Cancel Request',
  },

  // ── Stat card names ──
  statCards: {
    availableLeaves: 'Available Leaves',
    sickLeaves: 'Sick Leaves',
    casualLeaves: 'Casual Leaves',
    earnedLeaves: 'Earned Leaves',
  },

  // ── Leave history section ──
  historyTitle: 'My Leave History',
  academicYearPrefix: 'Academic Year',

  // ── Desktop table headers ──
  tableHeaders: ['Leave Type', 'Period', 'Duration', 'Reason', 'Status', 'Action'],

  // ── Mobile card labels ──
  mobileLabels: {
    duration: 'Duration',
  },

  // ── Duration unit text ──
  duration: {
    day: 'day',
    days: 'days',
  },

  // ── Empty / loading states ──
  states: {
    loading: 'Loading requests…',
    noRequests: 'No Request Found',
  },

  // ── Page footer note ──
  footerNote: 'Showing your recent leave activity',

  // ── Fallback values ──
  fallbacks: {
    role: 'N/A',
    somethingWrong: 'Something went wrong',
    noReason: '-',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// HolidayManagement.jsx
// ═══════════════════════════════════════════════════════════════════════
// Badge/chip color classes keyed by holiday type
export const HOLIDAY_TYPE_COLORS = {
  NATIONAL: 'bg-blue-50 text-blue-500',
  REGIONAL: 'bg-indigo-50 text-indigo-500',
  RELIGIOUS: 'bg-orange-50 text-orange-500',
  FESTIVAL: 'bg-pink-50 text-pink-500',
  SCHOOL_EVENT: 'bg-green-50 text-green-500',
  GOVERNMENT: 'bg-gray-200 text-gray-800',
  OPTIONAL: 'bg-yellow-50 text-yellow-500',
  WEEKEND: 'bg-red-50 text-red-500',
  OTHER: 'bg-slate-50 text-slate-500',
};

export const HOLIDAY_TOAST_MESSAGES = {
  createSuccessSuffix: 'added successfully!',
  createFailedDefault: 'Failed to create holiday',
  loadDetailsFailed: 'Failed to load holiday details',
  updateSuccess: 'Holiday updated successfully',
  updateFailedDefault: 'Failed to update holiday',
  deactivateSuccess: 'Holiday deactivated successfully!',
  deactivateFailed: 'Failed to deactivate holiday',
};

export const HOLIDAY_TEXT = {
  // ── Page header ──
  pageTitle: 'Holiday Management',
  pageSubtitle: 'Manage national, regional and religious holidays for Academic Year',

  // ── Buttons ──
  buttons: {
    addHoliday: 'Add Holiday',
    addShort: 'Add',
    clear: 'Clear',
    editHolidayTip: 'Edit holiday',
    markInactiveTip: 'Mark as Inactive',
    inactive: 'Inactive',
    saving: 'Saving…',
    savingShort: '…',
    previous: 'Previous',
    next: 'Next',
  },

  // ── Modals ──
  modals: {
    createTitle: 'Add New Holiday',
    createSubtitle: 'Configure academic calendar breaks',
    editTitle: 'Edit Holiday',
    editSubtitle: 'Update holiday details',
  },

  // ── Stat card names ──
  statCards: {
    totalActive: 'Total Active Holidays',
    national: 'National Active Holidays',
    religious: 'Religious Active Holidays',
    regional: 'Regional Active Holidays',
  },

  // ── Next holiday card ──
  nextHoliday: {
    badge: 'Next Holiday',
    typeLabel: 'Type',
    dateLabel: 'Date',
  },

  // ── Academic year pill ──
  academicYearLabel: 'Academic Year',

  // ── Filter section ──
  filters: {
    sectionTitle: 'Filters',
    showLabel: 'Show',
    hideLabel: 'Hide',
    searchLabel: 'Search Holiday',
    searchPlaceholder: 'Search by name...',
    holidayTypeLabel: 'Holiday Type',
    fromDateLabel: 'From Date',
    toDateLabel: 'To Date',
    allTypesOption: 'All Types',
    // Holiday type dropdown options
    typeOptions: [
      { value: 'NATIONAL', label: 'National' },
      { value: 'REGIONAL', label: 'Regional' },
      { value: 'RELIGIOUS', label: 'Religious' },
      { value: 'FESTIVAL', label: 'Festival' },
      { value: 'SCHOOL_EVENT', label: 'School Event' },
      { value: 'GOVERNMENT', label: 'Government' },
      { value: 'OPTIONAL', label: 'Optional' },
      { value: 'WEEKEND', label: 'Weekend' },
      { value: 'OTHER', label: 'Other' },
    ],
  },

  // ── Table headers ──
  tableHeaders: {
    holidayName: 'Holiday Name',
    statusBadge: 'Status',
    date: 'Date',
    type: 'Type',
    description: 'Description',
    actions: 'Actions',
  },

  // ── Status labels ──
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },

  // ── Empty / loading states ──
  states: {
    loadingHolidays: 'Loading holidays...',
    noHolidaysDesktop: 'No holidays found',
    noHolidaysMobile: 'No Holiday Found',
  },

  // ── Pagination ──
  pagination: {
    // Used as: `Showing ${from} – ${to} of ${total} entries`
    showingPrefix: 'Showing',
    showingOf: 'of',
    showingEntries: 'entries',
  },
};
// FeeManagementConstant.js

export const BASE_URL = import.meta.env.VITE_API_BASE_V1;
export const PAGE_SIZE = 10;

// Date Helpers
export const getTodayDate = () => new Date().toISOString().split('T')[0];
export const getOneMonthAgoDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
};

// Common Status Enums
export const STATUSES = {
    PAID: 'PAID',
    PARTIAL: 'PARTIAL',
    OVERDUE: 'OVERDUE',
    PENDING: 'PENDING',
    UNPAID: 'UNPAID',
    COMPLETED: 'Completed',
    CASH: 'CASH',
    ONLINE: 'ONLINE',
    CHEQUE: 'CHEQUE',
    DD: 'DD',
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT',
    LOCKED: 'LOCKED',
};

// Period Type Enums
export const PERIOD_TYPES = {
    QUARTERLY: 'QUARTERLY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
    HALF_YEARLY: 'HALF_YEARLY',
    CUSTOM: 'CUSTOM',
};

export const PERIOD_TYPE_LABELS = {
    [PERIOD_TYPES.QUARTERLY]: 'Quarterly',
    [PERIOD_TYPES.MONTHLY]: 'Monthly',
    [PERIOD_TYPES.YEARLY]: 'Yearly',
    [PERIOD_TYPES.HALF_YEARLY]: 'Half-Yearly',
    [PERIOD_TYPES.CUSTOM]: 'Custom',
};

// Shared Styles & Maps
export const PERIOD_TYPE_GRADIENT = {
    [PERIOD_TYPES.QUARTERLY]: 'from-[#1A3A5C] to-[#2563EB]',
    [PERIOD_TYPES.MONTHLY]: 'from-[#0369A1] to-[#0EA5E9]',
    [PERIOD_TYPES.YEARLY]: 'from-[#0D7A55] to-[#10B981]',
    [PERIOD_TYPES.HALF_YEARLY]: 'from-[#7C3AED] to-[#A78BFA]',
    [PERIOD_TYPES.CUSTOM]: 'from-[#92400E] to-[#F59E0B]',
};

export const PERIOD_TYPE_BADGE_STYLE = {
    [PERIOD_TYPES.QUARTERLY]: 'bg-blue-50 text-blue-700 border-blue-200',
    [PERIOD_TYPES.MONTHLY]: 'bg-sky-50 text-sky-700 border-sky-200',
    [PERIOD_TYPES.YEARLY]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [PERIOD_TYPES.HALF_YEARLY]: 'bg-violet-50 text-violet-700 border-violet-200',
    [PERIOD_TYPES.CUSTOM]: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const STATUS_PILL_STYLES = {
    [STATUSES.PAID]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [STATUSES.PARTIAL]: 'bg-amber-50 text-amber-700 border-amber-200',
    [STATUSES.OVERDUE]: 'bg-red-50 text-red-700 border-red-200',
    [STATUSES.PENDING]: 'bg-gray-100 text-gray-500 border-gray-200',
    [STATUSES.UNPAID]: 'bg-gray-100 text-gray-500 border-gray-200',
    [STATUSES.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [STATUSES.CASH]: 'bg-gray-100 text-gray-600 border-gray-200',
    [STATUSES.ONLINE]: 'bg-blue-50 text-blue-700 border-blue-200',
    [STATUSES.CHEQUE]: 'bg-slate-50 text-slate-600 border-slate-200',
    [STATUSES.DD]: 'bg-slate-50 text-slate-600 border-slate-200',
    [STATUSES.ACTIVE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [STATUSES.DRAFT]: 'bg-amber-50 text-amber-700 border-amber-200',
    [STATUSES.LOCKED]: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const STATUS_CONFIG_ADVANCED = {
    [STATUSES.PAID]: { label: 'Closed', bg: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
    [STATUSES.OVERDUE]: { label: 'Overdue', bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    [STATUSES.PARTIAL]: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    [STATUSES.PENDING]: { label: 'Upcoming', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

// Payment Modes
export const PAYMENT_MODES_WITH_ICON = [
    ['CASH', '💵', 'Cash'],
    ['ONLINE', '🌐', 'Online'],
    ['CHEQUE', '📝', 'Cheque'],
    ['DD', '🏦', 'DD']
];

// UI Strings: Fee Management (root/shell pages)
export const FEE_MANAGEMENT_STRINGS = {
    ACADEMIC_YEAR_LABEL: "Academic Year",
    BTN_BACK: "Back",
    HEADER_FEE_CONFIG: "Fee Config",
    TAB_KEY_PERIODS: "periods",
    TAB_KEY_STRUCTURES: "structures",
    TAB_PERIODS: "Fee Periods",
    TAB_STRUCTURES: "Fee Structures",
    HEADER_COLLECTIONS: "Collections & History",
    HEADER_FEE_MANAGEMENT: "Fee Management",
    AY_NOT_LOADED_TITLE: "Academic year not loaded",
    AY_NOT_LOADED_DESC: "Could not determine the current academic year. Please go back and select a school, or refresh the page.",
};

export const PAYMENT_MODE_OPTIONS = [
    { value: 'CASH', label: 'Cash' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'DD', label: 'DD' }
];

// Fee Structure Components
export const COMPONENT_TYPE_OPTIONS = [
    { value: 'TUITION_FEE', label: 'Tuition Fee' },
    { value: 'TRANSPORT_FEE', label: 'Transport Fee' },
    { value: 'LAB_FEE', label: 'Lab Fee' },
    { value: 'LIBRARY_FEE', label: 'Library Fee' },
    { value: 'ACTIVITY_FEE', label: 'Activity Fee' },
    { value: 'SPORTS_FEE', label: 'Sports Fee' },
    { value: 'EXAM_FEE', label: 'Exam Fee' },
    { value: 'MISC', label: 'Misc Fee' },
    { value: 'OTHER', label: 'Other Fee' },
];

export const REQUIRES_CUSTOM_NAME = ['MISC', 'OTHER'];

// UI Strings: Fee Periods
export const FEE_PERIOD_STRINGS = {
    DELETE_TITLE: "Delete Fee Period?",
    DELETE_WARNING: "will be permanently removed. This cannot be undone.",
    CANCEL: "Cancel",
    DELETE_BTN: "Yes, Delete",
    DELETING: "Deleting…",
    MODAL_EDIT_TITLE: "Edit Fee Period",
    MODAL_NEW_TITLE: "New Fee Period",
    LABEL_NAME: "Period Name",
    PLACEHOLDER_NAME: "e.g. Q1, Q3, October, Term 1, Annual…",
    HELP_NAME: "A clear name visible to staff when collecting payments.",
    LABEL_TYPE: "Type",
    LABEL_DUE_DATE: "Due Date",
    LABEL_ACADEMIC_YEAR: "Academic Year",
    LABEL_NOTES: "Notes (optional)",
    PLACEHOLDER_NOTES: "e.g. Second quarter of the academic year…",
    BTN_SAVING: "Saving…",
    BTN_UPDATE: "Update Period",
    BTN_SAVE: "Save Period",
    TOAST_VALIDATION: "Validation",
    TOAST_VALIDATION_NAME: "Period name is required",
    TOAST_VALIDATION_TYPE: "Period type is required",
    TOAST_VALIDATION_DATE: "Due date is required",
    TOAST_UPDATED_TITLE: "Period Updated",
    TOAST_UPDATED_MSG: "Fee period has been updated successfully.",
    TOAST_CREATED_TITLE: "Period Created",
    TOAST_CREATED_MSG: "Fee period has been created successfully.",
    TOAST_SAVE_FAILED: "Save Failed",
    TOAST_FETCH_FAILED: "Fetch Failed",
    TOAST_FETCH_FAILED_MSG: "Failed to fetch fee periods",
    TOAST_DELETED_TITLE: "Period Deleted",
    TOAST_DELETE_FAILED: "Delete Failed",
    EMPTY_TITLE: "No fee periods yet",
    EMPTY_DESC: "Get started by creating your first fee period.",
    BTN_NEW_PERIOD: "New Fee Period",
    INFO_BANNER: "Fee Periods define when fee is due. After creating a period, attach class-wise fee structures from the Fee Structures tab.",
    HEADER_TITLE: "Fee Periods",
    HEADER_SUBTITLE: "Define named installment periods · AY",
    CARD_STRUCTURES: "Structures",
    CARD_STUDENTS: "Students",
    CARD_COLLECTED: "Collected",
    CARD_DUE: "Due"
};

// UI Strings: Fee Structures
export const FEE_STRUCTURE_STRINGS = {
    DELETE_TITLE: "Delete Fee Structure?",
    DELETE_WARNING: "will be permanently removed. This cannot be undone.",
    CANCEL: "Cancel",
    DELETE_BTN: "Yes, Delete",
    DELETING: "Deleting…",
    VIEW_TITLE: "Fee Structure Details",
    BTN_CLOSE: "Close",
    LBL_PERIOD: "Period",
    LBL_CLASSES: "Classes",
    LBL_STATUS: "Status",
    LBL_STUDENTS: "Students",
    LBL_COMPONENTS: "Fee Components",
    LBL_TOTAL: "Total",
    MODAL_EDIT_TITLE: "Edit Fee Structure",
    MODAL_NEW_TITLE: "Create Fee Structure",
    STEP_1_TITLE: "Select Period",
    STEP_2_TITLE: "Apply to Classes",
    STEP_3_TITLE: "Fee Components",
    BTN_ADD_COMPONENT: "Add Component",
    BTN_SAVE_DRAFT: "Save as Draft",
    BTN_UPDATE: "Update Structure",
    BTN_SAVE: "Save Structure",
    BTN_SAVING: "Saving…",
    TOAST_VALIDATION: "Validation",
    TOAST_UPDATED_TITLE: "Structure Updated",
    TOAST_UPDATED_MSG: "Fee structure has been updated successfully.",
    TOAST_DRAFT_SAVED: "Draft Saved",
    TOAST_PUBLISHED: "Structure Published",
    TOAST_SAVE_FAILED: "Save Failed",
    TOAST_FETCH_FAILED: "Fetch Failed",
    TOAST_LOAD_FAILED: "Load Failed",
    TOAST_DELETED_TITLE: "Structure Deleted",
    TOAST_DELETE_FAILED: "Delete Failed",
    HEADER_TITLE: "Fee Structures",
    HEADER_SUBTITLE: "Class-wise fee components per period · AY",
    BTN_ADD_STRUCTURE: "Add Structure",
    INFO_BANNER: "A structure sets fee components and amounts for selected classes under a period. Once any payment is recorded it is locked and cannot be edited.",
    EMPTY_TITLE: "No fee structures found",
    EMPTY_DESC_FILTERED: "No structures for the selected period.",
    EMPTY_DESC_DEFAULT: "Get started by creating your first structure.",
    BTN_CREATE: "Create Structure"
};

// UI Strings: Fee Collection Modals
export const FEE_COLLECTION_STRINGS = {
    MODAL_SINGLE_TITLE: "Collect Fee Payment",
    MODAL_SINGLE_SUBTITLE: "Record a student fee payment and generate receipt",
    MODAL_BULK_TITLE: "Bulk Fee Collection",
    MODAL_RECEIPT_TITLE: "Payment Receipt",
    LBL_PERIOD: "Fee Period",
    LBL_CLASS: "Class",
    LBL_STUDENT: "Student",
    LBL_AMOUNT: "Amount to Collect",
    LBL_MODE: "Payment Mode",
    LBL_DATE: "Payment Date",
    LBL_REF: "Reference No.",
    LBL_DISCOUNT: "Discount",
    LBL_REMARKS: "Remarks",
    LBL_RECEIPT_NO: "Receipt No.",
    LBL_NET_TOTAL: "Net Total",
    BTN_CANCEL: "Cancel",
    BTN_CLOSE: "Close",
    BTN_PRINT: "Print",
    BTN_RECORD: "✓ Record & Generate Receipt",
    BTN_PROCESS_BULK: "Process Payments",
    BTN_APPLY_ALL: "Apply to All Rows",
    MSG_NO_CLASS: "No classes linked to this period. Add a fee structure first.",
    MSG_PAID: "This student has no outstanding balance.",
    MSG_SELECT_STUDENT: "Please select a student to continue.",
    MSG_PARTIAL_INFO: "You can collect a partial amount.",
    MSG_OVERDUE_FINE: "Past Due — Add Late Fine?",
    BULK_TABLE_HEADERS: ['Student', 'Class', 'Period', 'Balance Due', 'Collect Amount', 'Discount', 'Late Fine', 'Mode']
};

// UI Strings: Overview Dashboard
export const OVERVIEW_STRINGS = {
    HEADER_TITLE: "Fee Dashboard",
    BTN_EXPORT: "Export",
    BTN_COLLECT: "Collect Fee",
    MSG_WAITING: "⏳ Waiting for academic year data…",
    MSG_LOADING: "Loading data…",
    TOAST_LOAD_FAILED: "Could not fetch fee data. Please refresh.",
    STAT_BILLED: "Total Billed",
    STAT_COLLECTED: "Collected",
    STAT_PARTIAL: "Partial / Pending",
    STAT_OVERDUE: "Overdue",
    STAT_DISCOUNT: "Discounts Given",
    SECTION_CLASS_COLLECTION: "Collection by Class",
    SECTION_RECENT_PAYMENTS: "Recent Collections",
    SECTION_OVERDUE_ALERTS: "Overdue Alerts",
    SECTION_ACTIVE_PERIODS: "Active Fee Periods",
    BTN_VIEW_ALL: "View all",
    BTN_MANAGE_PERIODS: "Manage Periods",
    MSG_NO_CLASS_DATA: "No class data for this period",
    MSG_NO_RECENT: "No recent collections",
    MSG_NO_ACTIVE_PERIODS: "No active fee periods found",
    CLASS_SUMMARY_HEADERS: ['Class', 'Students', 'Billed', 'Collected', 'Balance', 'Progress', 'Status'],
    OVERDUE_ALERTS_HEADERS: ['Student', 'Class', 'Period', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Overdue By']
};

// UI Strings: Collection History
export const COLLECTION_HISTORY_STRINGS = {
    HEADER_TITLE: "Collections & History",
    HEADER_SUBTITLE: "Fee payments and history",
    BTN_EXPORT: "Export",
    BTN_COLLECT_FEE: "Collect Fee",
    TAB_OUTSTANDING: "Outstanding & Overdue",
    TAB_HISTORY: "Payment History",
    ERR_LOAD_OUTSTANDING: "Failed to load outstanding fees.",
    ERR_LOAD_HISTORY: "Failed to load history",
    MSG_WAITING: "⏳ Waiting for school/academic year…",
    MSG_LOADING_OPTIONS: "Loading fee periods and classes…",
    PLACEHOLDER_SEARCH_STUDENT: "Search by name or admission no…",
    PLACEHOLDER_SEARCH_HISTORY: "Receipt no. or student…",
    BTN_FILTERS: "Filters",
    BTN_CLEAR: "Clear",
    BTN_COLLECT: "Collect",
    BTN_CANCEL: "Cancel",
    BTN_RECORD_RECEIPT: "✓ Record & Generate Receipt",
    BTN_RECORDING: "Recording…",
    BTN_PROCESS_PAYMENTS: "Process Payments",
    BTN_PROCESSING: "Processing…",
    BTN_APPLY_ALL: "Apply to All Rows",
    BTN_VIEW_RECEIPT: "View Receipt",
    BTN_PREV: "← Prev",
    BTN_NEXT: "Next →",
    MSG_NO_CLASSES: "No classes linked to this period. Add a fee structure first.",
    MSG_LOADING_CLASSES: "Loading classes…",
    MSG_LOADING_STUDENTS: "Loading students…",
    MSG_NO_STUDENT_MATCH: "No students match your search",
    MSG_NO_STUDENTS_CLASS: "No students found in this class",
    LBL_FEES_FULLY_PAID: "Fees fully paid",
    LBL_ALREADY_PAID: "Already Paid",
    LBL_BALANCE_DUE: "Balance Due",
    MSG_NO_PAYMENT_REQD: "No payment required",
    MSG_NO_OUTSTANDING_BAL: "This student has no outstanding balance.",
    MSG_PARTIAL_INFO: "You can collect a partial amount. Enter any amount up to",
    LBL_AMOUNT_TO_COLLECT: "Amount to Collect",
    LBL_PAYMENT_MODE: "Payment Mode",
    LBL_PAYMENT_DATE: "Payment Date",
    LBL_REFERENCE_NO: "Reference No.",
    LBL_DISCOUNT: "Discount",
    LBL_REASON: "Please Select a Reason..",
    LBL_REMARKS: "Remarks",
    LBL_OPTIONAL_NOTE: "Optional note…",
    MSG_EXCEEDS_BALANCE: "Net amount exceeds balance due",
    MSG_PARTIAL_REMAIN: "Partial payment — will remain outstanding",
    MSG_DISCOUNT_EXCEEDS: "Discount cannot exceed collected amount",
    MSG_LATE_FINE_PROMPT: "Past Due — Add Late Fine?",
    LBL_RECEIPT_NO: "Receipt No.",
    LBL_AUTO_GENERATED: "Auto-generated",
    LBL_NET_COLLECTED: "Net Collected",
    LBL_GRAND_TOTAL: "Grand Total",
    MSG_RECEIPTS_GENERATED: "receipts will be generated",
    MSG_LOADING_OUTSTANDING: "Loading outstanding fees…",
    MSG_NO_OUTSTANDING_RECORDS: "No records found",
    MSG_LOADING_HISTORY: "Loading history…",
    MSG_NO_HISTORY_RECORDS: "No payment records found",

    TOAST_LOAD_FAILED: "Load Failed",
    TOAST_COULD_NOT_FETCH_CLASSES: "Could not fetch classes for this period.",
    TOAST_COULD_NOT_FETCH_STUDENTS: "Could not fetch students for this class.",
    TOAST_FEES_ALREADY_PAID: "Fees Already Paid",
    TOAST_NO_STUDENT_SELECTED: "No Student Selected",
    TOAST_PLEASE_SELECT_STUDENT: "Please select a student.",
    TOAST_NO_BALANCE_DUE: "No Balance Due",
    TOAST_INVALID_AMOUNT: "Invalid Amount",
    TOAST_PLEASE_ENTER_VALID_AMOUNT: "Please enter a valid amount.",
    TOAST_AMOUNT_TOO_HIGH: "Amount Too High",
    TOAST_DISCOUNT_TOO_HIGH: "Discount Too High",
    TOAST_DISCOUNT_EXCEEDS: "Discount cannot exceed the amount being collected.",
    TOAST_NO_PERIOD_SELECTED: "No Period Selected",
    TOAST_PLEASE_SELECT_PERIOD: "Please select a fee period.",
    TOAST_FEE_STRUCTURE_MISSING: "Fee Structure Missing",
    TOAST_NO_FEE_STRUCTURE_FOUND: "No fee structure found for this class and period.",
    TOAST_PAYMENT_RECORDED: "Payment Recorded",
    TOAST_PAYMENT_FAILED: "Payment Failed",
    TOAST_COULD_NOT_RECORD_PAYMENT: "Could not record the payment. Please try again.",
    TOAST_MISSING_AMOUNT: "Missing Amount",
    TOAST_AMOUNT_EXCEEDS_BALANCE: "Amount Exceeds Balance",
    TOAST_BULK_PROCESSED: "Bulk Payment Processed",
    TOAST_BULK_FAILED: "Bulk Payment Failed",
    TOAST_COULD_NOT_PROCESS_BULK: "Could not process bulk payments.",

    TABLE_OUTSTANDING_HEADERS: ['Student', 'Class', 'Period', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Status', 'Action'],
    TABLE_HISTORY_HEADERS: ['Receipt No.', 'Date', 'Student', 'Class', 'Period', 'Collected', 'Discount', 'Late Fine', 'Ref. No.', 'Recorded By', ''],
    TABLE_BULK_HEADERS: ['Student', 'Balance Due', 'Collect Amount', 'Discount', 'Late Fine', 'Mode']
};
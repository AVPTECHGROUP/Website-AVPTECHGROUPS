// ─── Status values (must match backend) ─────────────────────────────────────
export const STATUS = {
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
};

// ─── Pagination ──────────────────────────────────────────────────────────────
export const ROWS_OPTIONS = [5, 10, 20];
export const DEFAULT_ROWS_PER_PAGE = 10;

// ─── Toast ───────────────────────────────────────────────────────────────────
export const TOAST_TYPE = {
    SUCCESS: "success",
    ERROR: "error",
};
export const TOAST_DURATION_MS = 3000;

// ─── Table ───────────────────────────────────────────────────────────────────
export const TABLE_COLUMNS = ["Label", "Start Date", "End Date", "Status", "Current", "Actions"];

// ─── Messages: AcademicYear.jsx ─────────────────────────────────────────────
export const MESSAGES = {
    PAGE_TITLE: "Manage Academic Years",
    YEARS_CONFIGURED_SUFFIX: "configured",
    YEAR_SINGULAR: "year",
    YEAR_PLURAL: "years",
    REFRESH_TITLE: "Refresh",
    ADD_BUTTON: "Add Academic Year",
    FETCH_ERROR: "Failed to load academic years. Please try again.",
    RETRY: "Retry",
    NO_YEARS_FOUND: "No academic years found.",
    SET_CURRENT_SUCCESS: (label) => `${label} set as current year.`,
    SET_CURRENT_ERROR: "Failed to set current year.",
    CLOSE_SUCCESS: (label) => `${label} has been closed.`,
    CLOSE_ERROR: "Failed to close academic year.",
    CREATE_SUCCESS: "Academic year created successfully!",
    SHOWING_PREFIX: "Showing",
    SHOWING_TO: "to",
    SHOWING_OF_RECORDS: "records",
    ROWS_PER_PAGE_LABEL: "Rows per page:",
    OF_LABEL: "of",
};

// ─── Mobile / Table cell labels ──────────────────────────────────────────────
export const FIELD_LABELS = {
    START_DATE: "Start Date",
    END_DATE: "End Date",
    CURRENT: "CURRENT",
    YES: "YES",
};

// ─── Action labels ───────────────────────────────────────────────────────────
export const ACTION_LABELS = {
    SET_CURRENT: "Set Current",
    CLOSE: "Close",
};

// ─── Confirm Close Modal ─────────────────────────────────────────────────────
export const CONFIRM_CLOSE_MODAL = {
    TITLE: "Close Academic Year?",
    DESCRIPTION_PREFIX: "Are you sure you want to close",
    DESCRIPTION_SUFFIX: "? This action cannot be undone.",
    CANCEL: "No, Cancel",
    CONFIRM: "Yes, Close",
    CONFIRM_LOADING: "Closing...",
};

// ─── Messages: NewAcademicYear.jsx ───────────────────────────────────────────
export const NEW_ACADEMIC_YEAR = {
    TITLE: "Add Academic Year",
    SUBTITLE: "Fill in the details to create a new academic year",
    LABEL_FIELD: "Label",
    LABEL_PLACEHOLDER: "e.g. 2027-28",
    START_DATE_FIELD: "Start Date",
    END_DATE_FIELD: "End Date",
    CURRENT_TOGGLE_TITLE: "Set as Current Year",
    CURRENT_TOGGLE_DESC: "This will replace the existing current year",
    CANCEL: "Cancel",
    SUBMIT: "Create Year",
    SUBMIT_LOADING: "Creating...",
    VALIDATION: {
        LABEL_REQUIRED: "Label is required.",
        START_DATE_REQUIRED: "Start date is required.",
        END_DATE_REQUIRED: "End date is required.",
        END_AFTER_START: "End date must be after start date.",
    },
    CREATE_ERROR_FALLBACK: "Failed to create academic year.",
};
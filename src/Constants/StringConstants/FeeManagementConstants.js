export const FEE_MANAGEMENT = {
    BACK: "Back",

    FEE_CONFIG: "Fee Config",
    COLLECTIONS_HISTORY: "Collections & History",
    FEE_MANAGEMENT: "Fee Management",

    ACADEMIC_YEAR_LABEL: "Academic Year",

    ACADEMIC_YEAR_NOT_LOADED: "Academic year not loaded",

    ACADEMIC_YEAR_ERROR:
        "Could not determine the current academic year. Please go back and select a school, or refresh the page.",

    TABS: {
        PERIODS_KEY: "periods",
        STRUCTURES_KEY: "structures",
        PERIODS_LABEL: "Fee Periods",
        STRUCTURES_LABEL: "Fee Structures",
    },

    PAGE_KEYS: {
        OVERVIEW: "overview",
        SYNTHESIS: "synthesis",
        COLLECTIONS: "collections",
    }
};

// ------ Fee Periods----------//

export const FEE_PERIODS = {
    DELETE_FEE_PERIOD: "Delete Fee Period?",
    CANCEL: "Cancel",
    DELETING: "Deleting…",
    YES_DELETE: "Yes, Delete",

    VALIDATION: "Validation",
    PERIOD_NAME_REQUIRED: "Period name is required",
    PERIOD_TYPE_REQUIRED: "Period type is required",
    DUE_DATE_REQUIRED: "Due date is required",
    DELETE_CONFIRM_MESSAGE: "This cannot be undone.",

    PERIOD_UPDATED: "Period Updated",
    PERIOD_UPDATE_SUCCESS: "Fee period has been updated successfully.",

    PERIOD_CREATED: "Period Created",
    PERIOD_CREATE_SUCCESS: "Fee period has been created successfully.",

    SAVE_FAILED: "Save Failed",
    FETCH_FAILED: "Fetch Failed",
    DELETE_FAILED: "Delete Failed",

    EDIT_FEE_PERIOD: "Edit Fee Period",
    NEW_FEE_PERIOD: "New Fee Period",

    SAVING: "Saving…",
    UPDATE_PERIOD: "Update Period",
    SAVE_PERIOD: "Save Period",

    PERIOD_NAME: "Period Name",
    PERIOD_PLACEHOLDER: "e.g. Q1, Q3, October, Term 1, Annual…",

    TYPE: "Type",
    DUE: "Due",

    DUE_DATE: "Due Date",
    ACADEMIC_YEAR: "Academic Year",
    NOTES: "Notes (optional)",

    MONTHLY_LABEL: "Monthly",
    QUARTERLY_LABEL: "Quarterly",
    HALF_YEARLY_LABEL: "Half-Yearly",
    YEARLY_LABEL: "Yearly",
    CUSTOM_LABEL: "Custom",
    CUSTOM_ONE_TIME: "Custom / One-time",

    CLOSED: "Closed",
    OVERDUE: "Overdue",
    ACTIVE: "Active",
    UPCOMING: "Upcoming",

    AY: "AY",

    EMPTY_VALUE: "—",

    PERIOD_NAME_HELPER:
        "A clear name visible to staff when collecting payments.",

    NOTES_PLACEHOLDER:
        "e.g. Second quarter of the academic year…",

    WAITING_YEAR: "⏳ Waiting for academic year…",
    LOADING: "Loading fee periods…",
    REFRESHING: "Refreshing…",

    FEE_PERIODS: "Fee Periods",
    NEW: "New Fee Period",
    NO_PERIODS: "No fee periods yet",
    CREATE_FIRST: "Get started by creating your first fee period.",

    HEADER_SUBTITLE: "Define named installment periods · AY",

    INFO_BANNER:
        "Fee Periods define when fee is due. After creating a period, attach class-wise fee structures from the Fee Structures tab.",

    ADD_NEW_PERIOD: "New Fee Period",
    ADD_NEW_PERIOD_HINT: "Add Q3, October, etc.",

    STRUCTURES: "Structures",
    STUDENTS: "Students",
    COLLECTED: "Collected",
    EDIT: "Edit",

    SHOWING: "Showing",
    PERIOD: "period",
    PERIODS: "periods",

    DELETE_ERROR:
        "Could not delete the fee period. Please try again.",

    UPDATE_FAILED: "Failed to update fee period",
    CREATE_FAILED: "Failed to create fee period",

    PERIOD_REMOVED_MESSAGE: "has been permanently removed.",
};

//--Fee Structure--//

export const FEE_STRUCTURES = {
    // Toast Messages
    VALIDATION: "Validation",
    FETCH_FAILED: "Fetch Failed",
    SAVE_FAILED: "Save Failed",
    DELETE_FAILED: "Delete Failed",
    LOAD_FAILED: "Load Failed",

    STRUCTURE_UPDATED: "Structure Updated",
    STRUCTURE_UPDATED_SUCCESS: "Fee structure has been updated successfully.",

    STRUCTURE_PUBLISHED: "Structure Published",
    STRUCTURE_PUBLISHED_SUCCESS: "Fee structure has been published.",

    DRAFT_SAVED: "Draft Saved",
    DRAFT_SAVED_SUCCESS: "Fee structure saved as draft.",

    STRUCTURE_DELETED: "Structure Deleted",
    STRUCTURE_DELETED_SUCCESS: "has been permanently removed.",

    // Delete Modal
    DELETE_STRUCTURE: "Delete Fee Structure?",
    DELETE_MESSAGE: "will be permanently removed.",
    DELETE_WARNING: "This cannot be undone.",
    CANCEL: "Cancel",
    DELETING: "Deleting…",
    YES_DELETE: "Yes, Delete",

    // Buttons
    ADD_STRUCTURE: "Add Structure",
    CREATE_STRUCTURE: "Create Structure",
    EDIT_STRUCTURE: "Edit Fee Structure",
    UPDATE_STRUCTURE: "Update Structure",
    SAVE_STRUCTURE: "Save Structure",
    SAVE_AS_DRAFT: "Save as Draft",
    SAVING: "Saving…",
    CLOSE: "Close",
    VIEW: "View",
    EDIT: "Edit",
    EDIT_DRAFT: "Edit Draft",

    // Headings
    FEE_STRUCTURES: "Fee Structures",
    FEE_STRUCTURE_DETAILS: "Fee Structure Details",

    // Loading
    WAITING_ACADEMIC_YEAR: "⏳ Waiting for academic year…",
    LOADING_FEE_STRUCTURES: "Loading fee structures…",
    REFRESHING: "Refreshing…",

    // Empty State
    NO_FEE_STRUCTURES: "No fee structures found",
    NO_STRUCTURE_SELECTED_PERIOD: "No structures for the selected period.",
    CREATE_FIRST_STRUCTURE: "Get started by creating your first structure.",

    // Filters
    ALL_PERIODS: "All Periods",

    // Banner
    INFO_BANNER:
        "A structure sets fee components and amounts for selected classes under a period.",
    LOCKED_MESSAGE:
        "Once any payment is recorded it is locked and cannot be edited.",

    // Step Titles
    STEP_SELECT_PERIOD: "Select Period",
    STEP_APPLY_CLASSES: "Apply to Classes",
    STEP_FEE_COMPONENTS: "Fee Components",

    // Labels
    ACADEMIC_YEAR: "Academic Year",
    FEE_PERIOD: "Fee Period",
    SELECT_PERIOD: "-- Select a period --",
    APPLY_TO_CLASSES: "Apply to Classes",
    SELECTED: "Selected",
    STUDENTS: "students",
    TYPE: "Type",
    CUSTOM_NAME: "Custom Name",
    AMOUNT: "Amount",
    TOTAL_FEE: "Total Fee",
    TOTAL: "Total",
    COMPONENTS: "Components",
    PERIOD: "Period",
    CLASSES: "Classes",
    STATUS: "Status",
    ITEMS: "Items",

    // Component Types
    TUITION_FEE: "Tuition Fee",
    TRANSPORT_FEE: "Transport Fee",
    LAB_FEE: "Lab Fee",
    LIBRARY_FEE: "Library Fee",
    ACTIVITY_FEE: "Activity Fee",
    SPORTS_FEE: "Sports Fee",
    EXAM_FEE: "Exam Fee",
    MISC_FEE: "Misc Fee",
    OTHER_FEE: "Other Fee",

    // Placeholders
    REQUIRED: "Required…",
    OPTIONAL: "Optional…",
    SELECT: "-- Select --",

    // Validation
    SELECT_FEE_PERIOD: "Please select a fee period",
    SELECT_CLASS: "Please select at least one class",
    ADD_COMPONENT: "Please add at least one fee component",
    SELECT_COMPONENT_TYPE: "Select component type for",
    ENTER_VALID_AMOUNT: "Enter valid amount for",
    CUSTOM_NAME_REQUIRED: "\"Custom Name\" is required for",

    // Status
    ACTIVE: "Active",
    DRAFT: "Draft",
    LOCKED: "Locked",

    // Misc
    ADD_COMPONENT_BUTTON: "Add Component",
    REQUIRED_FOR_TYPE: "Required for this type",
    FEE_PERIOD_LABEL: "Fee Period",
    SHOWING: "Showing",
    STRUCTURES: "structures",
    STRUCTURE: "structure",
    MORE: "more",


    FAILED_UPDATE_STRUCTURE: "Failed to update fee structure",
    FAILED_CREATE_STRUCTURE: "Failed to create fee structure",

    ZERO_PLACEHOLDER: "0",

    FAILED_LOAD_STRUCTURES: "Could not load fee structures.",
    FAILED_LOAD_PERIODS: "Could not load fee periods.",
    FAILED_LOAD_CLASSES: "Could not load classes.",
    FAILED_LOAD_DETAILS: "Could not load structure details.",

    FEE_STRUCTURE: "Fee structure",
    FAILED_DELETE_STRUCTURE: "Could not delete the fee structure. Please try again.",

    LOCKED_TEXT: "locked",
    AND_CANNOT_BE_EDITED: "and cannot be edited.",

    NEW_FEE_PERIOD: "New Fee Period",

    PERIODS: "periods",
};
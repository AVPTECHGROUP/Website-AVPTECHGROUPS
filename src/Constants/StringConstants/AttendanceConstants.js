import {
    Calendar, CalendarCheck2Icon,
    Camera, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION TABS
// ─────────────────────────────────────────────────────────────────────────────
export const ATTENDANCE_TABS = [
    { id: 'attendanceOverview', label: 'Attendance Overview', icon: Calendar },
    { id: 'pendingApprovals', label: 'Pending Approvals', icon: CalendarCheck2Icon },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS — string values
// ─────────────────────────────────────────────────────────────────────────────
export const STATUS_NOT_MARKED = 'Not Marked';
export const STATUS_PRESENT = 'Present';
export const STATUS_LATE = 'Late';
export const STATUS_ABSENT = 'Absent';
export const STATUS_PRESENT_MANUAL = 'Present (Manual)';
export const STATUS_HALF_DAY = 'Half Day';
export const STATUS_ON_LEAVE = 'On Leave';
export const STATUS_HOLIDAY = 'Holiday';
export const STATUS_PENDING = 'Pending';
export const STATUS_PENDING_REVIEW = 'Pending Review';
export const STATUS_REJECTED = 'Rejected';

// ─────────────────────────────────────────────────────────────────────────────
// STATUS FILTER DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
export const ATTENDANCE_STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PRESENT', label: STATUS_PRESENT },
    { value: 'ABSENT', label: STATUS_ABSENT },
    { value: 'LATE', label: STATUS_LATE },
    { value: 'HALF_DAY', label: STATUS_HALF_DAY },
    { value: 'ON_LEAVE', label: STATUS_ON_LEAVE },
    { value: 'HOLIDAY', label: STATUS_HOLIDAY },
    { value: 'PENDING', label: STATUS_PENDING },
    { value: 'PENDING_MANUAL_REVIEW', label: STATUS_PENDING_REVIEW },
    { value: 'REJECTED', label: STATUS_REJECTED },
];

export const STATUS_BADGE_CLASS_MAP = {
    PRESENT: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    LATE: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    ABSENT: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    PENDING_MANUAL_REVIEW: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    PENDING: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    ON_LEAVE: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    REJECTED: 'bg-gray-100 text-gray-600 ring-1 ring-gray-300',
    HALF_DAY: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    HOLIDAY: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
};
export const STATUS_BADGE_DEFAULT_CLASS = 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';

export const STATUS_LABEL_MAP = {
    PRESENT: STATUS_PRESENT,
    LATE: STATUS_LATE,
    ABSENT: STATUS_ABSENT,
    PENDING_MANUAL_REVIEW: STATUS_PENDING_REVIEW,
    PENDING: STATUS_PENDING,
    ON_LEAVE: STATUS_ON_LEAVE,
    REJECTED: STATUS_REJECTED,
    HALF_DAY: STATUS_HALF_DAY,
    HOLIDAY: STATUS_HOLIDAY,
};

export const STATUS_COLOR_MAP = {
    NOT_MARKED: 'bg-purple-100 text-purple-700',
    PRESENT_MANUAL: 'bg-orange-100 text-orange-700',
    PRESENT: 'bg-green-100 text-green-700',
    LATE: 'bg-yellow-100 text-yellow-700',
    DEFAULT: 'bg-gray-100 text-gray-600',
};

export const FILTER_ALL_STUDENTS = 'All Students';
export const FILTER_OPTIONS = [FILTER_ALL_STUDENTS, STATUS_PRESENT, STATUS_LATE, STATUS_NOT_MARKED];

export const MODAL_STATUS_OPTIONS = [
    { value: STATUS_PRESENT, label: '✅ Present' },
    { value: STATUS_LATE, label: '🕐 Late' },
    { value: STATUS_ABSENT, label: '❌ Absent' },
];

export const SOURCE_MANUAL = 'MANUAL';
export const SOURCE_MANUAL_LABEL = 'Manual';
export const SOURCE_FACE_LABEL = 'Face';
export const SOURCE_EMPTY_PLACEHOLDER = '—';

export const SOURCE_MAP = {
    GROUP_PHOTO: 'Group Photo',
    FACE_SCAN: 'Face Scan',
    MANUAL: SOURCE_MANUAL_LABEL,
};

export const CONFIDENCE_HIGH_THRESHOLD = 80;
export const CONFIDENCE_MEDIUM_THRESHOLD = 60;

export const CONFIDENCE_COLOR_MAP = {
    NONE: 'bg-gray-200',
    HIGH: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-red-500',
};

export const CONFIDENCE_BAR_COLOR_MAP = {
    NONE: 'bg-gray-300',
    HIGH: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-red-500',
};

export const AVATAR_COLORS = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600',
    'bg-orange-500', 'bg-red-500', 'bg-teal-600', 'bg-indigo-600',
];

export const STAFF_AVATAR_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500',
];

export const STUDENT_AVATAR_BG = [
    'bg-blue-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-purple-500', 'bg-teal-500',
];

export const AVATAR_INITIALS_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
];

export const ROLE_COLORS = {
    TEACHER: 'bg-blue-100 text-blue-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    ACCOUNTANT: 'bg-amber-100 text-amber-700',
    PRINCIPAL: 'bg-teal-100 text-teal-700',
    RECEPTIONIST: 'bg-pink-100 text-pink-700',
    SUPER_ADMIN: 'bg-gray-100 text-gray-700',
};

export const FACE_ANGLES = [
    { Icon: Camera, label: 'Front', desc: 'Look straight' },
    { Icon: ArrowLeft, label: 'Left 15°', desc: 'Slightly left' },
    { Icon: ArrowRight, label: 'Right 15°', desc: 'Slightly right' },
    { Icon: ArrowUp, label: 'Tilt Up', desc: 'Chin up' },
    { Icon: ArrowDown, label: 'Tilt Down', desc: 'Chin down' },
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MIN_IMAGES = 5;
export const MAX_IMAGES = 5;
export const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const STUDENT_USER_TYPE = 'STUDENT';
export const INITIAL_SCAN_STATE = {
    status: 'idle',
    data: null,
    confidence: null,
    threshold: null,
    message: null,
};

export const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs';
export const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
export const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
export const BLINK_THRESHOLD = 0.45;
export const BLINK_MIN_FRAMES = 2;
export const BLINK_OPEN_RESET = 0.25;
export const BLINK_PEAK_MIN = 0.65;
export const PAGES_PER_VIEW = 6;
export const REMARKS_MAX = 200;
export const DASH_PLACEHOLDER = '—';

export const CSV_HEADERS = ['#', 'Name', 'User ID', 'Role', 'Date', 'Check-In', 'Source', 'Status'];
export const CSV_DEFAULT_FILENAME = 'attendance.csv';

export const MANUAL_MARK_TITLE = 'Manual Mark Attendance';
export const MANUAL_MARK_INFO = "Use this when a student couldn't be captured in a group photo or face scan (e.g. glasses, bad angle, not yet enrolled).";
export const STUDENT_SELECT_PLACEHOLDER = '— Select student —';
export const STUDENT_LABEL = 'Student';
export const STATUS_FIELD_LABEL = 'Status';
export const TIME_LABEL = 'Time';
export const REMARKS_LABEL = 'Remarks (Optional)';
export const REMARKS_PLACEHOLDER = "e.g. Wearing glasses, couldn't be recognized by face scan...";
export const DEFAULT_MARK_STATUS = STATUS_PRESENT;
export const DEFAULT_MARK_TIME = '08:30';
export const UNMARK_TITLE = 'Unmark Attendance';
export const UNMARK_NOT_MARKED_LABEL = STATUS_NOT_MARKED;
export const REASON_LABEL = 'Reason for Correction';
export const REASON_PLACEHOLDER = 'e.g. Wrong student recognized in group photo...';
export const BTN_CANCEL = 'Cancel';
export const BTN_MARK_ATTENDANCE = 'Mark Attendance';
export const BTN_CONFIRM_UNMARK = 'Confirm Unmark';
export const DEFAULT_USER_LABEL = 'User';

// ─────────────────────────────────────────────────────────────────────────────
// TOAST MESSAGES & ALERTS
// ─────────────────────────────────────────────────────────────────────────────
export const TOAST_NO_DATA_TO_EXPORT = 'No data to export';
export const TOAST_CSV_EXPORT_SUCCESS = 'CSV exported successfully!';
export const TOAST_ENTER_APPROVAL_REMARKS = 'Please enter approval remarks';
export const TOAST_ENTER_REJECTION_REASON = 'Please enter rejection reason';
export const TOAST_APPROVED_SUCCESS_FALLBACK = 'Approved successfully';
export const TOAST_REJECTED_SUCCESS = 'Rejected successfully';
export const TOAST_APPROVAL_FAILED = 'Approval failed';
export const TOAST_REJECTION_FAILED = 'Rejection failed';
export const TOAST_SELECT_STAFF = 'Please select a staff member';
export const TOAST_RESOLVE_USER_ID = 'Could not resolve User ID — see browser console for fix instructions';
export const TOAST_RESOLVE_USER_ROLE = 'Could not resolve User Role — see browser console for fix instructions';
export const TOAST_ENTER_REMARKS = 'Please enter a reason / remarks';
export const TOAST_REMARKS_EXCEED = (max) => `Remarks cannot exceed ${max} characters`;
export const TOAST_SUBMIT_SUCCESS = 'Manual attendance submitted for review!';
export const TOAST_SUBMIT_FAILED = 'Submission failed';
export const TOAST_CAPTURE_FAILED = 'Failed to capture image';
export const TOAST_FACE_NOT_RECOGNIZED = 'Face not recognized';
export const TOAST_GENERIC_ERROR = 'Something went wrong. Please try again.';
export const TOAST_CAMERA_ACCESS_FAILED = 'Failed to access camera. Please check permissions.';
export const TOAST_LOAD_ROLES_FAILED = 'Failed to load roles';
export const TOAST_LOAD_USERS_FAILED = 'Failed to load users';
export const TOAST_IMAGE_UPLOADED = 'Image Uploaded Successfully!';
export const TOAST_MAX_IMAGES = (max) => `Maximum ${max} images allowed`;
export const TOAST_INVALID_TYPE = 'Only JPG, PNG, JPEG images are allowed';
export const TOAST_FILE_TOO_LARGE = (fileName) => `${fileName} exceeds 5MB size limit`;
export const TOAST_IMAGE_REMOVED = 'Image removed';
export const TOAST_COMPLETE_FIELDS = 'Please complete all required fields';
export const TOAST_ENROLLMENT_SUCCESS = 'Face enrollment successful ✅';
export const TOAST_ENROLLMENT_FAILED = 'Enrollment failed';
export const TOAST_UPLOAD_CANCELLED = 'Upload cancelled';

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED UI STRINGS (Replaces all hardcoded texts in modules)
// ─────────────────────────────────────────────────────────────────────────────
export const UI_STRINGS = {
    COMMON: {
        BACK_TO_ROSTER: "Back to Roster",
        CANCEL: "Cancel",
        RETAKE: "Retake",
        UPLOAD_PHOTO: "Upload Photo",
        ERROR: "Error",
        UNKNOWN: "Unknown",
        STATUS: "Status",
        CONFIDENCE: "Confidence Score",
        N_A: "N/A",
        THRESHOLD: "Threshold",
        CHECK_IN: "Check-in Time",
        ATTENDANCE_DATE: "Attendance Date",
        ID_LABEL: "ID:",
        ROLL_LABEL: "Roll",
        PAREN_ROLL: "(Roll",
        MARK: "Mark",
        MARKING: "Marking...",
        UNMARK: "Unmark",
        UNMARKING: "Unmarking...",
        LOADING: "Loading...",
        DATE: "Date",
        SOURCE: "Source",
        ROWS: "Rows:",
        NO_RECORDS_FOUND: "No records found",
        CLOSE: "Close",
        VIEW: "View",
        REASON: "Reason",
        ACTIONS: "Actions",
        ALL_STATUS: "All Status",
    },
    ALERTS: {
        MISSING_CLASS_SECTION: "Cannot submit: missing class or section.\n\nPlease go back and reselect the class and section.",
        NO_ATTENDANCE_ID: "No attendance ID found. Cannot unmark.",
        NO_STUDENT_DATA_EXPORT: "No student data to export. Please select a class and section first.",
        WAIT_FOR_SECTIONS: "Please wait for sections to load",
        WAIT_BEFORE_PROCEEDING: "Please wait for class and section to load before proceeding.",
        EXPORT_FAILED: "Failed to export CSV. Please try again."
    },
    GROUP_PHOTO: {
        HEADER: "Group Photo Attendance",
        UNMARKED: "Unmarked",
        FACE_NUM: "Face #",
        ALREADY_MARKED_TXT: "Already Marked",
        BELOW_THRESHOLD_TXT: "Below Threshold",
        REVIEW_PHOTO: "Review Group Photo",
        TAKE_PHOTO: "Take Group Photo",
        MOBILE_GUIDE: "Portrait · Fit all students",
        DESKTOP_GUIDE: "Wide-angle · Fit all students",
        BACK_CAM: "Back cam",
        FRONT_CAM: "Front cam",
        CAM_UNAVAILABLE: "Camera unavailable. Use \"Upload Photo\" instead.",
        FIT_STUDENTS: "Fit all students in this frame",
        TIP_MOBILE: "Step back · Everyone faces camera · Good lighting",
        TIP_DESKTOP: "Hold phone horizontal · Everyone faces camera · Good lighting",
        BEFORE_CONFIRM: "Before confirming, check:",
        CHECKLIST: [
            "All faces clearly visible",
            "No student cut off at edges",
            "Not blurry or too dark",
            "Everyone facing forward"
        ],
        SENDING: "Sending...",
        LOOKS_GOOD: "Looks Good — Send",
        CAPTURE: "Capture Group Photo",
        FACES_DETECTED: "Faces Detected",
        MARKED_NOW: "Marked Now",
        UNRECOGNIZED: "Unrecognized",
        BEST_DETECTION: "For best group face detection:",
        DETECTION_TIPS: [
            "All faces visible — no one hidden behind others",
            "Hold phone horizontally (landscape)",
            "Well-lit — no strong backlight",
            "Everyone facing the camera"
        ],
        DETECTING_FACES: "Detecting faces...",
        SCANNING_PHOTO: "Scanning the group photo...",
        PROCESSING_AI: "Processing with AI face recognition...",
        OPEN_CAMERA: "Open Camera",
        LANDSCAPE_GUIDE: "Landscape · Group frame guide",
        JPEG_PNG: "JPEG / PNG from device",
        PROCESSED_PHOTO: "Processed photo",
        NO_FACES: "No faces detected",
        COMMON_REASONS: "Most common reasons:",
        REASONS_LIST: [
            "Forehead/top of head cut off",
            "Faces sideways or tilted too much",
            "Students too far from camera",
            "Dark lighting or heavy shadow",
            "Faces partially covered",
            "Students not enrolled in face recognition"
        ],
        TRY_AGAIN_BETTER: "Try Again with Better Photo",
        FACE_UNMATCHED: "face(s) unmatched.",
        NOT_ENROLLED_MARK: "Student may not be enrolled. Mark them manually.",
        NEWLY_MARKED: "Newly Marked — ",
        STUDENTS_TXT: " students",
        ALREADY_MARKED_SKIPPED: "Already Marked (Skipped)",
        UNRECOGNIZED_FACES: "Unrecognized Faces",
        UPLOAD_ANOTHER: "Upload Another Photo",
        CONFIRM_DONE: "Confirm & Done",
        ATTENDANCE_UPDATED: "Attendance Updated",
        NEWLY_MARKED_STAT: "newly marked ·",
        ALREADY_MARKED_STAT: "already marked ·",
        UNRECOGNIZED_STAT: "unrecognized",
        INFO_UNRECOGNIZED: "✔ Unrecognized students appear as ",
        INFO_IN_ROSTER: " in the roster. Use ",
        INFO_OR: " or ",
        INFO_FOR_THEM: " for them.",
        BACK_TO_FULL: "Back to Full Roster",
        TABS: ["1 · Upload Photos", "2 · Review Results", "3 · Confirm & Done"]
    },
    FACE_SCAN: {
        HEADER: "Individual Face Scan",
        STUDENTS_ONLY: "Students Only",
        CAPTURE_OR_UPLOAD: "Capture or Upload Student Photo",
        CAM_UNAVAILABLE: "Camera not available. Use file upload below.",
        VERIFYING: "Verifying face...",
        LOADING_LIVENESS: "Loading liveness check…",
        BLINK_INSTR: "Blink your eyes to capture",
        BLINK_DETECTED: "✓ Blink detected!",
        POSITION_FACE: "Position face in frame",
        CAPTURE_VERIFY: "Capture & Verify",
        SKIP_BLINK: "Skip blink check (manual capture)",
        ANALYZING: "Analyzing face...",
        RETRY: "Retry Scan",
        SCAN_ANOTHER: "Scan Another Student",
        SCAN_RESULT: "Scan Result",
        IDLE_DESC_1: "Capture or upload a photo to verify and mark attendance",
        IDLE_DESC_2: "Only student faces will be accepted",
        SETUP_LIVENESS: "Setting Up Liveness Check",
        LOADING_MODEL: "Loading face detection model…",
        ONCE_PER_SESSION: "This happens only once per session",
        LIVENESS_CHECK: "Liveness Check",
        BLINK_NATURALLY: "Please blink your eyes naturally",
        AUTO_CAPTURE: "Photo will be captured automatically",
        TIPS_BEST_RESULT: "Tips for best result:",
        LIVENESS_TIPS: [
            "Face the camera directly",
            "Blink slowly and naturally",
            "Ensure good lighting on your face"
        ],
        VERIFYING_ID: "Verifying identity and checking student status",
        USER_ID: "User ID: ",
        ATTENDANCE_MARKED: "Attendance Marked",
        STUDENT_TAG: "Student",
        REQ_MANUAL_REVIEW: "Requires Manual Review",
        UNMARK_WRONG_MATCH: "Unmark (Wrong Match?)",
        ALREADY_MARKED_TODAY: "Already Marked Today",
        PREV_RECORDED: "Attendance was previously recorded for this student today.",
        UNMARK_RECORD: "Unmark This Record",
        ACCESS_DENIED: "Access Denied",
        ONLY_STUDENTS: "Only students can be marked here.",
        DETECTED_ROLE: "Detected Role",
        WHAT_HAPPENED: "What happened?",
        DETECTED_A: "The face scan detected a ",
        ACCOUNT_TXT: " account. This module is strictly for ",
        STRICTLY_STUDENT: "student attendance only",
        BLOCKED_ROLES: "Blocked roles:",
        NOTE: "💡 Note:",
        NOTE_DESC: "The server may have already recorded attendance for this non-student. Please check and remove it manually from the roster if needed.",
        LOW_CONFIDENCE: "Low Confidence Detected",
        CONF_TOO_LOW: "Face detected but confidence too low to mark attendance.",
        FACE_CONF: "Face Confidence",
        REQ_THRESHOLD: "Required Threshold",
        NEEDS: "Needs ",
        MORE_CONF_TO_PASS: "% more confidence to pass",
        HOW_TO_IMPROVE: "💡 How to improve:",
        IMPROVE_TIPS: [
            "Ensure face is well-lit (avoid backlighting)",
            "Face the camera directly — avoid side angles",
            "Move closer so the face fills the frame",
            "Remove glasses or hat if possible",
            "Upload a clearer, higher-resolution photo"
        ],
        SCAN_FAILED: "Scan Failed",
        POSSIBLE_REASONS: "Possible reasons:",
        FAILED_REASONS: [
            "Student not enrolled in face recognition",
            "Poor lighting or blurry image",
            "Face not clearly visible or forward-facing",
            "Network or server error"
        ]
    },
    ROSTER: {
        TITLE: "Student Attendance",
        SUBTITLE: "Mark and manage attendance for your class sections",
        FILTER: "Filter:",
        SEARCH_PLACEHOLDER: "Search by name or roll no...",
        NO_CLASSES: "No classes",
        NO_SECTIONS: "No sections",
        HEADERS: ["#", "Student", "Roll No.", "Status", "Check-In", "Source", "Confidence", "Actions"],
        NO_STUDENTS: "No students found for this section.",
        SHOWING: "Showing ",
        OF: " of ",
        STUDENTS_LOWER: " students",
        PREV: "Prev",
        NEXT: "Next",
        BTN_ROSTER: "Roster",
        BTN_SUMMARY: "Summary",
        EXPORT_CSV: "Export CSV",
        EXPORTING: "Exporting...",
        GROUP_BTN: "Group Photo Attendance",
        FACE_BTN: "Individual Face Scan",
        MANUAL_BTN: "Manual Mark"
    },
    SUMMARY: {
        TODAY_RATE: "Today's Rate",
        OF_MARKED: " marked",
        BREAKDOWN: "Status Breakdown — ",
        STUDENTS_PAREN: " students (",
        WEEKLY_TREND: "This Week's Daily Trend",
        NEED_ATTENTION: "Students Needing Attention",
        NOT_MARKED_TODAY: "Not marked today",
        ALL_MARKED: "🎉 All students marked today!",
        TOTAL_STUDENTS: "Total Students",
        ABSENT_UNMARKED: "Absent / Unmarked",
        ENROLLED: "Enrolled in Face",
        NOT_ENROLLED: " not",
        STAT_ABSENT: "Absent/Unmarked"
    },
    EXPORT: {
        REPORT_TITLE: "ATTENDANCE REPORT",
        CLASS: "Class:",
        SECTION: "Section:",
        DATE: "Date:",
        EXPORTED_AT: "Exported At:",
        SUMMARY: "─── SUMMARY ───",
        TOTAL_STUDENTS: "Total Students",
        ATTENDANCE_RATE: "Attendance Rate",
        HEADERS: ["#", "Student Name", "Roll No.", "Student ID", "Status", "Check-In Time", "Source", "Confidence (%)"]
    },
    UNMARK: {
        WARNING_1: "You are about to remove today's attendance for ",
        WARNING_2: ". This action is logged. The student will appear as ",
        WARNING_3: " and can be re-marked manually."
    },
    ATTENDANCE_OVERVIEW: {
        HEADER: "Staff Attendance Overview",
        SUBTITLE: "Here's an overview of today's staff attendance across the school.",
        STAT_TOTAL_STAFF: "Total Staff",
        STAT_TOTAL_REG: "Total registered",
        STAT_PRESENT: "Present",
        STAT_ATT_PCT: "% attendance",
        STAT_LATE: "Late Arrivals",
        STAT_LATE_SUB: "After grace period",
        STAT_ABSENT: "Absent / Unmarked",
        STAT_ABSENT_SUB: "Not checked in",
        STAT_LEAVE: "On Leave",
        STAT_LEAVE_SUB: "Approved leave",
        STAT_PENDING: "Pending Review",
        STAT_PENDING_SUB: "Awaiting approval",
        BTN_INDIVIDUAL_SCAN: "Individual Face Scan",
        BTN_FACE_SCAN: "Face Scan",
        BTN_MANUAL: "Manual Mark",
        BTN_EXPORT: "Export CSV",
        FILTERS: "Filters",
        RESET: "Reset",
        ALL_ROLES: "All Roles",
        SEARCH_PLACEHOLDER: "Search by name or employee code...",
        HEADERS: ["#", "Staff Member", "Role", "Date", "Check-In", "Source", "Status"],
        NO_RECORDS: "No attendance records found",
        SHOWING: "Showing",
        TO: "–",
        OF: "of",
    },
    IMG_REG: {
        HEADER: "Attendance Registration",
        ROLE_LABEL: "User Role",
        SELECT_ROLE: "Select Role",
        NAME_LABEL: "Name",
        SELECT_NAME: "Select Name",
        LOADING: "Loading...",
        USER_ID_LABEL: "User ID",
        AUTO_FILLED: "Auto-filled",
        DESCRIPTION: "Please upload up to {count} high-quality photos of your face to complete the verification process. This ensures accurate attendance tracking.",
        DRAG_DROP: "Click or drag images here to upload",
        SUPPORTS: "Supports JPG, PNG (Max 5MB)",
        SELECT_FILES: "Select Files",
        UPLOADED_IMAGES: "Uploaded Images",
        SLOTS_REMAINING_1: "slot remaining",
        SLOTS_REMAINING_N: "slots remaining",
        VERIFIED: "Verified Quality",
        SLOT: "Slot",
        ADD_IMAGE: "Add Image",
        IMAGE_REQ: "Image Requirements",
        REQ_1: "Face centered and clearly visible",
        REQ_2: "No masks, hats, or sunglasses",
        REQ_3: "Plain background preferred",
        REQ_4: "High lighting, no deep shadows",
        BTN_SAVE: "Save & Register Identity",
    },
    MANUAL_STAFF: {
        HEADER: "Manual Attendance Entry",
        SELECT_STAFF: "— Select staff member —",
        SEARCH_NAME: "Search by name...",
        LOADING_STAFF: "Loading staff...",
        NO_STAFF: "No staff members found",
        STAFF_MEMBER: "Staff Member",
        ATTENDANCE_DATE: "Attendance Date",
        CHECK_IN_TIME: "Check-In Time",
        REASON_REMARKS: "Reason / Remarks",
        REMARKS_EXCEED: "Remarks exceed maximum length",
        CHARACTERS: "characters",
        BTN_SUBMIT: "Submit for Review",
        BTN_SUBMITTING: "Submitting...",
    },
    MARK_USER: {
        SUCCESS_HEADER: "Attendance Marked!",
        SUCCESS_SUB: "Your attendance has been recorded successfully",
        ALREADY_HEADER: "Already Marked!",
        ALREADY_SUB: "Your attendance was already recorded for today",
        HEADER: "Staff Attendance",
        SUBTITLE: "Please position your face within the frame for live capture to verify your identity.",
        CAM_UNINITIALIZED: "Camera not initialized",
        LOOKING: "🔍 Looking for your face…",
        LOOKING_OVERLAY: "Looking for your face…",
        BLINK_TO_CAPTURE: "👁 Face detected — blink to capture",
        BLINK_OVERLAY: "Blink your eyes to capture",
        BLINK_DETECTED_TXT: "✓ Blink detected! Capturing…",
        BLINK_DETECTED_OVERLAY: "✓ Blink detected!",
        STARTING: "Starting…",
        CLICK_TO_START: "Click the button below to start",
        BTN_MARK: "Mark Attendance",
        BTN_SKIP: "Skip liveness check",
        BTN_CAPTURING: "Capturing…",
        GUIDELINES_HEADER: "Guidelines for successful capture",
        GL_LIGHTING: "Good Lighting",
        GL_LIGHTING_SUB: "Ensure the area is well lit and no glare",
        GL_FRAME: "Stay in Frame",
        GL_FRAME_SUB: "Keep your face centered and look forward",
        GL_MASKS: "No Masks",
        GL_MASKS_SUB: "Remove masks or heavy coverings",
        GL_SINGLE: "Single Person",
        GL_SINGLE_SUB: "Ensure only one person is in view",
    },
    STAFF_ENROLL: {
        ENROLLED: "Enrolled",
        PARTIAL: "Partial",
        NOT_ENROLLED: "Not Enrolled",
        BTN_REENROLL: "Re-enroll",
        BTN_COMPLETE: "Complete",
        BTN_ENROLL: "Enroll",
        MODAL_HEADER: "Re-enroll Staff?",
        MODAL_SUB: "This will remove all existing face data",
        MODAL_WARNING: "All existing face embeddings will be permanently deleted. Staff will need to be re-enrolled.",
        BTN_YES_REENROLL: "Yes, Re-enroll",
        REMOVING: "Removing...",
        PHOTO_SLOT: "Photo Slot",
        ADD_FACE: "Add Face Photo",
        CAM_GUIDE: "Position face within the oval guide",
        CHOOSE_HOW: "Choose how to add this photo",
        OPEN_CAM: "Open Live Camera",
        OPEN_CAM_SUB: "Click photo in real-time using webcam",
        UPLOAD_DEV: "Upload from Device",
        UPLOAD_DEV_SUB: "Select an existing photo from your gallery",
        PHOTO_LOOKS_GOOD: "Photo looks good? Confirm to use it.",
        BTN_USE_PHOTO: "Use This Photo",
        STARTING_CAM: "Starting camera...",
        SWITCH_BACK: "Switch to Back Camera",
        SWITCH_FRONT: "Switch to Front Camera",
        BTN_CLICK_PHOTO: "Click Photo",
        BACK_OPTS: "← Back to options",
        OPENING_FILE: "Opening file picker...",
        OPENING_FILE_SUB: "If it didn't open, tap Browse Files below",
        BTN_BROWSE: "Browse Files",
        GOOD: "✓ Good",
        HEADER: "Staff Face Enrollment",
        SUBTITLE: "Register staff faces for automated attendance recognition",
        STAT_REG: "Total Staff Registered",
        STAT_ENROLLED: "Staff Enrolled",
        STAT_NOT_ENROLLED: "Not Enrolled",
        STAT_COMPLETED: "Enrollment Completed",
        SELECT_STAFF: "Select Staff Member",
        STAFF_TXT: "staff",
        SEARCH_PLACEHOLDER: "Search by name or employee code...",
        NO_STAFF_FOUND: "No staff found",
        STATUS_HEADER: "Staff Enrollment Status",
        TBL_HEADERS: ["Staff Member", "Role", "Photos", "Status", "Actions"],
        NO_MEMBERS: "No staff members found",
        PAGE: "Page",
        STEPS: ["Select Staff", "Upload Photos", "Enroll"],
        GROUP: "Group: school-staff",
        UPLOAD_5: "Upload 5 Face Photos",
        REQUIRED: "(REQUIRED)",
        PHOTOS_UPLOADED: "Photos uploaded",
        ALL_READY: "✅ All photos ready to enroll",
        MORE_NEEDED: "more photo(s) needed",
        GUIDELINES_TITLE: "Photo guidelines:",
        G1: "Face clearly visible, well-lit, centered",
        G2: "Different angles: front, left, right, up, down",
        G3: "No sunglasses, masks or heavy shadows",
        G4: "Min 200×200 px · Max 5 MB each",
        BTN_CLEAR: "Clear All",
        ENROLLING: "Enrolling...",
        BTN_ENROLL_STAFF: "Enroll Staff",
    },
    STUDENT_ENROLL: {
        HEADER: "Student Face Enrollment",
        SUBTITLE: "Register student faces for automated attendance recognition",
        STAT_REG: "Total Registered Students",
        STAT_ENROLLED: "Students Enrolled",
        STAT_NOT_ENROLLED: "Not Enrolled",
        STAT_COMPLETED: "Enrollment completed",
        SELECT_CLASS_SEC: "Select Class & Section",
        CLASS_LBL: "Class",
        SEC_LBL: "Section",
        NO_SECTIONS: "No sections",
        PENDING: "Pending",
        STUDENTS_TITLE: "Students",
        TOTAL_TXT: "total",
        SEARCH_TXT: "Search name or roll...",
        SELECT_TO_LOAD: "Select a section to load students",
        NO_STUDENTS: "No students found",
        REQUIRED_ALL_5: "(ALL 5 REQUIRED)",
        REC_ANGLES: "Recommended Photo Angles",
        GUIDELINES_TITLE: "Photo Guidelines",
        G1: "Clear frontal face, uniform background preferred",
        G2: "5 varied angles for better recognition accuracy",
        G3: "No hats, scarves, or heavy shadows on face",
        G4: "Tip: Classroom lighting works best",
        BTN_REMOVE: "Remove",
        BTN_ENROLL_STUDENT: "Enroll Student",
        NO_STUDENT_SEL: "No student selected",
        NO_STUDENT_DESC: "Select a class, section, and student from the left panel to begin face enrollment.",
        SEC_ENROLL_STAT: "Section Enrollment Status",
        BTN_SHOW_LESS: "Show Less",
        BTN_VIEW_ALL: "View All",
    },
    PENDING_APPROVALS: {
        HEADER: "Pending Approvals",
        SUBTITLE: "Manage and track daily attendance pending records for all staff.",
        STAT_PENDING: "Pending Today",
        STAT_PENDING_SUB: "Awaiting action",
        MODAL_APPROVE_TITLE: "Approve Attendance",
        MODAL_REQ_TYPE: "Manual attendance request",
        MODAL_PENDING_TAG: "Pending Review",
        DATE_TXT: "Date:",
        SUBMITTED_TXT: "Submitted:",
        MANUAL_ENTRY: "Manual entry",
        OVERRIDE_STAT: "Override Status",
        OPT_PRESENT: "PRESENT — On-time arrival",
        OPT_LATE: "LATE — After grace period",
        OPT_HALF: "HALF_DAY — Partial attendance",
        APPROVAL_REMARKS: "Approval Remarks",
        APPROVAL_PH: "e.g. Verified with CCTV footage. Identity confirmed.",
        BTN_CONFIRM_APP: "Confirm Approve",
        MODAL_REJECT_TITLE: "Reject Attendance",
        REJECTION_REASON: "Rejection Reason",
        REJECTION_PH: "e.g. No valid justification provided. Please contact the HR department.",
        REJECTION_DESC: "This reason will be recorded in the audit log and communicated to the employee.",
        BTN_CONFIRM_REJ: "Confirm Reject",
        HEADERS: ['Staff Member', 'Department', 'Date', 'Reason', 'Status', 'Actions'],
        BTN_VIEW: "View",
        BTN_APP: "Approve",
        BTN_REJ: "Reject",
        TAG_APPROVED: "✓ Approved",
        TAG_REJECTED: "✗ Rejected",
        NO_PENDING: "No pending approvals",
        ALL_UP_TO_DATE: "All attendance records are up to date",
        SHOWING: "Showing",
        OF: "of",
        RECORDS: "records",
        REJECTING: "Rejecting...",
        CONFIRMING: "Confirming...",
    }
};
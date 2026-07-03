// Constants/CommunicationConstants.js

import {
  Users,
  GraduationCap,
  Globe,
  BookOpen,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════
export const COMMUNICATION_ROUTES = {
  EVENTS: "/communication/events",
  EVENTS_CREATE: "/communication/events/create",
  CIRCULARS: "/communication/circulars",
  CIRCULARS_CREATE: "/communication/circulars/create",
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════════════
export const PAGINATION = {
  EVENTS_PER_PAGE: 10,
  CIRCULARS_PAGE_SIZE: 10,
  NOTIFICATIONS_PAGE_SIZE: 10,
  APPROVAL_QUEUE_ROWS_OPTIONS: [15, 30, 50],
  APPROVAL_QUEUE_DEFAULT_ROWS: 15,
};

// ═══════════════════════════════════════════════════════════════════════════
// TOAST / UI TIMING
// ═══════════════════════════════════════════════════════════════════════════
export const TOAST_DURATION_MS = 3500;
export const APPROVAL_TOAST_DURATION_MS = 4000;
export const SEARCH_DEBOUNCE_MS = 700;
export const SUBMIT_REDIRECT_DELAY_MS = 1200;

// ═══════════════════════════════════════════════════════════════════════════
// FILE UPLOAD CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════
export const ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ATTACHMENT_ACCEPT = ".pdf,.png,.jpg,.jpeg";
export const ATTACHMENT_HINT_TEXT = "PDF, Images — up to 10 MB each";

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════
export const EVENT_TYPES = [
  { value: "SCHOOL_WIDE", label: "School-Wide", icon: Globe },
  { value: "CLASS_SPECIFIC", label: "Class-Specific", icon: BookOpen },
];

export const TYPE_ICONS = {
  SCHOOL_WIDE: "🏫",
  CLASS_SPECIFIC: "📚",
};

export const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "School-Wide", value: "SCHOOL_WIDE" },
  { label: "Class-Specific", value: "CLASS_SPECIFIC" },
];

// ═══════════════════════════════════════════════════════════════════════════
// BROADCAST TARGET GROUPS (shared: CreateEventPage & CreateCircularPage)
// NOTE: `icon` is the component reference — render as <target.icon size={16}/>
// ═══════════════════════════════════════════════════════════════════════════
export const BROADCAST_TARGETS = [
  { value: "ALL_STAFF", label: "All Staff", icon: Users, desc: "Every staff member" },
  { value: "ALL_TEACHERS", label: "All Teachers", icon: GraduationCap, desc: "All teaching staff" },
  { value: "ALL_PARENTS", label: "All Parents", icon: Users, desc: "Parents & guardians" },
];

// ═══════════════════════════════════════════════════════════════════════════
// STATUS OPTIONS (EventsPage filter dropdown)
// ═══════════════════════════════════════════════════════════════════════════
export const EVENT_STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

// ═══════════════════════════════════════════════════════════════════════════
// EVENT STATUS BADGE STYLES (EventsPage StatusBadge)
// ═══════════════════════════════════════════════════════════════════════════
export const EVENT_STATUS_BADGE_STYLE = {
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  DRAFT: "bg-blue-50 text-blue-600 border-blue-200",
  DEFAULT: "bg-slate-50 text-slate-500 border-slate-200",
};

export const EVENT_STATUS_LABEL = {
  PUBLISHED: "Published",
  APPROVED: "Approved",
  PENDING_APPROVAL: "Pending Approval",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  DRAFT: "Draft",
};

// ═══════════════════════════════════════════════════════════════════════════
// CALENDAR STRIP LEGEND (EventsPage CalendarStrip)
// ═══════════════════════════════════════════════════════════════════════════
export const CALENDAR_LEGEND = [
  { color: "bg-green-400", label: "Published" },
  { color: "bg-amber-400", label: "Pending" },
  { color: "bg-red-400", label: "Rejected" },
];

export const CALENDAR_LEGEND_MOBILE = [
  { color: "bg-green-500", label: "Published" },
  { color: "bg-amber-400", label: "Pending" },
  { color: "bg-red-400", label: "Rejected" },
];

export const CALENDAR_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS PAGE — STAT CARD LABELS
// ═══════════════════════════════════════════════════════════════════════════
export const EVENTS_STAT_CARD_LABELS = {
  TOTAL_EVENTS: "Total Events",
  PUBLISHED: "Published",
  PENDING_APPROVAL: "Pending Approval",
  UPCOMING_30_DAYS: "Upcoming (30 Days)",
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS PAGE — HEADER / TABLE / EMPTY / ERROR TEXT
// ═══════════════════════════════════════════════════════════════════════════
export const EVENTS_PAGE_TEXT = {
  TITLE: "School Events",
  SUBTITLE: "Plan and manage school-wide and class-specific events.",
  CREATE_BUTTON: "Create Event",
  SHOW_CALENDAR: "Show Calendar",
  HIDE_CALENDAR: "Hide Calendar",
  SEARCH_PLACEHOLDER: "Search events…",
  REFRESH: "Refresh",
  EMPTY_DEFAULT: "No events found.",
  EMPTY_NO_RESULTS: "No events found. Try adjusting your filters.",
  EMPTY_NO_DATE_RESULTS: (dateStr) => `No events on ${dateStr}.`,
  SHOWING_EVENTS_ON: (dateStr) => `Showing events on ${dateStr}`,
  COLUMN_EVENT: "Event",
  COLUMN_DATE_TIME: "Date & Time",
  COLUMN_STATUS: "Status",
  COLUMN_ACTIONS: "Actions",
  VIEW: "View",
  TODAY: "Today",
  ALL_STATUS: "All Status",
  ALL_TYPES: "All Types",
  PAGE_LABEL: (page, totalPages) => `Page ${page} of ${totalPages}`,
  PREV: "Prev",
  NEXT: "Next",
  CANCEL_CONFIRM: "Are you sure you want to cancel this event?",
  CANCELLED_BY_ADMIN: "Cancelled by Admin",
  CLEAR_FILTER: "Clear Filter",
  NO_EVENTS_FOUND: "No events found",
  RETRY: "Retry",
};
export const EVENT_TABS = ["All Events", "School-Wide", "Class-Specific", "Pending Approval"];

// ═══════════════════════════════════════════════════════════════════════════
// CREATE EVENT PAGE — FORM TEXT / VALIDATION MESSAGES
// ═══════════════════════════════════════════════════════════════════════════
export const CREATE_EVENT_INITIAL_FORM = {
  title: "",
  description: "",
  location: "",
  startDatetime: "",
  endDatetime: "",
  type: "SCHOOL_WIDE",
};

export const CREATE_EVENT_TEXT = {
  HEADER_TITLE: "Create New Event",
  HEADER_SUBTITLE: "Schedule a school event and notify parents, staff, or specific classes.",
  TITLE_LABEL: "Event Title",
  TITLE_PLACEHOLDER: "e.g. Annual Sports Day 2025",
  TYPE_LABEL: "Event Type",
  LOCATION_LABEL: "Location",
  LOCATION_PLACEHOLDER: "e.g. School Ground",
  START_LABEL: "Start Date & Time",
  END_LABEL: "End Date & Time",
  DESCRIPTION_LABEL: "Event Description",
  DESCRIPTION_PLACEHOLDER: "Describe the event, schedule, and what participants can expect…",
  BROADCAST_LABEL: "Broadcast to groups",
  CLASS_SECTION_DIVIDER: "or specific class / section",
  CLASS_SECTION_LABEL: "Add a class or section",
  CLASS_SECTION_LOADING: "Loading classes…",
  CLASS_SECTION_PLACEHOLDER: "— Select a class or section —",
  CANCEL: "Cancel",
  SAVE_DRAFT: "Save as Draft",
  PUBLISHING: "Publishing…",
  PUBLISH: "Publish & Notify",
  SUMMARY_TITLE: "Event Summary",
  SUMMARY_TITLE_ROW: "Title",
  SUMMARY_TYPE_ROW: "Type",
  SUMMARY_LOCATION_ROW: "Location",
  SUMMARY_START_ROW: "Start",
  SUMMARY_END_ROW: "End",
  SUMMARY_DURATION_ROW: "Duration",
  NOTIFYING_LABEL: "Notifying",
  NO_RECIPIENTS: "No recipients selected",
  BASIC_INFO: "Basic Information",
  CONTENT_SECTION: "Content",
  TARGET_RECIPIENTS: "Target Recipients",
  ATTACHMENTS_SECTION: "Attachments",
  CLICK_TO_UPLOAD: "Click to upload or drag & drop",
  FILES_INCLUDED_HINT: (count) => `${count} attachment${count > 1 ? 's' : ''} will be included`,
  UNTITLED_EVENT: "Untitled Event",
  EVENT_DETAILS_SECTION: "Event Details",
  DATE_TIME_SECTION: "Date & Time",
  DESCRIPTION_SECTION: "Description",
};

export const CREATE_EVENT_VALIDATION = {
  TITLE_REQUIRED: "Event title is required",
  START_REQUIRED: "Start date & time is required",
  END_REQUIRED: "End date & time is required",
  TARGETS_REQUIRED: "Select at least one recipient group",
};

export const CREATE_EVENT_TOAST = {
  DRAFT_SAVED: "Saved as draft.",
  PUBLISHED: "Event published successfully.",
};

// ═══════════════════════════════════════════════════════════════════════════
// CIRCULARS PAGE — STATUS / TARGET STYLES
// ═══════════════════════════════════════════════════════════════════════════
export const CIRCULAR_STATUS_STYLE = {
  PUBLISHED: { label: "Published", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", dot: "#16a34a" },
  PENDING_APPROVAL: { label: "Pending Approval", bg: "#fffbeb", color: "#d97706", border: "#fde68a", dot: "#d97706" },
  DRAFT: { label: "Draft", bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb", dot: "#9ca3af" },
  REJECTED: { label: "Rejected", bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
};

export const CIRCULAR_TARGET_STYLE = {
  ALL_PARENTS: { bg: "#eff6ff", color: "#2563eb", border: "#dbeafe" },
  ALL_STAFF: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  ALL_TEACHERS: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  DEFAULT: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

export const CIRCULAR_TARGET_LABEL = {
  ALL_PARENTS: "All Parents",
  ALL_STAFF: "All Staff",
  ALL_TEACHERS: "All Teachers",
};

export const CIRCULAR_TABS = ["All", "School-Wide", "Class-Specific", "Pending"];

export const CIRCULAR_STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Rejected", value: "REJECTED" },
];

export const CIRCULAR_TYPE_FILTER_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "School-Wide", value: "SCHOOL_WIDE" },
  { label: "Class-Specific", value: "CLASS_SPECIFIC" },
];

// ═══════════════════════════════════════════════════════════════════════════
// CIRCULARS PAGE — STAT CARD LABELS
// ═══════════════════════════════════════════════════════════════════════════
export const CIRCULARS_STAT_CARD_LABELS = {
  TOTAL: "Total Circulars",
  PUBLISHED: "Published",
  PENDING_APPROVAL: "Pending Approval",
  DRAFT_REJECTED: "Draft / Rejected",
};

// ═══════════════════════════════════════════════════════════════════════════
// CIRCULARS PAGE — GENERAL TEXT
// ═══════════════════════════════════════════════════════════════════════════
export const CIRCULARS_PAGE_TEXT = {
  TITLE: "Circulars",
  SUBTITLE: "Manage and publish school circulars for staff, parents and students.",
  NEW_BUTTON: "New Circular",
  SEARCH_PLACEHOLDER: "Search circulars…",
  REFRESH: "Refresh",
  EMPTY_TITLE: "No circulars found",
  EMPTY_SUBTITLE: "Try adjusting your filters",
  TABLE_COLUMNS: ["Circular", "Type", "Date", "Author", "Status", "Action"],
  NOTIFIED_SUFFIX: "notified",
  ATTACHMENT_SUFFIX: "attachment",
  ATTACHMENTS_SUFFIX: "attachments",
  PAGE_LABEL: (page, totalPages) => `Page ${page} of ${totalPages}`,
  PREV: "Prev",
  NEXT: "Next",
};

// ═══════════════════════════════════════════════════════════════════════════
// CIRCULARS PAGE — CONFIRM MODAL TEXT
// ═══════════════════════════════════════════════════════════════════════════
export const CIRCULAR_REJECT_MODAL = {
  TITLE: "Reject circular",
  MESSAGE: "Please provide a reason for rejection. This will be shared with the sender.",
  INPUT_LABEL: "Reason for rejection",
  CONFIRM_LABEL: "Reject circular",
  CANCEL_LABEL: "Cancel",
};

export const CIRCULAR_DELETE_MODAL = {
  TITLE: "Delete circular",
  MESSAGE: "Are you sure you want to permanently delete this circular? This action cannot be undone.",
  CONFIRM_LABEL: "Delete circular",
  CANCEL_LABEL: "Cancel",
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE CIRCULAR PAGE — FORM TEXT / VALIDATION MESSAGES
// ═══════════════════════════════════════════════════════════════════════════
export const CREATE_CIRCULAR_INITIAL_FORM = {
  title: "",
  type: "SCHOOL_WIDE",
  content: "",
};

export const CREATE_CIRCULAR_TEXT = {
  HEADER_TITLE: "Create New Circular",
  HEADER_SUBTITLE: "Draft and publish a circular to parents, staff, or specific classes.",
  TITLE_LABEL: "Title",
  TITLE_PLACEHOLDER: "e.g. Annual Sports Day — Parent Invitation",
  TYPE_LABEL: "Circular Type",
  TYPE_HINT_SCHOOL_WIDE: "Teachers need admin approval before publishing",
  TYPE_HINT_CLASS_SPECIFIC: "Published directly — no approval needed",
  CONTENT_LABEL: "Circular Body",
  CONTENT_PLACEHOLDER: "Write the circular content here…",
  BROADCAST_LABEL: "Broadcast to groups",
  CLASS_SECTION_DIVIDER: "or specific class / section",
  CLASS_SECTION_LABEL: "Add a class or section",
  CLASS_SECTION_LOADING: "Loading classes…",
  CLASS_SECTION_PLACEHOLDER: "— Select a class or section —",
  CANCEL: "Cancel",
  SAVE_DRAFT: "Save as Draft",
  SUBMIT_CLASS_SPECIFIC: "Publish Circular",
  SUBMIT_SCHOOL_WIDE: "Submit for Approval",
  HOW_PUBLISHING_WORKS: "How Publishing Works",
  RULE_ADMIN_TITLE: "Admin / Principal",
  RULE_ADMIN_TEXT: "School-Wide circulars publish instantly — no approval needed.",
  RULE_TEACHER_TITLE: "Teacher",
  RULE_TEACHER_TEXT: "School-Wide circulars go to an admin approval queue first.",
  RULE_ANY_ROLE_TITLE: "Any Role — Class-Specific",
  RULE_ANY_ROLE_TEXT: "Class-Specific circulars always publish immediately.",
  NOTIFICATION_PREVIEW_TITLE: "Notification Preview",
  NOTIFICATION_PREVIEW_APP_LABEL: "School App · now",
  NOTIFICATION_TITLE_PLACEHOLDER: "Circular title will appear here",
  NOTIFICATION_CONTENT_PLACEHOLDER: "Content preview will appear here…",
  SENDING_TO_LABEL: "Sending to",
  NO_RECIPIENTS_YET: "No recipients selected yet",
};

export const CREATE_CIRCULAR_VALIDATION = {
  TITLE_REQUIRED: "Title is required",
  CONTENT_REQUIRED: "Content is required",
  TARGETS_REQUIRED: "Select at least one recipient group",
};

export const CREATE_CIRCULAR_TOAST = {
  DRAFT_SAVED: "Saved as draft.",
  SUBMITTED: "Circular submitted successfully.",
};

export const NOTIFICATION_PREVIEW_CONTENT_TRUNCATE_LENGTH = 100;

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL QUEUE PAGE
// ═══════════════════════════════════════════════════════════════════════════
export const APPROVAL_QUEUE_TABS = [
  { key: "all", label: "All Pending" },
  { key: "circulars", label: "Circulars" },
  { key: "events", label: "Events" },
];

export const APPROVAL_QUEUE_TEXT = {
  TITLE: "Approval Queue",
  SUBTITLE: "Review and approve pending circulars and events",
  STAT_TOTAL_PENDING: "Total Pending",
  STAT_CIRCULARS: "Circulars",
  STAT_EVENTS: "Events",
  RETRY: "Retry",
  EMPTY_TITLE: "All caught up",
  EMPTY_SUBTITLE: "No pending items to review",
  LOAD_ERROR: "Could not load pending items. Please try again.",
  ROWS_PER_PAGE_LABEL: "Rows per page",
  PREV: "Prev",
  NEXT: "Next",
  SHOWING_LABEL: (start, end, total) => `Showing ${start}–${end} of ${total}`,
};

export const APPROVAL_QUEUE_TOAST = {
  APPROVED_TITLE: "Approved",
  APPROVED_MESSAGE: "Item approved and notifications sent.",
  APPROVE_FAILED_TITLE: "Approval Failed",
  APPROVE_FAILED_MESSAGE: "Something went wrong. Please try again.",
  REJECTED_TITLE: "Rejected",
  REJECTED_MESSAGE: "Item has been rejected.",
  REJECT_FAILED_TITLE: "Rejection Failed",
  REJECT_FAILED_MESSAGE: "Something went wrong. Please try again.",
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═══════════════════════════════════════════════════════════════════════════
export const NOTIFICATION_KIND_ICON = {
  CIRCULAR: "📜",
  EVENT: "📅",
  DEFAULT: "🔔",
};

export const NOTIFICATIONS_PAGE_TEXT = {
  TITLE: "Notifications",
  SUBTITLE: "In-app notification feed and push delivery tracking.",
  FEED_LABEL: "Notification Feed",
  MARK_ALL_READ: "Mark all read",
  REFRESH: "Refresh",
  UNREAD_SUFFIX: "unread",
  EMPTY_TITLE: "No notifications yet",
  EMPTY_SUBTITLE: "You're all caught up",
  LOAD_MORE: "Load more",
  LOADING_OLDER: "Loading older notifications…",
  RETRY: "Retry",
  LOAD_ERROR_DEFAULT: "Failed to load notifications",
  FALLBACK_TITLE: "Notification",
  FALLBACK_KIND: "notification",
  TIME_JUST_NOW: "just now",
  TIME_MINS: (m) => `${m}m ago`,
  TIME_HRS: (h) => `${h}h ago`,
  TIME_YESTERDAY: "Yesterday",
  TIME_DAYS: (d) => `${d}d ago`,
};

export const NOTIFICATION_SORT_FIELD = "Id";

// ═══════════════════════════════════════════════════════════════════════════
// SHARED GPS DEFAULTS (used across attendance/communication forms)
// ═══════════════════════════════════════════════════════════════════════════
export const DEFAULT_GPS = {
  LATITUDE: "28.6139",
  LONGITUDE: "77.209",
};

export default {
  COMMUNICATION_ROUTES,
  PAGINATION,
  TOAST_DURATION_MS,
  APPROVAL_TOAST_DURATION_MS,
  SEARCH_DEBOUNCE_MS,
  SUBMIT_REDIRECT_DELAY_MS,
  ATTACHMENT_MAX_SIZE_BYTES,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_HINT_TEXT,
  EVENT_TYPES,
  TYPE_ICONS,
  TYPE_OPTIONS,
  BROADCAST_TARGETS,
  EVENT_STATUS_OPTIONS,
  EVENT_STATUS_BADGE_STYLE,
  EVENT_STATUS_LABEL,
  CALENDAR_LEGEND,
  CALENDAR_LEGEND_MOBILE,
  CALENDAR_DAY_LABELS,
  EVENTS_STAT_CARD_LABELS,
  EVENTS_PAGE_TEXT,
  CREATE_EVENT_INITIAL_FORM,
  CREATE_EVENT_TEXT,
  CREATE_EVENT_VALIDATION,
  CREATE_EVENT_TOAST,
  CIRCULAR_STATUS_STYLE,
  CIRCULAR_TARGET_STYLE,
  CIRCULAR_TARGET_LABEL,
  CIRCULAR_TABS,
  CIRCULAR_STATUS_FILTER_OPTIONS,
  CIRCULAR_TYPE_FILTER_OPTIONS,
  CIRCULARS_STAT_CARD_LABELS,
  CIRCULARS_PAGE_TEXT,
  CIRCULAR_REJECT_MODAL,
  CIRCULAR_DELETE_MODAL,
  CREATE_CIRCULAR_INITIAL_FORM,
  CREATE_CIRCULAR_TEXT,
  CREATE_CIRCULAR_VALIDATION,
  CREATE_CIRCULAR_TOAST,
  NOTIFICATION_PREVIEW_CONTENT_TRUNCATE_LENGTH,
  APPROVAL_QUEUE_TABS,
  APPROVAL_QUEUE_TEXT,
  APPROVAL_QUEUE_TOAST,
  NOTIFICATION_KIND_ICON,
  NOTIFICATIONS_PAGE_TEXT,
  NOTIFICATION_SORT_FIELD,
  DEFAULT_GPS,
};

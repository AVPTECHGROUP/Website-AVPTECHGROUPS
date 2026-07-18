const TEACHER_MODULE_STRINGS = {
  // ── Common Actions & Navigation ──
  COMMON: {
    BACK_TO_LIST: 'Back to List',
    DISCARD_CHANGES: 'Discard Changes',
    SAVE_DETAILS: 'Save Details',
    SAVE_CHANGES: 'Save Changes',
    CANCEL: 'Cancel',
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    RETRY: 'Retry',
    CHANGE: 'Change',
    NEXT: 'Next'
  },

  // ── AddNewTeacher.jsx ──
  ADD_TEACHER: {
    PAGE_TITLE: 'Add New Teacher',
    SUBTITLE: 'Enter the details below to onboard a new teacher into the payroll system.',
    TABS: {
      PERSONAL: 'Personal Details',
      SALARY: 'Salary Details'
    },
    LABELS :{
      PERSONAL : 'Personal'

    },
    VALIDATION: {
      FULL_NAME_REQUIRED: 'Full name is required',
      NAME_MIN_LENGTH: 'Name must be at least 2 characters',
      GENDER_REQUIRED: 'Please select a gender',
      MOBILE_REQUIRED: 'Mobile number is required',
      MOBILE_INVALID: 'Mobile number must be exactly 10 digits',
      EMAIL_REQUIRED: 'Email address is required',
      EMAIL_INVALID: 'Please enter a valid email address',
      DOB_REQUIRED: 'Date of birth is required',
      DOB_INVALID: 'Date of birth must be in the past',
      JOINING_REQUIRED: 'Joining date is required',
      JOINING_DATE_INVALID:'joining date cannot be in future',
      LOGIN_EMAIL_REQUIRED: 'Login email is required',
      LOGIN_EMAIL_INVALID: 'Please enter a valid login email',
      ACCOUNT_STATUS_REQUIRED: 'Account status must be enabled to add teacher',
      SALARY_TYPE_REQUIRED: 'Please select a salary type',
      BASE_SALARY_INVALID: 'Base salary is required and must be greater than 0'
    },
    LOADING: 'Adding teacher...',
    ADD_ERROR: 'Failed to add teacher. Please try again.',
    COMPLETE_PERSONAL: 'Please complete personal details first',
    SUBMIT_LOADING: 'Adding...',
    UPLOAD: {
      LABEL: 'Profile Photo',
      HELP: '(optional)',
      CTA: 'Click to upload photo',
      FORMAT_HELP: 'JPEG or PNG, max 10 MB'
    },
    ERRORS: {
      IMG_TYPE: 'Only JPEG or PNG images are allowed!',
      IMG_SIZE: 'Image must be smaller than 10 MB!',
      PERSONAL_INCOMPLETE: 'Personal details are incomplete. Please review.',
      SALARY_INCOMPLETE: 'Please fill all required salary fields!',
      FORM_INCOMPLETE: 'Please fill all required fields correctly'
    },
    SUCCESS: 'Teacher added successfully!'
  },

  // ── ClassAssignment.jsx ──
  ASSIGNMENT: {
    PAGE_TITLE: 'Class & Subject Assignment',
    SUBTITLE: 'Assign multiple classes & sections with per-section subject mapping.',
    TABLE_HEADERS: ['Grade', 'Section', 'Subject', 'Class Teacher', 'Actions'],
    SEARCH_PLACEHOLDER: 'Search mapping...',
    SELECT_SUBJECT_PLACEHOLDER: 'Select Subject…',
    LOADING_SUBJECTS: 'Loading subjects…',
    ASSIGNMENT_PREVIEW: 'Assignment Preview',
    ACTIONS: {
      ASSIGN: 'Assign',
      UPDATE: 'Update Assignment'
    },
    LABEL: {
      CURRENT_MAPPING_TITLE: 'Current Mappings',
      CLASS_TEACHER: 'Class Teacher:',
      READY: 'ready',
      GRADE: 'Grade',
      TOTAL: 'Total',
    },
    MESSAGES: {
      NO_SUBJECTS_AVAILABLE: 'No subjects available',
      NO_ASSIGNMENTS: 'No assignments yet',
      NO_ASSIGNMENTS_HELP: 'Create assignments using the form above',
      SUCCESS_CREATE: 'Assignment created successfully',
      SUCCESS_UPDATE: 'Assignment updated successfully!',
      SUCCESS_DELETE: 'Assignment deleted successfully!',
      ERROR_FETCH: 'Failed to fetch assignments'
    }
  },

  // ── DetailsView.jsx & EditTeachersDetails.jsx ──
  DETAILS: {
    PROFILE: 'Teacher Profile',
    PERSONAL_TAB: 'Personal Details',
    PROFESSIONAL_TAB: 'Professional Details',
    SALARY_TAB: 'Salary & Payroll',
    SYSTEM_TAB: 'System Eligibility',
    ACADEMIC_TAB: 'Academic Assignment',

    FIELDS: {
      EMAIL: 'Email Address',
      PHONE: 'Phone Number',
      ADDRESS: 'Residential Address',
      DOB: 'Date of Birth',
      QUALIFICATION: 'Highest Qualification',
      EXPERIENCE: 'Years of Experience',
      SALARY_TYPE: 'Salary Type',
      JOINED: 'Joined Date',
      BASIC_SALARY: 'Basic Salary',
      TOTAL_ALLOWANCES: 'Total Allowances',
      PAYROLL_STATUS: 'Payroll Status'
    },
    LABELS: {
      LOGIN_ACCESS_TITLE: 'Login Access',
      AUTHORIZED_WEB_TITLE: 'Authorized for web dashboard',
      ATTENDANCE_ACCESS : 'Attendance Access',
      MOBILE_CHECK_IN_TITLE : 'Enabled for mobile check-in',
      ASSIGNED_CLASSES :'Assigned Classes',
    }
  },

  EDIT_TEACHER: {
    PERSONAL_SAVE_LOADING: 'Saving personal details...',
    PERSONAL_SAVE_SUCCESS: 'Personal details saved ✅',
    PERSONAL_SAVE_ERROR: 'Failed to save personal details. Please try again.',
    SALARY_SAVE_LOADING: 'Saving salary structure...',
    SALARY_SAVE_SUCCESS: 'Salary structure saved ✅',
    SALARY_SAVE_ERROR: 'Failed to save salary. Please try again.',
    SALARY_WARNING: 'Please set a salary type and base salary before saving.',
    PHOTO_REFRESH_NOTICE: 'Profile photo may take a few seconds to reflect.',
    LOADING: 'Loading teacher...',
    UPLOAD: {
      LABEL: 'Profile Photo',
      HELP: '(optional)',
      CTA: 'Click to upload photo',
      FORMAT_HELP: 'JPEG or PNG, max 10 MB',
      CURRENT: 'Current profile photo',
      REPLACE: 'Click "Change" to replace',
      CHANGE: 'Change'
    }
  },

  // ── Teachers.jsx (Main List) ──
  TEACHERS_LIST: {
    EXPORT_SUCCESS: '✓ Exported {count} teacher{plural} — CSV {page} of {totalPages}',
    EXPORT_INFO: 'No teachers on this page to export.',
    TABLE_HEADERS: ['Full Name', 'Employee Code', 'Designation/Role', 'Mobile Number', 'Assigned Classes', 'Salary Type', 'Status', 'Attendance Access', 'Payroll Status', 'Joining Date']
  }
};

export default TEACHER_MODULE_STRINGS;
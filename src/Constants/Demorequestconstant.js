// ====== SCHOOLSPINE API CONFIG ======
export const API_BASE_URL =
  "https://spineuat-b4a3hfeefghvgjhq.centralindia-01.azurewebsites.net";

export const ENDPOINT = `${API_BASE_URL}/api/v1/public/demo-request`;
// Note: this endpoint is documented as "public — no auth", so no
// Authorization header is sent.
// ⚠️ If the API call returns a 404, remove the extra "/api" segment:
// export const ENDPOINT = `${API_BASE_URL}/v1/public/demo-request`;
// =====================================

export const STUDENT_STRENGTH_OPTIONS = [
  { value: "BELOW_100", label: "Below 100" },
  { value: "STRENGTH_100_300", label: "100 – 300" },
  { value: "STRENGTH_300_500", label: "300 – 500" },
  { value: "STRENGTH_500_1000", label: "500 – 1,000" },
  { value: "ABOVE_1000", label: "Above 1,000" },
];

export const COUNTRY_CODES = [
  { value: "+91", label: "🇮🇳 +91" },
  { value: "+977", label: "🇳🇵 +977" },
  { value: "+880", label: "🇧🇩 +880" },
  { value: "+94", label: "🇱🇰 +94" },
  { value: "+971", label: "🇦🇪 +971" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
];

// Single source of truth for the default dial code — used by every form
// (Contact.jsx, Demorequest.jsx) instead of retyping the literal "+91".
export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0].value;

// Minimum number of digits (after stripping non-digit characters) a phone
// number must have to be considered valid. Was previously hardcoded as a
// magic number (10) inline in Demorequest.jsx's validate() function.
export const MIN_PHONE_DIGITS = 10;

export const initialForm = {
  fullName: "",
  schoolName: "",
  countryCode: DEFAULT_COUNTRY_CODE,
  phoneNumber: "",
  studentStrength: "",
};
import { ENDPOINT } from "../Constants/Demorequestconstant";

/**
 * Calls the SchoolSpine "Book a Free Demo" API.
 * Public endpoint — no auth. Response shape (per Swagger):
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     id, fullName, schoolName, phoneNumber, studentStrength,
 *     status, assignedTo, demoScheduledAt, followUpDate, notes,
 *     convertedSchoolId, createdAt, updatedAt
 *   },
 *   timestamp: string,
 *   path: string
 * }
 *
 * @param {Object} payload
 * @param {string} payload.fullName
 * @param {string} payload.schoolName
 * @param {string} payload.phoneNumber   // full number with country code, e.g. "+919876543210"
 * @param {string} payload.studentStrength // BELOW_100 | STRENGTH_100_300 | STRENGTH_300_500 | STRENGTH_500_1000 | ABOVE_1000
 *
 * @returns {Promise<{success: boolean, message: string, data: object, timestamp: string, path: string}>}
 * @throws  {Error} if the network request fails, or the API itself reports success:false
 */
export const submitDemoRequest = async (payload) => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const errorMessage =
      json?.message || `Failed to submit demo request (status ${res.status})`;
    throw new Error(errorMessage);
  }

  return json; // { success, message, data, timestamp, path }
};
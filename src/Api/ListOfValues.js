import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE;
const LOV_BASE_URL = `${BASE_URL}/common/lov`;

// Get list of values by LOV type
// export const getListOfValues = async (lovType = "") => {
//   try {
//     const res = await authFetch(`${LOV_BASE_URL}/${lovType}`, {
//       method: "GET",
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(errorText || "Failed to fetch LOV values");
//     }

//     const data = await res.json();

//     return data?.data || [];
//   } catch (error) {
//     console.error("getListOfValues error:", error.message);
//     throw error;
//   }
// };
 
export const getListOfValues = async (lovType = "") => {
  const url = `${LOV_BASE_URL}/${lovType}`;
 
  const res = await authFetch(url, { method: "GET" });
 
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `LOV fetch failed (${res.status})`);
  }
 
  const body = await res.json();
 
  // ── unwrap every possible envelope ──────────────────────────────────────
  if (Array.isArray(body))                          return body;
  if (Array.isArray(body?.data))                    return body.data;
  if (Array.isArray(body?.content))                 return body.content;
  if (Array.isArray(body?.data?.content))           return body.data.content;
  if (Array.isArray(body?.result))                  return body.result;
  if (Array.isArray(body?.items))                   return body.items;
 
  // Nothing matched — log and return empty so the UI degrades gracefully
  console.warn("[getListOfValues] Unrecognised response shape for", lovType, body);
  return [];
};

// Get Subject Category LOV
export const getSubjectCategoryLov = async () => {
  try {
    const res = await authFetch(`${LOV_BASE_URL}/SUBJECT_CATEGORY`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch subject categories");
    }

    const data = await res.json();

    return data?.data || [];
  } catch (error) {
    console.error("getSubjectCategoryLov error:", error.message);
    throw error;
  }
};
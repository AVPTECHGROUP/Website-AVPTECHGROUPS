import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getListOfValues = async (lovType = "") => {
  const res = await authFetch(`${API_ENDPOINTS.LOV}/${lovType}`, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `LOV fetch failed (${res.status})`);
  }

  const body = await res.json();

  // Unwrap every possible response envelope
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.items)) return body.items;

  console.warn("[getListOfValues] Unrecognised response shape for", lovType);
  return [];
};

export const getSubjectCategoryLov = async () => {
  const res = await authFetch(`${API_ENDPOINTS.LOV}/SUBJECT_CATEGORY`, { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch subject categories");
  return (await res.json())?.data || [];
};
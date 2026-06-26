import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getFeeStructures = async (periodId) => {
  const url = periodId
    ? `${API_ENDPOINTS.FEE_STRUCTURES}?periodId=${periodId}`
    : API_ENDPOINTS.FEE_STRUCTURES;

  const res = await authFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee structures");

  return (await res.json()).data || [];
};

export const createFeeStructure = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.FEE_STRUCTURES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create fee structure");
  return data;
};

export const getFeeStructureById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.feeStructureById(id), { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee structure");

  return (await res.json()).data || {};
};

export const updateFeeStructure = async (id, payload) => {
  const res = await authFetch(API_ENDPOINTS.feeStructureById(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update fee structure");
  return data;
};

export const deleteFeeStructure = async (id) => {
  const res = await authFetch(API_ENDPOINTS.feeStructureById(id), { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text() || "Failed to delete fee structure");

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
};
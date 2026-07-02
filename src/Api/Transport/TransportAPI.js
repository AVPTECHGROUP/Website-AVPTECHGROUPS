import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ==================== ROUTES ====================

/** Get paginated list of all routes */
export const getRoutes = async ({ page = 0, size = 20, searchTerm = "", status = "" } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (status) params.append("status", status);

  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_ROUTES}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch routes");
  const data = await res.json();
  return { routes: data.data || [], pagination: data.pagination };
};

/** Get only active routes */
export const getActiveRoutes = async () => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_ROUTES_ACTIVE, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch routes");
  return (await res.json()).data || [];
};

export const addRoute = async (routeData) => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_ROUTES, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(routeData) });
  if (!res.ok) throw new Error("Failed to create route");
  return await res.json();
};

export const updateRoute = async (id, routeData) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteById(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(routeData) });
  if (!res.ok) throw new Error("Failed to update route");
  return await res.json();
};

export const activateRoute = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to activate route");
  return await res.json();
};

export const deactivateRoute = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to deactivate route");
  return await res.json();
};

// ==================== STOPS ====================

export const getRouteStops = async (routeId) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteStops(routeId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch route stops");
  return (await res.json()).data || [];
};

export const addRouteStop = async (routeId, stopData) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteStops(routeId), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stopData) });
  if (!res.ok) throw new Error("Failed to add stop");
  return await res.json();
};

export const updateRouteStop = async (routeId, stopId, stopData) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteStopById(routeId, stopId), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stopData) });
  if (!res.ok) throw new Error("Failed to update stop");
  return await res.json();
};

export const deleteRouteStop = async (routeId, stopId) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteStopById(routeId, stopId), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete stop");
  return await res.json();
};

// ==================== STAFF ====================

/** Get Transport Staff (Driver/Attendant) */
export const getTransportStaff = async ({ page = 0, size = 20, searchTerm = "", role = "", status = "" } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (role) params.append("role", role);
  if (status) params.append("status", status);

  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_STAFF}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch staff");
  const data = await res.json();
  return { staff: data.data || [], pagination: data.pagination };
};

export const addTransportStaff = async (staffData) => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_STAFF, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffData) });
  if (!res.ok) throw new Error("Failed to add staff");
  return await res.json();
};

export const updateTransportStaff = async (id, staffData) => {
  const res = await authFetch(API_ENDPOINTS.transportStaffById(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffData) });
  if (!res.ok) throw new Error("Failed to update staff");
  return await res.json();
};

export const activateTransportStaff = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportStaffActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to activate staff");
  return await res.json();
};

export const deactivateTransportStaff = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportStaffDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to deactivate staff");
  return await res.json();
};

// ==================== VEHICLES ====================

export const getVehicles = async ({ page = 0, size = 20, searchTerm = "", type = "", status = "" } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (type) params.append("type", type);
  if (status) params.append("status", status);

  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_VEHICLES}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  const data = await res.json();
  return { vehicles: data.data || [], pagination: data.pagination };
};

export const getActiveVehicles = async () => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_VEHICLES_ACTIVE, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return (await res.json()).data || [];
};

export const addVehicle = async (vehicleData) => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_VEHICLES, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vehicleData) });
  if (!res.ok) throw new Error("Failed to add vehicle");
  return await res.json();
};

export const updateVehicle = async (id, vehicleData) => {
  const res = await authFetch(API_ENDPOINTS.transportVehicleById(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vehicleData) });
  if (!res.ok) throw new Error("Failed to update vehicle");
  return await res.json();
};

export const activateVehicle = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportVehicleActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to activate vehicle");
  return await res.json();
};

export const deactivateVehicle = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportVehicleDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to deactivate vehicle");
  return await res.json();
};

// ==================== ALLOCATIONS ====================

export const getTransportAllocations = async ({ page = 0, size = 10, routeId, stopId } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (routeId) params.append("routeId", routeId);
  if (stopId) params.append("stopId", stopId);

  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_ALLOCATIONS}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch allocations");
  const data = await res.json();
  return { allocations: data.data || [], pagination: data.pagination };
};

export const getTransportAllocationById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportAllocationById(id), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch allocation");
  return await res.json();
};

export const addTransportAllocation = async (allocationData) => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_ALLOCATIONS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(allocationData) });
  if (!res.ok) throw new Error("Failed to allocate student");
  return await res.json();
};

export const updateTransportAllocation = async (id, allocationData) => {
  const res = await authFetch(API_ENDPOINTS.transportAllocationById(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(allocationData) });
  if (!res.ok) throw new Error("Failed to update allocation");
  return await res.json();
};

export const deleteTransportAllocation = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportAllocationById(id), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete allocation");
  return await res.json();
};

// ==================== FEE PLANS ====================

export const getTransportFeePlans = async () => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_FEE_PLANS, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch transport fee plans");
  return (await res.json()).data || [];
};

export const addTransportFeePlan = async (feePlanData) => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_FEE_PLANS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(feePlanData) });
  if (!res.ok) throw new Error("Failed to create fee plan");
  return await res.json();
};

export const updateTransportFeePlan = async (id, feePlanData) => {
  const res = await authFetch(API_ENDPOINTS.transportFeePlanById(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(feePlanData) });
  if (!res.ok) throw new Error("Failed to update fee plan");
  return await res.json();
};

export const activateTransportFeePlan = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportFeePlanActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to activate fee plan");
  return await res.json();
};

export const deactivateTransportFeePlan = async (id) => {
  const res = await authFetch(API_ENDPOINTS.transportFeePlanDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to deactivate fee plan");
  return await res.json();
};

export const getFeePlansByRoute = async (routeId) => {
  const res = await authFetch(API_ENDPOINTS.transportFeePlansByRoute(routeId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch fee plans for route");
  return (await res.json()).data || [];
};

// ==================== REPORTS ====================

export const getRouteStudentsReport = async (routeId) => {
  const res = await authFetch(API_ENDPOINTS.transportRouteStudentsReportByRoute(routeId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch route students report");
  return (await res.json()).data || {};
};

export const getAllRoutesStudentsReport = async () => {
  const res = await authFetch(API_ENDPOINTS.TRANSPORT_ROUTES_STUDENTS_REPORT, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch routes students report");
  return (await res.json()).data || [];
};

export const getStaffAssignmentReport = async ({ role = "", onlyExpiring = false } = {}) => {
  const params = new URLSearchParams({ onlyExpiring });
  if (role) params.append("role", role);

  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_STAFF_ASSIGNMENT_REPORT}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch staff assignment report");
  return (await res.json()).data || [];
};

export const getVehicleCapacityReport = async ({ onlyOverCapacity = false, expiringSoonDays = 30 } = {}) => {
  const params = new URLSearchParams({ onlyOverCapacity, expiringSoonDays });
  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_VEHICLE_CAPACITY_REPORT}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch vehicle capacity report");
  return (await res.json()).data || [];
};

export const getTransportFeeReport = async ({ routeId } = {}) => {
  const params = new URLSearchParams();
  if (routeId) params.append("routeId", routeId);
  const qs = params.toString();

  const res = await authFetch(`${API_ENDPOINTS.TRANSPORT_FEE_REPORT}${qs ? `?${qs}` : ""}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch transport fee report");
  return (await res.json()).data || {};
};


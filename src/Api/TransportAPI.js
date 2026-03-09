import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

// Get Active Routes
export const getActiveRoutes = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/active`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch routes");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("getActiveRoutes error:", error);
    throw error;
  }
};

// Get Transport Staff (Driver/Attendant)
export const getTransportStaff = async ({
  page = 0,
  size = 20,
  searchTerm = "",
  role = "",
  status = "",
} = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      size,
      ...(searchTerm && { searchTerm }),
      ...(role && { role }),
      ...(status && { status }),
    });
    const res = await authFetch(`${BASE_URL}/transport/staff?${params}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch staff");
    const data = await res.json();
    return {
      staff: data.data || [],
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("getTransportStaff error:", error);
    throw error;
  }
};

// Get Active Vehicles
export const getActiveVehicles = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/vehicles/active`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("getActiveVehicles error:", error);
    throw error;
  }
};

// Get Transport Allocations
export const getTransportAllocations = async ({
  page = 0,
  size = 20,
  routeId,
  stopId,
} = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      size,
      ...(routeId && { routeId }),
      ...(stopId && { stopId }),
    });
    const res = await authFetch(`${BASE_URL}/transport/allocations?${params}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch allocations");
    const data = await res.json();
    return {
      allocations: data.data || [],
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("getTransportAllocations error:", error);
    throw error;
  }
};

// Vehicles Capacity Report
export const getVehicleCapacityReport = async ({
  onlyOverCapacity = false,
  expiringSoonDays = 30,
} = {}) => {
  try {
    const params = new URLSearchParams({
      onlyOverCapacity,
      expiringSoonDays,
    });
    const res = await authFetch(
      `${BASE_URL}/transport/reports/vehicles/capacity?${params}`,
      { method: "GET" }
    );
    if (!res.ok) throw new Error("Failed to fetch capacity report");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("getVehicleCapacityReport error:", error);
    throw error;
  }
};

// Get Vehicles (Paginated + Search + Filter)
export const getVehicles = async ({
  page = 0,
  size = 20,
  searchTerm = "",
  type = "",
  status = "",
} = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      size,
      ...(searchTerm && { searchTerm }),
      ...(type && { type }),
      ...(status && { status }),
    });
    const res = await authFetch(`${BASE_URL}/transport/vehicles?${params}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    const data = await res.json();
    return {
      vehicles: data.data || [],
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("getVehicles error:", error);
    throw error;
  }
};

// Add Vehicle
export const addVehicle = async (vehicleData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/vehicles`, {
      method: "POST",
      body: JSON.stringify(vehicleData),
    });
    if (!res.ok) throw new Error("Failed to add vehicle");
    return await res.json();
  } catch (error) {
    console.error("addVehicle error:", error);
    throw error;
  }
};

// Update Vehicle
export const updateVehicle = async (id, vehicleData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(vehicleData),
    });
    if (!res.ok) throw new Error("Failed to update vehicle");
    return await res.json();
  } catch (error) {
    console.error("updateVehicle error:", error);
    throw error;
  }
};

// Activate Vehicle
export const activateVehicle = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/vehicles/${id}/activate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to activate vehicle");
    return await res.json();
  } catch (error) {
    console.error("activateVehicle error:", error);
    throw error;
  }
};

// Deactivate Vehicle
export const deactivateVehicle = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/vehicles/${id}/deactivate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to deactivate vehicle");
    return await res.json();
  } catch (error) {
    console.error("deactivateVehicle error:", error);
    throw error;
  }
};
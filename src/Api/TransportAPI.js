import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

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

// Add Transport Staff
export const addTransportStaff = async (staffData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/staff`, {
      method: "POST",
      body: JSON.stringify(staffData),
    });
    if (!res.ok) throw new Error("Failed to add staff");
    return await res.json();
  } catch (error) {
    console.error("addTransportStaff error:", error);
    throw error;
  }
};

// Update Staff
export const updateTransportStaff = async (id, staffData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(staffData),
    });
    if (!res.ok) throw new Error("Failed to update staff");
    return await res.json();
  } catch (error) {
    console.error("updateTransportStaff error:", error);
    throw error;
  }
};

// Activate Staff
export const activateTransportStaff = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/staff/${id}/activate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to activate staff");
    return await res.json();
  } catch (error) {
    console.error("activateTransportStaff error:", error);
    throw error;
  }
};

// Deactivate Staff
export const deactivateTransportStaff = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/staff/${id}/deactivate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to deactivate staff");
    return await res.json();
  } catch (error) {
    console.error("deactivateTransportStaff error:", error);
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
  size = 10,
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
    const params = new URLSearchParams({ onlyOverCapacity, expiringSoonDays });
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

// Get Routes (Paginated + Search + Filter)
export const getRoutes = async ({
  page = 0,
  size = 20,
  searchTerm = "",
  status = "",
} = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      size,
      ...(searchTerm && { searchTerm }),
      ...(status && { status }),
    });
    const res = await authFetch(`${BASE_URL}/transport/routes?${params}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch routes");
    const data = await res.json();
    return {
      routes: data.data || [],
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("getRoutes error:", error);
    throw error;
  }
};

// Create Route
export const addRoute = async (routeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes`, {
      method: "POST",
      body: JSON.stringify(routeData),
    });
    if (!res.ok) throw new Error("Failed to create route");
    return await res.json();
  } catch (error) {
    console.error("addRoute error:", error);
    throw error;
  }
};

// Update Route
export const updateRoute = async (id, routeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(routeData),
    });
    if (!res.ok) throw new Error("Failed to update route");
    return await res.json();
  } catch (error) {
    console.error("updateRoute error:", error);
    throw error;
  }
};

// Activate Route
export const activateRoute = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${id}/activate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to activate route");
    return await res.json();
  } catch (error) {
    console.error("activateRoute error:", error);
    throw error;
  }
};

// Deactivate Route
export const deactivateRoute = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${id}/deactivate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to deactivate route");
    return await res.json();
  } catch (error) {
    console.error("deactivateRoute error:", error);
    throw error;
  }
};

// Get Route Stops
export const getRouteStops = async (routeId) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${routeId}/stops`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch route stops");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("getRouteStops error:", error);
    throw error;
  }
};

// Add Route Stop
export const addRouteStop = async (routeId, stopData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${routeId}/stops`, {
      method: "POST",
      body: JSON.stringify(stopData),
    });
    if (!res.ok) throw new Error("Failed to add stop");
    return await res.json();
  } catch (error) {
    console.error("addRouteStop error:", error);
    throw error;
  }
};

// Update Route Stop
export const updateRouteStop = async (routeId, stopId, stopData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${routeId}/stops/${stopId}`, {
      method: "PUT",
      body: JSON.stringify(stopData),
    });
    if (!res.ok) throw new Error("Failed to update stop");
    return await res.json();
  } catch (error) {
    console.error("updateRouteStop error:", error);
    throw error;
  }
};

// Soft Delete Stop
export const deleteRouteStop = async (routeId, stopId) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/routes/${routeId}/stops/${stopId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete stop");
    return await res.json();
  } catch (error) {
    console.error("deleteRouteStop error:", error);
    throw error;
  }
};

// Get Allocation By ID
export const getTransportAllocationById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/allocations/${id}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch allocation");

    return await res.json();
  } catch (error) {
    console.error("getTransportAllocationById error:", error);
    throw error;
  }
};


// Allocate Student to Route
export const addTransportAllocation = async (allocationData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/allocations`, {
      method: "POST",
      body: JSON.stringify(allocationData),
    });

    if (!res.ok) throw new Error("Failed to allocate student");

    return await res.json();
  } catch (error) {
    console.error("addTransportAllocation error:", error);
    throw error;
  }
};


// Update Allocation
export const updateTransportAllocation = async (id, allocationData) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/allocations/${id}`, {
      method: "PUT",
      body: JSON.stringify(allocationData),
    });

    if (!res.ok) throw new Error("Failed to update allocation");

    return await res.json();
  } catch (error) {
    console.error("updateTransportAllocation error:", error);
    throw error;
  }
};


// Deallocate Student (Soft Delete)
export const deleteTransportAllocation = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/allocations/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete allocation");

    return await res.json();
  } catch (error) {
    console.error("deleteTransportAllocation error:", error);
    throw error;
  }
};


// Get All Active Transport Fee Plans
export const getTransportFeePlans = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/transport/fee-plans`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch transport fee plans");

    const data = await res.json();

    return data.data || [];
  } catch (error) {
    console.error("getTransportFeePlans error:", error);
    throw error;
  }
};
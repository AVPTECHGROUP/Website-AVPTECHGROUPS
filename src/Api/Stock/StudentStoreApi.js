import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/**
 * Creates or updates the default item configuration for a specific class.
 * @param {Object} configData - The configuration payload
 * @returns {Promise<Object>} The saved configuration response
 */
export const addOrUpdateClassItemConfig = async (configData) => {
  try {
    const res = await authFetch(API_ENDPOINTS.CLASS_ITEM_CONFIGS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configData),
    });
    if (!res.ok) throw new Error("Failed to save class item config");
    return await res.json();
  } catch (error) {
    console.error("addOrUpdateClassItemConfig error:", error.message);
    throw error;
  }
};

/**
 * Retrieves all configured inventory items associated with a given class.
 * @param {string|number} classId - The unique class identifier
 * @returns {Promise<Array>} Array of class item configurations
 */
export const getClassItemConfigs = async (classId) => {
  try {
    const res = await authFetch(API_ENDPOINTS.classItemConfigById(classId), { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch class item configs");
    return (await res.json()) || [];
  } catch (error) {
    console.error("getClassItemConfigs error:", error.message);
    throw error;
  }
};

/**
 * Updates the quantity or remarks for an existing class item configuration.
 * @param {string|number} configId - The unique configuration identifier
 * @param {Object} configData - The updated configuration payload
 * @returns {Promise<Object>} The updated configuration response
 */
export const updateClassItemConfig = async (configId, configData) => {
  try {
    const res = await authFetch(API_ENDPOINTS.classItemConfigById(configId), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configData),
    });
    if (!res.ok) throw new Error("Failed to update class item config");
    return await res.json();
  } catch (error) {
    console.error("updateClassItemConfig error:", error.message);
    throw error;
  }
};

/**
 * Deletes a class item configuration by ID.
 * @param {string|number} configId - The unique configuration identifier
 * @returns {Promise<Object>} Deletion success response
 */
export const deleteClassItemConfig = async (configId) => {
  try {
    const res = await authFetch(API_ENDPOINTS.classItemConfigById(configId), { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete class item config");
    return await res.json();
  } catch (error) {
    console.error("deleteClassItemConfig error:", error.message);
    throw error;
  }
};

/**
 * Retrieves overall statistics regarding class item configurations.
 * @returns {Promise<Object>} Statistical data object
 */
export const getClassItemConfigStats = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.CLASS_ITEM_CONFIGS_STATS, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch config stats");
    return await res.json();
  } catch (error) {
    console.error("getClassItemConfigStats error:", error.message);
    throw error;
  }
};
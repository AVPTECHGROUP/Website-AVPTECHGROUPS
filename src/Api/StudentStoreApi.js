import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/api/v1";

// (Add or update default item for a class)
export const addOrUpdateClassItemConfig = async (configData) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/class-item-configs`, {
      method: "POST",
      body: JSON.stringify(configData),
    });
    if (!res.ok) throw new Error(`Failed to save class item config: ${JSON.stringify(configData)}`);
    return await res.json();
  } catch (error) {
    console.error(`addOrUpdateClassItemConfig error: ${error.message}`);
    throw error;
  }
};

/* GET ALL CONFIGURED ITEMS FOR A CLASS */
export const getClassItemConfigs = async (classId) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/class-item-configs/${classId}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error(`Failed to fetch class item configs for classId: ${classId}`);
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error(`getClassItemConfigs error for classId ${classId}: ${error.message}`);
    throw error;
  }
};

/* UPDATE CLASS ITEM CONFIG
   (Update quantity or remarks)
*/
export const updateClassItemConfig = async (configId, configData) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/class-item-configs/${configId}`, {
      method: "PUT",
      body: JSON.stringify(configData),
    });
    if (!res.ok) throw new Error(`Failed to update class item config for configId: ${configId}`);
    return await res.json();
  } catch (error) {
    console.error(`updateClassItemConfig error for configId ${configId}: ${error.message}`);
    throw error;
  }
};

/* DELETE CLASS ITEM CONFIG */
export const deleteClassItemConfig = async (configId) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/class-item-configs/${configId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed to delete class item config for configId: ${configId}`);
    return await res.json();
  } catch (error) {
    console.error(`deleteClassItemConfig error for configId ${configId}: ${error.message}`);
    throw error;
  }
};

// CLASS ITEM CONFIG STATS
export const getClassItemConfigStats = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/class-item-configs/stats`, {
      method: "GET",
    });
    if (!res.ok) throw new Error(`Failed to fetch config stats from: ${BASE_URL}/stock/class-item-configs/stats`);
    return await res.json();
  } catch (error) {
    console.error(`getClassItemConfigStats error: ${error.message}`);
    throw error;
  }
};
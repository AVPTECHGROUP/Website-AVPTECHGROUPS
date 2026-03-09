const BASE_URL = 'https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/common/lov';
//List of values
export const getListOfValues = async (LOV_TYPE = '') => {
     try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/${LOV_TYPE}`,{
             method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`}

        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to List of values");
        }
        const data = await res.json();
        return data.data;
    } catch (e) {
        console.error("get list of values error:", error.message);
        throw error;
    }
}
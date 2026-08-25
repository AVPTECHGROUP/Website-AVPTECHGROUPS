export const getSchoolLocation = async () => {
  // 1. Device se live GPS coordinates lene ki koshish karein
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0,
        });
      });
      return {
        gpsLatitude: position.coords.latitude.toFixed(6).toString(),
        gpsLongitude: position.coords.longitude.toFixed(6).toString(),
      };
    } catch (err) {
      console.warn("Live GPS unavailable/denied, checking stored school config.", err);
    }
  }

  try {
    const config = JSON.parse(localStorage.getItem("attendanceConfig") || "{}");
    if (config.schoolLatitude && config.schoolLongitude) {
      return {
        gpsLatitude: config.schoolLatitude.toString(),
        gpsLongitude: config.schoolLongitude.toString(),
      };
    }
  } catch (e) {
    console.error("Failed to read attendanceConfig from localStorage:", e);
  }

  return { gpsLatitude: "", gpsLongitude: "" };
};
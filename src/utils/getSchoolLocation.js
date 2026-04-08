export const getSchoolLocation = () => {
  try {
    const config = JSON.parse(localStorage.getItem("attendanceConfig") || "{}");
    return {
      gpsLatitude: config.schoolLatitude?.toString() || "28.6139",
      gpsLongitude: config.schoolLongitude?.toString() || "77.209",
    };
  } catch {
    return { gpsLatitude: "28.6139", gpsLongitude: "77.209" };
  }
};
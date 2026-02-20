import { jwtDecode } from "jwt-decode";

export const getCurrUserDetails = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.log("Token expired in if else");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
      return null;
    }
    console.log('data from decoding',decoded);
    return decoded;
  } catch (error) {
    localStorage.removeItem("token");
      console.log("Token expired in catch ");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    return null;
  }
};

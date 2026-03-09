function jwtDecode(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export const getCurrUserDetails = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (!decoded || decoded.exp < currentTime) {
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

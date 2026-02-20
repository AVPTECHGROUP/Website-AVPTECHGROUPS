import { createContext, useContext, useEffect, useState } from "react";
import { GetCurrUserDetails } from "../utils/getCurrUserDetails";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const decodedToken = GetCurrUserDetails();
      if (decodedToken) {
        setUser({
          id: decodedToken.userId,
          userType: decodedToken.roles?.[0],
          email: decodedToken.sub,
          permissions: decodedToken.permissions,
        });
      }
    } catch (error) {
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => {
  return useContext(UserContext);
};
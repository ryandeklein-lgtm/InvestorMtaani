import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = authService.getToken();
      const storedUser = authService.getUser();

      return token && storedUser ? storedUser : null;
    } catch {
      authService.logout();
      return null;
    }
  });
  const loading = false;

  // If the token is removed in another tab (logout or expiry), log out here too
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "token" && !event.newValue) {
        setUser(null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside <AuthProvider>.");
  }

  return context;
};

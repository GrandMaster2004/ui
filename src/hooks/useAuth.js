import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  apiCall,
  getToken,
  setToken,
  setUser as saveUser,
  removeToken,
  removeUser as clearUser,
  getUser,
} from "../utils/api.js";
import { sessionStorageManager } from "../utils/cache.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from sessionStorage on mount
  // This runs only once when the app loads
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getToken();
        const cachedUser = getUser();

        // Only restore auth if both token and user exist in sessionStorage
        if (token && cachedUser) {
          setUser(cachedUser);
        } else {
          // Clear both if either is missing (corrupted state)
          removeToken();
          clearUser();
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        // Clear auth on initialization error
        removeToken();
        clearUser();
      } finally {
        // Always finish initializing, even if restoration failed
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // Store token and user in sessionStorage (session-based auth)
      setToken(data.token);
      saveUser(data.user);
      // Update local state to trigger re-renders
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Store token and user in sessionStorage (session-based auth)
      setToken(data.token);
      saveUser(data.user);
      // Update local state to trigger re-renders
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    // Clear auth from sessionStorage
    removeToken();
    clearUser();
    // Clear other cached data
    sessionStorageManager.clear();
    // Clear local auth state
    setUser(null);
  };

  const isAuthenticated = !!user && !!getToken();
  const isAdmin = user?.role === "admin";

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      error,
      register,
      login,
      logout,
      isAuthenticated,
      isAdmin,
    }),
    [user, isInitializing, error],
  );

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid (401), clear auth data
      if (response.status === 401) {
        removeToken();
        removeUser();
      }
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Get token from sessionStorage (session-based auth)
export const getToken = () => sessionStorage.getItem("auth_token");

// Set token in sessionStorage
export const setToken = (token) => {
  if (token) {
    sessionStorage.setItem("auth_token", token);
  }
};

// Remove token from sessionStorage
export const removeToken = () => sessionStorage.removeItem("auth_token");

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const setUserRole = (role) => {
  // Role is now derived from user object, no separate storage needed
};

export const getUser = () => {
  const user = sessionStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  if (user) {
    sessionStorage.setItem("auth_user", JSON.stringify(user));
  }
};

export const removeUser = () => {
  sessionStorage.removeItem("auth_user");
};

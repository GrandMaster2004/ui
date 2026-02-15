import { createContext, useContext, useState, useCallback } from "react";

const PasswordVisibilityContext = createContext(null);

export const PasswordVisibilityProvider = ({ children }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const value = {
    isPasswordVisible,
    togglePasswordVisibility,
  };

  return (
    <PasswordVisibilityContext.Provider value={value}>
      {children}
    </PasswordVisibilityContext.Provider>
  );
};

export const usePasswordVisibility = () => {
  const context = useContext(PasswordVisibilityContext);

  if (!context) {
    throw new Error(
      "usePasswordVisibility must be used within PasswordVisibilityProvider",
    );
  }

  return context;
};

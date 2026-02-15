import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  // Return nothing while auth is initializing - prevents rendering until auth state is ready
  if (isInitializing) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

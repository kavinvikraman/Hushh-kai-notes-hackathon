/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */

import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/services/authApi";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Redirect to login page, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Usage:
 *   <ProtectedRoute>...</ProtectedRoute>                      any logged-in user
 *   <ProtectedRoute adminOnly>...</ProtectedRoute>            admins only
 *   <ProtectedRoute roles={["business"]}>...</ProtectedRoute> business accounts only
 *   <ProtectedRoute roles={["business", "investor"]}>...      either of these
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
  roles = null,
}) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // Wait until authentication state has been restored
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in: go to login and remember where they were heading
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Admin-only route
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  // Role-restricted route (admins can always get in)
  if (roles && user.role !== "admin" && !roles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
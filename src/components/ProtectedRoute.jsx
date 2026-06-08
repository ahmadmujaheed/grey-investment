import { Navigate, Outlet, useLocation } from "react-router-dom";
// 🔌 Import your central auth store
import { useAuthStore } from "../store/useAuthStore";

/**
 * 🔒 Security Wrapper for Role-Based Routing
 * @param {Object} props
 * @param {string} props.allowedRole - The role required to access this layout (e.g., "admin", "user")
 */
const ProtectedRoute = ({ allowedRole }) => {
  // ✅ Direct dynamic subscription to your global state
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 1. If not logged in, boot to landing/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🚨 New: Intercept mandatory password update onboarding
  // If they have a temporary password, block access and force them to user-settings
  if (user.isInitialPassword && location.pathname !== "/user-dashboard/user-settings") {
    return <Navigate to="/user-dashboard/user-settings" replace />;
  }

  // 2. Role Check Authorization Intercept
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. If they pass all checks, render the nested child routes
  return <Outlet />;
};

export default ProtectedRoute;
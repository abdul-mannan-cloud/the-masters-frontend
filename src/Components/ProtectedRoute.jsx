import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// `roles`, when supplied, restricts this route subtree to those account roles
// (e.g. Tenant Management is super_admin-only). The backend remains the real
// enforcement boundary regardless — this only avoids a broken/empty page.
const ProtectedRoute = ({ roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultPath } from "../utils/routing";

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface">
    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
);

// `roles`, when supplied, restricts this route subtree to those account roles
// (e.g. Tenant Management is super_admin-only). `module`/`action`, when
// supplied, additionally requires that permission on the logged-in user's
// Role — hides the *page*, not just its nav link/buttons, from an
// employee/manager who lacks it. The backend remains the real enforcement
// boundary regardless — this only avoids a broken/empty page.
const ProtectedRoute = ({ roles, module, action = "view" }) => {
  const { user, permissions, permissionsLoading, tenant, tenantLoading } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const fallback = getDefaultPath(user, tenant);
    if (fallback === null) return <Spinner />; // tenant not resolved yet — avoid guessing wrong
    return <Navigate to={fallback} replace />;
  }

  if (module && user.role !== "super_admin" && user.role !== "tenant_admin") {
    if (permissionsLoading || tenantLoading) return <Spinner />;
    if (!permissions?.[module]?.[action]) {
      const fallback = getDefaultPath(user, tenant) ?? "/login";
      return <Navigate to={fallback} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

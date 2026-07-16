import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

const FullPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface">
    <Spinner size="xl" />
  </div>
);

// Guards every "/:tenantSlug/*" route. The backend already scopes every
// request by the JWT's tenantId regardless of what's in the URL — this only
// keeps the address bar honest: if the slug in the URL doesn't match the
// logged-in user's own tenant (stale bookmark, hand-edited URL, tenant
// renamed its slug), silently correct it rather than showing someone else's
// tenant slug while actually rendering their own data.
const TenantSlugGuard = () => {
  const { tenantSlug } = useParams();
  const { tenant, tenantLoading } = useAuth();
  const location = useLocation();

  if (tenantLoading) return <FullPageLoader />;
  if (!tenant) return <Navigate to="/login" replace />;

  if (tenant.slug !== tenantSlug) {
    const rest = location.pathname.replace(`/${tenantSlug}`, "");
    return <Navigate to={`/${tenant.slug}${rest}${location.search}`} replace />;
  }

  return <Outlet />;
};

export default TenantSlugGuard;

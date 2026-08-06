import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useExpectedTenantSlug } from "../hooks/useExpectedTenantSlug";
import { isTenantHostMode } from "../utils/tenantHost";
import Spinner from "./Spinner";

const FullPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface">
    <Spinner size="xl" />
  </div>
);

// Guards every tenant-scoped route, whichever way it got there — the host
// itself (alitailors.localhost, or a business's own custom domain like
// pakistan-tailors.com, both routed at bare paths) or the original
// "/:tenantSlug/*" path prefix, via useExpectedTenantSlug. The backend
// already scopes every request by the JWT's tenantId regardless of what's in
// the URL/host — this only keeps the address bar honest.
const TenantSlugGuard = () => {
  const expectedSlug = useExpectedTenantSlug();
  const { tenant, tenantLoading, logout } = useAuth();
  const location = useLocation();

  if (tenantLoading) return <FullPageLoader />;
  if (!tenant) return <Navigate to="/login" replace />;

  if (tenant.slug !== expectedSlug) {
    // A host mismatch can't be fixed by rewriting the path — the wrong
    // tenant is baked into the host itself, and client-side routing can
    // never change host. Logging out and sending them to this host's own
    // login page is the honest outcome (this is "unauthorized tenant
    // access": a session for a different business than this address),
    // rather than silently redirecting them across hosts.
    if (isTenantHostMode()) {
      logout();
      return <Navigate to="/login?reason=wrong-business" replace />;
    }

    // Path-based mismatch (stale bookmark, hand-edited URL, tenant renamed
    // its slug) — same host, so rewriting the slug segment in place is safe.
    const rest = location.pathname.replace(`/${expectedSlug}`, "");
    return <Navigate to={`/${tenant.slug}${rest}${location.search}`} replace />;
  }

  return <Outlet />;
};

export default TenantSlugGuard;

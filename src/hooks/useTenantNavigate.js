import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import { isTenantHostMode } from "../utils/tenantHost";

// Routes that never live under a "/:tenantSlug" prefix — super_admin has no
// tenant of its own, and login/signup happen before a tenant is known.
const TENANT_AGNOSTIC_PREFIXES = ["/login", "/signup", "/tenants"];
const isTenantAgnostic = (path) =>
  TENANT_AGNOSTIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

// Drop-in replacement for react-router's useNavigate() that transparently
// prepends the current tenant's slug to every internal path — so every
// existing `navigate("/customers")` / `navigate(\`/orders/${id}\`)` call site
// stays untouched, and only needs its useNavigate import swapped for this one.
// In host mode (alitailors.localhost, or a business's own custom domain
// like pakistan-tailors.com) the tenant is already encoded in the host, and
// tenant-scoped routes are mounted at bare paths (see App.jsx) — prepending
// a slug there would produce a path that doesn't match any route, so this
// becomes a pure passthrough in that mode.
export const useTenantNavigate = () => {
  const navigate = useNavigate();
  const { tenantSlug: paramSlug } = useParams();
  const { user, tenant } = useAuth();
  const slug = paramSlug || tenant?.slug;

  return (to, options) => {
    // navigate(-1) / navigate(1) — history navigation, pass through as-is.
    if (typeof to !== "string") return navigate(to, options);
    if (!to.startsWith("/")) return navigate(to, options);
    if (user?.role === "super_admin" || isTenantAgnostic(to) || !slug || isTenantHostMode()) {
      return navigate(to, options);
    }
    return navigate(`/${slug}${to}`, options);
  };
};

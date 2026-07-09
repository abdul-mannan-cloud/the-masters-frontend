import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./useAuth";

// Routes that never live under a "/:tenantSlug" prefix — super_admin has no
// tenant of its own, and login/signup happen before a tenant is known.
const TENANT_AGNOSTIC_PREFIXES = ["/login", "/signup", "/tenants"];
const isTenantAgnostic = (path) =>
  TENANT_AGNOSTIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

// Drop-in replacement for react-router's useNavigate() that transparently
// prepends the current tenant's slug to every internal path — so every
// existing `navigate("/customers")` / `navigate(\`/orders/${id}\`)` call site
// stays untouched, and only needs its useNavigate import swapped for this one.
export const useTenantNavigate = () => {
  const navigate = useNavigate();
  const { tenantSlug: paramSlug } = useParams();
  const { user, tenant } = useAuth();
  const slug = paramSlug || tenant?.slug;

  return (to, options) => {
    // navigate(-1) / navigate(1) — history navigation, pass through as-is.
    if (typeof to !== "string") return navigate(to, options);
    if (!to.startsWith("/")) return navigate(to, options);
    if (user?.role === "super_admin" || isTenantAgnostic(to) || !slug) {
      return navigate(to, options);
    }
    return navigate(`/${slug}${to}`, options);
  };
};

import { isTenantHostMode } from "./tenantHost";

// Where to send a user who hit a route they can't use (wrong role, no
// tenant yet resolved, etc). Centralized so ProtectedRoute and the catch-all
// route agree — a mismatch here is how redirect loops happen.
export const getDefaultPath = (user, tenant) => {
  if (!user) return "/login";
  if (user.role === "super_admin") return "/dashboard";
  if (!tenant) return null; // tenant not resolved yet, caller should wait
  // Host mode (a platform subdomain or the business's own custom domain)
  // mounts tenant-scoped routes at bare paths with the dashboard as the
  // index route (see App.jsx) — prepending the slug here would produce a
  // path that matches nothing.
  return isTenantHostMode() ? "/" : `/${tenant.slug}/dashboard`;
};

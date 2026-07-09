// Where to send a user who hit a route they can't use (wrong role, no
// tenant yet resolved, etc). Centralized so ProtectedRoute and the catch-all
// route agree — a mismatch here is how redirect loops happen.
export const getDefaultPath = (user, tenant) => {
  if (!user) return "/login";
  if (user.role === "super_admin") return "/dashboard";
  return tenant ? `/${tenant.slug}/dashboard` : null; // null = tenant not resolved yet, caller should wait
};

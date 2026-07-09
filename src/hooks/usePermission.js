import { useAuth } from "./useAuth";

// Mirrors the backend's authorize(module, action) bypass rule exactly:
// super_admin/tenant_admin always have full implicit access to their own
// tenant's data; only employee/manager accounts are checked against their
// assigned Role's permission grid. Use this to hide/show any create/edit/
// delete action or module in the UI — the backend remains the real
// enforcement boundary regardless.
export const usePermission = (module, action = "view") => {
  const { user, permissions } = useAuth();
  if (!user) return false;
  if (user.role === "super_admin" || user.role === "tenant_admin") return true;
  return permissions?.[module]?.[action] === true;
};

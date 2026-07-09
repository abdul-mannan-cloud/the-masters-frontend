import { useEffect, useState } from "react";
import * as authService from "../services/authService";
import * as employeeService from "../services/employeeService";
import * as tenantService from "../services/tenantService";
import { AuthContext } from "./authContext";

const readStoredUser = () => {
  const storedUser = localStorage.getItem("ciseauxuser");
  const token = localStorage.getItem("ciseauxtoken");
  return storedUser && token ? JSON.parse(storedUser) : null;
};

// super_admin/tenant_admin always have full implicit access — only
// employee/manager accounts are actually gated by a Role's permission grid.
const isPermissionGated = (role) => role === "employee" || role === "manager";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [permissions, setPermissions] = useState(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [tenant, setTenant] = useState(null);

  const loadPermissions = async (currentUser) => {
    if (!currentUser || !isPermissionGated(currentUser.role)) {
      setPermissions(null);
      return;
    }
    setPermissionsLoading(true);
    try {
      const result = await employeeService.getMyPermissions();
      setPermissions(result.permissions);
    } catch {
      setPermissions(null);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // super_admin has no tenantId — the tenant branding block is only ever
  // shown to tenant-scoped users (tenant_admin/manager/employee).
  const loadTenant = async (currentUser) => {
    if (!currentUser?.tenantId) {
      setTenant(null);
      return;
    }
    try {
      const result = await tenantService.getTenantById(currentUser.tenantId);
      setTenant(result);
    } catch {
      setTenant(null);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadPermissions(user), loadTenant(user)]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("ciseauxtoken", data.token);
    localStorage.setItem("ciseauxuser", JSON.stringify(data.user));
    setUser(data.user);
    await Promise.all([loadPermissions(data.user), loadTenant(data.user)]);
    return data.user;
  };

  const signup = async (payload) => {
    return authService.signup(payload);
  };

  const logout = () => {
    localStorage.removeItem("ciseauxtoken");
    localStorage.removeItem("ciseauxuser");
    setUser(null);
    setPermissions(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, permissions, permissionsLoading, tenant, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

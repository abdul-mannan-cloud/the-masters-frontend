import { useEffect, useState } from "react";
import * as authService from "../services/authService";
import * as employeeService from "../services/employeeService";
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

  useEffect(() => {
    (async () => {
      await loadPermissions(user);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("ciseauxtoken", data.token);
    localStorage.setItem("ciseauxuser", JSON.stringify(data.user));
    setUser(data.user);
    await loadPermissions(data.user);
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
  };

  return (
    <AuthContext.Provider
      value={{ user, permissions, permissionsLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

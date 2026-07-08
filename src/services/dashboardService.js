import api from "../lib/api";

export const getSuperAdminDashboard = async () => {
  const { data } = await api.get("/dashboard/super-admin");
  return data;
};

export const getTenantOwnerDashboard = async () => {
  const { data } = await api.get("/dashboard/tenant-owner");
  return data;
};

export const getEmployeeDashboard = async () => {
  const { data } = await api.get("/dashboard/employee");
  return data;
};

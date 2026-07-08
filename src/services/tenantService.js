import api from "../lib/api";

export const getAllTenants = async (params = {}) => {
  const { data } = await api.get("/tenant", { params });
  return data;
};

export const getTenantById = async (id) => {
  const { data } = await api.get(`/tenant/${id}`);
  return data;
};

export const createTenant = async (tenant) => {
  const { data } = await api.post("/tenant", tenant);
  return data;
};

export const updateTenant = async (id, tenant) => {
  const { data } = await api.put(`/tenant/${id}`, tenant);
  return data;
};

export const suspendTenant = async (id) => {
  const { data } = await api.patch(`/tenant/${id}/suspend`);
  return data;
};

export const activateTenant = async (id) => {
  const { data } = await api.patch(`/tenant/${id}/activate`);
  return data;
};

export const deleteTenant = async (id) => {
  const { data } = await api.delete(`/tenant/${id}`);
  return data;
};

export const getTenantStats = async (id) => {
  const { data } = await api.get(`/tenant/${id}/stats`);
  return data;
};

import api from "../lib/api";

export const getAllTenants = async (params = {}) => {
  const { data } = await api.get("/tenant", { params });
  return data;
};

export const getTenantById = async (id) => {
  const { data } = await api.get(`/tenant/${id}`);
  return data;
};

// Public — no auth required, works even logged out. Resolves a subdomain to
// its tenant for the login page (branding, "business not found", and
// scoping the login attempt by tenantId).
export const getTenantBySlug = async (slug) => {
  const { data } = await api.get(`/tenant/by-slug/${slug}`);
  return data;
};

export const createTenant = async (tenant) => {
  const formData = new FormData();
  Object.entries(tenant).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const { data } = await api.post("/tenant", formData);
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

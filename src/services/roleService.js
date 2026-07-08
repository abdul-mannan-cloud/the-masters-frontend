import api from "../lib/api";

export const getPermissionModules = async () => {
  const { data } = await api.get("/role/permission-modules");
  return data;
};

export const getAllRoles = async () => {
  const { data } = await api.get("/role");
  return data;
};

export const getRoleById = async (id) => {
  const { data } = await api.get(`/role/${id}`);
  return data;
};

export const createRole = async (role) => {
  const { data } = await api.post("/role", role);
  return data;
};

export const updateRole = async (id, role) => {
  const { data } = await api.put(`/role/${id}`, role);
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await api.delete(`/role/${id}`);
  return data;
};

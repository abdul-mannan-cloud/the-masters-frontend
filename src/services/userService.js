import api from "../lib/api";

export const getAllUsers = async (params = {}) => {
  const { data } = await api.get("/admin", { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/admin/${id}`);
  return data;
};

export const createUser = async (user) => {
  const { data } = await api.post("/admin", user);
  return data;
};

export const updateUser = async (id, user) => {
  const { data } = await api.put(`/admin/${id}`, user);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/${id}`);
  return data;
};

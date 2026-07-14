import api from "../lib/api";

export const getAllInventory = async (params = {}) => {
  const { data } = await api.get("/inventory", { params });
  return data;
};

export const getLowStockItems = async () => {
  const { data } = await api.get("/inventory/low-stock");
  return data;
};

export const getInventoryById = async (id) => {
  const { data } = await api.get(`/inventory/${id}`);
  return data;
};

export const getInventoryTransactions = async (id, params = {}) => {
  const { data } = await api.get(`/inventory/${id}/transactions`, { params });
  return data;
};

// payload may be a plain object (JSON) or FormData (when an image file is attached)
export const createInventory = async (payload) => {
  const isFormData = payload instanceof FormData;
  const { data } = await api.post("/inventory", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const updateInventory = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const { data } = await api.put(`/inventory/${id}`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const deleteInventory = async (id) => {
  const { data } = await api.delete(`/inventory/${id}`);
  return data;
};

export const adjustInventory = async (id, adjustment) => {
  const { data } = await api.patch(`/inventory/${id}/adjust`, adjustment);
  return data;
};

import api from "../lib/api";

export const getAllProductTypes = async (params = {}) => {
  const { data } = await api.get("/product-type", { params });
  return data;
};

export const getProductTypeById = async (id) => {
  const { data } = await api.get(`/product-type/${id}`);
  return data;
};

export const createProductType = async (productType) => {
  const { data } = await api.post("/product-type", productType);
  return data;
};

export const updateProductType = async (id, productType) => {
  const { data } = await api.put(`/product-type/${id}`, productType);
  return data;
};

export const toggleProductTypeStatus = async (id, isActive) => {
  const { data } = await api.patch(`/product-type/${id}/status`, { isActive });
  return data;
};

export const deleteProductType = async (id) => {
  const { data } = await api.delete(`/product-type/${id}`);
  return data;
};

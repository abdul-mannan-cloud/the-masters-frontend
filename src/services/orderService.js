import api from "../lib/api";

export const getAllOrders = async (filters = {}) => {
  const { data } = await api.get("/order", { params: filters });
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/order/${id}`);
  return data;
};

export const createOrder = async (order) => {
  const { data } = await api.post("/order", order);
  return data;
};

export const updateOrder = async (id, order) => {
  const { data } = await api.put(`/order/${id}`, order);
  return data;
};

export const getBill = async (id) => {
  const { data } = await api.get(`/order/${id}/bill`);
  return data;
};

export const getCheckout = async (id) => {
  const { data } = await api.get(`/order/${id}/checkout`);
  return data;
};

export const getOrderDetails = async (id) => {
  const { data } = await api.get(`/order/${id}/details`);
  return data;
};

export const applyDiscount = async (id, discountData) => {
  const { data } = await api.patch(`/order/${id}/discount`, discountData);
  return data;
};

export const confirmOrder = async (id) => {
  const { data } = await api.patch(`/order/${id}/confirm`);
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await api.delete(`/order/${id}`);
  return data;
};

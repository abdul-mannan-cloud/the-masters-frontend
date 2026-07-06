import api from "../lib/api";

export const getAllCustomers = async () => {
  const { data } = await api.get("/customer");
  return data;
};

export const getCustomerById = async (id) => {
  const { data } = await api.get(`/customer/${id}`);
  return data;
};

export const createCustomer = async (customer) => {
  const { data } = await api.post("/customer", customer);
  return data;
};

export const updateCustomer = async (id, customer) => {
  const { data } = await api.put(`/customer/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id) => {
  const { data } = await api.delete(`/customer/${id}`);
  return data;
};

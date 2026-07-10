import api from "../lib/api";

export const getPayments = async (orderId) => {
  const { data } = await api.get("/payment", { params: { orderId } });
  return data;
};

export const getPaymentHistory = async (orderId) => {
  const { data } = await api.get("/payment/history", { params: { orderId } });
  return data;
};

export const addPayment = async (payment) => {
  const { data } = await api.post("/payment", payment);
  return data;
};

// Payments are immutable — this only ever sends { notes }; the backend
// rejects any attempt to change amount/method/type/date.
export const updatePaymentNotes = async (id, notes) => {
  const { data } = await api.put(`/payment/${id}`, { notes });
  return data;
};

export const reversePayment = async (id, reason) => {
  const { data } = await api.post(`/payment/${id}/reverse`, { reason });
  return data;
};

import api from "../lib/api";

export const getAlerts = async (filters = {}) => {
  const { data } = await api.get("/alert", { params: filters });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get("/alert/unread-count");
  return data.count;
};

export const markAsRead = async (id) => {
  const { data } = await api.patch(`/alert/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.patch("/alert/read-all");
  return data;
};

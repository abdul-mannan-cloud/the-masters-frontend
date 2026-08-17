import api from "../lib/api";

export const getAllNotifications = async (params = {}) => {
  const { data } = await api.get("/notification", { params });
  return data;
};

export const getNotificationById = async (id) => {
  const { data } = await api.get(`/notification/${id}`);
  return data;
};

// The three human-in-the-loop actions — backend re-verifies status and
// tenant ownership on every call (see NotificationController.js), this is
// not the enforcement boundary, just what triggers it.
export const sendPendingNotification = async (id) => {
  const { data } = await api.post(`/notification/${id}/send`);
  return data;
};

export const cancelPendingNotification = async (id) => {
  const { data } = await api.post(`/notification/${id}/cancel`);
  return data;
};

export const resendNotification = async (id) => {
  const { data } = await api.post(`/notification/${id}/resend`);
  return data;
};

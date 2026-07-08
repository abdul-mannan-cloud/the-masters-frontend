import api from "../lib/api";

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const updateSettings = async (settings) => {
  const { data } = await api.put("/settings", settings);
  return data;
};

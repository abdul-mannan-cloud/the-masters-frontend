import api from "../lib/api";

export const getAllMeasurements = async (customerId) => {
  const { data } = await api.get("/measurement", { params: { customerId } });
  return data;
};

export const getMeasurementById = async (id) => {
  const { data } = await api.get(`/measurement/${id}`);
  return data;
};

export const createMeasurement = async (measurement) => {
  const { data } = await api.post("/measurement", measurement);
  return data;
};

export const updateMeasurement = async (id, measurement) => {
  const { data } = await api.put(`/measurement/${id}`, measurement);
  return data;
};

export const deleteMeasurement = async (id) => {
  const { data } = await api.delete(`/measurement/${id}`);
  return data;
};

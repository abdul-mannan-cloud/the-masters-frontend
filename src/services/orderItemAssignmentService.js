import api from "../lib/api";

export const getAllAssignments = async (filters = {}) => {
  const { data } = await api.get("/order-item-assignment", { params: filters });
  return data;
};

// Sets the order's full assigned-employee roster — the backend reconciles
// this against whoever is currently assigned (adds new ones, removes
// unchecked ones), so this is the complete desired list, not a delta.
export const syncOrderAssignments = async (orderId, employeeIds) => {
  const { data } = await api.put(`/order-item-assignment/order/${orderId}/assign`, {
    employeeIds,
  });
  return data;
};

// Self-service — employee updating their OWN assignment's status.
export const updateMyAssignmentStatus = async (id, status) => {
  const { data } = await api.patch(`/order-item-assignment/${id}/my-status`, { status });
  return data;
};

export const updateAssignment = async (id, updates) => {
  const { data } = await api.put(`/order-item-assignment/${id}`, updates);
  return data;
};

export const deleteAssignment = async (id) => {
  const { data } = await api.delete(`/order-item-assignment/${id}`);
  return data;
};

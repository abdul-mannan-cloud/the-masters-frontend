import api from "../lib/api";

export const getAllAssignments = async (filters = {}) => {
  const { data } = await api.get("/order-item-assignment", { params: filters });
  return data;
};

// { assignments: [{ orderItemId, sequence, employeeId, notes? }] }
export const bulkAssignEmployees = async (orderId, assignments) => {
  const { data } = await api.post(`/order-item-assignment/order/${orderId}/assign`, {
    assignments,
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

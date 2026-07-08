import api from "../lib/api";

export const getSkills = async () => {
  const { data } = await api.get("/employee/skills");
  return data;
};

export const getAllEmployees = async () => {
  const { data } = await api.get("/employee");
  return data;
};

export const getEmployeeById = async (id) => {
  const { data } = await api.get(`/employee/${id}`);
  return data;
};

// Creates the Employee profile and a linked portal login (User, role
// "employee") together — this is how a tenant grants an employee access.
export const enrollEmployee = async (employee) => {
  const { data } = await api.post("/employee/enroll", employee);
  return data;
};

export const updateEmployee = async (id, employee) => {
  const { data } = await api.put(`/employee/${id}`, employee);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/employee/${id}`);
  return data;
};

export const getMyPermissions = async () => {
  const { data } = await api.get("/employee/me/permissions");
  return data;
};

export const getEmployeeAssignments = async (id) => {
  const { data } = await api.get(`/employee/${id}/assignments`);
  return data;
};

export const getEmployeePerformance = async (id) => {
  const { data } = await api.get(`/employee/${id}/performance`);
  return data;
};

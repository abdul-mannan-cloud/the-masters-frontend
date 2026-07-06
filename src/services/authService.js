import api from "../lib/api";

export const login = async ({ email, password }) => {
  const { data } = await api.post("/admin/login", { email, password });
  return data;
};

export const signup = async ({ email, password, businessName }) => {
  const { data } = await api.post("/admin/signup", {
    email,
    password,
    businessName,
  });
  return data;
};

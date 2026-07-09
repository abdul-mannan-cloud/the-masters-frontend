import api from "../lib/api";

export const login = async ({ email, password }) => {
  const { data } = await api.post("/admin/login", { email, password });
  return data;
};

export const signup = async ({
  email,
  password,
  businessName,
  contactPhone,
  address,
  logo,
}) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("businessName", businessName);
  if (contactPhone) formData.append("contactPhone", contactPhone);
  if (address) formData.append("address", address);
  if (logo) formData.append("logo", logo);

  const { data } = await api.post("/admin/signup", formData);
  return data;
};

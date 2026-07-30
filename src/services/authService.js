import api from "../lib/api";

// tenantId is optional — only supplied on a business subdomain, where the
// resolved tenant scopes the lookup (email is unique per-tenant, not
// globally, see Models/User.js).
export const login = async ({ email, password, tenantId }) => {
  const { data } = await api.post("/admin/login", { email, password, tenantId });
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

import api from "../lib/api";

// When a logo file is attached, the rest of the (nested) settings payload
// travels as a single JSON-stringified "payload" field instead of top-level
// form fields — multipart/form-data can't express nested objects the way
// JSON can. Without a logo, a plain JSON body is simpler and sufficient.
const buildBody = (settings, logoFile) => {
  if (!logoFile) return settings;
  const formData = new FormData();
  formData.append("payload", JSON.stringify(settings));
  formData.append("logo", logoFile);
  return formData;
};

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const updateSettings = async (settings, logoFile) => {
  const { data } = await api.put("/settings", buildBody(settings, logoFile));
  return data;
};

// super_admin managing a specific tenant's business profile from the Tenant view.
export const getTenantSettings = async (tenantId) => {
  const { data } = await api.get(`/settings/tenant/${tenantId}`);
  return data;
};

export const updateTenantSettings = async (tenantId, settings, logoFile) => {
  const { data } = await api.put(
    `/settings/tenant/${tenantId}`,
    buildBody(settings, logoFile),
  );
  return data;
};

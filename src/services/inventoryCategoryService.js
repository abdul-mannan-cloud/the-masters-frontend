import api from "../lib/api";

// Direct children only (top-level categories if parentCategoryId is omitted)
// — the drill-down UI fetches one level at a time.
export const getAllCategories = async (parentCategoryId) => {
  const { data } = await api.get("/inventory-category", {
    params: parentCategoryId ? { parentCategoryId } : {},
  });
  return data;
};

// Every category for the tenant, flat, depth-annotated, parent-before-child
// — powers the "which category" dropdown on the Inventory Form (needs any
// node at any depth in one shot, unlike the drill-down UI's one-level-at-a-
// time getAllCategories()).
export const getAllCategoriesFlat = async () => {
  const { data } = await api.get("/inventory-category", { params: { flat: "true" } });
  return data;
};

export const getCategoryById = async (id) => {
  const { data } = await api.get(`/inventory-category/${id}`);
  return data;
};

// Ancestor chain root-first, e.g. [Fabric, Cotton] — powers the breadcrumb.
export const getCategoryPath = async (id) => {
  const { data } = await api.get(`/inventory-category/${id}/path`);
  return data;
};

export const createCategory = async (category) => {
  const { data } = await api.post("/inventory-category", category);
  return data;
};

export const updateCategory = async (id, category) => {
  const { data } = await api.put(`/inventory-category/${id}`, category);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/inventory-category/${id}`);
  return data;
};

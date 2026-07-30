import api from "../lib/api";

export const getAllProductTypes = async (params = {}) => {
  const { data } = await api.get("/product-type", { params });
  return data;
};

export const getProductCategories = async () => {
  const { data } = await api.get("/product-type/categories");
  return data;
};

export const getProductTypeById = async (id) => {
  const { data } = await api.get(`/product-type/${id}`);
  return data;
};

export const createProductType = async (productType) => {
  const { data } = await api.post("/product-type", productType);
  return data;
};

export const updateProductType = async (id, productType) => {
  const { data } = await api.put(`/product-type/${id}`, productType);
  return data;
};

// baseImage: { file?: File, existingImage?: string|null } | null
// layers: [{ optionName, zIndex, values: [{ value, file?: File, existingImage?: string|null }] }]
// A value with neither a freshly picked file nor an existingImage is left
// off the request entirely (nothing to save for it yet) — the backend
// full-replaces preview.layers with whatever is sent, so omitting it here is
// how "no image set for this value" is expressed, not an empty/invalid entry.
export const updatePreviewLayers = async (id, { baseImage, layers }) => {
  const form = new FormData();
  let fieldCounter = 0;
  const attachFile = (file) => {
    const fieldName = `layerFile_${fieldCounter++}`;
    form.append(fieldName, file);
    return fieldName;
  };

  let baseImageMeta = null;
  if (baseImage?.file) {
    baseImageMeta = { fieldName: attachFile(baseImage.file) };
  } else if (baseImage?.existingImage) {
    baseImageMeta = { existingImage: baseImage.existingImage };
  }

  const layersMeta = (layers || [])
    .map((layer) => ({
      optionName: layer.optionName,
      zIndex: layer.zIndex ?? 0,
      values: (layer.values || [])
        .filter((v) => v.file || v.existingImage)
        .map((v) =>
          v.file
            ? { value: v.value, fieldName: attachFile(v.file) }
            : { value: v.value, existingImage: v.existingImage },
        ),
    }))
    .filter((layer) => layer.values.length > 0);

  form.append("previewMeta", JSON.stringify({ baseImage: baseImageMeta, layers: layersMeta }));

  const { data } = await api.put(`/product-type/${id}/preview-layers`, form);
  return data;
};

export const toggleProductTypeStatus = async (id, isActive) => {
  const { data } = await api.patch(`/product-type/${id}/status`, { isActive });
  return data;
};

export const deleteProductType = async (id) => {
  const { data } = await api.delete(`/product-type/${id}`);
  return data;
};

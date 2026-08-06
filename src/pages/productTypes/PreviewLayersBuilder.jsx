import { useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import * as productTypeService from "../../services/productTypeService";
import Spinner from "../../components/Spinner";

const buildKey = (optionName, value) => `${optionName}::${value}`;

// Lets a tenant upload the base garment image plus one image per option
// value (e.g. Neckline="Chinese") that GarmentPreview.jsx composites live
// during order creation. Only usable once the ProductType exists (needs an
// id to attach uploads to), so ProductTypeForm only renders this tab in edit
// mode. Existing images are re-sent as-is on save (see
// productTypeService.updatePreviewLayers) — this always full-replaces
// preview.layers, matching how options/workflow already save as complete
// arrays rather than incremental patches.
const PreviewLayersBuilder = ({ productTypeId, options, preview, onSaved }) => {
  const [baseImage, setBaseImage] = useState({ file: null, existingImage: null, previewUrl: null });
  const [valueImages, setValueImages] = useState({});
  const [zIndexByOption, setZIndexByOption] = useState({});
  const [saving, setSaving] = useState(false);
  // Tracks which `preview` object this local editable state was derived
  // from, so a fresh productType load (or a just-saved response replacing
  // blob: preview URLs with real ones) re-syncs local state — without an
  // effect. This is React's documented "adjust state when a prop changes"
  // pattern: setState during render, guarded by comparing against the last
  // seen value, rather than useEffect (which would cascade an extra render
  // and cannot itself directly call setState per this repo's lint rules).
  const [syncedFrom, setSyncedFrom] = useState(undefined);

  if (syncedFrom !== preview) {
    setSyncedFrom(preview);
    setBaseImage({ file: null, existingImage: preview?.baseImage || null, previewUrl: preview?.baseImage || null });

    const nextValueImages = {};
    const nextZ = {};
    for (const layer of preview?.layers || []) {
      nextZ[layer.optionName] = layer.zIndex;
      for (const v of layer.values) {
        nextValueImages[buildKey(layer.optionName, v.value)] = {
          file: null,
          existingImage: v.image,
          previewUrl: v.image,
        };
      }
    }
    setValueImages(nextValueImages);
    setZIndexByOption(nextZ);
  }

  const handleBaseFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBaseImage({ file, existingImage: null, previewUrl: URL.createObjectURL(file) });
  };

  const handleValueFile = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValueImages((prev) => ({
      ...prev,
      [key]: { file, existingImage: null, previewUrl: URL.createObjectURL(file) },
    }));
  };

  const clearValueImage = (key) => {
    setValueImages((prev) => ({ ...prev, [key]: { file: null, existingImage: null, previewUrl: null } }));
  };

  const handleZIndexChange = (optionName) => (e) => {
    setZIndexByOption((prev) => ({ ...prev, [optionName]: Number(e.target.value) || 0 }));
  };

  const handleSave = async () => {
    const layers = options
      .filter((o) => o.values.length > 0)
      .map((option) => ({
        optionName: option.name,
        zIndex: zIndexByOption[option.name] ?? 0,
        values: option.values.map((v) => {
          const entry = valueImages[buildKey(option.name, v)] || {};
          return { value: v, file: entry.file || null, existingImage: entry.existingImage || null };
        }),
      }));

    setSaving(true);
    try {
      const { productType } = await productTypeService.updatePreviewLayers(productTypeId, {
        baseImage,
        layers,
      });
      toast.success("Preview layers saved.");
      onSaved(productType);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save preview layers");
    } finally {
      setSaving(false);
    }
  };

  if (options.length === 0) {
    return (
      <div className="empty-state py-10!">
        <ImageIcon className="w-6 h-6 text-stone-300" />
        <p className="text-sm text-on-surface-variant">
          Add Product Options first — each option value gets its own preview layer image here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-on-surface-variant">
        Upload the base garment image and one image per option value. The order-creation
        preview stacks these by layer order as options are selected — a higher number
        paints on top (e.g. a Pocket layer above Sleeves above the base garment).
      </p>

      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
          Base Garment Image
        </label>
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
            {baseImage.previewUrl ? (
              <img src={baseImage.previewUrl} alt="Base garment" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-5 h-5 text-stone-300" />
            )}
          </div>
          <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-primary cursor-pointer hover:bg-stone-50 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleBaseFile} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <div key={option.name} className="p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-on-surface">{option.name}</span>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-on-surface-variant">Layer order</label>
                <input
                  type="number"
                  value={zIndexByOption[option.name] ?? 0}
                  onChange={handleZIndexChange(option.name)}
                  className="w-16 px-2 py-1 bg-white rounded-md border border-stone-200 text-xs"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {option.values.map((v) => {
                const key = buildKey(option.name, v);
                const entry = valueImages[key];
                return (
                  <div key={v} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-16 h-16 rounded-lg bg-white border border-stone-200 flex items-center justify-center overflow-hidden">
                      {entry?.previewUrl ? (
                        <img src={entry.previewUrl} alt={v} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-stone-300" />
                      )}
                      {entry?.previewUrl && (
                        <button
                          type="button"
                          onClick={() => clearValueImage(key)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-white/90 rounded-full text-stone-400 hover:text-red-600"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <label className="text-[11px] font-semibold text-primary cursor-pointer hover:underline">
                      {entry?.previewUrl ? "Change" : "Upload"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleValueFile(key)} />
                    </label>
                    <span className="text-[11px] text-on-surface-variant text-center max-w-16 truncate" title={v}>
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {saving && <Spinner size="sm" tone="on-primary" />}
        {saving ? "Saving…" : "Save Preview Layers"}
      </button>
    </div>
  );
};

export default PreviewLayersBuilder;

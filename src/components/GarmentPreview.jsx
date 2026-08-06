import { useMemo } from "react";
import { Shirt } from "lucide-react";

// Composites a ProductType's 2D layered preview for the garment options
// currently selected on an order draft row. Purely additive/visual — a
// ProductType with no preview.baseImage configured (the default for every
// existing/legacy ProductType) just shows a neutral placeholder instead of
// breaking or hiding the rest of the order form. New ProductTypes/options
// need zero changes here: layers are matched to selections by the option
// name/value strings already flowing through orderDraft.selectedOptions,
// nothing about this component is hardcoded to a specific garment.
const GarmentPreview = ({ productType, selectedOptions, onClear }) => {
  const preview = productType?.preview;
  const hasBaseImage = Boolean(preview?.baseImage);

  // Higher zIndex paints on top (e.g. a Pocket layer above a Sleeves layer
  // above the base garment) — sorted once per preview, not on every render.
  const orderedLayers = useMemo(
    () => [...(preview?.layers || [])].sort((a, b) => a.zIndex - b.zIndex),
    [preview?.layers],
  );

  const selectedEntries = Object.entries(selectedOptions || {}).filter(([, value]) => value);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Design
        </span>
        {selectedEntries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative aspect-[4/5] bg-stone-50 flex items-center justify-center overflow-hidden">
        {hasBaseImage ? (
          <>
            <img
              src={preview.baseImage}
              alt={productType.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
            {orderedLayers.map((layer) => {
              const value = selectedOptions?.[layer.optionName];
              const layerValue = layer.values.find((v) => v.value === value);
              if (!layerValue) return null;
              return (
                <img
                  key={layer.optionName}
                  src={layerValue.image}
                  alt={`${layer.optionName}: ${value}`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              );
            })}
          </>
        ) : (
          <div className="text-center px-6">
            <Shirt className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
            <p className="text-xs text-on-surface-variant">
              Preview not available for this product yet.
            </p>
          </div>
        )}
      </div>

      {selectedEntries.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Selected Options
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedEntries.map(([name, value]) => (
              <div key={name} className="text-xs">
                <span className="text-on-surface-variant">{name}: </span>
                <span className="font-semibold text-on-surface px-2 py-0.5 rounded-md bg-stone-100">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GarmentPreview;

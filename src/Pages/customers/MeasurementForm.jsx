import { useState } from "react";
import ManualMeasurementFieldsBuilder from "./ManualMeasurementFieldsBuilder";

const buildFieldRows = (template, existingValues = []) =>
  [...template]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((f) => {
      const existing = existingValues.find((v) => v.fieldId === f.id);
      return {
        fieldId: f.id,
        label: f.label,
        unit: f.unit,
        required: f.required,
        value: existing ? String(existing.value) : "",
      };
    });

// Used both to add a brand-new garment measurement (create/duplicate — the
// garment/product type can be picked or changed) and to edit an existing one
// or start a new version of a locked one (lockGarmentSelection — the garment
// is fixed, only values/price/label/notes are editable).
const MeasurementForm = ({
  productTypes,
  productTypesLoading,
  initialData,
  lockGarmentSelection = false,
  submitLabel = "Save",
  saving = false,
  onSave,
  onCancel,
}) => {
  const initialProductType =
    !lockGarmentSelection && initialData?.productTypeId
      ? productTypes.find((p) => p._id === initialData.productTypeId)
      : null;

  const [productTypeId, setProductTypeId] = useState(
    initialData?.productTypeId || "",
  );
  const [garmentType, setGarmentType] = useState(
    initialData?.garmentType || "",
  );
  const [price, setPrice] = useState(
    initialData?.price != null ? String(initialData.price) : "",
  );
  const [label, setLabel] = useState(initialData?.label || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [fieldRows, setFieldRows] = useState(
    initialProductType
      ? buildFieldRows(
          initialProductType.measurementTemplate,
          initialData?.values,
        )
      : [],
  );
  const [manualValues, setManualValues] = useState(
    !lockGarmentSelection && !initialData?.productTypeId
      ? initialData?.values || []
      : [],
  );
  const [lockedValues, setLockedValues] = useState(
    lockGarmentSelection ? initialData?.values || [] : [],
  );
  const [error, setError] = useState("");

  const handleProductTypeChange = (e) => {
    const id = e.target.value;
    setProductTypeId(id);
    if (!id) {
      setGarmentType("");
      setFieldRows([]);
      setPrice("");
    } else {
      const pt = productTypes.find((p) => p._id === id);
      if (pt) {
        setGarmentType(pt.name);
        setPrice(String(pt.basePrice));
        setFieldRows(buildFieldRows(pt.measurementTemplate));
      }
    }
  };

  const handleFieldRowChange = (index, value) => {
    setFieldRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, value } : r)),
    );
  };

  const handleLockedValueChange = (index, value) => {
    setLockedValues((rows) =>
      rows.map((r, i) => (i === index ? { ...r, value } : r)),
    );
  };

  // Not a real <form> submit — this component renders inside a Modal that is
  // itself nested inside the Customer DetailPanel's <form>, and HTML forbids
  // nested <form> elements (the browser would silently drop this one).
  const handleSubmit = (e) => {
    e?.preventDefault();
    setError("");

    if (!garmentType.trim()) {
      setError(
        productTypeId || lockGarmentSelection
          ? "Garment type is missing."
          : "Enter a garment type name.",
      );
      return;
    }
    if (price === "" || Number(price) < 0) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    let finalValues;
    if (lockGarmentSelection) {
      if (lockedValues.some((v) => v.value === "" || v.value === null)) {
        setError("Fill in every measurement value.");
        return;
      }
      finalValues = lockedValues.map((v) => ({
        fieldId: v.fieldId,
        label: v.label,
        unit: v.unit,
        value: Number(v.value),
      }));
    } else if (productTypeId) {
      const missingRequired = fieldRows.some(
        (f) => f.required && f.value === "",
      );
      if (missingRequired) {
        setError("Fill in every required measurement field.");
        return;
      }
      finalValues = fieldRows
        .filter((f) => f.value !== "")
        .map((f) => ({
          fieldId: f.fieldId,
          label: f.label,
          unit: f.unit,
          value: Number(f.value),
        }));
    } else {
      if (manualValues.length === 0) {
        setError("Add at least one measurement field.");
        return;
      }
      finalValues = manualValues;
    }

    onSave({
      productTypeId: productTypeId || null,
      garmentType: garmentType.trim(),
      price: Number(price),
      label: label.trim(),
      notes: notes.trim(),
      values: finalValues,
    });
  };

  return (
    <div className="space-y-4">
      {lockGarmentSelection ? (
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Garment Type
          </p>
          <p className="text-sm font-bold text-on-surface">{garmentType}</p>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Product Type
          </label>
          <select
            value={productTypeId}
            onChange={handleProductTypeChange}
            disabled={productTypesLoading}
            className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">
              {productTypesLoading
                ? "Loading product types…"
                : "— Manual Measurement —"}
            </option>
            {productTypes.map((pt) => (
              <option key={pt._id} value={pt._id}>
                {pt.name}
              </option>
            ))}
          </select>
          {!productTypeId && (
            <input
              type="text"
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              placeholder="Garment type name (e.g. Custom Waistcoat)"
              className="w-full mt-2 px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Price (Rs.)
          </label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Occasion Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Optional, e.g. Eid"
            className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Measurements
        </label>
        {lockGarmentSelection ? (
          <div className="space-y-2">
            {lockedValues.map((v, index) => (
              <div
                key={v.fieldId}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl"
              >
                <span className="flex-1 text-sm font-medium text-on-surface">
                  {v.label}
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={v.value}
                  onChange={(e) =>
                    handleLockedValueChange(index, e.target.value)
                  }
                  className="w-20 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-xs text-on-surface-variant w-8">
                  {v.unit}
                </span>
              </div>
            ))}
          </div>
        ) : productTypeId ? (
          <div className="space-y-2">
            {fieldRows.map((f, index) => (
              <div
                key={f.fieldId}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl"
              >
                <span className="flex-1 text-sm font-medium text-on-surface">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={f.value}
                  onChange={(e) => handleFieldRowChange(index, e.target.value)}
                  className="w-20 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-xs text-on-surface-variant w-8">
                  {f.unit}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <ManualMeasurementFieldsBuilder
            value={manualValues}
            onChange={setManualValues}
          />
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-slate-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
};

export default MeasurementForm;

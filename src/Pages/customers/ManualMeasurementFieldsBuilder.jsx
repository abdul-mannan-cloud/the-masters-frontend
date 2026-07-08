import { useState } from "react";
import { Plus, Trash2, Ruler } from "lucide-react";

const UNITS = ["inch", "cm", "mm"];

const slugify = (label) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

const emptyDraft = { label: "", value: "", unit: "inch" };

// Manual measurements have no ProductType template to generate a form from,
// so the employee builds the field list AND enters each value here, in one step.
const ManualMeasurementFieldsBuilder = ({ value, onChange }) => {
  const [draft, setDraft] = useState(emptyDraft);

  const labelTaken =
    draft.label.trim() &&
    value.some(
      (f) => f.label.trim().toLowerCase() === draft.label.trim().toLowerCase(),
    );
  const canAdd = draft.label.trim() && draft.value !== "" && !labelTaken;

  const handleAdd = () => {
    if (!canAdd) return;
    const base = slugify(draft.label);
    let fieldId = base || `field_${value.length}`;
    let suffix = 1;
    while (value.some((f) => f.fieldId === fieldId)) {
      fieldId = `${base}_${suffix++}`;
    }
    onChange([
      ...value,
      {
        fieldId,
        label: draft.label.trim(),
        value: Number(draft.value),
        unit: draft.unit,
      },
    ]);
    setDraft(emptyDraft);
  };

  const handleRemove = (index) => onChange(value.filter((_, i) => i !== index));

  const handleFieldChange = (index, field, fieldValue) => {
    onChange(
      value.map((f, i) => (i === index ? { ...f, [field]: fieldValue } : f)),
    );
  };

  return (
    <div>
      {value.length === 0 ? (
        <div className="empty-state py-6! mb-3">
          <Ruler className="w-5 h-5 text-slate-300" />
          <p className="text-sm text-on-surface-variant">
            No measurement fields yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {value.map((field, index) => (
            <div
              key={field.fieldId}
              className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl"
            >
              <span className="flex-1 text-sm font-medium text-on-surface">
                {field.label}
              </span>
              <input
                type="number"
                step="0.1"
                value={field.value}
                onChange={(e) =>
                  handleFieldChange(index, "value", Number(e.target.value))
                }
                className="w-20 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={field.unit}
                onChange={(e) =>
                  handleFieldChange(index, "unit", e.target.value)
                }
                className="px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 p-2.5 border border-dashed border-slate-300 rounded-xl">
        <input
          type="text"
          value={draft.label}
          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          placeholder="Field (e.g. Chest)"
          className="flex-1 px-2.5 py-1.5 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="number"
          step="0.1"
          value={draft.value}
          onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
          placeholder="Value"
          className="w-20 px-2.5 py-1.5 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={draft.unit}
          onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
          className="px-2.5 py-1.5 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="p-2 bg-primary text-on-primary rounded-lg disabled:opacity-40 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {labelTaken && (
        <p className="mt-1 text-xs text-red-600">That field already exists.</p>
      )}
    </div>
  );
};

export default ManualMeasurementFieldsBuilder;

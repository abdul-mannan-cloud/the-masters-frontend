import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Ruler } from "lucide-react";

const UNITS = ["inch", "cm", "mm"];

const emptyDraft = { id: "", label: "", required: true, unit: "inch" };

const MeasurementTemplateBuilder = ({ value, onChange }) => {
  const [draft, setDraft] = useState(emptyDraft);

  const idTaken =
    draft.id.trim() && value.some((f) => f.id === draft.id.trim());
  const labelTaken =
    draft.label.trim() &&
    value.some(
      (f) => f.label.trim().toLowerCase() === draft.label.trim().toLowerCase(),
    );
  const canAdd =
    draft.id.trim() && draft.label.trim() && !idTaken && !labelTaken;

  const withDisplayOrder = (fields) =>
    fields.map((f, i) => ({ ...f, displayOrder: i }));

  const handleAdd = () => {
    if (!canAdd) return;
    onChange(
      withDisplayOrder([
        ...value,
        {
          id: draft.id.trim(),
          label: draft.label.trim(),
          required: draft.required,
          unit: draft.unit,
        },
      ]),
    );
    setDraft(emptyDraft);
  };

  const handleRemove = (index) => {
    onChange(withDisplayOrder(value.filter((_, i) => i !== index)));
  };

  const handleFieldChange = (index, field, fieldValue) => {
    const next = value.map((f, i) =>
      i === index ? { ...f, [field]: fieldValue } : f,
    );
    onChange(next);
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(withDisplayOrder(next));
  };

  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-4">
        Define the measurement fields collected for this garment. Order here
        controls the order shown on the measurement form.
      </p>

      {value.length === 0 ? (
        <div className="empty-state py-10! mb-4">
          <Ruler className="w-6 h-6 text-slate-300" />
          <p className="text-sm text-on-surface-variant">
            No measurement fields yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {value.map((field, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === value.length - 1}
                  className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={field.id}
                onChange={(e) => handleFieldChange(index, "id", e.target.value)}
                placeholder="id (e.g. chest)"
                className="w-32 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  handleFieldChange(index, "label", e.target.value)
                }
                placeholder="Label (e.g. Chest)"
                className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={field.unit}
                onChange={(e) =>
                  handleFieldChange(index, "unit", e.target.value)
                }
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-on-surface-variant whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    handleFieldChange(index, "required", e.target.checked)
                  }
                  className="w-3.5 h-3.5 accent-primary"
                />
                Required
              </label>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 p-3 border border-dashed border-slate-300 rounded-xl">
        <input
          type="text"
          value={draft.id}
          onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
          placeholder="id (e.g. chest)"
          className="w-32 px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          value={draft.label}
          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          placeholder="Label (e.g. Chest)"
          className="flex-1 px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={draft.unit}
          onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
          className="px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-on-surface-variant whitespace-nowrap">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(e) =>
              setDraft((d) => ({ ...d, required: e.target.checked }))
            }
            className="w-3.5 h-3.5 accent-primary"
          />
          Required
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {(idTaken || labelTaken) && (
        <p className="mt-1.5 text-xs text-red-600">
          {idTaken ? "That id is already used." : "That label is already used."}
        </p>
      )}
    </div>
  );
};

export default MeasurementTemplateBuilder;

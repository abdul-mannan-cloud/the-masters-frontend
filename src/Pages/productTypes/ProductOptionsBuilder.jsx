import { useState } from "react";
import { Plus, Trash2, Tag, X } from "lucide-react";

const ProductOptionsBuilder = ({ value, onChange }) => {
  const [draftName, setDraftName] = useState("");
  const [valueDrafts, setValueDrafts] = useState({}); // index -> current value input text

  const nameTaken =
    draftName.trim() &&
    value.some(
      (o) => o.name.trim().toLowerCase() === draftName.trim().toLowerCase(),
    );

  const handleAddOption = () => {
    if (!draftName.trim() || nameTaken) return;
    onChange([...value, { name: draftName.trim(), values: [] }]);
    setDraftName("");
  };

  const handleRemoveOption = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleRenameOption = (index, name) => {
    onChange(value.map((o, i) => (i === index ? { ...o, name } : o)));
  };

  const handleAddValue = (index) => {
    const text = (valueDrafts[index] || "").trim();
    if (!text) return;
    const option = value[index];
    const exists = option.values.some(
      (v) => v.trim().toLowerCase() === text.toLowerCase(),
    );
    if (exists) return;
    onChange(
      value.map((o, i) =>
        i === index ? { ...o, values: [...o.values, text] } : o,
      ),
    );
    setValueDrafts((d) => ({ ...d, [index]: "" }));
  };

  const handleRemoveValue = (optIndex, valIndex) => {
    onChange(
      value.map((o, i) =>
        i === optIndex
          ? { ...o, values: o.values.filter((_, vi) => vi !== valIndex) }
          : o,
      ),
    );
  };

  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-4">
        Customization choices customers can pick from at order time, e.g.
        "Collar" with values "Chinese", "Round", "Coat".
      </p>

      {value.length === 0 ? (
        <div className="empty-state py-10! mb-4">
          <Tag className="w-6 h-6 text-slate-300" />
          <p className="text-sm text-on-surface-variant">No options yet.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {value.map((option, index) => {
            const duplicateValue =
              (valueDrafts[index] || "").trim() &&
              option.values.some(
                (v) =>
                  v.trim().toLowerCase() ===
                  (valueDrafts[index] || "").trim().toLowerCase(),
              );
            return (
              <div key={index} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => handleRenameOption(index, e.target.value)}
                    placeholder="Option name (e.g. Collar)"
                    className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {option.values.map((v, valIndex) => (
                    <span
                      key={valIndex}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium text-on-surface"
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(index, valIndex)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={valueDrafts[index] || ""}
                    onChange={(e) =>
                      setValueDrafts((d) => ({ ...d, [index]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddValue(index);
                      }
                    }}
                    placeholder="Add a value and press Enter"
                    className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddValue(index)}
                    disabled={
                      !(valueDrafts[index] || "").trim() || duplicateValue
                    }
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-primary disabled:opacity-40 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {duplicateValue && (
                  <p className="mt-1 text-xs text-red-600">
                    That value already exists.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 p-3 border border-dashed border-slate-300 rounded-xl">
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddOption();
            }
          }}
          placeholder="New option name (e.g. Sleeve Style)"
          className="flex-1 px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={handleAddOption}
          disabled={!draftName.trim() || nameTaken}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
      </div>
      {nameTaken && (
        <p className="mt-1.5 text-xs text-red-600">
          That option name already exists.
        </p>
      )}
    </div>
  );
};

export default ProductOptionsBuilder;

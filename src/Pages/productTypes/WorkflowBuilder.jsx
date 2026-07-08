import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Workflow } from "lucide-react";

const nextSequence = (value) =>
  value.length === 0 ? 10 : Math.max(...value.map((s) => s.sequence)) + 10;

const emptyDraft = { step: "", requiredSkill: "", estimatedDurationHours: "" };

const WorkflowBuilder = ({ value, onChange, skills, skillsLoading }) => {
  const [draft, setDraft] = useState(emptyDraft);

  const stepTaken =
    draft.step.trim() &&
    value.some(
      (s) => s.step.trim().toLowerCase() === draft.step.trim().toLowerCase(),
    );
  const canAdd = draft.step.trim() && draft.requiredSkill && !stepTaken;

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([
      ...value,
      {
        sequence: nextSequence(value),
        step: draft.step.trim(),
        requiredSkill: draft.requiredSkill,
        estimatedDurationHours: draft.estimatedDurationHours
          ? Number(draft.estimatedDurationHours)
          : null,
      },
    ]);
    setDraft(emptyDraft);
  };

  const handleRemove = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, fieldValue) => {
    onChange(
      value.map((s, i) => (i === index ? { ...s, [field]: fieldValue } : s)),
    );
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const sequenceDuplicates = new Set(
    value
      .map((s) => s.sequence)
      .filter((seq, i, arr) => arr.indexOf(seq) !== i),
  );

  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-4">
        The production steps this garment goes through, in order. Sequence
        numbers must be unique; leave gaps (10, 20, 30…) so steps can be
        inserted later.
      </p>

      {value.length === 0 ? (
        <div className="empty-state py-10! mb-4">
          <Workflow className="w-6 h-6 text-slate-300" />
          <p className="text-sm text-on-surface-variant">
            No workflow steps yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {value.map((step, index) => (
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
                type="number"
                value={step.sequence}
                onChange={(e) =>
                  handleFieldChange(index, "sequence", Number(e.target.value))
                }
                className={`w-20 px-3 py-2 bg-white rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  sequenceDuplicates.has(step.sequence)
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
              />
              <input
                type="text"
                value={step.step}
                onChange={(e) =>
                  handleFieldChange(index, "step", e.target.value)
                }
                placeholder="Step name (e.g. Cutting)"
                className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={step.requiredSkill}
                onChange={(e) =>
                  handleFieldChange(index, "requiredSkill", e.target.value)
                }
                disabled={skillsLoading}
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select skill</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.5"
                value={step.estimatedDurationHours ?? ""}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "estimatedDurationHours",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Hours"
                className="w-24 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
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
          value={draft.step}
          onChange={(e) => setDraft((d) => ({ ...d, step: e.target.value }))}
          placeholder="Step name (e.g. Cutting)"
          className="flex-1 px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={draft.requiredSkill}
          onChange={(e) =>
            setDraft((d) => ({ ...d, requiredSkill: e.target.value }))
          }
          disabled={skillsLoading}
          className="px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">
            {skillsLoading ? "Loading skills…" : "Select skill"}
          </option>
          {skills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.5"
          value={draft.estimatedDurationHours}
          onChange={(e) =>
            setDraft((d) => ({ ...d, estimatedDurationHours: e.target.value }))
          }
          placeholder="Hours"
          className="w-24 px-3 py-2 bg-slate-50 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
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
      {stepTaken && (
        <p className="mt-1.5 text-xs text-red-600">
          That step name already exists.
        </p>
      )}
    </div>
  );
};

export default WorkflowBuilder;

import { useState } from "react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import * as inventoryCategoryService from "../../services/inventoryCategoryService";

// Shared add/rename modal for both top-level categories and subcategories —
// which one it creates is entirely determined by `parentCategoryId` (null
// means top-level), the form itself doesn't distinguish.
const CategoryFormModal = ({ mode, category, parentCategoryId, onClose, onSaved }) => {
  const isEdit = mode === "edit";
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        await inventoryCategoryService.updateCategory(category._id, {
          name: name.trim(),
          description: description.trim(),
        });
        toast.success("Category updated successfully");
      } else {
        await inventoryCategoryService.createCategory({
          name: name.trim(),
          description: description.trim(),
          parentCategoryId: parentCategoryId || undefined,
        });
        toast.success("Category created successfully");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Rename Category" : "New Category"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Buttons"
            className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              error ? "border-red-400" : "border-transparent"
            }`}
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional"
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;

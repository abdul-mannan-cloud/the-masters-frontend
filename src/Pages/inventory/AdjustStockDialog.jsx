import { useState } from "react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import * as inventoryService from "../../services/inventoryService";

const ACTIONS = [
  { type: "Purchase", label: "Purchase Stock", hint: "Increases stock" },
  { type: "Increase", label: "Manual Increase", hint: "Increases stock" },
  { type: "Decrease", label: "Manual Decrease", hint: "Decreases stock" },
  { type: "Damage", label: "Mark Damaged", hint: "Decreases stock" },
];

// "Increase"/"Decrease" are UI-only labels — both map to the backend's
// "Manual Adjustment" transactionType, direction encoded by quantity's sign.
const toTransactionType = (action) => (action === "Increase" || action === "Decrease" ? "Manual Adjustment" : action);
const toSignedQuantity = (action, quantity) => (action === "Decrease" || action === "Damage" ? -Math.abs(quantity) : Math.abs(quantity));

const AdjustStockDialog = ({ item, onClose, onAdjusted }) => {
  const [action, setAction] = useState("Purchase");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      toast.error("Enter a quantity greater than 0.");
      return;
    }

    setSaving(true);
    try {
      await inventoryService.adjustInventory(item._id, {
        transactionType: toTransactionType(action),
        quantity: toSignedQuantity(action, qty),
        remarks: remarks.trim(),
      });
      toast.success("Stock adjusted successfully.");
      onAdjusted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Adjust Stock — ${item.fabricName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Current stock: <span className="font-bold text-on-surface">{item.availableQuantity} {item.unit}</span>
        </p>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Action
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {ACTIONS.map((a) => (
              <option key={a.type} value={a.type}>
                {a.label} ({a.hint})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Quantity ({item.unit})
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Remarks
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
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
            {saving ? "Saving…" : "Confirm Adjustment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdjustStockDialog;

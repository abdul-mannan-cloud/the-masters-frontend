import { useState } from "react";
import Modal from "../../components/Modal";

const METHODS = [
  ["cash", "Cash"],
  ["easypaisa", "Easypaisa"],
  ["jazzcash", "JazzCash"],
  ["bank_transfer", "Bank Transfer"],
  ["cheque", "Cheque"],
  ["other", "Other"],
];

const PAYMENT_TYPES = [
  ["advance", "Advance"],
  ["partial", "Partial"],
  ["final", "Final"],
];

// Not a real <form> submit — this is rendered inside a Modal that portals
// into document.body, so it never sits inside the Order page's own DOM tree.
const AddPaymentDialog = ({ remainingBalance, saving, onSave, onCancel }) => {
  const [amount, setAmount] = useState(
    remainingBalance > 0 ? String(remainingBalance) : "",
  );
  const [method, setMethod] = useState("cash");
  const [paymentType, setPaymentType] = useState(
    remainingBalance > 0 ? "partial" : "final",
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    const numericAmount = Number(amount);
    if (!amount || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    onSave({ amount: numericAmount, method, paymentType, notes: notes.trim() || undefined });
  };

  return (
    <Modal title="Record Payment" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Amount (Rs.)
          </label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {remainingBalance > 0 && (
            <p className="mt-1 text-xs text-on-surface-variant">
              Remaining balance: Rs. {remainingBalance.toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Payment Type
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PAYMENT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {METHODS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {saving ? "Recording…" : "Record Payment"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPaymentDialog;

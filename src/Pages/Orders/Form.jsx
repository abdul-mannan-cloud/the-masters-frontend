import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as orderService from "../../services/orderService";
import * as customerService from "../../services/customerService";

const OrderForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    deliveryDate: "",
    discount: 0,
    discountType: "fixed",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await customerService.getAllCustomers();
        setCustomers(data);
      } catch (error) {
        toast.error("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    })();
  }, []);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }
    setSaving(true);
    try {
      const { order } = await orderService.createOrder({
        customerId: form.customerId,
        deliveryDate: form.deliveryDate || undefined,
        discount: Number(form.discount) || 0,
        discountType: form.discountType,
        notes: form.notes,
      });
      toast.success("Order created successfully");
      navigate(`/orders/${order._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-primary font-headline">New Order</h1>
            <p className="text-stone-400 mt-1 text-sm">
              Order items are added once the order is created.
            </p>
          </div>
        </div>

        <div
          className="bg-surface-container-lowest rounded-2xl p-8"
          style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.06)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Customer
              </label>
              <select
                required
                value={form.customerId}
                onChange={handleChange("customerId")}
                disabled={loadingCustomers}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              >
                <option value="">
                  {loadingCustomers ? "Loading customers…" : "Select a customer"}
                </option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} · {c.phone}
                  </option>
                ))}
              </select>
              {!loadingCustomers && customers.length === 0 && (
                <p className="mt-2 text-xs text-stone-400">
                  No customers yet —{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/customers/new")}
                    className="text-primary font-bold hover:underline"
                  >
                    add one first
                  </button>
                  .
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Delivery Date
              </label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={handleChange("deliveryDate")}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                  Discount
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.discount}
                  onChange={handleChange("discount")}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                  Discount Type
                </label>
                <select
                  value={form.discountType}
                  onChange={handleChange("discountType")}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                >
                  <option value="fixed">Fixed (Rs.)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={handleChange("notes")}
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="flex-1 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-all disabled:opacity-60 font-label flex items-center justify-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                )}
                {saving ? "Creating…" : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;

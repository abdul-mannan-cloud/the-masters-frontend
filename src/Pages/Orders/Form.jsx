import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, User } from "lucide-react";
import * as orderService from "../../services/orderService";
import * as customerService from "../../services/customerService";
import MeasurementsTab from "../customers/MeasurementsTab";
import OrderDraftTab from "../customers/OrderDraftTab";
import { emptyOrderDraft } from "../customers/orderDraft";
import Avatar from "../../components/Avatar";
import { formatPhone } from "../../utils/formatters";
import Spinner from "../../components/Spinner";

// "New Order" for an existing customer — a returning customer placing a
// second (or third...) order. Reuses the exact same select-products →
// take-measurements → pick-fabric experience customers/DetailPanel.jsx uses
// when registering a brand-new customer (MeasurementsTab in "create" mode
// holds local drafts, OrderDraftTab turns the included ones into order
// items), so the two flows never drift apart. The only thing this page adds
// on top is the "which customer" step, since a new-customer registration
// already knows who the customer is.
const OrderForm = () => {
  const navigate = useTenantNavigate();
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftMeasurements, setDraftMeasurements] = useState([]);
  const [orderDraft, setOrderDraft] = useState(emptyOrderDraft);

  useEffect(() => {
    (async () => {
      try {
        const data = await customerService.getAllCustomers();
        setCustomers(data);
      } catch {
        toast.error("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    })();
  }, []);

  const customer = customers.find((c) => c._id === customerId) || null;

  const handleSubmit = async () => {
    const includedItems = draftMeasurements
      .map((m, index) => ({ m, index }))
      .filter(({ m }) => m.productTypeId && orderDraft.itemsByKey[m._localKey]?.included);

    if (includedItems.length === 0) {
      toast.error("Select at least one garment to include in the order");
      return;
    }

    const measurements = draftMeasurements.map((m) => {
      const copy = { ...m };
      delete copy._localKey;
      return copy;
    });

    const items = includedItems.map(({ m, index }) => {
      const item = orderDraft.itemsByKey[m._localKey];
      const selectedOptions = Object.entries(item?.selectedOptions || {})
        .filter(([, value]) => value)
        .map(([name, value]) => ({ name, value }));
      return {
        measurementIndex: index,
        productTypeId: m.productTypeId,
        quantity: Number(item?.quantity) || 1,
        instructions: item?.instructions || undefined,
        selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
        unitPrice: item?.unitPrice !== undefined ? Number(item.unitPrice) : undefined,
        fabricId: item?.fabricId || undefined,
        requiredFabricLength:
          item?.fabricId && item?.requiredFabricLength
            ? Number(item.requiredFabricLength)
            : undefined,
      };
    });

    setSaving(true);
    try {
      const { order } = await orderService.createOrder({
        customerId,
        measurements,
        deliveryDate: orderDraft.deliveryDate || undefined,
        discount: Number(orderDraft.discount) || 0,
        discountType: orderDraft.discountType,
        notes: orderDraft.notes || undefined,
        items,
      });
      toast.success(`Order ${order.orderNumber} created`);
      navigate(`/orders/${order._id}/checkout`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface font-newsreader">
              New Order
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Select garments, take measurements, and pick fabric — the order is created
              automatically.
            </p>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
        >
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={loadingCustomers}
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">
              {loadingCustomers ? "Loading customers…" : "Select a customer"}
            </option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.customerNumber} · {c.name} · {formatPhone(c.phone)}
              </option>
            ))}
          </select>
          {!loadingCustomers && customers.length === 0 && (
            <p className="mt-2 text-xs text-on-surface-variant">
              No customers yet —{" "}
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="text-primary font-bold hover:underline"
              >
                add one first
              </button>
              .
            </p>
          )}
          {customer && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-stone-50 rounded-xl">
              <Avatar name={customer.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{customer.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {customer.customerNumber} · {formatPhone(customer.phone)}
                </p>
              </div>
            </div>
          )}
        </div>

        {customer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Garments &amp; Measurements
              </h3>
              <MeasurementsTab
                mode="create"
                gender={customer.gender}
                drafts={draftMeasurements}
                onDraftsChange={setDraftMeasurements}
              />
            </div>

            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
                Order Details
              </h3>
              <OrderDraftTab
                draftMeasurements={draftMeasurements}
                orderDraft={orderDraft}
                onChange={setOrderDraft}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="flex-1 py-3 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Spinner size="sm" tone="on-primary" />}
                {saving ? "Creating…" : "Create Order"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderForm;

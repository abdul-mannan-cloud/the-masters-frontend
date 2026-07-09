import { ShoppingCart } from "lucide-react";

// mode "create" only — lets the customer's very first order be assembled in
// the same form as their Details + Measurements, instead of a separate trip
// to the Orders module. Only measurements taken against a catalog Product
// Type are orderable (OrderItem.productTypeId is required server-side), so
// manual/custom-garment measurements are excluded from this list.
const computeTotal = (subtotal, discount, discountType) => {
  const raw =
    discountType === "percentage"
      ? subtotal - (subtotal * discount) / 100
      : subtotal - discount;
  return Math.max(0, Math.round(raw * 100) / 100);
};

const OrderDraftTab = ({ draftMeasurements, orderDraft, onChange }) => {
  const eligible = draftMeasurements.filter((m) => m.productTypeId);

  const setField = (field) => (e) =>
    onChange({ ...orderDraft, [field]: e.target.value });

  const itemFor = (localKey) =>
    orderDraft.itemsByKey[localKey] || {
      included: false,
      quantity: "1",
      instructions: "",
    };

  const updateItem = (localKey, patch) =>
    onChange({
      ...orderDraft,
      itemsByKey: {
        ...orderDraft.itemsByKey,
        [localKey]: { ...itemFor(localKey), ...patch },
      },
    });

  const subtotal = eligible.reduce((sum, m) => {
    const item = itemFor(m._localKey);
    if (!item.included) return sum;
    const qty = Number(item.quantity) || 0;
    return sum + (m.price || 0) * qty;
  }, 0);
  const discount = Number(orderDraft.discount) || 0;
  const total = computeTotal(subtotal, discount, orderDraft.discountType);
  const includedCount = eligible.filter((m) => itemFor(m._localKey).included).length;

  if (eligible.length === 0) {
    return (
      <div className="empty-state py-8!">
        <ShoppingCart className="w-6 h-6 text-stone-300" />
        <p className="text-sm text-on-surface-variant text-center">
          Add a garment measurement against a Product Type first — only
          catalog measurements can be added to an order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Garments to Order
        </p>
        <div className="space-y-2">
          {eligible.map((m) => {
            const item = itemFor(m._localKey);
            return (
              <div key={m._localKey} className="p-3 bg-stone-50 rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={(e) =>
                      updateItem(m._localKey, { included: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="flex-1 text-sm font-bold text-on-surface">
                    {m.garmentType}
                    {m.label && (
                      <span className="font-normal text-on-surface-variant">
                        {" "}
                        · {m.label}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Rs. {m.price?.toLocaleString()}
                  </span>
                </label>

                {item.included && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pl-6.5">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(m._localKey, { quantity: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) =>
                          updateItem(m._localKey, { instructions: e.target.value })
                        }
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {includedCount > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Delivery Date
              </label>
              <input
                type="date"
                value={orderDraft.deliveryDate}
                onChange={setField("deliveryDate")}
                className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Discount
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={orderDraft.discount}
                  onChange={setField("discount")}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={orderDraft.discountType}
                  onChange={setField("discountType")}
                  className="px-2 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="fixed">Rs.</option>
                  <option value="percentage">%</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Order Notes
            </label>
            <textarea
              value={orderDraft.notes}
              onChange={setField("notes")}
              rows={2}
              className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm font-bold text-on-surface-variant">
              Order Total
            </span>
            <span className="text-lg font-bold text-primary">
              Rs. {total.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDraftTab;

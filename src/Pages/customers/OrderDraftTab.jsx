import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import * as productTypeService from "../../services/productTypeService";
import * as inventoryService from "../../services/inventoryService";
import { usePermission } from "../../hooks/usePermission";

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
  const canAdjustPrice = usePermission("orders", "update");
  const canPickFabric = usePermission("inventory", "view");
  const [productTypes, setProductTypes] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const eligible = draftMeasurements.filter((m) => m.productTypeId);

  useEffect(() => {
    if (eligible.length === 0) return;
    (async () => {
      try {
        const data = await productTypeService.getAllProductTypes({
          isActive: "true",
          limit: 100,
        });
        setProductTypes(data.data);
      } catch {
        toast.error("Failed to load product options");
      }
    })();
  }, [eligible.length]);

  useEffect(() => {
    if (eligible.length === 0 || !canPickFabric) return;
    (async () => {
      try {
        const data = await inventoryService.getAllInventory({ isActive: "true", limit: 200 });
        setFabrics(data.data);
      } catch {
        // fabric picker is optional — a failed fetch shouldn't block ordering
      }
    })();
  }, [eligible.length, canPickFabric]);

  const productTypeFor = (id) => productTypes.find((pt) => pt._id === id);
  const fabricFor = (id) => fabrics.find((f) => f._id === id);

  const setField = (field) => (e) =>
    onChange({ ...orderDraft, [field]: e.target.value });

  const itemFor = (m) => {
    const pt = productTypeFor(m.productTypeId);
    return (
      orderDraft.itemsByKey[m._localKey] || {
        included: false,
        quantity: "1",
        instructions: "",
        selectedOptions: {},
        unitPrice: String(pt?.basePrice ?? m.price ?? ""),
        fabricId: "",
        requiredFabricLength: "",
      }
    );
  };

  const updateItem = (m, patch) =>
    onChange({
      ...orderDraft,
      itemsByKey: {
        ...orderDraft.itemsByKey,
        [m._localKey]: { ...itemFor(m), ...patch },
      },
    });

  const setOption = (m, optionName, value) => {
    const item = itemFor(m);
    updateItem(m, {
      selectedOptions: { ...item.selectedOptions, [optionName]: value },
    });
  };

  const lineTotal = (m) => {
    const item = itemFor(m);
    if (!item.included) return 0;
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return qty * price;
  };

  const subtotal = eligible.reduce((sum, m) => sum + lineTotal(m), 0);
  const discount = Number(orderDraft.discount) || 0;
  const total = computeTotal(subtotal, discount, orderDraft.discountType);
  const includedCount = eligible.filter((m) => itemFor(m).included).length;

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
            const item = itemFor(m);
            const productType = productTypeFor(m.productTypeId);
            return (
              <div key={m._localKey} className="p-3 bg-stone-50 rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={(e) => updateItem(m, { included: e.target.checked })}
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
                    Rs. {(productType?.basePrice ?? m.price)?.toLocaleString()}
                  </span>
                </label>

                {item.included && (
                  <div className="mt-3 pl-6.5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(m, { quantity: e.target.value })}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                          Price (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          disabled={!canAdjustPrice}
                          onChange={(e) => updateItem(m, { unitPrice: e.target.value })}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:bg-stone-100"
                          title={
                            canAdjustPrice
                              ? "Adjust the price for this garment"
                              : "You don't have permission to adjust prices"
                          }
                        />
                      </div>
                    </div>

                    {productType?.options?.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {productType.options.map((option) => (
                          <div key={option.name}>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                              {option.name}
                            </label>
                            <select
                              value={item.selectedOptions[option.name] || ""}
                              onChange={(e) => setOption(m, option.name, e.target.value)}
                              className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">— Select —</option>
                              {option.values.map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    {canPickFabric && fabrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                            Fabric (optional)
                          </label>
                          <select
                            value={item.fabricId}
                            onChange={(e) =>
                              updateItem(m, {
                                fabricId: e.target.value,
                                requiredFabricLength: e.target.value ? item.requiredFabricLength : "",
                              })
                            }
                            className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">— None —</option>
                            {fabrics.map((f) => (
                              <option key={f._id} value={f._id}>
                                {f.fabricName}
                                {f.color ? ` · ${f.color}` : ""} — {f.availableQuantity} {f.unit} available
                              </option>
                            ))}
                          </select>
                        </div>
                        {item.fabricId && (
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                              Required Length ({fabricFor(item.fabricId)?.unit})
                            </label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.requiredFabricLength}
                              onChange={(e) => updateItem(m, { requiredFabricLength: e.target.value })}
                              placeholder="e.g. 2.75"
                              className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        )}
                        {item.fabricId &&
                          item.requiredFabricLength &&
                          (() => {
                            const fabric = fabricFor(item.fabricId);
                            const needed =
                              (Number(item.requiredFabricLength) || 0) * (Number(item.quantity) || 1);
                            if (!fabric || needed <= fabric.availableQuantity) return null;
                            return (
                              <p className="col-span-2 text-xs font-bold text-red-600">
                                Insufficient inventory for selected fabric. Only {fabric.availableQuantity}{" "}
                                {fabric.unit} available, {needed} {fabric.unit} needed.
                              </p>
                            );
                          })()}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => updateItem(m, { instructions: e.target.value })}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="text-right text-xs text-on-surface-variant">
                      Line total:{" "}
                      <span className="font-bold text-on-surface">
                        Rs. {lineTotal(m).toLocaleString()}
                      </span>
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

          <div className="space-y-1 p-3 bg-primary/5 rounded-xl">
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface-variant">
                Order Total
              </span>
              <span className="text-lg font-bold text-primary">
                Rs. {total.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDraftTab;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft, User, CreditCard } from "lucide-react";
import * as orderService from "../../services/orderService";
import StatusBadge from "../../components/StatusBadge";
import { usePermission } from "../../hooks/usePermission";
import { formatPhone } from "../../utils/formatters";

const Checkout = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const canAdjustDiscount = usePermission("orders", "update");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discount, setDiscount] = useState("0");
  const [discountType, setDiscountType] = useState("fixed");
  const [savingDiscount, setSavingDiscount] = useState(false);

  const fetchCheckout = async () => {
    try {
      setLoading(true);
      const checkout = await orderService.getCheckout(id);
      setData(checkout);
      setDiscount(String(checkout.order.discount));
      setDiscountType(checkout.order.discountType);
    } catch {
      toast.error("Failed to load checkout");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCheckout();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveDiscount = async () => {
    setSavingDiscount(true);
    try {
      await orderService.applyDiscount(id, {
        discount: Number(discount) || 0,
        discountType,
      });
      toast.success("Discount updated");
      setEditingDiscount(false);
      await fetchCheckout();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update discount");
    } finally {
      setSavingDiscount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { order, customer, items } = data;

  return (
    <div className="p-8 font-body">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
              Checkout
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Order {order.orderNumber}
            </p>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl overflow-hidden mb-6"
          style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.06)" }}
        >
          <div className="p-6 border-b border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-headline flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <p className="text-base font-bold text-on-surface">{customer.name}</p>
            <p className="text-sm text-on-surface-variant">
              {customer.customerNumber} · {formatPhone(customer.phone)}
            </p>
          </div>

          <div className="p-6 border-b border-stone-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-headline">
              Items
            </h3>
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-on-surface">{item.garmentType}</p>
                  <p className="text-xs text-on-surface-variant">
                    Qty: {item.quantity} · Price: Rs. {item.unitPrice.toLocaleString()}
                    {item.selectedOptions?.length > 0 && (
                      <>
                        {" · "}
                        {item.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(", ")}
                      </>
                    )}
                  </p>
                </div>
                <p className="text-sm font-bold text-on-surface">
                  Rs. {item.subtotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium text-on-surface">
                Rs. {order.subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Discount</span>
              {editingDiscount ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-24 px-2 py-1 bg-stone-50 rounded-lg border border-stone-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="fixed">Rs.</option>
                    <option value="percentage">%</option>
                  </select>
                  <button
                    onClick={handleSaveDiscount}
                    disabled={savingDiscount}
                    className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    {savingDiscount ? "…" : "Save"}
                  </button>
                </div>
              ) : (
                <span
                  className={`font-medium text-on-surface ${canAdjustDiscount ? "cursor-pointer hover:text-primary" : ""}`}
                  onClick={() => canAdjustDiscount && setEditingDiscount(true)}
                >
                  {order.discountType === "percentage"
                    ? `${order.discount}%`
                    : `Rs. ${order.discount.toLocaleString()}`}
                  {canAdjustDiscount && (
                    <span className="ml-1.5 text-xs text-primary">Edit</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="font-bold text-on-surface">Grand Total</span>
              <span className="text-lg font-bold text-primary">
                Rs. {order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-headline">
            Payment Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-on-surface-variant">Paid</p>
              <p className="font-bold text-on-surface">
                Rs. {data.totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Remaining</p>
              <p className="font-bold text-on-surface">
                Rs. {data.remainingBalance.toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-on-surface-variant mb-1">Payment Status</p>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/orders/${id}`)}
          className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default Checkout;

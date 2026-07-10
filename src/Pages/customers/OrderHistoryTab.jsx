import { useEffect, useState } from "react";
import { toast } from "sonner";
import { History } from "lucide-react";
import * as orderService from "../../services/orderService";
import StatusBadge from "../../components/StatusBadge";
import OrderItemCard from "../orders/OrderItemCard";

// The customer's complete order history, embedded directly in their profile —
// select any past order to see exactly what was billed, measured, and
// assigned for it, without leaving the Customer Details page. Every item's
// measurement is the fixed historical document it was created with (see
// OrderService.getOrderDetails), never the customer's current measurements.
const OrderHistoryTab = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await orderService.getAllOrders({ customerId });
        setOrders(data);
      } catch {
        toast.error("Failed to fetch order history");
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  const handleSelect = async (orderId) => {
    if (selectedId === orderId) {
      setSelectedId(null);
      setDetails(null);
      return;
    }
    setSelectedId(orderId);
    setLoadingDetails(true);
    try {
      const data = await orderService.getOrderDetails(orderId);
      setDetails(data);
    } catch {
      toast.error("Failed to fetch order details");
      setSelectedId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state py-8!">
        <History className="w-6 h-6 text-stone-300" />
        <p className="text-sm text-on-surface-variant">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* A literal wide table doesn't fit this panel's narrow width — every
          column from the spec (Order #, Order Date, Delivery Date, Order
          Status, Payment Status, Grand Total) is still shown, just stacked
          into a compact two-line row instead of forcing horizontal scroll. */}
      <div className="space-y-1.5">
        {orders.map((order) => (
          <button
            key={order._id}
            type="button"
            onClick={() => handleSelect(order._id)}
            className={`w-full text-left p-3 rounded-xl border transition-colors ${
              order._id === selectedId
                ? "bg-primary/5 border-primary/20"
                : "bg-stone-50 border-transparent hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-primary">{order.orderNumber}</span>
              <span className="text-sm font-bold text-on-surface">
                Rs. {order.total?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-xs text-on-surface-variant">
                {new Date(order.orderDate).toLocaleDateString()}
                {order.deliveryDate &&
                  ` · Delivery ${new Date(order.deliveryDate).toLocaleDateString()}`}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <StatusBadge status={order.productionStatus} />
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="p-4 bg-stone-50 rounded-xl space-y-4">
          {loadingDetails ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : details ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {details.order.orderNumber}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Placed {new Date(details.order.orderDate).toLocaleDateString()}
                    {details.order.deliveryDate &&
                      ` · Delivery ${new Date(details.order.deliveryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={details.order.productionStatus} />
                  <StatusBadge status={details.order.paymentStatus} />
                </div>
              </div>

              <div className="space-y-2">
                {details.items.map((item) => (
                  <OrderItemCard key={item._id} item={item} />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200 text-sm">
                <div>
                  <p className="text-xs text-on-surface-variant">Grand Total</p>
                  <p className="font-bold text-on-surface">
                    Rs. {details.order.total.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Paid</p>
                  <p className="font-bold text-emerald-700">
                    Rs. {details.paymentSummary.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Remaining</p>
                  <p className="font-bold text-on-surface">
                    Rs. {details.paymentSummary.remainingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryTab;

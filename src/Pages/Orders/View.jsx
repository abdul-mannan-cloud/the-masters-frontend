import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as orderService from "../../services/orderService";
import * as customerService from "../../services/customerService";

const PRODUCTION_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "delivered",
  "cancelled",
];

const TERMINAL_STATUSES = ["completed", "delivered", "cancelled"];

const OrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      setOrder(orderData);
      const customerData = await customerService.getCustomerById(orderData.customerId);
      setCustomer(customerData);
    } catch (error) {
      toast.error("Failed to fetch order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (productionStatus) => {
    setUpdating(true);
    try {
      const { order: updated } = await orderService.updateOrder(id, {
        productionStatus,
      });
      setOrder(updated);
      toast.success("Order status updated");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await orderService.deleteOrder(id);
      toast.success("Order deleted successfully");
      navigate("/orders");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!order || !customer) return null;

  const locked = TERMINAL_STATUSES.includes(order.productionStatus);

  return (
    <div className="p-8 font-body">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">
            {order.orderNumber}
          </h1>
          <p className="text-stone-400 mt-1 text-sm">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-stone-400 hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
          title="Delete order"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="bg-surface-container-lowest rounded-2xl p-6"
          style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.04)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">
            Customer
          </h3>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-base font-extrabold text-on-secondary-fixed flex-shrink-0 font-headline">
              {customer.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-bold text-on-surface">{customer.name}</p>
              <p className="text-sm text-stone-400">{customer.phone}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/customers/${customer._id}`)}
            className="w-full py-2.5 text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors font-label"
          >
            View Customer Profile
          </button>
        </div>

        <div
          className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6"
          style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.04)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">
            Order Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-stone-400 font-label">Subtotal</p>
              <p className="font-bold text-on-surface">Rs. {order.subtotal?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 font-label">Discount</p>
              <p className="font-bold text-on-surface">
                {order.discountType === "percentage"
                  ? `${order.discount}%`
                  : `Rs. ${order.discount?.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 font-label">Total</p>
              <p className="font-bold text-primary text-lg">Rs. {order.total?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 font-label">Payment Status</p>
              <span className="status-badge bg-secondary-container text-on-secondary-container capitalize">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/10">
            <p className="text-xs text-stone-400 font-label mb-2">Production Status</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCTION_STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={updating || locked || status === order.productionStatus}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors font-label disabled:opacity-40 ${
                    status === order.productionStatus
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
            {locked && (
              <p className="mt-2 text-xs text-stone-400">
                This order is {order.productionStatus} and can no longer be modified.
              </p>
            )}
          </div>

          {order.notes && (
            <div className="mt-6 pt-4 border-t border-outline-variant/10">
              <p className="text-xs text-stone-400 font-label mb-1">Notes</p>
              <p className="text-sm text-on-surface">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderView;

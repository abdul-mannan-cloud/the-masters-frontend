import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import * as orderService from "../../services/orderService";
import * as customerService from "../../services/customerService";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";

const PRODUCTION_STATUSES = ["pending", "in_progress", "completed", "delivered", "cancelled"];
const TERMINAL_STATUSES = ["completed", "delivered", "cancelled"];

const OrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      setOrder(orderData);
      const customerData = await customerService.getCustomerById(orderData.customerId);
      setCustomer(customerData);
    } catch {
      toast.error("Failed to fetch order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDetails();
    })();
  }, [id]);

  const handleStatusChange = async (productionStatus) => {
    setUpdating(true);
    try {
      const { order: updated } = await orderService.updateOrder(id, { productionStatus });
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
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">
            {order.orderNumber}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete order"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5 font-headline">
            Customer
          </h3>
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={customer.name} size="lg" />
            <div>
              <p className="font-bold text-on-surface">{customer.name}</p>
              <p className="text-sm text-on-surface-variant">{customer.phone}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/customers/${customer._id}`)}
            className="w-full py-2.5 text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
          >
            View Customer Profile
          </button>
        </div>

        <div
          className="lg:col-span-2 bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5 font-headline">
            Order Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-on-surface-variant">Subtotal</p>
              <p className="font-bold text-on-surface">Rs. {order.subtotal?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Discount</p>
              <p className="font-bold text-on-surface">
                {order.discountType === "percentage"
                  ? `${order.discount}%`
                  : `Rs. ${order.discount?.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Total</p>
              <p className="font-bold text-primary text-lg">Rs. {order.total?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Payment Status</p>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-on-surface-variant mb-2">Production Status</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCTION_STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={updating || locked || status === order.productionStatus}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors disabled:opacity-40 ${
                    status === order.productionStatus
                      ? "bg-primary text-on-primary"
                      : "border border-slate-200 text-on-surface-variant hover:bg-slate-50"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
            {locked && (
              <p className="mt-2 text-xs text-on-surface-variant">
                This order is {order.productionStatus} and can no longer be modified.
              </p>
            )}
          </div>

          {order.notes && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-on-surface-variant mb-1">Notes</p>
              <p className="text-sm text-on-surface">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderView;

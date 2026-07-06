import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as orderService from "../../services/orderService";
import * as customerService from "../../services/customerService";

const productionBadge = {
  pending: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  in_progress: "bg-secondary-container text-on-secondary-container",
  completed: "bg-primary-fixed text-on-primary-fixed-variant",
  delivered: "bg-primary text-on-primary",
  cancelled: "bg-error-container text-on-error-container",
};

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customersById, setCustomersById] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, customersData] = await Promise.all([
        orderService.getAllOrders(
          statusFilter ? { productionStatus: statusFilter } : {},
        ),
        customerService.getAllCustomers(),
      ]);
      setOrders(ordersData);
      setCustomersById(
        Object.fromEntries(customersData.map((c) => [c._id, c])),
      );
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await orderService.deleteOrder(id);
      toast.success("Order deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete order");
    }
  };

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders],
  );

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">
            Orders
          </h1>
          <p className="text-stone-400 mt-1 text-sm">
            {orders.length} orders · Rs. {totalRevenue.toLocaleString()} total
          </p>
        </div>
        <button
          onClick={() => navigate("/orders/new")}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors font-label"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Order
        </button>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body font-medium"
        >
          <option value="">All Production Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div
        className="bg-surface-container-lowest rounded-xl overflow-hidden"
        style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.04)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Production</th>
                <th>Payment</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined text-[28px] text-stone-300">
                          receipt_long
                        </span>
                      </div>
                      <p className="text-sm font-bold text-stone-400 font-headline">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td
                      className="font-bold text-primary cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      {order.orderNumber}
                    </td>
                    <td className="text-on-surface">
                      {customersById[order.customerId]?.name || "—"}
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="font-bold text-on-surface">
                      Rs. {order.total?.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`status-badge capitalize ${productionBadge[order.productionStatus] || ""}`}
                      >
                        {order.productionStatus?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge bg-secondary-container text-on-secondary-container capitalize">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                          title="View"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 text-stone-400 hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;

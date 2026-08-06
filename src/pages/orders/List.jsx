import { useEffect, useMemo, useState, useCallback } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Eye, Trash2, ReceiptText } from "lucide-react";
import * as orderService from "../../services/orderService";
import * as customerService from "../../services/customerService";
import StatusBadge from "../../components/StatusBadge";
import { usePermission } from "../../hooks/usePermission";
import { SkeletonTableRows } from "../../components/Skeleton";

const OrderList = () => {
  const navigate = useTenantNavigate();
  const canCreate = usePermission("orders", "create");
  const canDelete = usePermission("orders", "delete");
  const [orders, setOrders] = useState([]);
  const [customersById, setCustomersById] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
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
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [fetchData]);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Orders
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {orders.length} orders · Rs. {totalRevenue.toLocaleString()} total
          </p>
        </div>
        {canCreate && (
          <motion.button
            onClick={() => navigate("/orders/new")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Order
          </motion.button>
        )}
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-medium"
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
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Date</th>
                <th>Total</th>
                <th>Production</th>
                <th>Payment</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={8} />
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <ReceiptText className="w-7 h-7 text-stone-300" />
                      </div>
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No orders found
                      </p>
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
                    <td className="text-on-surface-variant max-w-56">
                      {order.items?.length > 0 ? (
                        <span className="text-xs">
                          {order.items
                            .slice(0, 2)
                            .map((i) => i.garmentType)
                            .join(", ")}
                          {order.items.length > 2 && (
                            <span className="text-on-surface-variant/70">
                              {" "}
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="font-bold text-on-surface">
                      Rs. {order.total?.toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={order.productionStatus} />
                    </td>
                    <td>
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

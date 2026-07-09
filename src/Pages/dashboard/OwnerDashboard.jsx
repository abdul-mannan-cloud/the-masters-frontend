import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import {
  UserCog,
  Users,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Wallet,
  Plus,
  UserPlus,
} from "lucide-react";
import * as dashboardService from "../../services/dashboardService";
import KpiCard from "../../components/KpiCard";
import StatusBadge from "../../components/StatusBadge";

const OwnerDashboard = () => {
  const navigate = useTenantNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getTenantOwnerDashboard();
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard icon={UserCog} label="Total Employees" value={stats.totalEmployees} onClick={() => navigate("/employees")} />
        <KpiCard icon={Users} label="Total Customers" value={stats.totalCustomers} onClick={() => navigate("/customers")} />
        <KpiCard icon={ShoppingCart} label="Active Orders" value={stats.activeOrders} onClick={() => navigate("/orders")} />
        <KpiCard icon={CheckCircle2} label="Completed Orders" value={stats.completedOrders} onClick={() => navigate("/orders")} />
        <KpiCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} onClick={() => navigate("/orders")} />
        <KpiCard
          icon={Wallet}
          label="Monthly Revenue"
          value={`Rs. ${stats.monthlyRevenue.toLocaleString()}`}
        />
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate("/customers")}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
        <button
          onClick={() => navigate("/orders/new")}
          className="flex items-center gap-2 border border-primary/30 text-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
      >
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline">
            Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <ShoppingCart className="w-7 h-7 text-stone-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No orders yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order._id} onClick={() => navigate(`/orders/${order._id}`)}>
                    <td className="font-bold text-on-surface">{order.orderNumber}</td>
                    <td className="text-on-surface-variant">
                      {order.customerId?.name || "—"}
                    </td>
                    <td className="text-on-surface-variant">
                      Rs. {order.total?.toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={order.productionStatus} />
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString()}
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

export default OwnerDashboard;

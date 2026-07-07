import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, ShoppingCart, CheckCircle2, Clock, Plus, UserPlus } from "lucide-react";
import * as customerService from "../services/customerService";
import * as orderService from "../services/orderService";
import KpiCard from "../components/KpiCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState(0);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [customers, ordersData] = await Promise.all([
          customerService.getAllCustomers(),
          orderService.getAllOrders(),
        ]);
        setCustomerCount(customers.length);
        setOrders(ordersData);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingOrders = orders.filter((o) => o.productionStatus === "pending").length;
  const completedOrders = orders.filter((o) => o.productionStatus === "completed").length;

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
        <KpiCard icon={Users} label="Total Clients" value={customerCount} onClick={() => navigate("/customers")} />
        <KpiCard icon={ShoppingCart} label="Total Orders" value={orders.length} onClick={() => navigate("/orders")} />
        <KpiCard icon={CheckCircle2} label="Completed" value={completedOrders} onClick={() => navigate("/orders")} />
        <KpiCard icon={Clock} label="Pending Orders" value={pendingOrders} onClick={() => navigate("/orders")} />
      </div>

      <div className="flex gap-3">
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
    </div>
  );
};

export default Dashboard;

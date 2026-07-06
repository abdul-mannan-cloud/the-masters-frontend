import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as customerService from "../services/customerService";
import * as orderService from "../services/orderService";

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
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingOrders = orders.filter((o) => o.productionStatus === "pending").length;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="bg-primary rounded-2xl p-6 text-on-primary cursor-pointer"
          onClick={() => navigate("/orders")}
          style={{ boxShadow: "0 12px 40px rgba(25,83,0,0.18)" }}
        >
          <p className="text-on-primary/70 text-sm mb-1 font-label">Total Revenue</p>
          <h2 className="text-3xl font-extrabold font-headline">Rs. {revenue.toLocaleString()}</h2>
        </div>
        <div
          className="bg-surface-container-lowest rounded-2xl p-6 cursor-pointer"
          onClick={() => navigate("/orders")}
          style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.04)" }}
        >
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label mb-2">
            Orders
          </p>
          <h3 className="text-3xl font-extrabold text-on-surface font-headline">{orders.length}</h3>
          <p className="text-xs text-stone-400 mt-1">{pendingOrders} pending</p>
        </div>
        <div
          className="bg-surface-container-lowest rounded-2xl p-6 cursor-pointer"
          onClick={() => navigate("/customers")}
          style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.04)" }}
        >
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label mb-2">
            Customers
          </p>
          <h3 className="text-3xl font-extrabold text-on-surface font-headline">{customerCount}</h3>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/customers/new")}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors font-label"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Customer
        </button>
        <button
          onClick={() => navigate("/orders/new")}
          className="flex items-center gap-2 border border-primary/30 text-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/5 transition-colors font-label"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Order
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

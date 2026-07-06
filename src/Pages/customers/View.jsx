import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as customerService from "../../services/customerService";
import * as orderService from "../../services/orderService";

const CustomerView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [customerData, ordersData] = await Promise.all([
        customerService.getCustomerById(id),
        orderService.getAllOrders({ customerId: id }),
      ]);
      setCustomer(customerData);
      setOrders(ordersData);
    } catch (error) {
      toast.error("Failed to fetch customer details");
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  const initials =
    customer.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="p-8 font-body">
      <button
        onClick={() => navigate("/customers")}
        className="flex items-center gap-2 text-stone-400 hover:text-primary text-sm font-medium mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back to Customers
      </button>

      <div
        className="bg-surface-container-lowest rounded-xl overflow-hidden"
        style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.06)" }}
      >
        <div className="bg-primary p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-on-primary flex-shrink-0 font-headline">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-on-primary font-headline">
                {customer.name}
              </h1>
              <p className="text-on-primary/60 text-sm mt-1">
                Member since {new Date(customer.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => navigate(`/customers/${id}/edit`)}
                className="mt-3 text-xs font-bold text-on-primary border border-white/30 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors font-label"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "call", label: "Phone", value: customer.phone },
              { icon: "mail", label: "Email", value: customer.email || "—" },
              {
                icon: "location_on",
                label: "Address",
                value: customer.address || "—",
              },
              { icon: "wc", label: "Gender", value: customer.gender || "—" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-label">{label}</p>
                  <p className="font-bold text-on-surface text-sm capitalize">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {customer.notes && (
            <div className="mt-6 pt-6 border-t border-outline-variant/10">
              <p className="text-xs text-stone-400 font-label mb-1">Notes</p>
              <p className="text-sm text-on-surface">{customer.notes}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline mb-4">
              Order History
            </h2>
            <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
              <table className="w-full masters-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Production</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-stone-400"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        <td className="font-bold text-primary">
                          {order.orderNumber}
                        </td>
                        <td className="text-on-surface-variant">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="font-bold">
                          Rs. {order.total?.toLocaleString()}
                        </td>
                        <td>
                          <span className="status-badge bg-secondary-container text-on-secondary-container capitalize">
                            {order.productionStatus}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge bg-tertiary-fixed text-on-tertiary-fixed-variant capitalize">
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;

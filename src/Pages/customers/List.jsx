import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as customerService from "../../services/customerService";

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await customerService.deleteCustomer(id);
      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete customer");
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customers, searchQuery]);

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">
            Customers
          </h1>
          <p className="text-stone-400 mt-1 text-sm">
            Manage your atelier's client relationships.
          </p>
        </div>
        <button
          onClick={() => navigate("/customers/new")}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-container transition-all font-label"
        >
          <span className="material-symbols-outlined text-[18px]">
            person_add
          </span>
          Add Customer
        </button>
      </div>

      <div className="mb-6 max-w-md relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search by name, phone, or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
        />
      </div>

      <div
        className="bg-surface-container-lowest rounded-xl overflow-hidden"
        style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.04)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Gender</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined text-[28px] text-stone-300">
                          person_search
                        </span>
                      </div>
                      <p className="text-sm font-bold text-stone-400 font-headline">
                        No customers found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const initials =
                    customer.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "?";
                  return (
                    <tr key={customer._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-on-surface">
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-on-surface-variant">
                        {customer.phone}
                      </td>
                      <td className="text-on-surface-variant max-w-[200px] truncate">
                        {customer.address || "—"}
                      </td>
                      <td className="text-on-surface-variant capitalize">
                        {customer.gender || "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              navigate(`/customers/${customer._id}`)
                            }
                            className="p-2 text-stone-400 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                            title="View"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/customers/${customer._id}/edit`)
                            }
                            className="p-2 text-stone-400 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="p-2 text-stone-400 hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;

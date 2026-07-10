import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { Plus, Search, Eye, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import * as customerService from "../../services/customerService";
import * as orderService from "../../services/orderService";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";
import DetailPanel from "./DetailPanel";
import { formatPhone } from "../../utils/formatters";
import { usePermission } from "../../hooks/usePermission";

const CustomerList = () => {
  const navigate = useTenantNavigate();
  const { id: routeId } = useParams();
  const canCreate = usePermission("customers", "create");
  const canDelete = usePermission("customers", "delete");
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("view"); // 'view' | 'create'
  const [checkedIds, setCheckedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [ordersByCustomer, setOrdersByCustomer] = useState({});
  const [loadingOrdersFor, setLoadingOrdersFor] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      return data;
    } catch {
      toast.error("Failed to fetch customers");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCustomers();
    })();
  }, []);

  // Land on /customers with no id selected yet? Default to the first customer.
  useEffect(() => {
    if (!loading && mode !== "create" && !routeId && customers.length > 0) {
      navigate(`/customers/${customers[0]._id}`, { replace: true });
    }
  }, [loading, mode, routeId, customers, navigate]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.customerNumber?.toLowerCase().includes(q),
    );
  }, [customers, searchQuery]);

  const selectedId = mode === "create" ? null : routeId;
  const selectedCustomer = customers.find((c) => c._id === selectedId) || null;

  const handleSelect = (id) => {
    setMode("view");
    navigate(`/customers/${id}`);
  };

  const handleCreateNew = () => {
    setMode("create");
    navigate("/customers");
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (mode === "create") {
        const { customer, order } = await customerService.createCustomer(formData);
        await fetchCustomers();
        if (order) {
          // Navigating away to a different route entirely — leave `mode` as
          // "create" so the "land with no id → redirect to first customer"
          // effect below doesn't fire mid-transition and clobber this
          // navigation with its own `{ replace: true }`.
          toast.success(`Customer added — order ${order.orderNumber} created`);
          navigate(`/orders/${order._id}/checkout`);
        } else {
          setMode("view");
          toast.success("Customer added successfully");
          navigate(`/customers/${customer._id}`);
        }
      } else {
        await customerService.updateCustomer(selectedId, formData);
        toast.success("Customer updated successfully");
        await fetchCustomers();
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode !== "create") return;
    setMode("view");
    navigate(
      customers.length > 0 ? `/customers/${customers[0]._id}` : "/customers",
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await customerService.deleteCustomer(id);
      toast.success("Customer deleted successfully");
      setCheckedIds((prev) => prev.filter((cid) => cid !== id));
      const remaining = await fetchCustomers();
      if (id === selectedId) {
        setMode("view");
        navigate(
          remaining.length > 0
            ? `/customers/${remaining[0]._id}`
            : "/customers",
          {
            replace: true,
          },
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete customer");
    }
  };

  const handleBulkDelete = async () => {
    if (checkedIds.length === 0) return;
    if (!window.confirm(`Delete ${checkedIds.length} selected customer(s)?`))
      return;
    try {
      await Promise.all(
        checkedIds.map((id) => customerService.deleteCustomer(id)),
      );
      toast.success("Selected customers deleted");
      const wasSelected = checkedIds.includes(selectedId);
      setCheckedIds([]);
      const remaining = await fetchCustomers();
      if (wasSelected) {
        setMode("view");
        navigate(
          remaining.length > 0
            ? `/customers/${remaining[0]._id}`
            : "/customers",
          {
            replace: true,
          },
        );
      }
    } catch {
      toast.error("Failed to delete some customers");
    }
  };

  const toggleChecked = (id) =>
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (ordersByCustomer[id]) return;
    setLoadingOrdersFor(id);
    try {
      const data = await orderService.getAllOrders({ customerId: id });
      setOrdersByCustomer((prev) => ({ ...prev, [id]: data }));
    } catch {
      toast.error("Failed to fetch order details");
    } finally {
      setLoadingOrdersFor(null);
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Customer Directory
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Manage client details and view their order history.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-50">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or customer #…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {canDelete && (
              <button
                onClick={handleBulkDelete}
                disabled={checkedIds.length === 0}
                className="px-4 py-2.5 rounded-full text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Delete Selected
                {checkedIds.length > 0 ? ` (${checkedIds.length})` : ""}
              </button>
            )}
          </div>

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full masters-table">
                <thead>
                  <tr>
                    <th className="w-10"></th>
                    <th className="w-8"></th>
                    <th>Customer #</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
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
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-16 text-center text-on-surface-variant text-sm"
                      >
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const isExpanded = expandedId === customer._id;
                      const customerOrders = ordersByCustomer[customer._id];
                      return (
                        <Fragment key={customer._id}>
                          <tr
                            onClick={() => toggleExpand(customer._id)}
                            className={
                              customer._id === selectedId ? "bg-primary/5" : ""
                            }
                          >
                            <td onClick={(e) => e.stopPropagation()}>
                              {canDelete && (
                                <input
                                  type="checkbox"
                                  checked={checkedIds.includes(customer._id)}
                                  onChange={() => toggleChecked(customer._id)}
                                  className="w-4 h-4 accent-primary"
                                />
                              )}
                            </td>
                            <td className="text-stone-400">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </td>
                            <td className="text-on-surface-variant font-mono text-xs">
                              {customer.customerNumber || "—"}
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <Avatar name={customer.name} size="sm" />
                                <span className="font-medium text-on-surface">
                                  {customer.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-on-surface-variant">
                              {formatPhone(customer.phone)}
                            </td>
                            <td className="text-on-surface-variant max-w-50 truncate">
                              {customer.address || "—"}
                            </td>
                            <td
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSelect(customer._id)}
                                  className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                                  title="View / Edit"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(customer._id)}
                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                          </tr>
                          {isExpanded && (
                            <tr className="cursor-default hover:bg-transparent!">
                              <td colSpan="7" className="bg-stone-50 py-4">
                                {loadingOrdersFor === customer._id ? (
                                  <div className="flex justify-center py-4">
                                    <div className="w-6 h-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                  </div>
                                ) : !customerOrders || customerOrders.length === 0 ? (
                                  <p className="text-sm text-on-surface-variant text-center py-2">
                                    No orders yet for this customer.
                                  </p>
                                ) : (
                                  <div className="space-y-2 px-6">
                                    {customerOrders.map((order) => (
                                      <div
                                        key={order._id}
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-primary/5 cursor-pointer transition-colors"
                                      >
                                        <div>
                                          <p className="text-sm font-bold text-primary">
                                            {order.orderNumber}
                                          </p>
                                          <p className="text-xs text-on-surface-variant">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <p className="text-sm font-bold">
                                            Rs. {order.total?.toLocaleString()}
                                          </p>
                                          <StatusBadge status={order.productionStatus} />
                                          <StatusBadge status={order.paymentStatus} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          {selectedCustomer || mode === "create" ? (
            <DetailPanel
              key={selectedCustomer?._id ?? "create"}
              customer={selectedCustomer}
              mode={mode}
              saving={saving}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          ) : (
            <div
              className="bg-white rounded-2xl p-10 text-center text-on-surface-variant text-sm"
              style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
            >
              Select a customer to view details, or add a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;

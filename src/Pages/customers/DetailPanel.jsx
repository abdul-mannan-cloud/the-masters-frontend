import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  User,
  Trash2,
  History,
  PenSquare,
  Ruler,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";
import * as orderService from "../../services/orderService";
import MeasurementsTab from "./MeasurementsTab";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  email: "",
  gender: "",
  notes: "",
};

// Parent mounts this with `key={customer?._id ?? mode}` so a new customer
// (or switching into create mode) always starts from fresh local state,
// instead of resetting state from props inside an effect.
const DetailPanel = ({
  customer,
  mode,
  saving,
  onSave,
  onDelete,
  onCancel,
}) => {
  const navigate = useNavigate();
  const isCreate = mode === "create";
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState(() =>
    customer
      ? {
          name: customer.name || "",
          phone: customer.phone || "",
          address: customer.address || "",
          email: customer.email || "",
          gender: customer.gender || "",
          notes: customer.notes || "",
        }
      : emptyForm,
  );
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [draftMeasurements, setDraftMeasurements] = useState([]);

  useEffect(() => {
    if (tab !== "history" || !customer?._id) return;
    (async () => {
      try {
        setLoadingOrders(true);
        const data = await orderService.getAllOrders({
          customerId: customer._id,
        });
        setOrders(data);
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, [tab, customer?._id]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(isCreate ? { ...form, measurements: draftMeasurements } : form);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}
    >
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4 mb-4">
          {isCreate ? (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
          ) : (
            <Avatar name={customer?.name} />
          )}
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-on-surface font-headline truncate">
              {isCreate ? "New Client Details" : customer?.name}
            </h2>
            {!isCreate && (
              <p className="text-xs text-on-surface-variant">
                {customer?.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1 -mb-4">
          <button
            onClick={() => setTab("details")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold border-b-2 transition-colors ${
              tab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <PenSquare className="w-3.5 h-3.5" />
            Details
          </button>
          <button
            onClick={() => setTab("measurements")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold border-b-2 transition-colors ${
              tab === "measurements"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Measurements
          </button>
          {!isCreate && (
            <button
              onClick={() => setTab("history")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold border-b-2 transition-colors ${
                tab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Order History
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange("name")}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="03XX-XXXXXXX"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={handleChange("gender")}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    value={form.address}
                    onChange={handleChange("address")}
                    rows={2}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Fitting Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  rows={3}
                  placeholder="e.g. Lace back, sweetheart neckline adjustment needed"
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          )}

          {tab === "measurements" && (
            <MeasurementsTab
              mode={isCreate ? "create" : "manage"}
              customerId={customer?._id}
              drafts={draftMeasurements}
              onDraftsChange={setDraftMeasurements}
            />
          )}

          {tab === "history" && (
            <div>
              {loadingOrders ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-10">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-primary">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          Rs. {order.total?.toLocaleString()}
                        </p>
                        <StatusBadge status={order.productionStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          {!isCreate && (
            <button
              type="button"
              onClick={() => onDelete(customer._id)}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : isCreate
                ? "Save New Customer"
                : "Update Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailPanel;

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  User,
  Trash2,
  History,
  PenSquare,
  Ruler,
  ShoppingCart,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import PhoneInput from "../../components/PhoneInput";
import MeasurementsTab from "./MeasurementsTab";
import OrderDraftTab from "./OrderDraftTab";
import OrderHistoryTab from "./OrderHistoryTab";
import { emptyOrderDraft } from "./orderDraft";
import { formatPhone, isValidPhone, isValidEmail } from "../../utils/formatters";
import { usePermission } from "../../hooks/usePermission";

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
  const isCreate = mode === "create";
  const canCreate = usePermission("customers", "create");
  const canUpdate = usePermission("customers", "update");
  const canDelete = usePermission("customers", "delete");
  const canSubmit = isCreate ? canCreate : canUpdate;
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
  const [draftMeasurements, setDraftMeasurements] = useState([]);
  const [orderDraft, setOrderDraft] = useState(emptyOrderDraft);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    else if (!isValidPhone(form.phone))
      nextErrors.phone = "Enter a valid 11-digit mobile number starting with 03.";
    if (form.email && !isValidEmail(form.email))
      nextErrors.email = "Enter a valid email address.";
    if (!form.gender) nextErrors.gender = "Gender is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isCreate) {
      onSave(form);
      return;
    }

    const measurements = draftMeasurements.map((m) => {
      const copy = { ...m };
      delete copy._localKey;
      return copy;
    });

    // Order items reference a measurement by its index in the array above —
    // a brand-new customer has no other measurements to place an order for.
    const includedItems = draftMeasurements
      .map((m, index) => ({ m, index }))
      .filter(({ m }) => m.productTypeId && orderDraft.itemsByKey[m._localKey]?.included);

    const order =
      includedItems.length === 0
        ? undefined
        : {
            deliveryDate: orderDraft.deliveryDate || undefined,
            discount: Number(orderDraft.discount) || 0,
            discountType: orderDraft.discountType,
            notes: orderDraft.notes || undefined,
            items: includedItems.map(({ m, index }) => {
              const item = orderDraft.itemsByKey[m._localKey];
              const selectedOptions = Object.entries(item?.selectedOptions || {})
                .filter(([, value]) => value)
                .map(([name, value]) => ({ name, value }));
              return {
                measurementIndex: index,
                productTypeId: m.productTypeId,
                quantity: Number(item?.quantity) || 1,
                instructions: item?.instructions || undefined,
                selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
                unitPrice: item?.unitPrice !== undefined ? Number(item.unitPrice) : undefined,
                fabricId: item?.fabricId || undefined,
                requiredFabricLength:
                  item?.fabricId && item?.requiredFabricLength
                    ? Number(item.requiredFabricLength)
                    : undefined,
              };
            }),
          };

    onSave({ ...form, measurements, order });
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.06)" }}
    >
      <div className="px-6 pt-6 pb-4 border-b border-stone-100">
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
                {customer?.customerNumber} · {formatPhone(customer?.phone)}
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
          {isCreate && (
            <button
              onClick={() => setTab("order")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold border-b-2 transition-colors ${
                tab === "order"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Order
            </button>
          )}
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
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange("name")}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
                  <PhoneInput
                    value={form.phone}
                    onChange={(digits) =>
                      setForm((f) => ({ ...f, phone: digits }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  required
                  value={form.gender}
                  onChange={handleChange("gender")}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.gender ? "border-red-400" : "border-transparent"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <textarea
                    value={form.address}
                    onChange={handleChange("address")}
                    rows={2}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
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
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          )}

          {tab === "measurements" && (
            <MeasurementsTab
              mode={isCreate ? "create" : "manage"}
              customerId={customer?._id}
              gender={form.gender}
              drafts={draftMeasurements}
              onDraftsChange={setDraftMeasurements}
            />
          )}

          {tab === "order" && (
            <OrderDraftTab
              draftMeasurements={draftMeasurements}
              orderDraft={orderDraft}
              onChange={setOrderDraft}
            />
          )}

          {tab === "history" && <OrderHistoryTab customerId={customer?._id} />}
        </div>

        <div className="flex gap-2 p-6 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          {!isCreate && canDelete && (
            <button
              type="button"
              onClick={() => onDelete(customer._id)}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {canSubmit && (
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
          )}
        </div>
      </form>
    </div>
  );
};

export default DetailPanel;

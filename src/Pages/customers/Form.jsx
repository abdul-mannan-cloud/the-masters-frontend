import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as customerService from "../../services/customerService";

const emptyCustomer = {
  name: "",
  phone: "",
  address: "",
  email: "",
  gender: "",
  notes: "",
};

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await customerService.getCustomerById(id);
        setCustomer({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          email: data.email || "",
          gender: data.gender || "",
          notes: data.notes || "",
        });
      } catch (error) {
        toast.error("Failed to fetch customer details");
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (field) => (e) =>
    setCustomer((c) => ({ ...c, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await customerService.updateCustomer(id, customer);
        toast.success("Customer updated successfully");
      } else {
        await customerService.createCustomer(customer);
        toast.success("Customer added successfully");
      }
      navigate("/customers");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/customers")}
            className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[22px]">
              arrow_back
            </span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-primary font-headline">
              {isEdit ? "Edit Customer" : "Add New Customer"}
            </h1>
            <p className="text-stone-400 mt-1 text-sm">
              {isEdit ? "Update client information." : "Register a new client."}
            </p>
          </div>
        </div>

        <div
          className="bg-surface-container-lowest rounded-2xl p-8"
          style={{ boxShadow: "0 12px 40px rgba(25,28,27,0.06)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Full Name
              </label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={handleChange("name")}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Phone
              </label>
              <input
                type="text"
                required
                placeholder="03XX-XXXXXXX"
                value={customer.phone}
                onChange={handleChange("phone")}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Email
              </label>
              <input
                type="email"
                value={customer.email}
                onChange={handleChange("email")}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Gender
              </label>
              <select
                value={customer.gender}
                onChange={handleChange("gender")}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Address
              </label>
              <textarea
                value={customer.address}
                onChange={handleChange("address")}
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                Notes
              </label>
              <textarea
                value={customer.notes}
                onChange={handleChange("notes")}
                rows={2}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="flex-1 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-all disabled:opacity-60 font-label flex items-center justify-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                )}
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;

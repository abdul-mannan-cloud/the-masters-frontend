import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import * as tenantService from "../../services/tenantService";

const PLANS = ["free", "basic", "pro", "enterprise"];

const TenantForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const tenant = await tenantService.getTenantById(id);
        setBusinessName(tenant.businessName);
        setSlug(tenant.slug);
        setContactEmail(tenant.contactEmail);
        setContactPhone(tenant.contactPhone || "");
        setAddress(tenant.address || "");
        setPlan(tenant.plan);
      } catch {
        toast.error("Failed to load tenant");
        navigate("/tenants");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!businessName.trim()) nextErrors.businessName = "Business name is required.";
    if (!isEdit && !slug.trim()) nextErrors.slug = "Slug is required.";
    if (!contactEmail.trim()) nextErrors.contactEmail = "Contact email is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const payload = {
      businessName: businessName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim(),
      plan,
      ...(!isEdit && { slug: slug.trim() }),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await tenantService.updateTenant(id, payload);
        toast.success("Tenant updated successfully.");
        navigate(`/tenants/${id}`);
      } else {
        const { tenant } = await tenantService.createTenant(payload);
        toast.success("Tenant created successfully.");
        navigate(`/tenants/${tenant._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save tenant");
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/tenants")}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">
              {isEdit ? "Edit Tenant" : "Create Tenant"}
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              {isEdit
                ? "Update this business's profile."
                : "Register a new business on the platform."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.businessName ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isEdit}
                  className={`w-full px-3 py-2.5 bg-slate-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${
                    errors.slug ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.contactEmail ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.contactEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Plan
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/tenants")}
              className="flex-1 py-3 border border-slate-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
              )}
              {saving ? "Saving…" : isEdit ? "Update Tenant" : "Create Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;

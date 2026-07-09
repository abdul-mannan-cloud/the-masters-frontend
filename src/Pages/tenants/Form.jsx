import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import * as tenantService from "../../services/tenantService";
import PhoneInput from "../../components/PhoneInput";
import { isValidPhone } from "../../utils/formatters";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

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
    if (contactPhone && !isValidPhone(contactPhone))
      nextErrors.contactPhone = "Enter a valid 11-digit mobile number starting with 03.";
    if (!isEdit) {
      if (!password) nextErrors.password = "Password is required.";
      else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
      if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    }
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
      ...(!isEdit && { slug: slug.trim(), password, logo }),
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
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
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
            style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.06)" }}
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
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
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
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${
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
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
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
                <PhoneInput
                  value={contactPhone}
                  onChange={setContactPhone}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.contactPhone ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.contactPhone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Plan
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              {!isEdit && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.password ? "border-red-400" : "border-transparent"
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.confirmPassword ? "border-red-400" : "border-transparent"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
            </div>
            {!isEdit && (
              <p className="text-xs text-on-surface-variant -mt-2">
                This creates the business's first admin login, using the contact email above.
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Business Logo
                </label>
                <div className="flex items-center gap-3">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-1 text-sm file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-stone-100 file:text-on-surface file:text-xs file:font-semibold file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/tenants")}
              className="flex-1 py-3 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
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

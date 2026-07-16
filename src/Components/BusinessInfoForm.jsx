import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Building2, MessageCircle, Receipt } from "lucide-react";
import * as settingsService from "../services/settingsService";
import PhoneInput from "./PhoneInput";
import { usePermission } from "../hooks/usePermission";
import { useAuth } from "../hooks/useAuth";
import { formatPhone, isValidPhone, isValidEmail } from "../utils/formatters";
import Spinner from "./Spinner";

const emptyForm = {
  name: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  workingHours: "",
  currency: "",
  timezone: "",
  orderNumberPrefix: "",
  invoiceShowLogo: true,
  invoiceFooter: "",
  invoiceTerms: "",
  whatsappEnabled: false,
  whatsappPhoneNumberId: "",
  whatsappBusinessAccountId: "",
  whatsappAccessToken: "",
};

const formFromSettings = (data) => ({
  name: data.business?.name || "",
  ownerName: data.business?.ownerName || "",
  email: data.business?.email || "",
  phone: data.business?.phone || "",
  address: data.business?.address || "",
  workingHours: data.business?.workingHours || "",
  currency: data.business?.currency || "",
  timezone: data.business?.timezone || "",
  orderNumberPrefix: data.invoice?.orderNumberPrefix || "",
  invoiceShowLogo: data.invoice?.showLogo ?? true,
  invoiceFooter: data.invoice?.footer || "",
  invoiceTerms: data.invoice?.termsAndConditions || "",
  whatsappEnabled: data.whatsapp?.enabled ?? false,
  whatsappPhoneNumberId: data.whatsapp?.phoneNumberId || "",
  whatsappBusinessAccountId: data.whatsapp?.businessAccountId || "",
  whatsappAccessToken: "", // never echoed back from the API — write-only
});

// Full business-profile editor: Business/Owner/Contact info, Invoice
// settings, WhatsApp settings, and logo upload. Self-contained (fetches and
// saves its own data) so it can be reused as-is both on the tenant's own
// "Business Info" page and inside the super_admin Tenant view — pass
// `tenantId` for the latter, omit it to manage the caller's own tenant.
const BusinessInfoForm = ({ tenantId }) => {
  const canEdit = usePermission("settings", "update");
  const { refreshTenant } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = tenantId
        ? await settingsService.getTenantSettings(tenantId)
        : await settingsService.getSettings();
      setSettings(data);
      setForm(formFromSettings(data));
    } catch {
      toast.error("Failed to load business information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchSettings();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (form.phone && !isValidPhone(form.phone))
      nextErrors.phone = "Enter a valid 11-digit mobile number starting with 03.";
    if (form.email && !isValidEmail(form.email))
      nextErrors.email = "Enter a valid email address.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const payload = {
      business: {
        name: form.name,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        workingHours: form.workingHours,
        currency: form.currency,
        timezone: form.timezone,
      },
      invoice: {
        orderNumberPrefix: form.orderNumberPrefix,
        showLogo: form.invoiceShowLogo,
        footer: form.invoiceFooter,
        termsAndConditions: form.invoiceTerms,
      },
      whatsapp: {
        enabled: form.whatsappEnabled,
        phoneNumberId: form.whatsappPhoneNumberId,
        businessAccountId: form.whatsappBusinessAccountId,
        ...(form.whatsappAccessToken && { accessToken: form.whatsappAccessToken }),
      },
    };

    setSaving(true);
    try {
      const data = tenantId
        ? await settingsService.updateTenantSettings(tenantId, payload, logo)
        : await settingsService.updateSettings(payload, logo);
      setSettings(data.settings);
      setForm(formFromSettings(data.settings));
      setLogo(null);
      setLogoPreview(null);
      toast.success("Business information updated successfully.");
      setEditing(false);
      // Backend mirrors business.name/logo/email/phone/address onto Tenant —
      // refresh AuthContext so the Sidebar picks it up without a re-login.
      // Only relevant when editing your own tenant (no tenantId prop); the
      // super_admin editing another tenant here has no tenant of their own.
      if (!tenantId) refreshTenant();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update business information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!settings) return null;

  const logoUrl = logoPreview || settings.business?.logo;

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
          >
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Business logo"
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-on-surface-variant text-xs font-bold">
                  Logo
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Business Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-sm file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-stone-100 file:text-on-surface file:text-xs file:font-semibold file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={set("ownerName")}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Contact Number
                </label>
                <PhoneInput
                  value={form.phone}
                  onChange={(digits) => setForm((f) => ({ ...f, phone: digits }))}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.phone ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.email ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={form.workingHours}
                  onChange={set("workingHours")}
                  placeholder="Mon–Sat, 10am–8pm"
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={set("currency")}
                  placeholder="PKR"
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Timezone
                </label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={set("timezone")}
                  placeholder="Asia/Karachi"
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={set("address")}
                rows={2}
                className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Invoice Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={form.orderNumberPrefix}
                  onChange={set("orderNumberPrefix")}
                  placeholder="ORD"
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-on-surface mt-6">
                <input
                  type="checkbox"
                  checked={form.invoiceShowLogo}
                  onChange={set("invoiceShowLogo")}
                  className="w-4 h-4 accent-primary"
                />
                Show logo on invoice
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Invoice Footer
              </label>
              <textarea
                value={form.invoiceFooter}
                onChange={set("invoiceFooter")}
                rows={2}
                className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Terms &amp; Conditions
              </label>
              <textarea
                value={form.invoiceTerms}
                onChange={set("invoiceTerms")}
                rows={2}
                className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp Settings
            </h3>
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <input
                type="checkbox"
                checked={form.whatsappEnabled}
                onChange={set("whatsappEnabled")}
                className="w-4 h-4 accent-primary"
              />
              Enable WhatsApp notifications
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={form.whatsappPhoneNumberId}
                  onChange={set("whatsappPhoneNumberId")}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Business Account ID
                </label>
                <input
                  type="text"
                  value={form.whatsappBusinessAccountId}
                  onChange={set("whatsappBusinessAccountId")}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Access Token
                </label>
                <input
                  type="password"
                  value={form.whatsappAccessToken}
                  onChange={set("whatsappAccessToken")}
                  placeholder={settings.whatsapp?.accessToken ? "Leave blank to keep current token" : ""}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(formFromSettings(settings));
                setLogo(null);
                setLogoPreview(null);
                setErrors({});
              }}
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
                <Spinner size="sm" tone="on-primary" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
          >
            <div className="flex items-center gap-4 mb-4">
              {settings.business?.logo && (
                <img
                  src={settings.business.logo}
                  alt="Business logo"
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                />
              )}
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-on-surface-variant">Business Name</p>
                <p className="text-on-surface">{settings.business?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Owner Name</p>
                <p className="text-on-surface">{settings.business?.ownerName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Contact Number</p>
                <p className="text-on-surface">{formatPhone(settings.business?.phone) || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Email</p>
                <p className="text-on-surface">{settings.business?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Working Hours</p>
                <p className="text-on-surface">{settings.business?.workingHours || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Currency</p>
                <p className="text-on-surface">{settings.business?.currency || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Timezone</p>
                <p className="text-on-surface">{settings.business?.timezone || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-on-surface-variant">Address</p>
                <p className="text-on-surface">{settings.business?.address || "—"}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Invoice Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-on-surface-variant">Invoice Prefix</p>
                <p className="text-on-surface">{settings.invoice?.orderNumberPrefix || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Show Logo</p>
                <p className="text-on-surface">{settings.invoice?.showLogo ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp Configuration
            </h3>
            <p className="text-sm text-on-surface">
              {settings.whatsapp?.enabled ? "Enabled" : "Not enabled"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoForm;

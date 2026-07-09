import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Building2, MessageCircle } from "lucide-react";
import * as settingsService from "../services/settingsService";
import { useAuth } from "../hooks/useAuth";

const BusinessInfo = () => {
  const { user, permissions } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");
  const [timezone, setTimezone] = useState("");
  const [orderNumberPrefix, setOrderNumberPrefix] = useState("");

  const canEdit =
    user?.role === "super_admin" ||
    user?.role === "tenant_admin" ||
    permissions?.settings?.update === true;

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setName(data.business?.name || "");
      setAddress(data.business?.address || "");
      setPhone(data.business?.phone || "");
      setCurrency(data.business?.currency || "");
      setTimezone(data.business?.timezone || "");
      setOrderNumberPrefix(data.invoice?.orderNumberPrefix || "");
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await settingsService.updateSettings({
        business: { name, address, phone, currency, timezone },
        invoice: { orderNumberPrefix },
      });
      setSettings(data.settings);
      toast.success("Business information updated successfully.");
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update business information");
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

  if (!settings) return null;

  return (
    <div className="p-8 font-body">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
              Business Information
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Your workshop's public and invoicing details.
            </p>
          </div>
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {editing ? (
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
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
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Asia/Karachi"
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={orderNumberPrefix}
                    onChange={(e) => setOrderNumberPrefix(e.target.value)}
                    placeholder="ORD"
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
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
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditing(false)}
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
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-on-surface-variant">Business Name</p>
                  <p className="text-on-surface">{settings.business?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Contact Phone</p>
                  <p className="text-on-surface">{settings.business?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Currency</p>
                  <p className="text-on-surface">{settings.business?.currency || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Timezone</p>
                  <p className="text-on-surface">{settings.business?.timezone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Invoice Prefix</p>
                  <p className="text-on-surface">{settings.invoice?.orderNumberPrefix || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-on-surface-variant">Address</p>
                  <p className="text-on-surface">{settings.business?.address || "—"}</p>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
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
    </div>
  );
};

export default BusinessInfo;

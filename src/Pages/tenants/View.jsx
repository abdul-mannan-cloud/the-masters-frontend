import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Power, UserCog, Users, ShoppingCart, Wallet } from "lucide-react";
import * as tenantService from "../../services/tenantService";
import KpiCard from "../../components/KpiCard";
import StatusBadge from "../../components/StatusBadge";

const TenantView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenantData, statsData] = await Promise.all([
        tenantService.getTenantById(id),
        tenantService.getTenantStats(id),
      ]);
      setTenant(tenantData);
      setStats(statsData);
    } catch {
      toast.error("Failed to fetch tenant");
      navigate("/tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleStatus = async () => {
    const suspending = tenant.status === "active";
    if (
      !window.confirm(
        suspending
          ? `Suspend "${tenant.businessName}"? All of its users will be blocked from logging in.`
          : `Reactivate "${tenant.businessName}"?`,
      )
    )
      return;
    setUpdatingStatus(true);
    try {
      const { tenant: updated } = suspending
        ? await tenantService.suspendTenant(id)
        : await tenantService.activateTenant(id);
      setTenant(updated);
      toast.success(`Tenant ${suspending ? "suspended" : "activated"}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update tenant status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${tenant.businessName}"? Their historical data is kept, but the business will no longer be accessible.`,
      )
    )
      return;
    try {
      await tenantService.deleteTenant(id);
      toast.success("Tenant deleted successfully");
      navigate("/tenants");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete tenant");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/tenants")}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">
                {tenant.businessName}
              </h1>
              <StatusBadge status={tenant.status} />
            </div>
            <p className="text-on-surface-variant mt-1 text-sm">{tenant.contactEmail}</p>
          </div>
          <button
            onClick={() => navigate(`/tenants/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-colors disabled:opacity-60 ${
              tenant.status === "active"
                ? "border border-red-200 text-red-600 hover:bg-red-50"
                : "bg-primary text-on-primary hover:bg-primary-container"
            }`}
          >
            <Power className="w-4 h-4" />
            {tenant.status === "active" ? "Suspend" : "Activate"}
          </button>
          <button
            onClick={handleDelete}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <KpiCard icon={UserCog} label="Employees" value={stats.totalEmployees} />
          <KpiCard icon={Users} label="Customers" value={stats.totalCustomers} />
          <KpiCard icon={ShoppingCart} label="Orders" value={stats.totalOrders} />
          <KpiCard icon={Wallet} label="Total Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} />
        </div>

        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
            Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-on-surface-variant">Slug</p>
              <p className="text-on-surface">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Plan</p>
              <p className="text-on-surface capitalize">{tenant.plan}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Phone</p>
              <p className="text-on-surface">{tenant.contactPhone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Registered</p>
              <p className="text-on-surface">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-on-surface-variant">Address</p>
              <p className="text-on-surface">{tenant.address || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantView;

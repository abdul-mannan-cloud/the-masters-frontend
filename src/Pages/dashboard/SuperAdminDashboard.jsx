import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, CheckCircle2, Ban, Users, UserCog, UsersRound, ShoppingCart } from "lucide-react";
import * as dashboardService from "../../services/dashboardService";
import KpiCard from "../../components/KpiCard";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { staggerContainer } from "../../utils/motion";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getSuperAdminDashboard();
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        <KpiCard icon={Building2} label="Total Tenants" value={stats.totalTenants} onClick={() => navigate("/tenants")} />
        <KpiCard icon={CheckCircle2} label="Active Tenants" value={stats.activeTenants} onClick={() => navigate("/tenants")} />
        <KpiCard icon={Ban} label="Suspended Tenants" value={stats.suspendedTenants} onClick={() => navigate("/tenants")} />
        <KpiCard icon={UsersRound} label="Total Users" value={stats.totalUsers} />
        <KpiCard icon={UserCog} label="Total Employees" value={stats.totalEmployees} />
        <KpiCard icon={Users} label="Total Customers" value={stats.totalCustomers} />
        <KpiCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} />
      </motion.div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
      >
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline">
            Recent Tenant Registrations
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Slug</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTenants.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <Building2 className="w-7 h-7 text-stone-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No tenants registered yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stats.recentTenants.map((tenant) => (
                  <tr key={tenant._id} onClick={() => navigate(`/tenants/${tenant._id}`)}>
                    <td className="font-bold text-on-surface">{tenant.businessName}</td>
                    <td className="text-on-surface-variant">{tenant.slug}</td>
                    <td className="text-on-surface-variant capitalize">{tenant.plan}</td>
                    <td>
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { Clock, Loader2, CheckCircle2, CalendarDays, Info, ShieldCheck, AlertTriangle } from "lucide-react";
import * as dashboardService from "../../services/dashboardService";
import KpiCard from "../../components/KpiCard";
import StatusBadge from "../../components/StatusBadge";

const EmployeeDashboard = () => {
  const navigate = useTenantNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setFailed(false);
        const data = await dashboardService.getEmployeeDashboard();
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard data");
        setFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  // A failed fetch (missing dashboard.view permission, network error, etc.)
  // leaves stats null — render an explicit error state instead of crashing
  // on stats.roleName below.
  if (failed || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="empty-state">
          <AlertTriangle className="w-7 h-7 text-stone-300" />
          <p className="text-sm font-bold text-on-surface-variant font-headline">
            Couldn't load your dashboard
          </p>
          <p className="text-xs text-on-surface-variant text-center max-w-xs">
            You may not have permission to view this, or something went wrong. Contact your
            business owner if this keeps happening.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div
        onClick={() => navigate("/business-info")}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl p-5 mb-6 cursor-pointer hover:shadow-md transition-shadow"
        style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface font-headline">Business Information</p>
            <p className="text-xs text-on-surface-variant">View your workshop's details</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
          <ShieldCheck className="w-4 h-4" />
          {stats.roleName || "No role assigned"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <KpiCard icon={Clock} label="Pending Tasks" value={stats.pendingCount} />
        <KpiCard icon={Loader2} label="In Progress" value={stats.inProgressCount} />
        <KpiCard icon={CheckCircle2} label="Completed Tasks" value={stats.completedCount} />
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-on-surface-variant" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline">
            Today's Work
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Workflow Step</th>
                <th>Status</th>
                <th>Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {stats.todaysWork.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <CalendarDays className="w-7 h-7 text-stone-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No work assigned for today
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stats.todaysWork.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="font-bold text-on-surface">
                      {assignment.workflowStep?.step}
                    </td>
                    <td>
                      <StatusBadge status={assignment.status} />
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(assignment.assignedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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

export default EmployeeDashboard;

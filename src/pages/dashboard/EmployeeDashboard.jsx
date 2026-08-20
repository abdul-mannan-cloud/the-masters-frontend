import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  CheckCircle2,
  CalendarDays,
  Info,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import * as dashboardService from "../../services/dashboardService";
import * as orderItemAssignmentService from "../../services/orderItemAssignmentService";
import KpiCard from "../../components/KpiCard";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { staggerContainer } from "../../utils/motion";

const NEXT_STATUS = { pending: "in_progress", in_progress: "completed" };
const NEXT_STATUS_LABEL = { pending: "Start", in_progress: "Mark Completed" };

const EmployeeDashboard = () => {
  const navigate = useTenantNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboard = async () => {
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
  };

  useEffect(() => {
    (async () => {
      await fetchDashboard();
    })();
  }, []);

  const handleAdvanceStatus = async (assignmentId, nextStatus) => {
    setUpdatingId(assignmentId);
    try {
      await orderItemAssignmentService.updateMyAssignmentStatus(assignmentId, nextStatus);
      toast.success(nextStatus === "completed" ? "Task marked completed" : "Task started");
      await fetchDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
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
        style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
      >
        <KpiCard icon={Clock} label="Pending Tasks" value={stats.pendingCount} />
        <KpiCard icon={Loader2} label="In Progress" value={stats.inProgressCount} />
        <KpiCard icon={CheckCircle2} label="Completed Tasks" value={stats.completedCount} />
      </motion.div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-on-surface-variant" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline">
            My Assigned Work
          </h3>
        </div>
        {stats.assignedWork.length === 0 ? (
          <div className="empty-state">
            <ClipboardList className="w-7 h-7 text-stone-300" />
            <p className="text-sm font-bold text-on-surface-variant font-headline">
              No work assigned to you yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {stats.assignedWork.map((work) => {
              const nextStatus = NEXT_STATUS[work.assignmentStatus];
              return (
                <div
                  key={work.assignmentId}
                  className="border border-stone-100 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-on-surface">{work.orderNumber}</p>
                    <StatusBadge status={work.assignmentStatus} />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-on-surface-variant">
                      Customer: <span className="text-on-surface">{work.customerName || "—"}</span>
                    </p>
                    <p className="text-on-surface-variant">
                      Product: <span className="text-on-surface">{work.garmentType}</span>
                    </p>
                    <p className="text-on-surface-variant">
                      Your Role: <span className="text-on-surface">{work.workflowStep?.step}</span>
                    </p>
                    <p className="text-on-surface-variant flex items-center gap-1">
                      Order Status: <StatusBadge status={work.orderStatus} />
                    </p>
                    <p className="text-on-surface-variant flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Delivery:{" "}
                      <span className="text-on-surface">
                        {work.deliveryDate ? new Date(work.deliveryDate).toLocaleDateString() : "—"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/orders/${work.orderId}`)}
                      className="flex-1 py-2 text-primary text-xs font-bold border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
                    >
                      View Order
                    </button>
                    {nextStatus && (
                      <button
                        onClick={() => handleAdvanceStatus(work.assignmentId, nextStatus)}
                        disabled={updatingId === work.assignmentId}
                        className="flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-full hover:bg-primary-container transition-colors disabled:opacity-60"
                      >
                        {updatingId === work.assignmentId ? "Updating…" : NEXT_STATUS_LABEL[work.assignmentStatus]}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

import { useEffect, useState } from "react";
import { useTenantNavigate } from "../hooks/useTenantNavigate";
import { toast } from "sonner";
import { Boxes, CalendarDays, Wallet, BellRing, CheckCheck, UserX } from "lucide-react";
import * as alertService from "../services/alertService";
import Spinner from "../components/Spinner";

const TABS = [
  { value: "", label: "All" },
  { value: "inventory", label: "Inventory" },
  { value: "delivery", label: "Delivery" },
  { value: "payment", label: "Payment" },
  { value: "assignment", label: "Assignment" },
];

const TYPE_META = {
  inventory: { icon: Boxes, label: "Low Inventory", tone: "text-amber-600 bg-amber-50" },
  delivery: { icon: CalendarDays, label: "Delivery Approaching", tone: "text-primary bg-primary/10" },
  payment: { icon: Wallet, label: "Payment Remaining", tone: "text-red-600 bg-red-50" },
  assignment: { icon: UserX, label: "Unassigned Order", tone: "text-orange-600 bg-orange-50" },
};

const PRIORITY_TONE = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-stone-100 text-stone-500",
};

const Alerts = () => {
  const navigate = useTenantNavigate();
  const [tab, setTab] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async (type) => {
    try {
      setLoading(true);
      const data = await alertService.getAlerts(type ? { type } : {});
      setAlerts(data);
    } catch {
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAlerts(tab);
    })();
  }, [tab]);

  const handleView = async (alert) => {
    if (!alert.isRead) {
      alertService.markAsRead(alert._id).catch(() => {});
      setAlerts((prev) => prev.map((a) => (a._id === alert._id ? { ...a, isRead: true } : a)));
    }
    if (alert.relatedEntityType === "Order") {
      navigate(`/orders/${alert.relatedEntityId}`);
    } else if (alert.relatedEntityType === "Inventory") {
      navigate(`/inventory/${alert.relatedEntityId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      toast.success("All alerts marked as read");
    } catch {
      toast.error("Failed to mark alerts as read");
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Alerts
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {alerts.length} alert{alerts.length === 1 ? "" : "s"}
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              tab === t.value
                ? "bg-primary text-on-primary"
                : "bg-white text-on-surface-variant border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <BellRing className="w-7 h-7 text-stone-300" />
          <p className="text-sm font-bold text-on-surface-variant font-headline">
            No alerts right now
          </p>
          <p className="text-xs text-on-surface-variant text-center max-w-xs">
            You're all caught up — low stock, upcoming deliveries, and outstanding payments will
            show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const meta = TYPE_META[alert.type];
            const Icon = meta?.icon || BellRing;
            return (
              <div
                key={alert._id}
                onClick={() => handleView(alert)}
                className={`flex items-start gap-4 bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow ${
                  !alert.isRead ? "ring-1 ring-primary/20" : ""
                }`}
                style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${meta?.tone || "bg-stone-100 text-stone-500"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {meta?.label || alert.title}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${PRIORITY_TONE[alert.priority] || PRIORITY_TONE.medium}`}
                    >
                      {alert.priority}
                    </span>
                    {!alert.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Unread" />
                    )}
                  </div>
                  <p className="text-sm text-on-surface mt-1">{alert.message}</p>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Send, X } from "lucide-react";
import * as notificationService from "../services/notificationService";
import { usePermission } from "../hooks/usePermission";
import Spinner from "../components/Spinner";

// Human-in-the-loop review screen for WhatsApp notifications a tenant chose
// to hold for confirmation (Settings > WhatsApp Notifications > "Require
// confirmation before sending" — see BusinessInfoForm.jsx). The backend is
// the real gate on Send/Cancel (NotificationController.js re-checks status +
// tenant ownership on every call) — canSend here only hides the buttons for
// an account that couldn't use them anyway.
const PendingNotifications = () => {
  const canSend = usePermission("notifications", "update");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOnId, setActingOnId] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications({
        status: "pending_confirmation",
      });
      setNotifications(data.filter((n) => n.channel === "whatsapp"));
    } catch {
      toast.error("Failed to load pending notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPending();
    })();
  }, []);

  const handleSend = async (id) => {
    setActingOnId(id);
    try {
      await notificationService.sendPendingNotification(id);
      toast.success("WhatsApp message sent");
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send message");
      // Someone else may have already sent/cancelled it — resync instead of
      // leaving a stale card the user could click again.
      fetchPending();
    } finally {
      setActingOnId(null);
    }
  };

  const handleCancel = async (id) => {
    setActingOnId(id);
    try {
      await notificationService.cancelPendingNotification(id);
      toast.success("Notification cancelled");
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to cancel notification");
      fetchPending();
    } finally {
      setActingOnId(null);
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Pending WhatsApp Notifications
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Messages waiting for review before they're sent to the customer.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="xl" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <MessageCircle className="w-7 h-7 text-stone-300" />
          <p className="text-sm font-bold text-on-surface-variant font-headline">
            Nothing waiting for review right now
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
              style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
            >
              <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {n.orderId?.orderNumber ? `Order #${n.orderId.orderNumber}` : "Order"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {n.customerId?.name || "Customer"}
                    {n.customerId?.phone ? ` · ${n.customerId.phone}` : ""}
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  Awaiting review
                </span>
              </div>

              <div className="px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Message Preview
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-on-surface bg-stone-50 rounded-xl p-4">
                  {n.content}
                </pre>
              </div>

              {canSend && (
                <div className="px-5 py-3 border-t border-stone-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleCancel(n._id)}
                    disabled={actingOnId === n._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-stone-100 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSend(n._id)}
                    disabled={actingOnId === n._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {actingOnId === n._id ? (
                      <Spinner size="sm" tone="on-primary" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send WhatsApp
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingNotifications;

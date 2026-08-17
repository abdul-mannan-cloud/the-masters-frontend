import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MessageCircle, Send, X, AlertTriangle, RotateCw } from "lucide-react";
import * as notificationService from "../services/notificationService";
import { usePermission } from "../hooks/usePermission";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

// Human-in-the-loop review screen for WhatsApp notifications a tenant chose
// to hold for confirmation (Settings > WhatsApp Notifications > "Require
// confirmation before sending" — see BusinessInfoForm.jsx). The backend is
// the real gate on Send/Cancel (NotificationController.js re-checks status +
// tenant ownership on every call, atomically — see
// NotificationService.claimPendingConfirmation/cancelPendingConfirmation) —
// canSend here only hides the buttons for an account that couldn't use them
// anyway.
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const PendingNotifications = () => {
  const canSend = usePermission("notifications", "update");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingOnId, setActingOnId] = useState(null);
  // The notification currently open in the review modal, or null when closed.
  const [reviewing, setReviewing] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAllNotifications({
        status: "pending_confirmation",
      });
      setNotifications(data.filter((n) => n.channel === "whatsapp"));
    } catch {
      setError("Failed to load pending WhatsApp messages.");
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
      setReviewing(null);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send message");
      // Someone else may have already sent/cancelled it — resync instead of
      // leaving a stale card/modal the user could act on again.
      setReviewing(null);
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
      setReviewing(null);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to cancel notification");
      setReviewing(null);
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
            Pending WhatsApp Messages
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
      ) : error ? (
        <div className="empty-state">
          <AlertTriangle className="w-7 h-7 text-red-400" />
          <p className="text-sm font-bold text-on-surface-variant font-headline">{error}</p>
          <button
            onClick={fetchPending}
            className="flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity"
          >
            <RotateCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <MessageCircle className="w-7 h-7 text-stone-300" />
          <p className="text-sm font-bold text-on-surface-variant font-headline">
            No pending WhatsApp messages.
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
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-on-surface">
                      {n.orderId?.orderNumber ? `Order #${n.orderId.orderNumber}` : "Order"}
                    </p>
                    {n.orderId?.productionStatus && (
                      <StatusBadge status={n.orderId.productionStatus} />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {n.customerId?.name || "Customer"}
                    {n.customerId?.phone ? ` · ${n.customerId.phone}` : ""}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Created {formatDateTime(n.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  Awaiting review
                </span>
              </div>

              <div className="px-5 pb-4">
                <p className="text-sm text-on-surface-variant line-clamp-2">{n.content}</p>
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
                    onClick={() => setReviewing(n)}
                    disabled={actingOnId === n._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Review / Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {reviewing && (
          <Modal title="Review WhatsApp Message" onClose={() => setReviewing(null)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Order
                  </p>
                  <p className="font-semibold text-on-surface">
                    {reviewing.orderId?.orderNumber ? `#${reviewing.orderId.orderNumber}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Order Status
                  </p>
                  {reviewing.orderId?.productionStatus ? (
                    <StatusBadge status={reviewing.orderId.productionStatus} />
                  ) : (
                    <p className="text-on-surface">—</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Customer
                  </p>
                  <p className="font-semibold text-on-surface">{reviewing.customerId?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Phone
                  </p>
                  <p className="font-semibold text-on-surface">{reviewing.customerId?.phone || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Created
                  </p>
                  <p className="text-on-surface">{formatDateTime(reviewing.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Message
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-on-surface bg-stone-50 rounded-xl p-4">
                  {reviewing.content}
                </pre>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => handleCancel(reviewing._id)}
                  disabled={actingOnId === reviewing._id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-stone-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={() => handleSend(reviewing._id)}
                  disabled={actingOnId === reviewing._id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {actingOnId === reviewing._id ? (
                    <Spinner size="sm" tone="on-primary" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingNotifications;

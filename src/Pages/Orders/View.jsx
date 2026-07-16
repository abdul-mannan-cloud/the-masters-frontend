import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Plus, Printer, Download, Undo2, PackageCheck } from "lucide-react";
import * as orderService from "../../services/orderService";
import * as paymentService from "../../services/paymentService";
import * as settingsService from "../../services/settingsService";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";
import AddPaymentDialog from "./AddPaymentDialog";
import OrderItemCard from "./OrderItemCard";
import { usePermission } from "../../hooks/usePermission";
import { formatPhone } from "../../utils/formatters";
import Spinner from "../../components/Spinner";

const PRODUCTION_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "delivered",
  "cancelled",
];
const TERMINAL_STATUSES = ["completed", "delivered", "cancelled"];

const OrderView = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const canUpdate = usePermission("orders", "update");
  const canDelete = usePermission("orders", "delete");
  const canRecordPayment = usePermission("payments", "create");

  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [letterhead, setLetterhead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [reversingId, setReversingId] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [details, history] = await Promise.all([
        orderService.getOrderDetails(id),
        paymentService.getPaymentHistory(id),
      ]);
      setData(details);
      setPayments(history);
    } catch {
      toast.error("Failed to fetch order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Separate, best-effort fetch — GET /settings requires settings.view,
  // which plain employees/tailors don't have. A 403 here must not block the
  // order page itself, so failures are swallowed and the logo is just omitted.
  useEffect(() => {
    (async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings.invoice?.showLogo && settings.business?.logo) {
          setLetterhead({ logo: settings.business.logo, name: settings.business.name });
        }
      } catch {
        // no permission or not yet configured — invoice just renders without a logo
      }
    })();
  }, []);

  const handleStatusChange = async (productionStatus) => {
    setUpdating(true);
    try {
      await orderService.updateOrder(id, { productionStatus });
      toast.success("Order status updated");
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!window.confirm("Confirm this order? Fabric for any selected garments will be deducted from inventory."))
      return;
    setConfirming(true);
    try {
      await orderService.confirmOrder(id);
      toast.success("Order confirmed — fabric deducted from inventory");
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to confirm order");
    } finally {
      setConfirming(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await orderService.deleteOrder(id);
      toast.success("Order deleted successfully");
      navigate("/orders");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete order");
    }
  };

  const handleAddPayment = async (payload) => {
    setSavingPayment(true);
    try {
      await paymentService.addPayment({ ...payload, orderId: id });
      toast.success("Payment recorded successfully");
      setShowAddPayment(false);
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to record payment");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleReverse = async (paymentId) => {
    if (
      !window.confirm(
        "Reverse this payment? A new refund record will be created — the original stays in history.",
      )
    )
      return;
    setReversingId(paymentId);
    try {
      await paymentService.reversePayment(paymentId, "Reversed by staff");
      toast.success("Payment reversed");
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reverse payment");
    } finally {
      setReversingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!data) return null;

  const { order, customer, items, paymentSummary } = data;
  const { totalPaid, remainingBalance } = paymentSummary;
  const locked = TERMINAL_STATUSES.includes(order.productionStatus);

  return (
    <div className="p-8 font-body print:p-0">
      {letterhead && (
        <div className="flex items-center gap-3 mb-6 print:mb-8">
          <img
            src={letterhead.logo}
            alt={`${letterhead.name || "Business"} logo`}
            className="w-10 h-10 rounded-lg object-cover border border-stone-200"
          />
          {letterhead.name && (
            <span className="text-sm font-bold text-on-surface font-headline">
              {letterhead.name}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            {order.orderNumber}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
        <button
          onClick={() => toast("Download Invoice is coming soon")}
          className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete order"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5 font-headline">
            Customer
          </h3>
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={customer.name} size="lg" />
            <div>
              <p className="font-bold text-on-surface">{customer.name}</p>
              <p className="text-sm text-on-surface-variant">
                {customer.customerNumber} · {formatPhone(customer.phone)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            <div>
              <p className="text-xs text-on-surface-variant">Order Date</p>
              <p className="text-on-surface">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Delivery Date</p>
              <p className="text-on-surface">
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "—"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-on-surface-variant mb-1">Order Status</p>
              <StatusBadge status={order.productionStatus} />
            </div>
          </div>
          <button
            onClick={() => navigate(`/customers/${customer._id}`)}
            className="w-full py-2.5 text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors print:hidden"
          >
            View Customer Profile
          </button>
        </div>

        <div
          className="lg:col-span-2 bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5 font-headline">
            Itemized Bill
          </h3>
          <div className="space-y-2 mb-5">
            {items.map((item) => (
              <OrderItemCard key={item._id} item={item} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-stone-100">
            <div>
              <p className="text-xs text-on-surface-variant">Subtotal</p>
              <p className="font-bold text-on-surface">Rs. {order.subtotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Discount</p>
              <p className="font-bold text-on-surface">
                {order.discountType === "percentage"
                  ? `${order.discount}%`
                  : `Rs. ${order.discount.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Grand Total</p>
              <p className="font-bold text-primary text-lg">Rs. {order.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Payment Status</p>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-on-surface-variant">Production Status</p>
              {canUpdate && !locked && (
                <button
                  onClick={handleConfirmOrder}
                  disabled={confirming || !!order.confirmedAt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-full text-xs hover:bg-primary/20 transition-colors disabled:opacity-50"
                  title={order.confirmedAt ? "Fabric already deducted for this order" : "Deduct fabric and confirm this order"}
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  {order.confirmedAt ? "Order Confirmed" : confirming ? "Confirming…" : "Confirm Order"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {PRODUCTION_STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={!canUpdate || updating || locked || status === order.productionStatus}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors disabled:opacity-40 ${
                    status === order.productionStatus
                      ? "bg-primary text-on-primary"
                      : "border border-stone-200 text-on-surface-variant hover:bg-stone-50"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
            {locked && (
              <p className="mt-2 text-xs text-on-surface-variant">
                This order is {order.productionStatus} and can no longer be modified.
              </p>
            )}
          </div>

          {order.notes && (
            <div className="mt-6 pt-4 border-t border-stone-100">
              <p className="text-xs text-on-surface-variant mb-1">Notes</p>
              <p className="text-sm text-on-surface">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="bg-white rounded-2xl p-6 mt-6"
        style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline">
            Payment Summary
          </h3>
          {canRecordPayment && remainingBalance > 0 && (
            <button
              onClick={() => setShowAddPayment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold rounded-full text-xs hover:bg-primary-container transition-colors print:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Payment
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-on-surface-variant">Amount Paid</p>
            <p className="text-lg font-bold text-emerald-700">
              Rs. {totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-on-surface-variant">Remaining Balance</p>
            <p className="text-lg font-bold text-on-surface">
              Rs. {remainingBalance.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-on-surface-variant mb-1">Status</p>
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-headline">
          Payment History
        </h4>
        {payments.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">
            No payments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full masters-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th>Received By</th>
                  <th>Notes</th>
                  <th className="text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="text-on-surface-variant">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="capitalize text-on-surface">{p.method.replace("_", " ")}</td>
                    <td>
                      <StatusBadge
                        status={p.paymentType === "refund" ? "cancelled" : "active"}
                        label={p.paymentType}
                      />
                    </td>
                    <td
                      className={`text-right font-bold ${p.paymentType === "refund" ? "text-red-600" : "text-on-surface"}`}
                    >
                      {p.paymentType === "refund" ? "− " : ""}Rs. {p.amount.toLocaleString()}
                    </td>
                    <td className="text-on-surface-variant">{p.recordedByName || "—"}</td>
                    <td className="text-on-surface-variant max-w-40 truncate">{p.notes || "—"}</td>
                    <td className="text-right print:hidden">
                      {canRecordPayment && p.paymentType !== "refund" && !p.isReversed && (
                        <button
                          onClick={() => handleReverse(p._id)}
                          disabled={reversingId === p._id}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reverse this payment"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddPayment && (
          <AddPaymentDialog
            remainingBalance={remainingBalance}
            saving={savingPayment}
            onSave={handleAddPayment}
            onCancel={() => setShowAddPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderView;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft, Pencil, SlidersHorizontal, Package } from "lucide-react";
import * as inventoryService from "../../services/inventoryService";
import StatusBadge from "../../components/StatusBadge";
import { usePermission } from "../../hooks/usePermission";
import AdjustStockDialog from "./AdjustStockDialog";

const TX_LIMIT = 15;

const TX_BADGE = {
  Purchase: "paid",
  "Manual Adjustment": "partial",
  "Order Consumption": "in_progress",
  Return: "paid",
  Damage: "cancelled",
};

const InventoryView = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const canUpdate = usePermission("inventory", "update");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txLoading, setTxLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventoryById(id);
      setItem(data);
    } catch {
      toast.error("Failed to load inventory item");
      navigate("/inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const data = await inventoryService.getInventoryTransactions(id, {
        page: txPage,
        limit: TX_LIMIT,
      });
      setTransactions(data.data);
      setTxTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load transaction history");
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchItem();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    (async () => {
      await fetchTransactions();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, txPage]);

  const ordersUsingFabric = [
    ...new Map(
      transactions
        .filter((t) => t.orderId && t.transactionType === "Order Consumption")
        .map((t) => [String(t.orderId), t]),
    ).values(),
  ];

  if (loading || !item) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/inventory")}
              className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
                {item.fabricName}
                {item.isLowStock && (
                  <span className="ml-3 status-badge bg-amber-100 text-amber-700 align-middle">
                    Low Stock
                  </span>
                )}
              </h1>
              <p className="text-on-surface-variant mt-1 text-sm">{item.fabricCode}</p>
            </div>
          </div>
          {canUpdate && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdjust(true)}
                className="flex items-center gap-2 border border-stone-200 text-on-surface px-4 py-2.5 rounded-full font-bold text-sm hover:bg-stone-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Adjust Stock
              </button>
              <button
                onClick={() => navigate(`/inventory/${id}/edit`)}
                className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Available Stock
            </p>
            <p className="text-3xl font-extrabold text-on-surface font-headline">
              {item.availableQuantity} <span className="text-base font-medium">{item.unit}</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Minimum Stock Level
            </p>
            <p className="text-3xl font-extrabold text-on-surface font-headline">
              {item.minimumStockLevel} <span className="text-base font-medium">{item.unit}</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
            <StatusBadge status={item.isActive ? "active" : "inactive"} />
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
        >
          <h2 className="text-sm font-extrabold text-on-surface font-headline mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Category</p>
              <p className="font-medium text-on-surface">{item.category || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Color</p>
              <p className="font-medium text-on-surface">{item.color || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Supplier</p>
              <p className="font-medium text-on-surface">{item.supplier || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Purchase Price</p>
              <p className="font-medium text-on-surface">
                {item.purchasePrice !== undefined && item.purchasePrice !== null
                  ? `Rs. ${item.purchasePrice.toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Selling Price</p>
              <p className="font-medium text-on-surface">
                {item.sellingPrice !== undefined && item.sellingPrice !== null
                  ? `Rs. ${item.sellingPrice.toLocaleString()}`
                  : "—"}
              </p>
            </div>
            {item.description && (
              <div className="col-span-full">
                <p className="text-xs text-on-surface-variant mb-0.5">Description</p>
                <p className="font-medium text-on-surface">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl overflow-hidden mb-6"
          style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
        >
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-extrabold text-on-surface font-headline">
              Transaction History (Stock Timeline)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full masters-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Previous → New</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {txLoading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <Package className="w-7 h-7 text-stone-300" />
                        <p className="text-sm font-bold text-on-surface-variant font-headline">
                          No stock movements yet
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="cursor-default">
                      <td className="text-on-surface-variant">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <StatusBadge status={TX_BADGE[tx.transactionType] || "pending"} label={tx.transactionType} />
                      </td>
                      <td className="font-bold text-on-surface">
                        {tx.newStock >= tx.previousStock ? "+" : "-"}
                        {tx.quantity} {item.unit}
                      </td>
                      <td className="text-on-surface-variant">
                        {tx.previousStock} → {tx.newStock}
                      </td>
                      <td className="text-on-surface-variant">{tx.remarks || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!txLoading && transactions.length > 0 && txTotalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
              <p className="text-xs text-on-surface-variant">
                Page {txPage} of {txTotalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTxPage((p) => Math.max(p - 1, 1))}
                  disabled={txPage <= 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 text-on-surface-variant hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setTxPage((p) => Math.min(p + 1, txTotalPages))}
                  disabled={txPage >= txTotalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 text-on-surface-variant hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
        >
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-extrabold text-on-surface font-headline">
              Orders Using This Fabric
            </h2>
          </div>
          {ordersUsingFabric.length === 0 ? (
            <div className="empty-state">
              <p className="text-sm font-bold text-on-surface-variant font-headline">
                No orders have consumed this fabric yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {ordersUsingFabric.map((tx) => (
                <button
                  key={String(tx.orderId)}
                  onClick={() => navigate(`/orders/${tx.orderId}`)}
                  className="w-full text-left px-6 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <span className="text-sm font-medium text-on-surface">Order {String(tx.orderId).slice(-6)}</span>
                  <span className="text-xs text-on-surface-variant">
                    Consumed {tx.quantity} {item.unit} on {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdjust && (
        <AdjustStockDialog
          item={item}
          onClose={() => setShowAdjust(false)}
          onAdjusted={() => {
            fetchItem();
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
};

export default InventoryView;

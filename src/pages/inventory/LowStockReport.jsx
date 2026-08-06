import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import * as inventoryService from "../../services/inventoryService";
import { SkeletonTableRows } from "../../components/Skeleton";

const LowStockReport = () => {
  const navigate = useTenantNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getLowStockItems();
        setItems(data);
      } catch {
        toast.error("Failed to load low stock report");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-8 font-body">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/inventory")}
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Low Stock Report
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Fabrics at or below their minimum stock level.
          </p>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Fabric</th>
                <th>Code</th>
                <th>Available Stock</th>
                <th>Minimum Level</th>
                <th>Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={5} />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <AlertTriangle className="w-7 h-7 text-stone-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        Nothing is running low right now
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} onClick={() => navigate(`/inventory/${item._id}`)}>
                    <td className="font-bold text-on-surface">{item.fabricName}</td>
                    <td className="text-on-surface-variant">{item.fabricCode}</td>
                    <td className="text-red-600 font-bold">
                      {item.availableQuantity} {item.unit}
                    </td>
                    <td className="text-on-surface-variant">
                      {item.minimumStockLevel} {item.unit}
                    </td>
                    <td className="text-on-surface-variant">
                      {Math.max(item.minimumStockLevel - item.availableQuantity, 0)} {item.unit}
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

export default LowStockReport;

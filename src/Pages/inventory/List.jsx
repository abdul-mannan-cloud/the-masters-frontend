import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Eye, Pencil, Trash2, Layers, AlertTriangle, PackageX, History } from "lucide-react";
import * as inventoryService from "../../services/inventoryService";
import KpiCard from "../../components/KpiCard";
import { usePermission } from "../../hooks/usePermission";
import { SkeletonTableRows } from "../../components/Skeleton";

const LIMIT = 10;

const InventoryList = () => {
  const navigate = useTenantNavigate();
  const canCreate = usePermission("inventory", "create");
  const canUpdate = usePermission("inventory", "update");
  const canDelete = usePermission("inventory", "delete");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (activeFilter) params.isActive = activeFilter;
      const data = await inventoryService.getAllInventory(params);
      setItems(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const lowStock = await inventoryService.getLowStockItems();
      setLowStockCount(lowStock.length);
      setOutOfStockCount(lowStock.filter((i) => i.availableQuantity === 0).length);
    } catch {
      // KPI-only, fail silently
    }
  };

  useEffect(() => {
    (async () => {
      await fetchInventory();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, activeFilter]);

  useEffect(() => {
    (async () => {
      await fetchLowStock();
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      await inventoryService.deleteInventory(id);
      toast.success("Inventory item deleted successfully");
      fetchInventory();
      fetchLowStock();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete inventory item");
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Inventory
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {total} fabric{total === 1 ? "" : "s"} tracked for your business.
          </p>
        </div>
        {canCreate && (
          <motion.button
            onClick={() => navigate("/inventory/new")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Fabric
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Layers} label="Total Items" value={total} />
        <KpiCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockCount}
          onClick={() => navigate("/inventory/low-stock")}
        />
        <KpiCard icon={PackageX} label="Out of Stock" value={outOfStockCount} />
        <KpiCard icon={History} label="View Low Stock Report" value="→" onClick={() => navigate("/inventory/low-stock")} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-50">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by fabric name or code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => {
            setPage(1);
            setActiveFilter(e.target.value);
          }}
          className="px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
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
                <th>Category</th>
                <th>Available Stock</th>
                <th>Unit</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={6} />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Layers className="w-7 h-7 text-stone-300" />
                      </div>
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No inventory items found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} onClick={() => navigate(`/inventory/${item._id}`)}>
                    <td className="font-bold text-on-surface">
                      {item.fabricName}
                      {item.isLowStock && (
                        <span className="ml-2 status-badge bg-amber-100 text-amber-700">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="text-on-surface-variant">{item.fabricCode}</td>
                    <td className="text-on-surface-variant">{item.category || "—"}</td>
                    <td className="text-on-surface-variant">{item.availableQuantity}</td>
                    <td className="text-on-surface-variant capitalize">{item.unit}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/inventory/${item._id}`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => navigate(`/inventory/${item._id}/edit`)}
                            className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
            <p className="text-xs text-on-surface-variant">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 text-on-surface-variant hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 text-on-surface-variant hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;

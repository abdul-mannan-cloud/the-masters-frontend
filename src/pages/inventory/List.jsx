import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Layers,
  AlertTriangle,
  PackageX,
  History,
  ChevronRight,
  FolderPlus,
  Folder,
  Home,
} from "lucide-react";
import * as inventoryService from "../../services/inventoryService";
import * as inventoryCategoryService from "../../services/inventoryCategoryService";
import KpiCard from "../../components/KpiCard";
import { usePermission } from "../../hooks/usePermission";
import { Skeleton, SkeletonTableRows } from "../../components/Skeleton";
import CategoryFormModal from "./CategoryFormModal";

const ITEM_LIMIT = 100;

const InventoryList = () => {
  const navigate = useTenantNavigate();
  const canCreate = usePermission("inventory", "create");
  const canUpdate = usePermission("inventory", "update");
  const canDelete = usePermission("inventory", "delete");

  // Breadcrumb — the drill-down path from the root to wherever the user is
  // browsing, e.g. [] at root, [Fabric], or [Fabric, Cotton]. The last entry
  // (or null, at root) is "where we currently are".
  const [categoryPath, setCategoryPath] = useState([]);
  const currentCategory = categoryPath[categoryPath.length - 1] || null;
  const currentCategoryId = currentCategory?._id || null;

  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryModal, setCategoryModal] = useState(null); // null | { mode, category?, parentCategoryId }

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchLevel = async () => {
    try {
      setLoading(true);
      if (isSearching) {
        const params = { search, limit: ITEM_LIMIT };
        if (activeFilter) params.isActive = activeFilter;
        const data = await inventoryService.getAllInventory(params);
        setSubcategories([]);
        setItems(data.data);
      } else {
        const itemParams = { limit: ITEM_LIMIT };
        if (activeFilter) itemParams.isActive = activeFilter;
        const [subs, itemData] = await Promise.all([
          inventoryCategoryService.getAllCategories(currentCategoryId),
          currentCategoryId
            ? inventoryService.getAllInventory({ ...itemParams, categoryId: currentCategoryId })
            : Promise.resolve({ data: [] }),
        ]);
        setSubcategories(subs);
        setItems(itemData.data);
      }
    } catch {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const [all, lowStock] = await Promise.all([
        inventoryService.getAllInventory({ limit: 1 }),
        inventoryService.getLowStockItems(),
      ]);
      setTotalItems(all.total);
      setLowStockCount(lowStock.length);
      setOutOfStockCount(lowStock.filter((i) => i.availableQuantity === 0).length);
    } catch {
      // KPI-only, fail silently
    }
  };

  useEffect(() => {
    (async () => {
      await fetchLevel();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategoryId, search, activeFilter]);

  useEffect(() => {
    (async () => {
      await fetchOverview();
    })();
  }, []);

  const enterCategory = (category) => {
    setSearchInput("");
    setSearch("");
    setCategoryPath((path) => [...path, category]);
  };

  const goToBreadcrumb = (index) => {
    // index === -1 means "Inventory" root
    setCategoryPath((path) => path.slice(0, index + 1));
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      await inventoryService.deleteInventory(id);
      toast.success("Inventory item deleted successfully");
      fetchLevel();
      fetchOverview();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete inventory item");
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    try {
      await inventoryCategoryService.deleteCategory(category._id);
      toast.success("Category deleted successfully");
      fetchLevel();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete category");
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
            {totalItems} item{totalItems === 1 ? "" : "s"} tracked for your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && !isSearching && (
            <button
              onClick={() =>
                setCategoryModal({ mode: "create", parentCategoryId: currentCategoryId })
              }
              className="flex items-center gap-2 border border-stone-200 text-on-surface px-4 py-2.5 rounded-full font-bold text-sm hover:bg-stone-50 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              {currentCategoryId ? "Add Subcategory" : "Add Category"}
            </button>
          )}
          {canCreate && (
            <motion.button
              onClick={() =>
                navigate(
                  currentCategoryId ? `/inventory/new?categoryId=${currentCategoryId}` : "/inventory/new",
                )
              }
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Layers} label="Total Items" value={totalItems} />
        <KpiCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockCount}
          onClick={() => navigate("/inventory/low-stock")}
        />
        <KpiCard icon={PackageX} label="Out of Stock" value={outOfStockCount} />
        <KpiCard icon={History} label="View Low Stock Report" value="→" onClick={() => navigate("/inventory/low-stock")} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-50">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all inventory by name or code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {!isSearching && (
        <div className="flex items-center flex-wrap gap-1.5 mb-5 text-sm">
          <button
            onClick={() => goToBreadcrumb(-1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-colors ${
              categoryPath.length === 0
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-stone-100"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Inventory
          </button>
          {categoryPath.map((cat, index) => (
            <div key={cat._id} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
              <button
                onClick={() => goToBreadcrumb(index)}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  index === categoryPath.length - 1
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-stone-100"
                }`}
              >
                {cat.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          {!isSearching && subcategories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {subcategories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => enterCategory(cat)}
                  className="group relative bg-white rounded-2xl p-5 cursor-pointer hover:-translate-y-0.5 transition-transform"
                  style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface truncate">{cat.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {cat.subcategoryCount > 0 &&
                          `${cat.subcategoryCount} subcategor${cat.subcategoryCount === 1 ? "y" : "ies"}`}
                        {cat.subcategoryCount > 0 && cat.itemCount > 0 && " · "}
                        {(cat.itemCount > 0 || cat.subcategoryCount === 0) &&
                          `${cat.itemCount} item${cat.itemCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </div>
                  {(canUpdate || canDelete) && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canUpdate && (
                        <button
                          onClick={() => setCategoryModal({ mode: "edit", category: cat })}
                          className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="Rename"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full masters-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Code</th>
                    <th>Available Stock</th>
                    <th>Unit</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <SkeletonTableRows rows={4} columns={5} />
                  ) : items.length === 0 ? (
                    subcategories.length === 0 && (
                      <tr>
                        <td colSpan="5">
                          <div className="empty-state">
                            <div className="empty-state-icon">
                              <Layers className="w-7 h-7 text-stone-300" />
                            </div>
                            <p className="text-sm font-bold text-on-surface-variant font-headline">
                              {isSearching
                                ? "No inventory items match your search"
                                : currentCategoryId
                                  ? "No items in this category yet"
                                  : "Select a category above to browse its items"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
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
                                onClick={() => handleDeleteItem(item._id)}
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
          </div>
        </>
      )}

      <AnimatePresence>
        {categoryModal && (
          <CategoryFormModal
            mode={categoryModal.mode}
            category={categoryModal.category}
            parentCategoryId={categoryModal.parentCategoryId}
            onClose={() => setCategoryModal(null)}
            onSaved={() => {
              setCategoryModal(null);
              fetchLevel();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryList;

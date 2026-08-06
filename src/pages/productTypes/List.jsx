import { useEffect, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Eye, Pencil, Trash2, Power, Shirt } from "lucide-react";
import * as productTypeService from "../../services/productTypeService";
import StatusBadge from "../../components/StatusBadge";
import { usePermission } from "../../hooks/usePermission";
import { SkeletonTableRows } from "../../components/Skeleton";

const LIMIT = 10;

const ProductTypeList = () => {
  const navigate = useTenantNavigate();
  const canCreate = usePermission("productTypes", "create");
  const canUpdate = usePermission("productTypes", "update");
  const canDelete = usePermission("productTypes", "delete");
  const [productTypes, setProductTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // '' | 'true' | 'false'
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await productTypeService.getProductCategories();
        setCategories(data);
      } catch {
        toast.error("Failed to load product categories");
      }
    })();
  }, []);

  // Debounce search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (activeFilter) params.isActive = activeFilter;
      if (categoryFilter) params.category = categoryFilter;
      const data = await productTypeService.getAllProductTypes(params);
      setProductTypes(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to fetch product types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchProductTypes();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, activeFilter, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product type?"))
      return;
    try {
      await productTypeService.deleteProductType(id);
      toast.success("Product type deleted successfully");
      fetchProductTypes();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to delete product type",
      );
    }
  };

  const handleToggleStatus = async (productType) => {
    const activating = !productType.isActive;
    if (!activating && !window.confirm(`Deactivate "${productType.name}"?`))
      return;
    try {
      await productTypeService.toggleProductTypeStatus(
        productType._id,
        activating,
      );
      toast.success(`Product type ${activating ? "activated" : "deactivated"}`);
      fetchProductTypes();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update status");
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Product Types
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {total} garment template{total === 1 ? "" : "s"} configured for your
            business.
          </p>
        </div>
        {canCreate && (
        <motion.button
          onClick={() => navigate("/product-types/new")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Product Type
        </motion.button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-50">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
          <input
            type="text"
            placeholder="Search by name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 psr-4 py-2.5 bg-white rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        <select
          value={categoryFilter}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value);
          }}
          className="px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-medium"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
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
                <th>Name</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={5} />
              ) : productTypes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Shirt className="w-7 h-7 text-stone-300" />
                      </div>
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No product types found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                productTypes.map((pt) => (
                  <tr
                    key={pt._id}
                    onClick={() => navigate(`/product-types/${pt._id}`)}
                  >
                    <td className="font-bold text-on-surface">{pt.name}</td>
                    <td className="text-on-surface-variant">
                      Rs. {pt.basePrice?.toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge
                        status={pt.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(pt.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/product-types/${pt._id}`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() =>
                              navigate(`/product-types/${pt._id}/edit`)
                            }
                            className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            onClick={() => handleToggleStatus(pt)}
                            className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title={pt.isActive ? "Deactivate" : "Activate"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(pt._id)}
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

        {!loading && productTypes.length > 0 && (
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

export default ProductTypeList;

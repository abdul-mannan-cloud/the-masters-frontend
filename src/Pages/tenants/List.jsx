import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Eye, Pencil, Trash2, Building2, Ban } from "lucide-react";
import * as tenantService from "../../services/tenantService";
import StatusBadge from "../../components/StatusBadge";

const LIMIT = 10;

const TenantList = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' | active | suspended | cancelled
  const [loading, setLoading] = useState(true);

  // Debounce search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await tenantService.getAllTenants(params);
      setTenants(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchTenants();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const handleDelete = async (tenant) => {
    if (
      !window.confirm(
        `Delete "${tenant.businessName}"? Their historical data is kept, but the business will no longer be accessible.`,
      )
    )
      return;
    try {
      await tenantService.deleteTenant(tenant._id);
      toast.success("Tenant deleted successfully");
      fetchTenants();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete tenant");
    }
  };

  const handleToggleStatus = async (tenant) => {
    const suspending = tenant.status === "active";
    if (
      !window.confirm(
        suspending
          ? `Suspend "${tenant.businessName}"? All of its users will be blocked from logging in.`
          : `Reactivate "${tenant.businessName}"?`,
      )
    )
      return;
    try {
      if (suspending) {
        await tenantService.suspendTenant(tenant._id);
      } else {
        await tenantService.activateTenant(tenant._id);
      }
      toast.success(`Tenant ${suspending ? "suspended" : "activated"}`);
      fetchTenants();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update tenant status");
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Tenants
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {total} business{total === 1 ? "" : "es"} registered on the platform.
          </p>
        </div>
        <button
          onClick={() => navigate("/tenants/new")}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Tenant
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-50">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, slug, or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Registered</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <Building2 className="w-7 h-7 text-stone-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No tenants found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant._id} onClick={() => navigate(`/tenants/${tenant._id}`)}>
                    <td className="font-bold text-on-surface">{tenant.businessName}</td>
                    <td className="text-on-surface-variant">{tenant.contactEmail}</td>
                    <td className="text-on-surface-variant capitalize">{tenant.plan}</td>
                    <td>
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="text-on-surface-variant">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/tenants/${tenant._id}`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/tenants/${tenant._id}/edit`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title={tenant.status === "active" ? "Suspend" : "Activate"}
                        >
                          {tenant.status === "active" ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(tenant)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && tenants.length > 0 && (
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

export default TenantList;

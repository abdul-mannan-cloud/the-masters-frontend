import { useEffect, useMemo, useState } from "react";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, ShieldCheck } from "lucide-react";
import * as roleService from "../../services/roleService";

const RoleList = () => {
  const navigate = useTenantNavigate();
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchRoles();
    })();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.name?.toLowerCase().includes(q));
  }, [roles, searchQuery]);

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete the "${role.name}" role?`)) return;
    try {
      await roleService.deleteRole(role._id);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete role");
    }
  };

  const countGrantedModules = (permissions) =>
    Object.values(permissions || {}).filter((m) => m.view || m.create || m.update || m.delete)
      .length;

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
            Roles
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {roles.length} role{roles.length === 1 ? "" : "s"} defined for your business.
          </p>
        </div>
        <button
          onClick={() => navigate("/roles/new")}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
        <input
          type="text"
          placeholder="Search by name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Modules Granted</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">
                      <ShieldCheck className="w-7 h-7 text-stone-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No roles found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role._id} onClick={() => navigate(`/roles/${role._id}/edit`)}>
                    <td className="font-bold text-on-surface">{role.name}</td>
                    <td className="text-on-surface-variant">{role.description || "—"}</td>
                    <td className="text-on-surface-variant">
                      {countGrantedModules(role.permissions)} / 9 modules
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/roles/${role._id}/edit`)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
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
      </div>
    </div>
  );
};

export default RoleList;

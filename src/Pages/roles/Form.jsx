import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import * as roleService from "../../services/roleService";
import Spinner from "../../components/Spinner";

const MODULE_LABELS = {
  dashboard: "Dashboard",
  customers: "Customers",
  measurements: "Measurements",
  productTypes: "Product Types",
  orders: "Orders",
  employees: "Employee Management",
  payments: "Payments",
  notifications: "Notifications",
  settings: "Settings",
};

const buildEmptyPermissions = (modules, actions) =>
  Object.fromEntries(
    modules.map((module) => [module, Object.fromEntries(actions.map((action) => [action, false]))]),
  );

const RoleForm = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { modules: fetchedModules, actions: fetchedActions } =
          await roleService.getPermissionModules();
        setModules(fetchedModules);
        setActions(fetchedActions);

        if (isEdit) {
          const role = await roleService.getRoleById(id);
          setName(role.name);
          setDescription(role.description || "");
          setPermissions(role.permissions);
        } else {
          setPermissions(buildEmptyPermissions(fetchedModules, fetchedActions));
        }
      } catch {
        toast.error("Failed to load role");
        navigate("/roles");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const toggleAction = (module, action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: "Role name is required." });
      return;
    }
    setErrors({});

    const payload = { name: name.trim(), description: description.trim(), permissions };

    setSaving(true);
    try {
      if (isEdit) {
        await roleService.updateRole(id, payload);
        toast.success("Role updated successfully.");
      } else {
        await roleService.createRole(payload);
        toast.success("Role created successfully.");
      }
      navigate("/roles");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/roles")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
              {isEdit ? "Edit Role" : "Create Role"}
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Choose exactly what employees with this role can do.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="bg-white rounded-2xl p-6 space-y-4 mb-6"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Role Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Receptionist"
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl overflow-hidden mb-6"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full masters-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    {actions.map((action) => (
                      <th key={action} className="text-center capitalize">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module}>
                      <td className="font-bold text-on-surface">
                        {MODULE_LABELS[module] || module}
                      </td>
                      {actions.map((action) => (
                        <td key={action} className="text-center">
                          <button
                            type="button"
                            onClick={() => toggleAction(module, action)}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-colors ${
                              permissions[module]?.[action]
                                ? "bg-primary border-primary text-on-primary"
                                : "border-stone-300 text-transparent hover:border-primary/40"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/roles")}
              className="flex-1 py-3 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && (
                <Spinner size="sm" tone="on-primary" />
              )}
              {saving ? "Saving…" : isEdit ? "Update Role" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;

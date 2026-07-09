import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Lock, Power, KeyRound } from "lucide-react";
import * as employeeService from "../../services/employeeService";
import * as userService from "../../services/userService";
import * as roleService from "../../services/roleService";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";
import { usePermission } from "../../hooks/usePermission";
import { formatPhone, formatCnic } from "../../utils/formatters";

const EmployeeView = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const canUpdate = usePermission("employees", "update");
  const canDelete = usePermission("employees", "delete");
  const [employee, setEmployee] = useState(null);
  const [linkedUser, setLinkedUser] = useState(null);
  const [roleName, setRoleName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const employeeData = await employeeService.getEmployeeById(id);
      setEmployee(employeeData);
      const users = await userService.getAllUsers({ employeeId: id });
      setLinkedUser(users[0] || null);
      if (employeeData.roleId) {
        const role = await roleService.getRoleById(employeeData.roleId);
        setRoleName(role.name);
      } else {
        setRoleName(null);
      }
    } catch {
      toast.error("Failed to fetch employee");
      navigate("/employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleAccess = async () => {
    if (!linkedUser) return;
    const activating = linkedUser.status !== "active";
    if (
      !activating &&
      !window.confirm(`Suspend portal access for "${employee.name}"?`)
    )
      return;
    setUpdatingStatus(true);
    try {
      const { user } = await userService.updateUser(linkedUser._id, {
        status: activating ? "active" : "suspended",
      });
      setLinkedUser(user);
      toast.success(`Portal access ${activating ? "restored" : "suspended"}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update access");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!linkedUser) return;
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setResettingPassword(true);
    try {
      await userService.updateUser(linkedUser._id, { password: newPassword });
      toast.success("Password reset successfully");
      setNewPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${employee.name}"? This will also revoke their portal access.`,
      )
    )
      return;
    try {
      await employeeService.deleteEmployee(id);
      toast.success("Employee deleted successfully");
      navigate("/employees");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete employee");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="p-8 font-body">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/employees")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar name={employee.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
                {employee.name}
              </h1>
              <StatusBadge status={employee.isActive ? "active" : "inactive"} />
            </div>
            <p className="text-on-surface-variant mt-1 text-sm">
              {formatPhone(employee.phone)}
            </p>
          </div>
          {canUpdate && (
            <button
              onClick={() => navigate(`/employees/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
              Profile
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-on-surface-variant">CNIC</p>
                <p className="text-on-surface">{formatCnic(employee.cnic) || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Address</p>
                <p className="text-on-surface">{employee.address || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Salary</p>
                <p className="text-on-surface">
                  Rs. {employee.salary?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Role (Permissions)</p>
                <p className="text-on-surface">{roleName || "No role assigned"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {employee.skills?.length ? (
                    employee.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-stone-50 rounded-full text-xs font-medium text-on-surface-variant"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-on-surface-variant text-sm">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.05)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-headline">
                Portal Access
              </h3>
              {linkedUser && <StatusBadge status={linkedUser.status} />}
            </div>

            {!linkedUser ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Lock className="w-6 h-6 text-stone-300" />
                <p className="text-sm text-on-surface-variant">
                  This employee has no portal login.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-on-surface-variant">Login Email</p>
                  <p className="text-on-surface font-medium">
                    {linkedUser.email}
                  </p>
                </div>

                {canUpdate && (
                  <button
                    onClick={handleToggleAccess}
                    disabled={updatingStatus}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                      linkedUser.status === "active"
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "bg-primary text-on-primary hover:bg-primary-container"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {linkedUser.status === "active"
                      ? "Suspend Access"
                      : "Restore Access"}
                  </button>
                )}

                {canUpdate && (
                  <form
                    onSubmit={handleResetPassword}
                    className="pt-3 border-t border-stone-100"
                  >
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Reset Password
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="flex-1 px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="submit"
                        disabled={resettingPassword || newPassword.length < 8}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-bold text-primary disabled:opacity-40 transition-colors whitespace-nowrap"
                      >
                        <KeyRound className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;

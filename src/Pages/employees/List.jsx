import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Eye, Pencil, Trash2, Users } from "lucide-react";
import * as employeeService from "../../services/employeeService";
import * as userService from "../../services/userService";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [usersByEmployeeId, setUsersByEmployeeId] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, usersData] = await Promise.all([
        employeeService.getAllEmployees(),
        userService.getAllUsers(),
      ]);
      setEmployees(employeesData);
      setUsersByEmployeeId(
        Object.fromEntries(
          usersData.filter((u) => u.employeeId).map((u) => [u.employeeId, u]),
        ),
      );
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => e.name?.toLowerCase().includes(q) || e.phone?.toLowerCase().includes(q),
    );
  }, [employees, searchQuery]);

  const handleDelete = async (employee) => {
    if (
      !window.confirm(
        `Delete "${employee.name}"? This will also revoke their portal access.`,
      )
    )
      return;
    try {
      await employeeService.deleteEmployee(employee._id);
      toast.success("Employee deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete employee");
    }
  };

  return (
    <div className="p-8 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">
            Employees
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {employees.length} employee{employees.length === 1 ? "" : "s"} on your team.
          </p>
        </div>
        <button
          onClick={() => navigate("/employees/new")}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-colors"
        >
          <Plus className="w-4 h-4" />
          Enroll Employee
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name or phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full masters-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Phone</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Portal Access</th>
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
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <Users className="w-7 h-7 text-slate-300" />
                      <p className="text-sm font-bold text-on-surface-variant font-headline">
                        No employees found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const linkedUser = usersByEmployeeId[employee._id];
                  return (
                    <tr key={employee._id} onClick={() => navigate(`/employees/${employee._id}`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={employee.name} size="sm" />
                          <span className="font-medium text-on-surface">{employee.name}</span>
                        </div>
                      </td>
                      <td className="text-on-surface-variant">{employee.phone}</td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {employee.skills?.length ? (
                            employee.skills.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 bg-slate-50 rounded-full text-xs font-medium text-on-surface-variant"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-on-surface-variant text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={employee.isActive ? "active" : "inactive"} />
                      </td>
                      <td>
                        <StatusBadge status={linkedUser ? linkedUser.status : "no_access"} />
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/employees/${employee._id}`)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/employees/${employee._id}/edit`)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import * as employeeService from "../../services/employeeService";
import * as roleService from "../../services/roleService";
import PhoneInput from "../../components/PhoneInput";
import CnicInput from "../../components/CnicInput";
import { isValidPhone, isValidCnic } from "../../utils/formatters";
import Spinner from "../../components/Spinner";

const EmployeeForm = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [salary, setSalary] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await employeeService.getSkills();
        setSkills(data);
      } catch {
        toast.error("Failed to load skills list");
      } finally {
        setSkillsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await roleService.getAllRoles();
        setRoles(data);
      } catch {
        toast.error("Failed to load roles list");
      } finally {
        setRolesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const employee = await employeeService.getEmployeeById(id);
        setName(employee.name);
        setPhone(employee.phone);
        setCnic(employee.cnic || "");
        setAddress(employee.address || "");
        setSalary(employee.salary != null ? String(employee.salary) : "");
        setSelectedSkills(employee.skills || []);
        setRoleId(employee.roleId || "");
        setIsActive(employee.isActive);
      } catch {
        toast.error("Failed to load employee");
        navigate("/employees");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!phone.trim()) nextErrors.phone = "Phone is required.";
    else if (!isValidPhone(phone))
      nextErrors.phone = "Enter a valid 11-digit mobile number starting with 03.";
    if (cnic && !isValidCnic(cnic))
      nextErrors.cnic = "CNIC must be exactly 13 digits.";
    if (salary !== "" && Number(salary) < 0)
      nextErrors.salary = "Salary cannot be negative.";
    if (!isEdit) {
      if (!email.trim())
        nextErrors.email = "Email is required to grant portal access.";
      if (!password || password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      cnic: cnic.trim(),
      address: address.trim(),
      salary: salary === "" ? 0 : Number(salary),
      skills: selectedSkills,
      roleId: roleId || null,
      isActive,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await employeeService.updateEmployee(id, payload);
        toast.success("Employee updated successfully.");
        navigate(`/employees/${id}`);
      } else {
        const { employee } = await employeeService.enrollEmployee({
          ...payload,
          email: email.trim(),
          password,
        });
        toast.success("Employee enrolled successfully.");
        navigate(`/employees/${employee._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save employee");
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/employees")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
              {isEdit ? "Edit Employee" : "Enroll Employee"}
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              {isEdit
                ? "Update this employee's profile."
                : "Create their profile and grant portal access in one step."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.phone ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  CNIC
                </label>
                <CnicInput
                  value={cnic}
                  onChange={setCnic}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.cnic ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.cnic && (
                  <p className="mt-1 text-xs text-red-600">{errors.cnic}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Salary (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.salary ? "border-red-400" : "border-transparent"
                  }`}
                />
                {errors.salary && (
                  <p className="mt-1 text-xs text-red-600">{errors.salary}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Skills
              </label>
              {skillsLoading ? (
                <p className="text-sm text-on-surface-variant">
                  Loading skills…
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-primary text-on-primary border-primary"
                          : "border-stone-200 text-on-surface-variant hover:bg-stone-50"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Role (Permissions)
              </label>
              {rolesLoading ? (
                <p className="text-sm text-on-surface-variant">Loading roles…</p>
              ) : (
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">No role assigned</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Active
            </label>

            {!isEdit && (
              <div className="pt-4 border-t border-stone-100">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Portal Access
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Login Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.email ? "border-red-400" : "border-transparent"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.password
                          ? "border-red-400"
                          : "border-transparent"
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/employees")}
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
              {saving
                ? "Saving…"
                : isEdit
                  ? "Update Employee"
                  : "Enroll Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;

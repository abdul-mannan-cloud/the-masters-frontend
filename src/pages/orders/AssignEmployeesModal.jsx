import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import * as employeeService from "../../services/employeeService";
import * as productTypeService from "../../services/productTypeService";
import * as orderItemAssignmentService from "../../services/orderItemAssignmentService";

// Active = still counts against the workflow step; a "reassigned" row is a
// superseded historical record (see OrderItemAssignmentService), so a step it
// once occupied is open again.
const isActiveAssignment = (a) => a.status !== "reassigned";

// One row per still-open (orderItem, workflowStep) pairing across every
// product on this order — not just the first item — so a multi-product order
// (e.g. Kameez + Shalwar, each with their own Cutting/Tailoring workflow)
// gets a picker for every outstanding step, not only the first garment's.
const AssignEmployeesModal = ({ order, items, onClose, onAssigned }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [workflowByProductType, setWorkflowByProductType] = useState({});
  const [selections, setSelections] = useState({}); // key -> employeeId

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const productTypeIds = [...new Set(items.map((i) => String(i.productTypeId)))];
        const [employeeList, productTypes] = await Promise.all([
          employeeService.getAllEmployees(),
          Promise.all(productTypeIds.map((id) => productTypeService.getProductTypeById(id))),
        ]);
        setEmployees(employeeList.filter((e) => e.isActive));
        setWorkflowByProductType(
          Object.fromEntries(productTypeIds.map((id, i) => [id, productTypes[i].workflow || []])),
        );
      } catch {
        toast.error("Failed to load employees / workflow");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSteps = useMemo(() => {
    const rows = [];
    for (const item of items) {
      const workflow = workflowByProductType[String(item.productTypeId)] || [];
      const activeSequences = new Set(
        (item.assignedEmployees || []).filter(isActiveAssignment).map((a) => a.workflowStep.sequence),
      );
      for (const step of [...workflow].sort((a, b) => a.sequence - b.sequence)) {
        if (activeSequences.has(step.sequence)) continue;
        rows.push({
          key: `${item._id}-${step.sequence}`,
          orderItemId: item._id,
          garmentType: item.garmentType,
          sequence: step.sequence,
          step: step.step,
          requiredSkill: step.requiredSkill,
        });
      }
    }
    return rows;
  }, [items, workflowByProductType]);

  const handleSubmit = async () => {
    const assignments = openSteps
      .filter((row) => selections[row.key])
      .map((row) => ({
        orderItemId: row.orderItemId,
        sequence: row.sequence,
        employeeId: selections[row.key],
      }));

    if (assignments.length === 0) {
      toast.error("Select at least one employee to assign.");
      return;
    }

    setSaving(true);
    try {
      const result = await orderItemAssignmentService.bulkAssignEmployees(order._id, assignments);
      toast.success(
        result.statusChanged
          ? "Employees assigned — order moved to In Progress."
          : "Employees assigned successfully.",
      );
      onAssigned();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to assign employees");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Assign Employees" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : openSteps.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-4 text-center">
          Every production step on this order already has an employee assigned.
        </p>
      ) : (
        <div className="space-y-3">
          {openSteps.map((row) => {
            const matchingEmployees = employees.filter((e) => e.skills.includes(row.requiredSkill));
            return (
              <div key={row.key} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-surface truncate">{row.step}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {row.garmentType} · needs {row.requiredSkill}
                  </p>
                </div>
                <select
                  value={selections[row.key] || ""}
                  onChange={(e) =>
                    setSelections((prev) => ({ ...prev, [row.key]: e.target.value }))
                  }
                  className="w-48 shrink-0 px-3 py-2 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Select —</option>
                  {matchingEmployees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 pt-6 mt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loading || openSteps.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          <UserCog className="w-4 h-4" />
          {saving ? "Assigning…" : "Assign Employees"}
        </button>
      </div>
    </Modal>
  );
};

export default AssignEmployeesModal;

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserCog, AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import StatusBadge from "../../components/StatusBadge";
import * as orderService from "../../services/orderService";
import * as employeeService from "../../services/employeeService";
import * as productTypeService from "../../services/productTypeService";
import * as orderItemAssignmentService from "../../services/orderItemAssignmentService";

// Active = still counts against the workflow step; a "reassigned" row is a
// superseded historical record (see OrderItemAssignmentService), so a step it
// once occupied is open again.
const isActiveAssignment = (a) => a.status !== "reassigned";

// Self-contained by design (only needs an orderId) so the exact same modal
// can be opened straight from the Orders list row action or from the Order
// Details page, without either caller having to pre-fetch anything.
const AssignEmployeesModal = ({ orderId, onClose, onAssigned }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [workflowByProductType, setWorkflowByProductType] = useState({});
  const [checked, setChecked] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const [details, employeeList] = await Promise.all([
          orderService.getOrderDetails(orderId),
          employeeService.getAllEmployees(),
        ]);
        const productTypeIds = [...new Set(details.items.map((i) => String(i.productTypeId)))];
        const productTypes = await Promise.all(
          productTypeIds.map((id) => productTypeService.getProductTypeById(id)),
        );

        setOrderDetails(details);
        setEmployees(employeeList.filter((e) => e.isActive));
        setWorkflowByProductType(
          Object.fromEntries(productTypeIds.map((id, i) => [id, productTypes[i].workflow || []])),
        );

        const currentlyAssigned = details.items
          .flatMap((item) => item.assignedEmployees || [])
          .filter(isActiveAssignment)
          .map((a) => String(a.employeeId));
        setChecked(new Set(currentlyAssigned));
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // Every still-open (orderItem, workflowStep) pairing across the order's
  // products, plus which role each currently-assigned employee fills — the
  // same computation the old per-step picker used, just surfaced here as a
  // flat per-employee list instead of a per-step one.
  const { openSteps, roleByEmployeeId } = useMemo(() => {
    if (!orderDetails) return { openSteps: [], roleByEmployeeId: new Map() };
    const steps = [];
    const roles = new Map();
    for (const item of orderDetails.items) {
      const workflow = workflowByProductType[String(item.productTypeId)] || [];
      const activeForItem = (item.assignedEmployees || []).filter(isActiveAssignment);
      const filledSequences = new Set(activeForItem.map((a) => a.workflowStep.sequence));
      for (const a of activeForItem) {
        roles.set(String(a.employeeId), a.workflowStep.step);
      }
      for (const step of [...workflow].sort((a, b) => a.sequence - b.sequence)) {
        if (!filledSequences.has(step.sequence)) steps.push(step);
      }
    }
    return { openSteps: steps, roleByEmployeeId: roles };
  }, [orderDetails, workflowByProductType]);

  // Candidates = anyone already assigned (so they can be unchecked/removed)
  // plus anyone whose skills match at least one still-open step (so they can
  // be added) — not the tenant's entire employee roster, which would bury
  // the relevant names among people who can't do any of this order's work.
  const candidates = useMemo(() => {
    return employees
      .filter((e) => roleByEmployeeId.has(e._id) || openSteps.some((s) => e.skills.includes(s.requiredSkill)))
      .map((e) => ({
        ...e,
        role: roleByEmployeeId.get(e._id) || openSteps.find((s) => e.skills.includes(s.requiredSkill))?.step,
      }));
  }, [employees, roleByEmployeeId, openSteps]);

  const toggle = (employeeId) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await orderItemAssignmentService.syncOrderAssignments(orderId, [...checked]);
      toast.success(
        result.statusChanged
          ? "Employees assigned — order moved to In Progress."
          : "Employees assigned successfully.",
      );
      onAssigned();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to assign employees.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Assign Employees" onClose={onClose}>
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <Spinner size="md" />
          <p className="text-sm text-on-surface-variant">Loading employees...</p>
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <AlertTriangle className="w-7 h-7 text-stone-300" />
          <p className="text-sm font-bold text-on-surface-variant">Unable to load employees.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-stone-100">
            <div>
              <p className="text-xs text-on-surface-variant">Order</p>
              <p className="text-sm font-bold text-on-surface">#{orderDetails.order.orderNumber}</p>
              <p className="text-xs text-on-surface-variant mt-1">Customer</p>
              <p className="text-sm text-on-surface">{orderDetails.customer.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant mb-1">Current Status</p>
              <StatusBadge status={orderDetails.order.productionStatus} />
            </div>
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-6 text-center">
              No employees available for assignment.
            </p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {candidates.map((emp) => (
                <label
                  key={emp._id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(emp._id)}
                    onChange={() => toggle(emp._id)}
                    className="w-4 h-4 accent-primary shrink-0"
                  />
                  <span className="text-sm text-on-surface min-w-0 truncate">
                    <span className="font-bold">{emp.name}</span>
                    {emp.role && <span className="text-on-surface-variant"> — {emp.role}</span>}
                  </span>
                </label>
              ))}
            </div>
          )}

          <p className="text-xs text-on-surface-variant mt-4">
            Selected: {checked.size} employee{checked.size === 1 ? "" : "s"}
          </p>
        </>
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
          disabled={saving || loading || loadError}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          <UserCog className="w-4 h-4" />
          {saving ? "Assigning..." : "Assign Employees"}
        </button>
      </div>
    </Modal>
  );
};

export default AssignEmployeesModal;

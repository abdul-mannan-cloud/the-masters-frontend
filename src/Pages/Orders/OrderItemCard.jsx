import { useState } from "react";
import { ChevronDown, ChevronRight, Ruler, UserCog } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

// Read-only, collapsible summary of one OrderItem — the exact garment,
// measurements, options, price, and workflow assignments as they were at
// order time. Reused by the standalone Order page and the Customer Details
// "Order History" tab so the two never drift out of sync with each other.
const OrderItemCard = ({ item, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-stone-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 p-3.5 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
          )}
          <span className="text-sm font-bold text-on-surface truncate">
            {item.garmentType}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-on-surface">
            Rs. {item.subtotal.toLocaleString()}
          </p>
          <p className="text-xs text-on-surface-variant">
            Qty {item.quantity} × Rs. {item.unitPrice.toLocaleString()}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-stone-100">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              Measurements
            </p>
            {item.measurement?.values?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.measurement.values.map((v) => (
                  <div
                    key={v.fieldId}
                    className="flex justify-between text-sm px-3 py-1.5 bg-stone-50 rounded-lg"
                  >
                    <span className="text-on-surface-variant">{v.label}</span>
                    <span className="font-medium text-on-surface">
                      {v.value} {v.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No measurement on file.</p>
            )}
          </div>

          {item.selectedOptions?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Selected Options
              </p>
              <div className="flex flex-wrap gap-2">
                {item.selectedOptions.map((o) => (
                  <span
                    key={o.name}
                    className="px-2.5 py-1 bg-stone-50 rounded-full text-xs font-medium text-on-surface-variant"
                  >
                    {o.name}: <span className="text-on-surface font-bold">{o.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.instructions && (
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Instructions
              </p>
              <p className="text-sm text-on-surface">{item.instructions}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5" />
              Assigned Employees
            </p>
            {item.assignedEmployees?.length > 0 ? (
              <div className="space-y-1.5">
                {item.assignedEmployees.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between text-sm px-3 py-1.5 bg-stone-50 rounded-lg"
                  >
                    <span className="text-on-surface-variant">
                      {a.workflowStep?.step}
                      {a.employeeName && (
                        <span className="text-on-surface font-medium"> · {a.employeeName}</span>
                      )}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No one assigned yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemCard;

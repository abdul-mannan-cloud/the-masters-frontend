const STATUS_STYLES = {
  pending: "bg-stone-100 text-stone-600",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  delivered: "bg-primary text-on-primary",
  cancelled: "bg-red-100 text-red-700",
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-stone-100 text-stone-600",
  suspended: "bg-red-100 text-red-700",
  no_access: "bg-stone-100 text-stone-400",
  locked: "bg-amber-100 text-amber-700",
};

const StatusBadge = ({ status, label }) => (
  <span
    className={`status-badge capitalize ${STATUS_STYLES[status] || "bg-stone-100 text-stone-600"}`}
  >
    {(label ?? status ?? "").toString().replace(/_/g, " ")}
  </span>
);

export default StatusBadge;

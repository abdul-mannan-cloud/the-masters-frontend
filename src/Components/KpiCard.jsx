const KpiCard = ({ icon: Icon, label, value, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 border border-slate-100 ${
      onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
    }`}
    style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
  >
    <div className="p-2.5 bg-primary/10 rounded-xl inline-flex mb-4">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <p className="text-3xl font-extrabold text-on-surface font-headline">
      {value}
    </p>
    <p className="text-sm text-on-surface-variant mt-1">{label}</p>
  </div>
);

export default KpiCard;

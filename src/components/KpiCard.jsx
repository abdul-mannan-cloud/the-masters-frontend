import { motion } from "framer-motion";
import { fadeUpItem } from "../utils/motion";

// Deliberately has no `initial`/`animate` of its own — `variants` alone lets
// a parent dashboard orchestrate a staggered entrance (parent sets
// initial="hidden" animate="visible" with staggerChildren via
// utils/motion.js's `staggerContainer`; this picks it up automatically
// because the variant keys match, a pattern called "variant propagation").
const KpiCard = ({ icon: Icon, label, value, onClick }) => (
  <motion.div
    variants={fadeUpItem}
    onClick={onClick}
    whileHover={onClick ? { y: -3 } : undefined}
    whileTap={onClick ? { scale: 0.98 } : undefined}
    className={`bg-white rounded-2xl p-6 border border-stone-100 ${
      onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
    }`}
    style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
  >
    <div className="p-2.5 bg-primary/10 rounded-xl inline-flex mb-4">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <p className="text-3xl font-extrabold text-on-surface font-headline">
      {value}
    </p>
    <p className="text-sm text-on-surface-variant mt-1">{label}</p>
  </motion.div>
);

export default KpiCard;

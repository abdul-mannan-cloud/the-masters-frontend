// Small, shared Framer Motion variant vocabulary — reused wherever a group
// of items (KPI cards, table rows, list cards) should enter as one
// orchestrated stagger instead of each defining its own timing. Kept in its
// own file (not alongside a component) because this project's eslint config
// hard-errors on a component file exporting anything besides components
// (react-refresh/only-export-components).

// Wrap a list with: <motion.div variants={staggerContainer} initial="hidden" animate="visible">
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// Give each child: <motion.div variants={fadeUpItem}> — no initial/animate of
// its own, so it inherits "hidden"/"visible" from the container above
// (Framer Motion's "variant propagation").
export const fadeUpItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

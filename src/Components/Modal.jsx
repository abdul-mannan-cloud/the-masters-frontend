import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Rendered via a portal into document.body rather than in place — callers may
// mount this inside another <form> (e.g. the Customer DetailPanel), and a
// modal's inputs must not live inside that form's DOM subtree or an Enter
// keypress in the modal would submit the wrong form.
//
// Entrance/exit is Framer Motion, not the old (unused) `modal-in`/`backdrop-in`
// CSS keyframes — the exit animation only plays if the caller wraps its
// conditional render in <AnimatePresence>, e.g.
// `<AnimatePresence>{open && <Modal .../>}</AnimatePresence>`, since
// AnimatePresence needs to see the element leave, not just Modal unmount.
const Modal = ({ title, onClose, children, maxWidth = "max-w-lg" }) => {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <motion.div
        className={`w-full ${maxWidth} max-h-[85vh] bg-white rounded-2xl overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 20px 60px rgba(26,26,26,0.22)" }}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-extrabold text-on-surface font-headline">
            {title}
          </h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="p-1.5 text-stone-400 hover:text-on-surface hover:bg-stone-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
};

export default Modal;

import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Rendered via a portal into document.body rather than in place — callers may
// mount this inside another <form> (e.g. the Customer DetailPanel), and a
// modal's inputs must not live inside that form's DOM subtree or an Enter
// keypress in the modal would submit the wrong form.
const Modal = ({ title, onClose, children, maxWidth = "max-w-lg" }) => {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[85vh] bg-white rounded-2xl overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-on-surface font-headline">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-on-surface hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;

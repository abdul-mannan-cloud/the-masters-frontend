import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, HelpCircle } from "lucide-react";
import Modal from "../components/Modal";
import { ConfirmContext } from "./confirmContext";

// App-wide replacement for window.confirm — a browser-native dialog that
// can't be restyled and looks jarring next to the rest of the UI. Mounted
// once near the root (App.jsx) so any component can `await confirm(...)`
// via useConfirm() instead of prop-drilling a dialog through every page.
// Renders through the existing Modal component, not a parallel one.
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setRequest({
        message,
        title: options.title || "Are you sure?",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        // Most call sites are delete/deactivate-style actions — danger (red)
        // is the sensible default; pass `danger: false` for a neutral
        // confirmation like "Confirm this order?".
        danger: options.danger ?? true,
        resolve,
      });
    });
  }, []);

  const settle = (result) => {
    request?.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {request && (
          <Modal title={request.title} onClose={() => settle(false)} maxWidth="max-w-sm">
            <div className="flex items-start gap-3 mb-6">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  request.danger ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                }`}
              >
                {request.danger ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : (
                  <HelpCircle className="w-4.5 h-4.5" />
                )}
              </div>
              <p className="text-sm text-on-surface-variant pt-1.5">{request.message}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="px-4 py-2 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
              >
                {request.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                className={`px-4 py-2 font-bold rounded-full text-sm transition-colors ${
                  request.danger
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-primary text-on-primary hover:bg-primary-container"
                }`}
              >
                {request.confirmLabel}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

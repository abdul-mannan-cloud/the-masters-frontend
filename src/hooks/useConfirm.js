import { useContext } from "react";
import { ConfirmContext } from "../context/confirmContext";

// Drop-in replacement for window.confirm: `if (!(await confirm("..."))) return;`
// Returns a Promise<boolean> resolved by the user's choice in the app's own
// styled dialog (see context/ConfirmProvider.jsx) instead of the browser's
// native, unstyleable confirm() popup.
export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return confirm;
};

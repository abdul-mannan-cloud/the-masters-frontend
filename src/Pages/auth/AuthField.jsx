import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Floating-label field shared by Login and Signup only (not a global
// components/ export — the rest of the app still uses the plain
// label-above-input pattern; this is the flagship implementation the
// roadmap called out, not a full app-wide migration).
//
// `floated` is derived from local `focused` state OR a non-empty value
// rather than pure CSS `:placeholder-shown`, so the label position never
// depends on a browser/Tailwind pseudo-class quirk — it's driven by the same
// controlled `value` the form already tracks.
//
// `as` lets the same field shell wrap a custom input (PhoneInput) instead of
// a bare <input> — both accept value/onChange/placeholder/className/...rest,
// so AuthField doesn't need to know which one it's rendering.
const AuthField = ({ label, error, endAdornment, as: Component = "input", className = "", ...inputProps }) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || Boolean(inputProps.value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Component
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          className={`peer w-full font-body font-medium text-[15px] text-on-surface px-4 pt-5 pb-2 ${
            endAdornment ? "pr-11" : ""
          } border rounded-2xl bg-stone-50 outline-none transition-all duration-200 ${
            error
              ? "border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-400/15"
              : "border-stone-200 focus:border-primary focus:ring-4 focus:ring-primary/15"
          } focus:bg-white ${className}`}
        />
        <label
          className={`absolute left-4 pointer-events-none transition-all duration-200 ${
            floated
              ? `top-2 text-[11px] font-bold uppercase tracking-wider ${
                  focused ? "text-primary" : "text-on-surface-variant"
                }`
              : "top-3.5 text-[15px] text-stone-400"
          }`}
        >
          {label}
        </label>
        {endAdornment}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-red-600 px-1 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthField;

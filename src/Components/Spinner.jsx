const SIZES = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-4",
  lg: "w-8 h-8 border-4",
  xl: "w-10 h-10 border-4",
};

// "primary" tone (terracotta ring) for spinners sitting on a light
// background; "on-primary" (charcoal-on-terracotta ring, matching the new
// `on-primary` token) for spinners embedded inside a filled primary button.
const TONES = {
  primary: "border-primary/20 border-t-primary",
  "on-primary": "border-on-primary/30 border-t-on-primary",
};

// Was copy-pasted at 35+ call sites before this component existed — kept as
// one place now so the spin motion/timing only needs to be tuned once.
const Spinner = ({ size = "lg", tone = "primary", className = "" }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`rounded-full animate-spin ${SIZES[size]} ${TONES[tone]} ${className}`}
  />
);

export default Spinner;

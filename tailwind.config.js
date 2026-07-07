/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      // "Digital Tailor" palette: soft slate-blue background, deep navy accent.
      primary: "#1E3A8A",
      "primary-container": "#2748A3",
      "primary-fixed": "#D1FAE5",
      "primary-fixed-dim": "#A7F3D0",
      "on-primary": "#ffffff",
      "on-primary-container": "#EAF0FF",
      "on-primary-fixed": "#022C22",
      "on-primary-fixed-variant": "#065F46",
      "inverse-primary": "#A7C1F5",

      secondary: "#475569",
      "secondary-container": "#E2E8F0",
      "secondary-fixed": "#E2E8F0",
      "secondary-fixed-dim": "#CBD5E1",
      "on-secondary": "#ffffff",
      "on-secondary-container": "#334155",
      "on-secondary-fixed": "#1E293B",
      "on-secondary-fixed-variant": "#334155",

      tertiary: "#92400E",
      "tertiary-container": "#B45309",
      "tertiary-fixed": "#FEF3C7",
      "tertiary-fixed-dim": "#FDE68A",
      "on-tertiary": "#ffffff",
      "on-tertiary-container": "#FDE68A",
      "on-tertiary-fixed": "#451A03",
      "on-tertiary-fixed-variant": "#92400E",

      surface: "#F0F4F8",
      "surface-bright": "#F0F4F8",
      "surface-dim": "#D8E0EA",
      "surface-variant": "#E2E8F0",
      "surface-tint": "#1E3A8A",
      "surface-container-lowest": "#ffffff",
      "surface-container-low": "#E8EDF3",
      "surface-container": "#E2E8F0",
      "surface-container-high": "#D8E0EA",
      "surface-container-highest": "#CBD5E1",

      "on-surface": "#1E293B",
      "on-surface-variant": "#64748B",
      "inverse-surface": "#1E293B",
      "inverse-on-surface": "#F0F4F8",

      background: "#F0F4F8",
      "on-background": "#1E293B",

      outline: "#94A3B8",
      "outline-variant": "#CBD5E1",

      error: "#DC2626",
      "error-container": "#FEE2E2",
      "on-error": "#ffffff",
      "on-error-container": "#991B1B",
    },
    fontFamily: {
      headline: ['"Plus Jakarta Sans"', "sans-serif"],
      body: ["Manrope", "sans-serif"],
      label: ["Manrope", "sans-serif"],
    },
    borderRadius: {
      DEFAULT: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px",
    },
    boxShadow: {
      ambient: "0 12px 40px rgba(25, 28, 27, 0.06)",
    },
    animation: {
      "modal-in": "modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      "backdrop-in": "fade-in 0.18s ease-out",
      "toast-in": "toast-slide-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      "fade-up": "fade-up 0.3s ease-out",
    },
    keyframes: {
      "modal-in": {
        "0%": { opacity: "0", transform: "scale(0.93) translateY(12px)" },
        "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
      },
      "fade-in": {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      "toast-slide-in": {
        "0%": { opacity: "0", transform: "translateY(-8px) scale(0.97)" },
        "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
      },
      "fade-up": {
        "0%": { opacity: "0", transform: "translateY(6px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
    },
  },
};
export const plugins = [];

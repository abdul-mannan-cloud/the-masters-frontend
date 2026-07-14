/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      // "Digital Tailor" palette: warm cream surfaces, deep pine-green
      // accent, terracotta/gold highlights — matches the login/signup
      // boutique look (see pages/auth/login.jsx, signup.jsx).
      primary: "#1F3A32",
      "primary-container": "#2C4F44",
      "primary-fixed": "#D9EAE2",
      "primary-fixed-dim": "#B9D9CB",
      "on-primary": "#FAF6EF",
      "on-primary-container": "#EAF3EE",
      "on-primary-fixed": "#0B1714",
      "on-primary-fixed-variant": "#1F3A32",
      "inverse-primary": "#9FC9B6",

      secondary: "#C06B4A",
      "secondary-container": "#F3E4DC",
      "secondary-fixed": "#F3E4DC",
      "secondary-fixed-dim": "#E9C9B8",
      "on-secondary": "#ffffff",
      "on-secondary-container": "#7A3F29",
      "on-secondary-fixed": "#4A2416",
      "on-secondary-fixed-variant": "#8A4A30",

      tertiary: "#B4863A",
      "tertiary-container": "#F7E9D2",
      "on-tertiary": "#2A2016",
      "on-tertiary-container": "#6B4E22",
      "tertiary-fixed": "#F7E9D2",
      "tertiary-fixed-dim": "#EBCE9A",
      "on-tertiary-fixed": "#3D2C10",
      "on-tertiary-fixed-variant": "#8A6423",

      surface: "#FAF6EF",
      "surface-bright": "#FFFFFF",
      "surface-dim": "#EFE7D8",
      "surface-variant": "#F1E9DC",
      "surface-tint": "#1F3A32",
      "surface-container-lowest": "#ffffff",
      "surface-container-low": "#FBF9F5",
      "surface-container": "#F3EEE3",
      "surface-container-high": "#ECE4D4",
      "surface-container-highest": "#E3D9C4",

      "on-surface": "#2A2521",
      "on-surface-variant": "#8A8178",
      "inverse-surface": "#2A2521",
      "inverse-on-surface": "#FAF6EF",

      background: "#FAF6EF",
      "on-background": "#2A2521",

      outline: "#B4AB9F",
      "outline-variant": "#E7E0D6",

      error: "#B3261E",
      "error-container": "#FBEAE9",
      "on-error": "#ffffff",
      "on-error-container": "#7A1D17",
    },
    fontFamily: {
      headline: ['"Plus Jakarta Sans"', "sans-serif"],
      body: ["Manrope", "sans-serif"],
      label: ["Manrope", "sans-serif"],
      newsreader: ['"Newsreader"', "Georgia", "serif"],
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
<<<<<<< HEAD
};
export const plugins = [];
=======
  plugins: [],
}
>>>>>>> 674a39fd98497bc4c9929132ba4f21b9dca91da5

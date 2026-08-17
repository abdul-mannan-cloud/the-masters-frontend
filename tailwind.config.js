/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      // "The Masters" premium tailoring palette — Ethereal Alabaster
      // background, Pressed Cashmere surfaces, Charcoal Ink text, Antique
      // Terracotta accent. `on-primary` is charcoal (not white) deliberately:
      // white-on-terracotta measures ~3.4:1 contrast (fails WCAG AA body
      // text), charcoal-on-terracotta measures ~5.1:1 (passes) and reads
      // more editorial than a stock white SaaS button anyway.
      primary: "#C07A65",
      "primary-container": "#F3E1DA",
      "on-primary": "#1A1A1A",
      "on-primary-container": "#7A4636",
      "inverse-primary": "#E7B8A9",

      // Quiet ink accent for secondary/ghost actions — the brief specifies
      // one accent color (terracotta), so secondary intentionally stays
      // neutral rather than introducing an unrelated second hue.
      secondary: "#3B342F",
      "secondary-container": "#EAE6E1",
      "on-secondary": "#FBF9F6",
      "on-secondary-container": "#3B342F",

      // Soft antique gold-beige, used sparingly (dividers, subtle chips) —
      // never competes with terracotta as the loud accent.
      tertiary: "#A98F72",
      "tertiary-container": "#F1EDE7",
      "on-tertiary": "#1A1A1A",
      "on-tertiary-container": "#5C4A36",

      surface: "#EAE6E1",
      "surface-variant": "#F3EFEA",
      "surface-container-low": "#F6F3EE",
      "surface-container-high": "#E1DCD4",

      "on-surface": "#1A1A1A",
      "on-surface-variant": "#6B655D",
      "inverse-surface": "#1A1A1A",
      "inverse-on-surface": "#FBF9F6",

      background: "#FBF9F6",
      "on-background": "#1A1A1A",

      outline: "#D8D1C7",
      "outline-variant": "#EAE6E1",

      success: "#4A7A5E",
      "success-container": "#E3ECE6",
      "on-success": "#FBF9F6",
      "on-success-container": "#2E4E3B",

      warning: "#A8813D",
      "warning-container": "#F3E9D6",
      "on-warning": "#1A1A1A",
      "on-warning-container": "#6B4E22",

      error: "#9B4136",
      "error-container": "#F5DFDB",
      "on-error": "#FBF9F6",
      "on-error-container": "#5F271F",

      // Overrides Tailwind's default `stone`/`red`/`amber`/`emerald` scales
      // rather than leaving them as-is. ~40 of the app's 54 files style
      // themselves with these defaults directly (input backgrounds, borders,
      // muted text, delete buttons, warning/success states) instead of the
      // named tokens above — remapping the scales here retints all of that
      // instantly, with zero changes to those files. 50 and 900 are pinned
      // to the exact background/ink anchors so the two systems agree.
      stone: {
        50: "#FBF9F6",
        100: "#F3EFEA",
        200: "#EAE6E1",
        300: "#D8D1C7",
        400: "#B0A79A",
        500: "#8C8175",
        600: "#6B655D",
        700: "#4A453F",
        800: "#2E2A26",
        900: "#1A1A1A",
      },
      red: {
        50: "#FBF1EF",
        100: "#F5DFDB",
        200: "#EAC0B8",
        300: "#DB9A8E",
        400: "#C97362",
        500: "#B3574A",
        600: "#9B4136",
        700: "#7E332A",
        800: "#5F271F",
        900: "#3D1915",
      },
      amber: {
        50: "#FBF3E7",
        100: "#F3E3C9",
        200: "#E8CB9C",
        300: "#DCB06D",
        400: "#C99A4E",
        500: "#A8813D",
        600: "#8C6A2F",
        700: "#6E5325",
        800: "#4F3B1A",
        900: "#322510",
      },
      emerald: {
        50: "#EEF3EF",
        100: "#DCE7DF",
        200: "#B9CFC0",
        300: "#93B39F",
        400: "#6E9880",
        500: "#4A7A5E",
        600: "#3A6249",
        700: "#2C4B38",
        800: "#1E3527",
        900: "#0F1D15",
      },
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
    // Card/elevated/modal replace the old ad hoc inline `style={{ boxShadow:
    // "..." }}` props (still present at ~40 call sites, now ink-tinted —
    // see index.css) with real utility classes for anything written from
    // here on, so shadow depth stays a token, not a copy-pasted string.
    boxShadow: {
      card: "0 4px 20px rgba(26,26,26,0.05)",
      elevated: "0 4px 20px rgba(26,26,26,0.08)",
      modal: "0 20px 60px rgba(26,26,26,0.22)",
    },
    // "modal-in"/"backdrop-in"/"toast-in" (previously defined, never wired to
    // any component) are retired in favor of Framer Motion, which now owns
    // Modal's enter/exit. "fade-up" and "shimmer" stay CSS-only: they're
    // cheap, GPU-friendly, and used in places that don't need JS-driven
    // orchestration (row entrance, skeleton loaders).
    animation: {
      "fade-up": "fade-up 0.3s ease-out",
      shimmer: "shimmer 1.6s ease-in-out infinite",
    },
    keyframes: {
      "fade-up": {
        "0%": { opacity: "0", transform: "translateY(6px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      shimmer: {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
    },
  },
};
export const plugins = [];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary":                    "#003629",
        "primary-container":          "#1b4d3e",
        "primary-fixed":              "#baeed9",
        "primary-fixed-dim":          "#9ed1bd",
        "on-primary":                 "#ffffff",
        "on-primary-container":       "#8abda9",
        "on-primary-fixed":           "#002117",
        "on-primary-fixed-variant":   "#1d4f40",
        "inverse-primary":            "#9ed1bd",

        "secondary":                  "#586062",
        "secondary-container":        "#dae1e3",
        "secondary-fixed":            "#dde4e6",
        "secondary-fixed-dim":        "#c1c8ca",
        "on-secondary":               "#ffffff",
        "on-secondary-container":     "#5d6466",
        "on-secondary-fixed":         "#161d1f",
        "on-secondary-fixed-variant": "#41484a",

        "tertiary":                   "#3e2b00",
        "tertiary-container":         "#5b4000",
        "tertiary-fixed":             "#ffdea5",
        "tertiary-fixed-dim":         "#e9c176",
        "on-tertiary":                "#ffffff",
        "on-tertiary-container":      "#d3ad64",
        "on-tertiary-fixed":          "#261900",
        "on-tertiary-fixed-variant":  "#5d4201",

        "surface":                    "#f9faf7",
        "surface-bright":             "#f9faf7",
        "surface-dim":                "#d9dad8",
        "surface-variant":            "#e2e3e0",
        "surface-tint":               "#376757",
        "surface-container-lowest":   "#ffffff",
        "surface-container-low":      "#f3f4f1",
        "surface-container":          "#edeeeb",
        "surface-container-high":     "#e7e8e6",
        "surface-container-highest":  "#e2e3e0",

        "on-surface":                 "#191c1b",
        "on-surface-variant":         "#404945",
        "inverse-surface":            "#2e312f",
        "inverse-on-surface":         "#f0f1ee",

        "background":                 "#f9faf7",
        "on-background":              "#191c1b",

        "outline":                    "#707974",
        "outline-variant":            "#c0c9c3",

        "error":                      "#ba1a1a",
        "error-container":            "#ffdad6",
        "on-error":                   "#ffffff",
        "on-error-container":         "#93000a",
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:     ['Manrope', 'sans-serif'],
        label:    ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },
      boxShadow: {
        'ambient': '0 12px 40px rgba(25, 28, 27, 0.06)',
      },
      animation: {
        'modal-in':   'modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        'backdrop-in': 'fade-in 0.18s ease-out',
        'toast-in':   'toast-slide-in 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-up':    'fade-up 0.3s ease-out',
      },
      keyframes: {
        'modal-in': {
          '0%':   { opacity: '0', transform: 'scale(0.93) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-slide-in': {
          '0%':   { opacity: '0', transform: 'translateY(-8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

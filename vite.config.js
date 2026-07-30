import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Vite validates the Host header against a fixed allowlist by default
    // (localhost/127.0.0.1/[::1] only) to block DNS-rebinding attacks — a
    // leading dot allows a whole subdomain family, needed here so
    // "alitailors.localhost:5173" (tenant subdomain routing in dev) isn't
    // rejected before it ever reaches the app.
    allowedHosts: ['.localhost'],
  },
})

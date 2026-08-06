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
    //
    // A business's own simulated custom domain (see utils/tenantHost.js and
    // README-style notes in the same PR) needs its exact hostname added here
    // too, one entry per domain under local test — Vite's allowedHosts only
    // supports literal hostnames or a leading-dot wildcard, not a general
    // pattern, so there's no way to allow "any future business domain" without
    // disabling the check entirely (`allowedHosts: true`, not done here since
    // it drops the DNS-rebinding protection this option exists for).
    allowedHosts: ['.localhost', 'pakistan-tailors.com'],
  },
})

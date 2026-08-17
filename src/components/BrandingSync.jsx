import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_APP_NAME, DEFAULT_LOGO, DEFAULT_TENANT_FALLBACK } from "../utils/branding";

const FAVICON_ID = "app-favicon";

// Keeps the browser tab's title/favicon in sync with the logged-in tenant.
// Reads `tenant`/`user` straight from AuthContext (already loaded on
// login/refresh, cleared on logout) instead of fetching anything of its own
// — see AuthContext.jsx's loadTenant/logout for where that state actually
// changes. Mounted once near the root (App.jsx), so it keeps working across
// route navigation without re-running per page.
const BrandingSync = () => {
  const { user, tenant } = useAuth();

  useEffect(() => {
    // Same reservation as Sidebar.jsx: "Digital Tailor" is the platform's own
    // name, shown only for super_admin (no business of its own). A
    // tenant-scoped account gets its real business name, or "Business" as a
    // transient placeholder — never the platform name.
    document.title =
      user?.role === "super_admin"
        ? DEFAULT_APP_NAME
        : tenant?.businessName || DEFAULT_TENANT_FALLBACK;

    const faviconLink = document.getElementById(FAVICON_ID);
    if (!faviconLink) return;

    if (tenant?.logo) {
      // Tenant logos are arbitrary uploaded images (Cloudinary, any format),
      // not necessarily SVG like the default — drop the `type` hint so the
      // browser sniffs the real content type instead of rejecting it as a
      // mismatch.
      faviconLink.removeAttribute("type");
      faviconLink.href = tenant.logo;
    } else {
      faviconLink.type = "image/svg+xml";
      faviconLink.href = DEFAULT_LOGO;
    }
  }, [user, tenant]);

  return null;
};

export default BrandingSync;

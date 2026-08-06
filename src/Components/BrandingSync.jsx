import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_APP_NAME, DEFAULT_LOGO } from "../utils/branding";

const FAVICON_ID = "app-favicon";

// Keeps the browser tab's title/favicon in sync with the logged-in tenant.
// Reads `tenant` straight from AuthContext (already loaded on login/refresh,
// cleared on logout) instead of fetching anything of its own — see
// AuthContext.jsx's loadTenant/logout for where that state actually changes.
// Mounted once near the root (App.jsx), so it keeps working across route
// navigation without re-running per page.
const BrandingSync = () => {
  const { tenant } = useAuth();

  useEffect(() => {
    document.title = tenant?.businessName || DEFAULT_APP_NAME;

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
  }, [tenant]);

  return null;
};

export default BrandingSync;

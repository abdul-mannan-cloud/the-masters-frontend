import { useParams } from "react-router-dom";
import { getTenantHostSlug } from "../utils/tenantHost";

// The tenant slug this page/route expects to be showing, however it got
// there — the host itself (a platform subdomain like alitailors.localhost,
// or a business's own custom domain like pakistan-tailors.com; either way
// tenant-scoped routes are mounted at bare paths) takes priority when
// present; otherwise falls back to the :tenantSlug path param (the original
// /:tenantSlug/... routing, unchanged). Returns null if neither is present
// (e.g. super_admin's own bare routes).
export const useExpectedTenantSlug = () => {
  const { tenantSlug: paramSlug } = useParams();
  const hostSlug = getTenantHostSlug();
  return hostSlug || paramSlug || null;
};

import { useParams } from "react-router-dom";
import { getTenantSubdomain } from "../utils/subdomain";

// The tenant slug this page/route expects to be showing, however it got
// there — a subdomain (alitailors.localhost, tenant-scoped routes mounted at
// bare paths) takes priority when present; otherwise falls back to the
// :tenantSlug path param (the original /:tenantSlug/... routing, unchanged).
// Returns null if neither is present (e.g. super_admin's own bare routes).
export const useExpectedTenantSlug = () => {
  const { tenantSlug: paramSlug } = useParams();
  const subdomainSlug = getTenantSubdomain();
  return subdomainSlug || paramSlug || null;
};

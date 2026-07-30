// Resolves which tenant (if any) the current browser hostname belongs to.
// VITE_APP_BASE_DOMAIN is the platform's own root domain — "localhost" in
// dev (so alitailors.localhost:5173 resolves to slug "alitailors" with no
// DNS/hosts-file setup at all, since browsers natively route any *.localhost
// hostname to 127.0.0.1), or e.g. "digitaltailor.com" once a real domain is
// configured. Path-based /:tenantSlug/ routing (see useExpectedTenantSlug)
// keeps working wherever this resolves to null — bare "localhost" or any
// host that isn't a recognized subdomain of BASE_DOMAIN.
const BASE_DOMAIN = import.meta.env.VITE_APP_BASE_DOMAIN || "localhost";

// Reserved for the platform itself — never a tenant's business slug, even if
// a tenant somehow registered that literal name.
const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin"];

// IPv4/IPv6-literal hostnames (e.g. a raw LAN IP during testing) never carry
// a tenant subdomain.
const isIpAddress = (hostname) => /^[0-9.]+$/.test(hostname) || hostname.includes(":");

export const getTenantSubdomain = () => {
  const hostname = window.location.hostname;
  if (isIpAddress(hostname)) return null;
  if (hostname === BASE_DOMAIN) return null;
  if (!hostname.endsWith(`.${BASE_DOMAIN}`)) return null;

  const prefix = hostname.slice(0, hostname.length - BASE_DOMAIN.length - 1);
  // Only a single-level subdomain counts as a tenant slug ("alitailors") —
  // anything deeper ("a.b.localhost") isn't a recognized shape.
  if (prefix === "" || prefix.includes(".")) return null;
  if (RESERVED_SUBDOMAINS.includes(prefix.toLowerCase())) return null;

  return prefix;
};

export const isSubdomainMode = () => getTenantSubdomain() !== null;

// The origin (protocol+host+port) for a given tenant slug — needed for an
// actual cross-host browser navigation (e.g. sending a user to a different
// business's own subdomain), which client-side router navigation cannot do
// since it never leaves the current host.
export const buildTenantOrigin = (slug) => {
  const { protocol, port } = window.location;
  return `${protocol}//${slug}.${BASE_DOMAIN}${port ? `:${port}` : ""}`;
};

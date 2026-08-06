// Resolves which tenant (if any) the current browser hostname belongs to.
// Two shapes are recognized — both mean "the host itself IS the tenant", as
// opposed to /:tenantSlug/... path-based routing (which keeps working
// wherever neither shape matches — see useExpectedTenantSlug):
//
// 1. A subdomain of the platform's own base domain — VITE_APP_BASE_DOMAIN,
//    "localhost" in dev (browsers natively route any *.localhost hostname to
//    127.0.0.1, no DNS/hosts-file setup needed) or e.g. "digitaltailor.com"
//    once a real platform domain is configured. alitailors.localhost ->
//    slug "alitailors".
//
// 2. A business's own full custom domain, by convention <slug>.<tld> ->
//    everything before the last dot is the slug. pakistan-tailors.com ->
//    slug "pakistan-tailors". This is a naming CONVENTION, not verified
//    domain ownership — a real custom-domain feature would need a stored,
//    DNS-verified Tenant.customDomain field and per-domain TLS provisioning.
//    Out of scope here, but this function is the one seam the whole app goes
//    through to turn "hostname" into "tenant slug" — swapping the convention
//    below for a lookup against a stored field later touches nothing else.
const BASE_DOMAIN = import.meta.env.VITE_APP_BASE_DOMAIN || "localhost";

// Reserved for the platform itself — never a tenant's business slug, even if
// a tenant somehow registered that literal name.
const RESERVED_HOST_SLUGS = ["www", "app", "api", "admin"];

// IPv4/IPv6-literal hostnames (e.g. a raw LAN IP during testing) never carry
// a tenant slug.
const isIpAddress = (hostname) => /^[0-9.]+$/.test(hostname) || hostname.includes(":");

const subdomainOfBaseDomain = (hostname) => {
  if (!hostname.endsWith(`.${BASE_DOMAIN}`)) return null;
  const prefix = hostname.slice(0, hostname.length - BASE_DOMAIN.length - 1);
  // Only a single-level subdomain counts as a tenant slug ("alitailors") —
  // anything deeper ("a.b.localhost") isn't a recognized shape.
  if (prefix === "" || prefix.includes(".")) return null;
  return prefix;
};

// <slug>.<tld> — exactly one dot, everything before it is the slug.
// Deliberately narrow (single TLD segment) to match the shape this feature
// promises (pakistan-tailors.com), not two-part TLDs (pakistan-tailors.co.uk).
const customDomainSlug = (hostname) => {
  const parts = hostname.split(".");
  if (parts.length !== 2) return null;
  return parts[0];
};

export const getTenantHostSlug = () => {
  const hostname = window.location.hostname;
  if (isIpAddress(hostname)) return null;
  if (hostname === BASE_DOMAIN) return null; // the platform's own root, never a tenant

  const slug = subdomainOfBaseDomain(hostname) ?? customDomainSlug(hostname);
  if (!slug) return null;
  if (RESERVED_HOST_SLUGS.includes(slug.toLowerCase())) return null;

  return slug;
};

export const isTenantHostMode = () => getTenantHostSlug() !== null;

// The origin (protocol+host+port) for a given tenant slug on the PLATFORM's
// own base domain — needed for an actual cross-host browser navigation (e.g.
// sending a user to a different business's own subdomain), which
// client-side router navigation cannot do since it never leaves the current
// host. Deliberately doesn't guess a tenant's own custom domain — this app
// doesn't store one yet (see the module comment above).
export const buildTenantOrigin = (slug) => {
  const { protocol, port } = window.location;
  return `${protocol}//${slug}.${BASE_DOMAIN}${port ? `:${port}` : ""}`;
};

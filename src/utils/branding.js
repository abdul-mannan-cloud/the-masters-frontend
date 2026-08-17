// Shared fallback branding — used by the Sidebar, browser tab title, and
// favicon so all three fall back to the same thing when no tenant is loaded
// (logged out, or a super_admin account with no business of its own).
export const DEFAULT_APP_NAME = "Digital Tailor";
export const DEFAULT_LOGO = "/favicon.svg";

// For a tenant-scoped account (tenant_admin/manager/employee) whose tenant
// hasn't finished loading yet, or whose businessName is genuinely unset —
// a transient/generic placeholder, deliberately NOT DEFAULT_APP_NAME. That
// name is reserved for super_admin, who has no business of its own; a real
// business's sidebar should never show the platform's own name as a stand-in.
export const DEFAULT_TENANT_FALLBACK = "Business";

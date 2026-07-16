import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  LogOut,
  Shirt,
  Layers,
  UserCog,
  Building2,
  ShieldCheck,
  Info,
  Boxes,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// `module` gates on the logged-in user's permission grid (view access) for
// tenant_admin/employee/manager accounts; `roles` hard-gates to specific
// coarse account roles regardless of permissions. Items with neither are
// always visible to any authenticated user.
const ALL_NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Tenants", path: "/tenants", icon: Building2, roles: ["super_admin"] },
  { name: "Customers", path: "/customers", icon: Users, module: "customers" },
  { name: "Orders", path: "/orders", icon: ShoppingCart, module: "orders" },
  { name: "Product Types", path: "/product-types", icon: Layers, module: "productTypes" },
  { name: "Inventory", path: "/inventory", icon: Boxes, module: "inventory" },
  { name: "Employees", path: "/employees", icon: UserCog, module: "employees" },
  { name: "Roles", path: "/roles", icon: ShieldCheck, roles: ["tenant_admin"] },
  {
    name: "Business Info",
    path: "/business-info",
    icon: Info,
    roles: ["tenant_admin", "manager", "employee"],
  },
];

// collapsed = desktop icon-only rail (persists across sessions, since it's a
// per-user workspace preference, not per-visit). mobileOpen/onCloseMobile
// drive the small-screen off-canvas drawer variant — see Layout.jsx, which
// owns both pieces of state since Topbar's hamburger needs to reach mobileOpen.
const Sidebar = ({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) => {
  const { user, permissions, tenant, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.roles) return item.roles.includes(user?.role);
    if (!item.module) return true;
    // Tenant-scoped modules (Customers/Orders/...) never apply to the
    // platform owner — super_admin only gets Dashboard + Tenants above.
    if (user?.role === "super_admin") return false;
    if (user?.role === "tenant_admin") return true;
    return permissions?.[item.module]?.view === true;
  }).map((item) => ({
    ...item,
    // "/tenants" is the platform-level, unprefixed route (super_admin only)
    // — every other nav target lives under the current tenant's slug.
    path: item.path === "/tenants" || !tenant ? item.path : `/${tenant.slug}${item.path}`,
  }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const content = (
    <>
      <div
        className={`px-6 py-7 flex items-center gap-2.5 border-b border-stone-100 ${
          collapsed ? "lg:px-0 lg:justify-center" : ""
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Shirt className="w-5 h-5 text-on-primary" />
        </div>
        <div className={collapsed ? "lg:hidden" : ""}>
          <div className="text-base font-extrabold text-on-surface font-headline leading-tight">
            Digital Tailor
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
            Workshop Suite
          </div>
        </div>
      </div>

      {tenant && (
        <div
          className={`px-6 py-4 flex items-center gap-2.5 border-b border-stone-100 ${
            collapsed ? "lg:px-0 lg:justify-center" : ""
          }`}
        >
          {tenant.logo ? (
            <img
              src={tenant.logo}
              alt={`${tenant.businessName} logo`}
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-xs font-bold text-stone-400">
              {tenant.businessName?.[0]?.toUpperCase()}
            </div>
          )}
          <div
            className={`text-sm font-bold text-on-surface truncate ${collapsed ? "lg:hidden" : ""}`}
            title={tenant.businessName}
          >
            {tenant.businessName}
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              title={collapsed ? item.name : undefined}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? "lg:justify-center lg:px-0" : ""
              } ${isActive ? "text-primary font-bold" : "text-stone-500 hover:text-on-surface"}`}
            >
              {isActive && (
                // Shared layoutId — Framer Motion animates this pill sliding
                // between nav items across renders instead of it just
                // appearing/disappearing, as long as only one is mounted
                // with this id at a time.
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <motion.span
                whileHover={{ x: collapsed ? 0 : 2 }}
                transition={{ duration: 0.15 }}
                className="relative z-10 flex items-center gap-3"
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{item.name}</span>
              </motion.span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-100">
        {user?.email && (
          <p
            className={`px-4 pb-2 text-xs text-stone-400 truncate ${collapsed ? "lg:hidden" : ""}`}
            title={user.email}
          >
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
        </button>

        <button
          onClick={onToggleCollapsed}
          className={`hidden lg:flex w-full items-center gap-3 mt-1 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-50 hover:text-on-surface transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? <ChevronsRight className="w-4.5 h-4.5" /> : <ChevronsLeft className="w-4.5 h-4.5" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop rail — width animates between collapsed/expanded */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 256 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 h-screen shrink-0 bg-white border-r border-stone-200 overflow-y-auto overflow-x-hidden hidden lg:flex flex-col"
      >
        {content}
      </motion.aside>

      {/* Mobile drawer — off-canvas, backdrop + slide-in */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm lg:hidden"
              onClick={onCloseMobile}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white overflow-y-auto flex flex-col lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

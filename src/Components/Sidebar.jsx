import { NavLink, useNavigate } from "react-router-dom";
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
  { name: "Employees", path: "/employees", icon: UserCog, module: "employees" },
  { name: "Roles", path: "/roles", icon: ShieldCheck, roles: ["tenant_admin"] },
  {
    name: "Business Info",
    path: "/business-info",
    icon: Info,
    roles: ["tenant_admin", "manager", "employee"],
  },
];

const Sidebar = () => {
  const { user, permissions, tenant, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.roles) return item.roles.includes(user?.role);
    if (!item.module) return true;
    // Tenant-scoped modules (Customers/Orders/...) never apply to the
    // platform owner — super_admin only gets Dashboard + Tenants above.
    if (user?.role === "super_admin") return false;
    if (user?.role === "tenant_admin") return true;
    return permissions?.[item.module]?.view === true;
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 bg-white border-r border-stone-200 overflow-y-auto flex flex-col">
      <div className="px-6 py-7 flex items-center gap-2.5 border-b border-stone-100">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Shirt className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-extrabold text-on-surface font-headline leading-tight">
            Digital Tailor
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
            Workshop Suite
          </div>
        </div>
      </div>

      {tenant && (
        <div className="px-6 py-4 flex items-center gap-2.5 border-b border-stone-100">
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
            className="text-sm font-bold text-on-surface truncate"
            title={tenant.businessName}
          >
            {tenant.businessName}
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-stone-500 hover:bg-stone-50 hover:text-on-surface"
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-100">
        {user?.email && (
          <p
            className="px-4 pb-2 text-xs text-stone-400 truncate"
            title={user.email}
          >
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

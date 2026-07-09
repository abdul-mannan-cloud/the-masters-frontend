import { useLocation, useParams } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const TITLES = [
  ["/dashboard", "Dashboard"],
  ["/customers", "Customers"],
  ["/orders", "Orders"],
  ["/product-types", "Product Types"],
  ["/employees", "Employees"],
  ["/tenants", "Tenants"],
  ["/roles", "Roles"],
  ["/business-info", "Business Info"],
];

const Topbar = () => {
  const location = useLocation();
  const { tenantSlug } = useParams();
  const { user } = useAuth();
  // Every tenant-scoped route is prefixed with "/:tenantSlug" — strip it
  // before matching, since TITLES paths are unprefixed.
  const pathForMatch = tenantSlug
    ? location.pathname.replace(`/${tenantSlug}`, "")
    : location.pathname;
  const title =
    TITLES.find(([path]) => pathForMatch.startsWith(path))?.[1] || "";
  const initials = user?.email?.[0]?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-stone-200">
      <h1 className="text-lg font-bold text-on-surface font-headline">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -transtone-y-1/2" />
          <input
            type="text"
            placeholder="Search…"
            className="pl-9 pr-4 py-2 w-56 bg-stone-100 rounded-full text-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-stone-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <span className="hidden md:block text-sm font-medium text-on-surface truncate max-w-40">
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

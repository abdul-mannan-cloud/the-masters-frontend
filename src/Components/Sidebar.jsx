import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingCart, Ruler, LogOut, Shirt, Layers, UserCog } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Measurements", path: "/measurements", icon: Ruler },
  { name: "Product Types", path: "/product-types", icon: Layers },
  { name: "Employees", path: "/employees", icon: UserCog },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
      <div className="px-6 py-7 flex items-center gap-2.5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
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

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-on-surface"
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        {user?.email && (
          <p className="px-4 pb-2 text-xs text-slate-400 truncate" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

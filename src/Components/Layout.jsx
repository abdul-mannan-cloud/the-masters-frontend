import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "Customers", path: "/customers", icon: "person" },
  { name: "Orders", path: "/orders", icon: "shopping_cart" },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-surface font-body">
      <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-surface-container-low overflow-y-auto border-r border-outline-variant/10">
        <div className="flex flex-col h-full">
          <div className="px-8 py-8">
            <div className="text-xl font-bold tracking-widest text-primary uppercase font-headline">
              The Masters
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mt-1 font-label">
              Digital Tailor
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar-item-active w-full text-left block"
                    : "sidebar-item w-full text-left block"
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 mt-auto space-y-1">
            {user?.email && (
              <p className="px-4 pb-2 text-xs text-stone-400 truncate" title={user.email}>
                {user.email}
              </p>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-150 cursor-pointer text-error hover:bg-error-container/20"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

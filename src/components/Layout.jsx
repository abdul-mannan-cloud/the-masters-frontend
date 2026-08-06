import { useEffect, useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Persisted across sessions — a collapsed sidebar is a per-user workspace
// preference, not something that should reset on every reload.
const COLLAPSE_KEY = "ciseauxSidebarCollapsed";

const Layout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  // Tracks the pathname the drawer-closed state was last synced to. Adjusting
  // state during render (React's documented pattern for "reset state when a
  // prop changes") instead of in a useEffect — this repo's lint config
  // (react-hooks/set-state-in-effect) hard-errors on a bare setState call
  // inside an effect body, since it causes an extra render pass.
  const [syncedPathname, setSyncedPathname] = useState(location.pathname);
  if (location.pathname !== syncedPathname) {
    setSyncedPathname(location.pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0">
          {/* Keyed on pathname so a route change is a distinct AnimatePresence
              exit/enter pair rather than the same element updating in place —
              a brief fade is enough to signal "new page", full slide
              transitions read as slow/heavy for an internal data tool. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;

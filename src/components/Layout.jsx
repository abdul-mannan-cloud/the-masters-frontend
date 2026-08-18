import { useEffect, useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Persisted across sessions — a collapsed sidebar is a per-user workspace
// preference, not something that should reset on every reload.
const COLLAPSE_KEY = "ciseauxSidebarCollapsed";

// A 24-char hex segment is always a Mongo ObjectId (a selected row's id in a
// list+detail page like Customers, never a meaningful route distinction on
// its own), and "new" is the create-mode equivalent. Stripping both from the
// animation key means selecting a different row/creating new doesn't replay
// the page-enter transition — which, for pages where the list and detail
// share one component (CustomerList renders both), previously forced a full
// remount on every selection: the entire customer list re-fetched and
// flashed its loading skeleton just from clicking a different row's "view"
// icon. Genuinely different pages (different pathname after stripping) still
// transition normally.
const OBJECT_ID_SEGMENT = /^[0-9a-f]{24}$/i;
const getAnimationKey = (pathname) =>
  pathname
    .split("/")
    .filter((segment) => segment !== "new" && !OBJECT_ID_SEGMENT.test(segment))
    .join("/");

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
              key={getAnimationKey(location.pathname)}
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

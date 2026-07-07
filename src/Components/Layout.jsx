import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = () => (
  <div className="flex min-h-screen bg-surface font-body">
    <Sidebar />
    <div className="flex-1 min-w-0 flex flex-col">
      <Topbar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;

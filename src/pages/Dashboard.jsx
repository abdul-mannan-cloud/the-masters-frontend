import { useAuth } from "../hooks/useAuth";
import SuperAdminDashboard from "./dashboard/SuperAdminDashboard";
import OwnerDashboard from "./dashboard/OwnerDashboard";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "super_admin") return <SuperAdminDashboard />;
  if (user?.role === "tenant_admin") return <OwnerDashboard />;
  return <EmployeeDashboard />;
};

export default Dashboard;

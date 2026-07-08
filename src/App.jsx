import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/auth/login.jsx";
import CreateAccount from "./pages/auth/signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Measurements from "./pages/Measurements.jsx";
import BusinessInfo from "./pages/BusinessInfo.jsx";
import CustomerList from "./pages/customers/List.jsx";
import OrderList from "./pages/orders/List.jsx";
import OrderForm from "./pages/orders/Form.jsx";
import OrderView from "./pages/orders/View.jsx";
import ProductTypeList from "./pages/productTypes/List.jsx";
import ProductTypeForm from "./pages/productTypes/Form.jsx";
import ProductTypeView from "./pages/productTypes/View.jsx";
import EmployeeList from "./pages/employees/List.jsx";
import EmployeeForm from "./pages/employees/Form.jsx";
import EmployeeView from "./pages/employees/View.jsx";
import TenantList from "./pages/tenants/List.jsx";
import TenantForm from "./pages/tenants/Form.jsx";
import TenantView from "./pages/tenants/View.jsx";
import RoleList from "./pages/roles/List.jsx";
import RoleForm from "./pages/roles/Form.jsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<CreateAccount />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/:id" element={<CustomerList />} />

              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/orders/:id" element={<OrderView />} />

              <Route path="/measurements" element={<Measurements />} />

              <Route path="/product-types" element={<ProductTypeList />} />
              <Route path="/product-types/new" element={<ProductTypeForm />} />
              <Route
                path="/product-types/:id/edit"
                element={<ProductTypeForm />}
              />
              <Route path="/product-types/:id" element={<ProductTypeView />} />

              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id/edit" element={<EmployeeForm />} />
              <Route path="/employees/:id" element={<EmployeeView />} />

              <Route path="/business-info" element={<BusinessInfo />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["super_admin"]} />}>
            <Route element={<Layout />}>
              <Route path="/tenants" element={<TenantList />} />
              <Route path="/tenants/new" element={<TenantForm />} />
              <Route path="/tenants/:id/edit" element={<TenantForm />} />
              <Route path="/tenants/:id" element={<TenantView />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["tenant_admin"]} />}>
            <Route element={<Layout />}>
              <Route path="/roles" element={<RoleList />} />
              <Route path="/roles/new" element={<RoleForm />} />
              <Route path="/roles/:id/edit" element={<RoleForm />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ConfirmProvider } from "./context/ConfirmProvider.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { getDefaultPath } from "./utils/routing.js";
import { isTenantHostMode } from "./utils/tenantHost.js";
import BrandingSync from "./components/BrandingSync.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TenantSlugGuard from "./components/TenantSlugGuard.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/auth/login.jsx";
import CreateAccount from "./pages/auth/signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BusinessInfo from "./pages/BusinessInfo.jsx";
import CustomerList from "./pages/customers/List.jsx";
import OrderList from "./pages/orders/List.jsx";
import OrderForm from "./pages/orders/Form.jsx";
import OrderView from "./pages/orders/View.jsx";
import Checkout from "./pages/orders/Checkout.jsx";
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
import InventoryList from "./pages/inventory/List.jsx";
import InventoryForm from "./pages/inventory/Form.jsx";
import InventoryView from "./pages/inventory/View.jsx";
import LowStockReport from "./pages/inventory/LowStockReport.jsx";
import PreviewPrototype from "./pages/PreviewPrototype.jsx";
import PendingNotifications from "./pages/PendingNotifications.jsx";

// Catches anything unmatched — including a bare "/dashboard" hit by a
// tenant-scoped user (that path only exists for super_admin now).
const CatchAll = () => {
  const { user, tenant, tenantLoading } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const fallback = getDefaultPath(user, tenant);
  if (fallback === null) {
    return tenantLoading ? null : <Navigate to="/login" replace />;
  }
  return <Navigate to={fallback} replace />;
};

function App() {
  // Read once per render — the hostname can't change without a full page
  // reload (a different tenant's host — subdomain or custom domain — is a
  // different origin, not a client-side navigation), so there's no need for
  // state/effect here.
  const inTenantHostMode = isTenantHostMode();

  return (
    // Every Framer Motion animation added anywhere in the app inherits this
    // once — reducedMotion="user" checks the OS prefers-reduced-motion
    // setting live (not just at mount), so animations shrink to instant
    // opacity swaps for anyone who has that preference on, with zero
    // per-component work required going forward.
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #D8D1C7",
              color: "#1A1A1A",
              borderRadius: "1rem",
              boxShadow: "0 4px 20px rgba(26,26,26,0.08)",
              fontFamily: "var(--font-body)",
            },
          }}
        />
        <AuthProvider>
          <ConfirmProvider>
          <BrandingSync />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<CreateAccount />} />

            {inTenantHostMode ? (
              // Host mode: a platform subdomain (alitailors.localhost) or a
              // business's own custom domain (pakistan-tailors.com, resolved
              // by convention from its hostname — see utils/tenantHost.js).
              // Either way the tenant is already carried by the host, so
              // these routes live at bare paths — no "/:tenantSlug" segment,
              // and the dashboard is the index route ("/") rather than
              // "/dashboard" so the business's own root URL loads it
              // directly. "dashboard" is kept as a path alias to the same
              // element so nothing bookmarked under the old shape breaks.
              // TenantSlugGuard resolves the expected slug from the host
              // itself (see useExpectedTenantSlug) and still enforces it
              // matches the logged-in user's own tenant. super_admin has no
              // host of its own, so its platform-management pages are
              // deliberately NOT reachable here — only from the bare root
              // domain, below.
              <Route element={<ProtectedRoute roles={["tenant_admin", "manager", "employee"]} />}>
                <Route element={<TenantSlugGuard />}>
                  <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    <Route element={<ProtectedRoute module="customers" />}>
                      <Route path="customers" element={<CustomerList />} />
                      <Route path="customers/:id" element={<CustomerList />} />
                    </Route>

                    <Route element={<ProtectedRoute module="orders" />}>
                      <Route path="orders" element={<OrderList />} />
                      <Route path="orders/new" element={<OrderForm />} />
                      <Route path="orders/:id/checkout" element={<Checkout />} />
                      <Route path="orders/:id" element={<OrderView />} />
                    </Route>

                    <Route element={<ProtectedRoute module="productTypes" />}>
                      <Route path="product-types" element={<ProductTypeList />} />
                      <Route path="product-types/new" element={<ProductTypeForm />} />
                      <Route path="product-types/:id/edit" element={<ProductTypeForm />} />
                      <Route path="product-types/:id" element={<ProductTypeView />} />
                    </Route>

                    <Route element={<ProtectedRoute module="employees" />}>
                      <Route path="employees" element={<EmployeeList />} />
                      <Route path="employees/new" element={<EmployeeForm />} />
                      <Route path="employees/:id/edit" element={<EmployeeForm />} />
                      <Route path="employees/:id" element={<EmployeeView />} />
                    </Route>

                    <Route element={<ProtectedRoute module="settings" />}>
                      <Route path="business-info" element={<BusinessInfo />} />
                    </Route>

                    <Route element={<ProtectedRoute module="notifications" />}>
                      <Route path="notifications/pending" element={<PendingNotifications />} />
                    </Route>

                    <Route element={<ProtectedRoute module="inventory" />}>
                      <Route path="inventory" element={<InventoryList />} />
                      <Route path="inventory/new" element={<InventoryForm />} />
                      <Route path="inventory/low-stock" element={<LowStockReport />} />
                      <Route path="inventory/:id/edit" element={<InventoryForm />} />
                      <Route path="inventory/:id" element={<InventoryView />} />
                    </Route>

                    <Route element={<ProtectedRoute roles={["tenant_admin"]} />}>
                      <Route path="roles" element={<RoleList />} />
                      <Route path="roles/new" element={<RoleForm />} />
                      <Route path="roles/:id/edit" element={<RoleForm />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            ) : (
              <>
                {/* super_admin has no tenant of its own — these routes are never slug-prefixed. */}
                <Route element={<ProtectedRoute roles={["super_admin"]} />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tenants" element={<TenantList />} />
                    <Route path="/tenants/new" element={<TenantForm />} />
                    <Route path="/tenants/:id/edit" element={<TenantForm />} />
                    <Route path="/tenants/:id" element={<TenantView />} />
                    {/* LOCAL-ONLY prototype (hardcoded demo data, no MongoDB
                        reads/writes) — see src/data/previewPrototypeData.js */}
                    <Route path="/preview-prototype" element={<PreviewPrototype />} />
                  </Route>
                </Route>

                {/* Original path-based fallback — every tenant-scoped role
                    reaches its pages under "/:tenantSlug/..." wherever host
                    mode isn't recognized (plain localhost, or a host that's
                    neither a VITE_APP_BASE_DOMAIN subdomain nor a business's
                    own custom domain — see utils/tenantHost.js). Kept
                    working unchanged so nothing that relies on it today
                    (bookmarks, hardcoded links) breaks. */}
                <Route element={<ProtectedRoute roles={["tenant_admin", "manager", "employee"]} />}>
                  <Route path="/:tenantSlug" element={<TenantSlugGuard />}>
                    <Route element={<Layout />}>
                      <Route path="dashboard" element={<Dashboard />} />

                      {/* No separate "customers/new" route — "new" is intentionally
                          matched by the :id param below (routeId === "new" means
                          create mode, see List.jsx). A static "customers/new"
                          route would out-rank ":id" in React Router's matching and
                          make useParams().id come back undefined instead of "new",
                          which breaks that derivation. */}
                      <Route element={<ProtectedRoute module="customers" />}>
                        <Route path="customers" element={<CustomerList />} />
                        <Route path="customers/:id" element={<CustomerList />} />
                      </Route>

                      <Route element={<ProtectedRoute module="orders" />}>
                        <Route path="orders" element={<OrderList />} />
                        <Route path="orders/new" element={<OrderForm />} />
                        <Route path="orders/:id/checkout" element={<Checkout />} />
                        <Route path="orders/:id" element={<OrderView />} />
                      </Route>

                      <Route element={<ProtectedRoute module="productTypes" />}>
                        <Route path="product-types" element={<ProductTypeList />} />
                        <Route path="product-types/new" element={<ProductTypeForm />} />
                        <Route path="product-types/:id/edit" element={<ProductTypeForm />} />
                        <Route path="product-types/:id" element={<ProductTypeView />} />
                      </Route>

                      <Route element={<ProtectedRoute module="employees" />}>
                        <Route path="employees" element={<EmployeeList />} />
                        <Route path="employees/new" element={<EmployeeForm />} />
                        <Route path="employees/:id/edit" element={<EmployeeForm />} />
                        <Route path="employees/:id" element={<EmployeeView />} />
                      </Route>

                      <Route element={<ProtectedRoute module="settings" />}>
                        <Route path="business-info" element={<BusinessInfo />} />
                      </Route>

                      <Route element={<ProtectedRoute module="notifications" />}>
                        <Route path="notifications/pending" element={<PendingNotifications />} />
                      </Route>

                      <Route element={<ProtectedRoute module="inventory" />}>
                        <Route path="inventory" element={<InventoryList />} />
                        <Route path="inventory/new" element={<InventoryForm />} />
                        <Route path="inventory/low-stock" element={<LowStockReport />} />
                        <Route path="inventory/:id/edit" element={<InventoryForm />} />
                        <Route path="inventory/:id" element={<InventoryView />} />
                      </Route>

                      <Route element={<ProtectedRoute roles={["tenant_admin"]} />}>
                        <Route path="roles" element={<RoleList />} />
                        <Route path="roles/new" element={<RoleForm />} />
                        <Route path="roles/:id/edit" element={<RoleForm />} />
                      </Route>
                    </Route>
                  </Route>
                </Route>
              </>
            )}

            <Route path="*" element={<CatchAll />} />
          </Routes>
          </ConfirmProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/auth/login.jsx'
import CreateAccount from './pages/auth/signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Measurements from './pages/Measurements.jsx'
import CustomerList from './pages/customers/List.jsx'
import OrderList from './pages/orders/List.jsx'
import OrderForm from './pages/orders/Form.jsx'
import OrderView from './pages/orders/View.jsx'
import ProductTypeList from './pages/productTypes/List.jsx'
import ProductTypeForm from './pages/productTypes/Form.jsx'
import ProductTypeView from './pages/productTypes/View.jsx'
import EmployeeList from './pages/employees/List.jsx'
import EmployeeForm from './pages/employees/Form.jsx'
import EmployeeView from './pages/employees/View.jsx'

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
              <Route path="/product-types/:id/edit" element={<ProductTypeForm />} />
              <Route path="/product-types/:id" element={<ProductTypeView />} />

              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id/edit" element={<EmployeeForm />} />
              <Route path="/employees/:id" element={<EmployeeView />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/auth/login.jsx'
import CreateAccount from './pages/auth/signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CustomerList from './pages/customers/List.jsx'
import CustomerForm from './pages/customers/Form.jsx'
import CustomerView from './pages/customers/View.jsx'
import OrderList from './pages/orders/List.jsx'
import OrderForm from './pages/orders/Form.jsx'
import OrderView from './pages/orders/View.jsx'

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
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerView />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />

              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/orders/:id" element={<OrderView />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

import React from 'react';
import './App.css';
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./Pages/Login/index";
import Home from "./Pages/Home/index";
import SideBar from './Components/sidebar';
import TopNavBar from './Components/TopNavBar';
import Orders from "./Pages/Orders/index";
import PlaceOrder from "./Pages/PlaceOrder/index";
import Employees from "./Pages/Employee/index";
import AddEmployee from "./Pages/Employee/addEmployee";
import EditEmployee from "./Pages/Employee/editEmployee";
import ViewEmployee from "./Pages/Employee/viewEmployee";
import Items from "./Pages/Items";
import AllOrders from "./Pages/Order";
import Customers, { AddCustomer, EditCustomer, ViewCustomer } from "./Pages/customers";
import { GlobalSearchProvider } from "./Components/GlobalSearch";

const types = ['Cutter', 'Stitcher', 'Designer', 'Sales'];

function AppLayout() {
    return (
        <div className="flex min-h-screen bg-surface">
            <SideBar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopNavBar />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
          <GlobalSearchProvider>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
                style={{ top: '16px', right: '16px' }}
            />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route element={<AppLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/orders" element={<AllOrders />} />
                    <Route path="/order/details/:id" element={<Orders />} />
                    <Route path="/placeorder" element={<PlaceOrder />} />
                    <Route path="/employees" element={<Employees types={types} />} />
                    <Route path="/employees/add" element={<AddEmployee types={types} />} />
                    <Route path="/employees/edit/:id" element={<EditEmployee types={types} />} />
                    <Route path="/employees/view/:id" element={<ViewEmployee />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/add" element={<AddCustomer />} />
                    <Route path="/customers/edit/:id" element={<EditCustomer />} />
                    <Route path="/customers/view/:id" element={<ViewCustomer />} />
                </Route>
            </Routes>
          </GlobalSearchProvider>
        </Router>
    );
}

export default App;
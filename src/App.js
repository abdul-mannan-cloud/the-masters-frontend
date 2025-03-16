import React from 'react';
import './App.css';
import "react-toastify/dist/ReactToastify.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import Login from "./Pages/Login/index";
import Home from "./Pages/Home/index"
import SideBar from './Components/sidebar';
import Orders from "./Pages/Orders/index";
import PlaceOrder from "./Pages/PlaceOrder/index";
import Employees from "./Pages/Employee/index";
import AddEmployee from "./Pages/Employee/addEmployee";
import EditEmployee from "./Pages/Employee/editEmployee";
import ViewEmployee from "./Pages/Employee/viewEmployee";
import ClothItems from "./Pages/Products/index";
import Items from "./Pages/Items";
import AllOrders from "./Pages/Order";
import Customers, {AddCustomer, EditCustomer, ViewCustomer} from "./Pages/customers";

function App() {

    const types = ['Cutter', 'Stitcher', 'Designer', 'Sales']

    return (
        <Router>
            <SideBar/>
            {/* <Navbar /> */}
            <Routes>
                <Route path="/" element={<Login/>}>
                </Route>
                <Route path='/login' element={<Login/>}/>
                <Route path='/home' element={<Home/>}/>
                <Route path='/order/details/:id' element={<Orders/>}/>
                <Route path='/placeorder' element={<PlaceOrder/>}/>
                <Route path='/employees' element={<Employees types={types}/>}/>
                <Route path='/employees/add' element={<AddEmployee types={types}/>}/>
                <Route path='/employees/edit/:id' element={<EditEmployee types={types}/>}/>
                <Route path='/employees/view/:id' element={<ViewEmployee/>}/>
                {/*<Route path='/cloths' element={<ClothItems/>}/>*/}
                <Route path='/orders' element={<AllOrders/>}/>
                <Route path='/items' element={<Items/>}/>
                <Route path="/customers" element={<Customers/>}/>
                <Route path="/customers/add" element={<AddCustomer/>}/>
                <Route path="/customers/edit/:id" element={<EditCustomer/>}/>
                <Route path="/customers/view/:id" element={<ViewCustomer/>}/>
            </Routes>
        </Router>
    );
}

export default App;

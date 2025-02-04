import React  from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useState, useContext, useEffect } from 'react';
import BarChart from '../../Components/Home/BarChart';
import DonutChart from '../../Components/Home/DonutChart';
import LineChart from '../../Components/Home/LineChart';

const Dashboard = () => {

    const navigate = useNavigate();
    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login')
        }
    }, []);

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);

    const getOrders = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/orders`);
            setOrders(response.data)
          } catch (error) {
            console.error("Error fetching data:", error);
          }              
    };

    const getProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`);
            setProducts(response.data)
          } catch (error) {
            console.error("Error fetching data:", error);
          }              
    };

    const [pending, setPending] = useState([]);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        getOrders();
        getProducts();
        const pending = products.filter((product) => { return product.status == 'pending'});
        setPending(pending)

        const productTypes = ['Shalwar Suit', 'Pant', 'Shirt', 'Two Piece Suit', 'Three Piece Suit'];
        const productCounts = productTypes.map(type => products.filter(product => product.type === type).length);
        console.log(productCounts);
        setTypes(productCounts);
        console.log(types);
    },[])

    const [data, setData] = useState([1,1]);
    const data2 = [ 3026, 136, 12056];
    const data3 = [ 100, 6418, 456, 3026, 136, 12056];

    const [recruiters, setRecruiters] = useState([]);
    const [jobs, setJobs] = useState([]);

    // const fetchRecruiter =  async() => {
    //     try {
    //         const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/recruiter/getallrecruiters`);
    //         setRecruiters(response.data);
    //     } catch (error) {
    //         console.error('Error fetching the Agents: ', error.message);
    //     }
    // }
    // const fetchJobs =  async() => {
    //     try {
    //         const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/job/getalljobs`);
    //         setJobs(response.data);
    //     } catch (error) {
    //         console.error('Error fetching the Agents: ', error.message);
    //     }
    // }

    // useEffect(() => {
    //     fetchRecruiter();
    //     fetchJobs();
    // }, []);

    return (
        <div className='w-screen h-screen bg-white'>
            <div className={`h-full flex flex-col items-center transition-all duration-300 w-[95%] ml-20 mt-20`}>
                <div className='flex w-[80%] flex-row items-center justify-between gap-10'>
                    <h className='text-3xl font-bold'>DASHBOARD</h>
                </div>
                <div className='sm:w-[90%] lg:w-[80%] w-screen mt-10 h-screen flex flex-col gap-10'>
                    <div className='grid grid-cols-1 gap-10 px-10 sm:grid-cols-3 sm:px-0'>
                        <div className='flex flex-row justify-between gap-5 p-5 shadow-md xl:p-10 rounded-xl'>
                            <div className='flex flex-col gap-3'>
                                <span>Orders</span>
                                <span className='text-xl font-bold lg:text-2xl xl:text-3xl'>{orders.length}</span>
                            </div>
                            <div className=''>
                                <LineChart data={data} />
                            </div>
                        </div>
                        <div className='flex flex-row justify-between gap-5 p-5 shadow-md xl:p-10 rounded-xl'>
                            <div className='flex flex-col gap-3'>
                                <span>Products</span>
                                <span className='text-xl font-bold lg:text-2xl xl:text-3xl'>{products.length}</span>
                            </div>
                            <div>
                                <LineChart data={data2} />
                            </div>
                        </div>
                        <div className='flex flex-row justify-between gap-5 p-5 shadow-md xl:p-10 rounded-xl'>
                            <div className='flex flex-col justify-between h-full gap-5 xl:gap-10'>
                                <div className='flex flex-col gap-3'>
                                    <span>Pending Items</span>
                                    <span className='text-xl font-bold lg:text-2xl xl:text-3xl'>{pending.length}</span>
                                </div>
                            </div>
                            <div>
                                <LineChart data={data3} />
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-5 px-10 sm:flex-row sm:px-0 sm:gap-10'>
                        <BarChart data={types} />
                        <DonutChart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
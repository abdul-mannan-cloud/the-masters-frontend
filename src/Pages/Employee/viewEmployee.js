import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import ShirtDetails from '../../Components/ItemDetails/ItemDetails';
import Back from '../../resources/Icons/back.png';
import Chart from 'react-apexcharts';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        outerHeight: '100px',
    },
};

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedItem, setSelectedItem] = useState('');

    const [employeeData, setEmployeeData] = useState({
        name: '',
        cnic: '',
        phone: '',
        password: '',
        payment: 0,
        products: [],
    });

    const [products, setProducts] = useState([]);
    const [orderCompleted, setCompleted] = useState([]);
    const [orderPending, setPending] = useState([]);

    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'donut',
        },
        labels: ['Completed Orders', 'Pending Orders'],
    });
    const [chartSeries, setChartSeries] = useState([]);

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                console.log(id);
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/employee/getemployee/${id}`
                );
                const productsResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`
                );

                const filteredProducts = productsResponse.data.filter((product) =>
                    response.data.products.includes(product._id)
                );
                console.log(productsResponse.data);
                console.log(filteredProducts);
                setProducts(filteredProducts);
                setEmployeeData(response.data);

                // Now that products are fetched, compute completed and pending orders
                const completed = filteredProducts.filter(
                    (product) => product.status === 'completed'
                );
                setCompleted(completed);
                const pending = filteredProducts.filter(
                    (product) => product.status !== 'completed'
                );
                setPending(pending);

                // Set the chart series data
                setChartSeries([completed.length, pending.length]);
            } catch (error) {
                console.error('Error fetching employee details:', error.message);
            }
        };
        fetchEmployeeDetails();
    }, [id]);

    const [modalIsOpen, setIsOpen] = React.useState(false);
    function openModal() {
        setIsOpen(true);
    }
    function closeModal() {
        setIsOpen(false);
    }

    return (
        <div className='flex flex-col items-center bg-gray-100 min-h-screen'>
            <div className='flex flex-col w-full max-w-6xl mt-10 px-6'>
                <div className='flex items-center mb-8'>
                    <img
                        onClick={() => navigate('/employees')}
                        src={Back}
                        className='w-10 h-10 cursor-pointer hover:scale-105'
                        alt='Back'
                    />
                    <h1 className='ml-4 text-3xl font-bold'>EMPLOYEE DETAILS</h1>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Employee Info Card */}
                    <div className='p-6 bg-white rounded-lg shadow-md'>
                        <h2 className='text-2xl font-bold mb-4'>Employee Information</h2>
                        <div className='space-y-2'>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Name:</span>
                                <span>{employeeData.name}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>CNIC:</span>
                                <span>{employeeData.cnic}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Phone:</span>
                                <span>{employeeData.phone}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Password:</span>
                                <input
                                    type='password'
                                    readOnly
                                    value={employeeData.password}
                                    className='outline-none border-none bg-transparent'
                                />
                            </div>
                        </div>
                    </div>
                    {/* Employee Stats Card */}
                    <div className='p-6 bg-white rounded-lg shadow-md'>
                        <h2 className='text-2xl font-bold mb-4'>Employee Statistics</h2>
                        <div className='space-y-2'>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Total Orders:</span>
                                <span>{products.length}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Orders Completed:</span>
                                <span>{orderCompleted.length}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-semibold'>Pending Payments:</span>
                                <span>{employeeData.payment}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className='mt-10'>
                    <h2 className='text-xl font-bold mb-4'>Order Status</h2>
                    <div className='flex justify-center'>
                        <Chart
                            options={chartOptions}
                            series={chartSeries}
                            type='donut'
                            width='380'
                        />
                    </div>
                </div>

                {/* Orders Section */}
                <div className='mt-10'>
                    <h2 className='text-xl font-bold mb-4'>Orders</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                        {products.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setSelectedItem(item);
                                    openModal();
                                }}
                                className='flex p-4 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition'
                            >
                                <img
                                    src={item.image}
                                    className='w-24 h-24 rounded-lg'
                                    alt={item.type}
                                />
                                <div className='ml-4'>
                                    <h3 className='text-lg font-bold mb-2'>{item.type}</h3>
                                    <p>Price: {item.price}</p>
                                    <p>{item.instructions}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        style={customStyles}
                        contentLabel='Order Details Modal'
                    >
                        <ShirtDetails
                            item={selectedItem}
                            model={modalIsOpen}
                            setModel={setIsOpen}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default EditEmployee;

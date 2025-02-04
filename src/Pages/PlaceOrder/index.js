import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MeasurementDetails from "../../Components/ItemDetials/Shirt";
import { ArrowLeft } from 'lucide-react';


const PlaceOrder = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login');
        }
    }, []);

    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const phoneRegex = /^(03)\d{9}$/;

    const [step, setStep] = useState(1);
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [savedCustomer, setSavedCustomer] = useState();

    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        address: '',
    });

    const [measurements, setMeasurements] = useState({
        chest: 0,
        neck: 0,
        shoulders: 0,
        sleeves: 0,
        topLenght: 0,
        bottomLenght: 0,
        waist: 0
    });

    // Initialize products as an array to hold multiple items
    const [products, setProducts] = useState([
        {
            type: '',
            instructions: '',
            price:0,
            options: [],
        }
    ]);

    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        setTotalPrice(products.reduce((total, product) => total + product.price, 0))
    }, [products]);

    const handleAddCustomer = async () => {
        try {
            // First add the customer
            const customerResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/customer/add`, { customer });
            const newCustomer = customerResponse.data;

            // If customer is added successfully, update their measurements
            if (newCustomer._id) {
                // Set customer ID for the order
                setSavedCustomer(newCustomer._id);

                // Update measurements for the customer
                await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${newCustomer._id}`, {
                    measurements: measurements
                });

                toast.success('Customer added successfully!');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            toast.error('Failed to add customer');
            // Reset step if customer addition fails
            setStep(1);
        }
    };

    const formatPhoneNumber = (event) => {
        let value = event.target.value.replace(/\D/g, "");
        if (value.length > 4) value = `${value.slice(0, 4)}-${value.slice(4)}`;
        if (value.length > 11) value = value.slice(0, 12);
        event.target.value = value;
    };

    const getCustomers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cloth/getallcustomers`);
            setCustomers(response.data.customer);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const getItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/items/getallitems`);
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        getCustomers();
        getItems();
    }, []);

    const handlePlaceOrder = async () => {
        try {
            console.log('savedCustomer', savedCustomer);
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/order/placeorder`, { customer:savedCustomer,products ,total:totalPrice });
            toast.success('Order Placed Successfully!');
            setStep(1);
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    // Handle adding a new empty product form
    const handleAddProductForm = () => {
        setProducts([...products, {
            type: '',
            instructions: '',
            options: [],
            price:0,
        }]);
    };

    // Handle deleting a product form
    const handleDeleteProductForm = (index) => {
        const updatedProducts = [...products];
        updatedProducts.splice(index, 1);
        setProducts(updatedProducts);
    };

    // Handle changes in the product forms
    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value;
        setProducts(updatedProducts);
    };

    const handleOptionChange = (index, optionName, customization) => {
        const updatedProducts = [...products];
        const existingOptionIndex = updatedProducts[index].options.findIndex(opt => opt.name === optionName);
        if (existingOptionIndex >= 0) {
            updatedProducts[index].options[existingOptionIndex].customization = customization;
        } else {
            updatedProducts[index].options.push({ name: optionName, customization });
        }
        setProducts(updatedProducts);
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = customers.filter((customer) => {
        const CustomerNameMatch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
        return CustomerNameMatch;
    });

    return (
        <div className='min-h-screen bg-gray-100'>
            <div className='container mx-auto px-4 py-8 md:px-6 lg:px-8'>
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8">
                    <div className="relative flex flex-col items-center justify-center w-full gap-4">
                        {/* Back Arrow */}
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="absolute left-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}

                        <h1 className='text-xl md:text-2xl font-bold mb-6'>Enter Order Details</h1>

                        {/* Step 1: Customer Information */}
                        {step === 1 && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl'>
                                {/* New Customer Form */}
                                <div className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
                                    <h2 className='text-lg font-bold mb-6'>Customer's Information</h2>
                                    <div className='space-y-4'>
                                        <div>
                                            <label className='block font-semibold mb-1'>Customer's Name</label>
                                            <input
                                                type='text'
                                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                            />
                                        </div>
                                        <div>
                                            <label className='block font-semibold mb-1'>Customer's Phone</label>
                                            <input
                                                maxLength={12}
                                                placeholder="03XX-XXXXXXX"
                                                onInput={formatPhoneNumber}
                                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                            />
                                        </div>
                                        <div>
                                            <label className='block font-semibold mb-1'>Customer's Address</label>
                                            <input
                                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (!customer.name || !customer.phone || !customer.address) {
                                                    toast.error('Fill all the Fields')
                                                } else if (specialCharactersRegex.test(customer.name)) {
                                                    toast.error('Name should not contain any special characters')
                                                } else if (customer.phone.length !== 12) {
                                                    toast.error('Phone should contain 11 numbers starting with 03')
                                                } else {
                                                    setStep(step + 1);
                                                    handleAddCustomer();
                                                }
                                            }}
                                            className='w-full p-3 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors'
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>

                                {/* Customer Selection */}
                                <div className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
                                    <h2 className='text-lg font-bold mb-4'>Select Customer</h2>
                                    <input
                                        className='w-full p-2 bg-gray-50 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder='Search customers...'
                                    />
                                    <div className='max-h-96 overflow-y-auto space-y-2 pr-2'>
                                        {filteredCustomers.map((customer) => (
                                            <div
                                                key={customer._id}
                                                onClick={() => {
                                                    setSavedCustomer(customer._id);
                                                    setStep(step + 1);
                                                }}
                                                className='flex flex-col sm:flex-row justify-between gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors'
                                            >
                                                <span className='font-medium'>{customer.name}</span>
                                                <span className='text-gray-600'>{customer.phone}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Item Information */}
                        {step === 2 && (
                            <div className='w-full max-w-4xl'>
                                <h2 className='text-lg font-bold mb-4'>Item Information</h2>
                                <div className='space-y-4'>
                                    {products.map((product, index) => (
                                        <div key={index} className='border rounded-lg p-4 relative'>
                                            <h3 className='text-md font-bold mb-4'>Item {index + 1}</h3>
                                            <button
                                                onClick={() => handleDeleteProductForm(index)}
                                                className='absolute top-4 right-4 text-red-500 hover:text-red-600'
                                            >
                                                Delete
                                            </button>

                                            <div className='space-y-4'>
                                                <div>
                                                    <label className='block font-semibold mb-2'>Item Type</label>
                                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                                        {items.map((item) => (
                                                            <div
                                                                key={item.name}
                                                                onClick={() => {
                                                                    handleProductChange(index, 'type', item.name)
                                                                    handleProductChange(index, 'price', item.price)
                                                                }}
                                                                className={`p-3 text-center rounded-lg cursor-pointer transition-colors
                                                                    ${product.type === item.name
                                                                    ? 'bg-yellow-400 text-white'
                                                                    : 'bg-gray-50 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {product.type && (
                                                    <div>
                                                        <label className='block font-semibold mb-2'>Item Customization</label>
                                                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                                            {items.find(item => item.name === product.type)?.options.map((option) => (
                                                                <div key={option.name}>
                                                                    <label className='block mb-1'>{option.name}</label>
                                                                    <select
                                                                        onChange={(e) => handleOptionChange(index, option.name, e.target.value)}
                                                                        className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                                                    >
                                                                        <option value=''>Select {option.name}</option>
                                                                        {option.customizations.map((customization) => (
                                                                            <option key={customization} value={customization}>
                                                                                {customization}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className='block font-semibold mb-2'>Instructions</label>
                                                    <textarea
                                                        placeholder="Enter Instructions"
                                                        onChange={(e) => handleProductChange(index, 'instructions', e.target.value)}
                                                        className='w-full h-28 p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddProductForm}
                                        className='w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    >
                                        <span className='text-xl font-bold'>+</span> Add Another Item
                                    </button>

                                    <button
                                        onClick={() => {
                                            const incompleteProduct = products.find(p => !p.type);
                                            if (incompleteProduct) {
                                                toast.error('Please fill all the fields for each item.');
                                            } else {
                                                setStep(3);
                                            }
                                        }}
                                        className='w-full p-3 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors'
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Measurements */}
                        {step === 3 && (
                            <div className='w-full max-w-4xl'>
                                <h2 className='text-lg font-bold mb-6'>Measurements</h2>
                                <MeasurementDetails
                                    measurements={measurements}
                                    setMeasurements={setMeasurements}
                                    customer={savedCustomer}
                                />
                                <div className='grid grid-cols-2 gap-4 mt-6'>
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className='p-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors'
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!measurements.chest || !measurements.shoulders || !measurements.neck ||
                                                !measurements.sleeves || !measurements.waist || !measurements.bottomLenght ||
                                                !measurements.topLenght) {
                                                toast.error('Fill All the Fields')
                                            } else if (measurements.chest < 1 || measurements.shoulders < 1 ||
                                                measurements.neck < 1 || measurements.sleeves < 1 ||
                                                measurements.waist < 1 || measurements.bottomLenght < 1 ||
                                                measurements.topLenght < 1) {
                                                toast.error('Negative Values are not Allowed!')
                                            } else if (measurements.chest > 100 || measurements.shoulders > 50 ||
                                                measurements.neck > 30 || measurements.sleeves > 50 ||
                                                measurements.waist > 50 || measurements.bottomLenght > 100 ||
                                                measurements.topLenght > 100) {
                                                toast.error('Values too large!')
                                            } else {
                                                setStep(step + 1)
                                            }
                                        }}
                                        className='p-3 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors'
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirm and Place Order */}
                        {step === 4 && (
                            <div className='w-full max-w-md'>
                                <h2 className='text-lg font-bold text-center mb-6'>Complete Order?</h2>
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-center mb-2'>Total Price:</label>
                                        <input
                                            type="number"
                                            value={totalPrice}
                                            onChange={(e) => setTotalPrice(e.target.value)}
                                            className='w-full p-3 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-yellow-400'
                                        />
                                    </div>
                                    <button
                                        onClick={handlePlaceOrder}
                                        className='w-full p-3 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors'
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaceOrder;

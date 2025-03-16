import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MeasurementDetails from "../../Components/ItemDetials/Shirt";
import {
    ArrowLeft, User, Package,
    CreditCard, Scissors, Search,
    Phone, MapPin, Ruler
} from 'lucide-react';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [savedCustomer, setSavedCustomer] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMeasurementFileUploaded, setIsMeasurementFileUploaded] = useState(false);
    const [hasUploadedFile, setHasUploadedFile] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const [products, setProducts] = useState([{
        type: '',
        instructions: '',
        price: 0,
        options: [],
    }]);

    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login');
        }
        getCustomers();
        getItems();
    }, []);

    useEffect(() => {
        setTotalPrice(products.reduce((total, product) => total + product.price, 0))
    }, [products]);

    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/;

    const getCustomers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cloth/getallcustomers`);
            setCustomers(response.data.customer);
        } catch (error) {
            toast.error('Failed to fetch customers');
        }
    };

    const getItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/items/getallitems`);
            setItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch items');
        }
    };

    const handleAddCustomer = async () => {
        try {
            setLoading(true);
            const customerResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/customer/add`, { customer });
            const newCustomer = customerResponse.data;

            if (newCustomer._id) {
                setSavedCustomer(newCustomer._id);
                await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${newCustomer._id}`, {
                    measurements: measurements
                });
                toast.success('Customer added successfully!');
                setStep(2);
            }
        } catch (error) {
            toast.error('Failed to add customer');
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/order/placeorder`, {
                customer: savedCustomer,
                products,
                total: totalPrice
            });
            toast.success('Order Placed Successfully!');
            navigate('/orders');
        } catch (error) {
            toast.error('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (event) => {
        let value = event.target.value.replace(/\D/g, "");
        if (value.length > 4) value = `${value.slice(0, 4)}-${value.slice(4)}`;
        if (value.length > 11) value = value.slice(0, 12);
        event.target.value = value;
    };

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

    const handleFileUpload = (isUploaded) => {
        setIsMeasurementFileUploaded(isUploaded);
    };

    const filteredCustomers = customers.filter((customer) => {
        return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery);
    });

    const steps = [
        { icon: User, label: "Customer" },
        { icon: Package, label: "Items" },
        { icon: Ruler, label: "Measurements" },
        { icon: CreditCard, label: "Payment" }
    ];

    useEffect(() => {
        if (savedCustomer) {
            fetchCustomerDetails();
        }
    }, [savedCustomer]);

    const fetchCustomerDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/get/${savedCustomer}`);

            // Update measurements state if customer has saved measurements
            if (response.data.measurements) {
                setMeasurements(response.data.measurements);
            }

            // Set uploaded files if customer has them
            if (response.data.measurementFiles && response.data.measurementFiles.length > 0) {
                setUploadedFiles(response.data.measurementFiles);
                setHasUploadedFile(true);
            } else {
                setHasUploadedFile(false);
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            toast.error('Failed to load customer measurement data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="border-b border-gray-200">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                                    </button>
                                )}
                                <h1 className="text-xl font-bold text-gray-900">Place New Order</h1>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="max-w-4xl mx-auto">
                            <div className="relative">
                                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                                    <div
                                        className="h-full bg-yellow-400 transition-all duration-500"
                                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                                    />
                                </div>
                                <div className="relative flex justify-between">
                                    {steps.map((stepItem, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                                                ${step > index ? 'bg-yellow-400 border-yellow-400 text-white' :
                                                step === index + 1 ? 'bg-white border-yellow-400 text-yellow-400' :
                                                    'bg-white border-gray-300 text-gray-400'}`}>
                                                <stepItem.icon className="w-5 h-5" />
                                            </div>
                                            <span className="mt-2 text-sm font-medium text-gray-600">{stepItem.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Step 1: Customer Selection */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                                {/* New Customer Form */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            New Customer
                                        </h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                placeholder="Enter customer name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                maxLength={12}
                                                placeholder="03XX-XXXXXXX"
                                                onInput={formatPhoneNumber}
                                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <textarea
                                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                rows={3}
                                                placeholder="Enter delivery address"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (!customer.name || !customer.phone || !customer.address) {
                                                    toast.error('Please fill all fields')
                                                } else if (specialCharactersRegex.test(customer.name)) {
                                                    toast.error('Name should not contain special characters')
                                                } else if (customer.phone.length !== 12) {
                                                    toast.error('Please enter a valid phone number')
                                                } else {
                                                    handleAddCustomer()
                                                }
                                            }}
                                            disabled={loading}
                                            className="w-full p-3 bg-yellow-400 text-white font-medium rounded-lg
                                                hover:bg-yellow-500 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Adding Customer...' : 'Continue with New Customer'}
                                        </button>
                                    </div>
                                </div>

                                {/* Existing Customer Selection */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Search className="w-5 h-5" />
                                            Select Existing Customer
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or phone..."
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {filteredCustomers.map((customer) => (
                                                <div
                                                    key={customer._id}
                                                    onClick={() => {
                                                        setSavedCustomer(customer._id);
                                                        setStep(2);
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200
                                                        hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                                        <span className="text-yellow-800 font-medium">
                                                            {customer.name[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{customer.name}</p>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-4 h-4" />
                                                                {customer.phone}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {customer.address}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Item Selection */}
                        {step === 2 && (
                            <div className="max-w-4xl mx-auto">
                                {products.map((product, index) => (
                                    <div key={index} className="bg-white rounded-lg border border-gray-200 mb-6">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    <Scissors className="w-5 h-5" />
                                                    Item {index + 1}
                                                </h3>
                                                {index > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            const updatedProducts = [...products];
                                                            updatedProducts.splice(index, 1);
                                                            setProducts(updatedProducts);
                                                        }}
                                                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                                                    >
                                                        Remove Item
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Select Item Type</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {items.map((item) => (
                                                        <div
                                                            key={item.name}
                                                            onClick={() => {
                                                                handleProductChange(index, 'type', item.name);
                                                                handleProductChange(index, 'price', item.price);
                                                            }}
                                                            className={`p-4 text-center rounded-lg cursor-pointer transition-colors border
                                                                ${product.type === item.name
                                                                ? 'bg-yellow-400 border-yellow-400 text-white'
                                                                : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                                                            }`}
                                                        >
                                                            <Scissors className="w-5 h-5 mx-auto mb-2" />
                                                            <span className="font-medium">{item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {product.type && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">Customization Options</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {items.find(item => item.name === product.type)?.options.map((option) => (
                                                            <div key={option.name}>
                                                                <label className="block text-sm text-gray-600 mb-1">{option.name}</label>
                                                                <select
                                                                    onChange={(e) => handleOptionChange(index, option.name, e.target.value)}
                                                                    className="w-full p-2 border border-gray-200 rounded-lg
                                                                        focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                                >
                                                                    <option value="">Select {option.name}</option>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                                                <textarea
                                                    placeholder="Enter any special instructions or notes"
                                                    onChange={(e) => handleProductChange(index, 'instructions', e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg
                                                        focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                                <span className="text-sm font-medium text-gray-600">Item Price:</span>
                                                <span className="text-xl font-semibold">Rs. {product.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setProducts([...products, {
                                        type: '',
                                        instructions: '',
                                        price: 0,
                                        options: [],
                                    }])}
                                    className="w-full p-4 mb-6 rounded-lg border-2 border-dashed border-gray-300
                                        hover:border-yellow-400 hover:bg-yellow-50 transition-colors flex
                                        items-center justify-center gap-2 text-gray-600 hover:text-yellow-600"
                                >
                                    <Scissors className="w-5 h-5" />
                                    Add Another Item
                                </button>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            const incompleteProduct = products.find(p => !p.type);
                                            if (incompleteProduct) {
                                                toast.error('Please select type for all items');
                                            } else {
                                                setStep(3);
                                            }
                                        }}
                                        className="px-6 py-3 bg-yellow-400 text-white font-medium rounded-lg
                                            hover:bg-yellow-500 transition-colors"
                                    >
                                        Continue to Measurements
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Measurements */}
                        {step === 3 && (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Ruler className="w-5 h-5" />
                                            Measurements
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <MeasurementDetails
                                            measurements={measurements}
                                            setMeasurements={setMeasurements}
                                            customer={savedCustomer}
                                            onFileUpload={handleFileUpload}
                                            setIsLoading={setIsLoading}
                                            isLoading={isLoading}
                                            setHasUploadedFile={setHasUploadedFile}
                                            uploadedFiles={uploadedFiles}
                                            isUploading={isUploading}
                                            setIsUploading={setIsUploading}
                                            setUploadedFiles={setUploadedFiles}
                                            hasUploadedFile={hasUploadedFile}
                                        />
                                        <div className="flex justify-end gap-4 mt-6">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg
                                                    hover:bg-gray-200 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Skip validation if file is uploaded now or was uploaded before
                                                    // Check if a measurement file exists for this customer
                                                    const hasMeasurementFile = isMeasurementFileUploaded ||
                                                        uploadedFiles.length>0 ||
                                                        (measurements.hasExistingFile === true);

                                                    if (hasMeasurementFile) {
                                                        setStep(4);
                                                        return;
                                                    }

                                                    const invalidMeasurements = !measurements.chest || !measurements.shoulders ||
                                                        !measurements.neck || !measurements.sleeves || !measurements.waist ||
                                                        !measurements.bottomLenght || !measurements.topLenght;

                                                    if (invalidMeasurements) {
                                                        toast.error('Please fill all measurements');
                                                    } else if (Object.values(measurements).some(m => m < 1)) {
                                                        toast.error('Measurements cannot be negative');
                                                    } else if (measurements.chest > 100 || measurements.shoulders > 50 ||
                                                        measurements.neck > 30 || measurements.sleeves > 50 ||
                                                        measurements.waist > 50 || measurements.bottomLenght > 100 ||
                                                        measurements.topLenght > 100) {
                                                        toast.error('Invalid measurement values');
                                                    } else {
                                                        setStep(4);
                                                    }
                                                }}
                                                className="px-6 py-3 bg-yellow-400 text-white font-medium rounded-lg
                                                    hover:bg-yellow-500 transition-colors"
                                            >
                                                Review Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {step === 4 && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Order Summary
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {products.map((product, index) => (
                                                <div key={index} className="flex justify-between items-start py-4 border-b">
                                                    <div>
                                                        <h4 className="font-medium flex items-center gap-2">
                                                            <Scissors className="w-4 h-4" />
                                                            {product.type}
                                                        </h4>
                                                        <div className="mt-2 space-y-1">
                                                            {product.options.map((opt, idx) => (
                                                                <p key={idx} className="text-sm text-gray-600">
                                                                    {opt.name}: {opt.customization}
                                                                </p>
                                                            ))}
                                                            {product.instructions && (
                                                                <p className="text-sm text-gray-500 mt-2">
                                                                    Note: {product.instructions}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">
                                                        Rs. {product.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-medium">Total Amount</span>
                                                    <div className="space-y-1">
                                                        <input
                                                            type="number"
                                                            value={totalPrice}
                                                            onChange={(e) => setTotalPrice(Number(e.target.value))}
                                                            className="w-40 p-2 text-right border border-gray-200 rounded-lg
                                                                focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                        />
                                                        <p className="text-sm text-gray-500 text-right">
                                                            Final price can be adjusted
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-4 pt-6">
                                                <button
                                                    onClick={() => setStep(3)}
                                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg
                                                        hover:bg-gray-200 transition-colors"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={handlePlaceOrder}
                                                    disabled={loading}
                                                    className="px-6 py-3 bg-yellow-400 text-white font-medium rounded-lg
                                                        hover:bg-yellow-500 transition-colors disabled:opacity-50 flex
                                                        items-center gap-2"
                                                >
                                                    {loading ? 'Placing Order...' : 'Place Order'}
                                                    {!loading && <CreditCard className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;
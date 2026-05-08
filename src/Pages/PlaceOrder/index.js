import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MeasurementDetails from "../../Components/ItemDetials/Shirt";

const steps = [
    { icon: 'person', label: 'Customer' },
    { icon: 'content_cut', label: 'Items' },
    { icon: 'straighten', label: 'Measurements' },
    { icon: 'receipt_long', label: 'Review' },
];

const PlaceOrder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [savedCustomer, setSavedCustomer] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchBy, setSearchBy] = useState('all');
    const [customersPage, setCustomersPage] = useState(1);
    const [customersPagination, setCustomersPagination] = useState({
        page: 1, limit: 10, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false
    });
    const [customersLoading, setCustomersLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMeasurementFileUploaded, setIsMeasurementFileUploaded] = useState(false);
    const [hasUploadedFile, setHasUploadedFile] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [customer, setCustomer] = useState({ orderNumber: '', name: '', phone: '', address: '' });
    const [orderNumberError, setOrderNumberError] = useState('');

    const [measurements, setMeasurements] = useState({
        chest: 0, neck: 0, shoulders: 0, sleeves: 0,
        topLenght: 0, bottomLenght: 0, waist: 0
    });

    const [products, setProducts] = useState([{
        type: '', instructions: '', price: 0, options: [],
    }]);

    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) navigate('/login');
        getItems();
        fetchNextOrderNumber();
    }, []);

    const fetchNextOrderNumber = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/next-order-number`);
            if (res.data?.nextOrderNumber) {
                setCustomer((c) => ({ ...c, orderNumber: res.data.nextOrderNumber }));
            }
        } catch (err) {
            console.error('Error fetching next order number:', err);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => { getCustomers(customersPage, searchQuery, searchBy); }, 300);
        return () => clearTimeout(t);
    }, [customersPage, searchQuery, searchBy]);

    useEffect(() => {
        setTotalPrice(products.reduce((total, p) => total + p.price, 0));
    }, [products]);

    useEffect(() => {
        if (savedCustomer) fetchCustomerDetails();
    }, [savedCustomer]);

    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/;

    const getCustomers = async (page = 1, query = '', field = 'all') => {
        try {
            setCustomersLoading(true);
            const params = { page, limit: 10 };
            if (query) {
                if (field === 'all') {
                    params.query = query;
                } else {
                    params.searchBy = field;
                    params.search = query;
                    params[field] = query;
                }
            }
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/getallcustomers`, { params });
            const data = response.data;
            setCustomers(data?.data || data?.customer || []);
            setCustomersPagination(data?.pagination || {
                page, limit: 10, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false
            });
        } catch {
            toast.error('Failed to fetch customers');
        } finally {
            setCustomersLoading(false);
        }
    };

    const getItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/items/getallitems`);
            setItems(response.data);
        } catch {
            toast.error('Failed to fetch items');
        }
    };

    const fetchCustomerDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/get/${savedCustomer}`);
            if (response.data.measurements) setMeasurements(response.data.measurements);
            if (response.data.measurementFiles?.length > 0) {
                setUploadedFiles(response.data.measurementFiles);
                setHasUploadedFile(true);
            } else {
                setHasUploadedFile(false);
            }
        } catch {
            toast.error('Failed to load customer measurement data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        try {
            setLoading(true);
            setOrderNumberError('');
            const customerResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/customer/add`, { customer });
            const newCustomer = customerResponse.data;
            if (newCustomer._id) {
                setSavedCustomer(newCustomer._id);
                await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${newCustomer._id}`, { measurements });
                toast.success('Customer added successfully!');
                setStep(2);
            }
        } catch (error) {
            if (error.response?.status === 409) {
                const msg = error.response.data?.message || 'Order number already exists';
                setOrderNumberError(msg);
                toast.error(msg);
            } else {
                toast.error('Failed to add customer');
            }
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
        } catch {
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
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const handleOptionChange = (index, optionName, customization) => {
        const updated = [...products];
        const existing = updated[index].options.findIndex((opt) => opt.name === optionName);
        if (existing >= 0) updated[index].options[existing].customization = customization;
        else updated[index].options.push({ name: optionName, customization });
        setProducts(updated);
    };

    return (
        <div className="p-8 font-body">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
                    >
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    </button>
                )}
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">New Order</h1>
                    <p className="text-stone-400 mt-1 text-sm">Step {step} of {steps.length} — {steps[step - 1].label}</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <div className="relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant/20">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                    <div className="relative flex justify-between">
                        {steps.map((s, index) => {
                            const done = step > index + 1;
                            const active = step === index + 1;
                            return (
                                <div key={index} className="flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                        done ? 'bg-primary text-on-primary' :
                                        active ? 'bg-primary text-on-primary' :
                                        'bg-surface-container-low text-stone-400'
                                    }`}>
                                        <span className="material-symbols-outlined text-[18px]">
                                            {done ? 'check' : s.icon}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold font-label ${active || done ? 'text-primary' : 'text-stone-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step 1: Customer */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Customer */}
                    <div className="bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">New Customer</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Order Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">tag</span>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1248"
                                        value={customer.orderNumber}
                                        onChange={(e) => { setCustomer({ ...customer, orderNumber: e.target.value }); setOrderNumberError(''); }}
                                        className={`w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 font-body ${orderNumberError ? 'ring-2 ring-error' : 'focus:ring-primary/20'}`}
                                    />
                                </div>
                                {orderNumberError && (
                                    <p className="mt-1 text-xs text-error font-body">{orderNumberError}</p>
                                )}
                            </div>
                            {[
                                { label: 'Full Name', icon: 'person', key: 'name', placeholder: 'Enter customer name', type: 'text' },
                                { label: 'Phone', icon: 'call', key: 'phone', placeholder: '03XX-XXXXXXX', type: 'text' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">{field.label}</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">{field.icon}</span>
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            maxLength={field.key === 'phone' ? 12 : undefined}
                                            onInput={field.key === 'phone' ? formatPhoneNumber : undefined}
                                            onChange={(e) => setCustomer({ ...customer, [field.key]: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-[20px]">location_on</span>
                                    <textarea
                                        placeholder="Enter delivery address"
                                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!customer.orderNumber || !customer.name || !customer.phone || !customer.address) {
                                        toast.error('Please fill all fields');
                                    } else if (specialCharactersRegex.test(customer.name)) {
                                        toast.error('Name should not contain special characters');
                                    } else if (customer.phone.length !== 12) {
                                        toast.error('Please enter a valid phone number');
                                    } else {
                                        handleAddCustomer();
                                    }
                                }}
                                disabled={loading}
                                className="w-full py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 font-label flex items-center justify-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />}
                                {loading ? 'Adding…' : 'Continue with New Customer'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Customer */}
                    <div className="bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">Select Existing</h2>
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                                <input
                                    type="text"
                                    placeholder={searchBy === 'all' ? 'Search customers…' : `Search by ${searchBy}…`}
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCustomersPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                                />
                            </div>
                            <select
                                value={searchBy}
                                onChange={(e) => { setSearchBy(e.target.value); setCustomersPage(1); }}
                                className="px-3 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                            >
                                <option value="all">All</option>
                                <option value="orderNumber">Order #</option>
                                <option value="name">Name</option>
                                <option value="phone">Phone</option>
                                <option value="address">Address</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                        <div className="space-y-2 max-h-[360px] overflow-y-auto">
                            {customersLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-6 h-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                </div>
                            ) : customers.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-10">
                                    <span className="material-symbols-outlined text-[32px] text-stone-300">person_search</span>
                                    <p className="text-sm text-stone-400 font-label">No customers found</p>
                                </div>
                            ) : customers.map((c) => (
                                <div
                                    key={c._id}
                                    onClick={() => { setSavedCustomer(c._id); setStep(2); }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-sm font-bold text-on-secondary-fixed flex-shrink-0">
                                        {c.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {c.orderNumber && (
                                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded font-mono">#{c.orderNumber}</span>
                                            )}
                                            <p className="font-bold text-on-surface text-sm truncate">{c.name}</p>
                                        </div>
                                        <p className="text-xs text-stone-400 truncate">{c.phone} · {c.address}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-[18px] text-stone-300">chevron_right</span>
                                </div>
                            ))}
                        </div>
                        {!customersLoading && customersPagination.total > 0 && (
                            <div className="flex items-center justify-between pt-4 mt-2 border-t border-outline-variant/10">
                                <span className="text-xs text-stone-400">
                                    Page {customersPagination.page} of {customersPagination.totalPages || 1} · {customersPagination.total} total
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCustomersPage(p => Math.max(p - 1, 1))}
                                        disabled={!(customersPagination.hasPrevPage ?? customersPage > 1)}
                                        className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => setCustomersPage(p => p + 1)}
                                        disabled={!(customersPagination.hasNextPage ?? customersPage < (customersPagination.totalPages || 1))}
                                        className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Items */}
            {step === 2 && (
                <div>
                    <div className="space-y-6">
                        {products.map((product, index) => (
                            <div key={index} className="bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-headline">
                                        Item {index + 1}
                                    </h3>
                                    {index > 0 && (
                                        <button
                                            onClick={() => {
                                                const updated = [...products];
                                                updated.splice(index, 1);
                                                setProducts(updated);
                                            }}
                                            className="text-xs font-bold text-error hover:underline font-label flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* Type Selection */}
                                <div className="mb-5">
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 font-label">Select Item Type</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {items.map((item) => (
                                            <div
                                                key={item.name}
                                                onClick={() => {
                                                    handleProductChange(index, 'type', item.name);
                                                    handleProductChange(index, 'price', item.price);
                                                }}
                                                className={`p-4 text-center rounded-xl cursor-pointer transition-all ${
                                                    product.type === item.name
                                                        ? 'bg-primary text-on-primary'
                                                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[24px] mb-1 block">content_cut</span>
                                                <span className="font-bold text-sm">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customization Options */}
                                {product.type && (
                                    <div className="mb-5">
                                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 font-label">Customizations</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {items.find((item) => item.name === product.type)?.options.map((option) => (
                                                <div key={option.name}>
                                                    <label className="block text-xs text-stone-400 mb-1 font-label">{option.name}</label>
                                                    <select
                                                        onChange={(e) => handleOptionChange(index, option.name, e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                                    >
                                                        <option value="">Select {option.name}</option>
                                                        {option.customizations.map((c) => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Special Instructions</label>
                                    <textarea
                                        placeholder="Any special notes for this item…"
                                        onChange={(e) => handleProductChange(index, 'instructions', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/10">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rs.</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={product.price}
                                            onChange={(e) => handleProductChange(index, 'price', Number(e.target.value) || 0)}
                                            className="w-36 pl-10 pr-3 py-2 bg-surface-container-low rounded-xl border-none text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setProducts([...products, { type: '', instructions: '', price: 0, options: [] }])}
                            className="w-full py-4 rounded-2xl border-2 border-dashed border-outline-variant/30 hover:border-primary/30 hover:bg-primary/[0.03] transition-colors flex items-center justify-center gap-2 text-stone-400 hover:text-primary font-bold font-label text-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Add Another Item
                        </button>

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    if (products.find((p) => !p.type)) {
                                        toast.error('Please select type for all items');
                                    } else {
                                        setStep(3);
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                            >
                                Continue to Measurements
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Measurements */}
            {step === 3 && (
                <div>
                    <div className="bg-surface-container-lowest rounded-2xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 font-headline">Measurements</h2>
                        <MeasurementDetails
                            measurements={measurements}
                            setMeasurements={setMeasurements}
                            customer={savedCustomer}
                            onFileUpload={setIsMeasurementFileUploaded}
                            setIsLoading={setIsLoading}
                            isLoading={isLoading}
                            setHasUploadedFile={setHasUploadedFile}
                            uploadedFiles={uploadedFiles}
                            isUploading={isUploading}
                            setIsUploading={setIsUploading}
                            setUploadedFiles={setUploadedFiles}
                            hasUploadedFile={hasUploadedFile}
                        />
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-outline-variant/10">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => {
                                    const hasMeasurementFile = isMeasurementFileUploaded || uploadedFiles.length > 0 || measurements.hasExistingFile === true;
                                    if (hasMeasurementFile) { setStep(4); return; }
                                    const invalid = !measurements.chest || !measurements.shoulders || !measurements.neck ||
                                        !measurements.sleeves || !measurements.waist || !measurements.bottomLenght || !measurements.topLenght;
                                    if (invalid) toast.error('Please fill all measurements');
                                    else if (Object.values(measurements).some((m) => m < 1)) toast.error('Measurements cannot be negative');
                                    else setStep(4);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                            >
                                Review Order
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Review & Place */}
            {step === 4 && (
                <div>
                    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                        <div className="px-8 pt-8 pb-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-headline">Order Summary</h2>
                        </div>

                        <table className="w-full masters-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Customizations</th>
                                    <th className="text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-[16px] text-primary">content_cut</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-on-surface">{product.type}</p>
                                                    {product.instructions && (
                                                        <p className="text-xs text-stone-400 mt-0.5">{product.instructions}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {product.options.map((opt, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-0.5 bg-surface-container-low rounded-full text-on-surface-variant font-bold">
                                                        {opt.name}: {opt.customization}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-right font-bold text-on-surface">Rs. {product.price.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="px-8 py-6 border-t border-outline-variant/10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-bold text-on-surface font-label">Final Total</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={totalPrice}
                                        onChange={(e) => setTotalPrice(Number(e.target.value))}
                                        className="w-36 px-4 py-2 bg-surface-container-low rounded-xl border-none text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                    />
                                    <p className="text-xs text-stone-400 font-label">adjustable</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 font-label flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    )}
                                    {loading ? 'Placing Order…' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaceOrder;

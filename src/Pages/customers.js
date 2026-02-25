import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    ArrowLeft,
    Calendar,
    Phone,
    MapPin,
    ShoppingBag
} from 'lucide-react';
import {
    Ruler, FileText, Image, Download, Save,
    X, Upload, Camera, Trash
} from 'lucide-react';


const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const customersPerPage = 10;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCustomers(currentPage, searchQuery, searchType);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery, searchType]);

    const fetchCustomers = async (page = 1, query = '', type = 'name') => {
        try {
            setLoading(true);
            const trimmedQuery = query.trim();
            const params = {
                page,
                limit: customersPerPage,
            };
            if (trimmedQuery) {
                if (type === 'query') {
                    params.query = trimmedQuery;
                } else {
                    params[type] = trimmedQuery;
                }
            }
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/getallcustomers`, {
                params
            });
            const responseData = response.data;
            setCustomers(responseData?.data || responseData?.customer || []);
            setPagination(responseData?.pagination || {
                page,
                limit: customersPerPage,
                total: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            });
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/customer/delete/${id}`);
                toast.success('Customer deleted successfully');
                fetchCustomers(currentPage, searchQuery);
            } catch (error) {
                toast.error('Failed to delete customer');
                console.error('Error deleting customer:', error);
            }
        }
    };

    const effectiveTotalPages = pagination.totalPages || Math.max(1, Math.ceil((pagination.total || 0) / customersPerPage));
    const canGoPrev = pagination.hasPrevPage ?? currentPage > 1;
    const canGoNext = pagination.hasNextPage ?? currentPage < effectiveTotalPages;

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxButtons = 5;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(effectiveTotalPages, start + maxButtons - 1);

        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        for (let i = start; i <= end; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    return (
                <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                        <button
                            onClick={() => navigate('/customers/add')}
                            className="flex items-center gap-2 bg-[rgba(253,224,71,0.3)] text-[#854d0e] px-4 py-2 rounded-lg hover:bg-[rgba(253,224,71,0.3)] transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Customer
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="sm:w-56">
                                <select
                                    value={searchType}
                                    onChange={(e) => {
                                        setSearchType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)] bg-white"
                                >
                                    <option value="name">Name</option>
                                    <option value="orderNumber">Order #</option>
                                    <option value="phone">Phone</option>
                                    <option value="address">Address</option>
                                    <option value="email">Email</option>
                                    <option value="query">Generic</option>
                                </select>
                            </div>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={`Search by ${searchType === 'orderNumber' ? 'order #' : searchType}...`}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order #</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Address</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Orders</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">Loading...</td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No customers found</td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">{customer.orderNumber || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{customer.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{customer.address}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{customer.orders?.length || 0}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/customers/view/${customer._id}`)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/customers/edit/${customer._id}`)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                                Page {currentPage} of {effectiveTotalPages} ({pagination.total} total customers)
                            </p>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={!canGoPrev}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {getPageNumbers().map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`px-3 py-1 rounded-lg border ${
                                            currentPage === pageNumber
                                                ? 'bg-[rgba(253,224,71,0.3)] text-[#854d0e] border-[rgba(253,224,71,0.3)]'
                                                : 'border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    disabled={!canGoNext}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AddCustomer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingOrderNumber, setLoadingOrderNumber] = useState(false);
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        address: '',
        orderNumber: '',
    });

    useEffect(() => {
        const fetchNextOrderNumber = async () => {
            try {
                setLoadingOrderNumber(true);
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/next-order-number`);
                const nextOrderNumber = response?.data?.nextOrderNumber;
                if (nextOrderNumber && !customer.orderNumber) {
                    setCustomer((prev) => ({ ...prev, orderNumber: String(nextOrderNumber) }));
                }
            } catch (error) {
                console.error('Error fetching next order number:', error);
            } finally {
                setLoadingOrderNumber(false);
            }
        };

        fetchNextOrderNumber();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // In AddCustomer component, update the handleSubmit function:
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Wrap customer object in another object with "customer" key
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/customer/add`, { customer });
            toast.success('Customer added successfully');
            navigate('/customers');
        } catch (error) {
            toast.error('Failed to add customer');
            console.error('Error adding customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (event) => {
        let value = event.target.value.replace(/\D/g, "");
        if (value.length > 4) value = `${value.slice(0, 4)}-${value.slice(4)}`;
        if (value.length > 11) value = value.slice(0, 12);
        setCustomer({ ...customer, phone: value });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/customers')}
                            className="p-2 hover:bg-gray-100 rounded-full mr-4"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Add New Customer</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order #
                            </label>
                            <input
                                type="text"
                                value={customer.orderNumber}
                                onChange={(e) => setCustomer({ ...customer, orderNumber: e.target.value })}
                                placeholder={loadingOrderNumber ? 'Fetching next order #' : 'Enter order #'}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="03XX-XXXXXXX"
                                value={customer.phone}
                                onChange={formatPhoneNumber}
                                maxLength={12}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                required
                                value={customer.address}
                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)] min-h-[100px]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[rgba(253,224,71,0.3)] text-[#854d0e] py-2 px-4 rounded-lg hover:bg-[rgba(253,224,71,0.3)] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Customer'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// EditCustomer.jsx
const EditCustomer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/${id}`);
            setCustomer(response.data);
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    // In EditCustomer component, update the handleSubmit function:
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${id}`, { customer });
            toast.success('Customer updated successfully');
            navigate('/customers');
        } catch (error) {
            toast.error('Failed to update customer');
            console.error('Error updating customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (event) => {
        let value = event.target.value.replace(/\D/g, "");
        if (value.length > 4) value = `${value.slice(0, 4)}-${value.slice(4)}`;
        if (value.length > 11) value = value.slice(0, 12);
        setCustomer({ ...customer, phone: value });
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/customers')}
                            className="p-2 hover:bg-gray-100 rounded-full mr-4"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Edit Customer</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="03XX-XXXXXXX"
                                value={customer.phone}
                                onChange={formatPhoneNumber}
                                maxLength={12}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                required
                                value={customer.address}
                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(253,224,71,0.3)] min-h-[100px]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[rgba(253,224,71,0.3)] text-[#854d0e] py-2 px-4 rounded-lg hover:bg-[rgba(253,224,71,0.3)] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};



const ViewCustomer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [editingMeasurements, setEditingMeasurements] = useState(false);
    const [measurements, setMeasurements] = useState({});
    const [uploading, setUploading] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersSearchQuery] = useState('');
    const [ordersPagination, setOrdersPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    useEffect(() => {
        fetchCustomerDetails(ordersPage);
    }, [id, ordersPage]);

    useEffect(() => {
        if (customer && customer.measurements) {
            setMeasurements({
                chest: customer.measurements.chest || 0,
                shoulders: customer.measurements.shoulders || 0,
                neck: customer.measurements.neck || 0,
                sleeves: customer.measurements.sleeves || 0,
                topLenght: customer.measurements.topLenght || 0,
                bottomLenght: customer.measurements.bottomLenght || 0,
                waist: customer.measurements.waist || 0
            });
        }
    }, [customer]);

    const fetchCustomerDetails = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/get/${id}`);
            setCustomer(response.data);

            // Fetch orders for this customer
            const ordersResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/customer/${id}`, {
                params: {
                    page,
                    limit: 10,
                    query: ordersSearchQuery
                }
            });
            const ordersData = ordersResponse.data;
            setOrders(ordersData?.data || ordersData?.orders || []);
            setOrdersPagination(ordersData?.pagination || {
                page,
                limit: 10,
                total: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            });
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMeasurementChange = (field, value) => {
        setMeasurements(prev => ({
            ...prev,
            [field]: Number(value)
        }));
    };

    const saveMeasurements = async () => {
        try {
            setLoading(true);
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${id}`, {
                measurements: measurements
            });

            // Update the local state
            setCustomer(prev => ({
                ...prev,
                measurements: measurements
            }));

            setEditingMeasurements(false);
            toast.success('Measurements updated successfully');
        } catch (error) {
            toast.error('Failed to update measurements');
            console.error('Error updating measurements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);

        try {
            const formData = new FormData();

            files.forEach(file => {
                // Check file type
                if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
                    toast.error('Only images and PDF files are allowed');
                    return;
                }

                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('File size should be less than 5MB');
                    return;
                }

                formData.append('files', file);
            });

            formData.append('customerId', id);

            // Upload to server
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/customer/upload-measurement-files`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                // Update customer data with new files
                const updatedFiles = [...(customer.measurementFiles || []), ...response.data.files];
                setCustomer(prev => ({
                    ...prev,
                    measurementFiles: updatedFiles
                }));

                toast.success('Files uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    const removeFile = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            setLoading(true);
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/customer/remove-measurement-file/${fileId}`);

            // Update local state
            const updatedFiles = customer.measurementFiles.filter(file => file.id !== fileId);
            setCustomer(prev => ({
                ...prev,
                measurementFiles: updatedFiles
            }));

            toast.success('File removed successfully');
        } catch (error) {
            toast.error('Failed to remove file');
            console.error('Error removing file:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewFile = (file) => {
        window.open(file.url, '_blank');
    };

    if (loading && !customer) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    }

    if (!customer) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Customer not found</div>;
    }

    // Check if customer has measurements
    const hasMeasurements = editingMeasurements || (customer.measurements && (
        customer.measurements.chest ||
        customer.measurements.shoulders ||
        customer.measurements.neck ||
        customer.measurements.sleeves ||
        customer.measurements.topLenght ||
        customer.measurements.bottomLenght ||
        customer.measurements.waist
    ));

    // Check if customer has measurement files
    const hasMeasurementFiles = customer.measurementFiles && customer.measurementFiles.length > 0;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-[rgba(253,224,71,0.3)] p-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/customers')}
                                className="p-2 hover:bg-[rgba(253,224,71,0.3)] rounded-full mr-4"
                            >
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </button>
                            <h1 className="text-2xl font-bold text-white">Customer Details</h1>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Personal Information</h2>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Created At</p>
                                        <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Order #</p>
                                        <p className="font-medium">{customer.orderNumber || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{customer.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Total Orders</p>
                                        <p className="font-medium">{customer.orders?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Measurements */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <Ruler className="w-5 h-5" />
                                        Measurements
                                    </h2>

                                    {editingMeasurements ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingMeasurements(false)}
                                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={saveMeasurements}
                                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                            >
                                                <Save className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingMeasurements(true)}
                                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded flex items-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span className="text-sm">Edit</span>
                                        </button>
                                    )}
                                </div>

                                {hasMeasurements ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Chest</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.chest || ''}
                                                    onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.chest || 0} inches</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Shoulders</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.shoulders || ''}
                                                    onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.shoulders || 0} inches</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Neck</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.neck || ''}
                                                    onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.neck || 0} inches</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Sleeves</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.sleeves || ''}
                                                    onChange={(e) => handleMeasurementChange('sleeves', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.sleeves || 0} inches</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Top Length</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.topLenght || ''}
                                                    onChange={(e) => handleMeasurementChange('topLenght', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.topLenght || 0} inches</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Bottom Length</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.bottomLenght || ''}
                                                    onChange={(e) => handleMeasurementChange('bottomLenght', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.bottomLenght || 0} inches</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Waist</p>
                                            {editingMeasurements ? (
                                                <input
                                                    type="number"
                                                    value={measurements.waist || ''}
                                                    onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                                                    className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                />
                                            ) : (
                                                <p className="font-medium">{customer.measurements.waist || 0} inches</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {editingMeasurements ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Chest</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.chest || ''}
                                                        onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Shoulders</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.shoulders || ''}
                                                        onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Neck</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.neck || ''}
                                                        onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Sleeves</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.sleeves || ''}
                                                        onChange={(e) => handleMeasurementChange('sleeves', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Top Length</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.topLenght || ''}
                                                        onChange={(e) => handleMeasurementChange('topLenght', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Bottom Length</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.bottomLenght || ''}
                                                        onChange={(e) => handleMeasurementChange('bottomLenght', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">Waist</p>
                                                    <input
                                                        type="number"
                                                        value={measurements.waist || ''}
                                                        onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                                                        className="w-full p-1 text-sm border border-gray-300 rounded mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No measurements recorded</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Measurement Files */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Measurement Documents
                                </h2>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                        disabled={uploading}
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span className="text-sm">Upload</span>
                                    </button>
                                    <button
                                        onClick={() => cameraInputRef.current.click()}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                        disabled={uploading}
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span className="text-sm">Camera</span>
                                    </button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            {uploading && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                                    <p className="text-blue-600">Uploading files...</p>
                                </div>
                            )}

                            {hasMeasurementFiles ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {customer.measurementFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="border rounded-lg p-3 hover:shadow-md transition-shadow relative"
                                        >
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>

                                            <div className="flex items-start gap-3" onClick={() => viewFile(file)}>
                                                {file.mimeType.includes('pdf') ? (
                                                    <FileText className="w-10 h-10 text-red-500" />
                                                ) : (
                                                    <div className="relative w-14 h-14 bg-gray-100 rounded overflow-hidden">
                                                        <img
                                                            src={file.url}
                                                            alt="Measurement document"
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(file.uploadDate).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                viewFile(file);
                                                            }}
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            View
                                                        </button>
                                                        <a
                                                            href={file.url}
                                                            download
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs flex items-center gap-1 text-green-600 hover:text-green-800"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">No measurement documents uploaded</p>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 inline-flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Files
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Recent Orders
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Products</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Payment</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-gray-500">No orders found</td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-blue-600 cursor-pointer"
                                                    onClick={() => navigate(`/order/details/${order._id}`)}>
                                                    {order._id.substring(0, 8)}...
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(order.date).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {order.products?.length || 0} products
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                    Rs. {order.total}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-[#854d0e]'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                        ${order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {order.paid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-600">
                                    Page {ordersPagination.page} of {ordersPagination.totalPages} ({ordersPagination.total} total orders)
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setOrdersPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={!ordersPagination.hasPrevPage}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setOrdersPage((prev) => prev + 1)}
                                        disabled={!ordersPagination.hasNextPage}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Export all components
export {
    Customers as default,
    AddCustomer,
    EditCustomer,
    ViewCustomer
};


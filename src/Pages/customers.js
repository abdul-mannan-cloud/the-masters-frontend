import React, { useState, useEffect } from 'react';
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

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/getallcustomers`);
            setCustomers(response.data.customers);
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
                fetchCustomers();
            } catch (error) {
                toast.error('Failed to delete customer');
                console.error('Error deleting customer:', error);
            }
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    return (
                <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                        <button
                            onClick={() => navigate('/customers/add')}
                            className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Customer
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search customers by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
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
                                    <td colSpan="5" className="text-center py-4">Loading...</td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">No customers found</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50">
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
                </div>
            </div>
        </div>
    );
};

const AddCustomer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        address: '',
    });

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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-400 text-white py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-400 text-white py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ViewCustomer.jsx component (keeping your existing implementation)...
const ViewCustomer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    const fetchCustomerDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/${id}`);
            setCustomer(response.data);
            // Fetch orders for this customer
            const ordersResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/customer/${id}`);
            setOrders(ordersResponse.data);
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    }

    if (!customer) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Customer not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-yellow-400 p-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/customers')}
                                className="p-2 hover:bg-yellow-500 rounded-full mr-4"
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
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Created At</p>
                                        <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
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
                        </div>

                        {/* Recent Orders */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
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
                                        'bg-yellow-100 text-yellow-800'}`}>
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

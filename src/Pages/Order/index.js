import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Calendar,
    User,
    Package,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    Truck
} from 'lucide-react';

const AllOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [statusQuery, setStatusQuery] = useState('All');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 8;

    useEffect(() => {
        if (!localStorage.getItem('ciseauxtoken')) {
            navigate('/login');
            return;
        }
        getOrders();
    }, []);

    const getOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/getallorders`);
            setOrders(response.data);
            setAllOrders(response.data);
        } catch (error) {
            toast.error("Failed to fetch orders");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            const filteredOrders = allOrders.filter((order) => {
                const jobDate = format(new Date(order.date), 'yyyy-MM-dd');
                return jobDate === selectedDate;
            });
            setOrders(filteredOrders);
        } else {
            setOrders(allOrders);
        }
    }, [selectedDate, allOrders]);

    const filteredOrders = orders.filter((order) => {
        const orderStatus = order.status.toLowerCase().includes(searchQuery.toLowerCase());
        const orderIdMatch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
        const customerMatch = order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const statusQueryMatch = statusQuery === 'All' || order.status.toLowerCase() === statusQuery.toLowerCase();
        return (orderIdMatch || orderStatus || customerMatch) && statusQueryMatch;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <AlertCircle className="w-4 h-4" />;
            case 'in progress':
                return <Clock className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            default:
                return null;
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxButtons = 5;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);

        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        if (start > 1) {
            pageNumbers.push(1);
            if (start > 2) pageNumbers.push('...');
        }

        for (let i = start; i <= end; i++) {
            pageNumbers.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                        <div className="flex flex-wrap gap-3">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <select
                                value={statusQuery}
                                onChange={(e) => setStatusQuery(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="All">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="shipped">Shipped</option>
                            </select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search orders by ID, status, or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-4 py-3 text-sm text-blue-600"
                                                onClick={() => navigate(`/order/details/${order._id}`)}>
                                                #{order._id.substring(0, 8)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {format(new Date(order.date), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                                            <span className="text-yellow-800 font-medium">
                                                                {order.customer?.name?.[0]?.toUpperCase() || '?'}
                                                            </span>
                                                    </div>
                                                    <span>{order.customer?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right">
                                                Rs. {order.total.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    {expandedOrderId === order._id ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order._id && (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-3 bg-gray-50">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                        <div className="space-y-3">
                                                            <h3 className="font-medium text-gray-900">Order Details</h3>
                                                            <div className="text-sm text-gray-600">
                                                                <p className="flex items-center gap-2">
                                                                    <Package className="w-4 h-4" />
                                                                    Products: {order.products?.length || 0}
                                                                </p>
                                                                <p className="flex items-center gap-2 mt-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Order Date: {format(new Date(order.date), 'PPP')}
                                                                </p>
                                                                <p className="flex items-center gap-2 mt-1">
                                                                    <CreditCard className="w-4 h-4" />
                                                                    Payment: {order.paid ? 'Paid' : 'Unpaid'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <h3 className="font-medium text-gray-900">Customer Details</h3>
                                                            <div className="text-sm text-gray-600">
                                                                <p className="flex items-center gap-2">
                                                                    <User className="w-4 h-4" />
                                                                    Name: {order.customer?.name}
                                                                </p>
                                                                <p className="flex items-center gap-2 mt-1">
                                                                    Phone: {order.customer?.phone}
                                                                </p>
                                                                <p className="flex items-center gap-2 mt-1">
                                                                    Address: {order.customer?.address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filteredOrders.length > 0 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {getPageNumbers().map((number, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof number === 'number' && setCurrentPage(number)}
                                    className={`px-3 py-1 rounded-lg ${
                                        currentPage === number
                                            ? 'bg-yellow-400 text-white'
                                            : 'hover:bg-gray-100'
                                    }`}
                                    disabled={typeof number !== 'number'}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllOrders;
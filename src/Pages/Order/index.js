import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const AllOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [statusQuery, setStatusQuery] = useState('All');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const ordersPerPage = 8;

    useEffect(() => {
        if (!localStorage.getItem('ciseauxtoken')) {
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getOrders(currentPage, searchQuery);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery]);

    const getOrders = async (page = 1, query = '') => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/getallorders`, {
                params: { page, limit: ordersPerPage, query }
            });
            const responseData = response.data;
            setOrders(responseData?.data || responseData?.orders || []);
            setPagination(responseData?.pagination || {
                page,
                limit: ordersPerPage,
                total: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            });
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const orderDateMatch = !selectedDate || format(new Date(order.date), 'yyyy-MM-dd') === selectedDate;
        const statusQueryMatch = statusQuery === 'All' || order.status.toLowerCase() === statusQuery.toLowerCase();
        return orderDateMatch && statusQueryMatch;
    });

    const getStatusBadge = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'pending':     return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
            case 'in progress': return 'bg-secondary-container text-on-secondary-container';
            case 'completed':   return 'bg-primary-fixed text-on-primary-fixed-variant';
            case 'shipped':     return 'bg-primary text-on-primary';
            default:            return 'bg-surface-container text-on-surface-variant';
        }
    };

    const getStatusIcon = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'pending':     return 'schedule';
            case 'in progress': return 'construction';
            case 'completed':   return 'check_circle';
            case 'shipped':     return 'local_shipping';
            default:            return 'circle';
        }
    };

    // Derived stats from loaded orders
    const activeOrders = orders.filter(o => o.status?.toLowerCase() === 'in progress').length;
    const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
    const pageRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = pagination.total || orders.length;
    const activePercent = orders.length > 0 ? Math.round((activeOrders / orders.length) * 100) : 0;

    const currentOrders = filteredOrders;
    const effectiveTotalPages = pagination.totalPages || Math.max(1, Math.ceil((pagination.total || 0) / ordersPerPage));
    const canGoPrev = pagination.hasPrevPage ?? currentPage > 1;
    const canGoNext = pagination.hasNextPage ?? currentPage < effectiveTotalPages;

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxButtons = 5;
        const totalPages = effectiveTotalPages;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
        if (start > 1) { pageNumbers.push(1); if (start > 2) pageNumbers.push('...'); }
        for (let i = start; i <= end; i++) pageNumbers.push(i);
        if (end < totalPages) { if (end < totalPages - 1) pageNumbers.push('...'); pageNumbers.push(totalPages); }
        return pageNumbers;
    };

    return (
        <div className="p-8 font-body">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1 font-label">Production Pipeline</p>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Order Management</h1>
                </div>
                <button
                    onClick={() => navigate('/placeorder')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Order
                </button>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Revenue Card — dark green */}
                <div className="col-span-12 md:col-span-4 bg-primary rounded-2xl p-8 text-on-primary flex flex-col justify-between min-h-[180px]" style={{ boxShadow: '0 12px 40px rgba(25,83,0,0.18)' }}>
                    <div className="flex items-start justify-between">
                        <div className="p-2.5 bg-white/10 rounded-xl">
                            <span className="material-symbols-outlined text-[24px]">payments</span>
                        </div>
                        <span className="text-xs font-bold text-on-primary/60 uppercase tracking-widest font-label">Current Page</span>
                    </div>
                    <div className="mt-6">
                        <p className="text-on-primary/70 text-sm mb-1 font-label">Page Revenue</p>
                        <h2 className="text-3xl font-extrabold font-headline">Rs. {pageRevenue.toLocaleString()}</h2>
                        <p className="text-on-primary/50 text-xs mt-1">{totalOrders} total orders in system</p>
                    </div>
                </div>

                {/* Active Orders Card */}
                <div className="col-span-12 md:col-span-3 bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Active Orders</p>
                        <div className="p-2 bg-secondary-container rounded-lg">
                            <span className="material-symbols-outlined text-[18px] text-on-secondary-container">construction</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-extrabold text-on-surface font-headline mb-3">{activeOrders}</h3>
                        <div className="w-full bg-surface-container-low rounded-full h-2 mb-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${activePercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-stone-400">{activePercent}% of loaded orders</p>
                    </div>
                </div>

                {/* Pending / Summary Card */}
                <div className="col-span-12 md:col-span-5 bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label mb-4">Status Breakdown</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Pending',     count: pendingOrders, icon: 'schedule',       color: 'text-on-tertiary-fixed-variant bg-tertiary-fixed' },
                            { label: 'In Progress', count: activeOrders,  icon: 'construction',   color: 'text-on-secondary-container bg-secondary-container' },
                            { label: 'Completed',   count: orders.filter(o => o.status?.toLowerCase() === 'completed').length, icon: 'check_circle',   color: 'text-on-primary-fixed-variant bg-primary-fixed' },
                            { label: 'Shipped',     count: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,   icon: 'local_shipping', color: 'text-on-primary bg-primary' },
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <span className="material-symbols-outlined text-[16px]">{stat.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 font-label">{stat.label}</p>
                                    <p className="text-lg font-extrabold text-on-surface font-headline">{stat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search orders by ID or customer…"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                    />
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">calendar_today</span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                        className="pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                    />
                </div>
                <select
                    value={statusQuery}
                    onChange={(e) => { setStatusQuery(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body font-medium"
                >
                    <option value="All">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="shipped">Shipped</option>
                </select>
            </div>

            {/* Table Card */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full masters-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <span className="material-symbols-outlined text-[28px] text-stone-300">receipt_long</span>
                                            </div>
                                            <p className="text-sm font-bold text-stone-400 font-headline">No orders found</p>
                                            <p className="text-xs text-stone-300">Try adjusting your filters or search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr>
                                            <td
                                                className="font-bold text-primary cursor-pointer"
                                                onClick={() => navigate(`/order/details/${order._id}`)}
                                            >
                                                #{order._id.substring(0, 8).toUpperCase()}
                                            </td>
                                            <td className="text-on-surface-variant">
                                                {format(new Date(order.date), 'dd MMM yyyy')}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-xs font-bold text-on-secondary-fixed flex-shrink-0">
                                                        {order.customer?.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="font-medium text-on-surface">{order.customer?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadge(order.status)}`}>
                                                    <span className="material-symbols-outlined text-[14px] mr-1">{getStatusIcon(order.status)}</span>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="font-bold text-on-surface">
                                                Rs. {order.total?.toLocaleString()}
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                                    className="text-stone-400 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {expandedOrderId === order._id ? 'expand_less' : 'more_vert'}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedOrderId === order._id && (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-6 bg-surface-container-low/40">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 font-headline">Order Details</h4>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
                                                                    <span className="text-stone-500">Products:</span>
                                                                    <span className="font-bold">{order.products?.length || 0}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                                                                    <span className="text-stone-500">Date:</span>
                                                                    <span className="font-bold">{format(new Date(order.date), 'PPP')}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                                                                    <span className="text-stone-500">Payment:</span>
                                                                    <span className={`font-bold ${order.paid ? 'text-on-primary-fixed-variant' : 'text-error'}`}>
                                                                        {order.paid ? 'Paid' : 'Unpaid'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 font-headline">Customer Details</h4>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                                                                    <span className="text-stone-500">Name:</span>
                                                                    <span className="font-bold">{order.customer?.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                                                                    <span className="text-stone-500">Phone:</span>
                                                                    <span className="font-bold">{order.customer?.phone}</span>
                                                                </div>
                                                                {order.customer?.address && (
                                                                    <div className="flex items-center gap-3 text-sm">
                                                                        <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                                                                        <span className="text-stone-500">Address:</span>
                                                                        <span className="font-bold">{order.customer?.address}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/order/details/${order._id}`)}
                                                                className="mt-6 text-primary text-sm font-bold flex items-center gap-1 hover:underline font-label"
                                                            >
                                                                Full order details
                                                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                            </button>
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
                {!loading && pagination.total > 0 && (
                    <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant/10">
                        <span className="text-sm text-stone-400">
                            Showing {((currentPage - 1) * ordersPerPage) + 1}–{Math.min(currentPage * ordersPerPage, pagination.total)} of {pagination.total} orders
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={!canGoPrev}
                                className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            {getPageNumbers().map((number, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof number === 'number' && setCurrentPage(number)}
                                    disabled={typeof number !== 'number'}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                                        currentPage === number
                                            ? 'bg-primary text-on-primary'
                                            : 'hover:bg-surface-container-low text-on-surface'
                                    }`}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={!canGoNext}
                                className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllOrders;

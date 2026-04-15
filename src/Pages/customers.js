import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';


const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchBy, setSearchBy] = useState('all');
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
            fetchCustomers(currentPage, searchQuery, searchBy);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery, searchBy]);

    const fetchCustomers = async (page = 1, query = '', field = 'all') => {
        try {
            setLoading(true);
            const params = { page, limit: customersPerPage };
            if (query) {
                if (field === 'all') {
                    params.query = query;
                } else {
                    params.searchBy = field;
                    params.search = query;
                    params[field] = query;
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
        <div className="p-8 font-body">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Customers</h1>
                    <p className="text-stone-400 mt-1 text-sm">Manage your atelier's client relationships.</p>
                </div>
                <button
                    onClick={() => navigate('/customers/add')}
                    className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-container transition-all font-label"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add Customer
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder={searchBy === 'all' ? 'Search customers…' : `Search by ${searchBy}…`}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                    />
                </div>
                <select
                    value={searchBy}
                    onChange={(e) => { setSearchBy(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                >
                    <option value="all">All fields</option>
                    <option value="orderNumber">Order Number</option>
                    <option value="name">Name</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="email">Email</option>
                </select>
            </div>

            {/* Table Card */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full masters-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Orders</th>
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
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <span className="material-symbols-outlined text-[28px] text-stone-300">person_search</span>
                                            </div>
                                            <p className="text-sm font-bold text-stone-400 font-headline">No customers found</p>
                                            <p className="text-xs text-stone-300">Try adjusting your search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => {
                                    const initials = customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                                    return (
                                        <tr key={customer._id}>
                                            <td className="font-mono text-sm text-on-surface-variant">{customer.orderNumber || '—'}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                                        {initials}
                                                    </div>
                                                    <span className="font-medium text-on-surface">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-on-surface-variant">{customer.phone}</td>
                                            <td className="text-on-surface-variant max-w-[200px] truncate">{customer.address}</td>
                                            <td>
                                                <span className="status-badge bg-secondary-container text-on-secondary-container">
                                                    {customer.orders?.length || 0} orders
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => navigate(`/customers/view/${customer._id}`)}
                                                        className="p-2 text-stone-400 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/customers/edit/${customer._id}`)}
                                                        className="p-2 text-stone-400 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer._id)}
                                                        className="p-2 text-stone-400 hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant/10">
                        <span className="text-sm text-stone-400">
                            Page {currentPage} of {effectiveTotalPages} · {pagination.total} total
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={!canGoPrev}
                                className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            {getPageNumbers().map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setCurrentPage(n)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                                        currentPage === n
                                            ? 'bg-primary text-on-primary'
                                            : 'hover:bg-surface-container-low text-on-surface'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
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

const AddCustomer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderNumberError, setOrderNumberError] = useState('');
    const [customer, setCustomer] = useState({
        orderNumber: '',
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/next-order-number`);
                if (res.data?.nextOrderNumber) {
                    setCustomer((c) => ({ ...c, orderNumber: res.data.nextOrderNumber }));
                }
            } catch (err) {
                console.error('Error fetching next order number:', err);
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrderNumberError('');

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/customer/add`, { customer });
            toast.success('Customer added successfully');
            navigate('/customers');
        } catch (error) {
            if (error.response?.status === 409) {
                const msg = error.response.data?.message || 'Order number already exists';
                setOrderNumberError(msg);
                toast.error(msg);
            } else {
                toast.error('Failed to add customer');
            }
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
        <div className="p-8 font-body">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/customers')}
                        className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
                    >
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary font-headline">Add New Customer</h1>
                        <p className="text-stone-400 mt-1 text-sm">Register a new client in your CRM.</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.06)' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Order Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">tag</span>
                                <input
                                    type="text"
                                    required
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
                            { label: 'Full Name', key: 'name', type: 'text', icon: 'person' },
                            { label: 'Phone', key: 'phone', type: 'text', icon: 'call', placeholder: '03XX-XXXXXXX', onChange: formatPhoneNumber, maxLength: 12 },
                        ].map(({ label, key, type, icon, placeholder, onChange, maxLength }) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">{label}</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">{icon}</span>
                                    <input
                                        type={type}
                                        required
                                        placeholder={placeholder}
                                        value={customer[key]}
                                        onChange={onChange || ((e) => setCustomer({ ...customer, [key]: e.target.value }))}
                                        maxLength={maxLength}
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                    />
                                </div>
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Address</label>
                            <textarea
                                required
                                value={customer.address}
                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/customers')}
                                className="flex-1 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-all disabled:opacity-60 font-label flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                )}
                                {loading ? 'Adding…' : 'Add Customer'}
                            </button>
                        </div>
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
    const [orderNumberError, setOrderNumberError] = useState('');
    const [customer, setCustomer] = useState({
        orderNumber: '',
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/get/${id}`);
            setCustomer({
                orderNumber: response.data?.orderNumber || '',
                name: response.data?.name || '',
                phone: response.data?.phone || '',
                address: response.data?.address || '',
            });
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrderNumberError('');

        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/customer/update/${id}`, { customer });
            toast.success('Customer updated successfully');
            navigate('/customers');
        } catch (error) {
            if (error.response?.status === 409) {
                const msg = error.response.data?.message || 'Order number already exists';
                setOrderNumberError(msg);
                toast.error(msg);
            } else {
                toast.error('Failed to update customer');
            }
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
        return (
            <div className="flex-1 flex items-center justify-center bg-surface">
                <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    const initials = customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <div className="p-8 font-body">
            <div>
                <button
                    onClick={() => navigate('/customers')}
                    className="flex items-center gap-2 text-stone-400 hover:text-primary text-sm font-medium mb-6 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Customers
                </button>

                <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.06)' }}>
                    {/* Hero */}
                    <div className="bg-primary p-8 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                        <div className="relative flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-on-primary flex-shrink-0 font-headline">
                                {initials}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-3xl font-extrabold text-on-primary font-headline">Edit Customer</h1>
                                    {customer.orderNumber && (
                                        <span className="px-2.5 py-0.5 bg-white/15 text-on-primary text-xs font-bold rounded-full font-mono">#{customer.orderNumber}</span>
                                    )}
                                </div>
                                <p className="text-on-primary/60 text-sm mt-1">Update client information.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline">Personal Information</h2>
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Order Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">tag</span>
                                <input
                                    type="text"
                                    placeholder="e.g. 1248"
                                    value={customer.orderNumber || ''}
                                    onChange={(e) => { setCustomer({ ...customer, orderNumber: e.target.value }); setOrderNumberError(''); }}
                                    className={`w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 font-body ${orderNumberError ? 'ring-2 ring-error' : 'focus:ring-primary/20'}`}
                                />
                            </div>
                            {orderNumberError && (
                                <p className="mt-1 text-xs text-error font-body">{orderNumberError}</p>
                            )}
                        </div>
                        {[
                            { label: 'Full Name', key: 'name', type: 'text', icon: 'person' },
                            { label: 'Phone', key: 'phone', type: 'text', icon: 'call', placeholder: '03XX-XXXXXXX', onChange: formatPhoneNumber, maxLength: 12 },
                        ].map(({ label, key, type, icon, placeholder, onChange, maxLength }) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">{label}</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">{icon}</span>
                                    <input
                                        type={type}
                                        required
                                        placeholder={placeholder}
                                        value={customer[key]}
                                        onChange={onChange || ((e) => setCustomer({ ...customer, [key]: e.target.value }))}
                                        maxLength={maxLength}
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                    />
                                </div>
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Address</label>
                            <textarea
                                required
                                value={customer.address}
                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/customers')}
                                className="flex-1 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-all disabled:opacity-60 font-label flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                )}
                                {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
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
        return (
            <div className="flex-1 flex items-center justify-center bg-surface">
                <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex-1 flex items-center justify-center bg-surface">
                <p className="text-stone-400">Customer not found</p>
            </div>
        );
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
        <div className="p-8 font-body">
            <div>
                {/* Back + title */}
                <button
                    onClick={() => navigate('/customers')}
                    className="flex items-center gap-2 text-stone-400 hover:text-primary text-sm font-medium mb-6 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Customers
                </button>
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.06)' }}>

                    {/* Customer Info */}
                    {/* Customer Profile Hero */}
                    <div className="bg-primary p-8 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                        <div className="relative flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-on-primary flex-shrink-0 font-headline">
                                {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-3xl font-extrabold text-on-primary font-headline">{customer.name}</h1>
                                    {customer.orderNumber && (
                                        <span className="px-2.5 py-0.5 bg-white/15 text-on-primary text-xs font-bold rounded-full font-mono">#{customer.orderNumber}</span>
                                    )}
                                </div>
                                <p className="text-on-primary/60 text-sm mt-1">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={() => navigate(`/customers/edit/${id}`)}
                                        className="text-xs font-bold text-on-primary border border-white/30 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors font-label"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline mb-4">Personal Information</h2>
                                {[
                                    { icon: 'tag', label: 'Order Number', value: customer.orderNumber || '—' },
                                    { icon: 'call', label: 'Phone', value: customer.phone },
                                    { icon: 'location_on', label: 'Address', value: customer.address },
                                    { icon: 'shopping_bag', label: 'Total Orders', value: customer.orders?.length || 0 },
                                    { icon: 'calendar_today', label: 'Member Since', value: new Date(customer.createdAt).toLocaleDateString() },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-400 font-label">{label}</p>
                                            <p className="font-bold text-on-surface text-sm">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Measurements */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">straighten</span>
                                        Measurements
                                    </h2>
                                    {editingMeasurements ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingMeasurements(false)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-stone-400 hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors text-xs font-bold font-label"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveMeasurements}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-full transition-colors text-xs font-bold font-label"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">save</span>
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingMeasurements(true)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-bold hover:bg-primary/10 transition-colors font-label"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {(editingMeasurements || hasMeasurements) ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Chest',         key: 'chest',         icon: 'fitness_center' },
                                            { label: 'Shoulders',     key: 'shoulders',     icon: 'accessibility_new' },
                                            { label: 'Neck',          key: 'neck',          icon: 'face' },
                                            { label: 'Sleeves',       key: 'sleeves',       icon: 'open_in_full' },
                                            { label: 'Top Length',    key: 'topLenght',     icon: 'height' },
                                            { label: 'Bottom Length', key: 'bottomLenght',  icon: 'straighten' },
                                            { label: 'Waist',         key: 'waist',         icon: 'unfold_less' },
                                        ].map(({ label, key, icon }) => (
                                            <div key={key} className="bg-gradient-to-br from-surface-container-low to-surface-container-lowest rounded-xl p-3 border border-outline-variant/10 hover:border-primary/20 transition-colors">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <span className="material-symbols-outlined text-[14px] text-primary/60">{icon}</span>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-label">{label}</p>
                                                </div>
                                                {editingMeasurements ? (
                                                    <div className="flex items-baseline gap-1">
                                                        <input
                                                            type="number"
                                                            value={measurements[key] || ''}
                                                            onChange={(e) => handleMeasurementChange(key, e.target.value)}
                                                            className="w-full bg-transparent border-none text-lg font-bold text-on-surface focus:outline-none focus:ring-0 p-0"
                                                            placeholder="0"
                                                        />
                                                        <span className="text-xs font-normal text-stone-400">in</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-lg font-bold text-on-surface">
                                                        {customer.measurements?.[key] || 0}
                                                        <span className="text-xs font-normal text-stone-400 ml-1">in</span>
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-6 text-center">
                                        <span className="material-symbols-outlined text-[32px] text-stone-300 block mb-2">straighten</span>
                                        <p className="text-sm text-stone-400 font-label">No measurements recorded</p>
                                        <button
                                            onClick={() => setEditingMeasurements(true)}
                                            className="mt-3 px-4 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-bold hover:bg-primary/10 inline-flex items-center gap-1 font-label"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">add</span>
                                            Add Measurements
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Measurement Files */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">description</span>
                                    Measurement Documents
                                </h2>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-bold hover:bg-primary/10 font-label"
                                        disabled={uploading}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">upload</span>
                                        Upload
                                    </button>
                                    <button
                                        onClick={() => cameraInputRef.current.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold hover:opacity-80 font-label"
                                        disabled={uploading}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                        Camera
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
                                <div className="mb-4 p-3 bg-primary/5 rounded-xl text-center">
                                    <p className="text-primary text-sm font-bold font-label">Uploading files…</p>
                                </div>
                            )}

                            {hasMeasurementFiles ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {customer.measurementFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="bg-surface-container-low rounded-xl p-3 relative hover:bg-surface-container transition-colors"
                                        >
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="absolute top-2 right-2 p-1 bg-error/10 text-error rounded-full hover:bg-error/20"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>

                                            <div className="flex items-start gap-3" onClick={() => viewFile(file)}>
                                                {file.mimeType.includes('pdf') ? (
                                                    <span className="material-symbols-outlined text-[40px] text-error">picture_as_pdf</span>
                                                ) : (
                                                    <div className="relative w-14 h-14 bg-surface-container-low rounded-xl overflow-hidden">
                                                        <img
                                                            src={file.url}
                                                            alt="Measurement document"
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                                    <p className="text-xs text-stone-400 mt-1">
                                                        {new Date(file.uploadDate).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            className="text-xs flex items-center gap-1 text-primary hover:underline font-bold font-label"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                viewFile(file);
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                                                            View
                                                        </button>
                                                        <a
                                                            href={file.url}
                                                            download
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs flex items-center gap-1 text-primary hover:underline font-bold font-label"
                                                        >
                                                            <span className="material-symbols-outlined text-[12px]">download</span>
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center">
                                    <span className="material-symbols-outlined text-[40px] text-stone-300 block mb-2">description</span>
                                    <p className="text-stone-400 text-sm">No measurement documents uploaded</p>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="mt-3 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-bold hover:bg-primary/10 inline-flex items-center gap-2 font-label"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">upload</span>
                                        Upload Files
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="mt-8">
                            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-headline mb-4">Recent Orders</h2>
                            <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
                                <table className="w-full masters-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Products</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-stone-400">No orders found</td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order._id} onClick={() => navigate(`/order/details/${order._id}`)}>
                                                    <td className="font-bold text-primary">#{order._id.substring(0, 8).toUpperCase()}</td>
                                                    <td className="text-on-surface-variant">{new Date(order.date).toLocaleDateString()}</td>
                                                    <td className="text-on-surface-variant">{order.products?.length || 0}</td>
                                                    <td className="font-bold">Rs. {order.total?.toLocaleString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${
                                                            order.status === 'completed' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                                                            order.status === 'in progress' ? 'bg-secondary-container text-on-secondary-container' :
                                                            'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                                                        }`}>{order.status}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${order.paid ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                                                            {order.paid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {ordersPagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-stone-400">Page {ordersPagination.page} of {ordersPagination.totalPages}</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setOrdersPage(p => Math.max(p - 1, 1))}
                                            disabled={!ordersPagination.hasPrevPage}
                                            className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={() => setOrdersPage(p => p + 1)}
                                            disabled={!ordersPagination.hasNextPage}
                                            className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
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

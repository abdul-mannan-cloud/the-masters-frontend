import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statuses = ['pending', 'in progress', 'completed', 'shipped'];

const statusConfig = {
    pending:      { icon: 'schedule',       badge: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
    'in progress':{ icon: 'construction',   badge: 'bg-secondary-container text-on-secondary-container' },
    completed:    { icon: 'check_circle',   badge: 'bg-primary-fixed text-on-primary-fixed-variant' },
    shipped:      { icon: 'local_shipping', badge: 'bg-primary text-on-primary' },
};

const Orders = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductForAssignment, setSelectedProductForAssignment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [defaultRate, setDefaultRate] = useState('');
    const [employeeRates, setEmployeeRates] = useState({});
    const [rateErrors, setRateErrors] = useState({});
    const [assigning, setAssigning] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [notifyConfirmOpen, setNotifyConfirmOpen] = useState(false);
    const [notifiedMessageId, setNotifiedMessageId] = useState(null);

    const closeAssignModal = () => {
        setSelectedProductForAssignment(null);
        setSelectedEmployees([]);
        setDefaultRate('');
        setEmployeeRates({});
        setRateErrors({});
    };

    const resolveRate = (employeeId) => {
        const override = employeeRates[employeeId];
        if (override !== undefined && override !== '') return override;
        return defaultRate;
    };

    const isValidRate = (value) => {
        if (value === undefined || value === null || value === '') return false;
        const num = Number(value);
        return Number.isFinite(num) && num >= 0;
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (id) fetchOrderDetails();
    }, [id]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employee/getallemployee`, {
                params: { page: 1, limit: 200, query: '' }
            });
            setEmployees(response.data?.data || response.data?.employees || []);
        } catch (error) {
            toast.error('Failed to fetch employees');
        }
    };

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const orderResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/${id}`);
            if (!orderResponse.data) { toast.error('Order not found'); navigate('/orders'); return; }
            setOrder(orderResponse.data);

            const customerResponse = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/customer/get/${orderResponse.data.customer._id}`
            );
            setCustomer(customerResponse.data);

            const productsData = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`);
            const productIds = orderResponse.data.products.map((p) => p._id);
            setProducts(productsData.data.filter((p) => productIds.includes(p._id)));
        } catch (error) {
            toast.error('Failed to fetch order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/order/update/status/${id}`, {
                status: newStatus.toLowerCase()
            });
            setOrder({ ...order, status: newStatus });
            toast.success('Order status updated');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const handleNotifyWhatsapp = async () => {
        try {
            setNotifying(true);
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/order/${id}/notify-whatsapp-update`
            );
            const { to, whatsappResponse } = response.data || {};
            setNotifiedMessageId(whatsappResponse?.messages?.[0]?.id || 'sent');
            toast.success(`WhatsApp message sent to ${to}`);
            setNotifyConfirmOpen(false);
        } catch (error) {
            const data = error.response?.data || {};
            const metaMsg = data.error?.error?.message;
            const msg = metaMsg || data.message || 'Failed to send WhatsApp notification';
            toast.error(msg);
        } finally {
            setNotifying(false);
        }
    };

    const handlePaymentUpdate = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/order/update/payment/${id}`, {
                paid: !order.paid
            });
            setOrder({ ...order, paid: !order.paid });
            toast.success('Payment status updated');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    const handleAssignEmployees = async (product) => {
        const errors = {};
        selectedEmployees.forEach((eid) => {
            if (!isValidRate(resolveRate(eid))) errors[eid] = 'Enter a rate (≥ 0)';
        });
        if (Object.keys(errors).length) {
            setRateErrors(errors);
            toast.error('Set a rate for every selected employee');
            return;
        }

        const payload = {
            productId: product._id,
            employeeIds: selectedEmployees,
        };
        if (isValidRate(defaultRate)) payload.rate = Number(defaultRate);
        const overrides = {};
        selectedEmployees.forEach((eid) => {
            const v = employeeRates[eid];
            if (isValidRate(v) && v !== defaultRate) overrides[eid] = Number(v);
        });
        if (Object.keys(overrides).length) payload.rates = overrides;

        try {
            setAssigning(true);
            setRateErrors({});
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/product/assignemployees`, payload);
            toast.success('Employees assigned — status set to In Progress');
            closeAssignModal();
            fetchOrderDetails();
        } catch (error) {
            const status = error.response?.status;
            const msg = error.response?.data?.error || error.response?.data?.message;
            if (status === 400 && typeof msg === 'string') {
                const match = msg.match(/employee\s+([a-f0-9]{24})/i);
                if (match) {
                    setRateErrors((prev) => ({ ...prev, [match[1]]: msg }));
                }
                toast.error(msg);
            } else if (status === 404) {
                toast.error(msg || 'Product or employee not found');
            } else {
                toast.error('Failed to assign employees');
            }
        } finally {
            setAssigning(false);
        }
    };

    const getAssignedEmployees = (product) => {
        const employeeIds = product.assignedEmployees || [];
        return employees.filter((emp) => employeeIds.includes(emp._id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-stone-400 font-body">Loading order details…</p>
                </div>
            </div>
        );
    }

    if (!order || !customer) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-stone-400 font-body">Order not found.</p>
            </div>
        );
    }

    const currentStatusIndex = statuses.indexOf(order.status);
    const cfg = statusConfig[order.status] || statusConfig.pending;

    return (
        <div className="p-8 font-body">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/orders')}
                    className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
                >
                    <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">
                        Order #{order._id?.substring(0, 8).toUpperCase()}
                    </h1>
                    <p className="text-stone-400 mt-1 text-sm">
                        Placed on {format(new Date(order.date), 'PPP')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`status-badge ${cfg.badge}`}>
                        <span className="material-symbols-outlined text-[14px] mr-1">{cfg.icon}</span>
                        {order.status}
                    </span>
                    <span className={`status-badge ${order.paid ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                        <span className="material-symbols-outlined text-[14px] mr-1">payments</span>
                        {order.paid ? 'Paid' : 'Unpaid'}
                    </span>
                </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 font-headline">Order Progress</h3>
                <div className="relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant/20">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                        />
                    </div>
                    <div className="relative flex justify-between">
                        {statuses.map((status, index) => {
                            const active = currentStatusIndex >= index;
                            const scfg = statusConfig[status];
                            return (
                                <div key={status} className="flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                        active ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-stone-400'
                                    }`}>
                                        <span className="material-symbols-outlined text-[18px]">{scfg.icon}</span>
                                    </div>
                                    <span className={`text-xs font-bold capitalize font-label ${active ? 'text-primary' : 'text-stone-400'}`}>
                                        {status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Navigation */}
                <div className="flex justify-between mt-8 pt-5 border-t border-outline-variant/10">
                    <div className="flex gap-3">
                        {currentStatusIndex > 0 && (
                            <button
                                onClick={() => handleStatusUpdate(statuses[currentStatusIndex - 1])}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant/20 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors font-label"
                            >
                                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                Previous
                            </button>
                        )}
                        {currentStatusIndex < statuses.length - 1 && (
                            <button
                                onClick={() => handleStatusUpdate(statuses[currentStatusIndex + 1])}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors font-label"
                            >
                                Next
                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {order.status === 'completed' && customer.phone && (
                            notifiedMessageId ? (
                                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-fixed text-on-primary-fixed-variant text-sm font-bold font-label">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Customer Notified
                                </span>
                            ) : (
                                <button
                                    onClick={() => setNotifyConfirmOpen(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-bold hover:bg-secondary-container/80 transition-colors font-label"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chat</span>
                                    Notify on WhatsApp
                                </button>
                            )
                        )}
                        <button
                            onClick={handlePaymentUpdate}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors font-label ${
                                order.paid
                                    ? 'bg-error-container text-on-error-container hover:bg-error/10'
                                    : 'bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed/80'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            {order.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">Customer</h3>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-base font-extrabold text-on-secondary-fixed flex-shrink-0 font-headline">
                            {customer?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-bold text-on-surface">{customer.name}</p>
                            <p className="text-sm text-stone-400">{customer.phone}</p>
                        </div>
                    </div>

                    {customer.address && (
                        <div className="flex items-start gap-3 text-sm mb-3">
                            <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">location_on</span>
                            <p className="text-on-surface-variant">{customer.address}</p>
                        </div>
                    )}

                    {customer.measurements && Object.keys(customer.measurements).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/10">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 font-label">Measurements</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(customer.measurements).map(([key, value]) => (
                                    <div key={key} className="bg-surface-container-low rounded-lg px-3 py-2">
                                        <p className="text-xs text-stone-400 capitalize font-label">{key}</p>
                                        <p className="text-sm font-bold text-on-surface">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => navigate(`/customers/view/${customer._id}`)}
                        className="mt-5 w-full py-2.5 text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors font-label flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        View Customer Profile
                    </button>
                </div>

                {/* Products Table */}
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <div className="px-6 pt-6 pb-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-headline">
                            Order Items · {products.length}
                        </h3>
                        <p className="text-xs font-bold text-on-surface font-label">Total: Rs. {order.total?.toLocaleString()}</p>
                    </div>
                    <table className="w-full masters-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                                <th className="text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => {
                                const assigned = getAssignedEmployees(product);
                                return (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-[18px] text-primary">content_cut</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-on-surface text-sm">{product.name || product.type}</p>
                                                    <p className="text-xs text-stone-400">#{product._id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {assigned.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {assigned.map((emp) => (
                                                        <span key={emp._id} className="text-xs px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full font-bold">
                                                            {emp.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-stone-400">Unassigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    title="View Details"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedProductForAssignment(product)}
                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    title="Assign Employees"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="text-right font-bold text-on-surface">
                                            Rs. {product.price?.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Employees Modal */}
            {selectedProductForAssignment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAssignModal} />
                    <div className="relative bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md mx-4 animate-modal-in" style={{ boxShadow: '0 24px 60px rgba(25,28,27,0.15)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface font-headline">Assign Employees</h2>
                            <button onClick={closeAssignModal} className="text-stone-400 hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-stone-500 mb-3">
                            Assigning to <span className="font-bold text-on-surface">{selectedProductForAssignment.name || selectedProductForAssignment.type}</span>
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">Default Rate (Rs)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rs.</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 500"
                                    value={defaultRate}
                                    onChange={(e) => { setDefaultRate(e.target.value); setRateErrors({}); }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl border-none text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <p className="mt-1 text-xs text-stone-400 font-body">Applies to all selected employees unless overridden below.</p>
                        </div>

                        <div className="px-3 py-2 mb-4 rounded-xl bg-tertiary-fixed/40 border border-outline-variant/20">
                            <p className="text-xs text-on-surface-variant font-body">
                                <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                                Rate applies only to newly assigned employees. Already-assigned employees are skipped and not charged again.
                            </p>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto mb-5">
                            {employees.map((employee) => {
                                const checked = selectedEmployees.includes(employee._id);
                                const err = rateErrors[employee._id];
                                return (
                                    <div key={employee._id} className="rounded-xl">
                                        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedEmployees([...selectedEmployees, employee._id]);
                                                    } else {
                                                        setSelectedEmployees(selectedEmployees.filter((eid) => eid !== employee._id));
                                                        setEmployeeRates((prev) => {
                                                            const next = { ...prev };
                                                            delete next[employee._id];
                                                            return next;
                                                        });
                                                        setRateErrors((prev) => {
                                                            const next = { ...prev };
                                                            delete next[employee._id];
                                                            return next;
                                                        });
                                                    }
                                                }}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-xs font-bold text-on-secondary-fixed flex-shrink-0">
                                                {employee.name[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-on-surface truncate">{employee.name}</p>
                                                <p className="text-xs text-stone-400">{employee.role}</p>
                                            </div>
                                            {checked && (
                                                <div className="relative w-28" onClick={(e) => e.preventDefault()}>
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">Rs.</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder={defaultRate || 'Rate'}
                                                        value={employeeRates[employee._id] ?? ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setEmployeeRates((prev) => ({ ...prev, [employee._id]: v }));
                                                            setRateErrors((prev) => {
                                                                const next = { ...prev };
                                                                delete next[employee._id];
                                                                return next;
                                                            });
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`w-full pl-7 pr-2 py-1.5 bg-surface-container-low rounded-lg border-none text-xs font-bold text-right font-body focus:outline-none focus:ring-2 ${err ? 'ring-2 ring-error' : 'focus:ring-primary/20'}`}
                                                    />
                                                </div>
                                            )}
                                        </label>
                                        {checked && err && (
                                            <p className="px-3 pb-2 text-xs text-error font-body">{err}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handleAssignEmployees(selectedProductForAssignment)}
                            disabled={!selectedEmployees.length || assigning}
                            className="w-full py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors font-label flex items-center justify-center gap-2"
                        >
                            {assigning && <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />}
                            {assigning ? 'Assigning…' : `Assign ${selectedEmployees.length ? `(${selectedEmployees.length}) ` : ''}Employees`}
                        </button>
                    </div>
                </div>
            )}

            {/* WhatsApp Notify Confirmation Modal */}
            {notifyConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !notifying && setNotifyConfirmOpen(false)} />
                    <div className="relative bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md mx-4 animate-modal-in" style={{ boxShadow: '0 24px 60px rgba(25,28,27,0.15)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface font-headline">Send WhatsApp Update</h2>
                            <button
                                onClick={() => setNotifyConfirmOpen(false)}
                                disabled={notifying}
                                className="text-stone-400 hover:text-on-surface transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-6 font-body">
                            Send WhatsApp order update to{' '}
                            <span className="font-bold text-on-surface">{customer.name}</span>{' '}
                            (<span className="font-bold text-on-surface">{customer.phone}</span>)?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNotifyConfirmOpen(false)}
                                disabled={notifying}
                                className="flex-1 py-3 rounded-full border border-outline-variant/20 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 font-label"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNotifyWhatsapp}
                                disabled={notifying}
                                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors font-label flex items-center justify-center gap-2"
                            >
                                {notifying && <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />}
                                {notifying ? 'Sending…' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
                    <div className="relative bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md mx-4 animate-modal-in" style={{ boxShadow: '0 24px 60px rgba(25,28,27,0.15)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface font-headline">Product Details</h2>
                            <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Type', value: selectedProduct.type },
                                { label: 'Price', value: `Rs. ${selectedProduct.price?.toLocaleString()}` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                                    <span className="text-sm text-stone-400 font-label">{label}</span>
                                    <span className="text-sm font-bold text-on-surface">{value}</span>
                                </div>
                            ))}
                            <div>
                                <p className="text-sm text-stone-400 font-label mb-3">Assigned Employees</p>
                                {getAssignedEmployees(selectedProduct).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {getAssignedEmployees(selectedProduct).map((emp) => (
                                            <span key={emp._id} className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold">
                                                {emp.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-stone-400">No employees assigned</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;

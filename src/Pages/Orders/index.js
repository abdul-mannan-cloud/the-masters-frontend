import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
    ArrowLeft, Package, Calendar, User, MapPin, Phone, CreditCard,
    Truck, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
    Scissors, Eye
} from 'lucide-react';


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

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employee/getallemployee`);
            setEmployees(response.data);
        } catch (error) {
            toast.error('Failed to fetch employees');
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAssignEmployees = async (product) => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/product/assignemployees`, {
                employeeIds: selectedEmployees,
                productId: product._id
            });
            toast.success('Employees assigned successfully');
            setSelectedProductForAssignment(null);
            setSelectedEmployees([]);
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to assign employees');
            console.error('Error:', error);
        }
    };


    const statuses = ['pending', 'in progress', 'completed', 'shipped'];

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        'in progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        shipped: 'bg-purple-100 text-purple-800'
    };

    const statusIcons = {
        pending: <AlertCircle className="w-5 h-5" />,
        'in progress': <Clock className="w-5 h-5" />,
        completed: <CheckCircle className="w-5 h-5" />,
        shipped: <Truck className="w-5 h-5" />
    };

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // Get order details
            const orderResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/${id}`);

            if (!orderResponse.data) {
                toast.error('Order not found');
                navigate('/orders');
                return;
            }

            setOrder(orderResponse.data);

            // Fetch customer details
            const customerResponse = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/customer/${orderResponse.data.customer._id}`
            );
            setCustomer(customerResponse.data);

            // Fetch products details - using getallproducts since that's the endpoint available
            const productsData = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`);
            const productIds = orderResponse.data.products.map((product) => product._id);
            const filteredProducts = productsData.data.filter(product =>
                productIds.includes(product._id)
            );
            console.log('all products:', productsData.data);
            console.log('order response products:', orderResponse.data.products);
            console.log('filtered products:', filteredProducts);
            setProducts(filteredProducts);
        } catch (error) {
            toast.error('Failed to fetch order details');
            console.error('Error:', error);
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            // Updated API endpoint to match backend route
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/order/update/status/${id}`, {
                status: newStatus.toLowerCase()
            });
            setOrder({ ...order, status: newStatus });
            toast.success('Order status updated successfully');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to update order status');
            console.error('Error:', error);
        }
    };

    const handlePaymentUpdate = async () => {
        try {
            // Updated API endpoint to match backend route
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/order/update/payment/${id}`, {
                paid: !order.paid
            });
            setOrder({ ...order, paid: !order.paid });
            toast.success('Payment status updated successfully');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to update payment status');
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    if (!order || !customer) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                Order not found
            </div>
        );
    }

    const getAssignedEmployees = (product) => {
        return product.assignedEmployees || [];
    };


    const getStatusBadgeStyles = (status) => {
        const baseStyle = "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full";
        switch (status.toLowerCase()) {
            case 'pending':
                return `${baseStyle} bg-yellow-100 text-yellow-800`;
            case 'in progress':
                return `${baseStyle} bg-blue-100 text-blue-800`;
            case 'completed':
                return `${baseStyle} bg-green-100 text-green-800`;
            case 'shipped':
                return `${baseStyle} bg-purple-100 text-purple-800`;
            default:
                return `${baseStyle} bg-gray-100 text-gray-800`;
        }
    };


    // Rest of the JSX remains the same...
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Order #{order?._id?.substring(0, 8)}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Created on {format(new Date(order?.date), 'PPP')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={getStatusBadgeStyles(order.status)}>
                                    {statusIcons[order.status]}
                                    <span>{order.status}</span>
                                </span>
                                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                                    ${order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    <CreditCard className="w-4 h-4" />
                                    {order.paid ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="max-w-4xl mx-auto">
                            <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                                    <div
                                        className="h-full bg-yellow-400 transition-all duration-500"
                                        style={{ width: `${(statuses.indexOf(order.status) / (statuses.length - 1)) * 100}%` }}
                                    />
                                </div>

                                {/* Status Points */}
                                <div className="relative flex justify-between">
                                    {statuses.map((status, index) => (
                                        <div key={status} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                                                ${statuses.indexOf(order.status) >= index
                                                ? 'bg-yellow-400 border-yellow-400 text-white'
                                                : 'bg-white border-gray-300 text-gray-400'}`}>
                                                {statusIcons[status]}
                                            </div>
                                            <span className="mt-3 text-sm font-medium capitalize">
                                                {status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-3 gap-6 p-6">
                        {/* Customer Details */}
                        <div className="col-span-1 bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Customer Details
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <span className="text-yellow-800 font-medium">
                                            {customer?.name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                    <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="col-span-2 bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Items
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {products.length} {products.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                    <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded bg-yellow-100 flex items-center justify-center">
                                                        <Scissors className="w-5 h-5 text-yellow-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{product.name || product.type}</p>
                                                        <p className="text-xs text-gray-500">ID: #{product._id.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>
                                                    <p>{product.type}</p>
                                                    <div className="mt-1">
                                                        {getAssignedEmployees(product).map(emp => (
                                                            <span key={emp._id}
                                                                  className="inline-block bg-gray-100 rounded-full px-2 py-1
                                                                        text-xs text-gray-600 mr-1 mb-1">
                                                                    {emp.name}
                                                                </span>
                                                        ))}
                                                        {!getAssignedEmployees(product).length && (
                                                            <span className="text-xs text-gray-400">
                                                                    No employees assigned
                                                                </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedProductForAssignment(product)}
                                                        className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                                                    >
                                                        <User className="w-4 h-4" />
                                                        Assign Employees
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                                Rs. {product.price?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50">
                                        <td colSpan="3" className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                            Total Amount
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                            Rs. {order.total?.toLocaleString()}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {order.status !== 'pending' && (
                                    <button
                                        onClick={() => handleStatusUpdate(statuses[statuses.indexOf(order.status) - 1])}
                                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                                            hover:bg-gray-200 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-1" />
                                        Previous Status
                                    </button>
                                )}
                                {order.status !== 'shipped' && (
                                    <button
                                        onClick={() => handleStatusUpdate(statuses[statuses.indexOf(order.status) + 1])}
                                        className="inline-flex items-center px-4 py-2 bg-yellow-400 text-white rounded-lg
                                            hover:bg-yellow-500 transition-colors"
                                    >
                                        Next Status
                                        <ChevronRight className="w-5 h-5 ml-1" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={handlePaymentUpdate}
                                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors
                                    ${order.paid
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                {order.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Assignment Modal */}
            {selectedProductForAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Assign Employees</h3>
                            <button
                                onClick={() => {
                                    setSelectedProductForAssignment(null);
                                    setSelectedEmployees([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Employees
                                </label>
                                <div className="space-y-2">
                                    {employees.map(employee => (
                                        <label key={employee._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.includes(employee._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedEmployees([...selectedEmployees, employee._id]);
                                                    } else {
                                                        setSelectedEmployees(selectedEmployees.filter(id => id !== employee._id));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                            />
                                            <span className="text-sm text-gray-700">{employee.name} ({employee.role})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={() => handleAssignEmployees(selectedProductForAssignment)}
                                    disabled={!selectedEmployees.length}
                                    className="w-full bg-yellow-400 text-white py-2 px-4 rounded-lg hover:bg-yellow-500
                                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Assign Selected Employees
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Product Details</h3>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <p className="font-medium">{selectedProduct.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="font-medium">Rs. {selectedProduct.price?.toLocaleString()}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Assigned Employees</p>
                                    <div className="mt-1">
                                        {getAssignedEmployees(selectedProduct).map(emp => (
                                            <span key={emp._id}
                                                  className="inline-block bg-gray-100 rounded-full px-3 py-1
                                                    text-sm text-gray-600 mr-2 mb-2">
                                                {emp.name}
                                            </span>
                                        ))}
                                        {!getAssignedEmployees(selectedProduct).length && (
                                            <p className="text-sm text-gray-400">No employees assigned</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
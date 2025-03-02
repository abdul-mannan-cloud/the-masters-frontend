import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, PieChart, LineChart as LineChartIcon, TrendingUp, Users, Scissors,
    ShoppingBag, CreditCard, Clock, Calendar, Package, ArrowUp, ArrowDown, ArrowRight
} from 'lucide-react';

// Import your chart components
import BarChart from '../../Components/Home/BarChart';
import DonutChart from '../../Components/Home/DonutChart';
import LineChart from '../../Components/Home/LineChart';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0
    });
    const [revenueData, setRevenueData] = useState({
        values: [],
        categories: []
    });
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [productData, setProductData] = useState({
        counts: [],
        categories: []
    });
    const [orderStatusData, setOrderStatusData] = useState([0, 0, 0, 0]); // pending, in-progress, completed, shipped
    const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'

    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login');
        } else {
            fetchDashboardData();
        }
    }, [timeFrame]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Load all required data in parallel
            let ordersResponse, productsResponse, customersResponse, statsResponse;

            try {
                [ordersResponse, productsResponse, customersResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/getallorders`),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/getallcustomers`)
                ]);

                // Try to get stats if available
                try {
                    statsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/stats`);
                } catch (statsError) {
                    console.warn("Stats endpoint not available, calculating manually", statsError);
                    // Will calculate stats manually below
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                return;
            }

            const orderData = ordersResponse.data || [];
            const productData = productsResponse.data || [];
            const customerData = customersResponse.data?.customer || [];

            setOrders(orderData);
            setProducts(productData);
            setCustomers(customerData);

            // Use stats from API if available, otherwise calculate
            if (statsResponse && statsResponse.data) {
                setOrderStats(statsResponse.data);
            } else {
                calculateOrderStats(orderData);
            }

            // Process data for visualizations
            processOrderData(orderData);
            processProductData(productData, orderData);
            calculateOrderStatusData(orderData);

            // Get recent orders
            const sortedOrders = [...orderData].sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );
            setRecentOrders(sortedOrders.slice(0, 5));

        } catch (error) {
            console.error("Error in dashboard data processing:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateOrderStats = (orderData) => {
        const totalOrders = orderData.length;
        const totalRevenue = orderData.reduce((sum, order) => sum + (order.total || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const pendingOrders = orderData.filter(order => order.status === 'pending').length;
        const completedOrders = orderData.filter(order => order.status === 'completed').length;

        setOrderStats({
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            averageOrderValue
        });
    };

    const processOrderData = (orderData) => {
        // Process revenue data by time frame
        const { values, categories } = getRevenueByTimeFrame(orderData, timeFrame);
        setRevenueData({ values, categories });

        // Calculate top products
        const productCounts = {};
        orderData.forEach(order => {
            if (!order.products) return;

            order.products.forEach(product => {
                const productType = product.type || 'Unknown';

                if (productCounts[productType]) {
                    productCounts[productType].count += 1;
                    productCounts[productType].revenue += (product.price || 0);
                } else {
                    productCounts[productType] = {
                        count: 1,
                        revenue: (product.price || 0),
                        type: productType
                    };
                }
            });
        });

        const productArray = Object.values(productCounts);
        const sortedProducts = productArray.sort((a, b) => b.count - a.count);
        setTopProducts(sortedProducts.slice(0, 5));
    };

    const calculateOrderStatusData = (orderData) => {
        const pending = orderData.filter(order => order.status === 'pending').length;
        const inProgress = orderData.filter(order => order.status === 'in progress').length;
        const completed = orderData.filter(order => order.status === 'completed').length;
        const shipped = orderData.filter(order => order.status === 'shipped').length;

        // Calculate percentages if there are orders
        const total = orderData.length;
        if (total > 0) {
            const pendingPercent = (pending / total) * 100;
            const inProgressPercent = (inProgress / total) * 100;
            const completedPercent = (completed / total) * 100;
            const shippedPercent = (shipped / total) * 100;

            setOrderStatusData([
                pendingPercent,
                inProgressPercent,
                completedPercent,
                shippedPercent
            ]);
        } else {
            setOrderStatusData([0, 0, 0, 0]);
        }
    };

    const processProductData = (productData, orderData) => {
        // Use the predefined types or extract from data
        const productTypes = ['Shalwar Suit', 'Pant', 'Shirt', 'Two Piece Suit', 'Three Piece Suit'];

        // Count products by type
        const typeCounts = {};
        productTypes.forEach(type => {
            typeCounts[type] = 0;
        });

        // Count from orders first (more accurate for business view)
        orderData.forEach(order => {
            if (!order.products) return;

            order.products.forEach(product => {
                const type = product.type || 'Unknown';
                if (typeCounts[type] !== undefined) {
                    typeCounts[type] += 1;
                } else {
                    typeCounts[type] = 1;
                }
            });
        });

        // If no order data, count from products collection as fallback
        if (Object.values(typeCounts).every(count => count === 0)) {
            productData.forEach(product => {
                const type = product.type || 'Unknown';
                if (typeCounts[type] !== undefined) {
                    typeCounts[type] += 1;
                } else {
                    typeCounts[type] = 1;
                }
            });
        }

        // Convert to arrays for the chart
        const categories = Object.keys(typeCounts);
        const counts = categories.map(type => typeCounts[type]);

        setProductData({
            categories,
            counts
        });
    };

    const getRevenueByTimeFrame = (orders, timeFrame) => {
        const now = new Date();
        const revenueDateMap = {};
        let startDate = new Date();
        let format = '';
        let dateFormat = {};

        // Determine date range and format based on timeframe
        switch(timeFrame) {
            case 'week':
                // Last 7 days
                startDate.setDate(now.getDate() - 7);
                format = 'day';
                dateFormat = { weekday: 'short' }; // Mon, Tue, etc.
                break;
            case 'month':
                // Last 30 days
                startDate.setDate(now.getDate() - 30);
                format = 'day';
                dateFormat = { month: 'short', day: 'numeric' }; // Jan 1, Feb 2, etc.
                break;
            case 'year':
                // Last 12 months
                startDate.setMonth(now.getMonth() - 12);
                format = 'month';
                dateFormat = { month: 'short' }; // Jan, Feb, etc.
                break;
            default:
                startDate.setDate(now.getDate() - 30);
                format = 'day';
                dateFormat = { month: 'short', day: 'numeric' };
        }

        // Initialize all periods with 0 revenue
        const dateKeys = [];
        const formattedLabels = [];

        if (format === 'day') {
            for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                dateKeys.push(dateKey);
                revenueDateMap[dateKey] = 0;
                formattedLabels.push(d.toLocaleDateString('en-US', dateFormat));
            }
        } else { // month
            for (let m = 0; m < 12; m++) {
                const monthDate = new Date(now);
                monthDate.setMonth(now.getMonth() - m);
                const dateKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
                dateKeys.push(dateKey);
                revenueDateMap[dateKey] = 0;
                formattedLabels.push(monthDate.toLocaleDateString('en-US', dateFormat));
            }
            // Reverse to show oldest to newest
            dateKeys.reverse();
            formattedLabels.reverse();
        }

        // Sum revenue for each period
        orders.forEach(order => {
            if (!order.date || !order.total) return;

            const orderDate = new Date(order.date);
            if (orderDate >= startDate) {
                let dateKey;

                if (format === 'day') {
                    dateKey = orderDate.toISOString().split('T')[0];
                } else {
                    dateKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                }

                if (revenueDateMap[dateKey] !== undefined) {
                    revenueDateMap[dateKey] += order.total;
                }
            }
        });

        // Extract values in the correct order
        const values = dateKeys.map(key => revenueDateMap[key]);

        return {
            values,
            categories: formattedLabels
        };
    };

    const getOrderTrend = () => {
        if (orders.length < 2) return 0;

        // Compare current month to previous month
        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const thisMonthOrders = orders.filter(order => {
            if (!order.date) return false;
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
        }).length;

        const lastMonthOrders = orders.filter(order => {
            if (!order.date) return false;
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastYear;
        }).length;

        if (lastMonthOrders === 0) return 100; // If no orders last month
        return Math.round((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100);
    };

    const getRevenueTrend = () => {
        if (revenueData.values.length < 2) return 0;

        // Compare last two periods
        const lastPeriodRevenue = revenueData.values[revenueData.values.length - 1];
        const previousPeriodRevenue = revenueData.values[revenueData.values.length - 2];

        if (previousPeriodRevenue === 0) return 100;
        return Math.round((lastPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100);
    };

    const orderTrend = getOrderTrend();
    const revenueTrend = getRevenueTrend();

    const formatCurrency = (amount) => {
        return `Rs. ${Math.round(amount).toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome to your tailoring business analytics</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center bg-white rounded-lg shadow-sm p-1">
                        <button
                            onClick={() => setTimeFrame('week')}
                            className={`px-3 py-1 text-sm rounded-md ${timeFrame === 'week'
                                ? 'bg-yellow-100 text-yellow-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setTimeFrame('month')}
                            className={`px-3 py-1 text-sm rounded-md ${timeFrame === 'month'
                                ? 'bg-yellow-100 text-yellow-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setTimeFrame('year')}
                            className={`px-3 py-1 text-sm rounded-md ${timeFrame === 'year'
                                ? 'bg-yellow-100 text-yellow-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Year
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Orders */}
                    <div className="bg-white rounded-xl flex flex-col justify-between shadow-sm overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                        <dd>
                                            <div className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">{orderStats.totalOrders || orders.length}</div>
                                                <div className={`ml-2 flex items-baseline text-sm font-semibold ${orderTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {orderTrend >= 0 ? (
                                                        <ArrowUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ArrowDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className="ml-1">{Math.abs(orderTrend)}%</span>
                                                </div>
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 px-5 py-1">
                            <div
                                className="text-xs text-blue-600 flex items-center justify-end cursor-pointer"
                                onClick={() => navigate('/orders')}
                            >
                                <span>View orders</span>
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                        <dd>
                                            <div className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">{formatCurrency(orderStats.totalRevenue || 0)}</div>
                                                <div className={`ml-2 flex items-baseline text-sm font-semibold ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {revenueTrend >= 0 ? (
                                                        <ArrowUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ArrowDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className="ml-1">{Math.abs(revenueTrend)}%</span>
                                                </div>
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 px-5 py-1 cursor-pointer"
                             onClick={() => navigate('/orders')}

                        >
                            <div className="text-xs text-green-600 flex items-center justify-end">
                                <span>View details</span>
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                        </div>
                    </div>

                    {/* Customers */}
                    <div className="bg-white rounded-xl flex flex-col justify-between shadow-sm overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                                        <dd>
                                            <div className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">{customers.length}</div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                                                    <span>Active</span>
                                                </div>
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 px-5 py-1">
                            <div
                                className="text-xs text-purple-600 flex items-center justify-end cursor-pointer"
                                onClick={() => navigate('/customers')}
                            >
                                <span>View customers</span>
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                        </div>
                    </div>

                    {/* Average Order Value */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-50 p-3 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Avg. Order Value</dt>
                                        <dd>
                                            <div className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatCurrency(orderStats.averageOrderValue || 0)}
                                                </div>
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-50 px-5 py-1">
                            <div className="text-xs text-yellow-600 flex items-center justify-end">
                                <span>View analytics</span>
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart - Takes 2/3 width on large screens */}
                    <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <LineChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                                Revenue Trend
                            </h2>
                        </div>
                        <div className="h-80">
                            {/* Display revenue chart with real data */}
                            <LineChart
                                data={revenueData.values}
                                categories={revenueData.categories}
                            />
                        </div>
                    </div>

                    {/* Order Status Chart - Takes 1/3 width */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <PieChart className="h-5 w-5 mr-2 text-purple-500" />
                                Order Status
                            </h2>
                        </div>
                        <div className="h-60">
                            {/* Pass real order status data to DonutChart */}
                            <DonutChart data={orderStatusData} />
                            <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                                <div className="flex flex-col items-center bg-green-50 rounded-lg p-3">
                                    <span className="text-sm text-gray-500">Completed</span>
                                    <span className="text-xl font-semibold text-green-600">{orderStats.completedOrders}</span>
                                </div>
                                <div className="flex flex-col items-center bg-yellow-50 rounded-lg p-3">
                                    <span className="text-sm text-gray-500">Pending</span>
                                    <span className="text-xl font-semibold text-yellow-600">{orderStats.pendingOrders}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                            Product Distribution
                        </h2>
                    </div>
                    <div className="h-80">
                        {/* Pass real product data to BarChart */}
                        <BarChart
                            data={productData.counts}
                            categories={productData.categories}
                        />
                    </div>
                </div>

                {/* Bottom Section - Popular Items & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Popular Products */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <Scissors className="h-5 w-5 mr-2 text-yellow-500" />
                                Top Products
                            </h2>
                            <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {topProducts.map((product, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
                                                    <Scissors className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{product.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.count}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatCurrency(product.revenue)}</div>
                                        </td>
                                    </tr>
                                ))}
                                {topProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-center text-sm text-gray-500">
                                            No product data available
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <ShoppingBag className="h-5 w-5 mr-2 text-green-500" />
                                Recent Orders
                            </h2>
                            <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:text-blue-800">
                                View all
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-blue-600">
                                                #{order._id.substring(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(order.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                              ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                              {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(order.total)}
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                                            No recent orders
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
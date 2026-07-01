import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    const [topCustomers, setTopCustomers] = useState([]); // New state for top customers
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
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/order/getallorders`, {
                        params: { page: 1, limit: 200, query: '' }
                    }),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/customer/getallcustomers`, {
                        params: { page: 1, limit: 200, query: '' }
                    })
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

            const orderData = ordersResponse.data?.data || ordersResponse.data?.orders || ordersResponse.data || [];
            const productData = productsResponse.data || [];
            const customerData = customersResponse.data?.data || customersResponse.data?.customer || [];

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

            // Calculate top customers by order frequency
            processTopCustomers(orderData, customerData);

        } catch (error) {
            console.error("Error in dashboard data processing:", error);
        } finally {
            setLoading(false);
        }
    };

    // New function to process top customers
    const processTopCustomers = (orderData, customerData) => {
        // Create a map to count orders per customer
        const customerOrderCount = {};
        const customerTotalSpend = {};
        const customerLastOrderDate = {};

        // Count orders per customer and calculate total spend
        orderData.forEach(order => {
            console.log('order data:', order);
            if (!order.customer) return;

            const customerId = order.customer._id;


            // Count orders
            if (customerOrderCount[customerId]) {
                customerOrderCount[customerId]++;
                customerTotalSpend[customerId] += (order.total || 0);

                // Update last order date if this order is more recent
                const orderDate = new Date(order.date);
                const lastDate = new Date(customerLastOrderDate[customerId]);
                if (orderDate > lastDate) {
                    customerLastOrderDate[customerId] = order.date;
                }
            } else {
                customerOrderCount[customerId] = 1;
                customerTotalSpend[customerId] = (order.total || 0);
                customerLastOrderDate[customerId] = order.date;
            }
        });

        // Create an array of customer objects with order counts
        const customerArray = [];

        // Match customer IDs with customer data
        for (const customerId in customerOrderCount) {
            // Find the customer in the customer data
            const customerInfo = customerData.find(c => c._id === customerId);

            if (customerInfo) {
                customerArray.push({
                    id: customerId,
                    name: `${customerInfo.name || ''}`.trim() || 'Unknown',
                    phone: customerInfo.phone || 'N/A',
                    orderCount: customerOrderCount[customerId],
                    totalSpend: customerTotalSpend[customerId],
                    lastOrderDate: customerLastOrderDate[customerId]
                });
            }
        }

        // Sort by number of orders (descending)
        const sortedCustomers = customerArray.sort((a, b) => b.orderCount - a.orderCount);

        // Get top 5 customers
        setTopCustomers(sortedCustomers.slice(0, 5));

        console.log("Order data:", orderData);
        console.log("Customer data:", customerData);
        console.log("Customer order counts:", customerOrderCount);
        console.log("Final top customers:", sortedCustomers.slice(0, 5));
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
            <div className="flex-1 flex items-center justify-center bg-surface">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-stone-400 font-label">Loading atelier data…</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Orders',
            value: orderStats.totalOrders || orders.length,
            icon: 'receipt_long',
            trend: orderTrend,
            dark: false,
            onClick: () => navigate('/orders'),
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(orderStats.totalRevenue || 0),
            icon: 'payments',
            trend: revenueTrend,
            dark: true,
            onClick: () => navigate('/orders'),
        },
        {
            label: 'Total Customers',
            value: customers.length,
            icon: 'person_pin',
            trend: null,
            dark: false,
            onClick: () => navigate('/customers'),
        },
        {
            label: 'Avg. Order Value',
            value: formatCurrency(orderStats.averageOrderValue || 0),
            icon: 'analytics',
            trend: null,
            dark: false,
            onClick: null,
        },
    ];

    return (
        <div className="p-8 space-y-8 font-body">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1 font-label">Good day, Master</p>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Atelier Overview</h1>
                </div>
                {/* Time Frame Selector */}
                <div className="flex items-center bg-surface-container-lowest rounded-xl p-1 gap-1" style={{ boxShadow: '0 2px 8px rgba(25,28,27,0.06)' }}>
                    {['week', 'month', 'year'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeFrame(tf)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-label ${
                                timeFrame === tf
                                    ? 'bg-primary text-on-primary'
                                    : 'text-stone-500 hover:text-primary'
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-12 gap-6">
                {statCards.map((card, i) => {
                    const colSpans = ['col-span-12 md:col-span-4', 'col-span-12 md:col-span-4', 'col-span-6 md:col-span-2', 'col-span-6 md:col-span-2'];
                    return (
                        <div
                            key={i}
                            onClick={card.onClick}
                            className={`${colSpans[i]} p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                                card.dark
                                    ? 'bg-primary text-on-primary cursor-pointer hover:shadow-2xl'
                                    : `bg-surface-container-lowest ${card.onClick ? 'cursor-pointer' : ''} hover:shadow-lg`
                            }`}
                            style={{ boxShadow: card.dark ? '0 12px 40px rgba(25,83,0,0.18)' : '0 4px 20px rgba(25,28,27,0.05)' }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-xl ${card.dark ? 'bg-white/10' : 'bg-primary/5 text-primary'}`}>
                                    <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                                </div>
                                {card.trend !== null && (
                                    <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-1 rounded-full ${
                                        card.trend >= 0
                                            ? card.dark ? 'bg-white/10 text-on-primary' : 'bg-primary-fixed text-on-primary-fixed-variant'
                                            : 'bg-error/5 text-error'
                                    }`}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {card.trend >= 0 ? 'trending_up' : 'trending_down'}
                                        </span>
                                        {Math.abs(card.trend)}%
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 font-label ${card.dark ? 'text-on-primary/60' : 'text-stone-400'}`}>
                                    {card.label}
                                </p>
                                <h3 className={`text-2xl font-extrabold font-headline ${card.dark ? 'text-on-primary' : 'text-on-surface'}`}>
                                    {card.value}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-on-surface font-headline">Revenue Trend</h3>
                            <p className="text-sm text-stone-400">Monthly breakdown of atelier earnings</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <LineChart data={revenueData.values} categories={revenueData.categories} />
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-surface-container-lowest rounded-xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <h3 className="text-xl font-bold text-on-surface font-headline mb-1">Order Status</h3>
                    <p className="text-sm text-stone-400 mb-6">Production pipeline</p>
                    <div className="h-52">
                        <DonutChart data={orderStatusData} />
                    </div>
                    <div className="space-y-3 mt-6">
                        {[
                            { label: 'Completed', value: orderStats.completedOrders, color: 'bg-primary' },
                            { label: 'Pending', value: orderStats.pendingOrders, color: 'bg-tertiary-fixed-dim' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                    <span className="text-stone-500">{item.label}</span>
                                </div>
                                <span className="font-bold text-on-surface">{item.value ?? '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Distribution */}
            <div className="bg-surface-container-lowest rounded-xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <h3 className="text-xl font-bold text-on-surface font-headline mb-1">Product Distribution</h3>
                <p className="text-sm text-stone-400 mb-6">Orders by garment category</p>
                <div className="h-72">
                    <BarChart data={productData.counts} categories={productData.categories} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <div className="p-8 pb-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-on-surface font-headline">Top Signature Cuts</h3>
                        <button className="text-sm font-bold text-primary hover:underline font-label">View All</button>
                    </div>
                    <div className="px-8 pb-8 space-y-2">
                        {topProducts.length === 0 && (
                            <p className="text-sm text-stone-400 py-4 text-center">No product data available</p>
                        )}
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px]">content_cut</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-on-surface text-sm truncate">{product.type}</h4>
                                    <p className="text-xs text-stone-400">{product.count} orders</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-primary text-sm">{formatCurrency(product.revenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <div className="p-8 pb-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-on-surface font-headline">Vanguard Clients</h3>
                        <button onClick={() => navigate('/customers')} className="text-sm font-bold text-primary hover:underline font-label">View CRM</button>
                    </div>
                    <div className="px-8 pb-8 space-y-2">
                        {topCustomers.length === 0 && (
                            <p className="text-sm text-stone-400 py-4 text-center">No customer data available</p>
                        )}
                        {topCustomers.map((customer, index) => {
                            const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                            const bgColors = ['bg-tertiary-fixed', 'bg-secondary-fixed', 'bg-primary-fixed', 'bg-surface-container-high', 'bg-tertiary-container'];
                            return (
                                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors">
                                    <div className={`w-10 h-10 rounded-full ${bgColors[index % bgColors.length]} flex items-center justify-center text-xs font-bold text-on-surface flex-shrink-0`}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-on-surface text-sm truncate">{customer.name}</h4>
                                        <p className="text-xs text-stone-400">{customer.orderCount} orders · {customer.phone}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-primary text-sm">{formatCurrency(customer.totalSpend)}</p>
                                        <p className="text-xs text-stone-400">{new Date(customer.lastOrderDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

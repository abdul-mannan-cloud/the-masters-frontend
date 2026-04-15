import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'react-apexcharts';
import ShirtDetails from '../../Components/ItemDetails/ItemDetails';

const ViewEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedItem, setSelectedItem] = useState('');
    const [modalIsOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [employeeData, setEmployeeData] = useState({
        name: '',
        cnic: '',
        phone: '',
        password: '',
        payment: 0,
        products: [],
    });

    const [products, setProducts] = useState([]);
    const [orderCompleted, setCompleted] = useState([]);
    const [orderPending, setPending] = useState([]);

    const [chartOptions] = useState({
        chart: { type: 'donut', toolbar: { show: false } },
        labels: ['Completed', 'Pending'],
        colors: ['#003629', '#a8d5c9'],
        legend: { position: 'bottom', fontFamily: 'Manrope', fontSize: '13px' },
        dataLabels: { style: { fontFamily: 'Manrope' } },
        plotOptions: { pie: { donut: { size: '65%' } } },
    });
    const [chartSeries, setChartSeries] = useState([0, 0]);

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employee/getemployee/${id}`);
                const productsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/getallproducts`);

                const filteredProducts = productsResponse.data.filter((product) =>
                    response.data.products.includes(product._id)
                );

                setProducts(filteredProducts);
                setEmployeeData(response.data);

                const completed = filteredProducts.filter((p) => p.status === 'completed');
                const pending = filteredProducts.filter((p) => p.status !== 'completed');
                setCompleted(completed);
                setPending(pending);
                setChartSeries([completed.length, pending.length]);
            } catch (error) {
                console.error('Error fetching employee details:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-stone-400 font-body">Loading employee details…</p>
                </div>
            </div>
        );
    }

    const bgColors = ['bg-secondary-fixed', 'bg-tertiary-fixed', 'bg-primary-fixed', 'bg-secondary-container'];
    const textColors = ['text-on-secondary-fixed', 'text-on-tertiary-fixed', 'text-on-primary-fixed', 'text-on-secondary-container'];

    return (
        <div className="p-8 font-body">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/employees')}
                    className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
                >
                    <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Employee Profile</h1>
                    <p className="text-stone-400 mt-1 text-sm">Full details and performance overview.</p>
                </div>
            </div>

            {/* Hero Card */}
            <div className="bg-primary rounded-2xl p-8 mb-6 text-on-primary flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-on-primary/10 flex items-center justify-center text-3xl font-extrabold font-headline flex-shrink-0">
                    {employeeData.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-extrabold font-headline">{employeeData.name}</h2>
                    <p className="text-on-primary/70 text-sm mt-1">{employeeData.role}</p>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-on-primary/80">
                            <span className="material-symbols-outlined text-[16px]">call</span>
                            {employeeData.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-on-primary/80">
                            <span className="material-symbols-outlined text-[16px]">badge</span>
                            {employeeData.cnic}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-on-primary/60 uppercase tracking-wider font-label mb-1">Balance</p>
                    <p className={`text-2xl font-extrabold font-headline ${employeeData.payment < 0 ? 'text-primary-fixed' : 'text-on-error'}`}>
                        Rs. {Math.abs(employeeData.payment).toLocaleString()}
                    </p>
                    <p className="text-xs text-on-primary/60 mt-1 font-label">{employeeData.payment < 0 ? 'Debit' : 'Credit'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Stats */}
                <div className="bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">Performance</h3>
                    <div className="space-y-4">
                        {[
                            { icon: 'inventory_2', label: 'Total Products', value: products.length },
                            { icon: 'check_circle', label: 'Completed', value: orderCompleted.length },
                            { icon: 'schedule', label: 'Pending', value: orderPending.length },
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px] text-primary">{stat.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-stone-400 font-label">{stat.label}</p>
                                    <p className="text-base font-extrabold text-on-surface font-headline">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 font-headline">Order Status Distribution</h3>
                    {chartSeries[0] === 0 && chartSeries[1] === 0 ? (
                        <div className="flex items-center justify-center h-40 text-stone-400 text-sm">No order data yet</div>
                    ) : (
                        <Chart options={chartOptions} series={chartSeries} type="donut" height={200} />
                    )}
                </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 && (
                <div className="bg-surface-container-lowest rounded-2xl p-6" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5 font-headline">Assigned Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {products.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => { setSelectedItem(item); setIsOpen(true); }}
                                className="flex gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors"
                            >
                                <img
                                    src={item.image}
                                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                    alt={item.type}
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-on-surface truncate font-headline">{item.type}</p>
                                    <p className="text-xs text-stone-400 mt-0.5">Rs. {item.price?.toLocaleString()}</p>
                                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                                        item.status === 'completed'
                                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                            : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Item Detail Modal */}
            {modalIsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-surface-container-lowest rounded-2xl max-w-lg w-full mx-4 animate-modal-in" style={{ boxShadow: '0 24px 60px rgba(25,28,27,0.15)' }}>
                        <ShirtDetails item={selectedItem} model={modalIsOpen} setModel={setIsOpen} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewEmployee;

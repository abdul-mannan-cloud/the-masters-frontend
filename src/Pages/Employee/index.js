import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const Employees = ({ types }) => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeQuery, setTypeQuery] = useState('All');
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
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payment, setPayment] = useState(0);
    const employeesPerPage = 10;

    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEmployees(currentPage, searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery]);

    const fetchEmployees = async (page = 1, query = '') => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employee/getallemployee`, {
                params: {
                    page,
                    limit: employeesPerPage,
                    query
                }
            });
            const responseData = response.data;
            setEmployees(responseData?.data || responseData?.employees || []);
            setPagination(responseData?.pagination || {
                page,
                limit: employeesPerPage,
                total: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            });
        } catch (error) {
            toast.error('Failed to fetch employees');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/employee/deleteemployee/${id}`);
                toast.success('Employee deleted successfully');
                fetchEmployees(currentPage, searchQuery);
            } catch (error) {
                toast.error('Failed to delete employee');
                console.error('Error:', error);
            }
        }
    };

    const handlePayment = async () => {
        try {
            if (payment <= 0) {
                toast.error('Amount must be greater than zero');
                return;
            }
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/employee/makepayment/${selectedEmployee._id}`,
                { payment }
            );
            toast.success('Payment successful');
            setIsOpen(false);
            fetchEmployees(currentPage, searchQuery);
        } catch (error) {
            toast.error('Failed to process payment');
            console.error('Error:', error);
        }
    };

    const filteredEmployees = employees.filter(employee => {
        const roleMatch = typeQuery === 'All' || employee.role.toLowerCase() === typeQuery.toLowerCase();
        return roleMatch;
    });

    const effectiveTotalPages = pagination.totalPages || Math.max(1, Math.ceil((pagination.total || 0) / employeesPerPage));
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
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Team Management</h1>
                    <p className="text-stone-400 mt-1 text-sm">Manage your atelier's artisans and staff.</p>
                </div>
                <button
                    onClick={() => navigate('/employees/add')}
                    className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors font-label"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add Employee
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search by name or phone…"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body"
                    />
                </div>
                <select
                    value={typeQuery}
                    onChange={(e) => { setTypeQuery(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 font-body font-medium"
                >
                    <option value="All">All Roles</option>
                    {types.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Table Card */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full masters-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Payment Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <span className="material-symbols-outlined text-[28px] text-stone-300">group</span>
                                            </div>
                                            <p className="text-sm font-bold text-stone-400 font-headline">No employees found</p>
                                            <p className="text-xs text-stone-300">Try a different search or role filter</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-xs font-bold text-on-secondary-fixed flex-shrink-0">
                                                    {employee.name[0].toUpperCase()}
                                                </div>
                                                <span className="font-medium text-on-surface">{employee.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-on-surface-variant">{employee.phone}</td>
                                        <td>
                                            <span className="status-badge bg-secondary-container text-on-secondary-container">
                                                {employee.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${employee.payment < 0 ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                                                <span className="material-symbols-outlined text-[14px] mr-1">{employee.payment < 0 ? 'trending_down' : 'trending_up'}</span>
                                                {employee.payment < 0 ? 'Debit' : 'Credit'}: Rs. {Math.abs(employee.payment)}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => { setSelectedEmployee(employee); setIsOpen(true); }}
                                                    className="p-2 rounded-lg text-stone-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    title="Make Payment"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/employees/view/${employee._id}`)}
                                                    className="p-2 rounded-lg text-stone-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    title="View"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/employees/edit/${employee._id}`)}
                                                    className="p-2 rounded-lg text-stone-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id)}
                                                    className="p-2 rounded-lg text-stone-400 hover:text-error hover:bg-error/5 transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant/10">
                        <span className="text-sm text-stone-400">
                            Showing {((currentPage - 1) * employeesPerPage) + 1}–{Math.min(currentPage * employeesPerPage, pagination.total)} of {pagination.total} employees
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

            {/* Payment Modal */}
            {modalIsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-surface-container-lowest rounded-2xl p-8 w-full max-w-sm mx-4 animate-modal-in" style={{ boxShadow: '0 24px 60px rgba(25,28,27,0.15)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface font-headline">Process Payment</h2>
                            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-stone-500 mb-5">
                            Recording payment for <span className="font-bold text-on-surface">{selectedEmployee?.name}</span>
                        </p>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                                Amount (Rs.)
                            </label>
                            <input
                                type="number"
                                value={payment}
                                onChange={(e) => setPayment(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                placeholder="Enter amount"
                            />
                        </div>
                        <button
                            onClick={handlePayment}
                            className="w-full py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors font-label"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;

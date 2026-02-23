import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    UserCircle,
    DollarSign
} from 'lucide-react';
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '400px',
        width: '90%',
        padding: '2rem',
        borderRadius: '0.5rem',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
};

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
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
                        <button
                            onClick={() => navigate('/employees/add')}
                            className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Employee
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>
                        <select
                            value={typeQuery}
                            onChange={(e) => {
                                setTypeQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                        >
                            <option value="All">All Roles</option>
                            {types.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Employees Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Payment Status</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">Loading...</td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">No employees found</td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <span className="text-yellow-600 font-medium">{employee.name[0].toUpperCase()}</span>
                                                </div>
                                                {employee.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{employee.phone}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                    {employee.role}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    employee.payment < 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {employee.payment < 0 ? 'Debit' : 'Credit'}: Rs. {Math.abs(employee.payment)}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setIsOpen(true);
                                                    }}
                                                    className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                                >
                                                    <DollarSign className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/employees/view/${employee._id}`)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/employees/edit/${employee._id}`)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id)}
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

                    {!loading && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                                Page {currentPage} of {effectiveTotalPages} ({pagination.total} total employees)
                            </p>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={!canGoPrev}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {getPageNumbers().map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`px-3 py-1 rounded-lg border ${
                                            currentPage === pageNumber
                                                ? 'bg-yellow-400 text-white border-yellow-400'
                                                : 'border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    disabled={!canGoNext}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Modal */}
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={() => setIsOpen(false)}
                        style={customStyles}
                        contentLabel="Payment Modal"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Process Payment</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Amount (Rs.)
                                </label>
                                <input
                                    type="number"
                                    value={payment}
                                    onChange={(e) => setPayment(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <button
                                onClick={handlePayment}
                                className="w-full bg-yellow-400 text-white py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
                            >
                                Process Payment
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Employees;

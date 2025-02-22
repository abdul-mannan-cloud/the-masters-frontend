import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    ArrowLeft, User, UserPlus, Phone,
    Lock, Shield, CreditCard, Save, X
} from 'lucide-react';

const Employee = ({ types }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState({
        name: '',
        cnic: '',
        phone: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        if (localStorage.getItem('ciseauxtoken') === null) {
            navigate('/login');
        }
    }, []);

    const formatCNIC = (event) => {
        let value = event.target.value.replace(/\D/g, "");
        if (value.length > 5) value = `${value.slice(0, 5)}-${value.slice(5)}`;
        if (value.length > 13) value = `${value.slice(0, 13)}-${value.slice(13, 14)}`;
        event.target.value = value;
    };

    const formatPhoneNumber = (event) => {
        let value = event.target.value.replace(/\D/g, "");
        if (value.length > 4) value = `${value.slice(0, 4)}-${value.slice(4)}`;
        if (value.length > 11) value = value.slice(0, 12);
        event.target.value = value;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!employeeData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (employeeData.cnic.length !== 15) {
            toast.error('Please enter a valid CNIC');
            return false;
        }
        if (employeeData.phone.length !== 12) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        if (!employeeData.password.trim()) {
            toast.error('Password is required');
            return false;
        }
        if (!employeeData.role) {
            toast.error('Please select an employee type');
            return false;
        }
        return true;
    };

    const handleAddEmployee = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/employee/addemployee`, employeeData);
            toast.success('Employee added successfully');
            navigate('/employees');
        } catch (error) {
            toast.error('Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="border-b border-gray-200">
                        <div className="p-6 flex items-center gap-4">
                            <button
                                onClick={() => navigate('/employees')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <UserPlus className="w-6 h-6" />
                                Add New Employee
                            </h1>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <User className="w-4 h-4" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter employee name"
                                        value={employeeData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                {/* CNIC */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <CreditCard className="w-4 h-4" />
                                        CNIC
                                    </label>
                                    <input
                                        type="text"
                                        name="cnic"
                                        placeholder="#####-#######-#"
                                        maxLength={15}
                                        onInput={formatCNIC}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="03XX-XXXXXXX"
                                        maxLength={12}
                                        onInput={formatPhoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter secure password"
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>

                                {/* Employee Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <Shield className="w-4 h-4" />
                                        Employee Type
                                    </label>
                                    <select
                                        name="type"
                                        onChange={(e) => setEmployeeData(prev => ({
                                            ...prev,
                                            role: e.target.value
                                        }))}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="">Select employee type</option>
                                        {types.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => navigate('/employees')}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5
                                            border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50
                                            transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddEmployee}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5
                                            bg-yellow-400 text-white rounded-lg hover:bg-yellow-500
                                            transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        {loading ? 'Adding...' : 'Save Employee'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Employee;
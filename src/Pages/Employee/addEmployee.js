import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

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
        setEmployeeData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!employeeData.name.trim()) { toast.error('Name is required'); return false; }
        if (employeeData.cnic.length !== 15) { toast.error('Please enter a valid CNIC'); return false; }
        if (employeeData.phone.length !== 12) { toast.error('Please enter a valid phone number'); return false; }
        if (!employeeData.password.trim()) { toast.error('Password is required'); return false; }
        if (!employeeData.role) { toast.error('Please select an employee type'); return false; }
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

    const fields = [
        { name: 'name', label: 'Full Name', icon: 'person', type: 'text', placeholder: 'Enter employee name' },
        { name: 'cnic', label: 'CNIC', icon: 'badge', type: 'text', placeholder: '#####-#######-#', maxLength: 15, onInput: formatCNIC },
        { name: 'phone', label: 'Phone Number', icon: 'call', type: 'text', placeholder: '03XX-XXXXXXX', maxLength: 12, onInput: formatPhoneNumber },
        { name: 'password', label: 'Password', icon: 'lock', type: 'password', placeholder: 'Enter secure password' },
    ];

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
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline">Add Employee</h1>
                    <p className="text-stone-400 mt-1 text-sm">Register a new artisan or staff member.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl bg-surface-container-lowest rounded-2xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.04)' }}>
                <div className="space-y-5">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                                {field.label}
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
                                    {field.icon}
                                </span>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={employeeData[field.name]}
                                    onChange={handleInputChange}
                                    maxLength={field.maxLength}
                                    onInput={field.onInput}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Role */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                            Employee Role
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
                                work
                            </span>
                            <select
                                name="role"
                                onChange={(e) => setEmployeeData(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body appearance-none"
                            >
                                <option value="">Select employee role</option>
                                {types.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => navigate('/employees')}
                            className="flex-1 py-3 border border-outline-variant/30 text-on-surface-variant font-bold rounded-full text-sm hover:bg-surface-container-low transition-colors font-label"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddEmployee}
                            disabled={loading}
                            className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 font-label flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">save</span>
                            )}
                            {loading ? 'Saving…' : 'Save Employee'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Employee;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const Login = () => {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
    }, []);

    const handleSubmit = async () => {
        if (!userName || !password) {
            toast.error('Please enter both username and password');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/login`, {
                params: { userName, password }
            });
            localStorage.setItem('ciseauxtoken', res.data.token);
            toast.success('Login successful');
            navigate('/home');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Invalid credentials or server error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface font-body">
            {/* Decorative background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-tertiary-fixed/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm px-4">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-on-primary mb-4">
                        <span className="material-symbols-outlined text-[28px]">architecture</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-widest text-primary uppercase font-headline">
                        The Masters
                    </h1>
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400 mt-1 font-label">
                        Digital Tailor · Admin
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface-container-lowest rounded-3xl p-8" style={{ boxShadow: '0 12px 40px rgba(25,28,27,0.08)' }}>
                    <h2 className="text-xl font-bold text-on-surface mb-1 font-headline">Welcome back</h2>
                    <p className="text-sm text-stone-500 mb-8">Sign in to your atelier workspace</p>

                    <div className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                                Username
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
                                    person
                                </span>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter your username"
                                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-label">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">
                                    lock
                                </span>
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-10 py-3 bg-surface-container-low rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-primary transition-colors"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {isPasswordVisible ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-full text-sm tracking-wide hover:bg-primary-container transition-all disabled:opacity-60 font-label uppercase"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </div>

                    <p className="text-center text-xs text-stone-400 mt-8">
                        Need access? Contact your administrator
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
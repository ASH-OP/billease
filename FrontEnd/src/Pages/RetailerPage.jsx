// src/Pages/RetailerPage.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaStore, FaChartLine, FaFileInvoice, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const RetailerPage = () => {
    const navigate = useNavigate();
    const { login, isLoading: isAuthLoading, isRetailerAuth, handleGoogleAuth, retailerUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isRetailerAuth && retailerUser?.role === 'retailer') {
            if (retailerUser.isProfileComplete) navigate('/retailerDashboard');
            else navigate('/completeRetailerProfile');
        }
    }, [isRetailerAuth, retailerUser, navigate]);

    const handleEmailPasswordSubmit = async (event) => {
        event.preventDefault();
        if (!email || !password) { toast.error('Please enter both email and password.'); return; }
        await login(email, password, 'retailer');
        // Navigation is handled by the useEffect above based on isProfileComplete
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await handleGoogleAuth(credentialResponse, { role: 'retailer' });
            if (response?.success) {
                if (response.user?.isProfileComplete) navigate('/retailerDashboard');
                else navigate('/completeRetailerProfile');
            }
        } catch { toast.error('Authentication failed. Please try again.'); }
    };

    const handleGoogleError = () => toast.error('Google login failed. Please try again.');

    const features = [
        { icon: <FaFileInvoice />, text: 'Create & send digital invoices instantly' },
        { icon: <FaUsers />, text: 'Manage customer bills in one place' },
        { icon: <FaChartLine />, text: 'Track revenue trends & analytics' },
    ];

    return (
        <div className={`min-h-screen flex transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* ── LEFT HERO PANEL ── */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #ea580c 100%)' }}>
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-slate-600/40 blur-3xl" />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative z-10 max-w-md text-center">
                    <div className="w-20 h-20 rounded-3xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center mx-auto mb-6">
                        <FaStore className="text-orange-400 text-3xl" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                        Retailer <span className="text-orange-400">Portal</span>
                    </h1>
                    <p className="text-slate-300 text-lg mb-10">Manage your store billing like a pro</p>

                    <div className="space-y-4 text-left">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                                <span className="text-orange-400 text-lg">{f.icon}</span>
                                <span className="text-white/90 text-sm font-medium">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-10">
                <div className={`w-full max-w-md transition-all duration-700 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                    <div className="lg:hidden text-center mb-8">
                        <img src="/logo-orange.png" alt="BillEase" className="w-14 h-auto mx-auto mb-2" />
                        <h1 className="text-2xl font-black text-gray-800">Bill<span className="text-orange-500">Ease</span></h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
                        <div className="mb-8">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                                <FaStore size={10} /> Retailer Portal
                            </span>
                            <h2 className="text-3xl font-black text-gray-900">Sign in</h2>
                            <p className="text-gray-500 text-sm mt-1">Access your store dashboard.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleEmailPasswordSubmit}>
                            <div>
                                <label htmlFor="retailer-email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input id="retailer-email" type="email" placeholder="store@example.com" required value={email}
                                        onChange={e => setEmail(e.target.value)} disabled={isAuthLoading}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-60 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="retailer-password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input id="retailer-password" type="password" placeholder="••••••••" required value={password}
                                        onChange={e => setPassword(e.target.value)} disabled={isAuthLoading}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-60 transition-all" />
                                </div>
                            </div>

                            <button type="submit" disabled={isAuthLoading}
                                className={`w-full flex justify-center items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-slate-700 to-orange-600 hover:from-slate-800 hover:to-orange-700 shadow-lg shadow-slate-200 transition-all text-sm ${isAuthLoading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-px active:translate-y-0'}`}>
                                {isAuthLoading ? <><FaSpinner className="animate-spin" /> Signing in...</> : <><FaSignInAlt /> Sign In to Store</>}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
                                useOneTap theme="outline" size="large" shape="rectangular" width="320px" disabled={isAuthLoading} />
                        </div>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            New retailer?{' '}
                            <NavLink to="/RegisterRetailer" className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1">
                                <FaStore size={11} /> Register your shop
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetailerPage;
// src/Pages/CustomerRegister.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSpinner, FaUser, FaEnvelope, FaLock, FaReceipt, FaShieldAlt, FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { customerApi } from '../services/api';
import OtpVerificationModal from '../components/OtpVerificationModal';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isLoading: isAuthLoading, isCustomerAuth: isAuthenticated, handleGoogleAuth } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isAuthenticated) navigate('/customerDashboard');
    }, [isAuthenticated, navigate]);

    // Step 1: validate form then send OTP
    const handleEmailPasswordSubmit = async (event) => {
        event.preventDefault();
        if (!name || !email || !password || !confirmPassword) { toast.error('Please fill in all fields.'); return; }
        if (password !== confirmPassword) { toast.error('Passwords do not match.'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters long.'); return; }

        setIsSendingOtp(true);
        try {
            const { data } = await customerApi.post('/auth/send-otp', { email, name });
            if (data.success) {
                setShowOtpModal(true);
            } else {
                toast.error(data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Step 2: OTP verified → register
    const handleOtpVerified = async (token) => {
        setShowOtpModal(false);
        const success = await register({ name, email, password, role: 'customer', verificationToken: token });
        if (success) navigate('/customerDashboard');
    };

    // Resend OTP from modal
    const handleResendOtp = async () => {
        const { data } = await customerApi.post('/auth/send-otp', { email, name });
        if (!data.success) throw new Error(data.message);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const success = await handleGoogleAuth(credentialResponse);
        if (success) navigate('/customerDashboard');
    };

    const handleGoogleError = () => toast.error('Google sign up failed. Please try again.');

    const features = [
        { icon: <FaReceipt />, text: 'Store all your receipts digitally' },
        { icon: <FaShieldAlt />, text: 'Track warranty & claim easily' },
        { icon: <FaCloudUploadAlt />, text: 'Upload bills from anywhere' },
    ];

    const inputClass = "w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-60 transition-all";
    const isLoading = isAuthLoading || isSendingOtp;

    return (
        <>
            <OtpVerificationModal
                isOpen={showOtpModal}
                email={email}
                onVerified={handleOtpVerified}
                onClose={() => setShowOtpModal(false)}
                onResend={handleResendOtp}
            />

            <div className={`min-h-screen flex transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>

                {/* ── LEFT HERO PANEL ── */}
                <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #ea580c 100%)' }}>
                    <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-600/30 blur-3xl" />
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                    <div className="relative z-10 max-w-md text-center">
                        <img src="/logo-orange.png" alt="BillEase" className="w-20 h-auto mx-auto mb-6 drop-shadow-lg" />
                        <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                            Join <span className="text-orange-400">BillEase</span>
                        </h1>
                        <p className="text-indigo-200 text-lg mb-10">Start managing your bills smarter today</p>
                        <div className="space-y-4 text-left">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                                    <span className="text-orange-400 text-lg">{f.icon}</span>
                                    <span className="text-white/90 text-sm font-medium">{f.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                            <FaCheckCircle className="text-green-400" />
                            <span className="text-white/80 text-sm font-medium">Email verification required for security</span>
                        </div>
                        <p className="text-indigo-300/70 text-xs mt-6">Free forever · No credit card required</p>
                    </div>
                </div>

                {/* ── RIGHT FORM PANEL ── */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-10 overflow-y-auto">
                    <div className={`w-full max-w-md transition-all duration-700 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                        <div className="lg:hidden text-center mb-8">
                            <img src="/logo-orange.png" alt="BillEase" className="w-14 h-auto mx-auto mb-2" />
                            <h1 className="text-2xl font-black text-gray-800">Bill<span className="text-orange-500">Ease</span></h1>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
                            <div className="mb-8">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                                    Create Account
                                </span>
                                <h2 className="text-3xl font-black text-gray-900">Get started</h2>
                                <p className="text-gray-500 text-sm mt-1">Fill in your details — we'll verify your email next.</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleEmailPasswordSubmit}>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input type="text" placeholder="John Doe" required value={name}
                                            onChange={e => setName(e.target.value)} disabled={isLoading} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input type="email" placeholder="you@example.com" required value={email}
                                            onChange={e => setEmail(e.target.value)} disabled={isLoading} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input type="password" placeholder="Min. 6 characters" required value={password}
                                            onChange={e => setPassword(e.target.value)} disabled={isLoading} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input type="password" placeholder="Re-enter password" required value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading} className={inputClass} />
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading}
                                    className={`w-full flex justify-center items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all text-sm mt-2 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-px active:translate-y-0'}`}>
                                    {isLoading
                                        ? <><FaSpinner className="animate-spin" /> Sending OTP...</>
                                        : <><FaShieldAlt /> Continue with Email Verification</>
                                    }
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">or</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
                                    useOneTap theme="outline" size="large" width="320px" disabled={isLoading} />
                            </div>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Already have an account?{' '}
                                <NavLink to="/customerLogin" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
                                    Sign in
                                </NavLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
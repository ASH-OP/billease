// src/Pages/RetailerRegister.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaSpinner,
    FaEnvelope,
    FaLock,
    FaUserTie
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const RetailerRegister = () => {
    const navigate = useNavigate();
    const { register, isLoading: isAuthLoading, isRetailerAuth: isAuthenticated, handleGoogleAuth } = useAuth();

    // State for BASIC fields only
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // We handle redirection manually in submit/google handlers to ensure
        // the profile check logic runs correctly before redirecting.
    }, [isAuthenticated]);

    // Handler for Email/Password Registration
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Basic Validation
        if (!ownerName || !email || !password || !confirmPassword) {
            toast.error("Please fill in all fields."); return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match."); return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long."); return;
        }

        // Register with minimal data
        // We set isProfileComplete to false so the backend knows they need step 2
        const registrationData = {
            name: ownerName,
            email,
            password,
            role: 'retailer',
            isProfileComplete: false
        };

        // Call register
        const success = await register(registrationData);

        if (success) {
            // New user created -> Always go to Complete Profile page
            navigate('/completeRetailerProfile');
            toast.success("Account created! Please complete your shop details.");
        }
    };

    // Handler for Google Auth
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await handleGoogleAuth(credentialResponse, { role: 'retailer' });

            if (response && response.success) {
                const userProfile = response.user || {};

                // CRITICAL CHECK:
                // Does the user have a Shop Name AND (GST OR PAN)?
                const hasBusinessDetails = userProfile.shopName && (userProfile.gstNumber || userProfile.panNumber);

                if (hasBusinessDetails) {
                    // Existing user with full profile -> Dashboard
                    navigate('/retailerDashboard');
                } else {
                    // New user OR incomplete profile -> Complete Profile Page
                    navigate('/completeRetailerProfile');
                }
            }
        } catch (error) {
            console.error("Google Auth Logic Error:", error);
            toast.error("Authentication failed. Please try again.");
        }
    };

    const handleGoogleError = () => {
        toast.error("Google sign up failed. Please try again.");
    };

    // --- Styles ---
    const inputClass = "pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1 ml-1";
    const iconClass = "absolute left-3 top-[38px] text-orange-400 z-10 text-lg";
    const buttonBaseClass = "w-full flex justify-center items-center py-3 px-6 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";

    return (
        <div className={`relative flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="floating-object" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 50 + 20}px`,
                        height: `${Math.random() * 50 + 20}px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 15 + 10}s`,
                        '--tx': `${Math.random() * 200 - 100}px`,
                        '--ty': `${Math.random() * 200 - 100}px`,
                        '--tr': `${Math.random() * 360}deg`
                    }}></div>
                ))}
            </div>

            {/* Main Card */}
            <div className={`relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-orange-100 transition-all duration-700 ease-out ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-orange-600 tracking-tight">
                        Partner Registration
                    </h2>
                    <p className="text-gray-500 mt-2 font-medium">
                        Create your account to get started.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Owner Name */}
                    <div className="relative group">
                        <label htmlFor="ownerName" className={labelClass}>Owner Full Name</label>
                        <FaUserTie className={iconClass} />
                        <input
                            type="text"
                            id="ownerName"
                            placeholder="e.g. Rajesh Kumar"
                            required
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className={inputClass}
                            disabled={isAuthLoading}
                        />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <label htmlFor="email" className={labelClass}>Business Email</label>
                        <FaEnvelope className={iconClass} />
                        <input
                            type="email"
                            id="email"
                            placeholder="name@business.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            disabled={isAuthLoading}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <label htmlFor="password" className={labelClass}>Password</label>
                        <FaLock className={iconClass} />
                        <input
                            type="password"
                            id="password"
                            placeholder="Create a strong password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                            disabled={isAuthLoading}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group">
                        <label htmlFor="confirm-password" className={labelClass}>Confirm Password</label>
                        <FaLock className={iconClass} />
                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Repeat password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                            disabled={isAuthLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isAuthLoading}
                            className={`${buttonBaseClass} bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 ${isAuthLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isAuthLoading ? (<><FaSpinner className="animate-spin mr-2" /> Creating Account...</>) : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-200 before:mt-0.5 after:flex-1 after:border-t after:border-gray-200 after:mt-0.5">
                    <p className="text-center text-xs font-bold text-gray-400 mx-4 tracking-wider">OR SIGN UP WITH</p>
                </div>

                <div className="flex justify-center pb-2">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="outline"
                        size="large"
                        width="300px"
                        disabled={isAuthLoading}
                    />
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have a partner account?{' '}
                        <NavLink to="/retailerLogin" className="text-orange-600 font-bold hover:text-orange-700 transition hover:underline">
                            Login to Dashboard
                        </NavLink>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .floating-object {
                    position: absolute;
                    background: rgba(249, 115, 22, 0.1);
                    border-radius: 8px; 
                    animation: floatAround linear infinite;
                }
                .floating-object:nth-child(even) {
                    background: rgba(251, 146, 60, 0.15);
                    border-radius: 50%;
                }
                @keyframes floatAround {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    50% { transform: translate(var(--tx), var(--ty)) rotate(var(--tr)); opacity: 0.3; }
                    100% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default RetailerRegister;
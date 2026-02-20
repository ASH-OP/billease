// src/Pages/CompleteRetailerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaStore, FaMapMarkerAlt, FaFileInvoice, FaCheckCircle, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CompleteRetailerProfile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, isLoading } = useAuth();
    
    // Form States
    const [shopName, setShopName] = useState('');
    const [shopAddress, setShopAddress] = useState('');
    const [idType, setIdType] = useState('GST'); // 'GST' or 'PAN'
    const [gstNumber, setGstNumber] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Safety check: If no user is logged in, send them back to login
    useEffect(() => {
        if (!user && !isLoading) {
            navigate('/retailerLogin');
        }
    }, [user, isLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!shopName || !shopAddress) {
            toast.error("Please fill in shop details."); return;
        }
        
        // Check either GST or PAN based on selection
        if (idType === 'GST' && !gstNumber) {
            toast.error("Please enter GST Number."); return;
        }
        if (idType === 'PAN' && !panNumber) {
            toast.error("Please enter PAN Number."); return;
        }

        try {
            const profileData = {
                shopName,
                shopAddress,
                // Send whichever ID was provided, clear the other to be safe
                gstNumber: idType === 'GST' ? gstNumber : null,
                panNumber: idType === 'PAN' ? panNumber : null,
                idType, // Optional: tell backend which type was used
                isProfileComplete: true 
            };

            const success = await updateProfile(profileData);

            if (success) {
                toast.success("Profile Completed!");
                navigate('/retailerDashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        }
    };

    // --- Styles ---
    const inputClass = "pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1 ml-1";
    const iconClass = "absolute left-3 top-[38px] text-orange-400 z-10 text-lg";

    return (
        <div className={`relative flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8 px-4 overflow-hidden transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
             
             {/* Background Animation */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="floating-object" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '40px', height: '40px',
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 15 + 10}s`,
                        '--tx': `${Math.random() * 200 - 100}px`,
                        '--ty': `${Math.random() * 200 - 100}px`,
                        '--tr': `${Math.random() * 360}deg`
                    }}></div>
                ))}
            </div>

            <div className={`relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-orange-100 transition-all duration-700 ease-out ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 text-orange-600">
                        <FaCheckCircle size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Complete Profile</h2>
                    <p className="text-gray-500 mt-2">
                        Hi <span className="text-orange-600 font-bold">{user?.name || 'Partner'}</span>, just a few more details about your business.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    
                    {/* Shop Name */}
                    <div className="relative group">
                        <label htmlFor="shopName" className={labelClass}>Shop / Store Name</label>
                        <FaStore className={iconClass} />
                        <input type="text" id="shopName" placeholder="e.g. Kumar General Store" required value={shopName} onChange={(e) => setShopName(e.target.value)} className={inputClass} />
                    </div>

                    {/* Shop Address */}
                    <div className="relative group">
                        <label htmlFor="shopAddress" className={labelClass}>Shop Address</label>
                        <FaMapMarkerAlt className={iconClass} />
                        <input type="text" id="shopAddress" placeholder="e.g. Plot 12, Main Market, Jaipur" required value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className={inputClass} />
                    </div>

                    {/* ID Type Selection Toggle */}
                    <div className="flex items-center space-x-4 mb-2 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">ID Type:</label>
                        <div className="flex w-full bg-white p-1 rounded-md border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIdType('GST')}
                                className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    idType === 'GST' 
                                    ? 'bg-orange-500 text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-orange-500'
                                }`}
                            >
                                GSTIN
                            </button>
                            <button
                                type="button"
                                onClick={() => setIdType('PAN')}
                                className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    idType === 'PAN' 
                                    ? 'bg-orange-500 text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-orange-500'
                                }`}
                            >
                                PAN Card
                            </button>
                        </div>
                    </div>

                    {/* GST Field */}
                    {idType === 'GST' && (
                        <div className="relative group animate-fadeIn">
                            <label htmlFor="gstNumber" className={labelClass}>GST Number</label>
                            <FaFileInvoice className={iconClass} />
                            <input 
                                type="text" 
                                id="gstNumber" 
                                placeholder="e.g. 22AAAAA0000A1Z5" 
                                required 
                                value={gstNumber} 
                                onChange={(e) => setGstNumber(e.target.value.toUpperCase())} 
                                className={inputClass} 
                                maxLength={15} 
                            />
                        </div>
                    )}

                    {/* PAN Field */}
                    {idType === 'PAN' && (
                        <div className="relative group animate-fadeIn">
                            <label htmlFor="panNumber" className={labelClass}>PAN Number</label>
                            <FaIdCard className={iconClass} />
                            <input 
                                type="text" 
                                id="panNumber" 
                                placeholder="e.g. ABCDE1234F" 
                                required 
                                value={panNumber} 
                                onChange={(e) => setPanNumber(e.target.value.toUpperCase())} 
                                className={inputClass} 
                                maxLength={10} 
                            />
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-6 rounded-lg font-bold text-white bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 shadow-lg transform transition-all hover:scale-[1.02] mt-6">
                       {isLoading ? ( <><FaSpinner className="animate-spin mr-2" /> Saving Details...</> ) : 'Complete Registration'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .floating-object {
                    position: absolute;
                    background: rgba(249, 115, 22, 0.1);
                    border-radius: 8px;
                    animation: floatAround linear infinite;
                }
                @keyframes floatAround {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    50% { transform: translate(var(--tx), var(--ty)) rotate(var(--tr)); opacity: 0.4; }
                    100% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default CompleteRetailerProfile;
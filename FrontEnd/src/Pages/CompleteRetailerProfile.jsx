// src/Pages/CompleteRetailerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaSpinner, FaStore, FaMapMarkerAlt, FaFileInvoice,
    FaCheckCircle, FaIdCard, FaArrowRight, FaShieldAlt,
    FaFileAlt, FaChartLine, FaUsers
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CompleteRetailerProfile = () => {
    const navigate = useNavigate();
    const { retailerUser, updateProfile, isLoading } = useAuth();

    const [shopName, setShopName] = useState('');
    const [shopAddress, setShopAddress] = useState('');
    const [idType, setIdType] = useState('GST');
    const [gstNumber, setGstNumber] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading && retailerUser?.isProfileComplete) {
            navigate('/retailerDashboard', { replace: true });
        }
    }, [retailerUser, isLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shopName.trim() || !shopAddress.trim()) {
            toast.error('Please fill in shop name and address.'); return;
        }
        if (idType === 'GST' && !gstNumber.trim()) {
            toast.error('Please enter your GST Number.'); return;
        }
        if (idType === 'PAN' && !panNumber.trim()) {
            toast.error('Please enter your PAN Number.'); return;
        }

        const success = await updateProfile({
            shopName: shopName.trim(),
            shopAddress: shopAddress.trim(),
            gstNumber: idType === 'GST' ? gstNumber.trim() : null,
            panNumber: idType === 'PAN' ? panNumber.trim() : null,
            isProfileComplete: true,
        });

        if (success) {
            toast.success('Shop profile saved! Welcome to BillEase 🎉');
            navigate('/retailerDashboard', { replace: true });
        }
    };

    const inputClass = "w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-60 transition-colors";

    const features = [
        { icon: <FaFileAlt />, text: 'Your details power digital invoices' },
        { icon: <FaUsers />, text: 'Customers see your verified shop info' },
        { icon: <FaChartLine />, text: 'Unlock analytics & billing insights' },
    ];

    return (
        <div className={`min-h-screen flex transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* ── LEFT HERO PANEL ── */}
            <div
                className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #ea580c 100%)' }}
            >
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-slate-600/40 blur-3xl" />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative z-10 max-w-md text-center">
                    <div className="w-20 h-20 rounded-3xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center mx-auto mb-6">
                        <FaStore className="text-orange-400 text-3xl" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                        One last <span className="text-orange-400">step</span>
                    </h1>
                    <p className="text-slate-300 text-lg mb-10">Tell us about your shop to unlock your full dashboard</p>

                    <div className="space-y-4 text-left">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
                                <span className="text-orange-400 text-lg">{f.icon}</span>
                                <span className="text-white/90 text-sm font-medium">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Progress pills */}
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {['Account', 'Email', 'Shop'].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${i < 2 ? 'bg-orange-500/30 text-orange-300 border border-orange-400/30' : 'bg-white/15 text-white border border-white/20'}`}>
                                    {i < 2 && <FaCheckCircle className="text-orange-400" size={9} />}
                                    <span>{s}</span>
                                </div>
                                {i < 2 && <div className="w-4 h-px bg-white/20" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-10 overflow-y-auto">
                <div className={`w-full max-w-md transition-all duration-700 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img src="/logo-orange.png" alt="BillEase" className="w-14 h-auto mx-auto mb-2" />
                        <h1 className="text-2xl font-black text-gray-800">Bill<span className="text-orange-500">Ease</span></h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
                        <div className="mb-8">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                                <FaStore size={10} /> Shop Details
                            </span>
                            <h2 className="text-3xl font-black text-gray-900">Complete your profile</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Hi <span className="font-semibold text-orange-500">{retailerUser?.name || 'Partner'}</span> — a few details about your business.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>

                            {/* Shop Name */}
                            <div>
                                <label htmlFor="shopName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Shop / Store Name
                                </label>
                                <div className="relative">
                                    <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        id="shopName" type="text" placeholder="e.g. Kumar General Store"
                                        required value={shopName} onChange={e => setShopName(e.target.value)}
                                        disabled={isLoading} className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Shop Address */}
                            <div>
                                <label htmlFor="shopAddress" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Shop Address
                                </label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        id="shopAddress" type="text" placeholder="e.g. Plot 12, Main Market, Jaipur"
                                        required value={shopAddress} onChange={e => setShopAddress(e.target.value)}
                                        disabled={isLoading} className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* ID Type Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Tax ID Type
                                </label>
                                <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200 gap-1">
                                    {['GST', 'PAN'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setIdType(type)}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${idType === type
                                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {type === 'GST' ? 'GSTIN' : 'PAN Card'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* GST Field */}
                            {idType === 'GST' && (
                                <div>
                                    <label htmlFor="gstNumber" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        GST Number
                                    </label>
                                    <div className="relative">
                                        <FaFileInvoice className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            id="gstNumber" type="text" placeholder="e.g. 22AAAAA0000A1Z5"
                                            required value={gstNumber}
                                            onChange={e => setGstNumber(e.target.value.toUpperCase())}
                                            disabled={isLoading} maxLength={15}
                                            className={`${inputClass} font-mono tracking-widest`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5 ml-1">15-character GST Identification Number</p>
                                </div>
                            )}

                            {/* PAN Field */}
                            {idType === 'PAN' && (
                                <div>
                                    <label htmlFor="panNumber" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        PAN Number
                                    </label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            id="panNumber" type="text" placeholder="e.g. ABCDE1234F"
                                            required value={panNumber}
                                            onChange={e => setPanNumber(e.target.value.toUpperCase())}
                                            disabled={isLoading} maxLength={10}
                                            className={`${inputClass} font-mono tracking-widest`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5 ml-1">10-character Permanent Account Number</p>
                                </div>
                            )}

                            {/* Security note */}
                            <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                <FaShieldAlt className="text-slate-400 text-sm mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Your tax ID is encrypted and used only for identity verification. We never share it with third parties.
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-slate-700 to-orange-600 hover:from-slate-800 hover:to-orange-700 shadow-lg shadow-slate-200 transition-all text-sm mt-2 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-px active:translate-y-0'}`}
                            >
                                {isLoading
                                    ? <><FaSpinner className="animate-spin" /> Saving Details...</>
                                    : <>Complete Setup <FaArrowRight className="text-xs" /></>
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteRetailerProfile;
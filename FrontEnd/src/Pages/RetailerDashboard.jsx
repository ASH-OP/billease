import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, TrendingUp, Store, ArrowRight, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AddBillModalForRetailer from '../components/AddBillModalForRetailer';

const actionCards = [
    {
        title: 'Invoice History',
        description: 'Search past transactions, view and print any invoice.',
        icon: FileText,
        route: '/retailer/bills',
        primary: false,
        iconBg: 'bg-indigo-50 text-indigo-600',
        accentColor: 'hover:border-indigo-200',
        arrowColor: 'group-hover:text-indigo-600',
        cta: 'View Bills',
    },
    {
        title: 'Sales Analytics',
        description: 'Track revenue trends, top customers, and item performance.',
        icon: TrendingUp,
        route: '/retailer/analytics',
        primary: false,
        iconBg: 'bg-emerald-50 text-emerald-600',
        accentColor: 'hover:border-emerald-200',
        arrowColor: 'group-hover:text-emerald-600',
        cta: 'View Analytics',
    },
    {
        title: 'Create New Bill',
        description: 'Generate a digital invoice for any customer instantly.',
        icon: PlusCircle,
        primary: true,
        iconBg: 'bg-white/20 text-white',
        cta: 'Create Now',
    },
];

const RetailerDashboard = () => {
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    const { retailerUser, logout } = useAuth();

    useEffect(() => {
        setIsLoaded(true);
        if (retailerUser?.role === 'retailer' && !retailerUser?.isProfileComplete) {
            navigate('/completeRetailerProfile');
        }
    }, [retailerUser, navigate]);

    const handleLogout = async () => {
        try { await logout('retailer'); navigate('/retailerLogin'); }
        catch { toast.error('Logout failed'); }
    };

    const handleCardClick = (card) => {
        if (card.primary) {
            if (!retailerUser) { toast.error('Please log in to continue.'); return; }
            setShowAddBillModal(true);
        } else {
            navigate(card.route);
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* ── HERO HEADER ── */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #ea580c 100%)' }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                                <Store className="text-orange-400 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-0.5">Retailer Portal</p>
                                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                    Welcome back, <span className="text-orange-400">{retailerUser?.name || 'Partner'}</span>
                                </h1>
                                <p className="text-slate-400 text-sm mt-0.5">Manage your store, bills, and analytics</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Today</p>
                                <p className="text-white text-sm font-bold">
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/30 rounded-xl text-sm font-bold transition-all"
                                title="Sign Out">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DASHBOARD CARDS ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-7 bg-gradient-to-b from-orange-500 to-indigo-600 rounded-full" />
                    <h2 className="text-xl font-black text-gray-900">Quick Actions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {actionCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                onClick={() => handleCardClick(card)}
                                className={`group relative overflow-hidden p-6 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
                                    ${card.primary
                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-md shadow-orange-200'
                                        : `bg-white border-gray-100 shadow-sm ${card.accentColor}`
                                    }`}
                            >
                                {/* Large background icon */}
                                <Icon className={`absolute -right-5 -bottom-5 w-28 h-28 opacity-[0.08] transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300`} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-lg ${card.primary ? 'bg-white/20' : card.iconBg}`}>
                                        <Icon size={20} />
                                    </div>

                                    <h3 className={`text-lg font-black mb-2 ${card.primary ? 'text-white' : 'text-gray-900'}`}>
                                        {card.title}
                                    </h3>
                                    <p className={`text-sm flex-1 leading-relaxed ${card.primary ? 'text-orange-100' : 'text-gray-500'}`}>
                                        {card.description}
                                    </p>

                                    <div className={`mt-5 flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all duration-200
                                        ${card.primary ? 'text-white' : `text-gray-500 ${card.arrowColor}`}`}>
                                        {card.cta} <ArrowRight size={15} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── SUPPORT STRIP ── */}
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-gray-500 text-sm">
                        Need assistance? Visit our <button onClick={() => navigate('/helpandsupport')} className="text-orange-600 font-bold hover:underline">Help & Support</button> center or chat with our AI assistant.
                    </p>
                    <button onClick={() => navigate('/helpandsupport')}
                        className="flex-shrink-0 flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 font-bold text-xs px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors">
                        Get Help <ArrowRight size={12} />
                    </button>
                </div>
            </div>

            {showAddBillModal && <AddBillModalForRetailer onClose={() => setShowAddBillModal(false)} />}
        </div>
    );
};

export default RetailerDashboard;
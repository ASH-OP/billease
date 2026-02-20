// src/pages/About.jsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaStore, FaSeedling, FaLock, FaMobileAlt, FaChartLine, FaRocket, FaHandshake } from 'react-icons/fa';
import { Receipt } from 'lucide-react';

const features = [
    { icon: <FaSeedling />, title: 'Eco-Friendly', desc: 'Replace paper receipts with secure digital bills and reduce waste.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { icon: <FaLock />, title: 'Secure Storage', desc: 'Your bills are encrypted and backed up safely in the cloud.', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { icon: <FaMobileAlt />, title: 'Any Device', desc: 'Access your receipts anytime from your phone, tablet, or laptop.', color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { icon: <FaChartLine />, title: 'Spending Insights', desc: 'Visualize your purchase history and track spending trends.', color: 'bg-violet-50 text-violet-600 border-violet-100' },
    { icon: <FaRocket />, title: 'Instant Billing', desc: 'Retailers can create and send invoices in seconds, paperlessly.', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { icon: <FaHandshake />, title: 'Customer Bonds', desc: 'Strengthen retailer-customer relationships with seamless billing.', color: 'bg-rose-50 text-rose-600 border-rose-100' },
];

const About = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* ── HERO ── */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #ea580c 100%)' }}>
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                        <Receipt size={13} /> About BillEase
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
                        The smarter way to manage<br />
                        <span className="text-orange-400">receipts & warranties</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-2xl mx-auto leading-relaxed">
                        BillEase bridges retailers and customers with a seamless, paperless billing platform — eco-friendly, secure, and always accessible.
                    </p>
                </div>
            </div>

            {/* ── ABOUT TEXT ── */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 mb-14">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-7 bg-gradient-to-b from-orange-500 to-indigo-600 rounded-full" />
                        <h2 className="text-2xl font-black text-gray-900">Our Mission</h2>
                    </div>
                    <div className="space-y-5 text-gray-600 leading-relaxed text-[15px]">
                        <p>
                            Welcome to <strong className="text-gray-900">BillEase</strong> — a cutting-edge platform designed to revolutionize how you manage purchase records. We simplify the storage and display of digital bills from local retailers, transitioning from traditional paper receipts to an eco-friendly digital solution.
                        </p>
                        <p>
                            Securely store and access your digital bills anytime, eliminating lost or damaged receipts. Our user-friendly interface ensures seamless navigation, providing real-time access to purchase history, organized bill storage, and easy transaction retrieval.
                        </p>
                        <p>
                            Data security and privacy are paramount at BillEase. We implement robust measures to protect your information, bridging the gap between retailers and customers with an innovative, paperless system.
                        </p>
                    </div>
                </div>

                {/* ── FEATURES GRID ── */}
                <div className="mb-6">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Everything you need</h2>
                        <p className="text-gray-500 text-sm">Features built for both customers and retailers</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div key={i} className={`flex flex-col gap-3 p-5 rounded-2xl border bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${f.color}`}>
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                                    <p className="text-gray-500 text-[13px] leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── USERS + RETAILERS CARDS ── */}
                <div className="grid md:grid-cols-2 gap-6 mt-10">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-7">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                                <FaUsers />
                            </div>
                            <h3 className="font-black text-orange-800 text-lg">For Customers</h3>
                        </div>
                        <ul className="space-y-2.5 text-sm text-orange-900/80">
                            {['Never lose a receipt again', 'Track warranty expiry dates', 'View purchase history anytime', 'Claim warranty with one click'].map(t => (
                                <li key={t} className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-2xl p-7">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                <FaStore />
                            </div>
                            <h3 className="font-black text-indigo-800 text-lg">For Retailers</h3>
                        </div>
                        <ul className="space-y-2.5 text-sm text-indigo-900/80">
                            {['Create invoices in seconds', 'Build customer loyalty', 'Reduce paper costs', 'Analytics & revenue insights'].map(t => (
                                <li key={t} className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
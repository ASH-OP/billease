// src/Pages/RetailerBills.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Search, FileText, User, Loader2, XCircle, IndianRupee } from 'lucide-react';
import RetailerBillModal from '../components/RetailerBillModal';
import { retailerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RetailerBills = () => {
    const navigate = useNavigate();
    const { isRetailerAuth } = useAuth();
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { fetchBills(); }, [isRetailerAuth]);

    const fetchBills = async () => {
        try {
            setIsLoading(true);
            const response = await retailerApi.get('/retailer/bills');
            setBills(response.data);
            setFilteredBills(response.data);
        } catch (error) {
            if (error.response?.status === 401) navigate('/retailerLogin');
        } finally { setIsLoading(false); }
    };

    useEffect(() => {
        let result = bills;
        if (selectedDate) {
            const dateObj = new Date(selectedDate);
            const formatted = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            result = result.filter(bill => bill.billDate === formatted);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(bill =>
                bill.customer.name.toLowerCase().includes(q) ||
                bill.customer.phone.includes(q) ||
                bill.customer.email.toLowerCase().includes(q) ||
                bill.billNumber.toLowerCase().includes(q) ||
                bill.items.some(i => i.name.toLowerCase().includes(q) || i.company.toLowerCase().includes(q))
            );
        }
        setFilteredBills(result);
    }, [selectedDate, searchQuery, bills]);

    const handleCardClick = (bill) => { setSelectedBill(bill); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setTimeout(() => setSelectedBill(null), 300); };
    const clearFilters = () => { setSelectedDate(''); setSearchQuery(''); };
    const uniqueDates = [...new Set(filteredBills.map(bill => bill.billDate))];
    const hasActiveFilters = selectedDate || searchQuery;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── HERO ── */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #ea580c 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4 mb-1">
                        <button onClick={() => navigate('/retailerDashboard')}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Retailer</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Invoice History</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm pl-14">
                        {bills.length} invoice{bills.length !== 1 ? 's' : ''} total
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ── FILTER BAR ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-3 sticky top-4 z-30">
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" size={16} />
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                            className="w-full md:w-52 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm text-gray-700 transition-all" />
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search by customer, bill number, or item…" value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm transition-all" />
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <div className="flex items-center">
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl">
                                {filteredBills.length} result{filteredBills.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── CONTENT ── */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-3 text-orange-500" />
                        <p className="text-sm font-medium">Loading invoices…</p>
                    </div>
                ) : uniqueDates.length > 0 ? (
                    <div className="space-y-10">
                        {uniqueDates.map(date => {
                            const dayBills = filteredBills.filter(b => b.billDate === date);
                            return (
                                <div key={date}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{date}</span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="text-xs font-bold text-gray-400">{dayBills.length} bill{dayBills.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {dayBills.map(bill => (
                                            <div key={bill._id || bill.billNumber}
                                                onClick={() => handleCardClick(bill)}
                                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 cursor-pointer transition-all duration-200 overflow-hidden">
                                                {/* Top bar */}
                                                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600" />
                                                <div className="p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="w-9 h-9 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center text-orange-600">
                                                            <FileText size={16} />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                            #{bill.billNumber?.split('-').pop()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-mono text-gray-400 mb-1 truncate">{bill.billNumber}</p>
                                                    <div className="flex items-center gap-1.5 text-gray-700 mb-3">
                                                        <User size={12} className="text-gray-400 flex-shrink-0" />
                                                        <span className="text-sm font-semibold truncate">{bill.customer.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 text-orange-600 font-black text-base">
                                                        <IndianRupee size={13} />
                                                        {bill.grandTotal?.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText size={22} className="text-orange-400" />
                        </div>
                        <p className="text-gray-700 font-bold text-lg">No invoices found</p>
                        <p className="text-gray-400 text-sm mt-1">{hasActiveFilters ? 'Try adjusting your filters' : 'Create your first bill from the dashboard'}</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters}
                                className="mt-5 px-5 py-2.5 bg-orange-50 text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-100 transition-colors border border-orange-200">
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {selectedBill && (
                <RetailerBillModal isOpen={isModalOpen} bill={selectedBill} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default RetailerBills;
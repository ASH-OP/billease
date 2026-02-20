import React, { useEffect, useState, useMemo } from 'react';
import { FaReceipt, FaSpinner } from 'react-icons/fa';
import { ShoppingBag, Calendar, ChevronRight, Tag, Shield } from 'lucide-react';
import { customerApi } from '../services/api';
import RetailerBillModal from './RetailerBillModal';

const storeColors = [
    { bar: 'bg-orange-500', icon: 'bg-orange-50 text-orange-600', badge: 'bg-orange-100 text-orange-700' },
    { bar: 'bg-indigo-500', icon: 'bg-indigo-50 text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
    { bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    { bar: 'bg-violet-500', icon: 'bg-violet-50 text-violet-600', badge: 'bg-violet-100 text-violet-700' },
    { bar: 'bg-rose-500', icon: 'bg-rose-50 text-rose-600', badge: 'bg-rose-100 text-rose-700' },
];

const CustomerDigitalBills = ({ searchTerm = '', onStatsUpdate }) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDigitalBills = async () => {
            try {
                const response = await customerApi.get('/retailer/bills/customer/my-bills');
                if (response.data.success) {
                    const fetchedBills = response.data.data;
                    setBills(fetchedBills);
                    if (onStatsUpdate) {
                        const warrantyCount = fetchedBills.reduce((sum, bill) =>
                            sum + (bill.items?.filter(i => i.warrantyMonths > 0).length || 0), 0
                        );
                        onStatsUpdate({ storeBillCount: fetchedBills.length, warrantyItemCount: warrantyCount });
                    }
                }
            } catch (error) {
                console.error('Error fetching digital bills:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDigitalBills();
    }, []);

    const handleViewInvoice = (bill) => { setSelectedBill(bill); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setTimeout(() => setSelectedBill(null), 300); };

    const filteredBills = useMemo(() => {
        if (!searchTerm.trim()) return bills;
        const term = searchTerm.toLowerCase();
        return bills.filter(bill =>
            bill.billNumber?.toLowerCase().includes(term) ||
            bill.shopName?.toLowerCase().includes(term) ||
            bill.customer?.name?.toLowerCase().includes(term) ||
            bill.items?.some(item => item.name?.toLowerCase().includes(term))
        );
    }, [bills, searchTerm]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                        <div className="h-1.5 bg-gray-200 w-full" />
                        <div className="p-5 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-16 bg-gray-100 rounded-xl mt-3" />
                            <div className="h-9 bg-gray-100 rounded-xl mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (bills.length === 0 && !loading) return null;

    return (
        <div className="mb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBills.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
                        No store bills match &ldquo;{searchTerm}&rdquo;
                    </div>
                ) : filteredBills.map((bill, index) => {
                    const palette = storeColors[index % storeColors.length];
                    const hasWarranty = bill.items?.some(i => i.warrantyMonths > 0);
                    const initials = bill.shopName?.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

                    return (
                        <div key={bill._id}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-200 overflow-hidden cursor-pointer"
                            onClick={() => handleViewInvoice(bill)}>

                            {/* Top accent bar */}
                            <div className={`h-1.5 w-full ${palette.bar}`} />

                            <div className="p-5">
                                {/* Header row */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${palette.icon} flex items-center justify-center font-black text-sm flex-shrink-0`}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-base truncate group-hover:text-orange-600 transition-colors">
                                            {bill.shopName}
                                        </h4>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{bill.billNumber}</p>
                                    </div>
                                    <span className="font-black text-base text-gray-900 flex-shrink-0">
                                        ₹{bill.grandTotal?.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Date + Warranty badges */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                        <Calendar size={11} /> {bill.billDate}
                                    </span>
                                    {hasWarranty && (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                            <Shield size={9} /> Warranty
                                        </span>
                                    )}
                                </div>

                                {/* Items preview */}
                                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-4">
                                    {bill.items?.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 truncate flex items-center gap-1.5">
                                                <Tag size={10} className="text-gray-400 flex-shrink-0" />
                                                {item.name}
                                                <span className="text-gray-400 text-xs">×{item.quantity}</span>
                                            </span>
                                            <span className="font-semibold text-gray-800 ml-2">₹{item.total?.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    {bill.items?.length > 2 && (
                                        <p className="text-xs text-indigo-500 font-semibold pt-0.5 text-center">
                                            +{bill.items.length - 2} more items
                                        </p>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={e => { e.stopPropagation(); handleViewInvoice(bill); }}
                                    className="w-full py-2.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-xl transition-all duration-150 flex items-center justify-center gap-2 group-hover:bg-orange-500 group-hover:text-white"
                                >
                                    <FaReceipt size={11} /> View Invoice <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedBill && (
                <RetailerBillModal isOpen={isModalOpen} bill={selectedBill} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default CustomerDigitalBills;
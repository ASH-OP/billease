// src/Pages/WarrantyClaimPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaShieldAlt, FaStore, FaCalendarAlt, FaBuilding,
    FaArrowRight, FaPhone, FaMapMarkerAlt, FaCheckCircle,
    FaReceipt
} from 'react-icons/fa';
import { Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WarrantyClaimPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { customerUser: contextUser } = useAuth();

    const [billData, setBillData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [isLoadingPage, setIsLoadingPage] = useState(true);

    useEffect(() => {
        const stateData = location.state || {};
        const bill = stateData.billData;
        const userFromState = stateData.currentUser || contextUser;

        if (!bill?._id || !Array.isArray(bill.items) || !userFromState?.email) {
            toast.error('Required data missing. Redirecting...');
            navigate('/customerDashboard', { replace: true });
        } else {
            setBillData(bill);
            setCurrentUser(userFromState);
            setIsLoadingPage(false);
            setSelectedItemIndex(null);
            setCompanyName('');

            const preSelected = stateData.preSelectedItem;
            if (preSelected) {
                const idx = bill.items.findIndex(i => i.itemName === preSelected.itemName);
                if (idx !== -1) {
                    setSelectedItemIndex(idx);
                    if (preSelected.company) setCompanyName(preSelected.company);
                }
            }
        }
    }, [location.state, contextUser, navigate]);

    useEffect(() => {
        if (selectedItemIndex !== null && billData?.items?.[selectedItemIndex]) {
            setSelectedItemDetails(billData.items[selectedItemIndex]);
        } else {
            setSelectedItemDetails(null);
        }
    }, [selectedItemIndex, billData]);

    const handleItemSelection = (index) => {
        setSelectedItemIndex(index === selectedItemIndex ? null : index);
    };

    const handleProceed = () => {
        if (selectedItemIndex === null || selectedItemDetails === null) {
            toast.error('Please select an item to claim warranty for.'); return;
        }
        if (!companyName.trim()) {
            toast.error('Please enter the company/brand name of the product.'); return;
        }
        if (!currentUser) {
            toast.error('User information not available. Cannot proceed.'); return;
        }
        navigate('/warranty-submit', {
            replace: true,
            state: {
                billData,
                selectedItem: selectedItemDetails,
                companyName: companyName.trim(),
                currentUser,
            },
        });
    };

    if (isLoadingPage) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                    <p className="text-sm font-medium">Loading claim details…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── HERO ── */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ea580c 100%)' }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                            <FaShieldAlt className="text-orange-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Warranty</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Initiate Warranty Claim</h1>
                            <p className="text-slate-400 text-sm">Select the item you'd like to claim</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STEPS INDICATOR ── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3 mb-8 mt-6">
                    {[
                        { n: 1, label: 'Select Item', active: true },
                        { n: 2, label: 'Describe Issue', active: false },
                        { n: 3, label: 'Submit', active: false },
                    ].map((s, i) => (
                        <React.Fragment key={s.n}>
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                                    ${s.active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{s.n}</div>
                                <span className={`text-sm font-bold hidden sm:block ${s.active ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                            </div>
                            {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 space-y-6">

                {/* ── BILL INFO CARD ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <FaReceipt className="text-orange-500" size={16} />
                        <h2 className="font-black text-gray-900 text-base">Bill Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><FaStore className="inline mr-1.5 text-orange-400" />Shop</p>
                            <p className="text-gray-800 font-semibold text-sm">{billData.shopName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><FaCalendarAlt className="inline mr-1.5 text-orange-400" />Purchase Date</p>
                            <p className="text-gray-800 font-semibold text-sm">{new Date(billData.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        {billData.shopPhoneNumber && (
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><FaPhone className="inline mr-1.5 text-orange-400" />Shop Phone</p>
                                <p className="text-gray-800 font-semibold text-sm">{billData.shopPhoneNumber}</p>
                            </div>
                        )}
                        {billData.shopAddress && (
                            <div className="sm:col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><FaMapMarkerAlt className="inline mr-1.5 text-orange-400" />Address</p>
                                <p className="text-gray-800 font-semibold text-sm">{billData.shopAddress}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SELECT ITEM ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <Package className="text-orange-500" size={16} />
                        <h2 className="font-black text-gray-900 text-base">Select Item for Warranty <span className="text-red-400">*</span></h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            {billData.items?.length > 0 ? billData.items.map((item, index) => {
                                const isSelected = selectedItemIndex === index;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleItemSelection(index)}
                                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group
                                            ${isSelected
                                                ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300'
                                                : 'bg-gray-50 border-gray-200 hover:border-orange-200 hover:bg-orange-50/50'}`}
                                    >
                                        <div>
                                            <p className={`font-bold text-sm ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>{item.itemName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">₹{item.cost?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                            ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-300'}`}>
                                            {isSelected && <FaCheckCircle className="text-white text-xs" />}
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No items found on this bill.</p>
                                </div>
                            )}
                        </div>
                        {selectedItemIndex === null && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 mt-3">
                                <AlertCircle size={12} /> Please select an item from the list above.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── COMPANY NAME ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <FaBuilding className="text-orange-500" size={15} />
                        <h2 className="font-black text-gray-900 text-base">Product Company / Brand <span className="text-red-400">*</span></h2>
                    </div>
                    <div className="p-6">
                        <label htmlFor="companyName" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Enter the brand name (e.g. Sony, HP, Whirlpool)
                        </label>
                        <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Company or Brand Name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                        />
                        {!companyName.trim() && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
                                <AlertCircle size={12} /> Company name is required.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── PROCEED BUTTON ── */}
                <div className="pt-2">
                    <button
                        onClick={handleProceed}
                        disabled={selectedItemIndex === null || !companyName.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-black text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 6px 24px -4px rgba(249,115,22,0.5)' }}
                    >
                        Proceed to Describe Issue <FaArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarrantyClaimPage;
// src/Pages/WarrantySubmitPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaShieldAlt, FaUser, FaBoxOpen, FaCalendarAlt,
    FaBuilding, FaHeadset, FaPaperPlane, FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import { MessageSquare, ExternalLink, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../services/api';

const WarrantySubmitPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { billData, selectedItem, companyName, currentUser } = location.state || {};

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validate data on mount
    useEffect(() => {
        if (!billData?._id || !selectedItem?.itemName || !companyName || !currentUser?.email) {
            toast.error('Missing warranty claim details. Redirecting...');
            navigate('/customerDashboard', { replace: true });
        } else {
            setIsLoadingPage(false);
        }
    }, [billData, selectedItem, companyName, currentUser, navigate]);

    const handleSubmit = async () => {
        if (issueDescription.trim().length < 10) {
            toast.error('Please describe the issue in at least 10 characters.');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting warranty claim…');

        try {
            await customerApi.post('/warranty-claims', {
                customerEmail: currentUser.email,
                customerName: currentUser.name,
                billId: billData._id,
                billName: billData.billName,
                shopName: billData.shopName,
                purchaseDate: billData.purchaseDate,
                itemName: selectedItem.itemName,
                companyName,
                itemCost: selectedItem.cost,
                issueDescription: issueDescription.trim(),
            });

            toast.success('Warranty claim submitted successfully!', { id: toastId });
            setIsSuccess(true);
        } catch (error) {
            const msg = error?.response?.data?.message || 'Submission failed. Please try again.';
            toast.error(msg, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContactCustomerCare = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(companyName + ' customer care')}`, '_blank');
    };

    const handleFindServiceCenter = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(companyName + ' service centre near me')}`, '_blank');
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

    // ── SUCCESS SCREEN ──
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <FaCheckCircle className="text-green-500 text-4xl" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-3">Claim Submitted!</h1>
                    <p className="text-gray-500 text-sm mb-2">
                        Your warranty claim for <strong className="text-gray-800">{selectedItem?.itemName}</strong> ({companyName}) has been received.
                    </p>
                    <p className="text-gray-400 text-xs mb-8">
                        Our team will review it and get back to you at <strong>{currentUser?.email}</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/customerDashboard')}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 16px -4px rgba(249,115,22,0.5)' }}
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={handleFindServiceCenter}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            <ExternalLink size={14} /> Find Service Centre
                        </button>
                    </div>
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
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors flex-shrink-0"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                            <FaShieldAlt className="text-orange-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Warranty</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white">Confirm & Submit Claim</h1>
                            <p className="text-slate-400 text-sm">Review details and describe the issue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STEP INDICATOR ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    {[
                        { n: 1, label: 'Select Item', done: true },
                        { n: 2, label: 'Describe Issue', active: true },
                        { n: 3, label: 'Submit', active: false },
                    ].map((s, i) => (
                        <React.Fragment key={s.n}>
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                                    ${s.done ? 'bg-green-500 text-white' : s.active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {s.done ? <FaCheckCircle size={12} /> : s.n}
                                </div>
                                <span className={`text-sm font-bold hidden sm:block ${s.active ? 'text-gray-900' : s.done ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                            </div>
                            {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* LEFT: Claim Summary */}
                    <div className="space-y-5">

                        {/* Claim Details Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaBoxOpen className="text-orange-500" size={15} />
                                    <h2 className="font-black text-gray-900 text-base">Claim Summary</h2>
                                </div>
                                <button onClick={handleContactCustomerCare}
                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 px-3 py-1.5 rounded-xl transition-all">
                                    <FaHeadset size={11} /> Contact Care
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { icon: FaUser, label: 'Customer', val: `${currentUser?.name || 'N/A'} · ${currentUser?.email || 'N/A'}` },
                                    { icon: FaBoxOpen, label: 'Product', val: selectedItem?.itemName || 'N/A' },
                                    { icon: FaBuilding, label: 'Brand', val: companyName || 'N/A' },
                                    { icon: FaCalendarAlt, label: 'Purchased', val: billData?.purchaseDate ? new Date(billData.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A' },
                                ].map(({ icon: Icon, label, val }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                            <Icon className="text-orange-500" size={12} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-gray-800 text-sm font-semibold break-all">{val}</p>
                                        </div>
                                    </div>
                                ))}

                                {billData?.billImageUrl && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bill Preview</p>
                                        {billData.billImageUrl.toLowerCase().endsWith('.pdf') ? (
                                            <a href={billData.billImageUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-orange-600 text-sm font-bold hover:underline">
                                                <ExternalLink size={13} /> View Bill PDF
                                            </a>
                                        ) : (
                                            <a href={billData.billImageUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={billData.billImageUrl} alt="Bill" className="max-h-28 rounded-xl border border-gray-100 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Service Centre Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <FaExclamationTriangle className="text-indigo-500" size={13} />
                                </div>
                                <h3 className="font-black text-gray-900 text-sm">Find a Service Centre</h3>
                            </div>
                            <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                                Use the link below to find authorised service centres for <strong className="text-gray-600">{companyName}</strong> near you. You can also visit in-person while the claim is reviewed.
                            </p>
                            <button
                                onClick={handleFindServiceCenter}
                                className="flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl font-bold text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 transition-all"
                            >
                                <ExternalLink size={14} /> Find {companyName} Service Centres
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Issue Description + Submit */}
                    <div className="space-y-5">
                        {/* Issue Description */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <MessageSquare className="text-orange-500" size={16} />
                                <h2 className="font-black text-gray-900 text-base">Describe the Issue <span className="text-red-400">*</span></h2>
                            </div>
                            <div className="p-6">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    What happened to this product? What is the issue?
                                </label>
                                <textarea
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                    rows={7}
                                    placeholder="e.g. The screen cracked after a minor fall. There are no physical signs of water damage. The product stopped turning on after 2 months of purchase..."
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all resize-none leading-relaxed"
                                />
                                <div className="flex items-center justify-between mt-2">
                                    {issueDescription.trim().length < 10 && issueDescription.length > 0 ? (
                                        <p className="flex items-center gap-1.5 text-xs text-red-500">
                                            <AlertCircle size={11} /> Please provide at least 10 characters.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400">Be as detailed as possible — this helps us process your claim faster.</p>
                                    )}
                                    <p className={`text-xs flex-shrink-0 ${issueDescription.length > 0 && issueDescription.trim().length >= 10 ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                                        {issueDescription.length} chars
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick prompts */}
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                            <p className="text-xs font-black text-orange-700 uppercase tracking-wide mb-3">💡 What to include</p>
                            <ul className="space-y-1.5 text-xs text-orange-700">
                                {[
                                    'When did the issue start?',
                                    'What were you doing when it happened?',
                                    'Any physical damage (cracks, water, burn marks)?',
                                    'Has it been repaired before?',
                                    'Any error messages or abnormal behavior?',
                                ].map(tip => (
                                    <li key={tip} className="flex items-start gap-2">
                                        <span className="text-orange-400 flex-shrink-0">•</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || issueDescription.trim().length < 10}
                            className="w-full flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl font-black text-white text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:not(:disabled):-translate-y-0.5"
                            style={{
                                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                boxShadow: '0 8px 28px -4px rgba(249,115,22,0.5)'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane size={14} /> Submit Warranty Request
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                            By submitting, you confirm the issue described is accurate and the product is within its warranty period.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WarrantySubmitPage;
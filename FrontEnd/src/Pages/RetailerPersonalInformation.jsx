// src/Pages/RetailerPersonalInformation.jsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    FaCamera, FaSave, FaSpinner, FaUser, FaEnvelope,
    FaPhone, FaMapMarkerAlt, FaStore, FaFileInvoice, FaIdCard
} from 'react-icons/fa';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { retailerApi } from '../services/api';

const RetailerPersonalInformation = () => {
    const { retailerUser, isLoading: isAuthLoading, updateUserContext } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '',
        shopName: '', shopAddress: '', gstNumber: '', panNumber: ''
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (retailerUser) {
            setFormData({
                name: retailerUser.name || '',
                email: retailerUser.email || '',
                phoneNumber: retailerUser.phoneNumber || '',
                shopName: retailerUser.shopName || '',
                shopAddress: retailerUser.address || '',
                gstNumber: retailerUser.gstNumber || '',
                panNumber: retailerUser.panNumber || '',
            });
            setProfilePicturePreview(retailerUser.profilePictureUrl || null);
            setIsDirty(false);
            setProfilePictureFile(null);
        }
    }, [retailerUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            toast.error('Invalid file type. Use JPG, PNG, WEBP or GIF.'); return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit.'); return;
        }
        setProfilePictureFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePicturePreview(reader.result);
        reader.readAsDataURL(file);
        setIsDirty(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError(null);
        if (!isDirty) { toast('No changes to save.', { icon: 'ℹ️' }); return; }
        if (!formData.name.trim()) { toast.error('Name cannot be empty.'); return; }

        setIsSubmitting(true);
        const toastId = toast.loading('Updating profile...');
        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('phoneNumber', formData.phoneNumber);
        dataToSend.append('shopName', formData.shopName);
        dataToSend.append('shopAddress', formData.shopAddress);
        if (formData.gstNumber) dataToSend.append('gstNumber', formData.gstNumber);
        if (formData.panNumber) dataToSend.append('panNumber', formData.panNumber);
        if (profilePictureFile) dataToSend.append('profilePicture', profilePictureFile);

        try {
            const response = await retailerApi.patch('/auth/profile', dataToSend);
            if (response.data.success) {
                toast.success('Profile updated!', { id: toastId });
                updateUserContext(response.data.user, 'retailer');
                setIsDirty(false);
                setProfilePictureFile(null);
            } else throw new Error(response.data?.message || 'Failed to update profile.');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
            setError(msg);
            toast.error(msg, { id: toastId });
        } finally { setIsSubmitting(false); }
    };

    const isLoading = isAuthLoading || isSubmitting;
    const initials = formData.name?.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'R';

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-60 transition-all placeholder-gray-400";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ea580c 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative max-w-3xl mx-auto px-6 py-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                        <FaStore size={10} /> Retailer Profile
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Account Settings</h1>
                    <p className="text-slate-300 text-sm">Update your personal details and shop information</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm">{error}</div>
                )}

                <div className="grid md:grid-cols-[240px_1fr] gap-6 items-start">

                    {/* ── Avatar Card ── */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
                        <div className="relative group">
                            {profilePicturePreview ? (
                                <img src={profilePicturePreview} alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover ring-4 ring-orange-100 shadow-md" />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-700 to-orange-500 flex items-center justify-center shadow-md ring-4 ring-orange-100">
                                    <span className="text-white text-3xl font-black">{initials}</span>
                                </div>
                            )}
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                <FaCamera size={22} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange}
                                className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isLoading} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900 text-sm">{formData.name || 'Your Name'}</p>
                            <p className="text-orange-500 text-xs font-semibold mt-0.5">Retailer · Partner</p>
                            <p className="text-gray-400 text-xs mt-0.5">{formData.email}</p>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                            className="w-full text-xs font-bold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 py-2 rounded-xl transition-colors">
                            Change Photo
                        </button>
                        <p className="text-[11px] text-gray-400 text-center">JPG, PNG, WEBP or GIF · Max 5MB</p>

                        <div className="w-full pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <Shield size={13} className="text-emerald-500" />
                                <span className="text-xs text-gray-500 font-medium">Account secured</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Form Card ── */}
                    <form onSubmit={handleUpdateProfile} noValidate>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

                            {/* Personal Section */}
                            <div>
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaUser className="text-orange-400" size={11} /> Personal Details
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}><FaUser className="inline mr-1.5 text-orange-400" />Full Name *</label>
                                        <input id="name" name="name" type="text" placeholder="Your full name"
                                            value={formData.name} onChange={handleChange} required disabled={isLoading} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}><FaEnvelope className="inline mr-1.5 text-gray-400" />Email Address</label>
                                        <input type="email" value={formData.email} readOnly disabled
                                            className={`${inputClass} cursor-not-allowed opacity-60`} />
                                        <p className="text-[11px] text-gray-400 mt-1.5">Email address cannot be changed.</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}><FaPhone className="inline mr-1.5 text-orange-400" />Phone Number</label>
                                        <input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+91 98765 43210"
                                            value={formData.phoneNumber} onChange={handleChange} disabled={isLoading} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Shop Section */}
                            <div>
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaStore className="text-orange-400" size={11} /> Shop Details
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}><FaStore className="inline mr-1.5 text-orange-400" />Shop Name</label>
                                        <input id="shopName" name="shopName" type="text" placeholder="e.g. Kumar General Store"
                                            value={formData.shopName} onChange={handleChange} disabled={isLoading} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}><FaMapMarkerAlt className="inline mr-1.5 text-orange-400" />Shop Address</label>
                                        <input id="shopAddress" name="shopAddress" type="text" placeholder="e.g. Plot 12, Main Market, Jaipur"
                                            value={formData.shopAddress} onChange={handleChange} disabled={isLoading} className={inputClass} />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}><FaFileInvoice className="inline mr-1.5 text-orange-400" />GST Number</label>
                                            <input id="gstNumber" name="gstNumber" type="text" placeholder="22AAAAA0000A1Z5"
                                                value={formData.gstNumber} onChange={e => { handleChange(e); setFormData(p => ({ ...p, gstNumber: e.target.value.toUpperCase() })); }}
                                                disabled={isLoading} maxLength={15} className={`${inputClass} font-mono tracking-widest`} />
                                        </div>
                                        <div>
                                            <label className={labelClass}><FaIdCard className="inline mr-1.5 text-orange-400" />PAN Number</label>
                                            <input id="panNumber" name="panNumber" type="text" placeholder="ABCDE1234F"
                                                value={formData.panNumber} onChange={e => { handleChange(e); setFormData(p => ({ ...p, panNumber: e.target.value.toUpperCase() })); }}
                                                disabled={isLoading} maxLength={10} className={`${inputClass} font-mono tracking-widest`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save */}
                            <div className="pt-2">
                                <button type="submit" disabled={isLoading || !isDirty}
                                    className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-md
                                        ${isDirty && !isLoading
                                            ? 'bg-gradient-to-r from-slate-700 to-orange-600 hover:from-slate-800 hover:to-orange-700 shadow-slate-200 hover:-translate-y-px active:translate-y-0'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                    {isLoading ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Changes</>}
                                </button>
                                {!isDirty && <p className="text-center text-xs text-gray-400 mt-2">Make a change to enable saving</p>}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RetailerPersonalInformation;

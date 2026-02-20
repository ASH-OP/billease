// src/Pages/CustomerPersonalInformation.jsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FaCamera, FaSave, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CustomerPersonalInformation = () => {
    const { customerUser: user, isLoading: isAuthLoading, updateUserContext } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', address: '' });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', email: user.email || '', phoneNumber: user.phoneNumber || '', address: user.address || '' });
            setProfilePicturePreview(user.profilePictureUrl || null);
            setIsDirty(false);
            setProfilePictureFile(null);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) { toast.error('Invalid file type. Use JPG, PNG, WEBP or GIF.'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('File size exceeds 5MB limit.'); return; }
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
        dataToSend.append('address', formData.address);
        if (profilePictureFile) dataToSend.append('profilePicture', profilePictureFile);
        try {
            const response = await api.patch('/auth/profile', dataToSend);
            if (response.data.success) {
                toast.success('Profile updated!', { id: toastId });
                updateUserContext(response.data.user);
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
    const initials = formData.name?.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-60 transition-all placeholder-gray-400";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #ea580c 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative max-w-3xl mx-auto px-6 py-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                        <FaUser size={10} /> My Profile
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Personal Information</h1>
                    <p className="text-indigo-200 text-sm">Update your profile details and avatar</p>
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
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-indigo-600 flex items-center justify-center shadow-md ring-4 ring-orange-100">
                                    <span className="text-white text-3xl font-black">{initials}</span>
                                </div>
                            )}
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                <FaCamera size={22} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"
                                accept="image/jpeg,image/png,image/webp,image/gif" disabled={isLoading} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900 text-sm">{formData.name || 'Your Name'}</p>
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
                            <h2 className="text-lg font-black text-gray-900 mb-1">Edit Details</h2>

                            <div>
                                <label className={labelClass}><FaUser className="inline mr-1.5 text-orange-400" />Full Name *</label>
                                <input id="name" name="name" type="text" placeholder="Your full name"
                                    value={formData.name} onChange={handleChange} required disabled={isLoading} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}><FaEnvelope className="inline mr-1.5 text-gray-400" />Email Address</label>
                                <input id="email" name="email" type="email" value={formData.email}
                                    readOnly disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
                                <p className="text-[11px] text-gray-400 mt-1.5">Email address cannot be changed.</p>
                            </div>

                            <div>
                                <label className={labelClass}><FaPhone className="inline mr-1.5 text-orange-400" />Phone Number</label>
                                <input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+91 98765 43210"
                                    value={formData.phoneNumber} onChange={handleChange} disabled={isLoading} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}><FaMapMarkerAlt className="inline mr-1.5 text-orange-400" />Address</label>
                                <textarea id="address" name="address" placeholder="Your address (optional)"
                                    value={formData.address} onChange={handleChange} disabled={isLoading}
                                    rows={3} className={`${inputClass} resize-none`} />
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={isLoading || !isDirty}
                                    className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-md
                                        ${isDirty && !isLoading
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200 hover:-translate-y-px active:translate-y-0'
                                            : 'bg-gray-300 cursor-not-allowed'}`}>
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

export default CustomerPersonalInformation;
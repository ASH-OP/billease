// src/Pages/Contact.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tel, setTel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const BACKEND_URL = `${process.env.REACT_APP_BASE_URL}/addContact`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Please provide your full name'); return; }
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { toast.error('Please provide a valid email address'); return; }
        if (!tel || !/^\d{10}$/.test(tel)) { toast.error('Please provide a valid 10-digit phone number'); return; }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting your request...');
        const formattedPhoneNumber = `+91${tel}`;

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), phoneNumber: formattedPhoneNumber })
            });
            const data = await response.json();
            if (response.ok) {
                setName(''); setEmail(''); setTel('');
                toast.success(data.message || 'Thanks for reaching out! We will contact you soon.', { id: toastId });
            } else {
                toast.error(data.message || `Error: ${response.status}`, { id: toastId });
            }
        } catch (error) {
            toast.error('Failed to submit form. Please check your connection.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClass = "w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors text-sm placeholder-gray-400 bg-gray-50 disabled:opacity-60";
    const iconWrapperClass = "absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400";
    const infoItemClass = "flex items-start gap-4";

    return (
        <div className="min-h-screen w-full overflow-x-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 relative">

            {/* Static decorative blobs — painted once, no animation */}
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-orange-200/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-orange-300/20 translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                        Contact <span className="text-orange-500">Us</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
                        Have questions or want to collaborate? We'd love to hear from you!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">

                    {/* Contact Info */}
                    <div className="space-y-8 flex flex-col justify-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Get in touch directly</h2>
                            <p className="text-gray-500 text-sm">Find our location, phone number, and email below.</p>
                        </div>

                        <div className={infoItemClass}>
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <FaMapMarkerAlt className="text-orange-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">BillEase Headquarters</p>
                                <p className="text-gray-500 text-sm">123 Innovation Drive, Suite 456<br />Tech City, ST 78910</p>
                            </div>
                        </div>

                        <div className={infoItemClass}>
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <FaPhoneAlt className="text-orange-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Phone</p>
                                <p className="text-gray-500 text-sm">+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div className={infoItemClass}>
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <FaEnvelope className="text-orange-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Email</p>
                                <a href="mailto:support@billease.com" className="text-orange-500 text-sm hover:text-orange-600 transition-colors">
                                    support@billease.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Send us a message</h2>
                            <p className="text-gray-500 text-sm mb-5">We'll get back to you within 24 hours.</p>
                        </div>

                        <div className="relative">
                            <div className={iconWrapperClass}><FaUser /></div>
                            <input type="text" placeholder="Full Name" value={name}
                                onChange={e => setName(e.target.value)}
                                className={`${inputBaseClass} pl-12`} required disabled={isSubmitting} />
                        </div>

                        <div className="relative">
                            <div className={iconWrapperClass}><FaEnvelope /></div>
                            <input type="email" placeholder="Email Address" value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={`${inputBaseClass} pl-12`} required disabled={isSubmitting} />
                        </div>

                        <div className="relative">
                            <div className={iconWrapperClass}>
                                <span className="text-sm font-medium text-gray-500">+91</span>
                            </div>
                            <input type="tel" maxLength={10} value={tel}
                                onChange={e => setTel(e.target.value.replace(/\D/g, ''))}
                                placeholder="Phone Number (10 digits)"
                                className={`${inputBaseClass} pl-14`} required disabled={isSubmitting} />
                        </div>

                        <button type="submit" disabled={isSubmitting}
                            className={`w-full py-3.5 px-6 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-100 transition-all text-sm ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-px active:translate-y-0'}`}>
                            {isSubmitting
                                ? <span className="flex items-center justify-center gap-2"><FaSpinner className="animate-spin" /> Submitting...</span>
                                : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
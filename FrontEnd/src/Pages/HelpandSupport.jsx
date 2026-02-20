// src/Pages/HelpandSupport.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaChevronDown, FaPaperPlane } from 'react-icons/fa';
import { MessageCircle, HelpCircle, Mail, Phone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const faqs = [
    { question: 'What is BillEase?', answer: 'BillEase is a digital bill management platform that helps customers store receipts, track warranties, and lets retailers send paperless invoices — all in one place.' },
    { question: 'How do I register?', answer: 'Click "Get Started" on the homepage or visit the Register page. Fill in your name, email, and password to create a free account in under a minute.' },
    { question: 'Is my data secure?', answer: 'Yes. All data is encrypted in transit and at rest. We follow industry-standard security practices to keep your bills and personal info safe.' },
    { question: 'How can I contact support?', answer: 'Use the AI chatbot on this page for instant answers, or visit the Contact Us page to send a message to our team.' },
    { question: 'How do I reset my password?', answer: 'On the login page, click "Forgot Password" and enter your email. You\'ll receive a reset link within a few minutes.' },
    { question: 'Can I track my spending?', answer: 'Yes! Your dashboard shows all your bills organized by date, store, and amount. Retailer-issued bills also display itemized amounts.' },
    { question: 'How do I claim a warranty?', answer: 'Open any store bill, find the item with an active warranty, and click "Claim Warranty". Fill in the claim form and submit it directly to the retailer.' },
    { question: 'How do I update my personal information?', answer: 'Log in as a customer and visit My Profile > Personal Information to update your name, phone, or address.' },
];

const HelpandSupport = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: 'Hi there! 👋 I\'m the BillEase assistant. How can I help you today?' }
    ]);
    const [userMessage, setUserMessage] = useState('');
    const [isBotReplying, setIsBotReplying] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const chatboxRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (chatboxRef.current) chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }, [chatMessages]);

    const handleSendMessage = async () => {
        const trimmed = userMessage.trim();
        if (!trimmed || isBotReplying) return;
        setChatMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
        setUserMessage('');
        setIsBotReplying(true);
        try {
            const response = await api.post('/chatbot/query', { message: trimmed });
            if (response.data.success) {
                setChatMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
            } else throw new Error(response.data.message || 'Chatbot service failed.');
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Sorry, I couldn't connect right now.";
            setChatMessages(prev => [...prev, { sender: 'bot', text: `Error: ${msg}` }]);
            toast.error('Chatbot error. Please try again later.');
        } finally { setIsBotReplying(false); }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    return (
        <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

            {/* ── HERO ── */}
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #ea580c 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                        <HelpCircle size={13} /> Help & Support
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">How can we help?</h1>
                    <p className="text-indigo-200 max-w-xl mx-auto">Find answers in our FAQ or chat with our AI assistant instantly.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-14">

                {/* ── FAQ ── */}
                <div className="mb-14">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-7 bg-gradient-to-b from-orange-500 to-indigo-600 rounded-full" />
                        <h2 className="text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-800 font-semibold hover:text-orange-600 transition-colors group"
                                >
                                    <span className="text-sm sm:text-base">{faq.question}</span>
                                    <FaChevronDown
                                        className={`flex-shrink-0 ml-4 text-gray-400 group-hover:text-orange-500 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                                        size={14}
                                    />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 pt-1">
                                        <div className="h-px bg-gray-100 mb-4" />
                                        <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── STILL NEED HELP ── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="text-orange-500" size={22} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Still need help?</h3>
                    <p className="text-gray-500 text-sm mb-6">Chat with our AI assistant or reach out to our support team.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button
                            onClick={() => setChatOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-px transition-all text-sm"
                        >
                            <FaRobot /> Chat with AI
                        </button>
                        <a href="/contact" className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all text-sm">
                            <Mail size={15} /> Contact Us
                        </a>
                    </div>
                </div>
            </div>

            {/* ── FLOATING CHAT FAB ── */}
            {!chatOpen && (
                <button
                    onClick={() => setChatOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-xl shadow-orange-300/40 hover:shadow-orange-400/50 flex items-center justify-center hover:-translate-y-1 transition-all z-40"
                    aria-label="Open Chatbot"
                >
                    <FaRobot className="text-xl" />
                </button>
            )}

            {/* ── CHAT MODAL ── */}
            {chatOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center sm:justify-end z-50 p-4 sm:p-6">
                    <div className="bg-white w-full max-w-sm sm:max-h-[580px] h-[75vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <FaRobot size={14} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">BillEase Assistant</p>
                                    <p className="text-orange-200 text-[10px]">AI-powered support</p>
                                </div>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white p-1" aria-label="Close">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={chatboxRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                        ${msg.sender === 'user'
                                            ? 'bg-orange-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isBotReplying && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                                        {[0, 150, 300].map(d => (
                                            <span key={d} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="flex-shrink-0 border-t border-gray-100 p-3 bg-white">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent transition-all">
                                <input
                                    type="text"
                                    value={userMessage}
                                    onChange={e => setUserMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask something..."
                                    className="flex-1 py-3 bg-transparent border-none focus:outline-none text-sm"
                                    disabled={isBotReplying}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isBotReplying || !userMessage.trim()}
                                    className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg disabled:opacity-40 hover:bg-orange-600 transition-colors flex-shrink-0"
                                >
                                    <FaPaperPlane size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpandSupport;
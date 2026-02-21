// src/Pages/LandingPage.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaReceipt, FaStore, FaUser, FaShieldAlt, FaLeaf, FaMobileAlt,
    FaChartLine, FaRocket, FaHandshake, FaBolt, FaCheckCircle,
    FaGithub, FaTwitter, FaLinkedin
} from 'react-icons/fa';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

/* ─────────────────────────────── HOOKS ─────────────────────────────── */

// Scroll-triggered reveal
function useScrollReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

// Parallax scroll
function useParallax(speed = 0.15) {
    const ref = useRef(null);
    useEffect(() => {
        const handler = () => {
            if (!ref.current) return;
            const y = window.scrollY * speed;
            ref.current.style.transform = `translateY(${y}px)`;
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, [speed]);
    return ref;
}

/* ─────────────────────────────── DATA ─────────────────────────────── */


const customerFeatures = [
    {
        icon: FaReceipt, title: 'Digital Receipt Vault',
        desc: 'Never lose a receipt again. All your bills are stored safely in the cloud, accessible from any device.',
        gradient: 'from-orange-500/20 to-amber-500/5',
        iconBg: 'linear-gradient(135deg, #f97316, #f59e0b)',
        iconShadow: 'rgba(249,115,22,0.5)',
        border: 'border-orange-500/20',
        hover: 'hover:border-orange-400/50',
        glow: 'rgba(249,115,22,0.08)',
        tag: 'text-orange-400',
    },
    {
        icon: FaShieldAlt, title: 'Warranty Tracker',
        desc: 'Track every warranty expiry date. Get alerts before they expire and claim in a single click.',
        gradient: 'from-rose-500/20 to-pink-500/5',
        iconBg: 'linear-gradient(135deg, #f43f5e, #ec4899)',
        iconShadow: 'rgba(244,63,94,0.5)',
        border: 'border-rose-500/20',
        hover: 'hover:border-rose-400/50',
        glow: 'rgba(244,63,94,0.08)',
        tag: 'text-rose-400',
    },
    {
        icon: FaMobileAlt, title: 'Access Anywhere',
        desc: 'Your purchase history is available 24/7 on any phone, tablet, or computer.',
        gradient: 'from-amber-500/20 to-yellow-500/5',
        iconBg: 'linear-gradient(135deg, #f59e0b, #eab308)',
        iconShadow: 'rgba(245,158,11,0.5)',
        border: 'border-amber-500/20',
        hover: 'hover:border-amber-400/50',
        glow: 'rgba(245,158,11,0.08)',
        tag: 'text-amber-400',
    },
    {
        icon: FaChartLine, title: 'Spending Insights',
        desc: 'Visualize your purchase patterns, see top categories and track monthly spending trends.',
        gradient: 'from-violet-500/20 to-purple-500/5',
        iconBg: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
        iconShadow: 'rgba(139,92,246,0.5)',
        border: 'border-violet-500/20',
        hover: 'hover:border-violet-400/50',
        glow: 'rgba(139,92,246,0.08)',
        tag: 'text-violet-400',
    },
];

const retailerFeatures = [
    {
        icon: FaRocket, title: 'Instant Invoicing',
        desc: 'Create and send digital invoices in seconds. No paper, no printer needed.',
        gradient: 'from-indigo-500/20 to-blue-500/5',
        iconBg: 'linear-gradient(135deg, #6366f1, #3b82f6)',
        iconShadow: 'rgba(99,102,241,0.5)',
        border: 'border-indigo-500/20',
        hover: 'hover:border-indigo-400/50',
        glow: 'rgba(99,102,241,0.08)',
        tag: 'text-indigo-400',
    },
    {
        icon: FaHandshake, title: 'Customer Loyalty',
        desc: 'Modern digital billing strengthens your relationship with customers and builds trust.',
        gradient: 'from-cyan-500/20 to-sky-500/5',
        iconBg: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
        iconShadow: 'rgba(6,182,212,0.5)',
        border: 'border-cyan-500/20',
        hover: 'hover:border-cyan-400/50',
        glow: 'rgba(6,182,212,0.08)',
        tag: 'text-cyan-400',
    },
    {
        icon: FaLeaf, title: 'Go Paperless',
        desc: 'Reduce paper costs and your carbon footprint. Every digital bill saves a tree.',
        gradient: 'from-emerald-500/20 to-green-500/5',
        iconBg: 'linear-gradient(135deg, #10b981, #22c55e)',
        iconShadow: 'rgba(16,185,129,0.5)',
        border: 'border-emerald-500/20',
        hover: 'hover:border-emerald-400/50',
        glow: 'rgba(16,185,129,0.08)',
        tag: 'text-emerald-400',
    },
    {
        icon: FaChartLine, title: 'Revenue Analytics',
        desc: 'Track sales performance, top selling items, and customer spending patterns in real-time.',
        gradient: 'from-sky-500/20 to-blue-600/5',
        iconBg: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
        iconShadow: 'rgba(14,165,233,0.5)',
        border: 'border-sky-500/20',
        hover: 'hover:border-sky-400/50',
        glow: 'rgba(14,165,233,0.08)',
        tag: 'text-sky-400',
    },
];

const steps = [
    { n: '01', title: 'Sign Up Free', desc: 'Create your account in under 60 seconds — no credit card required.' },
    { n: '02', title: 'Connect or Create', desc: 'Customers receive bills from stores. Retailers create invoices for customers.' },
    { n: '03', title: 'Track Everything', desc: 'View history, manage warranties, claim support — all from one dashboard.' },
];

/* ─────────────────────────────── SUB-COMPONENTS ─────────────────────────────── */

// Animated floating orb
const Orb = ({ style, className }) => (
    <div className={`absolute rounded-full pointer-events-none ${className}`} style={style} />
);

// Section reveal wrapper
const Reveal = ({ children, delay = 0, className = '', from = 'bottom' }) => {
    const [ref, visible] = useScrollReveal();
    const fromMap = {
        bottom: 'translate(0, 60px)',
        left: 'translate(-60px, 0)',
        right: 'translate(60px, 0)',
        scale: 'scale(0.85)',
    };
    return (
        <div ref={ref} className={className} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : fromMap[from] || fromMap.bottom,
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        }}>
            {children}
        </div>
    );
};

// Feature card with 3D tilt + per-card color identity
const FeatureCard = ({ icon: Icon, title, desc, gradient, iconBg, iconShadow, border, hover, glow, tag, delay }) => {
    const cardRef = useRef(null);
    const handleMove = useCallback((e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.04)`;
    }, []);
    const handleLeave = useCallback(() => {
        if (cardRef.current) cardRef.current.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
    }, []);
    return (
        <Reveal delay={delay} from="bottom" className="h-full">
            <div
                ref={cardRef}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                className={`group h-full relative overflow-hidden rounded-2xl border ${border} ${hover} p-5 flex flex-col gap-4 cursor-default bg-gradient-to-br ${gradient} backdrop-blur-sm transition-all duration-300`}
                style={{
                    transition: 'transform 0.15s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                    willChange: 'transform',
                    background: `linear-gradient(135deg, ${glow} 0%, rgba(10,10,20,0.7) 100%)`,
                }}
            >
                {/* Subtle inner glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${glow}` }} />

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg, boxShadow: `0 4px 16px -4px ${iconShadow}` }}>
                    <Icon size={17} className="text-white" />
                </div>

                {/* Text */}
                <div>
                    <h3 className={`font-black text-white text-sm mb-1.5 group-hover:${tag} transition-colors`}>{title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                </div>

                {/* Corner accent */}
                <div className="absolute -bottom-5 -right-5 w-16 h-16 rounded-full opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${iconShadow.replace('0.5', '1')} 0%, transparent 70%)` }} />
            </div>
        </Reveal>
    );
};

/* ─────────────────────────────── MAIN PAGE ─────────────────────────────── */

export default function LandingPage() {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const parallaxSlowRef = useParallax(0.08);
    const parallaxFastRef = useParallax(0.2);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

    // Hero mouse parallax for 3D orbs
    useEffect(() => {
        const handler = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        window.addEventListener('mousemove', handler, { passive: true });
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="bg-[#05050f] text-white overflow-x-hidden font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ══════════════════════════════════════════════════════
                HERO SECTION
            ══════════════════════════════════════════════════════ */}
            <section
                ref={heroRef}
                id="hero"
                className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
            >
                {/* ── 3D Background orbs ── */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Primary large orbs - mouse-reactive */}
                    <div
                        ref={parallaxSlowRef}
                        className="absolute inset-0"
                        style={{ transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -20}px)` }}
                    >
                        <Orb className="w-[600px] h-[600px] -top-40 -left-40 opacity-20"
                            style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)' }} />
                        <Orb className="w-[500px] h-[500px] -bottom-20 -right-20 opacity-15"
                            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(80px)' }} />
                        <Orb className="w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
                            style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', filter: 'blur(100px)' }} />
                    </div>

                    {/* Secondary orbs - different parallax speed */}
                    <div
                        ref={parallaxFastRef}
                        className="absolute inset-0"
                        style={{ transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 15}px)` }}
                    >
                        <Orb className="w-48 h-48 top-1/4 right-1/4 opacity-30 animate-pulse"
                            style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', animationDuration: '4s' }} />
                        <Orb className="w-32 h-32 bottom-1/3 left-1/4 opacity-25 animate-pulse"
                            style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', animationDuration: '6s', animationDelay: '1s' }} />
                    </div>

                    {/* Grid dot pattern */}
                    <div className="absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                    {/* Vignette */}
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #05050f 100%)' }} />
                </div>

                {/* ── Hero Content ── */}
                <div className="relative z-10 max-w-4xl mx-auto text-center">

                    {/* ── Brand Logo + Name ── */}
                    <div className="flex items-center justify-center gap-4 mb-10"
                        style={{ animation: 'fadeSlideDown 0.7s ease both 0s' }}>
                        <img
                            src="/logo-orange.png"
                            alt="BillEase"
                            style={{
                                height: '72px',
                                filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.55)) drop-shadow(0 0 40px rgba(249,115,22,0.25))',
                                animation: 'floatLogo 4s ease-in-out infinite',
                            }}
                        />
                        <div className="text-left">
                            <span style={{
                                fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                                fontWeight: 900,
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                                background: 'linear-gradient(135deg, #ffffff 0%, #fb923c 60%, #f97316 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                display: 'block',
                            }}>
                                BillEase
                            </span>
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'rgba(251,146,60,0.7)',
                                display: 'block',
                                marginTop: '2px',
                            }}>
                                Digital Bill Platform
                            </span>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
                        style={{ animation: 'fadeSlideDown 0.8s ease both 0.2s' }}>
                        <Sparkles size={12} /> Digital Bill Management Platform
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6"
                        style={{ animation: 'fadeSlideDown 0.8s ease both 0.4s' }}>
                        <span className="text-white">Redefining</span>
                        <br />
                        <span style={{ background: 'linear-gradient(90deg, #f97316, #fb923c, #f43f5e, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Billing
                        </span>
                        <span className="text-white">, One</span>
                        <br />
                        <span className="text-white">Invoice at a Time</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
                        style={{ animation: 'fadeSlideDown 0.8s ease both 0.6s' }}>
                        BillEase bridges customers and retailers with instant, paperless, and secure digital invoicing — store receipts, track warranties, and grow your business.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center"
                        style={{ animation: 'fadeSlideDown 0.8s ease both 0.8s' }}>
                        <button onClick={() => scrollToSection('who-are-you')}
                            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
                            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 30px -4px rgba(249,115,22,0.5)' }}>
                            Get Started Free
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => scrollToSection('features')}
                            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm">
                            See How It Works
                        </button>
                    </div>

                </div>
            </section>


            {/* ══════════════════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════════════════ */}
            <section id="features" className="py-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />

                <div className="max-w-5xl mx-auto">
                    <Reveal className="text-center mb-16">
                        <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                            <Zap size={11} /> How It Works
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Simple. Fast. Secure.</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Get started in minutes. No complicated setup.</p>
                    </Reveal>

                    <div className="grid md:grid-cols-3 gap-6">
                        {steps.map((s, i) => (
                            <Reveal key={s.n} delay={i * 120} from="bottom">
                                <div className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm group hover:border-orange-500/30 transition-colors duration-300">
                                    <span className="absolute -top-4 left-6 text-5xl font-black opacity-10 text-orange-500 select-none">{s.n}</span>
                                    <div className="mt-4">
                                        <h3 className="font-black text-white text-lg mb-2 group-hover:text-orange-400 transition-colors">{s.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="hidden md:block absolute top-1/2 -right-3 text-gray-700">
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                FOR CUSTOMERS
            ══════════════════════════════════════════════════════ */}
            <section id="customers" className="py-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />

                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                        <Reveal from="left">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                                    <FaUser size={10} /> For Customers
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                                    Your bills.<br />
                                    <span className="text-orange-400">Always with you.</span>
                                </h2>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    BillEase gives you a beautiful, organized vault for every receipt. Track warranties, get expiry alerts, and claim support — all from your phone.
                                </p>
                                <ul className="space-y-3">
                                    {['Never lose a receipt', 'Auto warranty tracker', 'One-click warranty claims', 'Spending analytics'].map(t => (
                                        <li key={t} className="flex items-center gap-3 text-gray-300 text-sm">
                                            <FaCheckCircle className="text-orange-500 flex-shrink-0" size={14} />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/CustomerRegister')}
                                    className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px -4px rgba(249,115,22,0.5)' }}>
                                    Create Free Account <ArrowRight size={14} />
                                </button>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-2 gap-4">
                            {customerFeatures.map((f, i) => (
                                <FeatureCard key={f.title} {...f} delay={i * 80} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                FOR RETAILERS
            ══════════════════════════════════════════════════════ */}
            <section id="retailers" className="py-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />

                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Feature grid first on mobile, second on desktop */}
                        <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
                            {retailerFeatures.map((f, i) => (
                                <FeatureCard key={f.title} {...f} delay={i * 80} />
                            ))}
                        </div>

                        <Reveal from="right" className="order-1 lg:order-2">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                                    <FaStore size={10} /> For Retailers
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                                    Modern billing<br />
                                    <span className="text-indigo-400">for modern stores.</span>
                                </h2>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    Ditch paper and delight customers with instant digital invoices. Build loyalty, reduce costs, and get powerful analytics on your sales.
                                </p>
                                <ul className="space-y-3">
                                    {['Instant digital invoices', 'Customer engagement tools', 'Zero paper cost', 'Sales analytics dashboard'].map(t => (
                                        <li key={t} className="flex items-center gap-3 text-gray-300 text-sm">
                                            <FaCheckCircle className="text-indigo-400 flex-shrink-0" size={14} />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/RegisterRetailer')}
                                    className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 20px -4px rgba(99,102,241,0.5)' }}>
                                    Register Your Store <ArrowRight size={14} />
                                </button>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                WHO ARE YOU — ROLE PICKER
            ══════════════════════════════════════════════════════ */}
            <section id="who-are-you" className="py-24 px-4 sm:px-6 relative overflow-hidden">
                {/* Big glow behind the section */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20"
                        style={{ background: 'radial-gradient(ellipse, #f97316 0%, #6366f1 50%, transparent 70%)', filter: 'blur(80px)' }} />
                </div>

                <div className="relative max-w-4xl mx-auto">
                    <Reveal className="text-center mb-14">
                        <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                            <FaBolt className="text-yellow-400" size={10} /> Get Started
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                            Who are <span className="text-orange-400">you?</span>
                        </h2>
                        <p className="text-gray-400 text-lg">Choose your role to continue</p>
                    </Reveal>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer Card */}
                        <Reveal delay={0} from="left">
                            <div
                                className="group relative overflow-hidden rounded-3xl border border-white/10 cursor-pointer
                                    hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(17,17,34,0.8) 100%)', backdropFilter: 'blur(20px)' }}
                                onClick={() => navigate('/customerLogin')}
                            >
                                {/* Glowing inner border on hover */}
                                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{ boxShadow: 'inset 0 0 60px rgba(249,115,22,0.1)' }} />

                                <div className="p-8">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl"
                                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px -4px rgba(249,115,22,0.6)' }}>
                                        <FaUser className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">I'm a Customer</h3>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                        Manage receipts, track warranties, and view your full purchase history — all in one place.
                                    </p>
                                    <ul className="space-y-2 mb-8">
                                        {['Store digital receipts', 'Warranty expiry alerts', 'One-click claim filing'].map(t => (
                                            <li key={t} className="flex items-center gap-2 text-gray-400 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex items-center gap-2 text-orange-400 font-bold text-sm group-hover:gap-3 transition-all">
                                        Login as Customer <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Decorative corner */}
                                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20"
                                    style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
                            </div>
                        </Reveal>

                        {/* Retailer Card */}
                        <Reveal delay={120} from="right">
                            <div
                                className="group relative overflow-hidden rounded-3xl border border-white/10 cursor-pointer
                                    hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(17,17,34,0.8) 100%)', backdropFilter: 'blur(20px)' }}
                                onClick={() => navigate('/retailerLogin')}
                            >
                                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{ boxShadow: 'inset 0 0 60px rgba(99,102,241,0.1)' }} />

                                <div className="p-8">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 20px -4px rgba(99,102,241,0.6)' }}>
                                        <FaStore className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">I'm a Retailer</h3>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                        Create and send digital invoices to customers, track sales, and build loyalty — paperlessly.
                                    </p>
                                    <ul className="space-y-2 mb-8">
                                        {['Instant digital invoices', 'Analytics dashboard', 'Customer engagement'].map(t => (
                                            <li key={t} className="flex items-center gap-2 text-gray-400 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:gap-3 transition-all">
                                        Login as Retailer <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20"
                                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                            </div>
                        </Reveal>
                    </div>

                    {/* New user CTA */}
                    <Reveal delay={200} className="text-center mt-8">
                        <p className="text-gray-500 text-sm">
                            New here?{' '}
                            <button onClick={() => navigate('/CustomerRegister')} className="text-orange-400 font-bold hover:text-orange-300 hover:underline transition-colors">
                                Create a free customer account
                            </button>
                            {' '}or{' '}
                            <button onClick={() => navigate('/RegisterRetailer')} className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-colors">
                                Register your store
                            </button>
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════════════════ */}
            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                            <FaReceipt className="text-white text-xs" />
                        </div>
                        <span className="font-black text-white text-lg">Bill<span className="text-orange-400">Ease</span></span>
                    </div>
                    <p className="text-gray-600 text-sm">© 2025 BillEase. All rights reserved.</p>
                    <div className="flex gap-3">
                        {[
                            { icon: FaGithub, href: 'https://github.com/sahib-singh13' },
                            { icon: FaTwitter, href: 'https://twitter.com' },
                            { icon: FaLinkedin, href: 'https://linkedin.com' },
                        ].map(({ icon: Icon, href }) => (
                            <a key={href} href={href} target="_blank" rel="noreferrer"
                                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-orange-500 transition-all duration-200">
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* ── Global keyframe animations ── */}
            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatLogo {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-8px); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50%       { transform: translateX(-50%) translateY(6px); }
                }
                html { scroll-behavior: smooth; }
                * { -webkit-font-smoothing: antialiased; }
            `}</style>
        </div>
    );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PrivacyPolicy from '../Pages/PrivacyPolicy';
import TermsAndConditions from '../Pages/TermsAndConditions';

const SocialIconLink = ({ href, srText, children }) => (
    <a href={href} target="_blank" rel="noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-orange-200 hover:bg-orange-500 hover:text-white transition-all duration-200 hover:scale-110 border border-white/10">
        {children}
        <span className="sr-only">{srText}</span>
    </a>
);

export default function Footer() {
    const [isOpenPrivacyPolicy, setIsOpenPrivacyPolicy] = useState(false);
    const [isOpenTermsConditions, setIsOpenTermsConditions] = useState(false);

    return (
        <footer className="relative bg-gray-900 text-gray-300 mt-16 overflow-hidden">
            {/* Modals */}
            {isOpenPrivacyPolicy && <PrivacyPolicy onClose={() => setIsOpenPrivacyPolicy(false)} />}
            {isOpenTermsConditions && <TermsAndConditions onClose={() => setIsOpenTermsConditions(false)} />}

            {/* Decorative BG */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-orange-600/5 blur-3xl" />
            </div>

            {/* Orange top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" />

            <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 pt-14 pb-8">
                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2.5 group mb-4">
                            <img src="/logo-orange.png" className="h-10 transition-transform duration-300 group-hover:scale-105" alt="BillEase" />
                            <span className="text-xl font-black text-white tracking-tight">
                                Bill<span className="text-orange-400">Ease</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your all-in-one digital bill management platform. Store, track, and claim warranties with ease.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-2 mt-6">
                            <SocialIconLink href="https://github.com/sahib-singh13" srText="GitHub">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd" />
                                </svg>
                            </SocialIconLink>
                            <SocialIconLink href="https://twitter.com" srText="Twitter">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 17">
                                    <path fillRule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clipRule="evenodd" />
                                </svg>
                            </SocialIconLink>
                            <SocialIconLink href="https://linkedin.com" srText="LinkedIn">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </SocialIconLink>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Resources</h3>
                        <ul className="space-y-3">
                            {[['/', 'Home'], ['/about', 'About Us'], ['/customerDashboard', 'Dashboard'], ['/contact', 'Contact']].map(([to, label]) => (
                                <li key={to}>
                                    <Link to={to}
                                        className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-1.5 group">
                                        <span className="w-0 group-hover:w-3 h-px bg-orange-400 transition-all duration-200 inline-block" />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <button onClick={() => setIsOpenPrivacyPolicy(true)}
                                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-1.5 group text-left">
                                    <span className="w-0 group-hover:w-3 h-px bg-orange-400 transition-all duration-200 inline-block" />
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setIsOpenTermsConditions(true)}
                                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center gap-1.5 group text-left">
                                    <span className="w-0 group-hover:w-3 h-px bg-orange-400 transition-all duration-200 inline-block" />
                                    Terms &amp; Conditions
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter/CTA */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Get the App</h3>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            Manage all your bills digitally. Sign up today and go paperless.
                        </p>
                        <Link to="/CustomerRegister"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-900/30 transition-all hover:-translate-y-px">
                            Create Free Account →
                        </Link>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()}{' '}
                        <Link to="/" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">BillEase™</Link>
                        . All Rights Reserved.
                    </p>
                    <p className="text-xs text-gray-600">Made with ❤️ for smarter bill management</p>
                </div>
            </div>
        </footer>
    );
}
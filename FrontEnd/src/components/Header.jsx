// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Header() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 50);
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
    }, []);

    return (
        <>
            <style>{`
                .nh-pill {
                    position: fixed;
                    top: 14px;
                    left: 0; right: 0;
                    z-index: 1000;
                    margin: 0 auto;
                    width: 94%;
                    max-width: 1200px;
                    border-radius: 999px;
                    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
                    opacity: 0;
                    transform: translateY(-10px);
                }
                .nh-pill.loaded { opacity: 1; transform: translateY(0); }

                /* DEFAULT — matches CustomerPage left hero panel: indigo → orange */
                .nh-pill.unscrolled {
                    background: linear-gradient(145deg,
                        rgba(30, 27, 75, 0.90) 0%,
                        rgba(49, 46, 129, 0.88) 50%,
                        rgba(234, 88, 12, 0.85) 100%
                    );
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    box-shadow: 0 4px 24px rgba(30,27,75,0.3), 0 0 0 1px rgba(99,80,255,0.2);
                }
                /* SCROLLED — lighter warm gradient */
                .nh-pill.scrolled {
                    background: linear-gradient(120deg,
                        rgba(255,255,255,0.95) 0%,
                        rgba(255,237,213,0.93) 50%,
                        rgba(255,255,255,0.95) 100%
                    );
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px rgba(249,115,22,0.13), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(249,115,22,0.16);
                }

                .nh-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 22px;
                }

                /* Logo */
                .nh-logo {
                    display: flex; align-items: center; gap: 10px;
                    text-decoration: none; flex-shrink: 0;
                    transition: transform 0.3s ease;
                }
                .nh-logo:hover { transform: scale(1.03); }
                .nh-logo img { height: 40px; }
                .nh-logo-text { font-size: 1.3rem; font-weight: 900; letter-spacing: -0.03em; }
                /* Default (dark bg) logo colour */
                .nh-pill.unscrolled .nh-logo-text { color: #f5f0ea; }
                /* Scrolled (light bg) logo colour */
                .nh-pill.scrolled .nh-logo-text { color: #1e1e2e; }
                .nh-logo-text span {
                    background: linear-gradient(135deg, #fb923c, #f97316);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Nav links */
                .nh-links {
                    display: flex; align-items: center; gap: 2px;
                    list-style: none; margin: 0; padding: 0;
                }
                /* Default state link colours (indigo bg) */
                .nh-pill.unscrolled .nh-links li a {
                    color: rgba(225, 220, 255, 0.88);
                }
                .nh-pill.unscrolled .nh-links li a:hover {
                    color: #fff;
                    background: rgba(99, 80, 200, 0.28);
                }
                .nh-pill.unscrolled .nh-links li a.nh-active {
                    color: #fb923c;
                    background: rgba(234, 88, 12, 0.22);
                    font-weight: 700;
                }
                /* Scrolled state link colours (light bg) */
                .nh-pill.scrolled .nh-links li a {
                    color: #4b5563;
                }
                .nh-pill.scrolled .nh-links li a:hover {
                    color: #ea580c;
                    background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.08));
                }
                .nh-pill.scrolled .nh-links li a.nh-active {
                    color: #ea580c;
                    background: linear-gradient(135deg, rgba(249,115,22,0.14), rgba(251,146,60,0.1));
                    font-weight: 700;
                }
                .nh-links li a {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 0.83rem; font-weight: 600;
                    text-decoration: none; padding: 7px 15px;
                    border-radius: 999px; transition: all 0.2s ease;
                }

                /* CTA buttons */
                .nh-cta { display: flex; align-items: center; gap: 8px; }
                /* Login — default (indigo bg) */
                .nh-pill.unscrolled .nh-btn-login {
                    color: rgba(220, 215, 255, 0.92);
                    border-color: rgba(148, 130, 255, 0.4);
                    background: rgba(99, 80, 200, 0.18);
                }
                .nh-pill.unscrolled .nh-btn-login:hover {
                    background: rgba(99, 80, 200, 0.32);
                    border-color: rgba(148, 130, 255, 0.65);
                    color: #fff;
                }
                /* Login — scrolled */
                .nh-pill.scrolled .nh-btn-login {
                    color: #ea580c;
                    border-color: rgba(249,115,22,0.35);
                    background: transparent;
                }
                .nh-pill.scrolled .nh-btn-login:hover {
                    background: rgba(249,115,22,0.08);
                    border-color: rgba(249,115,22,0.6);
                }
                .nh-btn-login {
                    font-size: 0.83rem; font-weight: 600;
                    text-decoration: none; padding: 8px 18px;
                    border-radius: 999px; border: 1.5px solid;
                    transition: all 0.2s ease;
                }
                .nh-btn-start {
                    font-size: 0.83rem; font-weight: 700; color: #fff;
                    text-decoration: none; padding: 9px 22px;
                    border-radius: 999px;
                    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                    box-shadow: 0 4px 14px rgba(249,115,22,0.4);
                    transition: all 0.25s ease;
                }
                .nh-btn-start:hover {
                    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
                    box-shadow: 0 6px 20px rgba(249,115,22,0.5);
                    transform: translateY(-1px);
                }
                .nh-btn-start:active { transform: translateY(0); }

                /* Mobile */
                .nh-mob-toggle {
                    display: none;
                    background: rgba(249,115,22,0.15);
                    border: 1.5px solid rgba(249,115,22,0.35);
                    border-radius: 999px; padding: 7px 10px;
                    cursor: pointer; color: #fb923c;
                    transition: all 0.2s ease;
                }
                .nh-mob-toggle:hover { background: rgba(249,115,22,0.25); border-color: rgba(249,115,22,0.6); }
                .nh-mob-menu {
                    background: linear-gradient(160deg, rgba(30,27,75,0.97) 0%, rgba(49,46,129,0.97) 60%, rgba(100,40,10,0.97) 100%);
                    border-top: 1px solid rgba(99,80,200,0.2);
                    border-radius: 0 0 28px 28px;
                    padding: 10px 14px 14px;
                    display: flex; flex-direction: column; gap: 3px;
                }
                .nh-mob-link {
                    display: block; padding: 11px 18px;
                    border-radius: 14px; font-size: 0.88rem; font-weight: 600;
                    color: rgba(220, 215, 255, 0.88);
                    text-decoration: none; transition: all 0.2s ease;
                }
                .nh-mob-link:hover { background: rgba(99,80,200,0.25); color: #fff; }
                .nh-mob-link.active { background: rgba(234,88,12,0.2); color: #fb923c; font-weight: 700; }
                .nh-mob-cta {
                    display: flex; flex-direction: column; gap: 8px;
                    padding-top: 10px; margin-top: 4px;
                    border-top: 1px solid rgba(249,115,22,0.12);
                }
                .nh-mob-login {
                    display: block; text-align: center; padding: 11px;
                    border-radius: 14px; border: 1.5px solid rgba(249,115,22,0.4);
                    color: #fb923c; font-size: 0.88rem; font-weight: 600;
                    text-decoration: none; transition: all 0.2s ease;
                }
                .nh-mob-login:hover { background: rgba(249,115,22,0.12); }
                .nh-mob-register {
                    display: block; text-align: center; padding: 11px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #f97316, #fb923c);
                    color: #fff; font-size: 0.88rem; font-weight: 700;
                    text-decoration: none;
                    box-shadow: 0 4px 12px rgba(249,115,22,0.35);
                    transition: all 0.2s ease;
                }
                .nh-mob-register:hover { box-shadow: 0 6px 16px rgba(249,115,22,0.45); }

                @media (max-width: 1023px) {
                    .nh-links { display: none !important; }
                    .nh-cta { display: none !important; }
                    .nh-mob-toggle { display: flex; align-items: center; }
                }
            `}</style>

            <header className={`nh-pill ${isLoaded ? 'loaded' : ''} ${scrolled ? 'scrolled' : 'unscrolled'}`}>
                <nav className="nh-inner">
                    <Link to="/" className="nh-logo">
                        <img src="/logo-orange.png" alt="BillEase" />
                        <span className="nh-logo-text">Bill<span>Ease</span></span>
                    </Link>

                    <ul className="nh-links">
                        <li><NavLink to="/" className={({ isActive }) => isActive ? 'nh-active' : ''}>Home</NavLink></li>
                        <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'nh-active' : ''}>Contact</NavLink></li>
                        <li><NavLink to="/about" className={({ isActive }) => isActive ? 'nh-active' : ''}>About</NavLink></li>
                        <li>
                            <a href="https://github.com/sahib-singh13" target="_blank" rel="noopener noreferrer">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd" />
                                </svg>
                                GitHub
                            </a>
                        </li>
                    </ul>

                    <div className="nh-cta">
                        {/* FIXED: was /customerPage → correct route is /customerLogin */}
                        <Link to="/customerLogin" className="nh-btn-login">Log In</Link>
                        <Link to="/CustomerRegister" className="nh-btn-start">Get Started</Link>
                    </div>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="nh-mob-toggle">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            {mobileOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </nav>

                {mobileOpen && (
                    <div className="nh-mob-menu">
                        {[['/', 'Home'], ['/contact', 'Contact'], ['/about', 'About']].map(([path, label]) => (
                            <NavLink key={path} to={path} onClick={() => setMobileOpen(false)}
                                className={({ isActive }) => `nh-mob-link${isActive ? ' active' : ''}`}>
                                {label}
                            </NavLink>
                        ))}
                        <div className="nh-mob-cta">
                            {/* FIXED: was /customerPage → correct route is /customerLogin */}
                            <Link to="/customerLogin" onClick={() => setMobileOpen(false)} className="nh-mob-login">Log In</Link>
                            <Link to="/CustomerRegister" onClick={() => setMobileOpen(false)} className="nh-mob-register">Get Started</Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Phone } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { useAuth } from '../context/AuthContext';

const CustomerDashboardHeader = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { customerUser } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const initials = customerUser?.name
        ? customerUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    return (
        <>
            <style>{`
                .cdh-pill {
                    position: fixed;
                    top: 14px;
                    left: 0; right: 0;
                    z-index: 1000;
                    margin: 0 auto;
                    width: 94%;
                    max-width: 1200px;
                    border-radius: 999px;
                    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
                }
                .cdh-pill.scrolled {
                    background: linear-gradient(120deg, rgba(255,255,255,0.95) 0%, rgba(255,237,213,0.93) 50%, rgba(255,255,255,0.95) 100%);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px rgba(249,115,22,0.13), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(249,115,22,0.16);
                }
                .cdh-pill.unscrolled {
                    background: linear-gradient(120deg, rgba(44,38,30,0.82) 0%, rgba(60,40,20,0.80) 50%, rgba(44,38,30,0.82) 100%);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    box-shadow: 0 4px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(249,115,22,0.18);
                }
                .cdh-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 22px;
                    gap: 16px;
                }
                .cdh-logo {
                    display: flex; align-items: center; gap: 10px;
                    text-decoration: none; flex-shrink: 0;
                    transition: transform 0.3s ease;
                }
                .cdh-logo:hover { transform: scale(1.03); }
                .cdh-logo img { height: 40px; }
                .cdh-logo-text {
                    font-size: 1.3rem; font-weight: 900;
                    letter-spacing: -0.03em;
                }
                .cdh-pill.unscrolled .cdh-logo-text { color: #f5f0ea; }
                .cdh-pill.scrolled .cdh-logo-text { color: #1e1e2e; }
                .cdh-logo-text span {
                    background: linear-gradient(135deg, #f97316, #fb923c);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .cdh-links {
                    display: flex; align-items: center; gap: 2px;
                    list-style: none; margin: 0; padding: 0;
                }
                .cdh-links li a {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 0.83rem; font-weight: 600;
                    text-decoration: none;
                    padding: 7px 15px; border-radius: 999px;
                    transition: all 0.2s ease;
                }
                .cdh-pill.unscrolled .cdh-links li a { color: rgba(240,230,218,0.85); }
                .cdh-pill.unscrolled .cdh-links li a:hover { color: #fff; background: rgba(249,115,22,0.2); }
                .cdh-pill.unscrolled .cdh-links li a.cdh-active { color: #fb923c; background: rgba(249,115,22,0.22); font-weight:700; }
                .cdh-pill.scrolled .cdh-links li a { color: #4b5563; }
                .cdh-pill.scrolled .cdh-links li a:hover { color: #ea580c; background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.08)); }
                .cdh-pill.scrolled .cdh-links li a.cdh-active { color: #ea580c; background: linear-gradient(135deg, rgba(249,115,22,0.14), rgba(251,146,60,0.1)); font-weight:700; }
                .cdh-right { display: flex; align-items: center; gap: 10px; }
                .cdh-avatar-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 5px 14px 5px 5px;
                    border-radius: 999px;
                    border: 1.5px solid rgba(249,115,22,0.35);
                    background: rgba(249,115,22,0.12);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .cdh-pill.scrolled .cdh-avatar-btn {
                    background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,247,237,0.7));
                    border-color: rgba(249,115,22,0.25);
                    box-shadow: 0 2px 8px rgba(249,115,22,0.08);
                }
                .cdh-avatar-btn:hover {
                    border-color: rgba(249,115,22,0.6);
                    box-shadow: 0 4px 14px rgba(249,115,22,0.25);
                    background: rgba(249,115,22,0.2);
                }
                .cdh-pill.scrolled .cdh-avatar-btn:hover {
                    background: linear-gradient(135deg, rgba(255,247,237,0.95), rgba(254,215,170,0.4));
                }
                .cdh-avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: linear-gradient(135deg, #f97316, #fb923c);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-size: 0.7rem; font-weight: 800;
                    box-shadow: 0 2px 8px rgba(249,115,22,0.35);
                    flex-shrink: 0;
                }
                .cdh-username {
                    font-size: 0.82rem; font-weight: 600;
                    max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .cdh-pill.unscrolled .cdh-username { color: rgba(240,228,212,0.9); }
                .cdh-pill.scrolled .cdh-username { color: #374151; }
                .cdh-chevron { color: #9ca3af; transition: transform 0.2s ease; flex-shrink: 0; }
                .cdh-chevron.open { transform: rotate(180deg); }
                .cdh-mob-toggle {
                    display: none;
                    background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.07));
                    border: 1.5px solid rgba(249,115,22,0.25);
                    border-radius: 999px; padding: 7px 10px;
                    cursor: pointer; color: #ea580c;
                    transition: all 0.2s ease;
                }
                .cdh-mob-toggle:hover { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.4); }
                .cdh-mob-menu {
                    background: linear-gradient(160deg, rgba(42,34,22,0.97) 0%, rgba(58,38,16,0.97) 100%);
                    border-top: 1px solid rgba(249,115,22,0.15);
                    border-radius: 0 0 28px 28px;
                    padding: 10px 14px 14px;
                    display: flex; flex-direction: column; gap: 3px;
                }
                .cdh-mob-link {
                    display: flex; align-items: center; gap: 10px;
                    padding: 11px 18px; border-radius: 14px;
                    font-size: 0.88rem; font-weight: 600; color: rgba(235,220,200,0.85);
                    text-decoration: none; transition: all 0.2s ease;
                }
                .cdh-mob-link:hover { background: rgba(249,115,22,0.14); color: #fff; }
                .cdh-mob-link.active { background: rgba(249,115,22,0.2); color: #fb923c; font-weight: 700; }
                @media (max-width: 1023px) {
                    .cdh-links { display: none !important; }
                    .cdh-username { display: none !important; }
                    .cdh-mob-toggle { display: flex; align-items: center; }
                }
            `}</style>

            <header className={`cdh-pill ${scrolled ? 'scrolled' : 'unscrolled'}`}>
                <nav className="cdh-inner">
                    <Link to="/" className="cdh-logo">
                        <img src="/logo-orange.png" alt="BillEase" />
                        <span className="cdh-logo-text">Bill<span>Ease</span></span>
                    </Link>

                    <ul className="cdh-links">
                        <li>
                            <NavLink to="/customerDashboard" className={({ isActive }) => isActive ? 'cdh-active' : ''}>
                                <LayoutDashboard size={14} /> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/contact" className={({ isActive }) => isActive ? 'cdh-active' : ''}>
                                <Phone size={14} /> Contact Us
                            </NavLink>
                        </li>
                    </ul>

                    <div className="cdh-right">
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="cdh-avatar-btn">
                                <div className="cdh-avatar">{initials}</div>
                                <span className="cdh-username">{customerUser?.name?.split(' ')[0] || 'Account'}</span>
                                <svg className={`cdh-chevron ${isUserDropdownOpen ? 'open' : ''}`} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <UserDropdown isOpen={isUserDropdownOpen} onClose={() => setIsUserDropdownOpen(false)} />
                        </div>

                        <button onClick={() => setMobileOpen(!mobileOpen)} className="cdh-mob-toggle">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </nav>

                {mobileOpen && (
                    <div className="cdh-mob-menu">
                        <NavLink to="/customerDashboard" onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => `cdh-mob-link${isActive ? ' active' : ''}`}>
                            <LayoutDashboard size={15} /> Dashboard
                        </NavLink>
                        <NavLink to="/contact" onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => `cdh-mob-link${isActive ? ' active' : ''}`}>
                            <Phone size={15} /> Contact Us
                        </NavLink>
                    </div>
                )}
            </header>
        </>
    );
};

export default CustomerDashboardHeader;
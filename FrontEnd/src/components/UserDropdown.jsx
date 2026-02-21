// src/components/UserDropdown.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaBell, FaCog, FaCreditCard, FaDesktop, FaFileInvoice, FaHistory,
    FaInfoCircle, FaLock, FaQuestionCircle, FaSignOutAlt, FaTimes,
    FaShieldAlt, FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const UserDropdown = ({ isOpen, onClose }) => {
    const { logout, customerUser: user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleLogoutClick = () => {
        localStorage.removeItem('customerToken');
        logout('customer');
        onClose();
        navigate('/customerLogin', { replace: true });
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    const profilePictureSrc = user?.profilePictureUrl || null;

    const menuGroups = [
        {
            label: 'Account',
            items: [
                { to: '/customerPersonalInformation', icon: FaInfoCircle, label: 'Personal Information' },
                { to: '/customerDashboard', icon: FaFileInvoice, label: 'Manage Bills' },
            ]
        },
        {
            label: 'Security & Settings',
            items: [
                { to: '/settings-security', icon: FaLock, label: 'Security Settings' },
                { to: '/settings-devices', icon: FaDesktop, label: 'Manage Devices' },
                { to: '/settings-general', icon: FaCog, label: 'Settings' },
            ]
        },
        {
            label: 'Billing',
            items: [
                { to: '/settings-billing', icon: FaCreditCard, label: 'Billing & Subscription' },
                { to: '/settings-payment-history', icon: FaHistory, label: 'Payment History' },
            ]
        },
        {
            label: 'Support',
            items: [
                { to: '/settings-notifications', icon: FaBell, label: 'Notifications' },
                { to: '/helpandsupport', icon: FaQuestionCircle, label: 'Help & Support' },
            ]
        }
    ];

    return ReactDOM.createPortal(
        <>
            {/* CSS */}
            <style>{`
                .ud-backdrop {
                    position: fixed; inset: 0;
                    background: rgba(8, 4, 0, 0.7);
                    z-index: 9998;
                    opacity: 0;
                    transition: opacity 0.28s ease;
                    pointer-events: none;
                    will-change: opacity;
                }
                .ud-backdrop.open {
                    opacity: 1;
                    pointer-events: all;
                }
                .ud-panel {
                    position: fixed;
                    top: 0; right: 0;
                    height: 100%;
                    width: 300px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    transform: translateX(100%);
                    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
                    background: #130900;
                    border-left: 1px solid rgba(249,115,22,0.18);
                    box-shadow: -6px 0 40px rgba(0,0,0,0.55);
                    will-change: transform;
                }
                .ud-panel.open {
                    transform: translateX(0);
                }
                /* Header */
                .ud-header {
                    position: relative;
                    padding: 28px 20px 22px;
                    background: rgba(249,115,22,0.09);
                    border-bottom: 1px solid rgba(249,115,22,0.15);
                    flex-shrink: 0;
                }
                .ud-close-btn {
                    position: absolute;
                    top: 14px; right: 14px;
                    width: 30px; height: 30px;
                    border-radius: 50%;
                    border: 1px solid rgba(249,115,22,0.25);
                    background: rgba(249,115,22,0.1);
                    color: rgba(251,146,60,0.7);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: background 0.18s ease, color 0.18s ease;
                }
                .ud-close-btn:hover {
                    background: rgba(249,115,22,0.22);
                    color: #fb923c;
                }
                .ud-avatar-ring {
                    width: 68px; height: 68px;
                    border-radius: 50%;
                    padding: 2.5px;
                    background: linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #ea580c 100%);
                    flex-shrink: 0;
                    box-shadow: 0 0 16px rgba(249,115,22,0.3);
                }
                .ud-avatar-inner {
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    background: #1a0f00;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .ud-avatar-initials {
                    font-size: 1.3rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #f97316, #fbbf24);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.02em;
                }
                .ud-user-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #f5ede0;
                    line-height: 1.2;
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .ud-user-email {
                    font-size: 0.72rem;
                    color: #fb923c;
                    margin: 3px 0 0;
                    opacity: 0.8;
                    font-weight: 500;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .ud-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    background: rgba(249,115,22,0.15);
                    border: 1px solid rgba(249,115,22,0.3);
                    color: #fb923c;
                    font-size: 0.62rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 999px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-top: 6px;
                }
                /* Scroll area */
                .ud-nav {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 8px 12px 12px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(249,115,22,0.3) transparent;
                }
                .ud-nav::-webkit-scrollbar { width: 4px; }
                .ud-nav::-webkit-scrollbar-track { background: transparent; }
                .ud-nav::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 10px; }
                /* Group label */
                .ud-group-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: rgba(249,115,22,0.5);
                    padding: 14px 8px 5px;
                }
                /* Menu item */
                .ud-item {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    padding: 0;
                    border-radius: 12px;
                    text-decoration: none;
                    color: rgba(235,220,200,0.75);
                    transition: background 0.18s ease, color 0.18s ease;
                    margin-bottom: 2px;
                    width: 100%;
                    text-align: left;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }
                .ud-item:hover {
                    background: rgba(249,115,22,0.1);
                    color: #f5ede0;
                }
                .ud-item.active {
                    background: rgba(249,115,22,0.15);
                    color: #fb923c;
                }
                .ud-item-icon-wrap {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.06);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    margin: 7px 11px 7px 8px;
                    transition: background 0.18s ease, border-color 0.18s ease;
                    color: #f97316;
                    font-size: 0.8rem;
                }
                .ud-item:hover .ud-item-icon-wrap {
                    background: rgba(249,115,22,0.18);
                    border-color: rgba(249,115,22,0.3);
                }
                .ud-item-label {
                    flex-grow: 1;
                    font-size: 0.82rem;
                    font-weight: 600;
                }
                .ud-item-arrow {
                    margin-right: 10px;
                    font-size: 0.6rem;
                    color: rgba(249,115,22,0.3);
                    transition: color 0.18s ease, transform 0.18s ease;
                    flex-shrink: 0;
                }
                .ud-item:hover .ud-item-arrow {
                    color: rgba(249,115,22,0.7);
                    transform: translateX(2px);
                }
                /* Divider */
                .ud-divider {
                    height: 1px;
                    background: rgba(249,115,22,0.08);
                    margin: 6px 0;
                    border-radius: 2px;
                }
                /* Logout button */
                .ud-logout-wrap {
                    padding: 12px;
                    flex-shrink: 0;
                    border-top: 1px solid rgba(249,115,22,0.1);
                }
                .ud-logout-btn {
                    width: 100%;
                    display: flex; align-items: center; justify-content: center; gap: 9px;
                    padding: 12px 20px;
                    border-radius: 14px;
                    border: 1px solid rgba(239,68,68,0.3);
                    background: rgba(239,68,68,0.07);
                    color: rgba(252,165,165,0.85);
                    font-size: 0.84rem;
                    font-weight: 700;
                    cursor: pointer;
                    letter-spacing: 0.02em;
                    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
                }
                .ud-logout-btn:hover {
                    color: #fca5a5;
                    border-color: rgba(239,68,68,0.55);
                    background: rgba(239,68,68,0.14);
                }
                /* Footer */
                .ud-footer {
                    padding: 8px 12px 12px;
                    text-align: center;
                    font-size: 0.65rem;
                    color: rgba(249,115,22,0.3);
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    flex-shrink: 0;
                }
            `}</style>

            {/* Backdrop */}
            <div
                className={`ud-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`ud-panel ${isOpen ? 'open' : ''}`}
                role="menu"
                aria-orientation="vertical"
            >
                {/* Header */}
                <div className="ud-header">
                    <button className="ud-close-btn" onClick={onClose} aria-label="Close menu">
                        <FaTimes style={{ fontSize: '0.7rem' }} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="ud-avatar-ring">
                            <div className="ud-avatar-inner">
                                {profilePictureSrc ? (
                                    <img
                                        src={profilePictureSrc}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                        referrerPolicy="no-referrer"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="ud-avatar-initials">{initials}</span>
                                )}
                            </div>
                        </div>

                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <p className="ud-user-name" title={user?.name || 'BillEase User'}>
                                {user?.name || 'BillEase User'}
                            </p>
                            <p className="ud-user-email" title={user?.email || ''}>
                                {user?.email || ''}
                            </p>
                            <div className="ud-badge">
                                <FaShieldAlt style={{ fontSize: '0.55rem' }} />
                                Customer
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="ud-nav">
                    {menuGroups.map((group, gi) => (
                        <div key={gi}>
                            {gi > 0 && <div className="ud-divider" />}
                            <div className="ud-group-label">{group.label}</div>
                            {group.items.map(({ to, icon: Icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={onClose}
                                    className={({ isActive }) => `ud-item${isActive ? ' active' : ''}`}
                                >
                                    <div className="ud-item-icon-wrap">
                                        <Icon />
                                    </div>
                                    <span className="ud-item-label">{label}</span>
                                    <FaChevronRight className="ud-item-arrow" />
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="ud-logout-wrap">
                    <button className="ud-logout-btn" onClick={handleLogoutClick}>
                        <FaSignOutAlt style={{ fontSize: '0.9rem' }} />
                        Sign Out
                    </button>
                </div>

                {/* Footer */}
                <div className="ud-footer">BillEase © {new Date().getFullYear()}</div>
            </div>
        </>,
        document.body
    );
};

export default UserDropdown;
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, LayoutDashboard, Phone, Info, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RetailerDashboardHeader = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { retailerUser, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout('retailer');
      navigate('/retailerLogin');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const initials = retailerUser?.name
    ? retailerUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'R';

  return (
    <>
      <style>{`
        .rdh-pill {
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
        .rdh-pill.scrolled {
          background: linear-gradient(120deg, rgba(255,255,255,0.95) 0%, rgba(255,237,213,0.93) 50%, rgba(255,255,255,0.95) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(249,115,22,0.13), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(249,115,22,0.16);
        }
        .rdh-pill.unscrolled {
          background: linear-gradient(120deg, rgba(44,38,30,0.82) 0%, rgba(60,40,20,0.80) 50%, rgba(44,38,30,0.82) 100%);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(249,115,22,0.18);
        }
        .rdh-inner {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 10px 22px;
          gap: 16px;
        }
        .rdh-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .rdh-logo:hover { transform: scale(1.03); }
        .rdh-logo img {
          height: 40px;
          transition: transform 0.5s ease;
        }
        .rdh-logo:hover img { transform: rotate(12deg); }
        .rdh-logo-text {
          font-size: 1.3rem; font-weight: 900;
          letter-spacing: -0.03em; line-height: 1;
        }
        .rdh-pill.unscrolled .rdh-logo-text { color: #f5f0ea; }
        .rdh-pill.scrolled .rdh-logo-text { color: #1e1e2e; }
        .rdh-logo-text span {
          background: linear-gradient(135deg, #f97316, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .rdh-logo-tag {
          font-size: 0.5rem; font-weight: 800;
          color: #f97316; letter-spacing: 0.2em;
          text-transform: uppercase; line-height: 1; margin-top: 2px;
        }
        .rdh-links {
          display: flex; align-items: center; gap: 2px;
          list-style: none; margin: 0; padding: 0;
        }
        .rdh-links li a {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.83rem; font-weight: 600;
          text-decoration: none; padding: 7px 15px; border-radius: 999px;
          transition: all 0.2s ease;
        }
        .rdh-pill.unscrolled .rdh-links li a { color: rgba(240,230,218,0.85); }
        .rdh-pill.unscrolled .rdh-links li a:hover { color: #fff; background: rgba(249,115,22,0.2); }
        .rdh-pill.unscrolled .rdh-links li a.rdh-active { color: #fb923c; background: rgba(249,115,22,0.22); font-weight:700; }
        .rdh-pill.scrolled .rdh-links li a { color: #4b5563; }
        .rdh-pill.scrolled .rdh-links li a:hover { color: #ea580c; background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.08)); }
        .rdh-pill.scrolled .rdh-links li a.rdh-active { color: #ea580c; background: linear-gradient(135deg, rgba(249,115,22,0.14), rgba(251,146,60,0.1)); font-weight:700; }
        .rdh-right { display: flex; align-items: center; gap: 10px; }
        .rdh-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 14px 5px 5px;
          border-radius: 999px;
          border: 1.5px solid rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.12);
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .rdh-pill.scrolled .rdh-avatar-btn {
          background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,247,237,0.7));
          border-color: rgba(249,115,22,0.25);
          box-shadow: 0 2px 8px rgba(249,115,22,0.08);
        }
        .rdh-avatar-btn:hover {
          border-color: rgba(249,115,22,0.6);
          box-shadow: 0 4px 14px rgba(249,115,22,0.25);
          background: rgba(249,115,22,0.2);
        }
        .rdh-pill.scrolled .rdh-avatar-btn:hover {
          background: linear-gradient(135deg, rgba(255,247,237,0.95), rgba(254,215,170,0.4));
        }
        .rdh-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #fb923c);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.7rem; font-weight: 800;
          box-shadow: 0 2px 8px rgba(249,115,22,0.35); flex-shrink: 0;
        }
        .rdh-user-info { text-align: left; }
        .rdh-user-name {
          font-size: 0.78rem; font-weight: 700;
          max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2;
        }
        .rdh-pill.unscrolled .rdh-user-name { color: rgba(240,228,212,0.95); }
        .rdh-pill.scrolled .rdh-user-name { color: #1f2937; }
        .rdh-user-role {
          font-size: 0.6rem; font-weight: 700;
          background: linear-gradient(135deg, #f97316, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .rdh-dropdown-panel {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 230px;
          background: linear-gradient(160deg, rgba(255,255,255,0.99) 0%, rgba(255,247,237,0.98) 100%);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(249,115,22,0.14), 0 4px 16px rgba(0,0,0,0.08);
          overflow: hidden;
          animation: rdhFadeDown 0.18s ease;
          z-index: 999;
        }
        @keyframes rdhFadeDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rdh-dropdown-header {
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(255,237,213,0.8), rgba(254,215,170,0.4));
          border-bottom: 1px solid rgba(249,115,22,0.1);
          display: flex; align-items: center; gap: 10px;
        }
        .rdh-dropdown-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #fb923c);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(249,115,22,0.3);
        }
        .rdh-dropdown-name {
          font-weight: 700; font-size: 0.85rem; color: #1f2937;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .rdh-dropdown-email {
          font-size: 0.72rem; color: #9ca3af;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .rdh-dd-items { padding: 8px; }
        .rdh-dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 12px;
          font-size: 0.82rem; font-weight: 600; color: #374151;
          text-decoration: none; cursor: pointer; transition: all 0.18s ease;
          background: none; border: none; width: 100%; text-align: left;
        }
        .rdh-dd-item:hover { background: linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.06)); color: #ea580c; }
        .rdh-dd-item.danger { color: #ef4444; }
        .rdh-dd-item.danger:hover { background: rgba(239,68,68,0.08); }
        .rdh-dd-divider { margin: 4px 8px; border: none; border-top: 1px solid rgba(249,115,22,0.1); }
        .rdh-mob-toggle {
          display: none;
          background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.07));
          border: 1.5px solid rgba(249,115,22,0.25);
          border-radius: 999px; padding: 7px 10px;
          cursor: pointer; color: #ea580c;
          transition: all 0.2s ease;
        }
        .rdh-mob-toggle:hover { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.4); }
        .rdh-mob-menu {
          background: linear-gradient(160deg, rgba(42,34,22,0.97) 0%, rgba(58,38,16,0.97) 100%);
          border-top: 1px solid rgba(249,115,22,0.15);
          border-radius: 0 0 28px 28px;
          padding: 10px 14px 14px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .rdh-mob-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; border-radius: 14px;
          font-size: 0.88rem; font-weight: 600; color: rgba(235,220,200,0.85);
          text-decoration: none; transition: all 0.2s ease;
        }
        .rdh-mob-link:hover { background: rgba(249,115,22,0.14); color: #fff; }
        .rdh-mob-link.active { background: rgba(249,115,22,0.2); color: #fb923c; font-weight: 700; }
        .rdh-mob-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; border-radius: 14px;
          font-size: 0.88rem; font-weight: 600; color: rgba(248,113,113,0.9);
          background: none; border: none; cursor: pointer; width: 100%; text-align: left;
          margin-top: 4px; border-top: 1px solid rgba(249,115,22,0.12); padding-top: 14px;
          transition: all 0.2s ease;
        }
        .rdh-mob-logout:hover { background: rgba(220,38,38,0.12); color: #f87171; }
        @media (max-width: 1023px) {
          .rdh-links { display: none !important; }
          .rdh-user-info { display: none !important; }
          .rdh-mob-toggle { display: flex; align-items: center; }
        }
        @media (max-width: 640px) { .rdh-logo-brand { display: none; } }
      `}</style>

      <header className={`rdh-pill ${scrolled ? 'scrolled' : 'unscrolled'}`}>
        <nav className="rdh-inner">
          {/* Logo */}
          <Link to="/retailerDashboard" className="rdh-logo">
            <img src="/logo-orange.png" alt="BillEase" />
            <div className="rdh-logo-brand">
              <div className="rdh-logo-text">Bill<span>Ease</span></div>
              <div className="rdh-logo-tag">Partner Portal</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="rdh-links">
            <li><NavLink to="/retailerDashboard" className={({ isActive }) => isActive ? 'rdh-active' : ''}><LayoutDashboard size={14} />Dashboard</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'rdh-active' : ''}><Phone size={14} />Support</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'rdh-active' : ''}><Info size={14} />About</NavLink></li>
          </ul>

          {/* Right */}
          <div className="rdh-right">
            <div style={{ position: 'relative' }} ref={userDropdownRef}>
              <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="rdh-avatar-btn">
                <div className="rdh-avatar">{initials}</div>
                <div className="rdh-user-info">
                  <div className="rdh-user-name">{retailerUser?.name?.split(' ')[0] || 'Retailer'}</div>
                  <div className="rdh-user-role">Partner</div>
                </div>
                <ChevronDown size={13} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
              </button>

              {isUserDropdownOpen && (
                <div className="rdh-dropdown-panel">
                  <div className="rdh-dropdown-header">
                    <div className="rdh-dropdown-avatar">{initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="rdh-dropdown-name">{retailerUser?.name || 'Retailer'}</div>
                      <div className="rdh-dropdown-email">{retailerUser?.email || ''}</div>
                    </div>
                  </div>
                  <div className="rdh-dd-items">
                    <NavLink to="/retailerDashboard" onClick={() => setIsUserDropdownOpen(false)} className="rdh-dd-item">
                      <LayoutDashboard size={14} /> Dashboard
                    </NavLink>
                    <NavLink to="/retailerPersonalInformation" onClick={() => setIsUserDropdownOpen(false)} className="rdh-dd-item">
                      <User size={14} /> My Profile
                    </NavLink>
                    <hr className="rdh-dd-divider" />
                    <button onClick={handleLogout} className="rdh-dd-item danger">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rdh-mob-toggle">
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="rdh-mob-menu">
            {[
              ['/retailerDashboard', 'Dashboard', LayoutDashboard],
              ['/contact', 'Support', Phone],
              ['/about', 'About', Info],
            ].map(([path, label, Icon]) => (
              <NavLink key={path} to={path} onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `rdh-mob-link${isActive ? ' active' : ''}`}>
                <Icon size={15} /> {label}
              </NavLink>
            ))}
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="rdh-mob-logout">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </header>
    </>
  );
};

export default RetailerDashboardHeader;
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth and API
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- Components ---
import { Intro } from './components/Intro';
import Footer from './components/Footer';
import LandingPage from './Pages/LandingPage';
import Header from './components/Header';
import CustomerDashboardHeader from './components/CustomerDashboardHeader';
import RetailerDashboardHeader from './components/RetailerDashboardHeader';

// --- Pages ---
import CustomerPage from './Pages/CustomerPage';
import Contact from './Pages/Contact';
import RetailerPage from './Pages/RetailerPage';
import RegisterPage from './Pages/RegisterPage';
import Dashboard from './Pages/DashBoard';
import About from './Pages/About';
import RegisterRetailer from './Pages/RegisterRetailer';
import RetailerDashBoard from './Pages/RetailerDashboard';
import CompleteRetailerProfile from './Pages/CompleteRetailerProfile';
import CustomerPersonalInformation from './Pages/CustomerPersonalInformation';
import HelpandSupport from './Pages/HelpandSupport';
import RetailerBills from './Pages/RetailerBills';
import RetailerAnalytics from './Pages/RetailerAnalytics';
import RetailerPersonalInformation from './Pages/RetailerPersonalInformation';

// --- Settings Placeholder Pages ---
import SettingsSecurity from './Pages/SettingsSecurity';
import SettingsDevices from './Pages/SettingsDevices';
import SettingsBilling from './Pages/SettingsBilling';
import SettingsPaymentHistory from './Pages/SettingsPaymentHistory';
import SettingsNotifications from './Pages/SettingsNotifications';
import SettingsGeneral from './Pages/SettingsGeneral';

// --- NEW Warranty Pages ---
import WarrantyClaimPage from './Pages/WarrantyClaimPage';
import WarrantySubmitPage from './Pages/WarrantySubmitPage';

// Key for session storage to show splash only once
const SPLASH_SHOWN_KEY = 'splashShown';

const AppContent = () => {
    // Splash Screen State
    const [showSplash, setShowSplash] = useState(() => {
        return sessionStorage.getItem(SPLASH_SHOWN_KEY) !== 'true';
    });

    const location = useLocation();

    // Effect to hide splash screen
    useEffect(() => {
        if (showSplash) {
            const timer = setTimeout(() => {
                setShowSplash(false);
                sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSplash]);

    // --- Determine Header ---
    const isCustomerRoute = location.pathname.startsWith('/customerDashboard') ||
        location.pathname.startsWith('/customerPersonalInformation') ||
        location.pathname.startsWith('/helpandsupport') ||
        location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/warranty-');

    // <--- 2. UPDATE LOGIC: Add check for /retailer/analytics
    const isRetailerRoute = location.pathname.startsWith('/retailerDashboard') ||
        location.pathname.startsWith('/completeRetailerProfile') ||
        location.pathname.startsWith('/retailerPersonalInformation') ||
        location.pathname.startsWith('/retailer/bills') ||
        location.pathname.startsWith('/retailer/analytics');

    let CurrentHeader = Header;
    if (isCustomerRoute) {
        CurrentHeader = CustomerDashboardHeader;
    } else if (isRetailerRoute) {
        CurrentHeader = RetailerDashboardHeader;
    }

    const isAuthPage = [
        '/customerLogin', '/retailerLogin',
        '/CustomerRegister', '/RegisterRetailer', '/login'
    ].includes(location.pathname);

    const hideLayout = showSplash || location.pathname === '/';

    if (showSplash) {
        return <Intro />;
    }

    return (
        <div className="app flex flex-col min-h-screen bg-gray-50">
            <AuthProvider>
                <Toaster position="top-center" reverseOrder={false} containerStyle={{ zIndex: 9999 }} />

                {!hideLayout && !isAuthPage && <CurrentHeader />}
                <main className={`flex-grow ${!hideLayout && !isAuthPage ? 'pt-28' : ''}`}>
                    <Routes>
                        {/* --- Public Routes --- */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/customerLogin" element={<CustomerPage />} />
                        <Route path="/CustomerRegister" element={<RegisterPage />} />
                        <Route path="/retailerLogin" element={<RetailerPage />} />
                        <Route path="/RegisterRetailer" element={<RegisterRetailer />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />

                        {/* --- Protected Customer Routes --- */}
                        <Route element={<ProtectedRoute requiredRole="customer" />}>
                            <Route path="/customerDashboard" element={<Dashboard />} />
                            <Route path="/customerPersonalInformation" element={<CustomerPersonalInformation />} />
                            <Route path="/helpandsupport" element={<HelpandSupport />} />

                            {/* Settings Routes */}
                            <Route path="/settings-security" element={<SettingsSecurity />} />
                            <Route path="/settings-devices" element={<SettingsDevices />} />
                            <Route path="/settings-billing" element={<SettingsBilling />} />
                            <Route path="/settings-payment-history" element={<SettingsPaymentHistory />} />
                            <Route path="/settings-notifications" element={<SettingsNotifications />} />
                            <Route path="/settings-general" element={<SettingsGeneral />} />
                            <Route path="/settings" element={<SettingsGeneral />} />

                            {/* Warranty Routes */}
                            <Route path="/warranty-claim" element={<WarrantyClaimPage />} />
                            <Route path="/warranty-submit" element={<WarrantySubmitPage />} />
                        </Route>

                        {/* --- Protected Retailer Routes --- */}
                        <Route element={<ProtectedRoute requiredRole="retailer" />}>
                            <Route path="/retailerDashboard" element={<RetailerDashBoard />} />
                            <Route path="/completeRetailerProfile" element={<CompleteRetailerProfile />} />
                            <Route path="/retailer/bills" element={<RetailerBills />} />
                            {/* <--- 3. NEW ROUTE ADDED HERE --- */}
                            <Route path="/retailer/analytics" element={<RetailerAnalytics />} />
                            <Route path="/retailerPersonalInformation" element={<RetailerPersonalInformation />} />
                        </Route>

                        {/* --- 404 Route --- */}
                        <Route path="*" element={
                            <div className="text-center py-20 px-4">
                                <h1 className="text-6xl font-bold text-orange-400">404</h1>
                                <p className="text-2xl font-medium text-gray-700 mt-4">Page Not Found</p>
                                <Link to="/" className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg transition duration-150">
                                    Go Back Home
                                </Link>
                            </div>
                        } />
                    </Routes>
                </main>
                {!hideLayout && <Footer />}
            </AuthProvider>
        </div>
    );
};

const App = () => {
    return <AppContent />;
};

export default App;
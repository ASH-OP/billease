// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { isCustomerAuth, isRetailerAuth, retailerUser, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (requiredRole === 'retailer') {
        if (!isRetailerAuth) return <Navigate to="/retailerLogin" replace />;

        // If profile not complete and trying to access the dashboard (not the profile page), redirect
        const isProfilePage = location.pathname === '/completeRetailerProfile';
        if (!isProfilePage && retailerUser && !retailerUser.isProfileComplete) {
            return <Navigate to="/completeRetailerProfile" replace />;
        }

        return <Outlet />;
    } else {
        return isCustomerAuth ? <Outlet /> : <Navigate to="/customerLogin" replace />;
    }
};

export default ProtectedRoute;
// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { isCustomerAuth, isRetailerAuth, isLoading } = useAuth();

    console.log(`ProtectedRoute [Role: ${requiredRole}]:`, { isCustomerAuth, isRetailerAuth, isLoading });


    if (isLoading) {
        // Optional: Show a loading spinner while checking auth
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    // Determine which auth to check
    if (requiredRole === 'retailer') {
        return isRetailerAuth ? <Outlet /> : <Navigate to="/retailerLogin" replace />;
    } else {
        // Default to customer
        return isCustomerAuth ? <Outlet /> : <Navigate to="/customerLogin" replace />;
    }
};

export default ProtectedRoute;
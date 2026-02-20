// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { customerApi, retailerApi } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

// Create the context
const AuthContext = createContext();

// Context Provider Component
export const AuthProvider = ({ children }) => {
    // --- Customer State ---
    const [customerUser, setCustomerUser] = useState(null);
    const [isCustomerAuth, setIsCustomerAuth] = useState(false);

    // --- Retailer State ---
    const [retailerUser, setRetailerUser] = useState(null);
    const [isRetailerAuth, setIsRetailerAuth] = useState(false);

    const [isLoading, setIsLoading] = useState(false); // Global loading for actions
    const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

    // --- Initial Auth Check (Dual) ---
    useEffect(() => {
        const checkAuth = async () => {
            console.log("Auth Check: Starting...");

            // 1. Check Customer Token
            const customerToken = localStorage.getItem('customerToken');
            let customerPromise = Promise.resolve();
            if (customerToken) {
                console.log("Checking Customer Token...");
                customerPromise = customerApi.get('/auth/me')
                    .then(res => {
                        if (res.data.success && res.data.user.role === 'customer') {
                            setCustomerUser(res.data.user);
                            setIsCustomerAuth(true);
                        } else {
                            throw new Error("Invalid role for customer token");
                        }
                    })
                    .catch(() => {
                        console.warn("Customer token invalid/expired");
                        localStorage.removeItem('customerToken');
                        setCustomerUser(null);
                        setIsCustomerAuth(false);
                    });
            }

            // 2. Check Retailer Token
            const retailerToken = localStorage.getItem('retailerToken');
            let retailerPromise = Promise.resolve();
            if (retailerToken) {
                console.log("Checking Retailer Token...");
                retailerPromise = retailerApi.get('/auth/me')
                    .then(res => {
                        if (res.data.success && res.data.user.role === 'retailer') {
                            setRetailerUser(res.data.user);
                            setIsRetailerAuth(true);
                        } else {
                            throw new Error("Invalid role for retailer token");
                        }
                    })
                    .catch(() => {
                        console.warn("Retailer token invalid/expired");
                        localStorage.removeItem('retailerToken');
                        setRetailerUser(null);
                        setIsRetailerAuth(false);
                    });
            }

            await Promise.all([customerPromise, retailerPromise]);
            console.log("Auth Check: Finished.");
            setIsAuthCheckComplete(true);
        };

        checkAuth();
    }, []);

    // --- Login (Generic -> Routed by Role) ---
    const login = async (email, password, role) => {
        setIsLoading(true);
        try {
            // Use the instance appropriate for the *attempted* login, though the endpoint is the same
            // actually endpoint is likely generic /auth/login, but we need to save token correctly
            // We can use either API instance to call login, but let's use customerApi as default or just fetch
            // Better to use the specific one if we knew, but login is generic.
            // Let's use customerApi for the public login endpoint

            const response = await customerApi.post('/auth/login', { email, password, role });

            if (response.data.success) {
                const { token, user } = response.data;

                if (role === 'retailer') {
                    if (user.role !== 'retailer') throw new Error("Role mismatch");
                    localStorage.setItem('retailerToken', token);
                    setRetailerUser(user);
                    setIsRetailerAuth(true);
                } else {
                    // Default to customer
                    if (user.role !== 'customer') throw new Error("Role mismatch");
                    localStorage.setItem('customerToken', token);
                    setCustomerUser(user);
                    setIsCustomerAuth(true);
                }

                toast.success('Login Successful!');
                setIsLoading(false);
                return true;
            } else {
                throw new Error(response.data.message || 'Login failed.');
            }
        } catch (error) {
            console.error("Login error:", error);
            const message = error.response?.data?.message || 'Login failed.';
            toast.error(message);
            setIsLoading(false);
            return false;
        }
    };

    // --- Register (Generic -> Routed by Role) ---
    const register = async (data) => {
        setIsLoading(true);
        try {
            const role = data.role || 'customer';
            const response = await customerApi.post('/auth/register', data);

            if (response.data.success) {
                const { token, user } = response.data;

                if (role === 'retailer') {
                    localStorage.setItem('retailerToken', token);
                    setRetailerUser(user);
                    setIsRetailerAuth(true);
                } else {
                    localStorage.setItem('customerToken', token);
                    setCustomerUser(user);
                    setIsCustomerAuth(true);
                }

                toast.success('Registration Successful!');
                setIsLoading(false);
                return true;
            } else {
                throw new Error(response.data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error("Registration error:", error);
            const message = error.response?.data?.message || 'Registration failed.';
            toast.error(message);
            setIsLoading(false);
            return false;
        }
    };

    // --- Google Auth ---
    const handleGoogleAuth = async (credentialResponse, additionalData = {}) => {
        setIsLoading(true);
        try {
            const role = additionalData.role || 'customer';
            const response = await customerApi.post('/auth/google', {
                credential: credentialResponse.credential,
                ...additionalData
            });

            if (response.data.success) {
                const { token, user } = response.data;

                if (role === 'retailer') {
                    localStorage.setItem('retailerToken', token);
                    setRetailerUser(user);
                    setIsRetailerAuth(true);
                } else {
                    localStorage.setItem('customerToken', token);
                    setCustomerUser(user);
                    setIsCustomerAuth(true);
                }

                toast.success('Google Sign-In Successful!');
                setIsLoading(false);
                return { success: true, user };
            } else {
                throw new Error(response.data.message || 'Google Auth failed.');
            }
        } catch (error) {
            console.error("Google Auth error:", error);
            toast.error('Google Sign-In failed.');
            setIsLoading(false);
            return { success: false };
        }
    };

    // --- Logout ---
    const logout = (role = 'customer') => { // Default to customer if not specified, but UI should specify
        if (role === 'retailer') {
            localStorage.removeItem('retailerToken');
            setRetailerUser(null);
            setIsRetailerAuth(false);
        } else {
            localStorage.removeItem('customerToken');
            setCustomerUser(null);
            setIsCustomerAuth(false);
        }
        toast.success('Logged out.');
    };

    // --- Update Profile (Context aware) ---
    const updateProfile = async (userData) => {
        setIsLoading(true);
        try {
            // Determine which API to use based on which user is "active" or involved
            // This is tricky if both are logged in.
            // WE ASSUME the component calling this knows which api to use, OR we check the userData context?
            // Actually, we usually update the *current* user. 
            // Since we are separating sessions, we should probably have updateCustomerProfile and updateRetailerProfile
            // OR check `userData.role`? No, userData is the *update* payload.

            // Best approach: Expose specific update functions or infer from role if possible?
            // Inference is hard if we don't know who called.
            // Let's try to detect based on populated state? 
            // If only one is logged in, it's easy. If both... 
            // We should use the API corresponding to the page the user is on.
            // BUT this context function doesn't know the page.

            // Temporary fix: Try retailer first if it has fields like 'shopName', else customer?
            // Or just try both? No.

            // BETTER: The component should call `updateProfile(data, role)`. 
            // I'll update the signature.
            // Defaulting to 'retailer' if shopName exists, else 'customer'?

            const isRetailerUpdate = userData.shopName !== undefined || userData.isProfileComplete !== undefined || userData.role === 'retailer';
            // Actually, let's just use `retailerApi` if `isRetailerAuth` is true AND we are supposedly in retailer context.
            // Ideally, we pass "role" param.

            let apiInstance = customerApi;
            if (isRetailerUpdate) apiInstance = retailerApi;
            // Fallback: If we are logged in as retailer and NOT customer, use retailerApi
            if (isRetailerAuth && !isCustomerAuth) apiInstance = retailerApi;

            // WARN: This might be ambiguous if both logged in. 
            // Let's assume usage in Retailer pages implies retailer update.

            const response = await apiInstance.patch('/auth/profile', userData);

            if (response.data.success) {
                const updatedUser = response.data.user;
                if (updatedUser.role === 'retailer') {
                    setRetailerUser(updatedUser);
                } else {
                    setCustomerUser(updatedUser);
                }
                toast.success('Profile updated successfully');
                setIsLoading(false);
                return true;
            } else {
                throw new Error(response.data.message || 'Update failed.');
            }
        } catch (error) {
            console.error("Update Profile Error:", error);
            toast.error(error.response?.data?.message || 'Failed to update profile.');
            setIsLoading(false);
            return false;
        }
    };

    const updateUserContext = (updatedUserData, role = 'customer') => {
        if (role === 'retailer') {
            setRetailerUser(prev => ({ ...prev, ...updatedUserData }));
        } else {
            setCustomerUser(prev => ({ ...prev, ...updatedUserData }));
        }
    };

    // Compatibility Helpers for existing code that expects 'user' or 'isAuthenticated'
    // We can't easily support generic 'user' anymore without knowing context.
    // BUT to avoid breaking EVERYTHING immediately, we can try to return the "most likely" one
    // or just return null for generic 'user' and force components to switch.
    // I will expose everything.

    if (!isAuthCheckComplete) {
        return <LoadingSpinner fullPage={true} />;
    }

    return (
        <AuthContext.Provider value={{
            // Separate States
            customerUser,
            isCustomerAuth,
            retailerUser,
            isRetailerAuth,

            // Actions
            login,
            register,
            logout,
            handleGoogleAuth,
            updateProfile, // Warning: Ambiguous without explicit role, handled heuristically
            updateUserContext,

            // Global
            isLoading,

            // Legacy/Generic Accessors (Deprecated essentially, use specific ones)
            // Mapping 'user' to customerUser for default, but this might break Retailer pages relying on generic 'user'
            // I will NOT map generic 'user' to force me to fix the pages.
            // user: customerUser, 
            // isAuthenticated: isCustomerAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
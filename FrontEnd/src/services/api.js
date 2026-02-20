// src/services/api.js
import axios from 'axios';

// Get the base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/billease"; // Fallback

// --- Common Config ---
const commonConfig = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
};

// --- Customer API Instance ---
export const customerApi = axios.create(commonConfig);

customerApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('customerToken'); // Specific key for customer
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

customerApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized (Customer) - Logging out");
            localStorage.removeItem('customerToken');
            // Optional: Dispatch a custom event or let AuthContext handle this via state check
        }
        return Promise.reject(error);
    }
);

// --- Retailer API Instance ---
export const retailerApi = axios.create(commonConfig);

retailerApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('retailerToken'); // Specific key for retailer
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

retailerApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized (Retailer) - Logging out");
            localStorage.removeItem('retailerToken');
        }
        return Promise.reject(error);
    }
);

// Default export for backward compatibility (defaults to customerApi for now, but should be updated)
export default customerApi;
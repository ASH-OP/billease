// src/components/AddBillModalForRetailer.jsx
import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Trash2,
    RefreshCcw,
    Save,
    ShoppingBag,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { retailerApi } from '../services/api';

const AddBillModalForRetailer = ({ onClose }) => {
    // --- State Management ---
    const [billNumber, setBillNumber] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Item State
    const initialItem = { id: Date.now(), name: '', company: '', quantity: 1, price: 0, total: 0 };
    const [items, setItems] = useState([initialItem]);

    // --- Initialization ---
    useEffect(() => {
        generateBillDetails();
    }, []);

    const generateBillDetails = () => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        setCurrentDate(formattedDate);

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setBillNumber(`INV-${date.getFullYear()}-${randomNum}`);
    };

    // --- Form Handlers ---
    const handleRefresh = () => {
        if (window.confirm("Are you sure you want to refresh? All entered data will be lost.")) {
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setItems([{ ...initialItem, id: Date.now() }]);
            generateBillDetails();
            toast.success("Form Refreshed");
        }
    };

    const handleAddItem = () => {
        setItems([...items, { ...initialItem, id: Date.now() }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length === 1) {
            toast.error("At least one item is required");
            return;
        }
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
    };

    const handleItemChange = (id, field, value) => {
        const updatedItems = items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
                    const price = field === 'price' ? parseFloat(value) || 0 : item.price;
                    updatedItem.total = qty * price;
                }
                return updatedItem;
            }
            return item;
        });
        setItems(updatedItems);
    };

    const grandTotal = items.reduce((acc, item) => acc + (item.total || 0), 0);

    // --- UPDATED SUBMIT HANDLER ---
    const handleSubmit = async () => {
        if (!customerName.trim()) return toast.error("Customer Name is required");
        if (items.some(i => !i.name.trim() || i.price <= 0)) {
            return toast.error("Please fill in valid item details");
        }

        // Process items to calculate total warranty in months
        const itemsWithWarranty = items.map(item => {
            const val = parseFloat(item.warrantyValue) || 0;
            const unit = item.warrantyUnit || 'Months';
            let months = 0;
            if (val > 0) {
                months = unit === 'Years' ? val * 12 : val;
            }
            return {
                ...item,
                warrantyMonths: months
            };
        });

        const billData = {
            billNumber,
            date: currentDate,
            customer: {
                name: customerName,
                phone: customerPhone,
                email: customerEmail
            },
            items: itemsWithWarranty,
            grandTotal,
            shopName: "My Retail Store"
        };

        setIsSubmitting(true);

        try {
            // 1. GET TOKEN (Handled by retailerApi interceptor)
            // const token = localStorage.getItem('token'); // REMOVED: potentially wrong key


            // 2. USE TOKEN IN HEADERS
            // Note: Ensure port matches your server (4000 or 5000)
            // 2. USE RETAILER API (Interceptors handle token)
            // Note: Ensure port matches your server (4000 or 5000)
            // const baseUrl = 'http://localhost:4000/billease'; // Base URL is handled by api.js

            const response = await retailerApi.post('/retailer/bills', billData);

            const data = response.data;

            if (data.success || response.status === 201) {
                toast.success(`Bill ${billNumber} saved successfully!`);
                onClose();
            } else {
                toast.error(data.message || "Failed to save bill");
            }
        } catch (error) {
            console.error("API Error:", error);
            toast.error("Server error. Please check if backend is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-orange-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6" />
                            My Retail Store
                        </h2>
                        <p className="text-orange-100 text-sm mt-1">Authorized Retail Partner</p>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold opacity-90">{billNumber}</div>
                        <div className="text-orange-100 text-sm font-medium">{currentDate}</div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* Customer Inputs */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Customer Name</label>
                            <input
                                type="text"
                                placeholder="Enter Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Enter Phone"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter Email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                            <div className="col-span-12 md:col-span-3">Item Name</div>
                            <div className="col-span-6 md:col-span-2">Company</div>
                            <div className="col-span-3 md:col-span-1 text-center">Qty</div>
                            <div className="col-span-3 md:col-span-2 text-right">Price (₹)</div>
                            <div className="col-span-12 md:col-span-3">Warranty</div>
                            <div className="hidden md:block md:col-span-1 text-right">Action</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-orange-50/20 transition-colors">
                                    {/* Item Name */}
                                    <div className="col-span-12 md:col-span-3">
                                        <input
                                            type="text"
                                            placeholder="Item Name"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                            className="w-full p-1.5 border border-gray-200 rounded-md text-sm focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    {/* Company */}
                                    <div className="col-span-6 md:col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Brand"
                                            value={item.company}
                                            onChange={(e) => handleItemChange(item.id, 'company', e.target.value)}
                                            className="w-full p-1.5 border border-gray-200 rounded-md text-sm focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    {/* Qty */}
                                    <div className="col-span-3 md:col-span-1">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                            className="w-full p-1.5 border border-gray-200 rounded-md text-sm text-center focus:border-orange-500 outline-none"
                                            placeholder="Qty"
                                        />
                                    </div>
                                    {/* Price */}
                                    <div className="col-span-3 md:col-span-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                            className="w-full p-1.5 border border-gray-200 rounded-md text-sm text-right focus:border-orange-500 outline-none"
                                            placeholder="Price"
                                        />
                                    </div>

                                    {/* Warranty Section (New) */}
                                    <div className="col-span-12 md:col-span-3 flex gap-1 items-center bg-gray-50 p-1 rounded-md">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Warranty:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={item.warrantyValue || ''}
                                            onChange={(e) => handleItemChange(item.id, 'warrantyValue', e.target.value)}
                                            className="w-12 p-1 border border-gray-200 rounded text-sm text-center focus:border-orange-500 outline-none"
                                        />
                                        <select
                                            value={item.warrantyUnit || 'Months'}
                                            onChange={(e) => handleItemChange(item.id, 'warrantyUnit', e.target.value)}
                                            className="p-1 border border-gray-200 rounded text-xs bg-white focus:border-orange-500 outline-none"
                                        >
                                            <option value="Months">Months</option>
                                            <option value="Years">Years</option>
                                        </select>
                                    </div>

                                    {/* Total & Remove */}
                                    <div className="col-span-12 md:col-span-1 flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
                                        <span className="font-bold text-gray-700 md:hidden">
                                            ₹{item.total.toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Remove Item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleAddItem}
                        className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                        <Plus size={18} /> Add Another Item
                    </button>

                </div>

                {/* Footer */}
                <div className="bg-white p-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleRefresh}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 font-medium transition-all w-full md:w-auto justify-center disabled:opacity-50"
                        >
                            <RefreshCcw size={18} /> Refresh
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 font-medium transition-all w-full md:w-auto justify-center disabled:opacity-50"
                        >
                            <X size={18} /> Cancel
                        </button>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Grand Total</p>
                            <p className="text-2xl font-bold text-gray-800">₹{grandTotal.toLocaleString()}</p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} /> Generate Bill
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddBillModalForRetailer;
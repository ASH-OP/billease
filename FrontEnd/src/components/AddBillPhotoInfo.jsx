import React, { useState, useRef, useEffect } from 'react';
import {
    FaTimes, FaCloudUploadAlt, FaPlus, FaTrash, FaSave, FaSpinner,
    FaFileInvoice, FaStore, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaMagic, FaShieldAlt
} from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddBillPhotoInfo = ({ isOpen, onClose, onSuccess }) => {
    // --- State ---
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false); // New AI State
    const [formData, setFormData] = useState({
        billName: '',
        shopName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        shopPhoneNumber: '',
        shopAddress: ''
    });
    const [items, setItems] = useState([{ itemName: '', cost: '', warrantyValue: '', warrantyUnit: 'months' }]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    if (!isOpen) return null;

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { itemName: '', cost: '', warrantyValue: '', warrantyUnit: 'months' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    // --- AI SCAN FUNCTION ---
    const scanBillImage = async (selectedFile) => {
        setIsScanning(true);
        const toastId = toast.loading("AI is reading your bill...");

        try {
            const data = new FormData();
            data.append('billPhoto', selectedFile);

            // Send to the NEW Customer scan route
            const response = await api.post('/bills/scan', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const result = response.data.data;

                // 1. Auto-fill Text Fields
                setFormData(prev => ({
                    ...prev,
                    shopName: result.shopName || prev.shopName,
                    billName: result.billName || prev.billName,
                    purchaseDate: result.purchaseDate || prev.purchaseDate,
                    shopAddress: result.shopAddress || prev.shopAddress,
                    shopPhoneNumber: result.shopPhoneNumber || prev.shopPhoneNumber
                }));

                // 2. Auto-fill Items
                if (Array.isArray(result.items) && result.items.length > 0) {
                    const mappedItems = result.items.map(i => ({
                        itemName: i.itemName || '',
                        cost: i.cost || ''
                    }));
                    setItems(mappedItems);
                }

                toast.success("Data extracted successfully!", { id: toastId });
            }
        } catch (error) {
            console.error("Scan Failed:", error);
            toast.error("Could not auto-fill. Please enter details manually.", { id: toastId });
        } finally {
            setIsScanning(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));

            // Trigger AI Scan immediately on file selection
            if (selectedFile.type.startsWith('image/')) {
                scanBillImage(selectedFile);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.billName || !formData.shopName || !formData.purchaseDate) {
            return toast.error("Please fill in all required fields.");
        }
        if (items.some(i => !i.itemName || !i.cost)) {
            return toast.error("Please fill in all item details.");
        }

        setLoading(true);
        const data = new FormData();

        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        const formattedItems = items.map(i => {
            let warrantyExpiryDate = null;
            if (i.warrantyValue && Number(i.warrantyValue) > 0) {
                const expiry = new Date();
                const val = Number(i.warrantyValue);
                if (i.warrantyUnit === 'days') expiry.setDate(expiry.getDate() + val);
                if (i.warrantyUnit === 'months') expiry.setMonth(expiry.getMonth() + val);
                if (i.warrantyUnit === 'years') expiry.setFullYear(expiry.getFullYear() + val);
                warrantyExpiryDate = expiry.toISOString();
            }
            return {
                itemName: i.itemName,
                cost: Number(i.cost),
                warrantyExpiryDate
            };
        });
        data.append('items', JSON.stringify(formattedItems));

        if (file) {
            data.append('billPhoto', file);
        }

        try {
            const response = await api.post('/bills/billUpload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success('Bill added successfully!');
                onSuccess(response.data.bill);
                onClose();
            }
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error(error.response?.data?.message || "Failed to upload bill.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-orange-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaFileInvoice className="text-orange-500" />
                        Add New Bill
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <form id="add-bill-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Bill Name *</label>
                                <div className="relative">
                                    <FaFileInvoice className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" name="billName" placeholder="e.g. Grocery Shopping" value={formData.billName} onChange={handleChange} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50" disabled={isScanning} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Shop Name *</label>
                                <div className="relative">
                                    <FaStore className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" name="shopName" placeholder="e.g. Walmart" value={formData.shopName} onChange={handleChange} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50" disabled={isScanning} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Purchase Date *</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                    <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50" disabled={isScanning} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Shop Phone</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                    <input type="tel" name="shopPhoneNumber" placeholder="Optional" value={formData.shopPhoneNumber} onChange={handleChange} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50" disabled={isScanning} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Shop Address</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" name="shopAddress" placeholder="Optional" value={formData.shopAddress} onChange={handleChange} className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50" disabled={isScanning} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Items */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Items Purchased</label>
                            {items.map((item, index) => (
                                <div key={index} className="mb-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    {/* Item name + cost + delete */}
                                    <div className="flex gap-3 items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder="Item Name"
                                            value={item.itemName}
                                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none disabled:bg-gray-100"
                                            disabled={isScanning}
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cost ₹"
                                            value={item.cost}
                                            onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                                            className="w-24 p-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none disabled:bg-gray-100"
                                            disabled={isScanning}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1 || isScanning}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg disabled:opacity-50"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    {/* Warranty row */}
                                    <div className="flex items-center gap-2">
                                        <FaShieldAlt className="text-emerald-500 text-xs flex-shrink-0" />
                                        <span className="text-xs text-gray-500 font-medium w-28 flex-shrink-0">Warranty left:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 12"
                                            value={item.warrantyValue}
                                            onChange={(e) => handleItemChange(index, 'warrantyValue', e.target.value)}
                                            className="w-20 p-1.5 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none disabled:bg-gray-100"
                                            disabled={isScanning}
                                        />
                                        <select
                                            value={item.warrantyUnit}
                                            onChange={(e) => handleItemChange(index, 'warrantyUnit', e.target.value)}
                                            className="p-1.5 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none disabled:bg-gray-100 bg-white"
                                            disabled={isScanning}
                                        >
                                            <option value="days">Days</option>
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                        {item.warrantyValue > 0 && (
                                            <span className="text-[11px] text-emerald-600 font-semibold">✓ Warranty tracked</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addItem} disabled={isScanning} className="text-orange-600 font-semibold text-sm flex items-center gap-2 hover:underline disabled:opacity-50">
                                <FaPlus /> Add Another Item
                            </button>
                        </div>

                        {/* 3. File Upload */}
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative overflow-hidden ${isScanning ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'}`}>

                            {isScanning && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                    <FaSpinner className="animate-spin text-3xl text-purple-600 mb-2" />
                                    <p className="text-purple-700 font-bold animate-pulse">AI is extracting details...</p>
                                </div>
                            )}

                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isScanning}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-32 object-contain rounded-lg border border-gray-200" />
                                ) : (
                                    <>
                                        <FaMagic className="text-3xl text-purple-400 mb-1" />
                                        <span className="text-gray-700 font-bold">Upload Bill to Auto-Fill</span>
                                        <span className="text-xs text-gray-500">(JPEG, PNG supported)</span>
                                    </>
                                )}
                            </label>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition-colors"
                        disabled={loading || isScanning}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-bill-form"
                        disabled={loading || isScanning}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200 transition-all disabled:opacity-70"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        {loading ? 'Saving...' : 'Save Bill'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBillPhotoInfo;
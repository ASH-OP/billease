import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    FaTimes, FaPlus, FaMinus,
    FaSpinner, FaMagic, FaUser, FaPhone, FaEnvelope, FaShoppingBag
} from 'react-icons/fa';
import api from '../services/api';

const AddBillModal = ({ isOpen = true, onClose, onBillAdded }) => {
    // --- State Variables ---
    const [billNumber, setBillNumber] = useState('');
    const [shopName, setShopName] = useState('My Retail Store'); // Default or from AI
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

    // Customer Details (Required for Retailer Bills)
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    const [items, setItems] = useState([{ name: '', quantity: 1, price: 0, total: 0 }]);

    // File State (For AI Scan)
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // --- Init & Animation ---
    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            // Auto-generate a bill number on open
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            setBillNumber(`INV-${new Date().getFullYear()}-${randomNum}`);
        } else {
            setShowModal(false);
        }
    }, [isOpen]);

    // --- AI SCAN FUNCTION ---
    const scanBillImage = async (file) => {
        setIsScanning(true);
        const toastId = toast.loading("AI is reading the bill...");

        try {
            const formData = new FormData();
            formData.append('billPhoto', file);

            // FIX: Use the correct Retailer Route
            const response = await api.post('/retailer/bills/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const data = response.data.data;

                // 1. Fill Shop & Date Info
                if (data.shopName) setShopName(data.shopName);
                if (data.purchaseDate) setBillDate(data.purchaseDate);

                // 2. Fill Items
                if (Array.isArray(data.items) && data.items.length > 0) {
                    const mappedItems = data.items.map(i => ({
                        name: i.itemName || 'Item',
                        quantity: 1, // Default to 1 if AI doesn't find qty
                        price: Number(i.cost) || 0,
                        total: Number(i.cost) || 0
                    }));
                    setItems(mappedItems);
                }

                toast.success("Bill scanned & data filled!", { id: toastId });
            }
        } catch (err) {
            console.error("AI Scan Failed:", err);
            toast.error("AI Scan failed. Please fill manually.", { id: toastId });
        } finally {
            setIsScanning(false);
        }
    };

    // --- Handlers ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Trigger AI Scan immediately
            scanBillImage(file);
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-calculate total
        if (field === 'quantity' || field === 'price') {
            const qty = field === 'quantity' ? Number(value) : item.quantity;
            const price = field === 'price' ? Number(value) : item.price;
            item.total = qty * price;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const handleAddItem = () => setItems([...items, { name: '', quantity: 1, price: 0, total: 0 }]);

    const handleRemoveItem = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const grandTotal = items.reduce((acc, item) => acc + (item.total || 0), 0);

    // --- FINAL SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!customerName || !customerPhone) return toast.error("Customer Name and Phone are required");
        if (items.some(i => !i.name || i.total <= 0)) return toast.error("Please check item details");

        setIsSubmitting(true);
        const toastId = toast.loading("Generating Bill...");

        // Prepare JSON Data (Retailer Bills are pure data)
        const payload = {
            billNumber,
            date: billDate,
            shopName,
            customer: {
                name: customerName,
                phone: customerPhone,
                email: customerEmail
            },
            items: items.map(i => ({
                name: i.name,
                company: "Generic",
                quantity: Number(i.quantity),
                price: Number(i.price),
                total: Number(i.total)
            })),
            grandTotal
        };

        try {
            const response = await api.post('/retailer/bills', payload); // FIX: Correct Endpoint

            if (response.status === 201 || response.data.success) {
                toast.success("Bill Generated Successfully!", { id: toastId });
                if (onBillAdded) onBillAdded(response.data.data);
                handleCloseAnimation();
            }
        } catch (err) {
            console.error("Submit Error:", err);
            toast.error(err.response?.data?.message || "Failed to generate bill", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseAnimation = () => {
        setShowModal(false);
        setTimeout(onClose, 300);
    };

    if (!isOpen && !showModal) return null;

    // --- Styles ---
    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm disabled:bg-gray-100";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1";

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`} onClick={handleCloseAnimation}>
            <div className={`bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ${showModal ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-orange-600 text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2"><FaShoppingBag /> New Invoice</h2>
                        <p className="text-xs text-orange-100">{billNumber}</p>
                    </div>
                    <button onClick={handleCloseAnimation} className="p-2 hover:bg-white/20 rounded-full transition"><FaTimes size={20} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">

                    {/* AI SCANNER */}
                    <div className={`mb-6 p-4 border-2 border-dashed rounded-xl relative transition-all ${isScanning ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-orange-400 bg-white'}`}>
                        {isScanning && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <FaSpinner className="animate-spin text-purple-600 text-2xl mb-2" />
                                <p className="text-sm font-bold text-purple-700">AI extracting details...</p>
                            </div>
                        )}
                        <input type="file" id="aiScan" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isScanning || isSubmitting} ref={fileInputRef} />
                        <label htmlFor="aiScan" className="cursor-pointer flex flex-col items-center justify-center h-full py-2">
                            <FaMagic className={`text-2xl mb-2 ${isScanning ? 'text-purple-500' : 'text-orange-500'}`} />
                            <span className="text-sm font-medium text-gray-600">{selectedFile ? 'File Selected (Scan Complete)' : 'Upload Bill Image to Auto-Fill'}</span>
                            {selectedFile && <button type="button" onClick={(e) => { e.preventDefault(); handleRemovePhoto(); }} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>}
                        </label>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Shop & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Shop Name</label><input value={shopName} onChange={e => setShopName(e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Bill Date</label><input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className={inputClass} /></div>
                        </div>

                        {/* Customer Details (Required for Retailer) */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className={labelClass}>Name</label><div className="relative"><FaUser className="absolute left-3 top-2.5 text-gray-400" /><input value={customerName} onChange={e => setCustomerName(e.target.value)} className={`${inputClass} pl-9`} placeholder="Name" required /></div></div>
                                <div><label className={labelClass}>Phone</label><div className="relative"><FaPhone className="absolute left-3 top-2.5 text-gray-400" /><input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`${inputClass} pl-9`} placeholder="Phone" required /></div></div>
                                <div><label className={labelClass}>Email</label><div className="relative"><FaEnvelope className="absolute left-3 top-2.5 text-gray-400" /><input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className={`${inputClass} pl-9`} placeholder="Email (Optional)" /></div></div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-800">Items</h3>
                                <button type="button" onClick={handleAddItem} className="text-xs font-bold text-orange-600 flex items-center"><FaPlus className="mr-1" /> Add Item</button>
                            </div>
                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input placeholder="Item Name" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} className={`${inputClass} flex-grow`} />
                                        <input placeholder="Qty" type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className={`${inputClass} w-16 text-center`} />
                                        <input placeholder="Price" type="number" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} className={`${inputClass} w-24 text-right`} />
                                        <div className="w-24 text-right font-bold text-gray-700">₹{item.total}</div>
                                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 p-1"><FaMinus /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                <span className="font-bold text-gray-600">Grand Total</span>
                                <span className="text-xl font-bold text-orange-600">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleCloseAnimation} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 font-medium transition">Cancel</button>
                            <button type="submit" disabled={isSubmitting || isScanning} className="px-8 py-2.5 rounded-xl bg-orange-600 text-white font-bold shadow-lg hover:bg-orange-700 transition disabled:opacity-70 flex items-center gap-2">
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPlus />} Generate Bill
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBillModal;